import * as Miaoverse from "../mod.js";
/** 相机组件。 */
export declare class Camera extends Miaoverse.Resource<Camera> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: Camera_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 相机参数更新时间戳。 */
    get writeTS(): number;
    set writeTS(value: number);
    /** 相机参数应用时间戳。 */
    get readTS(): number;
    set readTS(value: number);
    /** 是否启用组件。 */
    get enabled(): boolean;
    set enabled(b: boolean);
    /** 相机类型（0-透视投影相机、1-正交投影相机）。 */
    get type(): number;
    /** 相机参数是否有更新。 */
    get updated(): number;
    set updated(value: number);
    /** 相机渲染排序。 */
    get depth(): number;
    set depth(value: number);
    /** 裁剪过滤，被标记的层不会被视锥裁剪。 */
    get cullingFilter(): number;
    set cullingFilter(value: number);
    /** 观察目标世界空间坐标。 */
    get target(): Float32Array;
    set target(value: ArrayLike<number>);
    /** 相机距观察目标距离。 */
    get distance(): number;
    set distance(value: number);
    /** 相机俯角。 */
    get pitch(): number;
    set pitch(value: number);
    /** 相机偏航角。 */
    get yaw(): number;
    set yaw(value: number);
    /** 相机翻滚角。 */
    get roll(): number;
    set roll(value: number);
    /** 垂直视角（弧度）。 */
    get fov(): number;
    set fov(value: number);
    /** 画布宽度。 */
    get width(): number;
    set width(value: number);
    /** 画布高度。 */
    get height(): number;
    set height(value: number);
    /** 近平面距离。 */
    get nearZ(): number;
    set nearZ(value: number);
    /** 远平面距离。 */
    get farZ(): number;
    set farZ(value: number);
    /** 相机组件内核实现。 */
    private _impl;
}
/** 相机组件（128字节）。 */
export declare class Camera_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建网格渲染器实例。
     * @param mesh 网格资源实例。
     * @param skeleton 骨架定义实例。
     * @returns 返回网格渲染器实例。
     */
    CreateCamera(): Promise<Miaoverse.Camera>;
    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    Get<T>(self: Miaoverse.io_ptr, key: Camera_kernel["_members_key"]): T;
    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    Set(self: Miaoverse.io_ptr, key: Camera_kernel["_members_key"], value: any): void;
    /** 实例化相机组件实例。 */
    protected InstanceCamera: () => Miaoverse.io_ptr;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: Camera[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Camera>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 待GC列表。 */
    protected _gcList: Camera[];
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly type: Miaoverse.Kernel_member;
        readonly updated: Miaoverse.Kernel_member;
        readonly depth: Miaoverse.Kernel_member;
        readonly cullingFilter: Miaoverse.Kernel_member;
        readonly target: Miaoverse.Kernel_member;
        readonly distance: Miaoverse.Kernel_member;
        readonly pitch: Miaoverse.Kernel_member;
        readonly yaw: Miaoverse.Kernel_member;
        readonly roll: Miaoverse.Kernel_member;
        readonly fov: Miaoverse.Kernel_member;
        readonly width: Miaoverse.Kernel_member;
        readonly height: Miaoverse.Kernel_member;
        readonly nearZ: Miaoverse.Kernel_member;
        readonly farZ: Miaoverse.Kernel_member;
        readonly enabled: Miaoverse.Kernel_member;
        readonly object: Miaoverse.Kernel_member;
        readonly lastSib: Miaoverse.Kernel_member;
        readonly nextSib: Miaoverse.Kernel_member;
        readonly magic: Miaoverse.Kernel_member;
        readonly version: Miaoverse.Kernel_member;
        readonly byteSize: Miaoverse.Kernel_member;
        readonly refCount: Miaoverse.Kernel_member;
        readonly id: Miaoverse.Kernel_member;
        readonly uuid: Miaoverse.Kernel_member;
        readonly writeTS: Miaoverse.Kernel_member;
        readonly readTS: Miaoverse.Kernel_member;
        readonly last: Miaoverse.Kernel_member;
        readonly next: Miaoverse.Kernel_member;
    };
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Camera_kernel["_members"];
}
