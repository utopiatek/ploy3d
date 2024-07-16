import * as Miaoverse from "../mod.js"

export type Kernel_member = [Kernel_member_getter, Kernel_member_setter, number, number];
export type Kernel_member_getter = "uscalarGet" | "fscalarGet" | "uarrayGet" | "farrayGet" | "ptrGet" | "uuidGet" | "stringGet";
export type Kernel_member_setter = "uscalarSet" | "fscalarSet" | "uarraySet" | "farraySet" | "ptrSet" | "uuidSet" | "stringSet";

/** 资源基类（48字节）。 */
export const Binary_member_index = {
    /** 资源数据格式标识（MAGIC_INVALID + CLASSID）。 */
    magic: ["uscalarGet", "uscalarSet", 1, 0] as Kernel_member,
    /** 资源数据格式版本号。 */
    version: ["uscalarGet", "uscalarSet", 1, 1] as Kernel_member,
    /** 资源数据字节大小。 */
    byteSize: ["uscalarGet", "uscalarSet", 1, 2] as Kernel_member,
    /** 资源实例引用计数。 */
    refCount: ["uscalarGet", "uscalarSet", 1, 3] as Kernel_member,

    /** 资源实例ID。 */
    id: ["uscalarGet", "uscalarSet", 1, 4] as Kernel_member,
    /** 资源UUID。 */
    uuid: ["uuidGet", "uuidSet", 3, 5] as Kernel_member,

    /** 资源实例数据更新时间戳（不同资源类型使用含义不同，注意区分）。 */
    writeTS: ["uscalarGet", "uscalarSet", 1, 8] as Kernel_member,
    /** 资源实例数据使用时间戳（不同资源类型使用含义不同，注意区分）。 */
    readTS: ["uscalarGet", "uscalarSet", 1, 9] as Kernel_member,

    /** 上一个资源实例指针。 */
    last: ["ptrGet", "ptrSet", 1, 10] as Kernel_member,
    /** 下一个资源实例指针。 */
    next: ["ptrGet", "ptrSet", 1, 11] as Kernel_member,
} as const;

/** 资源内核实现基类。 */
export class Base_kernel<T, K extends typeof Binary_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     * @param _members 资源内核实现的数据结构成员列表。
     */
    protected constructor(_global: Miaoverse.Ploy3D, _members: Record<keyof K, Kernel_member>) {
        this._global = _global;
        this._members = _members;
    }

    /**
     * 获取资源内核实例属性值。
     * @param ptr 资源内核实例指针。
     * @param key 资源内核实现的数据结构成员名称。
     * @returns 返回对应属性值。
     */
    public Get<N>(ptr: Miaoverse.io_ptr, key: keyof K) {
        const member = this._members[key];
        return this._global.env[member[0]](ptr, member[3], member[2]) as N;
    }

    /**
     * 设置资源内核实例属性值。
     * @param ptr 资源内核实例指针。
     * @param key 资源内核实现的数据结构成员名称。
     * @param value 属性值。
     */
    public Set(ptr: Miaoverse.io_ptr, key: keyof K, value: any) {
        const member = this._members[key];
        this._global.env[member[1]](ptr, member[3], value as never);
    }

    /**
     * 资源内核实例指针获取资源实例。
     * @param ptr 资源内核实例指针。
     * @returns 返回资源实例。
     */
    public GetInstanceByPtr(ptr: Miaoverse.io_ptr) {
        if (this._global.env.ptrValid(ptr)) {
            const id = this.Get<number>(ptr, "id");
            return this.GetInstanceByID(id);
        }

        return null;
    }

    /**
     * 根据资源实例ID获取资源实例。
     * @param id 资源实例ID。
     * @returns 返回资源实例。
     */
    public GetInstanceByID(id: number) {
        return this._instanceList[id];
    }

    /** 引擎实例。 */
    protected _global: Miaoverse.Ploy3D;
    /** 资源内核实现的数据结构成员列表。 */
    protected _members: Record<keyof K, Kernel_member>;

    /** 资源实例列表容器。 */
    protected _instanceList: T[] = [null];
    /** 已分配资源实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, T> = {};
    /** 已分配资源实例数量。 */
    protected _instanceCount: number = 0;
    /** 待分配空闲资源实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC资源实例列表（资源在创建时产生1引用计数，需要释放）。 */
    protected _gcList: T[] = [];
}
