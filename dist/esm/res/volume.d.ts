import * as Miaoverse from "../mod.js";
/** 体积组件。 */
export declare class Volume extends Miaoverse.Resource<Volume> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: Volume_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 体积参数更新时间戳。 */
    get writeTS(): number;
    set writeTS(value: number);
    /** 体积参数应用时间戳。 */
    get readTS(): number;
    set readTS(value: number);
    /** 是否启用组件。 */
    get enabled(): boolean;
    set enabled(b: boolean);
    /** 体积参数是否有更新。 */
    get updated(): number;
    set updated(value: number);
    /** IBL绕X轴旋转角度。 */
    get iblPitch(): number;
    set iblPitch(value: number);
    /** IBL绕Y轴旋转角度。 */
    get iblYaw(): number;
    set iblYaw(value: number);
    /** IBL绕Z轴旋转角度。 */
    get iblRoll(): number;
    set iblRoll(value: number);
    /** IBL球谐系数。 */
    get iblSH(): Float32Array;
    set iblSH(value: ArrayLike<number>);
    /** 雾颜色。 */
    get fogColor(): Float32Array;
    set fogColor(value: ArrayLike<number>);
    /** 太阳圆盘参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP。 */
    get sunParams(): Float32Array;
    set sunParams(value: ArrayLike<number>);
    /** IBL主光照颜色和强度。 */
    get iblColorIntensity(): Float32Array;
    /** IBL主光照全局空间方向光方向。 */
    get iblDirection(): Float32Array;
    /** 太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。 */
    get lightFarAttenuationParams(): Float32Array;
    set lightFarAttenuationParams(value: ArrayLike<number>);
    /** IBL亮度缩放。 */
    get iblLuminance(): number;
    set iblLuminance(value: number);
    /** IBL粗糙度为1的纹理链级别。 */
    get iblRoughnessOneLevel(): number;
    set iblRoughnessOneLevel(value: number);
    /** 屏幕空间反射用的物体厚度，用于相交测试。 */
    get ssrThickness(): number;
    set ssrThickness(value: number);
    /** 屏幕空间反射用的射线的起点偏移。 */
    get ssrBias(): number;
    set ssrBias(value: number);
    /** 屏幕空间反射用的射线最大追踪距离。 */
    get ssrDistance(): number;
    set ssrDistance(value: number);
    /** 屏幕空间反射用的射线追踪步进像素数。 */
    get ssrStride(): number;
    set ssrStride(value: number);
    /** 反射贴图采样LOD偏移。 */
    get refractionLodOffset(): number;
    set refractionLodOffset(value: number);
    /** 噪音系数[0, 1]，当不使用TAA时取0。 */
    get temporalNoise(): number;
    set temporalNoise(value: number);
    /** SSAO，采样参数，0: bilinear, !0: bilateral edge distance。 */
    get aoSamplingQualityAndEdgeDistance(): number;
    set aoSamplingQualityAndEdgeDistance(value: number);
    /** SSAO，0: no AO bent normal, >0.0 AO bent normals。 */
    get aoBentNormals(): number;
    set aoBentNormals(value: number);
    /**
     * bit 0-3: cascade count
     * bit 4: visualize cascades
     * bit 8-11: cascade has visible shadows
     */
    get cascades(): number;
    set cascades(value: number);
    /**
     * bit 0: directional (sun) shadow enabled
     * bit 1: directional (sun) screen-space contact shadow enabled
     * bit 8-15: screen-space contact shadows ray casting steps
     */
    get directionalShadows(): number;
    set directionalShadows(value: number);
    /** 屏幕空间接触阴影距离。 */
    get ssContactShadowDistance(): number;
    set ssContactShadowDistance(value: number);
    /** 阴影类型，0: PCF, 1: VSM，2: DPCF, 3: PCSS。 */
    get shadowSamplingType(): number;
    set shadowSamplingType(value: number);
    /** 阴影，法向偏移。 */
    get shadowBias(): number;
    set shadowBias(value: number);
    /** 阴影，光照空间的光源半径。 */
    get shadowBulbRadiusLs(): number;
    set shadowBulbRadiusLs(value: number);
    /** 阴影，用于DPCF、PCSS，用于艺术用途的比例半影。 */
    get shadowPenumbraRatioScale(): number;
    set shadowPenumbraRatioScale(value: number);
    /** VSM阴影指数。 */
    get vsmExponent(): number;
    set vsmExponent(value: number);
    /** 用于VSM最小方差计算。 */
    get vsmDepthScale(): number;
    set vsmDepthScale(value: number);
    /** VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见。 */
    get vsmLightBleedReduction(): number;
    set vsmLightBleedReduction(value: number);
    /** 。 */
    get fogStart(): number;
    set fogStart(value: number);
    /** 。 */
    get fogMaxOpacity(): number;
    set fogMaxOpacity(value: number);
    /** 。 */
    get fogHeight(): number;
    set fogHeight(value: number);
    /** falloff * 1.44269。 */
    get fogHeightFalloff(): number;
    set fogHeightFalloff(value: number);
    /** (density/falloff)*exp(-falloff*(camera.y - fogHeight))。 */
    get fogDensity(): number;
    set fogDensity(value: number);
    /** 。 */
    get fogInscatteringStart(): number;
    set fogInscatteringStart(value: number);
    /** 。 */
    get fogInscatteringSize(): number;
    set fogInscatteringSize(value: number);
    /** 。 */
    get fogColorFromIbl(): number;
    set fogColorFromIbl(value: number);
    /** 体积组件内核实现。 */
    private _impl;
}
/** 体积组件（256字节）。 */
export declare class Volume_kernel {
    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    Get<T>(self: Miaoverse.io_ptr, key: Volume_kernel["_members_key"]): T;
    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    Set(self: Miaoverse.io_ptr, key: Volume_kernel["_members_key"], value: any): void;
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: Volume[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Volume>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 待GC列表。 */
    protected _gcList: Volume[];
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly enabled: Miaoverse.Kernel_member;
        readonly object: Miaoverse.Kernel_member;
        readonly lastSib: Miaoverse.Kernel_member;
        readonly nextSib: Miaoverse.Kernel_member;
        readonly updated: Miaoverse.Kernel_member;
        readonly iblPitch: Miaoverse.Kernel_member;
        readonly iblYaw: Miaoverse.Kernel_member;
        readonly iblRoll: Miaoverse.Kernel_member;
        readonly iblSH: Miaoverse.Kernel_member;
        readonly fogColor: Miaoverse.Kernel_member;
        readonly sunParams: Miaoverse.Kernel_member;
        readonly iblColorIntensity: Miaoverse.Kernel_member;
        readonly iblDirection: Miaoverse.Kernel_member;
        readonly lightFarAttenuationParams: Miaoverse.Kernel_member;
        readonly iblLuminance: Miaoverse.Kernel_member;
        readonly iblRoughnessOneLevel: Miaoverse.Kernel_member;
        readonly ssrThickness: Miaoverse.Kernel_member;
        readonly ssrBias: Miaoverse.Kernel_member;
        readonly ssrDistance: Miaoverse.Kernel_member;
        readonly ssrStride: Miaoverse.Kernel_member;
        readonly refractionLodOffset: Miaoverse.Kernel_member;
        readonly temporalNoise: Miaoverse.Kernel_member;
        readonly aoSamplingQualityAndEdgeDistance: Miaoverse.Kernel_member;
        readonly aoBentNormals: Miaoverse.Kernel_member;
        readonly cascades: Miaoverse.Kernel_member;
        readonly directionalShadows: Miaoverse.Kernel_member;
        readonly ssContactShadowDistance: Miaoverse.Kernel_member;
        readonly shadowSamplingType: Miaoverse.Kernel_member;
        readonly shadowBias: Miaoverse.Kernel_member;
        readonly shadowBulbRadiusLs: Miaoverse.Kernel_member;
        readonly shadowPenumbraRatioScale: Miaoverse.Kernel_member;
        readonly vsmExponent: Miaoverse.Kernel_member;
        readonly vsmDepthScale: Miaoverse.Kernel_member;
        readonly vsmLightBleedReduction: Miaoverse.Kernel_member;
        readonly fogStart: Miaoverse.Kernel_member;
        readonly fogMaxOpacity: Miaoverse.Kernel_member;
        readonly fogHeight: Miaoverse.Kernel_member;
        readonly fogHeightFalloff: Miaoverse.Kernel_member;
        readonly fogDensity: Miaoverse.Kernel_member;
        readonly fogInscatteringStart: Miaoverse.Kernel_member;
        readonly fogInscatteringSize: Miaoverse.Kernel_member;
        readonly fogColorFromIbl: Miaoverse.Kernel_member;
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
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Volume_kernel["_members"];
}
