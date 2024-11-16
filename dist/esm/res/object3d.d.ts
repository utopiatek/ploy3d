import * as Miaoverse from "../mod.js";
/** 3D对象实例。 */
export declare class Object3D extends Miaoverse.Resource<Object3D> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Object_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 设置父级对象实例。
     * @param parent 父级对象实例。
     * @param worldPositionStays 是否保持世界空间位置。
     */
    SetParent(parent: Object3D, worldPositionStays?: boolean): void;
    /**
     * 遍历处理每个子对象。
     */
    ForEachChild(proc: (index: number, obj: Object3D) => void): void;
    /**
     * 设置根对象变换参考的经纬度和海拔高度。
     * 请传入GCJ02坐标系（高德地图、腾讯地图）经纬度。
     * 经纬度拾取器：https://lbs.qq.com/getPoint/
     * @param lng 经度。
     * @param lat 纬度。
     * @param altitude 海拔高度。
     */
    SetLngLat(lng: number, lat: number, altitude: number): void;
    /**
     * 销毁对象。
     */
    Destroy(): void;
    /** 变换组件更新时间戳。 */
    get writeTS(): number;
    /** 变换组件应用时间戳。 */
    get readTS(): number;
    /** 对象名称。 */
    get name(): string;
    set name(name: string);
    /** 对象激活状态。 */
    get active(): boolean;
    set active(b: boolean);
    /** 对象自定义层标记。 */
    get layers(): number;
    set layers(value: number);
    /** 对象高亮状态。 */
    get highlight(): boolean;
    set highlight(b: boolean);
    /** 对象坐标不跟随世界空间原点变化。 */
    get staticWorld(): boolean;
    set staticWorld(b: boolean);
    /** 本地坐标（父级空间）。 */
    get localPosition(): Miaoverse.Vector3;
    set localPosition(value: Miaoverse.Vector3);
    /** 本地缩放（父级空间）。 */
    get localScale(): Miaoverse.Vector3;
    set localScale(value: Miaoverse.Vector3);
    /** 父级对象实例。 */
    get parent(): Object3D;
    /** 第一个子级对象（子级链表头）。 */
    get firstChild(): Object3D;
    /** 父级空间旋转欧拉角（单位度）。 */
    get localEulerAngles(): Miaoverse.Vector3;
    set localEulerAngles(v: Miaoverse.Vector3);
    /** 本地旋转（父级空间）。 */
    get localRotation(): Miaoverse.Quaternion;
    set localRotation(value: Miaoverse.Quaternion);
    /** 本地矩阵（模型空间到父级空间）。 */
    set localMatrix(value: Miaoverse.Matrix4x4);
    /** 世界空间坐标。 */
    get position(): Miaoverse.Vector3;
    set position(pos: Miaoverse.Vector3);
    /** 世界空间旋转欧拉角（单位度）。 */
    get eulerAngles(): Miaoverse.Vector3;
    set eulerAngles(v: Miaoverse.Vector3);
    /** 旋转（世界空间。缩放造成空间尺度变形，方向被扭曲，所以带缩放的变换矩阵变换方向无法得到等比例空间的方向）。 */
    get rotation(): Miaoverse.Quaternion;
    set rotation(q: Miaoverse.Quaternion);
    /** 对象空间到世界空间变换矩阵。 */
    get wfmMat(): Miaoverse.Matrix4x4;
    /** 世界空间到对象空间变换矩阵。 */
    get mfwMat(): Miaoverse.Matrix4x4;
    /** 世界空间右向量。 */
    get right(): Miaoverse.Vector3;
    /** 世界空间上向量。 */
    get up(): Miaoverse.Vector3;
    /** 世界空间前向量。 */
    get forward(): Miaoverse.Vector3;
    /** 父级变换组件应用时间戳。 */
    get parentTS(): number;
    /** 子级数量。 */
    get childCount(): number;
    /** 上一个兄弟实例。 */
    get lastSib(): Object3D;
    /** 下一个兄弟实例。 */
    get nextSib(): Object3D;
    /** 层次结构中最顶级实例。 */
    get root(): Object3D;
    /** 网格渲染器组件。 */
    set meshRenderer(component: Miaoverse.MeshRenderer);
    get meshRenderer(): Miaoverse.MeshRenderer;
    /** 动画组件。 */
    set animator(component: Miaoverse.Animator);
    /** 对象所属预制件（非空且根源预制件标记了保存位，保存时对象才会被保存。否则视对象为运行时临时创建）。 */
    get prefab(): Miaoverse.Prefab;
    /** 内核实现。 */
    private _impl;
    /** 对象名称。 */
    private _name;
    /** 对象所属预制件（非空且根源预制件标记了保存位，保存时对象才会被保存。否则视对象为运行时临时创建）。 */
    private _prefab?;
}
/** 3D对象内核实现。 */
export declare class Object_kernel extends Miaoverse.Base_kernel<Object3D, typeof Object_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建3D对象实例。
     * @param scene 对象所属场景。
     * @param name 对象名称。
     * @param prefab  对象所属预制件（非空且根源预制件标记了保存位，保存时对象才会被保存。否则视对象为运行时临时创建）。
     * @returns 返回3D对象实例。
     */
    Create(scene: Miaoverse.Scene, name?: string, prefab?: Miaoverse.Prefab): Promise<Miaoverse.Object3D>;
    /**
     * 移除3D对象实例。
     * @param id 3D对象实例ID。
     */
    protected Remove(id: number): void;
    /**
     * 清除所有。
     */
    protected DisposeAll(): void;
    /**
     * 获取指定对象列表的世界空间包围盒信息。
     * @param objects 对象列表。
     * @param traverse 是否遍历每个对象的树型结构。
     * @returns
     */
    GetBounding(objects: Object3D[], traverse: boolean): {
        center: number[];
        extents: number[];
        radius: number;
    };
    /**
     * 实例化3D对象内核实例。
     * @param scene 场景内核实例指针。
     * @param node 3D对象节点数据指针。
     * @returns 返回3D对象内核实例指针。
     */
    protected _Instance: (scene: Miaoverse.io_ptr, node: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /**
     * 销毁3D对象内核实例。
     * @param object3d 3D对象内核实例指针。
     */
    protected _Destroy: (object3d: Miaoverse.io_ptr) => void;
    /**
     * 刷新3D对象内核实例状态。
     * @param object3d 3D对象内核实例指针。
     * @param ctrl 刷新方法（1-标记变换组件参数更新，2-标记3D对象参数更新，4-应用变换组件参数更新，8-应用3D对象整体更新）。
     * @returns 返回变换组件最新状态时间戳。
     */
    protected _Flush: (object3d: Miaoverse.io_ptr, ctrl: number) => number;
    /**
     * 获取对象在世界空间包围盒。
     * @param object3d 3D对象实例指针。
     * @param withChildren 是否将子级纳入范围计算。
     */
    protected _GetAABB: (object3d: Miaoverse.io_ptr, withChildren: number) => number[];
    /**
     * 计算模型空间到指定相机空间变换矩阵。
     * @param object3d 3D对象实例指针（用于获得模型空间到世界空间变换矩阵）。
     * @param frameUniforms 着色器资源组G0指针（用于获得世界空间到全局空间变换矩阵，可为空）。
     * @param camera 相机组件指针（用于获取全局空间到相机空间变换矩阵）。
     * @returns 返回模型到相机空间变换矩阵数据。
     */
    protected _vfmMat: (object3d: Miaoverse.io_ptr, frameUniforms: Miaoverse.io_ptr, camera: Miaoverse.io_ptr) => number;
    /**
     * 设置本地变换矩阵（模型->父级）。
     * @param object3d 3D对象内核实例指针。
     */
    protected _SetLocalMatrix: (object3d: Miaoverse.io_ptr, localMat: Miaoverse.io_ptr) => void;
    /**
     * 设置世界空间坐标。
     * @param object3d 3D对象内核实例指针。
     */
    protected _SetPosition: (object3d: Miaoverse.io_ptr, vx: number, vy: number, vz: number) => void;
    /**
     * 设置世界空间旋转四元数。
     * @param object3d 3D对象内核实例指针。
     */
    protected _SetRotation: (object3d: Miaoverse.io_ptr, qx: number, qy: number, qz: number, qw: number) => void;
    /**
     * 设置父级3D对象。
     * @param object3d 3D对象内核实例指针。
     * @param parent 父级3D对象内核实例指针。
     * @param staysWorld 是否维持世界空间坐标。
     */
    protected _SetParent: (object3d: Miaoverse.io_ptr, parent: Miaoverse.io_ptr, staysWorld: Miaoverse.io_uint) => void;
    /**
     * 设置网格渲染器组件。
     * @param object3d 3D对象内核实例指针。
     * @param meshRenderer 网格渲染器组件内核实例指针。
     */
    protected _SetMeshRenderer: (object3d: Miaoverse.io_ptr, meshRenderer: Miaoverse.io_ptr) => void;
    /**
     * 获取网格渲染器组件。
     * @param object3d 3D对象内核实例指针。
     * @returns 返回网格渲染器组件ID。
     */
    protected _GetMeshRenderer: (object3d: Miaoverse.io_ptr) => number;
    /**
     * 设置动画组件。
     * @param object3d 3D对象内核实例指针。
     * @param animator 动画组件实例ID。
     */
    protected _SetAnimator: (object3d: Miaoverse.io_ptr, animator: number) => void;
    /**
     * 在绘制过程中调用绘制对象。
     * @param object3d 3D对象内核实例指针。
     */
    protected _Draw: (object3d: Miaoverse.io_ptr) => void;
}
/** 场景节点内核实现的数据结构成员列表。 */
export declare const Node_member_index: {
    readonly index: Miaoverse.Kernel_member;
    readonly enabled: Miaoverse.Kernel_member;
    readonly layers: Miaoverse.Kernel_member;
    readonly flags: Miaoverse.Kernel_member;
    readonly worldLLMC: Miaoverse.Kernel_member;
    readonly localPosition: Miaoverse.Kernel_member;
    readonly altitude: Miaoverse.Kernel_member;
    readonly localScale: Miaoverse.Kernel_member;
    readonly parent: Miaoverse.Kernel_member;
    readonly localRotation: Miaoverse.Kernel_member;
    readonly meshRenderer: Miaoverse.Kernel_member;
    readonly camera: Miaoverse.Kernel_member;
    readonly light: Miaoverse.Kernel_member;
    readonly animator: Miaoverse.Kernel_member;
    readonly prefab: Miaoverse.Kernel_member;
    readonly depth: Miaoverse.Kernel_member;
    readonly unused2: Miaoverse.Kernel_member;
    readonly unused3: Miaoverse.Kernel_member;
    readonly name: Miaoverse.Kernel_member;
    readonly reserved: Miaoverse.Kernel_member;
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
/** 3D对象内核实现的数据结构成员列表。 */
export declare const Object_member_index: {
    readonly source: Miaoverse.Kernel_member;
    readonly instance: Miaoverse.Kernel_member;
    readonly parentTS: Miaoverse.Kernel_member;
    readonly gisTS: Miaoverse.Kernel_member;
    readonly childCount: Miaoverse.Kernel_member;
    readonly updated: Miaoverse.Kernel_member;
    readonly nextEdit: Miaoverse.Kernel_member;
    readonly nextDraw: Miaoverse.Kernel_member;
    readonly scene: Miaoverse.Kernel_member;
    readonly children: Miaoverse.Kernel_member;
    readonly lastSib: Miaoverse.Kernel_member;
    readonly nextSib: Miaoverse.Kernel_member;
    readonly worldRotation: Miaoverse.Kernel_member;
    readonly reserved2: Miaoverse.Kernel_member;
    readonly wfmMat: Miaoverse.Kernel_member;
    readonly mfwMat: Miaoverse.Kernel_member;
    readonly index: Miaoverse.Kernel_member;
    readonly enabled: Miaoverse.Kernel_member;
    readonly layers: Miaoverse.Kernel_member;
    readonly flags: Miaoverse.Kernel_member;
    readonly worldLLMC: Miaoverse.Kernel_member;
    readonly localPosition: Miaoverse.Kernel_member;
    readonly altitude: Miaoverse.Kernel_member;
    readonly localScale: Miaoverse.Kernel_member;
    readonly parent: Miaoverse.Kernel_member;
    readonly localRotation: Miaoverse.Kernel_member;
    readonly meshRenderer: Miaoverse.Kernel_member;
    readonly camera: Miaoverse.Kernel_member;
    readonly light: Miaoverse.Kernel_member;
    readonly animator: Miaoverse.Kernel_member;
    readonly prefab: Miaoverse.Kernel_member;
    readonly depth: Miaoverse.Kernel_member;
    readonly unused2: Miaoverse.Kernel_member;
    readonly unused3: Miaoverse.Kernel_member;
    readonly name: Miaoverse.Kernel_member;
    readonly reserved: Miaoverse.Kernel_member;
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
/** 3D对象层标识（用于过滤筛选对象，默认1）。 */
export declare const enum LAYER_FLAGS {
    /** 普通节点。 */
    DEFAULT = 1,
    /** 骨骼节点。 */
    BONE = 2,
    /** 角色根节点。 */
    FIGURE = 4,
    /** 相机节点（包含相机组件）。 */
    CAMERA = 8,
    /** 灯光节点（包含光源组件）。 */
    LIGHT = 16,
    /** 预制件实例化源节点。 */
    PREFAB = 32,
    /** GIS对象。 */
    GIS = 64
}
