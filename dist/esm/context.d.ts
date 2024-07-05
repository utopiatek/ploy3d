/// <reference types="@webgpu/types" />
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
    }): Miaoverse.PropLayout;
    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    GenerateGroupLayout_G2(properties: Miaoverse.ShaderAsset["properties"]): Miaoverse.PropLayout;
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
     * 创建渲染管线实例（材质分支实例）。
     * @param desc 渲染管线描述符。
     * @returns 。
     */
    CreateRenderPipeline(desc: {
        /** 资源绑定组布局0的ID（shaderID）。 */
        g0: number;
        /** 资源绑定组布局1的ID（shaderID）。 */
        g1: number;
        /** 资源绑定组布局2的ID（shaderID）。 */
        g2: number;
        /** 资源绑定组布局3的ID（shaderID）。 */
        g3: number;
        /** 渲染设置标记集。 */
        flags: number;
        /** 图元类型。 */
        topology: number;
        /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0。网格渲染器设置）。*/
        frontFace: number;
        /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1。网格渲染器设置）。*/
        cullMode: number;
    }): GPURenderPipeline;
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
    CreateBindGroup(uniform: Miaoverse.FrameUniforms | Miaoverse.Material | Miaoverse.MeshRenderer): GPUBindGroup;
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
/** 帧通道配置。 */
export interface GLFramePass {
    /**
     * 颜色渲染目标设置数组。
     * 注意，通常帧通道仅配置渲染队列过滤范围，不描述颜色渲染目标混合模式。
     * 颜色渲染目标混合模式通常由材质指定。
     * 特殊使用情况下，也可以在
     * 处于特殊用途考虑，也帧通道配置中指定颜色渲染目标混合模式，并优先采用该配置而不使用材质的配置。
     */
    colorRT?: {
        /** 颜色渲染目标贴图像素格式。 */
        format: GPUTextureFormat;
        /**
         * 位掩码，指定在渲染操作中哪些颜色通道可以被写入（GPUColorWrite值的组合）。
         * GPUColorWrite.RED: 0x1
         * GPUColorWrite.GREEN: 0x2
         * GPUColorWrite.BLUE: 0x4
         * GPUColorWrite.ALPHA: 0x8
         * GPUColorWrite.ALL: 0xF
         */
        writeMask?: GPUColorWriteFlags;
        /** 颜色渲染目标混合模式（若此处不设置则取材质的混合模式设置）。 */
        blend?: GPUBlendState;
    }[];
    /** 深度和模板渲染目标设置。 */
    depthRT?: {
        /** 深度和模板渲染贴图格式。 */
        format: GPUTextureFormat;
        /** 是否允许写入深度值。 */
        depthWriteEnabled: boolean;
        /** 深度比较方法。 */
        depthCompare: GPUCompareFunction;
    };
    /**
     * 多重采样设置。
     * https://zhuanlan.zhihu.com/p/647524274
     * 多重采样是一种抗锯齿技术，用于提高图形渲染的质量。它通过对一个像素的多个样本进行采样和平均，来减少边缘的锯齿状不平滑现象。
     * 开启了Alpha To Coverage后，fragment的alpha值会影响该fragment对应像素的采样点是否被覆盖。
     * 启用ALPHA_TO_COVERAGE标记可以使内部颜色根据不透明度平滑过渡到边缘。A值会影响样点遮挡信息（coverage）的计算，从而影响写入的颜色比例；
     * 步骤：
     * 1、创建一个具有多重采样能力的渲染目标纹理（msaaTexture）；
     *  GPUTextureDescriptor.sampleCount = 4;
     *  在光栅化阶段，在1个像素周围使用4个子采样点，但每个像素仍只执行1次像素着色器的计算。
     *  这4个子采样点都会计算自己的深度值，然后根据深度测试（Occlusion）和三角形覆盖性测试（Coverage）来决定是否复制该像素的计算结果。
     *  为此深度缓冲区和渲染目标需要的空间为非多重采样的4倍。
     *  MSAA在光栅化阶段只是生成覆盖信息，计算像素颜色，根据覆盖信息和深度信息决定是否将像素颜色写入子采样点。
     *  整个光栅化完成后再通过某个过滤器进行解析（Resolve）得到最终的图像。
     *  在更大的分辨率上计算覆盖信息和遮挡信息后，得到4个样点的平均覆盖率和平均遮挡率，解析根据该平均值向4个样点混合入片元颜色
     * 2、在创建渲染管线时指定多重采样状态；
     *  GPURenderPipelineDescriptor.multisample.count = 4;
     * 3、在渲染通道描述符中设置多重采样纹理视图：
     *  GPURenderPassColorAttachment.view = msaaTexture.view;
     * 4、在渲染通道描述符中设置解析目标（通常是交换链的纹理视图）：
     *  GPURenderPassColorAttachment.resolveTarget = canvas.view;
     *  用于存储多重采样渲染操作的解析结果。
     *  当你使用MSAA时，每个像素会有多个样本。这些样本需要被合并或“解析”成单个样本存储到resolveTarget中。
     */
    multisample?: GPUMultisampleState;
    /**
     * 是否启用depth-clip-control特性。
     * 默认情况下，多边形的深度在光栅化过程中会被裁剪到0-1的范围内，超出这个范围的部分会被拒绝，相关的片元也不会被处理。
     * 启用depth-clip-control特性后，可以禁用这种裁剪。
     */
    unclippedDepth?: boolean;
    /** 是否翻转由网格渲染器定义的裁剪面向。 */
    invertCull?: boolean;
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
    /** 包含基础贴图（非金属表面的漫反射反照率，金属表面的镜面反射颜色）。 */
    HAS_BASE_TEXTURE = 256,
    /** 包含不透明度贴图。 */
    HAS_ALPHA_TEXTURE = 512,
    /** 包含金属度贴图（SPECULAR_GLOSSINESS_PARAMS参数模型下表示包含镜面反射率贴图：HAS_SPECULAR_TEXTURE）。 */
    HAS_METALLIC_TEXTURE = 1024,
    /** 包含粗糙度贴图（SPECULAR_GLOSSINESS_PARAMS参数模型下表示包含光泽度贴图：HAS_GLOSSINESS_TEXTURE） */
    HAS_ROUGHNESS_TEXTURE = 2048,
    /** 包含法线贴图。 */
    HAS_NORMAL_TEXTURE = 4096,
    /** 包含环境光遮蔽贴图。 */
    HAS_AO_TEXTURE = 8192,
    /** 包含自发光贴图。 */
    HAS_EMISSIVE_TEXTURE = 16384,
    /** 是否合并打包AO、ROUGHNESS、METALLIC贴图。 */
    COMBINE_AO_ROUGHNESS_METALLIC_TEXTURE = 32768,
    /** 启用自发光效果。 */
    HAS_DOUBLE_EMISSIVE = 524288,
    /** 启用双面渲染。 */
    HAS_DOUBLE_SIDED = 1048576,
    /** 启用反射效果。 */
    HAS_REFLECTIONS = 2097152,
    /** 启用清漆层效果。 */
    HAS_CLEAR_COAT = 4194304,
    /** 启用各向异性效果。 */
    HAS_ANISOTROPY = 8388608,
    /** 启用非光照着色模型。 */
    SHADING_AS_UNLIT = 16777216,
    /** 启用布料光照模型。 */
    SHADING_AS_CLOTH = 33554432,
    /** 启用次表面光照模型。 */
    SHADING_AS_SUBSURFACE = 67108864,
    /** 使用SPECULAR_GLOSSINESS参数模型，内部将转换为标准PBR参数。  */
    SPECULAR_GLOSSINESS_PARAMS = 134217728,
    /** 最高4位记录混合模式索引。 */
    BLEND_MODE_INDEX = 28
}
