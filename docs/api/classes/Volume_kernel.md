[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Volume\_kernel

# Class: Volume\_kernel

体积组件内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Volume`](Volume.md), *typeof* [`Volume_member_index`](../variables/Volume_member_index.md)\>

## Constructors

### new Volume\_kernel()

> **new Volume\_kernel**(`_global`): [`Volume_kernel`](Volume_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Volume_kernel`](Volume_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Volume, typeof Volume_member_index>.constructor`

## Methods

### Create()

> **Create**(`object3d`): `Promise`\<[`Volume`](Volume.md)\>

创建体积组件实例。

#### Parameters

• **object3d**: [`Object3D`](Object3D.md)

#### Returns

`Promise`\<[`Volume`](Volume.md)\>

返回体积组件实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"object"` \| `"id"` \| `"next"` \| `"updated"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"enabled"` \| `"lastSib"` \| `"nextSib"` \| `"iblPitch"` \| `"iblYaw"` \| `"iblRoll"` \| `"iblSH"` \| `"fogColor"` \| `"sunParams"` \| `"sunlitColorIntensity"` \| `"sunlitDirection"` \| `"sunlitDisable"` \| `"lightFarAttenuationParams"` \| `"iblLuminance"` \| `"iblRoughnessOneLevel"` \| `"ssaoDisable"` \| `"ssrDisable"` \| `"ssrThickness"` \| `"ssrBias"` \| `"ssrDistance"` \| `"ssrStride"` \| `"refractionLodOffset"` \| `"temporalNoise"` \| `"aoSamplingQualityAndEdgeDistance"` \| `"aoBentNormals"` \| `"cascades"` \| `"directionalShadows"` \| `"ssContactShadowDistance"` \| `"shadowSamplingType"` \| `"shadowBias"` \| `"shadowBulbRadiusLs"` \| `"shadowPenumbraRatioScale"` \| `"shadowDisable"` \| `"vsmExponent"` \| `"vsmDepthScale"` \| `"vsmLightBleedReduction"` \| `"fogStart"` \| `"fogMaxOpacity"` \| `"fogHeight"` \| `"fogHeightFalloff"` \| `"fogDensity"` \| `"fogInscatteringStart"` \| `"fogInscatteringSize"` \| `"fogColorFromIbl"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Volume`](Volume.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Volume`](Volume.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Volume`](Volume.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Volume`](Volume.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"object"` \| `"id"` \| `"next"` \| `"updated"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"enabled"` \| `"lastSib"` \| `"nextSib"` \| `"iblPitch"` \| `"iblYaw"` \| `"iblRoll"` \| `"iblSH"` \| `"fogColor"` \| `"sunParams"` \| `"sunlitColorIntensity"` \| `"sunlitDirection"` \| `"sunlitDisable"` \| `"lightFarAttenuationParams"` \| `"iblLuminance"` \| `"iblRoughnessOneLevel"` \| `"ssaoDisable"` \| `"ssrDisable"` \| `"ssrThickness"` \| `"ssrBias"` \| `"ssrDistance"` \| `"ssrStride"` \| `"refractionLodOffset"` \| `"temporalNoise"` \| `"aoSamplingQualityAndEdgeDistance"` \| `"aoBentNormals"` \| `"cascades"` \| `"directionalShadows"` \| `"ssContactShadowDistance"` \| `"shadowSamplingType"` \| `"shadowBias"` \| `"shadowBulbRadiusLs"` \| `"shadowPenumbraRatioScale"` \| `"shadowDisable"` \| `"vsmExponent"` \| `"vsmDepthScale"` \| `"vsmLightBleedReduction"` \| `"fogStart"` \| `"fogMaxOpacity"` \| `"fogHeight"` \| `"fogHeightFalloff"` \| `"fogDensity"` \| `"fogInscatteringStart"` \| `"fogInscatteringSize"` \| `"fogColorFromIbl"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
