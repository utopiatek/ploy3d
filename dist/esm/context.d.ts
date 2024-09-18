/// <reference types="dist" />
import * as Miaoverse from "./mod.js";
/** 渲染设备上下文接口。 */
export declare class Context {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化GPU上下文接口。
     * @returns 返回GPU上下文接口。
     */
    Init(): Promise<this>;
    /**
     * 从着色器资产创建着色器实例。
     * @param asset 着色器资产。
     * @returns 返回着色器实例。
     */
    CreateShader(asset: Miaoverse.ShaderAsset): Miaoverse.Shader;
    /**
     * 生成属性值定义代码。
     * @param properties 属性定义。
     * @param uniformGroup 属性组定义。
     * @returns 返回属性资源绑定组布局。
     */
    GenerateMaterialPropTuple(properties: Miaoverse.ShaderAsset["properties"], uniformGroup: {
        /** 资源组索引。 */
        group: number;
        /** 绑定槽索引。 */
        binding: number;
        /** 结构定义名称。 */
        tname: string;
        /** 统一变量定义名称。*/
        vname: string;
        /** 统一缓存大小对齐。*/
        alignSize: number;
    }, hide_textures?: string[]): Miaoverse.PropLayout;
    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    GenerateGroupLayout_G2(properties: Miaoverse.ShaderAsset["properties"], hide_textures?: string[]): Miaoverse.PropLayout;
    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    private GenerateGroupLayout_G0;
    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    private GenerateGroupLayout_G1;
    /**
     * 创建着色器管线实例。
     * @param desc 着色器管线描述符。
     * @returns 返回着色器管线实例ID。
     */
    CreateRenderPipeline(desc: Context["_pipelines"]["list"][0]["params"]): number;
    /**
     * 获取对应帧通道使用的GPU着色器管线实例。
     * @param id 着色器管线实例ID。
     * @param framePass 帧通道配置。
     * @param materialSlot 材质槽索引。
     * @returns 返回GPU着色器管线实例。
     */
    GetRenderPipeline(id: number, framePass: Miaoverse.GLFramePass, materialSlot: number): GPURenderPipeline;
    /**
     * 编译着色器分支实例。
     * @param shader 着色器实例。
     * @returns 返回着色器模块。
     */
    CompileShaderModule(shader: Miaoverse.Shader, g0: Miaoverse.Shader, g1: Miaoverse.Shader, g3: Miaoverse.Shader): GPUShaderModule[];
    /**
     * 批量绑定网格顶点缓存。
     * @param vertexArray 顶点数组对象ID（WebGL使用）。
     * @param buffers 顶点缓存数组。
     * @param passEncoder 渲染通道命令编码器。
     * @returns 返回顶点数组对象ID（WebGL使用）。
     */
    SetVertexBuffers(vertexArray: number, buffers: {
        /** 缓存序号。 */
        index: number;
        /** 缓存数据布局。 */
        layout: number;
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }[], passEncoder: GPURenderPassEncoder): number;
    /**
     * 设置顶点缓存。
     * @param slot 顶点缓存插槽。
     * @param bufferID 顶点缓存ID。
     * @param offset 顶点缓存绑定字节偏移。
     * @param size 顶点缓存绑定字节大小。
     * @param passEncoder 渲染通道命令编码器。
     */
    SetVertexBuffer(slot: number, bufferID: number, offset: number, size: number, passEncoder: GPURenderPassEncoder): void;
    /**
     * 设置索引缓存。
     * @param format 索引格式（2/4）。
     * @param buffer 索引缓存绑定描述。
     * @param passEncoder 渲染通道命令编码器。
     */
    SetIndexBuffer(format: number, buffer: {
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }, passEncoder: GPURenderPassEncoder): void;
    /**
     * 创建资源组绑定对象实例。
     * @param uniform 统一资源组实例。
     * @returns 返回绑定对象实例。
     */
    CreateBindGroup(uniform: Miaoverse.FrameUniforms | Miaoverse.Material | Miaoverse.MeshRenderer): {
        id: number;
        binding: GPUBindGroup;
        offset: number;
    };
    /**
     * 创建自定义资源组G3绑定对象实例。
     * @param uniform 统一资源组实例。
     * @param entries 资源实例引用。
     * @returns 返回绑定对象实例。
     */
    CreateBindGroupCustom(uniform: Miaoverse.Material, entries: GPUBindGroupEntry[]): {
        id: number;
        binding: GPUBindGroup;
        offset: number;
    };
    /**
     * 获取着色器实例。
     * @param id 着色器实例ID。
     * @returns 返回着色器实例。
     */
    GetShader(id: number): Miaoverse.Shader;
    /** 模块实例对象。 */
    private _global;
    /** G0内置的采样器ID列表。 */
    private _builtinSampler;
    /** 材质属性类型描述查找表。 */
    private _materialPropTypeDescLut;
    /** 贴图属性签名解析相关查找表。 */
    private _texturePropTypeDescLut;
    /** 图元类型查找表。 */
    private _topologyLut;
    /** 着色器实例容器。 */
    private _shaders;
    /** 着色器管线实例容器。 */
    private _pipelines;
}
/** 材质属性类型描述。 */
export interface MaterialPropTypeDesc {
    /** GLSL签名。 */
    readonly signGLSL: string;
    /** WGSL签名。 */
    readonly signWGSL: string;
    /** 类型枚举。 */
    readonly type: Miaoverse.PropType;
    /** 格式枚举。 */
    readonly format: Miaoverse.PropFormat;
    /** 字节大小。 */
    readonly size: number;
    /** 默认值。*/
    readonly default_: number[];
    /** 贴图像素类型（贴图属性特有）。 */
    readonly texture_type?: GPUTextureSampleType;
    /** 贴图纬度（贴图属性特有）。 */
    readonly texture_dim?: GPUTextureViewDimension;
}
/** 渲染队列，默认由远及近排序渲染，以此降低写入和测试的开销，数值越低越优先渲染。 */
export declare const enum RENDER_QUEUE {
    /** 背景，天空盒。 */
    BACKGROUND = 1000,
    /** 默认，绝大多数，不透明几何。 */
    GEOMETRY = 2000,
    /** 需要开启透明度测试的不透明几何。 */
    ALPHA_TEST = 2450,
    /** 透明几何，按照从后向前的顺序渲染。 */
    TRANSPARENT = 3000,
    /** 叠加效果，比如镜头光晕。 */
    OVERLAY = 4000
}
/** 渲染队列过滤范围，不在指定范围内将不渲染。 */
export declare const enum RENDER_QUEUE_RANGE {
    /** -1 */
    NONE = 0,
    /** [0, 2500] */
    OPAQUE = 1,
    /** [2501, 5000] */
    TRANSPARENT = 2,
    /** [0, 5000] */
    ALL = 3
}
/** 材质混合模式。 */
export declare const enum BLEND_MODE {
    /**
     * 禁用混合，A通道被忽略，用于渲染不透明对象。
     */
    OPAQUE = 0,
    /**
     * 禁用混合，启用alpha测试，在不透明渲染通道中使用，透明顺序无关，当alpha值小于阈值时，片元被丢弃，否则写入片元颜色；
     * 启用ALPHA_TO_COVERAGE标记可以使内部颜色根据不透明度平滑过渡到边缘，设置GPUMultisampleState.alphaToCoverageEnabled启用；
     * Alpha to coverage是基于MSAA的技术，A值会影响样点遮挡信息（coverage）的计算，从而影响写入的颜色比例；
     */
    MASKED = 1,
    /**
     * 开启混合，该混合模式采用预乘不透明度；
     * RGB_target = (A_src * RGB_src) + (A_target * RGB_target) * (1.0 - A_src)；A * RGB即为预乘不透明度；
     * 渲染目标是预乘的、片元也是预乘的，硬件执行混合操作RGB_target = RGB_src + RGB_target * (1.0 - A_src)，其结果也是预乘的；
     * 所以仅需要保证初始渲染目标状态是预乘的，写入的片元也是预乘的即可保证混合效果一致；
     */
    TRANSPARENT = 2,
    /**
     * 开启混合，与BLEND_MODE_TRANSPARENT模式类似；
     * 参数material.baseColor的值是预乘不透明度的，所以不透明度影响了散射率和反射率，从而影响光照效果；
     * 该模式将消除baseColor的预乘，不透明度在不影响光照计算结果的情况下实现对象渐隐渐显的效果；
     */
    FADE = 3,
    /**
     * 开启混合，采用预乘不透明度，执行混合操作RGB_target = RGB_src + RGB_target；
     * 用于火焰、蒸气、全息等效果；
     */
    ADD = 4,
    /**
     * 开启混合，采用预乘不透明度，执行混合操作RGB_target = RGB_src * RGB_target；
     * 使渲染缓存内容变暗，用于某些粒子效果；
     */
    MULTIPLY = 5,
    /**
     * 开启混合，采用预乘不透明度，执行混合操作RGB_target += RGB_src * (1.0 - RGB_target)；
     * 使渲染缓存内容变亮；
     */
    SCREEN = 6
}
/** 渲染设置标记。 */
export declare const enum RENDER_FLAGS {
    /** 包含顶点缓存布局0中定义的顶点属性（坐标、法线、切线、UV）。 */
    ATTRIBUTES0 = 1,
    /** 包含顶点缓存布局1中定义的顶点属性（骨骼索引、骨骼权重）。 */
    ATTRIBUTES1 = 2,
    /** 包含顶点缓存布局2中定义的顶点属性（保留，未使用）。 */
    ATTRIBUTES2 = 4,
    /** 使用DrawArrays方法绘制材质，该方法绘制不依赖顶点缓存和索引缓存，材质必须包含drawCount属性。 */
    DRAW_ARRAYS = 8,
    /** 投射阴影。 */
    CAST_SHADOWS = 16,
    /** 接收阴影。 */
    RECEIVE_SHADOWS = 32,
    /** 骨骼蒙皮。 */
    SKINNING = 64,
    /** 子网格形变。 */
    MORPHING = 128,
    /** 启用双面渲染。 */
    HAS_DOUBLE_SIDED = 8388608,
    /** 启用自发光效果。 */
    HAS_EMISSIVE = 16777216,
    /** 启用反射效果。 */
    HAS_REFLECTIONS = 33554432,
    /** 启用清漆层效果。 */
    HAS_CLEAR_COAT = 67108864,
    /** 启用各向异性效果。 */
    HAS_ANISOTROPY = 134217728,
    /** 最高4位记录混合模式索引。 */
    BLEND_MODE_INDEX = 28
}
