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
        this._view = new (this.tuple.view)(this as any);
    }

    /**
     * 设置材质节点。
     * @param slot 材质插槽。
     * @param submesh 材质应用到子网格索引。
     * @param material 材质资源实例。
     */
    public SetMaterial(slot: number, submesh: number, material: Miaoverse.Material) {
        this._impl["_SetMaterial"](this._ptr, slot, submesh, material.internalPtr);
    }

    /**
     * 获取指定材质插槽材质。
     * @param slot 材质插槽。
     * @returns 返回材质实例。
     */
    public GetMaterial(slot: number) {
        const id = this._impl["_GetMaterial"](this._ptr, slot);
        return this._global.resources.Material.GetInstanceByID(id) as Miaoverse.Material;
    }

    /**
     * 绑定网格骨骼蒙皮骨架关节实例。
     * @param joints 关节实例指针数组。
     */
    public BindSkeleton(joints: Miaoverse.io_ptr[]) {
        const enabled = this._impl.Get<number>(this._ptr, "skeleton_skin_enabled");
        const array_ptr = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "skeleton_skin_joints");

        if (enabled) {
            this._global.env.uarraySet(array_ptr, 0, joints);
        }
    }

    /**
     * 基于指定3D对象更新G1相关数据。
     * @param object3d 3D对象内核实例指针。
     */
    public UpdateG1(object3d: Miaoverse.Object3D) {
        this._impl["_UpdateG1"](this._ptr, object3d.internalPtr);
    }

    /** 网格资源实例。 */
    public get mesh(): Miaoverse.Mesh {
        const ptr = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "meshPTR");
        return this._global.resources.Mesh.GetInstanceByPtr(ptr);
    }

    /** 数据块在缓存中的字节大小（256对齐，G1前256字节为系统字段且不绑定到着色器）。 */
    public get size(): number {
        return this._impl.Get<number>(this._ptr, "bufferBlockSize") - 256;
    }

    /** 数据块在缓存中的字节偏移（256对齐，G1前256字节为系统字段且不绑定到着色器）。 */
    public get offset(): number {
        return this._impl.Get<number>(this._ptr, "bufferBlockOffset") + 256;
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

    /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0）。 */
    public get frontFace(): number {
        return this._impl.Get(this._ptr, "frontFace");
    }
    public set frontFace(value: number) {
        this._impl.Set(this._ptr, "frontFace", value);
    }

    /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1）。 */
    public get cullMode(): number {
        return this._impl.Get(this._ptr, "cullMode");
    }
    public set cullMode(value: number) {
        this._impl.Set(this._ptr, "cullMode", value);
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

    /** 骨骼蒙皮骨骼变换数据缓存ID。 */
    public get boneBuffer() {
        return this._impl.Get<number>(this._ptr, "boneBuffer");
    }

    /** 骨骼蒙皮骨骼变换数据数组空间起始索引。。 */
    public get boneArrayStart() {
        return this._impl.Get<number>(this._ptr, "boneArrayStart");
    }

    /** 需要在G1绑定对象中设置网格变形目标数据贴图ID。 */
    public get g1_morphTargets(): number {
        return this._impl.Get(this._ptr, "g1_morphTargets");
    }

    /** 属性访问视图。 */
    public get view() {
        return this._view;
    }

    /** 自定义网格渲染器绘制方法（主要用于在网格上直接绘制UI）。 */
    public drawCustom: (queue: Miaoverse.DrawQueue, method: string, params: number[]) => void;

    /** 属性访问视图。 */
    private _view: Record<string, Array<number>>;
}

/** 网格渲染器组件内核实现。 */
export class MeshRenderer_kernel extends Miaoverse.Base_kernel<MeshRenderer, typeof MeshRendere_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, MeshRendere_member_index);
    }

    /**
     * 装载网格渲染器组件资源。
     * @param uri 网格渲染器组件资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回网格渲染器组件资源实例。
     */
    public async Load(uri: string, pkg?: Miaoverse.PackageReg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }

        // 加载装配渲染器组件资产 ===============-----------------------

        const desc = await this._global.resources.Load_file<Asset_meshrenderer>("json", uri, true, pkg);
        if (!desc) {
            return null;
        }

        desc.data.uuid = uuid;

        const mesh = await this._global.resources.Mesh.Load(desc.data.mesh, desc.pkg);

        // 不含骨架绑定的网格渲染器资源实例可共享
        if (this._instanceLut[uuid] && !(mesh?.skeleton)) {
            return this._instanceLut[uuid];
        }

        const materials: Parameters<MeshRenderer_kernel["Create"]>[1] = [];

        for (let mat of desc.data.materials) {
            // TODO: 如果带属性数据则不使用共享材质，应当新建材质
            const material = await this._global.resources.Material.Load(mat.material, desc.pkg) as Miaoverse.Material;

            materials.push({
                slot: mat.slot,
                submesh: mat.submesh,
                material
            });
        }

        // 创建实例 ===============-----------------------

        return this.Create(mesh, materials);
    }

    /**
     * 创建网格渲染器组件实例。
     * @param mesh 网格资源内核实例指针。
     * @returns 返回网格渲染器组件实例。
     */
    public async Create(mesh: Miaoverse.Mesh, materials?: {
        /** 材质插槽索引（默认等同子网格索引）。 */
        slot?: number;
        /** 材质应用到子网格索引（相同子网格可绑定多个材质进行多次重叠渲染）。*/
        submesh: number;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
    }[]) {
        const ptr = this._Create(mesh?.internalPtr || 0, mesh?.skeleton?.skeleton as never || 0);
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new MeshRenderer(this, ptr, id);

        this._instanceCount++;

        if (materials) {
            for (let mat of materials) {
                instance.SetMaterial(mat.slot == undefined ? mat.submesh : mat.slot, mat.submesh, mat.material);
            }
        }

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        return instance;
    }

    /**
     * 实例化网格渲染器组件内核实例。
     * @param mesh 网格资源内核实例。
     * @param skeleton 骨架定义数据内核实例。
     */
    protected _Create: (mesh: Miaoverse.io_ptr, skeleton: Miaoverse.io_ptr) => Miaoverse.io_ptr;

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
    public defaultG1: MeshRenderer;
    /** 实例绘制数据顶点缓存布局。 */
    public instanceVBL: GPUVertexBufferLayout = {
        arrayStride: 104,
        stepMode: "instance",
        attributes: [
            {
                shaderLocation: 9,
                offset: 0,
                format: "float32x4"
            },
            {
                shaderLocation: 10,
                offset: 16,
                format: "float32x4"
            },
            {
                shaderLocation: 11,
                offset: 32,
                format: "float32x4"
            },
            {
                shaderLocation: 12,
                offset: 48,
                format: "float32x4"
            },

            {
                shaderLocation: 13,
                offset: 64,
                format: "uint32x4"
            },

            {
                shaderLocation: 14,
                offset: 80,
                format: "float32x3"
            },
            {
                shaderLocation: 15,
                offset: 92,
                format: "float32x3"
            }
        ]
    }
}

/** 网格渲染器组件内核实现的数据结构成员列表。 */
export const MeshRendere_member_index = {
    ...Miaoverse.Uniform_member_index,

    skeleton_skin_enabled: ["uscalarGet", "uscalarSet", 1, 20] as Miaoverse.Kernel_member,
    skeleton_skin_writeTS: ["uscalarGet", "uscalarSet", 1, 21] as Miaoverse.Kernel_member,
    skeleton_skin_memorySize: ["uscalarGet", "uscalarSet", 1, 22] as Miaoverse.Kernel_member,
    skeleton_skin_memory: ["uscalarGet", "uscalarSet", 1, 23] as Miaoverse.Kernel_member,
    skeleton_skin_joints: ["ptrGet", "ptrSet", 1, 24] as Miaoverse.Kernel_member,
    skeleton_skin_ctrls: ["ptrGet", "ptrSet", 1, 25] as Miaoverse.Kernel_member,
    skeleton_skin_jointsTS: ["ptrGet", "ptrSet", 1, 26] as Miaoverse.Kernel_member,
    skeleton_skin_pose: ["ptrGet", "ptrSet", 1, 27] as Miaoverse.Kernel_member,

    skeletonPTR: ["ptrGet", "ptrSet", 1, 28] as Miaoverse.Kernel_member,
    skeletonUUID: ["uuidGet", "uuidSet", 3, 29] as Miaoverse.Kernel_member,

    meshPTR: ["ptrGet", "ptrSet", 1, 32] as Miaoverse.Kernel_member,
    meshUUID: ["uuidGet", "uuidSet", 3, 33] as Miaoverse.Kernel_member,

    enabled: ["uscalarGet", "uscalarSet", 1, 36] as Miaoverse.Kernel_member,
    flush: ["uscalarGet", "uscalarSet", 1, 37] as Miaoverse.Kernel_member,
    frontFace: ["uscalarGet", "uscalarSet", 1, 38] as Miaoverse.Kernel_member,
    cullMode: ["uscalarGet", "uscalarSet", 1, 39] as Miaoverse.Kernel_member,

    boneBuffer: ["ptrGet", "ptrSet", 1, 40] as Miaoverse.Kernel_member,
    boneArrayStart: ["ptrGet", "ptrSet", 1, 41] as Miaoverse.Kernel_member,
    g1_morphTargets: ["uscalarGet", "uscalarSet", 1, 42] as Miaoverse.Kernel_member,
    vertexArray: ["uscalarGet", "uscalarSet", 1, 43] as Miaoverse.Kernel_member,

    drawTS: ["uscalarGet", "uscalarSet", 1, 44] as Miaoverse.Kernel_member,
    materialCount: ["uscalarGet", "uscalarSet", 1, 45] as Miaoverse.Kernel_member,
    drawInstanceList: ["ptrGet", "ptrSet", 1, 46] as Miaoverse.Kernel_member,
    materials: ["ptrGet", "ptrSet", 1, 47] as Miaoverse.Kernel_member,

    center: ["farrayGet", "farraySet", 3, 96] as Miaoverse.Kernel_member,
    renderFlags: ["uscalarGet", "uscalarSet", 1, 99] as Miaoverse.Kernel_member,
    extents: ["farrayGet", "farraySet", 3, 100] as Miaoverse.Kernel_member,
    drawInstanceCount: ["fscalarGet", "fscalarSet", 1, 103] as Miaoverse.Kernel_member,

    morphSampler: ["uarrayGet", "uarraySet", 4, 108] as Miaoverse.Kernel_member,

    morphTargetsWeight: ["uarrayGet", "uarraySet", 16, 112] as Miaoverse.Kernel_member,
} as const;

/** 材质引用节点内核实现的数据结构成员列表。 */
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

/** 绘制实例数据内核实现的数据结构成员列表。 */
export const DrawInstance_member_index = {
    wfmMat: ["farrayGet", "farraySet", 16, 0] as Miaoverse.Kernel_member,

    object: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    flags: ["uscalarGet", "uscalarSet", 1, 17] as Miaoverse.Kernel_member,
    layers: ["uscalarGet", "uscalarSet", 1, 18] as Miaoverse.Kernel_member,
    userData: ["uscalarGet", "uscalarSet", 1, 19] as Miaoverse.Kernel_member,

    bbCenter: ["farrayGet", "farraySet", 3, 20] as Miaoverse.Kernel_member,
    bbExtents: ["farrayGet", "farraySet", 3, 23] as Miaoverse.Kernel_member,
} as const;

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
