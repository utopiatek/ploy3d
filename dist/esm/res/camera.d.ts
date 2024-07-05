import * as Miaoverse from "../mod.js";
/** 相机组件（128字节）。 */
export declare class Camera_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly type: Miaoverse.Kernel_member;
        readonly updated: Miaoverse.Kernel_member;
        readonly depth: Miaoverse.Kernel_member;
        readonly cullingFilter: Miaoverse.Kernel_member;
        readonly target: Miaoverse.Kernel_member;
        readonly distance: Miaoverse.Kernel_member;
        readonly pitch: Miaoverse.Kernel_member;
        readonly yaw: Miaoverse.Kernel_member;
        readonly roll: Miaoverse.Kernel_member;
        readonly fov: Miaoverse.Kernel_member;
        readonly width: Miaoverse.Kernel_member;
        readonly height: Miaoverse.Kernel_member;
        readonly nearZ: Miaoverse.Kernel_member;
        readonly farZ: Miaoverse.Kernel_member;
        readonly enabled: Miaoverse.Kernel_member;
        readonly object: Miaoverse.Kernel_member;
        readonly lastSib: Miaoverse.Kernel_member;
        readonly nextSib: Miaoverse.Kernel_member;
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
    protected _members_key: keyof Camera_kernel["_members"];
}
