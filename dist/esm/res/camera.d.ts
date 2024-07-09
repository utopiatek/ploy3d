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
