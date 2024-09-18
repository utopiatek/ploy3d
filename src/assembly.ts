import * as Miaoverse from "./mod.js"

/** 渲染管线装配器。 */
export class Assembly {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 初始化渲染管线装配器。
     * @returns 返回渲染管线装配器。
     */
    public async Init() {
        const device = this._global.device;
        const context = this._global.context;
        const resources = this._global.resources;

        const rtWidth = this._config.renderTargets.width;
        const rtHeight = this._config.renderTargets.height;

        const renderTargetsList = this._config.renderTargets.list;
        const renderTargetsLut = this._config.renderTargets.lut = {} as Assembly_config["renderTargets"]["lut"];

        const frameUniformsList = this._config.frameUniforms.list;
        const frameUniformsLut = this._config.frameUniforms.lut = {} as Assembly_config["frameUniforms"]["lut"];

        const framePassList = this._config.framePass.list;
        const framePassLut = this._config.framePass.lut = {} as Assembly_config["framePass"]["lut"];

        const pipelineLut = this._config.pipelines;

        // 实例化渲染目标贴图
        for (let rt of renderTargetsList) {
            rt.id = device.CreateTextureRT(rt.width || rtWidth, rt.height || rtHeight, rt.layerCount, rt.levelCount, rt.format, true, false);
            rt.views = [];

            for (let layer = 0; layer < rt.layerCount; layer++) {
                rt.views[layer] = [];

                for (let level = 0; level < rt.levelCount; level++) {
                    rt.views[layer][level] = device.GetRenderTextureAttachment(rt.id, layer, level);
                }
            }

            renderTargetsLut[rt.name] = rt;
        }

        // 实例化帧绘制资源组G0
        for (let g0 of frameUniformsList) {
            const colorRT = renderTargetsLut[g0.colorRT]?.id;
            const depthRT = renderTargetsLut[g0.depthRT]?.id;
            const gbRT = renderTargetsLut[g0.gbRT]?.id;

            g0.g0 = await resources.Material.CreateFrameUniforms(colorRT, depthRT, gbRT, resources.Texture.defaultAtlas);

            frameUniformsLut[g0.name] = g0;
        }

        // 实例化帧通道
        {
            const PreExecute = (variant: number, queue: Miaoverse.DrawQueue) => {
                let rt_scale = 1.0;

                // BEG:该范围内代码非通用===============------------------------------------------------

                if (queue.framePass.label == "mipmap_z") {
                    const attachment = queue.framePass.colorAttachments[0];
                    const target = attachment.target;
                    const rt = renderTargetsLut[target.name];
                    const viewG3 = variant == 0 ? undefined : rt.views[0][variant - 1];

                    target.level = variant;
                    rt_scale = 1.0 / Math.pow(2, variant);

                    attachment.view = device.GetRenderTextureAttachment(rt.id, target.layer, target.level, target.format);

                    queue.framePass.index = queue.framePass.id + variant;
                    queue.framePass.shaderMacro.MIPMAP_ZDEPTH = 1 + variant;
                    queue.framePass.materialSpec.g3 = postprocessG3(queue.framePass, viewG3);
                }
                else if (queue.framePass.label == "sss_blur") {
                    const attachment = queue.framePass.colorAttachments[0];
                    const target = attachment.target;

                    target.name = variant == 0 ? "C1" : "C0";
                    target.level = variant == 0 ? 1 : 0;

                    const rt = renderTargetsLut[target.name];

                    attachment.view = device.GetRenderTextureAttachment(rt.id, target.layer, target.level, target.format);

                    queue.framePass.frameUniforms = variant == 0 ? "C0_D1_G0" : "C1_D1_G0";
                    queue.framePass.rect = variant == 0 ? [0.0, 0.0, 0.5, 0.5] : [0.5, 0.0, 0.5, 0.5];

                    queue.framePass.index = queue.framePass.id + variant;
                    queue.framePass.shaderMacro.BLUR_SSS = 1 + variant;
                    queue.framePass.materialSpec.g3 = null;
                }
                else if (queue.framePass.label == "blit") {
                    const rt = device.GetTextureRT(renderTargetsLut["C1"].id);
                    queue.framePass.materialSpec.g3 = postprocessG3(queue.framePass, rt.view);
                }

                // END:该范围内代码非通用===============------------------------------------------------

                const rtRect = queue.framePass.rect;
                const rtScale = queue.framePassList.rt_scale * rt_scale;
                const width = rtWidth * rtScale;
                const height = rtHeight * rtScale;

                queue.framePass.viewport = [
                    rtRect[0] * width,
                    rtRect[1] * height,
                    rtRect[2] * width,
                    rtRect[3] * height,
                    0.0, 1.0
                ];

                if (queue.framePass.colorAttachments) {
                    for (let attachments of queue.framePass.colorAttachments) {
                        if (attachments.target.name == "target") {
                            attachments.view = queue.target.view;
                            queue.framePass.viewport = [
                                ...queue.target.viewport,
                                0.0, 1.0
                            ];
                        }
                    }
                }

                return true;
            };

            const Execute = (variant: number, queue: Miaoverse.DrawQueue) => {
                const frameUniforms = frameUniformsLut[queue.framePass.frameUniforms].g0;
                const vp = queue.framePass.viewport;

                queue.passEncoder.setViewport(vp[0], vp[1], vp[2], vp[3], vp[4], vp[5]);

                if (queue.framePass.label.startsWith("shadow_cast")) {
                    queue.BindFrameUniforms(frameUniforms, 0);
                }
                else {
                    queue.BindFrameUniforms(frameUniforms);
                }

                if (queue.framePass.mode == "shading") {
                    queue.Draw(queue);
                }
                else if (queue.framePass.mode == "postprocess") {
                    const materialSpec = queue.framePass.materialSpec;
                    if (queue.framePass.materialSpec) {
                        queue.BindMeshRenderer(resources.MeshRenderer.defaultG1);
                        queue.BindMaterial(materialSpec.instance);

                        queue.passEncoder.setBindGroup(3, materialSpec.g3 || postprocessG3(queue.framePass));

                        queue.BindRenderPipeline({
                            flags: materialSpec.flags,
                            topology: 3,
                            frontFace: 0,
                            cullMode: 1
                        });

                        queue.passEncoder.draw(3, 1, 0, 0);
                    }
                    else {
                        // TODO ...
                    }
                }
                else {
                    // TODO ...
                }
            };

            // TODO: 仅在后期处理着色器中自定义G3，且仅含当前渲染目标贴图的绑定，用于采样当前渲染目标贴图来构建MIPMAP
            const postprocessG3 = (() => {
                const list: GPUBindGroup[] = [];

                const default2D = resources.Texture.default2D;
                const defaultView2D = device.GetTexture2D(default2D.internalID).view;

                const entries: GPUBindGroupEntry[] = [
                    {
                        binding: 0,
                        resource: defaultView2D
                    }
                ];

                return (framePass: Miaoverse.GLFramePass, view?: GPUTextureView) => {
                    let index = view ? framePass.index : 0;
                    let bindGroup = list[index];

                    if (!bindGroup) {
                        entries[0].resource = view || defaultView2D;

                        const binding = context.CreateBindGroupCustom(framePass.materialSpec.instance, entries);

                        bindGroup = list[index] = binding.binding;

                        console.info("instance customG3", framePass.label, index);
                    }

                    return bindGroup;
                };
            })();

            let framePassIndex = 0;

            for (let i = 0; i < framePassList.length; i++) {
                const framePass = framePassList[i];
                framePass.id = framePassIndex;
                framePass.index = framePassIndex;
                framePass.PreExecute = PreExecute;
                framePass.Execute = Execute;

                if (framePass.colorAttachments) {
                    for (let attachments of framePass.colorAttachments) {
                        if (attachments.target.name) {
                            const rt = renderTargetsLut[attachments.target.name];
                            if (rt) {
                                attachments.view = device.GetRenderTextureAttachment(rt.id, attachments.target.layer, attachments.target.level, attachments.target.format);
                            }
                        }
                    }
                }

                if (framePass.depthStencilAttachment) {
                    const attachments = framePass.depthStencilAttachment;
                    const rt = renderTargetsLut[attachments.target.name];
                    if (rt) {
                        attachments.view = device.GetRenderTextureAttachment(rt.id, attachments.target.layer, attachments.target.level);
                    }
                }

                if (framePass.materialSpec) {
                    framePass.materialSpec.instance = await resources.Material.Create(framePass.materialSpec);
                }

                framePassLut[framePass.label] = framePass;

                framePassIndex += framePass.variantCount || 1;
            }
        }

        // 初始化渲染管线配置
        {
            for (let key in pipelineLut) {
                const pipeline = pipelineLut[key];

                pipeline.framePass = [];

                for (let name of pipeline.framePassName) {
                    pipeline.framePass.push(framePassLut[name]);
                }
            }
        }

        {
            const dfg_cfg = this._config.ibl.dfg;
            const dfg_ab = await resources.Load_file<ArrayBuffer>("arrayBuffer", dfg_cfg.uri, true);

            device.WriteTexture2D_RAW(renderTargetsLut[dfg_cfg.writeRT].id, true, {
                data: dfg_ab.data,
                dataLayout: {
                    offset: 0,
                    bytesPerRow: 2 * 4 * dfg_cfg.writeWidth,
                    rowsPerImage: dfg_cfg.writeHeight
                },
                xoffset: dfg_cfg.writeOffsetX,
                yoffset: dfg_cfg.writeOffsetY,
                layer: dfg_cfg.writeLayer,
                level: dfg_cfg.writeLevel,
                width: dfg_cfg.writeWidth,
                height: dfg_cfg.writeHeight
            });

            this._config.ibl.specular.texture = await resources.Texture.Load(this._config.ibl.specular.uri);
        }

        return this;
    }

    /**
     * 获取渲染管线帧通道集。
     * @param key 配置键。
     * @returns 返回帧通道集。
     */
    public GetFramePassList(key: string) {
        return this._config.pipelines[key];
    }

    /**
     * 获取帧绘制资源组G0实例。
     * @param key 实例键。
     * @returns 返回帧绘制资源组G0实例。
     */
    public GetFrameUniforms(key: string) {
        return this._config.frameUniforms.lut[key]?.g0;
    }

    /**
     * 获取屏幕上像素对应的对象。
     * @param x 平幕坐标[0, 1]。
     * @param y 平幕坐标[0, 1]。 
     * @returns 返回对象。
     */
    public async GetObjectInScreen(x: number, y: number) {
        const rt = this._config.renderTargets.lut["G0"];
        const pixelX = Math.floor(x * this._config.renderTargets.width);
        const pixelY = Math.floor(y * this._config.renderTargets.width);
        const layer = 0;

        const ab = await this._global.device.ReadTextureRT(rt.id, layer, pixelX, pixelY);
        const data = new Uint32Array(ab);
        const objID = data[3] & 0xFFFFFF;
        const matSlot = data[3] >> 24;

        const obj = this._global.resources.Object.GetInstanceByID(objID);
        if (obj) {
            const meshRenderer = obj.meshRenderer;
            if (meshRenderer) {
                const mat = meshRenderer.GetMaterial(matSlot);
                if (mat) {
                    return {
                        object3d: obj,
                        material: mat,
                        pixel: data
                    };
                }
            }
        }

        return { pixel: data };
    }

    /** 默认IBL高光反射贴图资源视图。 */
    public get default_iblSpecular() {
        const id = this._config.ibl.specular.texture.internalID;
        const texture = this._global.device.GetTexture2D(id);
        return texture.view;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

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
    private _config: Assembly_config = {
        renderTargets: {
            width: 2048,
            height: 2048,
            list: [
                {
                    name: "C0",
                    format: "rgba16float",
                    layerCount: 1,
                    levelCount: 6
                },
                {
                    name: "C1",
                    format: "rgba16float",
                    layerCount: 1,
                    levelCount: 6
                },
                {
                    name: "G0",
                    format: "rgba32uint",
                    layerCount: 2,
                    levelCount: 1
                },
                {
                    name: "G_ALT",
                    width: 2,
                    height: 2,
                    format: "rgba32uint",
                    layerCount: 2,
                    levelCount: 1
                },
                {
                    name: "D0",
                    format: "depth32float",
                    layerCount: 1,
                    levelCount: 6
                },
                {
                    name: "D1",
                    format: "depth32float",
                    layerCount: 1,
                    levelCount: 6
                }
            ]
        },
        frameUniforms: {
            list: [
                {
                    name: "C0_D1_G0",
                    colorRT: "C0",
                    depthRT: "D1",
                    gbRT: "G0"
                },
                {
                    name: "C0_D0",
                    colorRT: "C0",
                    depthRT: "D0",
                    gbRT: "G_ALT"
                },
                {
                    name: "C1_D1_G0",
                    colorRT: "C1",
                    depthRT: "D1",
                    gbRT: "G0"
                }
            ]
        },
        framePass: {
            list: [
                {
                    label: "shadow_cast",
                    mode: "shading",
                    shaderMacro: {
                        SHADING_SKIP: 1,
                        SHADING_CAST_SHADOW: 1,
                        SHADING_DITHERING_TRANSPARENT: 0,
                        SHADING_ONLY_OPACITY: 1
                    },

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.ALL,
                    rect: [0.0, 0.5, 0.5, 0.5],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0x3,
                            blend: null,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [255.93748, 65504.00, 255.93748, 65504.00],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: {
                        format: "depth32float",
                        depthWriteEnabled: true,
                        depthCompare: "greater",

                        target: {
                            name: "D0",
                            layer: 0,
                            level: 0,
                        },

                        view: null,
                        depthClearValue: 0.0,
                        depthLoadOp: 'clear',
                        depthStoreOp: 'store',
                    }
                },
                {
                    label: "early_z",
                    mode: "shading",
                    shaderMacro: {
                        SHADING_SKIP: 1,
                        SHADING_EARLYZ: 1,
                        SHADING_DITHERING_TRANSPARENT: 1
                    },

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.ALL,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "rgba32uint",
                            writeMask: 0xF,
                            blend: null,

                            target: {
                                name: "G0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0xFFFFFFFF, 0, 0, 0],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: {
                        format: "depth32float",
                        depthWriteEnabled: true,
                        depthCompare: "greater",

                        target: {
                            name: "D1",
                            layer: 0,
                            level: 0,
                        },

                        view: null,
                        depthClearValue: 0.0,
                        depthLoadOp: 'clear',
                        depthStoreOp: 'store',
                    }
                },
                {
                    label: "ssao_extract",
                    mode: "postprocess",
                    shaderMacro: {
                        EXTRACT_SSAO: 1,
                    },
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.25, 0.0, 0.25, 0.25],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: null,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: undefined
                },
                {
                    label: "ssr_extract",
                    mode: "postprocess",
                    shaderMacro: {
                        EXTRACT_SSR: 1,
                    },
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.25, 0.25, 0.25, 0.25],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: null,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: undefined
                },
                {
                    label: "opaque",
                    mode: "shading",

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.OPAQUE,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "C1",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0.0, 0.0, 0.0, 0.0],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: {
                        format: "depth32float",
                        depthWriteEnabled: false,
                        depthCompare: "equal",

                        target: {
                            name: "D1",
                            layer: 0,
                            level: 0,
                        },

                        view: null,
                        depthClearValue: 0.0,
                        depthLoadOp: 'load',
                        depthStoreOp: 'store',
                    }
                },
                {
                    label: "sss_extract",
                    mode: "postprocess",
                    shaderMacro: {
                        EXTRACT_SSS: 1,
                    },
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.5, 0.0, 0.5, 0.5],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: null,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: undefined
                },
                {
                    label: "sss_blur",
                    mode: "postprocess",
                    variantCount: 2,
                    shaderMacro: {
                        BLUR_SSS: 1,
                    },
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C0_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.0, 0.0, 0.5, 0.5],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: null,

                            target: {
                                name: "C1",
                                layer: 0,
                                level: 1,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: undefined
                },
                {
                    label: "blit",
                    mode: "postprocess",
                    shaderMacro: {
                        BLIT_CANVAS: 1,
                    },
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C0_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "bgra8unorm",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "target",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: undefined
                },

                {
                    label: "mipmap_z",
                    mode: "postprocess",
                    variantCount: 6,
                    shaderMacro: {
                        MIPMAP_ZDEPTH: 1,
                    },
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.5, 0.0, 0.5, 0.5],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: null,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 1],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: undefined
                }
            ]
        },
        pipelines: {
            low: {
                deferred: false,
                rt_scale: 1.0,
                framePassName: [
                    "shadow_cast",
                    "early_z",
                    "ssao_extract",
                    "ssr_extract",
                    "opaque",
                    "sss_extract",
                    "sss_blur",
                    "blit",
                ]
            }
        },
        ibl: {
            dfg: {
                uri: "1-1-1.miaokit.builtins:/16-0_dfg.bin",
                writeRT: "C0",
                writeLayer: 0,
                writeLevel: 1,
                writeOffsetX: 0,
                writeOffsetY: 0,
                writeWidth: 128,
                writeHeight: 128
            },
            specular: {
                uri: "1-1-1.miaokit.builtins:/ibl/25-1_graffiti_shelter_2k.ktx2"
            },
            diffuse: null
        }
    }
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
    },
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
        },
        /** 高光反射贴图。 */
        specular: {
            /** 高光反射贴图URI。 */
            uri: string;
            /** 高光反射贴图资源实例。 */
            texture?: Miaoverse.Texture;
        },
        /** 漫反射球谐系数。 */
        diffuse: number[];
    };
}
