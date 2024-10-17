[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset\_texture

# Interface: Asset\_texture

贴图资源描述符。

## Extends

- [`Asset`](Asset.md)

## Properties

### bitmap?

> `optional` **bitmap**: [`GLTextureSource`](GLTextureSource.md)

位图资源。

***

### classid

> **classid**: `number`

资源类型ID。

#### Inherited from

[`Asset`](Asset.md).[`classid`](Asset.md#classid)

***

### has\_alpha?

> `optional` **has\_alpha**: `boolean`

是否包含A通道。

***

### label

> **label**: `string`

用户可理解的外部标签。

#### Inherited from

[`Asset`](Asset.md).[`label`](Asset.md#label)

***

### map\_gamma?

> `optional` **map\_gamma**: `number`

表示图像灰度系数的浮点数（小于或等于0则由程序计算出）。

***

### mime?

> `optional` **mime**: `string`

贴图类型。

***

### name

> **name**: `string`

内部名称（同级唯一，优先使用名称在同级中查找）。

#### Inherited from

[`Asset`](Asset.md).[`name`](Asset.md#name)

***

### uri?

> `optional` **uri**: `string`

贴图文件URI（如果未设置则从UUID加载）。

***

### uuid

> **uuid**: `string`

全局唯一ID。

#### Inherited from

[`Asset`](Asset.md).[`uuid`](Asset.md#uuid)
