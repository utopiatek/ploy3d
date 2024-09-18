export class Assembly {
    constructor(_global) {
        this._global = _global;
    }
    async Init() {
        const device = this._global.device;
        const context = this._global.context;
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
        for (let g0 of frameUniformsList) {
            const colorRT = renderTargetsLut[g0.colorRT]?.id;
            const depthRT = renderTargetsLut[g0.depthRT]?.id;
            const gbRT = renderTargetsLut[g0.gbRT]?.id;
            g0.g0 = await resources.Material.CreateFrameUniforms(colorRT, depthRT, gbRT, resources.Texture.defaultAtlas);
            frameUniformsLut[g0.name] = g0;
        }
        {
            const PreExecute = (variant, queue) => {
                let rt_scale = 1.0;
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
                    }
                }
                else {
                }
            };
            const postprocessG3 = (() => {
                const list = [];
                const default2D = resources.Texture.default2D;
                const defaultView2D = device.GetTexture2D(default2D.internalID).view;
                const entries = [
                    {
                        binding: 0,
                        resource: defaultView2D
                    }
                ];
                return (framePass, view) => {
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
    GetFramePass(key) {
        return this._config.framePass.lut[key];
    }
    GetFramePassList(key) {
        return this._config.pipelines[key];
    }
    GetFrameUniforms(key) {
        return this._config.frameUniforms.lut[key]?.g0;
    }
    async GetObjectInScreen(x, y) {
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
                    label: "early_z",
                    mode: "shading",
                    shaderMacro: {
                        SHADING_SKIP: 1,
                        SHADING_EARLYZ: 1,
                        SHADING_DITHERING_TRANSPARENT: 1
                    },
                    frameUniforms: "C0_D0",
                    queueRange: 3,
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: 8,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C1_D1_G0",
                    queueRange: 0,
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: 8,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C1_D1_G0",
                    queueRange: 0,
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: 8,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C1_D1_G0",
                    queueRange: 0,
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: 8,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C0_D1_G0",
                    queueRange: 0,
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: 8,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C0_D1_G0",
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
                        classid: 32,
                        name: "framePass:blit",
                        label: "framePass:blit",
                        shader: "1-1-1.miaokit.builtins:/shader/postprocess_ulit/17-15_postprocess_ulit.json",
                        flags: 8,
                        properties: {
                            textures: {},
                            vectors: {}
                        }
                    },
                    frameUniforms: "C1_D1_G0",
                    queueRange: 0,
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
    };
}
//# sourceMappingURL=assembly.js.map