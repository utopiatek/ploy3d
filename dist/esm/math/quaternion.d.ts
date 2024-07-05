import * as Miaoverse from "../mod.js";
/** 四元数。 */
export declare class Quaternion {
    /**
     * 构造函数。
     * @param values 四元数值（实例将维持该引用）。
     */
    constructor(impl: Miaoverse.VMath_kernel, values: ArrayLike<number>);
    /** 使用四元数旋转向量。 */
    RotateVector(v: Miaoverse.Vector3): Miaoverse.Vector3;
    /**
     * 当前四元数乘以参数四元数（this * q = out）。
     * @param q 乘数四元数。
     */
    Multiply(q1: Quaternion): Quaternion;
    /** 转换为欧拉角表示（单位度）。 */
    get eulerAngles(): Miaoverse.Vector3;
    set eulerAngles(value: Miaoverse.Vector3);
    /** 四元数的逆。 */
    get inverse(): Quaternion;
    /** 四元数X通道值。 */
    get x(): number;
    set x(x: number);
    /** 四元数Y通道值。 */
    get y(): number;
    set y(y: number);
    /** 四元数Z通道值。 */
    get z(): number;
    set z(z: number);
    /** 四元数W通道值。 */
    get w(): number;
    set w(w: number);
    /** 四元数值。 */
    get values(): number[];
    /** 矢量数学方法内核实现。 */
    private _impl;
    /** 四元数值。 */
    private _values;
}
