import * as Miaoverse from "../mod.js";
export class Object3D extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    SetParent(parent, worldPositionStays) {
        const parentPtr = parent ? parent._ptr : this._global.env.ptrZero();
        this._impl["_SetParent"](this._ptr, parentPtr, worldPositionStays ? 1 : 0);
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
    SetLngLat(lng, lat, altitude) {
        const ll = this._global.gis.GCJ02_WGS84([lng, lat]);
        const mc = this._global.gis.LL2MC(ll);
        this._impl.Set(this._ptr, "gisTS", 0);
        this._impl.Set(this._ptr, "altitude", altitude);
        this._impl.Set(this._ptr, "worldLLMC", [ll[0], ll[1], mc[0], mc[1]]);
        this._impl["_Flush"](this._ptr, 1);
    }
    Destroy() {
        this._impl["_Destroy"](this.internalPtr);
    }
    get writeTS() {
        return this._impl.Get(this._ptr, "writeTS");
    }
    get readTS() {
        return this._impl.Get(this._ptr, "readTS");
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }
    get active() {
        return this._impl.Get(this._ptr, "enabled") > 0;
    }
    set active(b) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
        this._impl["_Flush"](this._ptr, 2);
    }
    get layers() {
        return this._impl.Get(this._ptr, "layers");
    }
    set layers(value) {
        this._impl.Set(this._ptr, "layers", value);
        this._impl["_Flush"](this._ptr, 2);
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
        this._impl["_Flush"](this._ptr, 2);
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
        this._impl["_Flush"](this._ptr, 2);
    }
    get localPosition() {
        const values = this._impl.Get(this._ptr, "localPosition");
        return this._global.Vector3(values);
    }
    set localPosition(value) {
        this._impl.Set(this._ptr, "localPosition", value.values);
        this._impl["_Flush"](this._ptr, 1);
    }
    get localScale() {
        const values = this._impl.Get(this._ptr, "localScale");
        return this._global.Vector3(values);
    }
    set localScale(value) {
        this._impl.Set(this._ptr, "localScale", value.values);
        this._impl["_Flush"](this._ptr, 1);
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
        this._impl["_Flush"](this._ptr, 1);
    }
    set localMatrix(value) {
        this._global.env.AllocaCall(64, (ptr) => {
            this._global.env.farraySet(ptr, 0, value.values);
            this._impl["_SetLocalMatrix"](this._ptr, ptr);
            this._impl["_Flush"](this._ptr, 1);
        });
    }
    get position() {
        return this._global.Vector3(this._impl["_GetPosition"](this._ptr));
    }
    set position(pos) {
        this._impl["_SetPosition"](this._ptr, pos.x, pos.y, pos.z);
    }
    get eulerAngles() {
        return this.rotation.eulerAngles;
    }
    set eulerAngles(v) {
        this.rotation = v.toQuaternion();
    }
    get rotation() {
        this._impl["_Flush"](this._ptr, 4);
        const values = this._impl.Get(this._ptr, "worldRotation");
        return this._global.Quaternion(values);
    }
    set rotation(q) {
        this._impl["_SetRotation"](this._ptr, q.x, q.y, q.z, q.w);
    }
    get wfmMat() {
        this._impl["_Flush"](this._ptr, 4);
        const values = this._impl.Get(this._ptr, "wfmMat");
        return this._global.Matrix4x4(values);
    }
    get mfwMat() {
        this._impl["_Flush"](this._ptr, 4);
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
    set meshRenderer(component) {
        this._impl["_SetMeshRenderer"](this._ptr, component?.internalPtr || 0);
    }
    get meshRenderer() {
        const id = this._impl["_GetMeshRenderer"](this._ptr);
        return this._global.resources.MeshRenderer.GetInstanceByID(id);
    }
    set animator(component) {
        this._impl["_SetAnimator"](this._ptr, component?.id || 0);
        if (component) {
            component["_refCount"]++;
        }
    }
    get prefab() {
        return this._prefab;
    }
    _impl;
    _name = "object3d";
    _prefab;
}
export class Object_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Object_member_index);
    }
    async Create(scene, name, prefab) {
        const ptr = this._Instance(scene.internalPtr, 0);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Object3D(this, ptr, id);
        if (name) {
            instance.name = name;
        }
        if (prefab) {
            instance["_prefab"] = prefab;
        }
        this._instanceCount++;
        return instance;
    }
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Object_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }
        instance["_impl"] = null;
        instance["_global"] = null;
        instance["_ptr"] = 0;
        instance["_id"] = this._instanceIdle;
        this._instanceIdle = id;
        this._instanceCount -= 1;
    }
    DisposeAll() {
        if (this._instanceCount != 0) {
            console.error("异常！存在未释放的3D对象实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
    }
    GetBounding(objects, traverse) {
        const min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
        const max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
        for (let obj of objects) {
            if (obj) {
                const aabb = this._GetAABB(obj.internalPtr, traverse ? 1 : 0);
                min[0] = min[0] < aabb[0] ? min[0] : aabb[0];
                min[1] = min[1] < aabb[1] ? min[1] : aabb[1];
                min[2] = min[2] < aabb[2] ? min[2] : aabb[2];
                max[0] = max[0] > aabb[3] ? max[0] : aabb[3];
                max[1] = max[1] > aabb[4] ? max[1] : aabb[4];
                max[2] = max[2] > aabb[5] ? max[2] : aabb[5];
            }
        }
        const center = [(min[0] + max[0]) * 0.5, (min[1] + max[1]) * 0.5, (min[2] + max[2]) * 0.5];
        const extents = [Math.max((max[0] - min[0]) * 0.5, 0.01), Math.max((max[1] - min[1]) * 0.5, 0.01), Math.max((max[2] - min[2]) * 0.5, 0.01)];
        const radius = Math.sqrt(extents[0] * extents[0] + extents[1] * extents[1] + extents[2] * extents[2]);
        return { center, extents, radius };
    }
    ;
    _Instance;
    _Destroy;
    _Flush;
    _GetAABB;
    _vfmMat;
    _SetLocalMatrix;
    _SetPosition;
    _SetRotation;
    _GetPosition;
    _SetParent;
    _SetMeshRenderer;
    _GetMeshRenderer;
    _SetAnimator;
    _Draw;
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
export const Object_member_index = {
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
    reserved2: ["uarrayGet", "uarraySet", 16, 80],
    wfmMat: ["farrayGet", "farraySet", 16, 96],
    mfwMat: ["farrayGet", "farraySet", 16, 112],
};
;
