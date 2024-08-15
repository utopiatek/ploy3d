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
    public async Gen_mesh_data(geometry: DataView, uv_set: DataView) {
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

        // ======================---------------------------

        console.error(uv_vert_count, uv_uv_count, uv_mapping_count, uv_uvs_ptr, uv_mappings_ptr);
        console.error(geometry_vert_count, geometry_poly_count, geometry_group_count);

        //console.error(uv_uvs);
        //console.error(uv_mappings);
    }

    /** 事务处理器。 */
    private _worker: Miaoworker;
    /** DAZ资产管理器。 */
    private _resources_daz: Resources_daz;
}
