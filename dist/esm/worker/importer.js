import { Importer_gltf } from './importer_gltf.js';
export class Importer {
    constructor(worker) {
        this._worker = worker;
    }
    async Import_gltf(url, progress) {
        if (url.startsWith("./") && this._worker["workerID"] != 0) {
            url = "../../../" + url;
        }
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
    _worker;
}
//# sourceMappingURL=importer.js.map