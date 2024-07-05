import * as Miaoverse from "../mod.js"

/** 四阶矩阵。 */
export class Matrix4x4 {
    /**
     * 构造函数。
     * @param values 矩阵值。
     */
    constructor(impl: Miaoverse.VMath_kernel, values: ArrayLike<number>) {
        this._impl = impl;
        this._values = values as any;
    }

    /**
     * 构建模型到世界变换矩阵。
     * @param pos 模型坐标。
     * @param rot 模型旋转四元数。
     * @param scale 模型缩放。
     * @returns 返回变换矩阵。
     */
    public Compose(pos: Miaoverse.Vector3, rot: Miaoverse.Quaternion, scale: Miaoverse.Vector3) {
        let mat: Matrix4x4 = null;
        let env = this._impl._global.env;

        env.AllocaCall(64, (ptr) => {
            this._impl.Matrix4x4_FromTransform(ptr,
                pos.x, pos.y, pos.z,
                rot.x, rot.y, rot.z, rot.w,
                scale.x, scale.y, scale.z
            );

            mat = new Miaoverse.Matrix4x4(this._impl, env.farrayGet(ptr, 0, 16));
        });

        return mat;
    }

    /**
     * 左乘矩阵。
     * @param m 乘数矩阵。
     * @returns 返回结果矩阵。
     */
    public Multiply(m: Matrix4x4): Matrix4x4 {
        let mat: Matrix4x4 = null;
        let env = this._impl._global.env;

        env.AllocaCall(128, (ptr) => {
            env.farraySet(ptr, 0, this._values);
            env.farraySet(ptr, 16, m._values);
            this._impl.Matrix4x4_MultiplyMatrices(ptr, env.ptrMove(ptr, 16), env.ptrMove(ptr, 16));
            mat = new Miaoverse.Matrix4x4(this._impl, env.farrayGet(ptr, 16, 16));
        });

        return mat;
    }

    /**
     * 矩阵变换向量。
     * @param homogeneous 向量齐次分量。
     * @param v 三维向量。
     */
    public MultiplyVector3(homogeneous: number, v: Miaoverse.Vector3): Miaoverse.Vector3 {
        let vec: Miaoverse.Vector3 = null;
        let env = this._impl._global.env;

        env.AllocaCall(80, (ptr) => {
            env.farraySet(ptr, 0, this._values);
            env.farraySet(ptr, 16, [v.x, v.y, v.z, homogeneous]);
            this._impl.Matrix4x4_MultiplyVector(ptr, env.ptrMove(ptr, 16), env.ptrMove(ptr, 16));
            vec = new Miaoverse.Vector3(this._impl, env.farrayGet(ptr, 16, 3));
        });

        return vec;
    }

    /** 矩阵的逆。 */
    public get inverse(): Matrix4x4 {
        let mat: Matrix4x4 = null;
        let env = this._impl._global.env;

        env.AllocaCall(64, (ptr) => {
            env.farraySet(ptr, 0, this._values);
            this._impl.Matrix4x4_Invert(ptr, ptr);
            mat = new Miaoverse.Matrix4x4(this._impl, env.farrayGet(ptr, 0, 16));
        });

        return mat;
    }

    /** 矩阵值。 */
    public get values() {
        return this._values;
    }

    /** 矢量数学方法内核实现。 */
    private _impl: Miaoverse.VMath_kernel;
    /** 矩阵值。 */
    private _values: Array<number>;
}
