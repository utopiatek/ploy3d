import type { PackageReg, GLPrimitiveTopology } from "../mod.js";
import { Kernel, SharedENV, Internal } from "../kernel.js";
import { Importer } from "./importer.js";
import "./jszip.min.js";
/** 事务处理器。 */
export declare class Miaoworker {
    /**
     * 构造函数。
     */
    constructor(_global?: Kernel["_global"]);
    /**
     * 事务处理器启动方法。
     * @param workerUrl 子线程内核代码路径，主线程事务处理器启动时不能传入该参数。
     * @returns 异步对象
     */
    Startup(args?: {
        /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
        uid: number;
        /** 是否使用的是WebGL图形API*/
        webgl: boolean;
        /** DAZ资源服务地址。 */
        dazServ: string;
        /** 内核代码。 */
        kernelCode: ArrayBuffer;
    }): Promise<this>;
    /**
     * 事务处理器关闭方法。
     * @returns 异步对象
     */
    Shutdown(): Promise<{
        child: any;
        slots: number;
        slot: number;
        sendTick: number;
        recvTick: number;
    }>;
    /**
     * 导入GLTF文件，返回资源包内容。
     * @param worker 派遣线程索引，0为主线程。
     * @param url GLTF文件路径。
     * @returns 异步对象
     */
    Import_gltf(worker: number, url: string, progress: (rate: number, msg: string) => void): Promise<{
        pkg: PackageReg;
        files: Record<string, any>;
    }>;
    /**
     * 导入GLTF文件，返回资源包内容。
     * @param worker 派遣线程索引，0为主线程。
     * @param file GLTF文件描述。
     * @returns 异步对象。
     */
    Import_gltf_file(worker: number, file: File, progress: (rate: number, msg: string) => void): Promise<PackageReg>;
    /**
     * 导入DAZ文件，返回资源包UUID。
     * @param worker 派遣线程索引，0为主线程。
     * @param url DAZ文件路径。
     * @returns 异步对象
     */
    Import_daz(worker: number, url: string, progress: (rate: number, msg: string) => void): Promise<{
        main: string;
        pkgs: {
            path: string;
            uuid: string;
            key: string;
            pkg: PackageReg;
            files?: Record<string, any>;
            uuidLut: Record<string, any>;
            nodeLib: {
                lut: Record<string, import("./importer_daz.js").Daz_node>;
                list: string[];
            };
        }[];
    }>;
    /**
     * 装载百度地图矢量瓦片，返回网格数据。
     * @param worker 派遣线程索引，0为主线程。
     * @param param 瓦片参数。
     * @returns 异步对象。
     */
    Import_vtile_bd(worker: number, param: {
        col: number;
        row: number;
        level: number;
    }, progress: (rate: number, msg: string) => void): Promise<{
        vertices: number[];
        normals: number[];
        uvs: number[];
        groups: {
            topology: GLPrimitiveTopology;
            indices: number[];
        }[];
    }>;
    /**
     * 加载3MX场景分组资源实例。
     * @param worker 派遣线程索引，0为主线程。
     * @param url GLTF文件路径。
     * @returns 异步对象
     */
    Load_3mxb_resource(worker: number, group: Parameters<Importer["Load_3mxb_resource"]>[0], progress: (rate: number, msg: string) => void): Promise<{
        _path: string;
        _file: string;
        _ab?: ArrayBuffer;
        _ab_offset: number;
        resources: {
            type: "textureBuffer" | "geometryBuffer" | "textureFile" | "geometryFile";
            format: "png" | "jpg" | "ctm" | "obj";
            size?: number;
            _offset: number;
            _bitmap?: ImageBitmap;
            _mesh_data?: ArrayBuffer;
        }[];
    }>;
    /**
     * 加载并解码DEM数据。
     * @param worker 派遣线程索引，0为主线程。
     * @param url 数据URL。
     * @returns 异步对象。
     */
    Decode_dem(worker: number, url: string): Promise<Uint8Array>;
    /**
     * GZIP数据解压。
     * @param buffer 压缩数据。
     * @returns 返回解压后数据。
     */
    Pako_inflate(buffer: ArrayBuffer): Uint8Array;
    /**
     * 压缩贴图数据。
     * @param data_ 原始贴图数据。
     * @param has_alpha 数据是否包含不透明度。
     * @returns 返回压缩结果。
     */
    EncodeTexture(data_: ArrayBuffer, has_alpha: boolean): Promise<{
        data: ArrayBuffer;
        has_alpha: boolean;
    }>;
    /**
     * 发送事务信息给其它线程。
     * @param info 事务信息。
     */
    private PostMessage;
    /**
     * 接收其它线程事务信息。
     * @param info 事务信息。
     */
    private OnMessage;
    /**
     * 事务处理器日志打印方法。
     * @param msg 日志信息。
     * @param ctrl 打印模式（0:log，1:info，2:warn，>2:error）。
     */
    Track(msg: string, ctrl?: number): void;
    /**
     * 网络请求方法。
     * @param input 请求路径（请保证路径的正确性）。
     * @param init 请求参数。
     * @param type 请求数据类型。
     * @returns 返回指定类型数据。
     */
    Fetch<T>(input: string, init: RequestInit, type: "arrayBuffer" | "blob" | "formData" | "json" | "text"): Promise<T>;
    /** 当前事务处理器ID（0为主线程）。 */
    private workerID;
    /** 子线程事务处理器（主线程包含）。 */
    private worker;
    /** 事务槽列表。 */
    private slots;
    /** 当前可分配事务槽索引。 */
    private slot;
    /** 消息发送计数。 */
    private sendTick;
    /** 消息接收计数。 */
    private recvTick;
    /** 事务处理器已关闭。 */
    private closed;
    /** 事务处理器启动时间戳。 */
    startTS: number;
    /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
    uid: number;
    /** 是否使用的是WebGL图形API*/
    webgl: boolean;
    /** DAZ资源服务地址。 */
    dazServ: string;
    /** 内核代码。 */
    kernelCode: ArrayBuffer;
    /** 内核管理器。 */
    kernel: Kernel;
    /** 共享数据环境。 */
    env: SharedENV;
    /** 内核接口。 */
    internal: Internal;
    /** 资源导入器接口。 */
    importer: Importer;
}
/** 事务信息。 */
export interface WorkInfo {
    /** 事务ID。 */
    id?: number;
    /** 事务槽。 */
    slot?: number;
    /** 事务类型。 */
    type: WorkType;
    /** 事务状态：0-未发送，1-已发送，2-已返回，-1-已返回异常。 */
    state: number;
    /** 事务参数。 */
    args: any;
    /** 事务附加参数。 */
    transfer?: any;
    /** 事务解决回调。 */
    resolve?: (out: any) => void;
    /** 事务异常回调。 */
    reject?: (err?: any) => void;
}
/** 事务类型。 */
export declare const enum WorkType {
    /** 无效类型。 */
    Invalid = 0,
    /** 启动事务处理器。 */
    Startup = 1,
    /** 关闭事务处理器。 */
    Shutdown = 2,
    /** 导入GLTF文件。 */
    Import_gltf = 3,
    /** 导入GLTF文件。 */
    Import_gltf_file = 4,
    /** 导入DAZ文件。 */
    Import_daz = 5,
    /** 装载矢量地图瓦片。 */
    Import_vtile_bd = 6,
    /** 装载3MXB文件资源。 */
    Load_3mxb_resource = 7
}
