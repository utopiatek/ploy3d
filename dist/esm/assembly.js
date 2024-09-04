export class Assembly {
    constructor(_global) {
        this._global = _global;
    }
    async Init() {
        const device = this._global.device;
        const resources = this._global.resources;
        const rtWidth = this._config.renderTargets.width;
        const rtHeight = this._config.renderTargets.height;
        const renderTargetsList = this._config.renderTargets.list;
        const renderTargetsLut = this._config.renderTargets.lut = {};
        const frameUniformsList = this._config.frameUniforms.list;
        const frameUniformsLut = this._config.frameUniforms.lut = {};
        const framePassList = this._config.framePass.list;
        const framePassLut = this._config.framePass.lut = {};
        const pipelineLut = this._config.pipelines;
        for (let rt of renderTargetsList) {
            rt.id = device.CreateTextureRT(rtWidth, rtHeight, rt.layerCount, rt.levelCount, rt.format, true, false);
            renderTargetsLut[rt.name] = rt;
        }
        for (let g0 of frameUniformsList) {
            const colorRT = renderTargetsLut[g0.colorRT]?.id;
            const depthRT = renderTargetsLut[g0.depthRT]?.id;
            const gbRT = renderTargetsLut[g0.gbRT]?.id;
            g0.g0 = await resources.Material.CreateFrameUniforms(colorRT, depthRT, gbRT, resources.Texture.defaultAtlas);
            frameUniformsLut[g0.name] = g0;
        }
        {
            const PreExecute = (variant, queue) => {
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
            const Execute = (variant, queue) => {
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
                    }
                }
                else {
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
            const dfg_ab = await resources.Load_file("arrayBuffer", dfg_cfg.uri, true);
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
    GetFramePassList(key) {
        return this._config.pipelines[key];
    }
    GetFrameUniforms(key) {
        return this._config.frameUniforms.lut[key]?.g0;
    }
    get default_iblSpecular() {
        const id = this._config.ibl.specular.texture.internalID;
        const texture = this._global.device.GetTexture2D(id);
        return texture.view;
    }
    _global;
    _config = {
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
                    gbRT: "G0"
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
                    queueRange: 3,
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
                    queueRange: 1,
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
                    queueRange: 1,
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
                    queueRange: 0,
                    rect: [0.25, 0.25, 0.25, 0.25],
                    colorAttachments: [],
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
                    queueRange: 0,
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
                    queueRange: 0,
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
                    queueRange: 0,
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
                    queueRange: 0,
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
                    queueRange: 1,
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
                    queueRange: 2,
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
                    queueRange: 2,
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
                    queueRange: 0,
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
                    queueRange: 0,
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/17-3_standard_postprocess.json",
                        flags: 8 | 16777216,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C1_D1_G0",
                    queueRange: 0,
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
    };
}
//# sourceMappingURL=assembly.js.map