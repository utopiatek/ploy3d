import * as Miaoverse from "../mod.js";
export class Dioramas_3mx extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }
    async Init(scene, url, lnglat_alt) {
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
        this._material = await this._global.resources.Material.Load("1-1-1.miaokit.builtins:/material/32-2_standard_dior.json");
        this._meshRenderer = await this._global.resources.MeshRenderer.Create(null, null);
        this._object3d = await this._global.resources.Object.Create(scene);
        this._pipeline = this._global.context.CreateRenderPipeline({
            g1: this._meshRenderer.layoutID,
            g2: this._material.layoutID,
            g3: 0,
            flags: 0,
            topology: 3,
            frontFace: 0,
            cullMode: 2
        });
        if (lnglat_alt) {
            this._object3d.SetLngLat(lnglat_alt[0], lnglat_alt[1], lnglat_alt[2]);
        }
    }
    Update(camera) {
        const env = this._global.env;
        const updateTS = env.frameTS;
        const elapsed = updateTS - this._updateTS;
        if (elapsed < 250) {
            return;
        }
        this._updateTS = updateTS;
        env.AllocaCall(128, (checker) => {
            env.uscalarSet(checker, 0, 0);
            env.ptrSet(checker, 1, this._object3d.internalPtr);
            env.ptrSet(checker, 2, 0);
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
                const list = this._subdivList.slice(0, this._subdivCount).sort((a, b) => {
                    let w = b._level - a._level;
                    if (a._level < 3) {
                        return -w;
                    }
                    return;
                });
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
    Draw(queue) {
        this._meshRenderer.UpdateG1(this._object3d);
        const passEncoder = queue.passEncoder;
        queue.BindMeshRenderer(this._meshRenderer);
        queue.BindMaterial(this._material);
        queue.SetPipeline(this._pipeline, 0);
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
        const res_count = group.resources?.length || 0;
        const Resources = this._global.resources;
        if (res_count > 0) {
            const _group = {
                _path: group._path,
                _file: group._file,
                _ab: group._ab,
                _ab_offset: group._ab_offset,
                resources: [],
            };
            for (let res of group.resources) {
                _group.resources.push({
                    type: res.type,
                    format: res.format,
                    size: res.size,
                    _offset: res._offset,
                });
            }
            const __group = await this._global.worker.Load_3mxb_resource(1, _group, () => { });
            for (let i = 0; i < res_count; i++) {
                const res = group.resources[i];
                const _res = __group.resources[i];
                if (_res._bitmap) {
                    const tile = Resources.Texture._CreateTile(_res._bitmap.width, _res._bitmap.height, 0);
                    Resources.Texture._WriteTile(tile, _res._bitmap);
                    _res._bitmap.close();
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
                else if (_res._mesh_data) {
                    const uarray = new Uint32Array(_res._mesh_data);
                    const icount = uarray[1];
                    const vcount = uarray[2];
                    if (!icount || !vcount) {
                        console.error(res.size, icount, vcount);
                        continue;
                    }
                    const ibuffer = this._impl.GenBuffer(1, icount);
                    const vbuffer = this._impl.GenBuffer(0, vcount);
                    let data_ptr = 8 + 4;
                    this._global.device.WriteBuffer(ibuffer.buffer, ibuffer.offset, uarray.buffer, data_ptr << 2, 4 * ibuffer.count);
                    data_ptr += ibuffer.count;
                    this._global.device.WriteBuffer(vbuffer.buffer, vbuffer.offset, uarray.buffer, data_ptr << 2, 12 * vbuffer.count);
                    data_ptr += vbuffer.count * 6;
                    this._global.device.WriteBuffer(vbuffer.buffer, vbuffer.offset + 12 * vbuffer.count, uarray.buffer, data_ptr << 2, 8 * vbuffer.count);
                    res._instance = {
                        ibuffer: ibuffer,
                        vbuffer: vbuffer
                    };
                }
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
        if (node._level < 3 && true) {
            return;
        }
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
    _material;
    _meshRenderer;
    _object3d;
    _pipeline;
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
    async Create_3mx(scene, url, lnglat_alt) {
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Dioramas_3mx(this, 0, id);
        this._instanceCount++;
        await instance.Init(scene, url, lnglat_alt);
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