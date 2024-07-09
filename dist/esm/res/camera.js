import * as Miaoverse from "../mod.js";
export class Camera extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    get writeTS() {
        return this._impl.Get(this._ptr, "writeTS");
    }
    set writeTS(value) {
        this._impl.Set(this._ptr, "writeTS", value);
    }
    get readTS() {
        return this._impl.Get(this._ptr, "readTS");
    }
    set readTS(value) {
        this._impl.Set(this._ptr, "readTS", value);
    }
    get type() {
        return this._impl.Get(this._ptr, "type");
    }
    get updated() {
        return this._impl.Get(this._ptr, "updated") > 0;
    }
    set updated(value) {
        this._impl.Set(this._ptr, "updated", value ? 1 : 0);
    }
    get depth() {
        return this._impl.Get(this._ptr, "depth");
    }
    set depth(value) {
        this._impl.Set(this._ptr, "depth", value);
    }
    get cullingFilter() {
        return this._impl.Get(this._ptr, "cullingFilter");
    }
    set cullingFilter(value) {
        this._impl.Set(this._ptr, "cullingFilter", value);
    }
    get target() {
        return this._impl.Get(this._ptr, "target");
    }
    set target(value) {
        this._impl.Set(this._ptr, "target", value);
        this.updated = true;
    }
    get distance() {
        return this._impl.Get(this._ptr, "distance");
    }
    set distance(value) {
        this._impl.Set(this._ptr, "distance", value);
        this.updated = true;
    }
    get pitch() {
        return this._impl.Get(this._ptr, "pitch");
    }
    set pitch(value) {
        this._impl.Set(this._ptr, "pitch", value);
        this.updated = true;
    }
    get yaw() {
        return this._impl.Get(this._ptr, "yaw");
    }
    set yaw(value) {
        this._impl.Set(this._ptr, "yaw", value);
        this.updated = true;
    }
    get roll() {
        return this._impl.Get(this._ptr, "roll");
    }
    set roll(value) {
        this._impl.Set(this._ptr, "roll", value);
        this.updated = true;
    }
    get fov() {
        return this._impl.Get(this._ptr, "fov");
    }
    set fov(value) {
        this._impl.Set(this._ptr, "fov", value);
        this.updated = true;
    }
    get width() {
        return this._impl.Get(this._ptr, "width");
    }
    set width(value) {
        this._impl.Set(this._ptr, "width", value);
        this.updated = true;
    }
    get height() {
        return this._impl.Get(this._ptr, "height");
    }
    set height(value) {
        this._impl.Set(this._ptr, "height", value);
        this.updated = true;
    }
    get nearZ() {
        return this._impl.Get(this._ptr, "nearZ");
    }
    set nearZ(value) {
        this._impl.Set(this._ptr, "nearZ", value);
        this.updated = true;
    }
    get farZ() {
        return this._impl.Get(this._ptr, "farZ");
    }
    set farZ(value) {
        this._impl.Set(this._ptr, "farZ", value);
        this.updated = true;
    }
    get enabled() {
        return (this._impl.Get(this._ptr, "flags") & 1) == 0;
    }
    set enabled(value) {
        let flags = this._impl.Get(this._ptr, "flags");
        if (value) {
            flags &= ~1;
        }
        else {
            flags |= 1;
        }
        this._impl.Set(this._ptr, "flags", flags);
        this.updated = true;
    }
    get transformCtrl() {
        return (this._impl.Get(this._ptr, "flags") & 2) == 2;
    }
    set transformCtrl(value) {
        let flags = this._impl.Get(this._ptr, "flags");
        if (value) {
            flags |= 2;
        }
        else {
            flags &= ~2;
        }
        this._impl.Set(this._ptr, "flags", flags);
        this.updated = true;
    }
    _impl;
}
export class Camera_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Camera_member_index);
    }
    async Create(object3d) {
        const ptr = this._Create(object3d.internalPtr);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Camera(this, ptr, id);
        this._instanceCount++;
        return instance;
    }
    _Create;
}
export const Camera_member_index = {
    ...Miaoverse.Binary_member_index,
    type: ["uscalarGet", "uscalarSet", 1, 12],
    updated: ["uscalarGet", "uscalarSet", 1, 13],
    depth: ["uscalarGet", "uscalarSet", 1, 14],
    cullingFilter: ["uscalarGet", "uscalarSet", 1, 15],
    target: ["farrayGet", "farraySet", 3, 16],
    distance: ["fscalarGet", "fscalarSet", 1, 19],
    pitch: ["fscalarGet", "fscalarSet", 1, 20],
    yaw: ["fscalarGet", "fscalarSet", 1, 21],
    roll: ["fscalarGet", "fscalarSet", 1, 22],
    fov: ["fscalarGet", "fscalarSet", 1, 23],
    width: ["fscalarGet", "fscalarSet", 1, 24],
    height: ["fscalarGet", "fscalarSet", 1, 25],
    nearZ: ["fscalarGet", "fscalarSet", 1, 26],
    farZ: ["fscalarGet", "fscalarSet", 1, 27],
    flags: ["uscalarGet", "uscalarSet", 1, 28],
    object: ["ptrGet", "ptrSet", 1, 29],
    lastSib: ["ptrGet", "ptrSet", 1, 30],
    nextSib: ["ptrGet", "ptrSet", 1, 31],
};
//# sourceMappingURL=camera.js.map