import * as Miaoverse from "../mod.js";
/** 3D对象实例。 */
export declare class Object3D extends Miaoverse.Resource<Object3D> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: Object_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 设置父级变换组件。
     * @param p 父级变换组件。
     * @param worldPositionStays 是否维持世界空间位置。
     */
    SetParent(parent: Object3D, worldPositionStays?: boolean): void;
    /** 遍历处理每个子对象。 */
    ForEachChild(proc: (index: number, obj: Object3D) => void): void;
    /** 实例ID。 */
    get id(): number;
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
    /** 父级变换组件。 */
    get parent(): Object3D;
    /** 第一个子级对象（子级链表头）。 */
    get firstChild(): Object3D;
    /** 父级空间旋转欧拉角（单位度）。 */
    get localEulerAngles(): Miaoverse.Vector3;
    set localEulerAngles(v: Miaoverse.Vector3);
    /** 本地旋转（父级空间）。 */
    get localRotation(): Miaoverse.Quaternion;
    set localRotation(value: Miaoverse.Quaternion);
    /** 世界空间坐标。 */
    get position(): Miaoverse.Vector3;
    set position(pos: Miaoverse.Vector3);
    /** 世界空间旋转欧拉角（单位度）。 */
    get eulerAngles(): Miaoverse.Vector3;
    set eulerAngles(v: Miaoverse.Vector3);
    /** 旋转（世界空间，缩放造成空间尺度变形，方向被扭曲，所以带缩放的变换矩阵变换方向无法得到等比例空间的方向）。 */
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
    /** 上一个兄弟变换组件指针。 */
    get lastSib(): Object3D;
    /** 下一个兄弟变换组件指针。 */
    get nextSib(): Object3D;
    /** 层次结构中最顶级对象变换组件。 */
    get root(): Object3D;
    /** 3D对象内核实现。 */
    private _impl;
}
/** 3D对象内核实现（512字节）。 */
export declare class Object_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 根据内核对象指针获取对象实例。
     * @param self 内核对象指针。
     * @returns 返回对象实例。
     */
    GetInstanceByPtr(ptr: Miaoverse.io_ptr): Miaoverse.Object3D;
    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    GetInstanceByID(id: number): Miaoverse.Object3D;
    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    Get<T>(self: Miaoverse.io_ptr, key: Object_kernel["_members_key"]): T;
    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    Set<T>(self: Miaoverse.io_ptr, key: Object_kernel["_members_key"], value: any): void;
    /**
     * 刷新3D对象实例状态。
     * @param self 实例指针。
     * @param ctrl 刷新控制方法（1-标记变换组件参数存在更新，2-标记对象参数存在更新，4-应用变化组件更新，8-应用对象整体更新）。
     * @returns 返回变换组件最新状态时间戳。
     */
    Flush: (self: Miaoverse.io_ptr, ctrl: number) => number;
    /** 变换组件更新。 */
    UpdateTransform: (self: Miaoverse.io_ptr) => number;
    /** 更新应用变换组件、渲染设置和G1。 */
    Update: (self: Miaoverse.io_ptr) => number;
    /** 设置世界空间坐标。 */
    SetPosition: (self: Miaoverse.io_ptr, vx: number, vy: number, vz: number) => void;
    /** 设置世界空间旋转四元数。 */
    SetRotation: (self: Miaoverse.io_ptr, qx: number, qy: number, qz: number, qw: number) => void;
    /** 设置父级对象。 */
    SetParent: (self: Miaoverse.io_ptr, parent: Miaoverse.io_ptr, staysWorld: Miaoverse.io_uint) => void;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: Miaoverse.Object3D[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Miaoverse.Object3D>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 3D对象内核实现的数据结构成员列表。 */
    protected _members: {
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
    /** 3D对象内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Object_kernel["_members"];
}
/** 场景节点资源（256字节）。 */
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
