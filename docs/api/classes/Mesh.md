[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Mesh

# Class: Mesh

网格资源实例。

## Extends

- [`Resource`](Resource.md)\<[`Mesh`](Mesh.md)\>

## Constructors

### new Mesh()

> **new Mesh**(`impl`, `ptr`, `id`): [`Mesh`](Mesh.md)

构造函数。

#### Parameters

• **impl**: [`Mesh_kernel`](Mesh_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Mesh`](Mesh.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### center

> `get` **center**(): `ArrayLike`\<`number`\>

包围盒中心。

#### Returns

`ArrayLike`\<`number`\>

***

### extents

> `get` **extents**(): `ArrayLike`\<`number`\>

包围盒范围。

#### Returns

`ArrayLike`\<`number`\>

***

### ibCount

> `get` **ibCount**(): `number`

索引缓存数量（子网格数量）。

#### Returns

`number`

***

### ibFormat

> `get` **ibFormat**(): `number`

索引缓存格式：2 | 4。

#### Returns

`number`

***

### iCount

> `get` **iCount**(): `number`

网格索引数量。

#### Returns

`number`

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

### ptrData

> `get` **ptrData**(): `never`

网格数据指针。

#### Returns

`never`

***

### ptrIB

> `get` **ptrIB**(): `never`

索引缓存数组指针。

#### Returns

`never`

***

### ptrVB

> `get` **ptrVB**(): `never`

顶点缓存数组指针。

#### Returns

`never`

***

### skeleton

> `get` **skeleton**(): `object`

骨骼蒙皮数据对应的骨架信息。

#### Returns

`object`

##### joints

> **joints**: `string`[]

骨架绑定名称数组。

##### root

> **root**: `number`

根关节（建模空间）索引。

##### skeleton

> **skeleton**: `never`

骨架数据指针（提供建模空间到初始骨骼空间变换矩阵数据）。

***

### skinMethod

> `get` **skinMethod**(): `number`

蒙皮方法（0-默认，1-三角形混合蒙皮"TriAx"）。

#### Returns

`number`

***

### triangles

> `get` **triangles**(): `object`[]

索引缓存数组。

#### Returns

`object`[]

***

### vbCount

> `get` **vbCount**(): `number`

顶点缓存数量。

#### Returns

`number`

***

### vbLayout

> `get` **vbLayout**(): `number`

顶点缓存数组布局（组合标记）。

#### Returns

`number`

***

### vCount

> `get` **vCount**(): `number`

网格顶点数量。

#### Returns

`number`

***

### vertices

> `get` **vertices**(): `object`[]

顶点缓存数组。

#### Returns

`object`[]

## Methods

### AddRef()

> **AddRef**(): `void`

增加实例引用。

#### Returns

`void`

***

### Release()

> **Release**(): `void`

释放实例引用。

#### Returns

`void`
