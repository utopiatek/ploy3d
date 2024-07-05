import * as Miaoverse from "../mod.js";
export class MeshRenderer extends Miaoverse.Uniform {
    constructor(impl, ptr, id) {
        super(impl, ptr, id);
    }
    get enabled() {
        return this._impl.Get(this._ptr, "enabled") > 0;
    }
    set enabled(b) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }
    get flush() {
        return this._impl.Get(this._ptr, "flush") > 0;
    }
    set flush(b) {
        this._impl.Set(this._ptr, "flush", b ? 1 : 0);
    }
    get vertexArray() {
        return this._impl.Get(this._ptr, "vertexArray");
    }
    set vertexArray(value) {
        this._impl.Set(this._ptr, "vertexArray", value);
    }
    get drawTS() {
        return this._impl.Get(this._ptr, "drawTS");
    }
    get materialCount() {
        return this._impl.Get(this._ptr, "materialCount");
    }
    get g1_instanceList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g1_instanceList"));
    }
    get g1_boneList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g1_boneList"));
    }
    get g1_morphTargets() {
        return this._impl.Get(this._ptr, "g1_morphTargets");
    }
}
export class MeshRenderer_kernel {
    constructor(_global) {
        this._global = _global;
    }
    async CreateMeshRenderer(mesh, skeleton) {
        const ptr = this.InstanceMeshRenderer(0, 0);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new MeshRenderer(this, ptr, id);
        this._instanceCount++;
        this._gcList.push(instance);
        return instance;
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
    Get(self, key) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]);
    }
    Set(self, key, value) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value);
    }
    InstanceMeshRenderer;
    _global;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
    _gcList = [];
    _members = {
        ...Miaoverse.Uniform_member_index,
        reserved: ["uarrayGet", "uarraySet", 8, 20],
        skeletonPTR: ["ptrGet", "ptrSet", 1, 28],
        skeletonUUID: ["uuidGet", "uuidSet", 3, 29],
        meshPTR: ["ptrGet", "ptrSet", 1, 32],
        meshUUID: ["uuidGet", "uuidSet", 3, 33],
        enabled: ["uscalarGet", "uscalarSet", 1, 36],
        flush: ["uscalarGet", "uscalarSet", 1, 37],
        lastSib: ["ptrGet", "ptrSet", 1, 38],
        nextSib: ["ptrGet", "ptrSet", 1, 39],
        g1_instanceList: ["ptrGet", "ptrSet", 1, 40],
        g1_boneList: ["ptrGet", "ptrSet", 1, 41],
        g1_morphTargets: ["uscalarGet", "uscalarSet", 1, 42],
        vertexArray: ["uscalarGet", "uscalarSet", 1, 43],
        drawTS: ["uscalarGet", "uscalarSet", 1, 44],
        materialCount: ["uscalarGet", "uscalarSet", 1, 45],
        drawInstanceList: ["ptrGet", "ptrSet", 1, 46],
        materials: ["ptrGet", "ptrSet", 1, 47],
        center: ["farrayGet", "farraySet", 3, 96],
        renderFlags: ["uscalarGet", "uscalarSet", 1, 99],
        extents: ["farrayGet", "farraySet", 3, 100],
        instanceCount: ["uscalarGet", "uscalarSet", 1, 103],
        reserved2: ["uarrayGet", "uarraySet", 4, 104],
        morphSampler: ["uarrayGet", "uarraySet", 4, 108],
        morphTargetsWeight: ["uarrayGet", "uarraySet", 16, 112],
    };
    _members_key;
}
export const MaterialNode_member_index = {
    slot: ["uscalarGet", "uscalarSet", 1, 0],
    submesh: ["uscalarGet", "uscalarSet", 1, 1],
    branchTS: ["uscalarGet", "uscalarSet", 1, 2],
    branchKEY: ["uscalarGet", "uscalarSet", 1, 3],
    materialPTR: ["ptrGet", "ptrSet", 1, 4],
    materialUUID: ["uuidGet", "uuidSet", 3, 5],
    sortH: ["uscalarGet", "uscalarSet", 1, 8],
    meshRenderer: ["ptrGet", "ptrSet", 1, 9],
    last: ["ptrGet", "ptrSet", 1, 10],
    next: ["ptrGet", "ptrSet", 1, 11],
    reserved: ["uarrayGet", "uarraySet", 4, 12],
};
//# sourceMappingURL=mesh_renderer.js.map