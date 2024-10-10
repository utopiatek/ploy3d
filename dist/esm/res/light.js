import * as Miaoverse from "../mod.js";
export class Light extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    get enabled() {
        return this._impl.Get(this._ptr, "enabled") > 0;
    }
    set enabled(b) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }
    get object3d() {
        const ptr = this._impl.Get(this._ptr, "object");
        return this._global.resources.Object.GetInstanceByPtr(ptr);
    }
    get type() {
        const flags = this._impl.Get(this._ptr, "flags");
        const type = Math.round((flags & 0xFF) * 0.1);
        return this._impl["_typeLut"][type];
    }
    set type(value) {
        let flags = this._impl.Get(this._ptr, "flags");
        flags = (flags & 0xFFFFFF00) + (this._impl["_typeLut"].indexOf(value) * 10);
        this._impl.Set(this._ptr, "flags", flags);
    }
    get channels() {
        const flags = this._impl.Get(this._ptr, "flags");
        const channels = (flags >> 8) & 0xFF;
        return channels;
    }
    set channels(n) {
        let flags = this._impl.Get(this._ptr, "flags");
        flags = (flags & ~0xFF00) + (n << 8);
        this._impl.Set(this._ptr, "flags", flags);
    }
    get radius() {
        return this._impl.Get(this._ptr, "radius");
    }
    set radius(value) {
        this._impl.Set(this._ptr, "radius", value);
        const falloffSq = value * value;
        const falloff = falloffSq > 0.0 ? (1.0 / falloffSq) : 0.0;
        this.falloff = falloff;
    }
    get color() {
        return this._impl.Get(this._ptr, "color");
    }
    set color(value) {
        this._impl.Set(this._ptr, "color", value);
    }
    get lux() {
        return this._impl.Get(this._ptr, "lux");
    }
    set lux(value) {
        this._impl.Set(this._ptr, "lux", value);
    }
    get position() {
        return this._global.Vector3(this._impl.Get(this._ptr, "position"));
    }
    get falloff() {
        return this._impl.Get(this._ptr, "falloff");
    }
    set falloff(value) {
        this._impl.Set(this._ptr, "falloff", value);
    }
    get direction() {
        return this._global.Vector3(this._impl.Get(this._ptr, "direction"));
    }
    get spotCone() {
        return this._impl.Get(this._ptr, "spotCone");
    }
    set spotCone(value) {
        this._impl.Set(this._ptr, "spotCone", value);
    }
    get spotScaleOffset() {
        return this._impl.Get(this._ptr, "spotScaleOffset");
    }
    set spotScaleOffset(value) {
        this._impl.Set(this._ptr, "spotScaleOffset", value);
    }
    _impl;
}
export class Light_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Light_member_index);
    }
    async Create(object3d, asset) {
        const ptr = this._Create(object3d.internalPtr);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Light(this, ptr, id);
        this._instanceCount++;
        instance.enabled = asset.enabled;
        instance.type = asset.type;
        instance.channels = asset.channels || 1;
        instance.color = asset.color;
        if (asset.type == "sun" || asset.type == "directional") {
            instance.radius = asset.radius;
            instance.lux = asset.intensity;
        }
        else {
            instance.radius = asset.radius;
            if (asset.type == "point") {
                instance.lux = asset.intensity / Math.PI * 0.25;
            }
            else {
                const minRad = 0.5 * (Math.PI / 180.0);
                const maxRad = 0.5 * Math.PI;
                let innerClamped = Math.min(Math.max(Math.abs(asset.innerAngle), minRad), maxRad);
                let outerClamped = Math.min(Math.max(Math.abs(asset.outerAngle), minRad), maxRad);
                innerClamped = Math.min(innerClamped, outerClamped);
                const cosOuter = Math.cos(outerClamped);
                const cosInner = Math.cos(innerClamped);
                const cosOuterSquared = cosOuter * cosOuter;
                const scale = 1.0 / Math.max(1.0 / 1024.0, cosInner - cosOuter);
                const offset = -cosOuter * scale;
                instance.spotCone = [innerClamped, outerClamped];
                instance.spotScaleOffset = [scale, offset];
                if (asset.type == "focused_spot") {
                    instance.lux = asset.intensity / (2.0 * Math.PI * (1.0 - cosOuter));
                }
                else if (asset.type == "spot") {
                    instance.lux = asset.intensity / Math.PI;
                }
            }
        }
        return instance;
    }
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Light_kernel.Remove: 实例ID=" + id + "无效！", 3);
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
            console.error("异常！存在未释放的光源组件实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
    }
    _Create;
    _typeLut = ["undefined", "sun", "directional", "point", "focused_spot", "spot"];
}
export const Light_member_index = {
    ...Miaoverse.Binary_member_index,
    enabled: ["uscalarGet", "uscalarSet", 1, 12],
    object: ["ptrGet", "ptrSet", 1, 13],
    lastSib: ["ptrGet", "ptrSet", 1, 14],
    nextSib: ["ptrGet", "ptrSet", 1, 15],
    flags: ["uscalarGet", "uscalarSet", 1, 16],
    radius: ["fscalarGet", "fscalarSet", 1, 17],
    reserved: ["uarrayGet", "uarraySet", 2, 18],
    color: ["farrayGet", "farraySet", 3, 20],
    lux: ["fscalarGet", "fscalarSet", 1, 23],
    position: ["farrayGet", "farraySet", 3, 24],
    falloff: ["fscalarGet", "fscalarSet", 1, 27],
    direction: ["farrayGet", "farraySet", 3, 28],
    extra: ["fscalarGet", "fscalarSet", 1, 31],
    spotCone: ["farrayGet", "farraySet", 2, 32],
    spotScaleOffset: ["farrayGet", "farraySet", 2, 34],
};
