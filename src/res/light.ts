import * as Miaoverse from "../mod.js"

/** 相机组件实例。 */
export class Light extends Miaoverse.Resource<Light> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Light_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /** 是否启用组件。 */
    public get enabled(): boolean {
        return this._impl.Get<number>(this._ptr, "enabled") > 0;
    }
    public set enabled(b: boolean) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }

    /** 组件所属对象。 */
    public get object3d(): Miaoverse.Object3D {
        const ptr = this._impl.Get<Miaoverse.io_ptr>(this._ptr, "object");
        return this._global.resources.Object.GetInstanceByPtr(ptr);
    }

    /** 光源类型。 */
    public get type(): Asset_light["type"] {
        const flags = this._impl.Get<number>(this._ptr, "flags");
        const type = Math.round((flags & 0xFF) * 0.1);
        return this._impl["_typeLut"][type] as any;
    }
    public set type(value: Asset_light["type"]) {
        let flags = this._impl.Get<number>(this._ptr, "flags");
        flags = (flags & 0xFFFFFF00) + (this._impl["_typeLut"].indexOf(value) * 10);
        this._impl.Set(this._ptr, "flags", flags);
    }

    /** 光源所属通道（仅对应通道打开时光源起作用）。 */
    public get channels() {
        const flags = this._impl.Get<number>(this._ptr, "flags");
        const channels = (flags >> 8) & 0xFF;
        return channels;
    }
    public set channels(n: number) {
        let flags = this._impl.Get<number>(this._ptr, "flags");
        flags = (flags & ~0xFF00) + (n << 8);
        this._impl.Set(this._ptr, "flags", flags);
    }

    /** 光源辐射半径（影响范围，单位米。在该距离之外，光源影响为0）。 */
    public get radius(): number {
        return this._impl.Get(this._ptr, "radius");
    }
    public set radius(value: number) {
        this._impl.Set(this._ptr, "radius", value);

        const falloffSq = value * value;
        const falloff = falloffSq > 0.0 ? (1.0 / falloffSq) : 0.0;

        this.falloff = falloff;
    }

    /** 光源颜色（线性空间）。 */
    public get color(): Float32Array {
        return this._impl.Get(this._ptr, "color");
    }
    public set color(value: number[]) {
        this._impl.Set(this._ptr, "color", value);
    }

    /**
     * 光源强度（照度，单位lux）。
     * 对于方向光，它是以lux为单位的照度（太阳照度为100000lux）。
     * 对于点光源和聚光灯，它是以lumen为单位的发光功率。
     */
    public get lux(): number {
        return this._impl.Get(this._ptr, "lux");
    }
    public set lux(value: number) {
        this._impl.Set(this._ptr, "lux", value);
    }

    /** 
     * 点光源和聚光灯在世界空间中坐标。
     * 太阳光：
     * X[SunAngularRadius]：太阳的角半径，太阳的实际半径与太阳到地球的距离的比值（单位为弧度，0.25°至20.0°之间，默认度数0.545°）。
     * Y[SunHaloSize]：太阳的光晕半径（太阳角半径的倍数，默认值10.0）。
     * Z[SunHaloFalloff]：太阳的光晕衰减（无量纲数值，用作指数，默认值80.0）。
     */
    public get position() {
        return this._global.Vector3(this._impl.Get(this._ptr, "position"));
    }

    /** 点光源和聚光灯的衰减因子。 */
    public get falloff(): number {
        return this._impl.Get(this._ptr, "falloff");
    }
    public set falloff(value: number) {
        this._impl.Set(this._ptr, "falloff", value);
    }

    /** 光源在世界空间中方向（等同全局空间方向，指向光源）。 */
    public get direction() {
        return this._global.Vector3(this._impl.Get(this._ptr, "direction"));
    }

    /** 
     * X[InnerAngle]：聚光灯的内部圆锥角度（弧度，在~0.00873到m_nOuterAngle范围之间）。
     * Y[OuterAngle]：聚光灯的外部圆锥角度（弧度，在m_nInnerAngle到0.5PI范围之间）。
     */
    public get spotCone(): Float32Array {
        return this._impl.Get(this._ptr, "spotCone");
    }
    public set spotCone(value: number[]) {
        this._impl.Set(this._ptr, "spotCone", value);
    }

    /** 聚光灯角度衰减参数（根据m_mSpotCone计算所得）。 */
    public get spotScaleOffset(): Float32Array {
        return this._impl.Get(this._ptr, "spotScaleOffset");
    }
    public set spotScaleOffset(value: number[]) {
        this._impl.Set(this._ptr, "spotScaleOffset", value);
    }

    /** 内核实现。 */
    private _impl: Light_kernel;
}

/** 光源组件内核实现。 */
export class Light_kernel extends Miaoverse.Base_kernel<Light, typeof Light_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Light_member_index);
    }

    /**
     * 创建光源组件实例。
     * @param asset 光源组件描述符。
     * @returns 异步返回光源组件实例。
     */
    public async Create(object3d: Miaoverse.Object3D, asset: Asset_light) {
        const ptr = this._Create(object3d.internalPtr);
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Light(this, ptr, id);

        this._instanceCount++;

        // 初始化属性 ===============-----------------------

        instance.enabled = asset.enabled;
        instance.type = asset.type;
        instance.channels = asset.channels || 1;
        instance.color = asset.color;

        if (asset.type == "sun" || asset.type == "directional") {
            instance.radius = asset.radius;
            instance.lux = asset.intensity;
        }
        else {
            instance.radius = asset.radius;

            if (asset.type == "point") {
                // li = lp / (4 * pi)
                instance.lux = asset.intensity / Math.PI * 0.25;
            }
            else {
                const minRad = 0.5 * (Math.PI / 180.0);
                const maxRad = 0.5 * Math.PI;

                // clamp the inner/outer angles to [0.5 degrees, 90 degrees]
                let innerClamped = Math.min(Math.max(Math.abs(asset.innerAngle), minRad), maxRad);
                let outerClamped = Math.min(Math.max(Math.abs(asset.outerAngle), minRad), maxRad);

                // inner must always be smaller than outer
                innerClamped = Math.min(innerClamped, outerClamped);

                const cosOuter = Math.cos(outerClamped);
                const cosInner = Math.cos(innerClamped);
                const cosOuterSquared = cosOuter * cosOuter;
                const scale = 1.0 / Math.max(1.0 / 1024.0, cosInner - cosOuter);
                const offset = -cosOuter * scale;

                instance.spotCone = [innerClamped, outerClamped];
                instance.spotScaleOffset = [scale, offset];

                if (asset.type == "focused_spot") {
                    // li = lp / (2 * pi * (1 - cos(cone_outer / 2)))
                    instance.lux = asset.intensity / (2.0 * Math.PI * (1.0 - cosOuter));
                }
                else if (asset.type == "spot") {
                    // li = lp / pi
                    instance.lux = asset.intensity / Math.PI;
                }
            }
        }

        return instance;
    }

    /**
     * 移除光源组件实例。
     * @param id 光源组件实例ID。
     */
    protected Remove(id: number) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Light_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }

        instance["_impl"] = null;

        instance["_global"] = null;
        instance["_ptr"] = 0 as never;
        instance["_id"] = this._instanceIdle;

        this._instanceIdle = id;
        this._instanceCount -= 1;
    }

    /**
     * 清除所有。
     */
    protected DisposeAll() {
        if (this._instanceCount != 0) {
            console.error("异常！存在未释放的光源组件实例", this._instanceCount);
        }

        this._global = null;
        this._members = null;

        this._instanceList = null;
        this._instanceLut = null;
    }

    /**
     * 创建光源组件内核实例。
     * @param object3d 3D对象内核实例指针（光源组件唯一属于某个3D对象并跟随3D对象被销毁）。
     * @returns 返回光源组件内核实例指针。
     */
    protected _Create: (object3d: Miaoverse.io_ptr) => Miaoverse.io_ptr;

    /** 光源类型查找表。*/
    protected _typeLut = ["undefined", "sun", "directional", "point", "focused_spot", "spot"];
}

/** 光源组件内核实现的数据结构成员列表。 */
export const Light_member_index = {
    ...Miaoverse.Binary_member_index,

    enabled: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    object: ["ptrGet", "ptrSet", 1, 13] as Miaoverse.Kernel_member,
    lastSib: ["ptrGet", "ptrSet", 1, 14] as Miaoverse.Kernel_member,
    nextSib: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,

    flags: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    radius: ["fscalarGet", "fscalarSet", 1, 17] as Miaoverse.Kernel_member,
    reserved: ["uarrayGet", "uarraySet", 2, 18] as Miaoverse.Kernel_member,

    color: ["farrayGet", "farraySet", 3, 20] as Miaoverse.Kernel_member,
    lux: ["fscalarGet", "fscalarSet", 1, 23] as Miaoverse.Kernel_member,

    position: ["farrayGet", "farraySet", 3, 24] as Miaoverse.Kernel_member,
    falloff: ["fscalarGet", "fscalarSet", 1, 27] as Miaoverse.Kernel_member,

    direction: ["farrayGet", "farraySet", 3, 28] as Miaoverse.Kernel_member,
    extra: ["fscalarGet", "fscalarSet", 1, 31] as Miaoverse.Kernel_member,

    spotCone: ["farrayGet", "farraySet", 2, 32] as Miaoverse.Kernel_member,
    spotScaleOffset: ["farrayGet", "farraySet", 2, 34] as Miaoverse.Kernel_member,
} as const;

/** 光源组件资源。 */
export interface Asset_light extends Miaoverse.Asset {
    /** 是否启用。 */
    enabled: boolean;
    /** 光源组件类型。 */
    type: "sun" | "directional" | "point" | "focused_spot" | "spot";
    /** 光源所属通道集（仅对应通道打开时光源起作用）。 */
    channels?: number;
    /** 光源颜色（线性空间RGB）。 */
    color: number[];
    /** 
     * 光源强度：
     * 对于方向光，它是以lux为单位的照度（太阳照度为100000lux）。
     * 对于点光源和聚光灯，它是以lumen为单位的发光功率。
     */
    intensity: number;
    /** 点光源和聚光灯的影响半径。 */
    radius?: number;
    /** 聚光灯的内部圆锥弧度（弧度，在~0.00873到outerAngle范围之间）。 */
    innerAngle?: number;
    /** 聚光灯的外部圆锥弧度（弧度，在innerAngle到0.5PI范围之间）。 */
    outerAngle?: number;
}
