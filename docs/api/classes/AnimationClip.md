[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / AnimationClip

# Class: AnimationClip

动画片段实例。

## Constructors

### new AnimationClip()

> **new AnimationClip**(`_data`, `_animations`): [`AnimationClip`](AnimationClip.md)

构造函数。

#### Parameters

• **\_data**: `Uint32Array`

动画片段数据。

• **\_animations**: `any`

动画集。

#### Returns

[`AnimationClip`](AnimationClip.md)

## Accessors

### channels

> `get` **channels**(): `object`[]

动画驱动通道数组。

#### Returns

`object`[]

***

### index

> `get` **index**(): `number`

当前动画片段在所在动画数据包中的索引。

#### Returns

`number`

***

### samplers

> `get` **samplers**(): `object`[]

动画数据采样器数组。

#### Returns

`object`[]

***

### targetCount

> `get` **targetCount**(): `number`

驱动目标对象数量。

#### Returns

`number`

***

### timestampMax

> `get` **timestampMax**(): `number`

动画片段时间线上最大时间戳。

#### Returns

`number`
