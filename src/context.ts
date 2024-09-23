import * as Miaoverse from "./mod.js"

/** 渲染设备上下文接口。 */
export class Context {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 初始化GPU上下文接口。
     * @returns 返回GPU上下文接口。
     */
    public async Init() {
        const mptdLut = this._materialPropTypeDescLut;
        const tptdLut = this._texturePropTypeDescLut;

        // ============================------------------------------------

        mptdLut["i32"] = {
            signGLSL: "int",
            signWGSL: "i32",
            type: Miaoverse.PropType.vec1,
            format: Miaoverse.PropFormat.i32,
            size: 4,
            get default_() { return [0]; }
        };

        mptdLut["u32"] = {
            signGLSL: "uint",
            signWGSL: "u32",
            type: Miaoverse.PropType.vec1,
            format: Miaoverse.PropFormat.u32,
            size: 4,
            get default_() { return [0]; }
        };

        mptdLut["f32"] = {
            signGLSL: "float",
            signWGSL: "f32",
            type: Miaoverse.PropType.vec1,
            format: Miaoverse.PropFormat.f32,
            size: 4,
            get default_() { return [0.0]; }
        };


        mptdLut["vec2<i32>"] = {
            signGLSL: "ivec2",
            signWGSL: "vec2<i32>",
            type: Miaoverse.PropType.vec2,
            format: Miaoverse.PropFormat.i32,
            size: 8,
            get default_() { return [0, 0]; }
        };

        mptdLut["vec2<u32>"] = {
            signGLSL: "uvec2",
            signWGSL: "vec2<u32>",
            type: Miaoverse.PropType.vec2,
            format: Miaoverse.PropFormat.u32,
            size: 8,
            get default_() { return [0, 0]; }
        };

        mptdLut["vec2<f32>"] = {
            signGLSL: "vec2",
            signWGSL: "vec2<f32>",
            type: Miaoverse.PropType.vec2,
            format: Miaoverse.PropFormat.f32,
            size: 8,
            get default_() { return [0.0, 0.0]; }
        };


        mptdLut["vec3<i32>"] = {
            signGLSL: "ivec3",
            signWGSL: "vec3<i32>",
            type: Miaoverse.PropType.vec3,
            format: Miaoverse.PropFormat.i32,
            size: 12,
            get default_() { return [0, 0, 0]; }
        };

        mptdLut["vec3<u32>"] = {
            signGLSL: "uvec3",
            signWGSL: "vec3<u32>",
            type: Miaoverse.PropType.vec3,
            format: Miaoverse.PropFormat.u32,
            size: 12,
            get default_() { return [0, 0, 0]; }
        };

        mptdLut["vec3<f32>"] = {
            signGLSL: "vec3",
            signWGSL: "vec3<f32>",
            type: Miaoverse.PropType.vec3,
            format: Miaoverse.PropFormat.f32,
            size: 12,
            get default_() { return [0.0, 0.0, 0.0]; }
        };


        mptdLut["vec4<i32>"] = {
            signGLSL: "ivec4",
            signWGSL: "vec4<i32>",
            type: Miaoverse.PropType.vec4,
            format: Miaoverse.PropFormat.i32,
            size: 16,
            get default_() { return [0, 0, 0, 0]; }
        };

        mptdLut["vec4<u32>"] = {
            signGLSL: "uvec4",
            signWGSL: "vec4<u32>",
            type: Miaoverse.PropType.vec4,
            format: Miaoverse.PropFormat.u32,
            size: 16,
            get default_() { return [0, 0, 0, 0]; }
        };

        mptdLut["vec4<f32>"] = {
            signGLSL: "vec4",
            signWGSL: "vec4<f32>",
            type: Miaoverse.PropType.vec4,
            format: Miaoverse.PropFormat.f32,
            size: 16,
            get default_() { return [0.0, 0.0, 0.0, 0.0]; }
        };


        mptdLut["mat2x2<f32>"] = {
            signGLSL: "mat2",
            signWGSL: "mat2x2<f32>",
            type: Miaoverse.PropType.mat2x2,
            format: Miaoverse.PropFormat.f32,
            size: 16,
            get default_() { return [1.0, 0.0, 0.0, 1.0]; }
        };

        mptdLut["mat3x3<f32>"] = {
            signGLSL: "mat3",
            signWGSL: "mat3x3<f32>",
            type: Miaoverse.PropType.mat3x3,
            format: Miaoverse.PropFormat.f32,
            size: 48,
            get default_() { return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0]; }
        };

        mptdLut["mat4x4<f32>"] = {
            signGLSL: "mat4",
            signWGSL: "mat4x4<f32>",
            type: Miaoverse.PropType.mat4x4,
            format: Miaoverse.PropFormat.f32,
            size: 64,
            get default_() { return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]; }
        };


        for (let type = 0; type < tptdLut.typeList.length; type++) {
            for (let format = 0; format < tptdLut.formatList.length; format++) {
                // 对于贴图属性，会解析为2个UVEC4加1个VEC4
                // 第1个UVEC4记录贴图的UUID
                // 第2个UVEC4分别记录：非缺省贴图、默认颜色值、采样器标志集、采样器ID
                // 第3个VEC4记录纹理采样时UV的平移和缩放
                // 贴图UUID或采样器标志集变化时，擦除当前资源组绑定对象ID。当采样器标志集变化时，擦除采样器ID
                // 整个属性缓存可以快速保存和加载
                mptdLut[tptdLut.typeList[type] + tptdLut.formatList[format]] = {
                    signGLSL: "uvec4",
                    signWGSL: "vec4<u32>",
                    type: Miaoverse.PropType.vec4,
                    format: Miaoverse.PropFormat.u32,
                    size: 16,
                    get default_() { return [0, 0, 0, 0]; },

                    texture_dim: tptdLut.dimList[type],
                    texture_type: tptdLut.sampleList[format]
                };
            }
        }

        // ============================------------------------------------

        this.GenerateGroupLayout_G0();
        this.GenerateGroupLayout_G1();

        // ============================------------------------------------

        this._builtinSampler = [];

        this._builtinSampler[0] = this._global.device.CreateSampler(this._global.device.GenerateSamplerFlags({
            label: "spnnn1",
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "nearest",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1,
            compare: undefined,
            lodMinClamp: 0,
            lodMaxClamp: 15
        }));

        this._builtinSampler[1] = this._global.device.CreateSampler(this._global.device.GenerateSamplerFlags({
            label: "splln1",
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "nearest",
            maxAnisotropy: 1,
            compare: undefined,
            lodMinClamp: 0,
            lodMaxClamp: 15
        }));

        this._builtinSampler[2] = this._global.device.CreateSampler(this._global.device.GenerateSamplerFlags({
            label: "spnnl1",
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "nearest",
            minFilter: "nearest",
            mipmapFilter: "linear",
            maxAnisotropy: 1,
            compare: undefined,
            lodMinClamp: 0,
            lodMaxClamp: 15
        }));

        this._builtinSampler[3] = this._global.device.CreateSampler(this._global.device.GenerateSamplerFlags({
            label: "splll1",
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: 1,
            compare: undefined,
            lodMinClamp: 0,
            lodMaxClamp: 15
        }));

        this._builtinSampler[4] = this._global.device.CreateSampler(this._global.device.GenerateSamplerFlags({
            label: "splll4",
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: 4,
            compare: undefined,
            lodMinClamp: 0,
            lodMaxClamp: 15
        }));

        this._builtinSampler[5] = this._global.device.CreateSampler(this._global.device.GenerateSamplerFlags({
            label: "splll8",
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: 8,
            compare: undefined,
            lodMinClamp: 0,
            lodMaxClamp: 15
        }));

        // ============================------------------------------------

        return this;
    }

    /**
     * 从着色器资产创建着色器实例。
     * @param asset 着色器资产。
     * @returns 返回着色器实例。
     */
    public CreateShader(asset: Miaoverse.ShaderAsset): Miaoverse.Shader {
        if (asset.instance) {
            return this._shaders.list[asset.instance];
        }

        // TODO: GLTF标准材质定义贴图属性过多，我们隐藏部分贴图属性
        const hide_textures = ["anisotropyTexture", "clearcoatTexture", "clearcoatNormalTexture", "iridescenceTexture", "iridescenceThicknessTexture", "sheenRoughnessTexture", "transmissionTexture", "thicknessTexture"];
        const layout = this.GenerateGroupLayout_G2(asset.properties, hide_textures);

        let id = this._shaders.freeId;
        let entry = this._shaders.list[id];

        if (entry) {
            this._shaders.freeId = entry.id;

            entry.id = id;
            entry.name = asset.name;
            entry.asset = asset;
            entry.branchKeys = [];
            entry.refCount = 1;

            entry.group = layout.group;
            entry.tuple = layout.tuple;
            entry.layout = layout.layout;
            entry.vscode = layout.vscode;
            entry.fscode = layout.fscode;
        }
        else {
            this._shaders.freeId++;

            entry = this._shaders.list[id] = {
                id: id,
                name: asset.name,
                asset: asset,
                branchKeys: [],
                refCount: 1,

                ...layout
            };
        }

        this._shaders.usedCount += 1;

        asset.instance = id;

        if (asset.custom_g3) {
            entry.custom_g3 = this._global.device.device.createBindGroupLayout(asset.custom_g3);
        }

        return entry;
    }

    /**
     * 生成属性值定义代码。
     * @param properties 属性定义。
     * @param uniformGroup 属性组定义。
     * @returns 返回属性资源绑定组布局。
     */
    public GenerateMaterialPropTuple(properties: Miaoverse.ShaderAsset["properties"], uniformGroup: {
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
    }, hide_textures?: string[]): Miaoverse.PropLayout {

        // 按属性类型（PropType）进行分组，之后进行重组，使缓存结构紧密
        const groups: (number[])[] = [[], [], [], [], [], [], [], []];
        // 编排后的属性列表
        const list: Miaoverse.PropVar[] = [];
        // 贴图属性列表
        const texs: string[] = [];

        // 原始声明序号
        let index = 0;

        for (let key in properties) {
            const prop = properties[key];
            const desc = this._materialPropTypeDescLut[prop.sign];

            const decl: Miaoverse.PropDecl = {
                name: key,
                note: prop.note,
                sign: prop.sign,
                value: prop.value?.slice() || desc.default_.slice(),
                type: desc.type,
                format: desc.format
            };

            const var_: Miaoverse.PropVar = {
                index: index,
                sort: -1,
                offset: 0,
                size: desc.size,
                decl: decl
            };

            list.push(var_);

            groups[decl.type].push(index);

            index++;

            // =======================--------------------------------

            // 贴图类型
            if (prop.sign.startsWith("texture")) {
                decl.name += "_uuid";
                decl.texture = texs.length;
                decl.value = [0, 0, 0, 0];

                // =======================--------------------------------

                // 注意，缺省贴图默认颜色值使用16进制ARGB表示，如红色不透明颜色：0xFFFF0000
                let default_color = prop.value ? prop.value[0] : 0;
                // 请查看采样器标志集设置规则
                let sampler_flags = prop.value ? prop.value[1] : 0;

                list.push({
                    index: index,
                    sort: -1,
                    offset: 0,
                    size: 16,
                    decl: {
                        name: key + "_sampler",
                        note: key + ": (has_texture, default_color, sampler_flags, sampler_id)",
                        sign: "vec4<u32>",
                        value: [0, default_color, sampler_flags, 0],
                        type: Miaoverse.PropType.vec4,
                        format: Miaoverse.PropFormat.u32,
                        sampler: texs.length
                    }
                });

                groups[Miaoverse.PropType.vec4].push(index);

                index++;

                // =======================--------------------------------

                list.push({
                    index: index,
                    sort: -1,
                    offset: 0,
                    size: 16,
                    decl: {
                        name: key + "_uvts",
                        note: key + ": (uoffset, voffset, uscale, vscale)",
                        sign: "vec4<f32>",
                        value: [0.0, 0.0, 1.0, 1.0],
                        type: Miaoverse.PropType.vec4,
                        format: Miaoverse.PropFormat.f32
                    }
                });

                groups[Miaoverse.PropType.vec4].push(index);

                index++;

                // =======================--------------------------------

                if (hide_textures && -1 < hide_textures?.indexOf(key)) {
                    decl.texture = undefined;
                }
                else {
                    texs.push(key);
                }
            }
        }

        // =======================--------------------------------

        class PropView {
            public constructor(master: ConstructorParameters<Miaoverse.PropTuple["view"]>[0]) {
                this.master = master;
            }

            public master: ConstructorParameters<Miaoverse.PropTuple["view"]>[0];
        }

        const env = this._global.env;
        const resources = this._global.resources;

        // 特殊标记查找表
        const specLut: Record<string, number> = {
            // ...
        };

        // 特殊的赋值方法，会额外进行标志集标志
        function specSet(var_: Miaoverse.PropVar) {
            // 用于判断标记各属性的启用状态
            const name = var_.decl.name;
            // 用于判断标记贴图的绑定格式
            const textureIdx = var_.decl.texture;
            // 需要修改的标记位
            const specFlag = specLut[name];

            // 无需进行任何标志
            if (undefined === textureIdx && undefined === specFlag) {
                return function (value: number[]) {
                    const master = this.master as ConstructorParameters<Miaoverse.PropTuple["view"]>[0];
                    env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);
                    master.updated = true;
                };
            }
            else {
                if (undefined === textureIdx) {
                    return function (value: number[]) {
                        const master = this.master as ConstructorParameters<Miaoverse.PropTuple["view"]>[0];
                        env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);

                        // 启用或禁用标志
                        let enableFlags = master.enableFlags;

                        if (0 != value[0]) {
                            enableFlags |= specFlag;
                        }
                        else {
                            enableFlags &= ~specFlag;
                        }

                        master.enableFlags = enableFlags;

                        master.updated = true;
                    };
                }
                else if (undefined === specFlag) {
                    return function (value: number[]) {
                        const master = this.master as ConstructorParameters<Miaoverse.PropTuple["view"]>[0];

                        // 替换引用，旧引用计数减少，新引用计数增加
                        {
                            const oldID = env.arrayGet(var_.decl.format, master.blockPtr, var_.offset >> 2, 4)[0];
                            const newID = value[0];

                            resources.Texture.Release(oldID);
                            resources.Texture.AddRef(newID);
                        }

                        env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);

                        master.updated = true;
                    };
                }
                else {
                    return function (value: number[]) {
                        const master = this.master as ConstructorParameters<Miaoverse.PropTuple["view"]>[0];

                        // 替换引用，旧引用计数减少，新引用计数增加
                        {
                            const oldID = env.arrayGet(var_.decl.format, master.blockPtr, var_.offset >> 2, 4)[0];
                            const newID = value[0];

                            resources.Texture.Release(oldID);
                            resources.Texture.AddRef(newID);
                        }

                        env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);

                        // 启用或禁用标志
                        let enableFlags = master.enableFlags;

                        if (0 < value[0]) {
                            enableFlags |= specFlag;
                        }
                        else {
                            enableFlags &= ~specFlag;
                        }

                        master.enableFlags = enableFlags;

                        master.updated = true;
                    };
                }
            }
        };

        // =======================--------------------------------

        const webgl = this._global.config.webgl;

        let code = webgl ? `\nlayout(std140) uniform ${uniformGroup.tname} {\n` : `\nstruct ${uniformGroup.tname} {\n`;
        let offset = 0;

        // G0、G2在起始位置添加2个矩阵存储系统字段
        if (uniformGroup.group == 0 || uniformGroup.group == 2) {
            if (webgl) {
                code += "    mat4 sysMat1;\n";
                code += "    mat4 sysMat2;\n";
            }
            else {
                code += "    sysMat1 : mat4x4<f32>,\n";
                code += "    sysMat2 : mat4x4<f32>,\n";
            }

            offset = 128;
        }

        // 缓存结构编排，重新排序属性定义
        index = 0;

        // 缓存结构编排，-1表示进入新的16字节对齐
        const push = (index_: number) => {
            const prop = list[index_];
            const desc = this._materialPropTypeDescLut[prop.decl.sign];

            prop.sort = index++;
            prop.offset = offset;

            if (prop.size == 12) {
                offset += 16;
            }
            else {
                offset += prop.size;
            }

            if (webgl) {
                code += "    " + desc.signGLSL + " " + prop.decl.name + ";\n";
            }
            else {
                code += "    " + prop.decl.name + " : " + desc.signWGSL + ",\n";
            }

            // =======================--------------------------------

            Object.defineProperty(PropView.prototype, prop.decl.name, {
                enumerable: true,
                configurable: false,
                set: specSet(prop),
                get() {
                    return env.arrayGet(prop.decl.format, this.master.blockPtr as never, prop.offset >> 2, prop.size >> 2);
                }
            });
        };

        const padding = (sign: string, name: string) => {
            if (webgl) {
                code += `    ${this._materialPropTypeDescLut[sign].signGLSL} ${name};\n`;
            }
            else {
                code += `    ${name} : ${this._materialPropTypeDescLut[sign].signWGSL},\n`;
            }
        }

        // 16元素属性对齐，已经是16字节对齐
        const group4x4 = groups[7];
        const count4x4 = group4x4.length;
        for (let i = 0; i < count4x4; i++) {
            push(group4x4[i]);
        }

        // 9=>12元素属性对齐，已经是16字节对齐
        const group3x3 = groups[6];
        const count3x3 = group3x3.length;
        for (let i = 0; i < count3x3; i++) {
            push(group3x3[i]);
        }

        // 4元素属性对齐已经是16字节对齐
        const group2x2 = groups[5];
        const count2x2 = group2x2.length;
        for (let i = 0; i < count2x2; i++) {
            push(group2x2[i]);
        }

        // 4元素属性对齐，已经是16字节对齐
        const group4 = groups[4];
        const count4 = group4.length;
        for (let i = 0; i < count4; i++) {
            push(group4[i]);
        }

        // 3元素属性对齐，自动16字节对齐
        const group3 = groups[3];
        const count3 = group3.length;
        for (let i = 0; i < count3; i++) {
            push(group3[i]);
        }

        // 2元素属性对齐
        const group2 = groups[2];
        const count2 = group2.length;
        for (let i = 0; i < count2; i++) {
            push(group2[i]);
        }

        // 1元素属性对齐
        const group1 = groups[1];
        const count1 = group1.length;

        // 在vec3属性和vec1属性直接添加一个占位
        if (count3 && count1 && !count2) {
            padding("f32", "_padding0");
        }

        for (let i = 0; i < count1; i++) {
            push(group1[i]);
        }

        // 定义不能缺失
        if (0 === offset) {
            padding("vec4<f32>", "_default");
            offset += 16;
        }

        // 内存对齐（绑定对象绑定大小对齐256，IOS如不对齐会有数据不正确的问题）
        let aligned = ((offset + (uniformGroup.alignSize - 1)) & (~(uniformGroup.alignSize - 1))) - offset;
        if (aligned > 0) {
            if (aligned % 16 == 4) {
                padding("f32", "_padding1");
            }
            else if (aligned % 16 == 8) {
                padding("vec2<f32>", "_padding1");
            }
            else if (aligned % 16 == 12) {
                padding("f32", "_padding1");
                padding("vec2<f32>", "_padding2");
            }

            aligned = Math.floor(aligned / 16);

            if (aligned > 0) {
                if (aligned == 1) {
                    padding("vec4<f32>", "_paddingX");
                }
                else {
                    if (webgl) {
                        code += `    vec4 _paddingX[${aligned}];\n`;
                    }
                    else {
                        code += `    _paddingX : array<vec4<f32>, ${aligned}>,\n`;
                    }
                }
            }
        }

        code += `}`;

        if (webgl) {
            code = code + `${uniformGroup.vname};\n`;
        }
        else {
            code = code + `;\n@group(${uniformGroup.group}) @binding(${uniformGroup.binding}) var<uniform> ${uniformGroup.vname} : ${uniformGroup.tname};\n`;
        }

        for (let i = 0; i < texs.length; i++) {
            const prop = properties[texs[i]];
            const binding = i * 2 + 2;

            code += `@group(${uniformGroup.group}) @binding(${binding}) var ${texs[i]} : ${prop.sign};\n`;
            code += `@group(${uniformGroup.group}) @binding(${binding + 1}) var sampler_${texs[i]} : sampler;\n`;
        }

        return {
            group: uniformGroup.group,
            tuple: {
                vars: list,
                size: offset,
                view: PropView as any,
            },
            vscode: code,
            fscode: code,
        };
    }

    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    public GenerateGroupLayout_G2(properties: Miaoverse.ShaderAsset["properties"], hide_textures?: string[]) {
        const propLayout = this.GenerateMaterialPropTuple(properties, {
            group: 2,
            binding: 0,
            tname: "MaterialParams",
            vname: "materialParams",
            alignSize: 256
        }, hide_textures);

        const groupDesc: GPUBindGroupLayoutDescriptor = {
            label: "g2",
            entries: [
                {// materialParams
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        hasDynamicOffset: true
                    }
                }
            ]
        };

        for (let var_ of propLayout.tuple.vars) {
            const texid = var_.decl.texture;

            if (texid !== undefined) {
                const binding = texid * 2 + 2;
                const desc = this._materialPropTypeDescLut[var_.decl.sign];

                (groupDesc.entries as any)[binding - 1] = {
                    binding: binding + 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: desc.texture_type,
                        viewDimension: desc.texture_dim
                    }
                };

                (groupDesc.entries as any)[binding] = {
                    binding: binding + 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                };
            }
        }

        propLayout.layout = this._global.device.device.createBindGroupLayout(groupDesc);

        return propLayout;
    }

    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    private GenerateGroupLayout_G0() {

        // 我们保证了统一缓存编排按以下声明顺序进行

        const properties: Miaoverse.ShaderAsset["properties"] = {
            // 系统占用字段128字节

            // 128===================----------------------------------

            "sm_uvfwMat": { note: "CASCADES阴影各级世界空间到阴影贴图UV变换矩阵。", sign: "mat4x4<f32>" },
            "sm_uvfwMat1": { note: "CASCADES阴影各级世界空间到阴影贴图UV变换矩阵。", sign: "mat4x4<f32>" },
            "sm_uvfwMat2": { note: "CASCADES阴影各级世界空间到阴影贴图UV变换矩阵。", sign: "mat4x4<f32>" },
            "sm_uvfwMat3": { note: "CASCADES阴影各级世界空间到阴影贴图UV变换矩阵。", sign: "mat4x4<f32>" },

            // 384===================----------------------------------

            "vfgMat": { note: "变换矩阵：全局->相机。", sign: "mat4x4<f32>" },
            "gfvMat": { note: "变换矩阵：相机->全局。", sign: "mat4x4<f32>" },

            "cfvMat": { note: "变换矩阵：相机->裁剪。\n进行透视除法后的NDC空间：XY[-1, 1]，Z[近1, 远0]。\n在WebGL需要转换到Z[近1, 远-1]的裁剪空间，gl_Position.z = dot(gl_Position.zw, vec2(2.0, -1.0));。", sign: "mat4x4<f32>" },
            "vfcMat": { note: "变换矩阵：裁剪->相机。", sign: "mat4x4<f32>" },

            "cfgMat": { note: "变换矩阵：全局->裁剪。", sign: "mat4x4<f32>" },
            "gfcMat": { note: "变换矩阵：裁剪->全局。", sign: "mat4x4<f32>" },

            "gfwMat": { note: "变换矩阵：世界->全局。", sign: "mat4x4<f32>" },
            "wfgMat": { note: "变换矩阵：全局->世界。", sign: "mat4x4<f32>" },

            "uvfvMat": { note: "变换矩阵：相机->相机平面UV。\n相当于旧版的m_uvfvMat、ssrUvFromViewMatrix，用于SSR相交测试。", sign: "mat4x4<f32>" },
            "last_uvfvMat": { note: "变换矩阵：相机->上一相机平面UV。\n重投影矩阵：当前相机空间->世界空间->旧相机空间->旧相机裁剪空间->上一相机平面UV空间。\n相当于旧版的reprojectionMat、ssrReprojection，用于SSR颜色采样。", sign: "mat4x4<f32>" },

            "last_cfwMat": { note: "变换矩阵：世界->上一相机裁剪。", sign: "mat4x4<f32>" },
            "cullingMat": { note: "变换矩阵：相机->裁剪（CPU端使用）。", sign: "mat4x4<f32>" },

            "m_reserved768": { note: "预留空间。", sign: "mat4x4<f32>" },

            "m_reserved832": { note: "预留空间。", sign: "vec4<f32>" },
            "camera_wPos": { note: "相机，相机世界空间坐标。W位不使用。", sign: "vec4<f32>" },
            "camera_wDir": { note: "相机，相机世界空间观察方向和距观察目标距离。", sign: "vec4<f32>" },
            "camera_params": { note: "相机，\nx : cameraFar 远平面距离。\ny : oneOverFarMinusNear 1/(f-n), 始终为正数。\nz : nearOverFarMinusNear n/(f-n), 始终为正数。\nw : ev100 EV100参数。", sign: "vec4<f32>" },

            "resolution": { note: "画布参数：width, height, 1/width, 1/height。", sign: "vec4<f32>", value: [1024.0, 1024.0, 0.000977, 0.000977] },
            "cascadeSplits": { note: "CSM，视锥在相机空间中的划分位置，不包含近平面。不使用的分量值为-INF。", sign: "vec4<f32>", value: [-6.3457, 0.0, 0.0, 0.0] },
            "m_reserved928": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved944": { note: "预留空间。", sign: "vec4<f32>" },

            "froxelCount": { note: "视锥体素化细分参数：Dim、CountX、CountY、CountZ。", sign: "vec4<u32>" },
            "froxelCountZ": { note: "视锥体素化细分参数：NearZ、FarZ、LinearZ、Reserved。", sign: "vec4<f32>" },
            "froxelParamsF": { note: "着色器使用的视锥体素化参数1：1、CountX、CountX * CountY、CountX * CountY * CountZ。", sign: "vec4<u32>" },
            "froxelParamsZ": { note: "着色器使用的视锥体素化参数2：用于计算片元所属体素索引。", sign: "vec4<f32>" },

            // 1408===================----------------------------------

            "iblSH": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH1": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH2": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH3": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH4": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH5": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH6": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH7": { note: "IBL，球谐系数。", sign: "vec4<f32>" },
            "iblSH8": { note: "IBL，球谐系数。", sign: "vec4<f32>" },

            "fogColor": { note: "雾，颜色（W位不使用）。", sign: "vec4<f32>" },

            "sunParams": { note: " 太阳圆盘参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP。", sign: "vec4<f32>", value: [0.999848, 0.017452, -2188.808350, 80.0] },
            "sunlitColorIntensity": { note: "太阳光照颜色和强度。", sign: "vec4<f32>", value: [1.0, 1.0, 1.0, 1.0] },
            "sunlitDirection": { note: "太阳光照全局空间方向光方向（W位不使用）。", sign: "vec4<f32>", value: [0.0, 1.0, 0.0, 0.0] },

            "m_reserved208": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved224": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved240": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved256": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved272": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved288": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved304": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved320": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved336": { note: "预留空间。", sign: "vec4<f32>" },
            "m_reserved352": { note: "预留空间。", sign: "vec4<f32>" },

            "lightFarAttenuationParams": { note: "太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。", sign: "vec2<f32>", value: [5.0, 0.0005] },
            "m_reserved376": { note: "预留空间。", sign: "vec2<f32>", value: [5.0, 0.0005] },

            "iblLuminance": { note: "IBL，亮度", sign: "f32" },
            "iblRoughnessOneLevel": { note: "IBL，粗糙度为1的纹理链级别", sign: "f32" },
            "m_reserved392": { note: "预留空间。", sign: "f32" },
            "m_reserved396": { note: "预留空间。", sign: "f32" },

            "ssrThickness": { note: "屏幕空间反射用的物体厚度，用于相交测试。", sign: "f32", value: [0.1] },
            "ssrBias": { note: "屏幕空间反射用的射线的起点偏移。", sign: "f32", value: [0.01] },
            "ssrDistance": { note: "屏幕空间反射用的射线最大追踪距离。", sign: "f32", value: [3.0] },
            "ssrStride": { note: "屏幕空间反射用的射线追踪步进像素数。", sign: "f32", value: [2.0] },
            "refractionLodOffset": { note: "反射贴图采样LOD偏移。", sign: "f32", value: [7.625531] },
            "temporalNoise": { note: "噪音系数[0, 1]，当不使用TAA时取0。", sign: "f32" },
            "aoSamplingQualityAndEdgeDistance": { note: "SSAO，采样参数，0: bilinear, !0: bilateral edge distance。", sign: "f32" },
            "aoBentNormals": { note: "SSAO，0: no AO bent normal, >0.0 AO bent normals。", sign: "f32" },

            // bit 0-3: cascade count
            // bit 4: visualize cascades
            // bit 8-11: cascade has visible shadows
            "cascades": { note: "阴影，CSM information。", sign: "u32", value: [1 + (1 << 8)] },
            // bit 0: directional (sun) shadow enabled
            // bit 1: directional (sun) screen-space contact shadow enabled
            // bit 8-15: screen-space contact shadows ray casting steps
            "directionalShadows": { note: "", sign: "u32", value: [2049] },
            "ssContactShadowDistance": { note: "屏幕空间接触阴影距离。", sign: "f32" },
            "shadowSamplingType": { note: "阴影类型，0: PCF, 1: VSM，2: DPCF, 3: PCSS。", sign: "u32", value: [1] },

            "shadowBias": { note: "阴影，法向偏移。", sign: "f32" },
            "shadowBulbRadiusLs": { note: "阴影，光照空间的光源半径。", sign: "f32" },
            "shadowPenumbraRatioScale": { note: " 阴影，用于DPCF、PCSS，用于艺术用途的比例半影。", sign: "f32" },
            "m_reserved460": { note: "预留空间。", sign: "f32" },

            "vsmExponent": { note: "VSM阴影指数。", sign: "f32", value: [5.53999996] },
            "vsmDepthScale": { note: "用于VSM最小方差计算。", sign: "f32", value: [0.0277] },
            "vsmLightBleedReduction": { note: "VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见。", sign: "f32", value: [0.15] },
            "m_reserved476": { note: "预留空间。", sign: "f32" },

            "fogStart": { note: "", sign: "f32" },
            "fogMaxOpacity": { note: "", sign: "f32" },
            "fogHeight": { note: "", sign: "f32" },
            "fogHeightFalloff": { note: "falloff * 1.44269。", sign: "f32" },
            "fogDensity": { note: "(density/falloff)*exp(-falloff*(camera.y - fogHeight))。", sign: "f32" },
            "fogInscatteringStart": { note: "", sign: "f32" },
            "fogInscatteringSize": { note: "", sign: "f32" },
            "fogColorFromIbl": { note: "", sign: "f32" },

            // 1920===================----------------------------------

            "time": { note: "计时器（单位秒，常用于动态效果）。", sign: "f32" },
            "needsAlphaChannel": { note: "如果当前渲染目标需要用于混合，则需要分配不透明分量，保证不透明对象不透明度为1。", sign: "f32" },
            "exposure": { note: "GBUFFER中的自发光颜色和强度都是归一化存储的，使用该参数作为自发光最大曝光度。", sign: "f32", value: [10.0] },
            "lightChannels": { note: "光照通道标志集。", sign: "u32", value: [1] },

            // 1936===================----------------------------------
        };

        const propLayout = this.GenerateMaterialPropTuple(properties, {
            group: 0,
            binding: 0,
            tname: "FrameUniforms",
            vname: "frameUniforms",
            alignSize: 2048
        });

        // 计算视锥体素划分方案
        // UBO大小限制16384，纹理大小限制2048，我们尽量使用UBO更新传递数据；
        // 每个灯光使用4 * float4 = 64byte，16384 / 64 = 256，灯光数量限制256；
        // 基于灯光数量256限制，灯光ID类型为U8即1字节，则ID表长度限制16384；
        // 每个体素需要记录灯光ID表读取偏移和读取数量，其中每一项类型都是U16，16384 / 4 = 4096，体素数量限制4096
        // 视锥在Z轴上的划分段数16；

        const webgl = this._global.config.webgl;

        if (webgl) {
            const froxel_buffer_code = `
// 体素列表，每个通道4字节表示一个体素，低2字节记录引用灯光数，高2字节记录引用灯光索引表偏移
// 可表示4 * 1024 = 4096个体素
layout(std140) uniform FroxelList {
	uvec4 data[1024];
} froxelList;

// 每个通道4字节，每个字节记录一个灯光索引，则可记录4 * 4 * 1024 = 16384个灯光索引
// 每个体素索引的灯光连续存储
layout(std140) uniform LightVoxel {
	uvec4 data[1024];
} lightVoxel;

// 容纳最大256个灯光参数
layout(std140) uniform LightList {
	mat4 data[256];
} lightList;

uniform highp sampler2D colorRT;
uniform highp sampler2D depthRT;
uniform highp usampler2DArray gbRT;
uniform highp sampler2DArray atlas2D;
            `;

            propLayout.fscode += froxel_buffer_code;
        }
        else {
            const froxel_buffer_code = `
// 体素列表，每个通道4字节表示一个体素，低2字节记录引用灯光数，高2字节记录引用灯光索引表偏移
// 可表示4 * 1024 = 4096个体素
struct FroxelList {
	data : array<vec4<u32>, 1024>,
};

// 每个通道4字节，每个字节记录一个灯光索引，则可记录4 * 4 * 1024 = 16384个灯光索引
// 每个体素索引的灯光连续存储
struct LightVoxel {
    data : array<vec4<u32>, 1024>,
};

// Froxel光源参数结构
struct FroxeLight {
    // 光源颜色（线性空间）
    color : vec3<f32>,
    // 光源强度（照度，单位lux）
    lux : f32,

    // 点光源和聚光灯在全局空间中坐标
	// 太阳光：
	// X[SunAngularRadius]：太阳的角半径，太阳的实际半径与太阳到地球的距离的比值（单位为弧度，0.25°至20.0°之间，默认度数0.545°）
	// Y[SunHaloSize]：太阳的光晕半径（太阳角半径的倍数，默认值10.0）
	// Z[SunHaloFalloff]：太阳的光晕衰减（无量纲数值，用作指数，默认值80.0）
    position : vec3<f32>,
    // 点光源和聚光灯的衰减距离（影响范围，单位米。在该距离之外，光源影响为0）
    falloff : f32,

    // 光源在全局空间中方向（等同世界空间方向，指向光源）
    direction : vec3<f32>,
    // 光源其它标记，着色器中整型（[低8位]光源类型（LIGHT_TYPE）、[中低8位]光源所属通道集（仅对应通道打开时光源起作用））
    extra : f32,

    // X[InnerAngle]：聚光灯的内部圆锥角度（弧度，在~0.00873到outerAngle范围之间）
	// Y[OuterAngle]：聚光灯的外部圆锥角度（弧度，在innerAngle到0.5PI范围之间）
	spotCone : vec2<f32>,
	// 聚光灯角度衰减参数（根据spotCone计算所得）
	spotScaleOffset : vec2<f32>,
};

// 容纳最大256个灯光参数
struct LightList {
    data : array<FroxeLight, 256>,
};

@group(0) @binding(1) var<uniform> froxelList : FroxelList;
@group(0) @binding(2) var<uniform> lightVoxel : LightVoxel;
@group(0) @binding(3) var<uniform> lightList : LightList;

@group(0) @binding(4) var colorRT : texture_2d<f32>;
@group(0) @binding(5) var depthRT : texture_2d<f32>;
@group(0) @binding(6) var gbRT : texture_2d_array<u32>;
@group(0) @binding(7) var atlas2D : texture_2d_array<f32>;

@group(0) @binding(8) var spnnn1: sampler;
@group(0) @binding(9) var splln1: sampler;
@group(0) @binding(10) var spnnl1: sampler;
@group(0) @binding(11) var splll1: sampler;
@group(0) @binding(12) var splll4: sampler;
@group(0) @binding(13) var splll8: sampler;
            `;

            propLayout.fscode += froxel_buffer_code;
            propLayout.vscode += froxel_buffer_code;
        }

        const groupDesc: GPUBindGroupLayoutDescriptor = {
            label: "g0",
            entries: [
                {// frameUniforms
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        hasDynamicOffset: true
                    }
                },
                {// froxelList
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {// lightVoxel
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {// lightList
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },

                {// colorRT
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d"
                    }
                },
                {// depthRT
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "unfilterable-float",
                        viewDimension: "2d"
                    }
                },
                {// gbRT
                    binding: 6,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "uint",
                        viewDimension: "2d-array"
                    }
                },
                {// Atlas
                    binding: 7,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d-array"
                    }
                },

                {// spnnn1
                    binding: 8,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "non-filtering"
                    }
                },
                {// splln1
                    binding: 9,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {// spnnl1
                    binding: 10,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {// splll1
                    binding: 11,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {// splll4
                    binding: 12,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {// splll8
                    binding: 13,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                }
            ]
        };

        propLayout.layout = this._global.device.device.createBindGroupLayout(groupDesc);

        this._shaders.list[1] = {
            id: 1,
            name: "default_g0",
            asset: null,
            branchKeys: null,
            refCount: 1,

            ...propLayout
        };

        return 1;
    }

    /**
     * 构建资源绑定组布局。
     * @returns 返回资源绑定组布局ID。
     */
    private GenerateGroupLayout_G1() {

        // 我们手动编排G1统一缓存结构
        // 网格变形目标数据贴图跟随G1绑定

        let code = "";

        const webgl = this._global.config.webgl;

        if (webgl) {
            code = `
layout(std140) uniform BonesUniforms {
    mat4 bones[256];
} bonesUniforms;

layout(std140) uniform ObjectUniforms {
    mat4 wfmMat;
    mat3x4 normal_wfmMat;
    uint id;
    uint flags;
    uint layers;
    uint user;

    vec4 bbCenter;
    vec4 bbExtents;

    uvec4 unused;
    uvec4 morphSampler;

    float weights[16];

    // 注意：
    // 标准对象数据缓存256字节大小，虽然后96字节不应该在着色器中访问，但仍须补齐6个VEC4变量
    // 另外，如果对象包含网格变形，在256字节之后紧接这网格变形权重数据
    // 网格变形权重数量等同网格形变目标总数，所有子网格共享这些网格形变目标
    // 网格变形权重数据紧邻ObjectUniforms之后存储，并且声明空间容量为64的倍数，以此减少分支数量
    // 需要定义MORPH_WEIGHTS_CAPACITY宏类声明权重空间容量
    // 需要在G2绑定对象中设置变形目标数据贴图
    // 补充说明：
    // 每个子网格的[变形目标数据贴图地址、变形顶点数量、变形目标数量、子网格各变形目标权重读取偏移]记录在网格资源中
    // 网格资源装载时会合并所有配置的变形目标数据到一个数据贴图中，并记录变形目标总量，变形顶点数量等于网格顶点数量
    // 不同子网格可以为所有变形目标应用不同的变形权重，所以变形目标权重空间大小 = 子网格数量 * 变形目标总量
    // 特别注意：
    // 内核实现仅分配了与变形目标总量相同的权重空间
    // 因为[变形目标数据贴图地址、变形顶点数量、变形目标数量、子网格各变形目标权重读取偏移]需要通过ObjectUniforms传递，在所有子网格间共享
    // 并且通常带有变形的网格只有1个子网格，或者通常所有子网格应用相同的变形权重
    // 所以我们约束[子网格各变形目标权重读取偏移 == 0]，在实例化网格资源时请注意将该字段置零
    // 首个VEC4记录(ivec4 morphINFO)[数据贴图宽度、变形顶点数量、变形目标数量、子网格各变形目标权重读取偏移]
    // TODO：此处数据结构需要优化，应当定义一个子结构

} objectUniforms;

uniform highp sampler2D morphTG;
            `;
        }
        else {
            code = `
struct BonesUniforms {
    bones : array<mat4x4<f32>, 256>,
};

struct ObjectUniforms {
    wfmMat : mat4x4<f32>,
    normal_wfmMat : mat3x4<f32>,
    id : u32,
    flags : u32,
    layers : u32,
    user : u32,

    bbCenter : vec4<f32>,
    bbExtents : vec4<f32>,

    unused : vec4<u32>,
    morphSampler : vec4<u32>,

    morphWeights : mat4x4<f32>,
};

@group(1) @binding(0) var<uniform> bonesUniforms : BonesUniforms;
@group(1) @binding(1) var<uniform> objectUniforms : ObjectUniforms;

@group(1) @binding(3) var morphTG : texture_2d<f32>;
@group(1) @binding(4) var iblSpecular : texture_2d<f32>;
            `;
        }

        // 编排后的属性列表

        class PropView {
            public constructor(master: ConstructorParameters<Miaoverse.PropTuple["view"]>[0]) {
                this.master = master;
            }

            public master: ConstructorParameters<Miaoverse.PropTuple["view"]>[0];
        }

        const list: Miaoverse.PropVar[] = [
            {
                index: 0,
                sort: 0,
                offset: 0,
                size: 64,
                decl: {
                    name: "wfmMat",
                    note: "模型转世界空间变换矩阵",
                    sign: "mat4x4<f32>",
                    value: [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0],
                    type: Miaoverse.PropType.mat4x4,
                    format: Miaoverse.PropFormat.f32
                }
            },
            {
                index: 1,
                sort: 1,
                offset: 64,
                size: 48,
                decl: {
                    name: "normal_wfmMat",
                    note: "模型转世界空间法线变换矩阵",
                    sign: "mat3x4<f32>",
                    value: [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0],
                    type: Miaoverse.PropType.mat3x3,
                    format: Miaoverse.PropFormat.f32
                }
            },
            {
                index: 2,
                sort: 2,
                offset: 112,
                size: 4,
                decl: {
                    name: "id",
                    note: "对象ID",
                    sign: "u32",
                    value: [0],
                    type: Miaoverse.PropType.vec1,
                    format: Miaoverse.PropFormat.u32
                }
            },
            {
                index: 3,
                sort: 3,
                offset: 116,
                size: 4,
                decl: {
                    name: "flags",
                    note: "对象标志集",
                    sign: "u32",
                    value: [0],
                    type: Miaoverse.PropType.vec1,
                    format: Miaoverse.PropFormat.u32
                }
            },
            {
                index: 4,
                sort: 4,
                offset: 120,
                size: 4,
                decl: {
                    name: "layers",
                    note: "对象层标志集",
                    sign: "u32",
                    value: [0],
                    type: Miaoverse.PropType.vec1,
                    format: Miaoverse.PropFormat.u32
                }
            },
            {
                index: 5,
                sort: 5,
                offset: 124,
                size: 4,
                decl: {
                    name: "user",
                    note: "用户数据ID",
                    sign: "u32",
                    value: [0],
                    type: Miaoverse.PropType.vec1,
                    format: Miaoverse.PropFormat.u32
                }
            },
            {
                index: 6,
                sort: 6,
                offset: 128,
                size: 16,
                decl: {
                    name: "bbCenter",
                    note: "包围盒中心坐标",
                    sign: "vec4<f32>",
                    value: [0.0, 0.0, 0.0, 0.0],
                    type: Miaoverse.PropType.vec4,
                    format: Miaoverse.PropFormat.f32
                }
            },
            {
                index: 7,
                sort: 7,
                offset: 144,
                size: 16,
                decl: {
                    name: "bbExtents",
                    note: "包围盒延展大小",
                    sign: "vec4<f32>",
                    value: [1.0, 1.0, 1.0, 1.0],
                    type: Miaoverse.PropType.vec4,
                    format: Miaoverse.PropFormat.f32
                }
            }
        ];

        const env = this._global.env;

        for (let prop of list) {
            Object.defineProperty(PropView.prototype, prop.decl.name, {
                enumerable: true,
                configurable: false,
                set(value: number[]) {
                    const master = this.master as ConstructorParameters<Miaoverse.PropTuple["view"]>[0];
                    env.arraySet(prop.decl.format, master.blockPtr, prop.offset >> 2, value);
                    master.updated = true;
                },
                get() {
                    return env.arrayGet(prop.decl.format, this.master.blockPtr as never, prop.offset >> 2, prop.size >> 2);
                }
            });
        }

        const propLayout: Miaoverse.PropLayout = {
            group: 1,
            tuple: {
                vars: list,
                size: 256,
                view: PropView as any,
            },
            vscode: code,
            fscode: code,
        };

        const groupDesc: GPUBindGroupLayoutDescriptor = {
            label: "g1",
            entries: [
                {// bonesUniforms
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        hasDynamicOffset: true
                    }
                },
                {// objectUniforms
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {// morphTG
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d"
                    }
                },
                {// iblSpecular
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d"
                    }
                }
            ]
        };

        propLayout.layout = this._global.device.device.createBindGroupLayout(groupDesc);

        this._shaders.list[2] = {
            id: 2,
            name: "default_g1",
            asset: null,
            branchKeys: null,
            refCount: 1,

            ...propLayout
        };

        return 2;
    }

    /**
     * 创建着色器管线实例。
     * @param desc 着色器管线描述符。
     * @returns 返回着色器管线实例ID。
     */
    public CreateRenderPipeline(desc: Context["_pipelines"]["list"][0]["params"]) {
        const key = `${desc.g1}-${desc.g2}-${desc.g3}-${desc.topology}-${desc.frontFace}-${desc.cullMode}-` + desc.flags;

        let id = this._pipelines.lut[key];
        if (id) {
            return id;
        }

        // ==========================---------------------------------------------

        const g0 = this._shaders.list[1]; // TODO: 我们约束了G0的定义
        const g1 = this._shaders.list[desc.g1];
        const g2 = this._shaders.list[desc.g2];
        const g3 = this._shaders.list[desc.g3];

        const pipelineLDesc = {
            label: `pll:${desc.g1}-${desc.g2}-${desc.g3}`,
            bindGroupLayouts: [] as GPUBindGroupLayout[],
        };

        if (g0 && g0.layout) {
            pipelineLDesc.bindGroupLayouts.push(g0.layout);
        }

        if (g1 && g1.layout) {
            pipelineLDesc.bindGroupLayouts.push(g1.layout);
        }

        if (g2 && g2.layout) {
            pipelineLDesc.bindGroupLayouts.push(g2.layout);
        }

        if (g3 && g3.layout) {
            pipelineLDesc.bindGroupLayouts.push(g3.layout);
        }
        else if (g2.custom_g3) {
            pipelineLDesc.bindGroupLayouts.push(g2.custom_g3);
        }

        const pipelineLayout = this._global.device.device.createPipelineLayout(pipelineLDesc);

        // ==========================---------------------------------------------

        const shaderModules = this.CompileShaderModule(g2, g0, g1, g3);

        // ==========================---------------------------------------------

        const blendMode = desc.flags >> RENDER_FLAGS.BLEND_MODE_INDEX;

        const constants: Record<string, number> = {
            "VARIANT_NEEDS_MORPHING": (desc.flags & RENDER_FLAGS.MORPHING) ? 1 : 0,
            "VARIANT_NEEDS_SKINNING": (desc.flags & RENDER_FLAGS.SKINNING) ? 1 : 0,
            "VARIANT_HAS_DOUBLESIDED": (desc.flags & RENDER_FLAGS.HAS_DOUBLE_SIDED) ? 1 : 0,
            "VARIANT_HAS_SHADOWING": ((desc.flags & RENDER_FLAGS.CAST_SHADOWS) || (desc.flags & RENDER_FLAGS.RECEIVE_SHADOWS)) ? 1 : 0,

            "BLEND_MODE_MASKED": (blendMode == BLEND_MODE.MASKED) ? 1 : 0,
            "BLEND_MODE_TRANSPARENT": (blendMode == BLEND_MODE.TRANSPARENT) ? 1 : 0,
            "BLEND_MODE_FADE": (blendMode == BLEND_MODE.FADE) ? 1 : 0,

            ...g2.asset.settings,
        };

        // ==========================---------------------------------------------

        let vsmain = "vsmain_0";
        let fsmain = "";
        let vbLayout: GPUVertexBufferLayout[] = [];

        if ((desc.flags & RENDER_FLAGS.ATTRIBUTES0) == RENDER_FLAGS.ATTRIBUTES0) {
            vbLayout.push({
                arrayStride: 16,
                stepMode: "vertex",
                attributes: [
                    /** 顶点位置，W存储UV的归一化系数。 */
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "snorm16x4"
                    },
                    /** 顶点法线、切线。 */
                    {
                        shaderLocation: 1,
                        offset: 8,
                        format: "snorm8x4"
                    },
                    /** 顶点UV。 */
                    {
                        shaderLocation: 2,
                        offset: 12,
                        format: "snorm16x2"
                    }
                ]
            });

            vsmain = "vsmain_1";
        }

        if ((desc.flags & RENDER_FLAGS.ATTRIBUTES1) == RENDER_FLAGS.ATTRIBUTES1) {
            vbLayout.push({
                arrayStride: 8,
                stepMode: "vertex",
                attributes: [
                    /** 顶点骨骼。 */
                    {
                        shaderLocation: 3,
                        offset: 0,
                        format: "uint8x4"
                    },
                    /** 顶点骨骼蒙皮权重。 */
                    {
                        shaderLocation: 4,
                        offset: 4,
                        format: "unorm8x4"
                    }
                ]
            });

            vsmain = "vsmain_3";
        }

        if (vbLayout.length == 0 || (desc.flags & RENDER_FLAGS.DRAW_ARRAYS) == RENDER_FLAGS.DRAW_ARRAYS) {
            vbLayout = undefined;
            vsmain = "vsmain_0";
        }
        else if (vbLayout.length > 0) {
            // 内置顶点布局始终包含实例数据
            vbLayout.push(this._global.resources.MeshRenderer.instanceVBL);
        }

        if (g2.asset.vertex_buffers) {
            // 使用自定义顶点缓存布局
            vbLayout = g2.asset.vertex_buffers;
            vsmain = "vsmain_X";
        }

        // ==========================---------------------------------------------

        const pipelineDesc: GPURenderPipelineDescriptor = {
            label: key,
            layout: pipelineLayout,
            vertex: {
                buffers: vbLayout,

                module: shaderModules[0],
                entryPoint: vsmain,
                constants: constants
            },
            fragment: {
                targets: [],

                module: shaderModules[1],
                entryPoint: fsmain,
                constants: constants
            },
            depthStencil: g2.asset.depth_stencil as any,
            primitive: {
                topology: this._topologyLut[desc.topology],
                frontFace: desc.frontFace ? "cw" : "ccw"
            }
        };

        // ==========================---------------------------------------------

        id = this._pipelines.freeId;

        if (this._pipelines.list[id]) {
            this._pipelines.freeId = this._pipelines.list[id].id;
        }
        else {
            this._pipelines.freeId++;
        }

        this._pipelines.list[id] = {
            key,
            id,
            params: desc,
            shaderModules,
            pipelineLayout,
            pipelineDesc,
            pipelines: []
        };

        this._pipelines.lut[key] = id;

        this._pipelines.usedCount += 1;

        // ==========================---------------------------------------------

        return id;
    }

    /**
     * 获取对应帧通道使用的GPU着色器管线实例。
     * @param id 着色器管线实例ID。
     * @param framePass 帧通道配置。
     * @param materialSlot 材质槽索引。
     * @returns 返回GPU着色器管线实例。
     */
    public GetRenderPipeline(id: number, framePass: Miaoverse.GLFramePass, materialSlot: number) {
        const entry = this._pipelines.list[id];
        if (!entry) {
            return null;
        }

        materialSlot = Math.min(materialSlot || 0, 255);

        if (!entry.pipelines[framePass.index]) {
            entry.pipelines[framePass.index] = [];
        }

        let pipeline = entry.pipelines[framePass.index][materialSlot];
        if (pipeline) {
            return pipeline;
        }

        // ==========================---------------------------------------------

        let cullMode: GPUCullMode = "none";

        if (entry.params.cullMode) {
            if (framePass.invertCull) {
                cullMode = entry.params.cullMode == 1 ? "front" : "back";
            }
            else {
                cullMode = entry.params.cullMode == 1 ? "back" : "front";
            }
        }

        // ==========================---------------------------------------------

        let fsmain = framePass.depthCtrl ? "fsmain_d" : "fsmain_";

        const targets: GPUColorTargetState[] = [];
        const blendMode = entry.params.flags >> RENDER_FLAGS.BLEND_MODE_INDEX;

        if (framePass.colorAttachments) {
            let blend: GPUBlendState = undefined;

            switch (blendMode) {
                case BLEND_MODE.TRANSPARENT:
                case BLEND_MODE.FADE:
                    blend = {
                        color: {
                            operation: "add",
                            srcFactor: "one",
                            dstFactor: "one-minus-src-alpha"
                        },
                        alpha: {
                            operation: "add",
                            srcFactor: "one",
                            dstFactor: "one-minus-src-alpha"
                        }
                    }
                    break;
                case BLEND_MODE.ADD:
                    blend = {
                        color: {
                            operation: "add",
                            srcFactor: "one",
                            dstFactor: "one"
                        },
                        alpha: {
                            operation: "add",
                            srcFactor: "one",
                            dstFactor: "one"
                        }
                    };
                    break;
                case BLEND_MODE.MULTIPLY:
                case BLEND_MODE.SCREEN:
                default:
                    break;
            }

            for (let target of framePass.colorAttachments) {
                fsmain += target.format.endsWith("uint") ? "u" : "f";

                targets.push({
                    format: target.format,
                    writeMask: target.writeMask,
                    blend: target.blend === undefined ? blend : (target.blend ? target.blend : undefined)
                });
            }
        }

        // ==========================---------------------------------------------

        const pipelineDesc_ = entry.pipelineDesc;

        const pipelineDesc: GPURenderPipelineDescriptor = {
            label: framePass.label + ":" + pipelineDesc_.label,
            layout: pipelineDesc_.layout,
            vertex: {
                ...pipelineDesc_.vertex
            },
            primitive: {
                topology: pipelineDesc_.primitive.topology,
                frontFace: pipelineDesc_.primitive.frontFace,
                cullMode: cullMode,
                unclippedDepth: framePass.unclippedDepth
            },
            multisample: framePass.multisample
        };

        if (framePass.colorAttachments) {
            pipelineDesc.fragment = {
                targets: targets,

                module: pipelineDesc_.fragment.module,
                entryPoint: fsmain,
                constants: pipelineDesc_.fragment.constants
            };
        }

        if (framePass.depthStencilAttachment) {
            pipelineDesc.depthStencil = {
                ...framePass.depthStencilAttachment,
                ...pipelineDesc_.depthStencil
            };
        }

        if (framePass.shaderMacro) {
            pipelineDesc.vertex.constants = {
                ...pipelineDesc.vertex.constants,
                ...framePass.shaderMacro
            };

            pipelineDesc.fragment.constants = {
                ...pipelineDesc.fragment.constants,
                ...framePass.shaderMacro
            };
        }

        pipelineDesc.vertex.constants["MATERIAL_SLOT"] = materialSlot;
        pipelineDesc.fragment.constants["MATERIAL_SLOT"] = materialSlot;

        pipeline = entry.pipelines[framePass.index][materialSlot] = this._global.device.device.createRenderPipeline(pipelineDesc);

        // ==========================---------------------------------------------

        console.info("create new pipeline", fsmain, pipeline.label);

        return pipeline;
    }

    /**
     * 编译着色器分支实例。
     * @param shader 着色器实例。
     * @returns 返回着色器模块。
     */
    public CompileShaderModule(shader: Miaoverse.Shader, g0: Miaoverse.Shader, g1: Miaoverse.Shader, g3: Miaoverse.Shader) {
        if (shader.module) {
            return shader.module;
        }

        const macro = `
let SHADING_CAST_SHADOW_ = SHADING_CAST_SHADOW;
let SHADING_EARLYZ_ = SHADING_EARLYZ;
let SHADING_ONLY_OPACITY_ = SHADING_ONLY_OPACITY;
let SHADING_DITHERING_TRANSPARENT_ = SHADING_DITHERING_TRANSPARENT;
let SHADING_MASKED_ALPHA_TO_COVERAGE_ = SHADING_MASKED_ALPHA_TO_COVERAGE;
let SHADING_OUTPUT_LINEAR_ = SHADING_OUTPUT_LINEAR;
let SHADING_SKIP_ = SHADING_SKIP;

let VARIANT_NEEDS_MORPHING_ = VARIANT_NEEDS_MORPHING;
let VARIANT_NEEDS_SKINNING_ = VARIANT_NEEDS_SKINNING;
let VARIANT_HAS_DOUBLESIDED_ = VARIANT_HAS_DOUBLESIDED;
let VARIANT_HAS_SHADOWING_ = VARIANT_HAS_SHADOWING;

let BLEND_MODE_MASKED_ = BLEND_MODE_MASKED;
let BLEND_MODE_TRANSPARENT_ = BLEND_MODE_TRANSPARENT;
let BLEND_MODE_FADE_ = BLEND_MODE_FADE;

let MATERIAL_SLOT_ = MATERIAL_SLOT;
        `;

        const vsmain = `
fn defend_override() {
    ${macro}
}

@vertex fn vsmain_0(vertex: InputVS_0) ->OutputVS {
    ${macro}

    init_vertex_0(vertex);

    return material_vs();
}

@vertex fn vsmain_1(vertex: InputVS_1) ->OutputVS {
    ${macro}

    init_vertex_1(vertex);

    return material_vs();
}

@vertex fn vsmain_3(vertex: InputVS_3) ->OutputVS {
    ${macro}

    init_vertex_3(vertex);

    return material_vs();
}
        `;

        const fs_output = `
var<private> fragColor0: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);
var<private> fragColor1: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);

var<private> fragData0: vec4<u32> = vec4<u32>(0u);
var<private> fragData1: vec4<u32> = vec4<u32>(0u);

var<private> fragDepth: f32 = 1.0;
        `;

        const fs_common_body = `
    ${macro}

    varyings_init(frag);

    material_fs();

    // 非已经在材质方法中设置了输出值（比如SHADING_CAST_SHADOW、SHADING_EARLYZ帧通道）
    if (!SHADING_SKIP) {
        shading_fs();
    }
        `;

        const fsmain = `
@fragment fn fsmain_f(frag: InputFS) -> @location(0) vec4f {
    ${fs_common_body}
    return fragColor0;
}

@fragment fn fsmain_u(frag: InputFS) -> @location(0) vec4<u32> {
    ${fs_common_body}
    return fragData0;
}

@fragment fn fsmain_d(frag: InputFS) -> @builtin(frag_depth) f32 {
    ${fs_common_body}
    return fragDepth;
}

struct OutputFS_DF {
    @location(0) gl_FragColor: vec4<f32>,
    @builtin(frag_depth) gl_FragDepth: f32,
};

@fragment fn fsmain_df(frag: InputFS) -> OutputFS_DF {
    ${fs_common_body}
    var output: OutputFS_DF;
    output.gl_FragColor = fragColor0;
    output.gl_FragDepth = fragDepth;

    return output;
}

struct OutputFS_DU {
    @location(0) gl_FragData: vec4<u32>,
    @builtin(frag_depth) gl_FragDepth: f32,
};

@fragment fn fsmain_du(frag: InputFS) -> OutputFS_DU {
    ${fs_common_body}
    var output: OutputFS_DU;
    output.gl_FragData = fragData0;
    output.gl_FragDepth = fragDepth;

    return output;
}
        `;

        const vsg0 = g0?.vscode || "";
        const vsg1 = g1?.vscode || "";
        const vsg2 = shader?.vscode || "";
        const vsg3 = g3?.vscode || "";

        const fsg0 = g0?.fscode || "";
        const fsg1 = g1?.fscode || "";
        const fsg2 = shader?.fscode || "";
        const fsg3 = g3?.fscode || "";

        const vscode = [vsg0, vsg1, vsg2, vsg3, shader.asset.codes.vertex.code, vsmain].join("");
        const fscode = [fs_output, fsg0, fsg1, fsg2, fsg3, shader.asset.codes.material.code, shader.asset.codes.shading.code, fsmain].join("");

        const vsmodule = this._global.device.device.createShaderModule({
            code: vscode,
        });

        const fsmodule = this._global.device.device.createShaderModule({
            code: fscode,
        });

        shader.module = [vsmodule, fsmodule, undefined];

        return shader.module;
    }

    /**
     * 批量绑定网格顶点缓存。
     * @param vertexArray 顶点数组对象ID（WebGL使用）。
     * @param buffers 顶点缓存数组。
     * @param passEncoder 渲染通道命令编码器。
     * @returns 返回顶点数组对象ID（WebGL使用）。
     */
    public SetVertexBuffers(vertexArray: number, buffers: {
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
    }[], passEncoder: GPURenderPassEncoder): number {
        for (let vb of buffers) {
            this.SetVertexBuffer(vb.index, vb.buffer, vb.offset, vb.size, passEncoder);
        }

        return 0;
    }

    /**
     * 设置顶点缓存。
     * @param slot 顶点缓存插槽。
     * @param bufferID 顶点缓存ID。
     * @param offset 顶点缓存绑定字节偏移。
     * @param size 顶点缓存绑定字节大小。
     * @param passEncoder 渲染通道命令编码器。
     */
    public SetVertexBuffer(slot: number, bufferID: number, offset: number, size: number, passEncoder: GPURenderPassEncoder): void {
        const buffer = this._global.device["_buffers"].list[bufferID];
        passEncoder.setVertexBuffer(slot, buffer.buffer, offset, size);
    }

    /**
     * 设置索引缓存。
     * @param format 索引格式（2/4）。
     * @param buffer 索引缓存绑定描述。
     * @param passEncoder 渲染通道命令编码器。
     */
    public SetIndexBuffer(format: number, buffer: {
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }, passEncoder: GPURenderPassEncoder): void {
        const buffer_ = this._global.device["_buffers"].list[buffer.buffer].buffer;

        passEncoder.setIndexBuffer(buffer_, format === 2 ? "uint16" : "uint32", buffer.offset, buffer.size);
    }

    /**
     * 创建资源组绑定对象实例。
     * @param uniform 统一资源组实例。
     * @returns 返回绑定对象实例。
     */
    public CreateBindGroup(uniform: Miaoverse.FrameUniforms | Miaoverse.Material | Miaoverse.MeshRenderer) {
        const shader = this._shaders.list[uniform.layoutID];
        if (!shader) {
            this._global.Track("Context.CreateBindGroup: 无效着色器实例ID=" + uniform.layoutID + "！", 3);
            return null;
        }

        const device = this._global.device;
        const buffer = device.GetBuffer(uniform.bufferID);
        if (!buffer) {
            this._global.Track("Context.CreateBindGroup: 无效缓存实例ID=" + uniform.bufferID + "！", 3);
            return null;
        }

        const bindingDesc: GPUBindGroupDescriptor = {
            label: "",
            layout: shader.layout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: buffer.buffer,
                        offset: 0,
                        size: uniform.size
                    }
                }
            ]
        };

        const entries = bindingDesc.entries as GPUBindGroupEntry[];

        if (uniform.group == 0) {
            const frameUniforms = uniform as Miaoverse.FrameUniforms;

            const froxelList = frameUniforms.g0_froxelList;
            const lightVoxel = frameUniforms.g0_lightVoxel;
            const lightList = frameUniforms.g0_lightList;

            const colorRT = device.GetTextureRT(frameUniforms.g0_colorRT);
            const depthRT = device.GetTextureRT(frameUniforms.g0_depthRT);
            const gbufferRT = device.GetTextureRT(frameUniforms.g0_gbufferRT);

            entries.push({
                binding: 1,
                resource: {
                    buffer: device.GetBuffer(froxelList.bufferID).buffer,
                    offset: froxelList.offset,
                    size: froxelList.size
                }
            });

            entries.push({
                binding: 2,
                resource: {
                    buffer: device.GetBuffer(lightVoxel.bufferID).buffer,
                    offset: lightVoxel.offset,
                    size: lightVoxel.size
                }
            });

            entries.push({
                binding: 3,
                resource: {
                    buffer: device.GetBuffer(lightList.bufferID).buffer,
                    offset: lightList.offset,
                    size: lightList.size
                }
            });


            entries.push({
                binding: 4,
                resource: colorRT.view
            });

            entries.push({
                binding: 5,
                resource: depthRT.view
            });

            entries.push({
                binding: 6,
                resource: gbufferRT.view
            });

            entries.push({
                binding: 7,
                resource: uniform["atlas2D"]
            });

            for (let i = 0; i < 6; i++) {
                entries.push({
                    binding: 8 + i,
                    resource: device.GetSampler(this._builtinSampler[i]).sampler
                });
            }
        }
        else if (uniform.group == 1) {
            const meshRenderer = uniform as Miaoverse.MeshRenderer;

            const morphTargetsID = meshRenderer.g1_morphTargets;
            const morphTargets = this._global.device.GetTexture2D(morphTargetsID || this._global.resources.Texture.default2D.internalID);

            entries[0] = {
                binding: 0,
                resource: {
                    buffer: device.GetBuffer(meshRenderer.boneBuffer)?.buffer || buffer.buffer,
                    offset: 0,
                    size: 64 * 256
                }
            };

            entries[1] = {
                binding: 1,
                resource: {
                    buffer: buffer.buffer,
                    offset: uniform.offset,
                    size: uniform.size
                }
            };

            entries.push({
                binding: 3,
                resource: morphTargets.view
            });

            entries.push({
                binding: 4,
                resource: this._global.assembly.default_iblSpecular
            });
        }
        else if (uniform.group == 2) {
            const vars = uniform.tuple.vars;
            const default2D = this._global.device.GetTexture2D(this._global.resources.Texture.default2D.internalID);

            for (let var_ of vars) {
                const texid = var_.decl.texture;

                if (texid !== undefined) {
                    const binding = texid * 2 + 2;
                    const resid = uniform.view[var_.decl.name][0];
                    const res = this._global.resources.Texture.GetInstanceByID(resid);
                    const tex = res ? this._global.device.GetTexture2D(res.internalID) : default2D;

                    entries.push({
                        binding: binding + 0,
                        resource: tex.view
                    });

                    entries.push({
                        binding: binding + 1,
                        resource: device.GetSampler(this._builtinSampler[0]).sampler
                    });
                }
            }
        }

        const binding = device.device.createBindGroup(bindingDesc);
        if (!binding) {
            this._global.Track("Context.CreateBindGroup: 资源组绑定对象创建失败！", 3);
            return null;
        }

        return { id: 1, binding: binding, offset: uniform.group == 1 ? (uniform as Miaoverse.MeshRenderer).boneArrayStart * 64 : uniform.offset };
    }

    /**
     * 创建自定义资源组G3绑定对象实例。
     * @param uniform 统一资源组实例。
     * @param entries 资源实例引用。
     * @returns 返回绑定对象实例。
     */
    public CreateBindGroupCustom(uniform: Miaoverse.Material, entries: GPUBindGroupEntry[]) {
        const shader = this._shaders.list[uniform.layoutID];
        if (!shader) {
            this._global.Track("Context.CreateBindGroup: 无效着色器实例ID=" + uniform.layoutID + "！", 3);
            return null;
        }

        if (!shader.custom_g3) {
            this._global.Track(`Context.CreateBindGroupCustom: 当前着色器（${shader.name}）未自定义G3`, 3);
            return null;
        }

        const bindingDesc: GPUBindGroupDescriptor = {
            label: "",
            layout: shader.custom_g3,
            entries: entries
        };

        const binding = this._global.device.device.createBindGroup(bindingDesc);
        if (!binding) {
            this._global.Track("Context.CreateBindGroupCustom: 资源组绑定对象创建失败！", 3);
            return null;
        }

        return { id: 1, binding: binding, offset: 0 };
    }

    /**
     * 获取着色器实例。
     * @param id 着色器实例ID。
     * @returns 返回着色器实例。
     */
    public GetShader(id: number) {
        return this._shaders.list[id];
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** G0内置的采样器ID列表。 */
    private _builtinSampler: number[];
    /** 材质属性类型描述查找表。 */
    private _materialPropTypeDescLut: Record<string, MaterialPropTypeDesc> = {} as any;
    /** 贴图属性签名解析相关查找表。 */
    private _texturePropTypeDescLut = {
        typeList: ["texture_1d", "texture_2d", "texture_2d_array", "texture_cube", "texture_cube_array", "texture_3d"],
        dimList: ["1d", "2d", "2d-array", "cube", "cube-array", "3d"] as GPUTextureViewDimension[],
        formatList: ["<i32>", "<u32>", "<f32>"],
        sampleList: ["sint", "uint", "float"] as GPUTextureSampleType[]
    };
    /** 图元类型查找表。 */
    private _topologyLut: GPUPrimitiveTopology[] = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];

    /** 着色器实例容器。 */
    private _shaders = {
        /** 当前可分配ID（[1-4]项用于记录预定义的资源绑定组布局）。 */
        freeId: 5,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 着色器实例容器。 */
        list: [null] as Miaoverse.Shader[],
    };
    /** 着色器管线实例容器。 */
    private _pipelines = {
        /** 当前可分配ID。 */
        freeId: 1,
        /** 当前实例数量。 */
        usedCount: 0,
        /** 当前实例总大小。 */
        usedSize: 0,
        /** 着色器管线实例容器。 */
        list: [null] as {
            /** 着色器管线键。 */
            key: string;
            /** 着色器管线ID。 */
            id: number;
            /** 着色器管线创建参数。 */
            params: {
                /** 资源绑定组布局1的ID（shaderID）。 */
                g1: number;
                /** 资源绑定组布局2的ID（shaderID）。 */
                g2: number;
                /** 资源绑定组布局3的ID（shaderID）。 */
                g3: number;

                /** 渲染设置标记集（材质与网格渲染器共同设置）。 */
                flags: number;
                /** 图元类型（子网格设置）。 */
                topology: number;

                /** 正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0。网格渲染器设置）。*/
                frontFace: number;
                /** 多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1。网格渲染器设置）。*/
                cullMode: number;
            };
            /** 着色器实例列表。 */
            shaderModules: GPUShaderModule[];
            /** 着色器管线资源布局实例。 */
            pipelineLayout: GPUPipelineLayout;
            /** 着色器管线描述符。 */
            pipelineDesc: GPURenderPipelineDescriptor;
            /** GPU着色器管线实例列表（每个帧通道对应使用一个实例）。 */
            pipelines: GPURenderPipeline[][];
        }[],
        /** 着色器管线实例查找表。 */
        lut: {} as Record<string, number>,
    };
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
export const enum RENDER_QUEUE {
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
export const enum RENDER_QUEUE_RANGE {
    /** -1 */
    NONE,
    /** [0, 2500] */
    OPAQUE,
    /** [2501, 5000] */
    TRANSPARENT,
    /** [0, 5000] */
    ALL,
}

/** 材质混合模式。 */
export const enum BLEND_MODE {
    /**
     * 禁用混合，A通道被忽略，用于渲染不透明对象。
     */
    OPAQUE = 0,
    /**
     * 禁用混合，启用alpha测试，在不透明渲染通道中使用，透明顺序无关，当alpha值小于阈值时，片元被丢弃，否则写入片元颜色；
     * 启用ALPHA_TO_COVERAGE标记可以使内部颜色根据不透明度平滑过渡到边缘，设置GPUMultisampleState.alphaToCoverageEnabled启用；
     * Alpha to coverage是基于MSAA的技术，A值会影响样点遮挡信息（coverage）的计算，从而影响写入的颜色比例；
     */
    MASKED,
    /**
     * 开启混合，该混合模式采用预乘不透明度；
     * RGB_target = (A_src * RGB_src) + (A_target * RGB_target) * (1.0 - A_src)；A * RGB即为预乘不透明度；
     * 渲染目标是预乘的、片元也是预乘的，硬件执行混合操作RGB_target = RGB_src + RGB_target * (1.0 - A_src)，其结果也是预乘的；
     * 所以仅需要保证初始渲染目标状态是预乘的，写入的片元也是预乘的即可保证混合效果一致；
     */
    TRANSPARENT,
    /**
     * 开启混合，与BLEND_MODE_TRANSPARENT模式类似；
     * 参数material.baseColor的值是预乘不透明度的，所以不透明度影响了散射率和反射率，从而影响光照效果；
     * 该模式将消除baseColor的预乘，不透明度在不影响光照计算结果的情况下实现对象渐隐渐显的效果；
     */
    FADE,
    /**
     * 开启混合，采用预乘不透明度，执行混合操作RGB_target = RGB_src + RGB_target；
     * 用于火焰、蒸气、全息等效果；
     */
    ADD,
    /**
     * 开启混合，采用预乘不透明度，执行混合操作RGB_target = RGB_src * RGB_target；
     * 使渲染缓存内容变暗，用于某些粒子效果；
     */
    MULTIPLY,
    /**
     * 开启混合，采用预乘不透明度，执行混合操作RGB_target += RGB_src * (1.0 - RGB_target)；
     * 使渲染缓存内容变亮；
     */
    SCREEN
}

/** 渲染设置标记。 */
export const enum RENDER_FLAGS {
    /** 包含顶点缓存布局0中定义的顶点属性（坐标、法线、切线、UV）。 */
    ATTRIBUTES0 = 0x1,
    /** 包含顶点缓存布局1中定义的顶点属性（骨骼索引、骨骼权重）。 */
    ATTRIBUTES1 = 0x2,
    /** 包含顶点缓存布局2中定义的顶点属性（保留，未使用）。 */
    ATTRIBUTES2 = 0x4,
    /** 使用DrawArrays方法绘制材质，该方法绘制不依赖顶点缓存和索引缓存，材质必须包含drawCount属性。 */
    DRAW_ARRAYS = 0x8,

    /** 投射阴影。 */
    CAST_SHADOWS = 0x10,
    /** 接收阴影。 */
    RECEIVE_SHADOWS = 0x20,
    /** 骨骼蒙皮。 */
    SKINNING = 0x40,
    /** 子网格形变。 */
    MORPHING = 0x80,

    // 上半部分为网格渲染器级别定义，下半部分为材质级别定义 ============-------------------------

    /** 启用双面渲染。 */
    HAS_DOUBLE_SIDED = 0x800000,

    /** 启用自发光效果。 */
    HAS_EMISSIVE = 0x1000000,
    /** 启用反射效果。 */
    HAS_REFLECTIONS = 0x2000000,
    /** 启用清漆层效果。 */
    HAS_CLEAR_COAT = 0x4000000,
    /** 启用各向异性效果。 */
    HAS_ANISOTROPY = 0x8000000,

    /** 最高4位记录混合模式索引。 */
    BLEND_MODE_INDEX = 28,
}
