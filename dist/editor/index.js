import { PloyApp, SimpleSignal } from "../../dist/esm/mod.js";
import { React, ReactDOM, molecule, create, Workbench, SaveAction, HTML5Backend, DndProvider, useDrop, eruda, echarts } from "../../lib/molecule.js";
import { Hierarchy } from "./hierarchy.js";
import { Packages } from "./packages.js";
import { Assets } from "./assets.js";
import { UIEditor } from "./ui.js";
export class PloyApp_editor extends PloyApp {
    constructor(engine) {
        super(engine);
        let login_callback;
        let login_info;
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
        globalThis.setUser = (userInfo) => {
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
    async InitScene(progress) {
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
        {
            this.framePassList = {};
            this.framePassList.framePassName = [
                "early_z",
                "opaque",
                "blit",
            ];
            this.framePassList.framePass = this.framePassList.framePassName.map((label) => {
                return engine.assembly.GetFramePass(label);
            });
            this.framePassList.framePass[2].shaderMacro.BLIT_CANVAS_COMBINE_SSS = 0;
            this.framePassList.framePass[2].shaderMacro.BLIT_CANVAS_COMBINE_BLOOM = 0;
            this.framePassList.framePass[2].shaderMacro.BLIT_CANVAS_TONE_MAPPING = 0;
        }
        await this.CreateAtmosphere(this.scene);
        await this.CreateTransformCtrl(this.scene);
        this.engine.gis.enable = true;
        this.engine.gis.enable_terrain = false;
        this.camera.Set3D([0, 0, 0], 6000, 45, 0);
        this.camera.nearZ = 0.1;
        this.camera.farZ = 1000.0;
        this.camera.fov = 45 / 180 * Math.PI;
        this.AddEventListener("wheel", async (e) => {
            this.camera.Scale(e.wheelDelta, engine.width, engine.height);
            this.DrawFrame(1);
        });
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
            }
        });
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
        this.AddEventListener("pointerup", async (e) => {
            if (e.button == 0) {
                if (this._transformCtrl && this._transformCtrl.ctrl) {
                    this._transformCtrl.End();
                }
                this.DrawFrame(1);
            }
        });
        this.AddEventListener("keydown", async (e) => {
            if (e.code == "Escape") {
                this.Shutdown();
            }
        });
        this.Progress(0.9, "完成场景初始化", true);
        await new Promise((resolve) => {
            this._login(resolve);
        });
        this.DrawFrame(10);
        const handle = setInterval(() => {
            this.OnInterval();
        }, 3000);
        return true;
    }
    Update(flags) {
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
    Draw3D() {
        if (this._snapshotTasks.length > 0) {
            return this.Snapshot();
        }
        if (this.engine.gis) {
            const target = this.engine.gis.Update(this.camera);
            if (target) {
                this.camera.target = target;
            }
            this.engine.gis.DrawMesh(this._drawQueue);
        }
        if (this._atmosphere) {
            this._drawQueue.DrawMesh(this._atmosphere.draw_params);
        }
        const drawScene = (queue) => {
            queue.DrawList();
            if (this.engine.gis) {
            }
            const diors = this.engine.resources.Dioramas.GetInstanceList();
            for (let dior of diors) {
                if (dior && !this.diorsDisabled) {
                    dior.Draw(queue);
                }
            }
        };
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
                    this.engine.config.surface.present();
                }
            }
            this._gpuRendering = false;
        });
    }
    Snapshot() {
        const framePassList = this.framePassList || this.engine.assembly.GetFramePassList("low");
        const list = this._snapshotTasks;
        const callbacks = this._snapshotWaits;
        const count = list.length;
        const queue = this._drawQueue;
        const surface = this.engine.config.surface;
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
                await (new Promise((resolve, reject) => {
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
    AddSnapshot(menu, callback) {
        this._snapshotTasks.push(menu);
        this._snapshotWaits.push(callback);
    }
    scene;
    object3d;
    camera;
    volume;
    framePassList;
    sunlitSet;
    diorsDisabled;
    async InitWindow(title, width, height, progress) {
        if (this._moleculeInst) {
            return true;
        }
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
            await new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "./lib/dayjs.min.js";
                script.onload = resolve;
                document.head.appendChild(script);
            });
            await new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "./lib/antd.min.js";
                script.onload = resolve;
                document.head.appendChild(script);
            });
            await new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "./lib/ant-design-icons.min.js";
                script.onload = resolve;
                document.head.appendChild(script);
            });
            link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/reset.min.css";
            document.head.appendChild(link);
        }
        this._moleculeInst = create({
            extensions: this._extensionList
        });
        this._moleculeInst.onBeforeInit(() => {
            this.OnBeforeMoleculeInit();
        });
        this._workbenchCom = () => this._moleculeInst.render(React.createElement(antd.ConfigProvider, { theme: {
                algorithm: antd.theme.darkAlgorithm,
                token: {
                    colorBgContainer: 'rgba(15, 13, 40, 0.0)',
                    colorTextDescription: "rgba(255, 255, 255, 1.0)",
                },
            } },
            React.createElement(Workbench, null)));
        this._editor = new Editor(this);
        this._uiEditor = new UIEditor(this);
        ReactDOM.render((React.createElement(React.StrictMode, null,
            React.createElement(DndProvider, { backend: HTML5Backend },
                React.createElement(this._workbenchCom, null)))), document.getElementById('root'));
        await this.onBeforeMoleculeLoad();
        await this._editor.Open();
        progress(1.0, "完成窗口创建");
        return true;
    }
    async OnBeforeMoleculeInit() {
        const { editor, editorTree } = molecule;
        const confirm = molecule.component.Modal.confirm;
        const config = this._moleculeInst.getConfig();
        const ExtendsEditor = config.extensions[1];
        const ExtendsEditorTree = config.extensions[4];
        const needSave = (groupId, tabId) => {
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
        const doSave = (tabs) => {
            for (let tab of tabs) {
                if (tab.id == 10001) {
                    this._editor.AddTask(async () => {
                        await this._editor.Save();
                    });
                }
                else {
                    const userSpace = this.engine.resources.userSpace;
                    userSpace.Update(tab.id, tab.data.value);
                }
                tab.status = undefined;
                editor.updateTab(tab);
            }
        };
        const doClose = (tabId, groupId, close) => {
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
        const hoverGroup = (tabItem, groupId) => {
            const state = editor.getState();
            const groups = state.groups;
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
        const closeOther = (tabItem, groupId) => {
            groupId = hoverGroup(tabItem, groupId);
            if (tabItem && groupId !== undefined) {
                doClose(undefined, groupId, (tabId, groupId) => {
                    editor.closeOther(tabItem, groupId);
                });
            }
        };
        const closeToLeft = (tabItem, groupId) => {
            groupId = hoverGroup(tabItem, groupId);
            if (tabItem && groupId !== undefined) {
                doClose(undefined, groupId, (tabId, groupId) => {
                    editor.closeToLeft(tabItem, groupId);
                });
            }
        };
        const closeToRight = (tabItem, groupId) => {
            groupId = hoverGroup(tabItem, groupId);
            if (tabItem && groupId !== undefined) {
                doClose(undefined, groupId, (tabId, groupId) => {
                    editor.closeToRight(tabItem, groupId);
                });
            }
        };
        const closeTab = (tabId, groupId) => {
            if (tabId !== undefined && groupId !== undefined) {
                doClose(tabId, groupId, (tabId, groupId) => {
                    editor.closeTab(tabId, groupId);
                });
            }
        };
        const closeAll = (groupId) => {
            if (groupId !== undefined) {
                doClose(undefined, groupId, (tabId, groupId) => {
                    editor.closeAll(groupId);
                });
            }
        };
        config.defaultLocale = "zh-CN";
        ExtendsEditor.activate = () => {
            editor.onCloseTab(closeTab);
            editor.onCloseAll(closeAll);
            editor.onCloseOther(closeOther);
            editor.onCloseToLeft(closeToLeft);
            editor.onCloseToRight(closeToRight);
        };
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
                    const saveList = needSave(groupId);
                    if (saveList && saveList.length > 0) {
                        doSave(saveList);
                        this.Notify("保存成功。", "info");
                    }
                }
                else {
                    const { groups } = editor.getState();
                    groups?.forEach((group) => {
                        const saveList = needSave(group.id);
                        if (saveList && saveList.length > 0) {
                            doSave(saveList);
                            this.Notify("保存成功。", "info");
                        }
                    });
                }
            });
        };
        SaveAction.prototype.run = (accessor, ...args) => {
            const state = molecule.editor.getState();
            const tab = state.current?.tab;
            if (tab && tab.status == "edited") {
                doSave([tab]);
                this.Notify("保存成功。", "info");
            }
        };
        molecule.builtin.inactiveModule("builtInExplorerOutlinePanel");
        molecule.explorer.setExpandedPanels(['sidebar.explore.openEditor', 'sidebar.explore.folders']);
        molecule.auxiliaryBar.setMode('tabs');
        molecule.auxiliaryBar.addAuxiliaryBar(this._auxiliaryTabs);
        molecule.auxiliaryBar.onTabClick(() => {
            const tab = molecule.auxiliaryBar.getCurrentTab();
            if (tab) {
                molecule.auxiliaryBar.setChildren(React.createElement(tab.render, null));
            }
            molecule.layout.setAuxiliaryBar(!tab);
        });
    }
    async onBeforeMoleculeLoad() {
        const Float_right = molecule.model.Float.right;
        const statusBar = molecule.statusBar;
        const { activityBar, panel, extension, explorer, editorTree, folderTree, editor } = molecule;
        await new Promise((resolve) => {
            this._moleculeInst.onBeforeLoad(() => {
                resolve();
            });
        });
        const userCenter = {
            id: 10002,
            name: '用户中心',
            closable: true,
            editable: false,
            icon: "account",
            renderPane: () => {
                return (React.createElement("div", { style: {
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "block",
                    } },
                    React.createElement("iframe", { src: document.location.origin + "/serv/admin", style: {
                            transform: "scale(1.0)",
                            transformOrigin: "0 0",
                            width: "100%",
                            height: "100%",
                            borderWidth: 0
                        }, onLoad: (e) => {
                        } })));
            }
        };
        panel.remove("panel.problems.title");
        panel.setActive('panel.output.title');
        extension.registerAction(SaveAction);
        activityBar.onClick((key) => {
            if (key == "global.menu.account") {
                editor.open(userCenter);
            }
        });
        const TransformToEditorTab = (item) => {
            const userSpace = this.engine.resources.userSpace;
            const node = userSpace.GetNode(item.id);
            const tab = {
                id: item.id,
                name: item.name,
                icon: "file",
                editable: true,
                status: node.data.status,
                breadcrumb: [],
                data: {
                    path: node.location,
                    ...node.data,
                },
            };
            if (tab.data.path) {
                tab.breadcrumb = tab.data.path.split('/').map((local) => ({ id: local, name: local }));
            }
            return tab;
        };
        const UpdateStatusBarLanguage = (language) => {
            if (language) {
                language = language.toUpperCase();
                let barItem = statusBar.getStatusBarItem('LanguageStatus', Float_right);
                if (barItem) {
                    barItem.name = language;
                    statusBar.update(barItem, Float_right);
                }
                else {
                    barItem = {
                        id: 'LanguageStatus',
                        sortIndex: 3,
                        name: language,
                    };
                    molecule.statusBar.add(barItem, Float_right);
                }
            }
        };
        editor.onSelectTab((tabId, groupId) => {
            if (groupId) {
                const group = editor.getGroupById(groupId);
                if (group) {
                    const tab = editor.getTabById(tabId, group.id);
                    if (tab) {
                        UpdateStatusBarLanguage(tab.data?.language);
                    }
                }
            }
        });
        folderTree.onCreate((type, id) => {
            if (this._userInfo?.opened_us) {
                const userSpace = this.engine.resources.userSpace;
                let parent = "user_space";
                let current = folderTree.getState().folderTree?.current;
                if (current) {
                    const node = userSpace.GetNode(current.id);
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
                    const newFile = userSpace.New(16, "新建文件" + userSpace.GetNextIdx(16), parent);
                    folderTree.update(userSpace.root);
                    folderTree.emit("folderTree.onRename", newFile.id);
                }
            }
        });
        folderTree.onUpdateFileName((node) => {
            const userSpace = this.engine.resources.userSpace;
            if (userSpace.Rename(node.id, node.name)) {
                const node_ = userSpace.GetNode(node.id);
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
        folderTree.onRemove((id) => {
            const userSpace = this.engine.resources.userSpace;
            userSpace.Delete(id);
            folderTree.update(userSpace.root);
        });
        folderTree.setFileContextMenu([
            {
                id: "explorer.openToSide",
                name: "在侧边打开",
                onClick: (e, item) => {
                    let current = molecule.folderTree.getState().folderTree?.current;
                    if (current) {
                        if (current.fileType == "File") {
                            if (current.classid == 65) {
                                this._editor.AddTask(async () => {
                                    const scene = await this._editor.NewScene(current.id);
                                    this._editor.EditScene(scene.collapse.id);
                                });
                            }
                            else if (current.classid == 70) {
                                const userSpace = this.engine.resources.userSpace;
                                userSpace.GetData(current.id).then((value) => {
                                    current.data.value = value;
                                    let tab = TransformToEditorTab(current);
                                    tab.name = "UI编辑器";
                                    tab.icon = "preview";
                                    tab.renderPane = () => {
                                        const data = JSON.parse(value);
                                        return React.createElement(this.uiEditor.renderEditor, { uiid: "uiid", data: data, onUpdate: (data_) => {
                                                console.error("-------------------- update!");
                                            } });
                                    };
                                    molecule.editor.open(tab);
                                    UpdateStatusBarLanguage(current.data?.language);
                                });
                            }
                            else if (current.data.value === null || current.data.value === undefined) {
                                const userSpace = this.engine.resources.userSpace;
                                userSpace.GetData(current.id).then((value) => {
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
        const defaultDataProviderContent = (() => {
            const content = {
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
        const defaultUIPanelContent = (() => {
            const content = {
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
                    },
                    components: [],
                    dataset: {}
                }
            };
            return JSON.stringify(content, null, 4);
        })();
        const newFile = (classid, folder, name, ext, lang, content) => {
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
                        newFile(68, folder.id, "script", ".js", "javascript");
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
                        newFile(69, folder.id, "data_provider", ".json", "json", defaultDataProviderContent);
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
                        newFile(70, folder.id, "ui_panel", ".json", "json", defaultUIPanelContent);
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
                newFile(68, node.id, "script", ".js", "javascript");
            }
            else if (item.id == "explorer.newDataProvider") {
                newFile(69, node.id, "data_provider", ".json", "json", defaultDataProviderContent);
            }
            else if (item.id == "explorer.newPanel") {
                newFile(70, node.id, "ui_panel", ".json", "json", defaultUIPanelContent);
            }
            else {
                console.error(item, node);
            }
        });
        explorer.onCollapseAllFolders(() => {
            folderTree.setExpandKeys([]);
        });
        folderTree.onDropTree((source, target) => {
            if (source && target) {
                const userSpace = this.engine.resources.userSpace;
                if (!target.name) {
                    userSpace.Move(source.id, "0_1");
                }
                else {
                    userSpace.Move(source.id, target.id);
                }
                folderTree.update(userSpace.root);
            }
        });
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
        editorTree.onLayout(() => {
            this._editor.Open();
        });
        editor.onUpdateTab((tab) => {
            tab.status = "edited";
            const userSpace = this.engine.resources.userSpace;
            userSpace.GetNode(tab.id).data.status = "edited";
            molecule.editor.updateTab(tab);
        });
    }
    async Submit() {
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
            const res_ask = await engine.Request("POST", document.location.origin + "/serv/upload_ask", "json", JSON.stringify(submitData.form), 'application/json', null);
            if (res_ask?.success) {
                const policy = res_ask.data;
                const datas = submitData.data.files.datas;
                const signatures = [];
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
                    const res_upload = await engine.Request("POST", policy.host, "json", form, null, null);
                    if (res_upload?.success) {
                        signatures.push(res_upload.message);
                        this.Notify(`上传文件成功：${info.path}！`, "info");
                    }
                    else {
                        signatures.push("");
                        this.Notify(`上传文件失败：${info.path}，${res_upload.message}！`, "error");
                    }
                }
                return { usage: "user_spaces", upload_id: policy.upload_id, signatures: signatures.join() };
            }
            else {
                this.Notify(res_ask.message, "warn");
                return null;
            }
        };
        const Verify = async (info) => {
            const res_verify = await engine.Request("POST", document.location.origin + "/serv/upload_verify", "json", JSON.stringify(info), 'application/json', null);
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
    async SetUser(userInfo) {
        if (this._userInfo) {
            if (this._userInfo?.id != userInfo?.id) {
                if (confirm('您使用了不同账号登录，请刷新页面！')) {
                    location.reload();
                }
                else {
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
    Notify(msg, level, log) {
        const id = this._notifyID++;
        const notification = molecule.notification;
        notification.add([
            {
                id: id,
                value: msg,
                render: (item) => {
                    return React.createElement("div", null, item.value);
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
    OnInterval() {
        this.engine.resources.userSpace.Store().then((b) => {
            if (b) {
                this.Notify("用户本地文件空间更新。", "info");
            }
        });
    }
    get editor() {
        return this._editor;
    }
    get uiEditor() {
        return this._uiEditor;
    }
    get userInfo() {
        return this._userInfo;
    }
    get extensions() {
        return this._extensionLut;
    }
    get signals() {
        return this._signalLut;
    }
    _workbenchCom;
    _moleculeInst;
    _notifyID = 1;
    _editor;
    _uiEditor;
    _login;
    _userInfo;
    _extensionLut = {
        hierarchy: new Hierarchy(this),
        packages: new Packages(this),
        assets: new Assets(this),
    };
    _extensionList = [
        this._extensionLut.hierarchy,
        this._extensionLut.packages,
        this._extensionLut.assets,
    ];
    _auxiliaryTabs = [
        {
            key: "ui_presets",
            title: '界面布局',
            render: () => {
                return this.uiEditor.renderSidebar();
            },
        },
    ];
    _signalLut = {
        select_package: new SimpleSignal(),
        select_object: new SimpleSignal(),
    };
    _snapshotTasks = [];
    _snapshotWaits = [];
}
export class Editor {
    constructor(app) {
        this._app = app;
        this._queue = [];
        this._selectInfo = {};
        this._containerRef = React.createRef();
        this._canvas3d = document.getElementById("canvas3d");
        this._canvas2d = document.getElementById("canvas2d");
        this.Render = this.Render.bind(this);
    }
    async Open(onUnmount) {
        return new Promise((resolve, reject) => {
            if (this._mounted) {
                resolve();
                return;
            }
            this._onMount = resolve;
            this._onUnmount = onUnmount || (() => { });
            molecule.editor.open(this._tab);
        });
    }
    Render() {
        React.useEffect(() => {
            if (!this._mounted) {
                this._containerRef.current.appendChild(this._canvas3d);
                this._containerRef.current.appendChild(this._canvas2d);
                this._mounted = true;
                this._onMount();
            }
            return () => {
                document.body.appendChild(this._canvas3d);
                document.body.appendChild(this._canvas2d);
                this._mounted = false;
                this._onUnmount();
            };
        }, []);
        const [collected, dropRef] = useDrop({
            accept: ['3d_resource'],
            canDrop: (item, monitor) => {
                return this._canDrop;
            },
            hover: (item, monitor) => {
                return this.OnDrag(item, monitor);
            },
            drop: (item, monitor) => {
                return this.OnDrop(item, monitor);
            }
        }, []);
        const Toolbar = molecule.component.Toolbar;
        return (React.createElement("div", { style: {
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "block",
            } },
            React.createElement(Toolbar, { key: "editor_toobar", style: {
                    display: "inline-flex",
                    marginLeft: "10px"
                }, data: this._toolbar }),
            React.createElement("div", { ref: dropRef, style: { width: "100%", height: "100%" } },
                React.createElement("div", { ref: this._containerRef, style: { width: "100%", height: "100%" } }))));
    }
    OnDrag(item, monitor) {
    }
    OnDrop(item, monitor) {
        const app = this._app;
        const engine = app.engine;
        const canvas = engine.config.surface;
        const clientRect = canvas.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        const x = (offset.x - clientRect.left) / clientRect.width;
        const y = (offset.y - clientRect.top) / clientRect.height;
        if (item.classid == 65) {
            const pos = app.camera.HitHorizontal(x, y);
            if (pos.y == 0) {
                this.AddTask(async () => {
                    await this.AddPrefab(item.uuid, pos);
                });
            }
        }
        else if (item.classid == 48) {
            const pos = app.camera.HitHorizontal(x, y);
            if (pos.y == 0) {
                this.AddTask(async () => {
                    await this.AddMeshRenderer(item.uuid, pos);
                });
            }
        }
        return {};
    }
    OnSelect(target) {
        const transformCtrl = this._app["_transformCtrl"];
        if (transformCtrl) {
            const hit_ctrl = transformCtrl.Begin(target?.object3d);
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
    AddTask(task) {
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
    UpdateStatus() {
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
    async IsValid() {
        const hierarchy = this._app.extensions.hierarchy;
        if (hierarchy.scene) {
            return true;
        }
        const confirm = molecule.component.Modal.confirm;
        const create = await new Promise((resolve) => {
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
                this.EditScene(scene.collapse.id);
                return true;
            }
        }
        return false;
    }
    async NewScene(id) {
        const hierarchy = this._app.extensions.hierarchy;
        const resources = this._app.engine.resources;
        const userSpace = resources.userSpace;
        let scene;
        let sceneFile;
        let hasNew = false;
        if (id) {
            scene = hierarchy["sceneLut"][id];
            if (scene) {
                this._app.Notify("场景已打开。", "info");
                return scene;
            }
            sceneFile = userSpace.GetNode(id);
        }
        if (!sceneFile) {
            const sceneName = `scene${userSpace.GetNextIdx(65)}.json`;
            sceneFile = userSpace.New(65, sceneName, "user_space/prefabs");
            hasNew = true;
        }
        if (!sceneFile) {
            this._app.Notify("操作失败！", "error", true);
            return null;
        }
        const scene_ = await resources.Scene.Create();
        scene_.name = sceneFile.name;
        scene_.prefab.uuid = sceneFile.id;
        scene_.prefab.needSave = true;
        if (!hasNew) {
            const prefab = await this._app.engine.resources.Scene.InstancePrefab(scene_, "0-0-0-" + sceneFile.id, undefined, undefined, undefined, true);
            if (prefab) {
                this._app.Notify("场景加载成功。", "info");
            }
            else {
                this._app.Notify("场景加载失败！", "warn", true);
            }
        }
        const key = scene_.prefab.uuid;
        scene = hierarchy.sceneLut[key] = {
            scene: scene_,
            collapse: {
                id: key,
                name: scene_.name,
                hidden: undefined,
                toolbar: undefined,
                renderPanel: () => {
                    return React.createElement(hierarchy.renderHierarchy, { data: scene.hierarchy, contentMenu: [], onSelect: (node) => {
                            hierarchy.onSelect(node);
                        } });
                }
            },
            hierarchy: [],
            updated: true,
        };
        if (hasNew) {
            await scene_.Save();
            this._app.Notify("场景创建成功。", "info");
        }
        return scene;
    }
    async EditScene(id) {
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
    async AddPrefab(uuid, pos) {
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
    async AddMeshRenderer(uuid, pos) {
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
    async AddDior(url) {
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
    async Save() {
        const scene = this._app.extensions.hierarchy.scene;
        if (scene) {
            await scene.scene.Save();
        }
    }
    _app;
    _queue;
    _running;
    _selectInfo;
    _containerRef;
    _canvas3d;
    _canvas2d;
    _onMount = () => { };
    _onUnmount = () => { };
    _mounted = false;
    _canDrop = true;
    _tab = {
        id: 10001,
        name: '场景编辑器',
        icon: "browser",
        closable: true,
        editable: true,
        status: undefined,
        breadcrumb: [{ id: "0", name: "scenes" }, { id: "1", name: "default" }],
        renderPane: () => {
            return React.createElement(this.Render, null);
        }
    };
    _toolbar = [
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
                                return (React.createElement(React.Fragment, null,
                                    React.createElement("div", null, "\u8BF7\u786E\u4FDD\u60A8\u7684\u6A21\u578B\u80FD\u88AB(https://www.ploycloud.com/)\u8BBF\u95EE\u3002"),
                                    React.createElement(Input, { style: { marginTop: "10px", width: "90%" }, onChange: (e) => { url = e.target.value; } })));
                            })(),
                            okText: "添加",
                            cancelText: "取消",
                            icon: React.createElement(Icon, { type: "new-file" }),
                            onOk() {
                                if (url.startsWith("http") && url.endsWith(".3mx")) {
                                    this_.AddDior(url);
                                }
                            },
                            onCancel() {
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
