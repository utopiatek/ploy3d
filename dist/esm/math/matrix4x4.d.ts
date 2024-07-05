import * as Miaoverse from "../mod.js";
/** 四阶矩阵。 */
export declare class Matrix4x4 {
    /**
     * 构造函数。
     * @param values 矩阵值。
     */
    constructor(impl: Miaoverse.VMath_kernel, values: ArrayLike<number>);
    /**
     * 构建模型到世界变换矩阵。
     * @param pos 模型坐标。
     * @param rot 模型旋转四元数。
     * @param scale 模型缩放。
     * @returns 返回变换矩阵。
     */
    Compose(pos: Miaoverse.Vector3, rot: Miaoverse.Quaternion, scale: Miaoverse.Vector3): Miaoverse.Matrix4x4;
    /**
     * 左乘矩阵。
     * @param m 乘数矩阵。
     * @returns 返回结果矩阵。
     */
    Multiply(m: Matrix4x4): Matrix4x4;
    /**
     * 矩阵变换向量。
     * @param homogeneous 向量齐次分量。
     * @param v 三维向量。
     */
    MultiplyVector3(homogeneous: number, v: Miaoverse.Vector3): Miaoverse.Vector3;
    /** 矩阵的逆。 */
    get inverse(): Matrix4x4;
    /** 矩阵值。 */
    get values(): number[];
    /** 矢量数学方法内核实现。 */
    private _impl;
    /** 矩阵值。 */
    private _values;
}
