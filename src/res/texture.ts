import * as Miaoverse from "../mod.js"

/** 贴图实例。 */
export class Texture extends Miaoverse.Resource<Texture> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(impl: Texture_kernel, texture: Texture["_texture"], id: number, uuid: string) {
        super(impl["_global"], impl["_global"].env.ptrZero(), id);
        this._uuid = uuid;
        this._impl = impl;
        this._texture = texture;
        this._refCount = 1;
    }

    /** 贴图资源UUID。 */
    public get uuid() {
        return this._uuid;
    }

    /** 贴图内部实例ID。 */
    public get internalID() {
        return this._texture.id;
    }

    /** 贴图资源UUID。 */
    private _uuid: string;
    /** 贴图内核实现。 */
    private _impl: Texture_kernel;
    /** 资源实例内部实现。 */
    private _texture: ReturnType<Texture_kernel["LoadTexture2D_RAW"]> = null;
    /** 着色器引用计数。 */
    private _refCount: number;
}

/** 贴图资源实例管理器。 */
export class Texture_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 创建贴图资源实例。
     * @param asset 贴图资源描述符。
     * @returns 异步返回贴图资源实例。
     */
    public async CreateTexture(asset: Asset_texture) {
        let texture: Texture["_texture"] = null;
        if (asset.bitmap) {
            texture = await this.LoadTexture2D_RAW(asset.bitmap);
        }

        if (asset.uri) {
            texture = await this.LoadTexture2D_URI(asset.uri, asset.has_alpha);
        }
        else {
            // ...
        }

        if (!texture) {
            return null;
        }

        const id = this._instanceIdle;

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = new Texture(this, texture, id, asset.uuid || "");

        this._instanceList[id] = instance;
        this._instanceCount++;

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        if (asset.uuid) {
            this._instanceLut[asset.uuid] = instance;
        }

        return instance;
    }

    /**
     * 从指定贴图文件路径装载贴图。
     * @param uri 贴图文件路径。
     * @returns 异步返回贴图实例。
     */
    private async LoadTexture2D_URI(uri: string, has_alpha?: boolean) {
        if (uri.endsWith(".ktx2")) {
            const buffer = await this._global.resources.Load_file<ArrayBuffer>("arrayBuffer", uri, true, null);
            const texture = this.LoadTexture2D_KTX2(buffer.data, "bc7-rgba-unorm");

            return texture;
        }
        else {
            // 引擎初始化前解码图片性能很低
            // Image.decode()在高分辨率下有无法解码的情况
            // https://zhuanlan.zhihu.com/p/367345699

            const blob = await this._global.Fetch<Blob>(uri, null, "blob");
            const option: ImageBitmapOptions = undefined;
            const bitmap = await createImageBitmap(blob, option);
            const texture = await this.LoadTexture2D_RAW(bitmap);

            bitmap.close();

            return texture;
        }
    }

    /**
     * 装载位图数据。
     * @param bitmap 位图数据。
     * @returns 返回贴图实例。
     */
    private LoadTexture2D_RAW(bitmap: Miaoverse.GLTextureSource) {
        const device = this._global.device;
        const id = device.CreateTexture2D(bitmap.width, bitmap.height, 1, 1, bitmap.format || "rgba8unorm");
        if (id == 0) {
            return null;
        }

        bitmap.layer = 0;
        bitmap.level = 0;
        bitmap.xoffset = 0;
        bitmap.yoffset = 0;

        device.WriteTexture2D_RAW(id, false, bitmap);

        return device.GetTexture2D(id);
    }

    /**
     * 装载贴图数据，压缩文件请选择BASISU ETCIS UInt SRGB 1024 * 1024。
     * @param buffer KTX2文件数据缓存。
     * @param format 解压为指定压缩纹理格式。
     * @returns 返回贴图实例。
     */
    private LoadTexture2D_KTX2(buffer: ArrayBuffer, format: "bc1-rgba-unorm" | "bc3-rgba-unorm" | "bc4-r-unorm" | "bc5-rg-unorm" | "bc7-rgba-unorm") {
        const format_desc = this._global.device["_textureFormatDescLut"][format];

        const internal = this._global.internal;
        const env = this._global.env;
        const device = this._global.device;

        const bufferPtr = internal.System_New(buffer.byteLength);
        env.bufferSet(bufferPtr, 0, buffer);
        const imagePtr = this._global.internal.Util_Transcoder_ktx2(bufferPtr, buffer.byteLength, format_desc.compressed);
        internal.System_Delete(bufferPtr);

        if (env.ptrValid(imagePtr)) {
            const image = this.ParseImage_KTX2(imagePtr);
            const id = device.CreateTexture2D(image.width, image.height, 1, image.levelCount, format);

            image.layer = 0;
            image.level = 0;
            image.xoffset = 0;
            image.yoffset = 0;

            device.WriteTexture2D_KTX2(id, image);

            internal.Util_Free_ktx2(imagePtr);

            return device.GetTexture2D(id);
        }

        return null;
    }

    /**
     * 解析KTX2解压出的压缩纹理数据。
     * @param ptr KTX2数据指针。
     * @param maxLevelCount 解析最大细节级别数。
     * @returns 返回压缩纹理数据。
     */
    private ParseImage_KTX2(ptr: Miaoverse.io_ptr, maxLevelCount?: number) {
        const env = this._global.env;

        const data: Miaoverse.GLTextureSource_KTX2 = {
            // 贴图像素宽度
            width: env.uscalarGet(ptr, Image_ktx_member.width),
            // 贴图像素高度
            height: env.uscalarGet(ptr, Image_ktx_member.height),
            // 贴图MIP层级数
            levelCount: env.uscalarGet(ptr, Image_ktx_member.levels),
            // 贴图面数，2D:1、CUBE:6，每个面都包含多个MIP层级数
            faces: env.uscalarGet(ptr, Image_ktx_member.faces),
            // 贴图层数，非数组为1，每层可能是2D贴图或CUBE贴图
            depth: env.uscalarGet(ptr, Image_ktx_member.layers),
            // 贴图数量，目前仅支持1张贴图
            count: env.uscalarGet(ptr, Image_ktx_member.length),
            // 贴图是否包含透明通道
            hasAlpha: env.uscalarGet(ptr, Image_ktx_member.hasAlpha),
            // 贴图像素格式
            format: env.uscalarGet(ptr, Image_ktx_member.format),
            // 贴图数据指针，依次存储各层级各张贴图压缩数据
            buffer: env.buffer,
            // 数据缓存偏移
            dataOffset: env.ptrGet(ptr, Image_ktx_member.ptrData) << 2,
            // 贴图MIP层级信息数组地址
            levelInfos: (() => {

                // 贴图MIP层级数组
                const array: ({
                    /** 层级像素宽度。 */
                    width: number;
                    /** 层级像素高度。 */
                    height: number;
                    /** 块像素宽度（通常为4）。 */
                    block_width: number;
                    /** 块像素高度（通常为4）。 */
                    block_height: number;
                    /** 横向块数量（用于计算数据大小）。 */
                    blocks_x_count: number;
                    /** 纵向块数量（用于计算数据大小）。 */
                    blocks_y_count: number;
                    /** 块字节单位大小。 */
                    bytes_per_block: number;
                    /** 层级数据偏移（相对缓存地址）。 */
                    level_data_offset: number;
                })[] = [];

                let levels = env.uscalarGet(ptr, Image_ktx_member.levels);
                if (levels > maxLevelCount && maxLevelCount) {
                    levels = maxLevelCount;
                }

                for (let i = 0; i < levels; i++) {
                    const offset = Image_ktx_member.ptrLevelInfos + i * 8;

                    array[i] = {
                        width: env.uscalarGet(ptr, offset + 0),
                        height: env.uscalarGet(ptr, offset + 1),
                        block_width: env.uscalarGet(ptr, offset + 2),
                        block_height: env.uscalarGet(ptr, offset + 3),
                        blocks_x_count: env.uscalarGet(ptr, offset + 4),
                        blocks_y_count: env.uscalarGet(ptr, offset + 5),
                        bytes_per_block: env.uscalarGet(ptr, offset + 6),
                        level_data_offset: env.uscalarGet(ptr, offset + 7),
                    };
                }

                return array;

            })()
        };

        return data;
    }

    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    public GetInstanceByID(id: number) {
        return this._instanceList[id];
    }

    /**
     * 增加实例引用计数。
     * @param id 实例ID。
     */
    public AddRef(id: number) {
        this._instanceList[id]["_refCount"]++;
    }

    /**
     * 释放实例引用。
     * @param id 实例ID。
     */
    public Release(id: number) {
        const instance = this._instanceList[id];

        if (0 == --instance["_refCount"]) {
            this._global.device.FreeTexture2D(instance.internalID);

            this._instanceList[id] = { id: this._instanceIdle } as any;
            this._instanceLut[instance.uuid] = undefined;
            this._instanceCount--;
            this._instanceIdle = id;
        }
    }

    /** 内置默认2D贴图。 */
    public default2D: Texture;

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;

    /** 实例容器列表。 */
    protected _instanceList: Texture[] = [null];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Texture> = {};
    /** 已分配实例数量。 */
    protected _instanceCount: number = 0;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC列表。 */
    protected _gcList: Texture[] = [];
}

/** 贴图资源描述符。 */
export interface Asset_texture extends Miaoverse.Asset {
    /** 贴图文件URI（如果未设置则从UUID加载）。 */
    uri?: string;
    /** 贴图类型。 */
    mime?: string;
    /** 是否包含A通道。 */
    has_alpha?: boolean;
    /** 表示图像灰度系数的浮点数（小于或等于0则由程序计算出）。 */
    map_gamma?: number;
    /** 位图资源。 */
    bitmap?: Miaoverse.GLTextureSource;
}

/** 贴图封装。 */
export interface Asset_wrapper_texture {
    /** 贴图资源实例（为null则清除当前贴图属性）。 */
    texture?: Miaoverse.Texture;
    /** 贴图资源URI（texture、uri二选一）。 */
    uri?: string;
    /** 纹理采样时UV的平移和缩放。 */
    uvts?: number[];
    /** 缺省贴图默认颜色值（使用16进制ARGB表示，如红色不透明颜色：0xFFFF0000）。 */
    default_color?: number;
    /** 采样器设置。 */
    sampler?: GPUSamplerDescriptor;
}

/** 压缩图像数据成员索引。 */
const enum Image_ktx_member {
    /** 贴图像素宽度。 */
    width = 0,
    /** 贴图像素高度。 */
    height,
    /** 贴图MIP层级数。 */
    levels,
    /** 贴图面数，2D:1、CUBE:6。 */
    faces,
    /** 贴图层数，非数组为1，每层可能是2D贴图或CUBE贴图。 */
    layers,
    /** 贴图数组长度，贴图张数。 */
    length,
    /** 贴图是否包含透明通道。 */
    hasAlpha,
    /** 贴图像素格式。 */
    format,
    /** 贴图数据缓存地址，依次存储各层级各张贴图压缩数据。 */
    ptrData,
    /** 贴图MIP层级信息数组地址。 */
    ptrLevelInfos
}