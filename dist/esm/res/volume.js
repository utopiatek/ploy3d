import * as Miaoverse from "../mod.js";
export class Volume_kernel {
    _members = {
        ...Miaoverse.Binary_member_index,
        enabled: ["uscalarGet", "uscalarSet", 1, 12],
        object: ["ptrGet", "ptrSet", 1, 13],
        lastSib: ["ptrGet", "ptrSet", 1, 14],
        nextSib: ["ptrGet", "ptrSet", 1, 15],
        skyLuminance: ["fscalarGet", "fscalarSet", 1, 16],
        skyPitch: ["fscalarGet", "fscalarSet", 1, 17],
        skyYaw: ["fscalarGet", "fscalarSet", 1, 18],
        skyRoll: ["fscalarGet", "fscalarSet", 1, 19],
        skySH: ["farrayGet", "farraySet", 36, 20],
        sunColorIntensity: ["farrayGet", "farraySet", 4, 56],
        sunDirection: ["farrayGet", "farraySet", 3, 60],
        unused4: ["fscalarGet", "fscalarSet", 1, 63],
    };
    _members_key;
}
//# sourceMappingURL=volume.js.map