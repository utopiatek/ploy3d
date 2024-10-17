/// <reference types="dist" />
import * as Miaoverse from "../mod.js";
/** 计算内核基类。 */
export declare class ComputeKernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param material 计算材质。
     * @param entryPoint 入口函数名称。
     * @param workgroup_size 工作组划分。
     */
    constructor(_global: Miaoverse.Ploy3D, material: Miaoverse.Material, entryPoint: string, workgroup_size: number[]);
    /**
     * 派遣计算任务。
     */
    Dispatch(awaitDone?: boolean): Promise<void>;
    /**
     * 清除计算通道。
     */
    Dispose(): void;
    /**
     * 设置计算着色器读写缓存。
     * @param binding 缓存绑定点。
     * @param id 缓存ID。
     */
    SetBuffer(binding: number, id: number): void;
    /**
     * 写入缓存数据。
     * @param binding 缓存绑定点。
     * @param bufferOffset 缓存写入偏移。
     * @param data 数据源。
     * @param dataOffset 数据源偏移。
     * @param size 写入大小。
     */
    WriteBuffer(binding: number, bufferOffset: number, data: BufferSource | SharedArrayBuffer, dataOffset: number, size: number): void;
    /**
     * 读取缓存数据。
     * @param binding 缓存绑定点。
     * @param offset 缓存偏移。
     * @param size 读取大小。
     * @returns 返回数据数组缓存。
     */
    ReadBuffer(binding: number, offset: number, size: number): Promise<ArrayBuffer>;
    /** 是否启用。 */
    get enabled(): boolean;
    set enabled(b: boolean);
    /** 入口函数名称。 */
    get entryPoint(): string;
    /** 工作组划分X向维度。 */
    get sizeX(): number;
    /** 工作组划分Y向维度。 */
    get sizeY(): number;
    /** 工作组划分Z向维度。 */
    get sizeZ(): number;
    /** 计算材质（包含计算着色器和属性常量缓存）。 */
    get material(): Miaoverse.Material;
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
