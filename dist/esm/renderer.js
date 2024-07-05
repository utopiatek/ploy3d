export class Renderer {
    constructor(_global) {
        this._global = _global;
    }
    async Init() {
        return this;
    }
    GetQueue(callback) {
        callback({});
    }
    _global;
}
export class DrawQueue {
}
//# sourceMappingURL=renderer.js.map