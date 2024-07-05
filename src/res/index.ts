import * as Miaoverse from "../mod.js"

/*/
5种资源引用标识方法：
1：二进制表示
uint index          : 16;   // 数据索引，每个包每种类型最多65536个
uint classid        : 8;    // 数据类型，支持255种类型
uint version        : 8;    // 包版本，0表示获取最新版，最大255
uint timestamp;             // 时间戳，分配时长0.1秒，即1秒内只能分配10个时间戳，4900天内不重复
uint uid            : 30;   // 用户ID
uint temporary      : 1;    // 是否非授权为永久用户ID，用户注册满后将不再授权永久用户ID。
uint unregistered   : 1;    // 是否为非注册用户
2：完整UUID字符串表示
"1-1-1-20-1"        : uid-ts-ver-cid-index，包含5个数值
3：相对当前包的ID字符串表示
"20-1"              : cid-index，包含2个数值
4：文件完整路径表示
"1-1-1.author.name:/aa/bb/cc/17-1_filename.json"    : 以':/'分隔包名和文件路径
5：文件相对路径表示
":/aa/bb/cc/17-1_filename.json"                     : 以':/'开头，在当前包中的文件路径

注意资源文件名应当以相对当前包的ID字符串开头（如17-1_filename.json）
此类资源文件的引用可以转换为UUID类型引用并实现共享。否则，资源可能不会被共享

在资产文件中采用第4、5种标识方式
在部分JS内存对象中，采用第2、3中标识方式
在C内存对象中，或二进制资产文件中，采用第1种标识方式
内置在package.json中的资源仅能采用第2、3中标识方式

资源包缓存（为了便于增删改，所有资源以独立文件保存）。
本地维护资源包缓存，请求资源包时优先从资源包缓存查找。
从资源包缓存查找失败时，如果当前应用允许访问本地文件系统，则在本地文件系统查找。
如果在本地文件系统查找失败，则向云端资源包仓库查询，如果当前应用允许访问本地文件系统，则下载到本地，否则直接访问云端资源文件。
在本地文件系统请求到新资源包时，将启用包注册到资源包缓存。
存在手动删除本地资源包并且没有同步刷新资源包缓存的问题：
如果某个资源请求失败，首先确认资源包当前存放路径是否有效，然后尝试更新资源包存放路径，如果最终都是失败则标记资源包无效。
/*/

/** 资源管理器。 */
export class Resources {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;

        this._pkg_keyLut = {};
        this._pkg_uuidLut = {};
        this._pkg_list = [null];
        this._pkg_caches = [null];

        this.VMath = new Miaoverse.VMath_kernel(_global);
        this.Shader = new Miaoverse.Shader_kernel(_global);
        this.Texture = new Miaoverse.Texture_kernel(_global);
        this.Material = new Miaoverse.Material_kernel(_global);
        this.Mesh = new Miaoverse.Mesh_kernel(_global);
        this.MeshRenderer = new Miaoverse.MeshRenderer_kernel(_global);
        this.Object = new Miaoverse.Object_kernel(_global);
    }

    /**
     * 初始化资源管理器。
     * @returns 返回资源管理器。
     */
    public async Init() {

        // 链接内核实现方法 ========================-------------------------------

        const exports = this._global.internal.Engine_Export();
        const view = this._global.env["_ubview"];
        const textDecoder = this._global.env["_textDecoder"];

        for (let i = 0; i < exports.length;) {
            let beg = exports[i++];
            let end = beg;

            while (0 !== view[end++]);

            const names = textDecoder.decode(view.subarray(beg, end - 1)).split(",");
            const klass = (this as any)[names[0]];

            for (let j = 1; j < names.length; j++, i++) {
                klass[names[j]] = this._global.internal.__indirect_function_table.get(exports[i]);
            }
        }

        // ========================-------------------------------

        const data = new Uint8Array(4 * 128 * 128);
        const saturation = [0.0, 0.2, 0.4, 0.6, 0.8, 0.8, 0.6, 0.4, 0.2, 0.0, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
        const colors = [
            [1.0, 0.0, 0.0, 0],
            [1.0, 0.5, 0.0, 2],
            [1.0, 1.0, 0.0, 0],
            [0.5, 1.0, 0.0, 1],
            //=============
            [0.0, 1.0, 0.0, 0],
            [0.0, 1.0, 0.5, 3],
            [0.0, 1.0, 1.0, 0],
            [0.0, 0.5, 1.0, 2],
            //=============
            [0.0, 0.0, 1.0, 0],
            [0.5, 0.0, 1.0, 1],
            [1.0, 0.0, 1.0, 0],
            [1.0, 0.0, 0.5, 3]
        ];

        for (let i = 0, isat = 0; isat < 16; isat++) {
            let exp = isat < 5 ? 1.0 : (isat < 10 ? 0.7 : 0.4);
            let sat = saturation[isat];

            for (let icol = 0; icol < 12; icol++) {
                const col = colors[icol];
                const col_ = [col[0], col[1], col[2]];
                const lerp_ = col[3];

                if (0 < lerp_) {
                    col_[lerp_ - 1] = sat + ((1.0 - sat) * 0.5);
                }

                if (15 === isat) {
                    exp = 0.1 * (11 > icol ? icol : 10);
                }

                let r = (col_[0] || sat) * exp;
                let g = (col_[1] || sat) * exp;
                let b = (col_[2] || sat) * exp;

                let idx_ = (Math.floor(i / 12) * 8 * 4 * 128) + ((i % 12) * 8 * 4); i++;

                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        data[idx_++] = Math.floor(r * 255);
                        data[idx_++] = Math.floor(g * 255);
                        data[idx_++] = Math.floor(b * 255);
                        data[idx_++] = 255;
                    }

                    idx_ += 4 * (128 - 8);
                }
            }
        }

        this.Texture.default2D = await this.Texture.CreateTexture({
            uuid: "",
            classid: Miaoverse.CLASSID.ASSET_TEXTURE_2D,
            name: "_builtin2D",
            label: "_builtin2D",
            bitmap: {
                data: data.buffer,
                dataLayout: {
                    offset: 0,
                    bytesPerRow: 4 * 128,
                    rowsPerImage: 128
                },
                width: 128,
                height: 128
            }
        });

        // ========================-------------------------------

        return this;
    }

    /**
     * 加载指定URI的文件数据。
     * @param type 资源文件类型。
     * @param uri 资源文件URI。
     * @param not_cache 是否缓存文件数据。
     * @param cur_pkg 当前包注册信息。
     * @returns 返回文件数据。
     */
    public async Load_file<T>(type: "text" | "arrayBuffer" | "json", uri: string, not_cache?: boolean, cur_pkg?: PackageReg) {
        const keys = this.ParseUri(uri, cur_pkg);
        if (!keys) {
            return null;
        }

        let pkg = await this.Find(keys);
        if (!pkg || pkg.invalid) {
            return null;
        }

        let path = "";

        if (keys.key) {
            path = keys.key[1];
        }
        else {
            const resid = keys.uuid[1];

            if (!pkg.resid_path) {
                await this.Preview(pkg);
            }

            if (pkg.resid_path) {
                path = pkg.resid_path[resid];
            }
        }

        if (!path) {
            return null;
        }

        let cache = this._pkg_caches[pkg.index];
        if (!cache) {
            cache = this._pkg_caches[pkg.index] = {
                index: pkg.index,
                files: {}
            };
        }

        let data = cache.files[path];
        if (data) {
            return { pkg, data: data as T };
        }

        if (pkg.zip) {
            if (!cache.zip) {
                const blob = await this._global.Fetch<ArrayBuffer>(pkg.path, null, "arrayBuffer");
                cache.zip = await this._global.JSZip.loadAsync(blob);
            }

            if (!cache.zip) {
                pkg.invalid = true;
                return null;
            }

            const filepath = pkg.key + ".ab/" + path;

            if (type == "arrayBuffer") {
                data = cache.zip.file(filepath).async("arraybuffer");
            }
            else {
                const text = await cache.zip.file(filepath).async("text");
                if (type == "text") {
                    data = text;
                }
                else {
                    data = JSON.parse(text);
                }
            }
        }
        else {
            data = await this._global.Fetch(pkg.path + "/" + path, null, type);
        }

        if (!not_cache) {
            cache.files[path] = data;
        }

        return { pkg, data: data as T };
    }

    /**
     * 资源URI转资源UUID。
     * @param uri 资源URI。
     * @param cur_pkg 当前包注册信息。
     * @returns 返回资源UUID。
     */
    public ToUUID(uri: string, cur_pkg?: PackageReg) {
        const keys = this.ParseUri(uri, cur_pkg);
        if (!keys) {
            return null;
        }

        if (keys.uuid) {
            return keys.uuid[0] + "-" + keys.uuid[1];
        }
        else {
            const path = keys.key[1];
            const splitter = path.lastIndexOf("/");
            const filename = path.substring(splitter + 1);
            const resid = filename.substring(0, filename.indexOf("_"));

            return keys.key[0].split(".")[0] + "-" + resid;
        }
    }

    /**
     * 解析资源UIR。
     * 资源URI有以下4种模式：
     * "1-1-1.Miaokit.Builtin:/aa/bb/cc.json"
     * ":/aa/bb/cc.json"
     * "1-1-1-17-1"
     * "17-1"
     * @param uri 资源URI。
     * @param cur_pkg 当前资源包。
     * @returns 返回资源访问键。
     */
    public ParseUri(uri: string, cur_pkg?: PackageReg) {
        if (uri.includes(":/")) {
            const parts = uri.split(":/");

            if (!parts[0]) {
                if (!cur_pkg) {
                    return null
                }

                parts[0] = cur_pkg.key;
            }

            return {
                key: parts
            };
        }
        else {
            const parts = uri.split("-");

            if (parts.length == 2) {
                if (!cur_pkg) {
                    return null
                }

                return {
                    uuid: [cur_pkg.uuid, uri]
                };
            }

            return {
                uuid: [`${parts[0]}-${parts[1]}-${parts[2]}`, `${parts[3]}-${parts[4]}`]
            };
        }
    }

    /**
     * 查找资源包注册信息。
     * @param keys 资源访问键。
     * @returns 返回资源包注册信息。
     */
    public async Find(keys: ReturnType<Resources["ParseUri"]>) {
        if (keys.key) {
            let index = this._pkg_keyLut[keys.key[0]];
            if (!index) {
                await this.Refresh();
                index = this._pkg_keyLut[keys.key[0]];
                if (!index) {
                    await this.Download(keys);
                    index = this._pkg_keyLut[keys.key[0]];
                }
            }

            return this._pkg_list[index];
        }
        else {
            let index = this._pkg_uuidLut[keys.uuid[0]];
            if (!index) {
                await this.Refresh();
                index = this._pkg_uuidLut[keys.uuid[0]];
                if (!index) {
                    await this.Download(keys);
                    index = this._pkg_uuidLut[keys.uuid[0]];
                }
            }

            return this._pkg_list[index];
        }
    }

    /**
     * 下载资源包并注册到缓存。
     * @param keys 资源访问键。
     */
    public async Download(keys: ReturnType<Resources["ParseUri"]>) {
        // TODO ...
    }

    /**
     * 刷新本地资源包目录（在允许访问本地文件系统的前提下进行）。
     * @returns 
     */
    public async Refresh() {
        if (!this._global.localFS) {
            return;
        }

        const list = await this.Scan();

        for (let entry of list) {
            const index = this._pkg_keyLut[entry.key];
            const reg = this._pkg_list[index || 0];
            if (!reg) {
                this.Register(entry);
            }
            else {
                reg.invalid = false;
                reg.path = entry.path;
                reg.zip = entry.zip;
            }
        }
    }

    /**
     * 扫描本地资源包目录（在允许访问本地文件系统的前提下进行）。
     * @returns 返回资源包可注册信息列表。
     */
    public async Scan() {
        if (!this._global.localFS) {
            return null;
        }

        return this._global.localFS.Map("assets/packages/", true, async (entry, index, path) => {
            const key = entry.name.replace(".ab", "");
            const uuid = key.split(".")[0];

            if (entry.name.endsWith(".ab")) {
                return {
                    index: 0,
                    key: key,
                    uuid: uuid,
                    invalid: false,
                    path: "./" + path + entry.name,
                    zip: entry.kind != "directory"
                } as PackageReg;
            }

            return undefined;
        });
    }

    /**
     * 注册资源包。
     * @param entry 资源包注册信息。
     */
    public Register(entry: PackageReg) {
        entry.index = this._pkg_list.length;

        this._pkg_list.push(entry);
        this._pkg_keyLut[entry.key] = entry.index;
        this._pkg_uuidLut[entry.uuid] = entry.index;

        // 设置包最新版本 ================------------------------

        const parts = entry.uuid.split("-");
        const version = parseInt(parts[2]);
        const latest_uuid = `${parts[0]}-${parts[1]}-0`;
        const latest_index = this._pkg_uuidLut[latest_uuid] || 0;
        const latest_pkg = this._pkg_list[latest_index];
        const latest_version = latest_pkg ? (parseInt(latest_pkg.uuid.split("-")[2])) : 0;

        if (latest_version < version) {
            const latest_key_parts = entry.key.split(".");
            latest_key_parts[0] = latest_uuid;
            const latest_key = latest_key_parts.join(".");

            this._pkg_uuidLut[latest_uuid] = entry.index;
            this._pkg_keyLut[latest_key] = entry.index;
        }
    }

    /**
     * 预览资源包（完成资源包预览后，可以通过RESID访问资源包内的内容）。
     * @param entry 资源包注册信息。
     */
    public async Preview(pkg: PackageReg) {
        pkg.meta = (await this.Load_file<any>("json", ":/package.json", true, pkg))?.data;

        if (pkg.meta) {
            pkg.resid_path = {};

            for (let path of pkg.meta.list) {
                const splitter = path.lastIndexOf("/");
                const filename = path.substring(splitter + 1);
                const resid = filename.substring(0, filename.indexOf("_"));

                pkg.resid_path[resid] = path;
            }
        }
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** 资源包键名到资源包注册号的查找表。 */
    private _pkg_keyLut: Record<string, number>;
    /** 资源包UUID到资源包注册号的查找表。 */
    private _pkg_uuidLut: Record<string, number>;
    /** 资源包注册表（该清单可缓存）。 */
    private _pkg_list: PackageReg[];
    /** 资源包数据缓存。 */
    private _pkg_caches: {
        /** 资源包注册号。 */
        index: number;
        /** 压缩文件。 */
        zip?: Miaoverse.JSZip;
        /** 文件数据缓存（使用文件路径索引）。 */
        files: Record<string, any>;
    }[];

    /** 矢量数学方法内核实现。 */
    public VMath: Miaoverse.VMath_kernel;
    /** 着色器资源实例管理器。 */
    public Shader: Miaoverse.Shader_kernel;
    /** 贴图资源实例管理器。 */
    public Texture: Miaoverse.Texture_kernel;
    /** 材质资源内核实现。 */
    public Material: Miaoverse.Material_kernel;
    /** 网格资源内核实现。 */
    public Mesh: Miaoverse.Mesh_kernel;
    /** 网格渲染器组件内核实现。 */
    public MeshRenderer: Miaoverse.MeshRenderer_kernel;
    /** 3D对象内核实现。 */
    public Object: Miaoverse.Object_kernel;
}

/** 资源实例基类。*/
export class Resource<T> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    public constructor(_global: Miaoverse.Ploy3D, ptr: Miaoverse.io_ptr, id: number) {
        this._global = _global;
        this._ptr = ptr;
        this._id = id;
    }

    /** 实例ID。 */
    public get id() {
        return this._id;
    }

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例内部指针。 */
    protected _ptr: Miaoverse.io_ptr;
    /** 实例ID。 */
    protected _id: number;
}

/** 资源包注册项。 */
export interface PackageReg {
    /** 资源包注册号。 */
    index: number;
    /** 资源包键名（如："1-1-1.miaokit.builtins"）。 */
    key: string;
    /** 资源包UUID（如："1-1-1"）。 */
    uuid: string;

    /** 资源包无效（本地和云端仓库都无法访问到时标记为无效）。 */
    invalid: boolean;
    /** 资源包存放路径（访问失败时尝试切换路径，最终失败时标记资源包无效。查找不到的资源包也会注册并标记为无效，以此屏蔽多次重复无效访问）。 */
    path: string;
    /** 资源包是否压缩存储。 */
    zip: boolean;

    /** 资源包元数据缓存（空表示当前资源包仅已注册但未缓存）。 */
    meta?: Package;
    /** 资源ID到资源文件路径映射表（通过Package.list构建）。 */
    resid_path?: Record<string, string>;
}

/** 资源包元数据。 */
export interface Package {
    /** 包GUID（全球唯一）。 */
    guid: string;
    /** 包UUID（平台唯一）。 */
    uuid: string;
    /** 用户ID（UUID第1段）。 */
    uid: number;
    /** 包ID（UUID第2段）。 */
    pid: number;
    /** 包版本号（UUID第3段）。 */
    version: number;
    /** 包作者名。 */
    author: string;
    /** 包名。 */
    name: string;
    /** 用户可理解的包描述。 */
    desc: string;
    /** 资源包引擎版本（主次版本）。 */
    engine: number;
    /** 包创建时间戳。 */
    timestrap: number;

    /** 作者邮箱。*/
    email?: string;
    /** 知识共享许可协议。 */
    license?: string;
    /** 包售价。 */
    price?: number;
    /** 包归档目录（限3级） */
    folder?: string;
    /** 包标签。 */
    tags?: string;
    /** 缩略图文件路径。 */
    thumbnail?: string;
    /** 缩略图文件中每行包含缩略图数量。 */
    thumbnail_per_row?: number;

    /** 共享资源文件清单（其它包仅能引用注册在该清单中的资源，此举确保UUID能索引到文件）。 */
    list: string[];
}

//========================================

/** 资源描述符基类。 */
export interface Asset {
    /** 全局唯一ID。 */
    uuid: string;
    /** 资源类型ID。 */
    classid: number;
    /** 内部名称（同级唯一，优先使用名称在同级中查找）。 */
    name: string;
    /** 用户可理解的外部标签。 */
    label: string;
}

export type Kernel_member = [Kernel_member_getter, Kernel_member_setter, number, number];
export type Kernel_member_getter = "uscalarGet" | "fscalarGet" | "uarrayGet" | "farrayGet" | "ptrGet" | "uuidGet" | "stringGet";
export type Kernel_member_setter = "uscalarSet" | "fscalarSet" | "uarraySet" | "farraySet" | "ptrSet" | "uuidSet" | "stringSet";

/** 二进制数据基类（48字节）。 */
export const Binary_member_index = {
    magic: ["uscalarGet", "uscalarSet", 1, 0] as Kernel_member,
    version: ["uscalarGet", "uscalarSet", 1, 1] as Kernel_member,
    byteSize: ["uscalarGet", "uscalarSet", 1, 2] as Kernel_member,
    refCount: ["uscalarGet", "uscalarSet", 1, 3] as Kernel_member,

    id: ["uscalarGet", "uscalarSet", 1, 4] as Kernel_member,
    uuid: ["uuidGet", "uuidSet", 3, 5] as Kernel_member,

    writeTS: ["uscalarGet", "uscalarSet", 1, 8] as Kernel_member,
    readTS: ["uscalarGet", "uscalarSet", 1, 9] as Kernel_member,

    last: ["ptrGet", "ptrSet", 1, 10] as Kernel_member,
    next: ["ptrGet", "ptrSet", 1, 11] as Kernel_member,
} as const;

/** 类型ID枚举。 */
export const enum CLASSID {
    /** 无效类型。 */
    INVALID = 0,

    /** GPU统一缓存。 */
    GPU_UNIFORM_BUFFER,
    /** GPU顶点缓存。 */
    GPU_VERTEX_BUFFER,
    /** GPU索引缓存。 */
    GPU_INDEX_BUFFER,
    /** GPU存储缓存（用于计算着色器的输入输出，在WebGL中不支持）。 */
    GPU_STORAGE_BUFFER,
    /** GPU绘制指令参数缓存（用于drawIndirect、drawIndexedIndirect、dispatchWorkgroupsIndirect，在WebGL中不支持）。 */
    GPU_INDIRECT_BUFFER,

    /** GPU一维贴图。 */
    GPU_TEXTURE_1D,
    /** GPU二维贴图（可以是数组）。 */
    GPU_TEXTURE_2D,
    /** GPU立方体贴图（可以是数组）。 */
    GPU_TEXTURE_CUBE,
    /** GPU三维贴图。 */
    GPU_TEXTURE_3D,
    /** GPU渲染贴图（可以是数组）。 */
    GPU_TEXTURE_RT,

    /** GPU贴图采样器。 */
    GPU_SAMPLER,

    /** GPU资源绑定组（一组资源）。 */
    GPU_BIND_GROUP,
    /** GPU管线（包括渲染管线和计算管线）。 */
    GPU_PIPELINE,

    /*/
    以下资源名称记录在文件名中：
    ASSET_TEXTURE
    ASSET_MATERIAL
    ASSET_SKELETON
    ASSET_SKIN
    ASSET_MORPH
    ASSET_MESH_UVSET
    ASSET_MESH_GEOMETRY
    ASSET_MESH
    ASSET_ANIMATION_DATA
    /*/

    /** 自定义资源数据。 */
    ASSET_CUSTOM = 16,

    /** 着色器资产。 */
    ASSET_SHADER,
    /** 着色器图（可解析为着色器资产）。 */
    ASSET_SHADER_GRAPH,
    /** 着色器GLSL代码。 */
    ASSET_CODE_GLSL,
    /** 着色器WGSL代码。 */
    ASSET_CODE_WGSL,

    /** 一维贴图资源。 */
    ASSET_TEXTURE_1D = 24,
    /** 二维贴图资源（可以是数组）。 */
    ASSET_TEXTURE_2D,
    /** 立方体贴图资源（可以是数组）。 */
    ASSET_TEXTURE_CUBE,
    /** 三维贴图资源。 */
    ASSET_TEXTURE_3D,
    /** 渲染贴图资源（可以是数组）。 */
    ASSET_TEXTURE_RT,

    /** 材质资源。 */
    ASSET_MATERIAL = 32,
    /** 骨架定义资源。 */
    ASSET_SKELETON,
    /** 蒙皮定义资源。 */
    ASSET_SKIN,
    /** 网格变形资源。 */
    ASSET_MORPH,
    /** 几何体UV数据。 */
    ASSET_MESH_UVSET,
    /** 基础网格几何体数据。 */
    ASSET_MESH_GEOMETRY,
    /** 网格资源。 */
    ASSET_MESH,
    /** 动画数据。 */
    ASSET_ANIMATION_DATA,

    /** 网格渲染器组件。 */
    ASSET_COMPONENT_MESH_RENDERER = 48,
    /** 动画组件组件。 */
    ASSET_COMPONENT_ANIMATOR,
    /** 相机组件。 */
    ASSET_COMPONENT_CAMERA,
    /** 体积组件。 */
    ASSET_COMPONENT_VOLUME,
    /** 光源组件。 */
    ASSET_COMPONENT_LIGHT,
    /** 全景图组件。 */
    ASSET_PANORAMA,

    /** 资源包。 */
    ASSET_LEVEL_PACKAGE = 64,
    /** 预制件。 */
    ASSET_LEVEL_PREFAB,
    /** 场景节点。 */
    ASSET_LEVEL_NODE,

    /** 场景（从ASSET_LEVEL_PREFAB实例化）。 */
    SCENE = 80,
    /** 3D对象（从ASSET_LEVEL_NODE实例化）。 */
    OBJECT_3D,
}
