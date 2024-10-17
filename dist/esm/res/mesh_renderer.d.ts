/// <reference types="dist" />
import * as Miaoverse from "../mod.js";
/** 网格渲染器组件（G1）。 */
export declare class MeshRenderer extends Miaoverse.Uniform<MeshRenderer_kernel> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: MeshRenderer_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 设置材质节点。
     * @param slot 材质插槽。
     * @param submesh 材质应用到子网格索引。
     * @param material 材质资源实例。
     */
    SetMaterial(slot: number, submesh: number, material: Miaoverse.Material): void;
    /**
     * 获取指定材质插槽材质。
     * @param slot 材质插槽。
     * @returns 返回材质实例。
     */
    GetMaterial(slot: number): Miaoverse.Material;
    /**
     * 绑定网格骨骼蒙皮骨架关节实例。
     * @param joints 关节实例指针数组。
     */
    BindSkeleton(joints: Miaoverse.io_ptr[]): void;
    /**
     * 基于指定3D对象更新G1相关数据。
     * @param object3d 3D对象内核实例指针。
     */
    UpdateG1(object3d: Miaoverse.Object3D): void;
    /**
     * 释放实例引用。
     */
    Release(): void;
    /**
     * 增加实例引用。
     */
    AddRef(): void;
    /**
     * 清除对象。
     */
    protected Dispose(): void;
    /** 网格资源实例。 */
    get mesh(): Miaoverse.Mesh;
    /** 数据块在缓存中的字节大小（256对齐，G1前256字节为系统字段且不绑定到着色器）。 */
    get size(): number;
    /** 数据块在缓存中的字节偏移（256对齐，G1前256字节为系统字段且不绑定到着色器）。 */
    get offset(): number;
    /** 是否启用组件。 */
    get enabled(): boolean;
    set enabled(b: boolean);
    /** 是否需要刷新渲染设置（刷新将重新编译着色器分支）。 */
    get flush(): boolean;
    set flush(b: boolean);
    /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0）。 */
    get frontFace(): number;
    set frontFace(value: number);
    /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1）。 */
    get cullMode(): number;
    set cullMode(value: number);
    /** 顶点数组对象缓存（WebGL中使用）。 */
    get vertexArray(): number;
    set vertexArray(value: number);
    /** 渲染时间戳（用于判断是否清空当前绘制实例列表）。 */
    get drawTS(): number;
    /** 材质数量。 */
    get materialCount(): number;
    /** 骨骼蒙皮骨骼变换数据缓存ID。 */
    get boneBuffer(): number;
    /** 骨骼蒙皮骨骼变换数据数组空间起始索引。。 */
    get boneArrayStart(): number;
    /** 需要在G1绑定对象中设置网格变形目标数据贴图ID。 */
    get g1_morphTargets(): number;
    /** 属性访问视图。 */
    get view(): Record<string, number[]>;
    /** 自定义网格渲染器绘制方法（主要用于在网格上直接绘制UI）。 */
    drawCustom: (queue: Miaoverse.DrawQueue, method: string, params: number[]) => void;
    /** 属性访问视图。 */
    private _view;
    /** 通过资源装载的组件记录UUID。 */
    private _uuid;
}
/** 网格渲染器组件内核实现。 */
export declare class MeshRenderer_kernel extends Miaoverse.Base_kernel<MeshRenderer, typeof MeshRendere_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 装载网格渲染器组件资源。
     * @param uri 网格渲染器组件资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回网格渲染器组件资源实例。
     */
    Load(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.MeshRenderer>;
    /**
     * 创建网格渲染器组件实例。
     * @param mesh 网格资源内核实例指针。
     * @returns 返回网格渲染器组件实例。
     */
    Create(mesh: Miaoverse.Mesh, materials?: {
        /** 材质插槽索引（默认等同子网格索引）。 */
        slot?: number;
        /** 材质应用到子网格索引（相同子网格可绑定多个材质进行多次重叠渲染）。*/
        submesh: number;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
    }[]): Promise<Miaoverse.MeshRenderer>;
    /**
     * 移除网格渲染器组件实例。
     * @param id 网格渲染器组件实例ID。
     */
    protected Remove(id: number): void;
    /**
     * 清除所有。
     */
    protected DisposeAll(): void;
    /**
     * 实例化网格渲染器组件内核实例。
     * @param mesh 网格资源内核实例。
     * @param skeleton 骨架定义数据内核实例。
     */
    protected _Create: (mesh: Miaoverse.io_ptr, skeleton: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /**
     * 释放网格渲染器组件引用。
     */
    protected _Release: (mesh_renderer: Miaoverse.io_ptr) => number;
    /**
     * 设置材质节点。
     * @param mesh_renderer 网格渲染器组件实例指针。
     * @param slot 材质插槽。
     * @param submesh 材质应用到子网格索引。
     * @param material 材质实例指针。。
     * @returns 。
     */
    protected _SetMaterial: (mesh_renderer: Miaoverse.io_ptr, slot: number, submesh: number, material: Miaoverse.io_ptr) => void;
    /**
     * 设置材质节点。
     * @param mesh_renderer 网格渲染器组件实例指针。
     * @param slot 材质插槽。
     * @returns 返回材质实例ID。
     */
    protected _GetMaterial: (mesh_renderer: Miaoverse.io_ptr, slot: number) => number;
    /**
     * 获取动态实例绘制数据槽。
     * @param flags 操作标志集（BIT1-清除列表，BIT2-不在后续验证数据有效性，直接占用数据槽，BIT4-获取当前实例数量，BIT8-提交到GPU顶点缓存）。
     * @returns 返回数据空间指针。
     */
    protected _GetInstanceSlot: (flags: number) => Miaoverse.io_ptr;
    /**
     * 验证绘制实例在指定相机视锥内可见（入不可见将不保留绘制实例数据）。
     * @returns 返回有效数据槽。
     */
    protected _VerifyInstance: (data: Miaoverse.io_ptr, camera: Miaoverse.io_ptr) => number;
    /**
     * 基于指定3D对象更新G1相关数据。
     * @param mesh_renderer 网格资源内核实例。
     * @param object3d 3D对象内核实例。
     */
    protected _UpdateG1: (mesh_renderer: Miaoverse.io_ptr, object3d: Miaoverse.io_ptr) => void;
    /** 内置默认网格渲染器组件实例。 */
    defaultG1: MeshRenderer;
    /** 实例绘制数据顶点缓存布局。 */
    instanceVBL: GPUVertexBufferLayout;
    /** 待GC资源实例列表（资源在创建时产生1引用计数，需要释放）。 */
    private _gcList;
}
/** 网格渲染器组件内核实现的数据结构成员列表。 */
export declare const MeshRendere_member_index: {
    readonly skeleton_skin_enabled: Miaoverse.Kernel_member;
    readonly skeleton_skin_writeTS: Miaoverse.Kernel_member;
    readonly skeleton_skin_memorySize: Miaoverse.Kernel_member;
    readonly skeleton_skin_memory: Miaoverse.Kernel_member;
    readonly skeleton_skin_joints: Miaoverse.Kernel_member;
    readonly skeleton_skin_ctrls: Miaoverse.Kernel_member;
    readonly skeleton_skin_jointsTS: Miaoverse.Kernel_member;
    readonly skeleton_skin_pose: Miaoverse.Kernel_member;
    readonly skeletonPTR: Miaoverse.Kernel_member;
    readonly skeletonUUID: Miaoverse.Kernel_member;
    readonly meshPTR: Miaoverse.Kernel_member;
    readonly meshUUID: Miaoverse.Kernel_member;
    readonly enabled: Miaoverse.Kernel_member;
    readonly flush: Miaoverse.Kernel_member;
    readonly frontFace: Miaoverse.Kernel_member;
    readonly cullMode: Miaoverse.Kernel_member;
    readonly boneBuffer: Miaoverse.Kernel_member;
    readonly boneArrayStart: Miaoverse.Kernel_member;
    readonly g1_morphTargets: Miaoverse.Kernel_member;
    readonly vertexArray: Miaoverse.Kernel_member;
    readonly drawTS: Miaoverse.Kernel_member;
    readonly materialCount: Miaoverse.Kernel_member;
    readonly drawInstanceList: Miaoverse.Kernel_member;
    readonly materials: Miaoverse.Kernel_member;
    readonly center: Miaoverse.Kernel_member;
    readonly renderFlags: Miaoverse.Kernel_member;
    readonly extents: Miaoverse.Kernel_member;
    readonly drawInstanceCount: Miaoverse.Kernel_member;
    readonly morphSampler: Miaoverse.Kernel_member;
    readonly morphTargetsWeight: Miaoverse.Kernel_member;
    readonly buffer_bufferID: Miaoverse.Kernel_member;
    readonly buffer_size: Miaoverse.Kernel_member;
    readonly buffer_addr: Miaoverse.Kernel_member;
    readonly buffer_next: Miaoverse.Kernel_member;
    readonly bn_buffer: Miaoverse.Kernel_member;
    readonly bn_bufferID: Miaoverse.Kernel_member;
    readonly bn_offset: Miaoverse.Kernel_member;
    readonly bn_size: Miaoverse.Kernel_member;
    readonly buffer: Miaoverse.Kernel_member;
    readonly bufferID: Miaoverse.Kernel_member; /** 材质应用到子网格索引（相同子网格可绑定多个材质进行多次重叠渲染）。*/
    readonly bufferBlockOffset: Miaoverse.Kernel_member;
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
/** 材质引用节点内核实现的数据结构成员列表。 */
export declare const MaterialNode_member_index: {
    readonly slot: Miaoverse.Kernel_member;
    readonly submesh: Miaoverse.Kernel_member;
    readonly branchTS: Miaoverse.Kernel_member;
    readonly branchKEY: Miaoverse.Kernel_member;
    readonly materialPTR: Miaoverse.Kernel_member;
    readonly materialUUID: Miaoverse.Kernel_member;
    readonly sortH: Miaoverse.Kernel_member;
    readonly meshRenderer: Miaoverse.Kernel_member;
    readonly last: Miaoverse.Kernel_member;
    readonly next: Miaoverse.Kernel_member;
    readonly reserved: Miaoverse.Kernel_member;
};
/** 绘制实例数据内核实现的数据结构成员列表。 */
export declare const DrawInstance_member_index: {
    readonly wfmMat: Miaoverse.Kernel_member;
    readonly object: Miaoverse.Kernel_member;
    readonly flags: Miaoverse.Kernel_member;
    readonly layers: Miaoverse.Kernel_member;
    readonly userData: Miaoverse.Kernel_member;
    readonly bbCenter: Miaoverse.Kernel_member;
    readonly bbExtents: Miaoverse.Kernel_member;
};
/** 网格渲染器资源。 */
export interface Asset_meshrenderer extends Miaoverse.Asset {
    /** 网格资源URI。 */
    mesh: string;
    /** 材质节点设置数组。 */
    materials: {
        /** 材质插槽索引（默认等同子网格索引）。 */
        slot?: number;
        /** 绑定到网格的材质组（子网格，相同子网格可绑定多个材质进行多次重叠渲染）。*/
        submesh: number;
        /** 材质资源URI。 */
        material: string;
        /** 材质实例属性（不设置则使用共享材质）。 */
        properties?: Miaoverse.Asset_material["properties"];
    }[];
}
