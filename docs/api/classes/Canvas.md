[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Canvas

# Class: Canvas

UI画布。

## Extends

- [`Panel`](Panel.md)

## Constructors

### new Canvas()

> **new Canvas**(`system`, `__`, `id`, `options`): [`Canvas`](Canvas.md)

构造函数。

#### Parameters

• **system**: [`CalynUI`](CalynUI.md)

UI系统实例。

• **\_\_**: [`Canvas`](Canvas.md)

• **id**: `number`

实例ID。

• **options**: `object` & `object` & `object`

可选的初始化数据。

#### Returns

[`Canvas`](Canvas.md)

#### Overrides

[`Panel`](Panel.md).[`constructor`](Panel.md#constructors)

## Accessors

### active

> `get` **active**(): `boolean`

元素是否激活。

> `set` **active**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

#### Inherited from

[`Panel`](Panel.md).[`active`](Panel.md#active)

***

### aspect\_mode

> `get` **aspect\_mode**(): `"none"` \| `"width_ctrl"` \| `"height_ctrl"`

元素宽高比约束模式。

#### Returns

`"none"` \| `"width_ctrl"` \| `"height_ctrl"`

#### Inherited from

[`Panel`](Panel.md).[`aspect_mode`](Panel.md#aspect_mode)

***

### aspect\_ratio

> `get` **aspect\_ratio**(): `number`

元素当前宽高比。

#### Returns

`number`

#### Inherited from

[`Panel`](Panel.md).[`aspect_ratio`](Panel.md#aspect_ratio)

***

### canvas\_height

> `get` **canvas\_height**(): `number`

画布设计高度。

#### Returns

`number`

***

### canvas\_scale

> `get` **canvas\_scale**(): `number`

画布绘制缩放。

#### Returns

`number`

***

### canvas\_width

> `get` **canvas\_width**(): `number`

画布设计宽度。

#### Returns

`number`

***

### children

> `get` **children**(): [`Element`](Element.md)[]

子级元素列表。

#### Returns

[`Element`](Element.md)[]

#### Inherited from

[`Panel`](Panel.md).[`children`](Panel.md#children)

***

### children\_occ\_height

> `get` **children\_occ\_height**(): `number`

子级最大总占用设计高度（包含子级边距，元素自动高度或启用滚动条时需要计算子级最大总占用设计高度）。

#### Returns

`number`

#### Inherited from

[`Panel`](Panel.md).[`children_occ_height`](Panel.md#children_occ_height)

***

### children\_occ\_width

> `get` **children\_occ\_width**(): `number`

子级最大总占用设计宽度（包含子级边距，元素自动宽度或启用滚动条时需要计算子级最大总占用设计宽度）。

#### Returns

`number`

#### Inherited from

[`Panel`](Panel.md).[`children_occ_width`](Panel.md#children_occ_width)

***

### guid

> `get` **guid**(): `string`

元素GUID。

#### Returns

`string`

#### Inherited from

[`Panel`](Panel.md).[`guid`](Panel.md#guid)

***

### height

> `get` **height**(): `object`

元素当前设计高度。

#### Returns

`object`

##### height

> **height**: `number`

内容区域设计高度。

##### occ\_height

> **occ\_height**: `number`

总占用设计高度（包含边距）。

##### timestrap

> **timestrap**: `number`

数据时间戳。

#### Overrides

[`Panel`](Panel.md).[`height`](Panel.md#height)

***

### id

> `get` **id**(): `number`

元素ID。

#### Returns

`number`

#### Inherited from

[`Panel`](Panel.md).[`id`](Panel.md#id)

***

### renderer

> `get` **renderer**(): `CanvasRenderingContext2D`

HTML画布上下文。

#### Returns

`CanvasRenderingContext2D`

***

### style

> `get` **style**(): `object`

样式设置。

#### Returns

`object`

##### bg\_fill?

> `optional` **bg\_fill**: `boolean`

是否填充背景。

##### bg\_fill\_color?

> `optional` **bg\_fill\_color**: `string`

背景填充颜色。

##### bg\_radii?

> `optional` **bg\_radii**: `number`

圆角矩形圆弧半径。

##### bg\_stroke?

> `optional` **bg\_stroke**: `boolean`

是否描绘背景边框。

##### bg\_stroke\_color?

> `optional` **bg\_stroke\_color**: `string`

背景边框颜色。

##### bg\_stroke\_dash?

> `optional` **bg\_stroke\_dash**: `number`

背景边框虚线间隔（实线长度为间隔的2倍）。

##### bg\_stroke\_width?

> `optional` **bg\_stroke\_width**: `number`

背景边框线宽。

##### font?

> `optional` **font**: `string`

字体。

##### font\_color?

> `optional` **font\_color**: `string`

字体颜色。

##### font\_size?

> `optional` **font\_size**: `number`

字体大小（单位PX）。

#### Inherited from

[`Panel`](Panel.md).[`style`](Panel.md#style)

***

### type

> `get` **type**(): `"canvas"` \| `"layout"` \| `"panel"` \| `"component"`

元素类型（"layout"，"canvas"都派生自"panel"，所以可以认为只有两大类"component"，"panel"）。

#### Returns

`"canvas"` \| `"layout"` \| `"panel"` \| `"component"`

#### Inherited from

[`Panel`](Panel.md).[`type`](Panel.md#type)

***

### width

> `get` **width**(): `object`

元素当前设计宽度。

#### Returns

`object`

##### occ\_width

> **occ\_width**: `number`

总占用设计宽度（包含边距）。

##### timestrap

> **timestrap**: `number`

数据时间戳。

##### width

> **width**: `number`

内容区域设计宽度。

#### Overrides

[`Panel`](Panel.md).[`width`](Panel.md#width)

***

### window

> `get` **window**(): `HTMLCanvasElement`

HTML画布元素。

#### Returns

`HTMLCanvasElement`

## Methods

### AddChild()

> **AddChild**\<`T`\>(`option`): `T`

添加子级元素。

#### Type Parameters

• **T** *extends* [`Element`](Element.md)

#### Parameters

• **option**: [`Options`](../type-aliases/Options.md)

子级元素配置。

#### Returns

`T`

#### Inherited from

[`Panel`](Panel.md).[`AddChild`](Panel.md#addchild)

***

### Draw()

> **Draw**(`pass`, `style`): `Promise`\<`void`\>

绘制元素（派生类应当重写该方法）。

#### Parameters

• **pass**: `number`

绘制阶段。

• **style**

• **style.bg\_fill?**: `boolean`

是否填充背景。

• **style.bg\_fill\_color?**: `string`

背景填充颜色。

• **style.bg\_radii?**: `number`

圆角矩形圆弧半径。

• **style.bg\_stroke?**: `boolean`

是否描绘背景边框。

• **style.bg\_stroke\_color?**: `string`

背景边框颜色。

• **style.bg\_stroke\_dash?**: `number`

背景边框虚线间隔（实线长度为间隔的2倍）。

• **style.bg\_stroke\_width?**: `number`

背景边框线宽。

• **style.font?**: `string`

字体。

• **style.font\_color?**: `string`

字体颜色。

• **style.font\_size?**: `number`

字体大小（单位PX）。

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Panel`](Panel.md).[`Draw`](Panel.md#draw)

***

### Foreach()

> **Foreach**(`func`): `void`

遍历画布中所有UI元素（先根顺序）。

#### Parameters

• **func**

UI元素处理方法（返回值决定是否往当前元素子级遍历）。

#### Returns

`void`

***

### Hit()

> **Hit**(`x`, `y`): `object`[]

获取当前光标命中的元素列表。

#### Parameters

• **x**: `number`

光标在画布中的X轴坐标。

• **y**: `number`

光标在画布中的Y轴坐标。

#### Returns

`object`[]

返回命中的所有元素（元素深度递减）。

***

### OnDrag()

> **OnDrag**(`width`, `height`, `event`): `void`

拖拽元素。

#### Parameters

• **width**: `number`

拖拽实际所在平面宽度。

• **height**: `number`

拖拽实际所在平面高度。

• **event**: `MouseEvent` & `object`

鼠标事件对象。

#### Returns

`void`

#### Inherited from

[`Panel`](Panel.md).[`OnDrag`](Panel.md#ondrag)

***

### Update()

> **Update**(`style`, `window`?, `renderer`?, `rect`?): `Promise`\<`any`\>

更新元素绘制范围参数（先根遍历更新）。

#### Parameters

• **style**

• **style.bg\_fill?**: `boolean`

是否填充背景。

• **style.bg\_fill\_color?**: `string`

背景填充颜色。

• **style.bg\_radii?**: `number`

圆角矩形圆弧半径。

• **style.bg\_stroke?**: `boolean`

是否描绘背景边框。

• **style.bg\_stroke\_color?**: `string`

背景边框颜色。

• **style.bg\_stroke\_dash?**: `number`

背景边框虚线间隔（实线长度为间隔的2倍）。

• **style.bg\_stroke\_width?**: `number`

背景边框线宽。

• **style.font?**: `string`

字体。

• **style.font\_color?**: `string`

字体颜色。

• **style.font\_size?**: `number`

字体大小（单位PX）。

• **window?**: `HTMLCanvasElement`

• **renderer?**: `CanvasRenderingContext2D`

• **rect?**: `number`[]

#### Returns

`Promise`\<`any`\>

返回是否绘制当前元素。

#### Overrides

[`Panel`](Panel.md).[`Update`](Panel.md#update)
