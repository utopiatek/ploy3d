[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Shader\_kernel

# Class: Shader\_kernel

着色器资源实例管理器（没有内核实现）。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`ShaderRes`](ShaderRes.md), `any`\>

## Constructors

### new Shader\_kernel()

> **new Shader\_kernel**(`_global`): [`Shader_kernel`](Shader_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Shader_kernel`](Shader_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<ShaderRes, any>.constructor`

## Methods

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

> **GetInstanceByID**(`id`): [`ShaderRes`](ShaderRes.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`ShaderRes`](ShaderRes.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`ShaderRes`](ShaderRes.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`ShaderRes`](ShaderRes.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### Load()

> **Load**(`uri`, `pkg`?): `Promise`\<[`ShaderRes`](ShaderRes.md)\>

装载着色器资源。

#### Parameters

• **uri**: `string`

着色器资源URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`ShaderRes`](ShaderRes.md)\>

异步返回着色器资源实例。

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
