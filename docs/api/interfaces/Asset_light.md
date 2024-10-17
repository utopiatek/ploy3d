[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset\_light

# Interface: Asset\_light

光源组件资源。

## Extends

- [`Asset`](Asset.md)

## Properties

### channels?

> `optional` **channels**: `number`

光源所属通道集（仅对应通道打开时光源起作用）。

***

### classid

> **classid**: `number`

资源类型ID。

#### Inherited from

[`Asset`](Asset.md).[`classid`](Asset.md#classid)

***

### color

> **color**: `number`[]

光源颜色（线性空间RGB）。

***

### enabled

> **enabled**: `boolean`

是否启用。

***

### innerAngle?

> `optional` **innerAngle**: `number`

聚光灯的内部圆锥弧度（弧度，在~0.00873到outerAngle范围之间）。

***

### intensity

> **intensity**: `number`

光源强度：
对于方向光，它是以lux为单位的照度（太阳照度为100000lux）。
对于点光源和聚光灯，它是以lumen为单位的发光功率。

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

### outerAngle?

> `optional` **outerAngle**: `number`

聚光灯的外部圆锥弧度（弧度，在innerAngle到0.5PI范围之间）。

***

### radius?

> `optional` **radius**: `number`

点光源和聚光灯的影响半径。

***

### type

> **type**: `"sun"` \| `"directional"` \| `"point"` \| `"focused_spot"` \| `"spot"`

光源组件类型。

***

### uuid

> **uuid**: `string`

全局唯一ID。

#### Inherited from

[`Asset`](Asset.md).[`uuid`](Asset.md#uuid)
