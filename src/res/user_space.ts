import * as Miaoverse from "../mod.js"

/** 用户空间（本地项目空间、云端用户私有文件空间）。 */
export class UserSpace {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
        this._idx_table = [];
        this._node_lut = {};
        this._node_lut_by_loc = {};
        this._recycle_bin = [];
    }

    /**
     * 打开用户空间。
     * @param url 用户空间结构数据URL。
     * @param user 用户代码。
     * @param version 用户空间版本（本地版本与线上版本一致才可提交，没提交一次版本做一次更新）。
     */
    public async Open(url: string, user: string, version: number) {
        if (this._user_code) {
            console.error("重复打开，请先注销当前用户然后再次尝试打开新用户文件空间！");
            return;
        }

        this._user_code = user;
        this._repo_url = url;
        this._repo_version = version;

        // 用户空间结构数据（首先尝试打开本地的，与线上版本一致才能打开，否则清空本地数据）
        let json = await this.InitDB();
        // 然后尝试打开线上的
        if (!json && version > 0) {
            // 请求用户空间结构数据
            try {
                json = await this._global.Fetch<any>(this._repo_url + `${this._repo_version}/user_space.json`, null, "json");
                this._repo_updated = true;
            }
            catch (e) {
                json = null;
            }
        }

        // 打开空的用户空间
        if (!json) {
            const root = this.root;
            root.fileType = "RootFolder";
            this._repo_updated = true;
            return root;
        }

        this._idx_table = json.idx_table;
        this._recycle_bin = json.recycle_bin;
        this._node_lut = {};
        this._node_lut_by_loc = {};

        const node_list: TreeNode[] = json.node_list;
        const userSpace = this;

        function location() {
            if (this.parent) {
                return userSpace.GetNode(this.parent).location + "/" + this.name;
            }
            else {
                return this.name;
            }
        }

        for (let node of node_list) {
            Object.defineProperty(node, 'location', {
                configurable: true,
                get: location.bind(node)
            });

            if (node.fileType != "File") {
                node.children = [];
            }

            this._node_lut[node.id] = node;
        }

        for (let node of node_list) {
            const parent = this._node_lut[node.parent];
            if (parent) {
                parent.children.push(node);
            }

            this._node_lut_by_loc[node.location] = node;
        }

        return this.root;
    }

    /**
     * 获取文件夹路径指向的节点索引。
     * @param path 文件夹路径（不能以'/'为开头和结尾）。
     * @returns 返回节点索引。
     */
    public GetFolder(path: string) {
        let folder = this._node_lut_by_loc[path];
        if (!folder) {
            let parts = path.split("/");
            let cur = "";

            for (let part of parts) {
                if (part) {
                    let cur_folder = this._node_lut_by_loc[cur + part];
                    if (!cur_folder) {
                        cur_folder = this.New(Miaoverse.CLASSID.INVALID, part, cur);
                    }

                    folder = cur_folder;

                    cur += part + "/";
                }
            }
        }

        return folder;
    }

    /**
     * 获取下一个用于分配的资源索引。
     * @param classid 类型ID。
     * @returns 资源索引。
     */
    public GetNextIdx(classid: Miaoverse.CLASSID) {
        return (this._idx_table[classid] || 0) + 1;
    }

    /**
     * 通过节点ID获取节点对象。
     * @param id 节点ID。
     * @returns 返回节点对象。
     */
    public GetNode(id: string) {
        return this._node_lut[id];
    }

    /**
     * 获取文件节点数据。
     * @param id 文件节点ID。
     */
    public async GetData(id: string) {
        const node = this.GetNode(id);
        if (!node) {
            return null;
        }

        if (node.fileType != "File") {
            return null;
        }

        let value = node.data.value;
        if (value === null || value === undefined) {
            // 首先尝试加载本地的
            value = await Miaoverse.localforage.getItem<string | Uint8Array>(id);
            // 然后尝试加载线上的
            if ((value === null || value === undefined) && node.version > 0) {
                // TODO：辨别文件数据类型
                try {
                    value = await this._global.Fetch<any>(this._repo_url + `${node.version}/${node.id}.data`, null, "text");
                    // 缓存到本地
                    Miaoverse.localforage.setItem(node.id, value);
                }
                catch (e) {
                    value = null;
                }
            }

            node.data.value = value || "";
        }

        return node.data.value;
    }

    /**
     * 新建节点。
     * @param classid 类型ID。
     * @param name 节点名。
     * @param path 节点存储路径。
     * @returns 返回新建节点索引。
     */
    public New(classid: Miaoverse.CLASSID, name: string, path: string) {
        // 删除某个节点时，为保证对该节点的引用失效，我们不应重用节点ID
        const idx = this._idx_table[classid] = (this._idx_table[classid] || 0) + 1;
        const id = "" + classid + "-" + idx;
        const parent = path ? this.GetFolder(path) : null;

        const node: TreeNode = {
            id: id,
            classid: classid,
            idx: idx,

            name: name,
            parent: parent?.id,
            get location() {
                if (parent) {
                    return parent.location + "/" + this.name;
                }
                else {
                    return this.name;
                }
            },

            created_at: Date.now(),
            updated_at: Date.now(),
            version_at: 0,
            version: 0,

            isLeaf: classid ? true : false,
            fileType: classid ? "File" : "Folder",
            children: classid ? undefined : [],
            data: {},
        };

        if (node.fileType == 'File') {
            node.icon = "file";
            node.data.language = "json";
            node.data.value = "";
        }

        this._node_lut[node.id] = node;
        this._node_lut_by_loc[node.location] = node;

        if (parent) {
            parent.children.push(node);
        }

        this._repo_updated = true;

        return node;
    }

    /**
     * 删除节点（附带删除其所有子级）。
     * 文件节点将移入回收站（未提交到云端的数据将会丢失）。
     * 已提交的数据可以从回收站找回，未提交的数据无法再找回。
     * 清空回收站将删除云端存档。
     * @param id 节点ID。
     */
    public Delete(id: string) {
        const node = this._node_lut[id];
        if (!node) {
            return;
        }

        if (node.children) {
            for (let child of node.children) {
                this.Delete(child.id)
            }
        }

        const parent = this._node_lut[node.parent];
        if (parent) {
            parent.children.splice(parent.children.indexOf(node), 1);
        }

        delete this._node_lut[node.id];
        delete this._node_lut_by_loc[node.location];

        // 已存档版本移入回收站
        if (node.fileType == "File" && node.version) {
            const location = node.location;

            // 还原文件时将根据路径记录重新设置父级节点ID
            node.parent = undefined;
            // 擦除路径访问器，并直接记录
            delete node.location; node.location = location;
            // 未提交的数据将被清除，所以设置更新时间戳为最后存档时间戳
            node.updated_at = node.version_at;
            // 子级列表在运行期构建
            node.children = undefined;
            // 清除未提交数据
            node.data.value = undefined;
            node.data.status = undefined;
            // 标记文件节点已被删除
            node.deleted = true;

            // 将文件节点移入回收站（回收站内容可直接序列化上传）
            this._recycle_bin.push(node);
        }
        else {
            node.id = undefined;
            node.classid = undefined;
            node.idx = undefined;

            node.name = undefined;
            node.parent = undefined;
            delete node.location; node.location = undefined;

            node.created_at = undefined;
            node.updated_at = undefined;
            node.version_at = undefined;
            node.version = 0;

            node.isLeaf = undefined;
            node.fileType = undefined;
            node.children = undefined;
            node.data = undefined;
            node.deleted = undefined;
        }

        this._repo_updated = true;
    }

    /**
     * 重命名节点。
     * @param id 节点ID。
     * @param name 新名称。
     */
    public Rename(id: string, name: string) {
        const node = this._node_lut[id];
        if (node && node.name != name) {
            if (this._node_lut_by_loc[this._node_lut[node.parent].location + "/" + name]) {
                console.error("命名重复！");
                return false;
            }

            node.name = name;

            if (node.fileType != "File") {
                this._node_lut_by_loc = {};

                for (let key in this._node_lut) {
                    const node_ = this._node_lut[key];
                    this._node_lut_by_loc[node_.location] = node_;
                }
            }

            this._repo_updated = true;

            return true;
        }

        return false;
    }

    /**
     * 移动节点（注意，不能往子级移动）。
     * @param id 节点ID。
     * @param parent 父级节点ID。
     */
    public Move(id: string, parentId: string) {
        const node = this._node_lut[id];
        if (node) {
            let parent = this._node_lut[parentId];
            if (parent.fileType == "File") {
                parentId = parent.parent;
                parent = this._node_lut[parentId];
            }

            node.parent = parentId;

            this._node_lut_by_loc = {};

            for (let key in this._node_lut) {
                const node = this._node_lut[key];

                if (node.fileType != "File") {
                    node.children = [];
                }
            }

            for (let key in this._node_lut) {
                const node = this._node_lut[key];
                const parent = this._node_lut[node.parent];

                if (parent) {
                    parent.children.push(node);
                }

                this._node_lut_by_loc[node.location] = node;
            }

            this._repo_updated = true;
        }
    }

    /**
     * 更新文件数据。
     * @param id 节点ID。
     * @param content 新文件数据。
     */
    public Update(id: string, content: any) {
        const node = this._node_lut[id];
        if (node) {
            node.data.value = content;
            node.data.status = undefined;
            // 如果为0则存储到本地空间，存储时设置时间戳
            node.updated_at = 0;

            this._repo_updated = true;
        }
    }

    /**
     * 暂存最新数据到本地存储器（建议定时调用）。
     */
    public async Store() {
        if (!this._repo_updated) {
            return false;
        }

        const data = await this.Save();
        this._repo_updated = false;

        for (let file of data.files.datas) {
            await Miaoverse.localforage.setItem(file.src.id, file.data);
        }

        await Miaoverse.localforage.setItem("STRUCTURE", {
            repo_version: data.repo_version,
            idx_table: data.idx_table,
            recycle_bin: data.recycle_bin,
            node_list: data.node_list,
        });

        return true;
    }

    /**
     * 提交最新数据到云端用户空间。
     * 存储库版本不同时不接受提交。注意切换另一个环境工作前，请先提交当前工作环境的工作数据。
     */
    public async Submit() {
        if (!this._user_code) {
            return null;
        }

        const data = await this.Save(true);

        data.repo_version += 1;

        for (let file of data.files.datas) {
            file.dst.version_at = file.dst.updated_at;
            file.dst.version = data.repo_version;

            // 将旧版添加到回收站
            if (file.src.version) {
                this._recycle_bin.push({
                    id: file.src.id,
                    classid: file.src.classid,
                    idx: file.src.idx,

                    name: file.src.name,
                    // 还原文件时将根据路径记录重新设置父级节点ID
                    parent: undefined,
                    // 记录当前文件路径
                    location: file.src.location,

                    created_at: file.src.created_at,
                    // 未提交的数据将被清除，所以设置更新时间戳为最后存档时间戳
                    updated_at: file.src.version_at,
                    version_at: file.src.version_at,
                    version: file.src.version,

                    isLeaf: file.src.isLeaf,
                    fileType: file.src.fileType,
                    icon: file.src.icon,
                    deleted: true,
                    data: {
                        language: file.src.data.language,
                    },
                });
            }
        }

        const user_space_data = JSON.stringify({
            repo_version: data.repo_version,
            idx_table: data.idx_table,
            recycle_bin: data.recycle_bin,
            node_list: data.node_list,
        });

        const user_space_size = this._global.env.textEncoder.encode(user_space_data).length;

        data.files.infos.push({
            path: `${data.repo_version}/user_space.json`,
            size: user_space_size,
            sign: null
        });

        data.files.datas.push({
            src: null,
            dst: null,
            data: user_space_data
        });

        data.files.count += 1;
        data.files.size += user_space_size;

        // ====================------------------------------------------------

        return {
            data,
            form: {
                usage: "user_spaces",
                key: `${this._user_code}/${this._repo_version + 1}`,
                byte_size: data.files.size,
                file_count: data.files.count,
                files: data.files.infos,
            },
            callback: (repo_version: number) => {
                if (repo_version > 0) {
                    Miaoverse.localforage.setItem("VERSION", repo_version);

                    this._repo_version = repo_version;
                    // TODO：应避免提交过程中进行新的删除操作，或者单独记录版本覆盖的回收列表
                    this._recycle_bin = data.recycle_bin;

                    for (let file of data.files.datas) {
                        if (file.src && file.dst) {
                            file.src.version_at = file.dst.version_at;
                            file.src.version = file.dst.version;
                        }
                    }

                    this._repo_updated = true;
                }
            }
        };
    }

    /**
     * 获取保存数据。
     */
    protected async Save(online?: boolean) {
        const textEncoder = this._global.env.textEncoder;
        const new_repo_version = this._repo_version + 1;
        const idx_table = this._idx_table;
        const recycle_bin = this._recycle_bin;
        const node_list: TreeNode[] = [];
        const files: {
            /** 文件信息列表。 */
            infos: {
                /** 文件相对路径。 */
                path: string;
                /** 文件字节大小。 */
                size: number;
                /** 文件上传签名。 */
                sign: any;
            }[];
            /** 文件数据列表。 */
            datas: {
                /** 文件源节点。 */
                src: TreeNode;
                /** 文件存储节点。 */
                dst: TreeNode;
                /** 文件数据。 */
                data: string | Blob;
            }[];
            /** 总文件数量。 */
            count: number;
            /** 总字节大小。 */
            size: number;
        } = { infos: [], datas: [], count: 0, size: 0 };

        for (let id in this._node_lut) {
            const node = this._node_lut[id];
            let file = -1;

            if (node.deleted) {
                console.error("节点删除状态异常！");
                continue;
            }

            // 提交新内容，旧内容会进入回收站（TODO: 本地存储判断 node.updated_at == 0 ，提交线上判断 node.updated_at !== node.version_at）
            if (node.fileType == "File") {
                if (node.updated_at == 0) {
                    node.updated_at = Date.now();
                    if (!online) {
                        file = files.count;
                    }
                }

                if (online && node.updated_at !== node.version_at) {
                    file = files.count;
                }
            }

            // 序列化节点
            const dst_node: TreeNode = {
                id: node.id,
                classid: node.classid,
                idx: node.idx,

                name: node.name,
                parent: node.parent,

                created_at: node.created_at,
                updated_at: node.updated_at,
                version_at: node.version_at,
                version: node.version,

                isLeaf: node.isLeaf,
                fileType: node.fileType,
                icon: node.icon,
                data: node.fileType == "File" ? {
                    language: node.data.language,
                } : {},
            };

            // 文件存储信息
            if (file > -1) {
                let data: string | Uint8Array | Blob = await this.GetData(node.id);
                let size = 0;

                if (typeof data === 'string') {
                    if (online) {
                        // 不同的操作系统使用不同的换行符
                        // Unix/Linux 系统 使用 LF（换行符），编码为 0A
                        // Windows 系统 使用 CR+LF（回车+换行），编码为 0D 0A
                        // OSS上传会自动转为 CR+LF，为避免上传前后验证大小不一致，因此在JS端转换为CR+LF再上传
                        const crlf = data.replace(/(?<!\r)\n/g, '\r\n');
                        const blob = new Blob([crlf]);

                        size = blob.size;
                        data = blob;
                    }
                    else {
                        size = textEncoder.encode(data).length;
                    }
                }
                else {
                    size = data.byteLength;
                    data = new Blob([data]);
                }

                files.count += 1;
                files.size += size;

                files.infos.push({
                    path: `${new_repo_version}/${node.id}.data`,
                    size: size,
                    sign: null
                });

                files.datas.push({
                    src: node,
                    dst: dst_node,
                    data: data
                });
            }

            node_list.push(dst_node);
        }

        return {
            repo_version: this._repo_version,
            idx_table,
            recycle_bin,
            node_list,
            files,
        };
    }

    /**
     * 清除对象。
     */
    public Dispose() {
        this._global = undefined;
        this._user_code = undefined;
        this._repo_version = undefined;
        this._repo_updated = undefined;
        this._idx_table = undefined;
        this._node_lut = undefined;
        this._node_lut_by_loc = undefined;
        this._recycle_bin = undefined;
    }

    /** 根文件夹。 */
    public get root() {
        return this.GetFolder("user_space");
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
    /** 用户代码。 */
    private _user_code: string;
    /** 云端地址。 */
    private _repo_url: string;
    /** 存储库版本。 */
    private _repo_version: number;
    /** 存储库是否存在更新（未提交到线上则不提升版本）。 */
    private _repo_updated: boolean;
    /** 索引分配记录。 */
    private _idx_table: number[];
    /** 节点查找表（通过ID查找）。 */
    private _node_lut: Record<string, TreeNode>;
    /** 节点查找表（通过路径查找，用户结构空间变换后需要刷新该字典）。 */
    private _node_lut_by_loc: Record<string, TreeNode>;
    /** 文件回收站（平台仅标记文件被删除，而不会真正删除文件，始终占用用户的存储空间，直到用户点击清空回收站）。 */
    private _recycle_bin: TreeNode[];

    /**
     * 初始化本地用户空间。
     * https://localforage.docschina.org/
     * @returns 返回用户空间结构数据。
     */
    protected async InitDB() {
        Miaoverse.localforage.config({
            driver: Miaoverse.localforage.INDEXEDDB,
            name: "PCUS",
            storeName: this._user_code.replaceAll('-', "_"),
        });

        // 获取本地用户空间数据版本
        let version = (await Miaoverse.localforage.getItem<number>("VERSION")) || 0;
        // 如果数据版本与线上不一致，清空重建
        if (version != this._repo_version) {
            console.error("销毁本地用户空间过期数据！", version, this._repo_version, this._user_code);
            version = this._repo_version;

            await Miaoverse.localforage.dropInstance({
                name: "PCUS",
                storeName: this._user_code.replaceAll('-', "_"),
            });

            Miaoverse.localforage.setItem("VERSION", version);
        }

        return Miaoverse.localforage.getItem<any>("STRUCTURE");
    }
}

/** 用户空间结构节点。 */
interface TreeNode {
    /** 文件或文件夹唯一ID（我们通过ID引用文件或文件夹，因此我们能轻易对其进行重命名、移动、删除）。 */
    id: string;
    /** 类型ID（文件夹类型ID为Miaoverse.CLASSID.INVALID）。 */
    classid: Miaoverse.CLASSID;
    /** 同类型ID索引。 */
    idx: number;

    /** 文件名或文件夹名（文件名包含后缀，重命名仅需修改该字段）。 */
    name: string;
    /** 所属文件夹ID（进行移动仅需修改该字段）。 */
    parent: string;
    /** 相对用户空间完整虚拟路径（实际上文件总是直接存储在用户空间根路径。注意，这是一个Get访问器，在运行时设置）。 */
    location?: string;

    /** 创建时间戳。 */
    created_at: number;
    /** 更新时间戳（更新时间戳不等于存档时间戳，表示数据相对云端有更新）。 */
    updated_at: number;
    /** 存档时间戳。 */
    version_at: number;
    /** 存档版本号（存档目录）。 */
    version: number;

    /** 是否为叶子节点（仅在表示文件时为真）。 */
    isLeaf: boolean;
    /** 节点类型。 */
    fileType: "File" | "Folder" | "RootFolder";
    /** 文件图标。 */
    icon?: string;
    /** 子级节点列表（运行时构建，不应保存该列表）。 */
    children?: TreeNode[];
    /** 是否已删除。 */
    deleted?: boolean;
    /** 文件内容描述。 */
    data: {
        /** 文件内容语言。 */
        language?: string;
        /** 文件内容（如果为空则加载文件最新存档）。 */
        value?: string | Uint8Array;
        /** 文件内容是否已被编辑。 */
        status?: "edited";
    };
}
