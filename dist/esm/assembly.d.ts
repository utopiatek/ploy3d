/// <reference types="dist" />
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
     * 获取帧通道。
     * @param key 帧通道名称。
     * @returns 返回帧通道。
     */
    GetFramePass(key: string): Miaoverse.GLFramePass;
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
    /**
     * 获取帧绘制资源组G0实例。
     * @param key 实例键。
     * @returns 返回帧绘制资源组G0实例。
     */
    GetFrameUniforms(key: string): Miaoverse.FrameUniforms;
    /**
     * 获取屏幕上像素对应的对象。
     * @param x 平幕坐标[0, 1]。
     * @param y 平幕坐标[0, 1]。
     * @returns 返回对象。
     */
    GetObjectInScreen(x: number, y: number): Promise<{
        object3d: Miaoverse.Object3D;
        material: Miaoverse.Material;
        pixel: Uint32Array;
    } | {
        pixel: Uint32Array;
        object3d?: undefined;
        material?: undefined;
    }>;
    /** 默认IBL高光反射贴图资源视图。 */
    get default_iblSpecular(): GPUTextureView;
    /** 模块实例对象。 */
    private _global;
    /**
     * 渲染管线装配器配置。
     * 渲染贴图划分规则：
     * RT0绘制：DFG、阴影、SSAO、SSR、DEPTH，其中DFG存储于Level1，因此可以放心清空画布
     * RT1绘制：场景深度结构、主画面
     * 每张2048*2048，每个小单元格512*512，6层LOD
     * 可减少帧缓存绑定切换，可减少资源绑定和切换，可合并进行后处理绘制
     * 使用动态分辨率，渲染贴图像素利用率分别为1.0倍，0.75倍，0.5倍三档
     * EarlyZ帧通道绘制到C1 LOD1，然后再后处理出SSAO、SSR、SSS
     *
     * |————|————|————|————|————|————|————|————|
     * |         |         |                   |
     * |   DFG   |   SSAO  |                   |
     * |   C0    |   C0    |                   |
     * |————|————|————|————|        SSS        |
     * |         |         |        C0         |
     * |   SD3   |   SSR   |                   |
     * |   C0    |   C0    |                   |
     * |————————————————Main RT————————————————|
     * |                  C1                   |
     * |                   |                   |
     * |                   |                   |
     * |        SD1        |        SD2        |
     * |        C0         |        C0         |
     * |                   |                   |
     * |                   |                   |
     * |————|————|————|————|————|————|————|————|
     */
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
            /** 渲染目标宽度。 */
            width?: number;
            /** 渲染目标高度。 */
            height?: number;
            /** 渲染目标贴图像素格式。 */
            format: Miaoverse.GLTextureFormat;
            /** 渲染目标贴图层数。 */
            layerCount: number;
            /** 渲染目标贴图LOD级数。 */
            levelCount: number;
            /** 渲染目标贴图各图层各级别独立视图。 */
            views?: GPUTextureView[][];
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
    /** IBL默认资源配置。 */
    ibl: {
        /** DFG数据配置。 */
        dfg: {
            /** 数据文件URI。 */
            uri: string;
            /** 数据写入目标贴图。 */
            writeRT: string;
            /** 数据写入目标贴图层索引。 */
            writeLayer: number;
            /** 数据写入目标贴图LOD级别。 */
            writeLevel: number;
            /** 数据写入目标贴图X偏移。 */
            writeOffsetX: number;
            /** 数据写入目标贴图Y偏移。 */
            writeOffsetY: number;
            /** 数据写入目标贴图宽度。 */
            writeWidth: number;
            /** 数据写入目标贴图高度。 */
            writeHeight: number;
        };
        /** 高光反射贴图。 */
        specular: {
            /** 高光反射贴图URI。 */
            uri: string;
            /** 高光反射贴图资源实例。 */
            texture?: Miaoverse.Texture;
        };
        /** 漫反射球谐系数。 */
        diffuse: number[];
    };
}
