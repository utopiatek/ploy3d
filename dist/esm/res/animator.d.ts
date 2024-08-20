import * as Miaoverse from "../mod.js";
/** 动画组件实例。 */
export declare class Animator extends Miaoverse.Resource<Animator> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Animator_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 内核实现。 */
    private _impl;
}
/** 动画组件内核实现。 */
export declare class Animator_kernel extends Miaoverse.Base_kernel<any, typeof Animator_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
}
/** 动画数据内核实现。 */
export declare class AnimationData_kernel extends Miaoverse.Base_kernel<any, typeof AnimationData_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
}
/** 动画组件内核实现的数据结构成员列表。 */
export declare const Animator_member_index: {
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
/** 动画数据内核实现的数据结构成员列表。 */
export declare const AnimationData_member_index: {
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
