/// <reference types="dist" />
import * as Miaoverse from "./mod.js";
/** 渲染器接口。 */
export declare class Renderer {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化渲染器接口。
     * @returns 返回渲染器接口。
     */
    Init(): Promise<this>;
    /**
     * 获取渲染队列。
     * @param callback 等待后回调返回渲染队列。
     */
    GetQueue(callback: (queue: DrawQueue) => void): void;
    /** 模块实例对象。 */
    private _global;
    /** 当前渲染队列。 */
    private _queue;
}
/** 渲染队列。 */
export declare class DrawQueue {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 获取渲染队列。
     * @param callback 等待后回调返回渲染队列。
     */
    Begin(callback: (queue: DrawQueue) => void): void;
    /**
     * 结束当前对渲染队列的使用。
     */
    End(end?: boolean): void;
    /**
     * 刷新渲染队列状态。
     */
    private Flush;
    /**
     * 执行帧绘制。
     * @param camera 相机组件实例。
     * @param volume 体积组件实例。
     * @param target 帧绘制目标贴图视图。
     * @param framePassList 帧通道配置列表。
     * @param queue 绘制队列。
     * @param draw 场景绘制方法。
     * @param callback 绘制完成回调。
     */
    Execute(camera: Miaoverse.Camera, volume: Miaoverse.Volume, target: DrawQueue["target"], framePassList: DrawQueue["framePassList"], draw: (queue: DrawQueue) => void, callback: (e: any) => void): void;
    /**
     * 执行帧通道。
     * @param framePass 帧通道实例。
     * @param queue 绘制队列。
     */
    private ExecuteFramePass;
    /**
     * 绑定帧统一资源组实例（G0）。
     * @param frameUniforms 帧统一资源组实例（G0）。
     */
    BindFrameUniforms(frameUniforms: Miaoverse.FrameUniforms): void;
    /**
     * 绑定网格渲染器组件。
     * @param meshRenderer 网格渲染器组件实例。
     */
    BindMeshRenderer(meshRenderer: Miaoverse.MeshRenderer): void;
    /**
     * 绑定材质资源实例。
     * @param material 材质资源实例。
     */
    BindMaterial(material: Miaoverse.Material): void;
    /**
     * 基于当前资源绑定设置着色器管线（需要先调用BindFrameUniforms、BindMeshRenderer、BindMaterial）。
     */
    BindRenderPipeline(config: {
        /** 渲染设置标记集（材质与网格渲染器共同设置）。 */
        flags: number;
        /** 图元类型（子网格设置）。 */
        topology: number;
        /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0。网格渲染器设置）。*/
        frontFace: number;
        /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1。网格渲染器设置）。*/
        cullMode: number;
    }): void;
    /**
     * 绑定对应当前帧通道设置的GPU着色器管线实例。
     * @param pipelineID 着色器管线实例ID。
     */
    SetPipeline(pipelineID: number): void;
    /**
     * 动态绘制网格。
     * @param params 动态绘制参数。
     */
    DrawMesh(params: DrawQueue["drawList"]["drawCalls"][0]): void;
    /**
     * 绘制当前绘制列表。
     */
    DrawList(): void;
    /**
     * 子网格绘制方法。
     * @param g1 网格渲染器实例ID。
     * @param g2 材质实例ID。
     * @param pipeline 着色器管线实例ID。
     * @param mesh 网格资源ID。
     * @param submesh 子网格索引。
     * @param instanceCount 绘制实例数量。
     * @param firstInstance 起始绘制实例索引。
     */
    DrawPart(g1: number, g2: number, pipeline: number, mesh: number, submesh: number, instanceCount?: number, firstInstance?: number): void;
    /** 当前场景绘制方法。 */
    Draw?: (queue: DrawQueue) => void;
    /** 模块实例对象。 */
    private _global;
    /** 等待当前所有任务完成后响应。 */
    private _waiting;
    /** 是否已结束当前对渲染队列的使用。 */
    private _end;
    /** 当前剩余任务。 */
    private _task;
    /** 当前相机组件实例。 */
    camera: Miaoverse.Camera;
    /** 当前体积组件实例。 */
    volume: Miaoverse.Volume;
    /** 当前相机渲染目标贴图视图。 */
    target: {
        /** 目标贴图。 */
        texture: GPUTexture;
        /** 目标贴图视图。 */
        view: GPUTextureView;
        /** 目标视口。 */
        viewport: number[];
    };
    /** 当前帧通道配置列表。 */
    framePassList: Miaoverse.Assembly_config["pipelines"][""];
    /** 当前绘制列表。 */
    drawList: {
        /** 当前动态绘制命令列表。 */
        drawCalls: {
            /** 3D对象渲染标志集。 */
            flags: number;
            /** 3D对象层标记。 */
            layers: number;
            /** 用户数据。 */
            userData: number;
            /** 是否投射阴影。 */
            castShadows?: boolean;
            /** 是否接收阴影。 */
            receiveShadows?: boolean;
            /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0）。 */
            frontFace: number;
            /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1）。 */
            cullMode: number;
            /** 图元类型（网格资源为空时需指定该参数）。 */
            topology?: Miaoverse.GLPrimitiveTopology;
            /** 网格资源实例（可为空）。 */
            mesh: Miaoverse.Mesh;
            /** 绘制材质列表。 */
            materials: {
                /** 子网格索引（网格资源实例为空时不使用该字段）。 */
                submesh: number;
                /** 材质资源实例。 */
                material: Miaoverse.Material;
                /** 绘制参数集（[g1, g2, pipeline, mesh, submesh, instanceCount, firstInstance]）。 */
                drawParams?: number[];
            }[];
            /** 实例数据列表（模型空间到世界空间转换矩阵）。 */
            instances: number[][];
        }[];
        /** 材质绘制参数集列表。 */
        drawParts: number[][];
        /** 实例绘制数据缓存。 */
        instanceVB: number;
        /** 实例绘制数据数量（每个104字节）。 */
        instanceCount: number;
    };
    /** 当前相机渲染执行统计。 */
    execStat: ExecuteStat;
    /** 当前活动帧通道。 */
    framePass: Miaoverse.GLFramePass;
    /** 当前GPU指令编码器。 */
    cmdEncoder: GPUCommandEncoder;
    /** 当前渲染指令编码器。 */
    passEncoder: GPURenderPassEncoder;
    /** 当前计算指令编码器。 */
    computeEncoder: GPUComputePassEncoder;
    /** 当前活动GO常量缓存。 */
    activeG0: Miaoverse.FrameUniforms;
    /** 当前活动G1常量缓存。 */
    activeG1: Miaoverse.MeshRenderer;
    /** 当前活动G2常量缓存。 */
    activeG2: Miaoverse.Material;
    /** 当前活动G3常量缓存。 */
    activeG3: any;
    /** 当前活动着色管线。 */
    activePipeline: GPURenderPipeline;
    /** 当前活动网格顶点缓存。 */
    activeMesh: Miaoverse.Mesh;
}
/** 帧通道配置。 */
export interface GLFramePass extends GPURenderPassDescriptor {
    /** 唯一标识。 */
    label: string;
    /** 唯一编号。 */
    index?: number;
    /**
     * 颜色渲染目标设置。
     * 注意，通常帧通道仅配置渲染队列过滤范围，不描述颜色渲染目标混合模式。
     * 颜色渲染目标混合模式通常由材质指定。
     * 处于特殊用途考虑，也帧通道配置中指定颜色渲染目标混合模式，并优先采用该配置而不使用材质的配置。
     */
    colorAttachments: (GPUColorTargetState & GPURenderPassColorAttachment & {
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
        /** 颜色渲染目标贴图视图（多重采样时作为中间目标）。 */
        view: GPUTextureView;
        /** 多重采样时作为最终目标。 */
        resolveTarget?: GPUTextureView;
        /** 颜色渲染目标清空值。 */
        clearValue?: GPUColor;
        /** 颜色渲染目标装载到渲染通道时的操作。 */
        loadOp: GPULoadOp;
        /** 颜色渲染目标写操作。 */
        storeOp: GPUStoreOp;
        /** 渲染目标实例引用。 */
        target: {
            /** 唯一标识。 */
            name: string;
            /** 渲染目标贴图层索引。 */
            layer: number;
            /** 渲染目标贴图级别。 */
            level: number;
        };
    })[];
    /** 深度和模板渲染目标设置。 */
    depthStencilAttachment?: (GPUDepthStencilState & {
        /** 深度和模板渲染贴图格式。 */
        format: GPUTextureFormat;
        /** 是否允许写入深度值。 */
        depthWriteEnabled: boolean;
        /** 深度比较方法。 */
        depthCompare: GPUCompareFunction;
        /** 深度渲染目标贴图视图。 */
        view: GPUTextureView;
        /** 深度渲染目标清空值。 */
        depthClearValue?: number;
        /** 深度渲染目标渲染装载到渲染通道时的操作。 */
        depthLoadOp: GPULoadOp;
        /** 深度渲染目标写操作。 */
        depthStoreOp: GPUStoreOp;
        /** 深度渲染目标是否只读。 */
        depthReadOnly?: boolean;
        /** 渲染目标实例引用。 */
        target: {
            /** 唯一标识。 */
            name: string;
            /** 渲染目标贴图层索引。 */
            layer: number;
            /** 渲染目标贴图级别。 */
            level: number;
        };
    });
    /**
     * 多重采样设置（在GPURenderPipelineDescriptor中使用）。
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
     * 是否启用depth-clip-control特性（在GPUPrimitiveState中使用）。
     * 默认情况下，多边形的深度在光栅化过程中会被裁剪到0-1的范围内，超出这个范围的部分会被拒绝，相关的片元也不会被处理。
     * 启用depth-clip-control特性后，可以禁用这种裁剪。
     */
    unclippedDepth?: boolean;
    /** 通道所用着色器类型。 */
    mode: "shading" | "postprocess" | "compute";
    /** 帧通道变体数量（默认1，每个变体）。 */
    variantCount?: number;
    /** 层掩码，用于在渲染前过滤对象。 */
    layerMask?: number;
    /** 渲染排序方法（多重方法标志集，越低位权重越高）。 */
    sortingCriteria?: number;
    /** 是否翻转由网格渲染器定义的裁剪面向。 */
    invertCull?: boolean;
    /** 指定固定使用的材质绘制帧（通常在后处理帧通道使用）。 */
    materialSpec?: Miaoverse.Asset_material & {
        instance?: Miaoverse.Material;
    };
    /** 特别指定着色器通道宏定义。 */
    shaderMacro?: any;
    /** 帧绘制资源组G0。 */
    frameUniforms: string;
    /** 渲染队列范围。 */
    queueRange: Miaoverse.RENDER_QUEUE_RANGE;
    /** 绘制渲染目标区域。 */
    rect: number[];
    /** 渲染视口。 */
    viewport?: number[];
    /** 预备执行帧通道。 */
    PreExecute?: (variant: number, queue: DrawQueue) => boolean;
    /** 执行帧通道。 */
    Execute?: (variant: number, queue: DrawQueue) => void;
}
/** 相机画面渲染执行统计。 */
export interface ExecuteStat {
    /** 指令编码计时。 */
    encodeTS: number;
    /** 指令执行计时。 */
    executeTS: number;
    /** 绘制对象次数。 */
    drawObjectCount: number;
    /** 绘制子网格次数。 */
    drawPartCount: number;
    /** 执行计算着色器次数。 */
    computeCount: number;
}
