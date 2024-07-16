import * as Miaoverse from "../mod.js";
export class Uniform extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
        const buffer = this._impl.Get(ptr, "buffer");
        this._bufferPtr = this._impl.Get(buffer, "buffer_addr");
        this._bufferSize = this._impl.Get(buffer, "buffer_size");
        this._blockPtr = this._global.env.ptrMove(this._bufferPtr, this.offset >> 2);
    }
    Bind(passEncoder) {
        if (this.updated) {
            this._global.device.WriteBuffer(this.bufferID, this.offset, this._global.env.buffer, (this.bufferPtr << 2) + this.offset, this.size);
            this.updated = false;
            this.writeTS = this._global.env.frameTS;
        }
        if (this.bindingID == 0) {
            this.bindingID = 1;
            this.binding = this._global.context.CreateBindGroup(this);
            this.dynamicOffsets = [this.offset];
        }
        if (this.binding) {
            passEncoder.setBindGroup(this.group, this.binding, this.dynamicOffsets);
        }
        this.readTS = this._global.env.frameTS;
    }
    ReadBufferNode(ptr) {
        const buffer = this._impl.Get(ptr, "bn_buffer");
        const bufferID = this._impl.Get(ptr, "bn_bufferID");
        const offset = this._impl.Get(ptr, "bn_offset");
        const size = this._impl.Get(ptr, "bn_size");
        return { buffer, bufferID, offset, size };
    }
    get writeTS() {
        return this._impl.Get(this._ptr, "writeTS");
    }
    set writeTS(value) {
        this._impl.Set(this._ptr, "writeTS", value);
    }
    get readTS() {
        return this._impl.Get(this._ptr, "readTS");
    }
    set readTS(value) {
        this._impl.Set(this._ptr, "readTS", value);
    }
    get group() {
        return this._impl.Get(this._ptr, "group");
    }
    get bindingID() {
        return this._impl.Get(this._ptr, "binding");
    }
    set bindingID(value) {
        this._impl.Set(this._ptr, "binding", value);
    }
    get updated() {
        return this._impl.Get(this._ptr, "updated") > 0;
    }
    set updated(value) {
        this._impl.Set(this._ptr, "updated", value ? 1 : 0);
    }
    get layoutID() {
        return this.group + 1;
    }
    get tuple() {
        return this._impl._global.context.GetShader(this.layoutID).tuple;
    }
    get bufferID() {
        return this._impl.Get(this._ptr, "bufferID");
    }
    get size() {
        return this._impl.Get(this._ptr, "bufferBlockSize");
    }
    get offset() {
        return this._impl.Get(this._ptr, "bufferBlockOffset");
    }
    get blockPtr() {
        return this._blockPtr;
    }
    get bufferPtr() {
        return this._bufferPtr;
    }
    get bufferSize() {
        return this._bufferSize;
    }
    _impl;
    _bufferPtr;
    _bufferSize;
    _blockPtr;
    binding;
    dynamicOffsets;
}
export const Uniform_member_index = {
    ...Miaoverse.Binary_member_index,
    buffer_bufferID: ["uscalarGet", "uscalarSet", 1, 0],
    buffer_size: ["uscalarGet", "uscalarSet", 1, 1],
    buffer_addr: ["ptrGet", "ptrSet", 1, 2],
    buffer_next: ["ptrGet", "ptrSet", 1, 3],
    bn_buffer: ["ptrGet", "ptrSet", 1, 0],
    bn_bufferID: ["uscalarGet", "uscalarSet", 1, 1],
    bn_offset: ["uscalarGet", "uscalarSet", 1, 2],
    bn_size: ["uscalarGet", "uscalarSet", 1, 3],
    buffer: ["ptrGet", "ptrSet", 1, 12],
    bufferID: ["uscalarGet", "uscalarSet", 1, 13],
    bufferBlockOffset: ["uscalarGet", "uscalarSet", 1, 14],
    bufferBlockSize: ["uscalarGet", "uscalarSet", 1, 15],
    group: ["uscalarGet", "uscalarSet", 1, 16],
    binding: ["uscalarGet", "uscalarSet", 1, 17],
    updated: ["uscalarGet", "uscalarSet", 1, 18],
    m_reserved76: ["uscalarGet", "uscalarSet", 1, 19],
};
//# sourceMappingURL=uniform.js.map