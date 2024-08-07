/** 导入PLOY3D引擎。 */
import * as ploycloud from "../dist/esm/mod.js"

/** 扩展实现APP类[test]。 */
export class PloyApp_test extends ploycloud.PloyApp {
    /**
     * 构造函数。
     * @constructor
     * @param {ploycloud.Ploy3D} engine 引擎实例。
     */
    constructor(engine) {
        super(engine);
    }

    /**
     * 初始化场景。
     * @param {ploycloud.Ploy3D["Progress"]} progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    async InitScene(progress) {
        const resources = this.engine.resources;

        resources.Texture.default2D = await resources.Texture.CreateTexture({
            uuid: "",
            classid: 25,
            name: "_builtin2D",
            label: "_builtin2D",
            uri: "1-1-1.miaokit.builtins:/texture/25-0_color.ktx2"
        });

        this.scene = await resources.Scene.Create();
        this.object3d = await resources.Object.Create(this.scene);
        this.camera = await resources.Camera.Create(this.object3d);
        this.volume = await resources.Volume.Create(this.object3d);

        // 定位倾斜摄影模型在指定经纬度，并指定海拔高度
        // 请使用GCJ02坐标系（高德地图、腾讯地图）经纬度
        // 经纬度拾取器：https://lbs.qq.com/getPoint/
        const dior_lnglat = this.engine.gis.WGS84_GCJ02([120.281164, 30.4857535]);
        // 创建倾斜摄影模型实例
        // this.dior = await resources.Dioramas.Create_3mx(this.scene, "http://localhost:55204/Production_1.3mx", [dior_lnglat[0], dior_lnglat[1], 0.0]);

        // 导入GLTF模型为引擎资源包
        this.gltf_pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shader_ball.zip", () => { });
        // 注册引擎资源包
        this.engine.resources.Register(this.gltf_pkg.pkg, this.gltf_pkg.files);
        // 装载GLTF中的某个网格资源
        this.gltf_mesh_0 = await resources.Mesh.Load("39-0", this.gltf_pkg.pkg);

        // 创建立方体网格绘制材质
        const mat_cube = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-0_standard_specular.json");
        // 创建立方体网格
        const mesh_cube = await resources.Mesh.Create({
            uuid: "",
            classid: /*CLASSID.ASSET_MESH*/39,
            name: "cube mesh",
            label: "cube mesh",

            creater: {
                type: "box",
                box: {
                    width: 231.486,//256,
                    height: 1,
                    depth: 231.486,//256,
                    widthSegments: 2,
                    heightSegments: 2,
                    depthSegments: 2
                }
            }
        });
        // 设置立方体网格绘制参数集
        this.draw_cube = {
            flags: 0,
            layers: 0,
            userData: 0,

            castShadows: false,
            receiveShadows: false,
            frontFace: 0,
            cullMode: 1,

            mesh: this.gltf_mesh_0,
            materials: [
                {
                    submesh: 0,
                    material: mat_cube
                },
                {
                    submesh: 1,
                    material: mat_cube
                },
                {
                    submesh: 2,
                    material: mat_cube
                }
            ],

            instances: [
            ]
        };

        // 实例化900各立方体网格
        for (let r = 0; r < 30; r++) {
            const z = -500 * 15 + 500 * r;

            for (let c = 0; c < 30; c++) {
                const x = -500 * 15 + 500 * c;

                const wfmMat = [
                    100, 0, 0, 0,
                    0, 100, 0, 0,
                    0, 0, 100, 0,
                    x, 0, z, 1
                ];

                this.draw_cube.instances.push(wfmMat);
            }
        }

        // 创建地球大气层对象
        await this.CreateAtmosphere(this.scene);

        this.AddEventListener("wheel", (e) => {
            this.camera.Scale(e.wheelDelta, this.engine.width, this.engine.height);
            this.DrawFrame(1);
        });

        this.AddEventListener("pointermove", (e) => {
            if ((e.buttons & 1) == 1) {
                this.camera.Move(e.movementX, e.movementY, this.engine.width, this.engine.height);
                this.DrawFrame(1);
            }
            else if ((e.buttons & 2) == 2) {
                this.camera.Rotate(e.movementX, e.movementY, this.engine.width, this.engine.height);
                this.DrawFrame(1);
            }
        });

        // 跳转查看指定地理位置方法（北京天安门经纬度: [116.397459, 39.908796]）
        const targetLL = this.engine.gis.GCJ02_WGS84([120.2824892, 30.4876468]);
        const targetWPOS = this.engine.gis.LL2WPOS(targetLL);
        this.camera.Set3D(targetWPOS, 1000);

        // 触发一帧绘制，这样本机程序才会启动循环监听事件
        this.DrawFrame(1);

        console.log(this);
    }

    /**
     * 更新场景。
     * @param flags 更新标志集（1-更新2D场景，2-更新3D场景）。
     */
    Update(flags) {
        const target = this.engine.gis.Update(this.camera);
        if (target) {
            this.camera.target = target;
        }
    }

    /**
     * 绘制场景2D画面。
     */
    Draw2D() {
        // ...
    }

    /**
     * 绘制场景3D画面。
     */
    Draw3D() {
        if (this.engine.gis) {
            this.engine.gis.Draw(this._drawQueue);
        }

        if (this._atmosphere) {
            this._drawQueue.DrawMesh(this._atmosphere.draw_params);
        }

        this._drawQueue.DrawMesh(this.draw_cube);

        // ========================----------------------------------------

        const framePassList = this.engine.assembly.GetFramePassList("low");
        const texture = this.engine.device._swapchain.getCurrentTexture();
        const target = {
            texture: texture,
            view: texture.createView(),
            viewport: [0, 0, texture.width, texture.height]
        };

        this._drawQueue.Execute(this.camera, this.volume, target, framePassList,
            (queue) => {
                this.DrawScene(queue);
            },
            (err) => {
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

    /**
     * 自定义场景绘制方法。
     * @param {ploycloud.DrawQueue} queue 渲染队列。
     */
    DrawScene(queue) {
        queue.DrawList();

        if (this.dior) {
            this.dior.Draw(queue, queue.framePass.label == "opaque");
        }
    }

    /** @type {ploycloud.Scene} 场景实例。 */
    scene;
    /** @type {ploycloud.Object3D} 承载相机组件和体积组件的3D对象实例。 */
    object3d;
    /** @type {ploycloud.Camera} 相机组件实例。 */
    camera;
    /** @type {ploycloud.Volume} 体积组件实例。 */
    volume;

    /** @type {ploycloud.Dioramas_3mx} 倾斜摄影组件实例。 */
    dior;

    /** @type {Parameters<ploycloud.DrawQueue["DrawMesh"]>[0]} 立方体网格绘制参数。 */
    draw_cube;

    /** GLTF资源包。 */
    gltf_pkg;
    /** GLTF资源包网格资源。 */
    gltf_mesh_0;
}
