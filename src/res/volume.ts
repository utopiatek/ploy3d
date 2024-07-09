import * as Miaoverse from "../mod.js"

/** 体积组件实例。 */
export class Volume extends Miaoverse.Resource<Volume> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Volume_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
    }

    /** 体积参数更新时间戳。 */
    public get writeTS(): number {
        return this._impl.Get(this._ptr, "writeTS");
    }
    public set writeTS(value: number) {
        this._impl.Set(this._ptr, "writeTS", value);
    }

    /** 体积参数应用时间戳。 */
    public get readTS(): number {
        return this._impl.Get(this._ptr, "readTS");
    }
    public set readTS(value: number) {
        this._impl.Set(this._ptr, "readTS", value);
    }

    /** 是否启用组件。 */
    public get enabled(): boolean {
        return this._impl.Get<number>(this._ptr, "enabled") > 0;
    }
    public set enabled(b: boolean) {
        this._impl.Set(this._ptr, "enabled", b ? 1 : 0);
    }

    /** 体积参数是否有更新。 */
    public get updated(): boolean {
        return this._impl.Get<number>(this._ptr, "updated") > 0;
    }
    public set updated(value: boolean) {
        this._impl.Set(this._ptr, "updated", value ? 1 : 0);
    }

    /** IBL绕X轴旋转角度。 */
    public get iblPitch(): number {
        return this._impl.Get(this._ptr, "iblPitch");
    }
    public set iblPitch(value: number) {
        this._impl.Set(this._ptr, "iblPitch", value);
        this.updated = true;
    }

    /** IBL绕Y轴旋转角度。 */
    public get iblYaw(): number {
        return this._impl.Get(this._ptr, "iblYaw");
    }
    public set iblYaw(value: number) {
        this._impl.Set(this._ptr, "iblYaw", value);
        this.updated = true;
    }

    /** IBL绕Z轴旋转角度。 */
    public get iblRoll(): number {
        return this._impl.Get(this._ptr, "iblRoll");
    }
    public set iblRoll(value: number) {
        this._impl.Set(this._ptr, "iblRoll", value);
        this.updated = true;
    }

    /** IBL球谐系数。 */
    public get iblSH(): Float32Array {
        return this._impl.Get(this._ptr, "iblSH");
    }
    public set iblSH(value: ArrayLike<number>) {
        this._impl.Set(this._ptr, "iblSH", value);
        this.updated = true;
    }

    /** 雾颜色。 */
    public get fogColor(): Float32Array {
        return this._impl.Get(this._ptr, "fogColor");
    }
    public set fogColor(value: ArrayLike<number>) {
        this._impl.Set(this._ptr, "fogColor", value);
        this.updated = true;
    }

    /** 太阳圆盘参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP。 */
    public get sunParams(): Float32Array {
        return this._impl.Get(this._ptr, "sunParams");
    }
    public set sunParams(value: ArrayLike<number>) {
        this._impl.Set(this._ptr, "sunParams", value);
        this.updated = true;
    }

    /** IBL主光照颜色和强度。 */
    public get iblColorIntensity(): Float32Array {
        // TODO: 需要先应用参数更新
        return this._impl.Get(this._ptr, "iblColorIntensity");
    }

    /** IBL主光照全局空间方向光方向。 */
    public get iblDirection(): Float32Array {
        // TODO: 需要先应用参数更新
        return this._impl.Get(this._ptr, "iblDirection");
    }

    /** 太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。 */
    public get lightFarAttenuationParams(): Float32Array {
        return this._impl.Get(this._ptr, "lightFarAttenuationParams");
    }
    public set lightFarAttenuationParams(value: ArrayLike<number>) {
        this._impl.Set(this._ptr, "lightFarAttenuationParams", value);
        this.updated = true;
    }

    /** IBL亮度缩放。 */
    public get iblLuminance(): number {
        return this._impl.Get(this._ptr, "iblLuminance");
    }
    public set iblLuminance(value: number) {
        this._impl.Set(this._ptr, "iblLuminance", value);
        this.updated = true;
    }

    /** IBL粗糙度为1的纹理链级别。 */
    public get iblRoughnessOneLevel(): number {
        return this._impl.Get(this._ptr, "iblRoughnessOneLevel");
    }
    public set iblRoughnessOneLevel(value: number) {
        this._impl.Set(this._ptr, "iblRoughnessOneLevel", value);
        this.updated = true;
    }

    /** 屏幕空间反射用的物体厚度，用于相交测试。 */
    public get ssrThickness(): number {
        return this._impl.Get(this._ptr, "ssrThickness");
    }
    public set ssrThickness(value: number) {
        this._impl.Set(this._ptr, "ssrThickness", value);
        this.updated = true;
    }

    /** 屏幕空间反射用的射线的起点偏移。 */
    public get ssrBias(): number {
        return this._impl.Get(this._ptr, "ssrBias");
    }
    public set ssrBias(value: number) {
        this._impl.Set(this._ptr, "ssrBias", value);
        this.updated = true;
    }

    /** 屏幕空间反射用的射线最大追踪距离。 */
    public get ssrDistance(): number {
        return this._impl.Get(this._ptr, "ssrDistance");
    }
    public set ssrDistance(value: number) {
        this._impl.Set(this._ptr, "ssrDistance", value);
        this.updated = true;
    }

    /** 屏幕空间反射用的射线追踪步进像素数。 */
    public get ssrStride(): number {
        return this._impl.Get(this._ptr, "ssrStride");
    }
    public set ssrStride(value: number) {
        this._impl.Set(this._ptr, "ssrStride", value);
        this.updated = true;
    }

    /** 反射贴图采样LOD偏移。 */
    public get refractionLodOffset(): number {
        return this._impl.Get(this._ptr, "refractionLodOffset");
    }
    public set refractionLodOffset(value: number) {
        this._impl.Set(this._ptr, "refractionLodOffset", value);
        this.updated = true;
    }

    /** 噪音系数[0, 1]，当不使用TAA时取0。 */
    public get temporalNoise(): number {
        return this._impl.Get(this._ptr, "temporalNoise");
    }
    public set temporalNoise(value: number) {
        this._impl.Set(this._ptr, "temporalNoise", value);
        this.updated = true;
    }

    /** SSAO，采样参数，0: bilinear, !0: bilateral edge distance。 */
    public get aoSamplingQualityAndEdgeDistance(): number {
        return this._impl.Get(this._ptr, "aoSamplingQualityAndEdgeDistance");
    }
    public set aoSamplingQualityAndEdgeDistance(value: number) {
        this._impl.Set(this._ptr, "aoSamplingQualityAndEdgeDistance", value);
        this.updated = true;
    }

    /** SSAO，0: no AO bent normal, >0.0 AO bent normals。 */
    public get aoBentNormals(): number {
        return this._impl.Get(this._ptr, "aoBentNormals");
    }
    public set aoBentNormals(value: number) {
        this._impl.Set(this._ptr, "aoBentNormals", value);
        this.updated = true;
    }

    /** 
     * bit 0-3: cascade count
     * bit 4: visualize cascades
     * bit 8-11: cascade has visible shadows
     */
    public get cascades(): number {
        return this._impl.Get(this._ptr, "cascades");
    }
    public set cascades(value: number) {
        this._impl.Set(this._ptr, "cascades", value);
        this.updated = true;
    }

    /** 
     * bit 0: directional (sun) shadow enabled
     * bit 1: directional (sun) screen-space contact shadow enabled
     * bit 8-15: screen-space contact shadows ray casting steps
     */
    public get directionalShadows(): number {
        return this._impl.Get(this._ptr, "directionalShadows");
    }
    public set directionalShadows(value: number) {
        this._impl.Set(this._ptr, "directionalShadows", value);
        this.updated = true;
    }

    /** 屏幕空间接触阴影距离。 */
    public get ssContactShadowDistance(): number {
        return this._impl.Get(this._ptr, "ssContactShadowDistance");
    }
    public set ssContactShadowDistance(value: number) {
        this._impl.Set(this._ptr, "ssContactShadowDistance", value);
        this.updated = true;
    }

    /** 阴影类型，0: PCF, 1: VSM，2: DPCF, 3: PCSS。 */
    public get shadowSamplingType(): number {
        return this._impl.Get(this._ptr, "shadowSamplingType");
    }
    public set shadowSamplingType(value: number) {
        this._impl.Set(this._ptr, "shadowSamplingType", value);
    }

    /** 阴影，法向偏移。 */
    public get shadowBias(): number {
        return this._impl.Get(this._ptr, "shadowBias");
    }
    public set shadowBias(value: number) {
        this._impl.Set(this._ptr, "shadowBias", value);
        this.updated = true;
    }

    /** 阴影，光照空间的光源半径。 */
    public get shadowBulbRadiusLs(): number {
        return this._impl.Get(this._ptr, "shadowBulbRadiusLs");
    }
    public set shadowBulbRadiusLs(value: number) {
        this._impl.Set(this._ptr, "shadowBulbRadiusLs", value);
        this.updated = true;
    }

    /** 阴影，用于DPCF、PCSS，用于艺术用途的比例半影。 */
    public get shadowPenumbraRatioScale(): number {
        return this._impl.Get(this._ptr, "shadowPenumbraRatioScale");
    }
    public set shadowPenumbraRatioScale(value: number) {
        this._impl.Set(this._ptr, "shadowPenumbraRatioScale", value);
        this.updated = true;
    }

    /** VSM阴影指数。 */
    public get vsmExponent(): number {
        return this._impl.Get(this._ptr, "vsmExponent");
    }
    public set vsmExponent(value: number) {
        this._impl.Set(this._ptr, "vsmExponent", value);
        this.updated = true;
    }

    /** 用于VSM最小方差计算。 */
    public get vsmDepthScale(): number {
        return this._impl.Get(this._ptr, "vsmDepthScale");
    }
    public set vsmDepthScale(value: number) {
        this._impl.Set(this._ptr, "vsmDepthScale", value);
        this.updated = true;
    }

    /** VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见。 */
    public get vsmLightBleedReduction(): number {
        return this._impl.Get(this._ptr, "vsmLightBleedReduction");
    }
    public set vsmLightBleedReduction(value: number) {
        this._impl.Set(this._ptr, "vsmLightBleedReduction", value);
        this.updated = true;
    }

    /** 。 */
    public get fogStart(): number {
        return this._impl.Get(this._ptr, "fogStart");
    }
    public set fogStart(value: number) {
        this._impl.Set(this._ptr, "fogStart", value);
        this.updated = true;
    }

    /** 。 */
    public get fogMaxOpacity(): number {
        return this._impl.Get(this._ptr, "fogMaxOpacity");
    }
    public set fogMaxOpacity(value: number) {
        this._impl.Set(this._ptr, "fogMaxOpacity", value);
        this.updated = true;
    }

    /** 。 */
    public get fogHeight(): number {
        return this._impl.Get(this._ptr, "fogHeight");
    }
    public set fogHeight(value: number) {
        this._impl.Set(this._ptr, "fogHeight", value);
        this.updated = true;
    }

    /** falloff * 1.44269。 */
    public get fogHeightFalloff(): number {
        return this._impl.Get(this._ptr, "fogHeightFalloff");
    }
    public set fogHeightFalloff(value: number) {
        this._impl.Set(this._ptr, "fogHeightFalloff", value);
        this.updated = true;
    }

    /** (density/falloff)*exp(-falloff*(camera.y - fogHeight))。 */
    public get fogDensity(): number {
        return this._impl.Get(this._ptr, "fogDensity");
    }
    public set fogDensity(value: number) {
        this._impl.Set(this._ptr, "fogDensity", value);
        this.updated = true;
    }

    /** 。 */
    public get fogInscatteringStart(): number {
        return this._impl.Get(this._ptr, "fogInscatteringStart");
    }
    public set fogInscatteringStart(value: number) {
        this._impl.Set(this._ptr, "fogInscatteringStart", value);
        this.updated = true;
    }

    /** 。 */
    public get fogInscatteringSize(): number {
        return this._impl.Get(this._ptr, "fogInscatteringSize");
    }
    public set fogInscatteringSize(value: number) {
        this._impl.Set(this._ptr, "fogInscatteringSize", value);
        this.updated = true;
    }

    /** 。 */
    public get fogColorFromIbl(): number {
        return this._impl.Get(this._ptr, "fogColorFromIbl");
    }
    public set fogColorFromIbl(value: number) {
        this._impl.Set(this._ptr, "fogColorFromIbl", value);
        this.updated = true;
    }

    /** 内核实现。 */
    private _impl: Volume_kernel;
}

/** 体积组件内核实现。 */
export class Volume_kernel extends Miaoverse.Base_kernel<Volume, typeof Volume_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Volume_member_index);
    }

    /**
     * 创建体积组件实例。
     * @returns 返回体积组件实例。
     */
    public async Create(object3d: Miaoverse.Object3D) {
        const ptr = this._Create(object3d.internalPtr);
        const id = this._instanceIdle;

        // 设置实例 ===============-----------------------

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Volume(this, ptr, id);

        this._instanceCount++;

        return instance;
    }

    /**
     * 创建体积组件内核实例。
     * @param object3d 3D对象内核实例指针（体积组件唯一属于某个3D对象并跟随3D对象被销毁）。
     * @returns 返回体积组件内核实例指针。
     */
    protected _Create: (object3d: Miaoverse.io_ptr) => Miaoverse.io_ptr;
}

/** 体积组件内核实现的数据结构成员列表。 */
export const Volume_member_index = {
    ...Miaoverse.Binary_member_index,

    enabled: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    object: ["ptrGet", "ptrSet", 1, 13] as Miaoverse.Kernel_member,
    lastSib: ["ptrGet", "ptrSet", 1, 14] as Miaoverse.Kernel_member,
    nextSib: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member,

    updated: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    iblPitch: ["fscalarGet", "fscalarSet", 1, 17] as Miaoverse.Kernel_member,
    iblYaw: ["fscalarGet", "fscalarSet", 1, 18] as Miaoverse.Kernel_member,
    iblRoll: ["fscalarGet", "fscalarSet", 1, 19] as Miaoverse.Kernel_member,

    iblSH: ["farrayGet", "farraySet", 36, 20] as Miaoverse.Kernel_member,

    fogColor: ["farrayGet", "farraySet", 3, 56] as Miaoverse.Kernel_member,

    sunParams: ["farrayGet", "farraySet", 4, 60] as Miaoverse.Kernel_member,
    iblColorIntensity: ["farrayGet", "farraySet", 4, 64] as Miaoverse.Kernel_member,
    iblDirection: ["farrayGet", "farraySet", 3, 68] as Miaoverse.Kernel_member,

    lightFarAttenuationParams: ["farrayGet", "farraySet", 2, 112] as Miaoverse.Kernel_member,

    iblLuminance: ["fscalarGet", "fscalarSet", 1, 116] as Miaoverse.Kernel_member,
    iblRoughnessOneLevel: ["fscalarGet", "fscalarSet", 1, 117] as Miaoverse.Kernel_member,

    ssrThickness: ["fscalarGet", "fscalarSet", 1, 120] as Miaoverse.Kernel_member,
    ssrBias: ["fscalarGet", "fscalarSet", 1, 121] as Miaoverse.Kernel_member,
    ssrDistance: ["fscalarGet", "fscalarSet", 1, 122] as Miaoverse.Kernel_member,
    ssrStride: ["fscalarGet", "fscalarSet", 1, 123] as Miaoverse.Kernel_member,
    refractionLodOffset: ["fscalarGet", "fscalarSet", 1, 124] as Miaoverse.Kernel_member,
    temporalNoise: ["fscalarGet", "fscalarSet", 1, 125] as Miaoverse.Kernel_member,
    aoSamplingQualityAndEdgeDistance: ["fscalarGet", "fscalarSet", 1, 126] as Miaoverse.Kernel_member,
    aoBentNormals: ["fscalarGet", "fscalarSet", 1, 127] as Miaoverse.Kernel_member,

    cascades: ["uscalarGet", "uscalarSet", 1, 128] as Miaoverse.Kernel_member,
    directionalShadows: ["uscalarGet", "uscalarSet", 1, 129] as Miaoverse.Kernel_member,
    ssContactShadowDistance: ["fscalarGet", "fscalarSet", 1, 130] as Miaoverse.Kernel_member,
    shadowSamplingType: ["uscalarGet", "uscalarSet", 1, 131] as Miaoverse.Kernel_member,

    shadowBias: ["fscalarGet", "fscalarSet", 1, 132] as Miaoverse.Kernel_member,
    shadowBulbRadiusLs: ["fscalarGet", "fscalarSet", 1, 133] as Miaoverse.Kernel_member,
    shadowPenumbraRatioScale: ["fscalarGet", "fscalarSet", 1, 134] as Miaoverse.Kernel_member,

    vsmExponent: ["fscalarGet", "fscalarSet", 1, 136] as Miaoverse.Kernel_member,
    vsmDepthScale: ["fscalarGet", "fscalarSet", 1, 137] as Miaoverse.Kernel_member,
    vsmLightBleedReduction: ["fscalarGet", "fscalarSet", 1, 138] as Miaoverse.Kernel_member,

    fogStart: ["fscalarGet", "fscalarSet", 1, 140] as Miaoverse.Kernel_member,
    fogMaxOpacity: ["fscalarGet", "fscalarSet", 1, 141] as Miaoverse.Kernel_member,
    fogHeight: ["fscalarGet", "fscalarSet", 1, 142] as Miaoverse.Kernel_member,
    fogHeightFalloff: ["fscalarGet", "fscalarSet", 1, 143] as Miaoverse.Kernel_member,
    fogDensity: ["fscalarGet", "fscalarSet", 1, 144] as Miaoverse.Kernel_member,
    fogInscatteringStart: ["fscalarGet", "fscalarSet", 1, 145] as Miaoverse.Kernel_member,
    fogInscatteringSize: ["fscalarGet", "fscalarSet", 1, 146] as Miaoverse.Kernel_member,
    fogColorFromIbl: ["fscalarGet", "fscalarSet", 1, 147] as Miaoverse.Kernel_member,
} as const;
