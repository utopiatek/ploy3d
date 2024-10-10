/** 导入PLOY3D引擎。 */
import { Ploy3D, PloyApp, Scene, Object3D, Camera, Volume, Canvas2D } from "../dist/esm/mod.js"

/** 扩展实现APP类[postprocess_base]。 */
export class PloyApp_postprocess_base extends PloyApp {
    /**
     * 构造函数。
     * @constructor
     * @param {Ploy3D} engine 引擎实例。
     */
    constructor(engine) {
        super(engine);
    }

    /**
     * 初始化场景。
     * @param {Ploy3D["Progress"]} progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    async InitScene(progress) {
        const engine = this.engine;
        const resources = engine.resources;

        this.scene = await resources.Scene.Create();
        this.object3d = await resources.Object.Create(this.scene);
        this.camera = await resources.Camera.Create(this.object3d);
        this.volume = await resources.Volume.Create(this.object3d);

        this.volume.iblLuminance = 1.0;
        this.volume.sunlitColorIntensity = [0.22, 0.22, 0.22, 0.5];
        this.volume.sunlitDirection = engine.Vector3([1.0, 1.0, 0.0]).normalized.values;
        this.volume.shadowDisable = 1;

        // 自定义渲染管线帧通道列表（我们排出了默认设置中的"shadow_cast","sss_extract","sss_blur"）
        {
            this.framePassList = {};

            this.framePassList.framePassName = [
                "early_z",      // 0
                "ssao_extract", // 1
                "ssr_extract",  // 2
                "opaque",       // 3
                "proc_bloom",   // 4
                "blit",         // 5
            ];

            this.framePassList.framePass = this.framePassList.framePassName.map((label) => {
                return engine.assembly.GetFramePass(label);
            });

            this.framePassList.framePass[5].shaderMacro.BLIT_CANVAS_COMBINE_SSS = 0;
        }

        {
            const pkg = await engine.worker.Import_gltf(1, "./.git.assets/venue_stage_for_great_events.zip", () => { });

            resources.Register(pkg.pkg, pkg.files);

            const prefab = await resources.Scene.InstancePrefab(this.scene, "65-0", pkg.pkg);
        }

        // 创建地球大气层对象
        // await this.CreateAtmosphere(this.scene);

        // 创建变换组件控制器工具
        // await this.CreateTransformCtrl(this.scene);

        // 默认相机姿态
        this.camera.Set3D([0, 2, 0], 33.0, 6, 0);
        this.camera.nearZ = 0.1;
        this.camera.farZ = 100.0;
        this.camera.fov = 45 / 180 * Math.PI;

        // 注册鼠标滚轮事件监听器
        this.AddEventListener("wheel", (e) => {
            this.camera.Scale(e.wheelDelta, engine.width, engine.height);
            this.DrawFrame(1);
        });

        // 注册鼠标滑动事件监听器
        this.AddEventListener("pointermove", (e) => {
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
            let last_obj = null;
            let last_mat = null;
            let priv_color = null;
            let click_times = 0;

            return (e) => {
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
        this.AddEventListener("pointerup", (e) => {
            if (e.button == 0) {
                if (this._transformCtrl && this._transformCtrl.ctrl) {
                    this._transformCtrl.End();
                }

                this.DrawFrame(1);
            }
        });

        // 注册键盘按键按下事件监听器
        this.AddEventListener("keydown", (e) => {
            // 安全关闭应用
            if (e.code == "Escape") {
                this.Shutdown();
            }
        });

        // 触发一帧绘制，这样本机程序才会启动循环监听事件
        this.DrawFrame(10);
    }

    /**
     * 更新场景。
     * @param flags 更新标志集（1-更新2D场景，2-更新3D场景）。
     */
    Update(flags) {
        if ((flags & 2) == 2) {
            if (this._transformCtrl) {
                this._transformCtrl.Update(this.camera, null);
            }
        }
    }

    /**
     * 绘制场景3D画面。
     */
    Draw3D() {
        // 将地球大气层网格添加到绘制列表
        if (this._atmosphere) {
            this._drawQueue.DrawMesh(this._atmosphere.draw_params);
        }

        // 自定义场景绘制方法
        const drawScene = (queue) => {
            // 绘制当前绘制列表内容
            queue.DrawList();
        };

        // ========================----------------------------------------

        const framePassList = this.framePassList || this.engine.assembly.GetFramePassList("low");
        const texture = this.engine.device._swapchain.getCurrentTexture();
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

    /** @type {Scene} 场景实例。 */
    scene;
    /** @type {Object3D} 承载相机组件和体积组件的3D对象实例。 */
    object3d;
    /** @type {Camera} 相机组件实例。 */
    camera;
    /** @type {Volume} 体积组件实例。 */
    volume;

    /** @type {ReturnType<Assembly["GetFramePassList"]>} 自定义渲染管线帧通道列表。 */
    framePassList;
}
