[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset\_mesh

# Interface: Asset\_mesh

网格资源描述符。

## Extends

- [`Asset`](Asset.md)

## Properties

### classid

> **classid**: `number`

资源类型ID。

#### Inherited from

[`Asset`](Asset.md).[`classid`](Asset.md#classid)

***

### creater?

> `optional` **creater**: [`Asset_mesh_creater`](Asset_mesh_creater.md)

网格几何数据构建器。

***

### geometry?

> `optional` **geometry**: `string`

基础几何体URI（仅包含第1顶点缓存，meshdata与geometry&uv_set二选一）。

***

### label

> **label**: `string`

用户可理解的外部标签。

#### Inherited from

[`Asset`](Asset.md).[`label`](Asset.md#label)

***

### meshdata?

> `optional` **meshdata**: `string`

网格数据URI（集合了ASSET_MESH_GEOMETRY、ASSET_MESH_UVSET、ASSET_SKIN等数据）。

***

### name

> **name**: `string`

内部名称（同级唯一，优先使用名称在同级中查找）。

#### Inherited from

[`Asset`](Asset.md).[`name`](Asset.md#name)

***

### skeleton\_skin?

> `optional` **skeleton\_skin**: `object`

骨骼蒙皮数据（用于构建第2顶点缓存）。
需要保证网格和骨骼蒙皮是匹配的。
对于从基础几何体构建的网格，蒙皮数据需要从基础几何体映射到带UV网格体。

#### joints

> **joints**: `string`[]

骨架绑定名称数组。

#### root

> **root**: `number`

根关节（建模空间）索引。

#### skeleton

> **skeleton**: `string`

骨架数据URL。

#### skin?

> `optional` **skin**: `string`

蒙皮数据URL。

***

### static\_morph?

> `optional` **static\_morph**: `object`[]

静态网格变形数据URI数组（构建网格资源实例时变形）。

***

### uuid

> **uuid**: `string`

全局唯一ID。

#### Inherited from

[`Asset`](Asset.md).[`uuid`](Asset.md#uuid)

***

### uv\_set?

> `optional` **uv\_set**: `string`

UV数据URI。
