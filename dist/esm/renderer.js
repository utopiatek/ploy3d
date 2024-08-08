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
        this.camera.width = this.target.texture.width;
        this.camera.height = this.target.texture.height;
        const MeshRenderer = this._global.resources.MeshRenderer;
        const GetInstanceSlot = MeshRenderer["_GetInstanceSlot"];
        const VerifyInstance = MeshRenderer["_VerifyInstance"];
        GetInstanceSlot(1);
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
        this.cmdEncoder = device.createCommandEncoder();
        for (let v = 0; v < (framePass.variantCount || 1); v++) {
            framePass.PreExecute(v, this);
            this.passEncoder = this.cmdEncoder.beginRenderPass({
                colorAttachments: framePass.colorAttachments,
                depthStencilAttachment: framePass.depthStencilAttachment,
            });
            this.computeEncoder = null;
            framePass.Execute(v, this);
            this.passEncoder.end();
        }
        device.queue.submit([this.cmdEncoder.finish()]);
    }
    BindFrameUniforms(frameUniforms) {
        frameUniforms.UpdateFrameUniforms(this.camera, this.volume);
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
        this.SetPipeline(id);
    }
    SetPipeline(pipelineID) {
        const activePipeline = this._global.context.GetRenderPipeline(pipelineID, this.framePass);
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
            this.DrawPart(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
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
                    const i7 = i * 7;
                    this.DrawPart(params[i7 + 0], params[i7 + 1], params[i7 + 2], params[i7 + 3], params[i7 + 4], params[i7 + 5], params[i7 + 6]);
                }
            }
        }
    }
    DrawPart(g1, g2, pipeline, mesh, submesh, instanceCount = 1, firstInstance = 0) {
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
        this.SetPipeline(pipeline);
        if (activeMesh) {
            if (this.activeMesh != activeMesh) {
                const vertices = activeMesh.vertices;
                context.SetVertexBuffers(0, vertices, this.passEncoder);
                context.SetVertexBuffer(vertices.length, this.drawList.instanceVB, 0, 104 * this.drawList.instanceCount, this.passEncoder);
            }
            const ibFormat = activeMesh.ibFormat;
            const subMesh = activeMesh.triangles[submesh];
            context.SetIndexBuffer(ibFormat, subMesh, this.passEncoder);
            this.passEncoder.drawIndexed(subMesh.size / ibFormat, instanceCount, 0, 0, firstInstance);
        }
        else {
            const drawCount = activeG2.view.drawCount?.[0];
            if (drawCount) {
                this.passEncoder.draw(drawCount, instanceCount, 0, firstInstance);
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