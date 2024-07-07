import * as Miaoverse from "../mod.js";
export class Camera extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
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
    get enabled() {
        return this._impl.Get(this._ptr, "enabled") > 0;
    }
    set enabled(b) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }
    get type() {
        return this._impl.Get(this._ptr, "type");
    }
    get updated() {
        return this._impl.Get(this._ptr, "updated");
    }
    set updated(value) {
        this._impl.Set(this._ptr, "updated", value);
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
        this.updated = 1;
    }
    get distance() {
        return this._impl.Get(this._ptr, "distance");
    }
    set distance(value) {
        this._impl.Set(this._ptr, "distance", value);
        this.updated = 1;
    }
    get pitch() {
        return this._impl.Get(this._ptr, "pitch");
    }
    set pitch(value) {
        this._impl.Set(this._ptr, "pitch", value);
        this.updated = 1;
    }
    get yaw() {
        return this._impl.Get(this._ptr, "yaw");
    }
    set yaw(value) {
        this._impl.Set(this._ptr, "yaw", value);
        this.updated = 1;
    }
    get roll() {
        return this._impl.Get(this._ptr, "roll");
    }
    set roll(value) {
        this._impl.Set(this._ptr, "roll", value);
        this.updated = 1;
    }
    get fov() {
        return this._impl.Get(this._ptr, "fov");
    }
    set fov(value) {
        this._impl.Set(this._ptr, "fov", value);
        this.updated = 1;
    }
    get width() {
        return this._impl.Get(this._ptr, "width");
    }
    set width(value) {
        this._impl.Set(this._ptr, "width", value);
        this.updated = 1;
    }
    get height() {
        return this._impl.Get(this._ptr, "height");
    }
    set height(value) {
        this._impl.Set(this._ptr, "height", value);
        this.updated = 1;
    }
    get nearZ() {
        return this._impl.Get(this._ptr, "nearZ");
    }
    set nearZ(value) {
        this._impl.Set(this._ptr, "nearZ", value);
        this.updated = 1;
    }
    get farZ() {
        return this._impl.Get(this._ptr, "farZ");
    }
    set farZ(value) {
        this._impl.Set(this._ptr, "farZ", value);
        this.updated = 1;
    }
    _impl;
}
export class Camera_kernel {
    constructor(_global) {
        this._global = _global;
    }
    async CreateCamera() {
        const ptr = this.InstanceCamera();
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Camera(this, ptr, id);
        this._instanceCount++;
        this._gcList.push(instance);
        return instance;
    }
    Get(self, key) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]);
    }
    Set(self, key, value) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value);
    }
    InstanceCamera;
    _global;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
    _gcList = [];
    _members = {
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
        enabled: ["uscalarGet", "uscalarSet", 1, 28],
        object: ["ptrGet", "ptrSet", 1, 29],
        lastSib: ["ptrGet", "ptrSet", 1, 30],
        nextSib: ["ptrGet", "ptrSet", 1, 31],
    };
    _members_key;
}
//# sourceMappingURL=camera.js.map