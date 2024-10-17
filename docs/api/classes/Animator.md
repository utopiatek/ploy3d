[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Animator

# Class: Animator

动画组件实例。

## Extends

- [`Resource`](Resource.md)\<[`Animator`](Animator.md)\>

## Constructors

### new Animator()

> **new Animator**(`impl`, `ptr`, `id`): [`Animator`](Animator.md)

构造函数。

#### Parameters

• **impl**: [`Animator_kernel`](Animator_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Animator`](Animator.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### ctrl

> `get` **ctrl**(): [`AnimationCtrl`](AnimationCtrl.md)

动画控制器。

#### Returns

[`AnimationCtrl`](AnimationCtrl.md)

***

### enabled

> `get` **enabled**(): `boolean`

> `set` **enabled**(`b`): `void`

启用动画播放。

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

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

### targets

> `get` **targets**(): [`Object3D`](Object3D.md)[]

> `set` **targets**(`targets`): `void`

动画驱动目标数组。

#### Parameters

• **targets**: [`Object3D`](Object3D.md)[]

#### Returns

[`Object3D`](Object3D.md)[]

## Methods

### AddClip()

> **AddClip**(`data`): `number`

添加动画片段实例。

#### Parameters

• **data**: [`AnimationClip`](AnimationClip.md)

动画片段数据。

#### Returns

`number`

返回动画片段实例索引。

***

### RemoveClip()

> **RemoveClip**(`_clip`): `void`

移除动画片段实例。

#### Parameters

• **\_clip**: `number`

#### Returns

`void`

***

### SampleClip()

> **SampleClip**(`_clip`, `_curTS`?, `_startTS`?): `void`

采样动画片段。

#### Parameters

• **\_clip**: `number`

动画片段索引。

• **\_curTS?**: `number`

当前时间。

• **\_startTS?**: `number`

起始播放时间

#### Returns

`void`

***

### SetValue()

> **SetValue**(`target`, `attr`, `value`): `void`

设置动画关节帧数据。

#### Parameters

• **target**: `number`

驱动目标对象索引。

• **attr**: `number`

目标属性类型。

• **value**: `number`[]

属性值。

#### Returns

`void`

***

### Update()

> **Update**(): `void`

更新动画帧。

#### Returns

`void`
