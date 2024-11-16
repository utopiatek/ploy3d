import { Ploy3D, PloyApp, SimpleSignal, PackageReg, Scene, Object3D, Camera, Volume, Assembly, Material, DrawQueue, Package, Prefab, Dioramas_3mx, IDataProvider, UserSpace, CLASSID, Vector3 } from "../../dist/esm/mod.js"
import { React, ReactDOM, molecule, create, Workbench, SaveAction, HTML5Backend, DndProvider, useDrop, eruda, echarts } from "../../lib/molecule.js"
import { Hierarchy } from "./hierarchy.js";
import { Packages } from "./packages.js";
import { Assets } from "./assets.js";
import { UIEditor, UIPanelProps } from "./ui.js";

declare var antd: typeof import('antd');

export class PloyApp_editor extends PloyApp {
    /**
     * 构造函数。
     * @constructor
     * @param engine 引擎实例。
     */
    public constructor(engine: Ploy3D) {
        super(engine);

        // ====================------------------------------------------------

        // 先完成场景初始化，设置登录完成回调
        let login_callback: () => void;
        // 先完成登录，缓存登录信息
        let login_info: PloyApp_editor["_userInfo"];
        // 场景初始化完成后调用该方法
        this._login = (callback) => {
            if (login_info) {
                this.SetUser(login_info).then(callback).catch(e => {
                    console.error(e);
                    alert(e);
                });
            }
            else {
                login_callback = callback;
            }
        };

        (globalThis as any).setUser = (userInfo: PloyApp_editor["_userInfo"]) => {
            if (iframe) {
                document.body.removeChild(iframe);
                iframe = undefined;

                if (login_callback) {
                    this.SetUser(userInfo).then(login_callback).catch(e => {
                        console.error(e);
                        alert(e);
                    });
                }
                else {
                    login_info = userInfo;
                }
            }
            else {
                this.SetUser(userInfo);
            }
        };

        // ====================------------------------------------------------

        let iframe = document.createElement("iframe");
        iframe.src = document.location.origin + "/serv/admin";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.borderWidth = "0";
        iframe.style.position = "absolute";
        iframe.style.zIndex = "1000";
        iframe.style.backgroundColor = "#292929";
        iframe.onload = (e) => {
            console.info("登录页面装载成功");
        };

        document.title = "PLOY3D编辑器[删档测试]";
        document.body.appendChild(iframe);

        // ====================------------------------------------------------

        const container = document.getElementById("eruda");

        eruda.init({
            container: container,
            tool: ['console'],
            inline: true,
            useShadowDom: false,
            defaults: {
                theme: "Dark",
            }
        });

        container.style.all = "";
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
        this.object3d = await resources.Object.Create(this.scene, "Main Camera");
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
                "early_z",      // 0
                "opaque",       // 1
                "blit",         // 2
            ];

            this.framePassList.framePass = this.framePassList.framePassName.map((label) => {
                return engine.assembly.GetFramePass(label);
            });

            this.framePassList.framePass[2].shaderMacro.BLIT_CANVAS_COMBINE_SSS = 0;
            this.framePassList.framePass[2].shaderMacro.BLIT_CANVAS_COMBINE_BLOOM = 0;
            this.framePassList.framePass[2].shaderMacro.BLIT_CANVAS_TONE_MAPPING = 0;
        }

        // 创建地球大气层对象
        await this.CreateAtmosphere(this.scene);

        // 创建变换组件控制器工具
        await this.CreateTransformCtrl(this.scene);

        // 启用GIS定位（如此3D对象才能锚定经纬度）
        this.engine.gis.enable = true;
        // 启用GIS地形
        this.engine.gis.enable_terrain = false;

        // 默认相机姿态
        this.camera.Set3D([0, 0, 0], 6000, 45, 0);
        this.camera.nearZ = 0.1;
        this.camera.farZ = 1000.0;
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
            else if ((e.buttons & 4) == 4) {
                // this.camera.Move(e.movementX, e.movementY, engine.width, engine.height);
                // this.DrawFrame(1);
            }
        });

        // 注册鼠标点击按下事件监听器
        this.AddEventListener("pointerdown", (() => {
            let click_times = 0;

            return async (e) => {
                const time = ++click_times;

                const point = [
                    (e.layerX * this.engine.config.devicePixelRatio) / this.engine.width,
                    (e.layerY * this.engine.config.devicePixelRatio) / this.engine.height
                ];

                if (this.sunlitSet && e.button == 0) {
                    const ray = this.camera.ScreenPointToRay(point[0], point[1]);
                    this.volume.sunlitDirection = ray.dir.values;
                    this.DrawFrame(2);
                    return;
                }

                engine.assembly.GetObjectInScreen(point[0], point[1]).then((hit) => {
                    if (time != click_times) {
                        return;
                    }

                    if (hit.material) {
                        const priv_color = hit.material.view.baseColorFactor;

                        this._editor.OnSelect({
                            object3d: hit.object3d,
                            material: hit.material,
                            color: priv_color ? { key: "baseColorFactor", value: priv_color } : undefined
                        });
                    }
                    else {
                        this._editor.OnSelect(null);
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

        // 刷新进度
        this.Progress(0.9, "完成场景初始化", true);

        // 等待用户登录完成
        await new Promise<void>((resolve) => {
            this._login(resolve);
        });

        // 触发一帧绘制，这样本机程序才会启动循环监听事件
        this.DrawFrame(10);

        // 设置每3秒调用一次的定时器（用于定期执行本地存储操作）
        const handle = setInterval(() => {
            this.OnInterval();
        }, 3000);

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

        const diors = this.engine.resources.Dioramas.GetInstanceList();
        for (let dior of diors) {
            if (dior && !this.diorsDisabled) {
                dior.Update(this.camera);
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

            // 绘制所有倾斜摄影模型
            const diors = this.engine.resources.Dioramas.GetInstanceList();
            for (let dior of diors) {
                if (dior && !this.diorsDisabled) {
                    dior.Draw(queue);
                }
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
        const callbacks = this._snapshotWaits;
        const count = list.length;
        const queue = this._drawQueue;
        const surface = this.engine.config.surface as HTMLCanvasElement;
        const gisState = this.engine.env.gisState;

        this._snapshotTasks = [];
        this._snapshotWaits = [];

        this.engine.assembly.config.renderTargets.scale = 0.125;
        this.engine.device.Resize(128, 128);
        this.engine.config.surface = null;
        this.engine.env.gisState = 0;

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
            this.engine.env.gisState = gisState;
            console.error("快照完成");
            queue["Flush"]();
            this.DrawFrame(1);

            for (let callback of callbacks) {
                callback();
            }
        }).catch((e) => {
            this.engine.assembly.config.renderTargets.scale = 1.0;
            this.engine.config.surface = surface;
            this.engine.env.gisState = gisState;
            console.error(e);
            queue["Flush"]();
            this.DrawFrame(1);

            for (let callback of callbacks) {
                callback();
            }
        });
    }

    /**
     * 添加资源包快照任务。
     * @param menu 
     * @param callback 
     */
    public AddSnapshot(menu: PackageReg["menu"], callback: () => void) {
        this._snapshotTasks.push(menu);
        this._snapshotWaits.push(callback);
    }

    /** 场景实例。 */
    public scene: Scene;
    /** 承载相机组件和体积组件的3D对象实例。 */
    public object3d: Object3D;
    /** 相机组件实例。 */
    public camera: Camera;
    /** 体积组件实例。 */
    public volume: Volume;
    /** 自定义渲染管线帧通道列表。 */
    public framePassList: ReturnType<Assembly["GetFramePassList"]>;

    /** 启用太阳光照方向设置。 */
    public sunlitSet: boolean;
    /** 禁用倾斜摄影。 */
    public diorsDisabled: boolean;

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
            let link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/mo.css";
            document.head.appendChild(link);

            link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/react-grid-layout-styles.css";
            document.head.appendChild(link);

            link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/react-resizable-styles.css";
            document.head.appendChild(link);

            globalThis.React = React;
            globalThis.echarts = echarts;

            await new Promise<void>((resolve) => {
                const script = document.createElement("script");
                script.src = "./lib/dayjs.min.js";
                script.onload = resolve as any;
                document.head.appendChild(script);
            });

            await new Promise<void>((resolve) => {
                const script = document.createElement("script");
                script.src = "./lib/antd.min.js";
                script.onload = resolve as any;
                document.head.appendChild(script);
            });

            await new Promise<void>((resolve) => {
                const script = document.createElement("script");
                script.src = "./lib/ant-design-icons.min.js";
                script.onload = resolve as any;
                document.head.appendChild(script);
            });

            link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/reset.min.css";
            document.head.appendChild(link);
        }

        // 创建molecule实例
        this._moleculeInst = create({
            extensions: this._extensionList
        });

        // 界面还未初始化，扩展也还没加载，在此时修改框架内置逻辑
        this._moleculeInst.onBeforeInit(() => {
            this.OnBeforeMoleculeInit();
        });

        // 定义工作台组件
        this._workbenchCom = () => this._moleculeInst.render(
            <antd.ConfigProvider
                theme={{
                    algorithm: antd.theme.darkAlgorithm,
                    token: {
                        // 组件容器背景色
                        colorBgContainer: 'rgba(15, 13, 40, 0.0)',
                        // 描述文本颜色
                        colorTextDescription: "rgba(255, 255, 255, 1.0)",
                    },
                }}
            >
                <Workbench />
            </antd.ConfigProvider>
        );

        // 编辑器实例
        this._editor = new Editor(this);
        // UI编辑器实例
        this._uiEditor = new UIEditor(this);

        // 渲染页面
        ReactDOM.render((
            <React.StrictMode>
                <DndProvider backend={HTML5Backend}>
                    <this._workbenchCom />
                </DndProvider>
            </React.StrictMode>
        ), document.getElementById('root'));

        // 当前Molecule界面渲染完成
        await this.onBeforeMoleculeLoad();

        // 打开场景编辑标签页
        await this._editor.Open();

        progress(1.0, "完成窗口创建");

        return true;
    }

    /**
     * 在Molecule界面初始化前、扩展加载前调用（在此处修改框架内置逻辑）。
     */
    private async OnBeforeMoleculeInit() {
        const { editor, editorTree } = molecule;
        const confirm = molecule.component.Modal.confirm;
        const config = this._moleculeInst.getConfig();
        const ExtendsEditor = config.extensions[1];
        const ExtendsEditorTree = config.extensions[4];

        // 获取指定分组内需要保存的标签页（可指定仅检测返回某个标签页）
        const needSave = (groupId: string, tabId?: string) => {
            const state = editorTree.getState();
            const tabs = [];
            if (tabId) {
                for (let group of state.groups) {
                    if (group.id == groupId) {
                        for (let tab of group.data) {
                            if (tab.id == tabId) {
                                if (tab.status == "edited" || tab.id == 10001) {
                                    tabs.push(tab);
                                }
                            }
                        }
                    }
                }
            }
            else {
                for (let group of state.groups) {
                    if (group.id == groupId) {
                        for (let tab of group.data) {
                            if (tab.status == "edited" || tab.id == 10001) {
                                tabs.push(tab);
                            }
                        }
                    }
                }
            }

            return tabs;
        };

        // 保存标签页的最新数据
        const doSave = (tabs: ReturnType<typeof needSave>) => {
            for (let tab of tabs) {
                if (tab.id == 10001) {
                    this._editor.AddTask(async () => {
                        await this._editor.Save();
                    });
                }
                else {
                    const userSpace = this.engine.resources.userSpace;
                    userSpace.Update(tab.id as string, tab.data.value);
                }

                tab.status = undefined;

                // 如果不指定分组ID，则所有分组相同ID的标签页都会刷新
                editor.updateTab(tab);
            }
        };

        // 关闭标签页并在关闭前询问是否需要保存
        const doClose = (tabId: string, groupId: string, close: (tabId: string, groupId: string) => void) => {
            const saveList = needSave(groupId, tabId);
            if (saveList && saveList.length > 0) {
                confirm({
                    title: saveList.length == 1 ? `是否要保存对 ${saveList[0].name} 的更改？` : `是否要保存对该组所有文件的更改？`,
                    content: '如果不保存，你的更改将会丢失。',
                    okText: "保存",
                    cancelText: "不保存",
                    onOk() {
                        doSave(saveList);
                        close(tabId, groupId);
                    },
                    onCancel() {
                        close(tabId, groupId);
                    },
                });
            }
            else {
                close(tabId, groupId);
            }
        };

        // 检测光标当前悬浮在哪个标签页分组上，并返回该分组ID
        const hoverGroup = (tabItem: any, groupId: any) => {
            const state = editor.getState();
            const groups = state.groups;

            // 获得触发事件时鼠标所在分组
            for (let group of groups) {
                for (let tab of group.data) {
                    if (tab === tabItem) {
                        groupId = group.id;
                        break;
                    }
                }
            }

            return groupId;
        };

        // 关闭光标所在分组内的指定标签页之外的所有标签页（需确认是否要保存）
        const closeOther = (tabItem: any, groupId: any) => {
            groupId = hoverGroup(tabItem, groupId);

            if (tabItem && groupId !== undefined) {
                doClose(undefined, groupId as string, (tabId, groupId) => {
                    editor.closeOther(tabItem, groupId);
                });
            }
        };

        // 关闭光标所在分组内的指定标签页左边的所有标签页（需确认是否要保存）
        const closeToLeft = (tabItem: any, groupId: any) => {
            groupId = hoverGroup(tabItem, groupId);

            if (tabItem && groupId !== undefined) {
                doClose(undefined, groupId as string, (tabId, groupId) => {
                    editor.closeToLeft(tabItem, groupId);
                });
            }
        };

        // 关闭光标所在分组内的指定标签页右边的所有标签页（需确认是否要保存）
        const closeToRight = (tabItem: any, groupId: any) => {
            groupId = hoverGroup(tabItem, groupId);

            if (tabItem && groupId !== undefined) {
                doClose(undefined, groupId as string, (tabId, groupId) => {
                    editor.closeToRight(tabItem, groupId);
                });
            }
        };

        // 关闭指定分组内的指定标签页（需确认是否要保存）
        const closeTab = (tabId: any, groupId: any) => {
            if (tabId !== undefined && groupId !== undefined) {
                doClose(tabId as string, groupId as string, (tabId, groupId) => {
                    editor.closeTab(tabId, groupId);
                });
            }
        };

        // 关闭指定分组内的或全部标签页（需确认是否要保存）
        const closeAll = (groupId: any) => {
            if (groupId !== undefined) {
                doClose(undefined, groupId as string, (tabId, groupId) => {
                    editor.closeAll(groupId);
                });
            }
        };

        // 默认使用中文界面
        config.defaultLocale = "zh-CN";

        // 定制修改编辑器扩展的默认事件绑定
        ExtendsEditor.activate = () => {
            editor.onCloseTab(closeTab);
            editor.onCloseAll(closeAll);
            editor.onCloseOther(closeOther);
            editor.onCloseToLeft(closeToLeft);
            editor.onCloseToRight(closeToRight);
        };

        // 定制修改文件树扩展的默认事件绑定
        ExtendsEditorTree.activate = () => {
            editorTree.onSelect((tabId, groupId) => {
                editor.setActive(groupId, tabId);
            });

            editorTree.onClose(closeTab);
            editorTree.onCloseOthers(closeOther);
            editorTree.onCloseAll((groupId) => {
                if (groupId) {
                    closeAll(groupId);
                }
                else {
                    const { groups } = editor.getState();
                    groups?.forEach((group) => {
                        closeAll(group.id);
                    });
                }
            });

            editorTree.onSaveAll((groupId) => {
                if (groupId) {
                    const saveList = needSave(groupId as string);
                    if (saveList && saveList.length > 0) {
                        doSave(saveList);
                        this.Notify("保存成功。", "info");
                    }
                }
                else {
                    const { groups } = editor.getState();
                    groups?.forEach((group) => {
                        const saveList = needSave(group.id as string);
                        if (saveList && saveList.length > 0) {
                            doSave(saveList);
                            this.Notify("保存成功。", "info");
                        }
                    });
                }
            });
        };

        // 快捷键保存事件响应
        SaveAction.prototype.run = (accessor: any, ...args: any[]) => {
            const state = molecule.editor.getState();
            const tab = state.current?.tab;
            if (tab && tab.status == "edited") {
                doSave([tab]);
                this.Notify("保存成功。", "info");
            }
        };

        // 禁用文件时间线折叠面板
        molecule.builtin.inactiveModule("builtInExplorerOutlinePanel");
        molecule.explorer.setExpandedPanels(['sidebar.explore.openEditor', 'sidebar.explore.folders']);

        // 辅助侧边栏
        molecule.auxiliaryBar.setMode('tabs');
        molecule.auxiliaryBar.addAuxiliaryBar(this._auxiliaryTabs);
        molecule.auxiliaryBar.onTabClick(() => {
            const tab: any = molecule.auxiliaryBar.getCurrentTab();

            if (tab) {
                molecule.auxiliaryBar.setChildren(<tab.render />);
            }

            molecule.layout.setAuxiliaryBar(!tab);
        });
    }

    /**
     * 在Molecule界面初始化后、扩展加载前调用。
     */
    private async onBeforeMoleculeLoad() {
        type IFolderTreeNodeProps = molecule.model.IFolderTreeNodeProps;
        type IEditorTab = molecule.model.IEditorTab;

        const Float_right = molecule.model.Float.right;
        const statusBar = molecule.statusBar;
        const { activityBar, panel, extension, explorer, editorTree, folderTree, editor } = molecule;

        await new Promise<void>((resolve) => {
            this._moleculeInst.onBeforeLoad(() => {
                // 进行扩展配置修改 ...

                resolve();
            });
        });

        // ====================------------------------------------------------

        // 用户中心标签页设置
        const userCenter: molecule.model.IEditorTab = {
            id: 10002,
            name: '用户中心',
            closable: true,
            editable: false,
            icon: "account",
            renderPane: () => {
                return (
                    <div style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "block",
                    }}>
                        <iframe src={document.location.origin + "/serv/admin"} style={{
                            transform: "scale(1.0)", // "scale(0.85)",
                            transformOrigin: "0 0",
                            width: "100%", // "118%",
                            height: "100%", // "118%",
                            borderWidth: 0
                        }} onLoad={(e: any) => {
                            // 已打开页面，需要在该页面中完成登录并跳转到用户中心页面
                        }}>
                        </iframe>
                    </div>
                );
            }
        };

        // 移除问题面板
        panel.remove("panel.problems.title");
        // 默认激活输出面板
        panel.setActive('panel.output.title');
        // 设置CTRL+S保存快捷键
        extension.registerAction(SaveAction);

        // 设置激活栏按钮事件响应
        activityBar.onClick((key: string) => {
            if (key == "global.menu.account") {
                editor.open(userCenter);
            }
        });

        // ====================------------------------------------------------

        // 从文件树节点构造文件编辑标签页
        const TransformToEditorTab = (item: IFolderTreeNodeProps) => {
            const userSpace = this.engine.resources.userSpace;
            const node = userSpace.GetNode(item.id as string);
            const tab: IEditorTab = {
                id: item.id,
                name: item.name,
                icon: "file",
                editable: true,
                status: node.data.status,
                breadcrumb: [],
                data: {
                    path: node.location,
                    ...node.data,
                } as any,
            };

            if (tab.data.path) {
                tab.breadcrumb = tab.data.path.split('/').map((local) => ({ id: local, name: local }))
            }

            return tab;
        };

        // 刷新文件编辑状态栏
        const UpdateStatusBarLanguage = (language: string) => {
            if (language) {
                language = language.toUpperCase();

                let barItem = statusBar.getStatusBarItem('LanguageStatus', Float_right);
                if (barItem) {
                    barItem.name = language;
                    statusBar.update(barItem, Float_right);
                } else {
                    barItem = {
                        id: 'LanguageStatus',
                        sortIndex: 3,
                        name: language,
                    };

                    molecule.statusBar.add(barItem, Float_right);
                }
            }
        };

        // 根据当前选择的文件编辑标签页刷新文件编辑状态栏
        editor.onSelectTab((tabId, groupId) => {
            if (groupId) {
                const group = editor.getGroupById(groupId);
                if (group) {
                    const tab: any = editor.getTabById(tabId, group.id!);
                    if (tab) {
                        UpdateStatusBarLanguage(tab.data?.language);
                    }
                }
            }
        });

        // 响应新建文件或新建文件夹
        folderTree.onCreate((type, id) => {
            // 确保已打开用户文件空间
            if (this._userInfo?.opened_us) {
                const userSpace = this.engine.resources.userSpace;
                let parent = "user_space";
                let current = folderTree.getState().folderTree?.current;
                if (current) {
                    const node = userSpace.GetNode(current.id as string);
                    if (node.fileType == "File") {
                        const location = node.location;
                        parent = location.substring(0, location.lastIndexOf('/'));
                    }
                    else {
                        parent = node.location;
                    }
                }

                if (type == "Folder") {
                    const newFolder = userSpace.New(0, "新建文件夹" + userSpace.GetNextIdx(0), parent);
                    folderTree.update(userSpace.root);
                    folderTree.emit("folderTree.onRename", newFolder.id);
                }
                else {
                    const newFile = userSpace.New(16/*CLASSID.ASSET_CUSTOM*/, "新建文件" + userSpace.GetNextIdx(16), parent);
                    folderTree.update(userSpace.root);
                    folderTree.emit("folderTree.onRename", newFile.id);
                }
            }
        });

        // 响应文件或文件夹名变更
        folderTree.onUpdateFileName((node) => {
            const userSpace = this.engine.resources.userSpace;
            if (userSpace.Rename(node.id as string, node.name)) {
                const node_ = userSpace.GetNode(node.id as string);

                node.name = node_.name;

                if (node.name.endsWith('json')) {
                    node_.data.language = 'json';
                    node.data.language = 'json';
                }
                else if (node.name.endsWith('css')) {
                    node_.data.language = 'css';
                    node.data.language = 'css';
                }
                else if (node.name.endsWith('html')) {
                    node_.data.language = 'html';
                    node.data.language = 'html';
                }
                else if (node.name.endsWith("ts")) {
                    node_.data.language = 'typescript';
                    node.data.language = 'typescript';
                }
                else if (node.name.endsWith("js")) {
                    node_.data.language = 'javascript';
                    node.data.language = 'javascript';
                }
            }
        });

        // 响应文件或文件夹删除
        folderTree.onRemove((id) => {
            const userSpace = this.engine.resources.userSpace;
            userSpace.Delete(id as string);
            folderTree.update(userSpace.root);
        });

        // 设置文件节点右键菜单
        folderTree.setFileContextMenu([
            {
                id: "explorer.openToSide",
                name: "在侧边打开",
                onClick: (e, item) => {
                    let current = molecule.folderTree.getState().folderTree?.current;
                    if (current) {
                        if (current.fileType == "File") {
                            if (current.classid == CLASSID.ASSET_PREFAB) {
                                this._editor.AddTask(async () => {
                                    const scene = await this._editor.NewScene(current.id as string);
                                    this._editor.EditScene(scene.collapse.id as string);
                                });
                            }
                            else if (current.classid == CLASSID.ASSET_UI_PANEL) {
                                const userSpace = this.engine.resources.userSpace;
                                userSpace.GetData(current.id as string).then((value) => {
                                    current.data.value = value;

                                    let tab = TransformToEditorTab(current);
                                    tab.name = "UI编辑器";
                                    tab.icon = "preview";
                                    tab.renderPane = () => {
                                        const data: UIPanelProps = JSON.parse(value as string);
                                        return <this.uiEditor.renderEditor uiid={"uiid"} data={data} onUpdate={(data_) => {
                                            console.error("-------------------- update!");
                                        }} />
                                    };

                                    molecule.editor.open(tab);
                                    UpdateStatusBarLanguage(current.data?.language);
                                });
                            }
                            else if (current.data.value === null || current.data.value === undefined) {
                                const userSpace = this.engine.resources.userSpace;
                                userSpace.GetData(current.id as string).then((value) => {
                                    current.data.value = value;

                                    let tab = TransformToEditorTab(current);
                                    molecule.editor.open(tab);
                                    UpdateStatusBarLanguage(current.data?.language);
                                });
                            }
                            else {
                                let tab = TransformToEditorTab(current);
                                molecule.editor.open(tab);
                                UpdateStatusBarLanguage(current.data?.language);
                            }
                        }
                    }
                }
            }
        ]);

        // 数据接口配置文件默认内容
        const defaultDataProviderContent = (() => {
            const content: IDataProvider<any> = {
                uuid: "",
                label: "柱状图测试数据接口",
                desc: "柱状图测试数据接口",
                uri_type: "none",
                uri: "",
                inputs: null,
                polling: 0,
                expire: Number.MAX_VALUE,
                success: true,
                message: "",
                data: {
                    source: [
                        ['product', '2015', '2016', '2017'],
                        ['Matcha Latte', 43.3, 85.8, 93.7],
                        ['Milk Tea', 83.1, 73.4, 55.1],
                        ['Cheese Cocoa', 86.4, 65.2, 82.5],
                        ['Walnut Brownie', 72.4, 53.9, 39.1]
                    ]
                }
            };

            return JSON.stringify(content, null, 4);
        })();

        // UI面板配置数据文件默认内容
        const defaultUIPanelContent = (() => {
            const content: UIPanelProps = {
                uuid: "",
                label: "UI面板配置",
                desc: "UI面板配置",
                uri_type: "none",
                uri: "",
                inputs: null,
                polling: 0,
                expire: Number.MAX_VALUE,
                success: true,
                message: "",
                data: {
                    increment_id: 1,
                    layouts: {
                        "lg": []
                    } as any,
                    components: [],
                    dataset: {}
                }
            };

            return JSON.stringify(content, null, 4);
        })();

        // 新建指定类型文件
        const newFile = (classid: number, folder: string, name: string, ext: string, lang: string, content?: any) => {
            // 确保已打开用户文件空间
            if (!this._userInfo?.opened_us) {
                return;
            }

            const userSpace = this.engine.resources.userSpace;
            let parent = "user_space";
            if (folder) {
                const node = userSpace.GetNode(folder);
                if (node.fileType == "File") {
                    const location = node.location;
                    parent = location.substring(0, location.lastIndexOf('/'));
                }
                else {
                    parent = node.location;
                }
            }

            const newFile = userSpace.New(classid, name + userSpace.GetNextIdx(classid) + ext, parent);

            newFile.data.language = lang;

            if (content) {
                userSpace.Update(newFile.id, content);
            }

            folderTree.update(userSpace.root);
            folderTree.emit("folderTree.onRename", newFile.id);
        };

        // 添加用户空间提交按钮
        const explorerState = molecule.explorer.getState();
        {
            const folderTreeToolbar = explorerState.data[1].toolbar;

            folderTreeToolbar[0].contextMenu = [
                {
                    id: "explorer.newScript",
                    name: "新建脚本",
                    disabled: false,
                    sortIndex: 0,
                    onClick: (e, item) => {
                        const userSpace = this.engine.resources.userSpace;
                        const folder = userSpace.GetFolder("user_space/scripts");
                        newFile(CLASSID.ASSET_SCRIPT, folder.id, "script", ".js", "javascript");
                    }
                },
                {
                    id: "explorer.newDataProvider",
                    name: "新建数据接口",
                    disabled: false,
                    sortIndex: 0,
                    onClick: (e, item) => {
                        const userSpace = this.engine.resources.userSpace;
                        const folder = userSpace.GetFolder("user_space/datas");

                        newFile(CLASSID.ASSET_DATA_PROVIDER, folder.id, "data_provider", ".json", "json", defaultDataProviderContent);
                    }
                },
                {
                    id: "explorer.newPanel",
                    name: "新建UI面板",
                    disabled: false,
                    sortIndex: 0,
                    onClick: (e, item) => {
                        const userSpace = this.engine.resources.userSpace;
                        const folder = userSpace.GetFolder("user_space/ui/panels");

                        newFile(CLASSID.ASSET_UI_PANEL, folder.id, "ui_panel", ".json", "json", defaultUIPanelContent);
                    }
                },
            ];

            folderTreeToolbar[4] = folderTreeToolbar[3];
            folderTreeToolbar[3] = folderTreeToolbar[2];
            folderTreeToolbar[2] = {
                title: "提交",
                id: "submit",
                icon: "repo-push"
            };

            explorer.setState({ ...explorerState });
        }

        folderTree.setFolderContextMenu([
            { id: "explorer.newScript", name: "新建脚本" },
            { id: "explorer.newDataProvider", name: "新建数据接口" },
            { id: "explorer.newPanel", name: "新建UI面板" },
            { id: "explorer.newFolder", name: "新建文件夹" },
        ]);

        folderTree.onContextMenu((item, node) => {
            if (item.id == "explorer.newScript") {
                newFile(CLASSID.ASSET_SCRIPT, node.id as string, "script", ".js", "javascript");
            }
            else if (item.id == "explorer.newDataProvider") {
                newFile(CLASSID.ASSET_DATA_PROVIDER, node.id as string, "data_provider", ".json", "json", defaultDataProviderContent);
            }
            else if (item.id == "explorer.newPanel") {
                newFile(CLASSID.ASSET_UI_PANEL, node.id as string, "ui_panel", ".json", "json", defaultUIPanelContent);
            }
            else {
                console.error(item, node);
            }
        });

        // 设置响应折叠用户空间所有文件夹
        explorer.onCollapseAllFolders(() => {
            folderTree.setExpandKeys([]);
        });

        // 响应移动文件或文件夹
        folderTree.onDropTree((source, target) => {
            if (source && target) {
                const userSpace = this.engine.resources.userSpace;
                if (!target.name) {
                    userSpace.Move(source.id as string, "0_1");
                }
                else {
                    userSpace.Move(source.id as string, target.id as string);
                }

                folderTree.update(userSpace.root);
            }
        });

        // 设置用户文件空间工具栏按钮事件
        explorer.onPanelToolbarClick(async (panel, toolbarId) => {
            if (panel.id == 'sidebar.explore.folders') {
                if (toolbarId == 'refresh') {
                    const userSpace = this.engine.resources.userSpace;
                    folderTree.update(userSpace.root);
                    this.Notify("已刷新。", "info");
                }
                else if (toolbarId == "submit") {
                    try {
                        await this.Submit();
                        this.Notify("用户空间文件提交操作结束。", "info");
                    }
                    catch (e) {
                        this.Notify(`用户空间提交异常：${e}！`, "error", true);
                    }
                }
            }
        });

        // 打开场景编辑标签页（我们替换了布局按钮的用途）
        editorTree.onLayout(() => {
            this._editor.Open();
        });

        // 设置标签页内容更新响应方向
        editor.onUpdateTab((tab) => {
            tab.status = "edited";
            const userSpace = this.engine.resources.userSpace;
            userSpace.GetNode(tab.id as string).data.status = "edited";
            // 如果不指定groupId，则所有分组的同id tab都会更新
            molecule.editor.updateTab(tab);
        });
    }

    /**
     * 提交用户文件空间到云端。
     */
    public async Submit() {
        const userInfo = this._userInfo;
        if (userInfo.submitting_us) {
            this.Notify("上一提交未完成，请等待！", "warn");
            return;
        }

        userInfo.submitting_us = true;

        const engine = this.engine;
        const userSpace = engine.resources.userSpace;
        const submitData = await userSpace.Submit();
        if (!submitData) {
            userInfo.submitting_us = false;
            this.Notify("提交内容为空，操作取消！", "warn");
        }

        this.Notify("开始提交用户文件空间。", "info");

        const Upload = async () => {
            const res_ask: any = await engine.Request("POST", document.location.origin + "/serv/upload_ask", "json", JSON.stringify(submitData.form), 'application/json', null);
            if (res_ask?.success) {
                const policy = res_ask.data;
                const datas = submitData.data.files.datas;
                const signatures: string[] = [];

                for (let i = 0; i < policy.files.length; i++) {
                    const info = policy.files[i];
                    const data = datas[i];

                    const form = new FormData();
                    form.append("OSSAccessKeyId", policy.accessid);
                    form.append("policy", policy.policy);
                    form.append("signature", policy.signature);
                    form.append("key", policy.dir + info.path);
                    form.append("callback", policy.callback);
                    form.append("success_action_status", "200");
                    form.append("file", data.data);
                    form.append("x:sign", info.sign);

                    const res_upload: any = await engine.Request("POST", policy.host, "json", form, null, null);
                    if (res_upload?.success) {
                        signatures.push(res_upload.message);
                        this.Notify(`上传文件成功：${info.path}！`, "info");
                    }
                    else {
                        signatures.push("");
                        this.Notify(`上传文件失败：${info.path}，${res_upload.message}！`, "error");
                    }
                }

                return { usage: "user_spaces", upload_id: policy.upload_id as number, signatures: signatures.join() };
            }
            else {
                this.Notify(res_ask.message, "warn");
                return null;
            }
        };

        const Verify = async (info: { upload_id: number, signatures: string }) => {
            const res_verify: any = await engine.Request("POST", document.location.origin + "/serv/upload_verify", "json", JSON.stringify(info), 'application/json', null);
            if (res_verify?.success) {
                this.Notify(`上传验证成功。`, "info");
                return res_verify.data;
            }
            else {
                this.Notify(res_verify?.message, "warn");
                return null;
            }
        };

        const upload_res = await Upload();
        if (!upload_res) {
            submitData.callback(-1);
            userInfo.submitting_us = false;
            this.Notify("上传请求遭拒绝！", "warn");
            return;
        }

        const res = await Verify(upload_res);
        if (!res) {
            submitData.callback(-1);
            userInfo.submitting_us = false;
            this.Notify("上传验证失败！", "warn");
            return;
        }

        submitData.callback(res);
        userInfo.version_us = res;
        userInfo.submitting_us = false;

        this.Notify("用户空间提交成功。", "info");
    }

    /**
     * 设置用户信息（每次进入用户中心都会触发该函数调用）。
     * @param userInfo 最新用户信息。
     */
    public async SetUser(userInfo: PloyApp_editor["_userInfo"]) {
        if (this._userInfo) {
            if (this._userInfo?.id != userInfo?.id) {
                if (confirm('您使用了不同账号登录，请刷新页面！')) {
                    location.reload();
                } else {
                    location.reload();
                }

                return;
            }
            else {
                this._userInfo = {
                    ...this._userInfo || {},
                    ...userInfo
                };
            }
        }
        else {
            this._userInfo = userInfo;

            // 打开用户文件空间
            const url = `https://oss.ploycloud.com/user_spaces/${this._userInfo.code}/`;
            const userSpace = this.engine.resources.userSpace;
            const root = await userSpace.Open(url, this._userInfo.code, this.userInfo.version_us);
            molecule.folderTree.add(root, root.id);
            userInfo.opened_us = true;
        }

        this.engine.uid = this._userInfo.id;
        this.engine.worker.uid = this._userInfo.id;

        this.extensions.packages.refreshMy();
    }

    /**
     * 输出提示信息。
     * @param msg 提示信息。
     * @param level 提示信息级别。
     * @param log 是否在控制台输出提示信息。
     */
    public Notify(msg: string, level: "info" | "warn" | "error", log?: boolean): void {
        const id = this._notifyID++;
        const notification = molecule.notification;

        notification.add([
            {
                id: id,
                value: msg,
                render: (item: any) => {
                    return <div>{item.value}</div>
                }
            }
        ]);

        if (notification.getState().showNotifications == false) {
            notification.toggleNotification();
        }

        if (log) {
            if (level == "info") {
                console.info(msg);
            }
            else if (level == "warn") {
                console.warn(msg);
            }
            else if (level == "error") {
                console.error(msg);
            }
        }

        setTimeout(() => {
            notification.remove(id);

            if (id == (this._notifyID - 1) && notification.getState().showNotifications) {
                notification.toggleNotification();
            }
        }, 2000);
    }

    /**
     * 定时器调用。
     */
    public OnInterval() {
        this.engine.resources.userSpace.Store().then((b) => {
            if (b) {
                this.Notify("用户本地文件空间更新。", "info");
            }
        });
    }

    /** 场景编辑器。 */
    public get editor() {
        return this._editor;
    }

    /** UI编辑器。 */
    public get uiEditor() {
        return this._uiEditor;
    }

    /** 用户信息。 */
    public get userInfo() {
        return this._userInfo;
    }

    /** 扩展组件查找表。 */
    public get extensions() {
        return this._extensionLut;
    }

    /** 信号处理器查找表。 */
    public get signals() {
        return this._signalLut;
    }

    /** 工作台组件。 */
    private _workbenchCom: () => React.ReactElement;
    /** MO框架实例。 */
    private _moleculeInst: ReturnType<typeof create>;
    /** 提示信息ID。 */
    private _notifyID = 1;
    /** 3D标签页组件。 */
    private _editor: Editor;
    /** UI编辑器。 */
    private _uiEditor: UIEditor;
    /** 登录进程（场景加载完成后等待登录刷新） */
    private _login: (callback: () => void) => void;
    /** 用户信息。 */
    private _userInfo: {
        /** 用户ID。 */
        id: number;
        /** 用户全球唯一代码。 */
        code: string;
        /** 用户名称。 */
        name: string;
        /** 用户邮箱。 */
        email: string;
        /** 用户权限级别。 */
        level: number;
        /** 用户文件空间版本标识。 */
        version_us: number;

        /** 是否已打开用户文件空间。 */
        opened_us: boolean;
        /** 是否正在提交用户文件空间到云端。 */
        submitting_us: boolean;
    };
    /** 扩展组件查找表。 */
    private _extensionLut = {
        hierarchy: new Hierarchy(this),
        packages: new Packages(this),
        assets: new Assets(this),
    };
    /** 扩展组件列表。 */
    private _extensionList: molecule.model.IExtension[] = [
        this._extensionLut.hierarchy,
        this._extensionLut.packages,
        this._extensionLut.assets,
    ];
    /** 辅助侧边栏标签页数组。 */
    private _auxiliaryTabs: (molecule.model.IAuxiliaryData & { render?: () => React.ReactNode | JSX.Element; })[] = [
        {
            key: "ui_presets",
            title: '界面布局',
            render: () => {
                return this.uiEditor.renderSidebar();
            },
        },
    ];
    /** 信号处理器查找表。 */
    private _signalLut = {
        /** 资源包选择事件。 */
        select_package: new SimpleSignal<PackageReg, unknown>(),
        /** 3D对象选择事件。 */
        select_object: new SimpleSignal<PackageReg, unknown>(),
    };
    /** 资源包缩略图快照任务列表。 */
    private _snapshotTasks: PackageReg["menu"][] = [];
    /** 等待快照任务完成。 */
    private _snapshotWaits: (() => void)[] = [];
}

export class Editor {
    /**
     * 构造函数。
     * @param app 应用实例。
     */
    public constructor(app: PloyApp_editor) {
        this._app = app;
        this._queue = [];
        this._selectInfo = {};

        this._containerRef = React.createRef<HTMLDivElement>();
        this._canvas3d = document.getElementById("canvas3d") as HTMLCanvasElement;
        this._canvas2d = document.getElementById("canvas2d") as HTMLCanvasElement;

        this.Render = this.Render.bind(this);
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
            if (!this._mounted) {
                this._containerRef.current.appendChild(this._canvas3d);
                this._containerRef.current.appendChild(this._canvas2d);

                this._mounted = true;
                this._onMount();
            }

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

        const Toolbar = molecule.component.Toolbar;

        return (
            <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "block",
            }}>
                <Toolbar
                    key="editor_toobar"
                    style={{
                        display: "inline-flex",
                        marginLeft: "10px"
                    }}
                    data={this._toolbar}
                />
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
        const app = this._app;
        const engine = app.engine;
        const canvas = engine.config.surface as HTMLCanvasElement;
        const clientRect = canvas.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        const x = (offset.x - clientRect.left) / clientRect.width;
        const y = (offset.y - clientRect.top) / clientRect.height;

        // 实例化预制件
        if (item.classid == 65) {
            const pos = app.camera.HitHorizontal(x, y);
            // 在水平面构建实例
            if (pos.y == 0) {
                this.AddTask(async () => {
                    await this.AddPrefab(item.uuid, pos);
                });
            }
        }
        // 应用指定网格渲染器创建3D对象
        else if (item.classid == 48) {
            const pos = app.camera.HitHorizontal(x, y);
            // 在水平面构建实例
            if (pos.y == 0) {
                this.AddTask(async () => {
                    await this.AddMeshRenderer(item.uuid, pos);
                });
            }
        }

        return {};
    }

    /**
     * 响应3D目标选中。
     * @param target 3D目标。
     */
    public OnSelect(target: Editor["_selectInfo"]["currentInfo"]) {
        const transformCtrl = this._app["_transformCtrl"];
        if (transformCtrl) {
            const hit_ctrl = transformCtrl.Begin(target?.object3d);
            // 不响应变换组件控制器的选中事件
            if (hit_ctrl) {
                return;
            }
        }

        let cur = this._selectInfo.currentInfo;
        if (cur) {
            if (cur.material && cur.color) {
                cur.material.view[cur.color.key] = cur.color.value;
            }
        }

        this._selectInfo.lastInfo = cur;
        this._selectInfo.currentInfo = cur = target;

        if (target) {
            if (cur.material && cur.color) {
                cur.material.view[cur.color.key] = [1, 0, 0, 1];
            }
        }

        this._app.DrawFrame(2);

        return cur;
    }

    /** 
     * 添加编辑操作。
     */
    public AddTask(task: () => Promise<void>) {
        this._queue.push(task);

        if (!this._running) {
            this._app.Progress(0.1, "请等候处理... 平台启用CDN加速，首次回源缓存仍需要一定时间");
            this._running = true;

            let queue = this._queue;
            this._queue = [];

            (async () => {
                while (queue.length > 0) {
                    for (let func of queue) {
                        try {
                            await func();
                        }
                        catch (e) {
                            this._app.Notify(e, "error", true);
                        }
                    }

                    queue = this._queue;
                    this._queue = [];
                }

                this._running = false;
                this._app.Progress(-1, "");
            })();
        }
    }

    /** 
     * 更新场景状态。
     */
    public UpdateStatus() {
        const scene = this._app.extensions.hierarchy.scene;
        if (scene) {
            scene.updated = true;
            this._tab.status = "edited";
            this._tab.breadcrumb = [{ id: "0", name: "scenes" }, { id: "1", name: scene.collapse.name }];
        }
        else {
            this._tab.status = undefined;
            this._tab.breadcrumb = [{ id: "0", name: "scenes" }, { id: "1", name: "default" }];
        }

        molecule.editor.updateTab(this._tab);
    }

    /**
     * 检查当前是否为可编辑的有效状态。
     */
    public async IsValid() {
        const hierarchy = this._app.extensions.hierarchy;
        if (hierarchy.scene) {
            return true;
        }

        const confirm = molecule.component.Modal.confirm;

        const create = await new Promise<boolean>((resolve) => {
            confirm({
                title: `请先激活场景编辑状态`,
                content: '你可以从用户空间打开一个场景，或者点击以下按钮新建场景。',
                okText: "新建场景",
                cancelText: "取消",
                onOk: () => {
                    resolve(true);
                },
                onCancel: () => {
                    resolve(false);
                },
            });
        });

        if (create) {
            const scene = await this.NewScene();
            if (scene) {
                this.EditScene(scene.collapse.id as string);
                return true;
            }
        }

        return false;
    }

    /**
     * 新建或从场景文件加载。
     * @param id 如果指定ID则从场景文件加载。
     */
    public async NewScene(id?: string) {
        const hierarchy = this._app.extensions.hierarchy;
        const resources = this._app.engine.resources;
        const userSpace = resources.userSpace;

        let scene: Hierarchy["sceneLut"][""];
        let sceneFile: ReturnType<UserSpace["New"]>;
        let hasNew = false;

        // 指定了需要打开的场景
        if (id) {
            scene = hierarchy["sceneLut"][id];
            // 场景已打开
            if (scene) {
                this._app.Notify("场景已打开。", "info");
                return scene;
            }

            // 获取指定场景文件以确认其是否存在
            sceneFile = userSpace.GetNode(id);
        }

        // 未指定场景或场景文件无效，新建场景文件
        if (!sceneFile) {
            const sceneName = `scene${userSpace.GetNextIdx(CLASSID.ASSET_PREFAB)}.json`;
            sceneFile = userSpace.New(CLASSID.ASSET_PREFAB, sceneName, "user_space/prefabs");
            hasNew = true;
        }

        // 场景打开或新建均失败
        if (!sceneFile) {
            this._app.Notify("操作失败！", "error", true);
            return null;
        }

        // 创建场景实例
        const scene_ = await resources.Scene.Create();

        // 设置场景实例默认设置
        scene_.name = sceneFile.name;
        scene_.prefab.uuid = sceneFile.id;
        scene_.prefab.needSave = true;

        // 加载场景
        if (!hasNew) {
            const prefab = await this._app.engine.resources.Scene.InstancePrefab(scene_, "0-0-0-" + sceneFile.id, undefined, undefined, undefined, true);
            if (prefab) {
                this._app.Notify("场景加载成功。", "info");
            }
            else {
                this._app.Notify("场景加载失败！", "warn", true);
            }
        }

        // 场景标识ID
        const key = scene_.prefab.uuid;

        // 添加场景层级结构折叠面板
        scene = hierarchy.sceneLut[key] = {
            scene: scene_,
            collapse: {
                id: key,
                name: scene_.name,
                hidden: undefined,
                toolbar: undefined,
                renderPanel: () => {
                    return <hierarchy.renderHierarchy data={scene.hierarchy} contentMenu={[]} onSelect={(node) => {
                        hierarchy.onSelect(node);
                    }} />
                }
            },
            hierarchy: [],
            updated: true,
        };

        // 初次保存新建的场景
        if (hasNew) {
            await scene_.Save();
            this._app.Notify("场景创建成功。", "info");
        }

        return scene;
    }

    /**
     * 激活编辑指定场景。
     * @param id 
     */
    public async EditScene(id: string) {
        const hierarchy = this._app.extensions.hierarchy;
        const scene = hierarchy["sceneLut"][id];
        if (scene) {
            hierarchy.scene = scene;
            this._tab.breadcrumb = [{ id: "0", name: "scenes" }, { id: "1", name: scene.collapse.name }];
            molecule.editor.updateTab(this._tab);

            const gis = this._app.engine.gis;
            const wpos = gis.LL2WPOS(scene.scene.lnglat);
            const view = scene.scene.viewState;
            this._app.camera.Set3D(wpos, 1000, 45, 0);
            this._app.DrawFrame(2);
            if (view) {
                setTimeout(() => {
                    this._app.camera.Set3D(view.target, view.distance, view.pitch, view.yaw);
                    this._app.DrawFrame(2);
                }, 200);
            }
        }
    }

    /**
     * 向场景添加预制件实例。
     * @param uuid 
     * @param pos 
     * @returns 
     */
    public async AddPrefab(uuid: string, pos: Vector3) {
        const valid = await this.IsValid();
        if (!valid) {
            return null;
        }

        const scene = this._app.extensions.hierarchy.scene;

        const prefab = await this._app.engine.resources.Scene.InstancePrefab(scene.scene, uuid);

        if (prefab) {
            prefab.needSave = true;
            prefab.root.position = pos;
            this.OnSelect({
                object3d: prefab.root
            });
            this.UpdateStatus();
            this._app.DrawFrame(2);
            this._app.Notify("预制件实例化成功。", "info");
        }
        else {
            this._app.Notify(`预制件实例化失败：${uuid}！`, "warn");
        }

        return prefab;
    }

    /**
     * 添加网格渲染器组件。
     * @param uuid 
     * @param pos 
     * @returns 
     */
    public async AddMeshRenderer(uuid: string, pos: Vector3) {
        const valid = await this.IsValid();
        if (!valid) {
            return null;
        }

        const scene = this._app.extensions.hierarchy.scene;

        const object3d = await this._app.engine.resources.Object.Create(scene.scene, uuid, scene.scene.prefab);
        const meshRenderer = await this._app.engine.resources.MeshRenderer.Load(uuid);
        if (object3d && meshRenderer) {
            object3d.meshRenderer = meshRenderer;
            object3d.localPosition = pos;
            this.OnSelect({
                object3d: object3d
            });
            this.UpdateStatus();
            this._app.DrawFrame(2);
            this._app.Notify("对象实例化成功。", "info");
            return object3d;
        }
        else {
            this._app.Notify(`对象实例化失败：${uuid}！`, "warn");
        }

        return null;
    }

    /**
     * 创建倾斜摄影模型实例。
     * @param url 模型URL。
     * @returns 
     */
    public async AddDior(url: string) {
        // https://dior.hzbimu.com:6060/public/dior/tzsbd/Production_1.3mx

        const valid = await this.IsValid();
        if (!valid) {
            return null;
        }

        const scene = this._app.extensions.hierarchy.scene;

        const engine = this._app.engine;
        const dior = await engine.resources.Dioramas.Create_3mx(scene.scene, url);
        if (dior?.srs) {
            const wPos = engine.gis.LL2WPOS(dior.srs.ll_gcj02);
            this._app.camera.Set3D(wPos, 1000, 45, 0);
            this._app.DrawFrame(2);
            this.UpdateStatus();
        }

        return dior;
    }

    /**
     * 保存场景。
     */
    public async Save() {
        const scene = this._app.extensions.hierarchy.scene;
        if (scene) {
            await scene.scene.Save();
        }
    }

    /** 应用实例。 */
    private _app: PloyApp_editor;
    /** 编辑任务队列。 */
    private _queue: (() => Promise<void>)[];
    /** 正在执行编辑任务。 */
    private _running: boolean;

    /** 当前选中信息。 */
    private _selectInfo: {
        /** 当前选中信息。 */
        currentInfo?: {
            /** 选中的3D对象。 */
            object3d: Object3D;
            /** 选中的子网格索引。 */
            submesh?: number;
            /** 选中的材质。 */
            material?: Material;
            /** 选中的材质颜色（我们期望选中时临时改变材质颜色，取消选中后还原颜色）。 */
            color?: { key: string; value: number[]; }
        };
        /** 上一选中信息。 */
        lastInfo?: {
            /** 选中的3D对象。 */
            object3d: Object3D;
            /** 选中的子网格索引。 */
            submesh?: number;
            /** 选中的材质。 */
            material?: Material;
            /** 选中的材质颜色（我们期望选中时临时改变材质颜色，取消选中后还原颜色）。 */
            color?: { key: string; value: number[]; }
        };
    };

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
        icon: "browser",
        closable: true,
        editable: true,
        status: undefined,
        breadcrumb: [{ id: "0", name: "scenes" }, { id: "1", name: "default" }],
        renderPane: () => {
            return <this.Render></this.Render>;
        }
    };

    /** 编辑工具栏设置。 */
    private _toolbar: molecule.component.IActionBarItemProps[] = [
        {
            id: 'add',
            title: '添加',
            name: '添加',
            icon: 'add',
            disabled: false,
            contextMenu: [
                {
                    id: "add_dior",
                    name: "倾斜摄影模型(3MX)",
                    disabled: false,
                    sortIndex: 0,
                    onClick: (e, item) => {
                        const confirm = molecule.component.Modal.confirm;
                        const Icon = molecule.component.Icon;
                        const Input = molecule.component.Input;
                        const this_ = this;

                        let url = "";

                        confirm({
                            title: "请填写.3mx文件URL",
                            content: (() => {
                                return (
                                    <>
                                        <div>请确保您的模型能被(https://www.ploycloud.com/)访问。</div>
                                        <Input style={{ marginTop: "10px", width: "90%" }} onChange={(e) => { url = (e.target as any).value; }}></Input>
                                    </>
                                )
                            })(),
                            okText: "添加",
                            cancelText: "取消",
                            icon: <Icon type="new-file" />,
                            onOk() {
                                if (url.startsWith("http") && url.endsWith(".3mx")) {
                                    this_.AddDior(url);
                                }
                            },
                            onCancel() {
                                // 自动关闭对话框 ...
                            },
                        });
                        console.error(item.name);
                    }
                }
            ],
            onClick: () => { }
        },
        {
            id: 'terrain',
            title: '地形开关',
            name: '地形开关',
            icon: 'pulse',
            disabled: false,
            onClick: () => {
                const gis = this._app.engine.gis;
                gis.enable_terrain = !gis.enable_terrain;
                this._app.DrawFrame(2);
            }
        },
        {
            id: 'diors',
            title: '倾斜摄影模型开关',
            name: '倾斜摄影模型开关',
            icon: 'pulse',
            disabled: false,
            onClick: () => {
                this._app.diorsDisabled = !this._app.diorsDisabled;
                this._app.DrawFrame(2);
            }
        },
        {
            id: 'sunlit',
            title: '太阳光向设置',
            name: '太阳光向设置',
            icon: 'lightbulb',
            disabled: false,
            onClick: (e, item) => {
                this._app.sunlitSet = !this._app.sunlitSet;
                this._toolbar[2].icon = this._app.sunlitSet ? "lightbulb-autofix" : "lightbulb";
                molecule.editor.updateTab(this._tab);
            }
        },
        {
            id: 'location',
            title: '设置当前场景参考经纬度',
            name: '设置当前场景参考经纬度',
            icon: 'compass-dot',
            disabled: false,
            onClick: (e, item) => {
                const gis = this._app.engine.gis;
                const gcj02 = gis.WGS84_GCJ02(gis["_originLL"]);
                const scene = this._app.extensions.hierarchy.scene;
                if (scene) {
                    scene.scene.lnglat = gcj02;
                    this._app.Notify(`成功设置当前场景参考经纬度${gcj02[0].toFixed(4)},${gcj02[1].toFixed(4)}`, "info");
                }
            }
        },
    ];
}

/*/
TODO:
最多分两组
跨组移动标签
资源包上传表单验证
注销时清除相关用户状态
多次导入不响应问题（已打开的文件再次选择不响应，浏览器设计）
默认不启用纹理压缩
在一个浏览器环境工作并提交后，切换令一个浏览器环境工作前，必须注销并重新登录（不同浏览器session不同）
/*/