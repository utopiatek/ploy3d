import * as Miaoverse from "../mod.js";
export class Camera_kernel {
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