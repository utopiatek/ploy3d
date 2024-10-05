import * as Miaoverse from "./mod.js"

/** 渲染器接口。 */
export class Renderer {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
        this._queue = new DrawQueue(_global);
    }

    /**
     * 初始化渲染器接口。
     * @returns 返回渲染器接口。
     */
    public async Init() {
        return this;
    }

    /**
     * 获取渲染队列。
     * @param callback 等待后回调返回渲染队列。 
     */
    public GetQueue(callback: (queue: DrawQueue) => void) {
        this._queue.Begin(callback);
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** 当前渲染队列。 */
    private _queue: DrawQueue;
}

/** 渲染队列。 */
export class DrawQueue {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
        this._waiting = null;
        this._end = true;
        this._task = 0;
    }

    /**
     * 获取渲染队列。
     * @param callback 等待后回调返回渲染队列。
     */
    public Begin(callback: (queue: DrawQueue) => void): void {
        if (this._end && this._task == 0) {
            this._waiting = null;
            this._end = false;
            this._task = 0;
            this.drawList = {
                drawCalls: [],
                drawParts: null,
                instanceVB: 0,
                instanceCount: 0
            };

            this.camera = null;
            this.volume = null;
            this.target = null;
            this.framePassList = null;
            this.execStat = null;

            this.framePass = null;
            this.cmdEncoder = null;
            this.passEncoder = null;
            this.computeEncoder = null;

            this.activeG0 = null;
            this.activeG1 = null;
            this.activeG2 = null;
            this.activeG3 = null;

            this.activePipeline = null;

            callback(this);
        }
        else {
            this._waiting = callback;
        }
    }

    /**
     * 结束当前对渲染队列的使用。
     */
    public End(end = true) {
        this._end = true;
        this.Flush();
    }

    /**
     * 刷新渲染队列状态。
     */
    private Flush() {
        if (this._end && this._waiting && this._task == 0) {
            const waiting = this._waiting;
            this._waiting = null;

            this.Begin(waiting);
        }
    }

    /**
     * 对资源包进行快照渲染。
     */
    public async Snapshot(scene: Miaoverse.Scene, menu: Miaoverse.PackageReg["menu"]) {
        const resources = this._global.resources;

        // ====================--------------------------------

        const prefab_thumbnail_start = 0;
        const prefabs: {
            thumbnail_index: number;
            prefab: Miaoverse.Prefab;
        }[] = [];

        for (let entry of menu.list) {
            if (entry.classid == Miaoverse.CLASSID.ASSET_PREFAB) {
                const thumbnail_index = prefab_thumbnail_start + prefabs.length;
                const prefab = await resources.Scene.InstancePrefab(scene, entry.uuid);

                prefabs.push({
                    thumbnail_index,
                    prefab
                });
            }
        }

        // ====================--------------------------------

        const mesh_thumbnail_start = prefab_thumbnail_start + prefabs.length;
        const meshes: {
            thumbnail_index: number;
            object: Miaoverse.Object3D;
            mesh: Miaoverse.Mesh;
        }[] = [];

        for (let entry of menu.list) {
            if (entry.classid == Miaoverse.CLASSID.ASSET_MESH) {
                const thumbnail_index = mesh_thumbnail_start + meshes.length;
                const mesh = await resources.Mesh.Load(entry.uuid);

                meshes.push({
                    thumbnail_index,
                    object: null,
                    mesh
                });
            }
        }

        // ====================--------------------------------

        const material_thumbnail_start = mesh_thumbnail_start + meshes.length;
        const materials: {
            thumbnail_index: number;
            material: Miaoverse.Material;
        }[] = [];

        for (let entry of menu.list) {
            if (entry.classid == Miaoverse.CLASSID.ASSET_MATERIAL) {
                const thumbnail_index = material_thumbnail_start + materials.length;
                const material = await resources.Material.Load(entry.uuid) as Miaoverse.Material;

                materials.push({
                    thumbnail_index,
                    material
                });
            }
        }

        // ====================--------------------------------

        const texture_thumbnail_start = material_thumbnail_start + materials.length;
        const textures: {
            thumbnail_index: number;
            texture: Miaoverse.Texture;
        }[] = [];

        for (let entry of menu.list) {
            if (entry.classid == Miaoverse.CLASSID.ASSET_TEXTURE_FILE) {
                const thumbnail_index = texture_thumbnail_start + textures.length;
                const texture = await resources.Texture.Load(entry.uuid);

                textures.push({
                    thumbnail_index,
                    texture
                });
            }
        }

        // ====================--------------------------------

        let unproc = meshes.length;

        let proc = (obj: Miaoverse.Object3D) => {
            const meshRenderer = obj.meshRenderer;
            if (meshRenderer) {
                const mesh = meshRenderer.mesh;
                if (mesh) {
                    for (let item of meshes) {
                        if (item.mesh == mesh) {
                            item.object = obj;
                            unproc--;
                            break;
                        }
                    }
                }
            }

            return unproc == 0 ? true : false;
        };

        for (let prefab of prefabs) {
            for (let obj of prefab.prefab.instanceList) {
                proc(obj);
            }
        }

        let mat_obj: Miaoverse.Object3D = null;

        // ====================--------------------------------

        const thumbnail_count = texture_thumbnail_start + textures.length;
        const cols = Math.ceil(Math.sqrt(thumbnail_count));
        let rows = Math.floor(Math.sqrt(thumbnail_count));
        if (thumbnail_count > (cols * rows)) {
            rows++;
        }

        const canvas_rt = this._global.config.surface as HTMLCanvasElement;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 128 * cols;
        canvas.height = 128 * rows;

        const complete = (callback: () => void) => {
            canvas.toBlob((blob) => {
                menu.thumbnail = window.URL.createObjectURL(blob);
                menu.thumbnail_per_row = cols;
                menu.thumbnail_blob = blob;

                callback();
            }, "image/jpeg", 0.5);
        };

        // ====================--------------------------------

        type DrawPass = {
            drawTexture: typeof textures[0];
            drawObjects: Miaoverse.Object3D[];
            forceMat: Miaoverse.Material;
            variantCount: number;
            UseVariant: (index: number, queue: DrawQueue) => void;
            EndVariant: (index: number, queue: DrawQueue, callback: () => void) => void;
        };

        const passes: DrawPass[] = [];

        if (0 < prefabs.length) {
            // 绘制单个预制件预览
            const pass: DrawPass = {
                drawTexture: null,
                drawObjects: [],
                forceMat: null,
                variantCount: prefabs.length,
                UseVariant: (index: number, queue: DrawQueue) => {
                    pass.drawObjects = [];

                    for (let obj of prefabs[index].prefab.instanceList) {
                        if (obj.meshRenderer) {
                            pass.drawObjects.push(obj);
                        }
                    }
                },
                EndVariant: (index: number, queue: DrawQueue, callback: () => void) => {
                    const icon = prefabs[index].thumbnail_index;
                    const col = icon % cols;
                    const row = Math.floor(index / cols);

                    ctx.drawImage(canvas_rt, 128 * col, 128 * row, 128, 128);

                    callback();
                }
            };

            passes.push(pass);
        }

        if (0 < meshes.length) {
            const pass: DrawPass = {
                drawTexture: null,
                drawObjects: [],
                forceMat: null,
                variantCount: meshes.length,
                UseVariant: (index: number, queue: DrawQueue) => {
                    const obj = meshes[index].object;
                    if (obj) {
                        pass.drawObjects = [obj];
                    }
                    else {
                        pass.drawObjects = [];
                    }
                },
                EndVariant: (index: number, queue: DrawQueue, callback: () => void) => {
                    const icon = meshes[index].thumbnail_index;
                    const col = icon % cols;
                    const row = Math.floor(icon / cols);

                    ctx.drawImage(canvas_rt, 128 * col, 128 * row, 128, 128);

                    callback();
                }
            };

            passes.push(pass);
        }

        if (0 < materials.length) {
            const pass: DrawPass = {
                drawTexture: null,
                drawObjects: [mat_obj],
                forceMat: null,
                variantCount: materials.length,
                UseVariant: (index: number, queue: DrawQueue) => {
                    pass.forceMat = materials[index].material;
                },
                EndVariant: (index: number, queue: DrawQueue, callback: () => void) => {
                    const icon = materials[index].thumbnail_index;
                    const col = icon % cols;
                    const row = Math.floor(icon / cols);

                    ctx.drawImage(canvas_rt, 128 * col, 128 * row, 128, 128);

                    callback();
                }
            };

            passes.push(pass);
        }

        if (0 < textures.length) {
            const pass: DrawPass = {
                drawTexture: null,
                drawObjects: [],
                forceMat: null,
                variantCount: textures.length,
                UseVariant: (index: number, queue: DrawQueue) => {
                    pass.drawTexture = textures[index];
                },
                EndVariant: (index: number, queue: DrawQueue, callback: () => void) => {
                    const icon = textures[index].thumbnail_index;
                    const col = icon % cols;
                    const row = Math.floor(icon / cols);

                    ctx.drawImage(canvas_rt, 128 * col, 128 * row, 128, 128);

                    callback();
                }
            };

            passes.push(pass);
        }

        // ====================--------------------------------

        console.error("prefabs:", prefabs);
        console.error("meshes:", meshes);
        console.error("materials:", materials);
        console.error("textures:", textures);
        console.error("mat_obj:", mat_obj);
        console.error("thumbnail_count:", cols, rows, thumbnail_count);
    }

    /**
     * 执行帧绘制。
     * @param camera 相机组件实例。
     * @param volume 体积组件实例。
     * @param target 帧绘制目标贴图视图。
     * @param framePassList 帧通道配置列表。
     * @param queue 绘制队列。
     * @param draw 场景绘制方法。
     * @param callback 绘制完成回调。
     */
    public Execute(
        camera: Miaoverse.Camera,
        volume: Miaoverse.Volume,
        target: DrawQueue["target"],
        framePassList: DrawQueue["framePassList"],
        draw: (queue: DrawQueue) => void,
        callback: (e: any) => void) {

        const device = this._global.device.device;
        const env = this._global.env;

        this.camera = camera;
        this.volume = volume;
        this.target = target;
        this.framePassList = framePassList;
        this.execStat = {
            encodeTS: Date.now(),
            executeTS: Date.now(),

            drawObjectCount: 0,
            drawPartCount: 0,
            computeCount: 0,
        };

        // 相机宽高比与画布元素宽高比相关，而不与渲染目标贴图宽高比相关
        this.camera.width = this._global.width;
        this.camera.height = this._global.height;

        // ===================-------------------------

        const MeshRenderer = this._global.resources.MeshRenderer;
        const GetInstanceSlot = MeshRenderer["_GetInstanceSlot"];
        const VerifyInstance = MeshRenderer["_VerifyInstance"];

        // 清空实例数据数组
        GetInstanceSlot(1);
        // 至少分配一个实例槽
        GetInstanceSlot(2);

        const drawCalls = this.drawList.drawCalls;
        const drawParts = this.drawList.drawParts = [] as number[][];

        for (let call of drawCalls) {
            const bbCenter = call.mesh?.center || [0, 0, 0];
            const bbExtents = call.mesh?.extents || [1, 1, 1];

            let instanceCount = 0;
            let firstInstance = 0;

            for (let i = 0; i < call.instances.length; i++) {
                const ptr = GetInstanceSlot(0);

                env.farraySet(ptr, 0, call.instances[i]);   // wfmMat

                env.uscalarSet(ptr, 16, 0);                 // object
                env.uscalarSet(ptr, 17, call.flags);        // flags
                env.uscalarSet(ptr, 18, call.layers);       // layers
                env.uscalarSet(ptr, 19, call.userData);     // userData

                env.farraySet(ptr, 20, bbCenter);           // bbCenter
                env.farraySet(ptr, 23, bbExtents);          // bbExtents

                // 实例可见性检测、层掩码检测
                const slot = VerifyInstance(ptr, camera.internalPtr);

                if (slot > -1) {
                    if (0 == instanceCount++) {
                        firstInstance = slot;
                    }
                }
            }

            //console.error("instances culling:", call.instances.length, instanceCount);

            if (instanceCount > 0) {
                for (let mat of call.materials) {
                    const part = mat.drawParams;

                    part[5] = instanceCount;
                    part[6] = firstInstance;

                    drawParts.push(part);
                }
            }
        }

        this.drawList.drawParts2 = this._global.resources.Scene.Culling(this.camera, 0xFFFFFFFF);

        this.drawList.instanceCount = GetInstanceSlot(4);
        this.drawList.instanceVB = GetInstanceSlot(8);

        // ===================-------------------------

        this.Draw = draw;

        for (let framePass of framePassList.framePass) {
            this.ExecuteFramePass(framePass);
        }

        this._task++;
        this.execStat.encodeTS = Date.now() - this.execStat.encodeTS;

        const _callback = (e: any) => {
            this._task--;
            this.execStat.executeTS = Date.now() - this.execStat.executeTS;

            callback(e);

            this.Flush();
        };

        device.queue.onSubmittedWorkDone().then(_callback).catch(_callback);
    }

    /**
     * 执行帧通道。
     * @param framePass 帧通道实例。 
     * @param queue 绘制队列。
     */
    private ExecuteFramePass(framePass: Miaoverse.GLFramePass) {
        const device = this._global.device.device;

        this.framePass = framePass;

        for (let v = 0; v < (framePass.variantCount || 1); v++) {
            framePass.PreExecute(v, this);

            // 帧通道变体会更新G0，因此分配独立命令编码器
            this.cmdEncoder = device.createCommandEncoder();

            // 为了便于调试，不应设置复杂对象为参数
            // this.passEncoder = this.cmdEncoder.beginRenderPass(framePass);
            this.passEncoder = this.cmdEncoder.beginRenderPass({
                colorAttachments: framePass.colorAttachments,
                depthStencilAttachment: framePass.depthStencilAttachment,
            });

            this.activeG0 = null;
            this.activeG1 = null;
            this.activeG2 = null;
            this.activeG3 = null;

            this.activePipeline = null;

            this.computeEncoder = null;

            framePass.Execute(v, this);

            this.passEncoder.end();

            device.queue.submit([this.cmdEncoder.finish()]);
        }
    }

    /**
     * 绑定帧统一资源组实例（G0）。
     * @param frameUniforms 帧统一资源组实例（G0）。
     * @param shadow_cast_index 阴影投射通道索引（Cascaded Shadow Maps视锥分片索引（大于-1时设置阴影投影渲染相关矩阵））。
     */
    public BindFrameUniforms(frameUniforms: Miaoverse.FrameUniforms, shadow_cast_index = -1) {
        const infoRT = this._global.assembly.config.renderTargets;

        frameUniforms.UpdateFrameUniforms(this.camera, this.volume);
        frameUniforms.view.targetInfo = [infoRT.width, infoRT.width * infoRT.scale, 1.0 / (infoRT.width * infoRT.scale), infoRT.scale];

        if (shadow_cast_index > -1) {
            frameUniforms.ComputeLightSpaceMatrixes(this.camera, shadow_cast_index);
        }

        frameUniforms.Bind(this.passEncoder);

        this.activeG0 = frameUniforms;
    }

    /**
     * 绑定网格渲染器组件。
     * @param meshRenderer 网格渲染器组件实例。
     */
    public BindMeshRenderer(meshRenderer: Miaoverse.MeshRenderer) {
        meshRenderer.Bind(this.passEncoder);

        this.activeG1 = meshRenderer;
    }

    /**
     * 绑定材质资源实例。
     * @param material 材质资源实例。
     */
    public BindMaterial(material: Miaoverse.Material) {
        material.Bind(this.passEncoder);

        this.activeG2 = material;
    }

    /**
     * 基于当前资源绑定设置着色器管线（需要先调用BindFrameUniforms、BindMeshRenderer、BindMaterial，在后期帧通道绘制中有使用）。
     */
    public BindRenderPipeline(config: {
        /** 渲染设置标记集（材质与网格渲染器共同设置）。 */
        flags: number;
        /** 图元类型（子网格设置）。 */
        topology: number;

        /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0。网格渲染器设置）。*/
        frontFace: number;
        /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1。网格渲染器设置）。*/
        cullMode: number;
    }) {
        const id = this._global.context.CreateRenderPipeline({
            g1: this.activeG1.layoutID,
            g2: this.activeG2.layoutID,
            g3: 0,
            ...config
        });

        this.SetPipeline(id, 0);
    }

    /**
     * 绑定对应当前帧通道设置的GPU着色器管线实例。
     * @param pipelineID 着色器管线实例ID。
     * @param materialSlot 材质槽索引。
     */
    public SetPipeline(pipelineID: number, materialSlot: number) {
        const activePipeline = this._global.context.GetRenderPipeline(pipelineID, this.framePass, materialSlot);

        if (this.activePipeline != activePipeline) {
            this.activePipeline = activePipeline;
            this.passEncoder.setPipeline(activePipeline);
        }
    }

    /**
     * 动态绘制网格。
     * @param params 动态绘制参数。
     */
    public DrawMesh(params: DrawQueue["drawList"]["drawCalls"][0]) {
        this.drawList.drawCalls.push(params);

        const g1 = this._global.resources.MeshRenderer.defaultG1;

        for (let mat of params.materials) {
            let flags = mat.material.enableFlags;
            let topology = 3;

            if (params.mesh) {
                flags |= params.mesh.vbLayout;
                topology = params.mesh.triangles[mat.submesh].topology;
            }
            else {
                flags |= Miaoverse.RENDER_FLAGS.DRAW_ARRAYS;
                topology = params.topology;
            }

            if (params.castShadows) {
                flags |= Miaoverse.RENDER_FLAGS.CAST_SHADOWS;
            }

            if (params.receiveShadows) {
                flags |= Miaoverse.RENDER_FLAGS.RECEIVE_SHADOWS;
            }

            const pipeline = this._global.context.CreateRenderPipeline({
                g1: g1.layoutID,
                g2: mat.material.layoutID,
                g3: 0,

                flags,
                topology,

                frontFace: params.frontFace,
                cullMode: params.cullMode
            });

            mat.drawParams = [
                g1.id,              // g1
                mat.material.id,    // g2
                pipeline,           // pipeline
                params.mesh?.id,    // mesh
                mat.submesh,        // submesh
                1,                  // instanceCount
                0,                  // firstInstance
            ];
        }
    }

    /** 
     * 绘制当前绘制列表。
     */
    public DrawList() {
        const parts = this.drawList.drawParts;

        for (let params of parts) {
            this.DrawPart(
                params[0],  // g1
                params[1],  // g2
                params[2],  // pipeline
                params[3],  // mesh
                params[4],  // submesh
                params[5],  // instanceCount
                params[6],  // firstInstance
                params[7],  // materialSlot
            );
        }

        const parts2 = this.drawList.drawParts2;

        if (parts2) {
            const count = parts2.count;
            const params = parts2.params;
            const indices = parts2.indices;

            if (indices) {
                // TODO: 使用索引数组编排绘制顺序以提高性能
            }
            else {
                for (let i = 0; i < count; i++) {
                    const i8 = i * 8;

                    this.DrawPart(
                        params[i8 + 0],  // g1
                        params[i8 + 1],  // g2
                        params[i8 + 2],  // pipeline
                        params[i8 + 3],  // mesh
                        params[i8 + 4],  // submesh
                        params[i8 + 5],  // instanceCount
                        params[i8 + 6],  // firstInstance
                        params[i8 + 7],  // materialSlot
                    );
                }
            }
        }

        //console.error(parts);
    }

    /**
     * 子网格绘制方法。
     * @param g1 网格渲染器实例ID。
     * @param g2 材质实例ID。
     * @param pipeline 着色器管线实例ID。
     * @param mesh 网格资源ID。
     * @param submesh 子网格索引。
     * @param instanceCount 绘制实例数量。
     * @param firstInstance 起始绘制实例索引。
     */
    public DrawPart(g1: number, g2: number, pipeline: number, mesh: number, submesh: number, instanceCount = 1, firstInstance = 0, materialSlot = 0) {
        const resources = this._global.resources;
        const context = this._global.context;
        const activeG1 = resources.MeshRenderer.GetInstanceByID(g1);
        const activeG2 = resources.Material.GetInstanceByID(g2) as Miaoverse.Material;
        const activeMesh = resources.Mesh.GetInstanceByID(mesh);

        if (this.activeG1 != activeG1) {
            this.BindMeshRenderer(activeG1);
        }

        if (this.activeG2 != activeG2) {
            this.BindMaterial(activeG2);
        }

        this.SetPipeline(pipeline, materialSlot);

        if (activeMesh) {
            if (this.activeMesh != activeMesh) {
                const vertices = activeMesh.vertices;
                context.SetVertexBuffers(0, vertices, this.passEncoder);
                context.SetVertexBuffer(vertices.length, this.drawList.instanceVB, 0, 104 * this.drawList.instanceCount, this.passEncoder);
            }

            const ibFormat = activeMesh.ibFormat;
            const subMesh = activeMesh.triangles[submesh];

            context.SetIndexBuffer(ibFormat, subMesh, this.passEncoder);

            if (activeG1.drawCustom) {
                activeG1.drawCustom(this, "drawIndexed", [
                    subMesh.size / ibFormat,// indexCount
                    instanceCount,          // instanceCount
                    0,                      // firstIndex
                    0,                      // baseVertex
                    firstInstance,          // firstInstance
                ]);
            }
            else {
                this.passEncoder.drawIndexed(
                    subMesh.size / ibFormat,// indexCount
                    instanceCount,          // instanceCount
                    0,                      // firstIndex
                    0,                      // baseVertex
                    firstInstance,          // firstInstance
                );
            }
        }
        else {
            const drawCount = activeG2.view.drawCount?.[0];
            if (drawCount) {
                if (activeG1.drawCustom) {
                    activeG1.drawCustom(this, "draw", [
                        drawCount,              // vertexCount
                        instanceCount,          // instanceCount
                        0,                      // firstVertex
                        firstInstance,          // firstInstance
                    ]);
                }
                else {
                    this.passEncoder.draw(
                        drawCount,              // vertexCount
                        instanceCount,          // instanceCount
                        0,                      // firstVertex
                        firstInstance,          // firstInstance
                    );
                }
            }
        }
    }

    /** 当前场景绘制方法。 */
    public Draw?: (queue: DrawQueue) => void;

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** 等待当前所有任务完成后响应。 */
    private _waiting: (queue: DrawQueue) => void;
    /** 是否已结束当前对渲染队列的使用。 */
    private _end: boolean;
    /** 当前剩余任务。 */
    private _task: number;

    /** 当前相机组件实例。 */
    public camera: Miaoverse.Camera;
    /** 当前体积组件实例。 */
    public volume: Miaoverse.Volume;
    /** 当前相机渲染目标贴图视图。 */
    public target: {
        /** 目标贴图。 */
        texture: GPUTexture;
        /** 目标贴图视图。 */
        view: GPUTextureView;
        /** 目标视口。 */
        viewport: number[];
    };
    /** 当前帧通道配置列表。 */
    public framePassList: Miaoverse.Assembly_config["pipelines"][""];
    /** 当前绘制列表。 */
    public drawList: {
        /** 当前动态绘制命令列表。 */
        drawCalls: {
            /** 3D对象渲染标志集。 */
            flags: number;
            /** 3D对象层标记。 */
            layers: number;
            /** 用户数据。 */
            userData: number;

            /** 是否投射阴影。 */
            castShadows?: boolean;
            /** 是否接收阴影。 */
            receiveShadows?: boolean;
            /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0）。 */
            frontFace: number;
            /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1）。 */
            cullMode: number;
            /** 图元类型（网格资源为空时需指定该参数）。 */
            topology?: Miaoverse.GLPrimitiveTopology;

            /** 网格资源实例（可为空）。 */
            mesh: Miaoverse.Mesh;
            /** 绘制材质列表。 */
            materials: {
                /** 子网格索引（网格资源实例为空时不使用该字段）。 */
                submesh: number;
                /** 材质资源实例。 */
                material: Miaoverse.Material;

                /** 绘制参数集（[g1, g2, pipeline, mesh, submesh, instanceCount, firstInstance]）。 */
                drawParams?: number[];
            }[];

            /** 实例数据列表（模型空间到世界空间转换矩阵）。 */
            instances: number[][];
        }[];
        /** 材质绘制参数集列表。 */
        drawParts: number[][];
        /** 场景材质绘制参数集列表。 */
        drawParts2?: { count: number, params: ArrayLike<number>; indices?: number[]; };
        /** 实例绘制数据缓存。 */
        instanceVB: number;
        /** 实例绘制数据数量（每个104字节）。 */
        instanceCount: number;
    };
    /** 当前相机渲染执行统计。 */
    public execStat: ExecuteStat;

    /** 当前活动帧通道。 */
    public framePass: Miaoverse.GLFramePass;
    /** 当前GPU指令编码器。 */
    public cmdEncoder: GPUCommandEncoder;
    /** 当前渲染指令编码器。 */
    public passEncoder: GPURenderPassEncoder;
    /** 当前计算指令编码器。 */
    public computeEncoder: GPUComputePassEncoder;

    /** 当前活动GO常量缓存。 */
    public activeG0: Miaoverse.FrameUniforms;
    /** 当前活动G1常量缓存。 */
    public activeG1: Miaoverse.MeshRenderer;
    /** 当前活动G2常量缓存。 */
    public activeG2: Miaoverse.Material;
    /** 当前活动G3常量缓存。 */
    public activeG3: any;

    /** 当前活动着色管线。 */
    public activePipeline: GPURenderPipeline;
    /** 当前活动网格顶点缓存。 */
    public activeMesh: Miaoverse.Mesh;
}

/** 帧通道配置。 */
export interface GLFramePass extends GPURenderPassDescriptor {
    /** 唯一标识。 */
    label: string;
    /** 唯一编号（第一变体编号）。 */
    id?: number;
    /** 唯一编号（变体唯一）。 */
    index?: number;

    /**
     * 颜色渲染目标设置。
     * 注意，通常帧通道仅配置渲染队列过滤范围，不描述颜色渲染目标混合模式。
     * 颜色渲染目标混合模式通常由材质指定。
     * 处于特殊用途考虑，也帧通道配置中指定颜色渲染目标混合模式，并优先采用该配置而不使用材质的配置。
     */
    colorAttachments: (GPUColorTargetState & GPURenderPassColorAttachment & {
        // GPUColorTargetState 在 GPURenderPipelineDescriptor 使用 ==========--------------------------------

        /** 颜色渲染目标贴图像素格式。 */
        format: GPUTextureFormat;
        /** 
         * 位掩码，指定在渲染操作中哪些颜色通道可以被写入（GPUColorWrite值的组合）。
         * GPUColorWrite.RED: 0x1
         * GPUColorWrite.GREEN: 0x2
         * GPUColorWrite.BLUE: 0x4
         * GPUColorWrite.ALPHA: 0x8
         * GPUColorWrite.ALL: 0xF
         */
        writeMask?: GPUColorWriteFlags;
        /** 颜色渲染目标混合模式（若此处不设置则取材质的混合模式设置，null表示不启用混合，undefined表示不指定由材质指定）。 */
        blend?: GPUBlendState;

        // GPURenderPassColorAttachment 在 GPURenderPassDescriptor 使用 ==========--------------------------------

        /** 颜色渲染目标贴图视图（多重采样时作为中间目标）。 */
        view: GPUTextureView;
        /** 多重采样时作为最终目标。 */
        resolveTarget?: GPUTextureView;
        /** 颜色渲染目标清空值。 */
        clearValue?: GPUColor;
        /** 颜色渲染目标装载到渲染通道时的操作。 */
        loadOp: GPULoadOp;
        /** 颜色渲染目标写操作。 */
        storeOp: GPUStoreOp;

        // 引擎使用字段 ==========--------------------------------

        /** 渲染目标实例引用。 */
        target: {
            /** 唯一标识。 */
            name: string;
            /** 渲染目标视图解析格式（应与渲染目标贴图格式兼容）。 */
            format?: GPUTextureFormat;
            /** 渲染目标贴图层索引。 */
            layer: number;
            /** 渲染目标贴图级别。 */
            level: number;
        };
    })[];

    /** 深度和模板渲染目标设置。 */
    depthStencilAttachment?: (GPUDepthStencilState & {
        // GPUDepthStencilState 在 GPURenderPipelineDescriptor 使用，与着色器中的 GPUDepthStencilState 相并 ==========--------------------------------

        /** 深度和模板渲染贴图格式。 */
        format: GPUTextureFormat;
        /** 是否允许写入深度值。 */
        depthWriteEnabled: boolean;
        /** 深度比较方法。 */
        depthCompare: GPUCompareFunction;

        // GPURenderPassDepthStencilAttachment 在 GPURenderPassDescriptor 使用 ==========--------------------------------

        /** 深度渲染目标贴图视图。 */
        view: GPUTextureView;
        /** 深度渲染目标清空值。 */
        depthClearValue?: number;
        /** 深度渲染目标渲染装载到渲染通道时的操作。 */
        depthLoadOp: GPULoadOp;
        /** 深度渲染目标写操作。 */
        depthStoreOp: GPUStoreOp;
        /** 深度渲染目标是否只读。 */
        depthReadOnly?: boolean;

        // 引擎使用字段 ==========--------------------------------

        /** 渲染目标实例引用。 */
        target: {
            /** 唯一标识。 */
            name: string;
            /** 渲染目标贴图层索引。 */
            layer: number;
            /** 渲染目标贴图级别。 */
            level: number;
        };
    });

    /**
     * 多重采样设置（在GPURenderPipelineDescriptor中使用）。
     * https://zhuanlan.zhihu.com/p/647524274
     * 多重采样是一种抗锯齿技术，用于提高图形渲染的质量。它通过对一个像素的多个样本进行采样和平均，来减少边缘的锯齿状不平滑现象。
     * 开启了Alpha To Coverage后，fragment的alpha值会影响该fragment对应像素的采样点是否被覆盖。
     * 启用ALPHA_TO_COVERAGE标记可以使内部颜色根据不透明度平滑过渡到边缘。A值会影响样点遮挡信息（coverage）的计算，从而影响写入的颜色比例；
     * 步骤：
     * 1、创建一个具有多重采样能力的渲染目标纹理（msaaTexture）；
     *  GPUTextureDescriptor.sampleCount = 4;
     *  在光栅化阶段，在1个像素周围使用4个子采样点，但每个像素仍只执行1次像素着色器的计算。
     *  这4个子采样点都会计算自己的深度值，然后根据深度测试（Occlusion）和三角形覆盖性测试（Coverage）来决定是否复制该像素的计算结果。
     *  为此深度缓冲区和渲染目标需要的空间为非多重采样的4倍。
     *  MSAA在光栅化阶段只是生成覆盖信息，计算像素颜色，根据覆盖信息和深度信息决定是否将像素颜色写入子采样点。
     *  整个光栅化完成后再通过某个过滤器进行解析（Resolve）得到最终的图像。
     *  在更大的分辨率上计算覆盖信息和遮挡信息后，得到4个样点的平均覆盖率和平均遮挡率，解析根据该平均值向4个样点混合入片元颜色
     * 2、在创建渲染管线时指定多重采样状态；
     *  GPURenderPipelineDescriptor.multisample.count = 4;
     * 3、在渲染通道描述符中设置多重采样纹理视图：
     *  GPURenderPassColorAttachment.view = msaaTexture.view;
     * 4、在渲染通道描述符中设置解析目标（通常是交换链的纹理视图）：
     *  GPURenderPassColorAttachment.resolveTarget = canvas.view;
     *  用于存储多重采样渲染操作的解析结果。
     *  当你使用MSAA时，每个像素会有多个样本。这些样本需要被合并或“解析”成单个样本存储到resolveTarget中。
     */
    multisample?: GPUMultisampleState;

    /** 
     * 是否启用depth-clip-control特性（在GPUPrimitiveState中使用）。
     * 默认情况下，多边形的深度在光栅化过程中会被裁剪到0-1的范围内，超出这个范围的部分会被拒绝，相关的片元也不会被处理。
     * 启用depth-clip-control特性后，可以禁用这种裁剪。
     */
    unclippedDepth?: boolean;

    // 引擎使用字段 ==========--------------------------------

    /** 通道所用着色器类型。 */
    mode: "shading" | "postprocess" | "compute";
    /** 帧通道变体数量（默认1，每个变体）。 */
    variantCount?: number;
    /** 是否由着色器控制深度写入值（深度贴图MIPMAP帧通道使用）。 */
    depthCtrl?: boolean;
    /** 层掩码，用于在渲染前过滤对象。 */
    layerMask?: number;
    /** 渲染排序方法（多重方法标志集，越低位权重越高）。 */
    sortingCriteria?: number;
    /** 是否翻转由网格渲染器定义的裁剪面向。 */
    invertCull?: boolean;
    /** 指定固定使用的材质绘制帧（通常在后处理帧通道使用）。 */
    materialSpec?: Miaoverse.Asset_material & { instance?: Miaoverse.Material; g3?: GPUBindGroup; };
    /** 特别指定着色器通道宏定义。 */
    shaderMacro?: Record<string, number>;

    /** 帧绘制资源组G0。 */
    frameUniforms: string;
    /** 渲染队列范围。 */
    queueRange: Miaoverse.RENDER_QUEUE_RANGE;
    /** 绘制渲染目标区域。 */
    rect: number[];
    /** 渲染视口。 */
    viewport?: number[];

    /** 预备执行帧通道。 */
    PreExecute?: (variant: number, queue: DrawQueue) => boolean;
    /** 执行帧通道。 */
    Execute?: (variant: number, queue: DrawQueue) => void;
}

/** 相机画面渲染执行统计。 */
export interface ExecuteStat {
    /** 指令编码计时。 */
    encodeTS: number;
    /** 指令执行计时。 */
    executeTS: number;

    /** 绘制对象次数。 */
    drawObjectCount: number;
    /** 绘制子网格次数。 */
    drawPartCount: number;
    /** 执行计算着色器次数。 */
    computeCount: number;
}
