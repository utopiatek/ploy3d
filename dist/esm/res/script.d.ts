import * as Miaoverse from "../mod.js";
/** 脚本模块实例。 */
export declare class IScriptModule extends Miaoverse.Resource<IScriptModule> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Script_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 加载脚本模块。
     * @param module JS模块对象。
     */
    Load(module: any): Promise<void>;
    /**
     * 重载脚本模块。
     * @param module JS模块对象。
     */
    Reload(module: any): Promise<void>;
    /** 模块导出字典。 */
    get exports(): any;
    /** 内核实现。 */
    private _impl;
    /** JS模块对象。 */
    private _module;
}
/** 脚本系统内核实现。 */
export declare class Script_kernel extends Miaoverse.Base_kernel<IScriptModule, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 加载脚本模块。
     * @param uri 脚本文件URI。
     * @param pkg 当前资源包注册信息。
     * @returns 返回模块实例。
     */
    Load(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.IScriptModule>;
    /**
     * 重载脚本模块。
     * @param uri 脚本文件URI。
     * @param pkg 当前资源包注册信息。
     * @returns 返回模块实例。
     */
    Reload(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.IScriptModule>;
    /**
     * 查询数据。
     * @param desc 查询方法描述。
     */
    QueryData(desc: {
        /** 数据提供器URI。 */
        provider: string;
        /** 数据转换器URI。 */
        converter?: string;
        /** 数据查询输入参数。 */
        inputs?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    /**
     * 监听数据提供器轮询结果。
     * @param desc 监听器设置。
     */
    ListenData(desc: {
        /** 数据提供器URI。 */
        provider: string;
        /** 数据转换器URI。 */
        converter?: string;
        /** 数据回调方法。 */
        listener: (data: any, old?: any) => void;
    }): void;
    /** 数据提供器实例查找表（通过UUID查找）。 */
    private _providerLut;
    /** 脚本系统计时器（单位秒）。 */
    private _timeTick;
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
    message: string;
    /** 最新请求获得的数据对象（初始为模拟数据对象）。 */
    data: T;
    /** 当前数据时间戳。 */
    timestamp?: number;
    /** 数据事件管理器（如果需要监听轮询数据，则向其中注册监听器，注意结束后请移除监听器）。 */
    signal?: Miaoverse.SimpleSignal<any, unknown>;
}
