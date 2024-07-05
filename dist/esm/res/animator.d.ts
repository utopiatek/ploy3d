import * as Miaoverse from "../mod.js";
/** 动画组件（96+字节）。 */
export declare class Animator_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly reserved: Miaoverse.Kernel_member;
        readonly enabled: Miaoverse.Kernel_member;
        readonly object: Miaoverse.Kernel_member;
        readonly lastSib: Miaoverse.Kernel_member;
        readonly nextSib: Miaoverse.Kernel_member;
        readonly clipCount: Miaoverse.Kernel_member;
        readonly unused2: Miaoverse.Kernel_member;
        readonly node: Miaoverse.Kernel_member;
        readonly nextClip: Miaoverse.Kernel_member;
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
    protected _members_key: keyof Animator_kernel["_members"];
}
/** 动画数据（96+字节）。 */
export declare class AnimationData_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly unused0: Miaoverse.Kernel_member;
        readonly unused1: Miaoverse.Kernel_member;
        readonly clipCount: Miaoverse.Kernel_member;
        readonly clips: Miaoverse.Kernel_member;
        readonly skeletonPTR: Miaoverse.Kernel_member;
        readonly skeletonUUID: Miaoverse.Kernel_member;
        readonly morphPTR: Miaoverse.Kernel_member;
        readonly morphUUID: Miaoverse.Kernel_member;
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
    protected _members_key: keyof AnimationData_kernel["_members"];
}
/** 骨架定义资源（80+字节）。 */
export declare class Skeleton_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly flags: Miaoverse.Kernel_member;
        readonly jointCount: Miaoverse.Kernel_member;
        readonly jointRootIndex: Miaoverse.Kernel_member;
        readonly jointsNameLength: Miaoverse.Kernel_member;
        readonly initDatas: Miaoverse.Kernel_member;
        readonly inverseBindMatrices: Miaoverse.Kernel_member;
        readonly jointsUuid: Miaoverse.Kernel_member;
        readonly jointsName: Miaoverse.Kernel_member;
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
    protected _members_key: keyof Skeleton_kernel["_members"];
}
/** 蒙皮定义资源（64+字节）。 */
export declare class Skin_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly vertexCount: Miaoverse.Kernel_member;
        readonly method: Miaoverse.Kernel_member;
        readonly unloaded: Miaoverse.Kernel_member;
        readonly vertices: Miaoverse.Kernel_member;
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
    protected _members_key: keyof Skin_kernel["_members"];
}
