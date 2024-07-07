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
/** 网格渲染器组件（G1，512字节）。 */
export declare class MeshRenderer_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建网格渲染器实例。
     * @param mesh 网格资源实例。
     * @param skeleton 骨架定义实例。
     * @returns 返回网格渲染器实例。
     */
    CreateMeshRenderer(mesh: Miaoverse.Mesh, skeleton: any): Promise<Miaoverse.MeshRenderer>;
    /**
     * 根据内核对象指针获取对象实例。
     * @param self 内核对象指针。
     * @returns 返回对象实例。
     */
    GetInstanceByPtr(ptr: Miaoverse.io_ptr): Miaoverse.MeshRenderer;
    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    GetInstanceByID(id: number): Miaoverse.MeshRenderer;
    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    Get<T>(self: Miaoverse.io_ptr, key: MeshRenderer_kernel["_members_key"]): T;
    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    Set(self: Miaoverse.io_ptr, key: MeshRenderer_kernel["_members_key"], value: any): void;
    /** 实例化网格渲染器组件资源实例。 */
    protected InstanceMeshRenderer: (mesh: Miaoverse.io_ptr, skeleton: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: MeshRenderer[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, MeshRenderer>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 待GC列表。 */
    protected _gcList: MeshRenderer[];
    /** 网格渲染器组件内核实现的数据结构成员列表。 */
    protected _members: {
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
    /** 网格渲染器组件内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof MeshRenderer_kernel["_members"];
}
/** 在网格渲染器中设置的应用于子网格的材质引用节点（64字节）。 */
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
