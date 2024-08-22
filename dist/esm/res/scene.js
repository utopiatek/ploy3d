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
    Culling(camera, layerMask) {
        const info = this._Culling(camera.internalPtr, layerMask);
        if (info[0] == 0) {
            return null;
        }
        const params = this._global.env.uarrayRef(info[1], 0, info[0] * 7);
        return {
            count: info[0],
            params
        };
    }
    async InstancePrefab(scene, uri, pkg, master, listBeg) {
        const prefab = {
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
        prefab.root = await this._global.resources.Object.Create(scene);
        prefab.root.layers = 32;
        prefab.instanceCount = data.instanceCount;
        const daz_figure = data.scheme != "daz" ? null : {};
        for (let batch of data.batches) {
            if (typeof batch.source == "string") {
                const child_prefab = await this.InstancePrefab(scene, batch.source, desc.pkg, prefab.master, prefab.instanceBeg + batch.instanceBeg);
                if (child_prefab.instanceCount != batch.instanceCount) {
                    this._global.Track(`Scene_kernel.InstancePrefab: 预制件 ${uuid} 实际3D对象实例数量 ${child_prefab.instanceCount} 与预期 ${batch.instanceCount} 不符！`, 3);
                }
                child_prefab.root.SetParent(prefab.root);
            }
            else {
                const instances = await this.InstanceNode(scene, batch.source, prefab.instanceBeg + batch.instanceBeg, data.nodes, prefab.instanceList);
                if (instances.instanceCount != batch.instanceCount) {
                    this._global.Track(`Scene_kernel.InstancePrefab: 节点源 ${uuid} 实际3D对象实例数量 ${instances.instanceCount} 与预期 ${batch.instanceCount} 不符！`, 3);
                }
                instances.root.SetParent(prefab.root);
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
            prefab.root.SetLngLat(data.lnglat[0], data.lnglat[1], data.altitude || 0);
        }
        return prefab;
    }
    async InstanceNode(scene, source, listBeg, nodes, instanceList) {
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
            const instance = await this._global.resources.Object.Create(scene);
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