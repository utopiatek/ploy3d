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
        if (options.dazServ) {
            this.dazServ = options.dazServ;
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
        if (options.echarts) {
            this.echarts = options.echarts;
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
            CompileBranches: (g1, g2, g3, flags, topology, frontFace, cullMode) => {
                g1 = this.resources.MeshRenderer.GetInstanceByID(g1).layoutID;
                g2 = this.resources.Material.GetInstanceByID(g2).layoutID;
                return this.context.CreateRenderPipeline({
                    g1,
                    g2,
                    g3,
                    flags,
                    topology,
                    frontFace,
                    cullMode
                });
            },
            CreateBuffer: (type, size, offset) => {
                return this.device.CreateBuffer(type, size, offset, null);
            },
            UploadBuffer: (bufferID, cachePtr, offset, size) => {
                this.device.WriteBuffer(bufferID, offset, this.env.buffer, (cachePtr << 2) + offset, (size + 3) & ~3);
            },
            Update: (classid, id) => {
                if (classid == 51) {
                    this.resources.Animator.Update(id);
                }
            },
            Remove: (classid, id) => {
                if (classid == 51) {
                    const component = this.resources.Animator.GetInstanceByID(id);
                    if (component) {
                        component["Release"]();
                    }
                }
                else {
                    this.resources.Remove(classid, id);
                }
            },
            DrawPart: (g1, g2, pipeline, mesh, submesh, instanceCount, firstInstance, materialSlot) => {
                this.renderer["_queue"].DrawPart(g1, g2, pipeline, mesh, submesh, instanceCount, firstInstance, materialSlot);
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
        this.assembly = await (new Miaoverse.Assembly(this)).Init();
        if (!this.assembly) {
            throw "渲染管线装配器接口初始化失败！";
        }
        this.worker = await (new Miaoverse.Miaoworker(this)).Startup();
        if (!this.worker) {
            throw "多线程事务处理器启动失败！";
        }
        this.gis = await (new Miaoverse.Gis(this)).Init();
        if (!this.gis) {
            throw "GIS初始化失败！";
        }
        this.renderer2d = await (new Miaoverse.Renderer2D(this)).Init();
        if (!this.renderer2d) {
            throw "2D渲染器初始化失败！";
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
        const renderer2d = await this.renderer2d.Dispose();
        const gis = await this.gis.Dispose();
        const dior = await this.resources.Dioramas.Dispose();
        const worker = await this.worker.Shutdown();
        const assembly = await this.assembly.Dispose();
        const resources = await this.resources.Dispose();
        const renderer = await this.renderer.Dispose();
        const context = await this.context.Dispose();
        const device = await this.device.Dispose();
        const kernel = await this.kernel.Dispose();
        return {
            kernel,
        };
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
    get webgl() {
        return this.config.webgl;
    }
    startTS = Date.now();
    kernelUrl = "./lib/ploycloud.wasm";
    workerUrl = "./lib/ploycloud.worker.wasm";
    workerUrlJS = "./lib/ploycloud.worker.js";
    baseURI = document.baseURI;
    dazServ = ".";
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
    echarts;
    internal;
    env;
    kernel;
    device;
    context;
    renderer;
    assembly;
    resources;
    worker;
    gis;
    renderer2d;
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
        enable4k: false,
    };
}
export class PloyApp {
    constructor(engine) {
        this.engine = engine;
        console.log(this);
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
        this.Progress(0.51, "等待场景加载完成...");
        await this.InitScene((rate, msg) => {
            this.Progress(0.5 + 0.5 * rate, msg, true);
        });
        this.started = true;
        this.Progress(-1, "");
        this.engine.Track("开始启动事件系统");
        return this.InitEvent();
    }
    async Shutdown() {
        if (!this.started) {
            return;
        }
        this.engine.Track("即将退出程序");
        for (let type in this.events) {
            if (type == "keydown" || type == "keyup") {
                document.removeEventListener(type, this.events[type]);
            }
            else {
                this.ui_canvas.removeEventListener(type, this.events[type]);
            }
        }
        this.DrawFrame(2);
        await (new Promise((resolve, reject) => {
            this._waitClose = resolve;
        }));
        if (this._atmosphere) {
            this._atmosphere.mesh.Release();
            this._atmosphere.material.Release();
        }
        if (this._transformCtrl) {
        }
        const state = await this.engine.Shutdown();
        this.engine = null;
        this.started = false;
        this.sdl_window = null;
        this.sdl_canvas = null;
        this.ui_canvas = null;
        this.ui_ctx = null;
        this.event_listener = null;
        this._atmosphere = null;
        this._transformCtrl = null;
        this._loop2d = 0;
        this._loop3d = 0;
        this._draw3d = false;
        this._steps = 0;
        this._drawQueue = null;
        this._sleep = false;
        this._loopFunc = null;
        this._waitClose = null;
        this._fps = 0;
        this._fpsTime = 0;
        this._status = null;
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
    async CreateAtmosphere(scene) {
        const resources = this.engine.resources;
        const mesh = await resources.Mesh.Create({
            uuid: "",
            classid: 39,
            name: "atmosphere",
            label: "atmosphere",
            creater: {
                type: "sphere",
                sphere: {
                    radius: 6378137.0 + 8000.0,
                    widthSegments: 180,
                    heightSegments: 90,
                    phiStart: 0,
                    phiLength: Math.PI * 2,
                    thetaStart: 0,
                    thetaLength: Math.PI
                }
            }
        });
        const material = await resources.Material.Create({
            uuid: "",
            classid: 32,
            name: "atmosphere",
            label: "atmosphere",
            shader: "1-1-1.miaokit.builtins:/shader/atmosphere_ulit/17-14_atmosphere_ulit.json",
            flags: 1,
            properties: {
                textures: {
                    noiseTex: {
                        uri: "1-1-1.miaokit.builtins:/texture/25-3_noise2.png"
                    },
                    moonTex: {
                        uri: "1-1-1.miaokit.builtins:/texture/25-4_color2.jpg"
                    }
                },
                vectors: {}
            }
        });
        this._atmosphere = {
            mesh,
            material,
            draw_params: {
                flags: 0,
                layers: 0,
                userData: 0,
                castShadows: false,
                receiveShadows: false,
                frontFace: 0,
                cullMode: 2,
                mesh: mesh,
                materials: [
                    {
                        submesh: 0,
                        material: material
                    }
                ],
                instances: [
                    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                ]
            }
        };
        mesh.AddRef();
        material.AddRef();
        return this._atmosphere;
    }
    async CreateTransformCtrl(scene) {
        this._transformCtrl = new Miaoverse.TransformCtrl(this.engine);
        return this._transformCtrl.Build(scene);
    }
    async InitEvent() {
        if (!this.engine.config.web) {
            return PloyApp.SDL2_InitEvent(this);
        }
        return new Promise(async (resolve, reject) => {
            const events = ["keydown", "keyup", "click", "dblclick", "mousewheel", "wheel", "pointerout", "pointerup", "pointerdown", "pointermove", "contextmenu"];
            for (let type of events) {
                const listeners = this.event_listener[type] || (this.event_listener[type] = []);
                if (type == "keydown" || type == "keyup") {
                    this.events[type] = async (event) => {
                        for (let listener of listeners) {
                            await listener(event);
                        }
                    };
                    document.addEventListener(type, this.events[type]);
                }
                else {
                    this.events[type] = async (event) => {
                        for (let listener of listeners) {
                            await listener(event);
                        }
                    };
                    this.ui_canvas.addEventListener(type, this.events[type]);
                }
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
        if (this.engine.config.web) {
            let progress_bar = this._progress_bar;
            if (!progress_bar) {
                const coatPanel = document.getElementById("coat");
                const progressRate = document.getElementById("progressbar-rate");
                const progressTxt = document.getElementById("progressbar-txt");
                const progressMsg = document.getElementById("progressbar-msg");
                progress_bar = this._progress_bar = {
                    coatPanel,
                    progressRate,
                    progressTxt,
                    progressMsg
                };
            }
            if (rate == -1) {
                progress_bar.coatPanel.style.display = "none";
            }
            else {
                progress_bar.coatPanel.style.display = "block";
            }
            progress_bar.progressRate.style.width = "" + Math.floor(rate * 30) + "%";
            progress_bar.progressTxt.innerText = "" + Math.floor(rate * 100) + "%";
            progress_bar.progressMsg.innerText = msg;
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
        if (!this.started) {
            return false;
        }
        if (this._waitClose && !this._gpuRendering) {
            this._waitClose();
            this.started = false;
            return false;
        }
        if (!this._draw3d) {
            const flags = (this._loop2d ? 1 : 0) + (this._loop3d ? 2 : 0);
            if (flags) {
                if (!this.engine.device.Resize()) {
                    return false;
                }
                const gis = this.engine.gis;
                this.engine.env.Tick(gis.enable ? (gis.enable_terrain ? 2 : 1) : 0, [
                    gis["_originLL"][0], gis["_originLL"][1],
                    gis["_originMC"][0], gis["_originMC"][1]
                ]);
                this.Update(flags);
                if ((this._steps % 1800) == 0) {
                    this.engine.resources.GC();
                }
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
                    this.engine.renderer2d.BeginFrame();
                    this.Draw2D();
                    this.engine.renderer2d.EndFrame();
                }
                this._loop3d--;
                this._gpuRendering = true;
                this.Draw3D();
                this._draw3d = false;
                this._drawQueue.End();
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
    }
    engine;
    started;
    sdl_window;
    sdl_canvas;
    ui_canvas;
    ui_ctx;
    event_listener = {};
    events = {};
    _atmosphere;
    _transformCtrl;
    _loop2d = 0;
    _loop3d = 0;
    _draw3d = false;
    _steps = 0;
    _drawQueue = null;
    _gpuRendering = false;
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
export class SimpleSignal {
    constructor(generator, cfg) {
        this._signal = new Signal();
        this._data = null;
        this._generator = generator;
        this._generatorParam = cfg;
    }
    AddListener(listener) {
        this._signal.add(listener, this);
    }
    RemoveListener(listener) {
        this._signal.remove(listener, this);
    }
    async Dispatch(data) {
        if (data === undefined && this._generator) {
            data = await this._generator(this._generatorParam);
        }
        const old = this._data;
        this._data = data;
        this._signal.dispatch(data, old);
    }
    Destroy() {
        this._signal.dispose();
        this._signal = undefined;
        this._data = undefined;
        this._generator = undefined;
        this._generatorParam = undefined;
    }
    get data() {
        return this._data;
    }
    get generatorParam() {
        return this._generatorParam;
    }
    set generatorParam(param) {
        this._generatorParam = param;
    }
    _signal;
    _data;
    _generator;
    _generatorParam;
}
export class Signal {
    constructor() {
        const self = this;
        this.dispatch = function () {
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }
    has(listener, context) {
        return this._indexOfListener(listener, context) !== -1;
    }
    add(listener, context, priority = 0) {
        if (typeof listener !== 'function') {
            throw new Error('listener is a required param of add() and should be a Function.');
        }
        return this._registerListener(listener, false, context, priority);
    }
    addOnce(listener, context, priority = 0) {
        if (typeof listener !== 'function') {
            throw new Error('listener is a required param of addOnce() and should be a Function.');
        }
        return this._registerListener(listener, true, context, priority);
    }
    remove(listener, context) {
        if (typeof listener !== 'function') {
            throw new Error('listener is a required param of remove() and should be a Function.');
        }
        const i = this._indexOfListener(listener, context);
        if (i !== -1) {
            this._bindings[i].destroy();
            this._bindings.splice(i, 1);
        }
        return listener;
    }
    removeAll() {
        let n = this._bindings.length;
        while (n--) {
            this._bindings[n].destroy();
        }
        this._bindings.length = 0;
    }
    dispose() {
        this.removeAll();
        delete this._bindings;
        delete this._prevParams;
    }
    dispatch(...params) {
        if (!this._active) {
            return;
        }
        const paramsArr = Array.prototype.slice.call(arguments);
        let n = this._bindings.length;
        if (this._memorize) {
            this._prevParams = paramsArr;
        }
        if (!n) {
            return;
        }
        const bindings = this._bindings.slice();
        this._shouldPropagate = true;
        do {
            n--;
        } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
    }
    halt() {
        this._shouldPropagate = false;
    }
    forget() {
        this._prevParams = null;
    }
    _registerListener(listener, isOnce, context, priority = 0) {
        const prevIndex = this._indexOfListener(listener, context);
        let binding = undefined;
        if (prevIndex !== -1) {
            binding = this._bindings[prevIndex];
            if (binding.isOnce !== isOnce) {
                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
            }
        }
        else {
            binding = new SignalBinding(this, listener, isOnce, context, priority);
            this._addBinding(binding);
        }
        if (this._memorize && this._prevParams) {
            binding.execute(this._prevParams);
        }
        return binding;
    }
    _indexOfListener(listener, context) {
        let n = this._bindings.length;
        let cur = undefined;
        while (n--) {
            cur = this._bindings[n];
            if (cur._listener === listener && cur.context === context) {
                return n;
            }
        }
        return -1;
    }
    _addBinding(binding) {
        let n = this._bindings.length;
        do {
            --n;
        } while (this._bindings[n] && binding.priority <= this._bindings[n].priority);
        this._bindings.splice(n + 1, 0, binding);
    }
    _active = true;
    _shouldPropagate = true;
    _memorize = false;
    _prevParams = null;
    _bindings = [];
}
class SignalBinding {
    constructor(signal, listener, isOnce, context, priority = 0) {
        this._signal = signal;
        this._listener = listener;
        this._isOnce = isOnce;
        this._context = context;
        this._priority = priority || 0;
    }
    execute(paramsArr) {
        let handlerReturn = undefined;
        if (this._active && !!this._listener) {
            const params = this._params ? this._params.concat(paramsArr) : paramsArr;
            handlerReturn = this._listener.apply(this._context, params);
            if (this._isOnce) {
                this.detach();
            }
        }
        return handlerReturn;
    }
    destroy() {
        delete this._signal;
        delete this._listener;
        delete this._context;
    }
    detach() {
        return this.isBound ? this._signal.remove(this._listener, this._context) : null;
    }
    get isBound() {
        return (!!this._signal && !!this._listener);
    }
    get isOnce() {
        return this._isOnce;
    }
    get priority() {
        return this._priority;
    }
    _active = true;
    _params = null;
    _signal;
    _listener;
    _isOnce;
    _context;
    _priority;
}
export function Start(instance, appid = "default", title = "PLOY3D引擎", width = 1920, height = 1080) {
    const app_class = instance.appLut[appid];
    if (!app_class) {
        throw "查找不到指定的应用：" + appid;
    }
    instance.app = new app_class(instance);
    return instance.app.Startup(title, width, height);
}
