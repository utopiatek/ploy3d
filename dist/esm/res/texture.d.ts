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
    /** 内置默认2D贴图资源实例。 */
    default2D: Texture;
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
