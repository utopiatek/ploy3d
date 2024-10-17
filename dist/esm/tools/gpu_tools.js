export class ComputeKernel {
    constructor(_global, material, entryPoint, workgroup_size) {
        this._global = _global;
        this._enabled = true;
        this._material = material;
        this._material.AddRef();
        this._entryPoint = entryPoint;
        this._sizeX = workgroup_size[0] || 1;
        this._sizeY = workgroup_size[1] || 1;
        this._sizeZ = workgroup_size[2] || 1;
        this._buffers = [];
    }
    async Dispatch(awaitDone) {
        const device = this._global.device;
        const context = this._global.context;
        if (!this._bundle) {
            const g3_entries = [];
            for (let i = 0; i < this._buffers.length; i++) {
                const buffer = device.GetBuffer(this._buffers[i]).buffer;
                g3_entries.push({ binding: i, resource: { buffer } });
            }
            const g0 = context["_blankGroup"].binding;
            const g1 = context["_blankGroup"].binding;
            const g3 = context.CreateBindGroupCustom(this._material, g3_entries).binding;
            const pipelineID = context.CreateComputePipeline(this._material.layoutID);
            const pipeline = context.GetComputePipeline(pipelineID, this._entryPoint);
            this._bundle = {
                g0,
                g1,
                g3,
                pipeline
            };
        }
        const cmdEncoder = device.device.createCommandEncoder();
        const passEncoder = cmdEncoder.beginComputePass();
        this._material.Bind(passEncoder);
        passEncoder.setBindGroup(0, this._bundle.g0);
        passEncoder.setBindGroup(1, this._bundle.g1);
        passEncoder.setBindGroup(3, this._bundle.g3);
        passEncoder.setPipeline(this._bundle.pipeline);
        passEncoder.dispatchWorkgroups(this.sizeX, this.sizeY, this.sizeZ);
        passEncoder.end();
        device.device.queue.submit([cmdEncoder.finish()]);
        if (awaitDone) {
            await (new Promise((resolve, reject) => {
                device.device.queue.onSubmittedWorkDone().then(resolve).catch(reject);
            }));
        }
    }
    Dispose() {
        for (let id of this._buffers) {
            this._global.device.FreeBuffer(id);
        }
        this._material.Release();
        this._global = null;
        this._enabled = false;
        this._material = null;
        this._entryPoint = null;
        this._sizeX = 1;
        this._sizeY = 1;
        this._sizeZ = 1;
        this._buffers = null;
        this._bundle = null;
    }
    SetBuffer(binding, id) {
        this._buffers[binding] = id;
    }
    WriteBuffer(binding, bufferOffset, data, dataOffset, size) {
        this._global.device.WriteBuffer(this._buffers[binding], bufferOffset, data, dataOffset, size);
    }
    async ReadBuffer(binding, offset, size) {
        return this._global.device.ReadBuffer(this._buffers[binding], offset, size);
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(b) {
        this._enabled = b;
    }
    get entryPoint() {
        return this._entryPoint;
    }
    get sizeX() {
        return this._sizeX;
    }
    get sizeY() {
        return this._sizeY;
    }
    get sizeZ() {
        return this._sizeZ;
    }
    get material() {
        return this._material;
    }
    _global;
    _enabled;
    _material;
    _entryPoint;
    _sizeX;
    _sizeY;
    _sizeZ;
    _buffers;
    _bundle;
}
class HairStandsSettings {
    get Segments() {
        return this.Provider.GetSegmentsNum();
    }
    get HeadCenterWorld() {
        if (this.HeadCenterType == 0) {
            if (this.Provider) {
            }
            return [0, 0, 0];
        }
        if (this.HeadCenterTransform) {
        }
        return [1, 1, 1];
    }
    Provider;
    HeadCenterType = 0;
    HeadCenterTransform;
    HeadCenter;
    Validate() {
        return this.Provider && this.Provider.Validate(true);
    }
    DrawGizmos() {
    }
    IsVisible = false;
}
class HairPhysicsSettings {
    GetColliders() {
        return [];
    }
    DebugDraw = false;
    IsEnabled = true;
    Iterations = 1;
    FastMovement = true;
    Gravity = [0, -1, 0];
    Drag = 0.0;
    StandRadius = 0.1;
    ElasticityCurve = [0, 0, 1, 1];
    WindMultiplier = 0.0001;
    ColliderProviders = [];
    AccessoriesProviders = [];
    JointAreas = [];
    UseDeltaTime = false;
    colliders = [];
    Validate() {
        return true;
    }
    DrawGizmos() {
    }
    IsVisible = false;
}
class HairJointArea {
    get Radius() {
        return this.radius;
    }
    radius = 0.001;
}
class GpuBuffer {
}
