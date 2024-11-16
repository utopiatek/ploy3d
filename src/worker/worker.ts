import type { PackageReg, GLPrimitiveTopology } from "../mod.js"
import { Kernel, SharedENV, Internal } from "../kernel.js"
import { Importer } from "./importer.js"
export { localforage } from "./localforage.js";
import BASIS from "./basis_encoder.js"
import pako from "./pako.esm.js"
import earcut from "./earcut.js"
import "./jszip.min.js"

/** 事务处理器。 */
export class Miaoworker {
    /**
     * 构造函数。
     */
    public constructor(_global?: Kernel["_global"]) {
        this.workerID = -1;
        this.worker = null;
        this.slots = [null];
        this.slot = 1;
        this.sendTick = 0;
        this.recvTick = 0;
        this.closed = false;

        this.startTS = Date.now();
        this.uid = _global?.uid;
        this.webgl = _global?.webgl;
        this.baseURI = _global?.baseURI;
        this.dazServ = _global?.dazServ;
        this.kernelCode = _global?.kernelCode;
        this.kernel = _global?.kernel;
        this.env = _global?.env;
        this.internal = _global?.internal;

        // 子线程中的消息监听
        if (!globalThis.document) {
            globalThis.onmessage = (ev: MessageEvent) => {
                // 同步主线程的用户ID
                this.uid = ev.data.uid;
                this.OnMessage(ev.data);
            };
        }
    }

    /**
     * 事务处理器启动方法。
     * @param workerUrl 子线程内核代码路径，主线程事务处理器启动时不能传入该参数。
     * @returns 异步对象
     */
    public async Startup(args?: {
        /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
        uid: number;
        /** 是否使用的是WebGL图形API*/
        webgl: boolean;
        /** 根路径。 */
        baseURI: string;
        /** DAZ资源服务地址。 */
        dazServ: string;
        /** 内核代码。 */
        kernelCode: ArrayBuffer;
    }) {
        if (!args) {
            const code = `
// 导入子线程代码模块
import { Miaoworker } from "${this.baseURI}dist/esm/worker/worker.js"

// 子线程脚本装载后自动实例化事务处理器
const __worker = new Miaoworker();
            `;

            const blob = new Blob([code], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            this.workerID = 0;
            this.worker = new Worker(url, { type: 'module' });

            // 监听子线程消息
            this.worker.onmessage = (ev: MessageEvent) => {
                this.OnMessage(ev.data);
            };

            // 指示子线程启动事务处理器
            await this.PostMessage({
                type: WorkType.Startup,
                state: 0,
                args: {
                    uid: this.uid,
                    webgl: this.webgl,
                    baseURI: this.baseURI,
                    dazServ: this.dazServ,
                    kernelCode: this.kernelCode,
                    transfer: [this.kernelCode]
                }
            });
        }
        else {
            this.workerID = 1;
            this.worker = null;

            // 子线程中的消息监听在构造函数中设置，确保第一时间进行监听 ...

            // 子线程无法在调度孙线程 ...
        }

        this.importer = new Importer(this);

        if (this.workerID != 0) {
            this.uid = args.uid;
            this.webgl = args.webgl;
            this.baseURI = args.baseURI;
            this.dazServ = args.dazServ;
            this.kernelCode = args.kernelCode;

            this.kernel = await (new Kernel(this)).Init({
                CompileBranches: (g1: number, g2: number, g3: number, flags: number, topology: number, frontFace: number, cullMode: number) => {
                    this.Track("Miaoworker内核不应调用CompileBranches方法！");
                    return 0;
                },
                CreateBuffer: (type: number, size: number, offset: number) => {
                    this.Track("Miaoworker内核不应调用CreateBuffer方法！");
                    return 0;
                },
                UploadBuffer: (bufferID: number, cachePtr: any, offset: number, size: number) => {
                    this.Track("Miaoworker内核不应调用UploadBuffer方法！");
                },
                Update: (classid: number, id: number) => {
                    this.Track("Miaoworker内核不应调用Update方法！");
                    return 0;
                },
                Remove: (classid: number, id: number) => {
                    this.Track("Miaoworker内核不应调用Remove方法！");
                },
                DrawPart: (g1: number, g2: number, pipeline: number, mesh: number, submesh: number, instanceCount: number, firstInstance: number, materialSlot: number) => {
                    this.Track("Miaoworker内核不应调用DrawPart方法！");
                },
            });

            if (!this.kernel) {
                throw "子线程内核接口初始化失败！"
            }

            this.Track("子线程启动成功！");
        }

        return this;
    }

    /**
     * 事务处理器关闭方法。
     * @returns 异步对象
     */
    public async Shutdown() {
        // 关闭事务处理器，不再响应请求
        this.closed = true;

        // 子线程退出状态
        let childStat = null;

        // 关闭主线程
        if (0 === this.workerID) {
            // 指示子线程关闭事务处理器
            childStat = await this.PostMessage({
                type: WorkType.Shutdown,
                state: 0,
                args: {},
            });

            // 停止接收来子主线程的消息
            this.worker.terminate();
        }
        // 关闭子线程
        else {
            // 无需指示孙线程关闭事务处理器 ...

            // 停止接收来自主线程的消息
            globalThis.onmessage = null;

            console.error("未关闭子线程内核");
        }

        const stat = {
            child: childStat,
            slots: this.slots.length,
            slot: this.slot,
            sendTick: this.sendTick,
            recvTick: this.recvTick
        };

        this.workerID = -1;
        this.worker = null;
        this.slots = [null];
        this.slot = 1;
        this.sendTick = 0;
        this.recvTick = 0;
        this.env = null;
        this.internal = null;

        return stat;
    }

    /**
     * 导入GLTF文件，返回资源包内容。
     * @param worker 派遣线程索引，0为主线程。
     * @param url GLTF文件路径。
     * @returns 异步对象
     */
    public Import_gltf(worker: number, url: string, progress: (rate: number, msg: string) => void) {
        return new Promise<Awaited<ReturnType<Importer["Import_gltf"]>>>((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }

            if (this.gltfCache[url]) {
                resolve(this.gltfCache[url]);
                return;
            }

            if (0 === worker) {
                this.importer.Import_gltf(url, progress).then((res) => {
                    this.gltfCache[url] = res;
                    resolve(res);
                }).catch(reject);
            }
            else {
                this.PostMessage({
                    type: WorkType.Import_gltf,
                    state: 0,
                    args: {
                        url: url
                    },
                }).then((res) => {
                    this.gltfCache[url] = res;
                    resolve(res);
                }).catch(reject);
            }
        });
    }

    /**
     * 导入GLTF文件，返回资源包内容。
     * @param worker 派遣线程索引，0为主线程。
     * @param file GLTF文件描述。
     * @returns 异步对象。
     */
    public Import_gltf_file(worker: number, file: File, progress: (rate: number, msg: string) => void) {
        return new Promise<Awaited<ReturnType<Importer["Import_gltf"]>>>((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }

            if (0 === worker) {
                this.importer.Import_gltf_file(file, progress).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: WorkType.Import_gltf_file,
                    state: 0,
                    args: {
                        file: file
                    },
                }).then(resolve).catch(reject);
            }
        });
    }

    /**
     * 导入DAZ文件，返回资源包UUID。
     * @param worker 派遣线程索引，0为主线程。
     * @param url DAZ文件路径。
     * @returns 异步对象
     */
    public Import_daz(worker: number, url: string, progress: (rate: number, msg: string) => void) {
        return new Promise<Awaited<ReturnType<Importer["Import_daz"]>>>((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }

            if (0 === worker) {
                this.importer.Import_daz(url, progress).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: WorkType.Import_daz,
                    state: 0,
                    args: {
                        url: url
                    },
                }).then(resolve).catch(reject);
            }
        });
    }

    /**
     * 装载百度地图矢量瓦片，返回网格数据。
     * @param worker 派遣线程索引，0为主线程。
     * @param param 瓦片参数。
     * @returns 异步对象。
     */
    public Import_vtile_bd(worker: number, param: {
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
    }> {
        return new Promise<any>((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }

            if (0 === worker) {
                this.importer.Import_vtile_bd(param.col, param.row, param.level).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: WorkType.Import_vtile_bd,
                    state: 0,
                    args: {
                        param
                    },
                }).then(resolve).catch(reject);
            }
        });
    }

    /**
     * 加载3MX场景分组资源实例。
     * @param worker 派遣线程索引，0为主线程。
     * @param url GLTF文件路径。
     * @returns 异步对象
     */
    public Load_3mxb_resource(worker: number, group: Parameters<Importer["Load_3mxb_resource"]>[0], progress: (rate: number, msg: string) => void) {
        return new Promise<Awaited<ReturnType<Importer["Load_3mxb_resource"]>>>((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }

            if (0 === worker) {
                this.importer.Load_3mxb_resource(group, progress).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: WorkType.Load_3mxb_resource,
                    state: 0,
                    args: group,
                }).then(resolve).catch(reject);
            }
        });
    }

    /**
     * 加载并解码DEM数据。
     * @param worker 派遣线程索引，0为主线程。
     * @param url 数据URL。
     * @returns 异步对象。
     */
    public async Decode_dem(worker: number, url: string) {
        const buffer = await this.Fetch<ArrayBuffer>(url, null, "arrayBuffer");
        if (!buffer) {
            return null;
        }

        // 无效地形数据
        if (152 == buffer.byteLength) {
            return null;
        }

        // 无效地形数据
        // if (60 == buffer[0] && 63 == buffer[1] && 120 == buffer[2]) {
        //     return null;
        // }

        const n = this.Pako_inflate(buffer);
        if (n.byteLength != 45000 && n.byteLength != 90000) {
            return null;
        }

        const d = new Uint8Array(64 * 64 * 4);
        const c = new Uint8Array(4);
        const c_float = new Float32Array(c.buffer, 0, 1);
        const i = n.byteLength == 45000 ? 2 : 4;
        const p = 64;
        const g = 64;
        let s = 0;
        let l = 0;
        let a = 0;
        let o = 0;
        let m = 0;
        let r = 0;

        for (let u = 0; u < g; u++) {
            for (let C = 0; C < p; C++) {
                s = Math.floor(149.0 * u / (g - 1));
                l = Math.floor(149.0 * C / (p - 1));

                if (4 == i) {
                    a = i * (150 * s + l);

                    c[0] = n[a];
                    c[1] = n[a + 1];
                    c[2] = n[a + 2];
                    c[3] = n[a + 3];

                    o = c_float[0];
                }
                else {
                    a = i * (150 * s + l);
                    o = n[a] + 256 * n[a + 1];

                    if (o > 1e4 || o < -2e3) {
                        o = 0;
                    }
                }

                m = (o + 1e3) / .001;

                r = 4 * (u * p + C);
                d[r] = m / 65536;
                d[r + 1] = (m - 256 * d[r] * 256) / 256;
                d[r + 2] = m - 256 * d[r] * 256 - 256 * d[r + 1];
                d[r + 3] = 255;
            }
        }

        return d;
    }

    /**
     * GZIP数据解压。
     * @param buffer 压缩数据。
     * @returns 返回解压后数据。
     */
    public Pako_inflate(buffer: ArrayBuffer) {
        return pako.inflate(buffer) as Uint8Array;
    }

    /**
     * 多边形三角化。
     * @param vertices 顶点坐标数组。 
     * @param holeIndices 孔洞顶点索引数组。
     * @param dim 图形维度（2/3）。
     * @returns 返回三角形索引数组。
     */
    public Earcut(vertices: number[], holeIndices: number[] = null, dim = 2): number[] {
        return earcut(vertices, holeIndices, dim);
    }

    /**
     * 压缩贴图数据。
     * @param data_ 原始贴图数据。
     * @param has_alpha 数据是否包含不透明度。
     * @returns 返回压缩结果。
     */
    public async EncodeTexture(data_: ArrayBuffer, has_alpha: boolean) {
        const basis = await this.Basis();
        if (!basis) {
            return null;
        }

        let data: ArrayBuffer = data_;

        // TODO: 子线程没有Image对象，无法缩放图片
        if (this.workerID == 0) {
            const data = await this.ResizeTexture(data_);
        }

        if (!data) {
            return { data: null as ArrayBuffer, has_alpha }
        }

        const { KTX2File, BasisEncoder, initializeBasis, encodeBasisTexture } = basis;

        initializeBasis();

        const basisEncoder = new BasisEncoder();

        const qualityLevel = 128;
        const uastcFlag = false;

        basisEncoder.setCreateKTX2File(true);
        basisEncoder.setKTX2UASTCSupercompression(true);
        basisEncoder.setKTX2SRGBTransferFunc(true);

        basisEncoder.setSliceSourceImage(0, new Uint8Array(data), 0, 0, true);
        basisEncoder.setDebug(false);
        basisEncoder.setComputeStats(false);
        basisEncoder.setPerceptual(true);
        basisEncoder.setMipSRGB(true);
        basisEncoder.setQualityLevel(qualityLevel);
        basisEncoder.setUASTC(uastcFlag);
        basisEncoder.setMipGen(true);
        basisEncoder.setCheckForAlpha(has_alpha);

        // 创建目标缓存，缓存空间不足将导致失败
        const buffer = new Uint8Array(1024 * 1024 * 10);
        const length = basisEncoder.encode(buffer);

        basisEncoder.delete();

        if (0 < length) {
            let data = new Uint8Array(new Uint8Array(buffer.buffer, 0, length));

            if (has_alpha) {
                const file = new KTX2File(data);

                if (file.isValid()) {
                    has_alpha = file.getHasAlpha();
                }
                else {
                    data = null;
                }

                file.close();
                file.delete();
            }

            return { data: data.buffer, has_alpha };
        }
        else {
            return { data: null as ArrayBuffer, has_alpha }
        }
    }

    /** 
     * 缩放贴图尺寸为2的次幂。
     */
    public ResizeTexture(buffer: ArrayBuffer) {
        return new Promise<ArrayBuffer>(function (resolve, reject) {
            const data = new Uint8Array(buffer);
            const blob = new Blob([data]);
            const url = globalThis.URL.createObjectURL(blob);

            const image = new Image();
            image.src = url;
            image.onload = (e) => {
                let width = Math.round(Math.log2(image.width));
                let height = Math.round(Math.log2(image.height));

                width = Math.max(6, Math.min(11, width));
                height = Math.max(6, Math.min(11, height));

                width = Math.pow(2, width);
                height = Math.pow(2, height);

                // TODO：某些JPG格式不支持，所以我们都进行一次缩放
                if (true || width != image.width || height != image.height) {
                    console.log("缩放贴图尺寸：", image.width, image.height, width, height);

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(image, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const reader = new FileReader();
                        reader.readAsArrayBuffer(blob);
                        reader.onload = function () {
                            resolve(this.result as ArrayBuffer);
                        };
                    });
                }
                else {
                    resolve(buffer);
                }
            };
            image.onerror = (e) => {
                reject(e);
            };
        });
    }

    /**
     * 发送事务信息给其它线程。
     * @param info 事务信息。
     */
    private PostMessage(info: WorkInfo) {
        // 设置发送排号
        info.id = this.sendTick++;

        const slot = this.slot;

        if (0 === info.state) {
            // 事务槽将被重用（避免队列占用空间过大）
            const next_slot = this.slot === this.slots.length ? this.slot + 1 : this.slots[this.slot].slot;

            // 将事务记录到事务槽
            this.slots[slot] = info;
            this.slot = next_slot;

            info.slot = slot;
            info.state = 1;
        }

        // 发送给子线程
        if (this.worker) {
            info.uid = this.uid;
            this.worker.postMessage(info, info.transfer);
        }
        // 发送给主线程。
        else {
            globalThis.postMessage(info, info.transfer);
        }

        return new Promise<any>(function (resolve, reject) {
            info.resolve = resolve;
            info.reject = reject;
        });
    }

    /**
     * 接收其它线程事务信息。
     * @param info 事务信息。
     */
    private OnMessage(info: WorkInfo) {
        // 请求处理事务。
        if (info.state == 1) {
            // 事务接收数量应当等同于对向的事务发送次数（事务应当是依次发送的）
            if (info.id !== this.recvTick) {
                this.Track("事务排号不一致: " + info.id + ", " + this.recvTick, 3);
            }

            // 应要求启动本线程事务处理器
            if (info.type === WorkType.Startup) {
                this.Startup(info.args)
                    .then(() => {
                        info.args = {};
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 应要求关闭本线程事务处理器
            else if (info.type == WorkType.Shutdown) {
                this.Shutdown()
                    .then((stat) => {
                        info.args = stat;
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 应要求导入并解析GLTF文件
            else if (info.type === WorkType.Import_gltf) {
                this.Import_gltf(0, info.args.url, (rate, msg) => { })
                    .then((data) => {
                        info.args = data;
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 应要求导入并解析GLTF文件
            else if (info.type === WorkType.Import_gltf_file) {
                this.Import_gltf_file(0, info.args.file, (rate, msg) => { })
                    .then((data) => {
                        info.args = data;
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 应要求导入并解析DAZ文件
            else if (info.type === WorkType.Import_daz) {
                this.Import_daz(0, info.args.url, (rate, msg) => { })
                    .then((data) => {
                        info.args = data;
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 应要求矢量地图瓦片
            else if (info.type === WorkType.Import_vtile_bd) {
                this.Import_vtile_bd(0, info.args.param, (rate, msg) => { })
                    .then((data) => {
                        info.args = data;
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 应要求加载3MX场景分组资源实例
            else if (info.type === WorkType.Load_3mxb_resource) {
                this.Load_3mxb_resource(0, info.args, (rate, msg) => { })
                    .then((data) => {
                        info.args = data;
                        info.state = 2;

                        this.PostMessage(info);
                    })
                    .catch((reason) => {
                        info.args = reason;
                        info.state = -1;

                        this.PostMessage(info);
                    });
            }
            // 未知事务类型
            else {
                info.args = "未知事务类型：" + info.type;
                info.state = -1;

                this.PostMessage(info);
            }
        }
        // 接收已完成事务
        else if (info.state == 2) {
            this.slots[info.slot].resolve(info.args);
            this.slots[info.slot] = { slot: this.slot } as any;
            this.slot = info.slot;
        }
        // 接收事务处理异常
        else {
            this.slots[info.slot].reject(info.args);
            this.slots[info.slot] = { slot: this.slot } as any;
            this.slot = info.slot;
        }

        this.recvTick++;
    }

    /**
     * 事务处理器日志打印方法。
     * @param msg 日志信息。
     * @param ctrl 打印模式（0:log，1:info，2:warn，>2:error）。
     */
    public Track(msg: string, ctrl?: number) {
        if (2 < ctrl) {
            console.error("Track:", (Date.now() - this.startTS), msg);
        }
        else if (2 === ctrl) {
            console.warn("Track:", (Date.now() - this.startTS), msg);
        }
        else if (1 === ctrl) {
            console.info("Track:", (Date.now() - this.startTS), msg);
        }
        else {
            console.log("Track:", (Date.now() - this.startTS), msg);
        }
    }

    /** 
     * 网络请求方法。
     * @param input 请求路径（请保证路径的正确性）。
     * @param init 请求参数。
     * @param type 请求数据类型。
     * @returns 返回指定类型数据。
     */
    public async Fetch<T>(input: string, init: RequestInit, type: "arrayBuffer" | "blob" | "formData" | "json" | "text") {
        if (input.startsWith("./")) {
            input = input.replace("./", this.baseURI);
        }

        const res = await fetch(input, init);

        return await res[type]() as T;
    }

    /** 
     * 获取纹理压缩模块实例。
     */
    public async Basis() {
        if (false || !BASIS) {
            return null;
        }

        if (this.basis !== undefined) {
            return this.basis;
        }

        const wasmBinary = await this.Fetch(this.baseURI + "lib/basis_encoder.wasm", null, "arrayBuffer");
        this.basis = await BASIS({ wasmBinary, onRuntimeInitialized: () => { } }).catch((e) => {
            this.basis = null;
        });

        return this.basis;
    }

    /** 当前事务处理器ID（0为主线程）。 */
    private workerID: number;
    /** 子线程事务处理器（主线程包含）。 */
    private worker: Worker;
    /** 事务槽列表。 */
    private slots: WorkInfo[];
    /** 当前可分配事务槽索引。 */
    private slot: number;
    /** 消息发送计数。 */
    private sendTick: number;
    /** 消息接收计数。 */
    private recvTick: number;
    /** 事务处理器已关闭。 */
    private closed: boolean;

    /** 事务处理器启动时间戳。 */
    public startTS: number;
    /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
    public uid: number;
    /** 是否使用的是WebGL图形API*/
    public webgl: boolean;
    /** 根路径。 */
    public baseURI: string;
    /** DAZ资源服务地址。 */
    public dazServ: string;
    /** 内核代码。 */
    public kernelCode: ArrayBuffer;
    /** 内核管理器。 */
    public kernel: Kernel;
    /** 共享数据环境。 */
    public env: SharedENV;
    /** 内核接口。 */
    public internal: Internal;
    /** 资源导入器接口。 */
    public importer: Importer;

    /** GLTF导入缓存（避免运行期内重复导入）。 */
    public gltfCache: Record<string, Awaited<ReturnType<Miaoworker["Import_gltf"]>>> = {};
    /** 纹理压缩模块实例。 */
    private basis: any;
}

/** 事务信息。 */
export interface WorkInfo {
    /** 同步用户ID到子线程。 */
    uid?: number;
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
export const enum WorkType {
    /** 无效类型。 */
    Invalid = 0,
    /** 启动事务处理器。 */
    Startup,
    /** 关闭事务处理器。 */
    Shutdown,
    /** 导入GLTF文件。 */
    Import_gltf,
    /** 导入GLTF文件。 */
    Import_gltf_file,
    /** 导入DAZ文件。 */
    Import_daz,
    /** 装载矢量地图瓦片。 */
    Import_vtile_bd,
    /** 装载3MXB文件资源。 */
    Load_3mxb_resource,
}
