[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis\_district

# Class: Gis\_district

GIS行政区。

## Constructors

### new Gis\_district()

> **new Gis\_district**(): [`Gis_district`](Gis_district.md)

构造函数。

#### Returns

[`Gis_district`](Gis_district.md)

## Properties

### adcode

> **adcode**: `string`

行政区编码（街道编码等同所属区县编码）。

***

### center

> **center**: `number`[]

行政区中心点。

***

### citycode?

> `optional` **citycode**: `string`

城市编码（国家、省份｜直辖市级别不含城市编码。市及其下级行政区拥有共同城市编码）。

***

### districts

> **districts**: `Record`\<`string`, [`Gis_district`](Gis_district.md)\>

下级行政区查找表（通过下级行政区名称查找）。

***

### level

> **level**: `"country"` \| `"province"` \| `"city"` \| `"district"` \| `"street"`

行政区划级别：国家 | 省份,直辖市 | 市 | 区县 | 街道（乡镇）。

***

### name

> **name**: `string`

行政区名称。

***

### polygons?

> `optional` **polygons**: `object`

行政区域边界数据。

#### indexBuffer

> **indexBuffer**: `object`

索引缓存节点。

#### indexBuffer.buffer

> **buffer**: `number`

GPU缓存ID。

#### indexBuffer.count

> **count**: `number`

实际元素数量。

#### indexBuffer.offset

> **offset**: `number`

数据在缓存中的字节偏移。

#### indexBuffer.rows

> **rows**: `number`

节点级别[1, 64]。

#### indexBuffer.size

> **size**: `number`

数据字节大小。

#### indexBuffer.type

> **type**: `number`

缓存类型（0：顶点缓存，1：索引缓存）。

#### indexCount

> **indexCount**: `number`

总索引数量。

#### instanceIndex

> **instanceIndex**: `number`

绘制实例索引。

#### list

> **list**: `object`[]

边界子图形列表。

#### vertexBuffer

> **vertexBuffer**: `object`

顶点缓存节点。

#### vertexBuffer.buffer

> **buffer**: `number`

GPU缓存ID。

#### vertexBuffer.count

> **count**: `number`

实际元素数量。

#### vertexBuffer.offset

> **offset**: `number`

数据在缓存中的字节偏移。

#### vertexBuffer.rows

> **rows**: `number`

节点级别[1, 64]。

#### vertexBuffer.size

> **size**: `number`

数据字节大小。

#### vertexBuffer.type

> **type**: `number`

缓存类型（0：顶点缓存，1：索引缓存）。

#### vertexCount

> **vertexCount**: `number`

总顶点数量。

## Methods

### Build()

> **Build**(`gis`, `jdata`): `Promise`\<[`Gis_district`](Gis_district.md)\>

构建行政区实例对象。

#### Parameters

• **gis**: [`Gis`](Gis.md)

GIS系统接口。

• **jdata**: `any`

行政区数据。

#### Returns

`Promise`\<[`Gis_district`](Gis_district.md)\>

返回行政区对象。

***

### Dispose()

> **Dispose**(`gis`): `void`

清除对象。

#### Parameters

• **gis**: [`Gis`](Gis.md)

#### Returns

`void`
