import * as Miaoverse from "../mod.js";
export class Resources {
    constructor(_global) {
        this._global = _global;
        this._user_space = new Miaoverse.UserSpace(_global);
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
        this.Camera = new Miaoverse.Camera_kernel(_global);
        this.Light = new Miaoverse.Light_kernel(_global);
        this.Volume = new Miaoverse.Volume_kernel(_global);
        this.Animator = new Miaoverse.Animator_kernel(_global);
        this.Dioramas = new Miaoverse.Dioramas_kernel(_global);
        this.Script = new Miaoverse.Script_kernel(_global);
        this.Object = new Miaoverse.Object_kernel(_global);
        this.Scene = new Miaoverse.Scene_kernel(_global);
    }
    async Init() {
        const exports = this._global.internal.Engine_Export();
        const view = this._global.env["_ubview"];
        const textDecoder = this._global.env["_textDecoder"];
        for (let i = 0; i < exports.length;) {
            let beg = exports[i++];
            let end = beg;
            while (0 !== view[end++])
                ;
            const names = textDecoder.decode(view.subarray(beg, end - 1)).split(",");
            const klass = this[names[0]];
            for (let j = 1; j < names.length; j++, i++) {
                klass[names[j]] = this._global.internal.__indirect_function_table.get(exports[i]);
            }
        }
        const data = new Uint8Array(4 * 128 * 128);
        const saturation = [0.0, 0.2, 0.4, 0.6, 0.8, 0.8, 0.6, 0.4, 0.2, 0.0, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
        const colors = [
            [1.0, 0.0, 0.0, 0],
            [1.0, 0.5, 0.0, 2],
            [1.0, 1.0, 0.0, 0],
            [0.5, 1.0, 0.0, 1],
            [0.0, 1.0, 0.0, 0],
            [0.0, 1.0, 0.5, 3],
            [0.0, 1.0, 1.0, 0],
            [0.0, 0.5, 1.0, 2],
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
                let idx_ = (Math.floor(i / 12) * 8 * 4 * 128) + ((i % 12) * 8 * 4);
                i++;
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
            classid: 25,
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
        this.Texture.default2D.AddRef();
        this.Texture.defaultAtlas = this._global.device.CreateTexture2D(4096, 4096, 2, 1, "rgba8unorm", GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT);
        this.MeshRenderer.defaultG1 = await this.MeshRenderer.Create(null, null);
        this.MeshRenderer.defaultG1.AddRef();
        if (!this._global.localFS) {
            const pkg = {
                index: 0,
                key: "1-1-1.miaokit.builtins",
                uuid: "1-1-1",
                invalid: false,
                path: "./assets/packages/1-1-1.miaokit.builtins.ab",
                zip: false
            };
            this.Register(pkg);
            const pkg_us = {
                index: 0,
                key: "0-0-0.user.space",
                uuid: "0-0-0",
                invalid: false,
                path: "",
                zip: false,
                meta: {},
                resid_path: {},
            };
            this.Register(pkg_us);
        }
        return this;
    }
    async Dispose() {
        this._user_space.Dispose();
        this._user_space = null;
        this.GC();
        this.Dioramas = null;
        this.Scene["DisposeAll"]();
        this.Scene = null;
        this.Object["DisposeAll"]();
        this.Object = null;
        this.Camera["DisposeAll"]();
        this.Camera = null;
        this.Light["DisposeAll"]();
        this.Light = null;
        this.Volume["DisposeAll"]();
        this.Volume = null;
        this.Animator["DisposeAll"]();
        this.Animator = null;
        this.MeshRenderer["DisposeAll"]();
        this.MeshRenderer = null;
        this.Material["DisposeAll"]();
        this.Material = null;
        this.Mesh["DisposeAll"]();
        this.Mesh = null;
        this.Texture["DisposeAll"]();
        this.Texture = null;
        this.Shader["DisposeAll"]();
        this.Shader = null;
        this.VMath = null;
        this._pkg_keyLut = null;
        this._pkg_uuidLut = null;
        this._pkg_list = null;
        this._pkg_caches = null;
        this._global.resources = null;
        this._global = null;
    }
    GC() {
        let gcList = this.Animator["_gcList"];
        for (let func of gcList) {
            func();
        }
        this.Animator["_gcList"] = [];
        gcList = this.MeshRenderer["_gcList"];
        for (let func of gcList) {
            func();
        }
        this.MeshRenderer["_gcList"] = [];
        gcList = this.Mesh["_gcList"];
        for (let func of gcList) {
            func();
        }
        this.Mesh["_gcList"] = [];
        gcList = this.Material["_gcList"];
        for (let func of gcList) {
            func();
        }
        this.Material["_gcList"] = [];
        gcList = this.Texture["_gcList"];
        for (let func of gcList) {
            func();
        }
        this.Texture["_gcList"] = [];
        for (let cache of this._pkg_caches) {
            if (cache) {
                if (cache.zip) {
                    cache.zip = null;
                }
                const location = this._pkg_list[cache.index].location || "memory";
                if (location != "memory") {
                    cache.files = {};
                }
            }
        }
    }
    Remove(classid, id) {
        if (classid == 49) {
            this.Camera["Remove"](id);
        }
        else if (classid == 50) {
            this.Light["Remove"](id);
        }
        else if (classid == 52) {
            this.Volume["Remove"](id);
        }
        else if (classid == 51) {
            this.Animator["Remove"](id);
        }
        else if (classid == 48) {
            this.MeshRenderer["Remove"](id);
        }
        else if (classid == 32) {
            this.Material["Remove"](id);
        }
        else if (classid == 21) {
            this.Material["Remove"](id);
        }
        else if (classid == 39) {
            this.Mesh["Remove"](id);
        }
        else if (classid == 67) {
            this.Object["Remove"](id);
        }
        else if (classid == 66) {
            this.Scene["Remove"](id);
        }
        else if (classid == 1) {
            this._global.device.FreeBuffer(id);
        }
        else if (classid == 2) {
            this._global.device.FreeBuffer(id);
        }
        else if (classid == 3) {
            this._global.device.FreeBuffer(id);
        }
        else {
            console.error("Resources.Remove 非法类型ID:", classid);
        }
    }
    async Load_file(type, uri, not_cache, cur_pkg) {
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
                if (keys.uuid[0] == "0-0-0") {
                    path = await this.userSpace.GetData(resid);
                    if (type == "json") {
                        path = JSON.parse(path);
                    }
                    return { pkg, data: path, path: resid };
                }
                path = pkg.resid_path[resid] || pkg.resid_path[keys.uuid[0] + "-" + resid];
                if (typeof path != "string") {
                    return { pkg, data: path, path: resid };
                }
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
            return { pkg, data: data, path };
        }
        if (pkg.zip) {
            if (!cache.zip) {
                const blob = await this._global.Fetch(pkg.path, null, "arrayBuffer");
                cache.zip = await globalThis.JSZip.loadAsync(blob);
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
        return { pkg, data: data, path };
    }
    ToUUID(uri, cur_pkg) {
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
    ParseUri(uri, cur_pkg) {
        if (uri.includes(":/")) {
            const parts = uri.split(":/");
            if (!parts[0]) {
                if (!cur_pkg) {
                    return null;
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
                    return null;
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
    async Find(keys) {
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
    async Download(keys) {
    }
    async Refresh() {
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
    async Scan() {
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
                };
            }
            return undefined;
        });
    }
    Register(entry, files) {
        if (this._pkg_keyLut[entry.key]) {
            console.warn("资源包已注册！", entry.key);
            return;
        }
        if (entry.location == "store") {
            entry.path = "https://oss.ploycloud.com/" + entry.path;
            if (entry.menu.thumbnail == "thumbnail.jpg") {
                entry.menu.thumbnail = entry.path + "/thumbnail.jpg";
            }
        }
        entry.index = this._pkg_list.length;
        this._pkg_list.push(entry);
        this._pkg_keyLut[entry.key] = entry.index;
        this._pkg_uuidLut[entry.uuid] = entry.index;
        if (files) {
            this._pkg_caches[entry.index] = {
                index: entry.index,
                files: files
            };
        }
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
    async Preview(pkg) {
        if (!pkg.meta) {
            pkg.meta = (await this.Load_file("json", ":/package.json", true, pkg))?.data;
        }
        if (pkg.meta) {
            pkg.resid_path = {};
            for (let path of pkg.meta.file_library) {
                const splitter = path.lastIndexOf("/");
                const filename = path.substring(splitter + 1);
                const resid = filename.substring(0, filename.indexOf("_"));
                pkg.resid_path[resid] = path;
            }
            if (pkg.meta.material_library) {
                for (let res of pkg.meta.material_library) {
                    pkg.resid_path[res.uuid] = res;
                }
            }
            if (pkg.meta.mesh_library) {
                for (let res of pkg.meta.mesh_library) {
                    pkg.resid_path[res.uuid] = res;
                }
            }
            if (pkg.meta.mesh_renderer_library) {
                for (let res of pkg.meta.mesh_renderer_library) {
                    pkg.resid_path[res.uuid] = res;
                }
            }
            if (pkg.meta.animations_library) {
                for (let res of pkg.meta.animations_library) {
                    pkg.resid_path[res.uuid] = res;
                }
            }
            if (pkg.meta.prefab_library) {
                for (let res of pkg.meta.prefab_library) {
                    pkg.resid_path[res.uuid] = res;
                }
            }
        }
    }
    async Browse(pkg) {
        if (pkg.menu) {
            return pkg.menu;
        }
        if (!pkg.resid_path) {
            await this.Preview(pkg);
        }
        pkg.menu = {
            thumbnail: "",
            thumbnail_per_row: 1,
            list: []
        };
        const export_keys = [29, 32, 48, 65];
        for (let asset_id in pkg.resid_path) {
            const entry = pkg.resid_path[asset_id];
            const classid_index = asset_id.split("-");
            const classid = parseInt(classid_index[0]);
            const index = parseInt(classid_index[1]);
            const name = (typeof entry == "string") ? entry.substring(entry.lastIndexOf("/") + 1) : entry.label;
            if (-1 < export_keys.indexOf(classid)) {
                pkg.menu.list.push({
                    classid: classid,
                    index: index,
                    uuid: pkg.uuid + "-" + asset_id,
                    label: name,
                    thumbnail_href: "",
                    thumbnail_index: 0,
                });
            }
        }
        return pkg.menu;
    }
    GetPackageByUUID(uuid) {
        const index = this._pkg_uuidLut[uuid];
        return this._pkg_list[index];
    }
    GetPackageByKey(key) {
        const index = this._pkg_keyLut[key];
        return this._pkg_list[index];
    }
    get packageList() {
        return this._pkg_list;
    }
    get userSpace() {
        return this._user_space;
    }
    _global;
    _user_space;
    _pkg_keyLut;
    _pkg_uuidLut;
    _pkg_list;
    _pkg_caches;
    VMath;
    Shader;
    Texture;
    Material;
    Mesh;
    MeshRenderer;
    Camera;
    Light;
    Volume;
    Animator;
    Dioramas;
    Script;
    Object;
    Scene;
}
export class Resource {
    constructor(_global, ptr, id) {
        this._global = _global;
        this._ptr = ptr;
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get internalPtr() {
        return this._ptr;
    }
    _global;
    _ptr;
    _id;
}
export const MAGIC_INVALID = 0x4D515120;
