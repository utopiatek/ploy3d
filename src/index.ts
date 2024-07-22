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
        /** CanvasKit模块实例。 */
        canvaskit?: Ploy3D["canvaskit"];
        /** 导入ECharts图表库。 */
        echarts?: Ploy3D["echarts"];
        /** 导入JSZip库。 */
        JSZip?: Ploy3D["JSZip"];
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
            Release: (classid: number, id: number) => {
                // TODO ...
                return 0;
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

        // ...

        return {};
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

    /** 引擎启动时间戳。 */
    public startTS = Date.now();
    /** 内核模块URL。 */
    public kernelUrl = "./lib/ploycloud.wasm";
    /** 线程模块URL。 */
    public workerUrl = "./lib/ploycloud.worker.wasm";
    /** 线程模块URL。 */
    public workerUrlJS = "./lib/ploycloud.worker.js";

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
    /** CanvasKit模块实例。 */
    public canvaskit: Miaoverse.canvaskit.CanvasKit;
    /** ECharts模块名字空间。 */
    public echarts: typeof Miaoverse.echarts;
    /** JSZip模块接口。 */
    public JSZip: Miaoverse.JSZip;

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
    /** 资源管理器。 */
    public resources: Miaoverse.Resources;
    /** GIS系统。 */
    public gis: Miaoverse.Gis;
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

        await this.InitScene((rate, msg) => {
            this.Progress(0.5 + 0.5 * rate, msg, true);
        });

        this.started = true;

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

        this.started = false;

        this.engine.Track("即将退出程序");

        const state = await this.engine.Shutdown();

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
     * 初始化事件系统。
     * @returns 返回事件协程。
     */
    public async InitEvent() {
        if (!this.engine.config.web) {
            return PloyApp.SDL2_InitEvent(this);
        }

        return new Promise<void>(async (resolve, reject) => {
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
        // 非绘制任务中才可退出或进一步更新
        if (!this._draw3d) {
            // 执行退出操作
            if (this._waitClose) {
                this._waitClose();
                return false;
            }

            // 更新场景
            const flags = (this._loop2d ? 1 : 0) + (this._loop3d ? 2 : 0);
            if (flags) {
                // 同步应用窗口大小变化，窗口过小时进入休眠
                if (!this.engine.device.Resize()) {
                    return false;
                }

                // 更新帧时间戳和同步GIS状态到内核
                this.engine.env.Tick(0, [0, 0, 0, 0]);

                // 调用用户的场景更新方法
                this.Update(flags);

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
                    this.Draw2D();
                }

                this._loop3d--;
                this.Draw3D();

                this._draw3d = false;
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

        this.engine.Track("fps: " + this._fps);
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

    /** 当前2D待循环帧数。 */
    private _loop2d: number = 0;
    /** 当前3D待循环帧数。 */
    private _loop3d: number = 0;
    /** 如果场景状态有更新，我们将绘制3D帧。 */
    private _draw3d: boolean = false;
    /** 当前帧循环计数（每60次收集一次运行状态）。 */
    private _steps: number = 0;
    /** 最新请求得到的渲染队列，每次渲染前都需要请求渲染队列。 */
    private _drawQueue: Miaoverse.DrawQueue = null;
    /** 当前循环陷入睡眠。 */
    private _sleep: boolean = false;
    /** 当前循环句柄。 */
    private _loopFunc: () => void = null;
    /** 等待退出方法（在渲染结束后调用）。 */
    private _waitClose: () => void = null;

    /** 最新统计出的帧数。 */
    private _fps: number = 0;
    /** FPS统计开始时间戳。 */
    private _fpsTime: number = 0;
    /** 当前运行状态。 */
    private _status: any = null;

    /** SDL2窗口初始化。*/
    public static SDL2_InitWindow: (app: PloyApp, title: string, width: number, height: number, progress: Ploy3D["Progress"]) => Promise<boolean>;
    /** SDL2事件绑定。*/
    public static SDL2_InitEvent: (app: PloyApp) => Promise<void>;
    /** SDL2事件处理方法。*/
    public static SDL2_SolveEvent: () => void;
    /** CanvasKit初始化主画布。 */
    public static CK_InitUI: (app: PloyApp) => Promise<void>;
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
