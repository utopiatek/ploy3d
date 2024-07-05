import * as Miaoverse from "../mod.js"

/** 光源组件（144字节）。 */
export class Light_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Binary_member_index,

        enabled: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
        object: ["ptrGet", "ptrSet", 1, 13] as Miaoverse.Kernel_member,
        lastSib: ["ptrGet", "ptrSet", 1, 14] as Miaoverse.Kernel_member,
        nextSib: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,

        flags: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
        reserved: ["uarrayGet", "uarraySet", 3, 17] as Miaoverse.Kernel_member,

        color: ["farrayGet", "farraySet", 3, 20] as Miaoverse.Kernel_member,
        lux: ["fscalarGet", "fscalarSet", 1, 23] as Miaoverse.Kernel_member,

        position: ["farrayGet", "farraySet", 3, 24] as Miaoverse.Kernel_member,
        falloff: ["fscalarGet", "fscalarSet", 1, 27] as Miaoverse.Kernel_member,

        direction: ["farrayGet", "farraySet", 3, 28] as Miaoverse.Kernel_member,
        extra: ["fscalarGet", "fscalarSet", 1, 31] as Miaoverse.Kernel_member,

        spotCone: ["farrayGet", "farraySet", 2, 32] as Miaoverse.Kernel_member,
        spotScaleOffset: ["farrayGet", "farraySet", 2, 34] as Miaoverse.Kernel_member,
    } as const;

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Light_kernel["_members"];
}
