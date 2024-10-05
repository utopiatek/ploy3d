import { PloyApp, SimpleSignal } from "../../dist/esm/mod.js";
import { React, ReactDOM, molecule, create, Workbench, HTML5Backend, DndProvider, useDrop } from "../../lib/molecule.js";
import { Packages } from "./packages.js";
import { Assets } from "./assets.js";
export class PloyApp_editor extends PloyApp {
    constructor(engine) {
        super(engine);
    }
    async InitScene(progress) {
        const engine = this.engine;
        const resources = engine.resources;
        this.scene = await resources.Scene.Create();
        this.object3d = await resources.Object.Create(this.scene);
        this.camera = await resources.Camera.Create(this.object3d);
        this.volume = await resources.Volume.Create(this.object3d);
        const chara_pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shibahu.zip", () => { });
        this.engine.resources.Register(chara_pkg.pkg, chara_pkg.files);
        await this.CreateAtmosphere(this.scene);
        const targetLL = this.engine.gis.GCJ02_WGS84([116.397459, 39.908796]);
        const targetWPOS = this.engine.gis.LL2WPOS(targetLL);
        this.camera.Set3D(targetWPOS, 17000, 28, 0);
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
        });
        this.AddEventListener("pointerdown", (() => {
            let last_obj = null;
            let last_mat = null;
            let priv_color = null;
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
        this.AddEventListener("pointerup", async (e) => {
            if (e.button == 0) {
                if (this._transformCtrl && this._transformCtrl.ctrl) {
                    this._transformCtrl.End();
                }
                this.DrawFrame(1);
            }
        });
        this.DrawFrame(10);
        const menu = await engine.resources.Browse(chara_pkg.pkg);
        await engine.renderer["_queue"].Snapshot(this.scene, menu);
        console.error("===================================");
        return true;
    }
    Update(flags) {
        if ((flags & 2) == 2) {
            if (this._transformCtrl) {
                this._transformCtrl.Update(this.camera);
            }
        }
    }
    Draw3D() {
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
        };
        const framePassList = this.engine.assembly.GetFramePassList("low");
        {
            framePassList.framePassName = ["opaque", "blit"];
            framePassList.framePass = [
                this.engine.assembly.GetFramePass(framePassList.framePassName[0]),
                this.engine.assembly.GetFramePass(framePassList.framePassName[1]),
            ];
            framePassList.framePass[0].depthStencilAttachment.depthCompare = "greater";
            framePassList.framePass[0].depthStencilAttachment.depthLoadOp = "clear";
            framePassList.framePass[0].depthStencilAttachment.depthWriteEnabled = true;
            framePassList.framePass[1].shaderMacro.BLIT_CANVAS_COMBINE_SSS = 0;
            framePassList.framePass[1].shaderMacro.BLIT_CANVAS_TONE_MAPPING = 0;
        }
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
        });
    }
    scene;
    object3d;
    camera;
    volume;
    async InitWindow(title, width, height, progress) {
        if (this._moleculeInst) {
            return true;
        }
        {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "./lib/mo.css";
            document.head.appendChild(link);
        }
        this._moleculeInst = create({
            extensions: this._extensionList
        });
        this._workbenchCom = () => this._moleculeInst.render(React.createElement(Workbench, null));
        this._editor = new Editor(this);
        ReactDOM.render((React.createElement(React.StrictMode, null,
            React.createElement(DndProvider, { backend: HTML5Backend },
                React.createElement(this._workbenchCom, null)))), document.getElementById('root'));
        await this._editor.Open();
        progress(1.0, "完成窗口创建");
        return true;
    }
    get extensions() {
        return this._extensionLut;
    }
    get signals() {
        return this._signalLut;
    }
    get userId() {
        return this._userId || -1;
    }
    get userEmail() {
        return this._userEmail || "helper@ploycloud.com";
    }
    _userId;
    _userEmail;
    _waitLogin;
    _workbenchCom;
    _moleculeInst;
    _editor;
    _tabUser;
    _extensionLut = {
        packages: new Packages(this),
        assets: new Assets(this),
    };
    _extensionList = [
        this._extensionLut.packages,
        this._extensionLut.assets,
    ];
    _signalLut = {
        select_package: new SimpleSignal(),
    };
}
export class Editor {
    constructor(app) {
        this._app = app;
        this._containerRef = React.createRef();
        this._canvas3d = document.getElementById("canvas3d");
        this._canvas2d = document.getElementById("canvas2d");
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
            this._containerRef.current.appendChild(this._canvas3d);
            this._containerRef.current.appendChild(this._canvas2d);
            this._mounted = true;
            this._onMount();
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
        return (React.createElement("div", { style: {
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "block",
            } },
            React.createElement("div", { ref: dropRef, style: { width: "100%", height: "100%" } },
                React.createElement("div", { ref: this._containerRef, style: { width: "100%", height: "100%" } }))));
    }
    OnDrag(item, monitor) {
    }
    OnDrop(item, monitor) {
        return {};
    }
    _app;
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
        closable: false,
        editable: false,
        renderPane: () => {
            return this.Render();
        }
    };
}
//# sourceMappingURL=index.js.map