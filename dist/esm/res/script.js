import * as Miaoverse from "../mod.js";
export class IScriptModule extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }
    async Load(module) {
        this._module = module;
    }
    async Reload(module) {
        this._module = module;
    }
    get exports() {
        return this._module;
    }
    _impl;
    _module;
}
export class Script_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, {});
        this._providerLut = {};
        this._timeTick = 0;
        const tickHandle = setInterval(() => {
            this._timeTick++;
        }, 1000);
    }
    async Load(uri, pkg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }
        let instance = this._instanceLut[uuid];
        if (!instance) {
            instance = await this.Reload(uri, pkg);
        }
        return instance;
    }
    async Reload(uri, pkg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }
        const resources = this._global.resources;
        const res = await resources.Load_file("text", uri);
        if (!res || !res.data) {
            return null;
        }
        if (res.data.startsWith("/// JSX")) {
            let Babel = globalThis.Babel;
            if (!Babel) {
                await new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = "https://unpkg.com/@babel/standalone@latest/babel.min.js";
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                Babel = globalThis.Babel;
            }
            if (Babel) {
                res.data = Babel.transform(res.data, {
                    presets: ['react']
                }).code;
            }
            else {
                console.error(`无法编译JSX脚本${uri}！`);
                return null;
            }
        }
        const code = btoa(res.data);
        const codeUrl = `data:text/javascript;base64,${code}`;
        const codeModule = await import(codeUrl);
        let instance = this._instanceLut[uuid];
        if (instance) {
            instance.Reload(codeModule);
        }
        else {
            const id = this._instanceIdle;
            this._instanceIdle = this._instanceList[id]?.id || id + 1;
            instance = new IScriptModule(this, 0, id);
            this._instanceList[id] = instance;
            this._instanceLut[uuid] = instance;
            this._instanceCount++;
            await instance.Load(codeModule);
        }
        return instance;
    }
    async QueryData(desc) {
        const resources = this._global.resources;
        let provider = this._providerLut[desc.provider];
        if (!provider) {
            const provider_parts = desc.provider.split("?");
            const provider_uuid = resources.ToUUID(provider_parts[0]);
            if (!provider_uuid) {
                console.error(`数据提供器URI不正确：${desc.provider}！`);
                return null;
            }
            const res = await resources.Load_file("json", provider_uuid);
            if (!res || !res.data) {
                console.error(`数据提供器配置文件读取失败：${desc.provider}！`);
                return null;
            }
            provider = this._providerLut[desc.provider] = res.data[provider_parts[1] || "default"];
            provider.uuid = desc.provider;
            provider.timestamp = 0;
        }
        if ((this._timeTick - provider.timestamp) > provider.expire) {
            if (provider.uri_type == "method") {
            }
            else if (provider.uri_type == "file") {
            }
            else if (provider.uri_type == "get") {
            }
            else if (provider.uri_type == "post") {
            }
            provider.timestamp = this._timeTick;
        }
        return {
            success: provider.success,
            message: provider.message,
            data: provider.data
        };
    }
    ListenData(desc) {
    }
    _providerLut;
    _timeTick;
}
