[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Object\_kernel

# Class: Object\_kernel

3D对象内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Object3D`](Object3D.md), *typeof* [`Object_member_index`](../variables/Object_member_index.md)\>

## Constructors

### new Object\_kernel()

> **new Object\_kernel**(`_global`): [`Object_kernel`](Object_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Object_kernel`](Object_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Object3D, typeof Object_member_index>.constructor`

## Methods

### Create()

> **Create**(`scene`): `Promise`\<[`Object3D`](Object3D.md)\>

创建3D对象实例。

#### Parameters

• **scene**: [`Scene`](Scene.md)

#### Returns

`Promise`\<[`Object3D`](Object3D.md)\>

返回3D对象实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"index"` \| `"name"` \| `"id"` \| `"source"` \| `"children"` \| `"next"` \| `"parent"` \| `"depth"` \| `"instance"` \| `"updated"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"camera"` \| `"light"` \| `"reserved"` \| `"enabled"` \| `"flags"` \| `"lastSib"` \| `"nextSib"` \| `"parentTS"` \| `"gisTS"` \| `"childCount"` \| `"nextEdit"` \| `"nextDraw"` \| `"scene"` \| `"worldRotation"` \| `"reserved2"` \| `"wfmMat"` \| `"mfwMat"` \| `"layers"` \| `"worldLLMC"` \| `"localPosition"` \| `"altitude"` \| `"localScale"` \| `"localRotation"` \| `"meshRenderer"` \| `"animator"` \| `"prefab"` \| `"unused2"` \| `"unused3"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Object3D`](Object3D.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Object3D`](Object3D.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Object3D`](Object3D.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Object3D`](Object3D.md)

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

• **key**: `"index"` \| `"name"` \| `"id"` \| `"source"` \| `"children"` \| `"next"` \| `"parent"` \| `"depth"` \| `"instance"` \| `"updated"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"camera"` \| `"light"` \| `"reserved"` \| `"enabled"` \| `"flags"` \| `"lastSib"` \| `"nextSib"` \| `"parentTS"` \| `"gisTS"` \| `"childCount"` \| `"nextEdit"` \| `"nextDraw"` \| `"scene"` \| `"worldRotation"` \| `"reserved2"` \| `"wfmMat"` \| `"mfwMat"` \| `"layers"` \| `"worldLLMC"` \| `"localPosition"` \| `"altitude"` \| `"localScale"` \| `"localRotation"` \| `"meshRenderer"` \| `"animator"` \| `"prefab"` \| `"unused2"` \| `"unused3"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
