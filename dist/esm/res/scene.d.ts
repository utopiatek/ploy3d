import * as Miaoverse from "../mod.js";
/** 场景实例。 */
export declare class Scene extends Miaoverse.Resource<Scene> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Scene_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 内核实现。 */
    private _impl;
}
/** 场景内核实现。 */
export declare class Scene_kernel extends Miaoverse.Base_kernel<Scene, typeof Scene_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建场景实例。
     * @returns 返回场景实例。
     */
    Create(): Promise<Miaoverse.Scene>;
    /**
     * 创建场景内核实例。
     * 同一预制件可重复实例化出多个场景，场景通过销毁方法销毁。
     * @returns 返回场景内核实例指针。
     */
    protected _Create: () => Miaoverse.io_ptr;
    /**
     * 销毁场景内核实例。
     * @param scene 场景内核实例指针。
     */
    protected _Destroy: (scene: Miaoverse.io_ptr) => void;
}
/** 场景内核实现的数据结构成员列表。 */
export declare const Scene_member_index: {
    readonly worldLLMC: Miaoverse.Kernel_member;
    readonly altitude: Miaoverse.Kernel_member;
    readonly unused1: Miaoverse.Kernel_member;
    readonly unused2: Miaoverse.Kernel_member;
    readonly unused3: Miaoverse.Kernel_member;
    readonly magic: Miaoverse.Kernel_member;
    readonly version: Miaoverse.Kernel_member;
    readonly byteSize: Miaoverse.Kernel_member;
    /**
     * 创建场景实例。
     * @returns 返回场景实例。
     */
    readonly refCount: Miaoverse.Kernel_member;
    readonly id: Miaoverse.Kernel_member;
    readonly uuid: Miaoverse.Kernel_member;
    readonly writeTS: Miaoverse.Kernel_member;
    readonly readTS: Miaoverse.Kernel_member;
    readonly last: Miaoverse.Kernel_member;
    readonly next: Miaoverse.Kernel_member;
};
