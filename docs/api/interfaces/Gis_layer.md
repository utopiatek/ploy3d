[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis\_layer

# Interface: Gis\_layer

GIS图层（不同数据叠加层）。

## Properties

### enabled

> **enabled**: `boolean`

是否启用该图层。

***

### token

> **token**: `string`

瓦片数据服务TOKEN。

***

### type

> **type**: `"tianditu_img_w"` \| `"tianditu_img_c"` \| `"tianditu_dem_c"` \| `"arcgisonline_img_w"` \| `"earthol_img_w"`

瓦片数据服务类型：
tianditu_img_w: 天地图影像数据源，使用CGCS2000投影坐标系。
tianditu_img_c: 天地图影像数据源，使用LNGLAT投影坐标系。
tianditu_dem_c: 天地图地形数据源，使用LNGLAT投影坐标系。
arcgisonline_img_w: ARCGIS影像数据源，使用WGS84投影坐标系。
earthol_img_w: EARTHOL影像数据源，使用WGS84投影坐标系。
