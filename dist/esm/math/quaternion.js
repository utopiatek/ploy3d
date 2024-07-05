import * as Miaoverse from "../mod.js";
export class Quaternion {
    constructor(impl, values) {
        this._impl = impl;
        this._values = values;
    }
    RotateVector(v) {
        const vec = this._impl.Quaternion_RotateVector(this.x, this.y, this.z, this.w, v.x, v.y, v.z);
        return new Miaoverse.Vector3(this._impl, vec);
    }
    Multiply(q1) {
        const quat = this._impl.Quaternion_Multiply(this.x, this.y, this.z, this.w, q1.x, q1.y, q1.z, q1.w);
        return new Quaternion(this._impl, quat);
    }
    get eulerAngles() {
        const vec = this._impl.Quaternion_ToEulerAngles(this.x, this.y, this.z, this.w);
        return new Miaoverse.Vector3(this._impl, vec);
    }
    set eulerAngles(value) {
        this._values = this._impl.Quaternion_FromEulerAngles(value.x, value.y, value.z, 102);
    }
    get inverse() {
        const quat = this._impl.Quaternion_Invert(this.x, this.y, this.z, this.w);
        return new Quaternion(this._impl, quat);
    }
    get x() {
        return this._values[0];
    }
    set x(x) {
        this._values[0] = x;
    }
    get y() {
        return this._values[1];
    }
    set y(y) {
        this._values[1] = y;
    }
    get z() {
        return this._values[2];
    }
    set z(z) {
        this._values[2] = z;
    }
    get w() {
        return this._values[3];
    }
    set w(w) {
        this._values[3] = w;
    }
    get values() {
        return this._values;
    }
    _impl;
    _values;
}
//# sourceMappingURL=quaternion.js.map