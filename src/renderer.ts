import * as Miaoverse from "./mod.js"

/** 渲染器接口。 */
export class Renderer {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 初始化渲染器接口。
     * @returns 返回渲染器接口。
     */
    public async Init() {
        return this;
    }

    /**
     * 获取渲染队列。
     * @param callback 等待后回调返回渲染队列。 
     */
    public GetQueue(callback: (queue: DrawQueue) => void) {
        callback({} as any);
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
}

/** 渲染队列。 */
export class DrawQueue {
}
