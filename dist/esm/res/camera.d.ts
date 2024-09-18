import * as Miaoverse from "../mod.js";
/** 相机组件实例。 */
export declare class Camera extends Miaoverse.Resource<Camera> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Camera_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 重置相机基本状态。
     */
    Reset(): void;
    /**
     * 设置相机姿态。
     * @param target 观察目标坐标（世界空间）。
     * @param distance 距观察目标距离。
     * @param pitch 相机俯角。
     * @param yaw 相机偏航角。
     */
    Set3D(target?: ArrayLike<number>, distance?: number, pitch?: number, yaw?: number): void;
    /**
     * 使相机姿态适应观察内容范围。
     * @param bounding 观察内容范围。
     */
    Fit(bounding: {
        center: Miaoverse.Vector3;
        radius: number;
    }, pitch?: number, yaw?: number): void;
    /**
     * 相机平移控制方法。
     * @param offsetX 光标横向平移像素数。
     * @param offsetY 光标纵向平移像素数。
     * @param width 事件源元素宽度。
     * @param height 事件源元素高度。
     */
    Move(offsetX: number, offsetY: number, width: number, height: number): void;
    /**
     * 相机旋转控制方法。
     * @param offsetX 光标横向平移像素数。
     * @param offsetY 光标纵向平移像素数。
     * @param width 事件源元素宽度。
     * @param height 事件源元素高度。
     */
    Rotate(offsetX: number, offsetY: number, width: number, height: number): void;
    /**
     * 相机推拉控制方法。
     * @param delta 滚轮方向。
     * @param width 事件源元素宽度。
     * @param height 事件源元素高度。
     */
    Scale(delta: number, width: number, height: number): void;
    /**
     * 世界坐标转相机屏幕坐标。
     * @param wpos 世界坐标
     * @returns 返回屏幕坐标。
     */
    WorldToScreen(wpos: number[]): number[];
    /**
     * 屏幕空间坐标[0, 1]转世界空间射线。
     * @param x 屏幕空间坐标X[0,1]。
     * @param y 屏幕空间坐标Y[0,1]。
     * @returns 返回世界空间射线起点和方向。
     */
    ScreenPointToRay(x: number, y: number): {
        origin: Miaoverse.Vector3;
        dir: Miaoverse.Vector3;
    };
    /** 相机参数更新时间戳（计算各个变换矩阵的时间戳）。 */
    get writeTS(): number;
    set writeTS(value: number);
    /** 相机参数应用时间戳（传递到GPU的时间戳）。 */
    get readTS(): number;
    set readTS(value: number);
    /** 相机类型（0-透视投影相机、1-正交投影相机）。 */
    get type(): number;
    /** 相机参数是否有更新。 */
    get updated(): boolean;
    set updated(value: boolean);
    /** 相机渲染排序（数值越高越优先渲染，最大值视为主相机）。 */
    get depth(): number;
    set depth(value: number);
    /** 裁剪过滤，被标记的层不会被视锥裁剪。 */
    get cullingFilter(): number;
    set cullingFilter(value: number);
    /** 观察目标世界空间坐标（用于脱离变换组件控制相机姿态）。 */
    get target(): Float32Array;
    set target(value: ArrayLike<number>);
    /** 相机距观察目标距离（用于脱离变换组件控制相机姿态）。 */
    get distance(): number;
    set distance(value: number);
    /** 相机俯角（角度，用于脱离变换组件控制相机姿态）。 */
    get pitch(): number;
    set pitch(value: number);
    /** 相机偏航角（角度，用于脱离变换组件控制相机姿态）。 */
    get yaw(): number;
    set yaw(value: number);
    /** 相机翻滚角（角度，用于脱离变换组件控制相机姿态）。 */
    get roll(): number;
    set roll(value: number);
    /** 垂直视角（弧度，用于计算相机投影矩阵）。 */
    get fov(): number;
    set fov(value: number);
    /** 画布宽度（用于计算相机投影矩阵）。 */
    get width(): number;
    set width(value: number);
    /** 画布高度（用于计算相机投影矩阵）。 */
    get height(): number;
    set height(value: number);
    /** 近平面距离（用于计算相机投影矩阵）。 */
    get nearZ(): number;
    set nearZ(value: number);
    /** 远平面距离（用于计算相机投影矩阵）。 */
    get farZ(): number;
    set farZ(value: number);
    /** 是否启用组件。 */
    get enabled(): boolean;
    set enabled(value: boolean);
    /** 是否由所依附对象变换组件控制相机姿态。 */
    get transformCtrl(): boolean;
    set transformCtrl(value: boolean);
    /** 世界空间坐标。 */
    get wposition(): Miaoverse.Vector3;
    /** 世界空间观察向量。 */
    get wdirection(): Miaoverse.Vector3;
    /** 内核实现。 */
    private _impl;
}
/** 相机组件内核实现。 */
export declare class Camera_kernel extends Miaoverse.Base_kernel<Camera, typeof Camera_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建相机组件实例。
     * @returns 返回相机组件实例。
     */
    Create(object3d: Miaoverse.Object3D): Promise<Miaoverse.Camera>;
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
    /** 世界空间坐标转相机屏幕空间坐标。 */
    protected _WorldToScreen: (camera: Miaoverse.io_ptr, x: number, y: number, z: number) => number[];
    /** 屏幕空间坐标[0, 1]转世界空间射线。 */
    protected _ScreenPointToRay: (camera: Miaoverse.io_ptr, x: number, y: number) => number[];
}
/** 相机组件内核实现的数据结构成员列表。 */
export declare const Camera_member_index: {
    readonly type: Miaoverse.Kernel_member;
    readonly updated: Miaoverse.Kernel_member;
    readonly depth: Miaoverse.Kernel_member;
    readonly cullingFilter: Miaoverse.Kernel_member;
    readonly target: Miaoverse.Kernel_member;
    readonly distance: Miaoverse.Kernel_member;
    readonly pitch: Miaoverse.Kernel_member;
    readonly yaw: Miaoverse.Kernel_member;
    readonly roll: Miaoverse.Kernel_member;
    readonly fov: Miaoverse.Kernel_member;
    readonly width: Miaoverse.Kernel_member;
    readonly height: Miaoverse.Kernel_member;
    readonly nearZ: Miaoverse.Kernel_member;
    readonly farZ: Miaoverse.Kernel_member;
    readonly flags: Miaoverse.Kernel_member;
    readonly object: Miaoverse.Kernel_member;
    readonly lastSib: Miaoverse.Kernel_member;
    readonly nextSib: Miaoverse.Kernel_member;
    readonly wPos: Miaoverse.Kernel_member;
    readonly wDir: Miaoverse.Kernel_member;
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
