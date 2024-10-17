[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / GLTextureSource

# Interface: GLTextureSource

贴图数据源。

## Properties

### data?

> `readonly` `optional` **data**: `ArrayBuffer`

位图数据（创建空贴图时需赋值空）。

***

### dataLayout?

> `readonly` `optional` **dataLayout**: `object`

位图数据布局。

#### bytesPerRow

> `readonly` **bytesPerRow**: `number`

位图行数据大小。

#### offset

> `readonly` **offset**: `number`

位图数据偏移。

#### rowsPerImage

> `readonly` **rowsPerImage**: `number`

位图行数量。

***

### format?

> `readonly` `optional` **format**: [`GLTextureFormat`](../type-aliases/GLTextureFormat.md)

位图格式。

***

### height

> `readonly` **height**: `number`

位图高度。

***

### layer?

> `optional` **layer**: `number`

位图数据写入纹理数组层。

***

### level?

> `optional` **level**: `number`

位图数据写入纹理层LOD级别。

***

### width

> `readonly` **width**: `number`

位图宽度。

***

### xoffset?

> `optional` **xoffset**: `number`

位图数据写入列偏移。

***

### yoffset?

> `optional` **yoffset**: `number`

位图数据写入行偏移。
