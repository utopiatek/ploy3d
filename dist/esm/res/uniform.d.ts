/// <reference types="@webgpu/types" />
import * as Miaoverse from "../mod.js";
/** 着色器属性统一缓存实例。 */
export declare class Uniform<T> extends Miaoverse.Resource<Uniform<T>> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: any, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 绑定资源组到着色器管线（包括统一缓存和所有贴图）。
     * @param passEncoder 渲染通道命令编码器。
     */
    Bind(passEncoder: GPURenderPassEncoder): void;
    /**
     * 读取GPU统一缓存占用节点成员。
     * @param ptr 缓存节点指针。
     * @returns 返回缓存节点成员数据。
     */
    ReadBufferNode(ptr: Miaoverse.io_ptr): {
        buffer: never;
        bufferID: number;
        offset: number;
        size: number;
    };
    /** 属性上传GPU时间戳。 */
    get writeTS(): number;
    set writeTS(value: number);
    /** 属性用于渲染读取时间戳。 */
    get readTS(): number;
    set readTS(value: number);
    /** 资源组编号（可选值有0、1、2、3）。 */
    get group(): number;
    /** 资源组绑定对象ID（0或1）。 */
    get bindingID(): number;
    set bindingID(value: number);
    /** 属性块数据更新状态。 */
    get updated(): number;
    set updated(value: number);
    /** 资源绑定组布局ID（同时也是着色器内部实例ID）。 */
    get layoutID(): number;
    /** 资源绑定组属性元组。 */
    get tuple(): Miaoverse.PropTuple;
    /** GPU统一缓存实例ID。 */
    get bufferID(): number;
    /** 数据块在缓存中的字节大小（256对齐）。 */
    get size(): number;
    /** 数据块在缓存中的字节偏移（256对齐）。 */
    get offset(): number;
    /** 属性缓存块地址指针。 */
    get blockPtr(): Miaoverse.io_ptr;
    /** 缓存内存块地址指针。 */
    get bufferPtr(): Miaoverse.io_ptr;
    /** 缓存字节大小（256的倍数）。 */
    get bufferSize(): number;
    /** 统一缓存内核实现。 */
    protected _impl: T & {
        /**
         * 获取内核对象属性值。
         * @param self 实例指针。
         * @param key 内核对象数据成员名称。
         * @returns 返回对应属性值。
         */
        Get<T>(self: Miaoverse.io_ptr, key: keyof typeof Uniform_member_index): T;
        /**
         * 设置内核对象属性值。
         * @param self 实例指针。
         * @param key 内核对象数据成员名称。
         * @param value 属性值。
         */
        Set(self: Miaoverse.io_ptr, key: keyof typeof Uniform_member_index, value: any): void;
    };
    /** 缓存内存块地址指针。 */
    protected _bufferPtr: Miaoverse.io_ptr;
    /** 缓存字节大小（256的倍数）。 */
    protected _bufferSize: number;
    /** 属性缓存块地址指针。 */
    protected _blockPtr: Miaoverse.io_ptr;
    /** 资源组绑定对象。 */
    protected binding?: GPUBindGroup;
    /** 缓存绑定偏移。 */
    protected dynamicOffsets?: number[];
}
/** 着色器属性统一缓存实例（80字节）。 */
export declare const Uniform_member_index: {
    /** BUFFER数据成员（使用BUFFER指针读取） */
    readonly buffer_bufferID: Miaoverse.Kernel_member;
    readonly buffer_size: Miaoverse.Kernel_member;
    readonly buffer_addr: Miaoverse.Kernel_member;
    readonly buffer_next: Miaoverse.Kernel_member;
    /** BUFFER_NODE数据成员（使用BUFFER_NODE指针读取） */
    readonly bn_buffer: Miaoverse.Kernel_member;
    readonly bn_bufferID: Miaoverse.Kernel_member;
    readonly bn_offset: Miaoverse.Kernel_member;
    readonly bn_size: Miaoverse.Kernel_member;
    /** SE_UNIFORM数据成员 */
    readonly buffer: Miaoverse.Kernel_member;
    readonly bufferID: Miaoverse.Kernel_member;
    readonly bufferBlockOffset: Miaoverse.Kernel_member;
    readonly bufferBlockSize: Miaoverse.Kernel_member;
    readonly group: Miaoverse.Kernel_member;
    readonly binding: Miaoverse.Kernel_member;
    readonly updated: Miaoverse.Kernel_member;
    readonly unused3: Miaoverse.Kernel_member;
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
