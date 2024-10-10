import { MAGIC_INVALID } from "../mod.js";
export class Importer_gltf {
    constructor(_worker) {
        this._worker = _worker;
    }
    async Load(data, progress) {
        progress(0.0, "解析资源包：" + data.asset.extras.name);
        this._data = data;
        this._files_cache = {};
        progress(0.1, "加载资源数据缓存");
        await this.LoadBuffers();
        progress(0.2, "解析并压缩网格");
        await this.LoadSkeletons();
        const mesh_library = await this.LoadMeshes();
        progress(0.4, "装载并压缩贴图");
        await this.LoadTextures((rate, msg) => { progress(0.4 + 0.4 * rate, msg); });
        progress(0.7, "解析材质");
        const material_library = await this.LoadMaterials((index) => {
            return this._data.textures[index].extras;
        });
        progress(0.8, "加载动画数据");
        const animations_library = await this.LoadAnimations();
        progress(0.9, "解析对象结构");
        const [prefab_library, mesh_renderer_library] = await this.LoadNodes(animations_library);
        progress(1.0, "资源包解析完成");
        const uuid = await this._worker.env.uuidGen();
        const uuid_parts = uuid.split("-");
        const pkg = {
            guid: this._worker.env.guidGet(),
            uuid: uuid,
            uid: parseInt(uuid_parts[0]),
            pid: parseInt(uuid_parts[1]),
            version: parseInt(uuid_parts[2]),
            author: "miaokit",
            name: data.asset.extras.name.replace(".", "_"),
            desc: "",
            engine: 1.0,
            timestrap: Date.now(),
            material_library,
            mesh_library,
            mesh_renderer_library: mesh_renderer_library,
            animations_library,
            prefab_library: prefab_library,
            file_library: Object.keys(this._files_cache)
        };
        const pkg_key = pkg.uuid + "." + pkg.author + "." + pkg.name;
        const pkg_reg = {
            key: pkg_key,
            uuid: pkg.uuid,
            invalid: false,
            path: "./assets/packages/" + pkg_key + ".ab",
            zip: false,
            meta: pkg
        };
        return { pkg: pkg_reg, files: this._files_cache };
    }
    async LoadBuffers() {
        for (let ibuffer of this._data.buffers) {
            let uri = ibuffer.uri;
            if (!uri.startsWith("data:")) {
                uri = this._data.asset.extras.path + uri;
            }
            const buffer = await this.LoadBuffer(uri);
            ibuffer.extras = {
                buffer: buffer
            };
        }
    }
    async LoadBuffer(uri) {
        const zip = this._data.asset.extras.zip;
        if (zip && !uri.startsWith("data:")) {
            return zip.file(uri).async("arraybuffer");
        }
        else {
            return this._worker.Fetch(uri, null, "arrayBuffer");
        }
    }
    async LoadMeshes() {
        const meshCount = this._data.meshes?.length || 0;
        const mesh_library = [];
        for (let i = 0; i < meshCount; i++) {
            const mesh = await this.LoadMesh(i);
            mesh_library.push(mesh);
        }
        return mesh_library;
    }
    LoadMesh(meshIndex) {
        const meshData = this._data.meshes[meshIndex];
        let channels = 1;
        let vCount = 0;
        let iCount = 0;
        let ibCount = 0;
        const primitives = [];
        for (let i = 0; i < meshData.primitives.length; i++) {
            const primitive = primitives[i] = {
                primitive: meshData.primitives[i],
                vertices: this.GetAttribute(meshIndex, i, "POSITION"),
                normals: this.GetAttribute(meshIndex, i, "NORMAL"),
                uvs: this.GetAttribute(meshIndex, i, "TEXCOORD_0"),
                bones: this.GetAttribute(meshIndex, i, "JOINTS_0"),
                weights: this.GetAttribute(meshIndex, i, "WEIGHTS_0"),
            };
            if (primitive.vertices) {
                channels |= 2;
            }
            if (primitive.normals) {
                channels |= 4;
            }
            if (primitive.uvs) {
                channels |= 8;
            }
            if (primitive.bones) {
                channels |= 16;
            }
            if (primitive.weights) {
                channels |= 32;
            }
            primitive.indices = this.GetIndices(meshIndex, i, vCount);
            vCount += primitive.vertices.accessor.count;
            iCount += primitive.indices?.accessor.count || primitive.vertices.accessor.count;
            ibCount += 1;
        }
        let intLength = 0;
        const headerOffset = intLength;
        intLength += 8;
        const groupsOffset = intLength;
        intLength += 4 * ibCount;
        const indicesOffset = intLength;
        intLength += iCount;
        const verticesOffset = intLength;
        intLength += 3 * vCount;
        const normalsOffset = intLength;
        if ((channels & 4) == 4) {
            intLength += 3 * vCount;
        }
        const uvsOffset = intLength;
        if ((channels & 8) == 8) {
            intLength += 2 * vCount;
        }
        const bonesOffset = intLength;
        if ((channels & 16) == 16) {
            intLength += vCount;
        }
        const weightsOffset = intLength;
        if ((channels & 32) == 32) {
            intLength += vCount;
        }
        const data_ptr = this._worker.internal.System_New(4 * intLength);
        const env = this._worker.env;
        const header = env.uarrayRef(data_ptr, headerOffset, 8);
        const groups = env.uarrayRef(data_ptr, groupsOffset, 4 * ibCount);
        const indices = env.uarrayRef(data_ptr, indicesOffset, iCount);
        const vertices = env.farrayRef(data_ptr, verticesOffset, 3 * vCount);
        const normals = (channels & 4) == 4 ? env.farrayRef(data_ptr, normalsOffset, 3 * vCount) : null;
        const uvs = (channels & 8) == 8 ? env.farrayRef(data_ptr, uvsOffset, 2 * vCount) : null;
        const bones = (channels & 16) == 16 ? env.uarrayRef(data_ptr, bonesOffset, vCount) : null;
        const weights = (channels & 32) == 32 ? env.uarrayRef(data_ptr, weightsOffset, vCount) : null;
        let vindex = 0;
        let iindex = 0;
        for (let g = 0; g < primitives.length; g++) {
            const primitive = primitives[g];
            const g4 = g * 4;
            const vcount = primitive.vertices.accessor.count;
            const varray = primitive.vertices.array;
            const narray = primitive.normals?.array;
            const tarray = primitive.uvs?.array;
            const barray = primitive.bones?.array;
            const warray = primitive.weights?.array;
            for (let i = 0; i < vcount; i++, vindex++) {
                const index2 = i * 2;
                const index3 = i * 3;
                const index4 = i * 4;
                const vert1 = vindex * 1;
                const vert2 = vindex * 2;
                const vert3 = vindex * 3;
                vertices[vert3 + 0] = varray.get(index3 + 0);
                vertices[vert3 + 1] = varray.get(index3 + 1);
                vertices[vert3 + 2] = varray.get(index3 + 2);
                if (normals) {
                    if (narray) {
                        normals[vert3 + 0] = narray.get(index3 + 0);
                        normals[vert3 + 1] = narray.get(index3 + 1);
                        normals[vert3 + 2] = narray.get(index3 + 2);
                    }
                    else {
                        normals[vert3 + 0] = 0;
                        normals[vert3 + 1] = 0;
                        normals[vert3 + 2] = 1;
                    }
                }
                if (uvs) {
                    if (tarray) {
                        uvs[vert2 + 0] = tarray.get(index2 + 0);
                        uvs[vert2 + 1] = tarray.get(index2 + 1);
                    }
                    else {
                        uvs[vert2 + 0] = 0;
                        uvs[vert2 + 1] = 0;
                    }
                }
                if (bones) {
                    if (barray) {
                        const joint0 = barray.get(index4 + 0);
                        const joint1 = barray.get(index4 + 1);
                        const joint2 = barray.get(index4 + 2);
                        const joint3 = barray.get(index4 + 3);
                        bones[vert1] = (joint3 << 24) + (joint2 << 16) + (joint1 << 8) + joint0;
                    }
                    else {
                        bones[vert1] = 0;
                    }
                }
                if (weights) {
                    if (warray) {
                        let weight0 = warray.get(index4 + 0);
                        weight0 = Math.round(weight0 * 255.0);
                        let weight1 = warray.get(index4 + 1);
                        if (weight1 == 0) {
                            weight0 = 255;
                        }
                        else {
                            weight1 = Math.round(weight1 * 255.0);
                        }
                        let weight2 = warray.get(index4 + 2);
                        if (weight2 == 0) {
                            weight1 = 255 - weight0;
                        }
                        else {
                            weight2 = Math.round(weight2 * 255.0);
                        }
                        let weight3 = warray.get(index4 + 3);
                        if (weight3 == 0) {
                            weight2 = 255 - weight1 - weight0;
                        }
                        else {
                            weight3 = 255 - weight2 - weight1 - weight0;
                        }
                        weights[vert1] = (weight3 << 24) + (weight2 << 16) + (weight1 << 8) + weight0;
                    }
                    else {
                        weights[vert1] = 0;
                    }
                }
            }
            groups[g4 + 0] = 3;
            groups[g4 + 1] = iindex;
            groups[g4 + 3] = 0;
            if (primitive.indices) {
                const iarray = primitive.indices.array;
                const icount = primitive.indices.accessor.count;
                const vertexOffset = primitive.indices.vertexOffset;
                for (let i = 0; i < icount; i++) {
                    indices[iindex++] = iarray.get(i) + vertexOffset;
                }
                groups[g4 + 2] = icount;
            }
            else {
                const vertexOffset = vindex - vcount;
                for (let i = 0; i < vcount; i++) {
                    indices[iindex++] = i + vertexOffset;
                }
                groups[g4 + 2] = vcount;
            }
        }
        header[0] = channels;
        header[1] = iCount;
        header[2] = vCount;
        header[3] = ibCount;
        header[4] = 0;
        header[5] = 0;
        header[6] = 0;
        header[7] = 0;
        const res = this._worker.internal.Worker_CreateMeshData(data_ptr);
        const res_ab = env.uarrayGet(res[1], 0, Math.ceil(res[0] / 4)).buffer;
        const res_data = new Uint8Array(res_ab);
        this._worker.internal.System_Delete(data_ptr);
        this._worker.internal.System_Delete(res[1]);
        const name = `${38}-${meshIndex}_${meshData.name || ""}`;
        const uri = "mesh/" + name + ".bin";
        this._files_cache[uri] = res_data;
        const asset = {
            uuid: "" + 39 + "-" + meshIndex,
            classid: 39,
            name: meshData.name || "",
            label: meshData.name || "",
            meshdata: ":/" + uri,
        };
        meshData.extras = asset;
        return asset;
    }
    GetAttribute(meshIndex, subIndex, name) {
        const primitive = this._data.meshes[meshIndex].primitives[subIndex];
        const iaccessor = primitive.attributes[name];
        if (undefined == iaccessor) {
            return null;
        }
        const accessor = this._data.accessors[iaccessor];
        if (undefined == accessor.bufferView) {
            return null;
        }
        const bufferView = this._data.bufferViews[accessor.bufferView];
        const buffer = this._data.buffers[bufferView.buffer];
        let offset = undefined != accessor.byteOffset ? accessor.byteOffset : 0;
        offset += undefined != bufferView.byteOffset ? bufferView.byteOffset : 0;
        return {
            name: name,
            accessor: accessor,
            bufferView: bufferView,
            buffer: buffer,
            array: this.GetAccessorData(buffer.extras.buffer, offset, bufferView.byteStride, accessor.type, accessor.componentType, accessor.count)
        };
    }
    GetIndices(meshIndex, subIndex, vertexOffset) {
        const primitive = this._data.meshes[meshIndex].primitives[subIndex];
        const iaccessor = primitive.indices;
        if (undefined == iaccessor) {
            return null;
        }
        const accessor = this._data.accessors[iaccessor];
        if (undefined == accessor.bufferView) {
            return null;
        }
        const bufferView = this._data.bufferViews[accessor.bufferView];
        const buffer = this._data.buffers[bufferView.buffer];
        let offset = undefined != accessor.byteOffset ? accessor.byteOffset : 0;
        offset += undefined != bufferView.byteOffset ? bufferView.byteOffset : 0;
        return {
            name: accessor.name,
            accessor: accessor,
            bufferView: bufferView,
            buffer: buffer,
            array: this.GetAccessorData(buffer.extras.buffer, offset, bufferView.byteStride, accessor.type, accessor.componentType, accessor.count),
            vertexOffset: vertexOffset
        };
    }
    GetAccessorData(buffer, offset, stride, type, componentType, count) {
        let componentCount = 1;
        if (type === "SCALAR") {
            componentCount = 1;
        }
        else if (type === "VEC2") {
            componentCount = 2;
        }
        else if (type === "VEC3") {
            componentCount = 3;
        }
        else if (type === "VEC4") {
            componentCount = 4;
        }
        else if (type === "MAT2") {
            componentCount = 4;
        }
        else if (type === "MAT3") {
            componentCount = 9;
        }
        else if (type === "MAT4") {
            componentCount = 16;
        }
        let strideCount = componentCount;
        let array = null;
        if (componentType === 5120) {
            if (stride) {
                strideCount = stride;
            }
            array = new Int8Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5121) {
            if (stride) {
                strideCount = stride;
            }
            array = new Uint8Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5122) {
            if (stride) {
                strideCount = stride / 2;
            }
            array = new Int16Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5123) {
            if (stride) {
                strideCount = stride / 2;
            }
            array = new Uint16Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5125) {
            if (stride) {
                strideCount = stride / 4;
            }
            array = new Uint32Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5126) {
            if (stride) {
                strideCount = stride / 4;
            }
            array = new Float32Array(buffer, offset, strideCount * count);
        }
        if (componentCount == strideCount) {
            return {
                array,
                get(i) {
                    return array[i];
                }
            };
        }
        return {
            get(i) {
                return array[Math.floor(i / componentCount) * strideCount + (i % componentCount)];
            }
        };
    }
    async LoadTextures(progress) {
        const images = this._data.images || [];
        const samplers = this._data.samplers || [];
        const textures = this._data.textures || [];
        const imageCount = images.length;
        const wrapperCount = textures.length;
        for (let i = 0; i < imageCount; i++) {
            await this.LoadImage(i);
            progress((i + 1) / imageCount, "完成装载并压缩贴图：" + images[i].uri);
        }
        for (let i = 0; i < wrapperCount; i++) {
            const texture = textures[i];
            const state = samplers[texture.sampler];
            const wrapper = {
                uri: ":/" + images[texture.source]?.extras.uri,
                uvts: [0, 0, 1, 1],
                color: [255, 255, 255, 255],
                sampler: {}
            };
            if (state) {
                switch (state.minFilter) {
                    case 9728:
                        wrapper.sampler.minFilter = "nearest";
                        break;
                    case 9729:
                        wrapper.sampler.minFilter = "linear";
                        break;
                    case 9984:
                        wrapper.sampler.minFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9985:
                        wrapper.sampler.minFilter = "linear";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9986:
                        wrapper.sampler.minFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    case 9987:
                        wrapper.sampler.minFilter = "linear";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    default:
                        break;
                }
                switch (state.magFilter) {
                    case 9728:
                        wrapper.sampler.magFilter = "nearest";
                        break;
                    case 9729:
                        wrapper.sampler.magFilter = "linear";
                        break;
                    case 9984:
                        wrapper.sampler.magFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9985:
                        wrapper.sampler.magFilter = "linear";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9986:
                        wrapper.sampler.magFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    case 9987:
                        wrapper.sampler.magFilter = "linear";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    default:
                        break;
                }
                wrapper.sampler.addressModeU = "repeat";
                wrapper.sampler.addressModeV = "repeat";
                if (33648 == state.wrapS) {
                    wrapper.sampler.addressModeU = "mirror-repeat";
                }
                else if (33071 == state.wrapS) {
                    wrapper.sampler.addressModeU = "clamp-to-edge";
                }
                if (33648 == state.wrapT) {
                    wrapper.sampler.addressModeV = "mirror-repeat";
                }
                else if (33071 == state.wrapT) {
                    wrapper.sampler.addressModeV = "clamp-to-edge";
                }
            }
            texture.extras = wrapper;
        }
    }
    async LoadImage(index) {
        const image = this._data.images[index];
        if (!image.name && image.uri) {
            image.name = image.uri.substring(image.uri.lastIndexOf("/") + 1, image.uri.lastIndexOf("."));
        }
        const name = `${29}-${index}_${image.name || "unnamed"}`;
        let data = null;
        let mime = "";
        let has_alpha = false;
        if (image.bufferView && image.mimeType) {
            const bufferView = this._data.bufferViews[image.bufferView];
            const buffer = this._data.buffers[bufferView.buffer];
            const offset = bufferView.byteOffset ? bufferView.byteOffset : 0;
            data = new Uint8Array(bufferView.byteLength);
            data.set(new Uint8Array(buffer.extras.buffer, offset, bufferView.byteLength));
            mime = "ktx2";
            if (image.mimeType == "image/png") {
                mime = "png";
            }
            else if (image.mimeType == "image/jpeg") {
                mime = "jpg";
            }
            has_alpha = mime != "jpg";
            if (mime != "ktx2") {
                const startTime = Date.now();
                const out = await this._worker.EncodeTexture(data.buffer, has_alpha);
                if (out) {
                    const elapsed = Date.now() - startTime;
                    mime = "ktx2";
                    has_alpha = out.has_alpha;
                    data = new Uint8Array(out.data);
                }
            }
        }
        else {
            const uri = this._data.asset.extras.path + image.uri;
            const ab = await this.LoadBuffer(uri);
            data = new Uint8Array(ab);
            mime = "jpg";
            if (uri.endsWith("ktx2")) {
                mime = "ktx2";
            }
            else if (uri.endsWith("png")) {
                mime = "png";
            }
            has_alpha = mime != "jpg";
            if (mime != "ktx2") {
                const startTime = Date.now();
                const out = await this._worker.EncodeTexture(data.buffer, has_alpha);
                if (out) {
                    const elapsed = Date.now() - startTime;
                    mime = "ktx2";
                    has_alpha = out.has_alpha;
                    data = new Uint8Array(out.data);
                }
            }
        }
        image.extras = {
            uri: "texture/" + name + "." + mime,
            mime,
            has_alpha
        };
        this._files_cache[image.extras.uri] = data;
    }
    async LoadMaterials(getTexture) {
        const material_library = [];
        const materials = this._data.materials || [];
        const count = materials.length;
        const base_list = [["alphaCutoff", "emissiveFactor"], ["normalTexture", "occlusionTexture", "emissiveTexture"]];
        const pbr_list = [["baseColorFactor", "metallicFactor", "roughnessFactor"], ["baseColorTexture", "metallicRoughnessTexture"]];
        const extension_lut = {
            KHR_materials_pbrSpecularGlossiness: [0x1, ["diffuseFactor", "specularFactor", "glossinessFactor"], ["diffuseTexture", "specularGlossinessTexture"], ["baseColorTexture", "specularColorTexture"]],
            KHR_materials_anisotropy: [0x10, ["anisotropyStrength", "anisotropyRotation"], ["anisotropyTexture"], ["anisotropyTexture"]],
            KHR_materials_clearcoat: [0x20, ["clearcoatFactor", "clearcoatRoughnessFactor"], ["clearcoatTexture", "clearcoatRoughnessTexture", "clearcoatNormalTexture"], ["clearcoatTexture", "clearcoatRoughnessTexture", "clearcoatNormalTexture"]],
            KHR_materials_dispersion: [0x40, ["dispersion"], [], []],
            KHR_materials_emissive_strength: [0x80, ["emissiveStrength"], [], []],
            KHR_materials_ior: [0x100, ["ior"], [], []],
            KHR_materials_iridescence: [0x200, ["iridescenceFactor", "iridescenceIor", "iridescenceThicknessMinimum", "iridescenceThicknessMaximum"], ["iridescenceTexture", "iridescenceThicknessTexture"], ["iridescenceTexture", "iridescenceThicknessTexture"]],
            KHR_materials_sheen: [0x400, ["sheenColorFactor", "sheenRoughnessFactor",], ["sheenColorTexture", "sheenRoughnessTexture"], ["sheenColorTexture", "sheenRoughnessTexture"]],
            KHR_materials_specular: [0x800, ["specularFactor", "specularColorFactor"], ["specularTexture", "specularColorTexture"], ["specularTexture", "specularColorTexture"]],
            KHR_materials_transmission: [0x1000, ["transmissionFactor"], ["transmissionTexture"], ["transmissionTexture"]],
            KHR_materials_unlit: [0x2000, [], [], []],
            KHR_materials_variants: [0x4000, [], [], []],
            KHR_materials_volume: [0x8000, ["thicknessFactor", "attenuationDistance", "attenuationColor"], ["thicknessTexture"], ["thicknessTexture"]],
        };
        for (let i = 0; i < count; i++) {
            const material = materials[i];
            const asset = {
                uuid: "" + 32 + "-" + i,
                classid: 32,
                name: material.name || "",
                label: material.name || "",
                shader: "1-1-1.miaokit.builtins:/shader/gltf_sketchfab/17-10_gltf_sketchfab.json",
                flags: 0,
                properties: {
                    textures: {},
                    vectors: {}
                }
            };
            if (material.alphaMode) {
                if (material.alphaMode == "OPAQUE") {
                    asset.flags |= 0 << 28;
                    asset.properties.vectors["alphaMode"] = [0];
                }
                else if (material.alphaMode == "MASK") {
                    asset.flags |= 1 << 28;
                    asset.properties.vectors["alphaMode"] = [1];
                }
                else if (material.alphaMode == "BLEND") {
                    asset.flags |= 2 << 28;
                    asset.properties.vectors["alphaMode"] = [2];
                }
                else {
                    this._worker.Track("gltf alphaMode unsupported " + material.alphaMode, 3);
                }
            }
            if (material.doubleSided) {
                asset.flags |= 8388608;
                asset.properties.vectors["doubleSided"] = [1];
            }
            for (let key of base_list[0]) {
                const value = material[key];
                if (value !== undefined) {
                    if (typeof value == "number") {
                        asset.properties.vectors[key] = [value];
                    }
                    else {
                        asset.properties.vectors[key] = value;
                    }
                }
            }
            for (let key of base_list[1]) {
                const value = material[key];
                if (value) {
                    asset.properties.textures[key] = getTexture(value.index);
                }
            }
            const pbr = material.pbrMetallicRoughness;
            if (pbr) {
                for (let key of pbr_list[0]) {
                    const value = pbr[key];
                    if (value !== undefined) {
                        if (typeof value == "number") {
                            asset.properties.vectors[key] = [value];
                        }
                        else {
                            asset.properties.vectors[key] = value;
                        }
                    }
                }
                for (let key of pbr_list[1]) {
                    const value = pbr[key];
                    if (value) {
                        asset.properties.textures[key] = getTexture(value.index);
                    }
                }
            }
            const extensions = material.extensions;
            if (extensions) {
                let flags = 0;
                for (let ext_key in extensions) {
                    const list = extension_lut[ext_key];
                    if (list) {
                        const ext = extensions[ext_key];
                        flags |= list[0];
                        for (let key of list[1]) {
                            const value = ext[key];
                            if (value !== undefined) {
                                if (typeof value == "number") {
                                    asset.properties.vectors[key] = [value];
                                }
                                else {
                                    asset.properties.vectors[key] = value;
                                }
                            }
                        }
                        for (let i = 0; i < list[2].length; i++) {
                            const value = ext[list[2][i]];
                            if (value) {
                                asset.properties.textures[list[3][i]] = getTexture(value.index);
                            }
                        }
                    }
                    else {
                        console.warn("不支持的GLTF材质扩展！", ext_key);
                    }
                }
                asset.properties.vectors["extensions"] = [flags];
            }
            material.extras = asset;
            material_library.push(asset);
        }
        return material_library;
    }
    async LoadNodes(animations_library) {
        const this_ = this;
        const nodes = [];
        const batches = [];
        const transforms = [];
        const mesh_renderers = [];
        const mesh_renderer_library = [];
        let node_index = 0;
        let instance_index = 0;
        let jointsLut;
        let skeletonList;
        const animator = animations_library ? {
            instance: 0,
            node: -1,
            animations: [animations_library[0].uuid],
            targets_binding: []
        } : null;
        function proc(nodeIndex, parentIndex, depth) {
            const node = this_._data.nodes[nodeIndex];
            const node_id = node.name || "" + nodeIndex;
            const parent = this_._data.nodes[parentIndex]?.extras;
            jointsLut[node_id] = instance_index;
            if (!node.extras) {
                node.extras = {
                    node: {
                        index: node_index++,
                        id: node_id,
                        name: node_id,
                        depth: depth,
                        parent: parent ? parent.node.index : -1,
                    }
                };
                if (node.mesh != undefined) {
                    const mesh = this_._data.meshes[node.mesh];
                    const asset = {
                        uuid: "" + 48 + "-" + mesh_renderer_library.length,
                        classid: 48,
                        name: mesh.extras.name,
                        label: mesh.extras.label,
                        mesh: mesh.extras.uuid,
                        materials: []
                    };
                    const matCount = mesh.primitives.length;
                    for (let i = 0; i < matCount; i++) {
                        const matIndex = mesh.primitives[i].material;
                        const mat = this_._data.materials[matIndex];
                        if (matIndex != undefined) {
                            asset.materials.push({
                                slot: i,
                                submesh: i,
                                material: mat.extras.uuid
                            });
                        }
                    }
                    node.extras.mesh_renderer = asset;
                    mesh_renderer_library.push(asset);
                    if (node.skin != undefined) {
                        mesh.extras.skeleton_skin = this_._data.skins[node.skin].extras;
                    }
                }
                nodes.push(node.extras.node);
            }
            else {
            }
            const transform = {
                instance: instance_index++,
                node: node.extras.node.index,
            };
            if (node.translation) {
                transform.localPosition = node.translation;
            }
            if (node.rotation) {
                transform.localRotation = node.rotation;
            }
            if (node.scale) {
                transform.localScale = node.scale;
            }
            if (node.matrix) {
                transform.localMatrix = node.matrix;
            }
            transforms.push(transform);
            if (node.extras.mesh_renderer) {
                const mesh_renderer = {
                    instance: transform.instance,
                    node: transform.node,
                    mesh_renderer: node.extras.mesh_renderer.uuid
                };
                mesh_renderers.push(mesh_renderer);
                const skeleton_skin = this_._data.meshes[node.mesh].extras.skeleton_skin;
                if (skeleton_skin) {
                    skeletonList.push({
                        mesh_renderer,
                        skeleton_skin
                    });
                }
            }
            if (node.children) {
                for (let child of node.children) {
                    proc(child, nodeIndex, depth + 1);
                }
            }
        }
        for (let scene of this._data.scenes) {
            jointsLut = {};
            skeletonList = [];
            if (scene.nodes) {
                for (let index of scene.nodes) {
                    const batch = {
                        source: -1,
                        instanceBeg: instance_index,
                        instanceCount: 0,
                    };
                    proc(index, -1, 0);
                    batch.source = this._data.nodes[index].extras.node.index;
                    batch.instanceCount = instance_index - batch.instanceBeg;
                    batches.push(batch);
                }
            }
            for (let binding of skeletonList) {
                binding.mesh_renderer.joints_binding = binding.skeleton_skin.joints.map((id) => {
                    const instance = jointsLut[id];
                    return instance == undefined ? -1 : instance;
                });
            }
            if (animator) {
                const names = animations_library[0].targets;
                for (let i = 0; i < names.length; i++) {
                    if (animator.targets_binding[i] == undefined) {
                        animator.targets_binding[i] = jointsLut[names[i]];
                    }
                }
            }
        }
        const prefab = {
            uuid: "" + 65 + "-" + 0,
            classid: 65,
            name: this._data.asset.extras.name || "",
            label: this._data.asset.extras.name || "",
            instanceCount: instance_index + 1,
            nodes,
            batches,
            transforms,
            mesh_renderers
        };
        if (animator) {
            const names = animations_library[0].targets;
            for (let i = 0; i < names.length; i++) {
                if (animator.targets_binding[i] == undefined) {
                    animator.targets_binding[i] = -1;
                    console.error("查找不到动画驱动目标实例！", names[i]);
                }
            }
            animator.instance = instance_index;
            prefab.animators = [animator];
        }
        return [[prefab], mesh_renderer_library];
    }
    async LoadSkeletons() {
        const skeleton_count = this._data.skins?.length || 0;
        for (let i = 0; i < skeleton_count; i++) {
            const skin = this._data.skins[i];
            const data = await this.LoadSkeleton(i);
            const name = skin.name || ("skeleton" + i);
            const skeleton_uuid = "" + 33 + "-" + i;
            const skeleton_file_path = `skeleton/${skeleton_uuid}_${name}.bin`;
            skin.extras = {
                root: data[0],
                joints: data[1],
                skeleton: skeleton_uuid
            };
            this._files_cache[skeleton_file_path] = data[2];
        }
    }
    async LoadSkeleton(index) {
        const nodes = this._data.nodes;
        const skin = this._data.skins[index];
        const accessor = this._data.accessors[skin.inverseBindMatrices];
        if (undefined == accessor.bufferView || "MAT4" != accessor.type) {
            console.error("异常的骨骼蒙皮数据！");
            return null;
        }
        const bufferView = this._data.bufferViews[accessor.bufferView];
        const buffer = this._data.buffers[bufferView.buffer];
        let offset = undefined != accessor.byteOffset ? accessor.byteOffset : 0;
        offset += undefined != bufferView.byteOffset ? bufferView.byteOffset : 0;
        const array = this.GetAccessorData(buffer.extras.buffer, offset, bufferView.byteStride, accessor.type, accessor.componentType, accessor.count);
        const joints_name = [];
        for (let i = 0; i < skin.joints.length; i++) {
            const node = nodes[skin.joints[i]];
            joints_name[i] = node.name || ("" + i);
        }
        let root_node_i = skin.skeleton;
        if (root_node_i == undefined) {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].skin == index) {
                    root_node_i = i;
                }
            }
        }
        const root_name = nodes[root_node_i].name || ("" + root_node_i);
        let root_index = joints_name.indexOf(root_name);
        if (root_index == -1) {
            root_index = joints_name.length;
            joints_name.push(root_name);
        }
        let skeleton_buffer = null;
        {
            const encoder = this._worker.env.textEncoder;
            const names_ = joints_name.join(",");
            const names_carray = encoder.encode(names_);
            const names_length = (names_carray.byteLength + 3 + 1) & ~3;
            let intLength = 0;
            const binaryOffset = intLength;
            intLength += 12;
            const headerOffset = intLength;
            intLength += 8;
            const invMatsOffset = intLength;
            intLength += joints_name.length * 16;
            const namesOffset = intLength;
            intLength += names_length / 4;
            const buffer = new ArrayBuffer(intLength * 4);
            const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
            const header = new Uint32Array(buffer, headerOffset * 4, 8);
            const invMats = new Float32Array(buffer, invMatsOffset * 4, joints_name.length * 16);
            const names = new Uint8Array(buffer, namesOffset * 4, names_length);
            binary[0] = MAGIC_INVALID + 33;
            binary[1] = 1;
            binary[2] = buffer.byteLength;
            binary[3] = 0;
            binary[4] = 0;
            binary[5] = 0;
            binary[6] = 0;
            binary[7] = 0;
            binary[8] = 0;
            binary[9] = 0;
            binary[10] = 0;
            binary[11] = 0;
            header[0] = 0;
            header[1] = joints_name.length;
            header[2] = root_index;
            header[3] = names_length;
            header[4] = 0;
            header[5] = 0;
            header[6] = invMatsOffset;
            header[7] = namesOffset;
            names.set(names_carray);
            for (let i = 0; i < joints_name.length; i++) {
                const i16 = i * 16;
                if (i == root_index) {
                    invMats.set([
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ], i16);
                }
                else {
                    for (let j = 0; j < 16; j++) {
                        invMats[i16 + j] = array.get(i16 + j);
                    }
                }
            }
            skeleton_buffer = buffer;
        }
        return [root_index, joints_name, skeleton_buffer, null];
    }
    async LoadAnimations() {
        if (!this._data.animations) {
            return null;
        }
        const targetLut = [];
        const tatgetList = [];
        const LutTarget = (node) => {
            if (targetLut[node] != undefined) {
                return targetLut[node];
            }
            const name = this._data.nodes[node].name || "" + node;
            const target = tatgetList.length;
            targetLut[node] = target;
            tatgetList.push(name);
            return target;
        };
        const clipList = [];
        for (let a = 0; a < this._data.animations.length; a++) {
            const clip = await this.LoadAnimation(a, LutTarget);
            if (clip) {
                clipList.push(clip);
            }
        }
        for (let clipData of clipList) {
            clipData[3] = tatgetList.length;
        }
        const encoder = this._worker.env.textEncoder;
        const names_ = tatgetList.join(",");
        const names_carray = encoder.encode(names_);
        const names_length = (names_carray.byteLength + 3 + 1) & ~3;
        let intLength = 0;
        const binaryOffset = intLength;
        intLength += 12;
        const headerOffset = intLength;
        intLength += 4;
        const namesOffset = intLength;
        intLength += names_length / 4;
        const ptrsOffset = intLength;
        intLength += clipList.length;
        const ptrs_ = new Uint32Array(clipList.length);
        for (let i = 0; i < clipList.length; i++) {
            ptrs_[i] = intLength;
            intLength += clipList[i].length;
        }
        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 4);
        const names = new Uint8Array(buffer, namesOffset * 4, names_length);
        const ptrs = new Uint32Array(buffer, ptrsOffset * 4, clipList.length);
        binary[0] = MAGIC_INVALID + 40;
        binary[1] = 1;
        binary[2] = buffer.byteLength;
        binary[3] = 0;
        binary[4] = 0;
        binary[5] = 0;
        binary[6] = 0;
        binary[7] = 0;
        binary[8] = 0;
        binary[9] = 0;
        binary[10] = 0;
        binary[11] = 0;
        header[0] = tatgetList.length;
        header[1] = clipList.length;
        header[2] = namesOffset;
        header[3] = ptrsOffset;
        names.set(names_carray);
        ptrs.set(ptrs_);
        for (let i = 0; i < clipList.length; i++) {
            const clipData = clipList[i];
            (new Uint32Array(buffer, ptrs[i] * 4, clipData.length)).set(clipData);
        }
        const uuid = "" + 40 + "-0";
        const asset_name = this._data.asset.extras.name;
        const file_path = `anims/${uuid}_${asset_name}.bin`;
        this._files_cache[file_path] = buffer;
        const asset = {
            uuid: "" + 41 + "-0",
            classid: 41,
            name: asset_name,
            label: asset_name,
            targets: tatgetList,
            data: uuid
        };
        return [asset];
    }
    async LoadAnimation(index, LutTarget) {
        const animation = this._data.animations[index];
        const samplerCount = animation.samplers.length;
        const channelCount = animation.channels.length;
        const stats = [
            { totalLength: 0, accessors: [], lut: {} },
            { totalLength: 0, accessors: [], lut: {} }
        ];
        const Load = (slot, iaccessor) => {
            let stat = stats[slot];
            let accessor_ = stat.accessors[stat.lut[iaccessor]];
            if (accessor_) {
                return accessor_;
            }
            const accessor = this._data.accessors[iaccessor];
            const bufferView = this._data.bufferViews[accessor.bufferView];
            const buffer = this._data.buffers[bufferView.buffer];
            let offset = undefined != accessor.byteOffset ? accessor.byteOffset : 0;
            offset += undefined != bufferView.byteOffset ? bufferView.byteOffset : 0;
            const array = this.GetAccessorData(buffer.extras.buffer, offset, bufferView.byteStride, accessor.type, accessor.componentType, accessor.count);
            accessor_ = {
                offset: stat.totalLength,
                array: array.array
            };
            stat.totalLength += array.array.length;
            stat.lut[iaccessor] = stat.accessors.length;
            stat.accessors.push(accessor_);
            return accessor_;
        };
        let maxTS = 0;
        for (let sampler of animation.samplers) {
            const timeline = Load(0, sampler.input);
            const keyframe = Load(1, sampler.output);
            const maxTS_ = timeline.array[timeline.array.length - 1];
            if (maxTS < maxTS_) {
                maxTS = maxTS_;
            }
        }
        let binSize = 12;
        const offsetChannels = binSize;
        binSize += 3 * channelCount;
        const offsetSamplers = binSize;
        binSize += 6 * samplerCount;
        const offsetTimeline = binSize;
        binSize += stats[0].totalLength;
        const offsetKeyframes = binSize;
        binSize += stats[1].totalLength;
        const buffer = new ArrayBuffer(binSize * 4);
        const writer = new Uint32Array(buffer);
        writer[0] = index;
        writer[1] = buffer.byteLength;
        writer[2] = Math.ceil(maxTS * 1000.0);
        writer[3] = 0;
        writer[4] = channelCount;
        writer[5] = samplerCount;
        writer[6] = stats[0].totalLength * 4;
        writer[7] = stats[1].totalLength * 4;
        writer[8] = offsetChannels;
        writer[9] = offsetSamplers;
        writer[10] = offsetTimeline;
        writer[11] = offsetKeyframes;
        for (let i = 0; i < channelCount; i++) {
            const channel = animation.channels[i];
            let attribute = 0;
            switch (channel.target.path) {
                case "translation":
                    attribute = 1;
                    break;
                case "rotation":
                    attribute = 2;
                    break;
                case "scale":
                    attribute = 3;
                    break;
                case "weights":
                    attribute = 4;
                    break;
                default:
                    console.error("非法动画驱动属性类型！", channel.target.path);
                    break;
            }
            const index3 = offsetChannels + i * 3;
            writer[index3 + 0] = channel.sampler;
            writer[index3 + 1] = LutTarget(channel.target.node);
            writer[index3 + 2] = attribute;
        }
        for (let i = 0; i < samplerCount; i++) {
            const samplers = animation.samplers[i];
            const inputAcc = stats[0].accessors[stats[0].lut[samplers.input]];
            const outputAcc = stats[1].accessors[stats[1].lut[samplers.output]];
            const index6 = offsetSamplers + i * 6;
            writer[index6 + 0] = inputAcc.offset;
            writer[index6 + 1] = inputAcc.array.length;
            writer[index6 + 2] = Math.ceil(inputAcc.array[inputAcc.array.length - 1] * 1000.0);
            writer[index6 + 3] = outputAcc.offset;
            writer[index6 + 4] = outputAcc.array.length / inputAcc.array.length;
            writer[index6 + 5] = samplers.interpolation == "LINEAR" ? 0 : (samplers.interpolation == "STEP" ? 1 : 2);
        }
        const timeline = new Uint8Array(buffer, offsetTimeline * 4, writer[6]);
        {
            let binOffset = 0;
            for (let acc of stats[0].accessors) {
                timeline.set(new Uint8Array(acc.array.buffer, acc.array.byteOffset, acc.array.byteLength), binOffset);
                binOffset += acc.array.byteLength;
            }
            if (binOffset !== timeline.byteLength) {
                console.error("GLTF动画时间线数据读写大小不一致", binOffset, timeline.byteLength);
            }
        }
        const keyframes = new Uint8Array(buffer, offsetKeyframes * 4, writer[7]);
        {
            let binOffset = 0;
            for (let acc of stats[1].accessors) {
                keyframes.set(new Uint8Array(acc.array.buffer, acc.array.byteOffset, acc.array.byteLength), binOffset);
                binOffset += acc.array.byteLength;
            }
            if (binOffset !== keyframes.byteLength) {
                console.error("GLTF动画关键帧集数据读写大小不一致", binOffset, keyframes.byteLength);
            }
        }
        return writer;
    }
    _worker;
    _data;
    _files_cache;
}
