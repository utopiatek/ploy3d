import * as Miaoverse from "../mod.js";
/** 倾斜摄影组件（3MX）。 */
export declare class Dioramas_3mx extends Miaoverse.Resource<Dioramas_3mx> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: any, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 初始化倾斜摄影组件。
     * @param scene 模型所属场景实例。
     * @param url 场景根文件路径。
     * @param lnglat_alt 模型经纬度和海拔高度（请传入GCJ02坐标系（高德地图、腾讯地图）经纬度）。
     */
    Init(scene: Miaoverse.Scene, url: string, lnglat_alt?: number[]): Promise<void>;
    /**
     * 更新绘制场景。
     * @param object3d 3D对象实例（用于获得模型空间到世界空间变换矩阵）。
     * @param frameUniforms 着色器资源组G0实例（用户获得世界空间到全局空间变换矩阵）。
     * @param camera 相机组件实例（用于获取全局空间到相机空间变换矩阵）。
     */
    Update(object3d: Miaoverse.Object3D, frameUniforms: Miaoverse.FrameUniforms, camera: Miaoverse.Camera): void;
    /**
     * 绘制场景。
     * @param queue 绘制队列。
     * @param update 是否基于当前相机刷新模型显示。
     */
    Draw(queue: Miaoverse.DrawQueue, update: boolean): void;
    /**
     * 加载场景分组（3MXB文件）。
     * @param url 文件路径。
     * @param parent 父级节点。
     * @param index 场景分组索引（对应parent.children的顺序）。
     * @returns 返回场景分组。
     */
    private Load_3mxb;
    /**
     * 加载场景分组资源实例。
     * @param group 加载场景分组。
     * @returns
     */
    private Load_resource;
    /**
     * 刷新场景显示与细分。
     * @param frustumCheck 确认相机空间包围球在视锥中的显示大小。
     */
    private Flush;
    /**
     * 确认节点绘制状态。
     * @param node 场景节点。
     * @param frustumCheck 确认相机空间包围球在视锥中的显示大小。
     * @returns 返回节点绘制状态。
     */
    private Check;
    /**
     * 遍历所有子节点。
     * @param groups 场景分组列表。
     * @param fn 处理方法。
     */
    private For_children;
    /**
     * 进行动态资源回收。
     */
    private GC;
    /**
     * 释放节点所有子级资源。
     * @param node 场景节点。
     */
    private GC_free;
    /** 内核实现。 */
    private _impl;
    /** 3MX文件结构。 */
    private _3mx;
    /** 根分组列表。 */
    private _root;
    /** 绘制实例数组。 */
    private _drawList;
    /** 细分节点数组。 */
    private _subdivList;
    /** 绘制实例数量。 */
    private _drawCount;
    /** 细分节点数量。 */
    private _subdivCount;
    /** 场景更新时间戳。 */
    private _updateTS;
    /** 节点被隐藏时间超过该阈值时将被释放（毫秒）。 */
    private _intervalGC;
    /** 绘制实例缓存。 */
    private _drawBuffer;
    /** 材质资源实例。 */
    private _material;
    /** 网格渲染器组件实例（用于提供绘制所需的G1数据）。 */
    private _meshRenderer;
    /** 3D对象实例（用于定位模型位置）。 */
    private _object3d;
    /** 着色器管线实例ID。 */
    private _pipeline;
}
/** 倾斜摄影组件内核实现。 */
export declare class Dioramas_kernel extends Miaoverse.Base_kernel<Dioramas_3mx, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建倾斜摄影组件（3MX）。
     * @param scene 模型所属场景实例。
     * @param url 场景根文件路径。
     * @param lnglat_alt 模型经纬度和海拔高度（请传入GCJ02坐标系（高德地图、腾讯地图）经纬度）。
     * @returns 异步返回倾斜摄影组件实例。
     */
    Create_3mx(scene: Miaoverse.Scene, url: string, lnglat_alt?: number[]): Promise<Miaoverse.Dioramas_3mx>;
    /**
     * 分配GPU缓存节点。
     * @param type 缓存类型（0：顶点缓存，1：索引缓存）。
     * @param count 元素数量。
     * @returns 返回缓存节点。
     */
    GenBuffer(type: number, count: number): {
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
    };
    /**
     * 释放GPU缓存节点。
     * @param node 缓存节点。
     * @returns
     */
    FreeBuffer(node: ReturnType<Dioramas_kernel["GenBuffer"]>): void;
    /** GPU缓存管理。 */
    private _buffers;
}
