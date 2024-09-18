import * as Miaoverse from "../mod.js";
export class Texture extends Miaoverse.Resource {
    constructor(impl, texture, id, uuid) {
        super(impl["_global"], 0, id);
        this._impl = impl;
        this._uuid = uuid;
        this._refCount = 1;
        this._texture = texture;
    }
    get uuid() {
        return this._uuid;
    }
    get internalID() {
        return this._texture.id;
    }
    _impl;
    _uuid;
    _refCount;
    _texture = null;
}
export class Texture_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, {});
    }
    async Load(uri, pkg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }
        if (this._instanceLut[uuid]) {
            return this._instanceLut[uuid];
        }
        const desc = await this._global.resources.Load_file("arrayBuffer", uri, true, pkg);
        if (!desc?.data) {
            console.error("Texture_kernel::Load failed", desc?.pkg?.key || pkg?.key, uri);
            return null;
        }
        let texture = null;
        if (desc.path.endsWith(".ktx2")) {
            texture = this.LoadTexture2D_KTX2(desc.data, "bc7-rgba-unorm");
        }
        else {
            const blob = new Blob([desc.data]);
            const option = undefined;
            const bitmap = await createImageBitmap(blob, option);
            texture = await this.LoadTexture2D_RAW(bitmap, GPUTextureUsage.RENDER_ATTACHMENT);
            bitmap.close();
        }
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Texture(this, texture, id, uuid || "");
        this._instanceCount++;
        this._gcList.push(instance);
        if (uuid) {
            this._instanceLut[uuid] = instance;
        }
        return instance;
    }
    async CreateTexture(asset) {
        let texture = null;
        if (asset.bitmap) {
            texture = await this.LoadTexture2D_RAW(asset.bitmap);
        }
        if (asset.uri) {
            texture = await this.LoadTexture2D_URI(asset.uri, asset.has_alpha);
        }
        else {
        }
        if (!texture) {
            return null;
        }
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Texture(this, texture, id, asset.uuid || "");
        this._instanceCount++;
        this._gcList.push(instance);
        if (asset.uuid) {
            this._instanceLut[asset.uuid] = instance;
        }
        return instance;
    }
    async LoadTexture2D_URI(uri, has_alpha) {
        if (uri.endsWith(".ktx2")) {
            const buffer = await this._global.resources.Load_file("arrayBuffer", uri, true, null);
            const texture = this.LoadTexture2D_KTX2(buffer.data, "bc7-rgba-unorm");
            return texture;
        }
        else {
            const blob = await this._global.Fetch(uri, null, "blob");
            const option = undefined;
            const bitmap = await createImageBitmap(blob, option);
            const texture = await this.LoadTexture2D_RAW(bitmap, GPUTextureUsage.RENDER_ATTACHMENT);
            bitmap.close();
            return texture;
        }
    }
    LoadTexture2D_RAW(bitmap, usage) {
        const device = this._global.device;
        const id = device.CreateTexture2D(bitmap.width, bitmap.height, 1, 1, bitmap.format || "rgba8unorm", usage);
        if (id == 0) {
            return null;
        }
        bitmap.layer = 0;
        bitmap.level = 0;
        bitmap.xoffset = 0;
        bitmap.yoffset = 0;
        device.WriteTexture2D_RAW(id, false, bitmap);
        return device.GetTexture2D(id);
    }
    LoadTexture2D_KTX2(buffer, format) {
        const format_desc = this._global.device["_textureFormatDescLut"][format];
        const internal = this._global.internal;
        const env = this._global.env;
        const device = this._global.device;
        const bufferPtr = internal.System_New(buffer.byteLength);
        env.bufferSet1(bufferPtr, buffer, 0, buffer.byteLength);
        const imagePtr = this._global.internal.Util_Transcoder_ktx2(bufferPtr, buffer.byteLength, format_desc.compressed);
        internal.System_Delete(bufferPtr);
        if (env.ptrValid(imagePtr)) {
            const image = this.ParseImage_KTX2(imagePtr);
            const id = device.CreateTexture2D(image.width, image.height, 1, image.levelCount, format);
            image.layer = 0;
            image.level = 0;
            image.xoffset = 0;
            image.yoffset = 0;
            device.WriteTexture2D_KTX2(id, image);
            internal.Util_Free_ktx2(imagePtr);
            return device.GetTexture2D(id);
        }
        return null;
    }
    ParseImage_KTX2(ptr, maxLevelCount) {
        const env = this._global.env;
        const data = {
            width: env.uscalarGet(ptr, 0),
            height: env.uscalarGet(ptr, 1),
            levelCount: env.uscalarGet(ptr, 2),
            faces: env.uscalarGet(ptr, 3),
            depth: env.uscalarGet(ptr, 4),
            count: env.uscalarGet(ptr, 5),
            hasAlpha: env.uscalarGet(ptr, 6),
            format: env.uscalarGet(ptr, 7),
            buffer: env.buffer,
            dataOffset: env.ptrGet(ptr, 8) << 2,
            levelInfos: (() => {
                const array = [];
                let levels = env.uscalarGet(ptr, 2);
                if (levels > maxLevelCount && maxLevelCount) {
                    levels = maxLevelCount;
                }
                for (let i = 0; i < levels; i++) {
                    const offset = 9 + i * 8;
                    array[i] = {
                        width: env.uscalarGet(ptr, offset + 0),
                        height: env.uscalarGet(ptr, offset + 1),
                        block_width: env.uscalarGet(ptr, offset + 2),
                        block_height: env.uscalarGet(ptr, offset + 3),
                        blocks_x_count: env.uscalarGet(ptr, offset + 4),
                        blocks_y_count: env.uscalarGet(ptr, offset + 5),
                        bytes_per_block: env.uscalarGet(ptr, offset + 6),
                        level_data_offset: env.uscalarGet(ptr, offset + 7),
                    };
                }
                return array;
            })()
        };
        return data;
    }
    AddRef(id) {
        const instance = this._instanceList[id];
        if (instance) {
            instance["_refCount"]++;
        }
    }
    Release(id) {
        const instance = this._instanceList[id];
        if (instance && 0 == --instance["_refCount"]) {
            this._global.device.FreeTexture2D(instance.internalID);
            this._instanceList[id] = { id: this._instanceIdle };
            this._instanceLut[instance.uuid] = undefined;
            this._instanceCount--;
            this._instanceIdle = id;
        }
    }
    _WriteTile(tile, bitmap, xoffset = 0, yoffset = 0) {
        const info = this._global.env.uarrayGet(tile, 12, 8);
        bitmap.layer = info[1];
        bitmap.level = 0;
        bitmap.xoffset = xoffset + info[6] * 64;
        bitmap.yoffset = yoffset + info[7] * 64;
        this._global.device.ResizeAtlas(this.defaultAtlas, bitmap.layer);
        this._global.device.WriteTexture2D_RAW(this.defaultAtlas, false, bitmap);
    }
    _CreateTile;
    _ReleaseTile;
    default2D;
    defaultAtlas;
}
export const TextureTile_member_index = {
    ...Miaoverse.Binary_member_index,
    atlas: ["uscalarGet", "uscalarSet", 1, 12],
    layer: ["uscalarGet", "uscalarSet", 1, 13],
    width: ["uscalarGet", "uscalarSet", 1, 14],
    height: ["uscalarGet", "uscalarSet", 1, 15],
    cols: ["uscalarGet", "uscalarSet", 1, 16],
    rows: ["uscalarGet", "uscalarSet", 1, 17],
    xoffset: ["uscalarGet", "uscalarSet", 1, 18],
    yoffset: ["uscalarGet", "uscalarSet", 1, 19],
};
//# sourceMappingURL=texture.js.map