import * as Miaoverse from "../mod.js"

/** 动画组件实例。 */
export class Animator extends Miaoverse.Resource<Animator> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Animator_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /** 内核实现。 */
    private _impl: Animator_kernel;
}

/** 动画组件内核实现。 */
export class Animator_kernel extends Miaoverse.Base_kernel<any, typeof Animator_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Animator_member_index);
    }
}

/** 动画数据内核实现。 */
export class AnimationData_kernel extends Miaoverse.Base_kernel<any, typeof AnimationData_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, AnimationData_member_index);
    }
}

/** 骨架定义数据内核实现。 */
export class Skeleton_kernel extends Miaoverse.Base_kernel<any, typeof Skeleton_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Skeleton_member_index);
    }
}

/** 蒙皮数据内核实现。 */
export class Skin_kernel extends Miaoverse.Base_kernel<any, typeof Skin_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Skin_member_index);
    }
}

/** 动画组件内核实现的数据结构成员列表。 */
export const Animator_member_index = {
    ...Miaoverse.Binary_member_index,

    reserved: ["uarrayGet", "uarraySet", 4, 12] as Miaoverse.Kernel_member,

    enabled: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    object: ["ptrGet", "ptrSet", 1, 17] as Miaoverse.Kernel_member,
    lastSib: ["ptrGet", "ptrSet", 1, 18] as Miaoverse.Kernel_member,
    nextSib: ["ptrGet", "ptrSet", 1, 19] as Miaoverse.Kernel_member,

    clipCount: ["uscalarGet", "uscalarSet", 1, 20] as Miaoverse.Kernel_member,
    unused2: ["uscalarGet", "uscalarSet", 1, 21] as Miaoverse.Kernel_member,
    node: ["ptrGet", "ptrSet", 1, 22] as Miaoverse.Kernel_member,
    nextClip: ["ptrGet", "ptrSet", 1, 23] as Miaoverse.Kernel_member,
} as const;

/** 动画数据内核实现的数据结构成员列表。 */
export const AnimationData_member_index = {
    ...Miaoverse.Binary_member_index,

    unused0: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    unused1: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    clipCount: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    clips: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,

    skeletonPTR: ["ptrGet", "ptrSet", 1, 16] as Miaoverse.Kernel_member,
    skeletonUUID: ["uuidGet", "uuidSet", 3, 17] as Miaoverse.Kernel_member,

    morphPTR: ["ptrGet", "ptrSet", 1, 20] as Miaoverse.Kernel_member,
    morphUUID: ["uuidGet", "uuidSet", 3, 21] as Miaoverse.Kernel_member,
} as const;

/** 骨架定义数据内核实现的数据结构成员列表。 */
export const Skeleton_member_index = {
    ...Miaoverse.Binary_member_index,

    flags: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    jointCount: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    jointRootIndex: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    jointsNameLength: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

    initDatas: ["ptrGet", "ptrSet", 1, 16] as Miaoverse.Kernel_member,
    inverseBindMatrices: ["ptrGet", "ptrSet", 1, 17] as Miaoverse.Kernel_member,
    jointsUuid: ["ptrGet", "ptrSet", 1, 18] as Miaoverse.Kernel_member,
    jointsName: ["ptrGet", "ptrSet", 1, 19] as Miaoverse.Kernel_member,
} as const;

/** 蒙皮数据内核实现的数据结构成员列表。 */
export const Skin_member_index = {
    ...Miaoverse.Binary_member_index,

    vertexCount: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    method: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    unloaded: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    vertices: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,
} as const;
