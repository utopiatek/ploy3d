export class Context {
    constructor(_global) {
        this._global = _global;
    }
    async Init() {
        const mptdLut = this._materialPropTypeDescLut;
        const tptdLut = this._texturePropTypeDescLut;
        mptdLut["i32"] = {
            signGLSL: "int",
            signWGSL: "i32",
            type: 1,
            format: 1,
            size: 4,
            get default_() { return [0]; }
        };
        mptdLut["u32"] = {
            signGLSL: "uint",
            signWGSL: "u32",
            type: 1,
            format: 2,
            size: 4,
            get default_() { return [0]; }
        };
        mptdLut["f32"] = {
            signGLSL: "float",
            signWGSL: "f32",
            type: 1,
            format: 3,
            size: 4,
            get default_() { return [0.0]; }
        };
        mptdLut["vec2<i32>"] = {
            signGLSL: "ivec2",
            signWGSL: "vec2<i32>",
            type: 2,
            format: 1,
            size: 8,
            get default_() { return [0, 0]; }
        };
        mptdLut["vec2<u32>"] = {
            signGLSL: "uvec2",
            signWGSL: "vec2<u32>",
            type: 2,
            format: 2,
            size: 8,
            get default_() { return [0, 0]; }
        };
        mptdLut["vec2<f32>"] = {
            signGLSL: "vec2",
            signWGSL: "vec2<f32>",
            type: 2,
            format: 3,
            size: 8,
            get default_() { return [0.0, 0.0]; }
        };
        mptdLut["vec3<i32>"] = {
            signGLSL: "ivec3",
            signWGSL: "vec3<i32>",
            type: 3,
            format: 1,
            size: 12,
            get default_() { return [0, 0, 0]; }
        };
        mptdLut["vec3<u32>"] = {
            signGLSL: "uvec3",
            signWGSL: "vec3<u32>",
            type: 3,
            format: 2,
            size: 12,
            get default_() { return [0, 0, 0]; }
        };
        mptdLut["vec3<f32>"] = {
            signGLSL: "vec3",
            signWGSL: "vec3<f32>",
            type: 3,
            format: 3,
            size: 12,
            get default_() { return [0.0, 0.0, 0.0]; }
        };
        mptdLut["vec4<i32>"] = {
            signGLSL: "ivec4",
            signWGSL: "vec4<i32>",
            type: 4,
            format: 1,
            size: 16,
            get default_() { return [0, 0, 0, 0]; }
        };
        mptdLut["vec4<u32>"] = {
            signGLSL: "uvec4",
            signWGSL: "vec4<u32>",
            type: 4,
            format: 2,
            size: 16,
            get default_() { return [0, 0, 0, 0]; }
        };
        mptdLut["vec4<f32>"] = {
            signGLSL: "vec4",
            signWGSL: "vec4<f32>",
            type: 4,
            format: 3,
            size: 16,
            get default_() { return [0.0, 0.0, 0.0, 0.0]; }
        };
        mptdLut["mat2x2<f32>"] = {
            signGLSL: "mat2",
            signWGSL: "mat2x2<f32>",
            type: 5,
            format: 3,
            size: 16,
            get default_() { return [1.0, 0.0, 0.0, 1.0]; }
        };
        mptdLut["mat3x3<f32>"] = {
            signGLSL: "mat3",
            signWGSL: "mat3x3<f32>",
            type: 6,
            format: 3,
            size: 48,
            get default_() { return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0]; }
        };
        mptdLut["mat4x4<f32>"] = {
            signGLSL: "mat4",
            signWGSL: "mat4x4<f32>",
            type: 7,
            format: 3,
            size: 64,
            get default_() { return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]; }
        };
        for (let type = 0; type < tptdLut.typeList.length; type++) {
            for (let format = 0; format < tptdLut.formatList.length; format++) {
                mptdLut[tptdLut.typeList[type] + tptdLut.formatList[format]] = {
                    signGLSL: "uvec4",
                    signWGSL: "vec4<u32>",
                    type: 4,
                    format: 2,
                    size: 16,
                    get default_() { return [0, 0, 0, 0]; },
                    texture_dim: tptdLut.dimList[type],
                    texture_type: tptdLut.sampleList[format]
                };
            }
        }
        this.GenerateGroupLayout_G0();
        this.GenerateGroupLayout_G1();
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
        return this;
    }
    CreateShader(asset) {
        if (asset.instance) {
            return this._shaders.list[asset.instance];
        }
        const layout = this.GenerateGroupLayout_G2(asset.properties);
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
        return entry;
    }
    GenerateMaterialPropTuple(properties, uniformGroup) {
        const groups = [[], [], [], [], [], [], [], []];
        const list = [];
        const texs = [];
        let index = 0;
        for (let key in properties) {
            const prop = properties[key];
            const desc = this._materialPropTypeDescLut[prop.sign];
            const decl = {
                name: key,
                note: prop.note,
                sign: prop.sign,
                value: prop.value?.slice() || desc.default_.slice(),
                type: desc.type,
                format: desc.format
            };
            const var_ = {
                index: index,
                sort: -1,
                offset: 0,
                size: desc.size,
                decl: decl
            };
            list.push(var_);
            groups[decl.type].push(index);
            index++;
            if (prop.sign.startsWith("texture")) {
                decl.name += "_uuid";
                decl.texture = texs.length;
                decl.value = [0, 0, 0, 0];
                let default_color = prop.value ? prop.value[0] : 0;
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
                        type: 4,
                        format: 2,
                        sampler: texs.length
                    }
                });
                groups[4].push(index);
                index++;
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
                        type: 4,
                        format: 3
                    }
                });
                groups[4].push(index);
                index++;
                texs.push(key);
            }
        }
        class PropView {
            constructor(master) {
                this.master = master;
            }
            master;
        }
        const env = this._global.env;
        const resources = this._global.resources;
        const specLut = {};
        function specSet(var_) {
            const name = var_.decl.name;
            const textureIdx = var_.decl.texture;
            const specFlag = specLut[name];
            if (undefined === textureIdx && undefined === specFlag) {
                return function (value) {
                    const master = this.master;
                    env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);
                    master.updated = true;
                };
            }
            else {
                if (undefined === textureIdx) {
                    return function (value) {
                        const master = this.master;
                        env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);
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
                    return function (value) {
                        const master = this.master;
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
                    return function (value) {
                        const master = this.master;
                        {
                            const oldID = env.arrayGet(var_.decl.format, master.blockPtr, var_.offset >> 2, 4)[0];
                            const newID = value[0];
                            resources.Texture.Release(oldID);
                            resources.Texture.AddRef(newID);
                        }
                        env.arraySet(var_.decl.format, master.blockPtr, var_.offset >> 2, value);
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
        }
        ;
        const webgl = this._global.config.webgl;
        let code = webgl ? `\nlayout(std140) uniform ${uniformGroup.tname} {\n` : `\nstruct ${uniformGroup.tname} {\n`;
        let offset = 0;
        if (uniformGroup.group == 2) {
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
        index = 0;
        const push = (index_) => {
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
            PropView.prototype[prop.decl.name] = {
                enumerable: true,
                configurable: false,
                set: specSet(prop),
                get() {
                    return env.arrayGet(prop.decl.format, this.master.blockPtr, prop.offset >> 2, prop.size >> 2);
                }
            };
        };
        const padding = (sign, name) => {
            if (webgl) {
                code += `    ${this._materialPropTypeDescLut[sign].signGLSL} ${name};\n`;
            }
            else {
                code += `    ${name} : ${this._materialPropTypeDescLut[sign].signWGSL},\n`;
            }
        };
        const group4x4 = groups[7];
        const count4x4 = group4x4.length;
        for (let i = 0; i < count4x4; i++) {
            push(group4x4[i]);
        }
        const group3x3 = groups[6];
        const count3x3 = group3x3.length;
        for (let i = 0; i < count3x3; i++) {
            push(group3x3[i]);
        }
        const group2x2 = groups[5];
        const count2x2 = group2x2.length;
        for (let i = 0; i < count2x2; i++) {
            push(group2x2[i]);
        }
        const group4 = groups[4];
        const count4 = group4.length;
        for (let i = 0; i < count4; i++) {
            push(group4[i]);
        }
        const group3 = groups[3];
        const count3 = group3.length;
        for (let i = 0; i < count3; i++) {
            push(group3[i]);
        }
        const group2 = groups[2];
        const count2 = group2.length;
        for (let i = 0; i < count2; i++) {
            push(group2[i]);
        }
        const group1 = groups[1];
        const count1 = group1.length;
        if (count3 && count1 && !count2) {
            padding("f32", "_padding0");
        }
        for (let i = 0; i < count1; i++) {
            push(group1[i]);
        }
        if (0 === offset) {
            padding("vec4<f32>", "_default");
            offset += 16;
        }
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
                view: PropView,
            },
            vscode: code,
            fscode: code,
        };
    }
    GenerateGroupLayout_G2(properties) {
        const propLayout = this.GenerateMaterialPropTuple(properties, {
            group: 2,
            binding: 0,
            tname: "MaterialParams",
            vname: "materialParams",
            alignSize: 256
        });
        const groupDesc = {
            label: "g2",
            entries: [
                {
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
                groupDesc.entries[binding - 1] = {
                    binding: binding + 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: desc.texture_type,
                        viewDimension: desc.texture_dim
                    }
                };
                groupDesc.entries[binding] = {
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
    GenerateGroupLayout_G0() {
        const properties = {
            "sysMat1": { note: "系统占用字段1", sign: "mat4x4<f32>" },
            "sysMat2": { note: "系统占用字段2", sign: "mat4x4<f32>" },
            "lfgMat": { note: "变换矩阵：全局->灯光。CONFIG_MAX_SHADOW_CASCADES == 4", sign: "mat4x4<f32>" },
            "lfgMat1": { note: "变换矩阵：全局->灯光。CONFIG_MAX_SHADOW_CASCADES == 4", sign: "mat4x4<f32>" },
            "lfgMat2": { note: "变换矩阵：全局->灯光。CONFIG_MAX_SHADOW_CASCADES == 4", sign: "mat4x4<f32>" },
            "lfgMat3": { note: "变换矩阵：全局->灯光。CONFIG_MAX_SHADOW_CASCADES == 4", sign: "mat4x4<f32>" },
            "vfgMat": { note: "变换矩阵：全局->相机", sign: "mat4x4<f32>" },
            "gfvMat": { note: "变换矩阵：相机->全局", sign: "mat4x4<f32>" },
            "cfvMat": { note: "变换矩阵：相机->裁剪", sign: "mat4x4<f32>" },
            "vfcMat": { note: "变换矩阵：裁剪->相机", sign: "mat4x4<f32>" },
            "cfgMat": { note: "变换矩阵：全局->裁剪", sign: "mat4x4<f32>" },
            "gfcMat": { note: "变换矩阵：裁剪->全局", sign: "mat4x4<f32>" },
            "gfwMat": { note: "变换矩阵：世界->全局", sign: "mat4x4<f32>" },
            "wfgMat": { note: "变换矩阵：全局->世界", sign: "mat4x4<f32>" },
            "uvfvMat": { note: "当前相机到当前相机平面UV变换矩阵，用于SSR相交测试", sign: "mat4x4<f32>" },
            "last_uvfvMat": { note: "当前相机到上一相机平面UV变换矩阵，用于SSR颜色采样", sign: "mat4x4<f32>" },
            "last_cfwMat": { note: "变换矩阵：世界->上一相机裁剪", sign: "mat4x4<f32>" },
            "cullingMat": { note: "变换矩阵：世界->裁剪（CPU端使用）", sign: "mat4x4<f32>" },
            "reserved0": { note: "保留字段", sign: "mat4x4<f32>" },
            "reserved3": { note: "保留字段", sign: "vec4<f32>" },
            "camera_wPos": { note: "相机，世界空间中的相机位置，W位不使用", sign: "vec4<f32>" },
            "camera_wDir": { note: "相机，世界空间中的相机观察方向和距观察目标距离", sign: "vec4<f32>" },
            "camera_params": { note: "x : cameraFar 远平面距离。y : oneOverFarMinusNear 1/(f-n), 始终为正数。z : nearOverFarMinusNear n/(f-n), 始终为正数。w : ev100 EV100参数。", sign: "vec4<f32>" },
            "resolution": { note: "视口，width, height, 1/width, 1/height", sign: "vec4<f32>", value: [1024.0, 1024.0, 0.000977, 0.000977] },
            "clipControl": { note: "用于将Z范围从[0, 1]转换到[-1, 1]", sign: "vec4<f32>", value: [1.0, 0.0] },
            "cascadeSplits": { note: "CSM，视锥在相机空间中的划分位置，不包含近平面。不使用的分量值为-INF", sign: "vec4<f32>", value: [-6.3457, 0.0, 0.0, 0.0] },
            "reserved2": { note: "保留字段", sign: "vec4<f32>" },
            "froxelCount": { note: "视锥体素化细分参数：Dim、CountX、CountY、CountZ", sign: "vec4<u32>" },
            "froxelCountZ": { note: "视锥体素化细分参数：NearZ、FarZ、LinearZ、Reserved", sign: "vec4<f32>" },
            "froxelParamsF": { note: "着色器使用的视锥体素化参数1：1、CountX、CountX * CountY、CountX * CountY * CountZ", sign: "vec4<u32>" },
            "froxelParamsZ": { note: "着色器使用的视锥体素化参数2：用于计算片元所属体素索引", sign: "vec4<f32>" },
            "iblSH": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH1": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH2": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH3": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH4": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH5": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH6": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH7": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "iblSH8": { note: "IBL，球谐系数", sign: "vec4<f32>" },
            "fogColor": { note: "雾，颜色（W位不使用）", sign: "vec4<f32>" },
            "sunParams": { note: " 太阳光参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP", sign: "vec4<f32>", value: [0.999848, 0.017452, -2188.808350, 80.0] },
            "iblColorIntensity": { note: "太阳光颜色和强度", sign: "vec4<f32>", value: [1.0, 1.0, 1.0, 1.0] },
            "iblDirection": { note: "太阳光全局空间方向光方向", sign: "vec4<f32>", value: [0.0, 1.0, 0.0, 0.0] },
            "reserved10": { note: "保留字段", sign: "vec4<f32>" },
            "reserved11": { note: "保留字段", sign: "vec4<f32>" },
            "reserved12": { note: "保留字段", sign: "vec4<f32>" },
            "reserved13": { note: "保留字段", sign: "vec4<f32>" },
            "reserved14": { note: "保留字段", sign: "vec4<f32>" },
            "reserved15": { note: "保留字段", sign: "vec4<f32>" },
            "reserved16": { note: "保留字段", sign: "vec4<f32>" },
            "reserved17": { note: "保留字段", sign: "vec4<f32>" },
            "reserved18": { note: "保留字段", sign: "vec4<f32>" },
            "reserved19": { note: "保留字段", sign: "vec4<f32>" },
            "lightFarAttenuationParams": { note: "太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)", sign: "vec2<f32>", value: [5.0, 0.0005] },
            "lightReserved": { note: "保留字段", sign: "vec2<f32>", value: [5.0, 0.0005] },
            "iblLuminance": { note: "IBL，亮度", sign: "f32" },
            "iblRoughnessOneLevel": { note: "IBL，粗糙度为1的纹理链级别", sign: "f32" },
            "vsmReserved1": { note: "IBL，保留字段", sign: "f32" },
            "vsmReserved2": { note: "IBL，保留字段", sign: "f32" },
            "ssrThickness": { note: "屏幕空间反射用的物体厚度，用于相交测试", sign: "f32", value: [0.1] },
            "ssrBias": { note: "屏幕空间反射用的射线的起点偏移", sign: "f32", value: [0.01] },
            "ssrDistance": { note: "屏幕空间反射用的射线最大追踪距离", sign: "f32", value: [3.0] },
            "ssrStride": { note: "屏幕空间反射用的射线追踪步进像素数", sign: "f32", value: [2.0] },
            "refractionLodOffset": { note: "反射贴图采样LOD偏移", sign: "f32", value: [7.625531] },
            "temporalNoise": { note: "噪音系数[0, 1]，当不使用TAA时取0", sign: "f32" },
            "aoSamplingQualityAndEdgeDistance": { note: "SSAO，采样参数，0: bilinear, !0: bilateral edge distance", sign: "f32" },
            "aoBentNormals": { note: "SSAO，0: no AO bent normal, >0.0 AO bent normals", sign: "f32" },
            "cascades": { note: "阴影，CSM information", sign: "u32", value: [1 + (1 << 8)] },
            "directionalShadows": { note: "", sign: "u32", value: [2049] },
            "ssContactShadowDistance": { note: "屏幕空间接触阴影距离", sign: "f32" },
            "shadowSamplingType": { note: "阴影，0: PCF, 1: VSM，2: DPCF, 3: PCSS", sign: "u32", value: [1] },
            "shadowBias": { note: "阴影，法向偏移", sign: "f32" },
            "shadowBulbRadiusLs": { note: "阴影，光照空间的光源半径", sign: "f32" },
            "shadowPenumbraRatioScale": { note: " 阴影，用于DPCF、PCSS，用于艺术用途的比例半影", sign: "f32" },
            "shadowReserved": { note: "阴影，保留字段", sign: "f32" },
            "vsmExponent": { note: "VSM阴影指数", sign: "f32", value: [5.53999996] },
            "vsmDepthScale": { note: "用于VSM最小方差计算", sign: "f32", value: [0.0277] },
            "vsmLightBleedReduction": { note: "VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见", sign: "f32", value: [0.15] },
            "vsmReserved": { note: "VSM，保留字段", sign: "f32" },
            "fogStart": { note: "", sign: "f32" },
            "fogMaxOpacity": { note: "", sign: "f32" },
            "fogHeight": { note: "", sign: "f32" },
            "fogHeightFalloff": { note: "雾，falloff * 1.44269", sign: "f32" },
            "fogDensity": { note: "雾，(density/falloff)*exp(-falloff*(camera.y - fogHeight))", sign: "f32" },
            "fogInscatteringStart": { note: "", sign: "f32" },
            "fogInscatteringSize": { note: "", sign: "f32" },
            "fogColorFromIbl": { note: "", sign: "f32" },
            "time": { note: "计时器（单位秒）", sign: "f32" },
            "needsAlphaChannel": { note: "如果当前渲染目标结果需要用于混合，则需要分配不透明分量，保证不透明对象不透明度为1", sign: "f32" },
            "exposure": { note: "GBUFFER中的自发光颜色和强度都是归一化存储的，使用该参数作为自发光最大曝光度", sign: "f32", value: [10.0] },
            "lightChannels": { note: "光照，光照通道标志集", sign: "u32", value: [1] },
        };
        const propLayout = this.GenerateMaterialPropTuple(properties, {
            group: 0,
            binding: 0,
            tname: "FrameUniforms",
            vname: "frameUniforms",
            alignSize: 2048
        });
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

@group(0) @binding(8) var spnnn1: sampler;
@group(0) @binding(9) var splln1: sampler;
@group(0) @binding(10) var spnnl1: sampler;
@group(0) @binding(11) var splll1: sampler;
@group(0) @binding(12) var splll4: sampler;
@group(0) @binding(13) var splll8: sampler;
            `;
            propLayout.fscode += froxel_buffer_code;
        }
        const groupDesc = {
            label: "g0",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        hasDynamicOffset: true
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "depth",
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 6,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "uint",
                        viewDimension: "2d-array"
                    }
                },
                {
                    binding: 8,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "non-filtering"
                    }
                },
                {
                    binding: 9,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {
                    binding: 10,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {
                    binding: 11,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {
                    binding: 12,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                },
                {
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
    GenerateGroupLayout_G1() {
        let code = "";
        const webgl = this._global.config.webgl;
        if (webgl) {
            code = `
struct InstanceData {
    mat4 wfmMat;
    mat3x4 normal_wfmMat;
    uint id;
    uint flags;
    uint layers;
    uint user;
};

layout(std140) uniform InstanceUniforms {
    InstanceData data[128];
} instanceUniforms;

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
struct InstanceData {
    wfmMat : mat4x4<f32>,
    normal_wfmMat : mat3x4<f32>,
    id : u32,
    flags : u32,
    layers : u32,
    user : u32,
};

struct InstanceUniforms {
    data : array<InstanceData, 128>,
};

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

@group(1) @binding(0) var<uniform> objectUniforms : ObjectUniforms;
@group(1) @binding(1) var<uniform> instanceUniforms : InstanceUniforms;
@group(1) @binding(2) var<uniform> bonesUniforms : BonesUniforms;

@group(1) @binding(3) var morphTG : texture_2d<f32>;
            `;
        }
        const list = [
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
                    type: 7,
                    format: 3
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
                    type: 6,
                    format: 3
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
                    type: 1,
                    format: 2
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
                    type: 1,
                    format: 2
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
                    type: 1,
                    format: 2
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
                    type: 1,
                    format: 2
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
                    type: 4,
                    format: 3
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
                    type: 4,
                    format: 3
                }
            }
        ];
        const propLayout = {
            group: 1,
            tuple: {
                vars: list,
                size: 256,
                view: null,
            },
            vscode: code,
            fscode: code,
        };
        const groupDesc = {
            label: "g1",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        hasDynamicOffset: true
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
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
    CreateRenderPipeline(desc) {
        const g0 = this._shaders.list[desc.g0];
        const g1 = this._shaders.list[desc.g1];
        const g2 = this._shaders.list[desc.g2];
        const g3 = this._shaders.list[desc.g3];
        const pipelineLDesc = {
            label: `pll:${desc.g0}-${desc.g1}-${desc.g2}-${desc.g3}`,
            bindGroupLayouts: [],
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
        const pipelineLayout = this._global.device.device.createPipelineLayout(pipelineLDesc);
        const shaderAsset = g2.asset;
        const framePass = {
            colorRT: [{
                    format: "bgra8unorm"
                }]
        };
        const blendMode = desc.flags >> 28;
        const constants = {
            "SHADING_AS_UNLIT": (desc.flags & 16777216) ? 1 : 0,
            "VARIANT_NEEDS_MORPHING": (desc.flags & 128) ? 1 : 0,
            "VARIANT_NEEDS_SKINNING": (desc.flags & 64) ? 1 : 0,
            "VARIANT_HAS_DOUBLESIDED": (desc.flags & 1048576) ? 1 : 0,
            "VARIANT_HAS_DIRECTIONAL_LIGHTING": 1,
            "VARIANT_HAS_SHADOWING": ((desc.flags & 16) || (desc.flags & 32)) ? 1 : 0,
            "VARIANT_HAS_VSM": 1,
            "BLEND_MODE_MASKED": (blendMode == 1) ? 1 : 0,
            "BLEND_MODE_TRANSPARENT": (blendMode == 2) ? 1 : 0,
            "BLEND_MODE_FADE": (blendMode == 3) ? 1 : 0,
            "MATERIAL_NEEDS_TBN": ((desc.flags & 4096) || (desc.flags & 8388608)) ? 1 : 0,
            "MATERIAL_HAS_NORMAL": (desc.flags & 4096) ? 1 : 0,
            "MATERIAL_HAS_EMISSIVE": (desc.flags & 524288) ? 1 : 0,
            "MATERIAL_HAS_ANISOTROPY": (desc.flags & 8388608) ? 1 : 0
        };
        let vsmain = "vsmain_0";
        let fsmain = "fsmain_shading";
        const shaderModule = this.CompileShaderModule(g2, g0, g1, g3);
        let vbLayout = [];
        if ((desc.flags & 1) == 1) {
            vbLayout.push({
                arrayStride: 16,
                stepMode: "vertex",
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "snorm16x4"
                    },
                    {
                        shaderLocation: 1,
                        offset: 8,
                        format: "snorm8x4"
                    },
                    {
                        shaderLocation: 2,
                        offset: 12,
                        format: "snorm16x2"
                    }
                ]
            });
            vsmain = "vsmain_1";
        }
        if ((desc.flags & 2) == 2) {
            vbLayout.push({
                arrayStride: 8,
                stepMode: "vertex",
                attributes: [
                    {
                        shaderLocation: 3,
                        offset: 0,
                        format: "uint8x4"
                    },
                    {
                        shaderLocation: 4,
                        offset: 4,
                        format: "unorm8x4"
                    }
                ]
            });
            vsmain = "vsmain_3";
        }
        if (vbLayout.length == 0 || (desc.flags & 8) == 8) {
            vbLayout = undefined;
            vsmain = "vsmain_0";
        }
        let cullMode = "none";
        if (desc.cullMode) {
            if (framePass.invertCull) {
                cullMode = desc.cullMode == 1 ? "front" : "back";
            }
            else {
                cullMode = desc.cullMode == 1 ? "back" : "front";
            }
        }
        const targets = [];
        if (framePass.colorRT) {
            let blend = undefined;
            switch (blendMode) {
                case 2:
                case 3:
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
                    };
                    break;
                case 4:
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
                case 5:
                case 6:
                default:
                    break;
            }
            for (let target of framePass.colorRT) {
                targets.push({
                    format: target.format,
                    writeMask: target.writeMask,
                    blend: target.blend || blend
                });
            }
        }
        const pipelineDesc = {
            label: "",
            layout: pipelineLayout,
            vertex: {
                buffers: vbLayout,
                module: shaderModule[0],
                entryPoint: vsmain,
                constants: constants
            },
            fragment: !framePass.colorRT ? undefined : {
                targets: targets,
                module: shaderModule[1],
                entryPoint: fsmain,
                constants: constants
            },
            depthStencil: !framePass.depthRT ? undefined : {
                ...framePass.depthRT,
                ...shaderAsset.depth_stencil
            },
            primitive: {
                topology: this._topologyLut[desc.topology],
                frontFace: desc.frontFace ? "cw" : "ccw",
                cullMode: cullMode,
                unclippedDepth: framePass.unclippedDepth
            },
            multisample: framePass.multisample
        };
        const pipeline = this._global.device.device.createRenderPipeline(pipelineDesc);
        return pipeline;
    }
    CompileShaderModule(shader, g0, g1, g3) {
        if (shader.module) {
            return shader.module;
        }
        const macro = `
const MATERIAL_HAS_ANISOTROPY_DIRECTION = false;
const MATERIAL_HAS_POST_LIGHTING_COLOR = false;
const MATERIAL_HAS_SUBSURFACECOLOR = false;
const MATERIAL_HAS_SHEENCOLOR = false;
const MATERIAL_HAS_BENT_NORMAL = false;
const MATERIAL_HAS_CLEAR_COAT_NORMAL = false;
        `;
        const vsmain = `
@vertex fn vsmain_0(vertex: InputVS_0) ->OutputVS {
    save_override();

    init_vertex_0(vertex);

    return material_vs();
}

@vertex fn vsmain_1(vertex: InputVS_1) ->OutputVS {
    save_override();

    init_vertex_1(vertex);

    return material_vs();
}

@vertex fn vsmain_3(vertex: InputVS_3) ->OutputVS {
    save_override();

    init_vertex_3(vertex);

    return material_vs();
}
        `;
        const fsmain = `
@fragment fn fsmain_shading(frag: InputFS) -> @location(0) vec4f {
    save_override();

    varyings_init(frag);

    material_fs();

    shading_fs();

    return vec4f(inputs_geometricNormal, 1.0);
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
        const vscode = [macro, vsg0, vsg1, vsg2, vsg3, shader.asset.codes.vertex.code, vsmain].join("");
        const fscode = [macro, fsg0, fsg1, fsg2, fsg3, shader.asset.codes.material.code, shader.asset.codes.shading.code, fsmain].join("");
        const vsmodule = this._global.device.device.createShaderModule({
            code: vscode,
        });
        const fsmodule = this._global.device.device.createShaderModule({
            code: fscode,
        });
        shader.module = [vsmodule, fsmodule, undefined];
        return shader.module;
    }
    SetVertexBuffers(vertexArray, buffers, passEncoder) {
        for (let vb of buffers) {
            this.SetVertexBuffer(vb.index, vb.buffer, vb.offset, vb.size, passEncoder);
        }
        return 0;
    }
    SetVertexBuffer(slot, bufferID, offset, size, passEncoder) {
        const buffer = this._global.device["_buffers"].list[bufferID];
        passEncoder.setVertexBuffer(slot, buffer.buffer, offset, size);
    }
    SetIndexBuffer(format, buffer, passEncoder) {
        const buffer_ = this._global.device["_buffers"].list[buffer.buffer].buffer;
        passEncoder.setIndexBuffer(buffer_, format === 2 ? "uint16" : "uint32", buffer.offset, buffer.size);
    }
    CreateBindGroup(uniform) {
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
        const bindingDesc = {
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
        const entries = bindingDesc.entries;
        if (uniform.group == 0) {
            const frameUniforms = uniform;
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
            for (let i = 0; i < 6; i++) {
                entries.push({
                    binding: 8 + i,
                    resource: device.GetSampler(this._builtinSampler[i]).sampler
                });
            }
        }
        else if (uniform.group == 1) {
            const meshRenderer = uniform;
            const instanceList = meshRenderer.g1_instanceList;
            const boneList = meshRenderer.g1_boneList;
            const morphTargetsID = meshRenderer.g1_morphTargets;
            const morphTargets = this._global.device.GetTexture2D(morphTargetsID || this._global.resources.Texture.default2D.internalID);
            entries.push({
                binding: 1,
                resource: {
                    buffer: device.GetBuffer(instanceList.bufferID).buffer,
                    offset: instanceList.offset,
                    size: instanceList.size
                }
            });
            entries.push({
                binding: 2,
                resource: {
                    buffer: device.GetBuffer(boneList.bufferID).buffer,
                    offset: boneList.offset,
                    size: boneList.size
                }
            });
            entries.push({
                binding: 3,
                resource: morphTargets.view
            });
        }
        else if (uniform.group == 2) {
            const vars = uniform.tuple.vars;
            const default2D = this._global.device.GetTexture2D(this._global.resources.Texture.default2D.internalID);
            for (let var_ of vars) {
                const texid = var_.decl.texture;
                if (texid !== undefined) {
                    const binding = texid * 2 + 2;
                    entries.push({
                        binding: binding + 0,
                        resource: default2D.view
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
        return binding;
    }
    GetShader(id) {
        return this._shaders.list[id];
    }
    _global;
    _builtinSampler;
    _materialPropTypeDescLut = {};
    _texturePropTypeDescLut = {
        typeList: ["texture_1d", "texture_2d", "texture_2d_array", "texture_cube", "texture_cube_array", "texture_3d"],
        dimList: ["1d", "2d", "2d-array", "cube", "cube-array", "3d"],
        formatList: ["<i32>", "<u32>", "<f32>"],
        sampleList: ["sint", "uint", "float"]
    };
    _topologyLut = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];
    _shaders = {
        freeId: 5,
        usedCount: 0,
        list: [null],
    };
}
//# sourceMappingURL=context.js.map