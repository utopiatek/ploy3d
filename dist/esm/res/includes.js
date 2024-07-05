import * as Miaoverse from "../mod.js";
const Binary_member_index = {
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
const Uniform_member_index = {
    ...Binary_member_index,
    buffer: ["ptrGet", "ptrSet", 1, 12],
    bufferID: ["uscalarGet", "uscalarSet", 1, 13],
    bufferBlockOffset: ["uscalarGet", "uscalarSet", 1, 14],
    bufferBlockSize: ["uscalarGet", "uscalarSet", 1, 15],
    group: ["uscalarGet", "uscalarSet", 1, 16],
    binding: ["uscalarGet", "uscalarSet", 1, 17],
    updated: ["uscalarGet", "uscalarSet", 1, 18],
    unused3: ["uscalarGet", "uscalarSet", 1, 19],
};
const Material_member_index = {
    ...Uniform_member_index,
    shaderID: ["uscalarGet", "uscalarSet", 1, 20],
    shaderUUID: ["uuidGet", "uuidSet", 3, 21],
    enableFlags: ["uscalarGet", "uscalarSet", 1, 24],
    froxelList: ["ptrGet", "ptrSet", 1, 25],
    lightVoxel: ["ptrGet", "ptrSet", 1, 26],
    lightList: ["ptrGet", "ptrSet", 1, 27],
    reserved7: ["uarrayGet", "uarraySet", 4, 28],
};
const MaterialNode_member_index = {
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
const Skeleton_member_index = {
    ...Binary_member_index,
    flags: ["uscalarGet", "uscalarSet", 1, 12],
    jointCount: ["uscalarGet", "uscalarSet", 1, 13],
    jointRootIndex: ["uscalarGet", "uscalarSet", 1, 14],
    jointsNameLength: ["uscalarGet", "uscalarSet", 1, 15],
    initDatas: ["ptrGet", "ptrSet", 1, 16],
    inverseBindMatrices: ["ptrGet", "ptrSet", 1, 17],
    jointsUuid: ["ptrGet", "ptrSet", 1, 18],
    jointsName: ["ptrGet", "ptrSet", 1, 19],
};
const Skin_member_index = {
    ...Binary_member_index,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 12],
    method: ["uscalarGet", "uscalarSet", 1, 13],
    unloaded: ["uscalarGet", "uscalarSet", 1, 14],
    vertices: ["ptrGet", "ptrSet", 1, 15],
};
const Morph_member_index = {
    ...Binary_member_index,
    type: ["uscalarGet", "uscalarSet", 1, 12],
    deltasByteSize: ["uscalarGet", "uscalarSet", 1, 13],
    min: ["farrayGet", "farraySet", 3, 14],
    max: ["farrayGet", "farraySet", 3, 17],
    textureWidth: ["uscalarGet", "uscalarSet", 1, 20],
    vertexCount: ["uscalarGet", "uscalarSet", 1, 21],
    targetCount: ["uscalarGet", "uscalarSet", 1, 22],
    morphTargets: ["ptrGet", "ptrSet", 1, 23],
    modifyCount: ["ptrGet", "ptrSet", 1, 24],
    deltas: ["ptrGet", "ptrSet", 1, 25],
    unloaded: ["uscalarGet", "uscalarSet", 1, 26],
    unused3: ["uscalarGet", "uscalarSet", 1, 27],
    reserved: ["uarrayGet", "uarraySet", 4, 28],
};
const UVSet_member_index = {
    ...Binary_member_index,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 12],
    uvCount: ["uscalarGet", "uscalarSet", 1, 13],
    mappingCount: ["uscalarGet", "uscalarSet", 1, 14],
    unloaded: ["uscalarGet", "uscalarSet", 1, 15],
    unused0: ["uscalarGet", "uscalarSet", 1, 16],
    unused1: ["uscalarGet", "uscalarSet", 1, 17],
    uv: ["ptrGet", "ptrSet", 1, 18],
    polygonVertexIndices: ["ptrGet", "ptrSet", 1, 19],
};
const Geometry_member_index = {
    ...Binary_member_index,
    defaultUVPTR: ["ptrGet", "ptrSet", 1, 12],
    defaultUVUUID: ["uuidGet", "uuidSet", 3, 13],
    type: ["uscalarGet", "uscalarSet", 1, 16],
    edgeInterpolationMode: ["uscalarGet", "uscalarSet", 1, 17],
    vertexCount: ["uscalarGet", "uscalarSet", 1, 18],
    polyCount: ["uscalarGet", "uscalarSet", 1, 19],
    center: ["farrayGet", "farraySet", 3, 20],
    extents: ["farrayGet", "farraySet", 3, 23],
    vertices: ["ptrGet", "ptrSet", 1, 26],
    polylist: ["ptrGet", "ptrSet", 1, 27],
    materialGroupsNameLength: ["uscalarGet", "uscalarSet", 1, 28],
    polygonGroupsNameLength: ["uscalarGet", "uscalarSet", 1, 29],
    materialGroupsName: ["ptrGet", "ptrSet", 1, 30],
    polygonGroupsName: ["ptrGet", "ptrSet", 1, 31],
    unloaded: ["uscalarGet", "uscalarSet", 1, 32],
    reserved: ["uarrayGet", "uarraySet", 3, 33],
};
const Mesh_member_index = {
    ...Binary_member_index,
    unloaded: ["uscalarGet", "uscalarSet", 1, 12],
    reserved: ["uarrayGet", "uarraySet", 3, 13],
    geometryPTR: ["ptrGet", "ptrSet", 1, 16],
    geometryUUID: ["uuidGet", "uuidSet", 3, 17],
    uvPTR: ["ptrGet", "ptrSet", 1, 20],
    uvUUID: ["uuidGet", "uuidSet", 3, 21],
    skinPTR: ["ptrGet", "ptrSet", 1, 24],
    skinUUID: ["uuidGet", "uuidSet", 3, 25],
    morphPTR: ["ptrGet", "ptrSet", 1, 28],
    morphUUID: ["uuidGet", "uuidSet", 3, 29],
    vertexBufferLayout: ["uscalarGet", "uscalarSet", 1, 32],
    vertexBufferCount: ["uscalarGet", "uscalarSet", 1, 33],
    indexBufferFormat: ["uscalarGet", "uscalarSet", 1, 34],
    submeshCount: ["uscalarGet", "uscalarSet", 1, 35],
    vertexCount: ["uscalarGet", "uscalarSet", 1, 36],
    indexCount: ["uscalarGet", "uscalarSet", 1, 37],
    center: ["farrayGet", "farraySet", 3, 38],
    extents: ["farrayGet", "farraySet", 3, 41],
    skinMethod: ["uscalarGet", "uscalarSet", 1, 44],
    vertexBuffer: ["ptrGet", "ptrSet", 1, 45],
    indexBuffer: ["ptrGet", "ptrSet", 1, 46],
    meshData: ["ptrGet", "ptrSet", 1, 47],
};
const AnimationData_member_index = {
    ...Binary_member_index,
    unused0: ["uscalarGet", "uscalarSet", 1, 12],
    unused1: ["uscalarGet", "uscalarSet", 1, 13],
    clipCount: ["uscalarGet", "uscalarSet", 1, 14],
    clips: ["ptrGet", "ptrSet", 1, 15],
    skeletonPTR: ["ptrGet", "ptrSet", 1, 16],
    skeletonUUID: ["uuidGet", "uuidSet", 3, 17],
    morphPTR: ["ptrGet", "ptrSet", 1, 20],
    morphUUID: ["uuidGet", "uuidSet", 3, 21],
};
const MeshRenderer_member_index = {
    ...Uniform_member_index,
    reserved: ["uarrayGet", "uarraySet", 8, 20],
    skeletonPTR: ["ptrGet", "ptrSet", 1, 28],
    skeletonUUID: ["uuidGet", "uuidSet", 3, 29],
    meshPTR: ["ptrGet", "ptrSet", 1, 32],
    meshUUID: ["uuidGet", "uuidSet", 3, 33],
    enabled: ["uscalarGet", "uscalarSet", 1, 36],
    flush: ["uscalarGet", "uscalarSet", 1, 37],
    lastSib: ["ptrGet", "ptrSet", 1, 38],
    nextSib: ["ptrGet", "ptrSet", 1, 39],
    instanceList: ["ptrGet", "ptrSet", 1, 40],
    boneList: ["ptrGet", "ptrSet", 1, 41],
    morphTargets: ["ptrGet", "ptrSet", 1, 42],
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
const Animator_member_index = {
    ...Binary_member_index,
    reserved: ["uarrayGet", "uarraySet", 4, 12],
    enabled: ["uscalarGet", "uscalarSet", 1, 16],
    object: ["ptrGet", "ptrSet", 1, 17],
    lastSib: ["ptrGet", "ptrSet", 1, 18],
    nextSib: ["ptrGet", "ptrSet", 1, 19],
    clipCount: ["uscalarGet", "uscalarSet", 1, 20],
    unused2: ["uscalarGet", "uscalarSet", 1, 21],
    node: ["ptrGet", "ptrSet", 1, 22],
    nextClip: ["ptrGet", "ptrSet", 1, 23],
};
const Camera_member_index = {
    ...Binary_member_index,
    type: ["uscalarGet", "uscalarSet", 1, 12],
    updated: ["uscalarGet", "uscalarSet", 1, 13],
    depth: ["uscalarGet", "uscalarSet", 1, 14],
    cullingFilter: ["uscalarGet", "uscalarSet", 1, 15],
    target: ["farrayGet", "farraySet", 3, 16],
    distance: ["fscalarGet", "fscalarSet", 1, 19],
    pitch: ["fscalarGet", "fscalarSet", 1, 20],
    yaw: ["fscalarGet", "fscalarSet", 1, 21],
    roll: ["fscalarGet", "fscalarSet", 1, 22],
    fov: ["fscalarGet", "fscalarSet", 1, 23],
    width: ["fscalarGet", "fscalarSet", 1, 24],
    height: ["fscalarGet", "fscalarSet", 1, 25],
    nearZ: ["fscalarGet", "fscalarSet", 1, 26],
    farZ: ["fscalarGet", "fscalarSet", 1, 27],
    enabled: ["uscalarGet", "uscalarSet", 1, 28],
    object: ["ptrGet", "ptrSet", 1, 29],
    lastSib: ["ptrGet", "ptrSet", 1, 30],
    nextSib: ["ptrGet", "ptrSet", 1, 31],
};
const Volume_member_index = {
    ...Binary_member_index,
    enabled: ["uscalarGet", "uscalarSet", 1, 12],
    object: ["ptrGet", "ptrSet", 1, 13],
    lastSib: ["ptrGet", "ptrSet", 1, 14],
    nextSib: ["ptrGet", "ptrSet", 1, 15],
    skyLuminance: ["fscalarGet", "fscalarSet", 1, 16],
    skyPitch: ["fscalarGet", "fscalarSet", 1, 17],
    skyYaw: ["fscalarGet", "fscalarSet", 1, 18],
    skyRoll: ["fscalarGet", "fscalarSet", 1, 19],
    skySH: ["farrayGet", "farraySet", 36, 20],
    sunColorIntensity: ["farrayGet", "farraySet", 4, 56],
    sunDirection: ["farrayGet", "farraySet", 3, 60],
    unused4: ["fscalarGet", "fscalarSet", 1, 63],
};
const Light_member_index = {
    ...Binary_member_index,
    enabled: ["uscalarGet", "uscalarSet", 1, 12],
    object: ["ptrGet", "ptrSet", 1, 13],
    lastSib: ["ptrGet", "ptrSet", 1, 14],
    nextSib: ["ptrGet", "ptrSet", 1, 15],
    flags: ["uscalarGet", "uscalarSet", 1, 16],
    reserved: ["uarrayGet", "uarraySet", 3, 17],
    color: ["farrayGet", "farraySet", 3, 20],
    lux: ["fscalarGet", "fscalarSet", 1, 23],
    position: ["farrayGet", "farraySet", 3, 24],
    falloff: ["fscalarGet", "fscalarSet", 1, 27],
    direction: ["farrayGet", "farraySet", 3, 28],
    extra: ["fscalarGet", "fscalarSet", 1, 31],
    spotCone: ["farrayGet", "farraySet", 2, 32],
    spotScaleOffset: ["farrayGet", "farraySet", 2, 34],
};
const Node_member_index = {
    ...Binary_member_index,
    index: ["uscalarGet", "uscalarSet", 1, 12],
    enabled: ["uscalarGet", "uscalarSet", 1, 13],
    layers: ["uscalarGet", "uscalarSet", 1, 14],
    flags: ["uscalarGet", "uscalarSet", 1, 15],
    worldLLMC: ["farrayGet", "farraySet", 4, 16],
    localPosition: ["farrayGet", "farraySet", 3, 20],
    altitude: ["fscalarGet", "fscalarSet", 1, 23],
    localScale: ["farrayGet", "farraySet", 3, 24],
    parent: ["ptrGet", "ptrSet", 1, 27],
    localRotation: ["farrayGet", "farraySet", 4, 28],
    meshRenderer: ["ptrGet", "ptrSet", 1, 32],
    camera: ["ptrGet", "ptrSet", 1, 33],
    light: ["ptrGet", "ptrSet", 1, 34],
    animator: ["ptrGet", "ptrSet", 1, 35],
    prefab: ["uscalarGet", "uscalarSet", 1, 36],
    depth: ["uscalarGet", "uscalarSet", 1, 37],
    unused2: ["uscalarGet", "uscalarSet", 1, 38],
    unused3: ["uscalarGet", "uscalarSet", 1, 39],
    name: ["stringGet", "stringSet", 64, 40],
    reserved: ["uarrayGet", "uarraySet", 8, 56],
};
class Object_kernel {
    GetInstanceByPtr(self) {
        if (this._global.env.ptrValid(self)) {
            const id = this.Get(self, "id");
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
    Flush;
    UpdateTransform;
    Update;
    _global;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
    _members = {
        ...Node_member_index,
        source: ["uscalarGet", "uscalarSet", 1, 64],
        instance: ["uscalarGet", "uscalarSet", 1, 65],
        parentTS: ["uscalarGet", "uscalarSet", 1, 66],
        gisTS: ["uscalarGet", "uscalarSet", 1, 67],
        childCount: ["uscalarGet", "uscalarSet", 1, 68],
        updated: ["uscalarGet", "uscalarSet", 1, 69],
        nextEdit: ["ptrGet", "ptrSet", 1, 70],
        nextDraw: ["ptrGet", "ptrSet", 1, 71],
        scene: ["ptrGet", "ptrSet", 1, 72],
        children: ["ptrGet", "ptrSet", 1, 73],
        lastSib: ["ptrGet", "ptrSet", 1, 74],
        nextSib: ["ptrGet", "ptrSet", 1, 75],
        worldRotation: ["farrayGet", "farraySet", 4, 76],
        reserved2: ["uarrayGet", "uarraySet", 4, 92],
        wfmMat: ["farrayGet", "farraySet", 16, 96],
        mfwMat: ["farrayGet", "farraySet", 16, 112],
    };
    _members_key;
}
export class KernelImpl {
    constructor(_global) {
        this._global = _global;
    }
    Link() {
        const exports = this._global.internal.Engine_Export();
        const view = this._global.env["_ubview"];
        const textDecoder = this._global.env["_textDecoder"];
        for (let i = 0; i < exports.length;) {
            let beg = exports[i++];
            let end = beg;
            while (0 !== view[end++])
                ;
            const names = textDecoder.decode(view.subarray(beg, end - 1)).split(",");
            const klass = this[names[0]];
            for (let j = 1; j < names.length; j++, i++) {
                klass[names[j]] = this._global.internal.__indirect_function_table.get(exports[i]);
            }
        }
    }
    _global;
    VMath = new Miaoverse.VMath_kernel();
    Object = new Object_kernel();
}
export class Resource {
    constructor(_global, ptr, id) {
        this._global = _global;
        this._ptr = ptr;
        this._id = id;
    }
    _global;
    _ptr;
    _id;
}
;
//# sourceMappingURL=includes.js.map