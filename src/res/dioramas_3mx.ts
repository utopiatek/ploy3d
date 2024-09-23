import * as Miaoverse from "../mod.js"

/** 倾斜摄影组件（3MX）。 */
export class Dioramas_3mx extends Miaoverse.Resource<Dioramas_3mx> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: any, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
    }

    /**
     * 初始化倾斜摄影组件。
     * @param scene 模型所属场景实例。
     * @param url 场景根文件路径。
     * @param lnglat_alt 模型经纬度和海拔高度（请传入GCJ02坐标系（高德地图、腾讯地图）经纬度）。
     */
    public async Init(scene: Miaoverse.Scene, url: string, lnglat_alt?: number[]) {
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

        this._material = await this._global.resources.Material.Load("1-1-1.miaokit.builtins:/material/32-2_standard_dior.json") as Miaoverse.Material;
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

    /**
     * 更新绘制场景。
     * @param camera 相机组件实例（用于获取全局空间到相机空间变换矩阵）。
     */
    public Update(camera: Miaoverse.Camera) {
        const env = this._global.env;
        const updateTS = env.frameTS;
        const elapsed = updateTS - this._updateTS;

        // 250毫秒刷新一次
        if (elapsed < 250) {
            return;
        }

        this._updateTS = updateTS;

        env.AllocaCall(128, (checker) => {
            env.uscalarSet(checker, 0, 0);
            env.ptrSet(checker, 1, this._object3d.internalPtr);
            env.ptrSet(checker, 2, 0 as never);
            env.ptrSet(checker, 3, camera.internalPtr);

            const frustumCheck = (bbMin: number[], bbMax: number[]) => {
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
                // 应优先细分低精度节点，提升显示速度
                const list = this._subdivList.slice(0, this._subdivCount).sort((a, b) => {
                    let w = b._level - a._level;

                    if (a._level < 3) {
                        return -w;
                    }

                    return
                });

                // 更新时间戳不一致时跳出处理
                const ts = this._updateTS;

                const proc = async (node: Node) => {
                    try {
                        if (node._process != Process_state.unexecuted) {
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
                            node._process = Process_state.executing;

                            for (let i = 0; i < node.children.length; i++) {
                                const child_file = node.children[i];
                                const child_group = await this.Load_3mxb(node._master._path + child_file, node, i);

                                node._children[i] = child_group;
                            }

                            node._process = Process_state.completed;
                        }
                    }
                    catch (e) {
                        node._process = Process_state.error;
                        console.error(e);
                    }
                };

                for (let i = 0; i < list.length; i += 8) {
                    const promises: Promise<void>[] = [];

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

    /**
     * 绘制场景。
     * @param queue 绘制队列。
     * @param update 是否基于当前相机刷新模型显示。
     */
    public Draw(queue: Miaoverse.DrawQueue) {
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

            passEncoder.drawIndexed(
                ibuffer.count,  // indexCount
                1,              // instanceCount
                0,              // firstIndex
                0,              // baseVertex
                0,              // firstInstance
            );
        }
    }

    /**
     * 加载场景分组（3MXB文件）。
     * @param url 文件路径。
     * @param parent 父级节点。
     * @param index 场景分组索引（对应parent.children的顺序）。
     * @returns 返回场景分组。
     */
    private async Load_3mxb(url: string, parent: Node, index: number) {
        const ab = await this._global.Fetch<ArrayBuffer>(url, null, "arrayBuffer");
        if (!ab) {
            return null;
        }

        const meta = new Uint32Array(ab, 0, 2);
        const magic = meta[0];

        if (magic == 0x42584D33) /*3MXB*/ {
            const headerSize = meta[1] >> 8;
            const group: Group = JSON.parse(this._global.env.textDecoder.decode(new Uint8Array(ab, 9, headerSize)));

            group._parent = parent;
            group._index = index;
            group._path = url.substring(0, (url.lastIndexOf("/") + 1));
            group._file = url.substring(url.lastIndexOf("/") + 1);

            group._ab = ab;
            group._ab_offset = 9 + headerSize;
            group._res_loaded = Process_state.unexecuted;

            // 资源数据偏移
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
                node._visible = Node_visible.hide;
                node._process = Process_state.unexecuted;
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

    /**
     * 加载场景分组资源实例。
     * @param group 加载场景分组。
     * @returns
     */
    private async Load_resource(group: Group) {
        if (group._res_loaded != Process_state.unexecuted) {
            return;
        }

        group._res_loaded = Process_state.executing;

        const res_count = group.resources?.length || 0;
        const Resources = this._global.resources;

        if (res_count > 0) {
            const _group: Parameters<Miaoverse.Miaoworker["Load_3mxb_resource"]>[1] = {
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

            // 使用子线程解析资源
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

                    this._global.device.WriteBuffer(
                        ibuffer.buffer,                         // 缓存实例ID
                        ibuffer.offset,                         // 缓存写入偏移
                        uarray.buffer,                          // 数据源
                        data_ptr << 2,                          // 数据源偏移
                        4 * ibuffer.count);                     // 数据字节大小

                    data_ptr += ibuffer.count;

                    this._global.device.WriteBuffer(
                        vbuffer.buffer,                         // 缓存实例ID
                        vbuffer.offset,                         // 缓存写入偏移
                        uarray.buffer,                          // 数据源
                        data_ptr << 2,                          // 数据源偏移
                        12 * vbuffer.count);                    // 数据字节大小

                    data_ptr += vbuffer.count * 6;

                    this._global.device.WriteBuffer(
                        vbuffer.buffer,                         // 缓存实例ID
                        vbuffer.offset + 12 * vbuffer.count,    // 缓存写入偏移
                        uarray.buffer,                          // 数据源
                        data_ptr << 2,                          // 数据源偏移
                        8 * vbuffer.count);                     // 数据字节大小

                    res._instance = {
                        ibuffer: ibuffer,
                        vbuffer: vbuffer
                    };
                }
            }
        }

        group._res_loaded = Process_state.completed;
        group._ab = null;
    }

    /**
     * 刷新场景显示与细分。
     * @param frustumCheck 确认相机空间包围球在视锥中的显示大小。
     */
    private Flush(frustumCheck: (bbMin: number[], bbMax: number[]) => number) {
        this._drawCount = 0;
        this._subdivCount = 0;

        const proc = (node: Node) => {
            const visible = this.Check(node, frustumCheck);

            if (visible > Node_visible.hide) {
                node._activeTS = this._global.env.frameTS;

                // 可见，但需要隐藏并显示更精细层（节点已细分）
                if (visible == Node_visible.draw_children) {
                    this.For_children(node._children, proc);
                }
                // 可见并显示
                else {
                    // 添加节点的所有网格为绘制实例
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

                    // 加入细分任务队列（精度不合适，但尚未细分完成）
                    if (visible == Node_visible.draw_and_subdiv) {
                        // 应优先细分低精度节点，提升显示速度
                        this._subdivList[this._subdivCount++] = node;
                    }
                }
            }
        };

        this.For_children(this._root, proc);

        // 填充绘制实例数据数组

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

            this._global.device.WriteBuffer(
                buffer.buffer,          // 缓存实例ID
                buffer.offset,          // 缓存写入偏移
                env.buffer,             // 数据源
                ptr << 2,               // 数据源偏移
                20 * this._drawCount);  // 数据字节大小
        }
    }

    /**
     * 确认节点绘制状态。
     * @param node 场景节点。
     * @param frustumCheck 确认相机空间包围球在视锥中的显示大小。
     * @returns 返回节点绘制状态。
     */
    private Check(node: Node, frustumCheck: (bbMin: number[], bbMax: number[]) => number): Node_visible {
        // 节点绘制像素大小
        const drawSize = frustumCheck(node.bbMin, node.bbMax);

        // 节点不可见
        if (drawSize < 1) {
            //console.log("hide: ", drawSize, node.maxScreenDiameter);

            return Node_visible.hide;
        }

        // 节点显示精度足够，绘制节点
        if (drawSize < (node.maxScreenDiameter * 1.0)) {
            return Node_visible.draw;
        }

        // 节点精度不够，隐藏节点，绘制下级节点
        if (node._process == Process_state.completed && !node._released) {
            return Node_visible.draw_children;
        }

        //console.log("next: ", node._process, drawSize, node.maxScreenDiameter);

        // 节点精度不够，但下级节点未加载，绘制节点，开始加载下级节点
        if (node._process == Process_state.unexecuted || node._released) {
            return Node_visible.draw_and_subdiv;
        }

        // 正在加载下级节点或者加载已失败或已释放，绘制当前节点
        return Node_visible.draw;
    }

    /**
     * 遍历所有子节点。
     * @param groups 场景分组列表。
     * @param fn 处理方法。
     */
    private For_children(groups: Group[], fn: (node: Node) => void) {
        for (let group of groups) {
            // 已释放节点不遍历其子级
            if (group && !(group._parent?._released)) {
                for (let node of group.nodes) {
                    fn(node);
                }
            }
        }
    }

    /**
     * 进行动态资源回收。
     */
    private GC() {
        const frameTS = this._global.env.frameTS;

        const gc_proc = (node: Node) => {
            // 仅释放资源，保留已构建的场景树型结构
            if ((frameTS - node._activeTS) > this._intervalGC) {
                this.GC_free(node);
            }
            // 确认该节点子级的回收
            else {
                this.For_children(node._children, gc_proc);
            }
        };

        this.For_children(this._root, gc_proc);
    }

    /**
     * 释放节点所有子级资源。
     * @param node 场景节点。
     */
    private GC_free(node: Node) {
        // Node._released
        // Group._res_loaded
        // Group._ab
        // Resource._instance

        // 后根遍历释放
        this.For_children(node._children, (child) => {
            this.GC_free(child);
        });

        // TODO: 不GC较低层节点
        if (node._level < 3 && true) {
            return;
        }

        node._released = true;

        // 仅释放资源，保留已构建的场景树型结构
        for (let child_group of node._children) {
            child_group._res_loaded = Process_state.unexecuted;
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
                        res._instance.texture.tile = 0 as never;
                        res._instance.texture = null;
                    }
                }

                res._instance = null;
            }
        }
    }

    /** 3D对象实例（用于定位模型位置）。 */
    public get object3d() {
        return this._object3d;
    }

    /** 内核实现。 */
    private _impl: Dioramas_kernel;
    /** 3MX文件结构。 */
    private _3mx: {
        /** 文件版本（浮点型）。 */
        "3mxVersion": number;
        /** 场景名称。 */
        name: string;
        /** 场景描述（可以包含HTML标签，不能包含换行符）。 */
        description: string;
        /** 场景LOGO（JPG或PNG图片相对路径）。 */
        logo: string;
        /** 场景显示选项（第三方应用使用的字段）。 */
        sceneOptions: any[];
        /** 图形图层列表。 */
        layers: {
            /** 图层ID。 */
            id: string;
            /** 图层类型（当前仅支持"meshPyramid"）。 */
            type: "meshPyramid";
            /** 图层名称。 */
            name: string;
            /** 图层描述。 */
            description: string;
            /** The spatial reference system (utf-8 string). Only needed for georeferenced data. See also About Spatial reference systems. */
            SRS: string;
            /** The model origin, in the specified SRS (array of float32). A point’s correct coordinates in the specified SRS are P = Pmesh + SRSOrigin. Optional. */
            SRSOrigin: number[];
            /** 根3MXB文件（相对路径）。 */
            root: string;
        }[];

        /** 3MX文件文件夹路径。 */
        _path: string;
    };

    /** 根分组列表。 */
    private _root: Group[];
    /** 绘制实例数组。 */
    private _drawList: Resource["_instance"][];
    /** 细分节点数组。 */
    private _subdivList: Node[];
    /** 绘制实例数量。 */
    private _drawCount: number;
    /** 细分节点数量。 */
    private _subdivCount: number;
    /** 场景更新时间戳。 */
    private _updateTS: number;
    /** 节点被隐藏时间超过该阈值时将被释放（毫秒）。 */
    private _intervalGC: number;
    /** 绘制实例缓存。 */
    private _drawBuffer: {
        /** 绘制实例容量（1024的倍数）。 */
        capacity: number;
        /** 内存地址指针。 */
        ptr: Miaoverse.io_ptr;
        /** 实例缓存节点。 */
        buffer: ReturnType<Dioramas_kernel["GenBuffer"]>;
    };

    /** 材质资源实例。 */
    private _material: Miaoverse.Material;
    /** 网格渲染器组件实例（用于提供绘制所需的G1数据）。 */
    private _meshRenderer: Miaoverse.MeshRenderer;
    /** 3D对象实例（用于定位模型位置）。 */
    private _object3d: Miaoverse.Object3D;
    /** 着色器管线实例ID。 */
    private _pipeline: number;
}

/** 倾斜摄影组件内核实现。 */
export class Dioramas_kernel extends Miaoverse.Base_kernel<Dioramas_3mx, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
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

    /**
     * 创建倾斜摄影组件（3MX）。
     * @param scene 模型所属场景实例。
     * @param url 场景根文件路径。
     * @param lnglat_alt 模型经纬度和海拔高度（请传入GCJ02坐标系（高德地图、腾讯地图）经纬度）。
     * @returns 异步返回倾斜摄影组件实例。
     */
    public async Create_3mx(scene: Miaoverse.Scene, url: string, lnglat_alt?: number[]) {
        const id = this._instanceIdle;

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Dioramas_3mx(this, 0 as never, id);

        this._instanceCount++;

        await instance.Init(scene, url, lnglat_alt);

        // 注册垃圾回收 ===============-----------------------

        return instance;
    }

    /**
     * 分配GPU缓存节点。
     * @param type 缓存类型（0：顶点缓存，1：索引缓存）。
     * @param count 元素数量。
     * @returns 返回缓存节点。
     */
    public GenBuffer(type: number, count: number) {
        if (count > 65536) {
            const need_rows = ((count + 1023) >> 10);
            const size_per_item = type == 0 ? 20 : 4
            const classid = type == 0 ? Miaoverse.CLASSID.GPU_VERTEX_BUFFER : Miaoverse.CLASSID.GPU_INDEX_BUFFER;

            const node: typeof idle.list[0] = {
                type: type,
                rows: need_rows,
                count: count,
                buffer: 0,
                offset: 0,
                size: 1024 * need_rows * size_per_item,
            };

            node.buffer = this._global.device.CreateBuffer(classid, node.size);

            return node;
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

            const classid = type == 0 ? Miaoverse.CLASSID.GPU_VERTEX_BUFFER : Miaoverse.CLASSID.GPU_INDEX_BUFFER;

            buffer.id = this._global.device.CreateBuffer(classid, buffer.size);

            buffers.buffers.push(buffer);
        }

        const node: typeof idle.list[0] = {
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

    /**
     * 释放GPU缓存节点。
     * @param node 缓存节点。
     * @returns 
     */
    public FreeBuffer(node: ReturnType<Dioramas_kernel["GenBuffer"]>) {
        if (node.count > 65536) {
            this._global.device.FreeBuffer(node.buffer);
            node.buffer = 0;
            return;
        }

        const idle = this._buffers[node.type].idles[node.rows];

        idle.list[idle.count++] = node;
    }

    /** GPU缓存管理。 */
    private _buffers: {
        /** GPU缓存数组。 */
        buffers: {
            /** GPU缓存ID。 */
            id: number;
            /** GPU缓存大小（每1024个元素一行，可包含1024行，共可容纳1MB个元素）。 */
            size: number;
            /** 每元素字节大小（顶点20字节，索引4字节）。 */
            size_per_item: number;
            /** 已分配行数（共计可分配1024行）。 */
            used_rows: number;
        }[];
        /** 各级别空闲缓存节点（以行数表示级别）。 */
        idles: {
            /** 空闲节点列表。 */
            list: {
                /** 缓存类型（0：顶点缓存，1：索引缓存）。 */
                type: number;
                /** 节点级别[1, 64]。 */
                rows: number;
                /** 实际元素数量。 */
                count: number;
                /** GPU缓存ID。 */
                buffer: number;
                /** 数据在缓存中的字节偏移。 */
                offset: number;
                /** 数据字节大小。 */
                size: number;
            }[];
            /** 空闲节点数量。 */
            count: number;
        }[];
    }[];
}

/** 场景节点。 */
interface Node {
    /** 节点ID。它在分组（3MXB文件）中是唯一的，但在整个树结构中不是唯一的。 */
    id: string;
    /** 节点边界框的最小角点。 */
    bbMin: number[];
    /** 节点边界框的最大角点。 */
    bbMax: number[];
    /** 节点应可见的最大直径（以像素为单位）。如果在屏幕上显示直径大于此大小，节点就应该被其子节点替换（如果有）。 */
    maxScreenDiameter: number;
    /** 节点的子分组文件列表（相对路径）。 */
    children: string[];
    /** 节点的几何图形列表。ID指向_group.resources中的网格资源。*/
    resources: string[];

    /** 节点所属场景分组（3MXB文件）。 */
    _master: Group;
    /** 节点的子分组列表。 */
    _children: Group[];
    /** 节点的几何图形索引列表。索引指向_group.resources中的网格资源。*/
    _resources: number[];
    /** 节点所在树型层级。 */
    _level: number;
    /** 节点绘制状态。 */
    _visible: Node_visible;
    /** 节点细分处理状态。 */
    _process: Process_state;
    /** 节点激活帧时间戳。 */
    _activeTS: number;
    /** 已释放节点资源（在动态资源回收时，我们保留已装载场景结构，释放子分组资源）。 */
    _released?: boolean;
    /** 正在重新加载资源。 */
    _reloading?: boolean;
}

/** 场景资源。 */
interface Resource {
    /** 资源ID。它在分组（3MXB文件）中是唯一的，但在整个树结构中不是唯一的。 */
    id: string;
    /** 资源类型。 */
    type: "textureBuffer" | "geometryBuffer" | "textureFile" | "geometryFile";
    /** 资源格式。 */
    format: "jpg" | "png" | "ctm" | "obj";
    /** 资源大小（仅"textureBuffer" | "geometryBuffer"类型的资源包含此字段）。 */
    size?: number;
    /** 资源文件路径（仅"textureFile" | "geometryFile"类型的资源包含此字段）。 */
    file?: string;
    /** 网格资源引用贴图资源ID（仅"geometryBuffer" | "geometryFile"类型的资源包含此字段）。 */
    texture?: string;
    /** 网格资源边界框的最小角点（仅"geometryBuffer" | "geometryFile"类型的资源包含此字段）。 */
    bbMin: number[];
    /** 网格资源边界框的最大角点（仅"geometryBuffer" | "geometryFile"类型的资源包含此字段）。 */
    bbMax: number[];

    /** 资源数据偏移。 */
    _offset: number;
    /** 网格资源引用贴图资源索引（仅"geometryBuffer" | "geometryFile"类型的资源包含此字段）。 */
    _texture?: number;
    /** 资源实例。 */
    _instance?: {
        /** 顶点缓存节点。 */
        vbuffer?: ReturnType<Dioramas_kernel["GenBuffer"]>;
        /** 索引缓存节点。 */
        ibuffer?: ReturnType<Dioramas_kernel["GenBuffer"]>;
        /** 贴图图块实例。 */
        texture?: {
            /** 贴图图块内部实例指针。 */
            tile: Miaoverse.io_ptr;
            /** 图块所在图集图层。 */
            layer: number;
            /** 图块所在图层区域(uoffset, voffset, uscale, vscale)。 */
            rect: number[];
        };
        /** 绘制实例索引。 */
        drawIndex?: number;
        /** 绘制实例使用的贴图图块实例。 */
        useTexture?: Resource["_instance"]["texture"];
    };
}

/** 场景分组（3MXB文件，包含一组资源和一组节点）。 */
interface Group {
    /** 3MXB文件版本。 */
    version: number;
    /** 节点列表。 */
    nodes: Node[];
    /** 资源列表。 */
    resources: Resource[];

    /** 场景分组所属场景节点（1个场景节点可能包含多个用于细分的场景分组，每个分组用1个.3mxb文件存储）。 */
    _parent: Node;
    /** 场景分组索引（对应Node.children的顺序）。 */
    _index: number;
    /** 3MXB文件文件夹路径。 */
    _path: string;
    /** 3MXB文件名。 */
    _file: string;

    /** 资源数据缓存。 */
    _ab?: ArrayBuffer;
    /** 资源数据缓存偏移。 */
    _ab_offset: number;
    /** 是否已装载资源实例。 */
    _res_loaded: Process_state;
}

/** 节点绘制状态。 */
const enum Node_visible {
    /** 隐藏节点。 */
    hide = 0,
    /** 绘制节点（精度合适）。 */
    draw,
    /** 绘制节点，并且需要细分节点以绘制更高精度的子级节点。 */
    draw_and_subdiv,
    /** 绘制更高精度的子级节点（当前节点已细分）。 */
    draw_children,
}

/** 处理状态。 */
const enum Process_state {
    /** 未执行的。 */
    unexecuted = 0,
    /** 执行中。 */
    executing,
    /** 已执行完成。 */
    completed,
    /** 已执行失败。 */
    error,
}
