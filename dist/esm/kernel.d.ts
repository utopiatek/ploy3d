import * as Miaoverse from "./mod.js";
/** 类型声明：用于与内核交换数据的指针（作为参数或返回值，为了内存安全，我们把它定义为奇怪的类型），地址应以4字节为单位，可共享16G内存空间。 */
export type io_ptr = never;
/** 类型声明：用于与内核传参的32位无符号整型（作为参数和返回值）。 */
export type io_uint = number;
/** 类型声明：用于与内核传参的32位浮点型（作为参数和返回值）。 */
export type io_float = number;
/** 内核接口实例。 */
export declare class Kernel {
    /**
     * 构造函数。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /** 初始化引擎内核。 */
    Init(_imports: {}): Promise<this>;
    /** 模块实例对象。 */
    private _global;
    /** 内核实例。*/
    private _wasm;
    /** 内存实例。*/
    private _memory;
}
/** 共享数据环境。 */
export declare class SharedENV {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化共享数据环境接口。
     * @param buffer 内核内存。
     * @param ptr 共享环境变量数据指针。
     * @returns 返回共享数据环境接口。
     */
    Init(buffer: ArrayBuffer, ptr: io_ptr): Promise<this>;
    /**
     * 重新设置共享数据环境接口。
     * @param buffer 内核内存。
     */
    Reinit(buffer: ArrayBuffer): void;
    /** 在栈上分配空间后调用方法（栈空间在共享内存头部，所以地址永远不会大于4G）。*/
    AllocaCall(size: io_uint, func: (ptr: io_ptr) => void): void;
    /** 格式化C字符串（参数sys、format、argv均为地址）。 */
    Printf(sys: io_uint, bufsize: io_uint, format: io_uint, argv: io_uint): number;
    /** 系统时间滴答。 */
    Tick(gisState: io_uint, worldLngLat: [io_float, io_float, io_float, io_float]): void;
    /** 生成基于注册用户的UUID。 */
    uuidGet2(): Promise<string>;
    /** 生成GUID。 */
    guidGet(): string;
    /** 生成日期和GUID构成的路径。 */
    path_guidGet(): {
        path: string;
        guid: string;
    };
    /** 写入UUID字符串数据。 */
    uuidSet(ptr: io_ptr, intOffset: number, value: string): void;
    /** 读取UUID字符串数据。 */
    uuidGet(ptr: io_ptr, intOffset: number): string;
    /** 解码UUID字符串。 */
    uuidDec(uuid: string): number[];
    /** 编码UUID为字符串。 */
    uuidEnc(uuid: ArrayLike<number>): string;
    /** 写入字节缓存数据（数据大小不一定是四字节对齐，须保证地址不越界4G空间）。 */
    bufferSet(ptr: io_ptr, byteOffset: number, buffer: ArrayBuffer): void;
    /** 写入字符串数据（以0结束）。 */
    stringSet(ptr: io_ptr, intOffset: number, value: string, maxLength?: number): void;
    /** 读取字符串数据（遇0结束）。 */
    stringGet(ptr: io_ptr): string;
    /** 写入指定类型数组数据（不允许写入字节类型数组）。 */
    arraySet(type: number, ptr: io_ptr, intOffset: number, data: ArrayLike<number>): void;
    /** 读取指定类型数组数据（不允许读取字节类型数组）。 */
    arrayGet(type: number, ptr: io_ptr, intOffset: number, count: number): ArrayLike<number>;
    /** 写入浮点型数组数据。 */
    farraySet(ptr: io_ptr, intOffset: number, data: ArrayLike<number>): void;
    /** 读取浮点型数组数据。 */
    farrayGet(ptr: io_ptr, intOffset: number, count: number): Float32Array;
    /** 引用浮点型数组数据。 */
    farrayRef(ptr: io_ptr, intOffset: number, count: number): Float32Array;
    /** 写入无符号整型数组数据。 */
    uarraySet(ptr: io_ptr, intOffset: number, data: ArrayLike<number>): void;
    /** 读取无符号整型数组数据。 */
    uarrayGet(ptr: io_ptr, intOffset: number, count: number): Uint32Array;
    /** 引用无符号整型数组数据。 */
    uarrayRef(ptr: io_ptr, intOffset: number, count: number): Uint32Array;
    /** 写入浮点型数据。 */
    fscalarSet(ptr: io_ptr, intOffset: number, value: number): void;
    /** 读取浮点型数据。 */
    fscalarGet(ptr: io_ptr, intOffset: number): number;
    /** 写入无符号整型数据。 */
    uscalarSet(ptr: io_ptr, intOffset: number, value: number): void;
    /** 读取无符号整型数据。 */
    uscalarGet(ptr: io_ptr, intOffset: number): number;
    /** 写入整型数据。 */
    iscalarSet(ptr: io_ptr, intOffset: number, value: number): void;
    /** 读取整型数据。 */
    iscalarGet(ptr: io_ptr, intOffset: number): number;
    /** 写入指针数据。 */
    ptrSet(ptr: io_ptr, intOffset: number, value: io_ptr): void;
    /** 读取指针数据。 */
    ptrGet(ptr: io_ptr, intOffset: number): io_ptr;
    /** 数据指针默认值。 */
    ptrZero(): io_ptr;
    /** 数据指针构造。 */
    ptrCreate(ptr: number): io_ptr;
    /** 数据指针移动。 */
    ptrMove(ptr: io_ptr, intOffset: number): io_ptr;
    /** 数据指针是否有效。 */
    ptrValid(ptr: io_ptr): boolean;
    /** 数据指针值（以4字节为单位的地址）。 */
    ptrValue(ptr: io_ptr): number;
    /** 系统内存空间。 */
    get buffer(): ArrayBuffer;
    /** 系统内存空间视图。 */
    get bufferView(): ArrayBufferView;
    /** 系统帧时间戳。 */
    get frameTS(): number;
    /** 统一缓存动态偏移地址对齐。 */
    get ubufferAlign(): number;
    /** 统一缓存大小。 */
    get ubufferSize(): number;
    /** 统一贴图大小。 */
    get utextureSize(): number;
    /** G0常量缓存大小。 */
    get sizeG0(): number;
    /** G1常量缓存大小。 */
    get sizeG1(): number;
    /** 是否翻转相机Z值。 */
    get reversedZ(): number;
    /** 是否使用WebGL API。 */
    get webGL(): number;
    /** 阴影贴图大小。 */
    get shadowMapSize(): number;
    /** 默认材质指针。 */
    get defaultG2(): io_ptr;
    set defaultG2(g2: io_ptr);
    /** 世界坐标原点经纬度或者地形启用状态更新时间戳。 */
    get gisTS(): number;
    /** 当前GIS状态：0-不启用GIS，1-启用一般GIS，2-启用带地形GIS。 */
    get gisState(): number;
    /** 当前世界坐标原点经纬度和墨卡托坐标。 */
    get worldLngLat(): Float32Array;
    /** 模块实例对象。 */
    private _global;
    /** 环境数据指针。 */
    private _ptr;
    /** 字符串解码器。 */
    private _textDecoder;
    /** 字符串编码器。 */
    private _textEncoder;
    /** 无符号字节类型内存视图。 */
    private _ubview;
    /** 整型类型内存视图。 */
    private _iview;
    /** 无符号整型类型内存视图。 */
    private _uview;
    /** 单精度浮点型类型内存视图。 */
    private _fview;
    /** 双精度浮点型类型内存视图。 */
    private _dview;
    /** 各类型内存视图（需匹配PropFormat声明）。 */
    private _view;
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
    /** 导出引擎模块对象实现。 */
    Engine_Export: () => number[];
}