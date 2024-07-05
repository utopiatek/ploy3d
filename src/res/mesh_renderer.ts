import * as Miaoverse from "../mod.js"

/** 网格渲染器组件（G1）。 */
export class MeshRenderer extends Miaoverse.Uniform<MeshRenderer_kernel> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(impl: MeshRenderer_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl, ptr, id);
    }

    /** 是否启用组件。 */
    public get enabled(): boolean {
        return this._impl.Get<number>(this._ptr, "enabled") > 0;
    }
    public set enabled(b: boolean) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }

    /** 是否需要刷新渲染设置（刷新将重新编译着色器分支）。 */
    public get flush(): boolean {
        return this._impl.Get<number>(this._ptr, "flush") > 0;
    }
    public set flush(b: boolean) {
        this._impl.Set(this._ptr, "flush", b ? 1 : 0);
    }

    /** 顶点数组对象缓存（WebGL中使用）。 */
    public get vertexArray(): number {
        return this._impl.Get(this._ptr, "vertexArray");
    }
    public set vertexArray(value: number) {
        this._impl.Set(this._ptr, "vertexArray", value);
    }

    /** 渲染时间戳（用于判断是否清空当前绘制实例列表）。 */
    public get drawTS(): number {
        return this._impl.Get(this._ptr, "drawTS");
    }

    /** 材质数量。 */
    public get materialCount(): number {
        return this._impl.Get(this._ptr, "materialCount");
    }

    /** 实例化绘制的实例数据列表（绑定到G1）。 */
    public get g1_instanceList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g1_instanceList"));
    }

    /** 骨骼蒙皮绘制的骨骼变换矩阵列表（绑定到G1）。 */
    public get g1_boneList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g1_boneList"));
    }

    /** 需要在G1绑定对象中设置网格变形目标数据贴图ID。 */
    public get g1_morphTargets(): number {
        return this._impl.Get(this._ptr, "g1_morphTargets");
    }
}

/** 网格渲染器组件（G1，512字节）。 */
export class MeshRenderer_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 创建网格渲染器实例。
     * @param mesh 网格资源实例。
     * @param skeleton 骨架定义实例。
     * @returns 返回网格渲染器实例。
     */
    public async CreateMeshRenderer(mesh: Miaoverse.Mesh, skeleton: any) {
        const ptr = this.InstanceMeshRenderer(0 as never, 0 as never);
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new MeshRenderer(this, ptr, id);

        this._instanceCount++;

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        return instance;
    }

    /**
     * 根据内核对象指针获取对象实例。
     * @param self 内核对象指针。
     * @returns 返回对象实例。
     */
    public GetInstanceByPtr(ptr: Miaoverse.io_ptr) {
        if (this._global.env.ptrValid(ptr)) {
            const id = this.Get<number>(ptr, "id");
            return this.GetInstanceByID(id);
        }

        return null;
    }

    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    public GetInstanceByID(id: number) {
        return this._instanceList[id];
    }

    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    public Get<T>(self: Miaoverse.io_ptr, key: MeshRenderer_kernel["_members_key"]) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]) as T;
    }

    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    public Set(self: Miaoverse.io_ptr, key: MeshRenderer_kernel["_members_key"], value: any) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value as never);
    }

    /** 实例化网格渲染器组件资源实例。 */
    protected InstanceMeshRenderer: (mesh: Miaoverse.io_ptr, skeleton: Miaoverse.io_ptr) => Miaoverse.io_ptr;

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;

    /** 实例容器列表。 */
    protected _instanceList: MeshRenderer[] = [null];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, MeshRenderer> = {};
    /** 已分配实例数量。 */
    protected _instanceCount: number = 0;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC列表。 */
    protected _gcList: MeshRenderer[] = [];

    /** 网格渲染器组件内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Uniform_member_index,

        reserved: ["uarrayGet", "uarraySet", 8, 20] as Miaoverse.Kernel_member,

        skeletonPTR: ["ptrGet", "ptrSet", 1, 28] as Miaoverse.Kernel_member,
        skeletonUUID: ["uuidGet", "uuidSet", 3, 29] as Miaoverse.Kernel_member,

        meshPTR: ["ptrGet", "ptrSet", 1, 32] as Miaoverse.Kernel_member,
        meshUUID: ["uuidGet", "uuidSet", 3, 33] as Miaoverse.Kernel_member,

        enabled: ["uscalarGet", "uscalarSet", 1, 36] as Miaoverse.Kernel_member,
        flush: ["uscalarGet", "uscalarSet", 1, 37] as Miaoverse.Kernel_member,
        lastSib: ["ptrGet", "ptrSet", 1, 38] as Miaoverse.Kernel_member,
        nextSib: ["ptrGet", "ptrSet", 1, 39] as Miaoverse.Kernel_member,

        g1_instanceList: ["ptrGet", "ptrSet", 1, 40] as Miaoverse.Kernel_member,
        g1_boneList: ["ptrGet", "ptrSet", 1, 41] as Miaoverse.Kernel_member,
        g1_morphTargets: ["uscalarGet", "uscalarSet", 1, 42] as Miaoverse.Kernel_member,
        vertexArray: ["uscalarGet", "uscalarSet", 1, 43] as Miaoverse.Kernel_member,

        drawTS: ["uscalarGet", "uscalarSet", 1, 44] as Miaoverse.Kernel_member,
        materialCount: ["uscalarGet", "uscalarSet", 1, 45] as Miaoverse.Kernel_member,
        drawInstanceList: ["ptrGet", "ptrSet", 1, 46] as Miaoverse.Kernel_member,
        materials: ["ptrGet", "ptrSet", 1, 47] as Miaoverse.Kernel_member,

        center: ["farrayGet", "farraySet", 3, 96] as Miaoverse.Kernel_member,
        renderFlags: ["uscalarGet", "uscalarSet", 1, 99] as Miaoverse.Kernel_member,
        extents: ["farrayGet", "farraySet", 3, 100] as Miaoverse.Kernel_member,
        instanceCount: ["uscalarGet", "uscalarSet", 1, 103] as Miaoverse.Kernel_member,

        reserved2: ["uarrayGet", "uarraySet", 4, 104] as Miaoverse.Kernel_member,

        morphSampler: ["uarrayGet", "uarraySet", 4, 108] as Miaoverse.Kernel_member,

        morphTargetsWeight: ["uarrayGet", "uarraySet", 16, 112] as Miaoverse.Kernel_member,
    } as const;

    /** 网格渲染器组件内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof MeshRenderer_kernel["_members"];
}

/** 在网格渲染器中设置的应用于子网格的材质引用节点（64字节）。 */
export const MaterialNode_member_index = {
    slot: ["uscalarGet", "uscalarSet", 1, 0] as Miaoverse.Kernel_member,
    submesh: ["uscalarGet", "uscalarSet", 1, 1] as Miaoverse.Kernel_member,
    branchTS: ["uscalarGet", "uscalarSet", 1, 2] as Miaoverse.Kernel_member,
    branchKEY: ["uscalarGet", "uscalarSet", 1, 3] as Miaoverse.Kernel_member,

    materialPTR: ["ptrGet", "ptrSet", 1, 4] as Miaoverse.Kernel_member,
    materialUUID: ["uuidGet", "uuidSet", 3, 5] as Miaoverse.Kernel_member,

    sortH: ["uscalarGet", "uscalarSet", 1, 8] as Miaoverse.Kernel_member,
    meshRenderer: ["ptrGet", "ptrSet", 1, 9] as Miaoverse.Kernel_member,
    last: ["ptrGet", "ptrSet", 1, 10] as Miaoverse.Kernel_member,
    next: ["ptrGet", "ptrSet", 1, 11] as Miaoverse.Kernel_member,

    reserved: ["uarrayGet", "uarraySet", 4, 12] as Miaoverse.Kernel_member,
} as const;
