import type { Miaoworker } from './worker.js';

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
        // TODO ...
        return null as any;
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
