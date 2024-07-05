import * as Miaoverse from "../mod.js";
/** 三维向量。 */
export declare class Vector3 {
    /**
     * 构造函数。
     * @param values 向量值（实例将维持该引用）。
     */
    constructor(impl: Miaoverse.VMath_kernel, values: ArrayLike<number>);
    /**
     * 向量乘标量（向量长度缩放）。
     * @param s 缩放值。
     */
    MultiplyScalar(s: number): Vector3;
    /**
     * 向量乘向量。
     * @param v 乘数向量。
     */
    Multiply(v: Vector3): Vector3;
    /**
     * 向量相加。
     * @param v 加数向量。
     */
    AddVector3(v: Vector3): Vector3;
    /**
     * 向量相减。
     * @param v 减数向量。
     */
    SubVector3(v: Vector3): Vector3;
    /**
     * 两向量叉乘。
     * @param v 目标向量。
     */
    Cross(v: Vector3): Vector3;
    /**
     * 向量点积。
     * @param v 点积向量。
     */
    Dot(v: Vector3): number;
    /**
     * 当前点到目标点距离。
     * @param v 目标点坐标。
     */
    DistanceTo(v: Vector3): number;
    /**
     * 当前向量与目标向量夹角（弧度）。
     * @param v 目标向量。
     */
    AngleTo(v: Vector3): number;
    /** 单位化向量。 */
    Normalize(): void;
    /**
     * 欧拉角转四元数。
     * @param order 内旋顺序，默认102-[Y-X-Z]
     * @returns 返回四元数。
     */
    toQuaternion(order?: number): Miaoverse.Quaternion;
    /** 向量长度。 */
    get length(): number;
    /** 向量X通道值。 */
    get x(): number;
    set x(x: number);
    /** 向量Y通道值。 */
    get y(): number;
    set y(y: number);
    /** 向量Z通道值。 */
    get z(): number;
    set z(z: number);
    /** 向量值。 */
    get values(): number[];
    /** 矢量数学方法内核实现。 */
    private _impl;
    /** 向量值。 */
    private _values;
}
