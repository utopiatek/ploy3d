import * as Miaoverse from "../mod.js"

/** 矢量数学方法内核实现。 */
export class VMath_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;

        this.Quaternion_RotateVector = _global.internal.Quaternion_RotateVector;
        this.Quaternion_Multiply = _global.internal.Quaternion_Multiply;
        this.Quaternion_ToEulerAngles = _global.internal.Quaternion_ToEulerAngles;
        this.Quaternion_FromEulerAngles = _global.internal.Quaternion_FromEulerAngles;
        this.Quaternion_Invert = _global.internal.Quaternion_Invert;

        this.Matrix4x4_Invert = _global.internal.Matrix4x4_Invert;
        this.Matrix4x4_MultiplyVector = _global.internal.Matrix4x4_MultiplyVector;
        this.Matrix4x4_MultiplyMatrices = _global.internal.Matrix4x4_MultiplyMatrices;
        this.Matrix4x4_FromTransform = _global.internal.Matrix4x4_FromTransform;
    }

    /** 使用四元数旋转向量。 */
    public Quaternion_RotateVector: (qx: number, qy: number, qz: number, qw: number, vx: number, vy: number, vz: number) => number[];
    /** 当前四元数乘以参数四元数（q1 * q2 = qO）。 */
    public Quaternion_Multiply: (x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number) => number[];
    /** 转换为欧拉角。 */
    public Quaternion_ToEulerAngles: (x: number, y: number, z: number, w: number) => number[];
    /** 从欧拉角（内旋顺序，默认102-[Y-X-Z]）转换到四元数，正方向为看向旋转轴方向顺时针旋转。 */
    public Quaternion_FromEulerAngles: (x: number, y: number, z: number, order: number) => number[];
    /** 从两个向量方向变换构造四元数。 */
    public Quaternion_FromVectors: (fromX: number, fromY: number, fromZ: number, toX: number, toY: number, toZ: number) => number[];
    /** 计算四元数的逆。 */
    public Quaternion_Invert: (x: number, y: number, z: number, w: number) => number[];
    /** 两四元数插值。。 */
    public Quaternion_Slerp: (x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number, t: number) => number[];

    /** 获取矩阵的逆矩阵。 */
    public Matrix4x4_Invert: (m1: Miaoverse.io_ptr, mO: Miaoverse.io_ptr) => void;
    /** 向量左乘矩阵。 */
    public Matrix4x4_MultiplyVector: (m1: Miaoverse.io_ptr, v1: Miaoverse.io_ptr, vO: Miaoverse.io_ptr) => void;
    /** 左乘矩阵。 */
    public Matrix4x4_MultiplyMatrices: (m1: Miaoverse.io_ptr, m2: Miaoverse.io_ptr, mO: Miaoverse.io_ptr) => void;
    /** 根据变换数据计算模型矩阵。 */
    public Matrix4x4_FromTransform: (mO: Miaoverse.io_ptr,
        posX: number, posY: number, posZ: number,
        rotX: number, rotY: number, rotZ: number, rotW: number,
        scaleX: number, scaleY: number, scaleZ: number) => void;

    /** 模块实例对象。 */
    public _global: Miaoverse.Ploy3D;
}
