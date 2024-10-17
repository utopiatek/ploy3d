/** 导入PLOY3D引擎。 */
import { Ploy3D, PloyApp, Scene, Object3D, Camera, Volume, ComputeKernel } from "../dist/esm/mod.js"

/** 扩展实现APP类[cs_base]。 */
export class PloyApp_cs_base extends PloyApp {
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

        const material = await resources.Material.Create({
            uuid: "",
            classid: 32,
            name: "compute_test",
            label: "compute_test",

            shader: "1-1-1.miaokit.builtins:/shader/compute/17-20_compute_test.json",
            flags: 0,
            properties: {
                textures: {},
                vectors: {}
            }
        });

        const ibData = new Float32Array([1, 2, 3, 4]);
        const ibID = engine.device.CreateBuffer(4, ibData.byteLength);
        const obID = engine.device.CreateBuffer(4, ibData.byteLength);

        const kernel = new ComputeKernel(engine, material, "cs_main", [4, 1, 1]);

        kernel.SetBuffer(0, ibID);
        kernel.SetBuffer(1, obID);

        kernel.WriteBuffer(
            0,                  // 缓存绑定点
            0,                  // 缓存写入偏移
            ibData.buffer,      // 数据源
            ibData.byteOffset,  // 数据源偏移
            ibData.byteLength   // 数据写入大小
        );

        await kernel.Dispatch();

        const ab = await kernel.ReadBuffer(1, 0, 16);

        console.error(new Float32Array(ab), kernel);
    }

    /**
     * 绘制场景3D画面。
     */
    Draw3D() {
        // 自定义场景绘制方法
        const drawScene = (queue) => {
            // 绘制当前绘制列表内容
            // ...
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
}
