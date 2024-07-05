/// <reference types="@webgpu/types" />
import * as Miaoverse from "./mod.js";
/** GPU虚拟设备接口。 */
export declare class Device {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化GPU虚拟设备接口。
     * @returns 返回GPU虚拟设备接口。
     */
    Init(): Promise<this>;
    /**
     * 初始化GPU设备。
     * @param config 引擎配置。
     * @returns 返回GPU虚拟设备接口。
     */
    protected InitGPU(config: Miaoverse.Ploy3D["config"]): Promise<this>;
    /**
     * 初始化GL设备。
     * @param config 引擎配置。
     * @returns 返回GL虚拟设备接口。
     */
    protected InitGL(config: Miaoverse.Ploy3D["config"]): Promise<this>;
    /**
     * 重设渲染目标大小。
     * @param width 宽度。
     * @param height 高度。
     * @returns 画布过小将返回假。
     */
    Resize(width?: number, height?: number): boolean;
    /**
     * 创建缓存实例。
     * @param classid 缓存类型【CLASSID】。
     * @param size 缓存大小。
     * @param offset 初始化数据偏移。
     * @param data 初始化数据。
     * @returns 返回缓存ID。
     */
    CreateBuffer(classid: number, size: number, offset?: number, data?: ArrayBuffer): number;
    /**
     * 释放缓存实例。
     * @param id 缓存实例ID。
     */
    FreeBuffer(id: number): void;
    /**
     * 写入缓存数据。
     * @param id 缓存实例ID。
     * @param bufferOffset 缓存写入偏移。
     * @param data 数据源。
     * @param dataOffset 数据源偏移。
     * @param size 写入大小。
     */
    WriteBuffer(id: number, bufferOffset: number, data: BufferSource | SharedArrayBuffer, dataOffset: number, size: number): void;
    /**
     * 创建2D贴图实例。
     * @param width 贴图宽度。
     * @param height 贴图高度。
     * @param depth 贴图数组层数。
     * @param levelCount 贴图LOD级别数。
     * @param format 贴图像素格式。
     * @returns 返回贴图实例ID。
     */
    CreateTexture2D(width: number, height: number, depth: number, levelCount: number, format: GLTextureFormat): number;
    /**
     * 释放贴图实例。
     * @param id 贴图实例ID。
     */
    FreeTexture2D(id: number): void;
    /**
     * 写入2D贴图或渲染贴图数据。
     * @param id 2D贴图或渲染贴图实例ID。
     * @param rt 是否为渲染贴图。
     * @param data 贴图数据源。
     */
    WriteTexture2D_RAW(id: number, rt: boolean, data: GLTextureSource): void;
    /**
     * 写入2D贴图数据。
     * @param id 2D贴图实例ID。
     * @param data 贴图数据源。
     */
    WriteTexture2D_KTX2(id: number, data: GLTextureSource_KTX2): void;
    /**
     * 创建渲染贴图实例。
     * @param width 贴图宽度。
     * @param height 贴图高度。
     * @param depth 贴图数组层数。
     * @param levelCount 贴图LOD级别数。
     * @param format 贴图像素格式。
     * @param bindable 是否可以作为绑定资源。
     * @param resizable 是否可重设大小。
     * @returns 返回贴图实例ID。
     */
    CreateTextureRT(width: number, height: number, depth: number, levelCount: number, format: GLTextureFormat, bindable: boolean, resizable: boolean): number;
    /**
     * 释放贴图实例。
     * @param id 贴图实例ID。
     */
    FreeTextureRT(id: number): void;
    /**
     * 根据贴图采样器描述符生成标识符。
     * @param desc 贴图采样器描述符。
     * @returns 返回采样器标识符。
     */
    GenerateSamplerFlags(desc: GPUSamplerDescriptor): number;
    /**
     * 解析贴图采样器标识符为贴图采样器描述符。
     * @param flags 贴图采样器标识符。
     * @returns 返回贴图采样器描述符。
     */
    ParseSamplerFlags(flags: number): GPUSamplerDescriptor;
    /**
     * 创建贴图采样器实例。
     * @param flags 采样器标识符。
     * @returns 返回采样器实例ID。
     */
    CreateSampler(flags: number): number;
    /**
     * 释放贴图采样器实例。
     * @param id 贴图采样器实例ID。
     */
    FreeSampler(id: number): void;
    /**
     * 创建帧命令编码器。
     * @returns 返回帧命令编码器。
     */
    CreateCommandEncoder(): GPUCommandEncoder;
    /**
     * 提交帧命令缓存。
     * @param commandBuffers 命令缓存列表。
     * @param onDone 提交完成回调。
     */
    Submit(commandBuffers: GPUCommandBuffer[], onDone: (err?: any) => void): void;
    /**
     * 获取缓存实例。
     * @param id 缓存实例ID。
     * @returns 返回缓存实例。
     */
    GetBuffer(id: number): {
        /** 缓存ID。 */
        id: number;
        /** 缓存类型【CLASSID】。 */
        classid: number;
        /** 缓存大小，不可扩容。 */
        size: number;
        /** 缓存对象。 */
        buffer: GPUBuffer;
        /** 缓存引用计数。 */
        refCount: number;
    };
    /**
     * 获取2D贴图实例。
     * @param id 贴图实例ID。
     * @returns 返回贴图实例。
     */
    GetTexture2D(id: number): {
        /** 贴图ID。 */
        id: number;
        /** 贴图宽度。 */
        width: number;
        /** 贴图高度。 */
        height: number;
        /** 贴图层数。 */
        depth: number;
        /** 贴图细节级别数。 */
        levelCount: number;
        /** 纹理集单层占用空间大小。 */
        layerSize: number;
        /** 贴图像素格式。 */
        format: GPUTextureFormat;
        /** 贴图对象。 */
        texture: GPUTexture;
        /** 贴图视图。 */
        view: GPUTextureView;
        /** 贴图引用计数。 */
        refCount: number;
    };
    /**
     * 获取渲染贴图实例。
     * @param id 贴图实例ID。
     * @returns 返回贴图实例。
     */
    GetTextureRT(id: number): {
        /** 贴图ID。 */
        id: number;
        /** 贴图宽度。 */
        width: number;
        /** 贴图高度。 */
        height: number;
        /** 贴图层数。 */
        depth: number;
        /** 贴图细节级别数。 */
        levelCount: number;
        /** 纹理集单层占用空间大小。 */
        layerSize: number;
        /** 贴图像素格式。 */
        format: GPUTextureFormat;
        /** 贴图对象。 */
        texture: GPUTexture;
        /** 贴图视图。 */
        view: GPUTextureView;
        /** 贴图引用计数。 */
        refCount: number;
    } & {
        /** 是否可绑定。 */
        bindable: boolean;
        /** 是否需要自适应大小。 */
        resizable: boolean;
        /** 渲染目标视图。 */
        attachments: GPUTextureView[][];
    };
    /**
     * 获取贴图采样器实例。
     * @param id 贴图采样器实例ID。
     * @returns 返回贴图采样器实例。
     */
    GetSampler(id: number): {
        /** 采样器ID。 */
        id: number;
        /** 采样器标识。 */
        flags: number;
        /** 采样器描述符。 */
        desc: GPUSamplerDescriptor;
        /** 采样器对象。 */
        sampler: GPUSampler;
        /** 采样器引用计数。 */
        refCount: number;
    };
    /** GPU设备，管理资源和指令。 */
    get device(): GPUDevice;
    /** 模块实例对象。 */
    private _global;
    /** GPU适配器。 */
    private _adapter;
    /** GPU设备，管理资源和指令。 */
    private _device;
    /** 窗口表面关联的交换链，提供渲染目标和提交画面指令。 */
    private _swapchain;
    /** 贴图像素格式描述查找表。 */
    private _textureFormatDescLut;
    /** 缓存实例容器。 */
    private _buffers;
    /** 2D贴图实例容器。 */
    private _textures2D;
    /** 渲染贴图实例容器。 */
    private _texturesRT;
    /** 贴图采样器实例容器。 */
    private _samplers;
    /** 统一资源组绑定对象实例容器（统一资源组绑定对象关联若干着色器资源并指定资源读写偏移，用于在绘制前将这些资源一次性绑定到着色器）。 */
    private _bindings;
    /** 顶点布局实例容器。 */
    private _vertexLayouts;
    /** 资源销毁任务列表。 */
    private _destroyList;
}
/** 贴图数据源。 */
export interface GLTextureSource {
    /** 位图格式。 */
    readonly format?: GLTextureFormat;
    /** 位图宽度。 */
    readonly width: number;
    /** 位图高度。 */
    readonly height: number;
    /** 位图数据（创建空贴图时需赋值空）。 */
    readonly data?: ArrayBuffer;
    /** 位图数据布局。 */
    readonly dataLayout?: {
        /** 位图数据偏移。 */
        readonly offset: number;
        /** 位图行数据大小。 */
        readonly bytesPerRow: number;
        /** 位图行数量。 */
        readonly rowsPerImage: number;
    };
    /** 位图数据写入纹理数组层。 */
    layer?: number;
    /** 位图数据写入纹理层LOD级别。 */
    level?: number;
    /** 位图数据写入列偏移。 */
    xoffset?: number;
    /** 位图数据写入行偏移。 */
    yoffset?: number;
}
/** 贴图数据源（KTX）。 */
export interface GLTextureSource_KTX2 {
    /** 贴图像素格式。 */
    readonly format: number;
    /** 贴图像素是否包含透明通道。 */
    readonly hasAlpha: number;
    /** 贴图像素宽度。 */
    readonly width: number;
    /** 贴图像素高度。 */
    readonly height: number;
    /** 贴图细节级别数。 */
    readonly levelCount: number;
    /** 贴图面数（2D:1、CUBE:6，每个面都包含多个MIP层级数）。 */
    readonly faces: number;
    /** 贴图层数（非贴图数组为1，每层可能是2D贴图或CUBE贴图）。 */
    readonly depth: number;
    /** 贴图实例数量（目前仅支持1个贴图实例）。 */
    readonly count: number;
    /** 贴图各MIP层级信息。 */
    readonly levelInfos: {
        /** 层级像素宽度。 */
        readonly width: number;
        /** 层级像素高度。 */
        readonly height: number;
        /** 块像素宽度（通常为4）。 */
        readonly block_width: number;
        /** 块像素高度（通常为4）。 */
        readonly block_height: number;
        /** 横向块数量（用于计算数据大小）。 */
        readonly blocks_x_count: number;
        /** 纵向块数量（用于计算数据大小）。 */
        readonly blocks_y_count: number;
        /** 块字节单位大小。 */
        readonly bytes_per_block: number;
        /** 层级数据偏移（相对缓存地址）。 */
        readonly level_data_offset: number;
    }[];
    /** 数据缓存（依次存储各层级各张贴图压缩数据）。 */
    readonly buffer: BufferSource | SharedArrayBuffer;
    /** 数据缓存偏移。 */
    readonly dataOffset: number;
    /** 数据写入层偏移。 */
    layer?: number;
    /** 数据写入LOD偏移。 */
    level?: number;
    /** 数据写入列偏移。 */
    xoffset?: number;
    /** 数据写入行偏移。 */
    yoffset?: number;
}
/** 贴图像素格式描述。 */
export interface GLTextureFormatDesc {
    /** 指定GPU内部存储贴图的格式。 */
    readonly internalformat: number;
    /** 贴图数据源像素通道启用描述。 */
    readonly format: number;
    /** 贴图数据源像素通道数据类型。 */
    readonly type: number;
    /** 贴图像素格式是否可用于渲染目标。 */
    readonly renderable: number;
    /** 贴图像素格式是否可进行线性采样过滤。 */
    readonly filterable: number;
    /** 贴图像素字节大小。 */
    readonly bytes: number;
    /** 压缩贴图格式。 */
    readonly compressed?: number;
}
/** 贴图像素格式枚举。 */
export type GLTextureFormat = "r8unorm" | "r8snorm" | "r8uint" | "r8sint" | "r16uint" | "r16sint" | "r16float" | "rg8unorm" | "rg8snorm" | "rg8uint" | "rg8sint" | "r32uint" | "r32sint" | "r32float" | "rg16uint" | "rg16sint" | "rg16float" | "rgba8unorm" | "rgba8snorm" | "rgba8uint" | "rgba8sint" | "bgra8unorm" | "rgb9e5ufloat" | "rgb10a2unorm" | "rg11b10ufloat" | "rg32uint" | "rg32sint" | "rg32float" | "rgba16uint" | "rgba16sint" | "rgba16float" | "rgba32uint" | "rgba32sint" | "rgba32float" | "stencil8" | "depth16unorm" | "depth24plus" | "depth24plus-stencil8" | "depth32float" | "depth32float-stencil8" | "bc1-rgba-unorm" | "bc3-rgba-unorm" | "bc4-r-unorm" | "bc5-rg-unorm" | "bc7-rgba-unorm";
/** 图元类型枚举。 */
export declare const enum GLPrimitiveTopology {
    point_list = 0,
    line_list = 1,
    line_strip = 2,
    triangle_list = 3,
    triangle_strip = 4
}
