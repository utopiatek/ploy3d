/// <reference types="@webgpu/types" />
import * as Miaoverse from "../mod.js";
/** 贴图实例。 */
export declare class Texture extends Miaoverse.Resource<Texture> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: Texture_kernel, texture: Texture["_texture"], id: number, uuid: string);
    /** 贴图资源UUID。 */
    get uuid(): string;
    /** 贴图内部实例ID。 */
    get internalID(): number;
    /** 贴图资源UUID。 */
    private _uuid;
    /** 贴图内核实现。 */
    private _impl;
    /** 资源实例内部实现。 */
    private _texture;
    /** 着色器引用计数。 */
    private _refCount;
}
/** 贴图资源实例管理器。 */
export declare class Texture_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
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
     * @returns 异步返回贴图实例。
     */
    private LoadTexture2D_URI;
    /**
     * 装载位图数据。
     * @param bitmap 位图数据。
     * @returns 返回贴图实例。
     */
    private LoadTexture2D_RAW;
    /**
     * 装载贴图数据，压缩文件请选择BASISU ETCIS UInt SRGB 1024 * 1024。
     * @param buffer KTX2文件数据缓存。
     * @param format 解压为指定压缩纹理格式。
     * @returns 返回贴图实例。
     */
    private LoadTexture2D_KTX2;
    /**
     * 解析KTX2解压出的压缩纹理数据。
     * @param ptr KTX2数据指针。
     * @param maxLevelCount 解析最大细节级别数。
     * @returns 返回压缩纹理数据。
     */
    private ParseImage_KTX2;
    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    GetInstanceByID(id: number): Miaoverse.Texture;
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
    /** 内置默认2D贴图。 */
    default2D: Texture;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: Texture[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Texture>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 待GC列表。 */
    protected _gcList: Texture[];
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
