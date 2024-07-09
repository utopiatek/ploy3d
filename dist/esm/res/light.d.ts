import * as Miaoverse from "../mod.js";
/** 相机组件实例。 */
export declare class Light extends Miaoverse.Resource<Light> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Light_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 内核实现。 */
    private _impl;
}
/** 光源组件内核实现。 */
export declare class Light_kernel extends Miaoverse.Base_kernel<Light, typeof Light_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
}
/** 光源组件内核实现的数据结构成员列表。 */
export declare const Light_member_index: {
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
