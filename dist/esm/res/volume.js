import * as Miaoverse from "../mod.js";
export class Volume extends Miaoverse.Resource {
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
    get enabled() {
        return this._impl.Get(this._ptr, "enabled") > 0;
    }
    set enabled(b) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }
    get updated() {
        return this._impl.Get(this._ptr, "updated") > 0;
    }
    set updated(value) {
        this._impl.Set(this._ptr, "updated", value ? 1 : 0);
    }
    get iblPitch() {
        return this._impl.Get(this._ptr, "iblPitch");
    }
    set iblPitch(value) {
        this._impl.Set(this._ptr, "iblPitch", value);
        this.updated = true;
    }
    get iblYaw() {
        return this._impl.Get(this._ptr, "iblYaw");
    }
    set iblYaw(value) {
        this._impl.Set(this._ptr, "iblYaw", value);
        this.updated = true;
    }
    get iblRoll() {
        return this._impl.Get(this._ptr, "iblRoll");
    }
    set iblRoll(value) {
        this._impl.Set(this._ptr, "iblRoll", value);
        this.updated = true;
    }
    get iblSH() {
        return this._impl.Get(this._ptr, "iblSH");
    }
    set iblSH(value) {
        this._impl.Set(this._ptr, "iblSH", value);
        this.updated = true;
    }
    get fogColor() {
        return this._impl.Get(this._ptr, "fogColor");
    }
    set fogColor(value) {
        this._impl.Set(this._ptr, "fogColor", value);
        this.updated = true;
    }
    get sunParams() {
        return this._impl.Get(this._ptr, "sunParams");
    }
    set sunParams(value) {
        this._impl.Set(this._ptr, "sunParams", value);
        this.updated = true;
    }
    get sunlitColorIntensity() {
        return this._impl.Get(this._ptr, "sunlitColorIntensity");
    }
    set sunlitColorIntensity(value) {
        this._impl.Set(this._ptr, "sunlitColorIntensity", value);
        this.updated = true;
    }
    get sunlitDirection() {
        return this._impl.Get(this._ptr, "sunlitDirection");
    }
    set sunlitDirection(value) {
        this._impl.Set(this._ptr, "sunlitDirection", value);
        this.updated = true;
    }
    get sunlitDisable() {
        return this._impl.Get(this._ptr, "sunlitDisable");
    }
    set sunlitDisable(value) {
        this._impl.Set(this._ptr, "sunlitDisable", value);
        this.updated = true;
    }
    get lightFarAttenuationParams() {
        return this._impl.Get(this._ptr, "lightFarAttenuationParams");
    }
    set lightFarAttenuationParams(value) {
        this._impl.Set(this._ptr, "lightFarAttenuationParams", value);
        this.updated = true;
    }
    get iblLuminance() {
        return this._impl.Get(this._ptr, "iblLuminance");
    }
    set iblLuminance(value) {
        this._impl.Set(this._ptr, "iblLuminance", value);
        this.updated = true;
    }
    get iblRoughnessOneLevel() {
        return this._impl.Get(this._ptr, "iblRoughnessOneLevel");
    }
    set iblRoughnessOneLevel(value) {
        this._impl.Set(this._ptr, "iblRoughnessOneLevel", value);
        this.updated = true;
    }
    get ssaoDisable() {
        return this._impl.Get(this._ptr, "ssaoDisable");
    }
    set ssaoDisable(value) {
        this._impl.Set(this._ptr, "ssaoDisable", value);
        this.updated = true;
    }
    get ssrDisable() {
        return this._impl.Get(this._ptr, "ssrDisable");
    }
    set ssrDisable(value) {
        this._impl.Set(this._ptr, "ssrDisable", value);
        this.updated = true;
    }
    get ssrThickness() {
        return this._impl.Get(this._ptr, "ssrThickness");
    }
    set ssrThickness(value) {
        this._impl.Set(this._ptr, "ssrThickness", value);
        this.updated = true;
    }
    get ssrBias() {
        return this._impl.Get(this._ptr, "ssrBias");
    }
    set ssrBias(value) {
        this._impl.Set(this._ptr, "ssrBias", value);
        this.updated = true;
    }
    get ssrDistance() {
        return this._impl.Get(this._ptr, "ssrDistance");
    }
    set ssrDistance(value) {
        this._impl.Set(this._ptr, "ssrDistance", value);
        this.updated = true;
    }
    get ssrStride() {
        return this._impl.Get(this._ptr, "ssrStride");
    }
    set ssrStride(value) {
        this._impl.Set(this._ptr, "ssrStride", value);
        this.updated = true;
    }
    get refractionLodOffset() {
        return this._impl.Get(this._ptr, "refractionLodOffset");
    }
    set refractionLodOffset(value) {
        this._impl.Set(this._ptr, "refractionLodOffset", value);
        this.updated = true;
    }
    get temporalNoise() {
        return this._impl.Get(this._ptr, "temporalNoise");
    }
    set temporalNoise(value) {
        this._impl.Set(this._ptr, "temporalNoise", value);
        this.updated = true;
    }
    get aoSamplingQualityAndEdgeDistance() {
        return this._impl.Get(this._ptr, "aoSamplingQualityAndEdgeDistance");
    }
    set aoSamplingQualityAndEdgeDistance(value) {
        this._impl.Set(this._ptr, "aoSamplingQualityAndEdgeDistance", value);
        this.updated = true;
    }
    get aoBentNormals() {
        return this._impl.Get(this._ptr, "aoBentNormals");
    }
    set aoBentNormals(value) {
        this._impl.Set(this._ptr, "aoBentNormals", value);
        this.updated = true;
    }
    get cascades() {
        return this._impl.Get(this._ptr, "cascades");
    }
    set cascades(value) {
        this._impl.Set(this._ptr, "cascades", value);
        this.updated = true;
    }
    get directionalShadows() {
        return this._impl.Get(this._ptr, "directionalShadows");
    }
    set directionalShadows(value) {
        this._impl.Set(this._ptr, "directionalShadows", value);
        this.updated = true;
    }
    get ssContactShadowDistance() {
        return this._impl.Get(this._ptr, "ssContactShadowDistance");
    }
    set ssContactShadowDistance(value) {
        this._impl.Set(this._ptr, "ssContactShadowDistance", value);
        this.updated = true;
    }
    get shadowSamplingType() {
        return this._impl.Get(this._ptr, "shadowSamplingType");
    }
    set shadowSamplingType(value) {
        this._impl.Set(this._ptr, "shadowSamplingType", value);
    }
    get shadowBias() {
        return this._impl.Get(this._ptr, "shadowBias");
    }
    set shadowBias(value) {
        this._impl.Set(this._ptr, "shadowBias", value);
        this.updated = true;
    }
    get shadowBulbRadiusLs() {
        return this._impl.Get(this._ptr, "shadowBulbRadiusLs");
    }
    set shadowBulbRadiusLs(value) {
        this._impl.Set(this._ptr, "shadowBulbRadiusLs", value);
        this.updated = true;
    }
    get shadowPenumbraRatioScale() {
        return this._impl.Get(this._ptr, "shadowPenumbraRatioScale");
    }
    set shadowPenumbraRatioScale(value) {
        this._impl.Set(this._ptr, "shadowPenumbraRatioScale", value);
        this.updated = true;
    }
    get shadowDisable() {
        return this._impl.Get(this._ptr, "shadowDisable");
    }
    set shadowDisable(value) {
        this._impl.Set(this._ptr, "shadowDisable", value);
    }
    get vsmExponent() {
        return this._impl.Get(this._ptr, "vsmExponent");
    }
    set vsmExponent(value) {
        this._impl.Set(this._ptr, "vsmExponent", value);
        this.updated = true;
    }
    get vsmDepthScale() {
        return this._impl.Get(this._ptr, "vsmDepthScale");
    }
    set vsmDepthScale(value) {
        this._impl.Set(this._ptr, "vsmDepthScale", value);
        this.updated = true;
    }
    get vsmLightBleedReduction() {
        return this._impl.Get(this._ptr, "vsmLightBleedReduction");
    }
    set vsmLightBleedReduction(value) {
        this._impl.Set(this._ptr, "vsmLightBleedReduction", value);
        this.updated = true;
    }
    get fogStart() {
        return this._impl.Get(this._ptr, "fogStart");
    }
    set fogStart(value) {
        this._impl.Set(this._ptr, "fogStart", value);
        this.updated = true;
    }
    get fogMaxOpacity() {
        return this._impl.Get(this._ptr, "fogMaxOpacity");
    }
    set fogMaxOpacity(value) {
        this._impl.Set(this._ptr, "fogMaxOpacity", value);
        this.updated = true;
    }
    get fogHeight() {
        return this._impl.Get(this._ptr, "fogHeight");
    }
    set fogHeight(value) {
        this._impl.Set(this._ptr, "fogHeight", value);
        this.updated = true;
    }
    get fogHeightFalloff() {
        return this._impl.Get(this._ptr, "fogHeightFalloff");
    }
    set fogHeightFalloff(value) {
        this._impl.Set(this._ptr, "fogHeightFalloff", value);
        this.updated = true;
    }
    get fogDensity() {
        return this._impl.Get(this._ptr, "fogDensity");
    }
    set fogDensity(value) {
        this._impl.Set(this._ptr, "fogDensity", value);
        this.updated = true;
    }
    get fogInscatteringStart() {
        return this._impl.Get(this._ptr, "fogInscatteringStart");
    }
    set fogInscatteringStart(value) {
        this._impl.Set(this._ptr, "fogInscatteringStart", value);
        this.updated = true;
    }
    get fogInscatteringSize() {
        return this._impl.Get(this._ptr, "fogInscatteringSize");
    }
    set fogInscatteringSize(value) {
        this._impl.Set(this._ptr, "fogInscatteringSize", value);
        this.updated = true;
    }
    get fogColorFromIbl() {
        return this._impl.Get(this._ptr, "fogColorFromIbl");
    }
    set fogColorFromIbl(value) {
        this._impl.Set(this._ptr, "fogColorFromIbl", value);
        this.updated = true;
    }
    _impl;
}
export class Volume_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Volume_member_index);
    }
    async Create(object3d) {
        const ptr = this._Create(object3d.internalPtr);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Volume(this, ptr, id);
        this._instanceCount++;
        return instance;
    }
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Volume_kernel.Remove: 实例ID=" + id + "无效！", 3);
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
            console.error("异常！存在未释放的体积组件实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
    }
    _Create;
}
export const Volume_member_index = {
    ...Miaoverse.Binary_member_index,
    enabled: ["uscalarGet", "uscalarSet", 1, 12],
    object: ["ptrGet", "ptrSet", 1, 13],
    lastSib: ["ptrGet", "ptrSet", 1, 14],
    nextSib: ["ptrGet", "ptrSet", 1, 15],
    updated: ["uscalarGet", "uscalarSet", 1, 16],
    iblPitch: ["fscalarGet", "fscalarSet", 1, 17],
    iblYaw: ["fscalarGet", "fscalarSet", 1, 18],
    iblRoll: ["fscalarGet", "fscalarSet", 1, 19],
    iblSH: ["farrayGet", "farraySet", 36, 20],
    fogColor: ["farrayGet", "farraySet", 3, 56],
    sunParams: ["farrayGet", "farraySet", 4, 60],
    sunlitColorIntensity: ["farrayGet", "farraySet", 4, 64],
    sunlitDirection: ["farrayGet", "farraySet", 3, 68],
    sunlitDisable: ["fscalarGet", "fscalarSet", 1, 71],
    lightFarAttenuationParams: ["farrayGet", "farraySet", 2, 112],
    iblLuminance: ["fscalarGet", "fscalarSet", 1, 116],
    iblRoughnessOneLevel: ["fscalarGet", "fscalarSet", 1, 117],
    ssaoDisable: ["uscalarGet", "uscalarSet", 1, 118],
    ssrDisable: ["uscalarGet", "uscalarSet", 1, 119],
    ssrThickness: ["fscalarGet", "fscalarSet", 1, 120],
    ssrBias: ["fscalarGet", "fscalarSet", 1, 121],
    ssrDistance: ["fscalarGet", "fscalarSet", 1, 122],
    ssrStride: ["fscalarGet", "fscalarSet", 1, 123],
    refractionLodOffset: ["fscalarGet", "fscalarSet", 1, 124],
    temporalNoise: ["fscalarGet", "fscalarSet", 1, 125],
    aoSamplingQualityAndEdgeDistance: ["fscalarGet", "fscalarSet", 1, 126],
    aoBentNormals: ["fscalarGet", "fscalarSet", 1, 127],
    cascades: ["uscalarGet", "uscalarSet", 1, 128],
    directionalShadows: ["uscalarGet", "uscalarSet", 1, 129],
    ssContactShadowDistance: ["fscalarGet", "fscalarSet", 1, 130],
    shadowSamplingType: ["uscalarGet", "uscalarSet", 1, 131],
    shadowBias: ["fscalarGet", "fscalarSet", 1, 132],
    shadowBulbRadiusLs: ["fscalarGet", "fscalarSet", 1, 133],
    shadowPenumbraRatioScale: ["fscalarGet", "fscalarSet", 1, 134],
    shadowDisable: ["uscalarGet", "uscalarSet", 1, 135],
    vsmExponent: ["fscalarGet", "fscalarSet", 1, 136],
    vsmDepthScale: ["fscalarGet", "fscalarSet", 1, 137],
    vsmLightBleedReduction: ["fscalarGet", "fscalarSet", 1, 138],
    fogStart: ["fscalarGet", "fscalarSet", 1, 140],
    fogMaxOpacity: ["fscalarGet", "fscalarSet", 1, 141],
    fogHeight: ["fscalarGet", "fscalarSet", 1, 142],
    fogHeightFalloff: ["fscalarGet", "fscalarSet", 1, 143],
    fogDensity: ["fscalarGet", "fscalarSet", 1, 144],
    fogInscatteringStart: ["fscalarGet", "fscalarSet", 1, 145],
    fogInscatteringSize: ["fscalarGet", "fscalarSet", 1, 146],
    fogColorFromIbl: ["fscalarGet", "fscalarSet", 1, 147],
};
