import * as Miaoverse from "../mod.js";
/** 体积组件（256字节）。 */
export declare class Volume_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly enabled: Miaoverse.Kernel_member;
        readonly object: Miaoverse.Kernel_member;
        readonly lastSib: Miaoverse.Kernel_member;
        readonly nextSib: Miaoverse.Kernel_member;
        readonly skyLuminance: Miaoverse.Kernel_member;
        readonly skyPitch: Miaoverse.Kernel_member;
        readonly skyYaw: Miaoverse.Kernel_member;
        readonly skyRoll: Miaoverse.Kernel_member;
        readonly skySH: Miaoverse.Kernel_member;
        readonly sunColorIntensity: Miaoverse.Kernel_member;
        readonly sunDirection: Miaoverse.Kernel_member;
        readonly unused4: Miaoverse.Kernel_member;
        readonly magic: Miaoverse.Kernel_member;
        readonly version: Miaoverse.Kernel_member;
        readonly byteSize: Miaoverse.Kernel_member;
        readonly refCount: Miaoverse.Kernel_member;
        readonly id: Miaoverse.Kernel_member;
        readonly uuid: Miaoverse.Kernel_member;
        readonly writeTS: Miaoverse.Kernel_member;
        readonly readTS: Miaoverse.Kernel_member;
        readonly last: Miaoverse.Kernel_member;
        readonly next: Miaoverse.Kernel_member;
    };
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Volume_kernel["_members"];
}
