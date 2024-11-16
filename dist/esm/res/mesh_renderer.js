import * as Miaoverse from "../mod.js";
export class MeshRenderer extends Miaoverse.Uniform {
    constructor(impl, ptr, id) {
        super(impl, ptr, id);
        this._view = new (this.tuple.view)(this);
    }
    SetMaterial(slot, submesh, material) {
        this._impl["_SetMaterial"](this._ptr, slot, submesh, material.internalPtr);
    }
    GetMaterial(slot) {
        const id = this._impl["_GetMaterial"](this._ptr, slot);
        return this._global.resources.Material.GetInstanceByID(id);
    }
    BindSkeleton(joints) {
        const enabled = this._impl.Get(this._ptr, "skeleton_skin_enabled");
        const array_ptr = this._impl.Get(this._ptr, "skeleton_skin_joints");
        if (enabled) {
            this._global.env.uarraySet(array_ptr, 0, joints);
        }
    }
    GetSkeleton() {
        const enabled = this._impl.Get(this._ptr, "skeleton_skin_enabled");
        if (enabled) {
            const array_ptr = this._impl.Get(this._ptr, "skeleton_skin_joints");
            const joints = this._global.env.uarrayGet(array_ptr, 0, 1);
            return joints;
        }
        return undefined;
    }
    UpdateG1(object3d) {
        this._impl["_UpdateG1"](this._ptr, object3d.internalPtr);
    }
    Release() {
        if (this.internalPtr) {
            this._impl["_Release"](this.internalPtr);
        }
    }
    AddRef() {
        const refCount = this._impl.Get(this._ptr, "refCount");
        this._impl.Set(this._ptr, "refCount", refCount + 1);
    }
    Dispose() {
        this._bufferPtr = 0;
        this._bufferSize = 0;
        this._blockPtr = 0;
        this.binding = null;
        this.atlas2D = null;
        this.dynamicOffsets = null;
        this._view = null;
        this._uuid = null;
    }
    get mesh() {
        const ptr = this._impl.Get(this._ptr, "meshPTR");
        return this._global.resources.Mesh.GetInstanceByPtr(ptr);
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
    get boneBuffer() {
        return this._impl.Get(this._ptr, "boneBuffer");
    }
    get boneArrayStart() {
        return this._impl.Get(this._ptr, "boneArrayStart");
    }
    get g1_morphTargets() {
        return this._impl.Get(this._ptr, "g1_morphTargets");
    }
    get view() {
        return this._view;
    }
    drawCustom;
    _view;
    _uuid;
}
export class MeshRenderer_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, MeshRendere_member_index);
    }
    async Load(uri, pkg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }
        const desc = await this._global.resources.Load_file("json", uri, true, pkg);
        if (!desc) {
            return null;
        }
        desc.data.uuid = uuid;
        const mesh = await this._global.resources.Mesh.Load(desc.data.mesh, desc.pkg);
        if (this._instanceLut[uuid] && !(mesh?.skeleton)) {
            return this._instanceLut[uuid];
        }
        const materials = [];
        for (let mat of desc.data.materials) {
            const material = await this._global.resources.Material.Load(mat.material, desc.pkg);
            materials.push({
                slot: mat.slot,
                submesh: mat.submesh,
                material
            });
        }
        const instance = await this.Create(mesh, materials);
        instance["_uuid"] = uuid;
        return instance;
    }
    async Create(mesh, materials) {
        const ptr = this._Create(mesh?.internalPtr || 0, mesh?.skeleton?.skeleton || 0);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new MeshRenderer(this, ptr, id);
        this._instanceCount++;
        if (materials) {
            for (let mat of materials) {
                instance.SetMaterial(mat.slot == undefined ? mat.submesh : mat.slot, mat.submesh, mat.material);
            }
        }
        this._gcList.push(() => {
            instance.Release();
        });
        return instance;
    }
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("MeshRenderer_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }
        instance["Dispose"]();
        instance["_impl"] = null;
        instance["_global"] = null;
        instance["_ptr"] = 0;
        instance["_id"] = this._instanceIdle;
        this._instanceIdle = id;
        this._instanceCount -= 1;
    }
    DisposeAll() {
        if (this.defaultG1) {
            this.defaultG1.Release();
        }
        if (this._instanceCount != 0) {
            console.error("异常！存在未释放的网格渲染器组件实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
        this.defaultG1 = null;
        this.instanceVBL = null;
        this._gcList = null;
    }
    _Create;
    _Release;
    _SetMaterial;
    _GetMaterial;
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
    _gcList = [];
}
export const MeshRendere_member_index = {
    ...Miaoverse.Uniform_member_index,
    skeleton_skin_enabled: ["uscalarGet", "uscalarSet", 1, 20],
    skeleton_skin_writeTS: ["uscalarGet", "uscalarSet", 1, 21],
    skeleton_skin_memorySize: ["uscalarGet", "uscalarSet", 1, 22],
    skeleton_skin_memory: ["uscalarGet", "uscalarSet", 1, 23],
    skeleton_skin_joints: ["ptrGet", "ptrSet", 1, 24],
    skeleton_skin_ctrls: ["ptrGet", "ptrSet", 1, 25],
    skeleton_skin_jointsTS: ["ptrGet", "ptrSet", 1, 26],
    skeleton_skin_pose: ["ptrGet", "ptrSet", 1, 27],
    skeletonPTR: ["ptrGet", "ptrSet", 1, 28],
    skeletonUUID: ["uuidGet", "uuidSet", 3, 29],
    meshPTR: ["ptrGet", "ptrSet", 1, 32],
    meshUUID: ["uuidGet", "uuidSet", 3, 33],
    enabled: ["uscalarGet", "uscalarSet", 1, 36],
    flush: ["uscalarGet", "uscalarSet", 1, 37],
    frontFace: ["uscalarGet", "uscalarSet", 1, 38],
    cullMode: ["uscalarGet", "uscalarSet", 1, 39],
    boneBuffer: ["ptrGet", "ptrSet", 1, 40],
    boneArrayStart: ["ptrGet", "ptrSet", 1, 41],
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
