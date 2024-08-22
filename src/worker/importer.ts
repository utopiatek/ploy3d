import { Miaoworker } from './worker.js';
import { Importer_gltf } from './importer_gltf.js';
import { Resources_daz } from './importer_daz.js';

/** 资源导入器。 */
export class Importer {
    /**
     * 构造函数。
     * @param worker 事务处理器。
     */
    public constructor(worker: Miaoworker) {
        this._worker = worker;
        this._resources_daz = new Resources_daz(worker);
    }

    /** 装载GLTF场景数据。 */
    public async Import_gltf(url: string, progress: (rate: number, msg: string) => void) {
        progress(0.0, "加载文件：" + url);

        if (url.endsWith(".zip")) {
            const blob = await this._worker.Fetch<Blob>(url, null, "blob");
            const zip = await (globalThis as any).JSZip.loadAsync(blob);

            let filename = null as string;

            for (let key in zip.files) {
                // 压缩包内应当仅存在一个gltf文件
                if (key.endsWith("gltf")) {
                    filename = key;
                    break;
                }
            }

            const text = await zip.file(filename).async("text");
            const data = JSON.parse(text);
            if (data) {
                const split = filename.lastIndexOf('/') + 1;
                const path = filename.slice(0, split);
                const name = filename.slice(split, filename.length);

                data.asset.extras = {
                    zip: zip,
                    path: path,
                    name: name,
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1.0, 1.0, 1.0]
                };

                return await (new Importer_gltf(this._worker)).Load(data, (rate, msg) => {
                    progress(0.1 + 0.9 * rate, msg);
                });
            }
            else {
                return null;
            }
        }
        else {
            const data = await this._worker.Fetch<any>(url, null, "json");
            if (data) {
                const split = url.lastIndexOf('/') + 1;
                const path = url.slice(0, split);
                const name = url.slice(split, url.length);

                data.asset.extras = {
                    path: path,
                    name: name,
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1.0, 1.0, 1.0]
                };

                return await (new Importer_gltf(this._worker)).Load(data, (rate, msg) => {
                    progress(0.1 + 0.9 * rate, msg);
                });
            }
            else {
                return null;
            }
        }
    }

    /** 装载GLTF场景数据。 */
    public async Import_gltf_file(file: File, progress: (rate: number, msg: string) => void) {
        // TODO ...
        return null as any;
    }

    /** 装载DAZ数据文件。 */
    public async Import_daz(path: string, progress: (rate: number, msg: string) => void) {
        this._resources_daz["_news"] = [];
        const pkg = await this._resources_daz.Load(path, progress);
        const pkgs = this._resources_daz["_news"];
        this._resources_daz["_news"] = null;

        return { main: pkg.uuid, pkgs };
    }

    /** 装载百度地图矢量瓦片。 */
    public async Import_vtile_bd(col: number, row: number, level: number) {
        // TODO ...
        return null as any;
    }

    /** 加载3MX场景分组资源实例。 */
    public async Load_3mxb_resource(group: {
        /** 3MXB文件文件夹路径。 */
        _path: string;
        /** 3MXB文件名。 */
        _file: string;
        /** 资源数据缓存。 */
        _ab?: ArrayBuffer;
        /** 资源数据缓存偏移。 */
        _ab_offset: number;
        /** 资源列表。 */
        resources: {
            /** 资源类型。 */
            type: "textureBuffer" | "geometryBuffer" | "textureFile" | "geometryFile";
            /** 资源格式。 */
            format: "jpg" | "png" | "ctm" | "obj";
            /** 资源大小（仅"textureBuffer" | "geometryBuffer"类型的资源包含此字段）。 */
            size?: number;
            /** 资源数据偏移。 */
            _offset: number;
            /** 解码出的位图资源。 */
            _bitmap?: ImageBitmap;
            /** 解码出的网格数据。 */
            _mesh_data?: ArrayBuffer;
        }[];
    }, progress: (rate: number, msg: string) => void) {
        if (!group._ab) {
            group._ab = await this._worker.Fetch<ArrayBuffer>(group._path + group._file, null, "arrayBuffer");
            if (!group._ab) {
                return null;
            }
        }

        const env = this._worker.env;
        const internal = this._worker.internal;

        for (let res of group.resources) {
            if (res.type == "textureBuffer" && (res.format == "jpg" || res.format == "png")) {
                const data_ab = group._ab.slice(group._ab_offset + res._offset, group._ab_offset + res._offset + res.size);
                const data_view = new DataView(data_ab);

                let width = 0;
                let height = 0;
                let type = 'image/jpeg';

                if ((data_view.getUint16(0, true) & 0xFFFF) == 0xD8FF) {
                    let read_offset = 2;

                    while (true) {
                        let marker = data_view.getUint16(read_offset, true); read_offset += 2;
                        if (marker == 0xC0FF || marker == 0xC2FF) { // SOF0 or SOF2
                            height = data_view.getUint16(read_offset + 3, false);
                            width = data_view.getUint16(read_offset + 5, false);
                            break;
                        }
                        else if ((marker & 0xFF) != 0xFF) {
                            console.error("jpg parse error!");
                            break;
                        }
                        else {
                            const size = data_view.getUint16(read_offset, false);
                            read_offset += size;
                        }
                    }
                }
                else if (data_view.getUint32(0, true) == 0x474E5089 && data_view.getUint32(4, true) == 0x0A1A0A0D) {
                    type = 'image/png';

                    //宽度：16 到 19 字节
                    //高度：20 到 23 字节
                    console.error("png parse error!");
                }

                let option: ImageBitmapOptions = undefined;
                if (Math.max(width, height) >= 2048) {
                    option = {
                        resizeHeight: height * 0.5,
                        resizeWidth: width * 0.5
                    };
                }

                const blob = new Blob([data_ab], { type: type });

                res._bitmap = await createImageBitmap(blob, option);
            }

            if (res.type == "geometryBuffer" && res.format == "ctm") {
                const ctm_data_ptr = internal.System_New(res.size);

                env.bufferSet1(ctm_data_ptr, group._ab, group._ab_offset + res._offset, res.size);

                const mesh_data_raw = this._worker.internal.Worker_DecodeCTM(ctm_data_ptr);

                res._mesh_data = env.uarrayGet(mesh_data_raw[1], 0, Math.ceil(mesh_data_raw[0] / 4)).buffer;

                internal.System_Delete(ctm_data_ptr);
                internal.System_Delete(mesh_data_raw[1]);
            }
        }

        group._ab = null;

        return group;
    }

    /** 生成网格数据。 */
    public async Gen_mesh_data(geometry: DataView, uv_set: DataView, skin: DataView, static_morph: { weights: number[]; deltas: ArrayBuffer; }[]) {
        const uv_vert_count = uv_set.getUint32(48, true);
        const uv_uv_count = uv_set.getUint32(52, true);
        const uv_mapping_count = uv_set.getUint32(56, true);

        const uv_uvs_ptr = 4 * uv_set.getUint32(72, true);
        const uv_mappings_ptr = 4 * uv_set.getUint32(76, true);

        const uv_uvs = new Float32Array(uv_set.buffer, uv_uvs_ptr, uv_uv_count * 2);
        const uv_mappings = uv_vert_count > 65535 ? new Uint32Array(uv_set.buffer, uv_mappings_ptr, uv_mapping_count * 3) : new Uint16Array(uv_set.buffer, uv_mappings_ptr, uv_mapping_count * 3);

        // ======================---------------------------

        const geometry_type = geometry.getUint32(48, true);
        const geometry_edge_interpolation_mode = geometry.getUint32(52, true);
        const geometry_vert_count = geometry.getUint32(56, true);
        const geometry_poly_count = geometry.getUint32(60, true);

        const geometry_vertices_ptr = 4 * geometry.getUint32(88, true);
        const geometry_polylist_ptr = 4 * geometry.getUint32(92, true);

        const geometry_group_count = geometry.getUint32(104, true);

        const geometry_vertices = new Float32Array(geometry.buffer, geometry_vertices_ptr, geometry_vert_count * 3);
        const geometry_polylist = geometry_vert_count > 65535 ? new Uint32Array(geometry.buffer, geometry_polylist_ptr, geometry_poly_count * 6) : new Uint16Array(geometry.buffer, geometry_polylist_ptr, geometry_poly_count * 6);

        // ======================---------------------------

        const skin_data = (() => {
            if (!skin) {
                return null;
            }

            const skin_vert_count = skin.getUint32(48, true);
            const skin_method = skin.getUint32(52, true);
            const skin_vertices_ptr = 4 * skin.getUint32(60, true);

            if (skin_vert_count != geometry_vert_count) {
                console.error("网格骨骼蒙皮期望顶点数与基础几何体顶点数不匹配！", skin_vert_count, geometry_vert_count);
                return null;
            }

            const skin_vertices = new Uint32Array(skin.buffer, skin_vertices_ptr, skin_vert_count * 2);

            return {
                vert_count: skin_vert_count,
                method: skin_method,
                vertices: skin_vertices
            };
        })();

        // ======================---------------------------

        if (uv_vert_count != geometry_vert_count) {
            console.error("网格UV期望顶点数与基础几何体顶点数不匹配！", uv_vert_count, geometry_vert_count);
            return null;
        }

        const invalid = geometry_vert_count > 65535 ? 0xFFFFFFFF : 0xFFFF;

        let vcount = uv_uv_count;
        let icount = 0;

        for (let i = 0; i < geometry_poly_count; i++) {
            icount += geometry_polylist[i * 6 + 5] == invalid ? 3 : 6;
        }

        let intLength = 0;

        let headerOffset = intLength; intLength += 8;
        let groupsOffset = intLength; intLength += 4 * geometry_group_count;

        let indicesOffset = intLength; intLength += icount;

        let verticesOffset = intLength; intLength += 3 * vcount;
        let uvsOffset = intLength; intLength += 2 * vcount;

        let bones_weightsOffset = 0;

        if (skin_data) {
            bones_weightsOffset = intLength; intLength += 2 * vcount;
        }

        let original_verticesOffset = 0;

        if (static_morph && static_morph.length > 0) {
            original_verticesOffset = intLength; intLength += 3 * vcount;
        }

        const buffer = new ArrayBuffer(4 * intLength);
        const header = new Uint32Array(buffer, 4 * headerOffset, 8);
        const groups = new Uint32Array(buffer, 4 * groupsOffset, 4 * geometry_group_count);
        const indices = new Uint32Array(buffer, 4 * indicesOffset, icount);
        const vertices = new Float32Array(buffer, 4 * verticesOffset, 3 * vcount);
        const uvs = new Float32Array(buffer, 4 * uvsOffset, 2 * vcount);
        const bones_weights = bones_weightsOffset ? new Uint32Array(buffer, 4 * bones_weightsOffset, 2 * vcount) : null;
        const original_vertices = original_verticesOffset ? new Float32Array(buffer, 4 * original_verticesOffset, 3 * vcount) : null;

        const polylist = geometry_polylist.slice();

        vertices.set(geometry_vertices);

        if (skin_data) {
            for (let i = 0; i < vcount; i++) {
                bones_weights[i] = skin_data.vertices[i * 2 + 0];
                bones_weights[vcount + i] = skin_data.vertices[i * 2 + 1];
            }
        }

        if (original_vertices) {
            original_vertices.set(geometry_vertices);
        }

        if (static_morph) {
            for (let morph of static_morph) {
                const buffer = morph.deltas;
                const header = new Uint32Array(buffer, 48, 16);
                const type = header[0];

                if (type != 1) {
                    console.error("不支持非CPU网格变形数据！");
                    continue;
                }

                const vertex_count = header[9];
                const targetCount = header[10];

                if (vertex_count != geometry_vert_count) {
                    console.error("网格变形期望的几何顶点数量不符！", vertex_count, geometry_vert_count);
                    continue;
                }

                const deltaCounts = new Uint32Array(buffer, header[12] * 4, targetCount);
                const deltas = new Float32Array(buffer, header[13] * 4);
                const deltas_uint = new Uint32Array(buffer, header[13] * 4);

                let deltaOffset = 0;

                for (let t = 0; t < targetCount; t++) {
                    const deltaCount = deltaCounts[t];
                    const weight = morph.weights[t];

                    for (let i = 0; i < deltaCount; i++) {
                        const i4 = (deltaOffset + i) * 4;

                        const vi = deltas_uint[i4 + 0] * 3;
                        const x = deltas[i4 + 1] * weight;
                        const y = deltas[i4 + 2] * weight;
                        const z = deltas[i4 + 3] * weight;

                        vertices[vi + 0] += x;
                        vertices[vi + 1] += y;
                        vertices[vi + 2] += z;
                    }

                    deltaOffset += deltaCount;
                }
            }
        }

        uvs.set(uv_uvs);

        for (let i = 0; i < uv_mapping_count; i++) {
            const i3 = i * 3;
            const i6 = uv_mappings[i3 + 0] * 6;

            const vertex_index = uv_mappings[i3 + 1];
            const uv_index = uv_mappings[i3 + 2];

            for (let j = 2; j < 6; j++) {
                if (polylist[i6 + j] == vertex_index) {
                    polylist[i6 + j] = uv_index;

                    vertices[(uv_index * 3) + 0] = vertices[(vertex_index * 3) + 0];
                    vertices[(uv_index * 3) + 1] = vertices[(vertex_index * 3) + 1];
                    vertices[(uv_index * 3) + 2] = vertices[(vertex_index * 3) + 2];

                    if (original_vertices) {
                        original_vertices[(uv_index * 3) + 0] = original_vertices[(vertex_index * 3) + 0];
                        original_vertices[(uv_index * 3) + 1] = original_vertices[(vertex_index * 3) + 1];
                        original_vertices[(uv_index * 3) + 2] = original_vertices[(vertex_index * 3) + 2];
                    }

                    if (bones_weights) {
                        bones_weights[uv_index] = bones_weights[vertex_index];
                        bones_weights[vcount + uv_index] = bones_weights[vcount + vertex_index];
                    }
                }
            }
        }

        header[0] = 1 | 2 | 8 | (original_vertices ? 64 : 0) | (skin_data ? (16 | 32) : 0);
        header[1] = icount;
        header[2] = vcount;
        header[3] = geometry_group_count;
        header[4] = uv_vert_count;
        header[5] = 0;
        header[6] = 0;
        header[7] = 0;

        let icounter = 0;

        for (let g = 0; g < geometry_group_count; g++) {
            const g4 = g * 4;

            groups[g4 + 0] = 3;
            groups[g4 + 1] = icounter;
            groups[g4 + 2] = 0;
            groups[g4 + 3] = 0;

            for (let i = 0; i < geometry_poly_count; i++) {
                const i6 = i * 6;
                const group = polylist[i6 + 1];

                if (g == group) {
                    const vert0 = polylist[i6 + 2];
                    const vert1 = polylist[i6 + 3];
                    const vert2 = polylist[i6 + 4];
                    const vert3 = polylist[i6 + 5];

                    // 三角形
                    if (vert3 == invalid) {
                        indices[icounter++] = vert0;
                        indices[icounter++] = vert1;
                        indices[icounter++] = vert2;
                    }
                    // 四边形
                    else {
                        indices[icounter++] = vert0;
                        indices[icounter++] = vert1;
                        indices[icounter++] = vert2;

                        indices[icounter++] = vert0;
                        indices[icounter++] = vert2;
                        indices[icounter++] = vert3;
                    }
                }
            }

            groups[g4 + 2] = icounter - groups[g4 + 1];

            // console.error(groups[g4 + 0], groups[g4 + 1], groups[g4 + 2]);
        }

        // ======================---------------------------

        // console.error(uv_vert_count, uv_uv_count, uv_mapping_count, uv_uvs_ptr, uv_mappings_ptr);
        // console.error(geometry_vert_count, geometry_poly_count, geometry_group_count);
        // console.error(icounter, header[0], header[1], header[2], header[3]);
        // console.error("verts", vertices, geometry_vertices);
        // console.error("uvs", uvs, uv_uvs);
        // console.error("skin", skin_data);

        return buffer;
    }

    /** 事务处理器。 */
    private _worker: Miaoworker;
    /** DAZ资产管理器。 */
    private _resources_daz: Resources_daz;
}
