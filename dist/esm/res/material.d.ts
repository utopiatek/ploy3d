import * as Miaoverse from "../mod.js";
/** 材质资源实例（G0、G2）。 */
export declare class Material extends Miaoverse.Uniform<Material_kernel> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Material_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 启用材质设置标志。
     * @param enable 启用或禁用材质特性。
     * @param flag 材质特性标志。
     */
    Enable(enable: boolean, flag: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS | Miaoverse.RENDER_FLAGS.HAS_DOUBLE_SIDED | Miaoverse.RENDER_FLAGS.HAS_REFLECTIONS | Miaoverse.RENDER_FLAGS.HAS_CLEAR_COAT | Miaoverse.RENDER_FLAGS.HAS_ANISOTROPY | Miaoverse.RENDER_FLAGS.SHADING_AS_UNLIT | Miaoverse.RENDER_FLAGS.SHADING_AS_CLOTH | Miaoverse.RENDER_FLAGS.SHADING_AS_SUBSURFACE | Miaoverse.RENDER_FLAGS.SPECULAR_GLOSSINESS_PARAMS): void;
    /**
     * 设置材质混合模式。
     * @param blendMode 材质混合模式。
     */
    SetBlendMode(blendMode: Miaoverse.BLEND_MODE): void;
    /**
     * 获取向量属性（标量被视为一维向量）。
     * @param name 属性名称。
     * @returns 返回数值数组。
     */
    GetVector(name: string): number[];
    /**
     * 设置向量属性（标量被视为一维向量）。
     * @param name 属性名称。
     * @param value 数值数组。
     */
    SetVector(name: string, value: number[]): void;
    /**
     * 设置向量属性并立即提交到GPU（用于小数据直接更新，标量被视为一维向量）。
     * @param name 属性名称。
     * @param value 数值数组。
     */
    SubmitVector(name: string, value: number[]): void;
    /**
     * 获取贴图属性。
     * @param name 属性名称。
     * @returns 返回贴图描述符。
     */
    GetTexture(name: string): Miaoverse.TextureNode;
    /**
     * 设置贴图属性。
     * @param name 属性名称。
     * @param value 贴图描述符（注意，贴图URI必须是UUID）。
     */
    SetTexture(name: string, value: Miaoverse.TextureNode): void;
    /**
     * 判断材质是否包含指定属性。
     * @param name 属性名称（注意贴图属性需要加上"_uuid"后缀）。
     * @returns 返回true则包含指定属性。
     */
    HasProperty(name: string): boolean;
    /** 资源绑定组布局ID（同时也是着色器内部实例ID）。 */
    get layoutID(): number;
    /** 材质属性启用标志集（G2，RENDER_FLAGS高24位）。 */
    get enableFlags(): number;
    set enableFlags(value: number);
    /** 材质使用的着色器资源。 */
    get shader(): Miaoverse.ShaderRes;
    /** 材质属性访问视图。 */
    get view(): Record<string, number[]>;
    /** 属性访问视图。 */
    private _view;
}
/** 帧统一资源组实例（G0）。 */
export declare class FrameUniforms extends Miaoverse.Uniform<Material_kernel> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Material_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 根据相机组件数据和体积组件数据更新数据。
     * @param camera 相机组件实例。
     * @param volume 体积组件实例。
     */
    UpdateFrameUniforms(camera: Miaoverse.Camera, volume: Miaoverse.Volume): void;
    /** 相关状态标志集。 */
    get enableFlags(): number;
    set enableFlags(value: number);
    /** 材质属性访问视图。 */
    get view(): Record<string, number[]>;
    /** 颜色渲染目标贴图ID。 */
    get g0_colorRT(): number;
    set g0_colorRT(value: number);
    /** 深度渲染目标贴图ID。 */
    get g0_depthRT(): number;
    set g0_depthRT(value: number);
    /** GB渲染目标贴图ID。 */
    get g0_gbufferRT(): number;
    set g0_gbufferRT(value: number);
    /** 精灵图集ID（用于UI和粒子）。 */
    get g0_spriteAtlas(): number;
    set g0_spriteAtlas(value: number);
    /** 光源体素列表缓存（绑定到G0）。 */
    get g0_froxelList(): {
        buffer: never;
        bufferID: number;
        offset: number;
        size: number;
    };
    /** 光源索引表缓存（绑定到G0）。 */
    get g0_lightVoxel(): {
        buffer: never;
        bufferID: number;
        offset: number;
        size: number;
    };
    /** 光源列表缓存（绑定到G0）。 */
    get g0_lightList(): {
        buffer: never;
        bufferID: number;
        offset: number;
        size: number;
    };
    /** 属性访问视图。 */
    private _view;
}
/** 材质资源内核实现。 */
export declare class Material_kernel extends Miaoverse.Base_kernel<Material | FrameUniforms, typeof Material_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 装载材质资源。
     * @param uri 材质资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回材质资源实例。
     */
    Load(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.FrameUniforms | Miaoverse.Material>;
    /**
     * 创建材质资源实例。
     * @param asset 材质资源描述符。
     * @returns 异步返回材质资源实例。
     */
    Create(asset: Asset_material): Promise<Miaoverse.Material>;
    /**
     * 创建G0资源实例。
     * @param colorRT 颜色渲染目标贴图ID。
     * @param depthRT 深度渲染目标贴图ID。
     * @param gbufferRT GB渲染目标贴图ID。
     * @param spriteAtlas 精灵图集ID（用于UI和粒子）。
     * @returns
     */
    CreateFrameUniforms(colorRT: number, depthRT: number, gbufferRT: number, spriteAtlas: number): Promise<Miaoverse.FrameUniforms>;
    /**
     * 释放材质引用的贴图资源（注意该方法仅提供给内核在释放材质前调用）。
     * @param instance 材质实例对象。
     */
    Dispose(id: number): void;
    /**
     * 实例化材质资源内核实例。
     * @param size 材质属性集字节大小。
     * @param data 材质资源保存数据。
     * @returns 返回材质资源内核实例指针。
     */
    protected _Create: (size: number, data: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /**
     * 实例化G0资源内核实例。
     * @returns 返回G0资源内核实例指针。
     */
    protected _CreateFrameUniforms: () => Miaoverse.io_ptr;
    /**
     * 根据相机组件数据和体积组件数据更新G0数据。
     * @param uniform G0资源内核实例指针。
     * @param camera 相机组件内核实例指针。
     * @param volume 体积组件内核实例指针。
     */
    protected _UpdateFrameUniforms: (uniform: Miaoverse.io_ptr, camera: Miaoverse.io_ptr, volume: Miaoverse.io_ptr) => void;
}
/** 材质资源内核实现的数据结构成员列表。 */
export declare const Material_member_index: {
    readonly g0_colorRT: Miaoverse.Kernel_member;
    readonly g0_depthRT: Miaoverse.Kernel_member;
    readonly g0_gbufferRT: Miaoverse.Kernel_member;
    readonly g0_spriteAtlas: Miaoverse.Kernel_member;
    readonly g0_froxelList: Miaoverse.Kernel_member;
    readonly g0_lightVoxel: Miaoverse.Kernel_member;
    readonly g0_lightList: Miaoverse.Kernel_member;
    readonly shaderID: Miaoverse.Kernel_member;
    readonly shaderUUID: Miaoverse.Kernel_member;
    readonly enableFlags: Miaoverse.Kernel_member;
    readonly buffer_bufferID: Miaoverse.Kernel_member;
    readonly buffer_size: Miaoverse.Kernel_member;
    readonly buffer_addr: Miaoverse.Kernel_member;
    readonly buffer_next: Miaoverse.Kernel_member;
    readonly bn_buffer: Miaoverse.Kernel_member;
    readonly bn_bufferID: Miaoverse.Kernel_member;
    readonly bn_offset: Miaoverse.Kernel_member;
    readonly bn_size: Miaoverse.Kernel_member;
    readonly buffer: Miaoverse.Kernel_member;
    readonly bufferID: Miaoverse.Kernel_member;
    readonly bufferBlockOffset: Miaoverse.Kernel_member;
    /**
     * 根据相机组件数据和体积组件数据更新数据。
     * @param camera 相机组件实例。
     * @param volume 体积组件实例。
     */
    readonly bufferBlockSize: Miaoverse.Kernel_member;
    readonly group: Miaoverse.Kernel_member;
    readonly binding: Miaoverse.Kernel_member;
    readonly updated: Miaoverse.Kernel_member;
    readonly m_reserved76: Miaoverse.Kernel_member;
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
/** 材质资源描述符。 */
export interface Asset_material extends Miaoverse.Asset {
    /** 着色器URI。 */
    shader: string;
    /** 渲染设置标记集（RENDER_FLAGS）。 */
    flags: number;
    /** 材质属性集。 */
    properties: {
        /** 贴图属性设置列表。 */
        textures: Record<string, Miaoverse.TextureNode>;
        /** 向量属性设置列表（标量被视为一维向量）。 */
        vectors: Record<string, number[]>;
    };
}
