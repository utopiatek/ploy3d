[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Element

# Class: Element

UI元素基类。

## Extended by

- [`Component`](Component.md)
- [`Panel`](Panel.md)

## Constructors

### new Element()

> **new Element**(`system`, `canvas`, `id`, `options`): [`Element`](Element.md)

构造函数。

#### Parameters

• **system**: [`CalynUI`](CalynUI.md)

UI系统实例。

• **canvas**: [`Canvas`](Canvas.md)

UI画布实例。

• **id**: `number`

实例ID。

• **options**

可选的初始化数据。

• **options.aspect\_mode?**: `"none"` \| `"width_ctrl"` \| `"height_ctrl"` \| `"fit_in"` \| `"fit_out"`

元素宽高比约束模式（默认值"none"）。
"none": 不约束宽高比。
"width_ctrl": 根据元素宽度和宽高比计算出高度。
"height_ctrl": 根据元素高度和宽高比计算出宽度。
"fit_in": 选取某一控制边等同父级大小并使自动计算出的另一边大小在父级范围之内（计算时转换为“width_ctrl”或“height_ctrl”，并设置"stretch"模式）。
"fit_out": 选取某一控制边等同父级大小并使自动计算出的另一边大小在父级范围之外（计算时转换为“width_ctrl”或“height_ctrl”，并设置"stretch"模式）。

• **options.aspect\_ratio?**: `number`

元素宽高比约束（默认无定义）。

• **options.auto\_height?**: `boolean`

是否根据内容大小自动计算元素高度（不能是"stretch"模式，默认值false）。

• **options.auto\_width?**: `boolean`

是否根据内容大小自动计算元素宽度（不能是"stretch"模式，默认值false）。

• **options.children?**: [`Options`](../type-aliases/Options.md)[]

子级元素列表。

• **options.enable\_scroll?**: `boolean`

是否启用滚动条（默认值false）。

• **options.guid?**: `string`

元素GUID（默认自动分配）。

• **options.horiz\_align?**: `"center"` \| `"left"` \| `"right"` \| `"stretch"`

与父级水平对齐方式（默认值"left"）。

• **options.style?**

样式设置（未定义则继承父级，定义为空则不启用）。

• **options.style.bg\_fill?**: `boolean`

是否填充背景。

• **options.style.bg\_fill\_color?**: `string`

背景填充颜色。

• **options.style.bg\_radii?**: `number`

圆角矩形圆弧半径。

• **options.style.bg\_stroke?**: `boolean`

是否描绘背景边框。

• **options.style.bg\_stroke\_color?**: `string`

背景边框颜色。

• **options.style.bg\_stroke\_dash?**: `number`

背景边框虚线间隔（实线长度为间隔的2倍）。

• **options.style.bg\_stroke\_width?**: `number`

背景边框线宽。

• **options.style.font?**: `string`

字体。

• **options.style.font\_color?**: `string`

字体颜色。

• **options.style.font\_size?**: `number`

字体大小（单位PX）。

• **options.vert\_align?**: `"center"` \| `"top"` \| `"bottom"` \| `"stretch"`

与父级垂直对齐方式（默认值"top"）。

• **options.w?**: `number`

元素高度（上中下垂直对齐模式，默认值64）或与父级底边间距（"stretch"垂直对齐模式，默认值0）。

• **options.x?**: `number`

与父级左边或中线或右边水平间距（分别对应拉伸、左中右水平对齐模式，默认值0.0）。

• **options.y?**: `number`

与父级上边或中线或下边垂直间距（分别对应拉伸、上中下垂直对齐模式，默认值0.0）。

• **options.z?**: `number`

元素宽度（左中右水平对齐模式，默认值64）或与父级右边间距（"stretch"水平对齐模式，默认值0）。

#### Returns

[`Element`](Element.md)

## Accessors

### active

> `get` **active**(): `boolean`

元素是否激活。

> `set` **active**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### aspect\_mode

> `get` **aspect\_mode**(): `"none"` \| `"width_ctrl"` \| `"height_ctrl"`

元素宽高比约束模式。

#### Returns

`"none"` \| `"width_ctrl"` \| `"height_ctrl"`

***

### aspect\_ratio

> `get` **aspect\_ratio**(): `number`

元素当前宽高比。

#### Returns

`number`

***

### children

> `get` **children**(): [`Element`](Element.md)[]

子级元素列表。

#### Returns

[`Element`](Element.md)[]

***

### children\_occ\_height

> `get` **children\_occ\_height**(): `number`

子级最大总占用设计高度（包含子级边距，元素自动高度或启用滚动条时需要计算子级最大总占用设计高度）。

#### Returns

`number`

***

### children\_occ\_width

> `get` **children\_occ\_width**(): `number`

子级最大总占用设计宽度（包含子级边距，元素自动宽度或启用滚动条时需要计算子级最大总占用设计宽度）。

#### Returns

`number`

***

### guid

> `get` **guid**(): `string`

元素GUID。

#### Returns

`string`

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

***

### id

> `get` **id**(): `number`

元素ID。

#### Returns

`number`

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

***

### type

> `get` **type**(): `"canvas"` \| `"layout"` \| `"panel"` \| `"component"`

元素类型（"layout"，"canvas"都派生自"panel"，所以可以认为只有两大类"component"，"panel"）。

#### Returns

`"canvas"` \| `"layout"` \| `"panel"` \| `"component"`

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

***

### Update()

> **Update**(`style`): `Promise`\<`boolean`\>

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

#### Returns

`Promise`\<`boolean`\>

返回是否绘制当前元素。
