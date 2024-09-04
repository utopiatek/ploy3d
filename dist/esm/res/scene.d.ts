import * as Miaoverse from "../mod.js";
/** 场景实例。 */
export declare class Scene extends Miaoverse.Resource<Scene> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Scene_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 内核实现。 */
    private _impl;
}
/** 场景内核实现。 */
export declare class Scene_kernel extends Miaoverse.Base_kernel<Scene, typeof Scene_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建场景实例。
     * @returns 返回场景实例。
     */
    Create(): Promise<Miaoverse.Scene>;
    /**
     * 基于相机视锥裁剪场景绘制对象。
     * @param camera 相机组件实例。
     * @param layerMask 3D对象层掩码。
     * @returns 返回绘制列表。
     */
    Culling(camera: Miaoverse.Camera, layerMask: number): {
        count: number;
        params: Uint32Array;
    };
    /**
     * 基于屏幕拾取射线与对象包围盒相交法拾取最近对象。
     * @param camera 相机组件实例。
     * @param point 屏幕坐标[0, 1]。
     * @param layerMask 3D对象层掩码。
     * @returns 返回拾取到的最近对象。
     */
    Raycast(camera: Miaoverse.Camera, point: number[], layerMask?: number): Miaoverse.Object3D;
    /**
     * 实例化预制件。
     * @param scene 实例化出的3D对象所属场景。
     * @param uri 预制件URI。
     * @param pkg 预制件所属资源包。
     * @param master 根源预制件。
     * @param listBeg 3D对象数组起始添加偏移。
     * @returns 返回预制件实例数据。
     */
    InstancePrefab(scene: Scene, uri: string, pkg?: Miaoverse.PackageReg, master?: Prefab, listBeg?: number): Promise<Miaoverse.Prefab>;
    /**
     * 实例化预制件中的节点源。
     * @param scene 实例化出的3D对象所属场景。
     * @param source 节点源索引。
     * @param listBeg 3D对象数组起始添加偏移。
     * @param nodes 节点定义数组。
     * @param instanceList 3D对象数组。
     * @returns 返回实例化出的3D对象数量。
     */
    protected InstanceNode(scene: Scene, source: number, listBeg: number, nodes: Asset_prefab["nodes"], instanceList: Miaoverse.Object3D[]): Promise<{
        instanceCount: number;
        root: Miaoverse.Object3D;
    }>;
    /**
     * 创建场景内核实例。
     * 同一预制件可重复实例化出多个场景，场景通过销毁方法销毁。
     * @returns 返回场景内核实例指针。
     */
    protected _Create: () => Miaoverse.io_ptr;
    /**
     * 销毁场景内核实例。
     * @param scene 场景内核实例指针。
     */
    protected _Destroy: (scene: Miaoverse.io_ptr) => void;
    /**
     * 基于相机视锥裁剪场景绘制对象。
     * @param camera 相机组件内核实例指针。
     * @param layerMask 3D对象层掩码。
     * @returns 返回绘制列表长度和指针。
     */
    protected _Culling: (camera: Miaoverse.io_ptr, layerMask: number) => [number, Miaoverse.io_ptr];
    /**
     * 基于屏幕拾取射线与对象包围盒相交法拾取最近对象。
     */
    protected _Raycast: (camera: Miaoverse.io_ptr, screenX: number, screenY: number, layerMask: number) => Miaoverse.io_ptr;
}
/** 场景内核实现的数据结构成员列表。 */
export declare const Scene_member_index: {
    readonly worldLLMC: Miaoverse.Kernel_member;
    readonly altitude: Miaoverse.Kernel_member;
    readonly unused1: Miaoverse.Kernel_member;
    readonly unused2: Miaoverse.Kernel_member;
    readonly unused3: Miaoverse.Kernel_member;
    readonly magic: Miaoverse.Kernel_member;
    readonly version: Miaoverse.Kernel_member;
    readonly byteSize: Miaoverse.Kernel_member;
    /**
     * 创建场景实例。
     * @returns 返回场景实例。
     */
    readonly refCount: Miaoverse.Kernel_member;
    readonly id: Miaoverse.Kernel_member;
    readonly uuid: Miaoverse.Kernel_member;
    readonly writeTS: Miaoverse.Kernel_member;
    readonly readTS: Miaoverse.Kernel_member;
    readonly last: Miaoverse.Kernel_member;
    readonly next: Miaoverse.Kernel_member;
};
/**
 * 预制件资源描述符。
 * 预制件是一组结构化、编排设计好的3D对象集合，用于快速重用该组3D对象。3D场景也是标准的预制件。
 * 预制件记录了一组3D对象的实例化方法以及它们的结构关系与渲染设置等。
 * 一个工程存储为一个资源包，一个场景存储为一个预制件，也可以在工程中编辑非场景型预制件（构建预制件和保存场景的操作方式类似）。
 * 3D世界可以在运行时动态装载卸载任意数量的场景，基于可见性查询来确认场景的可见性。
 * 预制件是一组设计确认好的3D对象，可以共享使用，因此预制件不应该被修改。
 * 我们不应删除已共享预制件中的某个对象，我们可以把它隐藏（不激活）。
 */
export interface Asset_prefab extends Miaoverse.Asset {
    /** 预制件构建体系（不同体系预制件实例化方法存在一些区别）。 */
    scheme?: "daz";
    /**
     * 预制件参考经纬度坐标（使用GCJ02坐标系）。
     */
    lnglat?: [number, number];
    /**
     * 预制件参考海拔高度。
     */
    altitude?: number;
    /**
     * 预制件实例化3D对象数量。
     * 实例化时需要自动创建一个根对象来包容预制件，因此该数量比所有批次实例化批次实例对象总和多1。
     * 该自动创建的根对象放置在当前实例数组末尾，不影响实例索引排序。
     */
    instanceCount: number;
    /**
     * 节点数组。
     * 节点用于实例化出3D对象，保存时会重新生成完整节点数组。
     * 预制件节点仅被当前预制件内部引用，此约束确保了可安全删除预制件。
     * 保存时遇到以下情况，会将3D对象（直属于当前预制件实例的非临时对象）作为一个实例化批次的节点源：
     *  1.父级为空；
     *  2.父级非直属于当前预制件实例；
     *  3.父级标识为运行时临时对象；
     * 作为节点源的节点、其父级节点字段置空。
     * 节点保存以先根顺序进行，遇到非直属于当前预制件实例的对象或临时对象则结束分支的深入遍历（记录中断对象后续遍历）。
     */
    nodes: {
        /**
         * 节点先根顺序排序索引。
         */
        index: number;
        /** 节点资源ID。 */
        id: string;
        /**
         * 节点实例ID（名称）。
         */
        name: string;
        /**
         * 节点层级深度。
         * 读盘时，因为节点资源不记录子级列表而是只记录父级。因此节点资源须按先根顺序排序，依次实例化，当遇到平级或更顶级节点时，结束实例化。
         */
        depth: number;
        /**
         * 父级节点索引（负数表示父级为空）。
         */
        parent: number;
    }[];
    /**
     * 实例化批次列表。
     */
    batches: {
        /**
         * 实例化源。
         * 节点源为数值类型，指向当前预制件中的一个节点，指定节点及其下级所有子节点均会被同时实例化。
         * 预制件源为URI类型，指向某一资源包中的某一预制件，即预制件可以嵌套。
         */
        source: number | string;
        /**
         * 起始实例索引。
         */
        instanceBeg: number;
        /**
         * 实例化对象数量。
         * 每个实例化对象都有一个相对于当前根源预制件实例的实例索引，组件使用该索引来查找实例对象。
         * 使用该数量来结束节点源的实例化过程，也可验证预制件源的正确性。
         */
        instanceCount: number;
    }[];
    /**
     * 3D对象实例变换组件数据。
     * 直属于当前预制件实例的非临时对象都会保存变换组件数据。
     * 非直属于当前预制件实例的对象，如果变换组件标记有持久化修改，则保存变换组件数据。
     */
    transforms: {
        /**
         * 当前变换组件数据所属实例对象的实例索引。
         */
        instance: number;
        /**
         * 对应直属预制件节点索引。
         */
        node: number;
        /**
         * 当前实例对象是否激活。
         */
        deactive?: boolean;
        /**
         * 对象层标识（用于过滤筛选对象，默认1）。
         */
        layers?: number;
        /**
         * 父级3D对象实例索引（默认-1）。
         * 无论如何我们都不能修改非直属于当前预制件实例的对象的父子结构。如果必须这么做，先将该预制件实例中的所有实例对象转换为直属于当前预制件实例。
         */
        parent?: number;
        /**
         * 直接应用到引擎的本地坐标（默认[0, 0, 0]）。
         */
        localPosition?: number[];
        /**
         * 应用到引擎的本地旋转（四元数，默认[0, 0, 0, 1]）。
         */
        localRotation?: number[];
        /**
         * 应用到引擎的本地缩放（默认[1, 1, 1]）。
         */
        localScale?: number[];
        /**
         * 应用到引擎的本地矩阵（优先采用）。
         */
        localMatrix?: number[];
        /**
         * 骨骼初始变换。
         */
        bone_init?: {
            /** 坐标系参考中心点（子空间的origin_point位于父空间的center_point）。 */
            center_point: number[];
            /** 是否累积父级的缩放（通常为真，具有父骨骼的骨骼除外。可单独缩放骨骼所影响顶点）。 */
            inherits_scale: number;
            /** 骨骼端点，位于骨骼的末端，连接到另一个骨骼或终止。 */
            end_point: number[];
            /** 当使用基于通道的动画数据时采用的旋转顺序（默认XYZ）。 */
            rotation_order: number;
            /** 旋转、缩放操作的参考轴向（orientation * (rotation | scale) * inv(orientation)）。 */
            orientation: number[];
        };
        /**
         * 骨骼控制参数。
         */
        bone_ctrl?: {
            /** 节点沿各轴平移。 */
            translation: number[];
            /** 是否累积父级的缩放（通常为真，具有父骨骼的骨骼除外。可单独缩放骨骼所影响顶点）。 */
            inherits_scale: number;
            /** 节点绕各轴旋转欧拉角。 */
            rotation: number[];
            /** 节点绕各轴旋转欧拉角旋转序。 */
            rotation_order: number;
            /** 节点沿各轴缩放。 */
            scale: number[];
            /** 节点整体缩放。 */
            general_scale: number;
        };
    }[];
    /**
     * 3D对象实例网格渲染器组件数据。
     */
    mesh_renderers: {
        /**
         * 当前变换组件数据所属实例对象的实例索引。
         */
        instance: number;
        /**
         * 对应直属预制件节点索引。
         */
        node: number;
        /**
         * 网格渲染器组件资源URI。
         */
        mesh_renderer: string;
        /** 网格骨骼蒙皮骨骼绑定实例索引列表。 */
        joints_binding?: number[];
    }[];
    /**
     * 动画组件数据。
     */
    animators?: {
        /**
         * 当前动画组件所属实例对象的实例索引。
         */
        instance: number;
        /**
         * 对应直属预制件节点索引。
         */
        node: number;
        /**
         * 动画数据URI（可以引用多个驱动目标数组兼容的动画数据）。
         */
        animations: string[];
        /**
         * 动画驱动目标实例索引列表。
         */
        targets_binding?: number[];
    }[];
}
/**
 * 预制件实例。
 */
export interface Prefab {
    /** 预制件UUID。 */
    uuid: string;
    /** 根源预制件实例（预制件可嵌套）。 */
    master?: Prefab;
    /** 当前预制件根对象（不是从预制件节点实例化出的，而是引擎自动创建用于容纳预制件的，预制件实例化3D对象数量包含了该实例）。 */
    root: Miaoverse.Object3D;
    /** 3D对象数组。 */
    instanceList: Miaoverse.Object3D[];
    /** 3D对象数组起始索引。 */
    instanceBeg: number;
    /** 直属于当前预制件的3D对象数量。 */
    instanceCount: number;
}
