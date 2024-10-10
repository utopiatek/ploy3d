export const Binary_member_index = {
    magic: ["uscalarGet", "uscalarSet", 1, 0],
    version: ["uscalarGet", "uscalarSet", 1, 1],
    byteSize: ["uscalarGet", "uscalarSet", 1, 2],
    refCount: ["uscalarGet", "uscalarSet", 1, 3],
    id: ["uscalarGet", "uscalarSet", 1, 4],
    uuid: ["uuidGet", "uuidSet", 3, 5],
    writeTS: ["uscalarGet", "uscalarSet", 1, 8],
    readTS: ["uscalarGet", "uscalarSet", 1, 9],
    last: ["ptrGet", "ptrSet", 1, 10],
    next: ["ptrGet", "ptrSet", 1, 11],
};
export class Base_kernel {
    constructor(_global, _members) {
        this._global = _global;
        this._members = _members;
    }
    Get(ptr, key) {
        const member = this._members[key];
        return this._global.env[member[0]](ptr, member[3], member[2]);
    }
    Set(ptr, key, value) {
        const member = this._members[key];
        this._global.env[member[1]](ptr, member[3], value);
    }
    GetInstanceByPtr(ptr) {
        if (this._global.env.ptrValid(ptr)) {
            const id = this.Get(ptr, "id");
            return this.GetInstanceByID(id);
        }
        return null;
    }
    GetInstanceByID(id) {
        return this._instanceList[id];
    }
    _global;
    _members;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
}
