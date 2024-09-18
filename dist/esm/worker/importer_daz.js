import { MAGIC_INVALID } from "../mod.js";
export class Resources_daz {
    constructor(_worker) {
        this._worker = _worker;
        this._cache = {};
    }
    async Load(path, progress) {
        if (!path) {
            return null;
        }
        let pkg = this._cache[path];
        if (pkg != undefined) {
            return pkg;
        }
        try {
            pkg = await this.Import(path, progress);
            if (pkg) {
                this._cache[path] = pkg;
                return pkg;
            }
        }
        catch (err) {
            console.error(err);
        }
        this._cache[path] = null;
        return null;
    }
    async Load_texture(path) {
        return "";
    }
    async Import(path, progress) {
        const fullpath = this._worker.dazServ + path;
        const buffer = await this._worker.Fetch(fullpath, null, "arrayBuffer");
        if (!buffer) {
            throw "文件加载失败！" + path;
        }
        let data = null;
        const magic = new Uint8Array(buffer, 0, 3);
        if (0x1F == magic[0] && 0x8B == magic[1] && 0x08 == magic[2]) {
            const bin = this._worker.Pako_inflate(buffer);
            const text = new TextDecoder().decode(bin);
            data = JSON.parse(text);
        }
        else {
            const text = new TextDecoder().decode(buffer);
            data = JSON.parse(text);
        }
        if (!data) {
            throw "文件解析失败！" + path;
        }
        const pkg = await (new Importer_daz(this, path, data)).Load();
        if (!pkg) {
            throw "文件导入失败！" + path;
        }
        this._news.push(pkg);
        return pkg;
    }
    EulerOrder(name) {
        switch (name) {
            case "XYZ":
                return 210;
            case "YZX":
                return 21;
            case "ZYX":
                return 12;
            case "ZXY":
                return 102;
            case "XZY":
                return 120;
            case "YXZ":
                return 201;
            default:
                return 210;
        }
        return 201;
    }
    _worker;
    _cache = {};
    _news;
}
export class Importer_daz {
    constructor(_resources, _path, _data) {
        this._resources = _resources;
        this._data = _data;
        this._cache = {
            path: _path,
            uuid: null,
            key: null,
            pkg: null,
            files: {},
            uuidLut: {},
            nodeLib: {
                lut: {},
                list: []
            }
        };
    }
    async Load() {
        const uuid = await this._resources["_worker"].env.uuidGen();
        const uuid_parts = uuid.split("-");
        const pkg_name = this._cache.path.substring(this._cache.path.lastIndexOf("/") + 1).replace(".", "_");
        const meta = {
            guid: this._resources["_worker"].env.guidGet(),
            uuid: uuid,
            uid: parseInt(uuid_parts[0]),
            pid: parseInt(uuid_parts[1]),
            version: parseInt(uuid_parts[2]),
            author: "miaokit",
            name: pkg_name,
            desc: this._cache.path,
            engine: 1.0,
            timestrap: Date.now()
        };
        const pkg_key = meta.uuid + "." + meta.author + "." + meta.name;
        const pkg = {
            key: pkg_key,
            uuid: meta.uuid,
            invalid: false,
            path: "./assets/packages/" + pkg_key + ".ab",
            zip: false,
            meta: meta
        };
        this._cache.uuid = meta.uuid;
        this._cache.key = pkg_key;
        this._cache.pkg = pkg;
        await this.Load_geometry_library();
        await this.Load_uv_set_library();
        meta.material_library = await this.Load_material_library();
        this._cache.nodeLib = await this.Load_node_library();
        await this.Load_modifier_library();
        const prefab = await this.Load_nodes();
        if (prefab) {
            meta.mesh_library = prefab.mesh_library;
            meta.mesh_renderer_library = prefab.mesh_renderer_library;
            meta.prefab_library = prefab.prefab_library;
        }
        meta.file_library = Object.keys(this._cache.files);
        return this._cache;
    }
    async Load_geometry_library() {
        const library = this._data.geometry_library;
        if (!library) {
            return;
        }
        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            const data = this.Load_geometry(entry);
            const uuid = "" + 36 + "-" + i;
            const uv_set = entry.default_uv_set ? await this.GetReference(entry.default_uv_set) : null;
            const uv_set_uuid = uv_set ? uv_set.pkg_uuid + "-" + uv_set.res : null;
            const file_path = `geometry/${uuid}_${entry.id}.bin`;
            this._cache.files[file_path] = data.buffer;
            this._cache.uuidLut[entry.id] = {
                uuid,
                default_uv_set: uv_set_uuid,
                material_groups: entry.polygon_material_groups.values
            };
        }
    }
    Load_geometry(geometry) {
        const textEncoder = this._resources["_worker"].env.textEncoder;
        const material_groups_count = geometry.polygon_material_groups.count;
        const polygon_groups_count = geometry.polygon_groups.count;
        const material_groups_name = geometry.polygon_material_groups.values.join(",");
        const polygon_groups_name = geometry.polygon_groups.values.join(",");
        const material_groups_name_carray = textEncoder.encode(material_groups_name);
        const polygon_groups_name_carray = textEncoder.encode(polygon_groups_name);
        const material_groups_name_length = (material_groups_name_carray.byteLength + 3 + 1) & ~3;
        const polygon_groups_name_length = (polygon_groups_name_carray.byteLength + 3 + 1) & ~3;
        const vertCount = geometry.vertices.count;
        const polyCount = geometry.polylist.count;
        let intLength = 0;
        const binaryOffset = intLength;
        intLength += 12;
        const headerOffset = intLength;
        intLength += 20;
        const verticesOffset = intLength;
        intLength += vertCount * 3;
        const polylistOffset = intLength;
        if (vertCount > 65535) {
            intLength += polyCount * 6;
        }
        else {
            intLength += polyCount * 3;
        }
        const namesOffset1 = intLength;
        intLength += material_groups_name_length / 4;
        const namesOffset2 = intLength;
        intLength += polygon_groups_name_length / 4;
        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 20);
        const header_float = new Float32Array(buffer, headerOffset * 4, 20);
        const vertices = new Float32Array(buffer, verticesOffset * 4, vertCount * 3);
        const polylist = vertCount > 65535 ? new Uint32Array(buffer, polylistOffset * 4, polyCount * 6) : new Uint16Array(buffer, polylistOffset * 4, polyCount * 6);
        const names1 = new Uint8Array(buffer, namesOffset1 * 4, material_groups_name_length);
        const names2 = new Uint8Array(buffer, namesOffset2 * 4, polygon_groups_name_length);
        const min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
        const max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
        for (let i = 0; i < vertCount; i++) {
            const vertex = geometry.vertices.values[i];
            const i3 = i * 3;
            vertices[i3 + 0] = vertex[0];
            vertices[i3 + 1] = vertex[1];
            vertices[i3 + 2] = vertex[2];
            min[0] = Math.min(min[0], vertex[0]);
            min[1] = Math.min(min[1], vertex[1]);
            min[2] = Math.min(min[2], vertex[2]);
            max[0] = Math.max(max[0], vertex[0]);
            max[1] = Math.max(max[1], vertex[1]);
            max[2] = Math.max(max[2], vertex[2]);
        }
        const center = [(min[0] + max[0]) * 0.005, (min[1] + max[1]) * 0.005, (min[2] + max[2]) * 0.005];
        const extents = [(max[0] - min[0]) * 0.005, (max[1] - min[1]) * 0.005, (max[2] - min[2]) * 0.005];
        const invalid = vertCount > 0xFFFF ? 0xFFFFFFFF : 0xFFFF;
        for (let i = 0; i < polyCount; i++) {
            const poly = geometry.polylist.values[i];
            const i6 = i * 6;
            polylist[i6 + 0] = poly[0];
            polylist[i6 + 1] = poly[1];
            polylist[i6 + 2] = poly[2];
            polylist[i6 + 3] = poly[3];
            polylist[i6 + 4] = poly[4];
            polylist[i6 + 5] = poly.length == 6 ? poly[5] : invalid;
        }
        names1.set(material_groups_name_carray);
        names2.set(polygon_groups_name_carray);
        binary[0] = MAGIC_INVALID + 36;
        binary[1] = 1;
        binary[2] = buffer.byteLength;
        binary[3] = 0;
        binary[4] = 0;
        binary[5] = 0;
        binary[6] = 0;
        binary[7] = 0;
        binary[8] = 0;
        binary[9] = 0;
        binary[10] = 0;
        binary[11] = 0;
        header[0] = geometry.type == "subdivision_surface" ? 1 : 0;
        header[1] = geometry.edge_interpolation_mode == "edges_and_corners" ? 2 : (geometry.edge_interpolation_mode == "edges_only" ? 1 : 0);
        header[2] = vertCount;
        header[3] = polyCount;
        header_float[4] = center[0];
        header_float[5] = center[1];
        header_float[6] = center[2];
        header_float[7] = extents[0];
        header_float[8] = extents[1];
        header_float[9] = extents[2];
        header[10] = verticesOffset;
        header[11] = polylistOffset;
        header[12] = 0;
        header[13] = 0;
        header[14] = material_groups_count;
        header[15] = polygon_groups_count;
        header[16] = material_groups_name_length;
        header[17] = polygon_groups_name_length;
        header[18] = namesOffset1;
        header[19] = namesOffset2;
        return new Uint8Array(buffer);
    }
    async Load_uv_set_library() {
        const library = this._data.uv_set_library;
        if (!library) {
            return;
        }
        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            const data = this.Load_uv_set(entry);
            const uuid = "" + 37 + "-" + i;
            const file_path = `uv_set/${uuid}_${entry.id}.bin`;
            this._cache.files[file_path] = data.buffer;
            this._cache.uuidLut[entry.id] = uuid;
        }
    }
    Load_uv_set(uv_set) {
        const vertCount = uv_set.vertex_count;
        const uvCount = uv_set.uvs.count;
        const mappingCount = uv_set.polygon_vertex_indices.length;
        let intLength = 0;
        const binaryOffset = intLength;
        intLength += 12;
        const headerOffset = intLength;
        intLength += 8;
        const uvsOffset = intLength;
        intLength += uvCount * 2;
        const mappingsOffset = intLength;
        if (uvCount > 65535) {
            intLength += mappingCount * 3;
        }
        else {
            intLength += Math.ceil(mappingCount * 1.5);
        }
        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 8);
        const uvs = new Float32Array(buffer, uvsOffset * 4, uvCount * 2);
        const mappings = uvCount > 65535 ? new Uint32Array(buffer, mappingsOffset * 4, mappingCount * 3) : new Uint16Array(buffer, mappingsOffset * 4, mappingCount * 3);
        for (let i = 0; i < uvCount; i++) {
            const uv = uv_set.uvs.values[i];
            const i2 = i * 2;
            uvs[i2 + 0] = uv[0];
            uvs[i2 + 1] = -uv[1];
        }
        for (let i = 0; i < mappingCount; i++) {
            const mapping = uv_set.polygon_vertex_indices[i];
            const i3 = i * 3;
            mappings[i3 + 0] = mapping[0];
            mappings[i3 + 1] = mapping[1];
            mappings[i3 + 2] = mapping[2];
        }
        binary[0] = MAGIC_INVALID + 37;
        binary[1] = 1;
        binary[2] = buffer.byteLength;
        binary[3] = 0;
        binary[4] = 0;
        binary[5] = 0;
        binary[6] = 0;
        binary[7] = 0;
        binary[8] = 0;
        binary[9] = 0;
        binary[10] = 0;
        binary[11] = 0;
        header[0] = vertCount;
        header[1] = uvCount;
        header[2] = mappingCount;
        header[3] = 0;
        header[4] = 0;
        header[5] = 0;
        header[6] = uvsOffset;
        header[7] = mappingsOffset;
        return new Uint8Array(buffer);
    }
    async Load_material_library() {
        const material_library = [];
        const library = this._data.material_library;
        if (!library) {
            return material_library;
        }
        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            const properties = await this.Load_material_properties(entry);
            const asset = {
                uuid: "" + 32 + "-" + i,
                classid: 32,
                name: entry.id || "",
                label: entry.name || "",
                shader: "1-1-1.miaokit.builtins:/shader/gltf_sketchfab/17-10_gltf_sketchfab.json",
                flags: 0,
                properties: properties
            };
            material_library.push(asset);
            this._cache.uuidLut[entry.id] = asset.uuid;
        }
        return material_library;
    }
    async Load_material_properties(entry) {
        const properties = {
            textures: {},
            vectors: {}
        };
        if (entry.diffuse) {
            const channel = entry.diffuse.channel;
            const value = (channel.current_value || channel.value).slice();
            if (undefined == value[3]) {
                value[3] = 1.0;
            }
            properties.vectors["baseColor"] = value;
            if (channel.image_file) {
                properties.textures["baseTex"] = {
                    uri: await this._resources.Load_texture(channel.image_file)
                };
            }
        }
        if (entry.diffuse_strength) {
            console.error("diffuse_strength");
        }
        if (entry.specular) {
            console.error("specular");
        }
        if (entry.specular_strength) {
            console.error("specular_strength");
        }
        if (entry.glossiness) {
            console.error("glossiness");
        }
        if (entry.ambient) {
            console.error("ambient");
        }
        if (entry.ambient_strength) {
            console.error("ambient_strength");
        }
        if (entry.reflection) {
            console.error("reflection");
        }
        if (entry.reflection_strength) {
            console.error("reflection_strength");
        }
        if (entry.refraction) {
            console.error("refraction");
        }
        if (entry.refraction_strength) {
            console.error("refraction_strength");
        }
        if (entry.ior) {
            console.error("ior");
        }
        if (entry.bump) {
            console.error("bump");
        }
        if (entry.bump_min) {
            console.error("bump_min");
        }
        if (entry.bump_max) {
            console.error("bump_max");
        }
        if (entry.displacement) {
            console.error("displacement");
        }
        if (entry.displacement_min) {
            console.error("displacement_min");
        }
        if (entry.displacement_max) {
            console.error("displacement_max");
        }
        if (entry.transparency) {
            console.error("transparency");
        }
        if (entry.normal) {
            console.error("normal");
        }
        if (entry.u_offset) {
            console.error("u_offset");
        }
        if (entry.u_scale) {
            console.error("u_scale");
        }
        if (entry.v_offfset) {
            console.error("v_offfset");
        }
        if (entry.v_scale) {
            console.error("v_scale");
        }
        return properties;
    }
    async Load_nodes() {
        const instanceList = [];
        const instanceLut = {};
        const instanceLut2 = {};
        const batchList = [];
        const geometryLut = {};
        const geometryGet = (id) => {
            id = id.replace(/%20/g, " ");
            let geometry = geometryLut[id];
            if (!geometry) {
                for (let key in geometryLut) {
                    if (geometryLut[key].node_id == id) {
                        geometry = geometryLut[key];
                        break;
                    }
                }
            }
            return geometry;
        };
        const nodes = this._data.scene?.nodes;
        if (!nodes) {
            return null;
        }
        for (let i = 0; i < nodes.length;) {
            const entry = nodes[i];
            const beg = instanceList.length;
            await this.Instance_node(entry.url, instanceList);
            const count = instanceList.length - beg;
            if (count == 0) {
                i++;
                continue;
            }
            for (let j = 0; j < count; j++) {
                const instance = instanceList[beg + j];
                const node = nodes[i];
                const reference = await this.GetReference(node.url, 1);
                const instance_id = reference.pkg_uuid + "-" + reference.res_id;
                if (instance_id != instance.id) {
                    console.warn("当前源节点未实例化:", instance_id, instance.id);
                    break;
                }
                i++;
                instance.node.name = node.id;
                this.Load_node_transform(node, instance.transform);
                instanceLut["#" + node.id] = instance.node.index;
                instanceLut2["#" + instance.node.id] = instance.node.index;
                const parent = node.parent ? instanceLut[node.parent.replace(/%20/g, " ")] : -1;
                if (instance.transform.parent != parent) {
                    console.info("重设父级实例ID:", node.id, instance.transform.parent, parent);
                    instance.transform.parent = parent;
                }
                if (node.geometries) {
                    for (let geometry of node.geometries) {
                        const mr_index = Object.keys(geometryLut).length;
                        const mr_uuid = "" + 48 + "-" + mr_index;
                        const mesh_uuid = "" + 39 + "-" + mr_index;
                        const geometry_res = await this.GetReference(geometry.url);
                        const asset = {
                            mesh_renderer_instance: {
                                instance: instance.transform.instance,
                                node: instance.transform.node,
                                mesh_renderer: mr_uuid
                            },
                            mesh_renderer_asset: {
                                uuid: mr_uuid,
                                classid: 48,
                                name: geometry.name || geometry.id,
                                label: geometry.label || geometry.id,
                                mesh: mesh_uuid,
                                materials: []
                            },
                            mesh_asset: {
                                uuid: mesh_uuid,
                                classid: 39,
                                name: geometry_res.res_id,
                                label: geometry_res.res_id,
                                geometry: geometry_res.pkg_uuid + "-" + geometry_res.res.uuid,
                                uv_set: geometry_res.res.default_uv_set
                            },
                            geometry_res,
                            node_id: "#" + node.id
                        };
                        geometryLut["#" + geometry.id] = asset;
                        if (node.geometries.length > 1) {
                            console.error("不支持一个节点附加多个网格！");
                            break;
                        }
                    }
                }
            }
            batchList.push({
                source: beg,
                instanceBeg: beg,
                instanceCount: count
            });
        }
        const uvs = this._data.scene?.uvs;
        if (uvs) {
            for (let entry of uvs) {
                const uv_set = await this.GetReference(entry.url);
                const uv_set_uuid = uv_set ? uv_set.pkg_uuid + "-" + uv_set.res : null;
                const geometry = geometryGet(entry.parent);
                if (geometry && uv_set_uuid) {
                    geometry.mesh_asset.uv_set = uv_set_uuid;
                }
                else {
                    console.error(entry);
                }
            }
        }
        const materials = this._data.scene?.materials;
        if (materials) {
            for (let entry of materials) {
                const material = await this.GetReference(entry.url);
                const material_uuid = material ? material.pkg_uuid + "-" + material.res : null;
                const geometry = geometryGet(entry.geometry);
                if (geometry && material_uuid) {
                    const material_groups = geometry.geometry_res.res.material_groups;
                    const material_slots = geometry.mesh_renderer_asset.materials;
                    for (let group of entry.groups) {
                        const submesh = material_groups.indexOf(group);
                        if (submesh > -1) {
                            const slot = material_slots.length;
                            material_slots.push({
                                slot,
                                submesh,
                                material: material_uuid
                            });
                        }
                        else {
                            console.error("材质指定应用到的子网格不存在！", group, entry, geometry);
                        }
                    }
                    if (entry.uv_set) {
                        const uv_set = await this.GetReference(entry.uv_set);
                        const uv_set_uuid = uv_set ? uv_set.pkg_uuid + "-" + uv_set.res : null;
                        if (geometry.mesh_asset.uv_set != uv_set_uuid) {
                            console.info("根据材质指定，替换网格资源UV数据！", geometry.mesh_asset.uv_set, uv_set_uuid);
                            geometry.mesh_asset.uv_set = uv_set_uuid;
                        }
                    }
                }
                else {
                    console.error(entry);
                }
            }
        }
        const modifiers = this._data.scene?.modifiers;
        if (modifiers) {
            for (let entry of modifiers) {
                const modifier = await this.GetReference(entry.url);
                if (!modifier) {
                    console.warn("不支持的修改器数据！", entry.url);
                    continue;
                }
                const geometry = geometryGet(entry.parent);
                if (geometry) {
                    const skeleton_skin = modifier.res.skeleton_skin;
                    if (skeleton_skin) {
                        geometry.mesh_asset.skeleton_skin = {
                            joints: skeleton_skin.joints,
                            root: skeleton_skin.root,
                            skeleton: modifier.pkg_uuid + "-" + skeleton_skin.skeleton,
                            skin: modifier.pkg_uuid + "-" + skeleton_skin.skin
                        };
                        const joints_binding = geometry.mesh_asset.skeleton_skin.joints.map((name) => {
                            let instance_id = instanceLut["#" + name];
                            if (instance_id == undefined) {
                                instance_id = instanceLut2["#" + name];
                                if (instance_id == undefined) {
                                    instance_id = -1;
                                    console.error("查找不到骨骼绑定实例！", name);
                                }
                            }
                            return instance_id;
                        });
                        geometry.mesh_renderer_instance.joints_binding = joints_binding;
                    }
                    const morph = modifier.res.morph;
                    if (morph && morph.deltas) {
                        if (!geometry.mesh_asset.static_morph) {
                            geometry.mesh_asset.static_morph = [];
                        }
                        geometry.mesh_asset.static_morph.push({
                            weights: morph.weights.slice(),
                            deltas: modifier.pkg_uuid + "-" + morph.deltas
                        });
                    }
                }
                else {
                    console.error(geometryLut, modifier, entry, this._cache);
                }
            }
        }
        const mesh_library = [];
        const mesh_renderer_library = [];
        const prefab = instanceList.length ? {
            uuid: "" + 65 + "-" + 0,
            classid: 65,
            name: this._cache.pkg.key,
            label: this._cache.pkg.key,
            scheme: "daz",
            instanceCount: instanceList.length + 1,
            nodes: [],
            batches: [],
            transforms: [],
            mesh_renderers: []
        } : null;
        if (prefab) {
            prefab.batches = batchList;
            for (let instance of instanceList) {
                prefab.nodes.push(instance.node);
                prefab.transforms.push(instance.transform);
            }
            for (let key in geometryLut) {
                const geometry = geometryLut[key];
                prefab.mesh_renderers.push(geometry.mesh_renderer_instance);
                mesh_library.push(geometry.mesh_asset);
                mesh_renderer_library.push(geometry.mesh_renderer_asset);
            }
            return {
                mesh_library,
                mesh_renderer_library,
                prefab_library: [prefab]
            };
        }
        return null;
    }
    async Instance_node(url, instanceList) {
        const reference = await this.GetReference(url, 1);
        if (!reference) {
            return;
        }
        const nodeLut = reference.pkg.nodeLib.lut;
        const nodeList = reference.pkg.nodeLib.list;
        const instanceLut = {};
        const beg_node = reference.res;
        const min_depth = beg_node.depth + 1;
        for (let i = beg_node.index; i < nodeList.length; i++) {
            const node = nodeLut[nodeList[i]];
            if (node.depth < min_depth && i > beg_node.index) {
                break;
            }
            const parent = instanceList[instanceLut[node.parent]];
            const instance = {
                id: reference.pkg_uuid + "-" + node.id,
                node: {
                    index: instanceList.length,
                    id: node.id,
                    name: node.name,
                    depth: parent ? parent.node.depth + 1 : 0,
                    parent: parent ? parent.node.index : -1
                },
                transform: {
                    instance: instanceList.length,
                    node: instanceList.length,
                    deactive: false,
                    layers: node.layers,
                    parent: parent ? parent.node.index : -1,
                    bone_init: {
                        center_point: node.bone_init.center_point.slice(),
                        inherits_scale: node.bone_init.inherits_scale,
                        end_point: node.bone_init.end_point.slice(),
                        rotation_order: node.bone_init.rotation_order,
                        orientation: node.bone_init.orientation.slice()
                    },
                    bone_ctrl: {
                        translation: node.bone_ctrl.translation.slice(),
                        inherits_scale: node.bone_ctrl.inherits_scale,
                        rotation: node.bone_ctrl.rotation.slice(),
                        rotation_order: node.bone_ctrl.rotation_order,
                        scale: node.bone_ctrl.scale.slice(),
                        general_scale: node.bone_ctrl.general_scale
                    },
                }
            };
            instanceList.push(instance);
            instanceLut[node.id] = instance.node.index;
        }
    }
    async Load_node_library() {
        const lut = {};
        const list = [];
        const library = this._data.node_library;
        if (!library) {
            return { lut, list };
        }
        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            const parent = entry.parent ? lut[entry.parent.split("#")[1]] : null;
            const transform = this.Load_node_transform(entry);
            const node = {
                index: i,
                depth: parent ? parent.depth + 1 : 0,
                id: entry.id,
                name: entry.name,
                layers: 1,
                parent: parent?.id,
                ...transform
            };
            if (entry.type == "figure") {
                node.layers |= 4;
            }
            else if (entry.type == "bone") {
                node.layers |= 2;
            }
            lut[entry.id] = node;
            list[i] = node.id;
        }
        return { lut, list };
    }
    Load_node_transform(node, transform_) {
        const transform = transform_ || {
            bone_init: {
                center_point: [0, 0, 0],
                inherits_scale: 0,
                end_point: [0, 0, 0],
                rotation_order: 12,
                orientation: [0, 0, 0, 1]
            },
            bone_ctrl: {
                translation: [0, 0, 0],
                inherits_scale: 0,
                rotation: [0, 0, 0],
                rotation_order: 12,
                scale: [1, 1, 1],
                general_scale: 1
            }
        };
        function Set(vars, channels) {
            for (let channel of channels || []) {
                if ("x" == channel.id) {
                    vars[0] = (channel.current_value || channel.value);
                }
                else if ("y" == channel.id) {
                    vars[1] = (channel.current_value || channel.value);
                }
                else if ("z" == channel.id) {
                    vars[2] = (channel.current_value || channel.value);
                }
                else {
                    console.error("未识别通道类型：", channel);
                }
            }
        }
        Set(transform.bone_init.center_point, node.center_point);
        Set(transform.bone_init.end_point, node.end_point);
        Set(transform.bone_init.orientation, node.orientation);
        if (node.orientation) {
            transform.bone_init.orientation = this._resources["_worker"].internal.Quaternion_FromEulerAngles(transform.bone_init.orientation[0], transform.bone_init.orientation[1], transform.bone_init.orientation[2], 210);
        }
        Set(transform.bone_ctrl.translation, node.translation);
        Set(transform.bone_ctrl.rotation, node.rotation);
        Set(transform.bone_ctrl.scale, node.scale);
        if (node.inherits_scale !== false) {
            transform.bone_init.inherits_scale = 1;
            transform.bone_ctrl.inherits_scale = 1;
        }
        if (node.rotation_order) {
            transform.bone_init.rotation_order = this._resources.EulerOrder(node.rotation_order);
            transform.bone_ctrl.rotation_order = this._resources.EulerOrder(node.rotation_order);
        }
        if (node.general_scale) {
            transform.bone_ctrl.general_scale = node.general_scale.current_value || node.general_scale.value;
        }
        return transform;
    }
    async Load_modifier_library() {
        const library = this._data.modifier_library;
        if (!library) {
            return;
        }
        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            let asset = null;
            if (entry.skin) {
                const data = this.Load_skeleton_skin(entry.skin);
                const name = entry.skin.geometry.substring(1);
                const skin_uuid = "" + 34 + "-" + i;
                const skin_file_path = `skin/${skin_uuid}_${name}.bin`;
                const skeleton_uuid = "" + 33 + "-" + i;
                const skeleton_file_path = `skeleton/${skeleton_uuid}_${name}.bin`;
                this._cache.files[skin_file_path] = data[3];
                this._cache.files[skeleton_file_path] = data[2];
                asset = asset || {};
                asset.skeleton_skin = {
                    root: data[0],
                    joints: data[1],
                    skin: skin_uuid,
                    skeleton: skeleton_uuid
                };
            }
            if (entry.morph) {
                const data = entry.morph.deltas.count > 0 ? this.Load_morph(entry.morph) : null;
                const name = entry.id.substring(1);
                const morph_uuid = "" + 35 + "-" + i;
                const morph_file_path = `morph/${morph_uuid}_${name}.bin`;
                if (data) {
                    this._cache.files[morph_file_path] = data;
                }
                asset = asset || {};
                asset.morph = {
                    weights: [1.0],
                    deltas: data ? morph_uuid : null
                };
            }
            this._cache.uuidLut[entry.id] = asset;
        }
    }
    Load_skeleton_skin(skin) {
        function parse_joint_name(uri) {
            if (uri.startsWith("#")) {
                return uri.substring(1).replace(/%20/g, " ");
            }
            else {
                console.error("仅支持引用相同资源包中的关节节点资源！", uri);
                return uri.split("#")[1].replace(/%20/g, " ");
            }
        }
        const joints_count = skin.joints.length;
        const joints_name = [];
        const vertex_count = skin.vertex_count;
        const vertices_bone_count = new Uint8Array(vertex_count);
        const vb2 = new Uint8Array(8 * vertex_count);
        const invMat = new Float32Array(16 * joints_count);
        const root_name = parse_joint_name(skin.node);
        for (let b = 0; b < joints_count; b++) {
            const joint = skin.joints[b];
            const joint_name = parse_joint_name(joint.node);
            if (joint.node_weights) {
                for (let cp of joint.node_weights.values) {
                    const vi = cp[0];
                    const i8 = vi * 8;
                    const bw = Math.ceil(cp[1] * 255);
                    const bi = vertices_bone_count[vi];
                    if (bi > 3) {
                        let min_w = bw;
                        let min_x = -1;
                        for (let x = 0; x < 4; x++) {
                            const w = vb2[i8 + 4 + x];
                            if (w < min_w) {
                                min_w = w;
                                min_x = x;
                            }
                        }
                        if (-1 < min_x) {
                            vb2[i8 + min_x] = b;
                            vb2[i8 + 4 + min_x] = bw;
                        }
                    }
                    else {
                        vb2[i8 + bi] = b;
                        vb2[i8 + 4 + bi] = bw;
                        vertices_bone_count[vi]++;
                    }
                }
            }
            if (joint.scale_weights || joint.local_weights || joint.local_weights) {
                console.error("不支持蒙皮权重：scale_weights、local_weights、local_weights！");
            }
            joints_name.push(joint_name);
        }
        for (let v = 0; v < vertex_count; v++) {
            const v8 = v * 8;
            const bone_count = vertices_bone_count[v];
            const last_total = vb2[v8 + 4] + vb2[v8 + 5] + vb2[v8 + 6] + vb2[v8 + 7];
            let cur_total = 0;
            for (let b = 0; b < bone_count; b++) {
                if (b == bone_count - 1) {
                    vb2[v8 + 4 + b] = 255 - cur_total;
                }
                else {
                    const weight = Math.floor((vb2[v8 + 4 + b] / last_total) * 255);
                    vb2[v8 + 4 + b] = weight;
                    cur_total += weight;
                }
            }
        }
        let root_index = joints_name.indexOf(root_name);
        if (root_index == -1) {
            root_index = joints_name.length;
            joints_name.push(root_name);
        }
        let skin_buffer = null;
        {
            let intLength = 0;
            const binaryOffset = intLength;
            intLength += 12;
            const headerOffset = intLength;
            intLength += 4;
            const verticesOffset = intLength;
            intLength += vertex_count * 2;
            const buffer = new ArrayBuffer(intLength * 4);
            const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
            const header = new Uint32Array(buffer, headerOffset * 4, 4);
            const vertices = new Uint8Array(buffer, verticesOffset * 4, vertex_count * 8);
            binary[0] = MAGIC_INVALID + 34;
            binary[1] = 1;
            binary[2] = buffer.byteLength;
            binary[3] = 0;
            binary[4] = 0;
            binary[5] = 0;
            binary[6] = 0;
            binary[7] = 0;
            binary[8] = 0;
            binary[9] = 0;
            binary[10] = 0;
            binary[11] = 0;
            header[0] = vertex_count;
            header[1] = 0;
            header[2] = 0;
            header[3] = verticesOffset;
            vertices.set(vb2);
            skin_buffer = buffer;
        }
        let skeleton_buffer = null;
        {
            const encoder = this._resources["_worker"].env.textEncoder;
            const names_ = joints_name.join(",");
            const names_carray = encoder.encode(names_);
            const names_length = (names_carray.byteLength + 3 + 1) & ~3;
            let intLength = 0;
            const binaryOffset = intLength;
            intLength += 12;
            const headerOffset = intLength;
            intLength += 8;
            const initsOffset = intLength;
            intLength += joints_name.length * 16;
            const invMatsOffset = intLength;
            intLength += joints_name.length * 16;
            const namesOffset = intLength;
            intLength += names_length / 4;
            const buffer = new ArrayBuffer(intLength * 4);
            const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
            const header = new Uint32Array(buffer, headerOffset * 4, 8);
            const inits = new Float32Array(buffer, initsOffset * 4, joints_name.length * 16);
            const inits_uint = new Uint32Array(buffer, initsOffset * 4, joints_name.length * 16);
            const invMats = new Float32Array(buffer, invMatsOffset * 4, joints_name.length * 16);
            const names = new Uint8Array(buffer, namesOffset * 4, names_length);
            binary[0] = MAGIC_INVALID + 33;
            binary[1] = 1;
            binary[2] = buffer.byteLength;
            binary[3] = 0;
            binary[4] = 0;
            binary[5] = 0;
            binary[6] = 0;
            binary[7] = 0;
            binary[8] = 0;
            binary[9] = 0;
            binary[10] = 0;
            binary[11] = 0;
            header[0] = 1 | 2 | 4;
            header[1] = joints_name.length;
            header[2] = root_index;
            header[3] = names_length;
            header[4] = 0;
            header[5] = initsOffset;
            header[6] = invMatsOffset;
            header[7] = namesOffset;
            names.set(names_carray);
            for (let i = 0; i < joints_name.length; i++) {
                const name = joints_name[i];
                const node = this._cache.nodeLib.lut[name];
                if (node) {
                    const data = node.bone_init;
                    const i16 = i * 16;
                    inits[i16 + 0] = data.center_point[0];
                    inits[i16 + 1] = data.center_point[1];
                    inits[i16 + 2] = data.center_point[2];
                    inits_uint[i16 + 3] = data.inherits_scale;
                    inits[i16 + 4] = data.end_point[0];
                    inits[i16 + 5] = data.end_point[1];
                    inits[i16 + 6] = data.end_point[2];
                    inits_uint[i16 + 7] = data.rotation_order;
                    inits[i16 + 8] = data.orientation[0];
                    inits[i16 + 9] = data.orientation[1];
                    inits[i16 + 10] = data.orientation[2];
                    inits[i16 + 11] = data.orientation[3];
                    inits[i16 + 12] = 0;
                    inits[i16 + 13] = 0;
                    inits[i16 + 14] = 0;
                    inits[i16 + 15] = 1;
                }
                else {
                    console.error("查找不对关节节点资源！", name, this._cache.nodeLib);
                }
            }
            skeleton_buffer = buffer;
        }
        return [root_index, joints_name, skeleton_buffer, skin_buffer];
    }
    Load_morph(morph) {
        const targetCount = 1;
        const deltaCount = morph.deltas.count;
        let intLength = 0;
        const binaryOffset = intLength;
        intLength += 12;
        const headerOffset = intLength;
        intLength += 16;
        const deltaCountsOffset = intLength;
        intLength += targetCount;
        const deltasOffset = intLength;
        intLength += 4 * deltaCount;
        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 16);
        const header_float = new Float32Array(buffer, headerOffset * 4, 16);
        const deltaCounts = new Uint32Array(buffer, deltaCountsOffset * 4, targetCount);
        const deltas = new Float32Array(buffer, deltasOffset * 4, 4 * deltaCount);
        const deltas_uint = new Uint32Array(buffer, deltasOffset * 4, 4 * deltaCount);
        const min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
        const max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
        deltaCounts[0] = deltaCount;
        for (let i = 0; i < deltaCount; i++) {
            const vertex = morph.deltas.values[i];
            const i4 = i * 4;
            const x = vertex[1];
            const y = vertex[2];
            const z = vertex[3];
            deltas_uint[i4 + 0] = vertex[0];
            deltas[i4 + 1] = x;
            deltas[i4 + 2] = y;
            deltas[i4 + 3] = z;
            min[0] = Math.min(min[0], x);
            min[1] = Math.min(min[1], y);
            min[2] = Math.min(min[2], z);
            max[0] = Math.max(max[0], x);
            max[1] = Math.max(max[1], y);
            max[2] = Math.max(max[2], z);
        }
        binary[0] = MAGIC_INVALID + 35;
        binary[1] = 1;
        binary[2] = buffer.byteLength;
        binary[3] = 0;
        binary[4] = 0;
        binary[5] = 0;
        binary[6] = 0;
        binary[7] = 0;
        binary[8] = 0;
        binary[9] = 0;
        binary[10] = 0;
        binary[11] = 0;
        header[0] = 1;
        header[1] = 16 * deltaCount;
        header_float[2] = min[0];
        header_float[3] = min[1];
        header_float[4] = min[2];
        header_float[5] = max[0];
        header_float[6] = max[1];
        header_float[7] = max[2];
        header[8] = 0;
        header[9] = morph.vertex_count;
        header[10] = targetCount;
        header[11] = 0;
        header[12] = deltaCountsOffset;
        header[13] = deltasOffset;
        header[14] = 0;
        header[15] = 0;
        return buffer;
    }
    async GetReference(url, type) {
        url = url.replace(/%20/g, " ");
        const parts = url.split("#");
        const res_id = parts[1];
        const pkg_url = parts[0];
        const pkg = !pkg_url ? this._cache : await this._resources.Load(pkg_url, () => { });
        const res = type == 1 ? pkg.nodeLib.lut[res_id] : pkg.uuidLut[res_id];
        if (pkg && res) {
            return {
                pkg_uuid: pkg.uuid,
                res_id,
                pkg,
                res
            };
        }
        return null;
    }
    _resources;
    _data;
    _cache;
}
//# sourceMappingURL=importer_daz.js.map