import * as Miaoverse from "../mod.js";
/** 光源组件（144字节）。 */
export declare class Light_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly enabled: Miaoverse.Kernel_member;
        readonly object: Miaoverse.Kernel_member;
        readonly lastSib: Miaoverse.Kernel_member;
        readonly nextSib: Miaoverse.Kernel_member;
        readonly flags: Miaoverse.Kernel_member;
        readonly reserved: Miaoverse.Kernel_member;
        readonly color: Miaoverse.Kernel_member;
        readonly lux: Miaoverse.Kernel_member;
        readonly position: Miaoverse.Kernel_member;
        readonly falloff: Miaoverse.Kernel_member;
        readonly direction: Miaoverse.Kernel_member;
        readonly extra: Miaoverse.Kernel_member;
        readonly spotCone: Miaoverse.Kernel_member;
        readonly spotScaleOffset: Miaoverse.Kernel_member;
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
    protected _members_key: keyof Light_kernel["_members"];
}
