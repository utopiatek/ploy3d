import { files, forEach } from "jszip";
import * as Miaoverse from "../mod.js"
import { blob } from "stream/consumers";

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
     * @param url 场景根文件路径。
     */
    public async Init(url: string) {
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

    /**
     * 更新绘制场景。
     * @returns
     */
    public Update() {
        const updateTS = this._global.env.frameTS;
        const elapsed = updateTS - this._updateTS;

        // 250毫秒刷新一次
        if (elapsed < 250) {
            return;
        }

        this._updateTS = updateTS;

        this.Flush();

        console.error("=== ", this._updateTS, this._subdivCount);
        if (this._subdivCount > 0) {
            this._subdiv = async () => {
                // 应优先细分低精度节点，提升显示速度
                const list = this._subdivList.slice(0, this._subdivCount).sort((a, b) => a._level - b._level);
                // 更新时间戳不一致时跳出处理
                const ts = this._updateTS;

                for (let node of list) {
                    if (node._process != Process_state.unexecuted) {
                        continue;
                    }

                    node._process = Process_state.executing;

                    try {
                        for (let i = 0; i < node.children.length; i++) {
                            const child_file = node.children[i];
                            const child_group = await this.Load_3mxb(node._master._path + child_file, node, i);

                            node._children[i] = child_group;
                        }

                        node._process = Process_state.completed;
                    }
                    catch (e) {
                        console.error(e);
                        node._process = Process_state.error;
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

    /**
     * 绘制场景。
     * @param passEncoder 渲染通道命令编码器。
     */
    public Draw(passEncoder: GPURenderPassEncoder) {
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

                    passEncoder.drawIndexed(
                        ibuffer.count,  // indexCount
                        1,              // instanceCount
                        0,              // firstIndex
                        0,              // baseVertex
                        0,              // firstInstance
                    );
                }
            }
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

        if (!group._ab) {
            const ab = await this._global.Fetch<ArrayBuffer>(group._path + group._file, null, "arrayBuffer");
            if (!ab) {
                group._res_loaded = Process_state.error;
                return;
            }
        }

        const env = this._global.env;
        const internal = this._global.internal;
        const Resources = this._global.resources;

        for (let res of group.resources) {
            if (false && res.type == "textureBuffer" && (res.format == "jpg" || res.format == "png")) {
                const blob = new Blob([group._ab.slice(group._ab_offset + res._offset, group._ab_offset + res._offset + res.size)]);
                const option: ImageBitmapOptions = undefined;
                const bitmap = await createImageBitmap(blob, option);
                const texture = await Resources.Texture["LoadTexture2D_RAW"](bitmap);

                //res._instance = texture;

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

                this._global.device.WriteBuffer(
                    ibuffer.buffer,     // 缓存实例ID
                    ibuffer.offset,     // 缓存写入偏移
                    env.buffer,         // 数据源
                    data_ptr << 2,      // 数据源偏移
                    ibuffer.size);      // 数据字节大小

                data_ptr += ibuffer.count;

                this._global.device.WriteBuffer(
                    vbuffer.buffer,     // 缓存实例ID
                    vbuffer.offset,     // 缓存写入偏移
                    env.buffer,         // 数据源
                    data_ptr << 2,      // 数据源偏移
                    12 * vbuffer.count);// 数据字节大小

                data_ptr += vbuffer.count * 6;

                this._global.device.WriteBuffer(
                    vbuffer.buffer,     // 缓存实例ID
                    vbuffer.offset + 12 * vbuffer.count,    // 缓存写入偏移
                    env.buffer,         // 数据源
                    data_ptr << 2,      // 数据源偏移
                    8 * vbuffer.count); // 数据字节大小

                internal.System_Delete(ctm_data_ptr);
                internal.System_Delete(mesh_data_raw[1]);

                res._instance = {
                    ibuffer: ibuffer,
                    vbuffer: vbuffer
                };

                console.log(res._instance);
            }
        }

        group._res_loaded = Process_state.completed;
    }

    /**
     * 刷新场景显示与细分。
     */
    private Flush() {
        this._showCount = 0;
        this._subdivCount = 0;

        const proc = (node: Node) => {
            const visible = this.Check(node);

            if (visible > Node_visible.hide) {
                node._activeTS = this._global.env.frameTS;

                // 可见，但需要隐藏并显示更精细层（节点已细分）
                if (visible == Node_visible.draw_children) {
                    this.For_children(node._children, proc);
                }
                // 可见并显示
                else {
                    this._showList[this._showCount++] = node;

                    // 加入细分任务队列（精度不合适，但尚未细分完成）
                    if (visible == Node_visible.draw_and_subdiv) {
                        // 应优先细分低精度节点，提升显示速度
                        this._subdivList[this._subdivCount++] = node;
                    }
                }
            }
        };

        this.For_children(this._root, proc);
    }

    /**
     * 确认节点绘制状态。
     * @param node 场景节点。
     * @returns 返回节点绘制状态。
     */
    private Check(node: Node): Node_visible {
        // 暂时隐藏L2以上节点
        if (node._level > 2) {
            return Node_visible.hide;
        }

        // 暂时以L2节点为最高精度显示
        if (node._level == 2) {
            return Node_visible.draw;
        }

        // 显示，开始加载下一级
        if (node._process == Process_state.unexecuted) {
            return Node_visible.draw_and_subdiv;
        }

        // 隐藏，显示下一级
        if (node._process == Process_state.completed) {
            return Node_visible.draw_children;
        }

        // 显示，正在加载下一级或者已失败
        return Node_visible.draw;
    }

    /**
     * 遍历所有子节点。
     * @param groups 场景分组列表。
     * @param fn 处理方法。
     */
    private For_children(groups: Group[], fn: (node: Node) => void) {
        for (let group of groups) {
            if (group) {
                for (let node of group.nodes) {
                    fn(node);
                }
            }
        }
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
    /** 绘制节点数组。 */
    private _showList: Node[];
    /** 细分节点数组。 */
    private _subdivList: Node[];
    /** 绘制节点数量。 */
    private _showCount: number;
    /** 细分节点数量。 */
    private _subdivCount: number;
    /** 场景更新时间戳。 */
    private _updateTS: number;
    /** 场景细分任务。 */
    private _subdiv: () => Promise<void>;
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
     * @param url 场景根文件路径。
     * @returns 异步返回倾斜摄影组件实例。
     */
    public async Create_3mx(url: string) {
        const id = this._instanceIdle;

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Dioramas_3mx(this, 0 as never, id);

        this._instanceCount++;

        await instance.Init(url);

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
            this._global.Track("Dioramas_kernel.FreeBuffer: 暂不支持顶点或索引数量大于65536的缓存！", 3);
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
    /** 节点激活时间戳。 */
    _activeTS: number;
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
