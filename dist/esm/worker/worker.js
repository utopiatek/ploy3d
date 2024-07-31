import { Kernel } from "../kernel.js";
import { Importer } from "./importer.js";
import pako from "./pako.esm.js";
export class Miaoworker {
    constructor(_global) {
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
        this.kernelCode = _global?.kernelCode;
        this.kernel = _global?.kernel;
        this.env = _global?.env;
        this.internal = _global?.internal;
        if (!globalThis.document) {
            globalThis.onmessage = (ev) => {
                this.OnMessage(ev.data);
            };
        }
    }
    async Startup(args) {
        if (!args) {
            this.workerID = 0;
            this.worker = new Worker("/dist/esm/worker/worker.js", { type: 'module' });
            this.worker.onmessage = (ev) => {
                this.OnMessage(ev.data);
            };
            await this.PostMessage({
                type: 1,
                state: 0,
                args: {
                    uid: this.uid,
                    webgl: this.webgl,
                    kernelCode: this.kernelCode,
                    transfer: [this.kernelCode]
                }
            });
        }
        else {
            this.workerID = 1;
            this.worker = null;
        }
        this.importer = new Importer(this);
        if (this.workerID != 0) {
            this.uid = args.uid;
            this.webgl = args.webgl;
            this.kernelCode = args.kernelCode;
            this.kernel = await (new Kernel(this)).Init({
                CreateBuffer: (type, size, offset) => {
                    this.Track("Miaoworker内核不应调用CreateBuffer方法！");
                    return 0;
                },
                UploadBuffer: (bufferID, cachePtr, offset, size) => {
                    this.Track("Miaoworker内核不应调用UploadBuffer方法！");
                },
                Release: (classid, id) => {
                    this.Track("Miaoworker内核不应调用Release方法！");
                    return 0;
                },
            });
            if (!this.kernel) {
                throw "子线程内核接口初始化失败！";
            }
            this.Track("子线程启动成功！");
        }
        return this;
    }
    async Shutdown() {
        this.closed = true;
        let childStat = null;
        if (0 === this.workerID) {
            childStat = await this.PostMessage({
                type: 2,
                state: 0,
                args: {},
            });
            this.worker.terminate();
        }
        else {
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
    Import_gltf(worker, url, progress) {
        return new Promise((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }
            if (0 === worker) {
                this.importer.Import_gltf(url, progress).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: 3,
                    state: 0,
                    args: {
                        url: url
                    },
                }).then(resolve).catch(reject);
            }
        });
    }
    Import_gltf_file(worker, file, progress) {
        return new Promise((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }
            if (0 === worker) {
                this.importer.Import_gltf_file(file, progress).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: 4,
                    state: 0,
                    args: {
                        file: file
                    },
                }).then(resolve).catch(reject);
            }
        });
    }
    Import_vtile_bd(worker, param, progress) {
        return new Promise((resolve, reject) => {
            if (this.closed) {
                reject("事务处理器已关闭！");
                return;
            }
            if (0 === worker) {
                this.importer.Import_vtile_bd(param.col, param.row, param.level).then(resolve).catch(reject);
            }
            else {
                this.PostMessage({
                    type: 5,
                    state: 0,
                    args: {
                        param
                    },
                }).then(resolve).catch(reject);
            }
        });
    }
    async Decode_dem(worker, url) {
        const buffer = await this.Fetch(url, null, "arrayBuffer");
        if (!buffer) {
            return null;
        }
        if (152 == buffer.byteLength) {
            return null;
        }
        const n = pako.inflate(buffer);
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
    PostMessage(info) {
        info.id = this.sendTick++;
        const slot = this.slot;
        if (0 === info.state) {
            const next_slot = this.slot === this.slots.length ? this.slot + 1 : this.slots[this.slot].slot;
            this.slots[slot] = info;
            this.slot = next_slot;
            info.slot = slot;
            info.state = 1;
        }
        if (this.worker) {
            this.worker.postMessage(info, info.transfer);
        }
        else {
            globalThis.postMessage(info, info.transfer);
        }
        return new Promise(function (resolve, reject) {
            info.resolve = resolve;
            info.reject = reject;
        });
    }
    OnMessage(info) {
        if (info.state == 1) {
            if (info.id !== this.recvTick) {
                this.Track("事务排号不一致: " + info.id + ", " + this.recvTick, 3);
            }
            if (info.type === 1) {
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
            else if (info.type == 2) {
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
            else if (info.type === 3) {
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
            else if (info.type === 4) {
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
            else if (info.type === 5) {
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
            else {
                info.args = "未知事务类型：" + info.type;
                info.state = -1;
                this.PostMessage(info);
            }
        }
        else if (info.state == 2) {
            this.slots[info.slot].resolve(info.args);
            this.slots[info.slot] = { slot: this.slot };
            this.slot = info.slot;
        }
        else {
            this.slots[info.slot].reject(info.args);
            this.slots[info.slot] = { slot: this.slot };
            this.slot = info.slot;
        }
        this.recvTick++;
    }
    Track(msg, ctrl) {
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
    async Fetch(input, init, type) {
        const res = await fetch(input, init);
        return await res[type]();
    }
    workerID;
    worker;
    slots;
    slot;
    sendTick;
    recvTick;
    closed;
    startTS;
    uid;
    webgl;
    kernelCode;
    kernel;
    env;
    internal;
    importer;
}
if (!globalThis.document) {
    new Miaoworker();
}
//# sourceMappingURL=worker.js.map