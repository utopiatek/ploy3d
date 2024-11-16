import * as Miaoverse from "../mod.js";
export class Camera extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    Reset() {
        this.target = [0.0, 0.0, 0.0];
        this.distance = 5.0;
        this.pitch = 45.0;
        this.yaw = 0.0;
        this.roll = 0.0;
        this.fov = 60.0 / 180.0 * Math.PI;
        this.width = this._global.width;
        this.height = this._global.height;
        this.nearZ = 0.1;
        this.farZ = 100.0;
    }
    Set3D(target, distance, pitch, yaw) {
        if (target === undefined) {
            target = this.target;
        }
        else {
            this.target = target;
        }
        if (distance === undefined) {
            distance = this.distance;
        }
        else {
            this.distance = distance;
        }
        if (pitch === undefined) {
            pitch = this.pitch;
        }
        else {
            this.pitch = pitch;
        }
        if (yaw === undefined) {
            yaw = this.yaw;
        }
        else {
            this.yaw = yaw;
        }
    }
    Fit(bounding, pitch, yaw) {
        const radius = bounding.radius || Math.sqrt(bounding.extents[0] * bounding.extents[0] + bounding.extents[1] * bounding.extents[1] + bounding.extents[2] * bounding.extents[2]);
        const aspect = this.width / this.height;
        const size = 1 < aspect ? radius : radius / aspect;
        const distance = size / Math.tan(0.5 * this.fov);
        this.nearZ = Math.max(distance * 0.1, 0.01);
        if (Math.min(bounding.extents[0], bounding.extents[2]) / bounding.extents[1] > 100 && pitch === undefined) {
            pitch = 90;
        }
        this.Set3D(bounding.center, distance, pitch || 0, yaw || 0);
    }
    Move(offsetX, offsetY, width, height) {
        if (isNaN(offsetX) || isNaN(offsetY)) {
            return;
        }
        const viewHeight = Math.tan(0.5 * this.fov) * this.distance;
        const viewResolution = height * 0.5;
        const dis_per_pixel = viewHeight / viewResolution;
        offsetX *= dis_per_pixel;
        offsetY *= dis_per_pixel;
        const target = this.target;
        let x = target[0];
        let z = target[2];
        const yaw = this.yaw / 180.0 * Math.PI;
        x -= offsetX * Math.cos(yaw);
        z += offsetX * Math.sin(yaw);
        z -= offsetY * Math.cos(yaw);
        x -= offsetY * Math.sin(yaw);
        target[0] = x;
        target[2] = z;
        this.Set3D(target);
    }
    Rotate(offsetX, offsetY, width, height) {
        if (isNaN(offsetX) || isNaN(offsetY)) {
            return;
        }
        let pitch = this.pitch;
        let yaw = this.yaw;
        yaw += offsetX / width * 180;
        pitch -= offsetY / height * 90.0;
        if (90.0 < pitch) {
            pitch = 90.0;
        }
        if (0.0 > pitch) {
            pitch = 0.0;
        }
        this.Set3D(undefined, undefined, pitch, yaw);
    }
    Scale(delta, width, height) {
        delta = delta / Math.abs(delta);
        if (isNaN(delta)) {
            return;
        }
        const aspect = this.width / this.height;
        const field = 1.0 < aspect ? 6378137.0 : 6378137.0 / aspect;
        const distance_max = field / Math.tan(this.fov * 0.5);
        let distance = this.distance - delta * this.distance * 0.1;
        if (distance < 0.1) {
            distance = 0.1;
        }
        else if (distance > distance_max) {
            distance = distance_max;
        }
        this.Set3D(undefined, distance);
    }
    WorldToScreen(wpos) {
        const cpos = this._impl["_WorldToScreen"](this._ptr, wpos[0], wpos[1], wpos[2]);
        return cpos;
    }
    ScreenPointToRay(x, y) {
        const ray = this._impl["_ScreenPointToRay"](this._ptr, x, y);
        return {
            origin: this._global.Vector3(ray.slice(0, 3)),
            dir: this._global.Vector3(ray.slice(3))
        };
    }
    HitHorizontal(x, y) {
        const ray = this.ScreenPointToRay(x, y);
        let distance = 10;
        if (0.01 < Math.abs(ray.dir.y)) {
            distance = -ray.origin.y / ray.dir.y;
            if (distance < 0) {
                distance = 10;
            }
            else if (distance > 1000) {
                distance = 1000;
            }
        }
        const dir = ray.dir.MultiplyScalar(distance);
        const pos = ray.origin.AddVector3(dir);
        return pos;
    }
    GetMatrix(key) {
        return this._global.Matrix4x4(this._impl.Get(this._ptr, key));
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
    get wposition() {
        return this._global.Vector3(this._impl.Get(this._ptr, "wPos"));
    }
    get wdirection() {
        return this._global.Vector3(this._impl.Get(this._ptr, "wDir"));
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
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Camera_kernel.Remove: 实例ID=" + id + "无效！", 3);
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
            console.error("异常！存在未释放的相机组件实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
    }
    _Create;
    _Frustum_Check;
    _WorldToScreen;
    _ScreenPointToRay;
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
    vfgMat: ["farrayGet", "farraySet", 16, 32],
    gfvMat: ["farrayGet", "farraySet", 16, 48],
    cfvMat: ["farrayGet", "farraySet", 16, 64],
    vfcMat: ["farrayGet", "farraySet", 16, 80],
    cfgMat: ["farrayGet", "farraySet", 16, 96],
    gfcMat: ["farrayGet", "farraySet", 16, 112],
    gfwMat: ["farrayGet", "farraySet", 16, 128],
    wfgMat: ["farrayGet", "farraySet", 16, 144],
    uvfvMat: ["farrayGet", "farraySet", 16, 160],
    last_uvfvMat: ["farrayGet", "farraySet", 16, 176],
    lastcfwMat: ["farrayGet", "farraySet", 16, 192],
    cullingMat: ["farrayGet", "farraySet", 16, 208],
    wPos: ["farrayGet", "farraySet", 3, 244],
    wDir: ["farrayGet", "farraySet", 3, 248],
};
