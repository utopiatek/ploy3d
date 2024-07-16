import * as Miaoverse from "../mod.js";
export class Material extends Miaoverse.Uniform {
    constructor(impl, ptr, id) {
        super(impl, ptr, id);
        this._view = new (this.tuple.view)(this);
    }
    Enable(enable, flag) {
        if (enable) {
            this.enableFlags = this.enableFlags | flag;
        }
        else {
            this.enableFlags = this.enableFlags & ~flag;
        }
    }
    SetBlendMode(blendMode) {
        this.enableFlags = (this.enableFlags & 0x0FFFFFFF) | (blendMode << 28);
    }
    GetVector(name) {
        if (this.HasProperty(name)) {
            return this.view[name];
        }
        return null;
    }
    SetVector(name, value) {
        if (this.HasProperty(name)) {
            this.view[name] = value;
        }
    }
    GetTexture(name) {
        if (!this.HasProperty(name + "_uuid")) {
            return null;
        }
        const texture = this._global.resources.Texture.GetInstanceByID(this.view[name + "_uuid"][0]);
        const sampler = this.view[name + "_sampler"];
        const uvts = this.view[name + "_uvts"];
        const color = sampler[1];
        return {
            texture,
            uvts,
            color: [(color >> 0) & 255, (color >> 8) & 255, (color >> 16) & 255, (color >> 24) & 255],
            sampler: this._global.device.ParseSamplerFlags(sampler[2])
        };
    }
    SetTexture(name, value) {
        if (!this.HasProperty(name + "_uuid")) {
            return;
        }
        const sampler = this.view[name + "_sampler"];
        if (value.texture !== undefined || value.uri !== undefined) {
            if (!value.texture && !value.uri) {
                this.view[name + "_uuid"] = [0, 0, 0, 0];
                sampler[0] = 0;
            }
            else if (value.texture) {
                this.view[name + "_uuid"] = [value.texture.id, ...this._global.env.uuidDec(value.texture.uuid)];
                sampler[0] = 1;
            }
            else if (value.uri) {
                this.view[name + "_uuid"] = [0, ...this._global.env.uuidDec(value.uri)];
                sampler[0] = 0;
            }
        }
        if (value.uvts) {
            this.view[name + "_uvts"] = value.uvts;
        }
        if (value.color !== undefined) {
            let color = 0;
            color += Math.floor(value.color[3]) << 24;
            color += Math.floor(value.color[2]) << 16;
            color += Math.floor(value.color[1]) << 8;
            color += Math.floor(value.color[0]) << 0;
            sampler[1] = color;
        }
        if (value.sampler !== undefined) {
            sampler[2] = this._global.device.GenerateSamplerFlags(value.sampler);
            sampler[3] = 0;
        }
        this.view[name + "_sampler"] = sampler;
    }
    HasProperty(name) {
        return this.view.hasOwnProperty(name);
    }
    get layoutID() {
        return this.shader.shader.id || 0;
    }
    get enableFlags() {
        return this._impl.Get(this._ptr, "enableFlags");
    }
    set enableFlags(value) {
        this._impl.Set(this._ptr, "enableFlags", value);
        this.updated = true;
    }
    get shader() {
        const shaderID = this._impl.Get(this._ptr, "shaderID");
        const shader = this._global.resources.Shader.GetInstanceByID(shaderID);
        return shader;
    }
    get view() {
        return this._view;
    }
    _view;
}
export class FrameUniforms extends Miaoverse.Uniform {
    constructor(impl, ptr, id) {
        super(impl, ptr, id);
        this._view = new (this.tuple.view)(this);
    }
    UpdateFrameUniforms(camera, volume) {
        this._impl["_UpdateFrameUniforms"](this.internalPtr, camera.internalPtr, volume.internalPtr);
    }
    get enableFlags() {
        return this._impl.Get(this._ptr, "enableFlags");
    }
    set enableFlags(value) {
        this._impl.Set(this._ptr, "enableFlags", value);
    }
    get view() {
        return this._view;
    }
    get g0_colorRT() {
        return this._impl.Get(this._ptr, "g0_colorRT");
    }
    set g0_colorRT(value) {
        this._impl.Set(this._ptr, "g0_colorRT", value);
    }
    get g0_depthRT() {
        return this._impl.Get(this._ptr, "g0_depthRT");
    }
    set g0_depthRT(value) {
        this._impl.Set(this._ptr, "g0_depthRT", value);
    }
    get g0_gbufferRT() {
        return this._impl.Get(this._ptr, "g0_gbufferRT");
    }
    set g0_gbufferRT(value) {
        this._impl.Set(this._ptr, "g0_gbufferRT", value);
    }
    get g0_spriteAtlas() {
        return this._impl.Get(this._ptr, "g0_spriteAtlas");
    }
    set g0_spriteAtlas(value) {
        this._impl.Set(this._ptr, "g0_spriteAtlas", value);
    }
    get g0_froxelList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g0_froxelList"));
    }
    get g0_lightVoxel() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g0_lightVoxel"));
    }
    get g0_lightList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g0_lightList"));
    }
    _view;
}
export class Material_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Material_member_index);
    }
    async Load(uri, pkg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }
        if (this._instanceLut[uuid]) {
            return this._instanceLut[uuid];
        }
        const desc = await this._global.resources.Load_file("json", uri, true, pkg);
        if (!desc) {
            return null;
        }
        desc.data.uuid = uuid;
        desc.data.shader = this._global.resources.ToUUID(desc.data.shader, desc.pkg);
        const textures = desc.data.properties.textures;
        for (let key in textures) {
            textures[key].uri = this._global.resources.ToUUID(textures[key].uri, desc.pkg);
        }
        return this.Create(desc.data);
    }
    async Create(asset) {
        const shader = await this._global.resources.Shader.Load(asset.shader);
        if (!shader) {
            throw "获取着色器资源失败！";
        }
        const ptr = this._Create(shader.uniformSize, this._global.env.ptrZero());
        const id = this._instanceIdle;
        this.Set(ptr, "id", id);
        this.Set(ptr, "uuid", asset.uuid);
        this.Set(ptr, "shaderID", shader.id);
        this.Set(ptr, "shaderUUID", shader.uuid);
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Material(this, ptr, id);
        this._instanceCount++;
        const vars = shader.shader.tuple.vars;
        if (vars) {
            for (let var_ of vars) {
                if (8 > var_.decl.type) {
                    instance.view[var_.decl.name] = var_.decl.value;
                }
            }
            instance.updated = true;
            instance.writeTS = this._global.env.frameTS;
        }
        instance.enableFlags = instance.enableFlags | asset.flags;
        for (let key in asset.properties.vectors) {
            instance.view[key] = asset.properties.vectors[key];
        }
        for (let key in asset.properties.textures) {
            instance.SetTexture(key, asset.properties.textures[key]);
        }
        this._gcList.push(instance);
        if (asset.uuid) {
            this._instanceLut[asset.uuid] = instance;
        }
        return instance;
    }
    async CreateFrameUniforms(colorRT, depthRT, gbufferRT, spriteAtlas) {
        const ptr = this._CreateFrameUniforms();
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new FrameUniforms(this, ptr, id);
        this._instanceCount++;
        const vars = instance.tuple.vars;
        if (vars) {
            for (let var_ of vars) {
                if (8 > var_.decl.type) {
                    instance.view[var_.decl.name] = var_.decl.value;
                }
            }
            instance.updated = true;
            instance.writeTS = this._global.env.frameTS;
        }
        this.Set(ptr, "id", id);
        this.Set(ptr, "g0_colorRT", colorRT);
        this.Set(ptr, "g0_depthRT", depthRT);
        this.Set(ptr, "g0_gbufferRT", gbufferRT);
        this.Set(ptr, "g0_spriteAtlas", spriteAtlas);
        this._gcList.push(instance);
        return instance;
    }
    Dispose(id) {
        const instance = this.GetInstanceByID(id);
        const vars = instance.tuple.vars;
        if (vars) {
            for (let var_ of vars) {
                if (undefined !== var_.decl.texture) {
                    const id_uuid = this._global.env.arrayGet(var_.decl.format, instance.blockPtr, var_.offset >> 2, 4);
                    this._global.resources.Texture.Release(id_uuid[0]);
                }
            }
        }
    }
    _Create;
    _CreateFrameUniforms;
    _UpdateFrameUniforms;
}
export const Material_member_index = {
    ...Miaoverse.Uniform_member_index,
    g0_colorRT: ["uscalarGet", "uscalarSet", 1, 20],
    g0_depthRT: ["uscalarGet", "uscalarSet", 1, 21],
    g0_gbufferRT: ["uscalarGet", "uscalarSet", 1, 22],
    g0_spriteAtlas: ["uscalarGet", "uscalarSet", 1, 23],
    g0_froxelList: ["ptrGet", "ptrSet", 1, 25],
    g0_lightVoxel: ["ptrGet", "ptrSet", 1, 26],
    g0_lightList: ["ptrGet", "ptrSet", 1, 27],
    shaderID: ["uscalarGet", "uscalarSet", 1, 20],
    shaderUUID: ["uuidGet", "uuidSet", 3, 21],
    enableFlags: ["uscalarGet", "uscalarSet", 1, 24],
};
//# sourceMappingURL=material.js.map