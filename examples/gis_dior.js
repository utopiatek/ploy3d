/** 导入PLOY3D引擎。 */
import { Ploy3D, PloyApp, Scene, Object3D, Camera, Volume, Dioramas_3mx } from "../dist/esm/mod.js"

/** 扩展实现APP类[gis_dior]。 */
export class PloyApp_gis_dior extends PloyApp {
    /**
     * 构造函数。
     * @constructor
     * @param {Ploy3D} engine 引擎实例。
     */
    constructor(engine) {
        super(engine);

        const div = document.createElement('div');
        const text = document.createTextNode('本模型由"杭州比牧信息技术有限公司"提供');
        div.appendChild(text);
        div.style.position = "absolute";
        div.style.bottom = 0;
        div.style.zIndex = 100;
        div.style.color = "gray";
        document.body.appendChild(div);
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
        this.volume.sunlitDirection = engine.Vector3([1.0, 1.0, 1.0]).normalized.values;

        this.volume.shadowDisable = 1;
        this.volume.ssrDisable = 1;
        this.volume.ssaoDisable = 1;

        // 自定义渲染管线帧通道列表（我们排出了默认设置中的"shadow_cast","early_z","ssao_extract","ssr_extract","sss_extract","sss_blur","proc_bloom"）
        {
            this.framePassList = {};

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

        // 启用GIS定位
        this.engine.gis.enable = true;

        // 定位倾斜摄影模型在指定经纬度，并指定海拔高度
        // 请使用GCJ02坐标系（高德地图、腾讯地图）经纬度
        // 经纬度拾取器：https://lbs.qq.com/getPoint/
        // 创建倾斜摄影模型实例
        {
            this.dior = await resources.Dioramas.Create_3mx(this.scene, "https://oss.ploycloud.com/diors/广州番茂/Production_1.3mx", [113.39675, 23.01835, 0.0]);
            this.dior.object3d.localPosition = this.engine.Vector3([0, 55, 0]);
        }

        // 创建地球大气层对象
        await this.CreateAtmosphere(this.scene);

        // 跳转查看指定地理位置方法（北京天安门经纬度: [116.397459, 39.908796]）
        const targetLL = this.engine.gis.GCJ02_WGS84([113.397556, 23.018245]);
        const targetWPOS = this.engine.gis.LL2WPOS(targetLL); targetWPOS[0] -= 100;
        this.camera.Set3D(targetWPOS, 230, 35, -88.8);

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

        if (this.dior) {
            this.dior.Update(this.camera);
        }
    }

    /**
     * 绘制场景3D画面。
     */
    Draw3D() {
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
        const drawScene = (queue) => {
            // 绘制当前绘制列表内容
            queue.DrawList();

            // 绘制倾斜摄影模型
            if (this.dior) {
                this.dior.Draw(queue);
            }
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

    /** @type {Dioramas_3mx} 倾斜摄影组件实例。 */
    dior;
}
