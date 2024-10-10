import { Ploy3D, PloyApp, SimpleSignal, PackageReg, Scene, Object3D, Camera, Volume, Assembly, Material, DrawQueue, Package, Prefab } from "../../dist/esm/mod.js"
import { React, ReactDOM, molecule, create, Workbench, HTML5Backend, DndProvider, useDrop } from "../../lib/molecule.js"
import { Packages } from "./packages.js";
import { Assets } from "./assets.js";

export class PloyApp_editor extends PloyApp {
    /**
     * 构造函数。
     * @constructor
     * @param engine 引擎实例。
     */
    public constructor(engine: Ploy3D) {
        super(engine);
    }

    /**
     * 初始化场景。
     * @param progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    public async InitScene(progress: Ploy3D["Progress"]) {
        const engine = this.engine;
        const resources = engine.resources;

        this.scene = await resources.Scene.Create();
        this.object3d = await resources.Object.Create(this.scene);
        this.camera = await resources.Camera.Create(this.object3d);
        this.volume = await resources.Volume.Create(this.object3d);

        this.volume.shadowBias = 0.1;
        this.volume.iblLuminance = 1.0;
        this.volume.sunlitColorIntensity = [1.0, 1.0, 1.0, 1.0];
        this.volume.sunlitDirection = engine.Vector3([1.0, 1.0, 1.0]).normalized.values;

        this.volume.shadowDisable = 1;
        this.volume.ssrDisable = 1;
        this.volume.ssaoDisable = 1;

        // 自定义渲染管线帧通道列表（我们排出了默认设置中的"shadow_cast","early_z","ssao_extract","ssr_extract","sss_extract","sss_blur","proc_bloom"）
        {
            this.framePassList = {} as any;

            this.framePassList.framePassName = [
                "opaque",       // 0
                "blit",         // 1
            ];

            this.framePassList.framePass = this.framePassList.framePassName.map((label) => {
                return engine.assembly.GetFramePass(label);
            });

            // 我们排除了"early_z"通道，以此需要修改"opaque"通道的深度测试配置
            this.framePassList.framePass[0].depthStencilAttachment.depthCompare = "greater";
            this.framePassList.framePass[0].depthStencilAttachment.depthLoadOp = "clear";
            this.framePassList.framePass[0].depthStencilAttachment.depthWriteEnabled = true;

            this.framePassList.framePass[1].shaderMacro.BLIT_CANVAS_COMBINE_SSS = 0;
            this.framePassList.framePass[1].shaderMacro.BLIT_CANVAS_COMBINE_BLOOM = 0;
            this.framePassList.framePass[1].shaderMacro.BLIT_CANVAS_TONE_MAPPING = 0;
        }

        // 测试资源包导入与快照
        {
            const pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shibahu.zip", () => { });
            this.engine.resources.Register(pkg.pkg, pkg.files);
            const menu = await engine.resources.Browse(pkg.pkg);
            this._snapshotTasks.push(menu);
        }

        // 创建地球大气层对象
        await this.CreateAtmosphere(this.scene);

        // 创建变换组件控制器工具
        await this.CreateTransformCtrl(this.scene);

        // 默认相机姿态
        this.camera.Set3D([0, 0.5, 0], 2.7, 45, 0);
        this.camera.nearZ = 0.1;
        this.camera.farZ = 100.0;
        this.camera.fov = 45 / 180 * Math.PI;

        // 注册鼠标滚轮事件监听器
        this.AddEventListener("wheel", async (e) => {
            this.camera.Scale(e.wheelDelta, engine.width, engine.height);
            this.DrawFrame(1);
        });

        // 注册鼠标滑动事件监听器
        this.AddEventListener("pointermove", async (e) => {
            if ((e.buttons & 1) == 1) {
                if (this._transformCtrl && this._transformCtrl.ctrl) {
                    this._transformCtrl.Drag(this.camera, e.layerX, e.layerY, engine.width, engine.height);
                }
                else {
                    this.camera.Move(e.movementX, e.movementY, engine.width, engine.height);
                }

                this.DrawFrame(1);
            }
            else if ((e.buttons & 2) == 2) {
                this.camera.Rotate(e.movementX, e.movementY, engine.width, engine.height);
                this.DrawFrame(1);
            }
        });

        // 注册鼠标点击按下事件监听器
        this.AddEventListener("pointerdown", (() => {
            let last_obj: Object3D = null;
            let last_mat: Material = null;
            let priv_color: number[] = null;
            let click_times = 0;

            return async (e) => {
                const time = ++click_times;

                const point = [
                    (e.layerX * this.engine.config.devicePixelRatio) / this.engine.width,
                    (e.layerY * this.engine.config.devicePixelRatio) / this.engine.height
                ];

                engine.assembly.GetObjectInScreen(point[0], point[1]).then((hit) => {
                    if (time != click_times) {
                        return;
                    }

                    if (hit.material) {
                        let hit_ctrl = false;

                        if (this._transformCtrl) {
                            hit_ctrl = this._transformCtrl.Begin(hit.object3d);
                        }

                        if (!hit_ctrl) {
                            if (last_mat) {
                                last_mat.view.baseColorFactor = priv_color;
                                last_mat = null;
                            }

                            last_obj = hit.object3d;
                            last_mat = hit.material;
                            priv_color = hit.material.view.baseColorFactor;

                            hit.material.view.baseColorFactor = [1, 0, 0, 1];
                        }

                        this.DrawFrame(2);
                    }
                    else {
                        if (this._transformCtrl) {
                            this._transformCtrl.Begin(null);
                        }

                        if (last_mat) {
                            last_mat.view.baseColorFactor = priv_color;
                            last_mat = null;
                        }

                        last_obj = null;
                        last_mat = null;
                        priv_color = null;

                        this.DrawFrame(2);
                    }
                });
            };
        })());

        // 注册鼠标点击松开事件监听器
        this.AddEventListener("pointerup", async (e) => {
            if (e.button == 0) {
                if (this._transformCtrl && this._transformCtrl.ctrl) {
                    this._transformCtrl.End();
                }

                this.DrawFrame(1);
            }
        });

        // 注册键盘按键按下事件监听器
        this.AddEventListener("keydown", async (e) => {
            // 安全关闭应用
            if (e.code == "Escape") {
                this.Shutdown();
            }
        });

        // 触发一帧绘制，这样本机程序才会启动循环监听事件
        this.DrawFrame(10);

        return true;
    }

    /**
     * 更新场景。
     * @param flags 更新标志集（1-更新2D场景，2-更新3D场景）。
     */
    public Update(flags: number) {
        if ((flags & 2) == 2) {
            if (this._transformCtrl) {
                this._transformCtrl.Update(this.camera);
            }
        }
    }

    /**
     * 绘制场景3D画面。
     */
    public Draw3D() {
        // 执行资源包缩略图快照任务
        if (this._snapshotTasks.length > 0) {
            return this.Snapshot();
        }

        // 将GIS网格添加到绘制列表
        if (this.engine.gis) {
            const target = this.engine.gis.Update(this.camera);
            if (target) {
                this.camera.target = target;
            }

            this.engine.gis.DrawMesh(this._drawQueue);
        }

        // 将地球大气层网格添加到绘制列表
        if (this._atmosphere) {
            this._drawQueue.DrawMesh(this._atmosphere.draw_params);
        }

        // 自定义场景绘制方法
        const drawScene = (queue: DrawQueue) => {
            // 绘制当前绘制列表内容
            queue.DrawList();

            // 绘制地图矢量图形
            if (this.engine.gis) {
                // TODO: this.engine.gis.Draw(queue);
            }
        };

        // ========================----------------------------------------

        const framePassList = this.framePassList || this.engine.assembly.GetFramePassList("low");
        const texture = this.engine.device["_swapchain"].getCurrentTexture();
        const target = {
            texture: texture,
            view: texture.createView(),
            viewport: [0, 0, texture.width, texture.height]
        };

        this._drawQueue.Execute(this.camera, this.volume, target, framePassList, drawScene, (err) => {
            if (err) {
                console.error(err);
            }
            else {
                if (Deno) {
                    (this.engine.config.surface as any).present();
                }
            }

            this._gpuRendering = false;
        });
    }

    /**
     * 对资源包进行快照渲染。
     */
    public Snapshot() {
        const framePassList = this.framePassList || this.engine.assembly.GetFramePassList("low");
        const list = this._snapshotTasks;
        const count = list.length;
        const queue = this._drawQueue;
        const surface = this.engine.config.surface as HTMLCanvasElement;

        this._snapshotTasks = [];

        this.engine.assembly.config.renderTargets.scale = 0.125;
        this.engine.device.Resize(128, 128);
        this.engine.config.surface = null;

        const Run = async () => {
            for (let i = 0; i < count; i++) {
                const menu = list[i];

                await (new Promise<void>((resolve, reject) => {
                    queue.Snapshot(this.scene, menu, surface, this.camera, this.volume, framePassList, (e) => {
                        if (e) {
                            reject(e);
                        }
                        else {
                            resolve();
                        }
                    });
                }));
            }
        };

        Run().then(() => {
            this.engine.assembly.config.renderTargets.scale = 1.0;
            this.engine.config.surface = surface;
            console.error("快照完成");
            queue["Flush"]();
            this.DrawFrame(1);
        }).catch((e) => {
            this.engine.assembly.config.renderTargets.scale = 1.0;
            this.engine.config.surface = surface;
            console.error(e);
            queue["Flush"]();
            this.DrawFrame(1);
        });
    }

    /** 场景实例。 */
    private scene: Scene;
    /** 承载相机组件和体积组件的3D对象实例。 */
    private object3d: Object3D;
    /** 相机组件实例。 */
    private camera: Camera;
    /** 体积组件实例。 */
    private volume: Volume;
    /** 自定义渲染管线帧通道列表。 */
    private framePassList: ReturnType<Assembly["GetFramePassList"]>;

    // ========================--------------------------------

    /**
     * 初始化窗口。
     * @param title 主窗口标题。
     * @param width 主窗口宽度。
     * @param height 主窗口高度。
     * @param progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    public async InitWindow(title: string, width: number, height: number, progress: Ploy3D["Progress"]) {
        // 已创建molecule实例（通常不会）
        if (this._moleculeInst) {
            return true;
        }

        // 引入mo.css文件
        {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/mo.css";

            document.head.appendChild(link);
        }

        // 创建molecule实例
        this._moleculeInst = create({
            extensions: this._extensionList
        });

        // 定义工作台组件
        this._workbenchCom = () => this._moleculeInst.render(<Workbench />);
        // 编辑器实例
        this._editor = new Editor(this);

        // 渲染页面
        ReactDOM.render((
            <React.StrictMode>
                <DndProvider backend={HTML5Backend}>
                    <this._workbenchCom />
                </DndProvider>
            </React.StrictMode>
        ), document.getElementById('root'));

        // 打开场景编辑标签页
        await this._editor.Open();

        progress(1.0, "完成窗口创建");

        return true;
    }

    /** 扩展组件查找表。 */
    public get extensions() {
        return this._extensionLut;
    }

    /** 信号处理器查找表。 */
    public get signals() {
        return this._signalLut;
    }

    /** 用户ID。 */
    public get userId() {
        return this._userId || -1;
    }

    /** 用户邮箱。 */
    public get userEmail() {
        return this._userEmail || "helper@ploycloud.com";
    }

    /** 用户ID。 */
    private _userId: number;
    /** 用户邮箱。 */
    private _userEmail: string;
    /** 等待用户登录。 */
    private _waitLogin: (id: number, email: string) => void;
    /** 工作台组件。 */
    private _workbenchCom: () => React.ReactElement;
    /** MO框架实例。 */
    private _moleculeInst: ReturnType<typeof create>;
    /** 3D标签页组件。 */
    private _editor: Editor;
    /** 用户标签页组件。 */
    private _tabUser: molecule.model.IEditorTab;
    /** 扩展组件查找表。 */
    private _extensionLut = {
        packages: new Packages(this),
        assets: new Assets(this),
    };
    /** 扩展组件列表。 */
    private _extensionList: molecule.model.IExtension[] = [
        this._extensionLut.packages,
        this._extensionLut.assets,
    ];
    /** 信号处理器查找表。 */
    private _signalLut = {
        /** 资源包选择事件。 */
        select_package: new SimpleSignal<PackageReg, unknown>(),
    };
    /** 资源包缩略图快照任务列表。 */
    private _snapshotTasks: PackageReg["menu"][] = [];
}

export class Editor {
    /**
     * 构造函数。
     * @param app 应用实例。
     */
    public constructor(app: PloyApp_editor) {
        this._app = app;

        this._containerRef = React.createRef<HTMLDivElement>();
        this._canvas3d = document.getElementById("canvas3d") as HTMLCanvasElement;
        this._canvas2d = document.getElementById("canvas2d") as HTMLCanvasElement;
    }

    /**
     * 打开场景编辑标签页。
     * @param onUnmount
     * @returns
     */
    public async Open(onUnmount?: () => void) {
        return new Promise<void>((resolve, reject) => {
            if (this._mounted) {
                resolve();
                return;
            }

            this._onMount = resolve;
            this._onUnmount = onUnmount || (() => { });

            molecule.editor.open(this._tab);
        });
    }

    /**
     * 渲染3D编辑器页面。
     * @returns
     */
    public Render() {
        // 依赖数组为空意味着只在挂载和卸载时执行一次，否则当依赖数组内的任何值发生改变，该函数都会调用
        React.useEffect(() => {
            // 组件渲染完成后的逻辑
            this._containerRef.current.appendChild(this._canvas3d);
            this._containerRef.current.appendChild(this._canvas2d);

            this._mounted = true;
            this._onMount();

            // 返回组件卸载时的清理函数（或者组件更新前函数，依赖数组不为空的情况下）
            return () => {
                document.body.appendChild(this._canvas3d);
                document.body.appendChild(this._canvas2d);

                this._mounted = false;
                this._onUnmount();
            };
        }, []);

        // https://www.cnblogs.com/sanhuamao/p/17318203.html
        // 将dropRef注入到标签中，则标签区域可接收拖拽物
        const [collected, dropRef] = useDrop({
            // 指明该区域允许接收的拖放物类别。可以是单个，也可以是数组
            accept: ['3d_resource'],
            // 返回该拖放区域当前是否可用
            canDrop: (item, monitor) => {
                return this._canDrop;
            },
            // 当拖拽物悬浮在拖放区域时调用
            hover: (item, monitor) => {
                return this.OnDrag(item, monitor);
            },
            // 当拖拽物被拖拽进来是调用
            drop: (item, monitor) => {
                // 拖拽物的end方法则可以通过monitor.getDropResult()来获取这个返回值
                return this.OnDrop(item, monitor);
            }
        }, []);

        return (
            <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "block",
            }}>
                <div ref={dropRef} style={{ width: "100%", height: "100%" }}>
                    <div ref={this._containerRef} style={{ width: "100%", height: "100%" }}></div>
                </div>
            </div>
        );
    }

    /**
     * 当拖拽物悬浮在拖放区域时调用。
     * @param item 记录了拖拽物携带的数据。
     * @param monitor 记录了拖放区域内拖拽物状态信息。
     */
    public OnDrag(item: any, monitor: any) {
        // ...
    }

    /**
     * 响应拖拽物放下。
     * @param item 记录了拖拽物携带的数据。
     * @param monitor 记录了拖放区域内拖拽物状态信息。
     */
    public OnDrop(item: any, monitor: any) {
        return {};
    }

    /** 应用实例。 */
    private _app: PloyApp_editor;

    /** 容器元素引用（用于挂载、卸载画布）。*/
    private _containerRef: React.RefObject<HTMLDivElement>;
    /** 3D画布元素。 */
    private _canvas3d: HTMLCanvasElement;
    /** 2D画布元素。 */
    private _canvas2d: HTMLCanvasElement;

    /** 3D编辑器页面装载回调。 */
    private _onMount = () => { };
    /** 3D编辑器页面卸载回调。 */
    private _onUnmount = () => { };
    /** 3D编辑器页面是否已装载。 */
    private _mounted = false;
    /** 当前编辑器区域是否接收拖拽物。 */
    private _canDrop = true;

    /** 标签页设置。 */
    private _tab: molecule.model.IEditorTab = {
        id: 10001,
        name: '场景编辑器',
        closable: false,
        editable: false,
        renderPane: () => {
            return this.Render();
        }
    };
}
