import * as Miaoverse from "../mod.js"

/** 相机组件实例。 */
export class Camera extends Miaoverse.Resource<Camera> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Camera_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /**
     * 重置相机基本状态。
     */
    public Reset(): void {
        this.target = [0.0, 0.0, 0.0];
        this.distance = 5.0;

        this.pitch = 45.0;
        this.yaw = 0.0;
        this.roll = 0.0;
        this.fov = 60.0 / 180.0 * Math.PI;

        this.width = this._global.width;
        this.height = this._global.height;
        this.nearZ = 0.1;
        this.farZ = 100.0;
    }

    /**
     * 设置相机姿态。
     * @param target 观察目标坐标（世界空间）。
     * @param distance 距观察目标距离。
     * @param pitch 相机俯角。
     * @param yaw 相机偏航角。
     */
    public Set3D(target?: ArrayLike<number>, distance?: number, pitch?: number, yaw?: number) {
        if (target === undefined) {
            target = this.target;
        }
        else {
            this.target = target;
        }

        if (distance === undefined) {
            distance = this.distance;
        }
        else {
            this.distance = distance;
            // TODO: this.nearZ = Math.max(parseFloat((distance * 0.001).toFixed(3)), 0.001);
        }

        if (pitch === undefined) {
            pitch = this.pitch;
        }
        else {
            this.pitch = pitch;
        }

        if (yaw === undefined) {
            yaw = this.yaw;
        }
        else {
            this.yaw = yaw;
        }
    }

    /**
     * 使相机姿态适应观察内容范围。
     * @param bounding 观察内容范围。
     */
    public Fit(bounding: { center: Miaoverse.Vector3; radius: number; }, pitch?: number, yaw?: number): void {
        const aspect = this.width / this.height;
        const size = 1 < aspect ? bounding.radius : bounding.radius / aspect;
        const distance = size / Math.tan(0.5 * this.fov);

        this.Set3D(bounding.center.values, distance, pitch || 0, yaw || 0);
    }

    /**
     * 相机平移控制方法。
     * @param offsetX 光标横向平移像素数。
     * @param offsetY 光标纵向平移像素数。
     * @param width 事件源元素宽度。
     * @param height 事件源元素高度。
     */
    public Move(offsetX: number, offsetY: number, width: number, height: number): void {
        if (isNaN(offsetX) || isNaN(offsetY)) {
            return;
        }

        // 计算当前状态下每像素表示多少米
        const viewHeight = Math.tan(0.5 * this.fov) * this.distance;
        const viewResolution = height * 0.5;
        const dis_per_pixel = viewHeight / viewResolution;

        // 换算当前光标偏移量对应距离偏移量
        offsetX *= dis_per_pixel;
        offsetY *= dis_per_pixel;

        const target = this.target;
        let x = target[0];
        let z = target[2];

        // 换算移动始终相对相机前向量和右向量
        const yaw = this.yaw / 180.0 * Math.PI;
        x -= offsetX * Math.cos(yaw);
        z += offsetX * Math.sin(yaw);
        z -= offsetY * Math.cos(yaw);
        x -= offsetY * Math.sin(yaw);

        // 设置新的观察目标坐标
        target[0] = x;
        target[2] = z;

        this.Set3D(target);
    }

    /**
     * 相机旋转控制方法。
     * @param offsetX 光标横向平移像素数。
     * @param offsetY 光标纵向平移像素数。
     * @param width 事件源元素宽度。
     * @param height 事件源元素高度。
     */
    public Rotate(offsetX: number, offsetY: number, width: number, height: number): void {
        if (isNaN(offsetX) || isNaN(offsetY)) {
            return;
        }

        let pitch = this.pitch;
        let yaw = this.yaw;

        yaw += offsetX / width * 180;
        pitch -= offsetY / height * 90.0;

        if (90.0 < pitch) {
            pitch = 90.0;
        }

        if (0.0 > pitch) {
            pitch = 0.0;
        }

        this.Set3D(undefined, undefined, pitch, yaw);
    }

    /**
     * 相机推拉控制方法。
     * @param delta 滚轮方向。
     * @param width 事件源元素宽度。
     * @param height 事件源元素高度。
     */
    public Scale(delta: number, width: number, height: number): void {
        if (isNaN(delta)) {
            return;
        }

        delta = delta / Math.abs(delta);

        const aspect = this.width / this.height;
        const field = 1.0 < aspect ? 6378137.0 : 6378137.0 / aspect;
        const distance_max = field / Math.tan(this.fov * 0.5);

        let distance = this.distance - delta * this.distance * 0.1;

        if (distance < 0.1) {
            distance = 0.1;
        }
        else if (distance > distance_max) {
            distance = distance_max;
        }

        this.Set3D(undefined, distance);
    }

    /** 相机参数更新时间戳（计算各个变换矩阵的时间戳）。 */
    public get writeTS(): number {
        return this._impl.Get(this._ptr, "writeTS");
    }
    public set writeTS(value: number) {
        this._impl.Set(this._ptr, "writeTS", value);
    }

    /** 相机参数应用时间戳（传递到GPU的时间戳）。 */
    public get readTS(): number {
        return this._impl.Get(this._ptr, "readTS");
    }
    public set readTS(value: number) {
        this._impl.Set(this._ptr, "readTS", value);
    }

    /** 相机类型（0-透视投影相机、1-正交投影相机）。 */
    public get type(): number {
        return this._impl.Get(this._ptr, "type");
    }

    /** 相机参数是否有更新。 */
    public get updated(): boolean {
        return this._impl.Get<number>(this._ptr, "updated") > 0;
    }
    public set updated(value: boolean) {
        this._impl.Set(this._ptr, "updated", value ? 1 : 0);
    }

    /** 相机渲染排序（数值越高越优先渲染，最大值视为主相机）。 */
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

    /** 观察目标世界空间坐标（用于脱离变换组件控制相机姿态）。 */
    public get target(): Float32Array {
        return this._impl.Get(this._ptr, "target");
    }
    public set target(value: ArrayLike<number>) {
        this._impl.Set(this._ptr, "target", value);
        this.updated = true;
    }

    /** 相机距观察目标距离（用于脱离变换组件控制相机姿态）。 */
    public get distance(): number {
        return this._impl.Get(this._ptr, "distance");
    }
    public set distance(value: number) {
        this._impl.Set(this._ptr, "distance", value);
        this.updated = true;
    }

    /** 相机俯角（角度，用于脱离变换组件控制相机姿态）。 */
    public get pitch(): number {
        return this._impl.Get(this._ptr, "pitch");
    }
    public set pitch(value: number) {
        this._impl.Set(this._ptr, "pitch", value);
        this.updated = true;
    }

    /** 相机偏航角（角度，用于脱离变换组件控制相机姿态）。 */
    public get yaw(): number {
        return this._impl.Get(this._ptr, "yaw");
    }
    public set yaw(value: number) {
        this._impl.Set(this._ptr, "yaw", value);
        this.updated = true;
    }

    /** 相机翻滚角（角度，用于脱离变换组件控制相机姿态）。 */
    public get roll(): number {
        return this._impl.Get(this._ptr, "roll");
    }
    public set roll(value: number) {
        this._impl.Set(this._ptr, "roll", value);
        this.updated = true;
    }

    /** 垂直视角（弧度，用于计算相机投影矩阵）。 */
    public get fov(): number {
        return this._impl.Get(this._ptr, "fov");
    }
    public set fov(value: number) {
        this._impl.Set(this._ptr, "fov", value);
        this.updated = true;
    }

    /** 画布宽度（用于计算相机投影矩阵）。 */
    public get width(): number {
        return this._impl.Get(this._ptr, "width");
    }
    public set width(value: number) {
        this._impl.Set(this._ptr, "width", value);
        this.updated = true;
    }

    /** 画布高度（用于计算相机投影矩阵）。 */
    public get height(): number {
        return this._impl.Get(this._ptr, "height");
    }
    public set height(value: number) {
        this._impl.Set(this._ptr, "height", value);
        this.updated = true;
    }

    /** 近平面距离（用于计算相机投影矩阵）。 */
    public get nearZ(): number {
        return this._impl.Get(this._ptr, "nearZ");
    }
    public set nearZ(value: number) {
        this._impl.Set(this._ptr, "nearZ", value);
        this.updated = true;
    }

    /** 远平面距离（用于计算相机投影矩阵）。 */
    public get farZ(): number {
        return this._impl.Get(this._ptr, "farZ");
    }
    public set farZ(value: number) {
        this._impl.Set(this._ptr, "farZ", value);
        this.updated = true;
    }

    /** 是否启用组件。 */
    public get enabled(): boolean {
        return (this._impl.Get<number>(this._ptr, "flags") & 1) == 0;
    }
    public set enabled(value: boolean) {
        let flags = this._impl.Get<number>(this._ptr, "flags");
        if (value) {
            flags &= ~1;
        }
        else {
            flags |= 1;
        }

        this._impl.Set(this._ptr, "flags", flags);
        this.updated = true;
    }

    /** 是否由所依附对象变换组件控制相机姿态。 */
    public get transformCtrl(): boolean {
        return (this._impl.Get<number>(this._ptr, "flags") & 2) == 2;
    }
    public set transformCtrl(value: boolean) {
        let flags = this._impl.Get<number>(this._ptr, "flags");
        if (value) {
            flags |= 2;
        }
        else {
            flags &= ~2;
        }

        this._impl.Set(this._ptr, "flags", flags);
        this.updated = true;
    }

    /** 内核实现。 */
    private _impl: Camera_kernel;
}

/** 相机组件内核实现。 */
export class Camera_kernel extends Miaoverse.Base_kernel<Camera, typeof Camera_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Camera_member_index);
    }

    /**
     * 创建相机组件实例。
     * @returns 返回相机组件实例。
     */
    public async Create(object3d: Miaoverse.Object3D) {
        const ptr = this._Create(object3d.internalPtr);
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Camera(this, ptr, id);

        this._instanceCount++;

        return instance;
    }

    /**
     * 创建相机组件内核实例。
     * @param object3d 3D对象内核实例指针（相机组件唯一属于某个3D对象并跟随3D对象被销毁）。
     * @returns 返回相机组件内核实例指针。
     */
    protected _Create: (object3d: Miaoverse.io_ptr) => Miaoverse.io_ptr;

    /**
     * 确认相机空间包围球在视锥中的显示大小。
     * @param checker 检测器参数对象。
     * @returns 返回包围球显示大小（直径像素大小，0表示不可见）。
     */
    protected _Frustum_Check: (checker: Miaoverse.io_ptr) => Miaoverse.io_uint;
}

/** 相机组件内核实现的数据结构成员列表。 */
export const Camera_member_index = {
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

    flags: ["uscalarGet", "uscalarSet", 1, 28] as Miaoverse.Kernel_member,
    object: ["ptrGet", "ptrSet", 1, 29] as Miaoverse.Kernel_member,
    lastSib: ["ptrGet", "ptrSet", 1, 30] as Miaoverse.Kernel_member,
    nextSib: ["ptrGet", "ptrSet", 1, 31] as Miaoverse.Kernel_member,
} as const;
