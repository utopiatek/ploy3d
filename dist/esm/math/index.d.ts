import * as Miaoverse from "../mod.js";
/** 矢量数学方法内核实现。 */
export declare class VMath_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /** 使用四元数旋转向量。 */
    Quaternion_RotateVector: (qx: number, qy: number, qz: number, qw: number, vx: number, vy: number, vz: number) => number[];
    /** 当前四元数乘以参数四元数（q1 * q2 = qO）。 */
    Quaternion_Multiply: (x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number) => number[];
    /** 转换为欧拉角。 */
    Quaternion_ToEulerAngles: (x: number, y: number, z: number, w: number) => number[];
    /** 从欧拉角（内旋顺序，默认102-[Y-X-Z]）转换到四元数，正方向为看向旋转轴方向顺时针旋转。 */
    Quaternion_FromEulerAngles: (x: number, y: number, z: number, order: number) => number[];
    /** 计算四元数的逆。 */
    Quaternion_Invert: (x: number, y: number, z: number, w: number) => number[];
    /** 获取矩阵的逆矩阵。 */
    Matrix4x4_Invert: (m1: Miaoverse.io_ptr, mO: Miaoverse.io_ptr) => void;
    /** 向量左乘矩阵。 */
    Matrix4x4_MultiplyVector: (m1: Miaoverse.io_ptr, v1: Miaoverse.io_ptr, vO: Miaoverse.io_ptr) => void;
    /** 左乘矩阵。 */
    Matrix4x4_MultiplyMatrices: (m1: Miaoverse.io_ptr, m2: Miaoverse.io_ptr, mO: Miaoverse.io_ptr) => void;
    /** 根据变换数据计算模型矩阵。 */
    Matrix4x4_FromTransform: (mO: Miaoverse.io_ptr, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number, rotW: number, scaleX: number, scaleY: number, scaleZ: number) => void;
    /** 模块实例对象。 */
    _global: Miaoverse.Ploy3D;
}
