import * as Miaoverse from "../mod.js";
/** 文件存储器。 */
export declare class FileStorage {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     * @param root 根路径句柄。
     */
    constructor(_global: Miaoverse.Ploy3D, root?: FileSystemDirectoryHandle);
    /**
     * 清除对象。
     */
    Dispose(): Promise<void>;
    /**
     * 读取文件存储器中指定相对路径文件数据。
     * @param path 指定相对路径（以'/'分隔）。
     * @param filename 文件名称。
     * @param type 文件类型。
     * @returns 返回文件数据。
     */
    ReadFile<T>(path: string, filename: string, type: "text" | "arrayBuffer" | "json"): Promise<any>;
    /**
     * 向文件存储器中指定相对路径覆盖写入文件。
     * @param path 指定相对路径（以'/'分隔）。
     * @param filename 文件名称，如果已存在将被覆盖。
     * @param data 文件数据。
     */
    WriteFile(path: string, filename: string, data: string | BufferSource | Blob): Promise<void>;
    /**
     * 遍历处理指定相对路径下的内容。
     * @param path 指定相对路径（以'/'分隔）。
     * @param tochildren 是否往子级路径遍历。
     * @param callbackfn 处理方法。
     * @returns 返回遍历处理生成的数组。
     */
    Map<T>(path: string, tochildren: boolean, callbackfn: (entry: FileSystemHandle, index: number, path: string) => Promise<T>): Promise<T[]>;
    /**
     * 获取指定相对路径句柄。
     * @param path 指定相对路径（以'/'分隔）。
     * @returns 返回路径句柄。
     */
    GetDir(path: string, uncreate?: boolean): Promise<FileSystemDirectoryHandle>;
    /**
     * 判断指定相对路径下是否存在指定文件。
     * @param path 指定相对路径（以'/'分隔）。
     * @param filename 指定文件名。
     * @returns 存在时返回真。
     */
    HasFile(path: string, filename: string): Promise<boolean>;
    /** 引擎实例。 */
    private _global;
    /** 根路径句柄。 */
    private _dirRoot;
    /** 相对路径句柄查找表。 */
    private _dirLut;
}
/** 二进制数据读取器。 */
export declare class BinaryReader {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     * @param buffer 数据缓存。
     */
    constructor(_global: Miaoverse.Ploy3D, buffer: ArrayBuffer);
    /**
     * 读取8位布尔型。
     * @returns 返回布尔型。
     */
    ReadBoolean(): boolean;
    /**
     * 读取8位字节型。
     * @returns 返回整型数值。
     */
    ReadInt8(): number;
    /**
     * 读取8位无符号字节型。
     * @returns 返回整型数值。
     */
    ReadUInt8(): number;
    /**
     * 读取16位短整型。
     * @returns 返回整型数值。
     */
    ReadInt16(): number;
    /**
     * 读取16位无符号短整型。
     * @returns 返回整型数值。
     */
    ReadUInt16(): number;
    /**
     * 读取32位整型。
     * @returns 返回整型数值。
     */
    ReadInt32(): number;
    /**
     * 读取32位无符号整型。
     * @returns 返回整型数值。
     */
    ReadUInt32(): number;
    /**
     * 读取32位浮点型。
     * @returns 返回浮点型数值。
     */
    ReadSingle(): number;
    /**
     * 读取一段数据缓存。
     * @param size 读取大小。
     * @returns 返回缓存。
     */
    ReadBuffer(size: number): ArrayBuffer;
    /**
     * 读取32位整型数组。
     * @param count 数组长度。
     * @returns 返回整型数组。
     */
    ReadInt32Array(count: number): Int32Array;
    /**
     * 读取32位无符号整型数组。
     * @param count 数组长度。
     * @returns 返回整型数组。
     */
    ReadUInt32Array(count: number): Uint32Array;
    /**
     * 读取32位浮点型数组。
     * @param count 数组长度。
     * @returns 返回浮点型数组。
     */
    ReadSingleArray(count: number): Float32Array;
    /**
     * 读取C#格式字符串。
     * @returns 返回字符串。
     */
    ReadString(): string;
    /** 数据缓存大小。 */
    get Length(): number;
    /** 当前读取指针。 */
    get Position(): number;
    /** 当前读取指针。 */
    set Position(position: number);
    /** 引擎实例。 */
    private _global;
    /** 数据缓存。 */
    private _buffer;
    /** 数据视图。 */
    private _reader;
    /** 当前读取指针。 */
    private _position;
}
/** 二进制数据写入器。 */
export declare class BinaryWriter {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     * @param buffer 数据缓存。
     */
    constructor(_global: Miaoverse.Ploy3D, buffer: ArrayBuffer);
    /**
     * 写入8位布尔型。
     * @param value 布尔型。
     */
    WriteBoolean(value: boolean): void;
    /**
     * 写入8位整型。
     * @param value 整型值。
     */
    WriteInt8(value: number): void;
    /**
     * 写入8位无符号整型。
     * @param value 整型值。
     */
    WriteUInt8(value: number): void;
    /**
     * 写入16位整型。
     * @param value 整型值。
     */
    WriteInt16(value: number): void;
    /**
     * 写入8位无符号整型。
     * @param value 整型值。
     */
    WriteUInt16(value: number): void;
    /**
     * 写入32位整型。
     * @param value 整型值。
     */
    WriteInt32(value: number): void;
    /**
     * 写入32位整型。
     * @param value 整型值。
     */
    WriteUInt32(value: number): void;
    /**
     * 写入32位浮点型。
     * @param value 浮点型值。
     */
    WriteSingle(value: number): void;
    /**
     * 写入数据缓存。
     * @param buffer 数据缓存。
     */
    WriteBuffer(buffer: ArrayBuffer): void;
    /**
     * 写入32位整数组。
     * @param value 整数组。
     */
    WriteInt32Array(value: Int32Array): void;
    /**
     * 写入32位无符号整数组。
     * @param value 整数组。
     */
    WriteUInt32Array(value: Uint32Array): void;
    /**
     * 写入32位浮点型数组。
     * @param value 浮点型数组。
     */
    WriteSingleArray(value: Float32Array): void;
    /** 数据缓存大小。 */
    get Length(): number;
    /** 当前写入指针。 */
    get Position(): number;
    /** 当前写入指针。 */
    set Position(position: number);
    /** 引擎实例。 */
    private _global;
    /** 数据缓存。 */
    private _buffer;
    /** 数据视图。 */
    private _reader;
    /** 当前写入指针。 */
    private _position;
}
