import * as Miaoverse from "../mod.js";
export class Volume extends Miaoverse.Resource {
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
    get updated() {
        return this._impl.Get(this._ptr, "updated");
    }
    set updated(value) {
        this._impl.Set(this._ptr, "updated", value);
    }
    get iblPitch() {
        return this._impl.Get(this._ptr, "iblPitch");
    }
    set iblPitch(value) {
        this._impl.Set(this._ptr, "iblPitch", value);
        this.updated = 1;
    }
    get iblYaw() {
        return this._impl.Get(this._ptr, "iblYaw");
    }
    set iblYaw(value) {
        this._impl.Set(this._ptr, "iblYaw", value);
        this.updated = 1;
    }
    get iblRoll() {
        return this._impl.Get(this._ptr, "iblRoll");
    }
    set iblRoll(value) {
        this._impl.Set(this._ptr, "iblRoll", value);
        this.updated = 1;
    }
    get iblSH() {
        return this._impl.Get(this._ptr, "iblSH");
    }
    set iblSH(value) {
        this._impl.Set(this._ptr, "iblSH", value);
        this.updated = 1;
    }
    get fogColor() {
        return this._impl.Get(this._ptr, "fogColor");
    }
    set fogColor(value) {
        this._impl.Set(this._ptr, "fogColor", value);
        this.updated = 1;
    }
    get sunParams() {
        return this._impl.Get(this._ptr, "sunParams");
    }
    set sunParams(value) {
        this._impl.Set(this._ptr, "sunParams", value);
        this.updated = 1;
    }
    get iblColorIntensity() {
        return this._impl.Get(this._ptr, "iblColorIntensity");
    }
    get iblDirection() {
        return this._impl.Get(this._ptr, "iblDirection");
    }
    get lightFarAttenuationParams() {
        return this._impl.Get(this._ptr, "lightFarAttenuationParams");
    }
    set lightFarAttenuationParams(value) {
        this._impl.Set(this._ptr, "lightFarAttenuationParams", value);
        this.updated = 1;
    }
    get iblLuminance() {
        return this._impl.Get(this._ptr, "iblLuminance");
    }
    set iblLuminance(value) {
        this._impl.Set(this._ptr, "iblLuminance", value);
        this.updated = 1;
    }
    get iblRoughnessOneLevel() {
        return this._impl.Get(this._ptr, "iblRoughnessOneLevel");
    }
    set iblRoughnessOneLevel(value) {
        this._impl.Set(this._ptr, "iblRoughnessOneLevel", value);
        this.updated = 1;
    }
    get ssrThickness() {
        return this._impl.Get(this._ptr, "ssrThickness");
    }
    set ssrThickness(value) {
        this._impl.Set(this._ptr, "ssrThickness", value);
        this.updated = 1;
    }
    get ssrBias() {
        return this._impl.Get(this._ptr, "ssrBias");
    }
    set ssrBias(value) {
        this._impl.Set(this._ptr, "ssrBias", value);
        this.updated = 1;
    }
    get ssrDistance() {
        return this._impl.Get(this._ptr, "ssrDistance");
    }
    set ssrDistance(value) {
        this._impl.Set(this._ptr, "ssrDistance", value);
        this.updated = 1;
    }
    get ssrStride() {
        return this._impl.Get(this._ptr, "ssrStride");
    }
    set ssrStride(value) {
        this._impl.Set(this._ptr, "ssrStride", value);
        this.updated = 1;
    }
    get refractionLodOffset() {
        return this._impl.Get(this._ptr, "refractionLodOffset");
    }
    set refractionLodOffset(value) {
        this._impl.Set(this._ptr, "refractionLodOffset", value);
        this.updated = 1;
    }
    get temporalNoise() {
        return this._impl.Get(this._ptr, "temporalNoise");
    }
    set temporalNoise(value) {
        this._impl.Set(this._ptr, "temporalNoise", value);
        this.updated = 1;
    }
    get aoSamplingQualityAndEdgeDistance() {
        return this._impl.Get(this._ptr, "aoSamplingQualityAndEdgeDistance");
    }
    set aoSamplingQualityAndEdgeDistance(value) {
        this._impl.Set(this._ptr, "aoSamplingQualityAndEdgeDistance", value);
        this.updated = 1;
    }
    get aoBentNormals() {
        return this._impl.Get(this._ptr, "aoBentNormals");
    }
    set aoBentNormals(value) {
        this._impl.Set(this._ptr, "aoBentNormals", value);
        this.updated = 1;
    }
    get cascades() {
        return this._impl.Get(this._ptr, "cascades");
    }
    set cascades(value) {
        this._impl.Set(this._ptr, "cascades", value);
        this.updated = 1;
    }
    get directionalShadows() {
        return this._impl.Get(this._ptr, "directionalShadows");
    }
    set directionalShadows(value) {
        this._impl.Set(this._ptr, "directionalShadows", value);
        this.updated = 1;
    }
    get ssContactShadowDistance() {
        return this._impl.Get(this._ptr, "ssContactShadowDistance");
    }
    set ssContactShadowDistance(value) {
        this._impl.Set(this._ptr, "ssContactShadowDistance", value);
        this.updated = 1;
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
        this.updated = 1;
    }
    get shadowBulbRadiusLs() {
        return this._impl.Get(this._ptr, "shadowBulbRadiusLs");
    }
    set shadowBulbRadiusLs(value) {
        this._impl.Set(this._ptr, "shadowBulbRadiusLs", value);
        this.updated = 1;
    }
    get shadowPenumbraRatioScale() {
        return this._impl.Get(this._ptr, "shadowPenumbraRatioScale");
    }
    set shadowPenumbraRatioScale(value) {
        this._impl.Set(this._ptr, "shadowPenumbraRatioScale", value);
        this.updated = 1;
    }
    get vsmExponent() {
        return this._impl.Get(this._ptr, "vsmExponent");
    }
    set vsmExponent(value) {
        this._impl.Set(this._ptr, "vsmExponent", value);
        this.updated = 1;
    }
    get vsmDepthScale() {
        return this._impl.Get(this._ptr, "vsmDepthScale");
    }
    set vsmDepthScale(value) {
        this._impl.Set(this._ptr, "vsmDepthScale", value);
        this.updated = 1;
    }
    get vsmLightBleedReduction() {
        return this._impl.Get(this._ptr, "vsmLightBleedReduction");
    }
    set vsmLightBleedReduction(value) {
        this._impl.Set(this._ptr, "vsmLightBleedReduction", value);
        this.updated = 1;
    }
    get fogStart() {
        return this._impl.Get(this._ptr, "fogStart");
    }
    set fogStart(value) {
        this._impl.Set(this._ptr, "fogStart", value);
        this.updated = 1;
    }
    get fogMaxOpacity() {
        return this._impl.Get(this._ptr, "fogMaxOpacity");
    }
    set fogMaxOpacity(value) {
        this._impl.Set(this._ptr, "fogMaxOpacity", value);
        this.updated = 1;
    }
    get fogHeight() {
        return this._impl.Get(this._ptr, "fogHeight");
    }
    set fogHeight(value) {
        this._impl.Set(this._ptr, "fogHeight", value);
        this.updated = 1;
    }
    get fogHeightFalloff() {
        return this._impl.Get(this._ptr, "fogHeightFalloff");
    }
    set fogHeightFalloff(value) {
        this._impl.Set(this._ptr, "fogHeightFalloff", value);
        this.updated = 1;
    }
    get fogDensity() {
        return this._impl.Get(this._ptr, "fogDensity");
    }
    set fogDensity(value) {
        this._impl.Set(this._ptr, "fogDensity", value);
        this.updated = 1;
    }
    get fogInscatteringStart() {
        return this._impl.Get(this._ptr, "fogInscatteringStart");
    }
    set fogInscatteringStart(value) {
        this._impl.Set(this._ptr, "fogInscatteringStart", value);
        this.updated = 1;
    }
    get fogInscatteringSize() {
        return this._impl.Get(this._ptr, "fogInscatteringSize");
    }
    set fogInscatteringSize(value) {
        this._impl.Set(this._ptr, "fogInscatteringSize", value);
        this.updated = 1;
    }
    get fogColorFromIbl() {
        return this._impl.Get(this._ptr, "fogColorFromIbl");
    }
    set fogColorFromIbl(value) {
        this._impl.Set(this._ptr, "fogColorFromIbl", value);
        this.updated = 1;
    }
    _impl;
}
export class Volume_kernel {
    Get(self, key) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]);
    }
    Set(self, key, value) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value);
    }
    _global;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
    _gcList = [];
    _members = {
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
        iblColorIntensity: ["farrayGet", "farraySet", 4, 64],
        iblDirection: ["farrayGet", "farraySet", 3, 68],
        lightFarAttenuationParams: ["farrayGet", "farraySet", 2, 112],
        iblLuminance: ["fscalarGet", "fscalarSet", 1, 116],
        iblRoughnessOneLevel: ["fscalarGet", "fscalarSet", 1, 117],
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
    _members_key;
}
//# sourceMappingURL=volume.js.map