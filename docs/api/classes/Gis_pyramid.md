[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Gis\_pyramid

# Class: Gis\_pyramid

GIS LOD层级金字塔。

## Constructors

### new Gis\_pyramid()

> **new Gis\_pyramid**(`_gis`, `_levels`, `_tiling`): [`Gis_pyramid`](Gis_pyramid.md)

构造函数。

#### Parameters

• **\_gis**: [`Gis`](Gis.md)

GIS实例。

• **\_levels**: `number`

LOD层级数（建议值8）。

• **\_tiling**: `number`

LOD层级图层瓦片平铺数量（移动端建议值4、PC端建议值8）。

#### Returns

[`Gis_pyramid`](Gis_pyramid.md)

## Accessors

### forceTerrain

> `set` **forceTerrain**(`enable`): `void`

地形数据可用时，强制开启地形。

#### Parameters

• **enable**: `boolean`

***

### layerTiling

> `get` **layerTiling**(): `number`

LOD层级图层瓦片平铺数量。

#### Returns

`number`

***

### levelCount

> `get` **levelCount**(): `number`

LOD层级数。

#### Returns

`number`

***

### terrain

> `get` **terrain**(): `boolean`

当前是否启用地形。

#### Returns

`boolean`

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### GetDrawRegion()

> **GetDrawRegion**(): `number`[]

获取GIS当前渲染经纬度范围。

#### Returns

`number`[]

***

### Update()

> **Update**(`level`, `lb_col`, `lb_row`, `lb_bias_x`, `lb_bias_z`, `callback`): `void`

更新LOD层级金字塔。

#### Parameters

• **level**: `number`

顶层级别。

• **lb\_col**: `number`

顶层左下角列号。

• **lb\_row**: `number`

顶层左下角行号。

• **lb\_bias\_x**: `number`

顶层左下角瓦片采样偏移。

• **lb\_bias\_z**: `number`

顶层左下角瓦片采样偏移。

• **callback**

刷新完成回调。

#### Returns

`void`
