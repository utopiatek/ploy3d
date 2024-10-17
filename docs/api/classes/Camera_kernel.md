[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Camera\_kernel

# Class: Camera\_kernel

相机组件内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Camera`](Camera.md), *typeof* [`Camera_member_index`](../variables/Camera_member_index.md)\>

## Constructors

### new Camera\_kernel()

> **new Camera\_kernel**(`_global`): [`Camera_kernel`](Camera_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Camera_kernel`](Camera_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Camera, typeof Camera_member_index>.constructor`

## Methods

### Create()

> **Create**(`object3d`): `Promise`\<[`Camera`](Camera.md)\>

创建相机组件实例。

#### Parameters

• **object3d**: [`Object3D`](Object3D.md)

#### Returns

`Promise`\<[`Camera`](Camera.md)\>

返回相机组件实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"object"` \| `"type"` \| `"id"` \| `"height"` \| `"width"` \| `"target"` \| `"next"` \| `"distance"` \| `"depth"` \| `"updated"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"vfgMat"` \| `"gfvMat"` \| `"cfvMat"` \| `"vfcMat"` \| `"cfgMat"` \| `"gfcMat"` \| `"gfwMat"` \| `"wfgMat"` \| `"uvfvMat"` \| `"last_uvfvMat"` \| `"lastcfwMat"` \| `"cullingMat"` \| `"cullingFilter"` \| `"pitch"` \| `"yaw"` \| `"roll"` \| `"fov"` \| `"nearZ"` \| `"farZ"` \| `"flags"` \| `"lastSib"` \| `"nextSib"` \| `"wPos"` \| `"wDir"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Camera`](Camera.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Camera`](Camera.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Camera`](Camera.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Camera`](Camera.md)

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

• **key**: `"object"` \| `"type"` \| `"id"` \| `"height"` \| `"width"` \| `"target"` \| `"next"` \| `"distance"` \| `"depth"` \| `"updated"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"vfgMat"` \| `"gfvMat"` \| `"cfvMat"` \| `"vfcMat"` \| `"cfgMat"` \| `"gfcMat"` \| `"gfwMat"` \| `"wfgMat"` \| `"uvfvMat"` \| `"last_uvfvMat"` \| `"lastcfwMat"` \| `"cullingMat"` \| `"cullingFilter"` \| `"pitch"` \| `"yaw"` \| `"roll"` \| `"fov"` \| `"nearZ"` \| `"farZ"` \| `"flags"` \| `"lastSib"` \| `"nextSib"` \| `"wPos"` \| `"wDir"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
