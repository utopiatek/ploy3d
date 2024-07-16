import * as Miaoverse from "./mod.js";
export class Ploy3D {
    constructor(options) {
        if (options.startTS) {
            this.startTS = options.startTS;
        }
        if (options.kernelUrl) {
            this.kernelUrl = options.kernelUrl;
        }
        if (options.workerUrl) {
            this.workerUrl = options.workerUrl;
        }
        if (options.workerUrlJS) {
            this.workerUrlJS = options.workerUrlJS;
        }
        if (options.CreateCanvas) {
            this.CreateCanvas = options.CreateCanvas;
        }
        if (options.MeasureText) {
            this.MeasureText = options.MeasureText;
        }
        if (options.Progress) {
            this.Progress = options.Progress;
        }
        if (options.Track) {
            this.Track = options.Track;
        }
        if (options.MakeUrl) {
            this.MakeUrl = options.MakeUrl;
        }
        if (options.Request) {
            this.Request = options.Request;
        }
        if (options.Fetch) {
            this.Fetch = options.Fetch;
        }
        if (options.LoadImage) {
            this.LoadImage = options.LoadImage;
        }
        if (options.rootFS) {
            if (typeof options.rootFS != "string") {
                this.localFS = new Miaoverse.FileStorage(this, options.rootFS);
            }
        }
        if (options.appLut) {
            this.appLut = options.appLut;
        }
        if (options.sdl2) {
            this.sdl2 = options.sdl2;
        }
        if (options.canvaskit) {
            this.canvaskit = options.canvaskit;
        }
        if (options.echarts) {
            this.echarts = options.echarts;
        }
        if (options.JSZip) {
            this.JSZip = options.JSZip;
        }
        if (options.config) {
            this.config = {
                ...this.config,
                ...options.config
            };
        }
        if (this.config.web) {
            if (!navigator.gpu) {
                this.config.webgl = true;
            }
        }
        else {
            this.config.alphaMode = "opaque";
            this.config.powerPreference = "high-performance";
            this.config.webgl = false;
            this.config.mobile = false;
        }
        const preloader = async () => {
            this.Track("开始预加载引擎资源");
            this.kernelCode = await this.Fetch(this.kernelUrl, null, "arrayBuffer");
            this.Track("完成预加载引擎资源");
        };
        this.appLut["default"] = PloyApp;
        this.preloader = new Promise((resolve, reject) => {
            preloader().then(resolve).catch(reject);
        });
    }
    CreateCanvas(width, height) {
        const ele = document.createElement("canvas");
        ele.width = width;
        ele.height = height;
        return ele;
    }
    MeasureText(text, ctx) {
        const metrics = ctx.measureText(text);
        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + Math.abs(metrics.actualBoundingBoxDescent);
        return { width, height, actualBoundingBoxAscent: metrics.actualBoundingBoxAscent, actualBoundingBoxDescent: metrics.actualBoundingBoxDescent };
    }
    Progress(rate, msg, log) {
        this.app.Progress(rate, msg, log);
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
    MakeUrl(path) {
        return path;
    }
    async Request(method, url, type, body, content_type, onprogress) {
        url = this.MakeUrl(url);
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            if (onprogress) {
                xhr.onprogress = function (e) {
                    onprogress(e);
                };
            }
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                reject(e);
            };
            xhr.responseType = type;
            xhr.open(method, url);
            if (content_type) {
                xhr.setRequestHeader("Content-type", content_type);
            }
            xhr.send(body);
        });
    }
    async Fetch(input, init, type) {
        input = this.MakeUrl(input);
        const res = await fetch(input, init);
        return await res[type]();
    }
    async LoadImage(src, crossOrigin) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.onerror = (e) => {
                reject(e);
            };
            if (crossOrigin) {
                image.crossOrigin = crossOrigin;
            }
            image.src = src;
        });
    }
    async Startup(progress) {
        progress(0.1, "准备启动引擎");
        await this.preloader;
        progress(0.3, "开始启动引擎");
        this.kernel = await (new Miaoverse.Kernel(this)).Init({
            CreateBuffer: (type, size, offset) => {
                return this.device.CreateBuffer(type, size, offset, null);
            },
            UploadBuffer: (bufferID, cachePtr, offset, size) => {
                this.device.WriteBuffer(bufferID, offset, this.env.buffer, (cachePtr << 2) + offset, (size + 3) & ~3);
            },
            Release: (classid, id) => {
                return 0;
            },
        });
        if (!this.kernel) {
            throw "内核接口初始化失败！";
        }
        this.device = await (new Miaoverse.Device(this)).Init();
        if (!this.device) {
            throw "GPU虚拟设备接口初始化失败！";
        }
        this.context = await (new Miaoverse.Context(this)).Init();
        if (!this.context) {
            throw "渲染设备上下文接口初始化失败！";
        }
        this.renderer = await (new Miaoverse.Renderer(this)).Init();
        if (!this.renderer) {
            throw "渲染器接口初始化失败！";
        }
        this.resources = await (new Miaoverse.Resources(this)).Init();
        if (!this.resources) {
            throw "资源管理器初始化失败！";
        }
        this.ui = await (new Miaoverse.CalynUI(this)).Init();
        if (!this.ui) {
            throw "UI系统初始化失败！";
        }
        this.started = true;
        progress(1.0, "完成启动引擎");
    }
    async Shutdown() {
        this.Track("即将关闭引擎，以下打印未完成释放的资源和引擎终末状态：");
        this.started = false;
        return {};
    }
    Vector3(values) {
        return new Miaoverse.Vector3(this.resources.VMath, values);
    }
    Quaternion(values) {
        return new Miaoverse.Quaternion(this.resources.VMath, values);
    }
    Matrix4x4(values) {
        return new Miaoverse.Matrix4x4(this.resources.VMath, values);
    }
    startTS = Date.now();
    kernelUrl = "./lib/ploycloud.wasm";
    workerUrl = "./lib/ploycloud.worker.wasm";
    workerUrlJS = "./lib/ploycloud.worker.js";
    uid = 1;
    started = false;
    width = 1920;
    height = 1080;
    ctf = 0;
    preloader;
    kernelCode;
    localFS;
    appLut = {};
    app;
    sdl2;
    canvaskit;
    echarts;
    JSZip;
    internal;
    env;
    kernel;
    device;
    context;
    renderer;
    resources;
    ui;
    config = {
        surface: null,
        devicePixelRatio: 1,
        initWidth: 1920,
        initHeight: 1080,
        colorSpace: "srgb",
        alphaMode: "opaque",
        powerPreference: "high-performance",
        web: false,
        webgl: false,
        mobile: false,
    };
}
export class PloyApp {
    constructor(engine) {
        this.engine = engine;
    }
    async Startup(title, width, height) {
        this.engine.Track("开始启动主程序");
        await this.InitWindow(title, width, height, (rate, msg) => {
            const config = this.engine.config;
            if (!config.surface) {
                if (config.web) {
                    config.surface = document.getElementById("canvas3d");
                    config.devicePixelRatio = globalThis.devicePixelRatio || 1;
                    config.initWidth = config.surface.clientWidth * config.devicePixelRatio;
                    config.initHeight = config.surface.clientHeight * config.devicePixelRatio;
                    config.surface.width = config.initWidth;
                    config.surface.height = config.initHeight;
                }
                else {
                    config.surface = null;
                    config.devicePixelRatio = globalThis.devicePixelRatio || 1;
                    config.initWidth = width * config.devicePixelRatio;
                    config.initHeight = height * config.devicePixelRatio;
                }
            }
            this.Progress(0.1 * rate, msg, true);
        });
        await this.InitEngine((rate, msg) => {
            this.Progress(0.1 + 0.3 * rate, msg, true);
        });
        await this.InitUI((rate, msg) => {
            this.Progress(0.4 + 0.1 * rate, msg, true);
        });
        await this.InitScene((rate, msg) => {
            this.Progress(0.5 + 0.5 * rate, msg, true);
        });
        this.started = true;
        this.engine.Track("开始启动事件系统");
        return this.InitEvent();
    }
    async Shutdown() {
        if (!this.started) {
            return;
        }
        this.started = false;
        this.engine.Track("即将退出程序");
        const state = await this.engine.Shutdown();
        console.log(state);
        console.log("已退出程序");
    }
    async InitWindow(title, width, height, progress) {
        if (!this.engine.config.web) {
            await PloyApp.SDL2_InitWindow(this, title, width, height, progress);
        }
        progress(1.0, "完成窗口创建");
        return true;
    }
    async InitEngine(progress) {
        await this.engine.Startup(progress);
        if (!this.engine.config.web) {
            await PloyApp.CK_InitUI(this);
        }
        else if (!this.ui_canvas) {
            this.ui_canvas = document.getElementById("canvas2d");
            this.ui_canvas.width = this.engine.config.surface.clientWidth;
            this.ui_canvas.height = this.engine.config.surface.clientHeight;
            this.ui_ctx = this.ui_canvas.getContext("2d");
        }
        progress(1.0, "完成引擎初始化");
        return true;
    }
    async InitUI(progress) {
        progress(1.0, "完成UI渲染");
        return true;
    }
    async InitScene(progress) {
        this.DrawFrame(1);
        progress(1.0, "完成场景初始化");
        return true;
    }
    async InitEvent() {
        if (!this.engine.config.web) {
            return PloyApp.SDL2_InitEvent(this);
        }
        return new Promise(async (resolve, reject) => {
            const events = ["click", "dblclick", "mousewheel", "wheel", "pointerout", "pointerup", "pointerdown", "pointermove", "contextmenu"];
            for (let type of events) {
                const listeners = this.event_listener[type] || (this.event_listener[type] = []);
                this.ui_canvas.addEventListener(type, async (event) => {
                    for (let listener of listeners) {
                        await listener(event);
                    }
                });
            }
            resolve();
        });
    }
    AddEventListener(type, listener) {
        if (!this.event_listener[type]) {
            this.event_listener[type] = [];
        }
        this.event_listener[type].push(listener);
    }
    Progress(rate, msg, log) {
        if (log) {
            this.engine.Track(rate.toFixed(2) + " " + msg);
        }
    }
    DrawFrame(count, count2d) {
        this._loop2d = Math.max(this._loop2d, count);
        this._loop3d = Math.max(this._loop3d, count);
        if (count2d) {
            this._loop2d = Math.max(this._loop2d, count2d);
        }
        this.Awake();
    }
    Awake() {
        if (this._loopFunc) {
            if (this._sleep && (this._loop2d || this._loop3d)) {
                this._sleep = false;
                if (!!this.engine.config.web) {
                    requestAnimationFrame(this._loopFunc);
                }
            }
            return;
        }
        this._sleep = false;
        this._loopFunc = () => {
            if (!this.engine.config.web) {
                PloyApp.SDL2_SolveEvent();
            }
            if (!this._sleep && !this.Step()) {
                this._sleep = true;
            }
            if (!this._sleep || !this.engine.config.web) {
                requestAnimationFrame(this._loopFunc);
            }
        };
        requestAnimationFrame(this._loopFunc);
    }
    Step() {
        if (!this._draw3d) {
            if (this._waitClose) {
                this._waitClose();
                return false;
            }
            const flags = (this._loop2d ? 1 : 0) + (this._loop3d ? 2 : 0);
            if (flags) {
                if (!this.engine.device.Resize()) {
                    return false;
                }
                this.engine.env.Tick(0, [0, 0, 0, 0]);
                this.Update(flags);
                if ((++this._steps % 60) == 0) {
                    this.Status();
                }
                if (this._loop3d) {
                    this._draw3d = true;
                    this.engine.renderer.GetQueue((queue) => {
                        this._drawQueue = queue;
                        this.Awake();
                    });
                    if (!this._drawQueue) {
                        return false;
                    }
                }
            }
        }
        if (this._draw3d) {
            if (this._drawQueue) {
                if (this._loop2d) {
                    this._loop2d--;
                    this.Draw2D();
                }
                this._loop3d--;
                this.Draw3D();
                this._draw3d = false;
                this._drawQueue = null;
            }
        }
        else if (this._loop2d) {
            this._loop2d--;
            this.Draw2D();
        }
        return (this._loop2d || this._loop3d) > 0;
    }
    Update(flags) {
    }
    Draw2D() {
    }
    Draw3D() {
    }
    Status() {
        const curtime = this.engine.env.frameTS;
        this._fps = 60000 / (curtime - this._fpsTime);
        this._fpsTime = curtime;
        this.engine.Track("fps: " + this._fps);
    }
    engine;
    started;
    sdl_window;
    sdl_canvas;
    ui_canvas;
    ui_ctx;
    event_listener = {};
    _loop2d = 0;
    _loop3d = 0;
    _draw3d = false;
    _steps = 0;
    _drawQueue = null;
    _sleep = false;
    _loopFunc = null;
    _waitClose = null;
    _fps = 0;
    _fpsTime = 0;
    _status = null;
    static SDL2_InitWindow;
    static SDL2_InitEvent;
    static SDL2_SolveEvent;
    static CK_InitUI;
}
export function Start(instance, appid = "default", title = "PLOY3D引擎", width = 1920, height = 1080) {
    const app_class = instance.appLut[appid];
    if (!app_class) {
        throw "查找不到指定的应用：" + appid;
    }
    instance.app = new app_class(instance);
    return instance.app.Startup(title, width, height);
}
//# sourceMappingURL=index.js.map