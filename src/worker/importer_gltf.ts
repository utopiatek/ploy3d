import type * as Miaoverse from "../mod.js"
import type { Miaoworker } from './worker.js';
import { CLASSID, MAGIC_INVALID, BLEND_MODE, RENDER_FLAGS } from "../mod.js"

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
            mesh_renderer_library: mesh_renderer_library as Miaoverse.Asset_meshrenderer[],
            animations_library,
            prefab_library: prefab_library as Miaoverse.Asset_prefab[],

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

        // TODO: 优先获取模型自带切线数据，因为它带有镜像标记

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
                        let weight0 = warray.get(index4 + 0); weight0 = Math.round(weight0 * 255.0);
                        let weight1 = warray.get(index4 + 1); weight1 = Math.round(weight1 * 255.0);
                        let weight2 = warray.get(index4 + 2); weight2 = Math.round(weight2 * 255.0);
                        let weight3 = warray.get(index4 + 3); weight3 = Math.round(weight3 * 255.0);

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
            array: this.GetAccessorData(buffer.extras.buffer, offset, bufferView.byteStride, accessor.type, accessor.componentType, accessor.count)
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
            array: this.GetAccessorData(buffer.extras.buffer, offset, bufferView.byteStride, accessor.type, accessor.componentType, accessor.count),
            vertexOffset: vertexOffset
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
    private GetAccessorData(buffer: ArrayBuffer, offset: number, stride: number, type: string, componentType: number, count: number) {
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

        let array: (Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array) = null;

        if (componentType === 5120) { // BYTE
            if (stride) {
                strideCount = stride;
            }

            array = new Int8Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5121) { // UNSIGNED_BYTE
            if (stride) {
                strideCount = stride;
            }

            array = new Uint8Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5122) { // SHORT
            if (stride) {
                strideCount = stride / 2;
            }

            array = new Int16Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5123) { // UNSIGNED_SHORT
            if (stride) {
                strideCount = stride / 2;
            }

            array = new Uint16Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5125) { // UNSIGNED_INT
            if (stride) {
                strideCount = stride / 4;
            }

            array = new Uint32Array(buffer, offset, strideCount * count);
        }
        else if (componentType === 5126) { // FLOAT
            if (stride) {
                strideCount = stride / 4;
            }

            array = new Float32Array(buffer, offset, strideCount * count);
        }

        if (componentCount == strideCount) {
            return {
                array,
                get(i: number) {
                    return array[i];
                }
            };
        }

        return {
            get(i: number) {
                return array[Math.floor(i / componentCount) * strideCount + (i % componentCount)];
            }
        };
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
                uri: ":/" + images[texture.source]?.extras.uri,
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

        if (!image.name && image.uri) {
            image.name = image.uri.substring(image.uri.lastIndexOf("/") + 1, image.uri.lastIndexOf("."));
        }

        const name = `${CLASSID.ASSET_TEXTURE_FILE}-${index}_${image.name || "unnamed"}`;

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
    private async LoadNodes(animations_library?: Miaoverse.Package["animations_library"]) {
        const this_ = this;

        const nodes: Miaoverse.Asset_prefab["nodes"] = [];
        const batches: Miaoverse.Asset_prefab["batches"] = [];
        const transforms: Miaoverse.Asset_prefab["transforms"] = [];
        const mesh_renderers: Miaoverse.Asset_prefab["mesh_renderers"] = [];
        const mesh_renderer_library: Miaoverse.Asset_meshrenderer[] = [];

        // 进行先根深度优先排序，从而避免保存节点的子级列表
        let node_index = 0;
        // 实例索引，用于组件索引实例对象
        let instance_index = 0;

        // 节点ID到节点实例查找表
        // 在gltf中，一个节点资源允许被多次实例化
        // 我们合并了gltf中的所有scene到一个prefab中
        // 应当保证gltf中scene某个节点资源仅实例化一次，并且保证骨架能在scene中完成绑定
        // 因此我们基于scene设置节点实例查找表进行骨架绑定
        let jointsLut: Record<string, number>;
        let skeletonList: {
            mesh_renderer: Miaoverse.Asset_prefab["mesh_renderers"][0];
            skeleton_skin: Miaoverse.Asset_mesh["skeleton_skin"];
        }[];

        // 承载动画数据的动画组件
        const animator: Miaoverse.Asset_prefab["animators"][0] = animations_library ? {
            instance: 0,
            node: -1,
            animations: [animations_library[0].uuid],
            targets_binding: []
        } : null;

        function proc(nodeIndex: number, parentIndex: number, depth: number) {
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

                    const asset: Miaoverse.Asset_meshrenderer = {
                        uuid: "" + CLASSID.ASSET_COMPONENT_MESH_RENDERER + "-" + mesh_renderer_library.length,
                        classid: CLASSID.ASSET_COMPONENT_MESH_RENDERER,
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
                // 一个节点资源可多次进行实例化
            }

            const transform: (typeof transforms)[0] = {
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
                const mesh_renderer: (typeof mesh_renderers)[0] = {
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
                    const batch: (typeof batches)[0] = {
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

        const prefab: Miaoverse.Asset_prefab = {
            uuid: "" + CLASSID.ASSET_PREFAB + "-" + 0,
            classid: CLASSID.ASSET_PREFAB,
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


    /**
     * 解析所有骨骼蒙皮骨架数据。
     */
    private async LoadSkeletons() {
        const skeleton_count = this._data.skins?.length || 0;

        for (let i = 0; i < skeleton_count; i++) {
            const skin = this._data.skins[i];
            const data: any = await this.LoadSkeleton(i);
            const name = skin.name || ("skeleton" + i);

            const skeleton_uuid = "" + CLASSID.ASSET_SKELETON + "-" + i;
            const skeleton_file_path = `skeleton/${skeleton_uuid}_${name}.bin`;

            skin.extras = {
                root: data[0],
                joints: data[1],
                skeleton: skeleton_uuid
            };

            this._files_cache[skeleton_file_path] = data[2];
        }
    }

    /**
     * 解析骨骼蒙皮骨架数据。
     */
    private async LoadSkeleton(index: number) {
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

        // ================-----------------------------

        // 骨架关节名称数组
        const joints_name: string[] = [];

        for (let i = 0; i < skin.joints.length; i++) {
            const node = nodes[skin.joints[i]];
            joints_name[i] = node.name || ("" + i);
        }

        // 根关节（建模空间）节点索引
        let root_node_i = skin.skeleton;
        if (root_node_i == undefined) {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].skin == index) {
                    root_node_i = i;
                }
            }
        }

        // 根关节（建模空间）绑定名称
        const root_name = nodes[root_node_i].name || ("" + root_node_i);

        // 添加根关节（建模空间）到关节列表
        let root_index = joints_name.indexOf(root_name);
        if (root_index == -1) {
            root_index = joints_name.length;
            joints_name.push(root_name);
        }

        // ================-----------------------------

        let skeleton_buffer = null;
        {
            const encoder = this._worker.env.textEncoder;
            const names_ = joints_name.join(",");
            const names_carray = encoder.encode(names_);
            const names_length = (names_carray.byteLength + 3 + 1) & ~3;

            let intLength = 0;

            const binaryOffset = intLength; intLength += 12;
            const headerOffset = intLength; intLength += 8;
            const invMatsOffset = intLength; intLength += joints_name.length * 16;
            const namesOffset = intLength; intLength += names_length / 4;

            const buffer = new ArrayBuffer(intLength * 4);
            const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
            const header = new Uint32Array(buffer, headerOffset * 4, 8);
            const invMats = new Float32Array(buffer, invMatsOffset * 4, joints_name.length * 16);
            const names = new Uint8Array(buffer, namesOffset * 4, names_length);

            binary[0] = MAGIC_INVALID + CLASSID.ASSET_SKELETON;
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

        // 蒙皮数据直接保存在网格数据中
        return [root_index, joints_name, skeleton_buffer, /*skin_buffer*/null];
    }


    /**
     * 异步装载所有动画数据。
     * @returns
     */
    private async LoadAnimations() {
        if (!this._data.animations) {
            return null;
        }

        // 节点索引到绑定目标索引查找表
        const targetLut: number[] = [];
        const tatgetList: string[] = [];
        const LutTarget = (node: number) => {
            if (targetLut[node] != undefined) {
                return targetLut[node];
            }

            const name = this._data.nodes[node].name || "" + node;
            const target = tatgetList.length;

            targetLut[node] = target;
            tatgetList.push(name);

            return target;
        }

        // 动画片段数据列表
        const clipList: Uint32Array[] = [];

        for (let a = 0; a < this._data.animations.length; a++) {
            const clip = await this.LoadAnimation(a, LutTarget);
            if (clip) {
                clipList.push(clip);
            }
        }

        // 设置动画片段驱动目标绑定数量
        for (let clipData of clipList) {
            clipData[3] = tatgetList.length;
        }

        // ===========================---------------------------------------

        const encoder = this._worker.env.textEncoder;
        const names_ = tatgetList.join(",");
        const names_carray = encoder.encode(names_);
        const names_length = (names_carray.byteLength + 3 + 1) & ~3;

        let intLength = 0;

        const binaryOffset = intLength; intLength += 12;
        const headerOffset = intLength; intLength += 4;
        const namesOffset = intLength; intLength += names_length / 4;
        const ptrsOffset = intLength; intLength += clipList.length;

        const ptrs_ = new Uint32Array(clipList.length);

        for (let i = 0; i < clipList.length; i++) {
            ptrs_[i] = intLength; intLength += clipList[i].length;
        }

        const buffer = new ArrayBuffer(intLength * 4);
        const binary = new Uint32Array(buffer, binaryOffset * 4, 12);
        const header = new Uint32Array(buffer, headerOffset * 4, 4);
        const names = new Uint8Array(buffer, namesOffset * 4, names_length);
        const ptrs = new Uint32Array(buffer, ptrsOffset * 4, clipList.length)

        binary[0] = MAGIC_INVALID + CLASSID.ASSET_ANIMATIONS_DATA;
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

        const uuid = "" + CLASSID.ASSET_ANIMATIONS_DATA + "-0";
        const asset_name = this._data.asset.extras.name;
        const file_path = `anims/${uuid}_${asset_name}.bin`;

        this._files_cache[file_path] = buffer;

        const asset: Miaoverse.Asset_animations = {
            uuid: "" + CLASSID.ASSET_ANIMATIONS + "-0",
            classid: CLASSID.ASSET_ANIMATIONS,
            name: asset_name,
            label: asset_name,

            targets: tatgetList,
            data: uuid
        };

        return [asset];
    }

    /**
     * 加载动画片段数据。
     * @param index
     * @param LutTarget
     * @returns
     */
    private async LoadAnimation(index: number, LutTarget: (node: number) => number) {
        const animation = this._data.animations[index];
        const samplerCount = animation.samplers.length;
        const channelCount = animation.channels.length;

        // 我们假定了这两块数据都是浮点型的，totalLength、offset单位为浮点型
        // 0-汇总每个采样器的时间线数据
        // 1-汇总每个采样器的关键帧集数据
        const stats: {
            // 数据汇总总大小（4字节为单位）
            totalLength: number;
            // 数据块列表
            accessors: {
                // 当前数据块存储偏移（4字节为单位）
                offset: number;
                // 当前数据块内容
                array: ArrayLike<number> & ArrayBufferView;
            }[];
            // 访问器索引到数据块索引的字典
            lut: Record<number, number>;
        }[] = [
                { totalLength: 0, accessors: [], lut: {} },
                { totalLength: 0, accessors: [], lut: {} }
            ];

        const Load = (slot: number, iaccessor: number) => {
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

        // ===========================---------------------------------------

        let binSize = 12;

        const offsetChannels = binSize; binSize += 3 * channelCount;
        const offsetSamplers = binSize; binSize += 6 * samplerCount;
        const offsetTimeline = binSize; binSize += stats[0].totalLength;
        const offsetKeyframes = binSize; binSize += stats[1].totalLength;

        const buffer = new ArrayBuffer(binSize * 4);
        const writer = new Uint32Array(buffer);

        writer[0] = index;						// m_nIndex
        writer[1] = buffer.byteLength;          // m_nByteSize
        writer[2] = Math.ceil(maxTS * 1000.0);	// m_nMaxTimestamp
        writer[3] = 0;							// m_nTargetCount 在合并所有驱动目标后设置

        writer[4] = channelCount;				// m_nChannelCount
        writer[5] = samplerCount;				// m_nSamplerCount
        writer[6] = stats[0].totalLength * 4;	// m_nTimelineByteSize
        writer[7] = stats[1].totalLength * 4;	// m_nKeyframesByteSize

        writer[8] = offsetChannels;				// m_aChannels
        writer[9] = offsetSamplers;				// m_aSamplers
        writer[10] = offsetTimeline;			// m_pTimeline
        writer[11] = offsetKeyframes;			// m_pKeyframes

        // ===========================---------------------------------------

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

            writer[index3 + 0] = channel.sampler;					// m_nSampler
            writer[index3 + 1] = LutTarget(channel.target.node);	// m_nTarget
            writer[index3 + 2] = attribute;							// m_eAttribute
        }

        // ===========================---------------------------------------

        for (let i = 0; i < samplerCount; i++) {
            const samplers = animation.samplers[i];
            const inputAcc = stats[0].accessors[stats[0].lut[samplers.input]];
            const outputAcc = stats[1].accessors[stats[1].lut[samplers.output]];

            const index6 = offsetSamplers + i * 6;

            writer[index6 + 0] = inputAcc.offset;																		// m_nTimelineOffset
            writer[index6 + 1] = inputAcc.array.length;																	// m_nTimestampCount
            writer[index6 + 2] = Math.ceil(inputAcc.array[inputAcc.array.length - 1] * 1000.0);                         // m_nMaxTimestamp

            writer[index6 + 3] = outputAcc.offset;																		// m_nKeyframesOffset
            writer[index6 + 4] = outputAcc.array.length / inputAcc.array.length;										// m_nKeyframeStride
            writer[index6 + 5] = samplers.interpolation == "LINEAR" ? 0 : (samplers.interpolation == "STEP" ? 1 : 2);	// m_nInterpolation
        }

        // ===========================---------------------------------------

        const timeline = new Uint8Array(buffer, offsetTimeline * 4, writer[6]);		// m_pTimeline
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

        const keyframes = new Uint8Array(buffer, offsetKeyframes * 4, writer[7]);	// m_pKeyframes
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

        // ===========================---------------------------------------

        return writer;
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
        extras?: {
            node: Miaoverse.Asset_prefab["nodes"][0];
            mesh_renderer?: Miaoverse.Asset_meshrenderer;
        };
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
        extras?: Miaoverse.Asset_mesh["skeleton_skin"];
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
