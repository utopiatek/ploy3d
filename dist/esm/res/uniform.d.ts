/// <reference types="dist" />
import * as Miaoverse from "../mod.js";
/** 着色器资源组基类。 */
export declare class Uniform<T> extends Miaoverse.Resource<Uniform<T>> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: any, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 绑定资源组到着色器管线（包括统一缓存和所有贴图）。
     * @param passEncoder 渲染通道命令编码器。
     */
    Bind(passEncoder: GPURenderPassEncoder | GPUComputePassEncoder): void;
    /**
     * 读取GPU常量缓存占用节点。
     * @param ptr 缓存占用节点指针。
     * @returns 返回缓存占用节点成员数据。
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
    get updated(): boolean;
    set updated(value: boolean);
    /** 资源绑定组布局ID（同时也是着色器内部实例ID）。 */
    get layoutID(): number;
    /** 资源绑定组属性元组。 */
    get tuple(): Miaoverse.PropTuple;
    /** GPU常量缓存实例ID。 */
    get bufferID(): number;
    /** 属性块在缓存中的字节大小（256对齐）。 */
    get size(): number;
    /** 属性块在缓存中的字节偏移（256对齐）。 */
    get offset(): number;
    /** 属性块地址指针。 */
    get blockPtr(): Miaoverse.io_ptr;
    /** 缓存地址指针。 */
    get bufferPtr(): Miaoverse.io_ptr;
    /** 缓存字节大小（256的倍数）。 */
    get bufferSize(): number;
    /** 资源内核实现。 */
    protected _impl: T & {
        /**
         * 获取资源内核实例属性值。
         * @param ptr 资源内核实例指针。
         * @param key 资源内核实现的数据结构成员名称。
         * @returns 返回对应属性值。
         */
        Get<T>(ptr: Miaoverse.io_ptr, key: keyof typeof Uniform_member_index): T;
        /**
         * 设置资源内核实例属性值。
         * @param ptr 资源内核实例指针。
         * @param key 资源内核实现的数据结构成员名称。
         * @param value 属性值。
         */
        Set(ptr: Miaoverse.io_ptr, key: keyof typeof Uniform_member_index, value: any): void;
    };
    /** 缓存地址指针。 */
    protected _bufferPtr: Miaoverse.io_ptr;
    /** 缓存字节大小（256的倍数）。 */
    protected _bufferSize: number;
    /** 属性块地址指针。 */
    protected _blockPtr: Miaoverse.io_ptr;
    /** 资源组绑定对象。 */
    protected binding?: GPUBindGroup;
    /** 默认图集视图（G0使用）。 */
    protected atlas2D?: GPUTextureView;
    /** 缓存绑定偏移。 */
    protected dynamicOffsets?: number[];
}
/** 着色器资源组基类（80字节）。 */
export declare const Uniform_member_index: {
    /** GPU常量缓存实例（16字节，使用BUFFER指针读取）。 */
    /** 缓存实例ID。 */
    readonly buffer_bufferID: Miaoverse.Kernel_member;
    /** 缓存字节大小（256的倍数）。 */
    readonly buffer_size: Miaoverse.Kernel_member;
    /** 缓存内存块地址指针。 */
    readonly buffer_addr: Miaoverse.Kernel_member;
    /** 下一个缓存实例指针。 */
    readonly buffer_next: Miaoverse.Kernel_member;
    /** GPU常量缓存占用节点（16字节，我们可以脱离UNIFORM资源仅请求占用缓存空间，使用BUFFER_NODE指针读取）。 */
    /** GPU常量缓存实例指针。 */
    readonly bn_buffer: Miaoverse.Kernel_member;
    /** GPU常量缓存实例ID。 */
    readonly bn_bufferID: Miaoverse.Kernel_member;
    /** 占用块在缓存空间中的字节偏移（256对齐）。 */
    readonly bn_offset: Miaoverse.Kernel_member;
    /** 占用块在缓存空间中的字节大小（256对齐）。 */
    readonly bn_size: Miaoverse.Kernel_member;
    /** 着色器资源组基类（80字节）。 */
    /** GPU常量缓存实例指针。 */
    readonly buffer: Miaoverse.Kernel_member;
    /** GPU常量缓存实例ID。 */
    readonly bufferID: Miaoverse.Kernel_member;
    /** 占用块在缓存空间中的字节偏移（256对齐）。 */
    readonly bufferBlockOffset: Miaoverse.Kernel_member;
    /** 占用块在缓存空间中的字节大小（256对齐）。 */
    readonly bufferBlockSize: Miaoverse.Kernel_member;
    /** 资源组编号（可选值有0、1、2、3）。 */
    readonly group: Miaoverse.Kernel_member;
    /** 资源组绑定对象ID。 */
    readonly binding: Miaoverse.Kernel_member;
    /** 属性块数据释放存在更新。 */
    readonly updated: Miaoverse.Kernel_member;
    /** 预留空间。 */
    readonly m_reserved76: Miaoverse.Kernel_member;
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
