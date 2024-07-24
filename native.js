/** 引入该模块用于创建系统窗口。 */
import * as sdl2 from "https://deno.land/x/sdl2@0.9.0/mod.ts";
/** DOM/XML解析器，我们主要使用DOMParser来解析SVG文件。 */
import { DOMParser } from "https://esm.sh/linkedom";
/** 导入ECharts库。 */
import * as echarts from "echarts";
/** 导入PLOY3D引擎。 */
import * as ploycloud from "./dist/esm/mod"
/** 导入应用实现[test]。 */
import * as app_test from "./examples/test"

/** 将DOMParser设置到全局空间，提供给ECharts模块使用。 */
globalThis.DOMParser = DOMParser;

/** 文件加载根路径。 */
const cwd = "file://" + Deno.cwd() + "/";

/**
 * 入口函数。
 * @param {FileSystemDirectoryHandle} fs_root 如果非未定义，则启用本地文件系统。
 * @returns 返回事件处理协程。
 */
async function Main(fs_root) {
    if (fs_root !== undefined) {
        if (fs_root == null) {
            fs_root = {};
        }
    }

    if (fs_root) {
        console.info("用户已授权读写本地文件系统目录。");
    }

    /** 
     * DENO环境下的兼容设置。
     * @param {ConstructorParameters<typeof ploycloud.Ploy3D>[0]} config 引擎模块实例选项。
     */
    const env_configure = function (config) {
        async function InitWindow(app, title, width, height, progress) {
            //【src/device.ts:Device.InitGPU】获取GPU适配器后才能获取SDL2窗口表面，这应该是DENO的一个BUG
            app.sdl_window = new engine.sdl2.WindowBuilder(title, width, height).build();
            app.sdl_canvas = app.sdl_window.canvas();
        }

        async function InitEvent(app) {

            const temp_e = {
                // Event =================-----------------------
                /** 该事件是否会在DOM中冒泡。 */
                bubbles: true,
                /** 在事件处理程序返回之前将其值设置为可以阻止事件传播。 */
                cancelBubble: false,
                /** 表示事件是否可以取消。 */
                cancelable: true,
                /** 表示事件是否可以穿过Shadow DOM和常规DOM之间的边界进行冒泡。 */
                composed: true,
                /** 对事件当前注册的目标的引用。这是一个当前计划将事件发送到的对象。它是有可能在重定向的过程中被改变的。 */
                currentTarget: null,
                /** 表明当前事件是否调用了event.preventDefault()方法。 */
                defaultPrevented: false,
                /** 指示正在处理的事件流阶段。 */
                eventPhase: 0,
                /** 表示事件是由浏览器（例如用户点击）发起的，还是由脚本发起的（例如使用事件创建方法）。 */
                isTrusted: true,
                /** 属性表示该事件的默认操作是否已被阻止。 */
                returnValue: true,
                /** 对事件分派到的对象的引用。当事件处理器在事件的冒泡或捕获阶段被调用时，它与event.currentTarget不同。 */
                srcElement: app.ui_canvas,
                /** 对事件分派到的对象的引用。当事件处理器在事件的冒泡或捕获阶段被调用时，它与event.currentTarget不同。 */
                target: app.ui_canvas,
                /** 返回事件创建的时间（以毫秒为单位）。 */
                timeStamp: Date.now(),
                /** 表示该事件对象的事件类型。 */
                type: "pointerdown",

                NONE: 0,
                CAPTURING_PHASE: 1,
                AT_TARGET: 2,
                BUBBLING_PHASE: 3,

                // UIEvent =================-----------------------

                /** 当值为非空的时候，提供当前点击数 （和环境有关） 。 */
                detail: 0,
                /** 返回的生成事件的document.defaultView对象。在浏览器中，这是事件所在的Window对象。 */
                view: window,
                /** 返回所按下键的数字或所按下字母数字键的字符代码。 */
                which: 1,

                // MouseEvent =================-----------------------

                /** 当事件触发时alt键是否按下。 */
                altKey: false,
                /** 代表用户按下并触发了事件的鼠标按键。 */
                button: 0,
                /** 指示事件触发时哪些鼠标按键被按下。 */
                buttons: 1,
                /** 它提供事件发生时的应用客户端区域的水平坐标（与页面坐标不同）。 */
                clientX: 0,
                /** 它提供事件发生时的应用客户端区域的垂直坐标（与页面坐标不同）。 */
                clientY: 0,
                /** 当事件触发时ctrl键是否按下。 */
                ctrlKey: false,
                /** 事件相对于当前图层的水平坐标。 */
                layerX: 0,
                /** 事件相对于当前图层的垂直坐标。 */
                layerY: 0,
                /** 用于指示在给定鼠标事件发生时是否按下了meta键。 */
                metaKey: false,
                /** 提供给定事件与上一个mousemove事件之间鼠标指针的X坐标差。 */
                movementX: 0,
                /** 提供给定事件与上一个mousemove事件之间鼠标指针的Y坐标差。 */
                movementY: 0,
                /** 提供鼠标指针的X坐标中的偏移量，该事件与目标节点的填充边缘之间。 */
                offsetX: 0,
                /** 提供鼠标指针的Y坐标中的偏移量，该事件与目标节点的填充边缘之间。 */
                offsetY: 0,
                /** 返回单击鼠标的X坐标（以像素为单位），相对于整个文档的左边缘。 这包括文档中当前不可见的任何部分。 */
                pageX: 0,
                /** 返回单击鼠标的Y坐标（以像素为单位），相对于整个文档的左边缘。 这包括文档中当前不可见的任何部分。 */
                pageY: 0,
                /** 鼠标事件的辅助目标（如果有）。 */
                relatedTarget: null,
                /** 提供鼠标指针的水平坐标（偏移量）以屏幕坐标表示。 */
                screenX: 10,
                /** 提供鼠标指针的垂直坐标（偏移量）以屏幕坐标表示。 */
                screenY: 10,
                /** 当事件触发时shift键是否按下。 */
                shiftKey: false,
                /** MouseEvent.clientX属性的别名。 */
                x: 0,
                /** MouseEvent.clientY属性的别名。 */
                y: 0,

                // PointerEvent =================-----------------------

                /** 手指触碰屏幕区域的高度。 */
                height: 1,
                /** 指示指针设备是否为创建的事件是主指针。 */
                isPrimary: true,
                /** 分配给给定指针的标识符。 */
                pointerId: 1,
                /** 指示设备类型（鼠标、笔或触摸）这导致了给定的指针事件。 */
                pointerType: "mouse",
                /** 指示指针的归一化压力输入。 */
                pressure: 0.5,
                /** 指针输入（也称为料筒压力或气缸应力）。 */
                tangentialPressure: 0,
                /** 是X-Z之间的角度（以度为单位）指针和屏幕的平面。此属性通常仅对笔/触笔指针类型。 */
                tiltX: 0,
                /** 是Y-Z之间的角度（以度为单位）指针和屏幕的平面。此属性通常仅对笔/触笔指针类型。 */
                tiltY: 0,
                /** 性表示指针的顺时针旋转（例如，笔触控笔）绕其主轴，以度为单位。 */
                twist: 0,
                /** 手指触碰屏幕区域的宽度。 */
                width: 1
            };

            const typeLut = {
                1024: "pointermove",
                1025: "pointerdown",
                1026: "pointerup",
            };

            let start = temp_e;
            let moved = false;
            let clickTS = 0;
            let button = 0;

            function TransmitMouseEvent(e) {
                const e_ = {
                    ...temp_e,
                    timeStamp: e.timestamp,
                    type: typeLut[e.type],
                    which: e.which,
                    buttons: e.button == 3 ? 2 : e.button,
                    button: e.button,
                    clientX: e.x,
                    clientY: e.y,
                    layerX: e.x,
                    layerY: e.y,
                    offsetX: e.x,
                    offsetY: e.y,
                    pageX: e.x,
                    pageY: e.y,
                    x: e.x,
                    y: e.y,
                    movementX: e.xrel,
                    movementY: e.yrel,
                };

                if (e.type == 1025) { // pointerdown
                    start = e_;
                    moved = false;
                }

                if (e.type == 1024) { // pointermove
                    moved = true;
                }

                const listener_list = app.event_listener[e_.type];

                if (listener_list) {
                    for (let listener of listener_list) {
                        listener(e_);
                    }
                }

                if (e.type == 1026) { // pointerup
                    if (!moved && 0 === start.button && 200 > e_.timeStamp - start.timeStamp) {
                        if (300 > e_.timeStamp - clickTS) { // 鼠标双击
                            const e__ = {
                                ...e_,
                                type: "dblclick"
                            };
                        }
                        else {                              // 鼠标单击
                            const e__ = {
                                ...e_,
                                type: "click"
                            };

                            const listener_list = app.event_listener[e__.type];

                            if (listener_list) {
                                for (let listener of listener_list) {
                                    listener(e__);
                                }
                            }
                        }

                        clickTS = e_.timeStamp;
                    }

                    start = null;
                }
            }

            const eventBuf = new Uint8Array(56);
            const eventEnum = engine.sdl2.EventType;
            const lib_sdl2 = Deno.dlopen(Deno.build.os == "darwin" ? "libSDL2.dylib" : "SDL2.dll", {
                "SDL_PollEvent": {
                    "parameters": ["pointer"],
                    "result": "i32",
                },
            });

            function ReadEvent(type, view) {
                if (type == eventEnum.Quit) {
                    return {
                        type: view.getUint32(),
                        timestamp: view.getUint32(4)
                    };
                }
                else if (type == eventEnum.MouseMotion) {
                    return {
                        type: view.getUint32(),
                        timestamp: view.getUint32(4),
                        windowID: view.getUint32(8),
                        which: view.getUint32(12),
                        button: button,
                        state: view.getUint32(16),
                        x: view.getInt32(20),
                        y: view.getInt32(24),
                        xrel: view.getInt32(28),
                        yrel: view.getInt32(32)
                    };
                }
                else if (type == eventEnum.MouseButtonDown) {
                    button = view.getUint8(16 + 0);
                    return {
                        type: view.getUint32(),
                        timestamp: view.getUint32(4),
                        windowID: view.getUint32(8),
                        which: view.getUint32(12),
                        button: view.getUint8(16 + 0),
                        state: view.getUint8(16 + 1),
                        padding1: view.getUint8(16 + 2),
                        padding2: view.getUint8(16 + 3),
                        x: view.getInt32(20),
                        y: view.getInt32(24),
                    };
                }
                else if (type == eventEnum.MouseButtonUp) {
                    button = 0;
                    return {
                        type: view.getUint32(),
                        timestamp: view.getUint32(4),
                        windowID: view.getUint32(8),
                        which: view.getUint32(12),
                        button: view.getUint8(16 + 0),
                        state: view.getUint8(16 + 1),
                        padding1: view.getUint8(16 + 2),
                        padding2: view.getUint8(16 + 3),
                        x: view.getInt32(20),
                        y: view.getInt32(24),
                    };
                }

                return null;
            }

            function SolveEvents(handle) {
                while (true) {
                    const event = Deno.UnsafePointer.of(eventBuf);
                    const pending = lib_sdl2.symbols.SDL_PollEvent(event) == 1;
                    if (!pending) {
                        break;
                    }

                    const view = new Deno.UnsafePointerView(event);
                    const type = view.getUint32();
                    const ev = ReadEvent(type, view);
                    if (!ev) { // 非法的事件类型
                        continue;
                    }

                    handle(ev);

                    app.DrawFrame(60000);
                }
            }

            let Quit = function () { }

            ploycloud.PloyApp.SDL2_SolveEvent = function () {
                SolveEvents(function (e) {
                    if (e.type == eventEnum.Quit) {
                        app._waitClose = Quit;
                    }
                    else if (e.type > 1023 && e.type < 1027) {
                        TransmitMouseEvent(e);
                    }

                    // ["mousewheel", "wheel"];
                });
            }

            return new Promise(async function (resolve, reject) {
                Quit = function () {
                    app.Shutdown().then(function () {
                        resolve();
                        Deno.exit();
                    }).catch(reject);
                }
            });
        }

        async function InitUI(app) {
            // Deno环境下CanvasKit依赖GPU贴图，因此在引擎初始化后创建主UI画布
            // TODO ...
        }

        if (!config.MakeUrl) {
            config.MakeUrl = function (path) {
                if (!path.startsWith("http")) {
                    if (!path.startsWith("file://")) {
                        if (path.startsWith("./") || path.startsWith("/") || path.startsWith(".\\") || path.startsWith("\\")) {
                            path = cwd + path;
                        }
                        else {
                            path = "file://" + path;
                        }
                    }
                }

                return path;
            };
        }

        if (config.echarts) {
            // 移除该环境标记以启用事件处理
            config.echarts.env.worker = false;

            config.echarts.setPlatformAPI({
                createCanvas(width = 512, height = 512) {
                    return engine.CreateCanvas(width, height);
                },
                loadImage(src, onload, onerror) {
                    engine.LoadImage(src).then(onload).catch(onerror);
                    return null;
                }
            });
        }

        if (config.sdl2) {
            ploycloud.PloyApp.SDL2_InitWindow = InitWindow;
            ploycloud.PloyApp.SDL2_InitEvent = InitEvent;
            ploycloud.PloyApp.CK_InitUI = InitUI;
        }

        return config;
    };

    /** @type {ploycloud.Ploy3D} 引擎实例。 */
    const engine = new ploycloud.Ploy3D(env_configure({
        sdl2: sdl2,
        echarts: echarts,
        rootFS: fs_root,
        appLut: {
            "test": app_test.PloyApp_test
        }
    }));

    // 记录requestAnimationFrame指定的下一帧调用方法
    let nextCall = function () { }

    // Deno未实现requestAnimationFrame方法
    globalThis.requestAnimationFrame = function (_nextCall) {
        nextCall = _nextCall;
    }

    // 使用定时器来进行帧循环
    setInterval(function () { nextCall(); }, 10);

    // 启动应用
    await ploycloud.Start(engine, "test", "PLOY3D引擎", 1280, 720);
}

Main(null).then(() => {
    console.log("应用运行中，按ESC键结束运行 ...")
}).catch((e) => {
    console.error(e);
    Deno.exit();
});
