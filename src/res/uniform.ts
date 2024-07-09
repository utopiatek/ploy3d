import * as Miaoverse from "../mod.js"

/** 统一缓存实例。 */
export class Uniform<T> extends Miaoverse.Resource<Uniform<T>> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: any, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);

        const buffer = this._impl.Get<Miaoverse.io_ptr>(ptr, "buffer");

        this._bufferPtr = this._impl.Get<Miaoverse.io_ptr>(buffer, "buffer_addr");
        this._bufferSize = this._impl.Get<number>(buffer, "buffer_size");
        this._blockPtr = this._global.env.ptrMove(this._bufferPtr, this.offset >> 2);
    }

    /**
     * 绑定资源组到着色器管线（包括统一缓存和所有贴图）。
     * @param passEncoder 渲染通道命令编码器。
     */
    public Bind(passEncoder: GPURenderPassEncoder) {
        // 如果数据有更新，则提交到GPU
        if (this.updated) {
            this._global.device.WriteBuffer(
                this.bufferID,                          // 缓存实例ID
                this.offset,                            // 缓存写入偏移
                this._global.env.buffer,                // 数据源
                (this.bufferPtr << 2) + this.offset,    // 数据源偏移
                this.size);                             // 写入大小

            this.updated = false;
            this.writeTS = this._global.env.frameTS;
        }

        // 绑定资源组到着色器管线
        if (this.bindingID == 0) {
            this.bindingID = 1;
            this.binding = this._global.context.CreateBindGroup(this as any);
            this.dynamicOffsets = [this.offset];
        }

        if (this.binding) {
            passEncoder.setBindGroup(this.group, this.binding, this.dynamicOffsets);
        }

        this.readTS = this._global.env.frameTS;
    }

    /**
     * 读取GPU统一缓存占用节点成员。
     * @param ptr 缓存节点指针。
     * @returns 返回缓存节点成员数据。
     */
    public ReadBufferNode(ptr: Miaoverse.io_ptr) {
        const buffer = this._impl.Get<Miaoverse.io_ptr>(ptr, "bn_buffer");
        const bufferID = this._impl.Get<number>(ptr, "bn_bufferID");
        const offset = this._impl.Get<number>(ptr, "bn_offset");
        const size = this._impl.Get<number>(ptr, "bn_size");

        return { buffer, bufferID, offset, size };
    }

    /** 属性上传GPU时间戳。 */
    public get writeTS(): number {
        return this._impl.Get(this._ptr, "writeTS");
    }
    public set writeTS(value: number) {
        this._impl.Set(this._ptr, "writeTS", value);
    }

    /** 属性用于渲染读取时间戳。 */
    public get readTS(): number {
        return this._impl.Get(this._ptr, "readTS");
    }
    public set readTS(value: number) {
        this._impl.Set(this._ptr, "readTS", value);
    }

    /** 资源组编号（可选值有0、1、2、3）。 */
    public get group(): number {
        return this._impl.Get(this._ptr, "group");
    }

    /** 资源组绑定对象ID（0或1）。 */
    public get bindingID(): number {
        return this._impl.Get(this._ptr, "binding");
    }
    public set bindingID(value: number) {
        this._impl.Set(this._ptr, "binding", value);
    }

    /** 属性块数据更新状态。 */
    public get updated(): boolean {
        return this._impl.Get<number>(this._ptr, "updated") > 0;
    }
    public set updated(value: boolean) {
        this._impl.Set(this._ptr, "updated", value ? 1 : 0);
    }

    /** 资源绑定组布局ID（同时也是着色器内部实例ID）。 */
    public get layoutID(): number {
        return this.group + 1;
    }

    /** 资源绑定组属性元组。 */
    public get tuple(): Miaoverse.PropTuple {
        return (this._impl as any)._global.context.GetShader(this.layoutID).tuple;
    }

    /** GPU统一缓存实例ID。 */
    public get bufferID(): number {
        return this._impl.Get(this._ptr, "bufferID");
    }

    /** 数据块在缓存中的字节大小（256对齐）。 */
    public get size(): number {
        return this._impl.Get(this._ptr, "bufferBlockSize");
    }

    /** 数据块在缓存中的字节偏移（256对齐）。 */
    public get offset(): number {
        return this._impl.Get(this._ptr, "bufferBlockOffset");
    }

    /** 属性缓存块地址指针。 */
    public get blockPtr(): Miaoverse.io_ptr {
        return this._blockPtr;
    }

    /** 缓存内存块地址指针。 */
    public get bufferPtr(): Miaoverse.io_ptr {
        return this._bufferPtr;
    }

    /** 缓存字节大小（256的倍数）。 */
    public get bufferSize(): number {
        return this._bufferSize;
    }

    /** 内核实现。 */
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

/** 统一缓存内核实现的数据结构成员列表。 */
export const Uniform_member_index = {
    /** BINARY数据成员 */

    ...Miaoverse.Binary_member_index,

    /** BUFFER数据成员（使用BUFFER指针读取） */

    buffer_bufferID: ["uscalarGet", "uscalarSet", 1, 0] as Miaoverse.Kernel_member,
    buffer_size: ["uscalarGet", "uscalarSet", 1, 1] as Miaoverse.Kernel_member,
    buffer_addr: ["ptrGet", "ptrSet", 1, 2] as Miaoverse.Kernel_member,
    buffer_next: ["ptrGet", "ptrSet", 1, 3] as Miaoverse.Kernel_member,

    /** BUFFER_NODE数据成员（使用BUFFER_NODE指针读取） */

    bn_buffer: ["ptrGet", "ptrSet", 1, 0] as Miaoverse.Kernel_member,
    bn_bufferID: ["uscalarGet", "uscalarSet", 1, 1] as Miaoverse.Kernel_member,
    bn_offset: ["uscalarGet", "uscalarSet", 1, 2] as Miaoverse.Kernel_member,
    bn_size: ["uscalarGet", "uscalarSet", 1, 3] as Miaoverse.Kernel_member,

    /** UNIFORM数据成员 */

    buffer: ["ptrGet", "ptrSet", 1, 12] as Miaoverse.Kernel_member,
    bufferID: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    bufferBlockOffset: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    bufferBlockSize: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

    group: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    binding: ["uscalarGet", "uscalarSet", 1, 17] as Miaoverse.Kernel_member,
    updated: ["uscalarGet", "uscalarSet", 1, 18] as Miaoverse.Kernel_member,
    unused3: ["uscalarGet", "uscalarSet", 1, 19] as Miaoverse.Kernel_member,
} as const;
