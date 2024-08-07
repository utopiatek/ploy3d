import * as Miaoverse from "./mod.js";
/** 引擎模块。 */
export declare class Ploy3D {
    /**
     * 构造函数。
     * @param options 引擎模块实例选项。
     */
    constructor(options: {
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
        /** 导入ECharts图表库。 */
        echarts?: Ploy3D["echarts"];
        /** 引擎实例配置。 */
        config?: Ploy3D["config"];
    });
    /**
     * 创建Canvas元素。
     * @param width 宽度。
     * @param height 高度。
     * @returns 返回Canvas元素。
     */
    CreateCanvas(width: number, height: number): HTMLCanvasElement;
    /**
     * 计算字符串宽高。
     * @param text 字符串。
     * @param ctx 渲染上下文。
     * @returns 返回宽高。
     */
    MeasureText(text: string, ctx: CanvasRenderingContext2D): {
        width: number;
        height: number;
        actualBoundingBoxAscent: number;
        actualBoundingBoxDescent: number;
    };
    /**
     * 主进度条显示控制。
     * @param rate 进度（-1表示隐藏进度条）。
     * @param msg 进度提示。
     * @param log 是否在控制台打印。
     */
    Progress(rate: number, msg: string, log?: boolean): void;
    /**
     * 日志打印方法。
     * @param msg 日志信息。
     * @param ctrl 打印模式（0:log，1:info，2:warn，>2:error）。
     */
    Track(msg: string, ctrl?: number): void;
    /**
     * 根据路径拼接出用于请求数据的URL。
     * @param path 路径。
     * @returns 返回URL。
     */
    MakeUrl(path: string): string;
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
    Request<T>(method: "GET" | "POST", url: string, type: "arraybuffer" | "blob" | "document" | "json" | "text", body: Document | XMLHttpRequestBodyInit, content_type?: string, onprogress?: (rate: number) => void): Promise<unknown>;
    /**
     * 网络请求方法。
     * @param input 请求路径。
     * @param init 请求参数。
     * @param type 请求数据类型。
     * @returns 返回指定类型数据。
     */
    Fetch<T>(input: string, init: RequestInit, type: "arrayBuffer" | "blob" | "formData" | "json" | "text"): Promise<T>;
    /**
     * 加载图像元素。
     * @param src 图片URL。
     * @param crossOrigin 允许跨域资源。
     * @returns 返回图像元素。
     */
    LoadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement>;
    /**
     * 启动引擎实例。
     * @param progress - 进度刷新函数。
     */
    Startup(progress: (rate: number, msg: string) => void): Promise<void>;
    /**
     * 关闭引擎实例。
     */
    Shutdown(): Promise<{}>;
    /**
     * 构造三维向量。
     * @param values 三维向量值。
     * @returns 返回三维向量。
     */
    Vector3(values: ArrayLike<number>): Miaoverse.Vector3;
    /**
     * 构造四元数。
     * @param values 四元数值。
     * @returns 返回四元数。
     */
    Quaternion(values: ArrayLike<number>): Miaoverse.Quaternion;
    /**
     * 构造四阶矩阵。
     * @param values 矩阵值。
     * @returns 返回四阶矩阵。
     */
    Matrix4x4(values: ArrayLike<number>): Miaoverse.Matrix4x4;
    /** 是否使用的是WebGL图形API*/
    get webgl(): boolean;
    /** 引擎启动时间戳。 */
    startTS: number;
    /** 内核模块URL。 */
    kernelUrl: string;
    /** 线程模块URL。 */
    workerUrl: string;
    /** 线程模块URL。 */
    workerUrlJS: string;
    /** 用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。 */
    uid: number;
    /** 引擎是否已启动。 */
    started: boolean;
    /** 渲染目标宽度。 */
    width: number;
    /** 渲染目标高度。 */
    height: number;
    /** 压缩贴图支持标志集：0-不支持，1-s3tc，2-etc，4-astc。 */
    ctf: number;
    /** 资源预加载器。 */
    preloader: Promise<void>;
    /** 内核代码。 */
    kernelCode: ArrayBuffer;
    /** 本地文件系统。 */
    localFS: Miaoverse.FileStorage;
    /** 应用查找表。 */
    appLut: Record<string, (new (engine: Ploy3D) => PloyApp)>;
    /** 当前应用实例。 */
    app: PloyApp;
    /** SDL2模块名字空间。 */
    sdl2: typeof Miaoverse.sdl2;
    /** ECharts模块名字空间。 */
    echarts: typeof Miaoverse.echarts;
    /** 内核接口。 */
    internal: Miaoverse.Internal;
    /** 共享数据环境。 */
    env: Miaoverse.SharedENV;
    /** 内核管理器。 */
    kernel: Miaoverse.Kernel;
    /** GPU虚拟设备接口。 */
    device: Miaoverse.Device;
    /** 渲染设备上下文接口。 */
    context: Miaoverse.Context;
    /** 渲染器。 */
    renderer: Miaoverse.Renderer;
    /** 渲染管线装配器。 */
    assembly: Miaoverse.Assembly;
    /** 资源管理器。 */
    resources: Miaoverse.Resources;
    /** 多线程事务处理器。 */
    worker: Miaoverse.Miaoworker;
    /** GIS系统。 */
    gis: Miaoverse.Gis;
    /** CalynUI系统。 */
    ui: Miaoverse.CalynUI;
    /** 引擎配置。 */
    config: {
        /** 画布，用于创建默认交换链。 */
        surface: HTMLCanvasElement | Deno.UnsafeWindowSurface;
        /** 画布物理像素/设备独立像素比率。 */
        devicePixelRatio: number;
        /** 画布初始宽度。 */
        initWidth: number;
        /** 画布初始高度。 */
        initHeight: number;
        /** 画布色彩空间类型。 */
        colorSpace: "srgb";
        /** 画布混合模式。 */
        alphaMode: "opaque" | "premultiplied";
        /** 引擎选用低功耗还是高性能的显卡。 */
        powerPreference: "high-performance" | "low-power";
        /** 是否为Web平台。 */
        web: boolean;
        /** 是否使用WebGL。 */
        webgl: boolean;
        /** 是否是移动端。 */
        mobile: boolean;
    };
}
/** 应用基类。 */
export declare class PloyApp {
    /**
     * 构造函数。
     * @param engine 引擎实例。
     */
    constructor(engine: Ploy3D);
    /**
     * 启动主程序。
     * @param title 主窗口标题。
     * @param width 主窗口宽度。
     * @param height 主窗口高度。
     * @returns 返回事件协程。
     */
    Startup(title: string, width: number, height: number): Promise<void>;
    /**
     * 关闭主程序。
     */
    Shutdown(): Promise<void>;
    /**
     * 初始化窗口。
     * @param title 主窗口标题。
     * @param width 主窗口宽度。
     * @param height 主窗口高度。
     * @param progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    InitWindow(title: string, width: number, height: number, progress: Ploy3D["Progress"]): Promise<boolean>;
    /**
     * 初始化引擎。
     * @param {Parameters<Engine["Startup"]>[0]} progress - 进度刷新函数。
     * @returns 是否初始化成功。
     */
    InitEngine(progress: Ploy3D["Progress"]): Promise<boolean>;
    /**
     * 初始化UI。
     * @param progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    InitUI(progress: Ploy3D["Progress"]): Promise<boolean>;
    /**
     * 初始化场景。
     * @param {Parameters<Engine["Startup"]>[0]} progress - 进度刷新函数。
     * @returns 是否初始化成功。
     */
    InitScene(progress: Ploy3D["Progress"]): Promise<boolean>;
    /**
     * 创建地球大气层对象。
     * @param scene 场景实例。
     * @returns 返回地球大气层相关资源。
     */
    CreateAtmosphere(scene: Miaoverse.Scene): Promise<{
        /** 网格资源实例。 */
        mesh: Miaoverse.Mesh;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
        /** 网格绘制参数对象。 */
        draw_params: {
            flags: number; /** 是否使用WebGL。 */
            layers: number;
            userData: number;
            castShadows?: boolean;
            receiveShadows?: boolean;
            frontFace: number;
            cullMode: number;
            topology?: Miaoverse.GLPrimitiveTopology;
            mesh: Miaoverse.Mesh;
            materials: {
                submesh: number;
                material: Miaoverse.Material;
                drawParams?: number[];
            }[];
            instances: number[][];
        };
    }>;
    /**
     * 初始化事件系统。
     * @returns 返回事件协程。
     */
    InitEvent(): Promise<void>;
    /**
     * 注册事件监听器。
     * @param type 事件类型。
     * @param listener 事件监听器。
     */
    AddEventListener(type: string, listener: (event: any) => Promise<void>): void;
    /**
     * 主进度条显示控制。
     * @param rate 进度（-1表示隐藏进度条）。
     * @param msg 进度提示。
     * @param log 是否在控制台打印。
     */
    Progress(rate: number, msg: string, log?: boolean): void;
    /**
     * 绘制3D帧（该方法的调用不影响帧率）。
     * @param count 将绘制不小于参数指定的帧数。
     * @param count2d 将绘制不小于参数指定的2D帧数。
     */
    DrawFrame(count: number, count2d?: number): void;
    /**
     * 唤醒帧循环（部分终端中setInterval会引起页面卡顿，应使用requestAnimationFrame）。
     */
    Awake(): void;
    /**
     * 场景帧更新绘制。
     * @returns 返回false表示无必要进一步步进。
     */
    Step(): boolean;
    /**
     * 更新场景。
     * @param flags 更新标志集（1-更新2D场景，2-更新3D场景）。
     */
    Update(flags: number): void;
    /**
     * 绘制场景2D画面。
     */
    Draw2D(): void;
    /**
     * 绘制场景3D画面。
     */
    Draw3D(): void;
    /**
     * 收集当前运行状态信息。
     */
    Status(): void;
    /** 引擎实例。 */
    engine: Ploy3D;
    /** 应用是否已启动。 */
    started: boolean;
    /** 本机窗口实例。 */
    sdl_window?: Miaoverse.sdl2.Window;
    /** 本机窗口UI画布。 */
    sdl_canvas?: Miaoverse.sdl2.Canvas;
    /** UI画布元素（DENO环境下用于创建Image等资源）。 */
    ui_canvas?: HTMLCanvasElement;
    /** UI画布渲染上下文。 */
    ui_ctx: CanvasRenderingContext2D;
    /** 事件监听器。 */
    event_listener: Record<string, ((event: any) => Promise<void>)[]>;
    /** 地球大气层对象。 */
    protected _atmosphere?: {
        /** 网格资源实例。 */
        mesh: Miaoverse.Mesh;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
        /** 网格绘制参数对象。 */
        draw_params: Parameters<Miaoverse.DrawQueue["DrawMesh"]>[0];
    };
    /** 当前2D待循环帧数。 */
    protected _loop2d: number;
    /** 当前3D待循环帧数。 */
    protected _loop3d: number;
    /** 如果场景状态有更新，我们将绘制3D帧。 */
    protected _draw3d: boolean;
    /** 当前帧循环计数（每60次收集一次运行状态）。 */
    protected _steps: number;
    /** 最新请求得到的渲染队列，每次渲染前都需要请求渲染队列。 */
    protected _drawQueue: Miaoverse.DrawQueue;
    /** 当前循环陷入睡眠。 */
    protected _sleep: boolean;
    /** 当前循环句柄。 */
    protected _loopFunc: () => void;
    /** 等待退出方法（在渲染结束后调用）。 */
    protected _waitClose: () => void;
    /** 最新统计出的帧数。 */
    protected _fps: number;
    /** FPS统计开始时间戳。 */
    protected _fpsTime: number;
    /** 当前运行状态。 */
    protected _status: any;
    /** SDL2窗口初始化。*/
    static SDL2_InitWindow: (app: PloyApp, title: string, width: number, height: number, progress: Ploy3D["Progress"]) => Promise<boolean>;
    /** SDL2事件绑定。*/
    static SDL2_InitEvent: (app: PloyApp) => Promise<void>;
    /** SDL2事件处理方法。*/
    static SDL2_SolveEvent: () => void;
    /** CanvasKit初始化主画布。 */
    static CK_InitUI: (app: PloyApp) => Promise<void>;
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
export declare function Start(instance: Ploy3D, appid?: string, title?: string, width?: number, height?: number): Promise<void>;
