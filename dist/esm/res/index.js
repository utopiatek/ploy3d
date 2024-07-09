import * as Miaoverse from "../mod.js";
export class Resources {
    constructor(_global) {
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
        this.Camera = new Miaoverse.Camera_kernel(_global);
        this.Light = new Miaoverse.Light_kernel(_global);
        this.Volume = new Miaoverse.Volume_kernel(_global);
        this.Animator = new Miaoverse.Animator_kernel(_global);
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
        return this;
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
            return { pkg, data: data };
        }
        if (pkg.zip) {
            if (!cache.zip) {
                const blob = await this._global.Fetch(pkg.path, null, "arrayBuffer");
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
        return { pkg, data: data };
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
    Register(entry) {
        entry.index = this._pkg_list.length;
        this._pkg_list.push(entry);
        this._pkg_keyLut[entry.key] = entry.index;
        this._pkg_uuidLut[entry.uuid] = entry.index;
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
        pkg.meta = (await this.Load_file("json", ":/package.json", true, pkg))?.data;
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
    _global;
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
//# sourceMappingURL=index.js.map