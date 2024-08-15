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
        // this.dior = await resources.Dioramas.Create_3mx(this.scene, "./.git.assets/3mx/Production_8.3mx", [dior_lnglat[0], dior_lnglat[1], 0.0]);

        // 导入GLTF模型为引擎资源包
        this.gltf_pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shader_ball.zip", () => { });
        // 注册引擎资源包
        this.engine.resources.Register(this.gltf_pkg.pkg, this.gltf_pkg.files);
        // 装载GLTF中的某个网格资源
        this.gltf_mesh = await resources.Mesh.Load("39-0", this.gltf_pkg.pkg);
        // 装载GLTF中的某个材质资源
        this.gltf_material = await resources.Material.Load("32-0", this.gltf_pkg.pkg);
        // 创建承载GLTF资源包网格资源绘制的网格渲染器组件
        this.gltf_meshRenderer = await resources.MeshRenderer.Create(this.gltf_mesh, null, [
            {
                slot: 0,
                submesh: 0,
                material: this.gltf_material
            },
            {
                slot: 1,
                submesh: 1,
                material: this.gltf_material
            },
            {
                slot: 2,
                submesh: 2,
                material: this.gltf_material
            }
        ]);
        // 创建2个3D对象来在场景中添加GLTF资源包网格资源绘制
        this.gltf_obj1 = await resources.Object.Create(this.scene);
        this.gltf_obj2 = await resources.Object.Create(this.scene);
        // 添加网格渲染器组件到2个3D对象上，引擎自动处理为实例化绘制
        this.gltf_obj1.meshRenderer = this.gltf_meshRenderer;
        this.gltf_obj2.meshRenderer = this.gltf_meshRenderer;
        // 分别设置2个3D对象的地理空间位置
        this.gltf_obj1.SetLngLat(dior_lnglat[0], dior_lnglat[1], 0.0);
        this.gltf_obj2.SetLngLat(dior_lnglat[0] + 0.005, dior_lnglat[1], 0.0);
        // 分别设置2个3D对象不同缩放大小
        this.gltf_obj1.localScale = this.engine.Vector3([20, 20, 20]);
        this.gltf_obj2.localScale = this.engine.Vector3([50, 50, 50]);

        // 实例化资源包中预制件
        // const prefab_pkg = await this.engine.worker.Import_gltf(1, "./.git.assets/model/临平2.gltf", () => { });
        // this.engine.resources.Register(prefab_pkg.pkg, prefab_pkg.files);
        // const prefab = await this.engine.resources.Scene.InstancePrefab(this.scene, "65-0", prefab_pkg.pkg);
        // prefab.root.SetLngLat(dior_lnglat[0] + 0.0125, dior_lnglat[1] + 0.0025, 0.0);
        // prefab.root.localPosition = this.engine.Vector3([0, 1, 0]);

        const chara_pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shibahu.zip", () => { });
        this.engine.resources.Register(chara_pkg.pkg, chara_pkg.files);
        const chara_prefab = await this.engine.resources.Scene.InstancePrefab(this.scene, "65-0", chara_pkg.pkg);
        chara_prefab.root.SetLngLat(dior_lnglat[0] + 0.0025, dior_lnglat[1] + 0.0025, 0.0);
        chara_prefab.root.localScale = this.engine.Vector3([100, 100, 100]);
        console.error(chara_pkg, chara_prefab);

        // 导入DAZ文件，依赖的其它DAZ文件会同时导入，每个DAZ文件转换为一个资源包
        // const daz_imports = await this.engine.worker.Import_daz(1, "Scenes/a1.duf", () => { });
        // for (let daz_pkg of daz_imports.pkgs) {
        //     this.engine.resources.Register(daz_pkg.pkg, daz_pkg.files);
        // }
        // const daz_prefab = await this.engine.resources.Scene.InstancePrefab(this.scene, daz_imports.main + "-65-0");
        // console.error("daz_imports:", daz_imports, daz_prefab);

        // 创建立方体网格绘制材质
        const cube_material = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-0_standard_specular.json");
        // 创建立方体网格
        const cube_mesh = await resources.Mesh.Create({
            uuid: "",
            classid: /*CLASSID.ASSET_MESH*/39,
            name: "cube mesh",
            label: "cube mesh",

            creater: {
                type: "box",
                box: {
                    width: 10,
                    height: 100,
                    depth: 10,
                    widthSegments: 2,
                    heightSegments: 2,
                    depthSegments: 2
                }
            }
        });
        // 设置立方体网格动态绘制参数
        this.draw_cube = {
            flags: 0,
            layers: 0,
            userData: 0,

            castShadows: false,
            receiveShadows: false,
            frontFace: 0,
            cullMode: 1,

            mesh: cube_mesh,
            materials: [
                {
                    submesh: 0,
                    material: cube_material
                }
            ],

            instances: [
            ]
        };
        // 动态绘制900个立方体网格实例，此处计算每个实例的变换矩阵
        for (let r = 0; r < 30; r++) {
            const z = -50 * 15 + 50 * r - 5000;

            for (let c = 0; c < 30; c++) {
                const x = -50 * 15 + 50 * c + 7000;

                const wfmMat = [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    x, 0, z, 1
                ];

                this.draw_cube.instances.push(wfmMat);
            }
        }

        // 创建地球大气层对象
        await this.CreateAtmosphere(this.scene);

        // 注册鼠标滚轮事件监听器
        this.AddEventListener("wheel", (e) => {
            this.camera.Scale(e.wheelDelta, this.engine.width, this.engine.height);
            this.DrawFrame(1);
        });

        // 注册鼠标滑动事件监听器
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

        if (this.dior) {
            this.dior.Update(this.camera);
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
        // 将GIS网格添加到绘制列表
        if (this.engine.gis) {
            this.engine.gis.DrawMesh(this._drawQueue);
        }

        // 将地球大气层网格添加到绘制列表
        if (this._atmosphere) {
            this._drawQueue.DrawMesh(this._atmosphere.draw_params);
        }

        // 将立方体网格添加到绘制列表
        this._drawQueue.DrawMesh(this.draw_cube);

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

        const framePassList = this.engine.assembly.GetFramePassList("low");
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
    gltf_mesh;
    /** GLTF资源包材质资源。 */
    gltf_material;
    /** 承载GLTF资源包网格资源绘制的网格渲染器组件。 */
    gltf_meshRenderer;
    /** 承载GLTF资源包网格资源绘制的3D对象1。 */
    gltf_obj1;
    /** 承载GLTF资源包网格资源绘制的3D对象2。 */
    gltf_obj2;
}
