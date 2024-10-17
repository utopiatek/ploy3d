[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis\_projection

# Enumeration: Gis\_projection

经纬度投影坐标系（经纬度转换为以米为单位的MC坐标，再根据MC坐标计算瓦片行列号，此处枚举表示各种转换算法）。

## Enumeration Members

### BD09

> **BD09**: `3`

百度地图（基于GCJ02加密）。

***

### CGCS2000

> **CGCS2000**: `1`

天地图（与WGS84近似，非厘米精度需求可忽略差异）。

***

### GCJ02

> **GCJ02**: `2`

高德地图、腾讯地图（基于WGS84加密）。

***

### LNGLAT

> **LNGLAT**: `4`

经纬度直接投影。

***

### WGS84

> **WGS84**: `0`

谷歌地图、OSM。
