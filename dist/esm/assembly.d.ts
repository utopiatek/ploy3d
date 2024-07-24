import * as Miaoverse from "./mod.js";
/** 渲染管线装配器。 */
export declare class Assembly {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化渲染管线装配器。
     * @returns 返回渲染管线装配器。
     */
    Init(): Promise<this>;
    /**
     * 获取渲染管线帧通道集。
     * @param key 配置键。
     * @returns 返回帧通道集。
     */
    GetFramePassList(key: string): {
        /** 是否为延迟着色模式。 */
        deferred?: boolean;
        /** 渲染目标动态渲染分辨率倍数，可选值：1.0倍，0.75倍，0.5倍。 */
        rt_scale: number;
        /** 渲染管线使用的帧通道列表。 */
        framePassName: string[];
        /** 渲染管线使用的帧通道列表。 */
        framePass?: Miaoverse.GLFramePass[];
    };
    /** 模块实例对象。 */
    private _global;
    /** 渲染管线装配器配置。 */
    private _config;
}
/** 渲染管线装配器配置。 */
export interface Assembly_config {
    /** 渲染目标。 */
    renderTargets: {
        /** 渲染目标宽度。 */
        width: number;
        /** 渲染目标高度。 */
        height: number;
        /** 渲染目标定义列表。 */
        list: {
            /** 唯一标识。 */
            name: string;
            /** 渲染目标贴图内部实例ID。 */
            id?: number;
            /** 渲染目标贴图像素格式。 */
            format: Miaoverse.GLTextureFormat;
            /** 渲染目标贴图层数。 */
            layerCount: number;
            /** 渲染目标贴图LOD级数。 */
            levelCount: number;
        }[];
        /** 渲染目标查找表。 */
        lut?: Record<string, Assembly_config["renderTargets"]["list"][0]>;
    };
    /** 帧绘制资源组G0。*/
    frameUniforms: {
        /** 帧绘制资源组G0定义列表。 */
        list: {
            /** 唯一标识。 */
            name: string;
            /** 帧绘制需采样的颜色渲染目标。 */
            colorRT?: string;
            /** 帧绘制需采样的深度渲染目标。 */
            depthRT?: string;
            /** 帧绘制需采样的GBUFFER。 */
            gbRT?: string;
            /** 帧绘制资源组G0实例。*/
            g0?: Miaoverse.FrameUniforms;
        }[];
        /** 帧绘制资源组G0查找表。 */
        lut?: Record<string, Assembly_config["frameUniforms"]["list"][0]>;
    };
    /** 帧通道配置。 */
    framePass: {
        /** 帧通道配置列表。 */
        list: Miaoverse.GLFramePass[];
        /** 帧通道配置查找表。 */
        lut?: Record<string, Assembly_config["framePass"]["list"][0]>;
    };
    /** 渲染管线配置。 */
    pipelines: Record<string, {
        /** 是否为延迟着色模式。 */
        deferred?: boolean;
        /** 渲染目标动态渲染分辨率倍数，可选值：1.0倍，0.75倍，0.5倍。 */
        rt_scale: number;
        /** 渲染管线使用的帧通道列表。 */
        framePassName: string[];
        /** 渲染管线使用的帧通道列表。 */
        framePass?: Miaoverse.GLFramePass[];
    }>;
}
