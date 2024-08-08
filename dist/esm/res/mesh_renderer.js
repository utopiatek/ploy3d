import * as Miaoverse from "../mod.js";
export class MeshRenderer extends Miaoverse.Uniform {
    constructor(impl, ptr, id) {
        super(impl, ptr, id);
        this._view = new (this.tuple.view)(this);
    }
    SetMaterial(slot, submesh, material) {
        this._impl["_SetMaterial"](this._ptr, slot, submesh, material.internalPtr);
    }
    UpdateG1(object3d) {
        this._impl["_UpdateG1"](this._ptr, object3d.internalPtr);
    }
    get size() {
        return this._impl.Get(this._ptr, "bufferBlockSize") - 256;
    }
    get offset() {
        return this._impl.Get(this._ptr, "bufferBlockOffset") + 256;
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
    get frontFace() {
        return this._impl.Get(this._ptr, "frontFace");
    }
    set frontFace(value) {
        this._impl.Set(this._ptr, "frontFace", value);
    }
    get cullMode() {
        return this._impl.Get(this._ptr, "cullMode");
    }
    set cullMode(value) {
        this._impl.Set(this._ptr, "cullMode", value);
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
    get view() {
        return this._view;
    }
    _view;
}
export class MeshRenderer_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, MeshRendere_member_index);
    }
    async Create(mesh, skeleton, materials) {
        const ptr = this._Create(mesh?.internalPtr || 0, skeleton?.internalPtr || 0);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new MeshRenderer(this, ptr, id);
        this._instanceCount++;
        if (materials) {
            for (let mat of materials) {
                instance.SetMaterial(mat.slot == undefined ? mat.submesh : mat.slot, mat.submesh, mat.material);
            }
        }
        this._gcList.push(instance);
        return instance;
    }
    _Create;
    _SetMaterial;
    _GetInstanceSlot;
    _VerifyInstance;
    _UpdateG1;
    defaultG1;
    instanceVBL = {
        arrayStride: 104,
        stepMode: "instance",
        attributes: [
            {
                shaderLocation: 9,
                offset: 0,
                format: "float32x4"
            },
            {
                shaderLocation: 10,
                offset: 16,
                format: "float32x4"
            },
            {
                shaderLocation: 11,
                offset: 32,
                format: "float32x4"
            },
            {
                shaderLocation: 12,
                offset: 48,
                format: "float32x4"
            },
            {
                shaderLocation: 13,
                offset: 64,
                format: "uint32x4"
            },
            {
                shaderLocation: 14,
                offset: 80,
                format: "float32x3"
            },
            {
                shaderLocation: 15,
                offset: 92,
                format: "float32x3"
            }
        ]
    };
}
export const MeshRendere_member_index = {
    ...Miaoverse.Uniform_member_index,
    reserved: ["uarrayGet", "uarraySet", 8, 20],
    skeletonPTR: ["ptrGet", "ptrSet", 1, 28],
    skeletonUUID: ["uuidGet", "uuidSet", 3, 29],
    meshPTR: ["ptrGet", "ptrSet", 1, 32],
    meshUUID: ["uuidGet", "uuidSet", 3, 33],
    enabled: ["uscalarGet", "uscalarSet", 1, 36],
    flush: ["uscalarGet", "uscalarSet", 1, 37],
    frontFace: ["uscalarGet", "uscalarSet", 1, 38],
    cullMode: ["uscalarGet", "uscalarSet", 1, 39],
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
    drawInstanceCount: ["fscalarGet", "fscalarSet", 1, 103],
    morphSampler: ["uarrayGet", "uarraySet", 4, 108],
    morphTargetsWeight: ["uarrayGet", "uarraySet", 16, 112],
};
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
export const DrawInstance_member_index = {
    wfmMat: ["farrayGet", "farraySet", 16, 0],
    object: ["uscalarGet", "uscalarSet", 1, 16],
    flags: ["uscalarGet", "uscalarSet", 1, 17],
    layers: ["uscalarGet", "uscalarSet", 1, 18],
    userData: ["uscalarGet", "uscalarSet", 1, 19],
    bbCenter: ["farrayGet", "farraySet", 3, 20],
    bbExtents: ["farrayGet", "farraySet", 3, 23],
};
//# sourceMappingURL=mesh_renderer.js.map