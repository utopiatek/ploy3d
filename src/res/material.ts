import * as Miaoverse from "../mod.js"

/** 材质资源实例（G0、G2）。 */
export class Material extends Miaoverse.Uniform<Material_kernel> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(impl: Material_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl, ptr, id);

        this._view = new (this.tuple.view)(this);
    }

    /**
     * 启用材质设置标志。
     * @param enable 启用或禁用材质特性。
     * @param flag 材质特性标志。
     */
    public Enable(enable: boolean, flag:
        Miaoverse.RENDER_FLAGS.DRAW_ARRAYS |
        Miaoverse.RENDER_FLAGS.HAS_DOUBLE_SIDED |
        Miaoverse.RENDER_FLAGS.HAS_REFLECTIONS |
        Miaoverse.RENDER_FLAGS.HAS_CLEAR_COAT |
        Miaoverse.RENDER_FLAGS.HAS_ANISOTROPY |
        Miaoverse.RENDER_FLAGS.SHADING_AS_UNLIT |
        Miaoverse.RENDER_FLAGS.SHADING_AS_CLOTH |
        Miaoverse.RENDER_FLAGS.SHADING_AS_SUBSURFACE |
        Miaoverse.RENDER_FLAGS.SPECULAR_GLOSSINESS_PARAMS
    ) {
        if (enable) {
            this.enableFlags = this.enableFlags | flag;
        }
        else {
            this.enableFlags = this.enableFlags & ~flag;
        }
    }

    /**
     * 设置材质混合模式。
     * @param blendMode 材质混合模式。
     */
    public SetBlendMode(blendMode: Miaoverse.BLEND_MODE) {
        this.enableFlags = (this.enableFlags & 0x0FFFFFFF) | (blendMode << Miaoverse.RENDER_FLAGS.BLEND_MODE_INDEX);
    }

    /**
     * 获取向量属性（标量被视为一维向量）。
     * @param name 属性名称。
     * @returns 返回数值数组。
     */
    public GetVector(name: string): number[] {
        if (this.HasProperty(name)) {
            return this.view[name];
        }

        return null;
    }

    /**
     * 设置向量属性（标量被视为一维向量）。
     * @param name 属性名称。
     * @param value 数值数组。
     */
    public SetVector(name: string, value: number[]): void {
        if (this.HasProperty(name)) {
            this.view[name] = value;
        }
    }

    /**
     * 获取贴图属性。
     * @param name 属性名称。
     * @returns 返回贴图描述符。
     */
    public GetTexture(name: string): Miaoverse.Asset_wrapper_texture {
        if (!this.HasProperty(name + "_uuid")) {
            return null;
        }

        const texture = this._global.resources.Texture.GetInstanceByID(this.view[name + "_uuid"][0]);
        const sampler = this.view[name + "_sampler"];
        const uvts = this.view[name + "_uvts"];

        return {
            texture,
            uvts,
            default_color: sampler[1],
            sampler: this._global.device.ParseSamplerFlags(sampler[2])
        };
    }

    /**
     * 设置贴图属性。
     * @param name 属性名称。
     * @param value 贴图描述符（注意，贴图URI必须是UUID）。
     */
    public SetTexture(name: string, value: Miaoverse.Asset_wrapper_texture): void {
        if (!this.HasProperty(name + "_uuid")) {
            return;
        }

        // 非缺省贴图、默认颜色值、采样器标志集、采样器ID
        const sampler = this.view[name + "_sampler"];

        // 变更贴图资源
        if (value.texture !== undefined || value.uri !== undefined) {
            // 清除贴图资源
            if (!value.texture && !value.uri) {
                this.view[name + "_uuid"] = [0, 0, 0, 0];
                sampler[0] = 0;
            }
            else if (value.texture) {
                this.view[name + "_uuid"] = [value.texture.id, ...this._global.env.uuidDec(value.texture.uuid)];
                sampler[0] = 1;
            }
            else if (value.uri) {
                this.view[name + "_uuid"] = [0, ...this._global.env.uuidDec(value.uri)];
                sampler[0] = 0;
            }
        }

        if (value.uvts) {
            this.view[name + "_uvts"] = value.uvts;
        }

        if (value.default_color !== undefined) {
            sampler[1] = value.default_color;
        }

        if (value.sampler !== undefined) {
            sampler[2] = this._global.device.GenerateSamplerFlags(value.sampler);
            sampler[3] = 0;
        }

        this.view[name + "_sampler"] = sampler;
    }

    /**
     * 判断材质是否包含指定属性。
     * @param name 属性名称（注意贴图属性需要加上"_uuid"后缀）。
     * @returns 返回true则包含指定属性。
     */
    public HasProperty(name: string): boolean {
        return this.view.hasOwnProperty(name);
    }

    /** 资源绑定组布局ID（同时也是着色器内部实例ID）。 */
    public get layoutID(): number {
        return this.shader.shader.id || 0;
    }

    /** 材质属性启用标志集（G2，RENDER_FLAGS高24位）。 */
    public get enableFlags(): number {
        return this._impl.Get(this._ptr, "enableFlags");
    }
    public set enableFlags(value: number) {
        this._impl.Set(this._ptr, "enableFlags", value);
        this.updated = 1;
    }

    /** 材质使用的着色器资源。 */
    public get shader(): Miaoverse.ShaderRes {
        const shaderID = this._impl.Get<number>(this._ptr, "shaderID");
        const shader = this._global.resources.Shader.GetInstanceByID(shaderID);

        return shader;
    }

    /** 材质属性访问视图。 */
    public get view() {
        return this._view;
    }

    /** 属性访问视图。 */
    private _view: Record<string, Array<number>>;
}

/** 帧统一资源组实例（G0）。 */
export class FrameUniforms extends Miaoverse.Uniform<Material_kernel>{
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(impl: Material_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl, ptr, id);
        this._view = new (this.tuple.view)(this);
    }

    /** 相关状态标志集。 */
    public get enableFlags(): number {
        return this._impl.Get(this._ptr, "enableFlags");
    }
    public set enableFlags(value: number) {
        this._impl.Set(this._ptr, "enableFlags", value);
    }

    /** 材质属性访问视图。 */
    public get view() {
        return this._view;
    }

    /** 颜色渲染目标贴图ID。 */
    public get g0_colorRT(): number {
        return this._impl.Get(this._ptr, "g0_colorRT");
    }
    public set g0_colorRT(value: number) {
        this._impl.Set(this._ptr, "g0_colorRT", value);
    }

    /** 深度渲染目标贴图ID。 */
    public get g0_depthRT(): number {
        return this._impl.Get(this._ptr, "g0_depthRT");
    }
    public set g0_depthRT(value: number) {
        this._impl.Set(this._ptr, "g0_depthRT", value);
    }

    /** GB渲染目标贴图ID。 */
    public get g0_gbufferRT(): number {
        return this._impl.Get(this._ptr, "g0_gbufferRT");
    }
    public set g0_gbufferRT(value: number) {
        this._impl.Set(this._ptr, "g0_gbufferRT", value);
    }

    /** 精灵图集ID（用于UI和粒子）。 */
    public get g0_spriteAtlas(): number {
        return this._impl.Get(this._ptr, "g0_spriteAtlas");
    }
    public set g0_spriteAtlas(value: number) {
        this._impl.Set(this._ptr, "g0_spriteAtlas", value);
    }

    /** 光源体素列表缓存（绑定到G0）。 */
    public get g0_froxelList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g0_froxelList"));
    }

    /** 光源索引表缓存（绑定到G0）。 */
    public get g0_lightVoxel() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g0_lightVoxel"));
    }

    /** 光源列表缓存（绑定到G0）。 */
    public get g0_lightList() {
        return this.ReadBufferNode(this._impl.Get(this._ptr, "g0_lightList"));
    }

    /** 属性访问视图。 */
    private _view: Record<string, Array<number>>;
}

/** 材质资源实例（G2，128+字节）。 */
export class Material_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 装载材质资源实例。
     * @param uri 材质资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回材质资源实例。
     */
    public async Load(uri: string, pkg?: Miaoverse.PackageReg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }

        if (this._instanceLut[uuid]) {
            return this._instanceLut[uuid];
        }

        // 加载装配材质资产 ===============-----------------------

        const desc = await this._global.resources.Load_file<Asset_material>("json", uri, true, pkg);
        if (!desc) {
            return null;
        }

        desc.data.uuid = uuid;

        desc.data.shader = this._global.resources.ToUUID(desc.data.shader, desc.pkg);

        const textures = desc.data.properties.textures;

        for (let key in textures) {
            textures[key].uri = this._global.resources.ToUUID(textures[key].uri, desc.pkg);
        }

        // 创建实例 ===============-----------------------

        return this.Create(desc.data);
    }

    /**
     * 创建材质资源实例。
     * @param asset 材质资源描述符。
     * @returns 异步返回材质资源实例。
     */
    public async Create(asset: Asset_material) {
        const shader = await this._global.resources.Shader.Load(asset.shader);
        if (!shader) {
            throw "获取着色器资源失败！";
        }

        const ptr = this.InstanceMaterial(shader.uniformSize, this._global.env.ptrZero());
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this.Set(ptr, "id", id);
        this.Set(ptr, "uuid", asset.uuid);
        this.Set(ptr, "shaderID", shader.id);
        this.Set(ptr, "shaderUUID", shader.uuid);

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Material(this, ptr, id);

        this._instanceCount++;

        // 初始化属性 ===============-----------------------

        const vars = shader.shader.tuple.vars;
        if (vars) {
            for (let var_ of vars) {
                if (Miaoverse.PropType.texture_1d > var_.decl.type) {
                    instance.view[var_.decl.name] = var_.decl.value;
                }
            }

            instance.updated = 1;
            instance.writeTS = this._global.env.frameTS;
        }

        // 设置参数指定的属性值 ===============-----------------------

        instance.enableFlags = instance.enableFlags | asset.flags;

        for (let key in asset.properties.vectors) {
            instance.view[key] = asset.properties.vectors[key];
        }

        for (let key in asset.properties.textures) {
            // 贴图运行时根据材质LOD动态装载卸载，材质创建之初并不需要装载材质引用的贴图
            instance.SetTexture(key, asset.properties.textures[key]);
        }

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        if (asset.uuid) {
            this._instanceLut[asset.uuid] = instance;
        }

        return instance;
    }

    /**
     * 创建G0实例。
     * @param colorRT 颜色渲染目标贴图ID。
     * @param depthRT 深度渲染目标贴图ID。
     * @param gbufferRT GB渲染目标贴图ID。
     * @param spriteAtlas 精灵图集ID（用于UI和粒子）。
     * @returns
     */
    public async CreateFrameUniforms(colorRT: number, depthRT: number, gbufferRT: number, spriteAtlas: number) {
        const ptr = this.InstanceFrameUniforms();
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new FrameUniforms(this, ptr, id);

        this._instanceCount++;

        // 初始化属性 ===============-----------------------

        const vars = instance.tuple.vars;
        if (vars) {
            for (let var_ of vars) {
                if (Miaoverse.PropType.texture_1d > var_.decl.type) {
                    instance.view[var_.decl.name] = var_.decl.value;
                }
            }

            instance.updated = 1;
            instance.writeTS = this._global.env.frameTS;
        }

        // 设置参数指定的属性值 ===============-----------------------

        this.Set(ptr, "id", id);
        this.Set(ptr, "g0_colorRT", colorRT);
        this.Set(ptr, "g0_depthRT", depthRT);
        this.Set(ptr, "g0_gbufferRT", gbufferRT);
        this.Set(ptr, "g0_spriteAtlas", spriteAtlas);

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        return instance;
    }

    /**
     * 释放材质引用的贴图资源（注意该方法仅提供给内核在释放材质前调用）。
     * @param instance 材质实例对象。
     */
    public Dispose(id: number) {
        const instance = this.GetInstanceByID(id);
        const vars = instance.tuple.vars;
        if (vars) {
            for (let var_ of vars) {
                if (undefined !== var_.decl.texture) {
                    const id_uuid = this._global.env.arrayGet(var_.decl.format, instance.blockPtr, var_.offset >> 2, 4);
                    this._global.resources.Texture.Release(id_uuid[0]);
                }
            }
        }
    }

    /**
     * 根据内核对象指针获取对象实例。
     * @param self 内核对象指针。
     * @returns 返回对象实例。
     */
    public GetInstanceByPtr(ptr: Miaoverse.io_ptr) {
        if (this._global.env.ptrValid(ptr)) {
            const id = this.Get<number>(ptr, "id");
            return this.GetInstanceByID(id);
        }

        return null;
    }

    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    public GetInstanceByID(id: number) {
        return this._instanceList[id];
    }

    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    public Get<T>(self: Miaoverse.io_ptr, key: Material_kernel["_members_key"]) {
        const member = this._members[key];
        return this._global.env[member[0]](self, member[3], member[2]) as T;
    }

    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    public Set(self: Miaoverse.io_ptr, key: Material_kernel["_members_key"], value: any) {
        const member = this._members[key];
        this._global.env[member[1]](self, member[3], value as never);
    }

    /** 实例化材质资源实例。 */
    protected InstanceMaterial: (size: number, data: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /** 实例化G0。 */
    protected InstanceFrameUniforms: () => Miaoverse.io_ptr;

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;

    /** 实例容器列表。 */
    protected _instanceList: (Material | FrameUniforms)[] = [null];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, (Material | FrameUniforms)> = {};
    /** 已分配实例数量。 */
    protected _instanceCount: number = 0;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number = 1;
    /** 待GC列表。 */
    protected _gcList: (Material | FrameUniforms)[] = [];

    /** 材质资源内核实现的数据结构成员列表。 */
    protected _members = {
        ...Miaoverse.Uniform_member_index,

        g0_colorRT: ["uscalarGet", "uscalarSet", 1, 20] as Miaoverse.Kernel_member,
        g0_depthRT: ["uscalarGet", "uscalarSet", 1, 21] as Miaoverse.Kernel_member,
        g0_gbufferRT: ["uscalarGet", "uscalarSet", 1, 22] as Miaoverse.Kernel_member,
        g0_spriteAtlas: ["uscalarGet", "uscalarSet", 1, 23] as Miaoverse.Kernel_member,

        g0_froxelList: ["ptrGet", "ptrSet", 1, 25] as Miaoverse.Kernel_member,
        g0_lightVoxel: ["ptrGet", "ptrSet", 1, 26] as Miaoverse.Kernel_member,
        g0_lightList: ["ptrGet", "ptrSet", 1, 27] as Miaoverse.Kernel_member,

        shaderID: ["uscalarGet", "uscalarSet", 1, 20] as Miaoverse.Kernel_member,
        shaderUUID: ["uuidGet", "uuidSet", 3, 21] as Miaoverse.Kernel_member,

        enableFlags: ["uscalarGet", "uscalarSet", 1, 24] as Miaoverse.Kernel_member,
    } as const;

    /** 材质资源内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Material_kernel["_members"];
}

/** 材质资源描述符。 */
export interface Asset_material extends Miaoverse.Asset {
    /** 着色器全局唯一ID。 */
    shader: string;
    /** 渲染设置标记集（RENDER_FLAGS）。 */
    flags: number;
    /** 材质属性集。 */
    properties: {
        /** 贴图属性设置列表。 */
        textures: Record<string, Miaoverse.Asset_wrapper_texture>;
        /** 向量属性设置列表（标量被视为一维向量）。 */
        vectors: Record<string, number[]>;
    };
}