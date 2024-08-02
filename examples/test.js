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

        //const gltf_pkg = await this.engine.worker.Import_gltf(1, "./assets/gltf/shader_ball.zip", () => { });
        //console.log("gltf_pkg:", gltf_pkg);

        //this.dior = await resources.Dioramas.Create_3mx(/*"./packages/w3mx/Scene/Production_8.3mx"*/"http://localhost:56558/Production_1.3mx");

        this.mat_cube = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-0_standard_specular.json");
        this.mat_dior = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-2_standard_dior.json");

        this.mesh_cube = resources.Mesh.Create({
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
        const targetLL = this.engine.gis.GCJ02_WGS84([116.397459, 39.908796]);
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

        queue.BindMeshRenderer(this.mr_cube);
        queue.BindMaterial(this.mat_cube);

        queue.BindRenderPipeline({
            flags: this.mesh_cube.vbLayout,
            topology: this.mesh_cube.triangles[0].topology,
            frontFace: 0,
            cullMode: 1
        });

        this.engine.context.SetVertexBuffers(0, this.mesh_cube.vertices, queue.passEncoder);
        this.engine.context.SetIndexBuffer(this.mesh_cube.ibFormat, this.mesh_cube.triangles[0], queue.passEncoder);

        queue.passEncoder.drawIndexed(
            this.mesh_cube.iCount,  // indexCount
            1,                      // instanceCount
            0,                      // firstIndex
            0,                      // baseVertex
            0,                      // firstInstance
        );

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
    }

    /** @type {ploycloud.Scene} 场景实例。 */
    scene;
    /** @type {ploycloud.Object3D} 3D对象实例。 */
    object3d;
    /** @type {ploycloud.Camera} 相机组件实例。 */
    camera;
    /** @type {ploycloud.Volume} 体积组件实例。 */
    volume;

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
