import * as Miaoverse from "./mod.js"

/** GPU虚拟设备接口。 */
export class Device {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 初始化GPU虚拟设备接口。
     * @returns 返回GPU虚拟设备接口。
     */
    public async Init() {
        const config = this._global.config;
        const tfdLut = this._textureFormatDescLut;

        // ============================------------------------------------

        tfdLut["r8unorm"] = { internalformat: GL_const.R8, format: GL_const.RED, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 1, bytes: 1 };
        tfdLut["r8snorm"] = { internalformat: GL_const.R8_SNORM, format: GL_const.RED, type: GL_const.BYTE, renderable: 0, filterable: 1, bytes: 1 };
        tfdLut["r8uint"] = { internalformat: GL_const.R8UI, format: GL_const.RED_INTEGER, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 0, bytes: 1 };
        tfdLut["r8sint"] = { internalformat: GL_const.R8I, format: GL_const.RED_INTEGER, type: GL_const.BYTE, renderable: 1, filterable: 0, bytes: 1 };

        tfdLut["r16uint"] = { internalformat: GL_const.R16UI, format: GL_const.RED_INTEGER, type: GL_const.UNSIGNED_SHORT, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["r16sint"] = { internalformat: GL_const.R16I, format: GL_const.RED_INTEGER, type: GL_const.SHORT, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["r16float"] = { internalformat: GL_const.R16F, format: GL_const.RED, type: GL_const.HALF_FLOAT, renderable: 1, filterable: 1, bytes: 2 };


        tfdLut["rg8unorm"] = { internalformat: GL_const.RG8, format: GL_const.RG, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 1, bytes: 2 };
        tfdLut["rg8snorm"] = { internalformat: GL_const.RG8_SNORM, format: GL_const.RG, type: GL_const.BYTE, renderable: 0, filterable: 1, bytes: 2 };
        tfdLut["rg8uint"] = { internalformat: GL_const.RG8UI, format: GL_const.RG_INTEGER, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["rg8sint"] = { internalformat: GL_const.RG8I, format: GL_const.RG_INTEGER, type: GL_const.BYTE, renderable: 1, filterable: 0, bytes: 2 };

        tfdLut["r32uint"] = { internalformat: GL_const.R32UI, format: GL_const.RED_INTEGER, type: GL_const.UNSIGNED_INT, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["r32sint"] = { internalformat: GL_const.R32I, format: GL_const.RED_INTEGER, type: GL_const.INT, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["r32float"] = { internalformat: GL_const.R32F, format: GL_const.RED, type: GL_const.FLOAT, renderable: 1, filterable: 0, bytes: 4 };

        tfdLut["rg16uint"] = { internalformat: GL_const.RG16UI, format: GL_const.RG_INTEGER, type: GL_const.UNSIGNED_SHORT, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rg16sint"] = { internalformat: GL_const.RG16I, format: GL_const.RG_INTEGER, type: GL_const.SHORT, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rg16float"] = { internalformat: GL_const.RG16F, format: GL_const.RG, type: GL_const.HALF_FLOAT, renderable: 1, filterable: 1, bytes: 4 };

        tfdLut["rgba8unorm"] = { internalformat: GL_const.RGBA8, format: GL_const.RGBA, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rgba8snorm"] = { internalformat: GL_const.RGBA8_SNORM, format: GL_const.RGBA, type: GL_const.BYTE, renderable: 0, filterable: 1, bytes: 4 };
        tfdLut["rgba8uint"] = { internalformat: GL_const.RGBA8UI, format: GL_const.RGBA_INTEGER, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["rgba8sint"] = { internalformat: GL_const.RGBA8I, format: GL_const.RGBA_INTEGER, type: GL_const.BYTE, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["bgra8unorm"] = { internalformat: GL_const.RGBA8, format: GL_const.RGBA, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rgb9e5ufloat"] = { internalformat: GL_const.RGB9_E5, format: GL_const.RGB, type: GL_const.UNSIGNED_INT_5_9_9_9_REV, renderable: 0, filterable: 1, bytes: 4 };
        tfdLut["rgb10a2unorm"] = { internalformat: GL_const.RGB10_A2, format: GL_const.RGBA, type: GL_const.UNSIGNED_INT_2_10_10_10_REV, renderable: 1, filterable: 1, bytes: 4 };
        tfdLut["rg11b10ufloat"] = { internalformat: GL_const.R11F_G11F_B10F, format: GL_const.RGB, type: GL_const.UNSIGNED_INT_10F_11F_11F_REV, renderable: 0, filterable: 1, bytes: 4 };

        tfdLut["rg32uint"] = { internalformat: GL_const.RG32UI, format: GL_const.RG_INTEGER, type: GL_const.UNSIGNED_INT, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rg32sint"] = { internalformat: GL_const.RG32I, format: GL_const.RG_INTEGER, type: GL_const.INT, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rg32float"] = { internalformat: GL_const.RG32F, format: GL_const.RG, type: GL_const.FLOAT, renderable: 1, filterable: 0, bytes: 8 };

        tfdLut["rgba16uint"] = { internalformat: GL_const.RGBA16UI, format: GL_const.RGBA_INTEGER, type: GL_const.UNSIGNED_SHORT, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rgba16sint"] = { internalformat: GL_const.RGBA16I, format: GL_const.RGBA_INTEGER, type: GL_const.SHORT, renderable: 1, filterable: 0, bytes: 8 };
        tfdLut["rgba16float"] = { internalformat: GL_const.RGBA16F, format: GL_const.RGBA, type: GL_const.HALF_FLOAT, renderable: 1, filterable: 1, bytes: 8 };

        tfdLut["rgba32uint"] = { internalformat: GL_const.RGBA32UI, format: GL_const.RGBA_INTEGER, type: GL_const.UNSIGNED_INT, renderable: 1, filterable: 0, bytes: 16 };
        tfdLut["rgba32sint"] = { internalformat: GL_const.RGBA32I, format: GL_const.RGBA_INTEGER, type: GL_const.INT, renderable: 1, filterable: 0, bytes: 16 };
        tfdLut["rgba32float"] = { internalformat: GL_const.RGBA32F, format: GL_const.RGBA, type: GL_const.FLOAT, renderable: 1, filterable: 0, bytes: 16 };

        tfdLut["stencil8"] = { internalformat: GL_const.STENCIL_INDEX8, format: GL_const.STENCIL_INDEX, type: GL_const.UNSIGNED_BYTE, renderable: 1, filterable: 0, bytes: 1 };

        tfdLut["depth16unorm"] = { internalformat: GL_const.DEPTH_COMPONENT16, format: GL_const.DEPTH_COMPONENT, type: GL_const.UNSIGNED_SHORT, renderable: 1, filterable: 0, bytes: 2 };
        tfdLut["depth24plus"] = { internalformat: GL_const.DEPTH_COMPONENT24, format: GL_const.DEPTH_COMPONENT, type: GL_const.UNSIGNED_INT, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["depth24plus-stencil8"] = { internalformat: GL_const.DEPTH24_STENCIL8, format: GL_const.DEPTH_STENCIL, type: GL_const.UNSIGNED_INT_24_8, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["depth32float"] = { internalformat: GL_const.DEPTH_COMPONENT32F, format: GL_const.DEPTH_COMPONENT, type: GL_const.FLOAT, renderable: 1, filterable: 0, bytes: 4 };
        tfdLut["depth32float-stencil8"] = { internalformat: GL_const.DEPTH32F_STENCIL8, format: GL_const.DEPTH_STENCIL, type: GL_const.FLOAT_32_UNSIGNED_INT_24_8_REV, renderable: 1, filterable: 0, bytes: 8 };

        /** BC1_RGB(BC1,DXT1)：用于RGB纹理，没有A通道，每个4x4像素块使用8字节。适合颜色变化不是很复杂的纹理。 */
        tfdLut["bc1-rgba-unorm"] = null;
        /** BC3_RGBA(BC3,DXT5)：用于RGBA纹理，提供8位的A通道，每个4x4像素块使用16字节。适合需要更平滑alpha渐变的纹理。 */
        tfdLut["bc3-rgba-unorm"] = null;
        /** BC4_R：用于单通道纹理，如灰度图，每个4x4像素块使用8字节。 */
        tfdLut["bc4-r-unorm"] = null;
        /** BC5_RG：用于双通道纹理，如法线贴图，每个4x4像素块使用16字节。 */
        tfdLut["bc5-rg-unorm"] = null;
        /** BC7_RGBA：提供高质量的RGBA纹理压缩，每个4x4像素块使用16字节，支持多种编码模式，适用于广泛的纹理类型。 */
        tfdLut["bc7-rgba-unorm"] = null;

        // ASTC只有1种格式，始终使用BC3级别的格式
        // ETC带透明通道解压失败，我们需要转换为PNG

        // ============================------------------------------------

        if (config.webgl) {
            return this.InitGL(config);
        }
        else {
            return this.InitGPU(config);
        }
    }

    /**
     * 初始化GPU设备。
     * @param config 引擎配置。
     * @returns 返回GPU虚拟设备接口。
     */
    protected async InitGPU(config: Miaoverse.Ploy3D["config"]) {
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

        // ======================--------------------------------

        this._textureFormatDescLut["bc1-rgba-unorm"] = {
            internalformat: "bc1-rgba-unorm" as any,
            format: GL_const.RED,
            type: GL_const.UNSIGNED_BYTE,
            renderable: 0,
            filterable: 1,
            bytes: 0.5,
            compressed: 2/*Basis.cTFBC1_RGB*/
        };

        this._textureFormatDescLut["bc3-rgba-unorm"] = {
            internalformat: "bc3-rgba-unorm" as any,
            format: GL_const.RED,
            type: GL_const.UNSIGNED_BYTE,
            renderable: 0,
            filterable: 1,
            bytes: 1,
            compressed: 3/*Basis.cTFBC3_RGBA*/
        };

        this._textureFormatDescLut["bc4-r-unorm"] = {
            internalformat: "bc4-r-unorm" as any,
            format: GL_const.RED,
            type: GL_const.UNSIGNED_BYTE,
            renderable: 0,
            filterable: 1,
            bytes: 0.5,
            compressed: 4/*Basis.cTFBC4_R*/
        };

        this._textureFormatDescLut["bc5-rg-unorm"] = {
            internalformat: "bc5-rg-unorm" as any,
            format: GL_const.RED,
            type: GL_const.UNSIGNED_BYTE,
            renderable: 0,
            filterable: 1,
            bytes: 0.5,
            compressed: 5/*Basis.cTFBC5_RG*/
        };

        this._textureFormatDescLut["bc7-rgba-unorm"] = {
            internalformat: "bc7-rgba-unorm" as any,
            format: GL_const.RED,
            type: GL_const.UNSIGNED_BYTE,
            renderable: 0,
            filterable: 1,
            bytes: 1,
            compressed: 6/*Basis.cTFBC7_RGBA*/
        };

        this._global.ctf = 1;

        // ======================--------------------------------

        this._adapter = adapter;
        this._device = device;

        // 获取GPU适配器后才能获取SDL2窗口表面，这应该是DENO的一个BUG
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

        // 仅第一次设置生效，后续自动响应画布大小变化
        swapchain.configure({
            device: this._device,
            format: "bgra8unorm",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            colorSpace: config.colorSpace,
            alphaMode: config.alphaMode,
            width: config.initWidth,
            height: config.initHeight
        } as any);

        this._swapchain = swapchain;

        // 设置渲染目标大小
        this.Resize(config.initWidth, config.initHeight);

        return this;
    }

    /**
     * 初始化GL设备。
     * @param config 引擎配置。
     * @returns 返回GL虚拟设备接口。
     */
    protected async InitGL(config: Miaoverse.Ploy3D["config"]) {

        if (!config.surface) {
            this._global.Track("Device.InitGL: 程序窗口表面获取失败！", 3);
            return null;
        }

        const gl = (config.surface as HTMLCanvasElement).getContext("webgl2", {
            // bindFramebuffer无法将非多重采样目标拷贝到多重采样目标
            antialias: false,
            // 画布仅用于最终拷贝呈现
            depth: false,
            // 画布仅用于最终拷贝呈现
            stencil: false,
            // 是否启用半透明表面
            alpha: config.alphaMode == "premultiplied",
            // 是否启用预乘半透明表面
            premultipliedAlpha: config.alphaMode == "premultiplied",
            // 如果为真，该缓存内容不会被自动清除，除非手动清除或者被覆盖
            preserveDrawingBuffer: false,
            // Chrome支持的低延时渲染上下文
            desynchronized: true,
            // 选择高性能还是低功耗设备
            powerPreference: config.powerPreference,
            // 低性能环境上下文创建将失败
            failIfMajorPerformanceCaveat: false
        });

        if (!gl) {
            this._global.Track("Device.InitGL: GPU程序上下文（交换连）获取失败！", 3);
            return null;
        }

        const extensions = [
            "OES_texture_float_linear",			// 支持线性过滤浮点型纹理
            "EXT_texture_filter_anisotropic",	// 支持各异向性过滤纹理
            "EXT_color_buffer_float",			// 支持浮点型颜色缓存
            "KHR_parallel_shader_compile",		// 着色器程序链接状态异步查询
        ];

        for (let ext of extensions) {
            if (!gl.getExtension(ext)) {
                this._global.Track("Device.InitGL: 不支持" + ext + "扩展！", 2);
            }
        }

        // ======================--------------------------------

        const s3tc = gl.getExtension("WEBGL_compressed_texture_s3tc");
        const etc = gl.getExtension("WEBGL_compressed_texture_etc");
        const astc = gl.getExtension("WEBGL_compressed_texture_astc");

        // "bc1-rgba-unorm"

        if (s3tc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 2/*Basis.cTFBC1_RGB*/
            };
        }
        else if (etc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: etc.COMPRESSED_RGB8_ETC2,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 0/*Basis.cTFETC1_RGB*/
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10/*Basis.cTFASTC_4x4_RGBA*/
            };
        }

        // "bc3-rgba-unorm"

        if (s3tc) {
            this._textureFormatDescLut["bc3-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 3/*Basis.cTFBC3_RGBA*/
            };
        }
        else if (etc) {
            this._textureFormatDescLut["bc3-rgba-unorm"] = {
                internalformat: etc.COMPRESSED_RGBA8_ETC2_EAC,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 1/*Basis.cTFETC2_RGBA*/
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc3-rgba-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10/*Basis.cTFASTC_4x4_RGBA*/
            };
        }

        // "bc4-r-unorm"

        if (etc) {
            this._textureFormatDescLut["bc4-r-unorm"] = {
                internalformat: etc.COMPRESSED_R11_EAC,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 20/*Basis.cTFETC2_EAC_R11*/
            };
        }
        else if (s3tc) {
            this._textureFormatDescLut["bc1-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 2/*Basis.cTFBC1_RGB*/
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc4-r-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10/*Basis.cTFASTC_4x4_RGBA*/
            };
        }

        // "bc5-rg-unorm"

        if (etc) {
            this._textureFormatDescLut["bc5-rg-unorm"] = {
                internalformat: etc.COMPRESSED_RG11_EAC,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 21/*Basis.cTFETC2_EAC_RG11*/
            };
        }
        else if (s3tc) {
            this._textureFormatDescLut["bc5-rg-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 0.5,
                compressed: 2/*Basis.cTFBC1_RGB*/
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc5-rg-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10/*Basis.cTFASTC_4x4_RGBA*/
            };
        }

        // "bc7-rgba-unorm"

        if (s3tc) {
            this._textureFormatDescLut["bc7-rgba-unorm"] = {
                internalformat: s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 3/*Basis.cTFBC3_RGBA*/
            };
        }
        else if (etc) {
            this._textureFormatDescLut["bc7-rgba-unorm"] = {
                internalformat: etc.COMPRESSED_RGBA8_ETC2_EAC,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 1/*Basis.cTFETC2_RGBA*/
            };
        }
        else if (astc) {
            this._textureFormatDescLut["bc7-rgba-unorm"] = {
                internalformat: astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                format: GL_const.RED,
                type: GL_const.UNSIGNED_BYTE,
                renderable: 0,
                filterable: 1,
                bytes: 1,
                compressed: 10/*Basis.cTFASTC_4x4_RGBA*/
            };
        }

        this._global.ctf = (s3tc ? 1 : 0) + (etc ? 2 : 0) + (astc ? 4 : 0);

        // ======================--------------------------------

        this._adapter = {} as any;
        this._device = new GLDevice(gl) as any;
        this._swapchain = new GLCanvasContext(gl) as any;

        // 仅第一次设置生效，后续自动响应画布大小变化
        this._swapchain.configure({
            device: this._device,
            format: "bgra8unorm",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            colorSpace: config.colorSpace,
            alphaMode: config.alphaMode,
            width: config.initWidth,
            height: config.initHeight
        } as any);

        // 设置渲染目标大小
        this.Resize(config.initWidth, config.initHeight);

        return this;
    }

    /**
     * 重设渲染目标大小。
     * @param width 宽度。
     * @param height 高度。
     * @returns 画布过小将返回假。
     */
    public Resize(width?: number, height?: number) {
        if (width === undefined && height === undefined) {
            if (Deno) {
                // SDL环境下不能缩放窗口，或者应当在外部处理缩放逻辑
                return true;
            }
            else {
                const canvas = this._global.config.surface as HTMLCanvasElement;
                const canvas2d = this._global.app.ui_canvas;

                width = canvas.clientWidth * this._global.config.devicePixelRatio;
                height = canvas.clientHeight * this._global.config.devicePixelRatio;

                canvas.width = width;
                canvas.height = height;

                // 保持2D画布基于物理像素
                canvas2d.width = canvas.clientWidth;
                canvas2d.height = canvas.clientHeight;
            }
        }

        this._global.width = width;
        this._global.height = height;

        return width > 63 && height > 63;
    }

    /**
     * 创建缓存实例。
     * @param classid 缓存类型【CLASSID】。
     * @param size 缓存大小。
     * @param offset 初始化数据偏移。
     * @param data 初始化数据。
     * @returns 返回缓存ID。
     */
    public CreateBuffer(classid: number, size: number, offset: number = 0, data: ArrayBuffer = null) {
        // 缓存大小进行256字节对齐
        const alignedSize = (size + 0xFF) & 0xFFFFFF00;

        let usage = 0;
        let label = "";

        if (classid === Miaoverse.CLASSID.GPU_UNIFORM_BUFFER) {
            usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
            label = "uniform_buffer:";
        }
        else if (classid === Miaoverse.CLASSID.GPU_VERTEX_BUFFER) {
            usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
            label = "vertex_buffer:";
        }
        else if (classid === Miaoverse.CLASSID.GPU_INDEX_BUFFER) {
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
            this._device.queue.writeBuffer(
                buffer,
                0,
                data,
                offset,
                size
            );
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

    /**
     * 释放缓存实例。
     * @param id 缓存实例ID。
     */
    public FreeBuffer(id: number) {
        const buffer = this._buffers.list[id];
        if (!buffer || buffer.id != id) {
            this._global.Track("Device.FreeBuffer: 缓存实例ID=" + id + "无效！", 3);
            return;
        }

        const bufferObj = buffer.buffer;
        const size = buffer.size;

        buffer.id = this._buffers.freeId;
        buffer.classid = Miaoverse.CLASSID.INVALID;
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

    /**
     * 写入缓存数据。
     * @param id 缓存实例ID。
     * @param bufferOffset 缓存写入偏移。
     * @param data 数据源。
     * @param dataOffset 数据源偏移。
     * @param size 写入大小。
     */
    public WriteBuffer(id: number, bufferOffset: number, data: BufferSource | SharedArrayBuffer, dataOffset: number, size: number) {
        const buffer = this._buffers.list[id];
        if (!buffer || buffer.id != id) {
            this._global.Track("Device.WriteBuffer: 缓存实例ID=" + id + "无效！", 3);
            return;
        }

        this._device.queue.writeBuffer(
            buffer.buffer,
            bufferOffset,
            data,
            dataOffset,
            size
        );
    }

    /**
     * 创建2D贴图实例。
     * @param width 贴图宽度。
     * @param height 贴图高度。
     * @param depth 贴图数组层数。
     * @param levelCount 贴图LOD级别数。
     * @param format 贴图像素格式。
     * @returns 返回贴图实例ID。
     */
    public CreateTexture2D(width: number, height: number, depth: number, levelCount: number, format: GLTextureFormat, usage?: number) {
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
            format: formatDesc.compressed ? formatDesc.internalformat as any : format,
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

    /**
     * 扩展纹理数组容量。
     * @param id 贴图实例ID。
     * @param layer 确保数组容量包含指定图层。
     * @returns 返回扩展是否成功。
     */
    public ResizeAtlas(id: number, layer: number) {
        const atlas = this._textures2D.list[id];
        if (!atlas || atlas.id != id) {
            this._global.Track("Device.ResizeAtlas: 贴图实例ID=" + id + "无效！", 3);
            return false;
        }

        // 参数指定的是层索引非层数
        let depth = layer + 1;

        if (atlas.depth < depth) {
            // 初始分配2层，每次增加2层
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

            // 我们需要立刻完成拷贝操作，因为后续要写入新的贴图数据，并且可能再次扩展，所以我们不使用队列来拷贝
            if (atlas.texture) {
                // 注意：压缩格式图集无法通过FBO进行拷贝！

                const cmdEncoder = this.device.createCommandEncoder();

                cmdEncoder.copyTextureToTexture(
                    { texture: atlas.texture, mipLevel: 0, origin: [0, 0, 0] },
                    { texture: texture, mipLevel: 0, origin: [0, 0, 0] },
                    [atlas.width, atlas.height, atlas.depth]);

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

            console.info("ResizeAtlas: ", atlas.depth);
        }

        return true;
    }

    /**
     * 释放贴图实例。
     * @param id 贴图实例ID。
     */
    public FreeTexture2D(id: number) {
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

    /**
     * 写入2D贴图或渲染贴图数据。
     * @param id 2D贴图或渲染贴图实例ID。
     * @param rt 是否为渲染贴图。
     * @param data 贴图数据源。
     */
    public WriteTexture2D_RAW(id: number, rt: boolean, data: GLTextureSource) {
        const entry = rt ? this._texturesRT.list[id] : this._textures2D.list[id];
        if (!entry || entry.id != id) {
            this._global.Track("Device.WriteTexture2D_RAW: 贴图实例ID=" + id + "无效！", 3);
            return;
        }

        if (data.data && data.dataLayout) {
            this._device.queue.writeTexture(
                {
                    texture: entry.texture,
                    mipLevel: data.level,
                    origin: [data.xoffset, data.yoffset, data.layer]
                },
                data.data,
                data.dataLayout,
                [data.width, data.height, 1]
            );
        }
        else if (data.data === undefined) {
            this._device.queue.copyExternalImageToTexture(
                {
                    source: data as ImageBitmap
                },
                {
                    texture: entry.texture,
                    mipLevel: data.level,
                    origin: [data.xoffset, data.yoffset, data.layer],
                },
                [data.width, data.height, 1]
            );
        }
    }

    /**
     * 写入2D贴图数据。
     * @param id 2D贴图实例ID。
     * @param data 贴图数据源。
     */
    public WriteTexture2D_KTX2(id: number, data: GLTextureSource_KTX2) {
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

            // 注意，此处count == 1 && faces == 1
            for (let layer = 0; layer < data.depth; layer++) {

                this._device.queue.writeTexture(
                    {
                        texture: entry.texture,
                        mipLevel: data.level + level,
                        origin: [data.xoffset * level_scale, data.yoffset * level_scale, data.layer + layer],
                    },
                    data.buffer,
                    {
                        offset: data.dataOffset + level_info.level_data_offset,
                        bytesPerRow: level_info.bytes_per_block * level_info.blocks_x_count,
                        rowsPerImage: level_info.blocks_y_count
                    },
                    [level_width, level_height, 1]
                );
            }
        }
    }

    /**
     * 创建渲染贴图实例。
     * @param width 贴图宽度。
     * @param height 贴图高度。
     * @param depth 贴图数组层数。
     * @param levelCount 贴图LOD级别数。
     * @param format 贴图像素格式。
     * @param bindable 是否可以作为绑定资源。
     * @param resizable 是否可重设大小。
     * @returns 返回贴图实例ID。
     */
    public CreateTextureRT(width: number, height: number, depth: number, levelCount: number, format: GLTextureFormat, bindable: boolean, resizable: boolean) {
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
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST | (bindable ? GPUTextureUsage.TEXTURE_BINDING : 0)
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

    /**
     * 释放贴图实例。
     * @param id 贴图实例ID。
     */
    public FreeTextureRT(id: number) {
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

    /**
     * 根据贴图采样器描述符生成标识符。
     * @param desc 贴图采样器描述符。
     * @returns 返回采样器标识符。
     */
    public GenerateSamplerFlags(desc: GPUSamplerDescriptor) {
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

    /**
     * 解析贴图采样器标识符为贴图采样器描述符。
     * @param flags 贴图采样器标识符。
     * @returns 返回贴图采样器描述符。
     */
    public ParseSamplerFlags(flags: number) {
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

        const desc: GPUSamplerDescriptor = {
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

    /**
     * 创建贴图采样器实例。
     * @param flags 采样器标识符。
     * @returns 返回采样器实例ID。
     */
    public CreateSampler(flags: number) {
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

    /**
     * 释放贴图采样器实例。
     * @param id 贴图采样器实例ID。
     */
    public FreeSampler(id: number) {
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
        /*
        this._destroyList.push(() => {
            samplerObj.destroy();
        });
        */
    }

    /**
     * 获取缓存实例。
     * @param id 缓存实例ID。
     * @returns 返回缓存实例。
     */
    public GetBuffer(id: number) {
        return this._buffers.list[id];
    }

    /**
     * 获取2D贴图实例。
     * @param id 贴图实例ID。
     * @returns 返回贴图实例。
     */
    public GetTexture2D(id: number) {
        return this._textures2D.list[id];
    }

    /**
     * 获取渲染贴图实例。
     * @param id 贴图实例ID。
     * @returns 返回贴图实例。
     */
    public GetTextureRT(id: number) {
        return this._texturesRT.list[id];
    }

    /**
     * 获取渲染贴图附件。
     * @param id 贴图实例ID。
     * @param layer 图层。
     * @param level LOD级别。
     * @returns 返回渲染贴图视图。
     */
    public GetRenderTextureAttachment(id: number, layer: number, level: number) {
        const texture = this._texturesRT.list[id];
        if (!texture) {
            return null;
        }

        let levels = texture.attachments[layer];
        if (!levels) {
            levels = texture.attachments[layer] = [];
        }

        let view = levels[level];
        if (!view) {
            view = levels[level] = texture.texture.createView({
                baseArrayLayer: layer,
                arrayLayerCount: 1,
                baseMipLevel: level,
                mipLevelCount: 1,
                dimension: "2d",
            });
        }

        return view;
    }

    /**
     * 获取贴图采样器实例。
     * @param id 贴图采样器实例ID。
     * @returns 返回贴图采样器实例。
     */
    public GetSampler(id: number) {
        return this._samplers.list[id];
    }

    /** GPU设备，管理资源和指令。 */
    public get device() {
        return this._device;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** GPU适配器。 */
    private _adapter: GPUAdapter;
    /** GPU设备，管理资源和指令。 */
    private _device: GPUDevice;
    /** 窗口表面关联的交换链，提供渲染目标和提交画面指令。 */
    private _swapchain: GPUCanvasContext;
    /** 贴图像素格式描述查找表。 */
    private _textureFormatDescLut: Record<GLTextureFormat, GLTextureFormatDesc> = {} as any;

    /** 缓存实例容器。 */
    private _buffers = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 当前实例总大小。 */
        usedSize: 0,
        /** 缓存实例容器。 */
        list: [null] as {
            /** 缓存ID。 */
            id: number;
            /** 缓存类型【CLASSID】。 */
            classid: number;
            /** 缓存大小，不可扩容。 */
            size: number;
            /** 缓存对象。 */
            buffer: GPUBuffer;
            /** 缓存引用计数。 */
            refCount: number;
        }[]
    };

    /** 2D贴图实例容器。 */
    private _textures2D = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 当前实例总大小。 */
        usedSize: 0,
        /** 贴图实例容器。 */
        list: [null] as {
            /** 贴图ID。 */
            id: number;
            /** 贴图宽度。 */
            width: number;
            /** 贴图高度。 */
            height: number;
            /** 贴图层数。 */
            depth: number;
            /** 贴图细节级别数。 */
            levelCount: number;
            /** 纹理集单层占用空间大小。 */
            layerSize: number;
            /** 贴图像素格式。 */
            format: GPUTextureFormat;
            /** 贴图对象。 */
            texture: GPUTexture;
            /** 贴图视图。 */
            view: GPUTextureView;
            /** 贴图引用计数。 */
            refCount: number;
        }[]
    };

    /** 渲染贴图实例容器。 */
    private _texturesRT = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 当前实例总大小。 */
        usedSize: 0,
        /** 贴图实例容器。 */
        list: [null] as (Device["_textures2D"]["list"][0] & {
            /** 是否可绑定。 */
            bindable: boolean;
            /** 是否需要自适应大小。 */
            resizable: boolean;
            /** 渲染目标视图。 */
            attachments: GPUTextureView[][];
        })[]
    };

    /** 贴图采样器实例容器。 */
    private _samplers = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 采样器实例容器。 */
        list: [null] as {
            /** 采样器ID。 */
            id: number;
            /** 采样器标识。 */
            flags: number;
            /** 采样器描述符。 */
            desc: GPUSamplerDescriptor;
            /** 采样器对象。 */
            sampler: GPUSampler;
            /** 采样器引用计数。 */
            refCount: number;
        }[],
        /** 根据采样器标识查询采样器实例ID。 */
        lut: {} as Record<number, number>,
        /** 采样器配置字典。 */
        dict: {
            /** 寻址模式映射表。 */
            addressMode: ["clamp-to-edge", "repeat", "mirror-repeat"] as GPUAddressMode[],
            /** 过滤模式映射表。 */
            filterMode: ["nearest", "linear"] as GPUFilterMode[],
            /** 比较方式映射表。 */
            compareFunction: ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always", undefined] as GPUCompareFunction[],
        }
    };

    /** 统一资源组绑定对象实例容器（统一资源组绑定对象关联若干着色器资源并指定资源读写偏移，用于在绘制前将这些资源一次性绑定到着色器）。 */
    private _bindings = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 绑定对象实例容器。 */
        list: [null] as {
            /** 绑定对象ID。 */
            id: number;
            /** 资源组索引。 */
            group: number;
            /** 动态偏移参数（绑定操作时使用，资源读写偏移相对于该偏移参数、该参数又相对于资源首地址）。 */
            dynamicOffsets: number[];
            /** 资源组描述（布局、资源引用）。 */
            descriptor: GPUBindGroupDescriptor;
            /** 绑定对象。 */
            binding: GPUBindGroup;
            /** 绑定对象引用计数。 */
            refCount: number;
        }[]
    };

    /** 顶点布局实例容器。 */
    private _vertexLayouts = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 顶点布局实例容器。 */
        list: [null] as {
            /** 顶点布局ID。 */
            id: number;
            /** 顶点布局标签。 */
            label: string;
            /** 各顶点缓存布局（即顶点缓存布局组合，若干个顶点属性组成一个顶点缓存，最多3个顶点缓存，分别对应1、2、4位标识，顶点布局为各顶点缓存布局的组合）。 */
            buffers: GPUVertexBufferLayout[];
        }[]
    };

    /** 资源销毁任务列表。 */
    private _destroyList: (() => void)[] = [];
}

/** 贴图数据源。 */
export interface GLTextureSource {
    /** 位图格式。 */
    readonly format?: GLTextureFormat;
    /** 位图宽度。 */
    readonly width: number;
    /** 位图高度。 */
    readonly height: number;
    /** 位图数据（创建空贴图时需赋值空）。 */
    readonly data?: ArrayBuffer;
    /** 位图数据布局。 */
    readonly dataLayout?: {
        /** 位图数据偏移。 */
        readonly offset: number;
        /** 位图行数据大小。 */
        readonly bytesPerRow: number;
        /** 位图行数量。 */
        readonly rowsPerImage: number;
    };

    /** 位图数据写入纹理数组层。 */
    layer?: number;
    /** 位图数据写入纹理层LOD级别。 */
    level?: number;
    /** 位图数据写入列偏移。 */
    xoffset?: number;
    /** 位图数据写入行偏移。 */
    yoffset?: number;
}

/** 贴图数据源（KTX）。 */
export interface GLTextureSource_KTX2 {
    /** 贴图像素格式。 */
    readonly format: number;
    /** 贴图像素是否包含透明通道。 */
    readonly hasAlpha: number;

    /** 贴图像素宽度。 */
    readonly width: number;
    /** 贴图像素高度。 */
    readonly height: number;
    /** 贴图细节级别数。 */
    readonly levelCount: number;
    /** 贴图面数（2D:1、CUBE:6，每个面都包含多个MIP层级数）。 */
    readonly faces: number;
    /** 贴图层数（非贴图数组为1，每层可能是2D贴图或CUBE贴图）。 */
    readonly depth: number;
    /** 贴图实例数量（目前仅支持1个贴图实例）。 */
    readonly count: number;

    /** 贴图各MIP层级信息。 */
    readonly levelInfos: {
        /** 层级像素宽度。 */
        readonly width: number;
        /** 层级像素高度。 */
        readonly height: number;
        /** 块像素宽度（通常为4）。 */
        readonly block_width: number;
        /** 块像素高度（通常为4）。 */
        readonly block_height: number;
        /** 横向块数量（用于计算数据大小）。 */
        readonly blocks_x_count: number;
        /** 纵向块数量（用于计算数据大小）。 */
        readonly blocks_y_count: number;
        /** 块字节单位大小。 */
        readonly bytes_per_block: number;
        /** 层级数据偏移（相对缓存地址）。 */
        readonly level_data_offset: number;
    }[];

    /** 数据缓存（依次存储各层级各张贴图压缩数据）。 */
    readonly buffer: BufferSource | SharedArrayBuffer;
    /** 数据缓存偏移。 */
    readonly dataOffset: number;

    /** 数据写入层偏移。 */
    layer?: number;
    /** 数据写入LOD偏移。 */
    level?: number;
    /** 数据写入列偏移。 */
    xoffset?: number;
    /** 数据写入行偏移。 */
    yoffset?: number;
}

/** 贴图像素格式描述。 */
export interface GLTextureFormatDesc {
    /** 指定GPU内部存储贴图的格式。 */
    readonly internalformat: number;
    /** 贴图数据源像素通道启用描述。 */
    readonly format: number;
    /** 贴图数据源像素通道数据类型。 */
    readonly type: number;
    /** 贴图像素格式是否可用于渲染目标。 */
    readonly renderable: number;
    /** 贴图像素格式是否可进行线性采样过滤。 */
    readonly filterable: number;
    /** 贴图像素字节大小。 */
    readonly bytes: number;
    /** 压缩贴图格式。 */
    readonly compressed?: number;
}

/** 贴图像素格式枚举。 */
export type GLTextureFormat =
    | "r8unorm" | "r8snorm" | "r8uint" | "r8sint"
    | "r16uint" | "r16sint" | "r16float"
    | "rg8unorm" | "rg8snorm" | "rg8uint" | "rg8sint"
    | "r32uint" | "r32sint" | "r32float"
    | "rg16uint" | "rg16sint" | "rg16float"
    | "rgba8unorm" | "rgba8snorm" | "rgba8uint" | "rgba8sint" | "bgra8unorm" | "rgb9e5ufloat" | "rgb10a2unorm" | "rg11b10ufloat"
    | "rg32uint" | "rg32sint" | "rg32float"
    | "rgba16uint" | "rgba16sint" | "rgba16float"
    | "rgba32uint" | "rgba32sint" | "rgba32float"
    | "stencil8" | "depth16unorm" | "depth24plus" | "depth24plus-stencil8" | "depth32float" | "depth32float-stencil8"
    | "bc1-rgba-unorm" | "bc3-rgba-unorm" | "bc4-r-unorm" | "bc5-rg-unorm" | "bc7-rgba-unorm";

/** 图元类型枚举。 */
export const enum GLPrimitiveTopology {
    point_list = 0,
    line_list,
    line_strip,
    triangle_list,
    triangle_strip,
}

// ======================--------------------------------

/** GL虚拟设备接口。 */
class GLDevice {
    /**
     * 构造函数。
     * @param gl GL渲染上下文。
     */
    public constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;

        // 默认一直启用深度测试
        this._gl.enable(GL_const.DEPTH_TEST);
        // 默认启用背面裁剪
        this._gl.enable(GL_const.CULL_FACE);
    }

    /** GL渲染上下文。 */
    private _gl: WebGL2RenderingContext;
}

/** GL虚拟上下文接口。 */
class GLCanvasContext {
    /**
     * 构造函数。
     * @param gl GL渲染上下文。
     */
    public constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    /** GL渲染上下文。 */
    private _gl: WebGL2RenderingContext;
}

/** GL内置常量。 */
const enum GL_const {
    TEXTURE_BINDPOINT_BEGIN = 1,

    // ============--------------------

    NONE = 0,
    ZERO = 0x0000,
    ONE = 0x0001,

    ARRAY_BUFFER = 0x8892,
    ELEMENT_ARRAY_BUFFER = 0x8893,
    UNIFORM_BUFFER = 0x8A11,
    TRANSFORM_FEEDBACK_BUFFER = 0x8C8E,
    TEXTURE0 = 0x84C0,
    TEXTURE_2D = 0x0DE1,
    TEXTURE_2D_ARRAY = 0x8C1A,
    TEXTURE_3D = 0x806F,
    VERTEX_SHADER = 0x8B31,
    FRAGMENT_SHADER = 0x8B30,
    READ_FRAMEBUFFER = 0x8CA8,
    DRAW_FRAMEBUFFER = 0x8CA9,
    FRAMEBUFFER = 0x8D40,
    COLOR_ATTACHMENT0 = 0x8CE0,
    DEPTH_ATTACHMENT = 0x8D00,
    DEPTH_STENCIL_ATTACHMENT = 0x821A,
    COLOR_BUFFER_BIT = 0x00004000,
    DEPTH_BUFFER_BIT = 0x00000100,
    STENCIL_BUFFER_BIT = 0x00000400,
    COLOR = 0x1800,
    DEPTH = 0x1801,
    STENCIL = 0x1802,

    TEXTURE_WRAP_S = 0x2802,
    TEXTURE_WRAP_T = 0x2803,
    TEXTURE_WRAP_R = 0x8072,
    TEXTURE_MIN_FILTER = 0x2801,
    TEXTURE_MAG_FILTER = 0x2800,
    TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE,
    TEXTURE_COMPARE_MODE = 0x884C,
    TEXTURE_COMPARE_FUNC = 0x884D,
    TEXTURE_MIN_LOD = 0x813A,
    TEXTURE_MAX_LOD = 0x813B,
    TEXTURE_BASE_LEVEL = 0x813C,
    TEXTURE_MAX_LEVEL = 0x813D,

    CLAMP_TO_EDGE = 0x812F,
    REPEAT = 0x2901,
    MIRRORED_REPEAT = 0x8370,
    NEAREST = 0x2600,
    LINEAR = 0x2601,
    LINEAR_MIPMAP_NEAREST = 0x2701,
    LINEAR_MIPMAP_LINEAR = 0x2703,
    NEAREST_MIPMAP_NEAREST = 0x2700,
    NEAREST_MIPMAP_LINEAR = 0x2702,
    COMPARE_REF_TO_TEXTURE = 0x884E,

    STATIC_DRAW = 0x88E4,
    DYNAMIC_DRAW = 0x88E8,
    STATIC_READ = 0x88E5,
    DYNAMIC_READ = 0x88E9,

    R8 = 0x8229,
    R8_SNORM = 0x8F94,
    R8UI = 0x8232,
    R8I = 0x8231,
    R16UI = 0x8234,
    R16I = 0x8233,
    R16F = 0x822D,
    R32UI = 0x8236,
    R32I = 0x8235,
    R32F = 0x822E,
    RG8 = 0x822B,
    RG8_SNORM = 0x8F95,
    RG8UI = 0x8238,
    RG8I = 0x8237,
    RG16UI = 0x823A,
    RG16I = 0x8239,
    RG16F = 0x822F,
    RG32UI = 0x823C,
    RG32I = 0x823B,
    RG32F = 0x8230,
    RGBA8 = 0x8058,
    RGBA8_SNORM = 0x8F97,
    SRGB8_ALPHA8 = 0x8C43,
    RGBA8UI = 0x8D7C,
    RGBA8I = 0x8D8E,
    RGBA16UI = 0x8D76,
    RGBA16I = 0x8D88,
    RGBA16F = 0x881A,
    RGBA32UI = 0x8D70,
    RGBA32I = 0x8D82,
    RGBA32F = 0x8814,
    RGB9_E5 = 0x8C3D,
    RGB10_A2 = 0x8059,
    R11F_G11F_B10F = 0x8C3A,
    STENCIL_INDEX8 = 0x8D48,
    DEPTH_COMPONENT16 = 0x81A5,
    DEPTH_COMPONENT24 = 0x81A6,
    DEPTH24_STENCIL8 = 0x88F0,
    DEPTH_COMPONENT32F = 0x8CAC,
    DEPTH32F_STENCIL8 = 0x8CAD,

    RED = 0x1903,
    RED_INTEGER = 0x8D94,
    RG = 0x8227,
    RG_INTEGER = 0x8228,
    RGB = 0x1907,
    RGBA = 0x1908,
    RGBA_INTEGER = 0x8D99,
    STENCIL_INDEX = 0x1901,
    DEPTH_COMPONENT = 0x1902,
    DEPTH_STENCIL = 0x84F9,

    BYTE = 0x1400,
    UNSIGNED_BYTE = 0x1401,
    SHORT = 0x1402,
    UNSIGNED_SHORT = 0x1403,
    INT = 0x1404,
    UNSIGNED_INT = 0x1405,
    HALF_FLOAT = 0x140B,
    FLOAT = 0x1406,
    UNSIGNED_INT_5_9_9_9_REV = 0x8C3E,
    UNSIGNED_INT_2_10_10_10_REV = 0x8368,
    UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B,
    UNSIGNED_INT_24_8 = 0x84FA,
    FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD,

    CULL_FACE = 0x0B44,
    STENCIL_TEST = 0x0B90,
    DEPTH_TEST = 0x0B71,
    SCISSOR_TEST = 0x0C11,
    POLYGON_OFFSET_FILL = 0x8037,
    BLEND = 0x0BE2,

    POINTS = 0x0000,
    LINES = 0x0001,
    LINE_STRIP = 0x0003,
    TRIANGLES = 0x0004,
    TRIANGLE_STRIP = 0x0005,

    CW = 0x0900,
    CCW = 0x0901,

    FRONT = 0x0404,
    BACK = 0x0405,
    FRONT_AND_BACK = 0x0408,

    NEVER = 0x0200,
    LESS = 0x0201,
    EQUAL = 0x0202,
    LEQUAL = 0x0203,
    GREATER = 0x0204,
    NOTEQUAL = 0x0205,
    GEQUAL = 0x0206,
    ALWAYS = 0x0207,

    KEEP = 0x1E00,
    REPLACE = 0x1E01,
    INCR = 0x1E02,
    DECR = 0x1E03,
    INVERT = 0x150A,
    INCR_WRAP = 0x8507,
    DECR_WRAP = 0x8508,

    FUNC_ADD = 0x8006,
    MIN = 0x8007,
    MAX = 0x8008,
    FUNC_SUBTRACT = 0x800A,
    FUNC_REVERSE_SUBTRACT = 0x800B,

    SRC_COLOR = 0x0300,
    ONE_MINUS_SRC_COLOR = 0x0301,
    SRC_ALPHA = 0x0302,
    ONE_MINUS_SRC_ALPHA = 0x0303,
    DST_COLOR = 0x0306,
    ONE_MINUS_DST_COLOR = 0x0307,
    DST_ALPHA = 0x0304,
    ONE_MINUS_DST_ALPHA = 0x0305,
    CONSTANT_COLOR = 0x8001,
    ONE_MINUS_CONSTANT_COLOR = 0x8002,
    CONSTANT_ALPHA = 0x8003,
    ONE_MINUS_CONSTANT_ALPHA = 0x8004,
    SRC_ALPHA_SATURATE = 0x0308,

    COMPILE_STATUS = 0x8B81,
    LINK_STATUS = 0x8B82,
}
