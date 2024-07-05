import * as Miaoverse from "../mod.js";
/** 着色器资源实例。 */
export declare class ShaderRes extends Miaoverse.Resource<ShaderRes> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: Shader_kernel, shader: Miaoverse.Shader, id: number);
    /** 着色器资源UUID。 */
    get uuid(): string;
    /** 资源实例内部实现。 */
    get shader(): Miaoverse.Shader;
    /** 着色器属性统一变量块大小。 */
    get uniformSize(): number;
    /** 材质资源内核实现。 */
    private _impl;
    /** 资源实例内部实现。 */
    private _shader;
}
/** 着色器资源实例管理器。 */
export declare class Shader_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 装载着色器资源实例。
     * @param uri 着色器资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回着色器资源实例。
     */
    Load(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.ShaderRes>;
    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    GetInstanceByID(id: number): Miaoverse.ShaderRes;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: ShaderRes[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, ShaderRes>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 待GC列表。 */
    protected _gcList: ShaderRes[];
}
/** 着色器资源描述符。 */
export interface Asset_shader extends Miaoverse.Asset {
    /** 着色器资产。 */
    asset: Miaoverse.ShaderAsset;
}
