import * as Miaoverse from "../mod.js"

/** 动画组件（96+字节）。 */
export class Animator_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members = {
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

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Animator_kernel["_members"];
}

/** 动画数据（96+字节）。 */
export class AnimationData_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members = {
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

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof AnimationData_kernel["_members"];
}

/** 骨架定义资源（80+字节）。 */
export class Skeleton_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members = {
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

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Skeleton_kernel["_members"];
}

/** 蒙皮定义资源（64+字节）。 */
export class Skin_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Binary_member_index,

        vertexCount: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
        method: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
        unloaded: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
        vertices: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,
    } as const;

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Skin_kernel["_members"];
}
