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

        // 创建地球大气层对象
        await this.CreateAtmosphere(this.scene);

        // 导入GLTF模型为引擎资源包
        this.gltf_pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shader_ball.zip", () => { });
        // 注册引擎资源包
        this.engine.resources.Register(this.gltf_pkg.pkg, this.gltf_pkg.files);
        // 装载GLTF中的某个网格资源
        this.gltf_mesh_0 = await resources.Mesh.Load("39-0", this.gltf_pkg.pkg);

        //this.dior = await resources.Dioramas.Create_3mx(/*"./.git.assets/3mx/Production_8.3mx"*/"http://localhost:59346/Production_1.3mx");

        this.mat_cube = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-0_standard_specular.json");
        this.mat_dior = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-2_standard_dior.json");

        this.mesh_cube = await resources.Mesh.Create({
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

        this.mesh_cube = this.gltf_mesh_0;

        this.mr_cube = await resources.MeshRenderer.Create(this.mesh_cube, null);

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

        // 将根对象定位在指定经纬度，并指定海拔高度
        // 请传入GCJ02坐标系（高德地图、腾讯地图）经纬度
        // 经纬度拾取器：https://lbs.qq.com/getPoint/
        const ll_gcj02 = this.engine.gis.WGS84_GCJ02([120.281164, 30.4857535]);
        this.object3d.SetLngLat(ll_gcj02[0], ll_gcj02[1], 0.0);

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
        // 应当为所有帧通道预备好着色器管线

        this.mr_cube.SyncInstanceData(this.object3d);

        queue.BindMeshRenderer(this.mr_cube);
        queue.BindMaterial(this.mat_cube);

        queue.BindRenderPipeline({
            flags: this.mesh_cube.vbLayout,
            topology: this.mesh_cube.triangles[0].topology,
            frontFace: 0,
            cullMode: 1
        });

        this.engine.context.SetVertexBuffers(0, this.mesh_cube.vertices, queue.passEncoder);

        for (let i = 0; i < this.mesh_cube.ibCount; i++) {
            const subMesh = this.mesh_cube.triangles[i];
            const ibFormat = this.mesh_cube.ibFormat;

            this.engine.context.SetIndexBuffer(ibFormat, subMesh, queue.passEncoder);

            queue.passEncoder.drawIndexed(
                subMesh.size / ibFormat,// indexCount
                1,                      // instanceCount
                0,                      // firstIndex
                0,                      // baseVertex
                0,                      // firstInstance
            );
        }

        if (this.dior) {
            queue.BindMeshRenderer(this.mr_cube);
            queue.BindMaterial(this.mat_dior);

            queue.BindRenderPipeline({
                flags: 0,
                topology: 3,
                frontFace: 0,
                cullMode: 2
            });

            if (queue.framePass.label == "opaque") {
                this.dior.Update(this.object3d, queue.activeG0, this.camera);
            }

            this.dior.Draw(this.mat_dior, queue.passEncoder);
        }

        if (this.engine.gis) {
            this.engine.gis.Draw(queue);
        }

        if (this._atmosphere) {
            const { mesh, material, mesh_renderer, object3d } = this._atmosphere;

            // mesh_renderer.SyncInstanceData(object3d);

            queue.BindMeshRenderer(mesh_renderer);
            queue.BindMaterial(material);

            queue.BindRenderPipeline({
                flags: mesh.vbLayout,
                topology: 3,
                frontFace: 0,
                cullMode: 2
            });

            this.engine.context.SetVertexBuffers(0, mesh.vertices, queue.passEncoder);
            this.engine.context.SetIndexBuffer(mesh.ibFormat, mesh.triangles[0], queue.passEncoder);

            queue.passEncoder.drawIndexed(
                mesh.triangles[0].size / mesh.ibFormat, // indexCount
                1,                      // instanceCount
                0,                      // firstIndex
                0,                      // baseVertex
                0,                      // firstInstance
            );
        }
    }

    /** @type {ploycloud.Scene} 场景实例。 */
    scene;
    /** @type {ploycloud.Object3D} 3D对象实例。 */
    object3d;
    /** @type {ploycloud.Camera} 相机组件实例。 */
    camera;
    /** @type {ploycloud.Volume} 体积组件实例。 */
    volume;

    /** GLTF资源包。 */
    gltf_pkg;
    /** GLTF资源包网格资源。 */
    gltf_mesh_0;

    /** @type {ploycloud.Dioramas_3mx} 倾斜摄影组件实例。 */
    dior;

    /** @type {ploycloud.Material} 材质资源实例。 */
    mat_cube;
    /** @type {ploycloud.Material} 材质资源实例。 */
    mat_dior;

    /** @type {ploycloud.Mesh} 网格资源实例。 */
    mesh_cube;

    /** @type {ploycloud.MeshRenderer} 网格渲染器组件实例。 */
    mr_cube;
}
