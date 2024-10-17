[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / CalynUI

# Class: CalynUI

UI系统。

## Constructors

### new CalynUI()

> **new CalynUI**(`_global`): [`CalynUI`](CalynUI.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

#### Returns

[`CalynUI`](CalynUI.md)

## Properties

### highlight\_id

> **highlight\_id**: `number`

需高亮提示的元素ID（编辑模式使用）。

***

### show\_id\_color

> **show\_id\_color**: `boolean`

是否显示元素颜色标识（编辑模式使用）。

## Accessors

### canvas

> `get` **canvas**(): [`Canvas`](Canvas.md)

当前UI画布。

> `set` **canvas**(`_canvas`): `void`

#### Parameters

• **\_canvas**: [`Canvas`](Canvas.md)

#### Returns

[`Canvas`](Canvas.md)

## Methods

### CreateElement()

> **CreateElement**\<`T`\>(`canvas`, `option`): `T`

创建元素实例。

#### Type Parameters

• **T** *extends* [`Element`](Element.md)

#### Parameters

• **canvas**: [`Canvas`](Canvas.md)

• **option**: [`Options`](../type-aliases/Options.md)

元素初始化配置。

#### Returns

`T`

***

### Draw()

> **Draw**(`canvas`, `window`?, `renderer`?, `rect`?): `Promise`\<`any`\>

绘制指定画布内容到指定窗口的指定矩形区域。

#### Parameters

• **canvas**: [`Canvas`](Canvas.md)

指定画布。

• **window?**: `HTMLCanvasElement`

指定窗口。

• **renderer?**: `CanvasRenderingContext2D`

指定窗口渲染器。

• **rect?**: `number`[]

指定矩形区域。

#### Returns

`Promise`\<`any`\>

***

### DropAdd()

> **DropAdd**(`x`, `y`, `type`, `option`?): `void`

拖拽式往面板中添加子元素。

#### Parameters

• **x**: `number`

添加位置。

• **y**: `number`

添加位置。

• **type**: `string`

元素构造器类型。

• **option?**: [`Options`](../type-aliases/Options.md)

元素初始化配置。

#### Returns

`void`

***

### Init()

> **Init**(): `Promise`\<[`CalynUI`](CalynUI.md)\>

初始化UI系统。

#### Returns

`Promise`\<[`CalynUI`](CalynUI.md)\>

返回UI系统接口。

***

### InitEventSystem()

> **InitEventSystem**(): `void`

初始化UI事件系统。

#### Returns

`void`
