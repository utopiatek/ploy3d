[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis

# Class: Gis

GIS系统。

## Constructors

### new Gis()

> **new Gis**(`_global`): [`Gis`](Gis.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Gis`](Gis.md)

## Accessors

### centerMC

> `get` **centerMC**(): `number`[]

当前中心墨卡托坐标。

#### Returns

`number`[]

***

### centerPos

> `get` **centerPos**(): `number`[]

当前中心世界坐标。

#### Returns

`number`[]

***

### diameter

> `get` **diameter**(): `number`

地球直径。

#### Returns

`number`

***

### districts

> `get` **districts**(): [`Gis_districts`](Gis_districts.md)

GIS行政区管理。

#### Returns

[`Gis_districts`](Gis_districts.md)

***

### enable

> `get` **enable**(): `boolean`

是否启用GIS系统。

> `set` **enable**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### enable\_terrain

> `get` **enable\_terrain**(): `boolean`

当前是否显示地形。

#### Returns

`boolean`

***

### force\_terrain

> `get` **force\_terrain**(): `boolean`

地形数据可用时，强制开启地形。

> `set` **force\_terrain**(`enable`): `void`

#### Parameters

• **enable**: `boolean`

#### Returns

`boolean`

***

### lat

> `get` **lat**(): `number`

当前中心纬度。

#### Returns

`number`

***

### level

> `get` **level**(): `number`

当前中心显示级别（[9, 16]显示地形，[17, ~]显示3D）。

#### Returns

`number`

***

### lng

> `get` **lng**(): `number`

当前中心经度。

#### Returns

`number`

***

### lock

> `get` **lock**(): `boolean`

当前是否锁定GIS状态。

> `set` **lock**(`lock`): `void`

当前是否锁定GIS状态。

#### Parameters

• **lock**: `boolean`

#### Returns

`boolean`

***

### materials

> `get` **materials**(): `object`[]

GIS各层级材质数组。

#### Returns

`object`[]

***

### perimeter

> `get` **perimeter**(): `number`

地球周长。

#### Returns

`number`

***

### perimeter\_half

> `get` **perimeter\_half**(): `number`

地球半周长。

#### Returns

`number`

***

### radius

> `get` **radius**(): `number`

地球半径。

#### Returns

`number`

***

### servers

> `get` **servers**(): `object`

瓦片服务信息（可自己扩展添加）。

#### Returns

`object`

##### arcgisonline\_img\_w

> **arcgisonline\_img\_w**: `object`

##### arcgisonline\_img\_w.count

> **count**: `number`

##### arcgisonline\_img\_w.label

> **label**: `string`

##### arcgisonline\_img\_w.max\_level

> **max\_level**: `number`

##### arcgisonline\_img\_w.min\_level

> **min\_level**: `number`

##### arcgisonline\_img\_w.projection

> **projection**: [`Gis_projection`](../enumerations/Gis_projection.md)

##### arcgisonline\_img\_w.tile\_size

> **tile\_size**: `number`

##### arcgisonline\_img\_w.url

> **url**: `string`

##### earthol\_img\_w

> **earthol\_img\_w**: `object`

##### earthol\_img\_w.count

> **count**: `number`

##### earthol\_img\_w.label

> **label**: `string`

##### earthol\_img\_w.max\_level

> **max\_level**: `number`

##### earthol\_img\_w.min\_level

> **min\_level**: `number`

##### earthol\_img\_w.projection

> **projection**: [`Gis_projection`](../enumerations/Gis_projection.md)

##### earthol\_img\_w.tile\_size

> **tile\_size**: `number`

##### earthol\_img\_w.url

> **url**: `string`

##### tianditu\_dem\_c

> **tianditu\_dem\_c**: `object`

##### tianditu\_dem\_c.count

> **count**: `number`

##### tianditu\_dem\_c.label

> **label**: `string`

##### tianditu\_dem\_c.max\_level

> **max\_level**: `number`

##### tianditu\_dem\_c.min\_level

> **min\_level**: `number`

##### tianditu\_dem\_c.projection

> **projection**: [`Gis_projection`](../enumerations/Gis_projection.md)

##### tianditu\_dem\_c.tile\_size

> **tile\_size**: `number`

##### tianditu\_dem\_c.url

> **url**: `string`

##### tianditu\_img\_c

> **tianditu\_img\_c**: `object`

##### tianditu\_img\_c.count

> **count**: `number`

##### tianditu\_img\_c.label

> **label**: `string`

##### tianditu\_img\_c.max\_level

> **max\_level**: `number`

##### tianditu\_img\_c.min\_level

> **min\_level**: `number`

##### tianditu\_img\_c.projection

> **projection**: [`Gis_projection`](../enumerations/Gis_projection.md)

##### tianditu\_img\_c.tile\_size

> **tile\_size**: `number`

##### tianditu\_img\_c.url

> **url**: `string`

##### tianditu\_img\_w

> **tianditu\_img\_w**: `object`

##### tianditu\_img\_w.count

> **count**: `number`

##### tianditu\_img\_w.label

> **label**: `string`

##### tianditu\_img\_w.max\_level

> **max\_level**: `number`

##### tianditu\_img\_w.min\_level

> **min\_level**: `number`

##### tianditu\_img\_w.projection

> **projection**: [`Gis_projection`](../enumerations/Gis_projection.md)

##### tianditu\_img\_w.tile\_size

> **tile\_size**: `number`

##### tianditu\_img\_w.url

> **url**: `string`

***

### timestamp

> `get` **timestamp**(): `number`

当前刷新时间戳。

#### Returns

`number`

## Methods

### BD09\_GCJ02()

> **BD09\_GCJ02**(`ll`): `number`[]

百度坐标系（BD09）转火星坐标系（GCJ02）。

#### Parameters

• **ll**: `number`[]

经纬度（BD09）。

#### Returns

`number`[]

经纬度（GCJ02）。

***

### BD09\_WGS84()

> **BD09\_WGS84**(`ll`): `number`[]

百度坐标系（BD09）转GPS坐标系（WGS84）。

#### Parameters

• **ll**: `number`[]

经纬度（BD09）。

#### Returns

`number`[]

经纬度（WGS84）。

***

### CalPosition()

> **CalPosition**(`lng`, `lat`): [`Vector3`](Vector3.md)

计算指定经纬度所在当前世界空间坐标。

#### Parameters

• **lng**: `number`

指定经度（WGS84）。

• **lat**: `number`

指定纬度（WGS84）。

#### Returns

[`Vector3`](Vector3.md)

返回当前世界空间坐标。

***

### CalSunlight()

> **CalSunlight**(`params`): `object`

计算太阳方位角和高度角。
方位角：单位度，正北为0，顺时针增加，[0, 360]；
高度角：单位度，地平线为0，向上增加，[-90, 90]；

#### Parameters

• **params**

经纬度和时间参数。

• **params.day**: `number`

日期，1-31。

• **params.hours**: `number`

小时，0-23。

• **params.lat?**: `number`

纬度，单位度，北纬为正，南纬为负。

• **params.lng?**: `number`

经度，单位度，东经为正，西经为负。

• **params.minutes**: `number`

分钟，0-59。

• **params.month**: `number`

月份，1-12。

• **params.seconds**: `number`

秒钟，0-59。

• **params.tz?**: `number`

时区，单位小时，东区为正，西区为负。

• **params.year**: `number`

年份，如2023。

#### Returns

`object`

返回太阳方位角和高度角。

##### altitude

> **altitude**: `number`

太阳高度角。

##### azimuth

> **azimuth**: `number`

太阳方位角。

##### direction

> **direction**: [`Vector3`](Vector3.md)

太阳光照方向。

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### Draw()

> **Draw**(`queue`): `void`

绘制矢量瓦片。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

passEncoder 渲染通道命令编码器。

#### Returns

`void`

***

### DrawMesh()

> **DrawMesh**(`queue`): `void`

绘制场景。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

#### Returns

`void`

***

### Flush()

> **Flush**(`x`, `z`, `lng`, `lat`, `level`, `pitch`, `yaw`): `void`

设置当前GIS状态。

#### Parameters

• **x**: `number`

世界空间相机观察点坐标X（网格中心坐标）。

• **z**: `number`

世界空间相机观察点坐标Z（网格中心坐标）。

• **lng**: `number`

相机观察点经度（WGS84）。

• **lat**: `number`

相机观察点纬度（WGS84）。

• **level**: `number`

相机观察点瓦片级别。

• **pitch**: `number`

观察俯仰角。

• **yaw**: `number`

观察偏航角。

#### Returns

`void`

***

### FlushMaterial()

> **FlushMaterial**(`values`?): `void`

刷新材质属性。

#### Parameters

• **values?**

材质属性值。

• **values.centerMC?**: `number`[]

• **values.movedMC?**: `number`[]

• **values.size?**: `number`[]

• **values.targetMC?**: `number`[]

• **values.targetXZ?**: `number`[]

#### Returns

`void`

***

### GCJ02\_BD09()

> **GCJ02\_BD09**(`ll`): `number`[]

火星坐标系（GCJ02）转百度坐标系（BD09）。

#### Parameters

• **ll**: `number`[]

经纬度（GCJ02）。

#### Returns

`number`[]

经纬度（BD09）。

***

### GCJ02\_WGS84()

> **GCJ02\_WGS84**(`ll`): `number`[]

火星坐标系（GCJ02）转GPS坐标系（WGS84）。

#### Parameters

• **ll**: `number`[]

经纬度（GCJ02）。

#### Returns

`number`[]

经纬度（WGS84）。

***

### Init()

> **Init**(): `Promise`\<[`Gis`](Gis.md)\>

初始化GIS系统。

#### Returns

`Promise`\<[`Gis`](Gis.md)\>

***

### LL2MC()

> **LL2MC**(`ll`): `number`[]

经纬度转墨卡托坐标（墨卡托坐标用于计算瓦片行列号）。

#### Parameters

• **ll**: `number`[]

经纬度。

#### Returns

`number`[]

墨卡托坐标。

***

### LL2MC\_BD09()

> **LL2MC\_BD09**(`ll`): `number`[]

百度经纬度百度转墨卡托坐标（墨卡托坐标用于计算瓦片行列号）。
https://www.cnblogs.com/xiaozhi_5638/p/4748186.html

#### Parameters

• **ll**: `number`[]

百度经纬度。

#### Returns

`number`[]

百度墨卡托坐标。

***

### LL2WPOS()

> **LL2WPOS**(`ll`): `number`[]

经纬度转当前世界空间坐标（当前世界空间原点经纬度_originLL）。
注意：
我们基于当前世界空间原点纬度_originLL[1]来转换世界距离到墨卡托投影距离；
两个地理位置点间的世界空间距离不是准确的，特别是在纬度跨度很大时；

#### Parameters

• **ll**: `number`[]

经纬度。

#### Returns

`number`[]

当前世界空间坐标。

***

### MC2LL()

> **MC2LL**(`mc`): `number`[]

墨卡托坐标转经纬度。

#### Parameters

• **mc**: `number`[]

墨卡托坐标。

#### Returns

`number`[]

经纬度。

***

### MC2LL\_BD09()

> **MC2LL\_BD09**(`mc`): `number`[]

百度墨卡托坐标转百度经纬度。

#### Parameters

• **mc**: `number`[]

百度墨卡托坐标。

#### Returns

`number`[]

百度经纬度。

***

### OutOfChina()

> **OutOfChina**(`ll`): `boolean`

检测指定经纬度是否在中国范围框之外（纬度3.86~53.55、经度73.66~135.05）。
范围框之内使用GCJ02加密。

#### Parameters

• **ll**: `number`[]

经纬度。

#### Returns

`boolean`

返回真表示指定经纬度在中国范围框之外。

***

### ServeUrl()

> **ServeUrl**(`type`, `token`, `col`, `row`, `level`): `string`

生成瓦片请求URL。

#### Parameters

• **type**: `"tianditu_img_w"` \| `"tianditu_img_c"` \| `"tianditu_dem_c"` \| `"arcgisonline_img_w"` \| `"earthol_img_w"`

瓦片服务类型。

• **token**: `string`

瓦片服务TOKEN。

• **col**: `number`

瓦片列号。

• **row**: `number`

瓦片行号。

• **level**: `number`

瓦片级别。

#### Returns

`string`

返回URL。

***

### TransformLat()

> **TransformLat**(`ll`): `number`

对纬度进行第1次GCJ02加密转换。

#### Parameters

• **ll**: `number`[]

经纬度。

#### Returns

`number`

返回第1次加密后的纬度。

***

### TransformLng()

> **TransformLng**(`ll`): `number`

对经度进行第1次GCJ02加密转换。

#### Parameters

• **ll**: `number`[]

经纬度。

#### Returns

`number`

返回第1次加密后的经度。

***

### Update()

> **Update**(`camera`): `Float32Array`

根据相机姿态刷新地图。
注意：应当在帧绘制前应用相机最新姿态更新GIS。如果帧绘制使用的相机姿态与GIS当前使用的相机姿态不同，会导致画面不同步或抖动。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例。

#### Returns

`Float32Array`

***

### WGS84\_BD09()

> **WGS84\_BD09**(`ll`): `number`[]

GPS坐标系（WGS84）转百度坐标系（BD09）。

#### Parameters

• **ll**: `number`[]

经纬度（WGS84）。

#### Returns

`number`[]

经纬度（BD09）。

***

### WGS84\_GCJ02()

> **WGS84\_GCJ02**(`ll`): `number`[]

GPS坐标系（WGS84）转火星坐标系（GCJ02）。

#### Parameters

• **ll**: `number`[]

经纬度（WGS84）。

#### Returns

`number`[]

经纬度（GCJ02）。
