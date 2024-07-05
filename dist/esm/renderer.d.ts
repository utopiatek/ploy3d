import * as Miaoverse from "./mod.js";
/** 渲染器接口。 */
export declare class Renderer {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化渲染器接口。
     * @returns 返回渲染器接口。
     */
    Init(): Promise<this>;
    /**
     * 获取渲染队列。
     * @param callback 等待后回调返回渲染队列。
     */
    GetQueue(callback: (queue: DrawQueue) => void): void;
    /** 模块实例对象。 */
    private _global;
}
/** 渲染队列。 */
export declare class DrawQueue {
}
