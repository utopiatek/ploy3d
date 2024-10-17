[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Renderer2D

# Class: Renderer2D

2D渲染器接口。

## Constructors

### new Renderer2D()

> **new Renderer2D**(`_global`): [`Renderer2D`](Renderer2D.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`Renderer2D`](Renderer2D.md)

## Accessors

### defaultStyle

> `get` **defaultStyle**(): [`Style2D`](Style2D.md)

默认样式实例。

#### Returns

[`Style2D`](Style2D.md)

***

### frameTS

> `get` **frameTS**(): `number`

当前UI系统帧时间戳。

#### Returns

`number`

## Methods

### AddDraw()

> **AddDraw**(`canvas`): `void`

添加绘制画布。

#### Parameters

• **canvas**: [`Canvas2D`](Canvas2D.md)

画布实例。

#### Returns

`void`

***

### BeginFrame()

> **BeginFrame**(): `void`

开始UI帧绘制预备工作。

#### Returns

`void`

***

### CreateCanvas()

> **CreateCanvas**(`width`, `height`): [`Canvas2D`](Canvas2D.md)

创建2D画布。

#### Parameters

• **width**: `number`

画布宽度。

• **height**: `number`

画布高度。

#### Returns

[`Canvas2D`](Canvas2D.md)

返回2D绘制接口实例。

***

### CreateString2D()

> **CreateString2D**(`text`, `x`, `y`, `canvas_w`, `canvas_h`): `void`

创建字符串图形路径数据。

#### Parameters

• **text**: `string`

字符串。

• **x**: `number`

起始光标像素坐标。

• **y**: `number`

文本行基线像素坐标。

• **canvas\_w**: `number`

画布宽度。

• **canvas\_h**: `number`

画布高度。

#### Returns

`void`

***

### CreateStyle2D()

> **CreateStyle2D**(`color`): [`Style2D`](Style2D.md)

创建样式实例。

#### Parameters

• **color**: `string`

颜色字符串。

#### Returns

[`Style2D`](Style2D.md)

返回样式实例。

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### EndFrame()

> **EndFrame**(): `void`

结束UI帧绘制预备工作。

#### Returns

`void`

***

### Init()

> **Init**(): `Promise`\<[`Renderer2D`](Renderer2D.md)\>

初始化2D渲染器。

#### Returns

`Promise`\<[`Renderer2D`](Renderer2D.md)\>

返回2D渲染器接口实例。
