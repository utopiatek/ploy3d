import * as Miaoverse from "../mod.js"

/** 计算内核基类。 */
export class ComputeKernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param material 计算材质。
     * @param entryPoint 入口函数名称。
     * @param workgroup_size 工作组划分。
     */
    public constructor(_global: Miaoverse.Ploy3D, material: Miaoverse.Material, entryPoint: string, workgroup_size: number[]) {
        this._global = _global;
        this._enabled = true;
        this._material = material;
        this._material.AddRef();
        this._entryPoint = entryPoint;
        this._sizeX = workgroup_size[0] || 1;
        this._sizeY = workgroup_size[1] || 1;
        this._sizeZ = workgroup_size[2] || 1;
        this._buffers = [];
    }

    /**
     * 派遣计算任务。
     */
    public async Dispatch(awaitDone?: boolean) {
        const device = this._global.device;
        const context = this._global.context;

        if (!this._bundle) {
            const g3_entries: GPUBindGroupEntry[] = [];

            for (let i = 0; i < this._buffers.length; i++) {
                const buffer = device.GetBuffer(this._buffers[i]).buffer;

                g3_entries.push({ binding: i, resource: { buffer } });
            }

            const g0 = context["_blankGroup"].binding;
            const g1 = context["_blankGroup"].binding;
            const g3 = context.CreateBindGroupCustom(this._material, g3_entries).binding;
            const pipelineID = context.CreateComputePipeline(this._material.layoutID);
            const pipeline = context.GetComputePipeline(pipelineID, this._entryPoint);

            this._bundle = {
                g0,
                g1,
                g3,
                pipeline
            };
        }

        const cmdEncoder = device.device.createCommandEncoder();
        const passEncoder = cmdEncoder.beginComputePass();

        this._material.Bind(passEncoder);

        passEncoder.setBindGroup(0, this._bundle.g0);
        passEncoder.setBindGroup(1, this._bundle.g1);
        passEncoder.setBindGroup(3, this._bundle.g3);
        passEncoder.setPipeline(this._bundle.pipeline);

        passEncoder.dispatchWorkgroups(this.sizeX, this.sizeY, this.sizeZ);
        passEncoder.end();

        device.device.queue.submit([cmdEncoder.finish()]);

        if (awaitDone) {
            await (new Promise<void>((resolve, reject) => {
                device.device.queue.onSubmittedWorkDone().then(resolve).catch(reject);
            }));
        }
    }

    /**
     * 清除计算通道。
     */
    public Dispose() {
        for (let id of this._buffers) {
            this._global.device.FreeBuffer(id);
        }

        this._material.Release();

        this._global = null;
        this._enabled = false;
        this._material = null;
        this._entryPoint = null;
        this._sizeX = 1;
        this._sizeY = 1;
        this._sizeZ = 1;
        this._buffers = null;
        this._bundle = null;
    }

    /**
     * 设置计算着色器读写缓存。
     * @param binding 缓存绑定点。 
     * @param id 缓存ID。
     */
    public SetBuffer(binding: number, id: number) {
        this._buffers[binding] = id;
    }

    /**
     * 写入缓存数据。
     * @param binding 缓存绑定点。 
     * @param bufferOffset 缓存写入偏移。
     * @param data 数据源。
     * @param dataOffset 数据源偏移。
     * @param size 写入大小。
     */
    public WriteBuffer(binding: number, bufferOffset: number, data: BufferSource | SharedArrayBuffer, dataOffset: number, size: number) {
        this._global.device.WriteBuffer(
            this._buffers[binding], // 缓存实例ID
            bufferOffset,           // 缓存写入偏移
            data,                   // 数据源
            dataOffset,             // 数据源偏移
            size                    // 数据写入大小
        );
    }

    /**
     * 读取缓存数据。
     * @param binding 缓存绑定点。 
     * @param offset 缓存偏移。
     * @param size 读取大小。
     * @returns 返回数据数组缓存。
     */
    public async ReadBuffer(binding: number, offset: number, size: number) {
        return this._global.device.ReadBuffer(this._buffers[binding], offset, size);
    }

    /** 是否启用。 */
    public get enabled() {
        return this._enabled;
    }
    public set enabled(b: boolean) {
        this._enabled = b;
    }

    /** 入口函数名称。 */
    public get entryPoint() {
        return this._entryPoint;
    }

    /** 工作组划分X向维度。 */
    public get sizeX() {
        return this._sizeX;
    }

    /** 工作组划分Y向维度。 */
    public get sizeY() {
        return this._sizeY;
    }

    /** 工作组划分Z向维度。 */
    public get sizeZ() {
        return this._sizeZ;
    }

    /** 计算材质（包含计算着色器和属性常量缓存）。 */
    public get material() {
        return this._material;
    }

    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 是否启用。 */
    protected _enabled: boolean;
    /** 计算材质（包含计算着色器和属性常量缓存）。 */
    protected _material: Miaoverse.Material;
    /** 入口函数名称。 */
    protected _entryPoint: string;
    /** 工作组划分X向维度。 */
    protected _sizeX: number;
    /** 工作组划分Y向维度。 */
    protected _sizeY: number;
    /** 工作组划分Z向维度。 */
    protected _sizeZ: number;
    /** STORAGE缓存数组（G3） */
    protected _buffers: number[];
    /** 计算参数捆绑。 */
    protected _bundle: {
        /** G0资源组绑定对象（空）。 */
        g0: GPUBindGroup;
        /** G1资源组绑定对象（空）。 */
        g1: GPUBindGroup;
        /** G3资源组绑定对象。 */
        g3: GPUBindGroup;
        /** 计算管线。 */
        pipeline: GPUComputePipeline;
    };
}

// ============================--------------------------------

/**
 * 头发几何体的编辑器设置。
 */
class HairStandsSettings implements HairSettingsBase {

    public get Segments() {
        return this.Provider.GetSegmentsNum();
    }

    public get HeadCenterWorld() {
        if (this.HeadCenterType == HairHeadCenterType.LocalPoint) {
            if (this.Provider) {
                // return this.Provider.transform.TransformPoint(HeadCenter);
            }

            return [0, 0, 0];
        }

        if (this.HeadCenterTransform) {
            // return this.HeadCenterTransform.position;
        }

        return [1, 1, 1];
    }

    /**
     * 提供几何数据
     * 1) 头发
     * 2) 头皮
     */
    public Provider: GeometryProviderBase;
    public HeadCenterType = HairHeadCenterType.LocalPoint;

    public HeadCenterTransform: Miaoverse.Object3D;
    public HeadCenter: Miaoverse.Vector3;

    // ========================--------------------------------

    public Validate() {
        return this.Provider && this.Provider.Validate(true);
    }

    public DrawGizmos() {
        // ...
    }

    public IsVisible = false;
}

class HairPhysicsSettings implements HairSettingsBase {
    public GetColliders() {
        // TODO: 从ColliderProviders获取全部SphereCollider
        return [] as any[];
    }

    public DebugDraw = false;

    public IsEnabled = true;

    //quality
    public Iterations = 1;
    public FastMovement = true;

    //stands
    public Gravity = [0, -1, 0];
    public Drag = 0.0;
    public StandRadius = 0.1;

    // 发缕弹性曲线（AnimationCurve.EaseInOut(0, 0, 1, 1)）
    public ElasticityCurve = [0, 0, 1, 1];

    // 风力倍增强度
    public WindMultiplier = 0.0001;

    // 碰撞体列表
    public ColliderProviders: any[] = [];

    // 配饰列表
    public AccessoriesProviders: any[] = [];

    // 关节列表
    public JointAreas: HairJointArea[] = [];

    public UseDeltaTime = false;

    // （SphereCollider[]）
    public colliders: any = [];

    // ========================--------------------------------

    public Validate() {
        //foreach(var colliderProvider in ColliderProviders)
        //{
        //    if (colliderProvider == null) {
        //        Debug.LogError("Setup Colliders Provider in Physics Settings it can't be null.");
        //        return false;
        //    }
        //}

        return true;
    }

    public DrawGizmos() {
        // ...
    }

    public IsVisible = false;
}

class HairJointArea {
    public get Radius() {
        return this.radius;
    }

    private radius = 0.001;
}

class GpuBuffer<T> {
    // ...
}

interface GeometryProviderBase {
    GetBounds: () => { m_Center: number[]; m_Extents: number[]; };

    GetSegmentsNum: () => number;
    GetStandsNum: () => number;

    GetIndices: () => number[];
    GetVertices: () => number[]; // Miaoverse.Vector3[];
    GetColors: () => number[]; // Color[];

    GetTransformsBuffer: () => GpuBuffer<Miaoverse.Matrix4x4>;
    GetToWorldMatrix: () => Miaoverse.Matrix4x4;
    GetHairRootToScalpMap: () => number[];

    Dispatch: () => void;
    Validate: (log: boolean) => boolean;
}

interface HairSettingsBase {
    Validate: () => boolean;
    DrawGizmos: () => void;
    IsVisible: boolean;
}

const enum HairHeadCenterType {
    LocalPoint = 0,
    Transform,
}

/*/
初始化设置
Hair Settings
Hair Geometry Importer 与 GeometryImporterEditor关联

运行时设置
GP Hair Physics
Hair Render

网格 mesh
网格渲染器 rend
头发数据 data

Awake：添加网格和网格渲染器，此时未设置网格数据

Initialize(HairDataFacade data)

// 索引从网格传入，发丝数据从材质传入
InitializeMaterial()

材质可传入计算缓存
_Barycentrics 重心
_Particles 发缕顶点

Dispatch()：根据HairDataFacade设置材质数据和网格渲染器组件设置

@stage(compute) @workgroup_size(64)
@workgroup_size(64) 等同于 @workgroup_size(64, 1, 1).
https://www.cnblogs.com/onsummer/p/webgpu-all-of-the-cores-none-of-the-canvas.html

// ============================--------------------------------

// 静态头皮数据提供器
interface StaticScalpProvider {

}

// 骨骼蒙皮头皮数据提供器
interface SkinnedScalpProvider {
    // ...
}

/*/
