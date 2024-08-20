import * as Miaoverse from "../mod.js"

/** 着色器资源组基类。 */
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

        // 如果默认图集大小重新分配，需要重新创建G0绑定组
        if (this.group == 0) {
            const atlas2D = this._global.device.GetTexture2D(this._global.resources.Texture.defaultAtlas);
            if (this.atlas2D != atlas2D.view) {
                this.atlas2D = atlas2D.view;
                this.bindingID = 0;
            }
        }

        // 绑定资源组到着色器管线
        if (this.bindingID == 0) {
            const binding = this._global.context.CreateBindGroup(this as any);
            if (binding) {
                this.bindingID = binding.id;
                this.binding = binding.binding;
                this.dynamicOffsets = [binding.offset];
            }
        }

        if (this.binding) {
            passEncoder.setBindGroup(this.group, this.binding, this.dynamicOffsets);
        }

        this.readTS = this._global.env.frameTS;
    }

    /**
     * 读取GPU常量缓存占用节点。
     * @param ptr 缓存占用节点指针。
     * @returns 返回缓存占用节点成员数据。
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

    /** GPU常量缓存实例ID。 */
    public get bufferID(): number {
        return this._impl.Get(this._ptr, "bufferID");
    }

    /** 属性块在缓存中的字节大小（256对齐）。 */
    public get size(): number {
        return this._impl.Get(this._ptr, "bufferBlockSize");
    }

    /** 属性块在缓存中的字节偏移（256对齐）。 */
    public get offset(): number {
        return this._impl.Get(this._ptr, "bufferBlockOffset");
    }

    /** 属性块地址指针。 */
    public get blockPtr(): Miaoverse.io_ptr {
        return this._blockPtr;
    }

    /** 缓存地址指针。 */
    public get bufferPtr(): Miaoverse.io_ptr {
        return this._bufferPtr;
    }

    /** 缓存字节大小（256的倍数）。 */
    public get bufferSize(): number {
        return this._bufferSize;
    }

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
export const Uniform_member_index = {
    /** 资源基类（48字节）。 */

    ...Miaoverse.Binary_member_index,

    /** GPU常量缓存实例（16字节，使用BUFFER指针读取）。 */

    /** 缓存实例ID。 */
    buffer_bufferID: ["uscalarGet", "uscalarSet", 1, 0] as Miaoverse.Kernel_member,
    /** 缓存字节大小（256的倍数）。 */
    buffer_size: ["uscalarGet", "uscalarSet", 1, 1] as Miaoverse.Kernel_member,
    /** 缓存内存块地址指针。 */
    buffer_addr: ["ptrGet", "ptrSet", 1, 2] as Miaoverse.Kernel_member,
    /** 下一个缓存实例指针。 */
    buffer_next: ["ptrGet", "ptrSet", 1, 3] as Miaoverse.Kernel_member,

    /** GPU常量缓存占用节点（16字节，我们也可以脱离UNIFORM资源仅请求占用缓存空间，使用BUFFER_NODE指针读取）。 */

    /** GPU常量缓存实例指针。 */
    bn_buffer: ["ptrGet", "ptrSet", 1, 0] as Miaoverse.Kernel_member,
    /** GPU常量缓存实例ID。 */
    bn_bufferID: ["uscalarGet", "uscalarSet", 1, 1] as Miaoverse.Kernel_member,
    /** 占用块在缓存空间中的字节偏移（256对齐）。 */
    bn_offset: ["uscalarGet", "uscalarSet", 1, 2] as Miaoverse.Kernel_member,
    /** 占用块在缓存空间中的字节大小（256对齐）。 */
    bn_size: ["uscalarGet", "uscalarSet", 1, 3] as Miaoverse.Kernel_member,

    /** 着色器资源组基类（80字节）。 */

    /** GPU常量缓存实例指针。 */
    buffer: ["ptrGet", "ptrSet", 1, 12] as Miaoverse.Kernel_member,
    /** GPU常量缓存实例ID。 */
    bufferID: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    /** 占用块在缓存空间中的字节偏移（256对齐）。 */
    bufferBlockOffset: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    /** 占用块在缓存空间中的字节大小（256对齐）。 */
    bufferBlockSize: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

    /** 资源组编号（可选值有0、1、2、3）。 */
    group: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    /** 资源组绑定对象ID。 */
    binding: ["uscalarGet", "uscalarSet", 1, 17] as Miaoverse.Kernel_member,
    /** 属性块数据释放存在更新。 */
    updated: ["uscalarGet", "uscalarSet", 1, 18] as Miaoverse.Kernel_member,
    /** 预留空间。 */
    m_reserved76: ["uscalarGet", "uscalarSet", 1, 19] as Miaoverse.Kernel_member,
} as const;
