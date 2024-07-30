/// <reference types="@webgpu/types" />
import * as Miaoverse from "../mod.js";
/** 贴图资源实例。 */
export declare class Texture extends Miaoverse.Resource<Texture> {
    /**
     * 构造函数。
     * @param impl 实例管理器。
     * @param texture 内部实例。
     * @param id 实例ID。
     * @param uuid 资源UUID。
     */
    constructor(impl: Texture_kernel, texture: Texture["_texture"], id: number, uuid: string);
    /** 贴图资源UUID。 */
    get uuid(): string;
    /** 贴图内部实例ID。 */
    get internalID(): number;
    /** 实例管理器。 */
    private _impl;
    /** 资源UUID。 */
    private _uuid;
    /** 实例引用计数。 */
    private _refCount;
    /** 内部实例。 */
    private _texture;
}
/** 贴图资源实例管理器（没有内核实现）。 */
export declare class Texture_kernel extends Miaoverse.Base_kernel<Texture, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建贴图资源实例。
     * @param asset 贴图资源描述符。
     * @returns 异步返回贴图资源实例。
     */
    CreateTexture(asset: Asset_texture): Promise<Miaoverse.Texture>;
    /**
     * 从指定贴图文件路径装载贴图。
     * @param uri 贴图文件路径。
     * @returns 异步返回贴图内部实例。
     */
    protected LoadTexture2D_URI(uri: string, has_alpha?: boolean): Promise<{
        id: number;
        width: number;
        height: number;
        depth: number;
        levelCount: number;
        layerSize: number;
        format: GPUTextureFormat;
        texture: GPUTexture;
        view: GPUTextureView;
        refCount: number;
    }>;
    /**
     * 装载位图数据。
     * @param bitmap 位图数据。
     * @returns 返回贴图内部实例。
     */
    protected LoadTexture2D_RAW(bitmap: Miaoverse.GLTextureSource): {
        id: number;
        width: number;
        height: number;
        depth: number;
        levelCount: number;
        layerSize: number;
        format: GPUTextureFormat;
        texture: GPUTexture;
        view: GPUTextureView;
        refCount: number;
    };
    /**
     * 装载贴图数据，压缩文件请选择BASISU ETCIS UInt SRGB。
     * @param buffer KTX2文件数据缓存。
     * @param format 解压为指定压缩纹理格式。
     * @returns 返回贴图内部实例。
     */
    protected LoadTexture2D_KTX2(buffer: ArrayBuffer, format: "bc1-rgba-unorm" | "bc3-rgba-unorm" | "bc4-r-unorm" | "bc5-rg-unorm" | "bc7-rgba-unorm"): {
        id: number;
        width: number;
        height: number;
        depth: number;
        levelCount: number;
        layerSize: number;
        format: GPUTextureFormat;
        texture: GPUTexture;
        view: GPUTextureView;
        refCount: number;
    };
    /**
     * 解析KTX2解压出的压缩纹理数据。
     * @param ptr KTX2数据指针。
     * @param maxLevelCount 解析最大细节级别数。
     * @returns 返回压缩纹理数据。
     */
    protected ParseImage_KTX2(ptr: Miaoverse.io_ptr, maxLevelCount?: number): Miaoverse.GLTextureSource_KTX2;
    /**
     * 增加实例引用计数。
     * @param id 实例ID。
     */
    AddRef(id: number): void;
    /**
     * 释放实例引用。
     * @param id 实例ID。
     */
    Release(id: number): void;
    /**
     * 写图块数据。
     * @param tile 图集图块实例指针。
     * @param bitmap 位图数据。
     * @param xoffset 写入横向像素偏移。
     * @param yoffset 写入纵向像素偏移。
     */
    _WriteTile(tile: Miaoverse.io_ptr, bitmap: Miaoverse.GLTextureSource, xoffset?: number, yoffset?: number): void;
    /**
     * 创建图块实例（分配图集中的存储区块）。
     * @param width 贴图像素宽度。
     * @param height 贴图像素高度。
     * @param format 贴图像素格式（当前固定为0）。
     * @returns 返回图块描述符指针，注意GPU资源并未分配，需要使用贴图数据进行初始化。
     */
    _CreateTile: (width: number, height: number, format: number) => Miaoverse.io_ptr;
    /**
     * 释放图块实例。
     * @param tile 图块实例指针。
     * @returns 返回当前图块实例引用计数。
     */
    _ReleaseTile: (tile: Miaoverse.io_ptr) => Miaoverse.io_uint;
    /** 内置默认2D贴图资源实例。 */
    default2D: Texture;
    /** 默认贴图图集内部实例ID（"rgba8unorm"格式）。 */
    defaultAtlas: number;
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
/** 贴图资源引用节点。 */
export interface TextureNode {
    /** 贴图资源实例。 */
    texture?: Miaoverse.Texture;
    /** 贴图资源URI（texture、uri二选一，均未设置则清除材质当前贴图属性）。 */
    uri?: string;
    /** 纹理采样时UV的平移和缩放。 */
    uvts?: number[];
    /** 缺省贴图默认颜色值（RGBA[0, 255]）。 */
    color?: number[];
    /** 采样器设置。 */
    sampler?: GPUSamplerDescriptor;
}
/** 压缩图像数据成员索引。 */
export declare const enum Image_ktx_member {
    /** 贴图像素宽度。 */
    width = 0,
    /** 贴图像素高度。 */
    height = 1,
    /** 贴图MIP层级数。 */
    levels = 2,
    /** 贴图面数，2D:1、CUBE:6。 */
    faces = 3,
    /** 贴图层数，非数组为1，每层可能是2D贴图或CUBE贴图。 */
    layers = 4,
    /** 贴图数组长度，贴图张数。 */
    length = 5,
    /** 贴图是否包含透明通道。 */
    hasAlpha = 6,
    /** 贴图像素格式。 */
    format = 7,
    /** 贴图数据缓存地址，依次存储各层级各张贴图压缩数据。 */
    ptrData = 8,
    /** 贴图MIP层级信息数组地址。 */
    ptrLevelInfos = 9
}
/** 贴图图块内核实现的数据结构成员列表。 */
export declare const TextureTile_member_index: {
    readonly atlas: Miaoverse.Kernel_member;
    readonly layer: Miaoverse.Kernel_member;
    readonly width: Miaoverse.Kernel_member;
    readonly height: Miaoverse.Kernel_member;
    readonly cols: Miaoverse.Kernel_member;
    readonly rows: Miaoverse.Kernel_member;
    readonly xoffset: Miaoverse.Kernel_member;
    readonly yoffset: Miaoverse.Kernel_member;
    readonly magic: Miaoverse.Kernel_member;
    readonly version: Miaoverse.Kernel_member;
    readonly byteSize: Miaoverse.Kernel_member;
    readonly refCount: Miaoverse.Kernel_member;
    readonly id: Miaoverse.Kernel_member;
    readonly uuid: Miaoverse.Kernel_member;
    readonly writeTS: Miaoverse.Kernel_member;
    readonly readTS: Miaoverse.Kernel_member;
    readonly last: Miaoverse.Kernel_member;
    readonly next: Miaoverse.Kernel_member;
};
