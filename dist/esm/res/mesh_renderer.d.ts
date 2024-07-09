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
    /** 是否启用组件。 */
    get enabled(): boolean;
    set enabled(b: boolean);
    /** 是否需要刷新渲染设置（刷新将重新编译着色器分支）。 */
    get flush(): boolean;
    set flush(b: boolean);
    /** 顶点数组对象缓存（WebGL中使用）。 */
    get vertexArray(): number;
    set vertexArray(value: number);
    /** 渲染时间戳（用于判断是否清空当前绘制实例列表）。 */
    get drawTS(): number;
    /** 材质数量。 */
    get materialCount(): number;
    /** 实例化绘制的实例数据列表（绑定到G1）。 */
    get g1_instanceList(): {
        buffer: never;
        bufferID: number;
        offset: number;
        size: number;
    };
    /** 骨骼蒙皮绘制的骨骼变换矩阵列表（绑定到G1）。 */
    get g1_boneList(): {
        buffer: never;
        bufferID: number;
        offset: number;
        size: number;
    };
    /** 需要在G1绑定对象中设置网格变形目标数据贴图ID。 */
    get g1_morphTargets(): number;
}
/** 网格渲染器组件内核实现。 */
export declare class MeshRenderer_kernel extends Miaoverse.Base_kernel<MeshRenderer, typeof MeshRendere_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建网格渲染器组件实例。
     * @param mesh 网格资源内核实例指针。
     * @param skeleton 骨架定义数据内核实例指针。
     * @returns 返回网格渲染器组件实例。
     */
    Create(mesh: Miaoverse.Mesh, skeleton: any): Promise<Miaoverse.MeshRenderer>;
    /**
     * 实例化网格渲染器组件内核实例。
     * @param mesh 网格资源内核实例。
     * @param skeleton 骨架定义数据内核实例。
     */
    protected _Instance: (mesh: Miaoverse.io_ptr, skeleton: Miaoverse.io_ptr) => Miaoverse.io_ptr;
}
/** 网格渲染器组件内核实现的数据结构成员列表。 */
export declare const MeshRendere_member_index: {
    readonly reserved: Miaoverse.Kernel_member;
    readonly skeletonPTR: Miaoverse.Kernel_member;
    readonly skeletonUUID: Miaoverse.Kernel_member;
    readonly meshPTR: Miaoverse.Kernel_member;
    readonly meshUUID: Miaoverse.Kernel_member;
    readonly enabled: Miaoverse.Kernel_member;
    readonly flush: Miaoverse.Kernel_member;
    readonly lastSib: Miaoverse.Kernel_member;
    readonly nextSib: Miaoverse.Kernel_member;
    readonly g1_instanceList: Miaoverse.Kernel_member;
    readonly g1_boneList: Miaoverse.Kernel_member;
    readonly g1_morphTargets: Miaoverse.Kernel_member;
    readonly vertexArray: Miaoverse.Kernel_member;
    readonly drawTS: Miaoverse.Kernel_member;
    readonly materialCount: Miaoverse.Kernel_member;
    readonly drawInstanceList: Miaoverse.Kernel_member;
    readonly materials: Miaoverse.Kernel_member;
    readonly center: Miaoverse.Kernel_member;
    readonly renderFlags: Miaoverse.Kernel_member;
    readonly extents: Miaoverse.Kernel_member;
    readonly instanceCount: Miaoverse.Kernel_member;
    readonly reserved2: Miaoverse.Kernel_member;
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
    readonly bufferID: Miaoverse.Kernel_member;
    readonly bufferBlockOffset: Miaoverse.Kernel_member;
    readonly bufferBlockSize: Miaoverse.Kernel_member;
    readonly group: Miaoverse.Kernel_member;
    readonly binding: Miaoverse.Kernel_member;
    readonly updated: Miaoverse.Kernel_member;
    readonly unused3: Miaoverse.Kernel_member;
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
