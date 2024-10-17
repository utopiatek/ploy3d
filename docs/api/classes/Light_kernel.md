[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Light\_kernel

# Class: Light\_kernel

光源组件内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Light`](Light.md), *typeof* [`Light_member_index`](../variables/Light_member_index.md)\>

## Constructors

### new Light\_kernel()

> **new Light\_kernel**(`_global`): [`Light_kernel`](Light_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Light_kernel`](Light_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Light, typeof Light_member_index>.constructor`

## Methods

### Create()

> **Create**(`object3d`, `asset`): `Promise`\<[`Light`](Light.md)\>

创建光源组件实例。

#### Parameters

• **object3d**: [`Object3D`](Object3D.md)

• **asset**: [`Asset_light`](../interfaces/Asset_light.md)

光源组件描述符。

#### Returns

`Promise`\<[`Light`](Light.md)\>

异步返回光源组件实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"object"` \| `"id"` \| `"color"` \| `"direction"` \| `"position"` \| `"next"` \| `"extra"` \| `"radius"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"reserved"` \| `"enabled"` \| `"flags"` \| `"lastSib"` \| `"nextSib"` \| `"lux"` \| `"falloff"` \| `"spotCone"` \| `"spotScaleOffset"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Light`](Light.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Light`](Light.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Light`](Light.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Light`](Light.md)

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

• **key**: `"object"` \| `"id"` \| `"color"` \| `"direction"` \| `"position"` \| `"next"` \| `"extra"` \| `"radius"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"reserved"` \| `"enabled"` \| `"flags"` \| `"lastSib"` \| `"nextSib"` \| `"lux"` \| `"falloff"` \| `"spotCone"` \| `"spotScaleOffset"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
