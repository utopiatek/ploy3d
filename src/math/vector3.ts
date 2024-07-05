import * as Miaoverse from "../mod.js"

/** 三维向量。 */
export class Vector3 {
    /**
     * 构造函数。
     * @param values 向量值（实例将维持该引用）。
     */
    constructor(impl: Miaoverse.VMath_kernel, values: ArrayLike<number>) {
        this._impl = impl;
        this._values = values as any;
    }

    /**
     * 向量乘标量（向量长度缩放）。
     * @param s 缩放值。
     */
    public MultiplyScalar(s: number): Vector3 {
        return new Vector3(this._impl, [this.x * s, this.y * s, this.z * s]);
    }

    /**
     * 向量乘向量。
     * @param v 乘数向量。
     */
    public Multiply(v: Vector3): Vector3 {
        return new Vector3(this._impl, [this.x * v.x, this.y * v.y, this.z * v.z]);
    }

    /**
     * 向量相加。
     * @param v 加数向量。
     */
    public AddVector3(v: Vector3): Vector3 {
        return new Vector3(this._impl, [this.x + v.x, this.y + v.y, this.z + v.z]);
    }

    /**
     * 向量相减。
     * @param v 减数向量。
     */
    public SubVector3(v: Vector3): Vector3 {
        return new Vector3(this._impl, [this.x - v.x, this.y - v.y, this.z - v.z]);
    }

    /**
     * 两向量叉乘。
     * @param v 目标向量。
     */
    public Cross(v: Vector3): Vector3 {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;

        return new Vector3(this._impl, [x, y, z]);
    }

    /**
     * 向量点积。
     * @param v 点积向量。
     */
    public Dot(v: Vector3): number {
        return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
    }

    /**
     * 当前点到目标点距离。
     * @param v 目标点坐标。
     */
    public DistanceTo(v: Vector3): number {
        return (this.SubVector3(v)).length;
    }

    /**
     * 当前向量与目标向量夹角（弧度）。
     * @param v 目标向量。
     */
    public AngleTo(v: Vector3): number {
        // 顺时针为正值
        let cos = this.Dot(v) / (this.length * v.length);
        if (cos < -1) {
            cos = -1;
        }

        if (cos > 1) {
            cos = 1;
        }

        return Math.acos(cos);
    }

    /** 单位化向量。 */
    public Normalize(): void {
        const s = 1.0 / this.length;

        this.x *= s;
        this.y *= s;
        this.z *= s;
    }

    /**
     * 欧拉角转四元数。
     * @param order 内旋顺序，默认102-[Y-X-Z]
     * @returns 返回四元数。
     */
    public toQuaternion(order: number = 102): Miaoverse.Quaternion {
        const quat = this._impl.Quaternion_FromEulerAngles(this.x, this.y, this.z, order);
        return new Miaoverse.Quaternion(this._impl, quat);
    }

    /** 向量长度。 */
    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /** 向量X通道值。 */
    public get x() {
        return this._values[0];
    }
    public set x(x: number) {
        this._values[0] = x;
    }

    /** 向量Y通道值。 */
    public get y() {
        return this._values[1];
    }
    public set y(y: number) {
        this._values[1] = y;
    }

    /** 向量Z通道值。 */
    public get z() {
        return this._values[2];
    }
    public set z(z: number) {
        this._values[2] = z;
    }

    /** 向量值。 */
    public get values() {
        return this._values;
    }

    /** 矢量数学方法内核实现。 */
    private _impl: Miaoverse.VMath_kernel;
    /** 向量值。 */
    private _values: Array<number>;
}
