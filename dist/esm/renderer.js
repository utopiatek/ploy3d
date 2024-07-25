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
        this.DrawScene = draw;
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
        const pipeline = this._global.context.CreateRenderPipeline({
            framePass: this.framePass,
            g0: this.activeG0.layoutID,
            g1: this.activeG1.layoutID,
            g2: this.activeG2.layoutID,
            g3: 0,
            ...config
        });
        if (pipeline) {
            this.passEncoder.setPipeline(pipeline);
        }
    }
    DrawScene;
    _global;
    _waiting;
    _end;
    _task;
    camera;
    volume;
    target;
    framePassList;
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
}
//# sourceMappingURL=renderer.js.map