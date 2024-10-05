import * as Miaoverse from "../mod.js";
/** 相机组件实例。 */
export declare class Light extends Miaoverse.Resource<Light> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Light_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 是否启用组件。 */
    get enabled(): boolean;
    set enabled(b: boolean);
    /** 组件所属对象。 */
    get object3d(): Miaoverse.Object3D;
    /** 光源类型。 */
    get type(): Asset_light["type"];
    set type(value: Asset_light["type"]);
    /** 光源所属通道（仅对应通道打开时光源起作用）。 */
    get channels(): number;
    set channels(n: number);
    /** 光源辐射半径（影响范围，单位米。在该距离之外，光源影响为0）。 */
    get radius(): number;
    set radius(value: number);
    /** 光源颜色（线性空间）。 */
    get color(): Float32Array;
    set color(value: number[]);
    /**
     * 光源强度（照度，单位lux）。
     * 对于方向光，它是以lux为单位的照度（太阳照度为100000lux）。
     * 对于点光源和聚光灯，它是以lumen为单位的发光功率。
     */
    get lux(): number;
    set lux(value: number);
    /**
     * 点光源和聚光灯在世界空间中坐标。
     * 太阳光：
     * X[SunAngularRadius]：太阳的角半径，太阳的实际半径与太阳到地球的距离的比值（单位为弧度，0.25°至20.0°之间，默认度数0.545°）。
     * Y[SunHaloSize]：太阳的光晕半径（太阳角半径的倍数，默认值10.0）。
     * Z[SunHaloFalloff]：太阳的光晕衰减（无量纲数值，用作指数，默认值80.0）。
     */
    get position(): Miaoverse.Vector3;
    /** 点光源和聚光灯的衰减因子。 */
    get falloff(): number;
    set falloff(value: number);
    /** 光源在世界空间中方向（等同全局空间方向，指向光源）。 */
    get direction(): Miaoverse.Vector3;
    /**
     * X[InnerAngle]：聚光灯的内部圆锥角度（弧度，在~0.00873到m_nOuterAngle范围之间）。
     * Y[OuterAngle]：聚光灯的外部圆锥角度（弧度，在m_nInnerAngle到0.5PI范围之间）。
     */
    get spotCone(): Float32Array;
    set spotCone(value: number[]);
    /** 聚光灯角度衰减参数（根据m_mSpotCone计算所得）。 */
    get spotScaleOffset(): Float32Array;
    set spotScaleOffset(value: number[]);
    /** 内核实现。 */
    private _impl;
}
/** 光源组件内核实现。 */
export declare class Light_kernel extends Miaoverse.Base_kernel<Light, typeof Light_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建光源组件实例。
     * @param asset 光源组件描述符。
     * @returns 异步返回光源组件实例。
     */
    Create(object3d: Miaoverse.Object3D, asset: Asset_light): Promise<Miaoverse.Light>;
    /**
     * 创建光源组件内核实例。
     * @param object3d 3D对象内核实例指针（光源组件唯一属于某个3D对象并跟随3D对象被销毁）。
     * @returns 返回光源组件内核实例指针。
     */
    protected _Create: (object3d: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /** 光源类型查找表。*/
    protected _typeLut: string[];
}
/** 光源组件内核实现的数据结构成员列表。 */
export declare const Light_member_index: {
    readonly enabled: Miaoverse.Kernel_member;
    readonly object: Miaoverse.Kernel_member;
    readonly lastSib: Miaoverse.Kernel_member;
    readonly nextSib: Miaoverse.Kernel_member;
    readonly flags: Miaoverse.Kernel_member;
    readonly radius: Miaoverse.Kernel_member;
    readonly reserved: Miaoverse.Kernel_member;
    readonly color: Miaoverse.Kernel_member;
    readonly lux: Miaoverse.Kernel_member;
    readonly position: Miaoverse.Kernel_member;
    readonly falloff: Miaoverse.Kernel_member;
    readonly direction: Miaoverse.Kernel_member;
    readonly extra: Miaoverse.Kernel_member;
    readonly spotCone: Miaoverse.Kernel_member;
    readonly spotScaleOffset: Miaoverse.Kernel_member;
    readonly magic: Miaoverse.Kernel_member;
    readonly version: Miaoverse.Kernel_member; /** 组件所属对象。 */
    readonly byteSize: Miaoverse.Kernel_member;
    readonly refCount: Miaoverse.Kernel_member;
    readonly id: Miaoverse.Kernel_member;
    readonly uuid: Miaoverse.Kernel_member;
    readonly writeTS: Miaoverse.Kernel_member;
    readonly readTS: Miaoverse.Kernel_member;
    readonly last: Miaoverse.Kernel_member;
    readonly next: Miaoverse.Kernel_member;
};
/** 光源组件资源。 */
export interface Asset_light extends Miaoverse.Asset {
    /** 是否启用。 */
    enabled: boolean;
    /** 光源组件类型。 */
    type: "sun" | "directional" | "point" | "focused_spot" | "spot";
    /** 光源所属通道集（仅对应通道打开时光源起作用）。 */
    channels?: number;
    /** 光源颜色（线性空间RGB）。 */
    color: number[];
    /**
     * 光源强度：
     * 对于方向光，它是以lux为单位的照度（太阳照度为100000lux）。
     * 对于点光源和聚光灯，它是以lumen为单位的发光功率。
     */
    intensity: number;
    /** 点光源和聚光灯的影响半径。 */
    radius?: number;
    /** 聚光灯的内部圆锥弧度（弧度，在~0.00873到outerAngle范围之间）。 */
    innerAngle?: number;
    /** 聚光灯的外部圆锥弧度（弧度，在innerAngle到0.5PI范围之间）。 */
    outerAngle?: number;
}
