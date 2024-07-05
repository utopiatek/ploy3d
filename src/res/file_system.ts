import * as Miaoverse from "../mod.js"

/** 文件存储器。 */
export class FileStorage {
    /**
     * 构造函数。
     * @param root 根路径句柄。
     */
    public constructor(_global: Miaoverse.Ploy3D, root?: FileSystemDirectoryHandle) {
        this._global = _global;
        this._dirRoot = root;
        this._dirLut = {};
    }

    /**
     * 读取文件存储器中指定相对路径文件数据。
     * @param path 指定相对路径（以'/'分隔）。
     * @param filename 文件名称。
     * @param type 文件类型。
     * @returns 返回文件数据。
     */
    public async ReadFile<T>(path: string, filename: string, type: "text" | "arrayBuffer" | "json") {
        try {
            const dirHandle = await this.GetDir(path);
            if (!dirHandle) {
                this._global.Track("FileStorage.ReadFile: 指定的本地路径" + path + "不存在！", 3);
                return null;
            }

            const fileHandle = await dirHandle.getFileHandle(filename, { create: false });
            if (!fileHandle) {
                this._global.Track("FileStorage.ReadFile: 指定的本地文件" + filename + "不存在！", 3);
                return null;
            }

            const file = await fileHandle.getFile();
            if (!file) {
                this._global.Track("FileStorage.ReadFile: 本地文件" + filename + "访问失败！", 3);
                return null;
            }

            if (type == "json") {
                return JSON.parse(await file.text());
            }
            else {
                return file[type]();
            }
        }
        catch (e) {
            this._global.Track("FileStorage.ReadFile: " + e, 3);
            return null;
        }
    }

    /**
     * 向文件存储器中指定相对路径覆盖写入文件。
     * @param path 指定相对路径（以'/'分隔）。
     * @param filename 文件名称，如果已存在将被覆盖。
     * @param data 文件数据。
     */
    public async WriteFile(path: string, filename: string, data: string | BufferSource | Blob) {
        try {
            const dirHandle = await this.GetDir(path);
            if (!dirHandle) {
                this._global.Track("FileStorage.WriteFile: 指定的本地路径" + path + "不存在！", 3);
                return;
            }

            const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
            if (!fileHandle) {
                this._global.Track("FileStorage.WriteFile: 本地文件" + filename + "创建失败！", 3);
                return;
            }

            const file = await fileHandle.createWritable();
            if (!file) {
                this._global.Track("FileStorage.WriteFile: 本地文件" + filename + "无法写入！", 3);
                return;
            }

            await file.write(data);
            await file.close();
        }
        catch (e) {
            this._global.Track("FileStorage.WriteFile: " + e, 3);
        }
    }

    /**
     * 遍历处理指定相对路径下的内容。
     * @param path 指定相对路径（以'/'分隔）。
     * @param tochildren 是否往子级路径遍历。
     * @param callbackfn 处理方法。
     * @returns 返回遍历处理生成的数组。
     */
    public async Map<T>(path: string, tochildren: boolean, callbackfn: (entry: FileSystemHandle, index: number, path: string) => Promise<T>) {
        try {
            const dirHandle = await this.GetDir(path);
            if (!dirHandle) {
                this._global.Track("FileStorage.Map: 指定的本地路径" + path + "不存在！", 3);
                return;
            }

            const array: T[] = [];

            const Map = async (path_: string, dir_: FileSystemDirectoryHandle) => {
                for await (const entry of (dir_ as any).values()) {
                    const value = await callbackfn(entry, array.length, path_);
                    if (value !== undefined) {
                        array.push(value);
                    }

                    if (tochildren && entry.kind == "directory") {
                        await Map(path_ + entry.name + "/", entry);
                    }
                }
            };

            await Map(path, dirHandle);

            return array;
        }
        catch (e) {
            this._global.Track("FileStorage.Map: " + e, 3);
        }

        return null;
    }

    /**
     * 获取指定相对路径句柄。
     * @param path 指定相对路径（以'/'分隔）。
     * @returns 返回路径句柄。
     */
    public async GetDir(path: string, uncreate?: boolean) {
        let dir = this._dirLut[path];
        if (dir) {
            return dir;
        }

        const parts = path.split("/");

        dir = this._dirRoot;
        path = "";

        for (let p of parts) {
            if (!p) {
                continue;
            }

            path += p;

            const dir_ = this._dirLut[path];
            if (dir_) {
                dir = dir_;
            }
            else {
                if (uncreate) {
                    return null;
                }

                dir = await dir.getDirectoryHandle(p, { create: true });
            }

            this._dirLut[path] = dir;

            path += "/";
        }

        return dir;
    }

    /**
     * 判断指定相对路径下是否存在指定文件。
     * @param path 指定相对路径（以'/'分隔）。
     * @param filename 指定文件名。
     * @returns 存在时返回真。
     */
    public async HasFile(path: string, filename: string) {
        try {
            const dirHandle = await this.GetDir(path, true);
            if (dirHandle) {
                const fileHandle = await dirHandle.getFileHandle(filename);
                if (fileHandle) {
                    return true;
                }
            }
        }
        catch (e) {
            this._global.Track("FileStorage.HasFile: " + e, 3);
        }

        return false;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
    /** 根路径句柄。 */
    private _dirRoot: FileSystemDirectoryHandle;
    /** 相对路径句柄查找表。 */
    private _dirLut: Record<string, FileSystemDirectoryHandle>;
}

/** 二进制数据读取器。 */
export class BinaryReader {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param buffer 数据缓存。
     */
    public constructor(_global: Miaoverse.Ploy3D, buffer: ArrayBuffer) {
        this._global = _global;
        this._buffer = buffer;
        this._reader = new DataView(buffer);
        this._position = 0;
    }

    /**
     * 读取8位布尔型。
     * @returns 返回布尔型。
     */
    public ReadBoolean(): boolean {
        const value = this._reader.getUint8(this._position);
        this._position += 1;

        return value > 0;
    }

    /**
     * 读取8位字节型。
     * @returns 返回整型数值。
     */
    public ReadInt8(): number {
        const value = this._reader.getInt8(this._position);
        this._position += 1;

        return value;
    }

    /**
     * 读取8位无符号字节型。
     * @returns 返回整型数值。
     */
    public ReadUInt8(): number {
        const value = this._reader.getUint8(this._position);
        this._position += 1;

        return value;
    }

    /**
     * 读取16位短整型。
     * @returns 返回整型数值。
     */
    public ReadInt16(): number {
        const value = this._reader.getInt16(this._position, true);
        this._position += 2;

        return value;
    }

    /**
     * 读取16位无符号短整型。
     * @returns 返回整型数值。
     */
    public ReadUInt16(): number {
        const value = this._reader.getUint16(this._position, true);
        this._position += 2;

        return value;
    }

    /**
     * 读取32位整型。
     * @returns 返回整型数值。
     */
    public ReadInt32(): number {
        const value = this._reader.getInt32(this._position, true);
        this._position += 4;

        return value;
    }

    /**
     * 读取32位无符号整型。
     * @returns 返回整型数值。
     */
    public ReadUInt32(): number {
        const value = this._reader.getUint32(this._position, true);
        this._position += 4;

        return value;
    }

    /**
     * 读取32位浮点型。
     * @returns 返回浮点型数值。
     */
    public ReadSingle(): number {
        let value = this._reader.getFloat32(this._position, true);
        this._position += 4;

        return value;
    }

    /**
     * 读取一段数据缓存。
     * @param size 读取大小。
     * @returns 返回缓存。
     */
    public ReadBuffer(size: number): ArrayBuffer {
        const buffer = this._buffer.slice(this._position, this._position + size);
        this._position += size;

        return buffer;
    }

    /**
     * 读取32位整型数组。
     * @param count 数组长度。
     * @returns 返回整型数组。
     */
    public ReadInt32Array(count: number): Int32Array {
        const array = new Int32Array(this._buffer.slice(this._position, this._position + count * 4));
        this._position += 4 * count;

        return array;
    }

    /**
     * 读取32位无符号整型数组。
     * @param count 数组长度。
     * @returns 返回整型数组。
     */
    public ReadUInt32Array(count: number): Uint32Array {
        const array = new Uint32Array(this._buffer.slice(this._position, this._position + count * 4));
        this._position += 4 * count;

        return array;
    }

    /**
     * 读取32位浮点型数组。
     * @param count 数组长度。
     * @returns 返回浮点型数组。
     */
    public ReadSingleArray(count: number): Float32Array {
        const array = new Float32Array(this._buffer.slice(this._position, this._position + count * 4));
        this._position += 4 * count;

        return array;
    }

    /**
     * 读取C#格式字符串。
     * @returns 返回字符串。
     */
    public ReadString(): string {
        let num = this._reader.getUint8(this._position);
        this._position += 1;

        if (num > 128) {
            let num2 = this._reader.getUint8(this._position);
            this._position += 1;

            num += num2 * 256;
        }

        const array = new Int8Array(this._buffer, this._position, num);
        this._position += num;

        const str = this._global.env["_textDecoder"].decode(array);

        return str;
    }

    /** 数据缓存大小。 */
    public get Length(): number {
        return this._buffer.byteLength;
    }

    /** 当前读取指针。 */
    public get Position(): number {
        return this._position;
    }

    /** 当前读取指针。 */
    public set Position(position: number) {
        this._position = position;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
    /** 数据缓存。 */
    private _buffer: ArrayBuffer;
    /** 数据视图。 */
    private _reader: DataView;
    /** 当前读取指针。 */
    private _position: number;
}

/** 二进制数据写入器。 */
export class BinaryWriter {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param buffer 数据缓存。
     */
    public constructor(_global: Miaoverse.Ploy3D, buffer: ArrayBuffer) {
        this._global = _global;
        this._buffer = buffer;
        this._reader = new DataView(buffer);
        this._position = 0;
    }

    /**
     * 写入8位布尔型。
     * @param value 布尔型。
     */
    public WriteBoolean(value: boolean) {
        this._reader.setUint8(this._position, value ? 1 : 0);
        this._position += 1;
    }

    /**
     * 写入8位整型。
     * @param value 整型值。
     */
    public WriteInt8(value: number) {
        this._reader.setInt8(this._position, value);
        this._position += 1;
    }

    /**
     * 写入8位无符号整型。
     * @param value 整型值。
     */
    public WriteUInt8(value: number) {
        this._reader.setUint8(this._position, value);
        this._position += 1;
    }

    /**
     * 写入16位整型。
     * @param value 整型值。
     */
    public WriteInt16(value: number) {
        this._reader.setInt16(this._position, value, true);
        this._position += 2;
    }

    /**
     * 写入8位无符号整型。
     * @param value 整型值。
     */
    public WriteUInt16(value: number) {
        this._reader.setUint16(this._position, value, true);
        this._position += 2;
    }

    /**
     * 写入32位整型。
     * @param value 整型值。
     */
    public WriteInt32(value: number) {
        this._reader.setInt32(this._position, value, true);
        this._position += 4;
    }

    /**
     * 写入32位整型。
     * @param value 整型值。
     */
    public WriteUInt32(value: number) {
        this._reader.setUint32(this._position, value, true);
        this._position += 4;
    }

    /**
     * 写入32位浮点型。
     * @param value 浮点型值。
     */
    public WriteSingle(value: number) {
        this._reader.setFloat32(this._position, value, true);
        this._position += 4;
    }

    /**
     * 写入数据缓存。
     * @param buffer 数据缓存。
     */
    public WriteBuffer(buffer: ArrayBuffer) {
        (new Uint8Array(this._buffer)).set(new Uint8Array(buffer), this._position);
        this._position += buffer.byteLength;
    }

    /**
     * 写入32位整数组。
     * @param value 整数组。
     */
    public WriteInt32Array(value: Int32Array) {
        (new Int32Array(this._buffer, this._position, value.length)).set(value);
        this._position += 4 * value.length;
    }

    /**
     * 写入32位无符号整数组。
     * @param value 整数组。
     */
    public WriteUInt32Array(value: Uint32Array) {
        (new Uint32Array(this._buffer, this._position, value.length)).set(value);
        this._position += 4 * value.length;
    }

    /**
     * 写入32位浮点型数组。
     * @param value 浮点型数组。
     */
    public WriteSingleArray(value: Float32Array) {
        (new Float32Array(this._buffer, this._position, value.length)).set(value);
        this._position += 4 * value.length;
    }

    /** 数据缓存大小。 */
    public get Length(): number {
        return this._buffer.byteLength;
    }

    /** 当前写入指针。 */
    public get Position(): number {
        return this._position;
    }

    /** 当前写入指针。 */
    public set Position(position: number) {
        this._position = position;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
    /** 数据缓存。 */
    private _buffer: ArrayBuffer;
    /** 数据视图。 */
    private _reader: DataView;
    /** 当前写入指针。 */
    private _position: number;
}
