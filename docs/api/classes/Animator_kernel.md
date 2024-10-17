[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Animator\_kernel

# Class: Animator\_kernel

动画组件内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Animator`](Animator.md), `any`\>

## Constructors

### new Animator\_kernel()

> **new Animator\_kernel**(`_global`): [`Animator_kernel`](Animator_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Animator_kernel`](Animator_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Animator, any>.constructor`

## Methods

### Create()

> **Create**(`targets`, `animationsList`, `pkg`?): `Promise`\<[`Animator`](Animator.md)\>

创建动画组件实例。

#### Parameters

• **targets**: [`Object3D`](Object3D.md)[]

动画驱动目标数组。

• **animationsList**: `string`[]

动画数据列表。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`Animator`](Animator.md)\>

异步返回动画组件实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `string` \| `number` \| `symbol`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Animator`](Animator.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Animator`](Animator.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Animator`](Animator.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Animator`](Animator.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### LoadAnimations()

> **LoadAnimations**(`uri`, `pkg`?): `Promise`\<`object`\>

装载动画数据。

#### Parameters

• **uri**: `string`

动画数据URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<`object`\>

异步返回动画数据。

##### asset

> **asset**: [`Asset_animations`](../interfaces/Asset_animations.md)

动画数据资产信息。

##### clips

> **clips**: [`AnimationClip`](AnimationClip.md)[]

动画片段数组。

##### data

> **data**: `Uint32Array`

动画数据。

##### refCount

> **refCount**: `number`

动画数据引用计数。

***

### ReleaseAnimations()

> **ReleaseAnimations**(`uuid`): `void`

释放动画数据。

#### Parameters

• **uuid**: `string`

动画数据ID。

#### Returns

`void`

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `string` \| `number` \| `symbol`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)

***

### Update()

> **Update**(`animator_id`): `void`

更新动画组件（对象在视锥范围内时触发调用）。

#### Parameters

• **animator\_id**: `number`

动画组件ID。

#### Returns

`void`
