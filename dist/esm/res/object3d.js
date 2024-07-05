import * as Miaoverse from "../mod.js";
export class Object3D extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }
    SetParent(parent, worldPositionStays) {
        const parentPtr = parent ? parent._ptr : this._global.env.ptrZero();
        this._impl.SetParent(this._ptr, parentPtr, worldPositionStays ? 1 : 0);
    }
    ForEachChild(proc) {
        let child = this.firstChild;
        let count = this.childCount;
        let index = 0;
        while (child && index < count) {
            proc(index, child);
            child = child.nextSib;
            index++;
        }
    }
    get id() {
        return this._impl.Get(this._ptr, "id");
    }
    get writeTS() {
        return this._impl.Get(this._ptr, "writeTS");
    }
    get readTS() {
        return this._impl.Get(this._ptr, "readTS");
    }
    get name() {
        return this._impl.Get(this._ptr, "name");
    }
    set name(name) {
        this._impl.Set(this._ptr, "name", name);
    }
    get active() {
        return this._impl.Get(this._ptr, "enabled") > 0;
    }
    set active(b) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
        this._impl.Flush(this._ptr, 2);
    }
    get layers() {
        return this._impl.Get(this._ptr, "layers");
    }
    set layers(value) {
        this._impl.Set(this._ptr, "layers", value);
        this._impl.Flush(this._ptr, 2);
    }
    get highlight() {
        const flags = this._impl.Get(this._ptr, "flags");
        return (flags & 1) == 1;
    }
    set highlight(b) {
        let flags = this._impl.Get(this._ptr, "flags");
        if (b) {
            flags = flags | 1;
        }
        else {
            flags = flags & ~1;
        }
        this._impl.Set(this._ptr, "flags", flags);
        this._impl.Flush(this._ptr, 2);
    }
    get staticWorld() {
        const flags = this._impl.Get(this._ptr, "flags");
        return (flags & 2) == 2;
    }
    set staticWorld(b) {
        let flags = this._impl.Get(this._ptr, "flags");
        if (b) {
            flags = flags | 2;
        }
        else {
            flags = flags & ~2;
        }
        this._impl.Set(this._ptr, "flags", flags);
        this._impl.Flush(this._ptr, 2);
    }
    get localPosition() {
        const values = this._impl.Get(this._ptr, "localPosition");
        return this._global.Vector3(values);
    }
    set localPosition(value) {
        this._impl.Set(this._ptr, "localPosition", value.values);
        this._impl.Flush(this._ptr, 1);
    }
    get localScale() {
        const values = this._impl.Get(this._ptr, "localScale");
        return this._global.Vector3(values);
    }
    set localScale(value) {
        this._impl.Set(this._ptr, "localScale", value.values);
        this._impl.Flush(this._ptr, 1);
    }
    get parent() {
        const ptr = this._impl.Get(this._ptr, "parent");
        return this._impl.GetInstanceByPtr(ptr);
    }
    get firstChild() {
        const ptr = this._impl.Get(this._ptr, "children");
        return this._impl.GetInstanceByPtr(ptr);
    }
    get localEulerAngles() {
        return this.localRotation.eulerAngles;
    }
    set localEulerAngles(v) {
        this.localRotation = v.toQuaternion();
    }
    get localRotation() {
        const values = this._impl.Get(this._ptr, "localRotation");
        return this._global.Quaternion(values);
    }
    set localRotation(value) {
        this._impl.Set(this._ptr, "localRotation", value.values);
        this._impl.Flush(this._ptr, 1);
    }
    get position() {
        return this.wfmMat.MultiplyVector3(1, this._global.Vector3([0, 0, 0]));
    }
    set position(pos) {
        this._impl.SetPosition(this._ptr, pos.x, pos.y, pos.z);
    }
    get eulerAngles() {
        return this.rotation.eulerAngles;
    }
    set eulerAngles(v) {
        this.rotation = v.toQuaternion();
    }
    get rotation() {
        this._impl.Flush(this._ptr, 4);
        const values = this._impl.Get(this._ptr, "worldRotation");
        return this._global.Quaternion(values);
    }
    set rotation(q) {
        this._impl.SetRotation(this._ptr, q.x, q.y, q.z, q.w);
    }
    get wfmMat() {
        this._impl.Flush(this._ptr, 4);
        const values = this._impl.Get(this._ptr, "wfmMat");
        return this._global.Matrix4x4(values);
    }
    get mfwMat() {
        this._impl.Flush(this._ptr, 4);
        const values = this._impl.Get(this._ptr, "mfwMat");
        return this._global.Matrix4x4(values);
    }
    get right() {
        return this.rotation.RotateVector(this._global.Vector3([1, 0, 0]));
    }
    get up() {
        return this.rotation.RotateVector(this._global.Vector3([0, 1, 0]));
    }
    get forward() {
        return this.rotation.RotateVector(this._global.Vector3([0, 0, 1]));
    }
    get parentTS() {
        return this._impl.Get(this._ptr, "parentTS");
    }
    get childCount() {
        return this._impl.Get(this._ptr, "childCount");
    }
    get lastSib() {
        const lastSib = this._impl.Get(this._ptr, "lastSib");
        return this._impl.GetInstanceByPtr(lastSib);
    }
    get nextSib() {
        const nextSib = this._impl.Get(this._ptr, "nextSib");
        return this._impl.GetInstanceByPtr(nextSib);
    }
    get root() {
        let root = this.parent;
        while (root) {
            const upper = root.parent;
            if (!upper) {
                break;
            }
            root = upper;
        }
        return root;
    }
    _impl;
}
export class Object_kernel {
    constructor(_global) {
        this._global = _global;
    }
    GetInstanceByPtr(ptr) {
        if (this._global.env.ptrValid(ptr)) {
            const id = this.Get(ptr, "id");
            return this.GetInstanceByID(id);
        }
        return null;
    }
    GetInstanceByID(id) {
        return this._instanceList[id];
    }
    Get(self, key) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]);
    }
    Set(self, key, value) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value);
    }
    Flush;
    UpdateTransform;
    Update;
    SetPosition;
    SetRotation;
    SetParent;
    _global;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
    _members = {
        ...Node_member_index,
        source: ["uscalarGet", "uscalarSet", 1, 64],
        instance: ["uscalarGet", "uscalarSet", 1, 65],
        parentTS: ["uscalarGet", "uscalarSet", 1, 66],
        gisTS: ["uscalarGet", "uscalarSet", 1, 67],
        childCount: ["uscalarGet", "uscalarSet", 1, 68],
        updated: ["uscalarGet", "uscalarSet", 1, 69],
        nextEdit: ["ptrGet", "ptrSet", 1, 70],
        nextDraw: ["ptrGet", "ptrSet", 1, 71],
        scene: ["ptrGet", "ptrSet", 1, 72],
        children: ["ptrGet", "ptrSet", 1, 73],
        lastSib: ["ptrGet", "ptrSet", 1, 74],
        nextSib: ["ptrGet", "ptrSet", 1, 75],
        worldRotation: ["farrayGet", "farraySet", 4, 76],
        reserved2: ["uarrayGet", "uarraySet", 4, 92],
        wfmMat: ["farrayGet", "farraySet", 16, 96],
        mfwMat: ["farrayGet", "farraySet", 16, 112],
    };
    _members_key;
}
export const Node_member_index = {
    ...Miaoverse.Binary_member_index,
    index: ["uscalarGet", "uscalarSet", 1, 12],
    enabled: ["uscalarGet", "uscalarSet", 1, 13],
    layers: ["uscalarGet", "uscalarSet", 1, 14],
    flags: ["uscalarGet", "uscalarSet", 1, 15],
    worldLLMC: ["farrayGet", "farraySet", 4, 16],
    localPosition: ["farrayGet", "farraySet", 3, 20],
    altitude: ["fscalarGet", "fscalarSet", 1, 23],
    localScale: ["farrayGet", "farraySet", 3, 24],
    parent: ["ptrGet", "ptrSet", 1, 27],
    localRotation: ["farrayGet", "farraySet", 4, 28],
    meshRenderer: ["ptrGet", "ptrSet", 1, 32],
    camera: ["ptrGet", "ptrSet", 1, 33],
    light: ["ptrGet", "ptrSet", 1, 34],
    animator: ["ptrGet", "ptrSet", 1, 35],
    prefab: ["uscalarGet", "uscalarSet", 1, 36],
    depth: ["uscalarGet", "uscalarSet", 1, 37],
    unused2: ["uscalarGet", "uscalarSet", 1, 38],
    unused3: ["uscalarGet", "uscalarSet", 1, 39],
    name: ["stringGet", "stringSet", 64, 40],
    reserved: ["uarrayGet", "uarraySet", 8, 56],
};
//# sourceMappingURL=object3d.js.map