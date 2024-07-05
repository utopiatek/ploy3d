import * as Miaoverse from "../mod.js"

/** 着色器资源实例。 */
export class ShaderRes extends Miaoverse.Resource<ShaderRes> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(impl: Shader_kernel, shader: Miaoverse.Shader, id: number) {
        super(impl["_global"], impl["_global"].env.ptrZero(), id);
        this._impl = impl;
        this._shader = shader;
    }

    /** 着色器资源UUID。 */
    public get uuid() {
        return this._shader.asset.name;
    }

    /** 资源实例内部实现。 */
    public get shader() {
        return this._shader;
    }

    /** 着色器属性统一变量块大小。 */
    public get uniformSize() {
        return this._shader.tuple.size;
    }

    /** 材质资源内核实现。 */
    private _impl: Shader_kernel;
    /** 资源实例内部实现。 */
    private _shader: Miaoverse.Shader = null;
}

/** 着色器资源实例管理器。 */
export class Shader_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 装载着色器资源实例。
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

        const instance = new ShaderRes(this, shader, id);

        this._instanceList[id] = instance;
        this._instanceLut[uuid] = instance;
        this._instanceCount++;

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        return instance;
    }

    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    public GetInstanceByID(id: number) {
        return this._instanceList[id];
    }

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;

    /** 实例容器列表。 */
    protected _instanceList: ShaderRes[] = [null];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, ShaderRes> = {};
    /** 已分配实例数量。 */
    protected _instanceCount: number = 0;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC列表。 */
    protected _gcList: ShaderRes[] = [];
}

/** 着色器资源描述符。 */
export interface Asset_shader extends Miaoverse.Asset {
    /** 着色器资产。 */
    asset: Miaoverse.ShaderAsset;
}
