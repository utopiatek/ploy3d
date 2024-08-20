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
        pkg: import("../mod.js").PackageReg;
        files: Record<string, any>;
    }>;
    /** 装载GLTF场景数据。 */
    Import_gltf_file(file: File, progress: (rate: number, msg: string) => void): Promise<any>;
    /** 装载DAZ数据文件。 */
    Import_daz(path: string, progress: (rate: number, msg: string) => void): Promise<{
        main: string;
        pkgs: {
            path: string;
            uuid: string;
            key: string;
            pkg: import("../mod.js").PackageReg;
            files?: Record<string, any>;
            uuidLut: Record<string, any>;
            nodeLib: {
                lut: Record<string, import("./importer_daz.js").Daz_node>;
                list: string[];
            };
        }[];
    }>;
    /** 装载百度地图矢量瓦片。 */
    Import_vtile_bd(col: number, row: number, level: number): Promise<any>;
    /** 加载3MX场景分组资源实例。 */
    Load_3mxb_resource(group: {
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
    }, progress: (rate: number, msg: string) => void): Promise<{
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
    }>;
    /** 生成网格数据。 */
    Gen_mesh_data(geometry: DataView, uv_set: DataView, skin: DataView, static_morph: {
        weights: number[];
        deltas: ArrayBuffer;
    }[]): Promise<ArrayBuffer>;
    /** 事务处理器。 */
    private _worker;
    /** DAZ资产管理器。 */
    private _resources_daz;
}
