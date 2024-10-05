export class Renderer {
    constructor(_global) {
        this._global = _global;
        this._queue = new DrawQueue(_global);
    }
    async Init() {
        return this;
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
    async Snapshot(scene, menu) {
        const resources = this._global.resources;
        const prefab_thumbnail_start = 0;
        const prefabs = [];
        for (let entry of menu.list) {
            if (entry.classid == 65) {
                const thumbnail_index = prefab_thumbnail_start + prefabs.length;
                const prefab = await resources.Scene.InstancePrefab(scene, entry.uuid);
                prefabs.push({
                    thumbnail_index,
                    prefab
                });
            }
        }
        const mesh_thumbnail_start = prefab_thumbnail_start + prefabs.length;
        const meshes = [];
        for (let entry of menu.list) {
            if (entry.classid == 39) {
                const thumbnail_index = mesh_thumbnail_start + meshes.length;
                const mesh = await resources.Mesh.Load(entry.uuid);
                meshes.push({
                    thumbnail_index,
                    object: null,
                    mesh
                });
            }
        }
        const material_thumbnail_start = mesh_thumbnail_start + meshes.length;
        const materials = [];
        for (let entry of menu.list) {
            if (entry.classid == 32) {
                const thumbnail_index = material_thumbnail_start + materials.length;
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
                const thumbnail_index = texture_thumbnail_start + textures.length;
                const texture = await resources.Texture.Load(entry.uuid);
                textures.push({
                    thumbnail_index,
                    texture
                });
            }
        }
        let unproc = meshes.length;
        let proc = (obj) => {
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
        let mat_obj = null;
        const thumbnail_count = texture_thumbnail_start + textures.length;
        const cols = Math.ceil(Math.sqrt(thumbnail_count));
        let rows = Math.floor(Math.sqrt(thumbnail_count));
        if (thumbnail_count > (cols * rows)) {
            rows++;
        }
        const canvas_rt = this._global.config.surface;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128 * cols;
        canvas.height = 128 * rows;
        const complete = (callback) => {
            canvas.toBlob((blob) => {
                menu.thumbnail = window.URL.createObjectURL(blob);
                menu.thumbnail_per_row = cols;
                menu.thumbnail_blob = blob;
                callback();
            }, "image/jpeg", 0.5);
        };
        const passes = [];
        if (0 < prefabs.length) {
            const pass = {
                drawTexture: null,
                drawObjects: [],
                forceMat: null,
                variantCount: prefabs.length,
                UseVariant: (index, queue) => {
                    pass.drawObjects = [];
                    for (let obj of prefabs[index].prefab.instanceList) {
                        if (obj.meshRenderer) {
                            pass.drawObjects.push(obj);
                        }
                    }
                },
                EndVariant: (index, queue, callback) => {
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
            const pass = {
                drawTexture: null,
                drawObjects: [],
                forceMat: null,
                variantCount: meshes.length,
                UseVariant: (index, queue) => {
                    const obj = meshes[index].object;
                    if (obj) {
                        pass.drawObjects = [obj];
                    }
                    else {
                        pass.drawObjects = [];
                    }
                },
                EndVariant: (index, queue, callback) => {
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
            const pass = {
                drawTexture: null,
                drawObjects: [mat_obj],
                forceMat: null,
                variantCount: materials.length,
                UseVariant: (index, queue) => {
                    pass.forceMat = materials[index].material;
                },
                EndVariant: (index, queue, callback) => {
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
            const pass = {
                drawTexture: null,
                drawObjects: [],
                forceMat: null,
                variantCount: textures.length,
                UseVariant: (index, queue) => {
                    pass.drawTexture = textures[index];
                },
                EndVariant: (index, queue, callback) => {
                    const icon = textures[index].thumbnail_index;
                    const col = icon % cols;
                    const row = Math.floor(icon / cols);
                    ctx.drawImage(canvas_rt, 128 * col, 128 * row, 128, 128);
                    callback();
                }
            };
            passes.push(pass);
        }
        console.error("prefabs:", prefabs);
        console.error("meshes:", meshes);
        console.error("materials:", materials);
        console.error("textures:", textures);
        console.error("mat_obj:", mat_obj);
        console.error("thumbnail_count:", cols, rows, thumbnail_count);
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
//# sourceMappingURL=renderer.js.map