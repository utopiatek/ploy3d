[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis\_level

# Interface: Gis\_level

GIS LOD层级结构。

## Properties

### id

> **id**: `number`

层级ID。

***

### layers

> **layers**: `object`[]

图层数组。

***

### level

> **level**: `number`

层级LOD级别[1, 23]。

***

### outer

> **outer**: `boolean`

是否是最外环层级。

***

### projections

> **projections**: `object` & `Gis_uvst`[]

瓦片各坐标系下投影参数（以WGS84为基准）。

***

### reset

> **reset**: `boolean`

是否重置层级状态。

***

### submesh

> **submesh**: `number`

层级子网格索引。
