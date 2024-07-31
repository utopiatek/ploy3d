
/** 子线程代码依赖该文件，此处定义一个引擎模块抽象。 */
type Ploy3D = {
    /** 日志打印方法。 */
    Track: (msg: string, ctrl?: number) => void;
    /** 启动时间戳。 */
    startTS: number;
    /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
    uid: number;
    /** 是否使用的是WebGL图形API*/
    webgl: boolean;
    /** 内核代码。 */
    kernelCode: ArrayBuffer;
    /** 内核管理器。 */
    kernel: Kernel;
    /** 共享数据环境。 */
    env: SharedENV;
    /** 内核接口。 */
    internal: Internal;
}

/** 类型声明：用于与内核交换数据的指针（作为参数或返回值，为了内存安全，我们把它定义为奇怪的类型），地址应以4字节为单位，可共享16G内存空间。 */
export type io_ptr = never;
/** 类型声明：用于与内核传参的32位无符号整型（作为参数和返回值）。 */
export type io_uint = number;
/** 类型声明：用于与内核传参的32位浮点型（作为参数和返回值）。 */
export type io_float = number;

/** 内核接口实例。 */
export class Kernel {
    /**
     * 构造函数。
     */
    public constructor(_global: Ploy3D) {
        this._global = _global;
    }

    /** 初始化引擎内核。 */
    public async Init(_imports: {
        // ...
    }) {
        // 页面最大数量2048 * 16 = 2GB
        const pageMax = 2048 * 16;
        // 当前页面数量256 * 16 = 256MB
        let pageCount = 256 * 16;
        // 累计扩展次数，每次扩展256MB
        let growCount = 0;

        // 内存对象
        const memory = new WebAssembly.Memory({ initial: pageCount, maximum: pageMax, shared: false });

        // 内存扩展方法
        const memory_grow = (size: io_uint): io_ptr => {
            const perSize_ = 256 * 1024 * 1024;
            const pageCount_ = perSize_ / 64 / 1024;

            if (size !== perSize_) {
                size = perSize_;
                this._global.Track("Kernel.memory_grow: 每次内存增长应为256M，当前size=" + (size / 1024 / 1024) + "！", 2);
            }

            if (pageMax < pageCount + pageCount_) {
                this._global.Track("Kernel.memory_grow: 系统内存不足（最多可分配2G）：" + pageCount + " " + pageCount_ + "！", 3);
                return 0 as never;
            }

            memory.grow(pageCount_);
            pageCount += pageCount_;
            growCount += 1;

            this._global.env.Reinit(memory.buffer);

            return this._global.env.ptrCreate(growCount * (perSize_ >> 2));
        };

        // 配置导入接口
        const imports = {
            // 导入系统环境支持
            env: {
                // 导入内存对象
                memory: memory,
                // 虚拟机内存增长方法
                memory_grow: memory_grow,
                // 格式化输出到流文件
                xprintf: (sys_: io_uint, bufsize: io_uint, format_: io_uint, argv_: io_uint) => {
                    if (!this._global.env) {
                        return 0;
                    }

                    return this._global.env.Printf(sys_, bufsize, format_, argv_);
                },
                // 格式化输出到流文件
                xprintf_va_list: (sys_: io_uint, bufsize: io_uint, format_: io_uint, argv_: io_uint) => {
                    if (!this._global.env) {
                        return 0;
                    }

                    return this._global.env.Printf(sys_, bufsize, format_, argv_);
                },
                // 取模方法
                fmodf: (x: number, y: number) => { return x % y },
                // 异常中断程序
                abort: () => {
                    alert("abort");
                },
                // 时钟函数
                clock: () => {
                    return (Date.now() - this._global.startTS);
                },
                // 注册在动态库卸载或应用退出时需要调用的函数
                __cxa_atexit: () => { this._global.Track("__cxa_atexit", 3); return 0; },
                // 纯虚函数的异常处理函数
                __cxa_pure_virtual: () => { this._global.Track("__cxa_pure_virtual", 3); },
                // UBSan数组越界访问等未定义行为反馈方法
                __ubsan_handle_pointer_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_pointer_overflow", a, b, c); },
                __ubsan_handle_out_of_bounds: (a: number, b: number, c: number) => { console.error("__ubsan_handle_out_of_bounds", a, b, c); },
                __ubsan_handle_add_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_add_overflow", a, b, c); },
                __ubsan_handle_sub_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_sub_overflow", a, b, c); },
                __ubsan_handle_invalid_builtin: (a: number, b: number, c: number) => { console.error("__ubsan_handle_invalid_builtin", a, b, c); },
                __ubsan_handle_type_mismatch_v1: (a: number, b: number, c: number) => { console.error("__ubsan_handle_type_mismatch_v1", a, b, c); },
                __ubsan_handle_shift_out_of_bounds: (a: number, b: number, c: number) => { console.error("__ubsan_handle_shift_out_of_bounds", a, b, c); },
                __ubsan_handle_float_cast_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_float_cast_overflow", a, b, c); },
                __ubsan_handle_divrem_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_divrem_overflow", a, b, c); },
                __ubsan_handle_mul_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_mul_overflow", a, b, c); },
                __ubsan_handle_negate_overflow: (a: number, b: number, c: number) => { console.error("__ubsan_handle_negate_overflow", a, b, c); },
                __ubsan_handle_load_invalid_value: (a: number, b: number, c: number) => { console.error("__ubsan_handle_load_invalid_value", a, b, c); },
                __ubsan_handle_builtin_unreachable: (a: number, b: number, c: number) => { console.error("__ubsan_handle_builtin_unreachable", a, b, c); },
                __ubsan_handle_missing_return: (a: number, b: number, c: number) => { console.error("__ubsan_handle_missing_return", a, b, c); },
                __ubsan_handle_nonnull_return_v1: (a: number, b: number, c: number) => { console.error("__ubsan_handle_nonnull_return_v1", a, b, c); },
            },
            // 导入数学库
            Math: Math,
            // 将相关虚拟机接口导入引擎
            VM: _imports
        };

        // 创建内核模块
        const module = await WebAssembly.instantiate(this._global.kernelCode, imports as any);
        const instance: any = await module.instance;

        const ptrEnv = instance.exports.System_Startup(instance.exports.__stack_pointer.value >> 2) as never;

        this._wasm = instance;
        this._memory = memory;

        this._global.internal = instance.exports;
        this._global.env = await (new SharedENV(this._global)).Init(memory.buffer, ptrEnv);

        return this;
    }

    /** 模块实例对象。 */
    private _global: Ploy3D;
    /** 内核实例。*/
    private _wasm: WebAssembly.Instance;
    /** 内存实例。*/
    private _memory: WebAssembly.Memory;
}

/** 共享数据环境。 */
export class SharedENV {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Ploy3D) {
        this._global = _global;

        this._textDecoder = new TextDecoder('utf-8');
        this._textEncoder = new TextEncoder();
    }

    /**
     * 初始化共享数据环境接口。
     * @param buffer 内核内存。
     * @param ptr 共享环境变量数据指针。
     * @returns 返回共享数据环境接口。
     */
    public async Init(buffer: ArrayBuffer, ptr: io_ptr) {
        this.Reinit(buffer);

        this._ptr = ptr;

        this.uscalarSet(this._ptr, Env_member.frameTS, 1);
        this.uscalarSet(this._ptr, Env_member.ubufferAlign, 256);
        this.uscalarSet(this._ptr, Env_member.ubufferSize, 4 * 1024 * 1024);
        this.uscalarSet(this._ptr, Env_member.utextureSize, 4096);
        this.uscalarSet(this._ptr, Env_member.sizeG0, 2048);
        this.uscalarSet(this._ptr, Env_member.sizeG1, 256);
        this.uscalarSet(this._ptr, Env_member.reversedZ, 1);
        this.uscalarSet(this._ptr, Env_member.webGL, this._global.webgl ? 1 : 0);
        this.uscalarSet(this._ptr, Env_member.shadowMapSize, 1024);
        this.uscalarSet(this._ptr, Env_member.gisTS, 0);
        this.uscalarSet(this._ptr, Env_member.gisState, 0);
        this.farraySet(this._ptr, Env_member.worldLngLat, [0.0, 0.0, 0.0, 0.0]);

        return this;
    }

    /**
     * 重新设置共享数据环境接口。
     * @param buffer 内核内存。
     */
    public Reinit(buffer: ArrayBuffer): void {
        this._ubview = new Uint8Array(buffer);
        this._iview = new Int32Array(buffer);
        this._uview = new Uint32Array(buffer);
        this._fview = new Float32Array(buffer);
        this._dview = new Float64Array(buffer);
        this._view = [this._ubview, this._iview, this._uview, this._fview];
    }

    /** 在栈上分配空间后调用方法（栈空间在共享内存头部，所以地址永远不会大于4G）。*/
    public AllocaCall(size: io_uint, func: (ptr: io_ptr) => void): void {
        size = (size + 0x3) & 0xFFFFFFFC;

        const addr = this._global.internal.__stack_pointer.value - size;
        this._global.internal.__stack_pointer.value = addr;
        func(this.ptrCreate(addr >> 2));
        this._global.internal.__stack_pointer.value = addr + size;
    }

    /** 格式化C字符串（参数sys、format、argv均为地址）。 */
    public Printf(sys: io_uint, bufsize: io_uint, format: io_uint, argv: io_uint): number {
        const view = this._ubview;

        if (0 === format) {
            return 0;
        }

        let end = format;
        while (0 !== view[end++]);
        let str = this._textDecoder.decode(view.subarray(format, end));

        let ch = 0; end = format;
        let argn = argv / 4;

        while (0 !== (ch = view[end++])) {
            if (37 === ch) {
                const ch2 = view[end];
                switch (ch2) {
                    case 100: // %d
                        str = str.replace("%d", "" + this._iview[argn++]);
                        break;
                    case 117: // %u
                        str = str.replace("%u", "" + this._uview[argn++]);
                        break;
                    case 102: // %f
                        str = str.replace("%f", "" + this._dview[argn / 2]); argn += 2;
                        break;
                    case 115: // %s
                        str = str.replace("%s", () => {
                            const beg_ = this._uview[argn++];
                            let end_ = beg_;
                            while (0 !== view[end_++]);
                            return this._textDecoder.decode(view.slice(beg_, end_ - 1));
                        });
                        break;
                    default: // 不支持格式
                        this._global.Track(str, 0);
                        return str.length;
                }
            }
        }

        if (sys < 1024) {
            if (1 === sys) {
                this._global.Track(str, 0);
            }
            else if (2 === sys) {
                this._global.Track(str, 3);
            }
            else if (3 === sys) {
                this._global.Track(str, 1);
            }
            else if (4 === sys) {
                this._global.Track(str, 2);
            }
            else {
                this._global.Track(`fprintf: ${sys}  ${bufsize} ${str} ${argv}`, 3);
            }
        }
        else {
            const carray = this._textEncoder.encode(str);
            const size = carray.length > bufsize ? bufsize : carray.length;
            const buffer = view.subarray(sys, sys + size);

            buffer.set(carray);
            buffer[size - 1] = 0;

            return size;
        }

        return str.length;
    }

    /** 系统时间滴答。 */
    public Tick(gisState: io_uint, worldLngLat: [io_float, io_float, io_float, io_float]): void {
        this.uscalarSet(this._ptr, Env_member.frameTS, (Date.now() - this._global.startTS));

        const _gisState = this.uscalarGet(this._ptr, Env_member.gisState);
        const _worldLngLat = this.farrayGet(this._ptr, Env_member.worldLngLat, 2);

        if (gisState != _gisState ||
            Math.abs(worldLngLat[0] - _worldLngLat[0]) > 0.0001 ||
            Math.abs(worldLngLat[1] - _worldLngLat[1]) > 0.0001) {

            this.uscalarSet(this._ptr, Env_member.gisTS, this.frameTS);
            this.uscalarSet(this._ptr, Env_member.gisState, gisState);
            this.farraySet(this._ptr, Env_member.worldLngLat, worldLngLat);
        }
    }

    /** 生成基于注册用户的UUID。 */
    public async uuidGet2() {
        const uid = this._global.uid;

        return new Promise<string>(function (resolve) {
            setTimeout(function () {
                // 时间戳，分配时长0.1秒，即1秒内只能分配10个时间戳，4900天内不重复
                const ts = Math.floor(Date.now() * 0.01) & 0xFFFFFFFF;
                // uid-ts-ver#type-index
                resolve(`${uid}-${ts}-1`);
            }, 100);
        });
    }

    /** 生成GUID。 */
    public guidGet() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /** 生成日期和GUID构成的路径。 */
    public path_guidGet() {
        const guid = this.guidGet();
        const path = (new Date()).toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            year: "2-digit",
            month: "2-digit",
            day: "2-digit"
        }) + "/" + guid;

        return { path, guid };
    }

    /** 写入UUID字符串数据。 */
    public uuidSet(ptr: io_ptr, intOffset: number, value: string) {
        this.uarraySet(ptr, intOffset, this.uuidDec(value));
    }
    /** 读取UUID字符串数据。 */
    public uuidGet(ptr: io_ptr, intOffset: number): string {
        const uuid = this.uarrayGet(ptr, intOffset, 3);
        return this.uuidEnc(uuid);
    }
    /** 解码UUID字符串。 */
    public uuidDec(uuid: string) {
        if (!uuid) {
            return [0, 0, 0];
        }

        const parts = uuid.split("-");
        const uid = parseInt(parts[0]);
        const time = parseInt(parts[1]);
        const ver = parseInt(parts[2]);
        const type = parseInt(parts[3]);
        const index = parseInt(parts[4]);

        return [
            (ver << 24) + (type << 16) + index,
            time,
            uid
        ];
    }
    /** 编码UUID为字符串。 */
    public uuidEnc(uuid: ArrayLike<number>) {
        const index = uuid[0] & 0xFFFF;
        const type = (uuid[0] >> 16) & 0xFF;
        const ver = uuid[0] >> 24;
        const time = uuid[1];
        const uid = uuid[2];

        return `${uid}-${time}-${ver}-${type}-${index}`;
    }

    /** 写入字节缓存数据（数据大小不一定是四字节对齐，须保证地址不越界4G空间）。 */
    public bufferSet1(ptr: io_ptr, buffer: ArrayBuffer, byteOffset: number, byteLength: number): void {
        this._ubview.set(new Uint8Array(buffer, byteOffset, byteLength), ptr << 2);
    }

    /** 写入字符串数据（以0结束）。 */
    public stringSet(ptr: io_ptr, intOffset: number, value: string, maxLength = 64) {
        const view = this._ubview;
        const beg = this.ptrMove(ptr, intOffset) << 2;

        const carray = this._textEncoder.encode(value);
        const size = carray.length > maxLength ? maxLength : carray.length;
        const buffer = view.subarray(beg, beg + size);

        buffer.set(carray);
        buffer[size - 1] = 0;
    }
    /** 读取字符串数据（遇0结束）。 */
    public stringGet(ptr: io_ptr): string {
        const view = this._ubview;
        const beg = ptr << 2;

        let end = beg;

        while (0 !== view[end++]);

        const str = this._textDecoder.decode(view.subarray(beg, end - 1));

        return str;
    }

    /** 写入指定类型数组数据（不允许写入字节类型数组）。 */
    public arraySet(type: number, ptr: io_ptr, intOffset: number, data: ArrayLike<number>): void {
        if (0 === type) {
            this._global.Track("SharedENV.arraySet: 不允许写入字节类型数组!", 3);
            return;
        }

        this._view[type].set(data, ptr + intOffset);
    }
    /** 读取指定类型数组数据（不允许读取字节类型数组）。 */
    public arrayGet(type: number, ptr: io_ptr, intOffset: number, count: number): ArrayLike<number> {
        if (0 === type) {
            this._global.Track("SharedENV.arrayGet: 不允许读取字节类型数组!", 3);
            return null;
        }

        return this._view[type].slice(ptr + intOffset, ptr + intOffset + count);
    }

    /** 写入浮点型数组数据。 */
    public farraySet(ptr: io_ptr, intOffset: number, data: ArrayLike<number>): void {
        this._fview.set(data, ptr + intOffset);
    }
    /** 读取浮点型数组数据。 */
    public farrayGet(ptr: io_ptr, intOffset: number, count: number): Float32Array {
        return this._fview.slice(ptr + intOffset, ptr + intOffset + count);
    }
    /** 引用浮点型数组数据。 */
    public farrayRef(ptr: io_ptr, intOffset: number, count: number): Float32Array {
        return this._fview.subarray(ptr + intOffset, ptr + intOffset + count);
    }

    /** 写入无符号整型数组数据。 */
    public uarraySet(ptr: io_ptr, intOffset: number, data: ArrayLike<number>): void {
        this._uview.set(data, ptr + intOffset);
    }
    /** 读取无符号整型数组数据。 */
    public uarrayGet(ptr: io_ptr, intOffset: number, count: number): Uint32Array {
        return this._uview.slice(ptr + intOffset, ptr + intOffset + count);
    }
    /** 引用无符号整型数组数据。 */
    public uarrayRef(ptr: io_ptr, intOffset: number, count: number): Uint32Array {
        return this._uview.subarray(ptr + intOffset, ptr + intOffset + count);
    }

    /** 写入浮点型数据。 */
    public fscalarSet(ptr: io_ptr, intOffset: number, value: number): void {
        this._fview[ptr + intOffset] = value;
    }
    /** 读取浮点型数据。 */
    public fscalarGet(ptr: io_ptr, intOffset: number): number {
        return this._fview[ptr + intOffset];
    }

    /** 写入无符号整型数据。 */
    public uscalarSet(ptr: io_ptr, intOffset: number, value: number): void {
        this._uview[ptr + intOffset] = value;
    }
    /** 读取无符号整型数据。 */
    public uscalarGet(ptr: io_ptr, intOffset: number): number {
        return this._uview[ptr + intOffset];
    }

    /** 写入整型数据。 */
    public iscalarSet(ptr: io_ptr, intOffset: number, value: number): void {
        this._iview[ptr + intOffset] = value;
    }
    /** 读取整型数据。 */
    public iscalarGet(ptr: io_ptr, intOffset: number): number {
        return this._iview[ptr + intOffset];
    }

    /** 写入指针数据。 */
    public ptrSet(ptr: io_ptr, intOffset: number, value: io_ptr): void {
        this._uview[ptr + intOffset] = value;
    }
    /** 读取指针数据。 */
    public ptrGet(ptr: io_ptr, intOffset: number): io_ptr {
        return this._uview[ptr + intOffset] as never;
    }
    /** 数据指针默认值。 */
    public ptrZero(): io_ptr {
        return 0 as never;
    }
    /** 数据指针构造。 */
    public ptrCreate(ptr: number): io_ptr {
        return ptr as never;
    }
    /** 数据指针移动。 */
    public ptrMove(ptr: io_ptr, intOffset: number): io_ptr {
        return (ptr + intOffset) as never;
    }
    /** 数据指针是否有效。 */
    public ptrValid(ptr: io_ptr): boolean {
        return 0 < ptr;
    }
    /** 数据指针值（以4字节为单位的地址）。 */
    public ptrValue(ptr: io_ptr): number {
        return ptr;
    }

    /** 系统内存空间。 */
    public get buffer(): ArrayBuffer {
        return this._ubview.buffer;
    }
    /** 系统内存空间视图。 */
    public get bufferView(): ArrayBufferView {
        return this._ubview;
    }

    /** 字符串解码器。 */
    public get textDecoder() {
        return this._textDecoder;
    }
    /** 字符串编码器。 */
    public get textEncoder() {
        return this._textEncoder;
    }

    /** 系统帧时间戳。 */
    public get frameTS(): number {
        return this.uscalarGet(this._ptr, Env_member.frameTS);
    }
    /** 统一缓存动态偏移地址对齐。 */
    public get ubufferAlign(): number {
        return this.uscalarGet(this._ptr, Env_member.ubufferAlign);
    }
    /** 统一缓存大小。 */
    public get ubufferSize(): number {
        return this.uscalarGet(this._ptr, Env_member.ubufferSize);
    }
    /** 统一贴图大小。 */
    public get utextureSize(): number {
        return this.uscalarGet(this._ptr, Env_member.utextureSize);
    }
    /** G0常量缓存大小。 */
    public get sizeG0(): number {
        return this.uscalarGet(this._ptr, Env_member.sizeG0);
    }
    /** G1常量缓存大小。 */
    public get sizeG1(): number {
        return this.uscalarGet(this._ptr, Env_member.sizeG1);
    }
    /** 是否翻转相机Z值。 */
    public get reversedZ(): number {
        return this.uscalarGet(this._ptr, Env_member.reversedZ);
    }
    /** 是否使用WebGL API。 */
    public get webGL(): number {
        return this.uscalarGet(this._ptr, Env_member.webGL);
    }
    /** 阴影贴图大小。 */
    public get shadowMapSize(): number {
        return this.uscalarGet(this._ptr, Env_member.shadowMapSize);
    }
    /** 默认材质指针。 */
    public get defaultG2(): io_ptr {
        return this.ptrGet(this._ptr, Env_member.defaultG2);
    }
    public set defaultG2(g2: io_ptr) {
        this.ptrSet(this._ptr, Env_member.defaultG2, g2);
    }
    /** 世界坐标原点经纬度或者地形启用状态更新时间戳。 */
    public get gisTS(): number {
        return this.uscalarGet(this._ptr, Env_member.gisTS);
    }
    /** 当前GIS状态：0-不启用GIS，1-启用一般GIS，2-启用带地形GIS。 */
    public get gisState(): number {
        return this.uscalarGet(this._ptr, Env_member.gisState);
    }
    /** 当前世界坐标原点经纬度和墨卡托坐标。 */
    public get worldLngLat(): Float32Array {
        return this.farrayGet(this._ptr, Env_member.worldLngLat, 4);
    }

    /** 模块实例对象。 */
    private _global: Ploy3D;

    /** 环境数据指针。 */
    private _ptr: io_ptr;

    /** 字符串解码器。 */
    private _textDecoder: TextDecoder;
    /** 字符串编码器。 */
    private _textEncoder: TextEncoder;

    /** 无符号字节类型内存视图。 */
    private _ubview: Uint8Array;
    /** 整型类型内存视图。 */
    private _iview: Int32Array;
    /** 无符号整型类型内存视图。 */
    private _uview: Uint32Array;
    /** 单精度浮点型类型内存视图。 */
    private _fview: Float32Array;
    /** 双精度浮点型类型内存视图。 */
    private _dview: Float64Array;
    /** 各类型内存视图（需匹配PropFormat声明）。 */
    private _view: (Uint8Array | Int32Array | Uint32Array | Float32Array)[];
}

/** 内核接口。 */
export interface Internal {
    /** 栈指针，向低地址增长。 */
    __stack_pointer: WebAssembly.Global;
    /** 间接函数索引表。 */
    __indirect_function_table: WebAssembly.Table;

    /** 系统启动方法。 */
    System_Startup: (ptr: io_ptr) => io_ptr;
    /** 系统关闭方法。 */
    System_Shutdown: () => void;
    /** 系统运行状态分析。 */
    System_Analyse: () => io_ptr;
    /** 系统堆内存分配方法。 */
    System_New: (size: io_uint) => io_ptr;
    /** 系统堆内存回收方法。 */
    System_Delete: (ptr: io_ptr) => void;

    /** 转换压缩纹理数据。 */
    Util_Transcoder_ktx2: (data: io_ptr, size: io_uint, format: io_uint) => io_ptr;
    /** 释放压缩纹理数据。 */
    Util_Free_ktx2: (ptr: io_ptr) => void;
    /** 解压缩LZ4数据。 */
    Util_Decompress_lz4: (src: io_ptr, dst: io_ptr, compressedSize: io_uint, dstCapacity: io_uint) => io_uint;
    /** 压缩LZ4数据。 */
    Util_Compress_lz4: (src: io_ptr, dst: io_ptr, srcSize: io_uint, dstCapacity: io_uint) => io_uint;
    /** 解压缩LZMA数据。 */
    Util_Decompress_lzma: (dest: io_ptr, destSize: io_uint, src: io_ptr, drcSize: io_uint) => io_uint;
    /** 压缩LZMA数据。 */
    Util_Compress_lzma: (dest: io_ptr, destSize: io_uint, src: io_ptr, srcSize: io_uint) => io_uint;
    /** 导出引擎模块对象实现。 */
    Engine_Export: () => number[];
}

/** 共享环境变量成员索引。 */
export const enum Env_member {
    /** 系统帧时间戳。 */
    frameTS = 0,
    /** 统一缓存动态偏移地址对齐。 */
    ubufferAlign,
    /** 统一缓存大小。 */
    ubufferSize,
    /** 统一贴图大小。 */
    utextureSize,
    /** G0资源组常量缓存大小。 */
    sizeG0,
    /** G1资源组常量缓存大小。 */
    sizeG1,
    /** 是否翻转相机Z值。 */
    reversedZ,
    /** 是否使用WebGL API。 */
    webGL,
    /** 阴影贴图大小。 */
    shadowMapSize,
    /** 默认材质指针。 */
    defaultG2,
    /** 世界坐标原点经纬度或者地形启用状态更新时间戳。 */
    gisTS,
    /** 当前GIS状态：0-不启用GIS，1-启用一般GIS，2-启用带地形GIS。 */
    gisState,
    /** 当前世界坐标原点经纬度。 */
    worldLngLat,
}
