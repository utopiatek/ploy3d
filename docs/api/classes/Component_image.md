[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Component\_image

# Class: Component\_image

UI图片。

## Extends

- [`Component`](Component.md)

## Constructors

### new Component\_image()

> **new Component\_image**(`system`, `canvas`, `id`, `options`): [`Component_image`](Component_image.md)

构造函数。

#### Parameters

• **system**: [`CalynUI`](CalynUI.md)

UI系统实例。

• **canvas**: [`Canvas`](Canvas.md)

UI画布实例。

• **id**: `number`

实例ID。

• **options**: `object` & `object` & `object`

可选的初始化数据。

#### Returns

[`Component_image`](Component_image.md)

#### Overrides

[`Component`](Component.md).[`constructor`](Component.md#constructors)

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

[`Component`](Component.md).[`active`](Component.md#active)

***

### aspect\_mode

> `get` **aspect\_mode**(): `"none"` \| `"width_ctrl"` \| `"height_ctrl"`

元素宽高比约束模式。

#### Returns

`"none"` \| `"width_ctrl"` \| `"height_ctrl"`

#### Inherited from

[`Component`](Component.md).[`aspect_mode`](Component.md#aspect_mode)

***

### aspect\_ratio

> `get` **aspect\_ratio**(): `number`

元素当前宽高比。

#### Returns

`number`

#### Overrides

[`Component`](Component.md).[`aspect_ratio`](Component.md#aspect_ratio)

***

### children

> `get` **children**(): [`Element`](Element.md)[]

子级元素列表。

#### Returns

[`Element`](Element.md)[]

#### Inherited from

[`Component`](Component.md).[`children`](Component.md#children)

***

### children\_occ\_height

> `get` **children\_occ\_height**(): `number`

文本占用高度。

#### Returns

`number`

#### Overrides

[`Component`](Component.md).[`children_occ_height`](Component.md#children_occ_height)

***

### children\_occ\_width

> `get` **children\_occ\_width**(): `number`

文本占用宽度。

#### Returns

`number`

#### Overrides

[`Component`](Component.md).[`children_occ_width`](Component.md#children_occ_width)

***

### guid

> `get` **guid**(): `string`

元素GUID。

#### Returns

`string`

#### Inherited from

[`Component`](Component.md).[`guid`](Component.md#guid)

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

#### Inherited from

[`Component`](Component.md).[`height`](Component.md#height)

***

### id

> `get` **id**(): `number`

元素ID。

#### Returns

`number`

#### Inherited from

[`Component`](Component.md).[`id`](Component.md#id)

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

[`Component`](Component.md).[`style`](Component.md#style)

***

### type

> `get` **type**(): `"canvas"` \| `"layout"` \| `"panel"` \| `"component"`

元素类型（"layout"，"canvas"都派生自"panel"，所以可以认为只有两大类"component"，"panel"）。

#### Returns

`"canvas"` \| `"layout"` \| `"panel"` \| `"component"`

#### Inherited from

[`Component`](Component.md).[`type`](Component.md#type)

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

#### Inherited from

[`Component`](Component.md).[`width`](Component.md#width)

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

[`Component`](Component.md).[`AddChild`](Component.md#addchild)

***

### Draw()

> **Draw**(`pass`, `style`): `Promise`\<`void`\>

绘制元素。

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

#### Overrides

[`Component`](Component.md).[`Draw`](Component.md#draw)

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

[`Component`](Component.md).[`OnDrag`](Component.md#ondrag)

***

### Update()

> **Update**(`style`): `Promise`\<`any`\>

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

`Promise`\<`any`\>

返回是否绘制当前元素。

#### Overrides

[`Component`](Component.md).[`Update`](Component.md#update)
