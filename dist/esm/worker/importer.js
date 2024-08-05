import { Importer_gltf } from './importer_gltf.js';
export class Importer {
    constructor(worker) {
        this._worker = worker;
    }
    async Import_gltf(url, progress) {
        progress(0.0, "加载文件：" + url);
        if (url.endsWith(".zip")) {
            const blob = await this._worker.Fetch(url, null, "blob");
            const zip = await globalThis.JSZip.loadAsync(blob);
            let filename = null;
            for (let key in zip.files) {
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
            const data = await this._worker.Fetch(url, null, "json");
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
    async Import_gltf_file(file, progress) {
        return null;
    }
    async Import_vtile_bd(col, row, level) {
        return null;
    }
    async Load_3mxb_resource(group, progress) {
        if (!group._ab) {
            group._ab = await this._worker.Fetch(group._path + group._file, null, "arrayBuffer");
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
                        let marker = data_view.getUint16(read_offset, true);
                        read_offset += 2;
                        if (marker == 0xC0FF || marker == 0xC2FF) {
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
                    console.error("png parse error!");
                }
                let option = undefined;
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
    _worker;
}
//# sourceMappingURL=importer.js.map