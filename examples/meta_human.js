/** 导入PLOY3D引擎。 */
import { Ploy3D, PloyApp, Scene, Object3D, Camera, Volume, Assembly } from "../dist/esm/mod.js"

/** 扩展实现APP类[meta_human]。 */
export class PloyApp_meta_human extends PloyApp {
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

        this.volume.shadowBias = 0.1;
        this.volume.iblLuminance = 0.2;
        this.volume.sunlitColorIntensity = [0.22, 0.22, 0.22, 0.5];
        this.volume.sunlitDirection = engine.Vector3([2.0, 1.0, 0.0]).normalized.values;

        // 自定义渲染管线帧通道列表（我们排除了默认设置中的"ssr_extract","proc_bloom"）
        {
            this.framePassList = {};

            this.framePassList.framePassName = [
                "shadow_cast",  // 0
                "early_z",      // 1
                "ssao_extract", // 2
                "opaque",       // 3
                "sss_extract",  // 4
                "sss_blur",     // 5
                "blit",         // 6
            ];

            this.framePassList.framePass = this.framePassList.framePassName.map((label) => {
                return engine.assembly.GetFramePass(label);
            });

            this.framePassList.framePass[6].shaderMacro.BLIT_CANVAS_COMBINE_BLOOM = 0;
        }

        // 创建地平面立方体网格对象
        {
            const material = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-0_standard_gltf_sketchfab.json");
            const mesh = await resources.Mesh.Create({
                uuid: "",
                classid: 39,
                name: "cube mesh",
                label: "cube mesh",

                creater: {
                    type: "box",
                    box: {
                        width: 1000,
                        height: 1,
                        depth: 1000,
                        widthSegments: 2,
                        heightSegments: 2,
                        depthSegments: 2
                    }
                }
            });
            const meshRenderer = await resources.MeshRenderer.Create(mesh, [
                {
                    slot: 0,
                    submesh: 0,
                    material: material
                }
            ]);
            const object3d = await resources.Object.Create(this.scene);

            object3d.meshRenderer = meshRenderer;
            object3d.localPosition = this.engine.Vector3([0, -0.5, 0]);
        }

        // 添加方向光源
        {
            const lightObj = await resources.Object.Create(this.scene);

            lightObj.localPosition = this.engine.Vector3([0, 2, 0]);
            lightObj.localRotation = engine.Quaternion(engine.internal.Quaternion_FromVectors(0, 0, 1, 0.5919, -0.3152, 0.7418));

            const light = await resources.Light.Create(lightObj, {
                uuid: "",
                classid: 50,
                name: "light",
                label: "light",

                enabled: true,
                type: "directional",
                channels: 1,
                color: [0.3894 * 2.0, 0.3983 * 2.0, 0.4988 * 2.0],
                intensity: 100,
                radius: 3.0
            });

            this.lightObj = lightObj;
        }

        // 装载角色模型资源（https://sketchfab.com/3d-models/kitana-mk11-in-mk9-suit-e4305dd16079455885ba8c57cbf297c3）
        this.character = await (async () => {
            const pkg = await engine.worker.Import_gltf(1, "./.git.assets/kitana_mk11_in_mk9_suit.min.zip", () => { });

            resources.Register(pkg.pkg, pkg.files);

            const prefab = await resources.Scene.InstancePrefab(this.scene, "65-0", pkg.pkg);

            prefab.root.localScale = engine.Vector3([0.0425, 0.0425, 0.0425]);
        })();

        // 创建地球大气层对象
        // await this.CreateAtmosphere(this.scene);

        // 创建变换组件控制器工具
        await this.CreateTransformCtrl(this.scene);

        // 默认相机姿态
        this.camera.Set3D([0, 2, 0], 5.5, 5, 60);
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

        // 令该光源在相机空间中的方向固定（TODO: 应先应用相机更新）
        if (this.lightObj) {
            const wfvMat = this.camera.GetMatrix("wfgMat").Multiply(this.camera.GetMatrix("gfvMat"));
            const wDir = wfvMat.MultiplyVector3(0, this.engine.Vector3([0.5919, -0.3152, 0.7418]));
            const wRot = this.engine.Quaternion(this.engine.internal.Quaternion_FromVectors(0, 0, 1, wDir.x, wDir.y, wDir.z));

            this.lightObj.localRotation = wRot;
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

    /** @type {Object3D} 动态方向光源3D对象实例。 */
    lightObj;
}
