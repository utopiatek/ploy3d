import * as Miaoverse from "../mod.js"

/** 脚本模块实例。 */
export class IScriptModule extends Miaoverse.Resource<IScriptModule> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Script_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }

    /**
     * 加载脚本模块。
     * @param module JS模块对象。
     */
    public async Load(module: any) {
        this._module = module;
    }

    /**
     * 重载脚本模块。
     * @param module JS模块对象。
     */
    public async Reload(module: any) {
        this._module = module;
    }

    /** 模块导出字典。 */
    public get exports() {
        return this._module;
    }

    /** 内核实现。 */
    private _impl: Script_kernel;
    /** JS模块对象。 */
    private _module: any;
}

/** 脚本系统内核实现。 */
export class Script_kernel extends Miaoverse.Base_kernel<IScriptModule, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, {});
        this._providerLut = {};
        this._timeTick = 0;

        const tickHandle = setInterval(() => {
            // TODO 轮询数据接口

            this._timeTick++;
        }, 1000);
    }

    /**
     * 加载脚本模块。
     * @param uri 脚本文件URI。
     * @param pkg 当前资源包注册信息。
     * @returns 返回模块实例。
     */
    public async Load(uri: string, pkg?: Miaoverse.PackageReg) {
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

    /**
     * 重载脚本模块。
     * @param uri 脚本文件URI。
     * @param pkg 当前资源包注册信息。
     * @returns 返回模块实例。
     */
    public async Reload(uri: string, pkg?: Miaoverse.PackageReg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }

        const resources = this._global.resources;
        const res = await resources.Load_file<string>("text", uri);
        if (!res || !res.data) {
            return null;
        }

        if (res.data.startsWith("/// JSX")) {
            let Babel = (globalThis as any).Babel;
            if (!Babel) {
                await new Promise<void>((resolve) => {
                    const script = document.createElement("script");
                    script.src = "https://unpkg.com/@babel/standalone@latest/babel.min.js";
                    script.onload = resolve as any;
                    document.head.appendChild(script);
                });

                Babel = (globalThis as any).Babel;
            }

            if (Babel) {
                // 使用 Babel 转换 JSX 代码为 JavaScript
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

            instance = new IScriptModule(this, 0 as never, id);

            this._instanceList[id] = instance;
            this._instanceLut[uuid] = instance;

            this._instanceCount++;

            await instance.Load(codeModule);
        }

        return instance;
    }

    /**
     * 查询数据。
     * @param desc 查询方法描述。 
     */
    public async QueryData(desc: {
        /** 数据提供器URI。 */
        provider: string;
        /** 数据转换器URI。 */
        converter?: string;
        /** 数据查询输入参数。 */
        inputs?: string;
    }) {
        const resources = this._global.resources;

        let provider = this._providerLut[desc.provider];
        if (!provider) {
            const provider_parts = desc.provider.split("?");
            const provider_uuid = resources.ToUUID(provider_parts[0]);
            if (!provider_uuid) {
                console.error(`数据提供器URI不正确：${desc.provider}！`);
                return null;
            }

            const res = await resources.Load_file<Record<string, IDataProvider<any>>>("json", provider_uuid);
            if (!res || !res.data) {
                console.error(`数据提供器配置文件读取失败：${desc.provider}！`);
                return null;
            }

            provider = this._providerLut[desc.provider] = res.data[provider_parts[1] || "default"];
            provider.uuid = desc.provider;
            provider.timestamp = 0;
        }

        // 数据已过期
        if ((this._timeTick - provider.timestamp) > provider.expire) {
            if (provider.uri_type == "method") {
                // TODO ...
            }
            else if (provider.uri_type == "file") {
                // TODO ...
            }
            else if (provider.uri_type == "get") {
                // TODO ...
            }
            else if (provider.uri_type == "post") {
                // TODO ...
            }

            provider.timestamp = this._timeTick;
        }

        return {
            success: provider.success,
            message: provider.message,
            data: provider.data
        };
    }

    /**
     * 监听数据提供器轮询结果。
     * @param desc 监听器设置。
     */
    public ListenData(desc: {
        /** 数据提供器URI。 */
        provider: string;
        /** 数据转换器URI。 */
        converter?: string;
        /** 数据回调方法。 */
        listener: (data: any, old?: any) => void;
    }) {
        // ...
    }

    /** 数据提供器实例查找表（通过UUID查找）。 */
    private _providerLut: Record<string, IDataProvider<any>>;
    /** 脚本系统计时器（单位秒）。 */
    private _timeTick: number;
}

/** 数据提供器配置。 */
export interface IDataProvider<T> {
    /** 数据提供器UUID。 */
    uuid: string;
    /** 数据提供器标签。 */
    label: string;
    /** 数据提供器描述。 */
    desc: string;
    /**
     * 数据URI类型：
     * method：通过调用注册到UI系统的数据请求方法请求数据；
     * file: 数据文件加载路径；
     * get: 数据GET请求URI；
     * post: 数据POST请求URI；
     */
    uri_type: "none" | "method" | "file" | "get" | "post";
    /** 数据URI。 */
    uri: string;
    /** 数据请求参数格式（注意"object"类型参数无法在GET请求中使用）。 */
    inputs: Record<string, "boolean" | "number" | "string" | "object">;
    /** 数据轮询间隔（单位秒，0表示不进行轮询，仅支持无外部参数接口轮询）。 */
    polling: number;
    /** 数据过期时间戳（0表示始终请求最新数据）。 */
    expire: number;

    /** 最新数据请求是否成功。 */
    success: boolean;
    /** 最新数据请求反馈信息。 */
    message: string
    /** 最新请求获得的数据对象（初始为模拟数据对象）。 */
    data: T;

    /** 当前数据时间戳。 */
    timestamp?: number;
    /** 数据事件管理器（如果需要监听轮询数据，则向其中注册监听器，注意结束后请移除监听器）。 */
    signal?: Miaoverse.SimpleSignal<any, unknown>;
}
