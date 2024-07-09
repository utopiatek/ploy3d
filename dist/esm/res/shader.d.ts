import * as Miaoverse from "../mod.js";
/** 着色器资源实例。 */
export declare class ShaderRes extends Miaoverse.Resource<ShaderRes> {
    /**
     * 构造函数。
     * @param impl 实例管理器。
     * @param shader 内部实例。
     * @param id 实例ID。
     */
    constructor(impl: Shader_kernel, shader: Miaoverse.Shader, id: number);
    /** 着色器资源UUID。 */
    get uuid(): string;
    /** 资源实例内部实现。 */
    get shader(): Miaoverse.Shader;
    /** 着色器属性统一变量块大小。 */
    get uniformSize(): number;
    /** 实例管理器。 */
    private _impl;
    /** 内部实例。 */
    private _shader;
}
/** 着色器资源实例管理器（没有内核实现）。 */
export declare class Shader_kernel extends Miaoverse.Base_kernel<ShaderRes, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 装载着色器资源。
     * @param uri 着色器资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回着色器资源实例。
     */
    Load(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.ShaderRes>;
}
/** 着色器资源描述符。 */
export interface Asset_shader extends Miaoverse.Asset {
    /** 着色器资产数据。 */
    asset: Miaoverse.ShaderAsset;
}
