import * as Miaoverse from "../mod.js";
export class Dioramas_3mx extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }
    async Init(url) {
        this._3mx = await this._global.Fetch(url, null, "json");
        this._3mx._path = url.substring(0, (url.lastIndexOf("/") + 1));
        this._root = [];
        for (let layer of this._3mx.layers) {
            if ("meshPyramid" === layer.type) {
                const group = await this.Load_3mxb(this._3mx._path + layer.root, null, this._root.length);
                this._root.push(group);
            }
        }
        this._showList = [];
        this._subdivList = [];
        this._showCount = 0;
        this._subdivCount = 0;
        this._updateTS = this._global.env.frameTS;
    }
    Update() {
        const updateTS = this._global.env.frameTS;
        const elapsed = updateTS - this._updateTS;
        if (elapsed < 250) {
            return;
        }
        this._updateTS = updateTS;
        this.Flush();
        console.error("=== ", this._updateTS, this._subdivCount);
        if (this._subdivCount > 0) {
            this._subdiv = async () => {
                const list = this._subdivList.slice(0, this._subdivCount).sort((a, b) => a._level - b._level);
                const ts = this._updateTS;
                for (let node of list) {
                    if (node._process != 0) {
                        continue;
                    }
                    node._process = 1;
                    try {
                        for (let i = 0; i < node.children.length; i++) {
                            const child_file = node.children[i];
                            const child_group = await this.Load_3mxb(node._master._path + child_file, node, i);
                            node._children[i] = child_group;
                        }
                        node._process = 2;
                    }
                    catch (e) {
                        console.error(e);
                        node._process = 3;
                    }
                    if (ts != this._updateTS) {
                        break;
                    }
                }
                console.log(this);
            };
            console.error("---------------------------------");
            this._subdiv();
        }
    }
    Draw(passEncoder) {
        for (let i = 0; i < this._showCount; i++) {
            const node = this._showList[i];
            for (let resid of node._resources) {
                const res = node._master.resources[resid];
                const instance = res?._instance;
                const vbuffer = instance?.vbuffer;
                const ibuffer = instance?.ibuffer;
                if (vbuffer && ibuffer) {
                    this._global.context.SetVertexBuffer(0, vbuffer.buffer, vbuffer.offset, 12 * vbuffer.count, passEncoder);
                    this._global.context.SetVertexBuffer(1, vbuffer.buffer, vbuffer.offset + 12 * vbuffer.count, 8 * vbuffer.count, passEncoder);
                    this._global.context.SetIndexBuffer(4, ibuffer, passEncoder);
                    passEncoder.drawIndexed(ibuffer.count, 1, 0, 0, 0);
                }
            }
        }
    }
    async Load_3mxb(url, parent, index) {
        const ab = await this._global.Fetch(url, null, "arrayBuffer");
        if (!ab) {
            return null;
        }
        const meta = new Uint32Array(ab, 0, 2);
        const magic = meta[0];
        if (magic == 0x42584D33) {
            const headerSize = meta[1] >> 8;
            const group = JSON.parse(this._global.env.textDecoder.decode(new Uint8Array(ab, 9, headerSize)));
            group._parent = parent;
            group._index = index;
            group._path = url.substring(0, (url.lastIndexOf("/") + 1));
            group._file = url.substring(url.lastIndexOf("/") + 1);
            group._ab = ab;
            group._ab_offset = 9 + headerSize;
            group._res_loaded = 0;
            let data_offset = 0;
            for (let i = 0; i < group.resources.length; i++) {
                const res = group.resources[i];
                res._offset = data_offset;
                if (res.type == "textureBuffer" || res.type == "geometryBuffer") {
                    data_offset += res.size;
                    if (res.type == "geometryBuffer" && res.texture) {
                        for (let j = 0; j < group.resources.length; j++) {
                            if (res.texture == group.resources[j].id) {
                                res._texture = j;
                                break;
                            }
                        }
                    }
                }
                else {
                    this._global.Track("Dioramas_3mx.Load_3mxb: 不支持的资源类型：" + res.type + "！", 3);
                }
            }
            for (let i = 0; i < group.nodes.length; i++) {
                const node = group.nodes[i];
                node._master = group;
                node._children = [];
                node._resources = [];
                node._level = parent ? parent._level + 1 : 0;
                node._visible = 0;
                node._process = 0;
                node._activeTS = this._global.env.frameTS;
                for (let j = 0; j < node.resources.length; j++) {
                    const resid = node.resources[j];
                    for (let k = 0; k < group.resources.length; k++) {
                        if (resid == group.resources[k].id) {
                            node._resources[j] = k;
                            break;
                        }
                    }
                }
            }
            await this.Load_resource(group);
            return group;
        }
        return null;
    }
    async Load_resource(group) {
        if (group._res_loaded != 0) {
            return;
        }
        group._res_loaded = 1;
        if (!group._ab) {
            const ab = await this._global.Fetch(group._path + group._file, null, "arrayBuffer");
            if (!ab) {
                group._res_loaded = 3;
                return;
            }
        }
        const env = this._global.env;
        const internal = this._global.internal;
        const Resources = this._global.resources;
        for (let res of group.resources) {
            if (false && res.type == "textureBuffer" && (res.format == "jpg" || res.format == "png")) {
                const blob = new Blob([group._ab.slice(group._ab_offset + res._offset, group._ab_offset + res._offset + res.size)]);
                const option = undefined;
                const bitmap = await createImageBitmap(blob, option);
                const texture = await Resources.Texture["LoadTexture2D_RAW"](bitmap);
                console.log(bitmap, texture);
            }
            if (res.type == "geometryBuffer" && res.format == "ctm") {
                const ctm_data_ptr = internal.System_New(res.size);
                env.bufferSet1(ctm_data_ptr, group._ab, group._ab_offset + res._offset);
                const mesh_data_raw = Resources.Mesh["_DecodeCTM"](ctm_data_ptr);
                const icount = env.uscalarGet(mesh_data_raw[1], 1);
                const vcount = env.uscalarGet(mesh_data_raw[1], 2);
                const ibuffer = this._impl.GenBuffer(1, icount);
                const vbuffer = this._impl.GenBuffer(0, vcount);
                let data_ptr = (mesh_data_raw[1] + 8 + 4);
                this._global.device.WriteBuffer(ibuffer.buffer, ibuffer.offset, env.buffer, data_ptr << 2, ibuffer.size);
                data_ptr += ibuffer.count;
                this._global.device.WriteBuffer(vbuffer.buffer, vbuffer.offset, env.buffer, data_ptr << 2, 12 * vbuffer.count);
                data_ptr += vbuffer.count * 6;
                this._global.device.WriteBuffer(vbuffer.buffer, vbuffer.offset + 12 * vbuffer.count, env.buffer, data_ptr << 2, 8 * vbuffer.count);
                internal.System_Delete(ctm_data_ptr);
                internal.System_Delete(mesh_data_raw[1]);
                res._instance = {
                    ibuffer: ibuffer,
                    vbuffer: vbuffer
                };
                console.log(res._instance);
            }
        }
        group._res_loaded = 2;
    }
    Flush() {
        this._showCount = 0;
        this._subdivCount = 0;
        const proc = (node) => {
            const visible = this.Check(node);
            if (visible > 0) {
                node._activeTS = this._global.env.frameTS;
                if (visible == 3) {
                    this.For_children(node._children, proc);
                }
                else {
                    this._showList[this._showCount++] = node;
                    if (visible == 2) {
                        this._subdivList[this._subdivCount++] = node;
                    }
                }
            }
        };
        this.For_children(this._root, proc);
    }
    Check(node) {
        if (node._level > 2) {
            return 0;
        }
        if (node._level == 2) {
            return 1;
        }
        if (node._process == 0) {
            return 2;
        }
        if (node._process == 2) {
            return 3;
        }
        return 1;
    }
    For_children(groups, fn) {
        for (let group of groups) {
            if (group) {
                for (let node of group.nodes) {
                    fn(node);
                }
            }
        }
    }
    _impl;
    _3mx;
    _root;
    _showList;
    _subdivList;
    _showCount;
    _subdivCount;
    _updateTS;
    _subdiv;
}
export class Dioramas_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, {});
        this._buffers = [];
        for (let i = 0; i < 2; i++) {
            this._buffers[i] = {
                buffers: [],
                idles: []
            };
            const idles = this._buffers[i].idles;
            for (let i = 1; i < 65; i++) {
                idles[i] = {
                    list: [],
                    count: 0
                };
            }
        }
    }
    async Create_3mx(url) {
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Dioramas_3mx(this, 0, id);
        this._instanceCount++;
        await instance.Init(url);
        return instance;
    }
    GenBuffer(type, count) {
        if (count > 65536) {
            this._global.Track("Dioramas_kernel.GenBuffer: 暂不支持顶点或索引数量大于65536的缓存！", 3);
            return null;
        }
        const buffers = this._buffers[type];
        const need_rows = ((count + 1023) >> 10);
        const idle = buffers.idles[need_rows];
        if (idle.count > 0) {
            const node = idle.list[--idle.count];
            node.count = count;
            return node;
        }
        let buffer = buffers.buffers[buffers.buffers.length - 1];
        let need_new = !buffer;
        if (buffer) {
            const free_rows = 1024 - buffer.used_rows;
            if (free_rows < need_rows) {
                if (free_rows > 0) {
                    const free_idle = buffers.idles[free_rows];
                    free_idle.list[free_idle.count++] = {
                        type: type,
                        rows: free_rows,
                        count: 0,
                        buffer: buffer.id,
                        offset: 1024 * buffer.used_rows * buffer.size_per_item,
                        size: 1024 * free_rows * buffer.size_per_item,
                    };
                }
                need_new = true;
            }
        }
        if (need_new) {
            buffer = {
                id: 0,
                size: type == 0 ? 20 * 1024 * 1024 : 4 * 1024 * 1024,
                size_per_item: type == 0 ? 20 : 4,
                used_rows: 0
            };
            const classid = type == 0 ? 2 : 3;
            buffer.id = this._global.device.CreateBuffer(classid, buffer.size);
            buffers.buffers.push(buffer);
        }
        const node = {
            type: type,
            rows: need_rows,
            count: count,
            buffer: buffer.id,
            offset: 1024 * buffer.used_rows * buffer.size_per_item,
            size: 1024 * need_rows * buffer.size_per_item,
        };
        buffer.used_rows += need_rows;
        return node;
    }
    FreeBuffer(node) {
        if (node.count > 65536) {
            this._global.Track("Dioramas_kernel.FreeBuffer: 暂不支持顶点或索引数量大于65536的缓存！", 3);
            return;
        }
        const idle = this._buffers[node.type].idles[node.rows];
        idle.list[idle.count++] = node;
    }
    _buffers;
}
//# sourceMappingURL=dioramas_3mx.js.map