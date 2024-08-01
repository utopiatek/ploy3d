import { Miaoworker } from './worker.js';
import { Importer_gltf } from './importer_gltf.js';


/** 资源导入器。 */
export class Importer {
    /**
     * 构造函数。
     * @param worker 事务处理器。
     */
    public constructor(worker: Miaoworker) {
        this._worker = worker;
    }

    /** 装载GLTF场景数据。 */
    public async Import_gltf(url: string, progress: (rate: number, msg: string) => void) {
        if (url.startsWith("./") && this._worker["workerID"] != 0) {
            // TODO: "./"相对子线程脚本路径
            url = "../../../" + url;
        }

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

    /** 装载百度地图矢量瓦片。 */
    public async Import_vtile_bd(col: number, row: number, level: number) {
        // TODO ...
        return null as any;
    }

    /** 事务处理器。 */
    private _worker: Miaoworker;
}
