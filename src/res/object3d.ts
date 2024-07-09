import * as Miaoverse from "../mod.js"

/** 3D对象实例。 */
export class Object3D extends Miaoverse.Resource<Object3D> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Object_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /**
     * 设置父级对象实例。
     * @param parent 父级对象实例。
     * @param worldPositionStays 是否保持世界空间位置。
     */
    public SetParent(parent: Object3D, worldPositionStays?: boolean) {
        const parentPtr = parent ? parent._ptr : this._global.env.ptrZero();
        this._impl["_SetParent"](this._ptr, parentPtr, worldPositionStays ? 1 : 0);
    }

    /** 遍历处理每个子对象。 */
    public ForEachChild(proc: (index: number, obj: Object3D) => void) {
        let child = this.firstChild;
        let count = this.childCount;
        let index = 0;

        while (child && index < count) {
            proc(index, child);
            child = child.nextSib;
            index++;
        }
    }

    /** 变换组件更新时间戳。 */
    public get writeTS(): number {
        return this._impl.Get(this._ptr, "writeTS");
    }

    /** 变换组件应用时间戳。 */
    public get readTS(): number {
        return this._impl.Get(this._ptr, "readTS");
    }

    /** 对象名称。 */
    public get name(): string {
        return this._impl.Get(this._ptr, "name");
    }
    public set name(name: string) {
        this._impl.Set(this._ptr, "name", name);
    }

    /** 对象激活状态。 */
    public get active(): boolean {
        return this._impl.Get<number>(this._ptr, "enabled") > 0;
    }
    public set active(b: boolean) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
        this._impl["_Flush"](this._ptr, 2);
    }

    /** 对象自定义层标记。 */
    public get layers(): number {
        return this._impl.Get<number>(this._ptr, "layers");
    }
    public set layers(value: number) {
        this._impl.Set(this._ptr, "layers", value);
        this._impl["_Flush"](this._ptr, 2);
    }

    /** 对象高亮状态。 */
    public get highlight(): boolean {
        const flags = this._impl.Get<number>(this._ptr, "flags");
        return (flags & 1) == 1;
    }
    public set highlight(b: boolean) {
        let flags = this._impl.Get<number>(this._ptr, "flags");

        if (b) {
            flags = flags | 1;
        }
        else {
            flags = flags & ~1;
        }

        this._impl.Set(this._ptr, "flags", flags);
        this._impl["_Flush"](this._ptr, 2);
    }

    /** 对象坐标不跟随世界空间原点变化。 */
    public get staticWorld(): boolean {
        const flags = this._impl.Get<number>(this._ptr, "flags");
        return (flags & 2) == 2;
    }
    public set staticWorld(b: boolean) {
        let flags = this._impl.Get<number>(this._ptr, "flags");

        if (b) {
            flags = flags | 2;
        }
        else {
            flags = flags & ~2;
        }

        this._impl.Set(this._ptr, "flags", flags);
        this._impl["_Flush"](this._ptr, 2);
    }

    /** 本地坐标（父级空间）。 */
    public get localPosition(): Miaoverse.Vector3 {
        const values = this._impl.Get<number[]>(this._ptr, "localPosition");
        return this._global.Vector3(values);
    }
    public set localPosition(value: Miaoverse.Vector3) {
        this._impl.Set(this._ptr, "localPosition", value.values);
        this._impl["_Flush"](this._ptr, 1);
    }

    /** 本地缩放（父级空间）。 */
    public get localScale(): Miaoverse.Vector3 {
        const values = this._impl.Get<number[]>(this._ptr, "localScale");
        return this._global.Vector3(values);
    }
    public set localScale(value: Miaoverse.Vector3) {
        this._impl.Set(this._ptr, "localScale", value.values);
        this._impl["_Flush"](this._ptr, 1);
    }

    /** 父级对象实例。 */
    public get parent(): Object3D {
        const ptr = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "parent");
        return this._impl.GetInstanceByPtr(ptr);
    }

    /** 第一个子级对象（子级链表头）。 */
    public get firstChild(): Object3D {
        const ptr = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "children");
        return this._impl.GetInstanceByPtr(ptr);
    }

    /** 父级空间旋转欧拉角（单位度）。 */
    public get localEulerAngles(): Miaoverse.Vector3 {
        return this.localRotation.eulerAngles;
    }
    public set localEulerAngles(v: Miaoverse.Vector3) {
        this.localRotation = v.toQuaternion();
    }

    /** 本地旋转（父级空间）。 */
    public get localRotation(): Miaoverse.Quaternion {
        const values = this._impl.Get<number[]>(this._ptr, "localRotation");
        return this._global.Quaternion(values);
    }
    public set localRotation(value: Miaoverse.Quaternion) {
        this._impl.Set(this._ptr, "localRotation", value.values);
        this._impl["_Flush"](this._ptr, 1);
    }

    /** 世界空间坐标。 */
    public get position(): Miaoverse.Vector3 {
        return this.wfmMat.MultiplyVector3(1, this._global.Vector3([0, 0, 0]));
    }
    public set position(pos: Miaoverse.Vector3) {
        this._impl["_SetPosition"](this._ptr, pos.x, pos.y, pos.z);
    }

    /** 世界空间旋转欧拉角（单位度）。 */
    public get eulerAngles(): Miaoverse.Vector3 {
        return this.rotation.eulerAngles;
    }
    public set eulerAngles(v: Miaoverse.Vector3) {
        this.rotation = v.toQuaternion();
    }

    /** 旋转（世界空间。缩放造成空间尺度变形，方向被扭曲，所以带缩放的变换矩阵变换方向无法得到等比例空间的方向）。 */
    public get rotation(): Miaoverse.Quaternion {
        this._impl["_Flush"](this._ptr, 4);
        const values = this._impl.Get<number[]>(this._ptr, "worldRotation");
        return this._global.Quaternion(values);
    }
    public set rotation(q: Miaoverse.Quaternion) {
        this._impl["_SetRotation"](this._ptr, q.x, q.y, q.z, q.w);
    }

    /** 对象空间到世界空间变换矩阵。 */
    public get wfmMat(): Miaoverse.Matrix4x4 {
        this._impl["_Flush"](this._ptr, 4);
        const values = this._impl.Get<number[]>(this._ptr, "wfmMat");
        return this._global.Matrix4x4(values);
    }

    /** 世界空间到对象空间变换矩阵。 */
    public get mfwMat(): Miaoverse.Matrix4x4 {
        this._impl["_Flush"](this._ptr, 4);
        const values = this._impl.Get<number[]>(this._ptr, "mfwMat");
        return this._global.Matrix4x4(values);
    }

    /** 世界空间右向量。 */
    public get right(): Miaoverse.Vector3 {
        return this.rotation.RotateVector(this._global.Vector3([1, 0, 0]));
    }

    /** 世界空间上向量。 */
    public get up(): Miaoverse.Vector3 {
        return this.rotation.RotateVector(this._global.Vector3([0, 1, 0]));
    }

    /** 世界空间前向量。 */
    public get forward(): Miaoverse.Vector3 {
        return this.rotation.RotateVector(this._global.Vector3([0, 0, 1]));
    }

    /** 父级变换组件应用时间戳。 */
    public get parentTS(): number {
        return this._impl.Get<number>(this._ptr, "parentTS");
    }

    /** 子级数量。 */
    public get childCount(): number {
        return this._impl.Get<number>(this._ptr, "childCount");
    }

    /** 上一个兄弟实例。 */
    public get lastSib(): Object3D {
        const lastSib = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "lastSib");
        return this._impl.GetInstanceByPtr(lastSib);
    }

    /** 下一个兄弟实例。 */
    public get nextSib(): Object3D {
        const nextSib = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "nextSib");
        return this._impl.GetInstanceByPtr(nextSib);
    }

    /** 层次结构中最顶级实例。 */
    public get root(): Object3D {
        let root = this.parent;

        while (root) {
            const upper = root.parent;
            if (!upper) {
                break;
            }

            root = upper;
        }

        return root;
    }

    /** 内核实现。 */
    private _impl: Object_kernel;
}

/** 3D对象内核实现。 */
export class Object_kernel extends Miaoverse.Base_kernel<Object3D, typeof Object_member_index>  {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Object_member_index);
    }

    /**
     * 创建3D对象实例。
     * @returns 返回3D对象实例。
     */
    public async Create(scene: Miaoverse.Scene) {
        const ptr = this._Instance(scene.internalPtr, 0 as never);
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Object3D(this, ptr, id);

        this._instanceCount++;

        return instance;
    }

    /**
     * 实例化3D对象内核实例。
     * @param scene 场景内核实例指针。
     * @param node 3D对象节点数据指针。
     * @returns 返回3D对象内核实例指针。
     */
    protected _Instance: (scene: Miaoverse.io_ptr, node: Miaoverse.io_ptr) => Miaoverse.io_ptr;

    /**
     * 销毁3D对象内核实例。
     * @param object3d 3D对象内核实例指针。
     */
    protected _Destroy: (object3d: Miaoverse.io_ptr) => void;

    /**
     * 刷新3D对象内核实例状态。
     * @param object3d 3D对象内核实例指针。
     * @param ctrl 刷新方法（1-标记变换组件参数更新，2-标记3D对象参数更新，4-应用变换组件参数更新，8-应用3D对象整体更新）。
     * @returns 返回变换组件最新状态时间戳。
     */
    protected _Flush: (object3d: Miaoverse.io_ptr, ctrl: number) => number;

    /**
     * 设置世界空间坐标。
     * @param object3d 3D对象内核实例指针。
     */
    protected _SetPosition: (object3d: Miaoverse.io_ptr, vx: number, vy: number, vz: number) => void;

    /**
     * 设置世界空间旋转四元数。
     * @param object3d 3D对象内核实例指针。
     */
    protected _SetRotation: (object3d: Miaoverse.io_ptr, qx: number, qy: number, qz: number, qw: number) => void;

    /**
     * 设置父级3D对象。
     * @param object3d 3D对象内核实例指针。
     * @param parent 父级3D对象内核实例指针。
     * @param staysWorld 是否维持世界空间坐标。
     */
    protected _SetParent: (object3d: Miaoverse.io_ptr, parent: Miaoverse.io_ptr, staysWorld: Miaoverse.io_uint) => void;
}

/** 场景节点内核实现的数据结构成员列表。 */
export const Node_member_index = {
    ...Miaoverse.Binary_member_index,

    index: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    enabled: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    layers: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    flags: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

    worldLLMC: ["farrayGet", "farraySet", 4, 16] as Miaoverse.Kernel_member,

    localPosition: ["farrayGet", "farraySet", 3, 20] as Miaoverse.Kernel_member,
    altitude: ["fscalarGet", "fscalarSet", 1, 23] as Miaoverse.Kernel_member,

    localScale: ["farrayGet", "farraySet", 3, 24] as Miaoverse.Kernel_member,
    parent: ["ptrGet", "ptrSet", 1, 27] as Miaoverse.Kernel_member,

    localRotation: ["farrayGet", "farraySet", 4, 28] as Miaoverse.Kernel_member,

    meshRenderer: ["ptrGet", "ptrSet", 1, 32] as Miaoverse.Kernel_member,
    camera: ["ptrGet", "ptrSet", 1, 33] as Miaoverse.Kernel_member,
    light: ["ptrGet", "ptrSet", 1, 34] as Miaoverse.Kernel_member,
    animator: ["ptrGet", "ptrSet", 1, 35] as Miaoverse.Kernel_member,

    prefab: ["uscalarGet", "uscalarSet", 1, 36] as Miaoverse.Kernel_member,
    depth: ["uscalarGet", "uscalarSet", 1, 37] as Miaoverse.Kernel_member,
    unused2: ["uscalarGet", "uscalarSet", 1, 38] as Miaoverse.Kernel_member,
    unused3: ["uscalarGet", "uscalarSet", 1, 39] as Miaoverse.Kernel_member,

    name: ["stringGet", "stringSet", 64, 40] as Miaoverse.Kernel_member,

    reserved: ["uarrayGet", "uarraySet", 8, 56] as Miaoverse.Kernel_member,
} as const;

/** 3D对象内核实现的数据结构成员列表。 */
export const Object_member_index = {
    ...Node_member_index,

    source: ["uscalarGet", "uscalarSet", 1, 64] as Miaoverse.Kernel_member,
    instance: ["uscalarGet", "uscalarSet", 1, 65] as Miaoverse.Kernel_member,
    parentTS: ["uscalarGet", "uscalarSet", 1, 66] as Miaoverse.Kernel_member,
    gisTS: ["uscalarGet", "uscalarSet", 1, 67] as Miaoverse.Kernel_member,

    childCount: ["uscalarGet", "uscalarSet", 1, 68] as Miaoverse.Kernel_member,
    updated: ["uscalarGet", "uscalarSet", 1, 69] as Miaoverse.Kernel_member,
    nextEdit: ["ptrGet", "ptrSet", 1, 70] as Miaoverse.Kernel_member,
    nextDraw: ["ptrGet", "ptrSet", 1, 71] as Miaoverse.Kernel_member,

    scene: ["ptrGet", "ptrSet", 1, 72] as Miaoverse.Kernel_member,
    children: ["ptrGet", "ptrSet", 1, 73] as Miaoverse.Kernel_member,
    lastSib: ["ptrGet", "ptrSet", 1, 74] as Miaoverse.Kernel_member,
    nextSib: ["ptrGet", "ptrSet", 1, 75] as Miaoverse.Kernel_member,

    worldRotation: ["farrayGet", "farraySet", 4, 76] as Miaoverse.Kernel_member,

    reserved2: ["uarrayGet", "uarraySet", 16, 80] as Miaoverse.Kernel_member,

    wfmMat: ["farrayGet", "farraySet", 16, 96] as Miaoverse.Kernel_member,
    mfwMat: ["farrayGet", "farraySet", 16, 112] as Miaoverse.Kernel_member,
} as const;
