import * as Miaoverse from "../mod.js";
export class Scene extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }
    _impl;
}
export class Scene_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Scene_member_index);
    }
    async Create() {
        const ptr = this._Create();
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Scene(this, ptr, id);
        this._instanceCount++;
        return instance;
    }
    _Create;
    _Destroy;
}
export const Scene_member_index = {
    ...Miaoverse.Binary_member_index,
    worldLLMC: ["farrayGet", "farraySet", 4, 12],
    altitude: ["fscalarGet", "fscalarSet", 1, 16],
    unused1: ["uscalarGet", "uscalarSet", 1, 17],
    unused2: ["uscalarGet", "uscalarSet", 1, 18],
    unused3: ["uscalarGet", "uscalarSet", 1, 19],
};
//# sourceMappingURL=scene.js.map