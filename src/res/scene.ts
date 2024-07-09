import * as Miaoverse from "../mod.js"

/** 场景实例。 */
export class Scene extends Miaoverse.Resource<Scene> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Scene_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /** 内核实现。 */
    private _impl: Scene_kernel;
}

/** 场景内核实现。 */
export class Scene_kernel extends Miaoverse.Base_kernel<Scene, typeof Scene_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Scene_member_index);
    }

    /**
     * 创建场景实例。
     * @returns 返回场景实例。
     */
    public async Create() {
        const ptr = this._Create();
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Scene(this, ptr, id);

        this._instanceCount++;

        return instance;
    }

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
export const Scene_member_index = {
    ...Miaoverse.Binary_member_index,

    worldLLMC: ["farrayGet", "farraySet", 4, 12] as Miaoverse.Kernel_member,
    altitude: ["fscalarGet", "fscalarSet", 1, 16] as Miaoverse.Kernel_member,
    unused1: ["uscalarGet", "uscalarSet", 1, 17] as Miaoverse.Kernel_member,
    unused2: ["uscalarGet", "uscalarSet", 1, 18] as Miaoverse.Kernel_member,
    unused3: ["uscalarGet", "uscalarSet", 1, 19] as Miaoverse.Kernel_member,
} as const;
