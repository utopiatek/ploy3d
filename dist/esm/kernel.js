export class Kernel {
    constructor(_global) {
        this._global = _global;
    }
    async Init(_imports) {
        const pageMax = 2048 * 16;
        let pageCount = 256 * 16;
        let growCount = 0;
        const memory = new WebAssembly.Memory({ initial: pageCount, maximum: pageMax, shared: false });
        const memory_grow = (size) => {
            const perSize_ = 256 * 1024 * 1024;
            const pageCount_ = perSize_ / 64 / 1024;
            if (size !== perSize_) {
                size = perSize_;
                this._global.Track("Kernel.memory_grow: 每次内存增长应为256M，当前size=" + (size / 1024 / 1024) + "！", 2);
            }
            if (pageMax < pageCount + pageCount_) {
                this._global.Track("Kernel.memory_grow: 系统内存不足（最多可分配2G）：" + pageCount + " " + pageCount_ + "！", 3);
                return 0;
            }
            memory.grow(pageCount_);
            pageCount += pageCount_;
            growCount += 1;
            this._global.env.Reinit(memory.buffer);
            return this._global.env.ptrCreate(growCount * (perSize_ >> 2));
        };
        const imports = {
            env: {
                memory: memory,
                memory_grow: memory_grow,
                xprintf: (sys_, bufsize, format_, argv_) => {
                    if (!this._global.env) {
                        return 0;
                    }
                    return this._global.env.Printf(sys_, bufsize, format_, argv_);
                },
                xprintf_va_list: (sys_, bufsize, format_, argv_) => {
                    if (!this._global.env) {
                        return 0;
                    }
                    return this._global.env.Printf(sys_, bufsize, format_, argv_);
                },
                fmodf: (x, y) => { return x % y; },
                abort: () => {
                    alert("abort");
                },
                clock: () => {
                    return (Date.now() - this._global.startTS);
                },
                __cxa_atexit: () => { this._global.Track("__cxa_atexit", 3); return 0; },
                __cxa_pure_virtual: () => { this._global.Track("__cxa_pure_virtual", 3); },
                __ubsan_handle_pointer_overflow: (a, b, c) => { console.error("__ubsan_handle_pointer_overflow", a, b, c); },
                __ubsan_handle_out_of_bounds: (a, b, c) => { console.error("__ubsan_handle_out_of_bounds", a, b, c); },
                __ubsan_handle_add_overflow: (a, b, c) => { console.error("__ubsan_handle_add_overflow", a, b, c); },
                __ubsan_handle_sub_overflow: (a, b, c) => { console.error("__ubsan_handle_sub_overflow", a, b, c); },
                __ubsan_handle_invalid_builtin: (a, b, c) => { console.error("__ubsan_handle_invalid_builtin", a, b, c); },
                __ubsan_handle_type_mismatch_v1: (a, b, c) => { console.error("__ubsan_handle_type_mismatch_v1", a, b, c); },
                __ubsan_handle_shift_out_of_bounds: (a, b, c) => { console.error("__ubsan_handle_shift_out_of_bounds", a, b, c); },
                __ubsan_handle_float_cast_overflow: (a, b, c) => { console.error("__ubsan_handle_float_cast_overflow", a, b, c); },
                __ubsan_handle_divrem_overflow: (a, b, c) => { console.error("__ubsan_handle_divrem_overflow", a, b, c); },
                __ubsan_handle_mul_overflow: (a, b, c) => { console.error("__ubsan_handle_mul_overflow", a, b, c); },
                __ubsan_handle_negate_overflow: (a, b, c) => { console.error("__ubsan_handle_negate_overflow", a, b, c); },
                __ubsan_handle_load_invalid_value: (a, b, c) => { console.error("__ubsan_handle_load_invalid_value", a, b, c); },
                __ubsan_handle_builtin_unreachable: (a, b, c) => { console.error("__ubsan_handle_builtin_unreachable", a, b, c); },
                __ubsan_handle_missing_return: (a, b, c) => { console.error("__ubsan_handle_missing_return", a, b, c); },
                __ubsan_handle_nonnull_return_v1: (a, b, c) => { console.error("__ubsan_handle_nonnull_return_v1", a, b, c); },
            },
            Math: Math,
            VM: _imports
        };
        const module = await WebAssembly.instantiate(this._global.kernelCode, imports);
        const instance = await module.instance;
        const ptrEnv = instance.exports.System_Startup(instance.exports.__stack_pointer.value >> 2);
        this._wasm = instance;
        this._memory = memory;
        this._global.internal = instance.exports;
        this._global.env = await (new SharedENV(this._global)).Init(memory.buffer, ptrEnv);
        return this;
    }
    _global;
    _wasm;
    _memory;
}
export class SharedENV {
    constructor(_global) {
        this._global = _global;
        this._textDecoder = new TextDecoder('utf-8');
        this._textEncoder = new TextEncoder();
    }
    async Init(buffer, ptr) {
        this.Reinit(buffer);
        this._ptr = ptr;
        this.uscalarSet(this._ptr, 0, 1);
        this.uscalarSet(this._ptr, 1, 256);
        this.uscalarSet(this._ptr, 2, 4 * 1024 * 1024);
        this.uscalarSet(this._ptr, 3, 4096);
        this.uscalarSet(this._ptr, 4, 2048);
        this.uscalarSet(this._ptr, 5, 256);
        this.uscalarSet(this._ptr, 6, 1);
        this.uscalarSet(this._ptr, 7, this._global.config.webgl ? 1 : 0);
        this.uscalarSet(this._ptr, 8, 1024);
        this.uscalarSet(this._ptr, 10, 0);
        this.uscalarSet(this._ptr, 11, 0);
        this.farraySet(this._ptr, 12, [0.0, 0.0, 0.0, 0.0]);
        return this;
    }
    Reinit(buffer) {
        this._ubview = new Uint8Array(buffer);
        this._iview = new Int32Array(buffer);
        this._uview = new Uint32Array(buffer);
        this._fview = new Float32Array(buffer);
        this._dview = new Float64Array(buffer);
        this._view = [this._ubview, this._iview, this._uview, this._fview];
    }
    AllocaCall(size, func) {
        size = (size + 0x3) & 0xFFFFFFFC;
        const addr = this._global.internal.__stack_pointer.value - size;
        this._global.internal.__stack_pointer.value = addr;
        func(this.ptrCreate(addr >> 2));
        this._global.internal.__stack_pointer.value = addr + size;
    }
    Printf(sys, bufsize, format, argv) {
        const view = this._ubview;
        if (0 === format) {
            return 0;
        }
        let end = format;
        while (0 !== view[end++])
            ;
        let str = this._textDecoder.decode(view.subarray(format, end));
        let ch = 0;
        end = format;
        let argn = argv / 4;
        while (0 !== (ch = view[end++])) {
            if (37 === ch) {
                const ch2 = view[end];
                switch (ch2) {
                    case 100:
                        str = str.replace("%d", "" + this._uview[argn++]);
                        break;
                    case 117:
                        str = str.replace("%u", "" + this._uview[argn++]);
                        break;
                    case 102:
                        str = str.replace("%f", "" + this._dview[argn / 2]);
                        argn += 2;
                        break;
                    case 115:
                        str = str.replace("%s", () => {
                            const beg_ = this._uview[argn++];
                            let end_ = beg_;
                            while (0 !== view[end_++])
                                ;
                            return this._textDecoder.decode(view.slice(beg_, end_ - 1));
                        });
                        break;
                    default:
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
    Tick(gisState, worldLngLat) {
        this.uscalarSet(this._ptr, 0, (Date.now() - this._global.startTS));
        const _gisState = this.uscalarGet(this._ptr, 11);
        const _worldLngLat = this.farrayGet(this._ptr, 12, 2);
        if (gisState != _gisState ||
            Math.abs(worldLngLat[0] - _worldLngLat[0]) > 0.0001 ||
            Math.abs(worldLngLat[1] - _worldLngLat[1]) > 0.0001) {
            this.uscalarSet(this._ptr, 10, this.frameTS);
            this.uscalarSet(this._ptr, 11, gisState);
            this.farraySet(this._ptr, 12, worldLngLat);
        }
    }
    async uuidGet2() {
        const uid = this._global.uid;
        return new Promise(function (resolve) {
            setTimeout(function () {
                const ts = Math.floor(Date.now() * 0.01) & 0xFFFFFFFF;
                resolve(`${uid}-${ts}-1`);
            }, 100);
        });
    }
    guidGet() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    path_guidGet() {
        const guid = this.guidGet();
        const path = (new Date()).toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            year: "2-digit",
            month: "2-digit",
            day: "2-digit"
        }) + "/" + guid;
        return { path, guid };
    }
    uuidSet(ptr, intOffset, value) {
        this.uarraySet(ptr, intOffset, this.uuidDec(value));
    }
    uuidGet(ptr, intOffset) {
        const uuid = this.uarrayGet(ptr, intOffset, 3);
        return this.uuidEnc(uuid);
    }
    uuidDec(uuid) {
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
    uuidEnc(uuid) {
        const index = uuid[0] & 0xFFFF;
        const type = (uuid[0] >> 16) & 0xFF;
        const ver = uuid[0] >> 24;
        const time = uuid[1];
        const uid = uuid[2];
        return `${uid}-${time}-${ver}-${type}-${index}`;
    }
    bufferSet1(ptr, buffer, byteOffset, byteLength) {
        this._ubview.set(new Uint8Array(buffer, byteOffset, byteLength), ptr << 2);
    }
    stringSet(ptr, intOffset, value, maxLength = 64) {
        const view = this._ubview;
        const beg = this.ptrMove(ptr, intOffset) << 2;
        const carray = this._textEncoder.encode(value);
        const size = carray.length > maxLength ? maxLength : carray.length;
        const buffer = view.subarray(beg, beg + size);
        buffer.set(carray);
        buffer[size - 1] = 0;
    }
    stringGet(ptr) {
        const view = this._ubview;
        const beg = ptr << 2;
        let end = beg;
        while (0 !== view[end++])
            ;
        const str = this._textDecoder.decode(view.subarray(beg, end - 1));
        return str;
    }
    arraySet(type, ptr, intOffset, data) {
        if (0 === type) {
            this._global.Track("SharedENV.arraySet: 不允许写入字节类型数组!", 3);
            return;
        }
        this._view[type].set(data, ptr + intOffset);
    }
    arrayGet(type, ptr, intOffset, count) {
        if (0 === type) {
            this._global.Track("SharedENV.arrayGet: 不允许读取字节类型数组!", 3);
            return null;
        }
        return this._view[type].slice(ptr + intOffset, ptr + intOffset + count);
    }
    farraySet(ptr, intOffset, data) {
        this._fview.set(data, ptr + intOffset);
    }
    farrayGet(ptr, intOffset, count) {
        return this._fview.slice(ptr + intOffset, ptr + intOffset + count);
    }
    farrayRef(ptr, intOffset, count) {
        return this._fview.subarray(ptr + intOffset, ptr + intOffset + count);
    }
    uarraySet(ptr, intOffset, data) {
        this._uview.set(data, ptr + intOffset);
    }
    uarrayGet(ptr, intOffset, count) {
        return this._uview.slice(ptr + intOffset, ptr + intOffset + count);
    }
    uarrayRef(ptr, intOffset, count) {
        return this._uview.subarray(ptr + intOffset, ptr + intOffset + count);
    }
    fscalarSet(ptr, intOffset, value) {
        this._fview[ptr + intOffset] = value;
    }
    fscalarGet(ptr, intOffset) {
        return this._fview[ptr + intOffset];
    }
    uscalarSet(ptr, intOffset, value) {
        this._uview[ptr + intOffset] = value;
    }
    uscalarGet(ptr, intOffset) {
        return this._uview[ptr + intOffset];
    }
    iscalarSet(ptr, intOffset, value) {
        this._iview[ptr + intOffset] = value;
    }
    iscalarGet(ptr, intOffset) {
        return this._iview[ptr + intOffset];
    }
    ptrSet(ptr, intOffset, value) {
        this._uview[ptr + intOffset] = value;
    }
    ptrGet(ptr, intOffset) {
        return this._uview[ptr + intOffset];
    }
    ptrZero() {
        return 0;
    }
    ptrCreate(ptr) {
        return ptr;
    }
    ptrMove(ptr, intOffset) {
        return (ptr + intOffset);
    }
    ptrValid(ptr) {
        return 0 < ptr;
    }
    ptrValue(ptr) {
        return ptr;
    }
    get buffer() {
        return this._ubview.buffer;
    }
    get bufferView() {
        return this._ubview;
    }
    get textDecoder() {
        return this._textDecoder;
    }
    get textEncoder() {
        return this._textEncoder;
    }
    get frameTS() {
        return this.uscalarGet(this._ptr, 0);
    }
    get ubufferAlign() {
        return this.uscalarGet(this._ptr, 1);
    }
    get ubufferSize() {
        return this.uscalarGet(this._ptr, 2);
    }
    get utextureSize() {
        return this.uscalarGet(this._ptr, 3);
    }
    get sizeG0() {
        return this.uscalarGet(this._ptr, 4);
    }
    get sizeG1() {
        return this.uscalarGet(this._ptr, 5);
    }
    get reversedZ() {
        return this.uscalarGet(this._ptr, 6);
    }
    get webGL() {
        return this.uscalarGet(this._ptr, 7);
    }
    get shadowMapSize() {
        return this.uscalarGet(this._ptr, 8);
    }
    get defaultG2() {
        return this.ptrGet(this._ptr, 9);
    }
    set defaultG2(g2) {
        this.ptrSet(this._ptr, 9, g2);
    }
    get gisTS() {
        return this.uscalarGet(this._ptr, 10);
    }
    get gisState() {
        return this.uscalarGet(this._ptr, 11);
    }
    get worldLngLat() {
        return this.farrayGet(this._ptr, 12, 4);
    }
    _global;
    _ptr;
    _textDecoder;
    _textEncoder;
    _ubview;
    _iview;
    _uview;
    _fview;
    _dview;
    _view;
}
//# sourceMappingURL=kernel.js.map