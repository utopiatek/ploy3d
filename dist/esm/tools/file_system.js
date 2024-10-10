export class FileStorage {
    constructor(_global, root) {
        this._global = _global;
        this._dirRoot = root;
        this._dirLut = {};
    }
    async Dispose() {
        this._global = null;
        this._dirRoot = null;
        this._dirLut = null;
    }
    async ReadFile(path, filename, type) {
        try {
            if (Deno) {
                const url = path + filename;
                if (type == "arrayBuffer") {
                    const data = await Deno.readFile(url);
                    return data.buffer;
                }
                else {
                    const text = await Deno.readTextFile(url);
                    if (type == "text") {
                        return text;
                    }
                    else {
                        return JSON.parse(text);
                    }
                }
                return null;
            }
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
    async WriteFile(path, filename, data) {
        try {
            if (Deno) {
                console.error("TODO: FileStorage.WriteFile");
                return;
            }
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
    async Map(path, tochildren, callbackfn) {
        try {
            if (Deno) {
                const array_ = [];
                const Map_ = async (path_) => {
                    try {
                        for await (const entry of Deno.readDir(path_)) {
                            const entry_ = {
                                kind: entry.isFile ? "file" : "directory",
                                name: entry.name
                            };
                            const value = await callbackfn(entry_, array_.length, path_);
                            if (value !== undefined) {
                                array_.push(value);
                            }
                            if (tochildren && entry_.kind == "directory") {
                                await Map_(path_ + entry.name + "/");
                            }
                        }
                    }
                    catch (error) {
                        throw error;
                    }
                };
                await Map_(path);
                return array_;
            }
            const dirHandle = await this.GetDir(path);
            if (!dirHandle) {
                this._global.Track("FileStorage.Map: 指定的本地路径" + path + "不存在！", 3);
                return;
            }
            const array = [];
            const Map = async (path_, dir_) => {
                for await (const entry of dir_.values()) {
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
    async GetDir(path, uncreate) {
        if (Deno) {
            console.error("TODO: FileStorage.GetDir");
            return null;
        }
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
    async HasFile(path, filename) {
        try {
            if (Deno) {
                console.error("TODO: FileStorage.HasFile");
                return false;
            }
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
    _global;
    _dirRoot;
    _dirLut;
}
export class BinaryReader {
    constructor(_global, buffer) {
        this._global = _global;
        this._buffer = buffer;
        this._reader = new DataView(buffer);
        this._position = 0;
    }
    ReadBoolean() {
        const value = this._reader.getUint8(this._position);
        this._position += 1;
        return value > 0;
    }
    ReadInt8() {
        const value = this._reader.getInt8(this._position);
        this._position += 1;
        return value;
    }
    ReadUInt8() {
        const value = this._reader.getUint8(this._position);
        this._position += 1;
        return value;
    }
    ReadInt16() {
        const value = this._reader.getInt16(this._position, true);
        this._position += 2;
        return value;
    }
    ReadUInt16() {
        const value = this._reader.getUint16(this._position, true);
        this._position += 2;
        return value;
    }
    ReadInt32() {
        const value = this._reader.getInt32(this._position, true);
        this._position += 4;
        return value;
    }
    ReadUInt32() {
        const value = this._reader.getUint32(this._position, true);
        this._position += 4;
        return value;
    }
    ReadSingle() {
        let value = this._reader.getFloat32(this._position, true);
        this._position += 4;
        return value;
    }
    ReadBuffer(size) {
        const buffer = this._buffer.slice(this._position, this._position + size);
        this._position += size;
        return buffer;
    }
    ReadInt32Array(count) {
        const array = new Int32Array(this._buffer.slice(this._position, this._position + count * 4));
        this._position += 4 * count;
        return array;
    }
    ReadUInt32Array(count) {
        const array = new Uint32Array(this._buffer.slice(this._position, this._position + count * 4));
        this._position += 4 * count;
        return array;
    }
    ReadSingleArray(count) {
        const array = new Float32Array(this._buffer.slice(this._position, this._position + count * 4));
        this._position += 4 * count;
        return array;
    }
    ReadString() {
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
    get Length() {
        return this._buffer.byteLength;
    }
    get Position() {
        return this._position;
    }
    set Position(position) {
        this._position = position;
    }
    _global;
    _buffer;
    _reader;
    _position;
}
export class BinaryWriter {
    constructor(_global, buffer) {
        this._global = _global;
        this._buffer = buffer;
        this._reader = new DataView(buffer);
        this._position = 0;
    }
    WriteBoolean(value) {
        this._reader.setUint8(this._position, value ? 1 : 0);
        this._position += 1;
    }
    WriteInt8(value) {
        this._reader.setInt8(this._position, value);
        this._position += 1;
    }
    WriteUInt8(value) {
        this._reader.setUint8(this._position, value);
        this._position += 1;
    }
    WriteInt16(value) {
        this._reader.setInt16(this._position, value, true);
        this._position += 2;
    }
    WriteUInt16(value) {
        this._reader.setUint16(this._position, value, true);
        this._position += 2;
    }
    WriteInt32(value) {
        this._reader.setInt32(this._position, value, true);
        this._position += 4;
    }
    WriteUInt32(value) {
        this._reader.setUint32(this._position, value, true);
        this._position += 4;
    }
    WriteSingle(value) {
        this._reader.setFloat32(this._position, value, true);
        this._position += 4;
    }
    WriteBuffer(buffer) {
        (new Uint8Array(this._buffer)).set(new Uint8Array(buffer), this._position);
        this._position += buffer.byteLength;
    }
    WriteInt32Array(value) {
        (new Int32Array(this._buffer, this._position, value.length)).set(value);
        this._position += 4 * value.length;
    }
    WriteUInt32Array(value) {
        (new Uint32Array(this._buffer, this._position, value.length)).set(value);
        this._position += 4 * value.length;
    }
    WriteSingleArray(value) {
        (new Float32Array(this._buffer, this._position, value.length)).set(value);
        this._position += 4 * value.length;
    }
    get Length() {
        return this._buffer.byteLength;
    }
    get Position() {
        return this._position;
    }
    set Position(position) {
        this._position = position;
    }
    _global;
    _buffer;
    _reader;
    _position;
}
