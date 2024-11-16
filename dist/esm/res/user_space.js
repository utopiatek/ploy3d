import * as Miaoverse from "../mod.js";
export class UserSpace {
    constructor(_global) {
        this._global = _global;
        this._idx_table = [];
        this._node_lut = {};
        this._node_lut_by_loc = {};
        this._recycle_bin = [];
    }
    async Open(url, user, version) {
        if (this._user_code) {
            console.error("重复打开，请先注销当前用户然后再次尝试打开新用户文件空间！");
            return;
        }
        this._user_code = user;
        this._repo_url = url;
        this._repo_version = version;
        let json = await this.InitDB();
        if (!json && version > 0) {
            try {
                json = await this._global.Fetch(this._repo_url + `${this._repo_version}/user_space.json`, null, "json");
                this._repo_updated = true;
            }
            catch (e) {
                json = null;
            }
        }
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
        const node_list = json.node_list;
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
    GetFolder(path) {
        let folder = this._node_lut_by_loc[path];
        if (!folder) {
            let parts = path.split("/");
            let cur = "";
            for (let part of parts) {
                if (part) {
                    let cur_folder = this._node_lut_by_loc[cur + part];
                    if (!cur_folder) {
                        cur_folder = this.New(0, part, cur);
                    }
                    folder = cur_folder;
                    cur += part + "/";
                }
            }
        }
        return folder;
    }
    GetNextIdx(classid) {
        return (this._idx_table[classid] || 0) + 1;
    }
    GetNode(id) {
        return this._node_lut[id];
    }
    async GetData(id) {
        const node = this.GetNode(id);
        if (!node) {
            return null;
        }
        if (node.fileType != "File") {
            return null;
        }
        let value = node.data.value;
        if (value === null || value === undefined) {
            value = await Miaoverse.localforage.getItem(id);
            if ((value === null || value === undefined) && node.version > 0) {
                try {
                    value = await this._global.Fetch(this._repo_url + `${node.version}/${node.id}.data`, null, "text");
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
    New(classid, name, path) {
        const idx = this._idx_table[classid] = (this._idx_table[classid] || 0) + 1;
        const id = "" + classid + "-" + idx;
        const parent = path ? this.GetFolder(path) : null;
        const node = {
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
    Delete(id) {
        const node = this._node_lut[id];
        if (!node) {
            return;
        }
        if (node.children) {
            for (let child of node.children) {
                this.Delete(child.id);
            }
        }
        const parent = this._node_lut[node.parent];
        if (parent) {
            parent.children.splice(parent.children.indexOf(node), 1);
        }
        delete this._node_lut[node.id];
        delete this._node_lut_by_loc[node.location];
        if (node.fileType == "File" && node.version) {
            const location = node.location;
            node.parent = undefined;
            delete node.location;
            node.location = location;
            node.updated_at = node.version_at;
            node.children = undefined;
            node.data.value = undefined;
            node.data.status = undefined;
            node.deleted = true;
            this._recycle_bin.push(node);
        }
        else {
            node.id = undefined;
            node.classid = undefined;
            node.idx = undefined;
            node.name = undefined;
            node.parent = undefined;
            delete node.location;
            node.location = undefined;
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
    Rename(id, name) {
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
    Move(id, parentId) {
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
    Update(id, content) {
        const node = this._node_lut[id];
        if (node) {
            node.data.value = content;
            node.data.status = undefined;
            node.updated_at = 0;
            this._repo_updated = true;
        }
    }
    async Store() {
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
    async Submit() {
        if (!this._user_code) {
            return null;
        }
        const data = await this.Save(true);
        data.repo_version += 1;
        for (let file of data.files.datas) {
            file.dst.version_at = file.dst.updated_at;
            file.dst.version = data.repo_version;
            if (file.src.version) {
                this._recycle_bin.push({
                    id: file.src.id,
                    classid: file.src.classid,
                    idx: file.src.idx,
                    name: file.src.name,
                    parent: undefined,
                    location: file.src.location,
                    created_at: file.src.created_at,
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
        return {
            data,
            form: {
                usage: "user_spaces",
                key: `${this._user_code}/${this._repo_version + 1}`,
                byte_size: data.files.size,
                file_count: data.files.count,
                files: data.files.infos,
            },
            callback: (repo_version) => {
                if (repo_version > 0) {
                    Miaoverse.localforage.setItem("VERSION", repo_version);
                    this._repo_version = repo_version;
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
    async Save(online) {
        const textEncoder = this._global.env.textEncoder;
        const new_repo_version = this._repo_version + 1;
        const idx_table = this._idx_table;
        const recycle_bin = this._recycle_bin;
        const node_list = [];
        const files = { infos: [], datas: [], count: 0, size: 0 };
        for (let id in this._node_lut) {
            const node = this._node_lut[id];
            let file = -1;
            if (node.deleted) {
                console.error("节点删除状态异常！");
                continue;
            }
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
            const dst_node = {
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
            if (file > -1) {
                let data = await this.GetData(node.id);
                let size = 0;
                if (typeof data === 'string') {
                    if (online) {
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
    Dispose() {
        this._global = undefined;
        this._user_code = undefined;
        this._repo_version = undefined;
        this._repo_updated = undefined;
        this._idx_table = undefined;
        this._node_lut = undefined;
        this._node_lut_by_loc = undefined;
        this._recycle_bin = undefined;
    }
    get root() {
        return this.GetFolder("user_space");
    }
    _global;
    _user_code;
    _repo_url;
    _repo_version;
    _repo_updated;
    _idx_table;
    _node_lut;
    _node_lut_by_loc;
    _recycle_bin;
    async InitDB() {
        Miaoverse.localforage.config({
            driver: Miaoverse.localforage.INDEXEDDB,
            name: "PCUS",
            storeName: this._user_code.replaceAll('-', "_"),
        });
        let version = (await Miaoverse.localforage.getItem("VERSION")) || 0;
        if (version != this._repo_version) {
            console.error("销毁本地用户空间过期数据！", version, this._repo_version, this._user_code);
            version = this._repo_version;
            await Miaoverse.localforage.dropInstance({
                name: "PCUS",
                storeName: this._user_code.replaceAll('-', "_"),
            });
            Miaoverse.localforage.setItem("VERSION", version);
        }
        return Miaoverse.localforage.getItem("STRUCTURE");
    }
}
