import * as Miaoverse from "../mod.js";
export class Scene extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
        this._prefab = {
            uuid: "",
            needSave: false,
            master: null,
            root: null,
            instanceList: [],
            instanceBeg: 0,
            instanceCount: 0
        };
    }
    Destroy() {
        this._impl["_Destroy"](this.internalPtr);
    }
    ForEachRoot(proc) {
        let firstChild = this._impl["_FirstRoot"](this._ptr);
        if (firstChild) {
            let child = this._global.resources.Object.GetInstanceByPtr(firstChild);
            let index = 0;
            while (child) {
                proc(index, child);
                child = child.nextSib;
                index++;
            }
        }
    }
    async Save() {
        if (!this.prefab?.needSave || !this.prefab?.uuid) {
            return null;
        }
        const userSpace = this._global.resources.userSpace;
        const file = userSpace.GetNode(this.prefab.uuid);
        if (!file) {
            return null;
        }
        const batches = [];
        const TraverseTree = (indexSib, obj) => {
            const obj_master_prefab = obj.prefab?.master || obj.prefab;
            if (obj_master_prefab?.needSave) {
                if (obj.layers == 32 && !obj.prefab.master) {
                    batches.push({
                        master: obj_master_prefab,
                        root: obj_master_prefab.root,
                        instanceList: obj_master_prefab.instanceList,
                    });
                }
                else if (obj.prefab === this.prefab) {
                    const obj_parent = obj.parent;
                    if (!obj_parent || (obj_parent.prefab !== this.prefab)) {
                        batches.push({
                            master: null,
                            root: obj,
                            instanceList: [],
                        });
                    }
                }
            }
            obj.ForEachChild(TraverseTree);
        };
        this.ForEachRoot(TraverseTree);
        const asset = {
            uuid: this.prefab.uuid,
            classid: 65,
            name: this.prefab.uuid,
            label: this.name,
            scheme: "scene",
            lnglat: this.lnglat,
            altitude: this.altitude,
            instanceCount: 0,
            nodes: [],
            batches: [],
            transforms: [],
            mesh_renderers: [],
            animators: [],
            dioramas: [],
        };
        let instanceBeg = 0;
        const GetParentInstanceID = (obj) => {
            let pid = undefined;
            let parent = obj.parent;
            if (parent) {
            }
            return pid;
        };
        const RecordTransform = (obj, instance, node, parent) => {
            const localPosition = obj.localPosition.values;
            const localRotation = obj.localRotation.values;
            const localScale = obj.localScale.values;
            const transform = {
                instance: instance,
                node: node,
                deactive: !obj.active,
                layers: obj.layers,
                parent: parent,
                localPosition: [localPosition[0], localPosition[1], localPosition[2]],
                localRotation: [localRotation[0], localRotation[1], localRotation[2], localRotation[3]],
                localScale: [localScale[0], localScale[1], localScale[2]],
            };
            asset.transforms.push(transform);
        };
        const RecordMeshRenderer = (obj, instance, node) => {
            const meshRenderer = obj.meshRenderer;
            if (meshRenderer) {
                if (!meshRenderer["_uuid"]) {
                }
                const joints_binding = meshRenderer.GetSkeleton();
                if (joints_binding) {
                }
                asset.mesh_renderers.push({
                    instance: instance,
                    node: node,
                    mesh_renderer: meshRenderer["_uuid"],
                    joints_binding: undefined
                });
            }
        };
        for (let batch of batches) {
            if (batch.master) {
                asset.batches.push({
                    source: batch.master.uuid,
                    instanceBeg: instanceBeg,
                    instanceCount: batch.master.instanceCount,
                });
                const pid = GetParentInstanceID(batch.root);
                RecordTransform(batch.root, instanceBeg + batch.master.instanceCount - 1, undefined, pid);
                instanceBeg += batch.master.instanceCount;
            }
            else {
                const source = asset.nodes.length;
                const list = batch.instanceList;
                const TraverseBatch = (depth, parent, obj) => {
                    if (obj.prefab !== this.prefab) {
                        return;
                    }
                    const index = asset.nodes.length;
                    list.push(obj);
                    asset.nodes.push({
                        index: index,
                        id: "" + index,
                        name: obj.name,
                        depth: depth,
                        parent: parent
                    });
                    obj.ForEachChild((_, _obj) => {
                        TraverseBatch(depth + 1, index, _obj);
                    });
                };
                TraverseBatch(0, -1, batch.root);
                asset.batches.push({
                    source: source,
                    instanceBeg: instanceBeg,
                    instanceCount: list.length,
                });
                for (let i = 0; i < list.length; i++) {
                    const obj = list[i];
                    const pid = i > 0 ? undefined : GetParentInstanceID(obj);
                    RecordTransform(obj, instanceBeg + i, source + i, pid);
                    RecordMeshRenderer(obj, instanceBeg + i, source + i);
                }
                instanceBeg += list.length;
            }
        }
        asset.instanceCount = instanceBeg + 1;
        const diorList = this._global.resources.Dioramas.GetInstanceList();
        for (let dior of diorList) {
            if (dior.scene == this) {
                asset.dioramas.push({
                    url: dior.url
                });
            }
        }
        const camera = this._global.app.camera;
        const target = camera.target;
        asset.viewState = {
            target: [target[0], target[1], target[2]],
            distance: camera.distance,
            pitch: camera.pitch,
            yaw: camera.yaw
        };
        userSpace.Update(file.id, JSON.stringify(asset));
        return asset;
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }
    get lnglat() {
        const wgs84 = this._impl.Get(this._ptr, "worldLLMC");
        const gcj02 = this._global.gis.WGS84_GCJ02([wgs84[0], wgs84[1]]);
        return gcj02;
    }
    set lnglat(gcj02) {
        const ll = this._global.gis.GCJ02_WGS84(gcj02);
        const mc = this._global.gis.LL2MC(ll);
        this._impl.Set(this._ptr, "worldLLMC", [ll[0], ll[1], mc[0], mc[1]]);
    }
    get altitude() {
        return this._impl.Get(this._ptr, "altitude");
    }
    set altitude(value) {
        this._impl.Set(this._ptr, "altitude", value);
    }
    get prefab() {
        return this._prefab;
    }
    get viewState() {
        return this._viewState;
    }
    _impl;
    _name = "scene";
    _prefab;
    _viewState;
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
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Scene_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }
        instance["_impl"] = null;
        instance["_global"] = null;
        instance["_ptr"] = 0;
        instance["_id"] = this._instanceIdle;
        this._instanceIdle = id;
        this._instanceCount -= 1;
    }
    DisposeAll() {
        if (this._instanceCount != 0) {
            console.info("销毁未释放的场景实例", this._instanceCount);
        }
        for (let i = 1; i < this._instanceList.length; i++) {
            const instance = this._instanceList[i];
            if (instance && instance.id == i) {
                instance.Destroy();
            }
        }
        if (this._instanceCount != 0) {
            console.error("销毁异常！存在释放失败的场景实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
    }
    Culling(camera, layerMask) {
        const info = this._Culling(camera.internalPtr, layerMask);
        if (info[0] == 0) {
            return null;
        }
        const params = this._global.env.uarrayRef(info[1], 0, info[0] * 8);
        return {
            count: info[0],
            params
        };
    }
    Raycast(camera, point, layerMask = 0xFFFFFFFF) {
        const ptr = this._Raycast(camera.internalPtr, point[0], point[1], layerMask >>> 0);
        if (ptr) {
            return this._global.resources.Object.GetInstanceByPtr(ptr);
        }
        return null;
    }
    async InstancePrefab(scene, uri, pkg, master, listBeg, loadScene) {
        let prefab = {
            uuid: "",
            master: master,
            root: null,
            instanceList: master?.instanceList || [],
            instanceBeg: listBeg || 0,
            instanceCount: 0
        };
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return prefab;
        }
        prefab.uuid = uuid;
        const desc = await this._global.resources.Load_file("json", uri, true, pkg);
        const data = desc?.data;
        if (!data) {
            return prefab;
        }
        pkg = desc.pkg;
        if (loadScene && data.scheme != "scene") {
            loadScene = false;
        }
        if (loadScene) {
            prefab = scene.prefab;
            prefab.master = null;
            prefab.root = null;
            prefab.instanceList = [];
            prefab.instanceBeg = 0;
            prefab.instanceCount = data.instanceCount;
        }
        else {
            prefab.root = await this._global.resources.Object.Create(scene, data.name, prefab);
            prefab.root.layers = 32;
            prefab.instanceCount = data.instanceCount;
        }
        const daz_figure = data.scheme != "daz" ? null : {};
        for (let batch of data.batches) {
            if (typeof batch.source == "string") {
                const child_prefab = await this.InstancePrefab(scene, batch.source, desc.pkg, prefab.master || prefab, prefab.instanceBeg + batch.instanceBeg);
                if (child_prefab.instanceCount != batch.instanceCount) {
                    this._global.Track(`Scene_kernel.InstancePrefab: 预制件 ${uuid} 实际3D对象实例数量 ${child_prefab.instanceCount} 与预期 ${batch.instanceCount} 不符！`, 3);
                }
                if (!loadScene) {
                    child_prefab.root.SetParent(prefab.root);
                }
                else {
                    child_prefab.master = null;
                    child_prefab.needSave = true;
                    if (data.lnglat) {
                        child_prefab.root.SetLngLat(data.lnglat[0], data.lnglat[1], data.altitude || 0);
                    }
                }
            }
            else {
                const instances = await this.InstanceNode(scene, batch.source, prefab.instanceBeg + batch.instanceBeg, data.nodes, prefab.instanceList, prefab);
                if (instances.instanceCount != batch.instanceCount) {
                    this._global.Track(`Scene_kernel.InstancePrefab: 节点源 ${uuid} 实际3D对象实例数量 ${instances.instanceCount} 与预期 ${batch.instanceCount} 不符！`, 3);
                }
                if (!loadScene) {
                    instances.root.SetParent(prefab.root);
                }
                else if (data.lnglat) {
                    instances.root.SetLngLat(data.lnglat[0], data.lnglat[1], data.altitude || 0);
                }
            }
        }
        prefab.instanceList[prefab.instanceBeg + prefab.instanceCount - 1] = prefab.root;
        for (let transform of data.transforms) {
            const instance = prefab.instanceList[prefab.instanceBeg + transform.instance];
            if (instance) {
                if (transform.bone_init && transform.bone_ctrl) {
                    const init = transform.bone_init;
                    const ctrl = transform.bone_ctrl;
                    const parent = data.transforms[transform.parent];
                    const localPosition = this._global.Vector3([
                        init.center_point[0] - (parent ? parent.bone_init.center_point[0] : 0) + ctrl.translation[0],
                        init.center_point[1] - (parent ? parent.bone_init.center_point[1] : 0) + ctrl.translation[1],
                        init.center_point[2] - (parent ? parent.bone_init.center_point[2] : 0) + ctrl.translation[2],
                    ]);
                    const orientation = this._global.Quaternion(init.orientation.slice());
                    const orientation_inv = orientation.inverse;
                    const rotation_euler = this._global.Vector3(ctrl.rotation.slice());
                    const rotation = rotation_euler.toQuaternion(init.rotation_order);
                    const localRotation = orientation.Multiply(rotation.Multiply(orientation_inv));
                    instance.localPosition = localPosition;
                    instance.localRotation = localRotation;
                }
                else if (transform.localMatrix) {
                    instance.localMatrix = this._global.Matrix4x4(transform.localMatrix);
                }
                else {
                    if (transform.localPosition) {
                        instance.localPosition = this._global.Vector3(transform.localPosition);
                    }
                    if (transform.localRotation) {
                        instance.localRotation = this._global.Quaternion(transform.localRotation);
                    }
                    if (transform.localScale) {
                        instance.localScale = this._global.Vector3(transform.localScale);
                    }
                }
                if (transform.deactive) {
                    instance.active = false;
                }
                if (transform.layers) {
                    instance.layers = transform.layers;
                }
                if (transform.parent > -1) {
                    const parent = prefab.instanceList[prefab.instanceBeg + transform.parent];
                    if (parent) {
                        instance.SetParent(parent);
                    }
                }
            }
        }
        for (let mesh_renderer of data.mesh_renderers) {
            const instance = prefab.instanceList[prefab.instanceBeg + mesh_renderer.instance];
            let mr_instance = null;
            if (instance) {
                if (daz_figure) {
                    const Mesh_CreateData = this._global.resources.Mesh["_CreateData"];
                    this._global.resources.Mesh["_CreateData"] = (ptr, size) => {
                        if ((instance.layers & 4) == 4) {
                            if (mesh_renderer.instance == 0) {
                                const ptr_ = this._global.internal.System_New(size);
                                const data_ = this._global.env.uarrayRef(ptr_, 0, size >> 2);
                                const data = this._global.env.uarrayRef(ptr, 0, size >> 2);
                                data_.set(data);
                                daz_figure.body_mesh_raw = [size, ptr_];
                            }
                            else {
                                this._global.resources.Mesh["_AutoFit"](1, 0.0003 * 100, 0.0, 0.5, 1.0, ptr, daz_figure.body_mesh_raw[1]);
                            }
                        }
                        return Mesh_CreateData(ptr, size);
                    };
                    mr_instance = await this._global.resources.MeshRenderer.Load(mesh_renderer.mesh_renderer, desc.pkg);
                    if (mr_instance) {
                        instance.meshRenderer = mr_instance;
                    }
                    this._global.resources.Mesh["_CreateData"] = Mesh_CreateData;
                }
                else {
                    mr_instance = await this._global.resources.MeshRenderer.Load(mesh_renderer.mesh_renderer, desc.pkg);
                    if (mr_instance) {
                        instance.meshRenderer = mr_instance;
                    }
                }
            }
            if (mr_instance && mesh_renderer.joints_binding) {
                const bindings = mesh_renderer.joints_binding.map((idx) => {
                    const joint = prefab.instanceList[prefab.instanceBeg + idx];
                    return joint?.internalPtr || 0;
                });
                mr_instance.BindSkeleton(bindings);
            }
        }
        for (let animator_desc of data.animators || []) {
            const instance = prefab.instanceList[prefab.instanceBeg + animator_desc.instance];
            if (instance) {
                const targets = animator_desc.targets_binding ? animator_desc.targets_binding.map((idx) => {
                    return prefab.instanceList[prefab.instanceBeg + idx];
                }) : [];
                const animator = await this._global.resources.Animator.Create(targets, animator_desc.animations, pkg);
                if (animator) {
                    instance.animator = animator;
                }
            }
        }
        if (data.lnglat) {
            if (!loadScene) {
                prefab.root.SetLngLat(data.lnglat[0], data.lnglat[1], data.altitude || 0);
            }
            else {
                scene.lnglat = data.lnglat;
                scene["_viewState"] = data.viewState;
                for (let dior of (data.dioramas || [])) {
                    await this._global.resources.Dioramas.Create_3mx(scene, dior.url);
                }
            }
        }
        return prefab;
    }
    async InstanceNode(scene, source, listBeg, nodes, instanceList, prefab) {
        let instanceCount = 0;
        const min_depth = nodes[source].depth + 1;
        for (let i = source; i < nodes.length; i++) {
            const asset = nodes[i];
            if (asset.depth < min_depth && i > source) {
                break;
            }
            let parent = null;
            if (asset.parent >= source) {
                parent = instanceList[listBeg + (asset.parent - source)];
                if (!parent) {
                    this._global.Track(`Scene_kernel.InstanceNode: 父级节点索引异常！`, 3);
                }
            }
            const instance = await this._global.resources.Object.Create(scene, asset.name, prefab);
            instanceList[listBeg + instanceCount++] = instance;
            if (parent) {
                instance.SetParent(parent);
            }
        }
        return { instanceCount, root: instanceList[listBeg] };
    }
    _Create;
    _Destroy;
    _Culling;
    _Raycast;
    _FirstRoot;
}
export const Scene_member_index = {
    ...Miaoverse.Binary_member_index,
    worldLLMC: ["farrayGet", "farraySet", 4, 12],
    altitude: ["fscalarGet", "fscalarSet", 1, 16],
    unused1: ["uscalarGet", "uscalarSet", 1, 17],
    unused2: ["uscalarGet", "uscalarSet", 1, 18],
    unused3: ["uscalarGet", "uscalarSet", 1, 19],
};
