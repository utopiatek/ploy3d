[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis\_districts

# Class: Gis\_districts

GIS行政区管理。

## Constructors

### new Gis\_districts()

> **new Gis\_districts**(`_gis`): [`Gis_districts`](Gis_districts.md)

构造函数。

#### Parameters

• **\_gis**: [`Gis`](Gis.md)

#### Returns

[`Gis_districts`](Gis_districts.md)

## Accessors

### countries

> `get` **countries**(): `Record`\<`string`, [`Gis_district`](Gis_district.md)\>

国家行政区域信息查找表。

#### Returns

`Record`\<`string`, [`Gis_district`](Gis_district.md)\>

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### Draw()

> **Draw**(`queue`): `void`

绘制GIS行政区分界线。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

#### Returns

`void`

***

### Init()

> **Init**(): `Promise`\<[`Gis_districts`](Gis_districts.md)\>

初始化GIS行政区管理。

#### Returns

`Promise`\<[`Gis_districts`](Gis_districts.md)\>

***

### Load()

> **Load**(`keywords`, `token`): `Promise`\<[`Gis_district`](Gis_district.md)\>

加载GIS行政区。
https://lbs.amap.com/api/webservice/guide/api/district

#### Parameters

• **keywords**: `string`[]

行政区关键词[国家, 省份|直辖市, 市, 区县]。

• **token**: `string`

高德地图AK（ad592e63640a58865bd1640560cbe82e）。

#### Returns

`Promise`\<[`Gis_district`](Gis_district.md)\>

返回GIS行政区对象。
