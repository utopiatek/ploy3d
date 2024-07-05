import * as Miaoverse from "../mod.js"

/** 四元数。 */
export class Quaternion {
    /**
     * 构造函数。
     * @param values 四元数值（实例将维持该引用）。
     */
    constructor(impl: Miaoverse.VMath_kernel, values: ArrayLike<number>) {
        this._impl = impl;
        this._values = values as any;
    }

    /** 使用四元数旋转向量。 */
    public RotateVector(v: Miaoverse.Vector3): Miaoverse.Vector3 {
        const vec = this._impl.Quaternion_RotateVector(
            this.x, this.y, this.z, this.w,
            v.x, v.y, v.z
        );

        return new Miaoverse.Vector3(this._impl, vec);
    }

    /**
     * 当前四元数乘以参数四元数（this * q = out）。
     * @param q 乘数四元数。
     */
    public Multiply(q1: Quaternion): Quaternion {
        const quat = this._impl.Quaternion_Multiply(
            this.x, this.y, this.z, this.w,
            q1.x, q1.y, q1.z, q1.w
        );

        return new Quaternion(this._impl, quat);
    }

    /** 转换为欧拉角表示（单位度）。 */
    public get eulerAngles(): Miaoverse.Vector3 {
        const vec = this._impl.Quaternion_ToEulerAngles(this.x, this.y, this.z, this.w);
        return new Miaoverse.Vector3(this._impl, vec);
    }
    public set eulerAngles(value: Miaoverse.Vector3) {
        this._values = this._impl.Quaternion_FromEulerAngles(value.x, value.y, value.z, 102);
    }

    /** 四元数的逆。 */
    public get inverse(): Quaternion {
        const quat = this._impl.Quaternion_Invert(this.x, this.y, this.z, this.w);
        return new Quaternion(this._impl, quat);
    }

    /** 四元数X通道值。 */
    public get x() {
        return this._values[0];
    }
    public set x(x: number) {
        this._values[0] = x;
    }

    /** 四元数Y通道值。 */
    public get y() {
        return this._values[1];
    }
    public set y(y: number) {
        this._values[1] = y;
    }

    /** 四元数Z通道值。 */
    public get z() {
        return this._values[2];
    }
    public set z(z: number) {
        this._values[2] = z;
    }

    /** 四元数W通道值。 */
    public get w() {
        return this._values[3];
    }
    public set w(w: number) {
        this._values[3] = w;
    }

    /** 四元数值。 */
    public get values() {
        return this._values;
    }

    /** 矢量数学方法内核实现。 */
    private _impl: Miaoverse.VMath_kernel;
    /** 四元数值。 */
    private _values: Array<number>;
}
