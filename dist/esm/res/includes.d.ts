import * as Miaoverse from "../mod.js";
type Kernel_member = [Kernel_member_getter, Kernel_member_setter, number, number];
type Kernel_member_getter = "uscalarGet" | "fscalarGet" | "uarrayGet" | "farrayGet" | "ptrGet" | "uuidGet" | "stringGet";
type Kernel_member_setter = "uscalarSet" | "fscalarSet" | "uarraySet" | "farraySet" | "ptrSet" | "uuidSet" | "stringSet";
/** 3D对象内核实现（512字节）。 */
declare class Object_kernel {
    /**
     * 根据内核对象指针获取对象实例。
     * @param self 内核对象指针。
     * @returns 返回对象实例。
     */
    GetInstanceByPtr(self: Miaoverse.io_ptr): Miaoverse.Object3D;
    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    GetInstanceByID(id: number): Miaoverse.Object3D;
    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    Get<T>(self: Miaoverse.io_ptr, key: Object_kernel["_members_key"]): T;
    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    Set<T>(self: Miaoverse.io_ptr, key: Object_kernel["_members_key"], value: any): void;
    /**
     * 对象状态刷新。
     * @param self 实例指针。
     * @param ctrl 1-标记变换组件参数更新，2-标记对象参数更新，4-应用变化组件更新，8-应用整体更新。
     */
    Flush(self: Miaoverse.io_ptr, ctrl: number): void;
    /** 变换组件更新。 */
    UpdateTransform: (self: Miaoverse.io_ptr) => number;
    /** 更新应用变换组件、渲染设置和G1。 */
    Update: (self: Miaoverse.io_ptr) => number;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: Miaoverse.Object3D[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Miaoverse.Object3D>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 3D对象内核实现的数据结构成员列表。 */
    protected _members: {
        readonly source: Kernel_member;
        readonly instance: Kernel_member;
        readonly parentTS: Kernel_member;
        readonly gisTS: Kernel_member;
        readonly childCount: Kernel_member;
        readonly updated: Kernel_member;
        readonly nextEdit: Kernel_member;
        readonly nextDraw: Kernel_member;
        readonly scene: Kernel_member;
        readonly children: Kernel_member;
        readonly lastSib: Kernel_member;
        readonly nextSib: Kernel_member;
        readonly worldRotation: Kernel_member;
        readonly reserved2: Kernel_member;
        readonly wfmMat: Kernel_member;
        readonly mfwMat: Kernel_member;
        readonly index: Kernel_member;
        readonly enabled: Kernel_member;
        readonly layers: Kernel_member;
        readonly flags: Kernel_member;
        readonly worldLLMC: Kernel_member;
        readonly localPosition: Kernel_member;
        readonly altitude: Kernel_member;
        readonly localScale: Kernel_member;
        readonly parent: Kernel_member;
        readonly localRotation: Kernel_member;
        readonly meshRenderer: Kernel_member;
        readonly camera: Kernel_member;
        readonly light: Kernel_member;
        readonly animator: Kernel_member;
        readonly prefab: Kernel_member;
        readonly depth: Kernel_member;
        readonly unused2: Kernel_member;
        readonly unused3: Kernel_member;
        readonly name: Kernel_member;
        readonly reserved: Kernel_member;
        readonly magic: Kernel_member;
        readonly version: Kernel_member;
        readonly byteSize: Kernel_member;
        readonly refCount: Kernel_member;
        readonly id: Kernel_member;
        readonly uuid: Kernel_member;
        readonly writeTS: Kernel_member;
        readonly readTS: Kernel_member;
        readonly last: Kernel_member;
        readonly next: Kernel_member;
    };
    /** 3D对象内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Object_kernel["_members"];
}
/** 内核接口实现。 */
export declare class KernelImpl {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /** 链接内核实现方法。 */
    Link(): void;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 3D对象内核实现（512字节）。 */
    Object: Object_kernel;
}
/** 资源实例基类。*/
export declare class Resource<T> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(_global: Miaoverse.Ploy3D, ptr: Miaoverse.io_ptr, id: number);
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例内部指针。 */
    protected _ptr: Miaoverse.io_ptr;
    /** 实例ID。 */
    protected _id: number;
}
/** 类型ID枚举。 */
export declare const enum CLASSID {
    /** 无效类型。 */
    INVALID = 0,
    /** GPU统一缓存。 */
    GPU_UNIFORM_BUFFER = 1,
    /** GPU顶点缓存。 */
    GPU_VERTEX_BUFFER = 2,
    /** GPU索引缓存。 */
    GPU_INDEX_BUFFER = 3,
    /** GPU存储缓存（用于计算着色器的输入输出，在WebGL中不支持）。 */
    GPU_STORAGE_BUFFER = 4,
    /** GPU绘制指令参数缓存（用于drawIndirect、drawIndexedIndirect、dispatchWorkgroupsIndirect，在WebGL中不支持）。 */
    GPU_INDIRECT_BUFFER = 5,
    /** GPU一维贴图。 */
    GPU_TEXTURE_1D = 6,
    /** GPU二维贴图（可以是数组）。 */
    GPU_TEXTURE_2D = 7,
    /** GPU立方体贴图（可以是数组）。 */
    GPU_TEXTURE_CUBE = 8,
    /** GPU三维贴图。 */
    GPU_TEXTURE_3D = 9,
    /** GPU渲染贴图（可以是数组）。 */
    GPU_TEXTURE_RT = 10,
    /** GPU贴图采样器。 */
    GPU_SAMPLER = 11,
    /** GPU资源绑定组（一组资源）。 */
    GPU_BIND_GROUP = 12,
    /** GPU管线（包括渲染管线和计算管线）。 */
    GPU_PIPELINE = 13,
    /** 自定义资源数据。 */
    ASSET_CUSTOM = 16,
    /** 着色器资产。 */
    ASSET_SHADER = 17,
    /** 着色器图（可解析为着色器资产）。 */
    ASSET_SHADER_GRAPH = 18,
    /** 着色器GLSL代码。 */
    ASSET_CODE_GLSL = 19,
    /** 着色器WGSL代码。 */
    ASSET_CODE_WGSL = 20,
    /** 一维贴图资源。 */
    ASSET_TEXTURE_1D = 24,
    /** 二维贴图资源（可以是数组）。 */
    ASSET_TEXTURE_2D = 25,
    /** 立方体贴图资源（可以是数组）。 */
    ASSET_TEXTURE_CUBE = 26,
    /** 三维贴图资源。 */
    ASSET_TEXTURE_3D = 27,
    /** 渲染贴图资源（可以是数组）。 */
    ASSET_TEXTURE_RT = 28,
    /** 材质资源。 */
    ASSET_MATERIAL = 32,
    /** 骨架定义资源。 */
    ASSET_SKELETON = 33,
    /** 蒙皮定义资源。 */
    ASSET_SKIN = 34,
    /** 网格变形资源。 */
    ASSET_MORPH = 35,
    /** 几何体UV数据。 */
    ASSET_MESH_UVSET = 36,
    /** 基础网格几何体数据。 */
    ASSET_MESH_GEOMETRY = 37,
    /** 网格资源。 */
    ASSET_MESH = 38,
    /** 动画数据。 */
    ASSET_ANIMATION_DATA = 39,
    /** 网格渲染器组件。 */
    ASSET_COMPONENT_MESH_RENDERER = 48,
    /** 动画组件组件。 */
    ASSET_COMPONENT_ANIMATOR = 49,
    /** 相机组件。 */
    ASSET_COMPONENT_CAMERA = 50,
    /** 体积组件。 */
    ASSET_COMPONENT_VOLUME = 51,
    /** 光源组件。 */
    ASSET_COMPONENT_LIGHT = 52,
    /** 全景图组件。 */
    ASSET_PANORAMA = 53,
    /** 资源包。 */
    ASSET_LEVEL_PACKAGE = 64,
    /** 预制件。 */
    ASSET_LEVEL_PREFAB = 65,
    /** 场景节点。 */
    ASSET_LEVEL_NODE = 66,
    /** 场景（从ASSET_LEVEL_PREFAB实例化）。 */
    SCENE = 80,
    /** 3D对象（从ASSET_LEVEL_NODE实例化）。 */
    OBJECT_3D = 81
}
export {};
