import * as Miaoverse from "../mod.js";
/** 体积组件。 */
export declare class Volume extends Miaoverse.Resource<Volume> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
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
    get updated(): boolean;
    set updated(value: boolean);
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
    /** 太阳光照颜色和强度。 */
    get sunlitColorIntensity(): Float32Array;
    set sunlitColorIntensity(value: ArrayLike<number>);
    /** 太阳光照全局空间方向光方向。 */
    get sunlitDirection(): Float32Array;
    set sunlitDirection(value: ArrayLike<number>);
    /** 禁用太阳光照。 */
    get sunlitDisable(): number;
    set sunlitDisable(value: number);
    /** 太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。 */
    get lightFarAttenuationParams(): Float32Array;
    set lightFarAttenuationParams(value: ArrayLike<number>);
    /** IBL亮度缩放。 */
    get iblLuminance(): number;
    set iblLuminance(value: number);
    /** IBL粗糙度为1的纹理链级别。 */
    get iblRoughnessOneLevel(): number;
    set iblRoughnessOneLevel(value: number);
    /** 是否禁用SSAO。 */
    get ssaoDisable(): number;
    set ssaoDisable(value: number);
    /** 是否禁用SSR。 */
    get ssrDisable(): number;
    set ssrDisable(value: number);
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
    /** 阴影，禁用太阳光照阴影。 */
    get shadowDisable(): number;
    set shadowDisable(value: number);
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
    /** 内核实现。 */
    private _impl;
}
/** 体积组件内核实现。 */
export declare class Volume_kernel extends Miaoverse.Base_kernel<Volume, typeof Volume_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建体积组件实例。
     * @returns 返回体积组件实例。
     */
    Create(object3d: Miaoverse.Object3D): Promise<Miaoverse.Volume>;
    /**
     * 移除体积组件实例。
     * @param id 体积组件实例ID。
     */
    protected Remove(id: number): void;
    /**
     * 清除所有。
     */
    protected DisposeAll(): void;
    /**
     * 创建体积组件内核实例。
     * @param object3d 3D对象内核实例指针（体积组件唯一属于某个3D对象并跟随3D对象被销毁）。
     * @returns 返回体积组件内核实例指针。
     */
    protected _Create: (object3d: Miaoverse.io_ptr) => Miaoverse.io_ptr;
}
/** 体积组件（80 + 512 = 592字节）。 */
export declare const Volume_member_index: {
    /** 是否启用组件。 */
    readonly enabled: Miaoverse.Kernel_member;
    /** 组件所属对象。 */
    readonly object: Miaoverse.Kernel_member;
    /** 上一个兄弟组件实例（场景中）。 */
    readonly lastSib: Miaoverse.Kernel_member;
    /** 下一个兄弟组件实例（场景中）。 */
    readonly nextSib: Miaoverse.Kernel_member;
    /** 体积参数是否有更新。 */
    readonly updated: Miaoverse.Kernel_member;
    /** 天空球绕X轴旋转角度。 */
    readonly iblPitch: Miaoverse.Kernel_member;
    /** 天空球绕Y轴旋转角度。 */
    readonly iblYaw: Miaoverse.Kernel_member;
    /** 天空球绕Z轴旋转角度。 */
    readonly iblRoll: Miaoverse.Kernel_member;
    /** 体积数据对象（512字节）。 */
    /** IBL，球谐系数。 */
    readonly iblSH: Miaoverse.Kernel_member;
    /** 雾颜色。 */
    readonly fogColor: Miaoverse.Kernel_member;
    /** 太阳圆盘参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP。 */
    readonly sunParams: Miaoverse.Kernel_member;
    /** 太阳光照颜色和强度。 */
    readonly sunlitColorIntensity: Miaoverse.Kernel_member;
    /** 太阳光照全局空间方向光方向。 */
    readonly sunlitDirection: Miaoverse.Kernel_member;
    /** 禁用太阳光照。 */
    readonly sunlitDisable: Miaoverse.Kernel_member;
    /** 太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。 */
    readonly lightFarAttenuationParams: Miaoverse.Kernel_member;
    /** IBL，亮度。 */
    readonly iblLuminance: Miaoverse.Kernel_member;
    /** IBL，粗糙度为1的纹理链级别。 */
    readonly iblRoughnessOneLevel: Miaoverse.Kernel_member;
    /** 是否禁用SSAO。 */
    readonly ssaoDisable: Miaoverse.Kernel_member;
    /** 是否禁用SSR。 */
    readonly ssrDisable: Miaoverse.Kernel_member;
    /** 屏幕空间反射用的物体厚度，用于相交测试。 */
    readonly ssrThickness: Miaoverse.Kernel_member;
    /** 屏幕空间反射用的射线的起点偏移。 */
    readonly ssrBias: Miaoverse.Kernel_member;
    /** 屏幕空间反射用的射线最大追踪距离。 */
    readonly ssrDistance: Miaoverse.Kernel_member;
    /** 屏幕空间反射用的射线追踪步进像素数。 */
    readonly ssrStride: Miaoverse.Kernel_member;
    /** 反射贴图采样LOD偏移。 */
    readonly refractionLodOffset: Miaoverse.Kernel_member;
    /** 噪音系数[0, 1]，当不使用TAA时取0。 */
    readonly temporalNoise: Miaoverse.Kernel_member;
    /** SSAO，采样参数，0: bilinear, !0: bilateral edge distance。 */
    readonly aoSamplingQualityAndEdgeDistance: Miaoverse.Kernel_member;
    /** SSAO，0: no AO bent normal, >0.0 AO bent normals。 */
    readonly aoBentNormals: Miaoverse.Kernel_member;
    /**
     * bit 0-3: cascade count
     * bit 4: visualize cascades
     * bit 8-11: cascade has visible shadows
     */
    readonly cascades: Miaoverse.Kernel_member;
    /**
     * bit 0: directional (sun) shadow enabled
     * bit 1: directional (sun) screen-space contact shadow enabled
     * bit 8-15: screen-space contact shadows ray casting steps
     */
    readonly directionalShadows: Miaoverse.Kernel_member;
    /** 屏幕空间接触阴影距离。 */
    readonly ssContactShadowDistance: Miaoverse.Kernel_member;
    /** 阴影类型，0: PCF, 1: VSM，2: DPCF, 3: PCSS。 */
    readonly shadowSamplingType: Miaoverse.Kernel_member;
    /** 阴影，法向偏移。 */
    readonly shadowBias: Miaoverse.Kernel_member;
    /** 阴影，光照空间的光源半径。 */
    readonly shadowBulbRadiusLs: Miaoverse.Kernel_member;
    /** 阴影，用于DPCF、PCSS，用于艺术用途的比例半影。 */
    readonly shadowPenumbraRatioScale: Miaoverse.Kernel_member;
    /** 阴影，禁用太阳光照阴影。 */
    readonly shadowDisable: Miaoverse.Kernel_member;
    /** VSM阴影指数。 */
    readonly vsmExponent: Miaoverse.Kernel_member;
    /** 用于VSM最小方差计算。 */
    readonly vsmDepthScale: Miaoverse.Kernel_member;
    /** VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见。 */
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
