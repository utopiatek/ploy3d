import * as Miaoverse from "../mod.js";
export class Light extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    _impl;
}
export class Light_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Light_member_index);
    }
}
export const Light_member_index = {
    ...Miaoverse.Binary_member_index,
    enabled: ["uscalarGet", "uscalarSet", 1, 12],
    object: ["ptrGet", "ptrSet", 1, 13],
    lastSib: ["ptrGet", "ptrSet", 1, 14],
    nextSib: ["ptrGet", "ptrSet", 1, 15],
    flags: ["uscalarGet", "uscalarSet", 1, 16],
    reserved: ["uarrayGet", "uarraySet", 3, 17],
    color: ["farrayGet", "farraySet", 3, 20],
    lux: ["fscalarGet", "fscalarSet", 1, 23],
    position: ["farrayGet", "farraySet", 3, 24],
    falloff: ["fscalarGet", "fscalarSet", 1, 27],
    direction: ["farrayGet", "farraySet", 3, 28],
    extra: ["fscalarGet", "fscalarSet", 1, 31],
    spotCone: ["farrayGet", "farraySet", 2, 32],
    spotScaleOffset: ["farrayGet", "farraySet", 2, 34],
};
//# sourceMappingURL=light.js.map