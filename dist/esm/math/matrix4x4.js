import * as Miaoverse from "../mod.js";
export class Matrix4x4 {
    constructor(impl, values) {
        this._impl = impl;
        this._values = values;
    }
    Compose(pos, rot, scale) {
        let mat = null;
        let env = this._impl._global.env;
        env.AllocaCall(64, (ptr) => {
            this._impl.Matrix4x4_FromTransform(ptr, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, rot.w, scale.x, scale.y, scale.z);
            mat = new Miaoverse.Matrix4x4(this._impl, env.farrayGet(ptr, 0, 16));
        });
        return mat;
    }
    Multiply(m) {
        let mat = null;
        let env = this._impl._global.env;
        env.AllocaCall(128, (ptr) => {
            env.farraySet(ptr, 0, this._values);
            env.farraySet(ptr, 16, m._values);
            this._impl.Matrix4x4_MultiplyMatrices(ptr, env.ptrMove(ptr, 16), env.ptrMove(ptr, 16));
            mat = new Miaoverse.Matrix4x4(this._impl, env.farrayGet(ptr, 16, 16));
        });
        return mat;
    }
    MultiplyVector3(homogeneous, v) {
        let vec = null;
        let env = this._impl._global.env;
        env.AllocaCall(80, (ptr) => {
            env.farraySet(ptr, 0, this._values);
            env.farraySet(ptr, 16, [v.x, v.y, v.z, homogeneous]);
            this._impl.Matrix4x4_MultiplyVector(ptr, env.ptrMove(ptr, 16), env.ptrMove(ptr, 16));
            vec = new Miaoverse.Vector3(this._impl, env.farrayGet(ptr, 16, 3));
        });
        return vec;
    }
    get inverse() {
        let mat = null;
        let env = this._impl._global.env;
        env.AllocaCall(64, (ptr) => {
            env.farraySet(ptr, 0, this._values);
            this._impl.Matrix4x4_Invert(ptr, ptr);
            mat = new Miaoverse.Matrix4x4(this._impl, env.farrayGet(ptr, 0, 16));
        });
        return mat;
    }
    get values() {
        return this._values;
    }
    _impl;
    _values;
}
