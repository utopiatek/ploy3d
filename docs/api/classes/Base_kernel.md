[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Base\_kernel

# Class: Base\_kernel\<T, K\>

资源内核实现基类。

## Extended by

- [`Shader_kernel`](Shader_kernel.md)
- [`Texture_kernel`](Texture_kernel.md)
- [`Material_kernel`](Material_kernel.md)
- [`Mesh_kernel`](Mesh_kernel.md)
- [`MeshRenderer_kernel`](MeshRenderer_kernel.md)
- [`Camera_kernel`](Camera_kernel.md)
- [`Light_kernel`](Light_kernel.md)
- [`Volume_kernel`](Volume_kernel.md)
- [`Animator_kernel`](Animator_kernel.md)
- [`Dioramas_kernel`](Dioramas_kernel.md)
- [`Object_kernel`](Object_kernel.md)
- [`Scene_kernel`](Scene_kernel.md)

## Type Parameters

• **T**

• **K** *extends* *typeof* [`Binary_member_index`](../variables/Binary_member_index.md)

## Methods

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: keyof `K`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): `T`

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

`T`

返回资源实例。

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): `T`

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

`T`

返回资源实例。

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: keyof `K`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`
