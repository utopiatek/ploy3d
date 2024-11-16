import * as Miaoverse from "./mod.js"

/** 引擎模块。 */
export class Ploy3D {
    /**
     * 构造函数。
     * @param options 引擎模块实例选项。
     */
    public constructor(options: {
        /** 启动时间戳。 */
        startTS?: number;
        /** 内核模块URL。 */
        kernelUrl?: string;
        /** 线程模块URL。 */
        workerUrl?: string;
        /** 线程模块URL。 */
        workerUrlJS?: string;
        /** DAZ资源服务地址。 */
        dazServ?: string;
        /** 自定义主进度条显示控制。 */
        Progress?: Ploy3D["Progress"];
        /** 自定义日志打印方法。 */
        Track?: Ploy3D["Track"];
        /** 根据路径拼接出用于请求数据的URL。 */
        MakeUrl?: Ploy3D["MakeUrl"];
        /** 自定义网络请求方法。 */
        Request?: Ploy3D["Request"];
        /** 自定义网络请求方法。 */
        Fetch?: Ploy3D["Fetch"];
        /** 自定义图像元素加载器。 */
        LoadImage?: Ploy3D["LoadImage"];
        /** 自定义Canvas元素创建方法。 */
        CreateCanvas?: Ploy3D["CreateCanvas"];
        /** 自定义文本宽高计算方法。 */
        MeasureText?: Ploy3D["MeasureText"];
        /** 本地文件系统根路径。 */
        rootFS: string | FileSystemDirectoryHandle;
        /** 应用查找表。 */
        appLut?: Ploy3D["appLut"];
        /** SDL2模块名字空间。 */
        sdl2?: Ploy3D["sdl2"];
        /** 导入ECharts图表库。 */
        echarts?: Ploy3D["echarts"];
        /** 引擎实例配置。 */
        config?: Ploy3D["config"];
    }) {
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
                this.localFS = new Miaoverse.FileStorage(this, options.rootFS)
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
            if (!(navigator as any).gpu) {
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

    /**
     * 创建Canvas元素。
     * @param width 宽度。
     * @param height 高度。
     * @returns 返回Canvas元素。
     */
    public CreateCanvas(width: number, height: number) {
        const ele = document.createElement("canvas");

        ele.width = width;
        ele.height = height;

        return ele;
    }

    /**
     * 计算字符串宽高。
     * @param text 字符串。
     * @param ctx 渲染上下文。
     * @returns 返回宽高。
     */
    public MeasureText(text: string, ctx: CanvasRenderingContext2D) {
        const metrics = ctx.measureText(text);
        const width = metrics.width;
        // 参数actualBoundingBoxAscent表示从textBaseline属性指示的水平线到用于渲染文本的边界矩形顶部的距离
        // 参数actualBoundingBoxDescent表示从textBaseline属性指示的水平线到用于渲染文本的边界矩形底部的距离
        const height = metrics.actualBoundingBoxAscent + Math.abs(metrics.actualBoundingBoxDescent);

        return { width, height, actualBoundingBoxAscent: metrics.actualBoundingBoxAscent, actualBoundingBoxDescent: metrics.actualBoundingBoxDescent };
    }

    /**
     * 主进度条显示控制。
     * @param rate 进度（-1表示隐藏进度条）。
     * @param msg 进度提示。
     * @param log 是否在控制台打印。
     */
    public Progress(rate: number, msg: string, log?: boolean) {
        this.app.Progress(rate, msg, log);
    }

    /**
     * 日志打印方法。
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
     * 根据路径拼接出用于请求数据的URL。
     * @param path 路径。
     * @returns 返回URL。
     */
    public MakeUrl(path: string) {
        return path;
    }

    /**
     * 网络请求方法。
     * @param method 请求类型。
     * @param url 请求路径。
     * @param type 请求数据类型。
     * @param body 表单数据。
     * @param content_type 表单数据类型。
     * @param onprogress 进度刷新函数。
     * @returns 返回指定类型数据。
     */
    public async Request<T>(
        method: "GET" | "POST",
        url: string,
        type: "arraybuffer" | "blob" | "document" | "json" | "text",
        body: Document | XMLHttpRequestBodyInit,
        content_type?: string,
        onprogress?: (rate: number) => void) {

        url = this.MakeUrl(url);

        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();

            if (onprogress) {
                xhr.onprogress = function (e) {
                    onprogress(e as any);
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

    /** 
     * 网络请求方法。
     * @param input 请求路径。
     * @param init 请求参数。
     * @param type 请求数据类型。
     * @returns 返回指定类型数据。
     */
    public async Fetch<T>(input: string, init: RequestInit, type: "arrayBuffer" | "blob" | "formData" | "json" | "text") {
        input = this.MakeUrl(input);

        const res = await fetch(input, init);

        return await res[type]() as T;
    }

    /**
     * 加载图像元素。
     * @param src 图片URL。
     * @param crossOrigin 允许跨域资源。
     * @returns 返回图像元素。
     */
    public async LoadImage(src: string, crossOrigin?: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
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

    /**
     * 启动引擎实例。
     * @param progress - 进度刷新函数。
     */
    public async Startup(progress: (rate: number, msg: string) => void) {
        progress(0.1, "准备启动引擎");

        await this.preloader;

        progress(0.3, "开始启动引擎");

        this.kernel = await (new Miaoverse.Kernel(this)).Init({
            CompileBranches: (g1: number, g2: number, g3: number, flags: number, topology: number, frontFace: number, cullMode: number) => {
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
            CreateBuffer: (type: Miaoverse.CLASSID, size: number, offset: number) => {
                return this.device.CreateBuffer(type, size, offset, null);
            },
            UploadBuffer: (bufferID: number, cachePtr: Miaoverse.io_ptr, offset: number, size: number) => {
                this.device.WriteBuffer(
                    bufferID,                           // 缓存实例ID
                    offset,                             // 缓存写入偏移
                    this.env.buffer,                    // 数据源
                    (cachePtr << 2) + offset,           // 数据源偏移
                    (size + 3) & ~3);
            },
            Update: (classid: number, id: number) => {
                if (classid == Miaoverse.CLASSID.ASSET_COMPONENT_ANIMATOR) {
                    this.resources.Animator.Update(id);
                }
            },
            Remove: (classid: number, id: number) => {
                if (classid == Miaoverse.CLASSID.ASSET_COMPONENT_ANIMATOR) {
                    const component = this.resources.Animator.GetInstanceByID(id);
                    if (component) {
                        component["Release"]();
                    }
                }
                else {
                    this.resources.Remove(classid, id);
                }
            },
            DrawPart: (g1: number, g2: number, pipeline: number, mesh: number, submesh: number, instanceCount: number, firstInstance: number, materialSlot: number) => {
                this.renderer["_queue"].DrawPart(g1, g2, pipeline, mesh, submesh, instanceCount, firstInstance, materialSlot);
            },
        });
        if (!this.kernel) {
            throw "内核接口初始化失败！"
        }

        this.device = await (new Miaoverse.Device(this)).Init();
        if (!this.device) {
            throw "GPU虚拟设备接口初始化失败！"
        }

        this.context = await (new Miaoverse.Context(this)).Init();
        if (!this.context) {
            throw "渲染设备上下文接口初始化失败！"
        }

        this.renderer = await (new Miaoverse.Renderer(this)).Init();
        if (!this.renderer) {
            throw "渲染器接口初始化失败！"
        }

        this.resources = await (new Miaoverse.Resources(this)).Init();
        if (!this.resources) {
            throw "资源管理器初始化失败！"
        }

        this.assembly = await (new Miaoverse.Assembly(this)).Init();
        if (!this.assembly) {
            throw "渲染管线装配器接口初始化失败！"
        }

        this.worker = await (new Miaoverse.Miaoworker(this)).Startup();
        if (!this.worker) {
            throw "多线程事务处理器启动失败！"
        }

        this.gis = await (new Miaoverse.Gis(this)).Init();
        if (!this.gis) {
            throw "GIS初始化失败！"
        }

        this.renderer2d = await (new Miaoverse.Renderer2D(this)).Init();
        if (!this.renderer2d) {
            throw "2D渲染器初始化失败！"
        }

        this.ui = await (new Miaoverse.CalynUI(this)).Init();
        if (!this.ui) {
            throw "UI系统初始化失败！"
        }

        this.started = true;

        progress(1.0, "完成启动引擎");
    }

    /** 
     * 关闭引擎实例。
     */
    public async Shutdown() {
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

    /**
     * 构造三维向量。
     * @param values 三维向量值。
     * @returns 返回三维向量。
     */
    public Vector3(values: ArrayLike<number>): Miaoverse.Vector3 {
        return new Miaoverse.Vector3(this.resources.VMath, values);
    }

    /**
     * 构造四元数。
     * @param values 四元数值。
     * @returns 返回四元数。
     */
    public Quaternion(values: ArrayLike<number>): Miaoverse.Quaternion {
        return new Miaoverse.Quaternion(this.resources.VMath, values);
    }

    /**
     * 构造四阶矩阵。
     * @param values 矩阵值。
     * @returns 返回四阶矩阵。
     */
    public Matrix4x4(values: ArrayLike<number>): Miaoverse.Matrix4x4 {
        return new Miaoverse.Matrix4x4(this.resources.VMath, values);
    }

    /** 是否使用的是WebGL图形API*/
    public get webgl() {
        return this.config.webgl;
    }

    /** 引擎启动时间戳。 */
    public startTS = Date.now();
    /** 内核模块URL。 */
    public kernelUrl = "./lib/ploycloud.wasm";
    /** 线程模块URL。 */
    public workerUrl = "./lib/ploycloud.worker.wasm";
    /** 线程模块URL。 */
    public workerUrlJS = "./lib/ploycloud.worker.js";
    /** 根路径。 */
    public baseURI = document.baseURI;
    /** DAZ资源服务地址。 */
    public dazServ = ".";

    /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
    public uid = 1;
    /** 引擎是否已启动。 */
    public started = false;
    /** 渲染目标宽度。 */
    public width = 1920;
    /** 渲染目标高度。 */
    public height = 1080;
    /** 压缩贴图支持标志集：0-不支持，1-s3tc，2-etc，4-astc。 */
    public ctf = 0;

    /** 资源预加载器。 */
    public preloader: Promise<void>;
    /** 内核代码。 */
    public kernelCode: ArrayBuffer;

    /** 本地文件系统。 */
    public localFS: Miaoverse.FileStorage;
    /** 应用查找表。 */
    public appLut: Record<string, (new (engine: Ploy3D) => PloyApp)> = {};
    /** 当前应用实例。 */
    public app: PloyApp;

    /** SDL2模块名字空间。 */
    public sdl2: typeof Miaoverse.sdl2;
    /** ECharts模块名字空间。 */
    public echarts: typeof Miaoverse.echarts;

    /** 内核接口。 */
    public internal: Miaoverse.Internal;
    /** 共享数据环境。 */
    public env: Miaoverse.SharedENV;
    /** 内核管理器。 */
    public kernel: Miaoverse.Kernel;
    /** GPU虚拟设备接口。 */
    public device: Miaoverse.Device;
    /** 渲染设备上下文接口。 */
    public context: Miaoverse.Context;
    /** 渲染器。 */
    public renderer: Miaoverse.Renderer;
    /** 渲染管线装配器。 */
    public assembly: Miaoverse.Assembly;
    /** 资源管理器。 */
    public resources: Miaoverse.Resources;
    /** 多线程事务处理器。 */
    public worker: Miaoverse.Miaoworker;
    /** GIS系统。 */
    public gis: Miaoverse.Gis;
    /** 2D渲染器接口。 */
    public renderer2d: Miaoverse.Renderer2D;
    /** CalynUI系统。 */
    public ui: Miaoverse.CalynUI;

    /** 引擎配置。 */
    public config = {
        /** 画布，用于创建默认交换链。 */
        surface: null as (HTMLCanvasElement | Deno.UnsafeWindowSurface),
        /** 画布物理像素/设备独立像素比率。 */
        devicePixelRatio: 1,
        /** 画布初始宽度。 */
        initWidth: 1920,
        /** 画布初始高度。 */
        initHeight: 1080,

        /** 画布色彩空间类型。 */
        colorSpace: "srgb" as ("srgb"),
        /** 画布混合模式。 */
        alphaMode: "opaque" as ("opaque" | "premultiplied"),
        /** 引擎选用低功耗还是高性能的显卡。 */
        powerPreference: "high-performance" as ("low-power" | "high-performance"),

        /** 是否为Web平台。 */
        web: false,
        /** 是否使用WebGL。 */
        webgl: false,
        /** 是否是移动端。 */
        mobile: false,
        /** 是否启用4K支持。 */
        enable4k: false,
    };
}

/** 应用基类。 */
export class PloyApp {
    /**
     * 构造函数。
     * @param engine 引擎实例。
     */
    public constructor(engine: Ploy3D) {
        this.engine = engine;
        console.log(this);
    }

    /**
     * 启动主程序。
     * @param title 主窗口标题。
     * @param width 主窗口宽度。
     * @param height 主窗口高度。
     * @returns 返回事件协程。
     */
    public async Startup(title: string, width: number, height: number) {

        this.engine.Track("开始启动主程序");

        await this.InitWindow(title, width, height, (rate, msg) => {
            const config = this.engine.config;

            if (!config.surface) {
                if (config.web) {
                    config.surface = document.getElementById("canvas3d") as HTMLCanvasElement;
                    config.devicePixelRatio = globalThis.devicePixelRatio || 1;
                    config.initWidth = config.surface.clientWidth * config.devicePixelRatio;
                    config.initHeight = config.surface.clientHeight * config.devicePixelRatio;

                    config.surface.width = config.initWidth;
                    config.surface.height = config.initHeight;
                }
                else {
                    // 获取GPU适配器后才能获取SDL2窗口表面，这应该是DENO的一个BUG
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

    /**
     * 关闭主程序。
     */
    public async Shutdown() {
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

        await (new Promise<void>((resolve, reject) => {
            this._waitClose = resolve;
        }));

        if (this._atmosphere) {
            this._atmosphere.mesh.Release();
            this._atmosphere.material.Release();
        }

        if (this._transformCtrl) {
            // 跟随场景销毁 ...
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

    /**
     * 初始化窗口。
     * @param title 主窗口标题。
     * @param width 主窗口宽度。
     * @param height 主窗口高度。
     * @param progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    public async InitWindow(title: string, width: number, height: number, progress: Ploy3D["Progress"]) {
        if (!this.engine.config.web) {
            await PloyApp.SDL2_InitWindow(this, title, width, height, progress);
        }

        progress(1.0, "完成窗口创建");

        return true;
    }

    /**
     * 初始化引擎。
     * @param {Parameters<Engine["Startup"]>[0]} progress - 进度刷新函数。
     * @returns 是否初始化成功。
     */
    public async InitEngine(progress: Ploy3D["Progress"]) {

        await this.engine.Startup(progress);

        if (!this.engine.config.web) {
            await PloyApp.CK_InitUI(this);
        }
        else if (!this.ui_canvas) {
            this.ui_canvas = document.getElementById("canvas2d") as HTMLCanvasElement;

            this.ui_canvas.width = (this.engine.config.surface as HTMLCanvasElement).clientWidth;
            this.ui_canvas.height = (this.engine.config.surface as HTMLCanvasElement).clientHeight;

            this.ui_ctx = this.ui_canvas.getContext("2d");
        }

        progress(1.0, "完成引擎初始化");

        return true;
    }

    /**
     * 初始化UI。
     * @param progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    public async InitUI(progress: Ploy3D["Progress"]) {

        progress(1.0, "完成UI渲染");

        return true;
    }

    /**
     * 初始化场景。
     * @param {Parameters<Engine["Startup"]>[0]} progress - 进度刷新函数。
     * @returns 是否初始化成功。
     */
    public async InitScene(progress: Ploy3D["Progress"]) {
        // 以默认方法配置并运行业务应用
        // 该默认方法创建并激活了一个空白场景，并将鼠标事件关联到场景自带相机上，使用默认的相机控制逻辑
        // 用户可参考文档自定义实现该方法
        // Engine.scenes.Run();

        this.DrawFrame(1);

        progress(1.0, "完成场景初始化");

        return true;
    }

    /**
     * 创建地球大气层对象。
     * @param scene 场景实例。
     * @returns 返回地球大气层相关资源。
     */
    public async CreateAtmosphere(scene: Miaoverse.Scene) {
        const resources = this.engine.resources;

        const mesh = await resources.Mesh.Create({
            uuid: "",
            classid: Miaoverse.CLASSID.ASSET_MESH,
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
            classid: Miaoverse.CLASSID.ASSET_MATERIAL,
            name: "atmosphere",
            label: "atmosphere",

            shader: "1-1-1.miaokit.builtins:/shader/atmosphere_ulit/17-14_atmosphere_ulit.json",
            flags: Miaoverse.RENDER_FLAGS.ATTRIBUTES0,
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

    /**
     * 创建变换组件控制器工具。
     * @param scene 场景实例。
     * @returns 返回变换组件控制器工具。
     */
    public async CreateTransformCtrl(scene: Miaoverse.Scene) {
        this._transformCtrl = new Miaoverse.TransformCtrl(this.engine);
        return this._transformCtrl.Build(scene);
    }

    /**
     * 初始化事件系统。
     * @returns 返回事件协程。
     */
    public async InitEvent() {
        if (!this.engine.config.web) {
            return PloyApp.SDL2_InitEvent(this);
        }

        return new Promise<void>(async (resolve, reject) => {
            const events = ["keydown", "keyup", "click", "dblclick", "mousewheel", "wheel", "pointerout", "pointerup", "pointerdown", "pointermove", "contextmenu"];

            for (let type of events) {
                const listeners = this.event_listener[type] || (this.event_listener[type] = []);

                if (type == "keydown" || type == "keyup") {
                    this.events[type] = async (event: any) => {
                        for (let listener of listeners) {
                            await listener(event);
                        }
                    };

                    document.addEventListener(type, this.events[type]);
                }
                else {
                    this.events[type] = async (event: any) => {
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

    /**
     * 注册事件监听器。
     * @param type 事件类型。
     * @param listener 事件监听器。
     */
    public AddEventListener(type: string, listener: (event: any) => Promise<void>) {
        if (!this.event_listener[type]) {
            this.event_listener[type] = [];
        }

        this.event_listener[type].push(listener);
    }

    /**
     * 主进度条显示控制。
     * @param rate 进度（-1表示隐藏进度条）。
     * @param msg 进度提示。
     * @param log 是否在控制台打印。
     */
    public Progress(rate: number, msg: string, log?: boolean) {
        if (log) {
            this.engine.Track(rate.toFixed(2) + " " + msg);
        }

        if (this.engine.config.web) {
            let progress_bar = (this as any)._progress_bar;

            if (!progress_bar) {
                const coatPanel = document.getElementById("coat");
                const progressRate = document.getElementById("progressbar-rate");
                const progressTxt = document.getElementById("progressbar-txt");
                const progressMsg = document.getElementById("progressbar-msg");

                progress_bar = (this as any)._progress_bar = {
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

    /**
     * 绘制3D帧（该方法的调用不影响帧率）。
     * @param count 将绘制不小于参数指定的帧数。
     * @param count2d 将绘制不小于参数指定的2D帧数。
     */
    public DrawFrame(count: number, count2d?: number) {
        this._loop2d = Math.max(this._loop2d, count);
        this._loop3d = Math.max(this._loop3d, count);

        if (count2d) {
            this._loop2d = Math.max(this._loop2d, count2d);
        }

        this.Awake();
    }

    /**
     * 唤醒帧循环（部分终端中setInterval会引起页面卡顿，应使用requestAnimationFrame）。
     */
    public Awake() {
        if (this._loopFunc) {
            if (this._sleep && (this._loop2d || this._loop3d)) {
                this._sleep = false;

                // Deno环境下会保持循环以持续处理事件
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

            // Deno环境下会保持循环以持续处理事件
            if (!this._sleep || !this.engine.config.web) {
                requestAnimationFrame(this._loopFunc);
            }
        };

        requestAnimationFrame(this._loopFunc);
    }

    /**
     * 场景帧更新绘制。
     * @returns 返回false表示无必要进一步步进。
     */
    public Step() {
        if (!this.started) {
            return false;
        }

        // 执行退出操作
        if (this._waitClose && !this._gpuRendering) {
            this._waitClose();
            this.started = false;
            return false;
        }

        // 非绘制任务中才可进一步更新
        if (!this._draw3d) {
            // 更新场景
            const flags = (this._loop2d ? 1 : 0) + (this._loop3d ? 2 : 0);
            if (flags) {
                // 同步应用窗口大小变化，窗口过小时进入休眠
                if (!this.engine.device.Resize()) {
                    return false;
                }

                // 更新帧时间戳和同步GIS状态到内核
                const gis = this.engine.gis;
                this.engine.env.Tick(
                    gis.enable ? (gis.enable_terrain ? 2 : 1) : 0,
                    [
                        gis["_originLL"][0], gis["_originLL"][1],
                        gis["_originMC"][0], gis["_originMC"][1]
                    ]
                );

                // 调用用户的场景更新方法
                this.Update(flags);

                // 约1分钟回收一次资源
                if ((this._steps % 1800) == 0) {
                    this.engine.resources.GC();
                }

                // 每步进60次，收集一次应用运行状态
                if ((++this._steps % 60) == 0) {
                    this.Status();
                }

                // 启动3D场景绘制任务
                if (this._loop3d) {
                    this._draw3d = true;

                    // 请求到渲染队列后进行绘制，请求渲染队列过程可能是异步的
                    this.engine.renderer.GetQueue((queue) => {
                        this._drawQueue = queue;
                        this.Awake();
                    });

                    // 渲染队列请求过程中我们暂时中断循环
                    if (!this._drawQueue) {
                        return false;
                    }
                }
            }
        }

        // 需要绘制3D
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
        // 可以仅绘制2D
        else if (this._loop2d) {
            this._loop2d--;
            this.Draw2D();
        }

        return (this._loop2d || this._loop3d) > 0;
    }

    /**
     * 更新场景。
     * @param flags 更新标志集（1-更新2D场景，2-更新3D场景）。
     */
    public Update(flags: number) {
        // ...
    }

    /**
     * 绘制场景2D画面。
     */
    public Draw2D() {
        // ...
    }

    /**
     * 绘制场景3D画面。
     */
    public Draw3D() {
        // ...
    }

    /**
     * 收集当前运行状态信息。
     */
    public Status() {
        const curtime = this.engine.env.frameTS;
        this._fps = 60000 / (curtime - this._fpsTime);
        this._fpsTime = curtime;

        // this.engine.Track("fps: " + this._fps);

        // const kernel = this.engine.kernel.Status();

        // console.info(kernel);
    }

    /** 引擎实例。 */
    public engine: Ploy3D;
    /** 应用是否已启动。 */
    public started: boolean;
    /** 本机窗口实例。 */
    public sdl_window?: Miaoverse.sdl2.Window;
    /** 本机窗口UI画布。 */
    public sdl_canvas?: Miaoverse.sdl2.Canvas;
    /** UI画布元素（DENO环境下用于创建Image等资源）。 */
    public ui_canvas?: HTMLCanvasElement;
    /** UI画布渲染上下文。 */
    public ui_ctx: CanvasRenderingContext2D;
    /** 事件监听器。 */
    public event_listener = {} as Record<string, ((event: any) => Promise<void>)[]>;
    /** 事件绑定列表。 */
    public events = {} as Record<string, any>;

    /** 地球大气层对象。 */
    protected _atmosphere?: {
        /** 网格资源实例。 */
        mesh: Miaoverse.Mesh;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
        /** 网格绘制参数对象。 */
        draw_params: Parameters<Miaoverse.DrawQueue["DrawMesh"]>[0];
    };
    /** 变换组件控制器工具。 */
    protected _transformCtrl?: Miaoverse.TransformCtrl;

    /** 当前2D待循环帧数。 */
    protected _loop2d: number = 0;
    /** 当前3D待循环帧数。 */
    protected _loop3d: number = 0;
    /** 如果场景状态有更新，我们将绘制3D帧。 */
    protected _draw3d: boolean = false;
    /** 当前帧循环计数（每60次收集一次运行状态）。 */
    protected _steps: number = 0;
    /** 最新请求得到的渲染队列，每次渲染前都需要请求渲染队列。 */
    protected _drawQueue: Miaoverse.DrawQueue = null;
    /** GPU渲染中。 */
    protected _gpuRendering: boolean = false;
    /** 当前循环陷入睡眠。 */
    protected _sleep: boolean = false;
    /** 当前循环句柄。 */
    protected _loopFunc: () => void = null;
    /** 等待退出方法（在渲染结束后调用）。 */
    protected _waitClose: () => void = null;

    /** 最新统计出的帧数。 */
    protected _fps: number = 0;
    /** FPS统计开始时间戳。 */
    protected _fpsTime: number = 0;
    /** 当前运行状态。 */
    protected _status: any = null;

    /** SDL2窗口初始化。*/
    public static SDL2_InitWindow: (app: PloyApp, title: string, width: number, height: number, progress: Ploy3D["Progress"]) => Promise<boolean>;
    /** SDL2事件绑定。*/
    public static SDL2_InitEvent: (app: PloyApp) => Promise<void>;
    /** SDL2事件处理方法。*/
    public static SDL2_SolveEvent: () => void;
    /** CanvasKit初始化主画布。 */
    public static CK_InitUI: (app: PloyApp) => Promise<void>;
}

/** 信号对象。 */
export class SimpleSignal<T, G> {
    /**
     * 构造函数。
     * @param generator 事件最新参数生成器。
     */
    public constructor(generator?: () => Promise<T>, cfg?: G) {
        this._signal = new Signal();
        this._data = null;
        this._generator = generator;
        this._generatorParam = cfg;
    }

    /**
     * 添加事件监听器。
     * @param listener 事件监听器。
     */
    public AddListener(listener: (data: T, old?: T) => void) {
        this._signal.add(listener, this);
    }

    /**
     * 移除事件监听器。
     * @param listener 事件监听器。
     */
    public RemoveListener(listener: (data: T, old?: T) => void) {
        this._signal.remove(listener, this);
    }

    /**
     * 设置事件最新参数并触发事件。
     * @param data 事件最新参数，未定义则内部通过参数生成器生成。
     */
    public async Dispatch(data?: T) {
        if (data === undefined && this._generator) {
            data = await this._generator(this._generatorParam);
        }

        const old = this._data;

        this._data = data;
        this._signal.dispatch(data, old);
    }

    /** 销毁事件管理器。 */
    public Destroy() {
        this._signal.dispose();
        this._signal = undefined;
        this._data = undefined;
        this._generator = undefined;
        this._generatorParam = undefined;
    }

    /** 事件最新参数。 */
    public get data() {
        return this._data;
    }

    /** 事件最新参数生成器生成参数。 */
    public get generatorParam() {
        return this._generatorParam;
    }
    public set generatorParam(param: G) {
        this._generatorParam = param;
    }

    /** 事件管理器。 */
    private _signal: Signal;
    /** 事件最新参数。 */
    private _data: T;
    /** 事件最新参数生成器。 */
    private _generator: (param: G) => Promise<T>;
    /** 事件最新参数生成器生成参数。 */
    private _generatorParam?: G;
}

/** 信号对象。 */
export class Signal {
    /**
     * 构造函数。
     */
    public constructor() {
        const self = this;

        this.dispatch = function () {
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }

    /**
     * 判断事件监听器是否已经绑定到信号上。
     * @param listener 事件监听器。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @returns
     */
    public has(listener: any, context: any) {
        return this._indexOfListener(listener, context) !== -1;
    }

    /**
     * 添加事件监听器。
     * @param listener 事件监听器。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @param priority 事件侦听器的优先级（默认值=0，越大越优先）。
     * @returns
     */
    public add(listener: any, context: any, priority = 0) {
        if (typeof listener !== 'function') {
            throw new Error('listener is a required param of add() and should be a Function.');
        }

        return this._registerListener(listener, false, context, priority);
    }

    /**
     * 添加事件监听器（在触发1次后自动移除）。
     * @param listener 事件监听器。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @param priority 事件侦听器的优先级（默认值=0，越大越优先）。
     * @returns
     */
    public addOnce(listener: any, context: any, priority = 0) {
        if (typeof listener !== 'function') {
            throw new Error('listener is a required param of addOnce() and should be a Function.');
        }

        return this._registerListener(listener, true, context, priority);
    }

    /**
     * 移除事件监听器。
     * @param listener 事件监听器。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @returns
     */
    public remove(listener: any, context: any) {
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

    /**
     * 移除所有事件监听器。
     */
    public removeAll() {
        let n = this._bindings.length;

        while (n--) {
            this._bindings[n].destroy();
        }

        this._bindings.length = 0;
    }

    /**
     * 销毁当前信号对象。
     */
    public dispose() {
        this.removeAll();

        delete this._bindings;
        delete this._prevParams;
    }

    /**
     * 向添加到队列中的所有听众发送/广播信号。
     * @param params 传递给事件监听器的参数列表。
     * @returns
     */
    public dispatch(...params: any) {
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

        // 存在派遣期间添加/移除事件绑定的可能性，因此要克隆数组
        const bindings = this._bindings.slice();

        // 在派遣期间，某个事件响应可能会调用halt()来阻止进一步传播事件
        this._shouldPropagate = true;

        // 执行所有回调，直到列表结束，或者直到回调返回“false”或停止传播
        // 反向循环，因为具有较高优先级的侦听器将被添加到列表末尾
        do {
            n--;
        }
        while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
    }

    /**
     * 停止事件的传播，阻止向队列上的下一个侦听器分派。
     * 注意：只应在信号调度期间调用，在调度之前/之后调用它不会影响信号广播。
     */
    public halt() {
        this._shouldPropagate = false;
    }

    /**
     * 遗忘上一次事件派遣的参数列表。
     */
    public forget() {
        this._prevParams = null;
    }

    /**
     * 注册事件监听器。
     * @param listener 事件监听器。
     * @param isOnce 是否仅执行1次。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @param priority 事件侦听器的优先级（默认值=0）。
     * @returns 返回事件绑定对象。
     */
    private _registerListener(listener: any, isOnce: boolean, context: any, priority = 0) {
        const prevIndex = this._indexOfListener(listener, context);
        let binding: SignalBinding = undefined;

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

    /**
     * 获取当前事件监听器的绑定编号。
     * @param listener 事件监听器。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @returns 返回绑定编号（-1表示不存在绑定）。
     */
    private _indexOfListener(listener: any, context: any) {
        let n = this._bindings.length;
        let cur: any = undefined;

        while (n--) {
            cur = this._bindings[n];

            if (cur._listener === listener && cur.context === context) {
                return n;
            }
        }

        return -1;
    }

    /**
     * 添加事件监听器绑定（按优先级排序）。
     * @param binding 事件监听器绑定。
     */
    private _addBinding(binding: SignalBinding) {
        let n = this._bindings.length;

        do {
            --n;
        }
        while (this._bindings[n] && binding.priority <= this._bindings[n].priority);

        this._bindings.splice(n + 1, 0, binding);
    }

    /** 当前信号对象是否激活。*/
    private _active: boolean = true;
    /** 是否继续传播信号给事件监听器。 */
    private _shouldPropagate: boolean = true;
    /**
     * 如果该属性为真，则信号记录上一次调用的参数。
     * 如果信号之前以前发生过，则在添加新的事件绑定时会触发调用。
     */
    private _memorize: boolean = false;
    /** 信号上一次派遣的参数列表。 */
    private _prevParams: any[] = null;
    /** 事件绑定列表。 */
    private _bindings: SignalBinding[] = [];
}

/** 信号对象与事件监听器之间的绑定。 */
class SignalBinding {
    /**
     * 构造函数。
     * @param signal 信号对象。
     * @param listener 事件监听器。
     * @param isOnce 该绑定是否仅执行1次。
     * @param context 事件监听器上下文（事件监听器方法内的this变量）。
     * @param priority 事件侦听器的优先级（默认值=0）。
     */
    public constructor(signal: Signal, listener: any, isOnce: boolean, context: any, priority = 0) {
        this._signal = signal;
        this._listener = listener;
        this._isOnce = isOnce;
        this._context = context;
        this._priority = priority || 0;
    }

    /**
     * 执行事件响应方法。
     * @param paramsArr 追加参数列表。
     * @returns 事件响应方法返回值。
     */
    public execute(paramsArr: any[]) {
        let handlerReturn: any = undefined;

        if (this._active && !!this._listener) {
            const params = this._params ? this._params.concat(paramsArr) : paramsArr;

            handlerReturn = this._listener.apply(this._context, params);

            if (this._isOnce) {
                this.detach();
            }
        }

        return handlerReturn;
    }

    /**
     * 销毁事件绑定实例属性。
     */
    public destroy() {
        delete this._signal;
        delete this._listener;
        delete this._context;
    }

    /**
     * 从信号上拆下绑定。
     * @returns 返回事件监听器绑定到的信号，如果绑定之前已分离，则为null。
     */
    private detach() {
        return this.isBound ? this._signal.remove(this._listener, this._context) : null;
    }

    /**
     * 判断当前绑定是否有效。
     * @returns
     */
    public get isBound() {
        return (!!this._signal && !!this._listener);
    }

    /** 
     * 该绑定是否仅执行1次。
     */
    public get isOnce() {
        return this._isOnce;
    }

    /** 事件侦听器的优先级（默认值=0）。 */
    public get priority() {
        return this._priority;
    }

    /** 当前绑定是否激活。 */
    private _active: boolean = true;
    /** 响应方法执行默认参数集。 */
    private _params: any[] = null;

    /** 信号对象。 */
    private _signal: Signal;
    /** 事件监听器。 */
    private _listener: any;
    /** 该绑定是否仅执行1次。 */
    private _isOnce: boolean;
    /** 事件监听器上下文（事件监听器方法内的this变量）。 */
    private _context: any;
    /** 事件侦听器的优先级（默认值=0）。 */
    private _priority: number;
}

/**
 * 启动应用注册表中包含的指定应用。
 * @param instance 引擎实例。
 * @param appid 所要启动的应用ID。
 * @param title 应用主窗口标题。
 * @param width 应用主窗口初始宽度。
 * @param height 应用主窗口初始高度。
 * @returns 返回事件协程。
 */
export function Start(instance: Ploy3D, appid = "default", title = "PLOY3D引擎", width = 1920, height = 1080) {
    const app_class = instance.appLut[appid];
    if (!app_class) {
        throw "查找不到指定的应用：" + appid;
    }

    instance.app = new app_class(instance);

    return instance.app.Startup(title, width, height);
}

/*/
PropTuple.view是一个类的构造函数，Material._view等由该构造函数实例化
PropLayout包含GPUBindGroupLayout和PropTuple两个重要属性，代表资源组的数据结构和访问器
ShaderAsset.depth_stencil可令Shader自定义深度和模板缓存控制
ShaderAsset.vertex_buffers可令Shader自定义顶点结构
ShaderAsset.custom_g3可令Shader自定义G3资源组（额外更多缓存绑定）
Shader着色器模块只生成1次，不同分支使用不同的宏和不同的构造函数与其它设置生成不同的GPURenderPipeline

TODO:
释放图集
/*/