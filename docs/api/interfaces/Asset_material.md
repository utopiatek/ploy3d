[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset\_material

# Interface: Asset\_material

材质资源描述符。

## Extends

- [`Asset`](Asset.md)

## Properties

### classid

> **classid**: `number`

资源类型ID。

#### Inherited from

[`Asset`](Asset.md).[`classid`](Asset.md#classid)

***

### flags

> **flags**: `number`

渲染设置标记集（RENDER_FLAGS）。

***

### label

> **label**: `string`

用户可理解的外部标签。

#### Inherited from

[`Asset`](Asset.md).[`label`](Asset.md#label)

***

### name

> **name**: `string`

内部名称（同级唯一，优先使用名称在同级中查找）。

#### Inherited from

[`Asset`](Asset.md).[`name`](Asset.md#name)

***

### properties

> **properties**: `object`

材质属性集。

#### textures

> **textures**: `Record`\<`string`, [`TextureNode`](TextureNode.md)\>

贴图属性设置列表。

#### vectors

> **vectors**: `Record`\<`string`, `number`[]\>

向量属性设置列表（标量被视为一维向量）。

***

### shader

> **shader**: `string`

着色器URI。

***

### uuid

> **uuid**: `string`

全局唯一ID。

#### Inherited from

[`Asset`](Asset.md).[`uuid`](Asset.md#uuid)
