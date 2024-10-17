[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Style2D

# Class: Style2D

UI样式实例。

## Constructors

### new Style2D()

> **new Style2D**(`renderer`, `id`): [`Style2D`](Style2D.md)

构造函数。

#### Parameters

• **renderer**: [`Renderer2D`](Renderer2D.md)

2D渲染器实例。

• **id**: `string`

样式实例ID。

#### Returns

[`Style2D`](Style2D.md)

## Accessors

### color

> `get` **color**(): `number`

纯色颜色值（#AARRGGBB）；

> `set` **color**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### gradient\_conic\_center

> `get` **gradient\_conic\_center**(): `number`[]

Conic渐变中心点坐标（画布空间，范围：[0, 65535]）。

#### Returns

`number`[]

***

### gradient\_conic\_end\_angle

> `get` **gradient\_conic\_end\_angle**(): `number`

Conic渐变终止弧度（顺时针渐变）。

#### Returns

`number`

***

### gradient\_conic\_start\_angle

> `get` **gradient\_conic\_start\_angle**(): `number`

Conic渐变起始弧度（顺时针渐变）。

#### Returns

`number`

***

### gradient\_linear\_end

> `get` **gradient\_linear\_end**(): `number`[]

Linear渐变线的终点坐标（画布空间，范围：[0, 65535]）。

#### Returns

`number`[]

***

### gradient\_linear\_start

> `get` **gradient\_linear\_start**(): `number`[]

Linear渐变线的起点坐标（画布空间，范围：[0, 65535]）。

#### Returns

`number`[]

***

### gradient\_radial\_end\_center

> `get` **gradient\_radial\_end\_center**(): `number`[]

Radial渐变终止圆心坐标（画布空间，范围：[0, 65535]）。

#### Returns

`number`[]

***

### gradient\_radial\_end\_radius

> `get` **gradient\_radial\_end\_radius**(): `number`

Radial渐变终止圆弧半径（范围：[0, 65535]）。

#### Returns

`number`

***

### gradient\_radial\_start\_center

> `get` **gradient\_radial\_start\_center**(): `number`[]

Radial渐变起始圆心坐标（画布空间，范围：[0, 65535]）。

#### Returns

`number`[]

***

### gradient\_radial\_start\_radius

> `get` **gradient\_radial\_start\_radius**(): `number`

Radial渐变起始圆弧半径（范围：[0, 65535]）。

#### Returns

`number`

***

### gradient\_stop\_count

> `get` **gradient\_stop\_count**(): `number`

渐变色渐变停靠点数量（最大3个）。

#### Returns

`number`

***

### gradient\_stops\_color

> `get` **gradient\_stops\_color**(): `number`[]

渐变色各停靠点颜色（根据渐变区间归一化，最多3个停靠点）。

#### Returns

`number`[]

***

### gradient\_stops\_offset

> `get` **gradient\_stops\_offset**(): `number`[]

渐变色各停靠点偏移（根据渐变区间归一化，最多3个停靠点）。

#### Returns

`number`[]

***

### id

> `get` **id**(): `string`

样式实例ID。

#### Returns

`string`

***

### pattern\_rotation

> `get` **pattern\_rotation**(): `number`

Pattern图案旋转弧度（顺时针）。

#### Returns

`number`

***

### pattern\_scale

> `get` **pattern\_scale**(): `number`

Pattern图案整体缩放（最大放大256倍）。

#### Returns

`number`

***

### pattern\_texture\_layer

> `get` **pattern\_texture\_layer**(): `number`

填充图案所在图集图层。

#### Returns

`number`

***

### pattern\_uv\_offset

> `get` **pattern\_uv\_offset**(): `number`[]

Pattern图案采样图集图层UV偏移。

#### Returns

`number`[]

***

### pattern\_uv\_scale

> `get` **pattern\_uv\_scale**(): `number`[]

Pattern图案采样图集图层UV缩放。

#### Returns

`number`[]

***

### type

> `get` **type**(): `number`

样式类型：
0-Color：纯色；
1-Gradient_linear：渐变色。渐变方向为线段方向，起始点外为起始色，终止点外为终止色；
2-Gradient_radial：渐变色。渐变方向为径向，起始圆内为起始色，终止圆外为终止色；
3-Gradient_conic：渐变色。渐变方向为弧向；
4-Pattern_repeat：填充图案。重复平铺。
5-Pattern_repeat_x：填充图案。横向重复平铺。
6-Pattern_repeat_y：填充图案。纵向重复平铺。
7-Pattern_clamp：填充图案。不平铺。

> `set` **type**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`
