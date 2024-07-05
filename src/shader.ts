import * as Miaoverse from "./mod.js"

/** 着色器。 */
export interface Shader extends PropLayout {
    /** 着色器ID。 */
    id: number;
    /** 着色器唯一名称。 */
    name: string;
    /** 着色器资产。 */
    asset: ShaderAsset;
    /** 分支健数组。 */
    branchKeys: string[];
    /** 分别存储编译后的顶点、片元、计算着色器模块。*/
    module?: GPUShaderModule[];
    /** 着色器引用计数。 */
    refCount: number;
}

/** 着色器预制资产。 */
export interface ShaderAsset {
    /** 唯一名称。 */
    name: string;
    /** 着色器类型。 */
    type: "shading" | "postprocess" | "compute";
    /** 渲染标志过滤设置，将过滤着色器永远不会用到的标志，可以显著减少分支数量（取反后与渲染标志集进行与运算）。 */
    filtering?: number;
    /** 默认启用特性配置（分支编译时会结合渲染设置中的特性配置）。 */
    settings: any;
    /** 属性声明（为了能使材质属性能在不同着色器之间正确转移，请使用标准PBR属性名称）。 */
    properties: Record<string, {
        /** 属性用途提示。 */
        note: string;
        /** 属性类型签名。 */
        sign: string;
        /** 属性初始值（贴图属性为缺省色彩值）。 */
        value?: number[];
    }>;
    /** 着色器代码。 */
    codes: {
        /** 顶点着色器代码。 */
        vertex: {
            /** 顶点着色器依赖代码文件。 */
            includes: string[];
            /** 顶点着色器实现代码文件。 */
            main: string;
            /** 装配所得代码 */
            code?: string;
        },
        /** 材质着色器代码。 */
        material: {
            /** 材质着色器依赖代码文件。 */
            includes: string[];
            /** 材质着色器实现代码文件。 */
            main: string;
            /** 装配所得代码 */
            code?: string;
        },
        /** 光照着色器代码。 */
        shading: {
            /** 光照着色器依赖代码文件。 */
            includes: string[];
            /** 光照着色器实现代码文件。 */
            main: string;
            /** 装配所得代码 */
            code?: string;
        },
    };
    /** 深度和模板测试设置（GPUDepthStencilState，format字段由帧缓存设置）。 */
    depth_stencil?: {
        /** 是否允许写入深度值。 */
        depthWriteEnabled?: boolean;
        /** 深度比较方法。 */
        depthCompare?: GPUCompareFunction;

        /** 设置深度偏移参数1（深度贴图格式的最小表示值的倍数。在插值前给顶点Z值加的偏移，因此会影响写入。TODO:应当由着色器设置）。 */
        depthBias?: number;
        /**
         * 设置深度偏移参数2（受观察向量与相机平面斜率影响的深度偏移值。在插值前给顶点Z值加的偏移，因此会影响写入。TODO:应当由着色器设置）；
         * m：像素深度值的水平斜率和垂直斜率的最大值，与远近平面平行的面时，m = 0；
         * r：深度缓冲区格式的最小可表示值；
         * offset = (m * depthBiasSlopeScale) + (r * depthBias)。
         */
        depthBiasSlopeScale?: number;
        /** 最大深度偏移约束。 */
        depthBiasClamp?: number;

        /*/
         https://zhuanlan.zhihu.com/p/592341267?utm_id=0
         GPURenderPassDescriptor.depthStencilAttachment.stencilClearValue
         GPURenderPassDescriptor.depthStencilAttachment..stencilLoadOp
         GPURenderPassDescriptor.depthStencilAttachment..stencilStoreOp
         GPURenderPassDescriptor.depthStencilAttachment..stencilReadOnly
         
         1、重置模板缓存为指定值；
         2、设置模板参考值（Stencil-Reference Value，GPURenderPassEncoder.setStencilReference）；
         3、模板测试方法：(referenceValue & stencilReadMask) ◇ (bufferValue & stencilReadMask)；
         模板测试逻辑通过GPUStencilFaceState设置，可以为三角形正面和背面配置不同的测试逻辑。
         GPUStencilFaceState.compare：模板测试方法；
         GPUStencilFaceState.failOp：模板测试失败后操作；
         GPUStencilFaceState.depthFailOp：模板测试通过，深度测试失败后操作；
         GPUStencilFaceState.passOp：测试通过操作；
         测试后操作可以修改模板缓存中的值，用于后续模板测试。
         模板缓存写入值要与stencilWriteMask进行与运算后再写入。
        /*/

        /** 模板正面测试和测试后操作方法。 */
        stencilFront?: GPUStencilFaceState;
        /** 模板背面测试和测试后操作方法。 */
        stencilBack?: GPUStencilFaceState;
        /** 模板测试时读取模板值的位掩码。 */
        stencilReadMask?: number;
        /** 模板测试后写入模板值的位掩码。 */
        stencilWriteMask?: number;
    };
    /** 着色器实例ID（着色器资产装载后生成）。 */
    instance?: number;
}

/** 材质属性资源绑定组布局。 */
export interface PropLayout {
    /** 资源组索引。 */
    group: number;
    /** 资源绑定组属性元组。 */
    tuple: PropTuple;
    /** GPU资源绑定组布局实例。 */
    layout?: GPUBindGroupLayout;
    /** 资源绑定组代码。 */
    vscode: string;
    /** 资源绑定组代码。 */
    fscode: string;
}

/** 材质属性元组。 */
export interface PropTuple {
    /** 元组中变量列表。 */
    vars: PropVar[];
    /** 元组占用空间大小。 */
    size: number;
    /** 元组访问视图构造器。 */
    view: new (master: {
        /** 标准材质材质属性启用标志集。 */
        enableFlags: number;
        /** 属性块数据更新状态。 */
        updated: number;
        /** 属性缓存块地址。 */
        blockPtr: Miaoverse.io_ptr;
    }) => Record<string, Array<number>>;
}

/** 材质属性变量定义。 */
export interface PropVar {
    /** 原始声明序号。 */
    index: number;
    /** 编排后的序号。 */
    sort: number;
    /** 属性相对属性块偏移。 */
    offset: number;
    /** 属性大小。 */
    size: number;
    /** 声明信息。 */
    decl: PropDecl;
}

/** 材质属性声明信息。 */
export interface PropDecl {
    /** 名称。 */
    name: string;
    /** 提示。 */
    note: string;
    /** 签名。 */
    sign: string;
    /** 默认值。 */
    value: number[];
    /** 类型。 */
    type: PropType;
    /** 格式。 */
    format: PropFormat;
    /** 如果是贴图UUID字段，则记录贴图索引。 */
    texture?: number;
    /** 如果是采样设置字段，则记录贴图索引。 */
    sampler?: number;
}

/** 材质属性类型枚举。 */
export const enum PropType {
    none = 0,
    vec1, vec2, vec3, vec4,
    mat2x2, mat3x3, mat4x4,
    texture_1d, texture_2d, texture_2d_array, texture_cube, texture_cube_array, texture_3d
}

/** 材质属性数据格式。 */
export const enum PropFormat {
    /** 非法格式。 */
    none = 0,
    /** 32位整形。 */
    i32,
    /** 无符号32位整形。 */
    u32,
    /** 32位浮点型。 */
    f32
}
