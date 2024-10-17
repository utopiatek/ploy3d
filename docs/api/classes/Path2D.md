[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Path2D

# Class: Path2D

UI路径实例。

## Constructors

### new Path2D()

> **new Path2D**(): [`Path2D`](Path2D.md)

构造函数。

#### Returns

[`Path2D`](Path2D.md)

## Properties

### applied

> **applied**: `boolean`

当前路径是否已应用。

***

### geometries

> **geometries**: `number`[]

几何数据单元数组（每个占用4个UINT）。

***

### geometryCount

> **geometryCount**: `number`

当前路径几何数据单元数量。

***

### type

> **type**: `number`

当前路径类型：
1-矩形；
2-圆形；
3-圆角矩形；
4-字符串；
5-路径；

## Methods

### Arc()

> **Arc**(`x`, `y`, `radius`, `startAngle`, `endAngle`): `void`

构造圆形数据。

#### Parameters

• **x**: `number`

圆形X像素坐标。

• **y**: `number`

圆形Y像素坐标。

• **radius**: `number`

半径像素大小。

• **startAngle**: `number`

起始弧度。

• **endAngle**: `number`

终止弧度。

#### Returns

`void`

***

### BeginPath()

> **BeginPath**(): `void`

开始路径设置。

#### Returns

`void`

***

### ClosePath()

> **ClosePath**(): `void`

闭合当前子路径。

#### Returns

`void`

***

### LineTo()

> **LineTo**(`x`, `y`): `void`

指定路径下一节点坐标。

#### Parameters

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### Mask()

> **Mask**(`transform`): `number`

#### Parameters

• **transform**: `number`[]

#### Returns

`number`

***

### MoveTo()

> **MoveTo**(`x`, `y`): `void`

指定子路径起点坐标。

#### Parameters

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### Rect()

> **Rect**(`x`, `y`, `w`, `h`): `void`

构造矩形数据。

#### Parameters

• **x**: `number`

左上角X像素坐标。

• **y**: `number`

左上角Y像素坐标。

• **w**: `number`

矩形像素宽度。

• **h**: `number`

矩形像素高度。

#### Returns

`void`

***

### RoundRect()

> **RoundRect**(`x`, `y`, `w`, `h`, `radii`): `void`

创建圆角矩形路径。

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

• **radii**: `number`

#### Returns

`void`

***

### Text()

> **Text**(`text`, `x`, `y`, `maxWidth`?, `params`?): `void`

构造文本图形数据。

#### Parameters

• **text**: `string`

字符串行。

• **x**: `number`

光标位置。

• **y**: `number`

基线位置。

• **maxWidth?**: `number`

最大绘制行宽。

• **params?**

字体数据。

• **params.atlas?**: `any`

字形图集信息。

• **params.canvas\_height?**: `number`

画布高度。

• **params.canvas\_width?**: `number`

画布宽度。

• **params.em\_font\_size?**: `number`

1EM对应像素数。

• **params.glyphs?**: [`FontAtlas`](../interfaces/FontAtlas.md)

字形数据查找表。

#### Returns

`void`
