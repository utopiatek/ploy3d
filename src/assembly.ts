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
            rt.id = device.CreateTextureRT(rtWidth, rtHeight, rt.layerCount, rt.levelCount, rt.format, true, false);
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
                const rtRect = queue.framePass.rect;
                const rtScale = queue.framePassList.rt_scale;
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
                    if (queue.framePass.materialSpec) {
                        queue.BindMeshRenderer(resources.MeshRenderer.defaultG1);
                        queue.BindMaterial(queue.framePass.materialSpec.instance);

                        queue.BindRenderPipeline({
                            flags: queue.framePass.materialSpec.flags,
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

            for (let i = 0; i < framePassList.length; i++) {
                const framePass = framePassList[i];
                framePass.index = i;
                framePass.PreExecute = PreExecute;
                framePass.Execute = Execute;

                if (framePass.colorAttachments) {
                    for (let attachments of framePass.colorAttachments) {
                        if (attachments.target.name) {
                            const rt = renderTargetsLut[attachments.target.name];
                            if (rt) {
                                attachments.view = device.GetRenderTextureAttachment(rt.id, attachments.target.layer, attachments.target.level);
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

    /** 默认IBL高光反射贴图资源视图。 */
    public get default_iblSpecular() {
        const id = this._config.ibl.specular.texture.internalID;
        const texture = this._global.device.GetTexture2D(id);
        return texture.view;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** 渲染管线装配器配置。 */
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
                    gbRT: "G0" // TODO
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
                    shaderMacro: { SHADING_TYPE_SHADOW: 1 },

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
                    label: "id_depth",
                    mode: "shading",

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.OPAQUE,
                    rect: [0.25, 0.25, 0.25, 0.25],

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
                            clearValue: [0, 0, 0, 0],
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
                    label: "gbuffer",
                    mode: "shading",

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.OPAQUE,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "rgba32uint",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "G0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "clear",
                            storeOp: "store"
                        },
                        {
                            format: "rgba32uint",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "G0",
                                layer: 1,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
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
                    label: "mipmap_depth",
                    mode: "postprocess",
                    variantCount: 5,

                    frameUniforms: "C0_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.25, 0.25, 0.25, 0.25],

                    colorAttachments: [
                    ],
                    depthStencilAttachment: {
                        format: "depth32float",
                        depthWriteEnabled: true,
                        depthCompare: "always",

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
                    label: "ssao",
                    mode: "postprocess",

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.25, 0.0, 0.25, 0.25],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [1, 1, 1, 1],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: null
                },
                {
                    label: "blur_ssao_a",
                    mode: "postprocess",

                    frameUniforms: "C0_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.25, 0.0, 0.25, 0.25],

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
                            clearValue: [1, 1, 1, 1],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: null
                },
                {
                    label: "blur_ssao_b",
                    mode: "postprocess",

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.25, 0.0, 0.25, 0.25],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [1, 1, 1, 1],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: null
                },
                {
                    label: "deferred",
                    mode: "postprocess",

                    frameUniforms: "C0_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
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
                            clearValue: [0.2, 0.25, 0.3, 0.0],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: null
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
                            clearValue: [0.2, 0.25, 0.3, 0.0],
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
                    label: "transparent",
                    mode: "shading",

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.TRANSPARENT,
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
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: {
                        format: "depth32float",
                        depthWriteEnabled: false,
                        depthCompare: "greater",

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
                    label: "transparent_gbuffer",
                    mode: "shading",

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.TRANSPARENT,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "G0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        },
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "G0",
                                layer: 1,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "load",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: {
                        format: "depth32float",
                        depthWriteEnabled: true,
                        depthCompare: "always",

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
                    label: "fxaa",
                    mode: "postprocess",

                    frameUniforms: "C1_D1_G0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

                            target: {
                                name: "C0",
                                layer: 0,
                                level: 0,
                            },

                            view: null,
                            clearValue: [0, 0, 0, 0],
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                    depthStencilAttachment: null
                },
                {
                    label: "bloom",
                    mode: "postprocess",
                    variantCount: 8,

                    frameUniforms: "C0_D0",
                    queueRange: Miaoverse.RENDER_QUEUE_RANGE.NONE,
                    rect: [0.0, 0.0, 1.0, 1.0],

                    colorAttachments: [
                        {
                            format: "rgba16float",
                            writeMask: 0xF,
                            blend: undefined,

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
                    depthStencilAttachment: null
                },
                {
                    label: "blit",
                    mode: "postprocess",
                    materialSpec: {
                        uuid: "",
                        classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                        name: "framePass:blit",
                        label: "framePass:blit",

                        shader: "1-1-1.miaokit.builtins:/shader/17-3_standard_postprocess.json",
                        flags: Miaoverse.RENDER_FLAGS.DRAW_ARRAYS | Miaoverse.RENDER_FLAGS.SHADING_AS_UNLIT,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },

                    frameUniforms: "C1_D1_G0",
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
                }
            ]
        },
        pipelines: {
            low: {
                deferred: false,
                rt_scale: 1.0,
                framePassName: [
                    "shadow_cast",
                    "opaque",
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
