[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Volume\_member\_index

# Variable: Volume\_member\_index

> `const` **Volume\_member\_index**: `object`

体积组件（80 + 512 = 592字节）。

## Type declaration

### aoBentNormals

> `readonly` **aoBentNormals**: [`Kernel_member`](../type-aliases/Kernel_member.md)

SSAO，0: no AO bent normal, >0.0 AO bent normals。

### aoSamplingQualityAndEdgeDistance

> `readonly` **aoSamplingQualityAndEdgeDistance**: [`Kernel_member`](../type-aliases/Kernel_member.md)

SSAO，采样参数，0: bilinear, !0: bilateral edge distance。

### byteSize

> `readonly` **byteSize**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### cascades

> `readonly` **cascades**: [`Kernel_member`](../type-aliases/Kernel_member.md)

bit 0-3: cascade count
bit 4: visualize cascades
bit 8-11: cascade has visible shadows

### directionalShadows

> `readonly` **directionalShadows**: [`Kernel_member`](../type-aliases/Kernel_member.md)

bit 0: directional (sun) shadow enabled
bit 1: directional (sun) screen-space contact shadow enabled
bit 8-15: screen-space contact shadows ray casting steps

### enabled

> `readonly` **enabled**: [`Kernel_member`](../type-aliases/Kernel_member.md)

是否启用组件。

### fogColor

> `readonly` **fogColor**: [`Kernel_member`](../type-aliases/Kernel_member.md)

雾颜色。

### fogColorFromIbl

> `readonly` **fogColorFromIbl**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogDensity

> `readonly` **fogDensity**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogHeight

> `readonly` **fogHeight**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogHeightFalloff

> `readonly` **fogHeightFalloff**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogInscatteringSize

> `readonly` **fogInscatteringSize**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogInscatteringStart

> `readonly` **fogInscatteringStart**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogMaxOpacity

> `readonly` **fogMaxOpacity**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### fogStart

> `readonly` **fogStart**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### iblLuminance

> `readonly` **iblLuminance**: [`Kernel_member`](../type-aliases/Kernel_member.md)

IBL，亮度。

### iblPitch

> `readonly` **iblPitch**: [`Kernel_member`](../type-aliases/Kernel_member.md)

天空球绕X轴旋转角度。

### iblRoll

> `readonly` **iblRoll**: [`Kernel_member`](../type-aliases/Kernel_member.md)

天空球绕Z轴旋转角度。

### iblRoughnessOneLevel

> `readonly` **iblRoughnessOneLevel**: [`Kernel_member`](../type-aliases/Kernel_member.md)

IBL，粗糙度为1的纹理链级别。

### iblSH

> `readonly` **iblSH**: [`Kernel_member`](../type-aliases/Kernel_member.md)

IBL，球谐系数。

### iblYaw

> `readonly` **iblYaw**: [`Kernel_member`](../type-aliases/Kernel_member.md)

天空球绕Y轴旋转角度。

### id

> `readonly` **id**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### last

> `readonly` **last**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### lastSib

> `readonly` **lastSib**: [`Kernel_member`](../type-aliases/Kernel_member.md)

上一个兄弟组件实例（场景中）。

### lightFarAttenuationParams

> `readonly` **lightFarAttenuationParams**: [`Kernel_member`](../type-aliases/Kernel_member.md)

太阳光光照距离衰减参数：a, a/far (a=1/pct-of-far)。

### magic

> `readonly` **magic**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### next

> `readonly` **next**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### nextSib

> `readonly` **nextSib**: [`Kernel_member`](../type-aliases/Kernel_member.md)

下一个兄弟组件实例（场景中）。

### object

> `readonly` **object**: [`Kernel_member`](../type-aliases/Kernel_member.md)

组件所属对象。

### readTS

> `readonly` **readTS**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### refCount

> `readonly` **refCount**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### refractionLodOffset

> `readonly` **refractionLodOffset**: [`Kernel_member`](../type-aliases/Kernel_member.md)

反射贴图采样LOD偏移。

### shadowBias

> `readonly` **shadowBias**: [`Kernel_member`](../type-aliases/Kernel_member.md)

阴影，法向偏移。

### shadowBulbRadiusLs

> `readonly` **shadowBulbRadiusLs**: [`Kernel_member`](../type-aliases/Kernel_member.md)

阴影，光照空间的光源半径。

### shadowDisable

> `readonly` **shadowDisable**: [`Kernel_member`](../type-aliases/Kernel_member.md)

阴影，禁用太阳光照阴影。

### shadowPenumbraRatioScale

> `readonly` **shadowPenumbraRatioScale**: [`Kernel_member`](../type-aliases/Kernel_member.md)

阴影，用于DPCF、PCSS，用于艺术用途的比例半影。

### shadowSamplingType

> `readonly` **shadowSamplingType**: [`Kernel_member`](../type-aliases/Kernel_member.md)

阴影类型，0: PCF, 1: VSM，2: DPCF, 3: PCSS。

### ssaoDisable

> `readonly` **ssaoDisable**: [`Kernel_member`](../type-aliases/Kernel_member.md)

是否禁用SSAO。

### ssContactShadowDistance

> `readonly` **ssContactShadowDistance**: [`Kernel_member`](../type-aliases/Kernel_member.md)

屏幕空间接触阴影距离。

### ssrBias

> `readonly` **ssrBias**: [`Kernel_member`](../type-aliases/Kernel_member.md)

屏幕空间反射用的射线的起点偏移。

### ssrDisable

> `readonly` **ssrDisable**: [`Kernel_member`](../type-aliases/Kernel_member.md)

是否禁用SSR。

### ssrDistance

> `readonly` **ssrDistance**: [`Kernel_member`](../type-aliases/Kernel_member.md)

屏幕空间反射用的射线最大追踪距离。

### ssrStride

> `readonly` **ssrStride**: [`Kernel_member`](../type-aliases/Kernel_member.md)

屏幕空间反射用的射线追踪步进像素数。

### ssrThickness

> `readonly` **ssrThickness**: [`Kernel_member`](../type-aliases/Kernel_member.md)

屏幕空间反射用的物体厚度，用于相交测试。

### sunlitColorIntensity

> `readonly` **sunlitColorIntensity**: [`Kernel_member`](../type-aliases/Kernel_member.md)

太阳光照颜色和强度。

### sunlitDirection

> `readonly` **sunlitDirection**: [`Kernel_member`](../type-aliases/Kernel_member.md)

太阳光照全局空间方向光方向。

### sunlitDisable

> `readonly` **sunlitDisable**: [`Kernel_member`](../type-aliases/Kernel_member.md)

禁用太阳光照。

### sunParams

> `readonly` **sunParams**: [`Kernel_member`](../type-aliases/Kernel_member.md)

太阳圆盘参数：cos(sunAngle), sin(sunAngle), 1/(sunAngle*HALO_SIZE-sunAngle), HALO_EXP。

### temporalNoise

> `readonly` **temporalNoise**: [`Kernel_member`](../type-aliases/Kernel_member.md)

噪音系数[0, 1]，当不使用TAA时取0。

### updated

> `readonly` **updated**: [`Kernel_member`](../type-aliases/Kernel_member.md)

体积参数是否有更新。

### uuid

> `readonly` **uuid**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### version

> `readonly` **version**: [`Kernel_member`](../type-aliases/Kernel_member.md)

### vsmDepthScale

> `readonly` **vsmDepthScale**: [`Kernel_member`](../type-aliases/Kernel_member.md)

用于VSM最小方差计算。

### vsmExponent

> `readonly` **vsmExponent**: [`Kernel_member`](../type-aliases/Kernel_member.md)

VSM阴影指数。

### vsmLightBleedReduction

> `readonly` **vsmLightBleedReduction**: [`Kernel_member`](../type-aliases/Kernel_member.md)

VSM阴影漏光问题，设定一个最小光照可见度，结果小于该最小光照可见度视为光照不可见。

### writeTS

> `readonly` **writeTS**: [`Kernel_member`](../type-aliases/Kernel_member.md)
