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
        this._drawList = [];
        this._subdivList = [];
        this._drawCount = 0;
        this._subdivCount = 0;
        this._updateTS = this._global.env.frameTS;
        this._intervalGC = 1000;
    }
    Update(object3d, frameUniforms, camera) {
        const env = this._global.env;
        const updateTS = env.frameTS;
        const elapsed = updateTS - this._updateTS;
        if (elapsed < 250) {
            return;
        }
        this._updateTS = updateTS;
        env.AllocaCall(128, (checker) => {
            env.uscalarSet(checker, 0, 0);
            env.ptrSet(checker, 1, object3d.internalPtr);
            env.ptrSet(checker, 2, frameUniforms.internalPtr);
            env.ptrSet(checker, 3, camera.internalPtr);
            const frustumCheck = (bbMin, bbMax) => {
                env.fscalarSet(checker, 4, bbMin[0]);
                env.fscalarSet(checker, 5, bbMin[2]);
                env.fscalarSet(checker, 6, -bbMin[1]);
                env.fscalarSet(checker, 7, bbMax[0]);
                env.fscalarSet(checker, 8, bbMax[2]);
                env.fscalarSet(checker, 9, -bbMax[1]);
                return this._global.resources.Camera["_Frustum_Check"](checker);
            };
            this.Flush(frustumCheck);
        });
        this.GC();
        if (this._subdivCount > 0) {
            (async () => {
                const list = this._subdivList.slice(0, this._subdivCount).sort((a, b) => b._level - a._level);
                const ts = this._updateTS;
                const proc = async (node) => {
                    try {
                        if (node._process != 0) {
                            if (node._released && !node._reloading) {
                                node._reloading = true;
                                for (let group of node._children) {
                                    await this.Load_resource(group);
                                }
                                node._released = false;
                                node._reloading = false;
                            }
                        }
                        else {
                            node._process = 1;
                            for (let i = 0; i < node.children.length; i++) {
                                const child_file = node.children[i];
                                const child_group = await this.Load_3mxb(node._master._path + child_file, node, i);
                                node._children[i] = child_group;
                            }
                            node._process = 2;
                        }
                    }
                    catch (e) {
                        node._process = 3;
                        console.error(e);
                    }
                };
                for (let i = 0; i < list.length; i += 8) {
                    const promises = [];
                    for (let j = 0; j < 8; j++) {
                        if ((i + j) < list.length) {
                            const node = list[i + j];
                            promises.push(new Promise((resolve, reject) => {
                                proc(node).then(resolve).catch(reject);
                            }));
                        }
                    }
                    await Promise.all(promises);
                    this._global.app.DrawFrame(180);
                    if (ts != this._updateTS) {
                        break;
                    }
                }
            })();
        }
    }
    Draw(material, passEncoder) {
        for (let i = 0; i < this._drawCount; i++) {
            const instance = this._drawList[i];
            const vbuffer = instance.vbuffer;
            const dbuffer = this._drawBuffer.buffer;
            const ibuffer = instance.ibuffer;
            this._global.context.SetVertexBuffer(0, vbuffer.buffer, vbuffer.offset, 12 * vbuffer.count, passEncoder);
            this._global.context.SetVertexBuffer(1, vbuffer.buffer, vbuffer.offset + 12 * vbuffer.count, 8 * vbuffer.count, passEncoder);
            this._global.context.SetVertexBuffer(2, dbuffer.buffer, dbuffer.offset + 20 * i, 20, passEncoder);
            this._global.context.SetIndexBuffer(4, ibuffer, passEncoder);
            passEncoder.drawIndexed(ibuffer.count, 1, 0, 0, 0);
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
            group._ab = await this._global.Fetch(group._path + group._file, null, "arrayBuffer");
            if (!group._ab) {
                group._res_loaded = 3;
                return;
            }
        }
        const env = this._global.env;
        const internal = this._global.internal;
        const Resources = this._global.resources;
        for (let res of group.resources) {
            if (res.type == "textureBuffer" && (res.format == "jpg" || res.format == "png")) {
                const data_ab = group._ab.slice(group._ab_offset + res._offset, group._ab_offset + res._offset + res.size);
                const data_view = new DataView(data_ab);
                let width = 0;
                let height = 0;
                if ((data_view.getUint16(0, true) & 0xFFFF) == 0xD8FF) {
                    let read_offset = 2;
                    while (true) {
                        let marker = data_view.getUint16(read_offset, true);
                        read_offset += 2;
                        if (marker == 0xC0FF || marker == 0xC2FF) {
                            height = data_view.getUint16(read_offset + 3, false);
                            width = data_view.getUint16(read_offset + 5, false);
                            break;
                        }
                        else if ((marker & 0xFF) != 0xFF) {
                            console.error("jpg parse error!");
                            break;
                        }
                        else {
                            const size = data_view.getUint16(read_offset, false);
                            read_offset += size;
                        }
                    }
                }
                else if (data_view.getUint32(0, true) == 0x474E5089 && data_view.getUint32(4, true) == 0x0A1A0A0D) {
                    console.error("png parse error!");
                }
                let option = undefined;
                if (Math.max(width, height) >= 2048) {
                    option = {
                        resizeHeight: height * 0.5,
                        resizeWidth: width * 0.5
                    };
                }
                const blob = new Blob([data_ab]);
                const bitmap = await createImageBitmap(blob, option);
                const tile = Resources.Texture._CreateTile(bitmap.width, bitmap.height, 0);
                Resources.Texture._WriteTile(tile, bitmap);
                bitmap.close();
                const info = this._global.env.uarrayGet(tile, 12, 8);
                const layer = info[1];
                const rect = [
                    info[6] * 64 / 4096,
                    info[7] * 64 / 4096,
                    (info[2] - 1) / 4096,
                    (info[3] - 1) / 4096
                ];
                res._instance = {
                    texture: {
                        tile,
                        layer,
                        rect
                    }
                };
            }
            if (res.type == "geometryBuffer" && res.format == "ctm") {
                const ctm_data_ptr = internal.System_New(res.size);
                env.bufferSet1(ctm_data_ptr, group._ab, group._ab_offset + res._offset, res.size);
                const mesh_data_raw = Resources.Mesh["_DecodeCTM"](ctm_data_ptr);
                const icount = env.uscalarGet(mesh_data_raw[1], 1);
                const vcount = env.uscalarGet(mesh_data_raw[1], 2);
                if (!icount || !vcount) {
                    console.error(res.size, icount, vcount);
                    continue;
                }
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
            }
        }
        group._res_loaded = 2;
        group._ab = null;
    }
    Flush(frustumCheck) {
        this._drawCount = 0;
        this._subdivCount = 0;
        const proc = (node) => {
            const visible = this.Check(node, frustumCheck);
            if (visible > 0) {
                node._activeTS = this._global.env.frameTS;
                if (visible == 3) {
                    this.For_children(node._children, proc);
                }
                else {
                    for (let resid of node._resources) {
                        const res = node._master.resources[resid];
                        const instance = res?._instance;
                        const vbuffer = instance?.vbuffer;
                        const ibuffer = instance?.ibuffer;
                        if (vbuffer && ibuffer) {
                            instance.drawIndex = this._drawCount;
                            instance.useTexture = node._master.resources[res._texture]?._instance?.texture;
                            this._drawList[this._drawCount++] = instance;
                        }
                        else {
                            console.error("节点状态异常！");
                        }
                    }
                    if (visible == 2) {
                        this._subdivList[this._subdivCount++] = node;
                    }
                }
            }
        };
        this.For_children(this._root, proc);
        if (this._drawCount) {
            if (!this._drawBuffer || this._drawBuffer.capacity < this._drawCount) {
                const capacity = ((this._drawCount + 1023) >> 10) << 10;
                const ptr = this._global.internal.System_New(20 * capacity);
                const buffer = this._impl.GenBuffer(0, capacity);
                if (this._drawBuffer) {
                    this._global.internal.System_Delete(this._drawBuffer.ptr);
                    this._impl.FreeBuffer(this._drawBuffer.buffer);
                }
                this._drawBuffer = {
                    capacity,
                    ptr,
                    buffer
                };
            }
            const env = this._global.env;
            const ptr = this._drawBuffer.ptr;
            const buffer = this._drawBuffer.buffer;
            for (let i = 0; i < this._drawCount; i++) {
                const offset5 = i * 5;
                const instance = this._drawList[i];
                env.farraySet(ptr, offset5, instance.useTexture?.rect || [0.0, 0.0, 0.0, 0.0]);
                env.uscalarSet(ptr, offset5 + 4, instance.useTexture?.layer || 0);
            }
            this._global.device.WriteBuffer(buffer.buffer, buffer.offset, env.buffer, ptr << 2, 20 * this._drawCount);
        }
    }
    Check(node, frustumCheck) {
        const drawSize = frustumCheck(node.bbMin, node.bbMax);
        if (drawSize < 1) {
            return 0;
        }
        if (drawSize < (node.maxScreenDiameter * 1.0)) {
            return 1;
        }
        if (node._process == 2 && !node._released) {
            return 3;
        }
        if (node._process == 0 || node._released) {
            return 2;
        }
        return 1;
    }
    For_children(groups, fn) {
        for (let group of groups) {
            if (group && !(group._parent?._released)) {
                for (let node of group.nodes) {
                    fn(node);
                }
            }
        }
    }
    GC() {
        const frameTS = this._global.env.frameTS;
        const gc_proc = (node) => {
            if ((frameTS - node._activeTS) > this._intervalGC) {
                this.GC_free(node);
            }
            else {
                this.For_children(node._children, gc_proc);
            }
        };
        this.For_children(this._root, gc_proc);
    }
    GC_free(node) {
        this.For_children(node._children, (child) => {
            this.GC_free(child);
        });
        node._released = true;
        for (let child_group of node._children) {
            child_group._res_loaded = 0;
            child_group._ab = null;
            for (let res of child_group.resources) {
                if (res._instance) {
                    if (res._instance.vbuffer) {
                        this._impl.FreeBuffer(res._instance.vbuffer);
                        res._instance.vbuffer = null;
                    }
                    if (res._instance.ibuffer) {
                        this._impl.FreeBuffer(res._instance.ibuffer);
                        res._instance.ibuffer = null;
                    }
                    if (res._instance.texture && res._instance.texture.tile) {
                        this._global.resources.Texture._ReleaseTile(res._instance.texture.tile);
                        res._instance.texture.tile = 0;
                        res._instance.texture = null;
                    }
                }
                res._instance = null;
            }
        }
    }
    _impl;
    _3mx;
    _root;
    _drawList;
    _subdivList;
    _drawCount;
    _subdivCount;
    _updateTS;
    _intervalGC;
    _drawBuffer;
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