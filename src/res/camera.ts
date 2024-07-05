import * as Miaoverse from "../mod.js"

/** 网格资源。 */
export class Camera extends Miaoverse.Resource<Camera> {
}

/** 相机组件（128字节）。 */
export class Camera_kernel {
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;

    /** 实例容器列表。 */
    protected _instanceList: Camera[] = [null];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Camera> = {};
    /** 已分配实例数量。 */
    protected _instanceCount: number = 0;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC列表。 */
    protected _gcList: Camera[] = [];

    /** 内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Binary_member_index,

        type: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
        updated: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
        depth: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
        cullingFilter: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

        target: ["farrayGet", "farraySet", 3, 16] as Miaoverse.Kernel_member,
        distance: ["fscalarGet", "fscalarSet", 1, 19] as Miaoverse.Kernel_member,

        pitch: ["fscalarGet", "fscalarSet", 1, 20] as Miaoverse.Kernel_member,
        yaw: ["fscalarGet", "fscalarSet", 1, 21] as Miaoverse.Kernel_member,
        roll: ["fscalarGet", "fscalarSet", 1, 22] as Miaoverse.Kernel_member,
        fov: ["fscalarGet", "fscalarSet", 1, 23] as Miaoverse.Kernel_member,

        width: ["fscalarGet", "fscalarSet", 1, 24] as Miaoverse.Kernel_member,
        height: ["fscalarGet", "fscalarSet", 1, 25] as Miaoverse.Kernel_member,
        nearZ: ["fscalarGet", "fscalarSet", 1, 26] as Miaoverse.Kernel_member,
        farZ: ["fscalarGet", "fscalarSet", 1, 27] as Miaoverse.Kernel_member,

        enabled: ["uscalarGet", "uscalarSet", 1, 28] as Miaoverse.Kernel_member,
        object: ["ptrGet", "ptrSet", 1, 29] as Miaoverse.Kernel_member,
        lastSib: ["ptrGet", "ptrSet", 1, 30] as Miaoverse.Kernel_member,
        nextSib: ["ptrGet", "ptrSet", 1, 31] as Miaoverse.Kernel_member,
    } as const;

    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Camera_kernel["_members"];
}
