import * as Miaoverse from "../mod.js"

/** 相机组件。 */
export class Camera extends Miaoverse.Resource<Camera> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(impl: Camera_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }

    /** 相机参数更新时间戳。 */
    public get writeTS(): number {
        return this._impl.Get(this._ptr, "writeTS");
    }
    public set writeTS(value: number) {
        this._impl.Set(this._ptr, "writeTS", value);
    }

    /** 相机参数应用时间戳。 */
    public get readTS(): number {
        return this._impl.Get(this._ptr, "readTS");
    }
    public set readTS(value: number) {
        this._impl.Set(this._ptr, "readTS", value);
    }

    /** 是否启用组件。 */
    public get enabled(): boolean {
        return this._impl.Get<number>(this._ptr, "enabled") > 0;
    }
    public set enabled(b: boolean) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }

    /** 相机类型（0-透视投影相机、1-正交投影相机）。 */
    public get type(): number {
        return this._impl.Get(this._ptr, "type");
    }

    /** 相机参数是否有更新。 */
    public get updated(): number {
        return this._impl.Get(this._ptr, "updated");
    }
    public set updated(value: number) {
        this._impl.Set(this._ptr, "updated", value);
    }

    /** 相机渲染排序。 */
    public get depth(): number {
        return this._impl.Get(this._ptr, "depth");
    }
    public set depth(value: number) {
        this._impl.Set(this._ptr, "depth", value);
    }

    /** 裁剪过滤，被标记的层不会被视锥裁剪。 */
    public get cullingFilter(): number {
        return this._impl.Get(this._ptr, "cullingFilter");
    }
    public set cullingFilter(value: number) {
        this._impl.Set(this._ptr, "cullingFilter", value);
    }

    /** 观察目标世界空间坐标。 */
    public get target(): Float32Array {
        return this._impl.Get(this._ptr, "target");
    }
    public set target(value: ArrayLike<number>) {
        this._impl.Set(this._ptr, "target", value);
        this.updated = 1;
    }

    /** 相机距观察目标距离。 */
    public get distance(): number {
        return this._impl.Get(this._ptr, "distance");
    }
    public set distance(value: number) {
        this._impl.Set(this._ptr, "distance", value);
        this.updated = 1;
    }

    /** 相机俯角。 */
    public get pitch(): number {
        return this._impl.Get(this._ptr, "pitch");
    }
    public set pitch(value: number) {
        this._impl.Set(this._ptr, "pitch", value);
        this.updated = 1;
    }

    /** 相机偏航角。 */
    public get yaw(): number {
        return this._impl.Get(this._ptr, "yaw");
    }
    public set yaw(value: number) {
        this._impl.Set(this._ptr, "yaw", value);
        this.updated = 1;
    }

    /** 相机翻滚角。 */
    public get roll(): number {
        return this._impl.Get(this._ptr, "roll");
    }
    public set roll(value: number) {
        this._impl.Set(this._ptr, "roll", value);
        this.updated = 1;
    }

    /** 垂直视角（弧度）。 */
    public get fov(): number {
        return this._impl.Get(this._ptr, "fov");
    }
    public set fov(value: number) {
        this._impl.Set(this._ptr, "fov", value);
        this.updated = 1;
    }

    /** 画布宽度。 */
    public get width(): number {
        return this._impl.Get(this._ptr, "width");
    }
    public set width(value: number) {
        this._impl.Set(this._ptr, "width", value);
        this.updated = 1;
    }

    /** 画布高度。 */
    public get height(): number {
        return this._impl.Get(this._ptr, "height");
    }
    public set height(value: number) {
        this._impl.Set(this._ptr, "height", value);
        this.updated = 1;
    }

    /** 近平面距离。 */
    public get nearZ(): number {
        return this._impl.Get(this._ptr, "nearZ");
    }
    public set nearZ(value: number) {
        this._impl.Set(this._ptr, "nearZ", value);
        this.updated = 1;
    }

    /** 远平面距离。 */
    public get farZ(): number {
        return this._impl.Get(this._ptr, "farZ");
    }
    public set farZ(value: number) {
        this._impl.Set(this._ptr, "farZ", value);
        this.updated = 1;
    }

    /** 相机组件内核实现。 */
    private _impl: Camera_kernel;
}

/** 相机组件（128字节）。 */
export class Camera_kernel {
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
    public async CreateCamera() {
        const ptr = this.InstanceCamera();
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Camera(this, ptr, id);

        this._instanceCount++;

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        return instance;
    }

    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    public Get<T>(self: Miaoverse.io_ptr, key: Camera_kernel["_members_key"]) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]) as T;
    }

    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    public Set(self: Miaoverse.io_ptr, key: Camera_kernel["_members_key"], value: any) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value as never);
    }

    /** 实例化相机组件实例。 */
    protected InstanceCamera: () => Miaoverse.io_ptr;

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;

    /** 实例容器列表。 */
    protected _instanceList: Camera[] = [null];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Camera> = {};
    /** 已分配实例数量。 */
    protected _instanceCount: number = 0;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC列表。 */
    protected _gcList: Camera[] = [];

    /** 内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Binary_member_index,

        type: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
        updated: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
        depth: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
        cullingFilter: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

        target: ["farrayGet", "farraySet", 3, 16] as Miaoverse.Kernel_member,
        distance: ["fscalarGet", "fscalarSet", 1, 19] as Miaoverse.Kernel_member,

        pitch: ["fscalarGet", "fscalarSet", 1, 20] as Miaoverse.Kernel_member,
        yaw: ["fscalarGet", "fscalarSet", 1, 21] as Miaoverse.Kernel_member,
        roll: ["fscalarGet", "fscalarSet", 1, 22] as Miaoverse.Kernel_member,
        fov: ["fscalarGet", "fscalarSet", 1, 23] as Miaoverse.Kernel_member,

        width: ["fscalarGet", "fscalarSet", 1, 24] as Miaoverse.Kernel_member,
        height: ["fscalarGet", "fscalarSet", 1, 25] as Miaoverse.Kernel_member,
        nearZ: ["fscalarGet", "fscalarSet", 1, 26] as Miaoverse.Kernel_member,
        farZ: ["fscalarGet", "fscalarSet", 1, 27] as Miaoverse.Kernel_member,

        enabled: ["uscalarGet", "uscalarSet", 1, 28] as Miaoverse.Kernel_member,
        object: ["ptrGet", "ptrSet", 1, 29] as Miaoverse.Kernel_member,
        lastSib: ["ptrGet", "ptrSet", 1, 30] as Miaoverse.Kernel_member,
        nextSib: ["ptrGet", "ptrSet", 1, 31] as Miaoverse.Kernel_member,
    } as const;

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Camera_kernel["_members"];
}
