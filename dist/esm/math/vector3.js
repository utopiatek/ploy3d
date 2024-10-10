import * as Miaoverse from "../mod.js";
export class Vector3 {
    constructor(impl, values) {
        this._impl = impl;
        this._values = values;
    }
    MultiplyScalar(s) {
        return new Vector3(this._impl, [this.x * s, this.y * s, this.z * s]);
    }
    Multiply(v) {
        return new Vector3(this._impl, [this.x * v.x, this.y * v.y, this.z * v.z]);
    }
    AddVector3(v) {
        return new Vector3(this._impl, [this.x + v.x, this.y + v.y, this.z + v.z]);
    }
    SubVector3(v) {
        return new Vector3(this._impl, [this.x - v.x, this.y - v.y, this.z - v.z]);
    }
    Cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vector3(this._impl, [x, y, z]);
    }
    Dot(v) {
        return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
    }
    DistanceTo(v) {
        return (this.SubVector3(v)).length;
    }
    AngleTo(v) {
        let cos = this.Dot(v) / (this.length * v.length);
        if (cos < -1) {
            cos = -1;
        }
        if (cos > 1) {
            cos = 1;
        }
        return Math.acos(cos);
    }
    Normalize() {
        const s = 1.0 / this.length;
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }
    toQuaternion(order = 102) {
        const quat = this._impl.Quaternion_FromEulerAngles(this.x, this.y, this.z, order);
        return new Miaoverse.Quaternion(this._impl, quat);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    get normalized() {
        const s = 1.0 / this.length;
        return new Vector3(this._impl, [this.x * s, this.y * s, this.z * s]);
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
    get values() {
        return this._values;
    }
    _impl;
    _values;
}
