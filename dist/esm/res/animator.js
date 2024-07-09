import * as Miaoverse from "../mod.js";
export class Animator extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    _impl;
}
export class Animator_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Animator_member_index);
    }
}
export class AnimationData_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, AnimationData_member_index);
    }
}
export class Skeleton_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Skeleton_member_index);
    }
}
export class Skin_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Skin_member_index);
    }
}
export const Animator_member_index = {
    ...Miaoverse.Binary_member_index,
    reserved: ["uarrayGet", "uarraySet", 4, 12],
    enabled: ["uscalarGet", "uscalarSet", 1, 16],
    object: ["ptrGet", "ptrSet", 1, 17],
    lastSib: ["ptrGet", "ptrSet", 1, 18],
    nextSib: ["ptrGet", "ptrSet", 1, 19],
    clipCount: ["uscalarGet", "uscalarSet", 1, 20],
    unused2: ["uscalarGet", "uscalarSet", 1, 21],
    node: ["ptrGet", "ptrSet", 1, 22],
    nextClip: ["ptrGet", "ptrSet", 1, 23],
};
export const AnimationData_member_index = {
    ...Miaoverse.Binary_member_index,
    unused0: ["uscalarGet", "uscalarSet", 1, 12],
    unused1: ["uscalarGet", "uscalarSet", 1, 13],
    clipCount: ["uscalarGet", "uscalarSet", 1, 14],
    clips: ["ptrGet", "ptrSet", 1, 15],
    skeletonPTR: ["ptrGet", "ptrSet", 1, 16],
    skeletonUUID: ["uuidGet", "uuidSet", 3, 17],
    morphPTR: ["ptrGet", "ptrSet", 1, 20],
    morphUUID: ["uuidGet", "uuidSet", 3, 21],
};
export const Skeleton_member_index = {
    ...Miaoverse.Binary_member_index,
    flags: ["uscalarGet", "uscalarSet", 1, 12],
    jointCount: ["uscalarGet", "uscalarSet", 1, 13],
    jointRootIndex: ["uscalarGet", "uscalarSet", 1, 14],
    jointsNameLength: ["uscalarGet", "uscalarSet", 1, 15],
    initDatas: ["ptrGet", "ptrSet", 1, 16],
    inverseBindMatrices: ["ptrGet", "ptrSet", 1, 17],
    jointsUuid: ["ptrGet", "ptrSet", 1, 18],
    jointsName: ["ptrGet", "ptrSet", 1, 19],
};
export const Skin_member_index = {
    ...Miaoverse.Binary_member_index,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 12],
    method: ["uscalarGet", "uscalarSet", 1, 13],
    unloaded: ["uscalarGet", "uscalarSet", 1, 14],
    vertices: ["ptrGet", "ptrSet", 1, 15],
};
//# sourceMappingURL=animator.js.map