import type * as Miaoverse from "../mod.js"
import type { Miaoworker } from './worker.js';
import { CLASSID, BLEND_MODE, RENDER_FLAGS } from "../mod.js"

/** GLTF导入器。 */
export class Importer_gltf {
    /**
     * 构造函数。
     * @param _worker 事务处理器对象。
     */
    public constructor(_worker: Miaoworker) {
        this._worker = _worker;
    }

    /** 
     * 装载GLTF场景数据。
     */
    public async Load(data: Gltf, progress: (rate: number, msg: string) => void) {
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

        const prefab_library = await this.LoadNodes();

        progress(0.9, "加载动画数据");

        //const anims = await this.LoadAnimations(prefabs.nodes);

        progress(1.0, "资源包解析完成");

        const uuid = await this._worker.env.uuidGen();
        const uuid_parts = uuid.split("-");

        const pkg: Miaoverse.Package = {
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
            prefab_library,

            file_library: Object.keys(this._files_cache)
        };

        const pkg_key = pkg.uuid + "." + pkg.author + "." + pkg.name;

        const pkg_reg: Miaoverse.PackageReg = {
            key: pkg_key,
            uuid: pkg.uuid,
            invalid: false,
            path: "./assets/packages/" + pkg_key + ".ab",
            zip: false,
            meta: pkg
        };

        return { pkg: pkg_reg, files: this._files_cache };
    }


    /**
     * 异步装载所有缓存数据。
     */
    private async LoadBuffers() {
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

    /**
     * 异步请求二进制数据缓存。
     * @param uri 
     * @returns 
     */
    private async LoadBuffer(uri: string) {
        const zip = this._data.asset.extras.zip;

        if (zip && !uri.startsWith("data:")) {
            return zip.file(uri).async("arraybuffer");
        }
        else {
            return this._worker.Fetch<ArrayBuffer>(uri, null, "arrayBuffer");
        }
    }


    /**
     * 解析所有网格数据。
     */
    private async LoadMeshes() {
        const meshCount = this._data.meshes?.length || 0;
        const mesh_library: Miaoverse.Package["mesh_library"] = [];

        for (let i = 0; i < meshCount; i++) {
            const mesh = await this.LoadMesh(i);
            mesh_library.push(mesh);
        }

        return mesh_library;
    }

    /**
     * 解析指定索引的网格数据。
     * @param meshIndex 网格索引。
     */
    private LoadMesh(meshIndex: number) {
        const meshData = this._data.meshes[meshIndex];

        // 包含的顶点数据类型标志集：
        // 1-顶点索引数组（UINT）
        // 2-顶点坐标数组（FLOAT3，必含）
        // 4-顶点法线数组（FLOAT3）
        // 8-顶点纹理坐标数组（FLOAT2）
        // 16-顶点骨骼绑定数组（UBYTE4）
        // 32-顶点骨骼绑定权重数组（UBYTE4）
        let channels = 1;
        // 顶点数量
        let vCount = 0;
        // 顶点索引数量（如果不提供顶点索引数组，则该值应等于顶点数量）
        let iCount = 0;
        // 子网格数量
        let ibCount = 0;

        const primitives: {
            primitive?: typeof meshData["primitives"][0];
            indices?: ReturnType<Importer_gltf["GetIndices"]>;
            vertices?: ReturnType<Importer_gltf["GetAttribute"]>;
            normals?: ReturnType<Importer_gltf["GetAttribute"]>;
            uvs?: ReturnType<Importer_gltf["GetAttribute"]>;
            bones?: ReturnType<Importer_gltf["GetAttribute"]>;
            weights?: ReturnType<Importer_gltf["GetAttribute"]>;
        }[] = [];

        for (let i = 0; i < meshData.primitives.length; i++) {
            const primitive: (typeof primitives)[0] = primitives[i] = {
                primitive: meshData.primitives[i],
                vertices: this.GetAttribute(meshIndex, i, "POSITION"),
                normals: this.GetAttribute(meshIndex, i, "NORMAL"),
                uvs: this.GetAttribute(meshIndex, i, "TEXCOORD_0"),
                bones: this.GetAttribute(meshIndex, i, "JOINTS_0"),
                weights: this.GetAttribute(meshIndex, i, "WEIGHTS_0"),
            };

            if (primitive.vertices) { channels |= 2; }
            if (primitive.normals) { channels |= 4; }
            if (primitive.uvs) { channels |= 8; }
            if (primitive.bones) { channels |= 16; }
            if (primitive.weights) { channels |= 32; }

            primitive.indices = this.GetIndices(meshIndex, i, vCount);

            vCount += primitive.vertices.accessor.count;
            iCount += primitive.indices?.accessor.count || primitive.vertices.accessor.count;
            ibCount += 1;
        }

        // ============---------------------------

        let intLength = 0;

        const headerOffset = intLength; intLength += 8;
        const groupsOffset = intLength; intLength += 4 * ibCount;

        const indicesOffset = intLength; intLength += iCount;

        const verticesOffset = intLength; intLength += 3 * vCount;

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

        // ============---------------------------

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

                vertices[vert3 + 0] = varray[index3 + 0];
                vertices[vert3 + 1] = varray[index3 + 1];
                vertices[vert3 + 2] = varray[index3 + 2];

                if (normals) {
                    if (narray) {
                        normals[vert3 + 0] = narray[index3 + 0];
                        normals[vert3 + 1] = narray[index3 + 1];
                        normals[vert3 + 2] = narray[index3 + 2];
                    }
                    else {
                        normals[vert3 + 0] = 0;
                        normals[vert3 + 1] = 0;
                        normals[vert3 + 2] = 1;
                    }
                }

                if (uvs) {
                    if (tarray) {
                        uvs[vert2 + 0] = tarray[index2 + 0];
                        uvs[vert2 + 1] = tarray[index2 + 1];
                    }
                    else {
                        uvs[vert2 + 0] = 0;
                        uvs[vert2 + 1] = 0;
                    }
                }

                if (bones) {
                    if (barray) {
                        const joint0 = barray[index4 + 0];
                        const joint1 = barray[index4 + 1];
                        const joint2 = barray[index4 + 2];
                        const joint3 = barray[index4 + 3];

                        bones[vert1] = (joint3 << 24) + (joint2 << 16) + (joint1 << 8) + joint0;
                    }
                    else {
                        bones[vert1] = 0;
                    }
                }

                if (weights) {
                    if (warray) {
                        let weight0 = warray[index4 + 0]; weight0 = Math.round(weight0 * 255.0);
                        let weight1 = warray[index4 + 1]; weight1 = Math.round(weight1 * 255.0);
                        let weight2 = warray[index4 + 2]; weight2 = Math.round(weight2 * 255.0);
                        let weight3 = warray[index4 + 3]; weight3 = Math.round(weight3 * 255.0);

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
                const vertexOffset = primitive.indices.vertexOffset;

                for (let i of iarray) {
                    indices[iindex++] = i + vertexOffset;
                }

                groups[g4 + 2] = iarray.length;
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

        const res: [number, never] = this._worker.internal.Worker_CreateMeshData(data_ptr);
        const res_ab = env.uarrayGet(res[1], 0, Math.ceil(res[0] / 4)).buffer;
        const res_data = new Uint8Array(res_ab);

        this._worker.internal.System_Delete(data_ptr);
        this._worker.internal.System_Delete(res[1]);

        const name = `${CLASSID.ASSET_MESH_DATA}-${meshIndex}_${meshData.name || ""}`;
        const uri = "mesh/" + name + ".bin";

        this._files_cache[uri] = res_data;

        const asset: Miaoverse.Asset_mesh = {
            uuid: "" + CLASSID.ASSET_MESH + "-" + meshIndex,
            classid: CLASSID.ASSET_MESH,
            name: meshData.name || "",
            label: meshData.name || "",

            meshdata: ":/" + uri,
        };

        meshData.extras = asset;

        return asset;
    }

    /**
     * 获取顶点属性数据。
     * @param meshIndex 
     * @param subIndex 
     * @param name 
     * @returns 
     */
    private GetAttribute(meshIndex: number, subIndex: number, name: string) {
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
            array: this.GetAccessorData(buffer.extras.buffer, offset, accessor.type, accessor.componentType, accessor.count),
        };
    }

    /**
     * 获取子网格索引数据。
     * @param meshIndex 
     * @param subIndex 
     * @param vertexOffset 
     * @returns 
     */
    private GetIndices(meshIndex: number, subIndex: number, vertexOffset: number) {
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
            array: this.GetAccessorData(buffer.extras.buffer, offset, accessor.type, accessor.componentType, accessor.count),
            vertexOffset: vertexOffset,
        };
    }

    /**
     * 获取数据访问器数据。
     * @param buffer 
     * @param offset 
     * @param type 
     * @param componentType 
     * @param count 
     * @returns 
     */
    private GetAccessorData(buffer: ArrayBuffer, offset: number, type: string, componentType: number, count: number) {
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

        if (componentType === 5120) { // BYTE
            return new Int8Array(buffer, offset, componentCount * count);
        }
        else if (componentType === 5121) { // UNSIGNED_BYTE
            return new Uint8Array(buffer, offset, componentCount * count);
        }
        else if (componentType === 5122) { // SHORT
            return new Int16Array(buffer, offset, componentCount * count);
        }
        else if (componentType === 5123) { // UNSIGNED_SHORT
            return new Uint16Array(buffer, offset, componentCount * count);
        }
        else if (componentType === 5125) { // UNSIGNED_INT
            return new Uint32Array(buffer, offset, componentCount * count);
        }
        else if (componentType === 5126) { // FLOAT
            return new Float32Array(buffer, offset, componentCount * count);
        }

        return null;
    }


    /**
     * 解析所有材质贴图属性。
     * @param progress 解析进度。
     */
    private async LoadTextures(progress: (rate: number, msg: string) => void) {
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

            const wrapper: Miaoverse.TextureNode = {
                uri: ":/" + images[texture.source]?.uri,
                uvts: [0, 0, 1, 1],
                color: [255, 255, 255, 255],
                sampler: {}
            };

            if (state) {
                switch (state.minFilter) {
                    case 9728/*NEAREST*/:
                        wrapper.sampler.minFilter = "nearest";
                        break;
                    case 9729/*LINEAR*/:
                        wrapper.sampler.minFilter = "linear";
                        break;
                    case 9984/*NEAREST_MIPMAP_NEAREST*/:
                        wrapper.sampler.minFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9985/*LINEAR_MIPMAP_NEAREST*/:
                        wrapper.sampler.minFilter = "linear";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9986/*NEAREST_MIPMAP_LINEAR*/:
                        wrapper.sampler.minFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    case 9987/*LINEAR_MIPMAP_LINEAR*/:
                        wrapper.sampler.minFilter = "linear";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    default:
                        break;
                }

                switch (state.magFilter) {
                    case 9728/*NEAREST*/:
                        wrapper.sampler.magFilter = "nearest";
                        break;
                    case 9729/*LINEAR*/:
                        wrapper.sampler.magFilter = "linear";
                        break;
                    case 9984/*NEAREST_MIPMAP_NEAREST*/:
                        wrapper.sampler.magFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9985/*LINEAR_MIPMAP_NEAREST*/:
                        wrapper.sampler.magFilter = "linear";
                        wrapper.sampler.mipmapFilter = "nearest";
                        break;
                    case 9986/*NEAREST_MIPMAP_LINEAR*/:
                        wrapper.sampler.magFilter = "nearest";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    case 9987/*LINEAR_MIPMAP_LINEAR*/:
                        wrapper.sampler.magFilter = "linear";
                        wrapper.sampler.mipmapFilter = "linear";
                        break;
                    default:
                        break;
                }

                wrapper.sampler.addressModeU = "repeat";
                wrapper.sampler.addressModeV = "repeat";

                if (33648/*MIRRORED_REPEAT*/ == state.wrapS) {
                    wrapper.sampler.addressModeU = "mirror-repeat";
                }
                else if (33071/*CLAMP_TO_EDGE*/ == state.wrapS) {
                    wrapper.sampler.addressModeU = "clamp-to-edge";
                }

                if (33648/*MIRRORED_REPEAT*/ == state.wrapT) {
                    wrapper.sampler.addressModeV = "mirror-repeat";
                }
                else if (33071/*CLAMP_TO_EDGE*/ == state.wrapT) {
                    wrapper.sampler.addressModeV = "clamp-to-edge";
                }
            }

            texture.extras = wrapper;
        }
    }

    /**
     * 装载指定索引图像。
     * @param index 图像索引。
     */
    private async LoadImage(index: number) {
        const image = this._data.images[index];
        const name = `${CLASSID.ASSET_TEXTURE_FILE}-${index}_${image.name || ""}`;

        let data: Uint8Array = null;
        let mime = "";
        let has_alpha = false;

        // 加载图片数据，引擎初始化后解码图片性能更高
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
            const ab: ArrayBuffer = await this.LoadBuffer(uri);

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

    /**
     * 解析所有材质定义。
     * @param getTexture 贴图属性查询方法。
     */
    private async LoadMaterials(getTexture: (index: number) => Miaoverse.TextureNode) {
        const material_library: Miaoverse.Package["material_library"] = [];
        const materials = this._data.materials || [];
        const count = materials.length;

        for (let i = 0; i < count; i++) {
            const material = materials[i];

            const asset: Miaoverse.Asset_material = {
                uuid: "" + CLASSID.ASSET_MATERIAL + "-" + i,
                classid: CLASSID.ASSET_MATERIAL,
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
                    asset.flags |= BLEND_MODE.OPAQUE << RENDER_FLAGS.BLEND_MODE_INDEX;
                }
                else if (material.alphaMode == "MASK") {
                    asset.flags |= BLEND_MODE.MASKED << RENDER_FLAGS.BLEND_MODE_INDEX;
                }
                else if (material.alphaMode == "BLEND") {
                    asset.flags |= BLEND_MODE.TRANSPARENT << RENDER_FLAGS.BLEND_MODE_INDEX;
                }
                else {
                    this._worker.Track("gltf alphaMode unsupported " + material.alphaMode, 3);
                }
            }

            if (material.doubleSided) {
                asset.flags |= RENDER_FLAGS.HAS_DOUBLE_SIDED;
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
                    // TODO: asset.flags |= RENDER_FLAGS.Props_combining_roughness_metallic;

                    asset.properties.textures["glossinessTex"] = getTexture(pbr.metallicRoughnessTexture.index);
                    asset.properties.textures["specularTex"] = getTexture(pbr.metallicRoughnessTexture.index);
                }
            }

            const normal = material.normalTexture;
            if (normal) {
                // TODO: asset.flags |= RENDER_FLAGS.Props_normalTexFlipY;

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
                    asset.flags |= RENDER_FLAGS.SHADING_AS_UNLIT;
                }

                const KHR_materials_pbrSpecularGlossiness = extensions.KHR_materials_pbrSpecularGlossiness;
                if (KHR_materials_pbrSpecularGlossiness) {
                    asset.flags |= RENDER_FLAGS.SPECULAR_GLOSSINESS_PARAMS;

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
                    asset.flags |= RENDER_FLAGS.SHADING_AS_SUBSURFACE;
                }
            }

            material.extras = asset;

            material_library.push(asset);
        }

        return material_library;
    }

    /** 
     * 装载场景数据为预制件。
     */
    private async LoadNodes() {
        const this_ = this;

        const nodes: Miaoverse.Asset_prefab["nodes"] = [];
        const batches: Miaoverse.Asset_prefab["batches"] = [];
        const transforms: Miaoverse.Asset_prefab["transforms"] = [];

        // 进行先根深度优先排序，从而避免保存节点的子级列表
        let node_index = 0;
        // 实例索引，用于组件索引实例对象
        let instance_index = 0;

        function proc(nodeIndex: number, parentIndex: number, depth: number) {
            const node = this_._data.nodes[nodeIndex];
            const parent = this_._data.nodes[parentIndex]?.extras;

            if (!node.extras) {
                node.extras = {
                    index: node_index++,
                    name: node.name || ("object_" + (node_index - 1)),
                    depth: depth,
                    parent: parent?.index || -1,
                };

                nodes.push(node.extras);
            }

            const transform: (typeof transforms)[0] = {
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
                // TODO: 分解矩阵
            }

            transforms.push(transform);

            if (node.children) {
                for (let child of node.children) {
                    proc(child, nodeIndex, depth + 1);
                }
            }
        }

        for (let scene of this._data.scenes) {
            if (scene.nodes) {
                for (let index of scene.nodes) {
                    const batch: (typeof batches)[0] = {
                        source: -1,
                        instanceBeg: instance_index,
                        count: 0,
                    };

                    proc(index, -1, 0);

                    batch.source = this._data.nodes[index].extras.index;
                    batch.count = instance_index - batch.instanceBeg;

                    batches.push(batch);
                }
            }
        }

        const prefab: Miaoverse.Asset_prefab = {
            uuid: "",
            classid: CLASSID.ASSET_PREFAB,
            name: this._data.asset.extras.name || "",
            label: this._data.asset.extras.name || "",

            instanceCount: instance_index,
            nodes,
            batches,
            transforms
        };

        return [prefab];
    }

    /** 事务处理器。 */
    private _worker: Miaoworker;
    /** GLTF数据对象。 */
    private _data: Gltf;
    /** 资源文件数据缓存（使用文件相对路径索引）。 */
    private _files_cache: Record<string, any>;
}

/** GLTF数据格式。 */
interface Gltf {
    /** 资产元数据。 */
    asset: {
        /** 资产版本号。 */
        version: string;
        /** 装载器最小版本号需求。 */
        minVersion?: string;
        /** 创建工具信息。 */
        generator?: string;
        /** 版权信息。 */
        copyright?: string;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            /** 使用压缩包加载。 */
            zip: Miaoverse.JSZip;
            /** 资产路径。 */
            path: string;
            /** 资产名称。 */
            name: string;
            /** 初始位置平移。 */
            position: number[];
            /** 初始欧拉角旋转。 */
            rotation: number[];
            /** 初始大小缩放。 */
            scale: number[];
        };
    },
    /** 默认活动场景索引。 */
    scene?: number;
    /** 场景数组。 */
    scenes?: {
        /** 场景名称。 */
        name?: string;
        /** 场景根节点索引数组。 */
        nodes?: number[];
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 节点数组。 */
    nodes?: {
        /** 节点名称。 */
        name?: string;

        /** 节点变换平移参数（默认[0,0,0]）。 */
        translation?: number[];
        /** 节点变换旋转参数（四元数，XYZ顺序，默认[0,0,0,1]）。 */
        rotation?: number[];
        /** 节点变换缩放参数（默认[1,1,1]）。 */
        scale?: number[];
        /** 节点变换矩阵参数（列主矩阵，默认[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]）。 */
        matrix?: number[];

        /** 子节点索引数据。 */
        children?: number[];

        /** 节点关联相机组件索引。 */
        camera?: number;
        /** 节点关联网格索引。 */
        mesh?: number;
        /** 节点关联网格蒙皮数据索引。 */
        skin?: number;
        /** 节点所关联网格的变形实例所用的权重数组。 */
        weights?: number[];

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.Asset_prefab["nodes"][0];
    }[];
    /** 网格数组。 */
    meshes?: {
        /** 网格几何定义数组，每个元素表示一个子网格。 */
        primitives: {
            /** 属性名与属性数据访问器索引字典。 */
            attributes: Record<string, number>;
            /** 索引数据访问器索引。 */
            indices?: number;
            /** 图元类型，默认4。 */
            mode?: number;
            /** 材质索引。 */
            material?: number;

            /** 网格变形目标数组。 */
            targets?: any[];

            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        }[];

        /** 网格名称。 */
        name?: string;
        /** 网格变形所用的权重数组。 */
        weights?: number[];

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.Asset_mesh;
    }[];
    /** 网格蒙皮数组。 */
    skins?: {
        /** 蒙皮名称。 */
        name?: string;

        /** 骨架（关节）节点索引数组。 */
        joints: number[];
        /** 根关节节点索引。 */
        skeleton?: number;
        /** 包含每个关节逆变换矩阵（逆变换旨在消除绑定时关节的初始变换，单位矩阵将表示初始姿势）数据的缓存访问器索引。 */
        inverseBindMatrices?: number;

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 动画数组。 */
    animations?: {
        /** 动画名称。 */
        name?: string;

        /** 属性动画通道数组。 */
        channels: {
            /** 数据采样器索引。 */
            sampler: number;
            /** 目标属性。 */
            target: {
                /** 对象索引。 */
                node: number;
                /** 属性名称。 */
                path: string;

                /** 扩展信息。 */
                extensions?: never;
                /** 特定于应用程序的数据。 */
                extras?: never;
            },

            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        }[];
        /** 动画数据采样器数组。 */
        samplers: {
            /** 样点时间戳访问器索引。 */
            input: number;
            /** 样点数据访问器索引。 */
            output: number;
            /** 样点数据插值方式：LINEAR、STEP、CUBICSPLINE。 */
            interpolation: string;

            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        }[];

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 材质数组。 */
    materials?: {
        /** 材质名称。 */
        name?: string;

        /** ALPHA混合模式，默认OPAQUE。 */
        alphaMode?: string;
        /** ALPHA截断阈值，默认0.5。 */
        alphaCutoff?: number;
        /** 是否双面渲染，默认否。 */
        doubleSided?: boolean;

        /** PBR参数集。 */
        pbrMetallicRoughness?: {
            /** 非金属表面的漫反射反照率，金属表面的镜面反射颜色，颜色因子，默认[1,1,1,1]。 */
            baseColorFactor?: number[];
            /** 非金属表面的漫反射反照率，金属表面的镜面反射颜色，贴图信息。 */
            baseColorTexture?: {
                /** 贴图索引。 */
                index: number;
                /** UV通道，默认0。 */
                texCoord?: number;
                /** 扩展信息。 */
                extensions?: never;
                /** 特定于应用程序的数据。 */
                extras?: never;
            };
            /** 金属度，默认值1。 */
            metallicFactor?: number;
            /** 粗糙度，默认值1。 */
            roughnessFactor?: number;
            /** 金属度粗糙度贴图信息。 */
            metallicRoughnessTexture?: {
                /** 贴图索引。 */
                index: number;
                /** UV通道，默认0。 */
                texCoord?: number;
                /** 扩展信息。 */
                extensions?: never;
                /** 特定于应用程序的数据。 */
                extras?: never;
            };

            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };

        /** 切线空间的法线贴图信息。 */
        normalTexture?: {
            /** 贴图索引。 */
            index: number;
            /** UV通道，默认0。 */
            texCoord?: number;
            /** 法线强度缩放，默认1。 */
            scale?: number;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 环境光遮蔽贴图信息。 */
        occlusionTexture?: {
            /** 贴图索引。 */
            index: number;
            /** UV通道，默认0。 */
            texCoord?: number;
            /** 环境光遮蔽强度缩放，默认1。 */
            strength?: number;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 自发光贴图信息。 */
        emissiveTexture?: {
            /** 贴图索引。 */
            index: number;
            /** UV通道，默认0。 */
            texCoord?: number;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 自发光颜色因子。 */
        emissiveFactor?: number[];

        /** 扩展信息。 */
        extensions?: any;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.Asset_material;
    }[];
    /** 数据访问器数组。 */
    accessors?: {
        /** 访问器名称。 */
        name?: string;

        /** 缓存视图索引。 */
        bufferView?: number;
        /** 数据相对缓存视图字节偏移，默认0。 */
        byteOffset?: number;
        /** 数据类型枚举。 */
        componentType: number;
        /** 整型类型数据是否归一化，默认否。 */
        normalized?: boolean;
        /** 数据数量。 */
        count: number;
        /** 数据元素是数值、向量还是矩阵。 */
        type: string;
        /** 数据元素每个通道的最大值。 */
        max?: number[];
        /** 数据元素每个通道的最小值。 */
        min?: number[];

        /** 偏离其初始化值的元素的稀疏存储。 */
        sparse?: {
            // TODO
        };

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 数据缓存视图数组。 */
    bufferViews?: {
        /** 视图名称。 */
        name?: string;

        /** 缓存索引。 */
        buffer: number;
        /** 视图数据字节偏移，默认0。 */
        byteOffset?: number;
        /** 视图数据字节大小。 */
        byteLength: number;
        /** 视图数据跨距。 */
        byteStride?: number;
        /** 视图绑定到管线槽位枚举。 */
        target?: number;

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 数据缓存数组。 */
    buffers?: {
        /** 数据名称。 */
        name?: string;

        /** 数据URI。 */
        uri?: string;
        /** 数据字节大小。 */
        byteLength: number;

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            buffer: ArrayBuffer
        };
    }[];
    /** 贴图访问器数组。 */
    textures?: {
        /** 贴图名称。 */
        name?: string;

        /** 源图像索引。 */
        sampler?: number;
        /** 图像采样器索引。 */
        source?: number;

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.TextureNode;
    }[];
    /** 贴图源图像索引。 */
    images?: {
        /** 图像名称。 */
        name?: string;

        /** 图像URI。 */
        uri?: string;
        /** 图像数据缓存视图索引。 */
        bufferView?: number;
        /** 图像MIME（在使用bufferView的情况下必须包含该字段）。 */
        mimeType?: string;

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            /** 贴图文件URI（如果未设置则从UUID加载）。 */
            uri?: string;
            /** 贴图类型。 */
            mime?: string;
            /** 是否包含A通道。 */
            has_alpha?: boolean;
        };
    }[];
    /** 图像采样器数组。 */
    samplers?: {
        /** 采样器名称。 */
        name?: string;

        /** 放大过滤方法枚举。 */
        magFilter?: number;
        /** 缩小过滤方法枚举。 */
        minFilter?: number;
        /** U方向环绕模式（默认10497 REPEAT）。 */
        wrapS?: number;
        /** V方向环绕模式（默认10497 REPEAT）。 */
        wrapT?: number;

        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 特定于应用程序的数据。 */
    extras: never;
}
