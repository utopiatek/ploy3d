import type * as Miaoverse from "../mod.js"
import type { Miaoworker } from './worker.js';
import { CLASSID, MAGIC_INVALID, BLEND_MODE, RENDER_FLAGS, LAYER_FLAGS } from "../mod.js"

/** DAZ资产管理器。 */
export class Resources_daz {
    /**
     * 构造函数。
     * @param _worker 事务处理器对象。
     */
    public constructor(_worker: Miaoworker) {
        this._worker = _worker;
        this._cache = {};
    }

    /**
     * 装载DAZ资源文件。
     * @param path DAZ资源文件路径。
     * @param progress 进度刷新方法。
     * @returns 返回资源包。
     */
    public async Load(path: string, progress: (rate: number, msg: string) => void) {
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

    /**
     * 装载DAZ贴图文件。
     * @param path
     * @returns
     */
    public async Load_texture(path: string) {
        // TODO ...

        return "";
    }

    /**
     * 导入DAZ资源文件。
     * @param path DAZ资源文件路径。
     * @param progress 进度刷新方法。
     * @returns 返回资源包。
     */
    private async Import(path: string, progress: (rate: number, msg: string) => void) {
        const fullpath = this._worker.dazServ + path;
        const buffer = await this._worker.Fetch<ArrayBuffer>(fullpath, null, "arrayBuffer");
        if (!buffer) {
            throw "文件加载失败！" + path;
        }

        let data: daz_asset = null;

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

    /** 
     * DAZ欧拉角旋转序转PLOY3D欧拉角旋转序。
     */
    public EulerOrder(name: string) {
        /*/
        DAZ-Quaternion2Angles-PLOY3D的旋转序对应关系：
        "XYZ"=ZYX=210;
        "XZY"=YZX=120;
        "YXZ"=ZXY=201;
        "YZX"=XZY=021;
        "ZXY"=YXZ=102;
        "ZYX"=XYZ=012;
        /*/

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

    /** 事务处理器。 */
    private _worker: Miaoworker;
    /** DAZ文件缓存（使用路径查找）。*/
    private _cache: Record<string, {
        /** DAZ文件路径。 */
        path: string;
        /** 资源包UUID。 */
        uuid: string;
        /** 资源包键。 */
        key: string;
        /** 资源包注册数据。 */
        pkg: Miaoverse.PackageReg;
        /** 资源包资源文件数据缓存（使用文件相对路径索引）。 */
        files?: Record<string, any>;
        /** DAZ原数据条目ID转资产UUID映射。 */
        uuidLut: Record<string, any>;
        /** DAZ节点库。 */
        nodeLib: { lut: Record<string, Daz_node>; list: string[]; };
    }> = {};
    /** 最新导入的DAZ文件缓存列表。*/
    private _news: Resources_daz["_cache"][""][];
}

/** DAZ导入器。 */
export class Importer_daz {
    /**
     * 构造函数。
     * @param _resources DAZ资产管理器。
     * @param _path DAZ文件路径。
     * @param _data DAZ文件数据对象。
     */
    public constructor(_resources: Resources_daz, _path: string, _data: daz_asset) {
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

    /**
     * 装载DAZ资源。
     */
    public async Load() {
        const uuid = await this._resources["_worker"].env.uuidGen();
        const uuid_parts = uuid.split("-");
        const pkg_name = this._cache.path.substring(this._cache.path.lastIndexOf("/") + 1).replace(".", "_");

        const meta: Miaoverse.Package = {
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

        const pkg: Miaoverse.PackageReg = {
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

        // ==================------------------------

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


    /**
     * 加载几何数据。
     * @param geometry
     * @returns
     */
    private async Load_geometry_library() {
        const library = this._data.geometry_library;
        if (!library) {
            return;
        }

        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            const data = this.Load_geometry(entry);
            const uuid = "" + CLASSID.ASSET_MESH_GEOMETRY + "-" + i;
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

    /**
     * 加载几何数据。
     * @param geometry
     * @returns
     */
    private Load_geometry(geometry: daz_geometry) {

        // 未处理字段：source、default_uv_set、root_region、graft、rigidity、extra

        const textEncoder = this._resources["_worker"].env.textEncoder;

        const material_groups_count = geometry.polygon_material_groups.count;
        const polygon_groups_count = geometry.polygon_groups.count;

        const material_groups_name = geometry.polygon_material_groups.values.join(",");
        const polygon_groups_name = geometry.polygon_groups.values.join(",");

        const material_groups_name_carray = textEncoder.encode(material_groups_name);
        const polygon_groups_name_carray = textEncoder.encode(polygon_groups_name);

        const material_groups_name_length = (material_groups_name_carray.byteLength + 3 + 1) & ~3;
        const polygon_groups_name_length = (polygon_groups_name_carray.byteLength + 3 + 1) & ~3;

        // =============================---------------------------------------

        const vertCount = geometry.vertices.count;
        const polyCount = geometry.polylist.count;

        let intLength = 0;

        const binaryOffset = intLength; intLength += 12;
        const headerOffset = intLength; intLength += 20;
        const verticesOffset = intLength; intLength += vertCount * 3;
        const polylistOffset = intLength;

        // 顶点数量大于65535时为索引为UINT类型，否则为USHORT类型
        if (vertCount > 65535) {
            intLength += polyCount * 6;
        }
        else {
            intLength += polyCount * 3;
        }

        const namesOffset1 = intLength; intLength += material_groups_name_length / 4;
        const namesOffset2 = intLength; intLength += polygon_groups_name_length / 4;

        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 20);
        const header_float = new Float32Array(buffer, headerOffset * 4, 20);
        const vertices = new Float32Array(buffer, verticesOffset * 4, vertCount * 3);
        const polylist = vertCount > 65535 ? new Uint32Array(buffer, polylistOffset * 4, polyCount * 6) : new Uint16Array(buffer, polylistOffset * 4, polyCount * 6);
        const names1 = new Uint8Array(buffer, namesOffset1 * 4, material_groups_name_length);
        const names2 = new Uint8Array(buffer, namesOffset2 * 4, polygon_groups_name_length);

        // =============================---------------------------------------

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

        // =============================---------------------------------------

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

        // =============================---------------------------------------

        names1.set(material_groups_name_carray);
        names2.set(polygon_groups_name_carray);

        // =============================---------------------------------------

        binary[0] = MAGIC_INVALID + CLASSID.ASSET_MESH_GEOMETRY;
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


    /**
     * 加载几何UV数据。
     * @param geometry
     * @returns
     */
    private async Load_uv_set_library() {
        const library = this._data.uv_set_library;
        if (!library) {
            return;
        }

        for (let i = 0; i < library.length; i++) {
            const entry = library[i];
            const data = this.Load_uv_set(entry);
            const uuid = "" + CLASSID.ASSET_MESH_UVSET + "-" + i;
            const file_path = `uv_set/${uuid}_${entry.id}.bin`;

            this._cache.files[file_path] = data.buffer;
            this._cache.uuidLut[entry.id] = uuid;
        }
    }

    /**
     * 加载几何UV数据。
     * @param uv_set
     * @returns
     */
    private Load_uv_set(uv_set: daz_uv_set) {

        // 未处理字段：source

        // =============================---------------------------------------

        const vertCount = uv_set.vertex_count;
        const uvCount = uv_set.uvs.count;
        const mappingCount = uv_set.polygon_vertex_indices.length;

        let intLength = 0;

        const binaryOffset = intLength; intLength += 12;
        const headerOffset = intLength; intLength += 8;
        const uvsOffset = intLength; intLength += uvCount * 2;
        const mappingsOffset = intLength;

        // 顶点数量大于65535时为索引为UINT类型，否则为USHORT类型
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

        // =============================---------------------------------------

        for (let i = 0; i < uvCount; i++) {
            const uv = uv_set.uvs.values[i];
            const i2 = i * 2;

            uvs[i2 + 0] = uv[0];
            uvs[i2 + 1] = -uv[1];
        }

        // =============================---------------------------------------

        for (let i = 0; i < mappingCount; i++) {
            const mapping = uv_set.polygon_vertex_indices[i];
            const i3 = i * 3;

            mappings[i3 + 0] = mapping[0];
            mappings[i3 + 1] = mapping[1];
            mappings[i3 + 2] = mapping[2];
        }

        // =============================---------------------------------------

        binary[0] = MAGIC_INVALID + CLASSID.ASSET_MESH_UVSET;
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


    /**
     * 装载材质库。
     * @returns
     */
    private async Load_material_library() {
        const material_library: Miaoverse.Package["material_library"] = [];

        const library = this._data.material_library;
        if (!library) {
            return material_library;
        }

        for (let i = 0; i < library.length; i++) {
            // 未处理字段：source、type

            const entry = library[i];
            const properties = await this.Load_material_properties(entry);
            const asset: Miaoverse.Asset_material = {
                uuid: "" + CLASSID.ASSET_MATERIAL + "-" + i,
                classid: CLASSID.ASSET_MATERIAL,
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

    /**
     * 装载材质属性。
     * @param entry
     * @returns
     */
    private async Load_material_properties(entry: daz_material) {
        const properties: Miaoverse.Asset_material["properties"] = {
            textures: {},
            vectors: {}
        };

        // =============================---------------------------------------

        if (entry.diffuse) {
            const channel = entry.diffuse.channel as any;
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

        // =============================---------------------------------------

        if (entry.specular) {
            console.error("specular");
        }

        if (entry.specular_strength) {
            console.error("specular_strength");
        }

        // =============================---------------------------------------

        if (entry.glossiness) {
            console.error("glossiness");
        }

        // =============================---------------------------------------

        if (entry.ambient) {
            console.error("ambient");
        }

        if (entry.ambient_strength) {
            console.error("ambient_strength");
        }

        // =============================---------------------------------------

        if (entry.reflection) {
            console.error("reflection");
        }

        if (entry.reflection_strength) {
            console.error("reflection_strength");
        }

        // =============================---------------------------------------

        if (entry.refraction) {
            console.error("refraction");
        }

        if (entry.refraction_strength) {
            console.error("refraction_strength");
        }

        // =============================---------------------------------------

        if (entry.ior) {
            console.error("ior");
        }

        // =============================---------------------------------------

        if (entry.bump) {
            console.error("bump");
        }

        if (entry.bump_min) {
            console.error("bump_min");
        }

        if (entry.bump_max) {
            console.error("bump_max");
        }

        // =============================---------------------------------------

        if (entry.displacement) {
            console.error("displacement");
        }

        if (entry.displacement_min) {
            console.error("displacement_min");
        }

        if (entry.displacement_max) {
            console.error("displacement_max");
        }

        // =============================---------------------------------------

        if (entry.transparency) {
            console.error("transparency");
        }

        // =============================---------------------------------------

        if (entry.normal) {
            console.error("normal");
        }

        // =============================---------------------------------------

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

        // =============================---------------------------------------

        return properties;
    }


    /**
     * 装载场景节点。
     * @returns
     */
    private async Load_nodes() {
        const instanceList: Parameters<Importer_daz["Instance_node"]>[1] = [];
        const instanceLut: Record<string, number> = {};
        const instanceLut2: Record<string, number> = {};
        const batchList: Miaoverse.Asset_prefab["batches"] = [];
        const geometryLut: Record<string, {
            mesh_renderer_instance: Miaoverse.Asset_prefab["mesh_renderers"][0];
            mesh_renderer_asset: Miaoverse.Asset_meshrenderer;
            mesh_asset: Miaoverse.Asset_mesh;
            geometry_res: Awaited<ReturnType<Importer_daz["GetReference"]>>;
            node_id: string;
        }> = {};

        const geometryGet = (id: string) => {
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
        }

        // ====================------------------------------------

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

                // 当前源节点未实例化
                if (instance_id != instance.id) {
                    console.warn("当前源节点未实例化:", instance_id, instance.id);
                    break;
                }

                i++;

                // 节点实例ID与节点资源ID不同，而我们组件绑定使用的是节点实例ID
                instance.node.name = node.id;

                // 设置实例变换组件数据
                this.Load_node_transform(node, instance.transform);

                // 添加到实例查找表，用于父子关系绑定
                instanceLut["#" + node.id] = instance.node.index;
                instanceLut2["#" + instance.node.id] = instance.node.index;

                // 父级实例ID
                const parent = node.parent ? instanceLut[node.parent.replace(/%20/g, " ")] : -1;

                // 重设父级实例ID
                if (instance.transform.parent != parent) {
                    console.info("重设父级实例ID:", node.id, instance.transform.parent, parent);
                    instance.transform.parent = parent;
                }

                // 网格渲染器设置
                if (node.geometries) {
                    for (let geometry of node.geometries) {
                        const mr_index = Object.keys(geometryLut).length;
                        const mr_uuid = "" + CLASSID.ASSET_COMPONENT_MESH_RENDERER + "-" + mr_index;
                        const mesh_uuid = "" + CLASSID.ASSET_MESH + "-" + mr_index;

                        // TODO: 应当包含子网格名称列表和默认UV数据
                        const geometry_res = await this.GetReference(geometry.url);

                        const asset: typeof geometryLut[""] = {
                            mesh_renderer_instance: {
                                instance: instance.transform.instance,
                                node: instance.transform.node,
                                mesh_renderer: mr_uuid
                            },
                            mesh_renderer_asset: {
                                uuid: mr_uuid,
                                classid: CLASSID.ASSET_COMPONENT_MESH_RENDERER,
                                name: geometry.name || geometry.id,
                                label: geometry.label || geometry.id,

                                mesh: mesh_uuid,
                                materials: []
                            },
                            mesh_asset: {
                                uuid: mesh_uuid,
                                classid: CLASSID.ASSET_MESH,
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

                // TODO: parent_in_place、conform_target
            }

            batchList.push({
                source: beg,
                instanceBeg: beg,
                instanceCount: count
            });
        }

        // ====================------------------------------------

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

        // ====================------------------------------------

        const materials = this._data.scene?.materials;

        if (materials) {
            for (let entry of materials) {
                const material = await this.GetReference(entry.url);
                const material_uuid = material ? material.pkg_uuid + "-" + material.res : null;
                const geometry = geometryGet(entry.geometry);

                if (geometry && material_uuid) {
                    const material_groups: string[] = geometry.geometry_res.res.material_groups;
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

                    // TODO: 加载材质属性
                }
                else {
                    console.error(entry);
                }
            }
        }

        // ====================------------------------------------

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
                            weights: morph.weights.slice(), // TODO: 从channel读取
                            deltas: modifier.pkg_uuid + "-" + morph.deltas
                        });
                    }
                }
                else {
                    console.error(geometryLut, modifier, entry, this._cache);
                }
            }
        }

        // ====================------------------------------------

        const mesh_library: Miaoverse.Asset_mesh[] = [];
        const mesh_renderer_library: Miaoverse.Asset_meshrenderer[] = [];
        const prefab: Miaoverse.Asset_prefab = instanceList.length ? {
            uuid: "" + CLASSID.ASSET_PREFAB + "-" + 0,
            classid: CLASSID.ASSET_PREFAB,
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
            }
        }

        return null;
    }

    /**
     * 构建节点实例批次数据。
     * @param url 源节点URL。
     * @param instanceList 节点实例列表。
     */
    private async Instance_node(
        url: string,
        instanceList: {
            /** pkg_id + node_id */
            id: string;
            /** 预制件中的节点数据。 */
            node: Miaoverse.Asset_prefab["nodes"][0];
            /** 预制件中的变换组件数据。 */
            transform: Miaoverse.Asset_prefab["transforms"][0] & {
                bone_init: Daz_node["bone_init"];
                bone_ctrl: Daz_node["bone_ctrl"];
            };
        }[]) {

        const reference = await this.GetReference(url, 1);
        if (!reference) {
            return;
        }

        // ==========================-------------------------

        // 节点资源查找表
        const nodeLut = reference.pkg.nodeLib.lut;
        // 节点资源列表（先根顺序、深度优先）
        const nodeList = reference.pkg.nodeLib.list;
        // 节点ID到节点实例索引查找表
        const instanceLut: Record<string, number> = {};

        // 起始节点
        const beg_node = reference.res as Daz_node;
        // 最小层级深度约束（应大于源节点层级深度）
        const min_depth = beg_node.depth + 1;

        // 要求节点库按先根顺序存储，我们按存储顺序逐一实例化
        for (let i = beg_node.index; i < nodeList.length; i++) {
            // 当前节点资源
            const node = nodeLut[nodeList[i]];

            // 遇到平级或更顶级节点时，结束实例化
            if (node.depth < min_depth && i > beg_node.index) {
                break;
            }

            // 当前父级节点实例
            const parent = instanceList[instanceLut[node.parent]];

            // 当前节点实例
            const instance: typeof instanceList[0] = {
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

            // 添加到实例列表
            instanceList.push(instance);
            // 添加到实例查找表，用于父子关系绑定
            instanceLut[node.id] = instance.node.index;
        }
    }


    /**
     * 加载DAZ节点库。
     * @returns
     */
    private async Load_node_library() {
        const lut: Record<string, Daz_node> = {};
        const list: string[] = [];

        const library = this._data.node_library;
        if (!library) {
            return { lut, list };
        }

        for (let i = 0; i < library.length; i++) {
            // 未处理字段：source、presentation、formulas、extra

            const entry = library[i];
            const parent = entry.parent ? lut[entry.parent.split("#")[1]] : null;
            const transform = this.Load_node_transform(entry);
            const node: typeof lut[0] = {
                index: i,
                depth: parent ? parent.depth + 1 : 0,
                id: entry.id,
                name: entry.name,
                layers: LAYER_FLAGS.DEFAULT,
                parent: parent?.id,
                ...transform
            };

            if (entry.type == "figure") {
                node.layers |= LAYER_FLAGS.FIGURE;
            }
            else if (entry.type == "bone") {
                node.layers |= LAYER_FLAGS.BONE;
            }

            lut[entry.id] = node;
            list[i] = node.id;
        }

        return { lut, list };
    }

    /**
     * 加载节点变换组件数据。
     * @param node
     * @returns
     */
    private Load_node_transform(node: daz_node, transform_?: { bone_init: Daz_node["bone_init"]; bone_ctrl: Daz_node["bone_ctrl"] }) {
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

        function Set(vars: number[], channels: daz_channel_vector) {
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

        // 转换为四元数
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


    /**
     * 加载骨骼蒙皮数据和变形数据。
     */
    private async Load_modifier_library() {
        const library = this._data.modifier_library;
        if (!library) {
            return;
        }

        for (let i = 0; i < library.length; i++) {
            const entry = library[i];

            let asset: any = null;

            if (entry.skin) {
                const data = this.Load_skeleton_skin(entry.skin);
                const name = entry.skin.geometry.substring(1);

                const skin_uuid = "" + CLASSID.ASSET_SKIN + "-" + i;
                const skin_file_path = `skin/${skin_uuid}_${name}.bin`;

                const skeleton_uuid = "" + CLASSID.ASSET_SKELETON + "-" + i;
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
                // 存在一些空的变形数据
                const data = entry.morph.deltas.count > 0 ? this.Load_morph(entry.morph) : null;
                const name = entry.id.substring(1);

                const morph_uuid = "" + CLASSID.ASSET_MORPH + "-" + i;
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

    /**
     * 加载骨骼蒙皮数据。
     * @param skin
     */
    private Load_skeleton_skin(skin: daz_modifier_skin_binding) {
        // 未处理字段：geometry、joints[i].id、selection_sets

        // 将关节节点URI转为节点资源ID。节点库和骨骼蒙皮绑定库是配对的，不会有混用的情况
        function parse_joint_name(uri: string) {
            if (uri.startsWith("#")) {
                return uri.substring(1).replace(/%20/g, " ");
            }
            else {
                console.error("仅支持引用相同资源包中的关节节点资源！", uri);
                return uri.split("#")[1].replace(/%20/g, " ");
            }
        }

        // 骨架关节数量
        const joints_count = skin.joints.length;
        // 骨架关节名称数组
        const joints_name: string[] = [];
        // 骨骼蒙皮顶点数量
        const vertex_count = skin.vertex_count;
        // 临时记录影响各顶点的骨骼数量（最大为4）
        const vertices_bone_count = new Uint8Array(vertex_count);
        // 第2顶点缓存
        const vb2 = new Uint8Array(8 * vertex_count);
        // 建模空间到初始骨骼空间变换矩阵数组
        const invMat = new Float32Array(16 * joints_count);

        // 根关节（建模空间）绑定名称
        const root_name = parse_joint_name(skin.node);

        // 遍历所有关节绑定数据
        for (let b = 0; b < joints_count; b++) {
            // 当前关节绑定信息
            const joint = skin.joints[b];
            // 当前关节绑定名称
            const joint_name = parse_joint_name(joint.node);

            if (joint.node_weights) {
                for (let cp of joint.node_weights.values) {
                    // 顶点索引
                    const vi = cp[0];
                    // 第2顶点缓存写入偏移
                    const i8 = vi * 8;
                    // 顶点蒙皮权重
                    const bw = Math.ceil(cp[1] * 255);
                    // 顶点蒙皮绑定槽
                    const bi = vertices_bone_count[vi];

                    // 顶点不允许绑定超过4根骨骼！取权重最大的4个
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

        // 归一化蒙皮权重
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

        // 添加根关节（建模空间）到关节列表
        let root_index = joints_name.indexOf(root_name);
        if (root_index == -1) {
            root_index = joints_name.length;
            joints_name.push(root_name);
        }

        // =======================--------------------------------------

        let skin_buffer: ArrayBuffer = null;
        {
            let intLength = 0;

            const binaryOffset = intLength; intLength += 12;
            const headerOffset = intLength; intLength += 4;
            const verticesOffset = intLength; intLength += vertex_count * 2;

            const buffer = new ArrayBuffer(intLength * 4);
            const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
            const header = new Uint32Array(buffer, headerOffset * 4, 4);
            const vertices = new Uint8Array(buffer, verticesOffset * 4, vertex_count * 8);

            binary[0] = MAGIC_INVALID + CLASSID.ASSET_SKIN;
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

            const binaryOffset = intLength; intLength += 12;
            const headerOffset = intLength; intLength += 8;
            const initsOffset = intLength; intLength += joints_name.length * 16;
            const invMatsOffset = intLength; intLength += joints_name.length * 16;
            const namesOffset = intLength; intLength += names_length / 4;

            const buffer = new ArrayBuffer(intLength * 4);
            const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
            const header = new Uint32Array(buffer, headerOffset * 4, 8);
            const inits = new Float32Array(buffer, initsOffset * 4, joints_name.length * 16);
            const inits_uint = new Uint32Array(buffer, initsOffset * 4, joints_name.length * 16);
            const invMats = new Float32Array(buffer, invMatsOffset * 4, joints_name.length * 16);
            const names = new Uint8Array(buffer, namesOffset * 4, names_length);

            binary[0] = MAGIC_INVALID + CLASSID.ASSET_SKELETON;
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

    /**
     * 加载网格变形数据。
     * @param morph
     * @returns
     */
    private Load_morph(morph: daz_modifier_morph) {

        const targetCount = 1;
        const deltaCount = morph.deltas.count;

        let intLength = 0;

        const binaryOffset = intLength; intLength += 12;
        const headerOffset = intLength; intLength += 16;
        const deltaCountsOffset = intLength; intLength += targetCount;
        const deltasOffset = intLength; intLength += 4 * deltaCount;

        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 16);
        const header_float = new Float32Array(buffer, headerOffset * 4, 16);
        const deltaCounts = new Uint32Array(buffer, deltaCountsOffset * 4, targetCount);
        const deltas = new Float32Array(buffer, deltasOffset * 4, 4 * deltaCount);
        const deltas_uint = new Uint32Array(buffer, deltasOffset * 4, 4 * deltaCount);

        // ================---------------------------------

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

        // ================---------------------------------

        binary[0] = MAGIC_INVALID + CLASSID.ASSET_MORPH;
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


    /**
     * 获取引用资源。
     * @param url 资源URL。
     * @param type 资源类型：0-其它资源，1-节点资源。
     * @returns
     */
    private async GetReference(url: string, type?: number) {
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
            }
        }

        return null;
    }

    /** DAZ资产管理器。 */
    private _resources: Resources_daz;
    /** DAZ文件数据对象。 */
    private _data: daz_asset;
    /** DAZ文件转资源包数据缓存。 */
    private _cache: Resources_daz["_cache"][""];
}

/** DAZ节点数据。 */
export interface Daz_node {
    /** 节点编号。 */
    index: number;
    /** 节点层级深度。 */
    depth: number;
    /** 节点ID。 */
    id: string;
    /** 节点名称。 */
    name: string;
    /** 对象层标识（用于过滤筛选对象，默认1）。 */
    layers: number;
    /** 父节点ID。 */
    parent: string;
    /** 骨骼初始变换。 */
    bone_init?: Miaoverse.Asset_prefab["transforms"][0]["bone_init"];
    /** 骨骼控制参数。 */
    bone_ctrl?: Miaoverse.Asset_prefab["transforms"][0]["bone_ctrl"];
}

// =======================----------------------------------

/** DAZ资产（文件）。 */
interface daz_asset {
    /** 文件格式版本（major.minor.revision）。 */
    file_version: string;
    /** DAZ资产信息。 */
    asset_info: {
        /** 资产ID，资产文件相对路径。 */
        id: string;
        /** 资产类型，提示如何解析该文件。 */
        type?: "figure" | "modifier";
        /** 贡献者信息。 */
        contributor: {
            /** 作者。 */
            author: string;
            /** 邮箱。 */
            email?: string;
            /** 网站。 */
            website?: string;
        };
        /** 资产修订版本（默认1.0）。 */
        revision: string;
        /** 当前修订版本时间。 */
        modified?: string;
    };
    /** 几何资产数组。 */
    geometry_library?: daz_geometry[];
    /** UV集资产数组。 */
    uv_set_library?: daz_uv_set[];
    /** 修饰符资产数组。 */
    modifier_library?: daz_modifier[];
    /** 材质资产数组。 */
    material_library?: daz_material[];
    /** 图像资产数组。 */
    image_library?: daz_image[];
    /** 场景节点资产数组。 */
    node_library?: daz_node[];
    /** 一个场景对象，用于实例化和配置要添加到当前场景的资产。 */
    scene?: daz_scene;
}

/** DAZ几何资产条目。 */
interface daz_geometry {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 网格类型（默认polygon_mesh）。 */
    type?: "polygon_mesh" | "subdivision_surface";
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** 网格类型为subdivision_surface时，在细分期间要执行的边插值的类型（默认no_interpolation）。 */
    edge_interpolation_mode?: "no_interpolation" | "edges_and_corners" | "edges_only";
    /** 网格顶点数组。 */
    vertices: daz_float3_array;
    /** 网格面元分组名称数组。 */
    polygon_groups: daz_string_array;
    /** 网格材质分组名称数组。 */
    polygon_material_groups: daz_string_array;
    /** 多边形索引信息（[polygon_group、polygon_material_group、vert0、vert1、vert2、vert3?]）。 */
    polylist: {
        count: daz_int;
        values: [daz_int, daz_int, daz_int, daz_int, daz_int, daz_int?][];
    };
    /** 网格默认UV集的URI。 */
    default_uv_set?: string;
    /** 区域层级结构。 */
    root_region?: {
        /** 当前区域在区域层级结构中的唯一编号。 */
        id: string;
        /** 用户可理解的外部标签。 */
        label?: string;
        /** 特定于应用程序的区域显示提示。 */
        display_hint?: "cards_on" | "cards_off" | string;
        /** 属于该区域的所有面的索引。 */
        map?: daz_int_array;
        /** 子区域的数组（如果区域包含map属性，则为叶节点。如果包含子区域则为组节点，不包含map属性）。 */
        children?: daz_geometry["root_region"];
    };
    /** 几何移植信息对象。 */
    graft?: {
        /** 目标几何中应存在的顶点数。 */
        vertex_count: daz_int;
        /** 目标几何中应存在的面数。 */
        poly_count: daz_int;
        /** 几何移植时的顶点映射数组（源顶点索引、目标顶点索引）。 */
        vertex_pairs: daz_int2_array;
        /** 应隐藏的目标几何图形上的面索引数组。 */
        hidden_polys: daz_int_array;
    };
    /** 几何刚性数据。 */
    rigidity?: {
        /** 刚度权重映射。 */
        weights?: daz_float_indexed_array;
        /** 刚性数据组。 */
        groups: {
            /** 当前文件范围内的唯一ID。 */
            id: string;
            /** 旋转模式（默认none）。 */
            rotation_mode?: "none" | "full" | "primary" | "secondary";
            /** 每个轴的缩放模式。 */
            scale_modes: ("none" | "primary" | "secondary" | "secondary")[];
            /** 参考几何中顶点的顶点索引数组。 */
            reference_vertices?: daz_int_array;
            /** 刚性掩码的顶点索引数组。 */
            mask_vertices?: daz_int_array;
            /** 参考节点的URI。 */
            reference?: string;
            /** 计算刚性几何图形的变换时使用的节点URI数组。 */
            transform_nodes?: string[];
        }[];
    };
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}

/** DAZ纹理坐标集资产。*/
interface daz_uv_set {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称（同级唯一，优先于ID用于查找）。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** UV集应用到的几何图形中预期包含的顶点数。 */
    vertex_count: daz_int;
    /** 
     * UV数据。
     * 多个面元共享顶点，虽然顶点坐标相同，但顶点UV可能不同，因此UV数量要大于顶点坐标数量。
     * 渲染时需要基于顶点UV的数量来构建顶点缓存，并且修改某些面源的某个顶点索引为UV索引，同时复制一份顶点坐标过来。
     */
    uvs: daz_float2_array;
    /** 图元顶点索引替换信息数组（polygon_index、polygon_vertex_index、uv_index）。 */
    polygon_vertex_indices?: [daz_int, daz_int, daz_int][];
}

/** DAZ变形、外观绑定、通道或应用程序定义的修饰符类型。 */
interface daz_modifier {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称（同级唯一，优先于ID用于查找）。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** 父修饰符URI，父修饰符须先于子修饰符定义。 */
    parent?: string;
    /** 用于描述如何向用户呈现资产的信息和图像。 */
    presentation?: daz_presentation;
    /** 参数控制通道。 */
    channel?: daz_channel;
    /** 修饰符应应用的区域。 */
    region?: daz_geometry["root_region"];
    /** 修改器分组（目录）。 */
    group?: string;
    /** 给定属性操作时的参数作用公式。 */
    formulas?: any[];
    /** MORPH变形数据。 */
    morph?: daz_modifier_morph;
    /** 蒙皮绑定数据。 */
    skin?: daz_modifier_skin_binding;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}

/** DAZ网格变形数据。 */
interface daz_modifier_morph {
    /** 目标几何图形中预期的顶点数。 */
    vertex_count: daz_int;
    /** 形态增量数据（第1个值为顶点索引）。 */
    deltas: daz_float3_indexed_array;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}

/** DAZ蒙皮绑定数据。 */
interface daz_modifier_skin_binding {
    /** 要绑定到的根节点URI。 */
    node: string;
    /** 要绑定到的几何体URI。 */
    geometry: string;
    /** 网格几何体中预期的顶点数。 */
    vertex_count: daz_int;
    /** 骨骼蒙皮绑定数组。 */
    joints?: {
        /** 当前文件范围内唯一ID。 */
        id: string;
        /** 关节节点的URI。 */
        node: string;
        /** 该关节影响的顶点索引和权重。 */
        node_weights?: daz_float_indexed_array;
        /** 该关节影响的顶点索引和缩放权重。 */
        scale_weights?: daz_float_indexed_array;
        /** 该关节影响的顶点索引和局部权重。 */
        local_weights?: {
            x?: daz_float_indexed_array;
            y?: daz_float_indexed_array;
            z?: daz_float_indexed_array;
        };
        /** 该关节影响的顶点索引和凸起权重。 */
        bulge_weights?: {
            x?: {
                /** 4个加权因子（positive-left, positive-right, negative-left, negative-right）。 */
                bulges: [daz_channel_float, daz_channel_float, daz_channel_float, daz_channel_float];
                /** 该关节影响的顶点索引和凸起权重1。 */
                left_map: daz_float_indexed_array;
                /** 该关节影响的顶点索引和凸起权重2。 */
                right_map: daz_float_indexed_array;
            };
            y?: daz_modifier_skin_binding["joints"][0]["bulge_weights"]["x"];
            z?: daz_modifier_skin_binding["joints"][0]["bulge_weights"]["x"];
        }
    }[];
    /** 网格几何体上面元分组和节点的映射关系。 */
    selection_sets?: {
        /** 在selection_sets中的唯一ID。 */
        id: string;
        /** 映射关系（face group name, node name）。 */
        mappings: [string, string][];
    }[];
}

/** DAZ材质资产。 */
interface daz_material {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** UV集URI。 */
    uv_set?: string;
    /** 应用程序要使用的着色器类型的提示（glass, metal, plastic, skin）。 */
    type?: string;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];

    diffuse?: daz_channel_prop;
    diffuse_strength?: daz_channel_prop;
    specular?: daz_channel_prop;
    specular_strength?: daz_channel_prop;
    glossiness?: daz_channel_prop;
    ambient?: daz_channel_prop;
    ambient_strength?: daz_channel_prop;
    reflection?: daz_channel_prop;
    reflection_strength?: daz_channel_prop;
    refraction?: daz_channel_prop;
    refraction_strength?: daz_channel_prop;
    ior?: daz_channel_prop;
    bump?: daz_channel_prop;
    bump_min?: daz_channel_prop;
    bump_max?: daz_channel_prop;
    displacement?: daz_channel_prop;
    displacement_min?: daz_channel_prop;
    displacement_max?: daz_channel_prop;
    transparency?: daz_channel_prop;
    normal?: daz_channel_prop;
    u_offset?: daz_channel_prop;
    u_scale?: daz_channel_prop;
    v_offfset?: daz_channel_prop;
    v_scale?: daz_channel_prop;
}

/** DAZ图像资产。 */
interface daz_image {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称。 */
    name: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** 表示图像灰度系数的浮点数（小于或等于0则由程序计算出）。 */
    map_gamma?: daz_float;
    /** 组合映射时的首选图像大小。 */
    map_size?: daz_int;
    /** 
     * 图像混合堆栈（第一个为最底层）。
     * DAZ定义可与堆栈中的其他图像映射合成以定义单个输出映射的图像映射。
     * PLOY3D当前仅支持第一个图层。
     */
    map: {
        /** 图片URI。 */
        url?: string;
        /** 用户可理解的外部标签。 */
        label?: string;
        /** 当前图层是否起作用。 */
        active?: boolean;
        /** 图层颜色。 */
        color?: daz_float3;
        /** 图层不透明度（1表示不透明）。 */
        transparency?: daz_float;
        /** 是否反转图层颜色。 */
        invert?: boolean;
        /** 图层绕中心旋转（度）。 */
        rotation?: daz_float;
        /** 图层是否水平镜像。 */
        xmirror?: boolean;
        /** 图层是否垂直镜像。 */
        ymirror?: boolean;
        /** 图层水平缩放比例。 */
        xscale?: daz_float;
        /** 图层垂直缩放比例。 */
        yscale?: daz_float;
        /** 图层水平规范化偏移。 */
        xoffset?: daz_float;
        /** 图层垂直规范化偏移。 */
        yoffset?: daz_float;
        /** 图层混合操作类型。 */
        operation?: "add";
    }[];
}

/** DAZ节点（变换矩阵计算方式：http://docs.daz3d.com/doku.php/public/dson_spec/object_definitions/node/start）。 */
interface daz_node {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称（同级唯一，优先于ID用于查找）。 */
    name: string;
    /** ID别名列表。 */
    id_aliases?: string[];
    /** 内部名称别名列表。 */
    name_aliases?: string[];
    /** 节点类型（默认node。figure为场景根节点）。 */
    type?: "node" | "bone" | "figure" | "camera" | "light";
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此节点的源节点URI。 */
    source?: string;
    /** 父节点URI，父节点须先于子节点定义。 */
    parent?: string;
    /** 当使用基于通道的动画数据时采用的旋转顺序（默认XYZ）。 */
    rotation_order?: "XYZ" | "YZX" | "ZYX" | "ZXY" | "XZY" | "YXZ";
    /** 是否累积父级的缩放（通常为真，具有父骨骼的骨骼除外。可单独缩放骨骼所影响顶点）。 */
    inherits_scale?: boolean;
    /** 坐标系参考中心点（子空间的origin_point位于父空间的center_point）。 */
    center_point?: daz_channel_vector;
    /** 骨骼端点，位于骨骼的末端，连接到另一个骨骼或终止。 */
    end_point?: daz_channel_vector;
    /** 旋转、缩放操作的参考轴向（orientation * (rotation | scale) * inv(orientation)）。 */
    orientation?: daz_channel_vector;
    /** 节点相对orientation轴向欧拉角旋转（默认[0, 0, 0]）。 */
    rotation?: daz_channel_vector;
    /** 节点相对center_point平移（默认[0, 0, 0]）。 */
    translation?: daz_channel_vector;
    /** 节点相对orientation轴向缩放（默认[1, 1, 1]）。 */
    scale?: daz_channel_vector;
    /** 节点整体缩放（默认1，scale * general_scale）。 */
    general_scale?: daz_channel_float;
    /** 用于描述如何向用户呈现资产的信息和图像。 */
    presentation?: daz_presentation;
    /** 给定属性操作时的参数作用公式。 */
    formulas?: any[];
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}

/** DAZ场景。 */
interface daz_scene {
    /** 用于描述如何向用户呈现资产的信息和图像。 */
    presentation?: daz_presentation;
    /** 节点实例化数组（按定义顺序进行实例化，父级应先于子级实例化，如果给定节点已经实例化则跳过。给定节点及其所有后代都被实例化，即不仅仅是单个节点，除非它没有子节点）。 */
    nodes?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该实例的资产URI（资产节点的子级也被构造）。 */
        url: string;
        /** 父级节点URI（父级须先于子级构造，应该是另一个节点的实例ID）。 */
        parent?: string;
        /** 父级节点URI，附加时保持世界坐标不变。 */
        parent_in_place?: boolean;
        /** 跟随当前场景中另一节点的URI。 */
        conform_target?: string;
        /** 节点网格几何体实例。 */
        geometries?: ({
            /** 当前文件范围内此资产的唯一ID。 */
            id: string;
            /** 用于构造该节点实例的资产URI。 */
            url: string;
        } & daz_geometry)[];
        /** 在找不到节点网格几何体时用作替身的预览对象。 */
        preview?: {
            /** 定义替身项的边界框的包围盒参数（轴对齐）。 */
            oriented_box?: {
                /** 包围盒最小坐标。 */
                min?: daz_float3;
                /** 包围盒最大坐标。 */
                max?: daz_float3;
            };
            /** 节点几何体的中心坐标。 */
            center_point?: daz_float3;
            /** 替身对象的终点。 */
            end_point?: daz_float3;
            /** 预览该替身包围盒时要使用的旋转顺序（默认XYZ。PLOY3D使用Y-X-Z的内旋顺序）。 */
            rotation_order?: "XYZ" | "YZX" | "ZYX" | "ZXY" | "XZY" | "YXZ";
        };
    } & daz_node)[];
    /** 场景UV集列表。 */
    uvs?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该节点实例的资产URI。 */
        url: string;
        /** UV集应附加到的几何图形的URI。 */
        parent: string;
    } & daz_uv_set)[];
    /** 场景修饰符列表。 */
    modifiers?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该节点实例的资产URI。 */
        url: string;
        /** 此修饰符实例影响的节点或元素的URI。 */
        parent: string;
    } & daz_modifier)[];
    /** 场景材质列表。 */
    materials?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该节点实例的资产URI。 */
        url: string;
        /** 应用到几何URI。 */
        geometry: string;
        /** 应用到几何材质组。 */
        groups: string[];
    } & daz_material)[];
    /** 场景动画轨道列表。 */
    animations?: {
        /** 动画所驱动目标通道的URI。 */
        url: string;
        /** 时间/值对的数组。 */
        keys: [
            daz_float, /*时间戳*/
            number | number[], /*关键值*/
            [string, number?, number?, number?, number?]?, /*插值方式和关联值*/
        ][];
    }[];
    /** 场景中用作当前相机的节点实例的URI。 */
    current_camera?: string;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}

type daz_date_time = string;
type daz_int = number;
type daz_float = number;
type daz_int2 = [number, number];
type daz_float2 = [number, number];
type daz_float3 = [number, number, number];
type daz_float4 = [number, number, number, number];
type daz_float5 = [number, number, number, number, number];
type daz_float_indexed = [daz_int, daz_float];
type daz_float3_indexed = [daz_int, daz_float, daz_float, daz_float];
type daz_string_array = { count: daz_int, values: string[]; };
type daz_int_array = { count: daz_int, values: daz_int[]; };
type daz_float_array = { count: daz_int, values: daz_float[]; };
type daz_int2_array = { count: daz_int, values: daz_int2[]; };
type daz_float2_array = { count: daz_int, values: daz_float2[]; };
type daz_float3_array = { count: daz_int, values: daz_float3[]; };
type daz_float_indexed_array = { count: daz_int, values: daz_float_indexed[]; };
type daz_float3_indexed_array = { count: daz_int, values: daz_float3_indexed[]; };
type daz_channel_vector = daz_channel_float[];

/** DAZ浮点型参数通道。 */
interface daz_channel_float extends daz_channel {
    /** 默认值（默认0.0）。 */
    value?: number;
    /** 当前值（默认0.0）。 */
    current_value?: number;
    /** 最小值（默认0.0）。 */
    min?: number;
    /** 最大值（默认1.0）。 */
    max?: number;
    /** 是否强制约束在最大最小值之间（默认false）。 */
    clamped?: boolean;
    /** 是否应以百分比的形式向用户显示（默认false）。 */
    display_as_percent?: boolean;
    /** 通过UI控制参数时，修改的步进大小。 */
    step_size?: daz_float;
    /** 是否可映射（默认false）。 */
    mappable?: boolean;
}

/** DAZ材质属性通道。 */
interface daz_channel_prop {
    /** 属性通道。 */
    channel?: daz_channel;
    /** 属性分组（目录）。 */
    group?: string;
    /** RGB颜色。 */
    color?: daz_float3;
    /** 强度（[0, 1]）。 */
    strength?: daz_float;
    /** 图像文件URI（如果存在，在颜色或强度要乘图像颜色。颜色和强度至少存在1个）。 */
    image?: string;
}

/** DAZ参数通道。 */
interface daz_channel {
    /** 包含对象范围内的唯一ID。 */
    id: string;
    /** 数据类型（默认float）。 */
    type: "alias" | "bool" | "color" | "enum" | "float" | "image" | "int" | "string";
    /** 内部名称。 */
    name: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 是否在UI中显示参数（默认true）。 */
    visible?: boolean;
    /** 是否禁止修改参数（默认false）。 */
    locked?: boolean;
    /** 在匹配期间，通道是否应当自动链接到相应的通道上（默认false）。 */
    auto_follow?: boolean;
}

/** DAZ用于描述如何向用户呈现资产的信息和图像。 */
interface daz_presentation {
    /** 内容类型（目录）。 */
    type: string;
    /** 用户可理解的外部标签。 */
    label: string;
    /** 描述语句。 */
    description: string;
    /** 大图标URL（132 x 176）。 */
    icon_large: string;
    /** 小图标URL（132 x 176）。 */
    icon_small?: string;
    /** 与图标颜色兼容的两种RGB颜色。 */
    colors: daz_float3[];
}
