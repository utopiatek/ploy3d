import * as Miaoverse from "../mod.js";
export class ShaderRes extends Miaoverse.Resource {
    constructor(impl, shader, id) {
        super(impl["_global"], impl["_global"].env.ptrZero(), id);
        this._impl = impl;
        this._shader = shader;
    }
    get uuid() {
        return this._shader.asset.name;
    }
    get shader() {
        return this._shader;
    }
    get uniformSize() {
        return this._shader.tuple.size;
    }
    _impl;
    _shader = null;
}
export class Shader_kernel {
    constructor(_global) {
        this._global = _global;
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
        const keys = ["vertex", "material", "shading"];
        const codes = desc.data.asset.codes;
        for (let key of keys) {
            const codes_ = [];
            for (let inc of codes[key].includes) {
                const code = (await this._global.resources.Load_file("text", inc, false, desc.pkg))?.data;
                codes_.push(code);
            }
            const code = (await this._global.resources.Load_file("text", codes[key].main, false, desc.pkg))?.data;
            codes_.push(code);
            codes[key].code = codes_.join("");
        }
        const shader = this._global.context.CreateShader(desc.data.asset);
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = new ShaderRes(this, shader, id);
        this._instanceList[id] = instance;
        this._instanceLut[uuid] = instance;
        this._instanceCount++;
        this._gcList.push(instance);
        return instance;
    }
    GetInstanceByID(id) {
        return this._instanceList[id];
    }
    _global;
    _instanceList = [null];
    _instanceLut = {};
    _instanceCount = 0;
    _instanceIdle = 1;
    _gcList = [];
}
//# sourceMappingURL=shader.js.map