import * as Miaoverse from "../mod.js"

/** 相机组件实例。 */
export class Light extends Miaoverse.Resource<Light> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Light_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /** 内核实现。 */
    private _impl: Light_kernel;
}

/** 光源组件内核实现。 */
export class Light_kernel extends Miaoverse.Base_kernel<Light, typeof Light_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Light_member_index);
    }
}

/** 光源组件内核实现的数据结构成员列表。 */
export const Light_member_index = {
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
