import * as Miaoverse from "../mod.js";
export type Kernel_member = [Kernel_member_getter, Kernel_member_setter, number, number];
export type Kernel_member_getter = "uscalarGet" | "fscalarGet" | "uarrayGet" | "farrayGet" | "ptrGet" | "uuidGet" | "stringGet";
export type Kernel_member_setter = "uscalarSet" | "fscalarSet" | "uarraySet" | "farraySet" | "ptrSet" | "uuidSet" | "stringSet";
/** 二进制数据基类（48字节）。 */
export declare const Binary_member_index: {
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
/** 资源内核实现基类。 */
export declare class Base_kernel<T, K extends typeof Binary_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     * @param _members 资源内核实现的数据结构成员列表。
     */
    protected constructor(_global: Miaoverse.Ploy3D, _members: Record<keyof K, Kernel_member>);
    /**
     * 获取资源内核实例属性值。
     * @param ptr 资源内核实例指针。
     * @param key 资源内核实现的数据结构成员名称。
     * @returns 返回对应属性值。
     */
    Get<N>(ptr: Miaoverse.io_ptr, key: keyof K): N;
    /**
     * 设置资源内核实例属性值。
     * @param ptr 资源内核实例指针。
     * @param key 资源内核实现的数据结构成员名称。
     * @param value 属性值。
     */
    Set(ptr: Miaoverse.io_ptr, key: keyof K, value: any): void;
    /**
     * 资源内核实例指针获取资源实例。
     * @param ptr 资源内核实例指针。
     * @returns 返回资源实例。
     */
    GetInstanceByPtr(ptr: Miaoverse.io_ptr): T;
    /**
     * 根据资源实例ID获取资源实例。
     * @param id 资源实例ID。
     * @returns 返回资源实例。
     */
    GetInstanceByID(id: number): T;
    /** 引擎实例。 */
    protected _global: Miaoverse.Ploy3D;
    /** 资源内核实现的数据结构成员列表。 */
    protected _members: Record<keyof K, Kernel_member>;
    /** 资源实例列表容器。 */
    protected _instanceList: T[];
    /** 已分配资源实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, T>;
    /** 已分配资源实例数量。 */
    protected _instanceCount: number;
    /** 待分配空闲资源实例索引。 */
    protected _instanceIdle: number;
    /** 待GC资源实例列表。 */
    protected _gcList: T[];
}
