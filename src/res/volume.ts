import * as Miaoverse from "../mod.js"

/** 体积组件（256字节）。 */
export class Volume_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Binary_member_index,

        enabled: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
        object: ["ptrGet", "ptrSet", 1, 13] as Miaoverse.Kernel_member,
        lastSib: ["ptrGet", "ptrSet", 1, 14] as Miaoverse.Kernel_member,
        nextSib: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,

        skyLuminance: ["fscalarGet", "fscalarSet", 1, 16] as Miaoverse.Kernel_member,
        skyPitch: ["fscalarGet", "fscalarSet", 1, 17] as Miaoverse.Kernel_member,
        skyYaw: ["fscalarGet", "fscalarSet", 1, 18] as Miaoverse.Kernel_member,
        skyRoll: ["fscalarGet", "fscalarSet", 1, 19] as Miaoverse.Kernel_member,

        skySH: ["farrayGet", "farraySet", 36, 20] as Miaoverse.Kernel_member,

        sunColorIntensity: ["farrayGet", "farraySet", 4, 56] as Miaoverse.Kernel_member,

        sunDirection: ["farrayGet", "farraySet", 3, 60] as Miaoverse.Kernel_member,
        unused4: ["fscalarGet", "fscalarSet", 1, 63] as Miaoverse.Kernel_member,
    } as const;

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Volume_kernel["_members"];
}
