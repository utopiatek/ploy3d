/// <reference types="@webgpu/types" />
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
     * @param url 场景根文件路径。
     */
    Init(url: string): Promise<void>;
    /**
     * 更新绘制场景。
     * @returns
     */
    Update(): void;
    /**
     * 绘制场景。
     * @param passEncoder 渲染通道命令编码器。
     */
    Draw(passEncoder: GPURenderPassEncoder): void;
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
     */
    private Flush;
    /**
     * 确认节点绘制状态。
     * @param node 场景节点。
     * @returns 返回节点绘制状态。
     */
    private Check;
    /**
     * 遍历所有子节点。
     * @param groups 场景分组列表。
     * @param fn 处理方法。
     */
    private For_children;
    /** 内核实现。 */
    private _impl;
    /** 3MX文件结构。 */
    private _3mx;
    /** 根分组列表。 */
    private _root;
    /** 绘制节点数组。 */
    private _showList;
    /** 细分节点数组。 */
    private _subdivList;
    /** 绘制节点数量。 */
    private _showCount;
    /** 细分节点数量。 */
    private _subdivCount;
    /** 场景更新时间戳。 */
    private _updateTS;
    /** 场景细分任务。 */
    private _subdiv;
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
     * @param url 场景根文件路径。
     * @returns 异步返回倾斜摄影组件实例。
     */
    Create_3mx(url: string): Promise<Miaoverse.Dioramas_3mx>;
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
