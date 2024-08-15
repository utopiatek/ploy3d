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
        const mesh_library = await this.LoadMeshes();
        progress(0.4, "装载并压缩贴图");
        await this.LoadTextures((rate, msg) => { progress(0.4 + 0.4 * rate, msg); });
        progress(0.7, "解析材质");
        const material_library = await this.LoadMaterials((index) => {
            return this._data.textures[index].extras;
        });
        progress(0.8, "解析对象结构");
        const [prefab_library, mesh_renderer_library] = await this.LoadNodes();
        progress(0.9, "加载动画数据");
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
                        weight1 = Math.round(weight1 * 255.0);
                        let weight2 = warray.get(index4 + 2);
                        weight2 = Math.round(weight2 * 255.0);
                        let weight3 = warray.get(index4 + 3);
                        weight3 = Math.round(weight3 * 255.0);
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
                uri: ":/" + images[texture.source]?.uri,
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
        const name = `${29}-${index}_${image.name || ""}`;
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
        for (let i = 0; i < count; i++) {
            const material = materials[i];
            const asset = {
                uuid: "" + 32 + "-" + i,
                classid: 32,
                name: material.name || "",
                label: material.name || "",
                shader: "1-1-1.miaokit.builtins:/shader/17-0_standard_specular.json",
                flags: 0,
                properties: {
                    textures: {},
                    vectors: {}
                }
            };
            if (material.alphaMode) {
                if (material.alphaMode == "OPAQUE") {
                    asset.flags |= 0 << 28;
                }
                else if (material.alphaMode == "MASK") {
                    asset.flags |= 1 << 28;
                }
                else if (material.alphaMode == "BLEND") {
                    asset.flags |= 2 << 28;
                }
                else {
                    this._worker.Track("gltf alphaMode unsupported " + material.alphaMode, 3);
                }
            }
            if (material.doubleSided) {
                asset.flags |= 1048576;
            }
            const pbr = material.pbrMetallicRoughness;
            if (pbr) {
                if (pbr.baseColorFactor) {
                    asset.properties.vectors["baseColor"] = pbr.baseColorFactor;
                }
                if (pbr.baseColorTexture) {
                    asset.properties.textures["baseTex"] = getTexture(pbr.baseColorTexture.index);
                }
                if (undefined !== pbr.metallicFactor) {
                    asset.properties.vectors["metallicFactor"] = [pbr.metallicFactor];
                }
                else {
                    asset.properties.vectors["metallicFactor"] = [1];
                }
                if (undefined !== pbr.roughnessFactor) {
                    asset.properties.vectors["glossinessFactor"] = [1.0 - pbr.roughnessFactor];
                }
                else {
                    asset.properties.vectors["glossinessFactor"] = [1.0];
                }
                if (pbr.metallicRoughnessTexture) {
                    asset.properties.textures["glossinessTex"] = getTexture(pbr.metallicRoughnessTexture.index);
                    asset.properties.textures["specularTex"] = getTexture(pbr.metallicRoughnessTexture.index);
                }
            }
            const normal = material.normalTexture;
            if (normal) {
                asset.properties.textures["normalTex"] = getTexture(normal.index);
            }
            const ao = material.occlusionTexture;
            if (ao) {
                asset.properties.textures["aoTex"] = getTexture(ao.index);
            }
            if (material.emissiveFactor) {
                asset.properties.vectors["emissiveFactor"] = material.emissiveFactor;
                asset.properties.vectors["emissiveIntensity"] = [1.0];
            }
            const emissive = material.emissiveTexture;
            if (emissive) {
                asset.properties.textures["emissiveTex"] = getTexture(emissive.index);
                asset.properties.vectors["emissiveIntensity"] = [1.0];
            }
            const extensions = material.extensions;
            if (extensions) {
                const KHR_materials_clearcoat = extensions.KHR_materials_clearcoat;
                if (KHR_materials_clearcoat) {
                    asset.properties.vectors["clearcoatFactor"] = [KHR_materials_clearcoat.clearcoatFactor];
                    asset.properties.vectors["clearcoatRoughnessFactor"] = [KHR_materials_clearcoat.clearcoatRoughnessFactor];
                }
                const KHR_materials_unlit = extensions.KHR_materials_unlit;
                if (KHR_materials_unlit) {
                    asset.flags |= 16777216;
                }
                const KHR_materials_pbrSpecularGlossiness = extensions.KHR_materials_pbrSpecularGlossiness;
                if (KHR_materials_pbrSpecularGlossiness) {
                    asset.flags |= 134217728;
                    if (KHR_materials_pbrSpecularGlossiness.diffuseFactor) {
                        asset.properties.vectors["baseColor"] = KHR_materials_pbrSpecularGlossiness.diffuseFactor;
                    }
                    if (KHR_materials_pbrSpecularGlossiness.diffuseTexture) {
                        asset.properties.textures["baseTex"] = getTexture(KHR_materials_pbrSpecularGlossiness.diffuseTexture.index);
                    }
                    if (KHR_materials_pbrSpecularGlossiness.specularFactor) {
                        asset.properties.vectors["specularFactor"] = KHR_materials_pbrSpecularGlossiness.specularFactor;
                    }
                    if (KHR_materials_pbrSpecularGlossiness.glossinessFactor) {
                        asset.properties.vectors["glossinessFactor"] = [KHR_materials_pbrSpecularGlossiness.glossinessFactor];
                    }
                    if (KHR_materials_pbrSpecularGlossiness.specularGlossinessTexture) {
                        asset.properties.textures["specularTex"] = getTexture(KHR_materials_pbrSpecularGlossiness.specularGlossinessTexture.index);
                        asset.properties.textures["glossinessTex"] = getTexture(KHR_materials_pbrSpecularGlossiness.specularGlossinessTexture.index);
                    }
                }
                const MV_sssTexture = extensions.MV_sssTexture;
                if (MV_sssTexture) {
                    asset.properties.textures["sssTex"] = getTexture(MV_sssTexture.index);
                }
                const MV_subsurface = extensions.MV_sssTexture;
                if (MV_subsurface) {
                    asset.flags |= 67108864;
                }
            }
            material.extras = asset;
            material_library.push(asset);
        }
        return material_library;
    }
    async LoadNodes() {
        const this_ = this;
        const nodes = [];
        const batches = [];
        const transforms = [];
        const mesh_renderers = [];
        const mesh_renderer_library = [];
        let node_index = 0;
        let instance_index = 0;
        function proc(nodeIndex, parentIndex, depth) {
            const node = this_._data.nodes[nodeIndex];
            const parent = this_._data.nodes[parentIndex]?.extras;
            if (!node.extras) {
                node.extras = {
                    node: {
                        index: node_index++,
                        name: node.name || ("object_" + (node_index - 1)),
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
                }
                nodes.push(node.extras.node);
            }
            const transform = {
                instance: instance_index++,
                node: nodeIndex,
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
                    node: nodeIndex,
                    mesh_renderer: node.extras.mesh_renderer.uuid
                };
                mesh_renderers.push(mesh_renderer);
            }
            if (node.children) {
                for (let child of node.children) {
                    proc(child, nodeIndex, depth + 1);
                }
            }
        }
        for (let scene of this._data.scenes) {
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
        return [[prefab], mesh_renderer_library];
    }
    async LoadSkeleton(index) {
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
        let intLength = 0;
        const headerOffset = intLength;
        intLength += 12 + 8;
        const initDatasOffset = intLength;
        intLength += 12 * 0;
        const inverseBindMatrices = intLength;
        intLength += 16 * 0;
        return 0;
    }
    _worker;
    _data;
    _files_cache;
}
//# sourceMappingURL=importer_gltf.js.map