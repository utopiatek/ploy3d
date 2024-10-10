import * as Miaoverse from "../mod.js"

/** 着色器资源实例。 */
export class ShaderRes extends Miaoverse.Resource<ShaderRes> {
    /**
     * 构造函数。
     * @param impl 实例管理器。
     * @param shader 内部实例。
     * @param id 实例ID。
     */
    public constructor(impl: Shader_kernel, shader: Miaoverse.Shader, id: number) {
        super(impl["_global"], 0 as never, id);
        this._impl = impl;
        this._refCount = 1;
        this._shader = shader;
        this._shader.refCount++;
    }

    /**
     * 释放实例引用。
     */
    public Release() {
        if (--this._refCount == 0) {
            this.Dispose();
        }
    }

    /**
     * 增加实例引用。
     */
    public AddRef() {
        this._refCount++;
    }

    /**
     * 清除对象。
     */
    protected Dispose() {
        this._impl["_instanceLut"][this.uuid] = undefined;

        this._global.context.FreeShader(this.internalID);

        this._refCount = 0;
        this._shader = null;

        this._impl["Remove"](this.id);
    }

    /** 着色器资源UUID。 */
    public get uuid() {
        return this._shader.asset.name;
    }

    /** 着色器内部实例ID。 */
    public get internalID() {
        return this._shader.id;
    }

    /** 资源实例内部实现。 */
    public get shader() {
        return this._shader;
    }

    /** 着色器属性统一变量块大小。 */
    public get uniformSize() {
        return this._shader.tuple.size;
    }

    /** 实例管理器。 */
    private _impl: Shader_kernel;
    /** 资源引用计数。 */
    private _refCount: number;
    /** 内部实例。 */
    private _shader: Miaoverse.Shader = null;
}

/** 着色器资源实例管理器（没有内核实现）。 */
export class Shader_kernel extends Miaoverse.Base_kernel<ShaderRes, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, {});
    }

    /**
     * 装载着色器资源。
     * @param uri 着色器资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回着色器资源实例。
     */
    public async Load(uri: string, pkg?: Miaoverse.PackageReg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }

        if (this._instanceLut[uuid]) {
            return this._instanceLut[uuid];
        }

        // 加载装配着色器资产 ===============-----------------------

        const desc = await this._global.resources.Load_file<Asset_shader>("json", uri, true, pkg);
        if (!desc) {
            return null;
        }

        desc.data.uuid = uuid;
        desc.data.asset.name = uuid;

        const keys = ["vertex", "material", "shading"];
        const codes = desc.data.asset.codes;

        for (let key of keys as ["vertex", "material", "shading"]) {
            const codes_: string[] = [];

            for (let inc of codes[key].includes) {
                const code = (await this._global.resources.Load_file<string>("text", inc, false, desc.pkg))?.data;
                codes_.push(code);
            }

            const code = (await this._global.resources.Load_file<string>("text", codes[key].main, false, desc.pkg))?.data;
            codes_.push(code);

            codes[key].code = codes_.join("");
        }

        // 创建实例 ===============-----------------------

        const shader = this._global.context.CreateShader(desc.data.asset);

        const id = this._instanceIdle;

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new ShaderRes(this, shader, id);

        this._instanceLut[uuid] = instance;
        this._instanceCount++;

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(() => {
            instance.Release();
        });

        return instance;
    }

    /**
     * 移除着色器资源实例。
     * @param id 着色器资源实例ID。
     */
    protected Remove(id: number) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Shader_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }

        instance["_impl"] = null;

        instance["_global"] = null;
        instance["_ptr"] = 0 as never;
        instance["_id"] = this._instanceIdle;

        this._instanceIdle = id;
        this._instanceCount -= 1;
    }

    /**
     * 清除所有。
     */
    protected DisposeAll() {
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

    /** 所有着色器资源在程序退出时才释放。 */
    private _gcList: (() => void)[] = [];
}

/** 着色器资源描述符。 */
export interface Asset_shader extends Miaoverse.Asset {
    /** 着色器资产数据。 */
    asset: Miaoverse.ShaderAsset;
}
