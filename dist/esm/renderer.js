export class Renderer {
    constructor(_global) {
        this._global = _global;
        this._queue = new DrawQueue(_global);
    }
    async Init() {
        return this;
    }
    async Dispose() {
        const snapshotUtil = this._queue["_snapshotUtil"];
        if (snapshotUtil) {
            if (snapshotUtil.imageBuffer) {
                snapshotUtil.imageBuffer.destroy();
            }
            if (snapshotUtil.materialSphere) {
            }
            snapshotUtil.outputCanvas = null;
            snapshotUtil.outputCtx = null;
            snapshotUtil.outputGen = null;
            snapshotUtil.imageTexture = null;
            snapshotUtil.imageBuffer = null;
            snapshotUtil.imageRead = null;
            snapshotUtil.imageWrite = null;
            snapshotUtil.materialSphere = null;
        }
        this._queue["_global"] = null;
        this._queue["_snapshotUtil"] = null;
        this._queue["_waiting"] = null;
        this._queue["_end"] = null;
        this._queue["_task"] = null;
        this._queue.camera = null;
        this._queue.volume = null;
        this._queue.target = null;
        this._queue.framePassList = null;
        this._queue.drawList = null;
        this._queue.execStat = null;
        this._queue.framePass = null;
        this._queue.cmdEncoder = null;
        this._queue.passEncoder = null;
        this._queue.computeEncoder = null;
        this._queue.activeG0 = null;
        this._queue.activeG1 = null;
        this._queue.activeG2 = null;
        this._queue.activeG3 = null;
        this._queue.activePipeline = null;
        this._queue.activeMesh = null;
        this._queue = null;
        this._global.renderer = null;
        this._global = null;
    }
    GetQueue(callback) {
        this._queue.Begin(callback);
    }
    _global;
    _queue;
}
export class DrawQueue {
    constructor(_global) {
        this._global = _global;
        this._waiting = null;
        this._end = true;
        this._task = 0;
    }
    Begin(callback) {
        if (this._end && this._task == 0) {
            this._global.device.GC();
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
    End(end = true) {
        this._end = true;
        this.Flush();
    }
    Flush() {
        if (this._end && this._waiting && this._task == 0) {
            const waiting = this._waiting;
            this._waiting = null;
            this.Begin(waiting);
        }
    }
    Snapshot(scene, menu, surface, camera, volume, framePassList, end) {
        const finalPass = framePassList.framePass[framePassList.framePass.length - 1];
        const finalMacro = finalPass.shaderMacro;
        const finalMat = finalPass.materialSpec.instance;
        const resources = this._global.resources;
        const device = this._global.device.device;
        const env = this._global.env;
        const this_ = this;
        this.camera = camera;
        this.volume = volume;
        this.framePassList = framePassList;
        this.execStat = {
            encodeTS: Date.now(),
            executeTS: Date.now(),
            drawObjectCount: 0,
            drawPartCount: 0,
            computeCount: 0,
        };
        this.camera.width = 128;
        this.camera.height = 128;
        if (!this._snapshotUtil) {
            this._snapshotUtil = {};
            this._snapshotUtil.outputCanvas = document.createElement('canvas');
            this._snapshotUtil.outputCtx = this._snapshotUtil.outputCanvas.getContext('2d');
            this._snapshotUtil.outputCanvas.width = 128;
            this._snapshotUtil.outputCanvas.height = 128;
            this._snapshotUtil.outputCanvas.style.zIndex = "9999";
            this._snapshotUtil.outputCanvas.style.position = "absolute";
            this._snapshotUtil.outputGen = async () => {
                return (new Promise((resolve, reject) => {
                    this._snapshotUtil.outputCanvas.toBlob(resolve, "image/jpeg", 0.5);
                }));
            };
            this._snapshotUtil.imageBuffer = device.createBuffer({
                size: 4 * 128 * 128,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });
            this._snapshotUtil.imageRead = async () => {
                const cmdEncoder = device.createCommandEncoder();
                cmdEncoder.copyTextureToBuffer({ texture: this._snapshotUtil.imageTexture, mipLevel: 0, origin: [0, 0, 0] }, { buffer: this._snapshotUtil.imageBuffer, offset: 0, bytesPerRow: 4 * 128 }, [128, 128, 1]);
                device.queue.submit([cmdEncoder.finish()]);
            };
            this._snapshotUtil.imageWrite = async (dx, dy) => {
                await this._snapshotUtil.imageBuffer.mapAsync(GPUMapMode.READ);
                const imageAB = this._snapshotUtil.imageBuffer.getMappedRange();
                const imageData = new ImageData(new Uint8ClampedArray(imageAB), 128, 128);
                this._snapshotUtil.outputCtx.putImageData(imageData, dx, dy);
                this._snapshotUtil.imageBuffer.unmap();
            };
        }
        const MeshRenderer = resources.MeshRenderer;
        const GetInstanceSlot = MeshRenderer["_GetInstanceSlot"];
        const VerifyInstance = MeshRenderer["_VerifyInstance"];
        const GetAABB = resources.Object["_GetAABB"];
        GetInstanceSlot(1);
        GetInstanceSlot(2);
        this.drawList.instanceCount = GetInstanceSlot(4);
        this.drawList.instanceVB = GetInstanceSlot(8);
        const Execute = async (draw_) => {
            const texture = this._global.device["_swapchain"].getCurrentTexture();
            const target = {
                texture: texture,
                view: texture.createView(),
                viewport: [0, 0, texture.width, texture.height]
            };
            this.target = target;
            this.Draw = draw_;
            for (let framePass of framePassList.framePass) {
                this.ExecuteFramePass(framePass);
            }
            this._task++;
            this.execStat.encodeTS = Date.now() - this.execStat.encodeTS;
            this._snapshotUtil.imageTexture = texture;
            await this._snapshotUtil.imageRead();
            await device.queue.onSubmittedWorkDone();
            this._task--;
            this.execStat.executeTS = Date.now() - this.execStat.executeTS;
        };
        const GetBounding = (objects) => {
            const min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
            const max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
            for (let obj of objects) {
                if (obj) {
                    const aabb = GetAABB(obj.internalPtr, 0);
                    min[0] = min[0] < aabb[0] ? min[0] : aabb[0];
                    min[1] = min[1] < aabb[1] ? min[1] : aabb[1];
                    min[2] = min[2] < aabb[2] ? min[2] : aabb[2];
                    max[0] = max[0] > aabb[3] ? max[0] : aabb[3];
                    max[1] = max[1] > aabb[4] ? max[1] : aabb[4];
                    max[2] = max[2] > aabb[5] ? max[2] : aabb[5];
                }
            }
            return {
                center: [(min[0] + max[0]) * 0.5, (min[1] + max[1]) * 0.5, (min[2] + max[2]) * 0.5],
                extents: [Math.max((max[0] - min[0]) * 0.5, 0.01), Math.max((max[1] - min[1]) * 0.5, 0.01), Math.max((max[2] - min[2]) * 0.5, 0.01)]
            };
        };
        async function Run() {
            const prefab_thumbnail_start = 0;
            const prefabs = [];
            for (let entry of menu.list) {
                if (entry.classid == 65) {
                    const thumbnail_index = entry.thumbnail_index = prefab_thumbnail_start + prefabs.length;
                    const prefab = await resources.Scene.InstancePrefab(scene, entry.uuid);
                    prefabs.push({
                        thumbnail_index,
                        prefab
                    });
                }
            }
            const mesh_renderer_thumbnail_start = prefab_thumbnail_start + prefabs.length;
            const mesh_renderers = [];
            for (let prefab of prefabs) {
                for (let object of prefab.prefab.instanceList) {
                    const mesh_renderer = object.meshRenderer;
                    if (mesh_renderer) {
                        const uuid = mesh_renderer["_uuid"];
                        for (let entry of menu.list) {
                            if (entry.classid == 48) {
                                if (entry.uuid == uuid) {
                                    const thumbnail_index = entry.thumbnail_index = mesh_renderer_thumbnail_start + mesh_renderers.length;
                                    mesh_renderers.push({
                                        thumbnail_index,
                                        object,
                                        mesh_renderer
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            const material_thumbnail_start = mesh_renderer_thumbnail_start + mesh_renderers.length;
            const materials = [];
            for (let entry of menu.list) {
                if (entry.classid == 32) {
                    const thumbnail_index = entry.thumbnail_index = material_thumbnail_start + materials.length;
                    const material = await resources.Material.Load(entry.uuid);
                    materials.push({
                        thumbnail_index,
                        material
                    });
                }
            }
            const texture_thumbnail_start = material_thumbnail_start + materials.length;
            const textures = [];
            for (let entry of menu.list) {
                if (entry.classid == 29) {
                    const thumbnail_index = entry.thumbnail_index = texture_thumbnail_start + textures.length;
                    const texture = await resources.Texture.Load(entry.uuid);
                    textures.push({
                        thumbnail_index,
                        texture
                    });
                }
            }
            if (!this_._snapshotUtil.materialSphere) {
                const materialSpherePkg = await this_._global.worker.Import_gltf(1, "./assets/gltf/shader_ball.zip", () => { });
                this_._global.resources.Register(materialSpherePkg.pkg, materialSpherePkg.files);
                this_._snapshotUtil.materialSphere = await resources.Scene.InstancePrefab(scene, "65-0", materialSpherePkg.pkg);
            }
            this_._snapshotUtil.materialSphere.root.active = true;
            const thumbnail_count = texture_thumbnail_start + textures.length;
            const cols = Math.ceil(Math.sqrt(thumbnail_count));
            let rows = Math.floor(Math.sqrt(thumbnail_count));
            if (thumbnail_count > (cols * rows)) {
                rows++;
            }
            this_._snapshotUtil.outputCanvas.width = 128 * cols;
            this_._snapshotUtil.outputCanvas.height = 128 * rows;
            const passes = [];
            if (0 < prefabs.length) {
                const pass = {
                    drawTexture: null,
                    drawObjects: [],
                    forceMat: null,
                    variantCount: prefabs.length,
                    UseVariant: (index) => {
                        pass.drawObjects = [];
                        for (let obj of prefabs[index].prefab.instanceList) {
                            if (obj.meshRenderer) {
                                pass.drawObjects.push(obj);
                            }
                        }
                        const bounding = GetBounding(pass.drawObjects);
                        this_.camera.Fit(bounding);
                    },
                    EndVariant: async (index) => {
                        const icon = prefabs[index].thumbnail_index;
                        const col = icon % cols;
                        const row = Math.floor(index / cols);
                        await this_._snapshotUtil.imageWrite(128 * col, 128 * row);
                    }
                };
                passes.push(pass);
            }
            if (0 < mesh_renderers.length) {
                const pass = {
                    drawTexture: null,
                    drawObjects: [],
                    forceMat: null,
                    variantCount: mesh_renderers.length,
                    UseVariant: (index) => {
                        const obj = mesh_renderers[index].object;
                        if (obj) {
                            pass.drawObjects = [obj];
                        }
                        else {
                            pass.drawObjects = [];
                        }
                        const bounding = GetBounding(pass.drawObjects);
                        this_.camera.Fit(bounding);
                    },
                    EndVariant: async (index) => {
                        const icon = mesh_renderers[index].thumbnail_index;
                        const col = icon % cols;
                        const row = Math.floor(icon / cols);
                        await this_._snapshotUtil.imageWrite(128 * col, 128 * row);
                    }
                };
                passes.push(pass);
            }
            if (0 < materials.length) {
                const pass = {
                    drawTexture: null,
                    drawObjects: [],
                    forceMat: null,
                    variantCount: materials.length,
                    UseVariant: (index) => {
                        const materialSphere = this_._snapshotUtil.materialSphere.instanceList[0];
                        const meshRenderer = materialSphere.meshRenderer;
                        const material = materials[index].material;
                        meshRenderer.SetMaterial(0, 0, material);
                        meshRenderer.SetMaterial(1, 1, material);
                        meshRenderer.SetMaterial(2, 2, material);
                        pass.drawObjects = [materialSphere];
                        const bounding = GetBounding(pass.drawObjects);
                        this_.camera.Fit(bounding);
                    },
                    EndVariant: async (index) => {
                        const icon = materials[index].thumbnail_index;
                        const col = icon % cols;
                        const row = Math.floor(icon / cols);
                        await this_._snapshotUtil.imageWrite(128 * col, 128 * row);
                    }
                };
                passes.push(pass);
            }
            if (0 < textures.length) {
                const pass = {
                    drawTexture: null,
                    drawObjects: [],
                    forceMat: null,
                    variantCount: textures.length,
                    UseVariant: (index) => {
                        pass.drawTexture = textures[index];
                        finalMat.SetTexture("baseTex", pass.drawTexture);
                        finalMat.view.drawTex = [1];
                    },
                    EndVariant: async (index) => {
                        finalMat.view.drawTex = [0];
                        const icon = textures[index].thumbnail_index;
                        const col = icon % cols;
                        const row = Math.floor(icon / cols);
                        await this_._snapshotUtil.imageWrite(128 * col, 128 * row);
                    }
                };
                passes.push(pass);
            }
            {
                let taskCount = thumbnail_count;
                let taskIndex = 0;
                let pass = passes[0];
                let passIndex = 0;
                let variantIndex = 0;
                finalMat.view.rgbaOut = [1];
                while (true) {
                    const progress_rate = Math.min(1.0, taskIndex++ / taskCount);
                    pass = passes[passIndex];
                    pass.UseVariant(variantIndex);
                    await Execute((queue) => {
                        for (let object3d of pass.drawObjects) {
                            if (object3d) {
                                resources.Object["_Draw"](object3d.internalPtr);
                            }
                        }
                    });
                    await pass.EndVariant(variantIndex);
                    if (++variantIndex == pass.variantCount) {
                        variantIndex = 0;
                        if (++passIndex == passes.length) {
                            finalMat.view.rgbaOut = [0];
                            passIndex = 0;
                            const blob = await this_._snapshotUtil.outputGen();
                            const url = window.URL.createObjectURL(blob);
                            menu.thumbnail = url;
                            menu.thumbnail_per_row = cols;
                            menu.thumbnail_row_count = rows;
                            menu.thumbnail_blob = blob;
                            console.log(url);
                            break;
                        }
                    }
                }
            }
            this_._snapshotUtil.materialSphere.root.active = false;
            for (let prefab of prefabs) {
                prefab.prefab.root.Destroy();
            }
            console.error("prefabs:", prefabs);
            console.error("mesh_renderers:", mesh_renderers);
            console.error("materials:", materials);
            console.error("textures:", textures);
            console.error("thumbnail_count:", cols, rows, thumbnail_count);
            console.error("passes:", passes);
        }
        Run().then(end).catch(end);
    }
    Execute(camera, volume, target, framePassList, draw, callback) {
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
        this.camera.width = this._global.width;
        this.camera.height = this._global.height;
        const MeshRenderer = this._global.resources.MeshRenderer;
        const GetInstanceSlot = MeshRenderer["_GetInstanceSlot"];
        const VerifyInstance = MeshRenderer["_VerifyInstance"];
        GetInstanceSlot(1);
        GetInstanceSlot(2);
        const drawCalls = this.drawList.drawCalls;
        const drawParts = this.drawList.drawParts = [];
        for (let call of drawCalls) {
            const bbCenter = call.mesh?.center || [0, 0, 0];
            const bbExtents = call.mesh?.extents || [1, 1, 1];
            let instanceCount = 0;
            let firstInstance = 0;
            for (let i = 0; i < call.instances.length; i++) {
                const ptr = GetInstanceSlot(0);
                env.farraySet(ptr, 0, call.instances[i]);
                env.uscalarSet(ptr, 16, 0);
                env.uscalarSet(ptr, 17, call.flags);
                env.uscalarSet(ptr, 18, call.layers);
                env.uscalarSet(ptr, 19, call.userData);
                env.farraySet(ptr, 20, bbCenter);
                env.farraySet(ptr, 23, bbExtents);
                const slot = VerifyInstance(ptr, camera.internalPtr);
                if (slot > -1) {
                    if (0 == instanceCount++) {
                        firstInstance = slot;
                    }
                }
            }
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
        this.Draw = draw;
        for (let framePass of framePassList.framePass) {
            this.ExecuteFramePass(framePass);
        }
        this._task++;
        this.execStat.encodeTS = Date.now() - this.execStat.encodeTS;
        const _callback = (e) => {
            this._task--;
            this.execStat.executeTS = Date.now() - this.execStat.executeTS;
            callback(e);
            this.Flush();
        };
        device.queue.onSubmittedWorkDone().then(_callback).catch(_callback);
    }
    ExecuteFramePass(framePass) {
        const device = this._global.device.device;
        this.framePass = framePass;
        for (let v = 0; v < (framePass.variantCount || 1); v++) {
            framePass.PreExecute(v, this);
            this.cmdEncoder = device.createCommandEncoder();
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
    BindFrameUniforms(frameUniforms, shadow_cast_index = -1) {
        const infoRT = this._global.assembly.config.renderTargets;
        frameUniforms.view.time = [this._global.env.frameTS * 0.001];
        frameUniforms.UpdateFrameUniforms(this.camera, this.volume);
        frameUniforms.view.targetInfo = [infoRT.width, infoRT.width * infoRT.scale, 1.0 / (infoRT.width * infoRT.scale), infoRT.scale];
        if (shadow_cast_index > -1) {
            frameUniforms.ComputeLightSpaceMatrixes(this.camera, shadow_cast_index);
        }
        frameUniforms.Bind(this.passEncoder);
        this.activeG0 = frameUniforms;
    }
    BindMeshRenderer(meshRenderer) {
        meshRenderer.Bind(this.passEncoder);
        this.activeG1 = meshRenderer;
    }
    BindMaterial(material) {
        material.Bind(this.passEncoder);
        this.activeG2 = material;
    }
    BindRenderPipeline(config) {
        const id = this._global.context.CreateRenderPipeline({
            g1: this.activeG1.layoutID,
            g2: this.activeG2.layoutID,
            g3: 0,
            ...config
        });
        this.SetPipeline(id, 0);
    }
    SetPipeline(pipelineID, materialSlot) {
        const activePipeline = this._global.context.GetRenderPipeline(pipelineID, this.framePass, materialSlot);
        if (this.activePipeline != activePipeline) {
            this.activePipeline = activePipeline;
            this.passEncoder.setPipeline(activePipeline);
        }
    }
    DrawMesh(params) {
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
                flags |= 8;
                topology = params.topology;
            }
            if (params.castShadows) {
                flags |= 16;
            }
            if (params.receiveShadows) {
                flags |= 32;
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
                g1.id,
                mat.material.id,
                pipeline,
                params.mesh?.id,
                mat.submesh,
                1,
                0,
            ];
        }
    }
    DrawList() {
        const parts = this.drawList.drawParts;
        for (let params of parts) {
            this.DrawPart(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
        }
        const parts2 = this.drawList.drawParts2;
        if (parts2) {
            const count = parts2.count;
            const params = parts2.params;
            const indices = parts2.indices;
            if (indices) {
            }
            else {
                for (let i = 0; i < count; i++) {
                    const i8 = i * 8;
                    this.DrawPart(params[i8 + 0], params[i8 + 1], params[i8 + 2], params[i8 + 3], params[i8 + 4], params[i8 + 5], params[i8 + 6], params[i8 + 7]);
                }
            }
        }
    }
    DrawPart(g1, g2, pipeline, mesh, submesh, instanceCount = 1, firstInstance = 0, materialSlot = 0) {
        const resources = this._global.resources;
        const context = this._global.context;
        const activeG1 = resources.MeshRenderer.GetInstanceByID(g1);
        const activeG2 = resources.Material.GetInstanceByID(g2);
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
                    subMesh.size / ibFormat,
                    instanceCount,
                    0,
                    0,
                    firstInstance,
                ]);
            }
            else {
                this.passEncoder.drawIndexed(subMesh.size / ibFormat, instanceCount, 0, 0, firstInstance);
            }
        }
        else {
            const drawCount = activeG2.view.drawCount?.[0];
            if (drawCount) {
                if (activeG1.drawCustom) {
                    activeG1.drawCustom(this, "draw", [
                        drawCount,
                        instanceCount,
                        0,
                        firstInstance,
                    ]);
                }
                else {
                    this.passEncoder.draw(drawCount, instanceCount, 0, firstInstance);
                }
            }
        }
    }
    Draw;
    _global;
    _snapshotUtil;
    _waiting;
    _end;
    _task;
    camera;
    volume;
    target;
    framePassList;
    drawList;
    execStat;
    framePass;
    cmdEncoder;
    passEncoder;
    computeEncoder;
    activeG0;
    activeG1;
    activeG2;
    activeG3;
    activePipeline;
    activeMesh;
}
