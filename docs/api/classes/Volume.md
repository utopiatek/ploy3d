[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Volume

# Class: Volume

体积组件。

## Extends

- [`Resource`](Resource.md)\<[`Volume`](Volume.md)\>

## Constructors

### new Volume()

> **new Volume**(`impl`, `ptr`, `id`): [`Volume`](Volume.md)

构造函数。

#### Parameters

• **impl**: [`Volume_kernel`](Volume_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Volume`](Volume.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### aoBentNormals

> `get` **aoBentNormals**(): `number`

SSAO，0: no AO bent normal, >0.0 AO bent normals。

> `set` **aoBentNormals**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### aoSamplingQualityAndEdgeDistance

> `get` **aoSamplingQualityAndEdgeDistance**(): `number`

SSAO，采样参数，0: bilinear, !0: bilateral edge distance。

> `set` **aoSamplingQualityAndEdgeDistance**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### cascades

> `get` **cascades**(): `number`

bit 0-3: cascade count
bit 4: visualize cascades
bit 8-11: cascade has visible shadows

> `set` **cascades**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### directionalShadows

> `get` **directionalShadows**(): `number`

bit 0: directional (sun) shadow enabled
bit 1: directional (sun) screen-space contact shadow enabled
bit 8-15: screen-space contact shadows ray casting steps

> `set` **directionalShadows**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### enabled

> `get` **enabled**(): `boolean`

是否启用组件。

> `set` **enabled**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### fogColor

> `get` **fogColor**(): `Float32Array`

雾颜色。

> `set` **fogColor**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### fogColorFromIbl

> `get` **fogColorFromIbl**(): `number`

。

> `set` **fogColorFromIbl**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogDensity

> `get` **fogDensity**(): `number`

(density/falloff)*exp(-falloff*(camera.y - fogHeight))。

> `set` **fogDensity**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogHeight

> `get` **fogHeight**(): `number`

。

> `set` **fogHeight**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogHeightFalloff

> `get` **fogHeightFalloff**(): `number`

falloff * 1.44269。

> `set` **fogHeightFalloff**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogInscatteringSize

> `get` **fogInscatteringSize**(): `number`

。

> `set` **fogInscatteringSize**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogInscatteringStart

> `get` **fogInscatteringStart**(): `number`

。

> `set` **fogInscatteringStart**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogMaxOpacity

> `get` **fogMaxOpacity**(): `number`

。

> `set` **fogMaxOpacity**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fogStart

> `get` **fogStart**(): `number`

。

> `set` **fogStart**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### iblLuminance

> `get` **iblLuminance**(): `number`

IBL亮度缩放。

> `set` **iblLuminance**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### iblPitch

> `get` **iblPitch**(): `number`

IBL绕X轴旋转角度。

> `set` **iblPitch**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### iblRoll

> `get` **iblRoll**(): `number`

IBL绕Z轴旋转角度。

> `set` **iblRoll**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### iblRoughnessOneLevel

> `get` **iblRoughnessOneLevel**(): `number`

IBL粗糙度为1的纹理链级别。

> `set` **iblRoughnessOneLevel**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### iblSH

> `get` **iblSH**(): `Float32Array`

IBL球谐系数。

> `set` **iblSH**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### iblYaw

> `get` **iblYaw**(): `number`

IBL绕Y轴旋转角度。

> `set` **iblYaw**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

#### Inherited from

[`Resource`](Resource.md).[`id`](Resource.md#id)

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`

#### Inherited from

[`Resource`](Resource.md).[`internalPtr`](Resource.md#internalptr)

***

### lightFarAttenuationParams

> `get` **lightFarAttenuationParams**(): `Float32Array`

太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。

> `set` **lightFarAttenuationParams**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### readTS

> `get` **readTS**(): `number`

体积参数应用时间戳。

> `set` **readTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### refractionLodOffset

> `get` **refractionLodOffset**(): `number`

反射贴图采样LOD偏移。

> `set` **refractionLodOffset**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowBias

> `get` **shadowBias**(): `number`

阴影，法向偏移。

> `set` **shadowBias**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowBulbRadiusLs

> `get` **shadowBulbRadiusLs**(): `number`

阴影，光照空间的光源半径。

> `set` **shadowBulbRadiusLs**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowDisable

> `get` **shadowDisable**(): `number`

阴影，禁用太阳光照阴影。

> `set` **shadowDisable**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowPenumbraRatioScale

> `get` **shadowPenumbraRatioScale**(): `number`

阴影，用于DPCF、PCSS，用于艺术用途的比例半影。

> `set` **shadowPenumbraRatioScale**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowSamplingType

> `get` **shadowSamplingType**(): `number`

阴影类型，0: PCF, 1: VSM，2: DPCF, 3: PCSS。

> `set` **shadowSamplingType**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssaoDisable

> `get` **ssaoDisable**(): `number`

是否禁用SSAO。

> `set` **ssaoDisable**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssContactShadowDistance

> `get` **ssContactShadowDistance**(): `number`

屏幕空间接触阴影距离。

> `set` **ssContactShadowDistance**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssrBias

> `get` **ssrBias**(): `number`

屏幕空间反射用的射线的起点偏移。

> `set` **ssrBias**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssrDisable

> `get` **ssrDisable**(): `number`

是否禁用SSR。

> `set` **ssrDisable**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssrDistance

> `get` **ssrDistance**(): `number`

屏幕空间反射用的射线最大追踪距离。

> `set` **ssrDistance**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssrStride

> `get` **ssrStride**(): `number`

屏幕空间反射用的射线追踪步进像素数。

> `set` **ssrStride**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### ssrThickness

> `get` **ssrThickness**(): `number`

屏幕空间反射用的物体厚度，用于相交测试。

> `set` **ssrThickness**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### sunlitColorIntensity

> `get` **sunlitColorIntensity**(): `Float32Array`

太阳光照颜色和强度。

> `set` **sunlitColorIntensity**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### sunlitDirection

> `get` **sunlitDirection**(): `Float32Array`

太阳光照全局空间方向光方向。

> `set` **sunlitDirection**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### sunlitDisable

> `get` **sunlitDisable**(): `number`

禁用太阳光照。

> `set` **sunlitDisable**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### sunParams

> `get` **sunParams**(): `Float32Array`

太阳圆盘参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP。

> `set` **sunParams**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### temporalNoise

> `get` **temporalNoise**(): `number`

噪音系数[0, 1]，当不使用TAA时取0。

> `set` **temporalNoise**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### updated

> `get` **updated**(): `boolean`

体积参数是否有更新。

> `set` **updated**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

***

### vsmDepthScale

> `get` **vsmDepthScale**(): `number`

用于VSM最小方差计算。

> `set` **vsmDepthScale**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### vsmExponent

> `get` **vsmExponent**(): `number`

VSM阴影指数。

> `set` **vsmExponent**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### vsmLightBleedReduction

> `get` **vsmLightBleedReduction**(): `number`

VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见。

> `set` **vsmLightBleedReduction**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### writeTS

> `get` **writeTS**(): `number`

体积参数更新时间戳。

> `set` **writeTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`
