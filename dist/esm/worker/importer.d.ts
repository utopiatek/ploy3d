import { Miaoworker } from './worker.js';
/** 资源导入器。 */
export declare class Importer {
    /**
     * 构造函数。
     * @param worker 事务处理器。
     */
    constructor(worker: Miaoworker);
    /** 装载GLTF场景数据。 */
    Import_gltf(url: string, progress: (rate: number, msg: string) => void): Promise<{
        pkg: import("../mod.js").Package;
        files: Record<string, any>;
    }>;
    /** 装载GLTF场景数据。 */
    Import_gltf_file(file: File, progress: (rate: number, msg: string) => void): Promise<any>;
    /** 装载百度地图矢量瓦片。 */
    Import_vtile_bd(col: number, row: number, level: number): Promise<any>;
    /** 事务处理器。 */
    private _worker;
}
