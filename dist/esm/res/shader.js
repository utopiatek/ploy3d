import * as Miaoverse from "../mod.js";
export class ShaderRes extends Miaoverse.Resource {
    constructor(impl, shader, id) {
        super(impl["_global"], 0, id);
        this._impl = impl;
        this._refCount = 1;
        this._shader = shader;
        this._shader.refCount++;
    }
    Release() {
        if (--this._refCount == 0) {
            this.Dispose();
        }
    }
    AddRef() {
        this._refCount++;
    }
    Dispose() {
        this._impl["_instanceLut"][this.uuid] = undefined;
        this._global.context.FreeShader(this.internalID);
        this._refCount = 0;
        this._shader = null;
        this._impl["Remove"](this.id);
    }
    get uuid() {
        return this._shader.asset.name;
    }
    get internalID() {
        return this._shader.id;
    }
    get shader() {
        return this._shader;
    }
    get uniformSize() {
        return this._shader.tuple.size;
    }
    _impl;
    _refCount;
    _shader = null;
}
export class Shader_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, {});
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
        desc.data.asset.name = uuid;
        const keys = ["vertex", "material", "shading", "compute"];
        const codes = desc.data.asset.codes;
        for (let key of keys) {
            const stage_ = codes[key];
            const codes_ = [];
            if (!stage_) {
                continue;
            }
            for (let inc of stage_.includes) {
                const code = (await this._global.resources.Load_file("text", inc, false, desc.pkg))?.data;
                codes_.push(code);
            }
            const code = (await this._global.resources.Load_file("text", stage_.main, false, desc.pkg))?.data;
            codes_.push(code);
            stage_.code = codes_.join("");
        }
        const shader = this._global.context.CreateShader(desc.data.asset);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new ShaderRes(this, shader, id);
        this._instanceLut[uuid] = instance;
        this._instanceCount++;
        this._gcList.push(() => {
            instance.Release();
        });
        return instance;
    }
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Shader_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }
        instance["_impl"] = null;
        instance["_global"] = null;
        instance["_ptr"] = 0;
        instance["_id"] = this._instanceIdle;
        this._instanceIdle = id;
        this._instanceCount -= 1;
    }
    DisposeAll() {
        for (let func of this._gcList) {
            func();
        }
        if (this._instanceCount != 0) {
            console.error("异常！存在未释放的着色器资源实例", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
        this._gcList = null;
    }
    _gcList = [];
}
