export class Device {
    constructor(_global) {
        this._global = _global;
    }
    async Init() {
        const config = this._global.config;
        const tfdLut = this._textureFormatDescLut;
        tfdLut["r8unorm"] = { internalformat: 33321, format: 6403, type: 5121, renderable: 1, filterable: 1, bytes: 1 };
        tfdLut["r8snorm"] = { internalformat: 36756, format: 6403, type: 5120, renderable: 0, filterable: 1, bytes: 1 };
        tfdLut["r8uint"] = { internalformat: 33330, format: 36244, type: 5121, renderable: 1, filterable: 0, bytes: 1 };
        tfdLut["r8sint"] = { internalformat: 33329, format: 36244, type: 5120, renderable: 1, filterable: 0, bytes: 1 };
        tfdLut["r16uint"] = { internalformat: 33332, format: 36244, type: 5123, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["r16sint"] = { internalformat: 33331, format: 36244, type: 5122, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["r16float"] = { internalformat: 33325, format: 6403, type: 5131, renderable: 1, filterable: 1, bytes: 2 };
        tfdLut["rg8unorm"] = { internalformat: 33323, format: 33319, type: 5121, renderable: 1, filterable: 1, bytes: 2 };
        tfdLut["rg8snorm"] = { internalformat: 36757, format: 33319, type: 5120, renderable: 0, filterable: 1, bytes: 2 };
        tfdLut["rg8uint"] = { internalformat: 33336, format: 33320, type: 5121, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["rg8sint"] = { internalformat: 33335, format: 33320, type: 5120, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["r32uint"] = { internalformat: 33334, format: 36244, type: 5125, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["r32sint"] = { internalformat: 33333, format: 36244, type: 5124, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["r32float"] = { internalformat: 33326, format: 6403, type: 5126, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rg16uint"] = { internalformat: 33338, format: 33320, type: 5123, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rg16sint"] = { internalformat: 33337, format: 33320, type: 5122, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rg16float"] = { internalformat: 33327, format: 33319, type: 5131, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rgba8unorm"] = { internalformat: 32856, format: 6408, type: 5121, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rgba8snorm"] = { internalformat: 36759, format: 6408, type: 5120, renderable: 0, filterable: 1, bytes: 4 };
        tfdLut["rgba8uint"] = { internalformat: 36220, format: 36249, type: 5121, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rgba8sint"] = { internalformat: 36238, format: 36249, type: 5120, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["bgra8unorm"] = { internalformat: 32856, format: 6408, type: 5121, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rgb9e5ufloat"] = { internalformat: 35901, format: 6407, type: 35902, renderable: 0, filterable: 1, bytes: 4 };
        tfdLut["rgb10a2unorm"] = { internalformat: 32857, format: 6408, type: 33640, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rg11b10ufloat"] = { internalformat: 35898, format: 6407, type: 35899, renderable: 0, filterable: 1, bytes: 4 };
        tfdLut["rg32uint"] = { internalformat: 33340, format: 33320, type: 5125, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rg32sint"] = { internalformat: 33339, format: 33320, type: 5124, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rg32float"] = { internalformat: 33328, format: 33319, type: 5126, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rgba16uint"] = { internalformat: 36214, format: 36249, type: 5123, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rgba16sint"] = { internalformat: 36232, format: 36249, type: 5122, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rgba16float"] = { internalformat: 34842, format: 6408, type: 5131, renderable: 1, filterable: 1, bytes: 8 };
        tfdLut["rgba32uint"] = { internalformat: 36208, format: 36249, type: 5125, renderable: 1, filterable: 0, bytes: 16 };
        tfdLut["rgba32sint"] = { internalformat: 36226, format: 36249, type: 5124, renderable: 1, filterable: 0, bytes: 16 };
        tfdLut["rgba32float"] = { internalformat: 34836, format: 6408, type: 5126, renderable: 1, filterable: 0, bytes: 16 };
        tfdLut["stencil8"] = { internalformat: 36168, format: 6401, type: 5121, renderable: 1, filterable: 0, bytes: 1 };
        tfdLut["depth16unorm"] = { internalformat: 33189, format: 6402, type: 5123, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["depth24plus"] = { internalformat: 33190, format: 6402, type: 5125, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["depth24plus-stencil8"] = { internalformat: 35056, format: 34041, type: 34042, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["depth32float"] = { internalformat: 36012, format: 6402, type: 5126, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["depth32float-stencil8"] = { internalformat: 36013, format: 34041, type: 36269, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["bc1-rgba-unorm"] = null;
        tfdLut["bc3-rgba-unorm"] = null;
        tfdLut["bc4-r-unorm"] = null;
        tfdLut["bc5-rg-unorm"] = null;
        tfdLut["bc7-rgba-unorm"] = null;
        if (config.webgl) {
            return this.InitGL(config);
        }
        else {
            return this.InitGPU(config);
        }
    }
    async InitGPU(config) {
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: config.powerPreference,
            forceFallbackAdapter: false
        });
        if (!adapter) {
            this._global.Track("Device.InitGPU: GPU适配器获取失败！", 3);
            return null;
        }
        const device = await adapter.requestDevice({
            requiredFeatures: ["texture-compression-bc"],
            requiredLimits: {}
        });
        if (!device) {
            this._global.Track("Device.InitGPU: GPU设备获取失败！", 3);
            return null;
        }
        this._textureFormatDescLut["bc1-rgba-unorm"] = {
            internalformat: "bc1-rgba-unorm",
            format: 6403,
            type: 5121,
            renderable: 0,
            filterable: 1,
            bytes: 0.5,
            compressed: 2
        };
        this._textureFormatDescLut["bc3-rgba-unorm"] = {
            internalformat: "bc3-rgba-unorm",
            format: 6403,
            type: 5121,
            renderable: 0,
            filterable: 1,
            bytes: 1,
            compressed: 3
        };
        this._textureFormatDescLut["bc4-r-unorm"] = {
            internalformat: "bc4-r-unorm",
            format: 6403,
            type: 5121,
            renderable: 0,
            filterable: 1,
            bytes: 0.5,
            compressed: 4
        };
        this._textureFormatDescLut["bc5-rg-unorm"] = {
            internalformat: "bc5-rg-unorm",
            format: 6403,
            type: 5121,
            renderable: 0,
            filterable: 1,
            bytes: 0.5,
            compressed: 5
        };
        this._textureFormatDescLut["bc7-rgba-unorm"] = {
            internalformat: "bc7-rgba-unorm",
            format: 6403,
            type: 5121,
            renderable: 0,
            filterable: 1,
            bytes: 1,
            compressed: 6
        };
        this._global.ctf = 1;
        this._adapter = adapter;
        this._device = device;
        if (!config.surface && Deno) {
            config.surface = this._global.app.sdl_window.windowSurface();
        }
        if (!config.surface) {
            this._global.Track("Device.InitGPU: 程序窗口表面获取失败！", 3);
            return null;
        }
        const swapchain = config.surface.getContext("webgpu");
        if (!swapchain) {
            this._global.Track("Device.InitGPU: GPU程序上下文（交换连）获取失败！", 3);
            return null;
        }
        swapchain.configure({
            device: this._device,
            format: "bgra8unorm",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            colorSpace: config.colorSpace,
            alphaMode: config.alphaMode,
            width: config.initWidth,
            height: config.initHeight
        });
        this._swapchain = swapchain;
        this.Resize(config.initWidth, config.initHeight);
        return this;
    }
    async InitGL(config) {
        if (!config.surface) {
            this._global.Track("Device.InitGL: 程序窗口表面获取失败！", 3);
            return null;
        }
        const gl = config.surface.getContext("webgl2", {
            antialias: false,
            depth: false,
            stencil: false,
            alpha: config.alphaMode == "premultiplied",
            premultipliedAlpha: config.alphaMode == "premultiplied",
            preserveDrawingBuffer: false,
            desynchronized: true,
            powerPreference: config.powerPreference,
            failIfMajorPerformanceCaveat: false
        });
        if (!gl) {
            this._global.Track("Device.InitGL: GPU程序上下文（交换连）获取失败！", 3);
            return null;
        }
        const extensions = [
            "OES_texture_float_linear",
            "EXT_texture_filter_anisotropic",
            "EXT_color_buffer_float",
            "KHR_parallel_shader_compile",
        ];
        for (let ext of extensions) {
            if (!gl.getExtension(ext)) {
                this._global.Track("Device.InitGL: 不支持" + ext + "扩展！", 2);
            }
        }
        const s3tc = gl.getExtension("WEBGL_compressed_texture_s3tc");
        const etc = gl.getExtension("WEBGL_compressed_texture_etc");
        const astc = gl.getExtension("WEBGL_compressed_texture_astc");
        if (s3tc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 2
            };
        }
        else if (etc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: etc.COMPRESSED_RGB8_ETC2,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 0
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10
            };
        }
        if (s3tc) {
            this._textureFormatDescLut["bc3-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 3
            };
        }
        else if (etc) {
            this._textureFormatDescLut["bc3-rgba-unorm"] = {
                internalformat: etc.COMPRESSED_RGBA8_ETC2_EAC,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 1
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc3-rgba-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10
            };
        }
        if (etc) {
            this._textureFormatDescLut["bc4-r-unorm"] = {
                internalformat: etc.COMPRESSED_R11_EAC,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 20
            };
        }
        else if (s3tc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 2
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc4-r-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10
            };
        }
        if (etc) {
            this._textureFormatDescLut["bc5-rg-unorm"] = {
                internalformat: etc.COMPRESSED_RG11_EAC,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 21
            };
        }
        else if (s3tc) {
            this._textureFormatDescLut["bc5-rg-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 2
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc5-rg-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10
            };
        }
        if (s3tc) {
            this._textureFormatDescLut["bc7-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 3
            };
        }
        else if (etc) {
            this._textureFormatDescLut["bc7-rgba-unorm"] = {
                internalformat: etc.COMPRESSED_RGBA8_ETC2_EAC,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 1
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc7-rgba-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: 6403,
                type: 5121,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10
            };
        }
        this._global.ctf = (s3tc ? 1 : 0) + (etc ? 2 : 0) + (astc ? 4 : 0);
        this._adapter = {};
        this._device = new GLDevice(gl);
        this._swapchain = new GLCanvasContext(gl);
        this._swapchain.configure({
            device: this._device,
            format: "bgra8unorm",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            colorSpace: config.colorSpace,
            alphaMode: config.alphaMode,
            width: config.initWidth,
            height: config.initHeight
        });
        this.Resize(config.initWidth, config.initHeight);
        return this;
    }
    Resize(width, height) {
        if (width === undefined && height === undefined) {
            if (Deno) {
                return true;
            }
            else {
                const canvas = this._global.config.surface;
                const canvas2d = this._global.app.ui_canvas;
                width = canvas.clientWidth * this._global.config.devicePixelRatio;
                height = canvas.clientHeight * this._global.config.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                canvas2d.width = canvas.clientWidth;
                canvas2d.height = canvas.clientHeight;
            }
        }
        this._global.width = width;
        this._global.height = height;
        return width > 63 && height > 63;
    }
    CreateBuffer(classid, size, offset = 0, data = null) {
        const alignedSize = (size + 0xFF) & 0xFFFFFF00;
        let usage = 0;
        let label = "";
        if (classid === 1) {
            usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
            label = "uniform_buffer:";
        }
        else if (classid === 2) {
            usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
            label = "vertex_buffer:";
        }
        else if (classid === 3) {
            usage = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST;
            label = "index_buffer:";
        }
        else {
            this._global.Track("Device.CreateBuffer: 不支持的缓存类型resourceID=" + classid + "！", 3);
            return 0;
        }
        const id = this._buffers.freeId;
        const buffer = this._device.createBuffer({ label: label + id, size: alignedSize, usage: usage });
        if (!buffer) {
            this._global.Track("Device.CreateBuffer: GPU缓存创建失败！", 3);
            return 0;
        }
        if (data) {
            this._device.queue.writeBuffer(buffer, 0, data, offset, size);
        }
        let entry = this._buffers.list[id];
        if (entry) {
            this._buffers.freeId = entry.id;
            entry.id = id;
            entry.classid = classid;
            entry.size = alignedSize;
            entry.buffer = buffer;
            entry.refCount = 1;
        }
        else {
            this._buffers.freeId++;
            entry = this._buffers.list[id] = {
                id: id,
                classid: classid,
                size: alignedSize,
                buffer: buffer,
                refCount: 1
            };
        }
        this._buffers.usedCount += 1;
        this._buffers.usedSize += alignedSize;
        return id;
    }
    FreeBuffer(id) {
        const buffer = this._buffers.list[id];
        if (!buffer || buffer.id != id) {
            this._global.Track("Device.FreeBuffer: 缓存实例ID=" + id + "无效！", 3);
            return;
        }
        const bufferObj = buffer.buffer;
        const size = buffer.size;
        buffer.id = this._buffers.freeId;
        buffer.classid = 0;
        buffer.size = 0;
        buffer.buffer = null;
        buffer.refCount = 0;
        this._buffers.freeId = id;
        this._buffers.usedCount -= 1;
        this._buffers.usedSize -= size;
        this._destroyList.push(() => {
            bufferObj.destroy();
        });
    }
    WriteBuffer(id, bufferOffset, data, dataOffset, size) {
        const buffer = this._buffers.list[id];
        if (!buffer || buffer.id != id) {
            this._global.Track("Device.WriteBuffer: 缓存实例ID=" + id + "无效！", 3);
            return;
        }
        this._device.queue.writeBuffer(buffer.buffer, bufferOffset, data, dataOffset, size);
    }
    CreateTexture2D(width, height, depth, levelCount, format, usage) {
        const formatDesc = this._textureFormatDescLut[format];
        if (!formatDesc) {
            this._global.Track("Device.CreateTexture2D: 不支持的贴图格式format=" + format + "！", 3);
            return 0;
        }
        const id = this._textures2D.freeId;
        const texture = this._device.createTexture({
            label: "texture2D:" + id,
            size: [width, height, depth],
            mipLevelCount: levelCount,
            sampleCount: 1,
            dimension: "2d",
            format: formatDesc.compressed ? formatDesc.internalformat : format,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | usage
        });
        if (!texture) {
            this._global.Track("Device.CreateTexture2D: GPU贴图创建失败！", 3);
            return 0;
        }
        const view = texture.createView({
            dimension: 1 < depth ? "2d-array" : "2d",
            baseArrayLayer: 0,
            arrayLayerCount: depth,
            baseMipLevel: 0,
            mipLevelCount: levelCount
        });
        let entry = this._textures2D.list[id];
        if (entry) {
            this._textures2D.freeId = entry.id;
            entry.id = id;
            entry.width = width;
            entry.height = height;
            entry.depth = depth;
            entry.levelCount = levelCount;
            entry.layerSize = 0;
            entry.format = format;
            entry.texture = texture;
            entry.view = view;
            entry.refCount = 1;
        }
        else {
            this._textures2D.freeId++;
            entry = this._textures2D.list[id] = {
                id: id,
                width: width,
                height: height,
                depth: depth,
                levelCount: levelCount,
                layerSize: 0,
                format: format,
                texture: texture,
                view: view,
                refCount: 1
            };
        }
        let layerSize = width * height * formatDesc.bytes;
        for (let i = 0; i < levelCount; i++) {
            entry.layerSize += layerSize;
            layerSize *= 0.25;
        }
        this._textures2D.usedCount += 1;
        this._textures2D.usedSize += entry.layerSize * entry.depth;
        return id;
    }
    ResizeAtlas(id, layer) {
        const atlas = this._textures2D.list[id];
        if (!atlas || atlas.id != id) {
            this._global.Track("Device.ResizeAtlas: 贴图实例ID=" + id + "无效！", 3);
            return false;
        }
        let depth = layer + 1;
        if (atlas.depth < depth) {
            depth = (depth + 1) & ~1;
            const texture = this._device.createTexture({
                label: "atlas:" + id,
                size: [4096, 4096, depth],
                mipLevelCount: 1,
                sampleCount: 1,
                dimension: "2d",
                format: "rgba8unorm",
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT
            });
            if (!texture) {
                this._global.Track("Device.ResizeAtlas: GPU贴图创建失败！", 3);
                return false;
            }
            const view = texture.createView({
                dimension: "2d-array",
                baseArrayLayer: 0,
                arrayLayerCount: depth,
                baseMipLevel: 0,
                mipLevelCount: 1
            });
            if (atlas.texture) {
                const cmdEncoder = this.device.createCommandEncoder();
                cmdEncoder.copyTextureToTexture({ texture: atlas.texture, mipLevel: 0, origin: [0, 0, 0] }, { texture: texture, mipLevel: 0, origin: [0, 0, 0] }, [atlas.width, atlas.height, atlas.depth]);
                const cmdBuffer = cmdEncoder.finish();
                this.device.queue.submit([cmdBuffer]);
                this._textures2D.usedSize += atlas.layerSize * (depth - atlas.depth);
                {
                    const freeTexture = atlas.texture;
                    this._destroyList.push(() => {
                        freeTexture.destroy();
                    });
                }
                atlas.depth = depth;
                atlas.texture = texture;
                atlas.view = view;
            }
        }
        return true;
    }
    FreeTexture2D(id) {
        const texture = this._textures2D.list[id];
        if (!texture || texture.id != id) {
            this._global.Track("Device.FreeTexture2D: 贴图实例ID=" + id + "无效！", 3);
            return;
        }
        const textureObj = texture.texture;
        const size = texture.layerSize * texture.depth;
        texture.id = this._textures2D.freeId;
        texture.width = 0;
        texture.height = 0;
        texture.depth = 0;
        texture.levelCount = 0;
        texture.layerSize = 0;
        texture.format = null;
        texture.texture = null;
        texture.view = null;
        texture.refCount = 0;
        this._textures2D.freeId = id;
        this._textures2D.usedCount -= 1;
        this._textures2D.usedSize -= size;
        this._destroyList.push(() => {
            textureObj.destroy();
        });
    }
    WriteTexture2D_RAW(id, rt, data) {
        const entry = rt ? this._texturesRT.list[id] : this._textures2D.list[id];
        if (!entry || entry.id != id) {
            this._global.Track("Device.WriteTexture2D_RAW: 贴图实例ID=" + id + "无效！", 3);
            return;
        }
        if (data.data && data.dataLayout) {
            this._device.queue.writeTexture({
                texture: entry.texture,
                mipLevel: data.level,
                origin: [data.xoffset, data.yoffset, data.layer]
            }, data.data, data.dataLayout, [data.width, data.height, 1]);
        }
        else if (data.data === undefined) {
            this._device.queue.copyExternalImageToTexture({
                source: data
            }, {
                texture: entry.texture,
                mipLevel: data.level,
                origin: [data.xoffset, data.yoffset, data.layer],
            }, [data.width, data.height, 1]);
        }
    }
    WriteTexture2D_KTX2(id, data) {
        const entry = this._textures2D.list[id];
        if (!entry || entry.id != id) {
            this._global.Track("Device.WriteTexture2D_KTX2: 贴图实例ID=" + id + "无效！", 3);
            return;
        }
        for (let level = 0; level < data.levelCount; level++) {
            const level_scale = 1.0 / Math.pow(2, level);
            const level_info = data.levelInfos[level];
            const level_width = level_info.block_width * level_info.blocks_x_count;
            const level_height = level_info.block_height * level_info.blocks_y_count;
            for (let layer = 0; layer < data.depth; layer++) {
                this._device.queue.writeTexture({
                    texture: entry.texture,
                    mipLevel: data.level + level,
                    origin: [data.xoffset * level_scale, data.yoffset * level_scale, data.layer + layer],
                }, data.buffer, {
                    offset: data.dataOffset + level_info.level_data_offset,
                    bytesPerRow: level_info.bytes_per_block * level_info.blocks_x_count,
                    rowsPerImage: level_info.blocks_y_count
                }, [level_width, level_height, 1]);
            }
        }
    }
    CreateTextureRT(width, height, depth, levelCount, format, bindable, resizable) {
        const formatDesc = this._textureFormatDescLut[format];
        if (!formatDesc) {
            this._global.Track("Device.CreateTextureRT: 不支持的贴图格式format=" + format + "！", 3);
            return 0;
        }
        if (!formatDesc.renderable) {
            this._global.Track("Device.CreateTextureRT: 当前贴图格式format=" + format + "不支持用于渲染贴图！", 3);
            return 0;
        }
        const id = this._texturesRT.freeId;
        const texture = this._device.createTexture({
            label: "textureRT:" + id,
            size: [width, height, depth],
            mipLevelCount: levelCount,
            sampleCount: 1,
            dimension: "2d",
            format: format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | (bindable ? GPUTextureUsage.TEXTURE_BINDING : 0)
        });
        if (!texture) {
            this._global.Track("Device.CreateTextureRT: GPU贴图创建失败！", 3);
            return 0;
        }
        const view = bindable ? texture.createView({
            dimension: 1 < depth ? "2d-array" : "2d",
            baseArrayLayer: 0,
            arrayLayerCount: depth,
            baseMipLevel: 0,
            mipLevelCount: levelCount
        }) : null;
        let entry = this._texturesRT.list[id];
        if (entry) {
            this._texturesRT.freeId = entry.id;
            entry.id = id;
            entry.width = width;
            entry.height = height;
            entry.depth = depth;
            entry.levelCount = levelCount;
            entry.layerSize = 0;
            entry.format = format;
            entry.texture = texture;
            entry.view = view;
            entry.refCount = 1;
            entry.bindable = bindable;
            entry.resizable = resizable;
            entry.attachments = [];
        }
        else {
            this._texturesRT.freeId++;
            entry = this._texturesRT.list[id] = {
                id: id,
                width: width,
                height: height,
                depth: depth,
                levelCount: levelCount,
                layerSize: 0,
                format: format,
                texture: texture,
                view: view,
                refCount: 1,
                bindable: bindable,
                resizable: resizable,
                attachments: []
            };
        }
        let layerSize = width * height * formatDesc.bytes;
        for (let i = 0; i < levelCount; i++) {
            entry.layerSize += layerSize;
            layerSize *= 0.25;
        }
        this._texturesRT.usedCount += 1;
        this._texturesRT.usedSize += entry.layerSize * entry.depth;
        return id;
    }
    FreeTextureRT(id) {
        const texture = this._texturesRT.list[id];
        if (!texture || texture.id != id) {
            this._global.Track("Device.FreeTextureRT: 贴图实例ID=" + id + "无效！", 3);
            return;
        }
        const textureObj = texture.texture;
        const size = texture.layerSize * texture.depth;
        texture.id = this._texturesRT.freeId;
        texture.width = 0;
        texture.height = 0;
        texture.depth = 0;
        texture.levelCount = 0;
        texture.layerSize = 0;
        texture.format = null;
        texture.texture = null;
        texture.view = null;
        texture.refCount = 0;
        texture.bindable = false;
        texture.resizable = false;
        texture.attachments = [];
        this._texturesRT.freeId = id;
        this._texturesRT.usedCount -= 1;
        this._texturesRT.usedSize -= size;
        this._destroyList.push(() => {
            textureObj.destroy();
        });
    }
    GenerateSamplerFlags(desc) {
        const dict = this._samplers.dict;
        const addressModeU = dict.addressMode.indexOf(desc.addressModeU);
        const addressModeV = dict.addressMode.indexOf(desc.addressModeV);
        const addressModeW = dict.addressMode.indexOf(desc.addressModeW);
        const magFilter = dict.filterMode.indexOf(desc.magFilter);
        const minFilter = dict.filterMode.indexOf(desc.minFilter);
        const mipmapFilter = dict.filterMode.indexOf(desc.mipmapFilter);
        const maxAnisotropy = Math.max(Math.min(desc.maxAnisotropy - 1, 7), 0);
        const compareFunction = dict.compareFunction.indexOf(desc.compare);
        const lodMinClamp = Math.min(desc.lodMinClamp, 15);
        const lodMaxClamp = Math.min(desc.lodMaxClamp, 15);
        let flags = 0;
        flags |= addressModeU << 0;
        flags |= addressModeV << 2;
        flags |= addressModeW << 4;
        flags |= magFilter << 6;
        flags |= minFilter << 7;
        flags |= mipmapFilter << 8;
        flags |= maxAnisotropy << 9;
        flags |= compareFunction << 12;
        flags |= lodMinClamp << 16;
        flags |= lodMaxClamp << 20;
        return flags;
    }
    ParseSamplerFlags(flags) {
        const dict = this._samplers.dict;
        const addressModeU = (flags >> 0) & 3;
        const addressModeV = (flags >> 2) & 3;
        const addressModeW = (flags >> 4) & 3;
        const magFilter = (flags >> 6) & 1;
        const minFilter = (flags >> 7) & 1;
        const mipmapFilter = (flags >> 8) & 1;
        const maxAnisotropy = ((flags >> 9) & 7) + 1;
        const compareFunction = (flags >> 12) & 7;
        const compareDisable = (flags >> 15) & 1;
        const lodMinClamp = (flags >> 16) & 15;
        const lodMaxClamp = (flags >> 20) & 15;
        const desc = {
            addressModeU: dict.addressMode[addressModeU],
            addressModeV: dict.addressMode[addressModeV],
            addressModeW: dict.addressMode[addressModeW],
            magFilter: dict.filterMode[magFilter],
            minFilter: dict.filterMode[minFilter],
            mipmapFilter: dict.filterMode[mipmapFilter],
            maxAnisotropy: maxAnisotropy,
            compare: compareDisable ? undefined : dict.compareFunction[compareFunction],
            lodMinClamp: lodMinClamp == 0 ? undefined : lodMinClamp,
            lodMaxClamp: lodMaxClamp == 15 ? undefined : lodMaxClamp
        };
        return desc;
    }
    CreateSampler(flags) {
        let id = this._samplers.lut[flags];
        if (id) {
            this._samplers.list[id].refCount++;
            return id;
        }
        id = this._samplers.freeId;
        const desc = this.ParseSamplerFlags(flags);
        desc.label = "sampler:" + id;
        const sampler = this._device.createSampler(desc);
        if (!sampler) {
            this._global.Track("Device.CreateSampler: GPU贴图采样器创建失败！", 3);
            return 0;
        }
        let entry = this._samplers.list[id];
        if (entry) {
            this._samplers.freeId = entry.id;
            entry.id = id;
            entry.flags = flags;
            entry.desc = desc;
            entry.sampler = sampler;
            entry.refCount = 1;
        }
        else {
            this._samplers.freeId++;
            entry = this._samplers.list[id] = {
                id: id,
                flags: flags,
                desc: desc,
                sampler: sampler,
                refCount: 1
            };
        }
        this._samplers.lut[flags] = id;
        this._samplers.usedCount += 1;
        return id;
    }
    FreeSampler(id) {
        const sampler = this._samplers.list[id];
        if (!sampler || sampler.id != id) {
            this._global.Track("Device.FreeTexture2D: 贴图实例ID=" + id + "无效！", 3);
            return;
        }
        const samplerObj = sampler.sampler;
        const flags = sampler.flags;
        sampler.id = this._samplers.freeId;
        sampler.flags = 0;
        sampler.desc = null;
        sampler.sampler = null;
        sampler.refCount = 0;
        this._samplers.freeId = id;
        this._samplers.usedCount -= 1;
        this._samplers.lut[flags] = undefined;
    }
    CreateCommandEncoder() {
        return this._device.createCommandEncoder();
    }
    Submit(commandBuffers, onDone) {
        this._device.queue.submit(commandBuffers);
        this._device.queue.onSubmittedWorkDone().then(onDone).catch(onDone);
    }
    GetBuffer(id) {
        return this._buffers.list[id];
    }
    GetTexture2D(id) {
        return this._textures2D.list[id];
    }
    GetTextureRT(id) {
        return this._texturesRT.list[id];
    }
    GetSampler(id) {
        return this._samplers.list[id];
    }
    get device() {
        return this._device;
    }
    _global;
    _adapter;
    _device;
    _swapchain;
    _textureFormatDescLut = {};
    _buffers = {
        freeId: 1,
        usedCount: 0,
        usedSize: 0,
        list: [null]
    };
    _textures2D = {
        freeId: 1,
        usedCount: 0,
        usedSize: 0,
        list: [null]
    };
    _texturesRT = {
        freeId: 1,
        usedCount: 0,
        usedSize: 0,
        list: [null]
    };
    _samplers = {
        freeId: 1,
        usedCount: 0,
        list: [null],
        lut: {},
        dict: {
            addressMode: ["clamp-to-edge", "repeat", "mirror-repeat"],
            filterMode: ["nearest", "linear"],
            compareFunction: ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always", undefined],
        }
    };
    _bindings = {
        freeId: 1,
        usedCount: 0,
        list: [null]
    };
    _vertexLayouts = {
        freeId: 1,
        usedCount: 0,
        list: [null]
    };
    _destroyList = [];
}
class GLDevice {
    constructor(gl) {
        this._gl = gl;
        this._gl.enable(2929);
        this._gl.enable(2884);
    }
    _gl;
}
class GLCanvasContext {
    constructor(gl) {
        this._gl = gl;
    }
    _gl;
}
//# sourceMappingURL=device.js.map