[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset\_mesh\_creater

# Interface: Asset\_mesh\_creater

网格几何数据构建器。

## Properties

### box?

> `optional` **box**: `object`

#### depth

> **depth**: `number`

立方体深度。

#### depthSegments

> **depthSegments**: `number`

立方体深度分段数。

#### height

> **height**: `number`

立方体高度。

#### heightSegments

> **heightSegments**: `number`

立方体高度分段数。

#### width

> **width**: `number`

立方体宽度。

#### widthSegments

> **widthSegments**: `number`

立方体宽度分段数。

***

### cylinder?

> `optional` **cylinder**: `object`

#### height

> **height**: `number`

圆柱高度。

#### heightSegments

> **heightSegments**: `number`

高度分段数。

#### openEnded

> **openEnded**: `boolean`

是否开口（删除顶面和底面）。

#### radialSegments

> **radialSegments**: `number`

径向分段数。

#### radiusBottom

> **radiusBottom**: `number`

底面半径。

#### radiusTop

> **radiusTop**: `number`

顶面半径。

#### thetaLength

> **thetaLength**: `number`

镜面弧长（2Π封闭）。

#### thetaStart

> **thetaStart**: `number`

径面起始弧度。

***

### grid?

> `optional` **grid**: `object`

#### divisions

> **divisions**: `number`

划分格子数（偶数）。

#### size

> **size**: `number`

格栅边长。

***

### lod\_plane?

> `optional` **lod\_plane**: `object`

#### levels

> **levels**: `number`

#### segments

> **segments**: `number`

***

### lod\_tile?

> `optional` **lod\_tile**: `object`

#### flipFace?

> `optional` **flipFace**: `boolean`

是否翻转面朝向。

#### height

> **height**: `number`

平面高度。

#### heightSegments

> **heightSegments**: `number`

平面高度分段数（偶数）。

#### width

> **width**: `number`

平面宽度。

#### widthSegments

> **widthSegments**: `number`

平面宽度分段数（偶数）。

***

### sphere?

> `optional` **sphere**: `object`

#### heightSegments

> **heightSegments**: `number`

#### phiLength

> **phiLength**: `number`

#### phiStart

> **phiStart**: `number`

#### radius

> **radius**: `number`

#### thetaLength

> **thetaLength**: `number`

#### thetaStart

> **thetaStart**: `number`

#### widthSegments

> **widthSegments**: `number`

***

### type

> **type**: `"grid"` \| `"box"` \| `"sphere"` \| `"cylinder"` \| `"lod_tile"` \| `"lod_plane"`
