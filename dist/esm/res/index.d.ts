import * as Miaoverse from "../mod.js";
/** 资源管理器。 */
export declare class Resources {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化资源管理器。
     * @returns 返回资源管理器。
     */
    Init(): Promise<this>;
    /**
     * 加载指定URI的文件数据。
     * @param type 资源文件类型。
     * @param uri 资源文件URI。
     * @param not_cache 是否缓存文件数据。
     * @param cur_pkg 当前包注册信息。
     * @returns 返回文件数据。
     */
    Load_file<T>(type: "text" | "arrayBuffer" | "json", uri: string, not_cache?: boolean, cur_pkg?: PackageReg): Promise<{
        pkg: Miaoverse.PackageReg;
        data: T;
    }>;
    /**
     * 资源URI转资源UUID。
     * @param uri 资源URI。
     * @param cur_pkg 当前包注册信息。
     * @returns 返回资源UUID。
     */
    ToUUID(uri: string, cur_pkg?: PackageReg): string;
    /**
     * 解析资源UIR。
     * 资源URI有以下4种模式：
     * "1-1-1.Miaokit.Builtin:/aa/bb/cc.json"
     * ":/aa/bb/cc.json"
     * "1-1-1-17-1"
     * "17-1"
     * @param uri 资源URI。
     * @param cur_pkg 当前资源包。
     * @returns 返回资源访问键。
     */
    ParseUri(uri: string, cur_pkg?: PackageReg): {
        key: string[];
        uuid?: undefined;
    } | {
        uuid: string[];
        key?: undefined;
    };
    /**
     * 查找资源包注册信息。
     * @param keys 资源访问键。
     * @returns 返回资源包注册信息。
     */
    Find(keys: ReturnType<Resources["ParseUri"]>): Promise<Miaoverse.PackageReg>;
    /**
     * 下载资源包并注册到缓存。
     * @param keys 资源访问键。
     */
    Download(keys: ReturnType<Resources["ParseUri"]>): Promise<void>;
    /**
     * 刷新本地资源包目录（在允许访问本地文件系统的前提下进行）。
     * @returns
     */
    Refresh(): Promise<void>;
    /**
     * 扫描本地资源包目录（在允许访问本地文件系统的前提下进行）。
     * @returns 返回资源包可注册信息列表。
     */
    Scan(): Promise<Miaoverse.PackageReg[]>;
    /**
     * 注册资源包。
     * @param entry 资源包注册信息。
     */
    Register(entry: PackageReg): void;
    /**
     * 预览资源包（完成资源包预览后，可以通过RESID访问资源包内的内容）。
     * @param entry 资源包注册信息。
     */
    Preview(pkg: PackageReg): Promise<void>;
    /** 模块实例对象。 */
    private _global;
    /** 资源包键名到资源包注册号的查找表。 */
    private _pkg_keyLut;
    /** 资源包UUID到资源包注册号的查找表。 */
    private _pkg_uuidLut;
    /** 资源包注册表（该清单可缓存）。 */
    private _pkg_list;
    /** 资源包数据缓存。 */
    private _pkg_caches;
    /** 矢量数学方法内核实现。 */
    VMath: Miaoverse.VMath_kernel;
    /** 着色器资源实例管理器。 */
    Shader: Miaoverse.Shader_kernel;
    /** 贴图资源实例管理器。 */
    Texture: Miaoverse.Texture_kernel;
    /** 材质资源内核实现。 */
    Material: Miaoverse.Material_kernel;
    /** 网格资源内核实现。 */
    Mesh: Miaoverse.Mesh_kernel;
    /** 网格渲染器组件内核实现。 */
    MeshRenderer: Miaoverse.MeshRenderer_kernel;
    /** 3D对象内核实现。 */
    Object: Miaoverse.Object_kernel;
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
    /** 实例ID。 */
    get id(): number;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例内部指针。 */
    protected _ptr: Miaoverse.io_ptr;
    /** 实例ID。 */
    protected _id: number;
}
/** 资源包注册项。 */
export interface PackageReg {
    /** 资源包注册号。 */
    index: number;
    /** 资源包键名（如："1-1-1.miaokit.builtins"）。 */
    key: string;
    /** 资源包UUID（如："1-1-1"）。 */
    uuid: string;
    /** 资源包无效（本地和云端仓库都无法访问到时标记为无效）。 */
    invalid: boolean;
    /** 资源包存放路径（访问失败时尝试切换路径，最终失败时标记资源包无效。查找不到的资源包也会注册并标记为无效，以此屏蔽多次重复无效访问）。 */
    path: string;
    /** 资源包是否压缩存储。 */
    zip: boolean;
    /** 资源包元数据缓存（空表示当前资源包仅已注册但未缓存）。 */
    meta?: Package;
    /** 资源ID到资源文件路径映射表（通过Package.list构建）。 */
    resid_path?: Record<string, string>;
}
/** 资源包元数据。 */
export interface Package {
    /** 包GUID（全球唯一）。 */
    guid: string;
    /** 包UUID（平台唯一）。 */
    uuid: string;
    /** 用户ID（UUID第1段）。 */
    uid: number;
    /** 包ID（UUID第2段）。 */
    pid: number;
    /** 包版本号（UUID第3段）。 */
    version: number;
    /** 包作者名。 */
    author: string;
    /** 包名。 */
    name: string;
    /** 用户可理解的包描述。 */
    desc: string;
    /** 资源包引擎版本（主次版本）。 */
    engine: number;
    /** 包创建时间戳。 */
    timestrap: number;
    /** 作者邮箱。*/
    email?: string;
    /** 知识共享许可协议。 */
    license?: string;
    /** 包售价。 */
    price?: number;
    /** 包归档目录（限3级） */
    folder?: string;
    /** 包标签。 */
    tags?: string;
    /** 缩略图文件路径。 */
    thumbnail?: string;
    /** 缩略图文件中每行包含缩略图数量。 */
    thumbnail_per_row?: number;
    /** 共享资源文件清单（其它包仅能引用注册在该清单中的资源，此举确保UUID能索引到文件）。 */
    list: string[];
}
/** 资源描述符基类。 */
export interface Asset {
    /** 全局唯一ID。 */
    uuid: string;
    /** 资源类型ID。 */
    classid: number;
    /** 内部名称（同级唯一，优先使用名称在同级中查找）。 */
    name: string;
    /** 用户可理解的外部标签。 */
    label: string;
}
export type Kernel_member = [Kernel_member_getter, Kernel_member_setter, number, number];
export type Kernel_member_getter = "uscalarGet" | "fscalarGet" | "uarrayGet" | "farrayGet" | "ptrGet" | "uuidGet" | "stringGet";
export type Kernel_member_setter = "uscalarSet" | "fscalarSet" | "uarraySet" | "farraySet" | "ptrSet" | "uuidSet" | "stringSet";
/** 二进制数据基类（48字节）。 */
export declare const Binary_member_index: {
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