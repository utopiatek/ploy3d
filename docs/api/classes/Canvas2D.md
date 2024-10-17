[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Canvas2D

# Class: Canvas2D

2D绘制接口。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D)

## Constructors

### new Canvas2D()

> **new Canvas2D**(`renderer`, `width`, `height`): [`Canvas2D`](Canvas2D.md)

构造函数。

#### Parameters

• **renderer**: [`Renderer2D`](Renderer2D.md)

2D渲染器实例。

• **width**: `number`

画布宽度。

• **height**: `number`

画布高度。

#### Returns

[`Canvas2D`](Canvas2D.md)

## Properties

### data

> **data**: `object`

2D绘制接口实例数据。

#### batch

> **batch**: `object`

当前绘制批次。

#### batch.binding?

> `optional` **binding**: `GPUBindGroup`

当前批次资源绑定组实例。

#### batch.binding\_key?

> `optional` **binding\_key**: `string`

当前批次资源绑定组实例标识。

#### batch.geometriesOffset

> **geometriesOffset**: `number`

几何数据单元数组偏移。

#### batch.geometryCount

> **geometryCount**: `number`

几何数据单元数量（最大1024）。

#### batch.instanceCount

> **instanceCount**: `number`

绘制实例数量（最大1024）。

#### batch.instancesOffset

> **instancesOffset**: `number`

绘制实例数组偏移。

#### batch.styleCount

> **styleCount**: `number`

样式实例数量（最大512）。

#### batch.styleLut

> **styleLut**: `Record`\<`string`, `number`\>

引用的样式实例查找表。

#### batch.stylesOffset

> **stylesOffset**: `number`

样式实例数组偏移。

#### batch.transformCount

> **transformCount**: `number`

变换矩阵数量（最大512）。

#### batch.transformsOffset

> **transformsOffset**: `number`

变换矩阵数组偏移。

#### batches

> **batches**: `object`[]

绘制批次数组。

#### fillStyle

> **fillStyle**: [`Style2D`](Style2D.md)

当前用于填充的样式实例。

#### frameTS

> **frameTS**: `number`

当前绘制实例数据帧时间戳。

#### geometries

> **geometries**: `number`[]

几何数据单元数组（每个占用4个UINT）。

#### geometriesOffset

> **geometriesOffset**: `number`

几何数据单元数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。

#### geometryCount

> **geometryCount**: `number`

几何数据单元数量（最大1024）。

#### geometryCur

> **geometryCur**: `number`

最新应用几何数据单元起始索引。

#### height

> **height**: `number`

画布高度。

#### instanceCount

> **instanceCount**: `number`

绘制实例数量（最大1024）。

#### instances

> **instances**: `number`[]

绘制实例数组（每个占用1个UVEC4）。

#### instancesOffset

> **instancesOffset**: `number`

绘制实例数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。

#### lineWidth

> **lineWidth**: `number`

当前线条宽度。

#### path

> **path**: [`Path2D`](Path2D.md)

当前操作的几何路径实例。

#### strokeStyle

> **strokeStyle**: [`Style2D`](Style2D.md)

当前用于描边的样式实例。

#### styleCount

> **styleCount**: `number`

样式实例数量（最大512）。

#### styles

> **styles**: [`Style2D`](Style2D.md)[]

样式实例数组（每个占用2个UVEC4）。

#### stylesOffset

> **stylesOffset**: `number`

样式实例数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。

#### transform

> **transform**: `object`

当前变换组件。

#### transform.applied

> **applied**: `boolean`

当前变换矩阵是否已应用。

#### transform.data

> **data**: `number`[]

当前变换组件数据。

#### transformCount

> **transformCount**: `number`

变换矩阵数量（最大512）。

#### transforms

> **transforms**: `number`[]

变换矩阵数组（每个占用2个VEC4，最后2个浮点型记录画布宽高）。

#### transformsOffset

> **transformsOffset**: `number`

变换矩阵数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。

#### width

> **width**: `number`

画布宽度。

***

### renderer

> **renderer**: [`Renderer2D`](Renderer2D.md)

2D渲染器实例。

## Accessors

### canvas

> `get` **canvas**(): `HTMLCanvasElement`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/canvas)

#### Returns

`HTMLCanvasElement`

***

### direction

> `get` **direction**(): `CanvasDirection`

> `set` **direction**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/direction)

#### Parameters

• **value**: `CanvasDirection`

#### Returns

`CanvasDirection`

***

### fillStyle

> `get` **fillStyle**(): `string` \| `CanvasGradient` \| `CanvasPattern`

> `set` **fillStyle**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillStyle)

#### Parameters

• **value**: `string` \| `CanvasGradient` \| `CanvasPattern`

#### Returns

`string` \| `CanvasGradient` \| `CanvasPattern`

***

### filter

> `get` **filter**(): `string`

> `set` **filter**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/filter)

#### Parameters

• **value**: `string`

#### Returns

`string`

***

### font

> `get` **font**(): `string`

> `set` **font**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/font)

#### Parameters

• **value**: `string`

#### Returns

`string`

***

### fontKerning

> `get` **fontKerning**(): `CanvasFontKerning`

> `set` **fontKerning**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fontKerning)

#### Parameters

• **value**: `CanvasFontKerning`

#### Returns

`CanvasFontKerning`

***

### globalAlpha

> `get` **globalAlpha**(): `number`

> `set` **globalAlpha**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalAlpha)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### globalCompositeOperation

> `get` **globalCompositeOperation**(): `GlobalCompositeOperation`

> `set` **globalCompositeOperation**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)

#### Parameters

• **value**: `GlobalCompositeOperation`

#### Returns

`GlobalCompositeOperation`

***

### imageSmoothingEnabled

> `get` **imageSmoothingEnabled**(): `boolean`

> `set` **imageSmoothingEnabled**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled)

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

***

### imageSmoothingQuality

> `get` **imageSmoothingQuality**(): `ImageSmoothingQuality`

> `set` **imageSmoothingQuality**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality)

#### Parameters

• **value**: `ImageSmoothingQuality`

#### Returns

`ImageSmoothingQuality`

***

### lineCap

> `get` **lineCap**(): `CanvasLineCap`

> `set` **lineCap**(`value`): `void`

指示如何绘制线段末端。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineCap)

#### Parameters

• **value**: `CanvasLineCap`

#### Returns

`CanvasLineCap`

***

### lineDashOffset

> `get` **lineDashOffset**(): `number`

> `set` **lineDashOffset**(`value`): `void`

虚线交替起始偏移，依此可实现动画效果。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### lineJoin

> `get` **lineJoin**(): `CanvasLineJoin`

> `set` **lineJoin**(`value`): `void`

描述两线段连接属性。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineJoin)

#### Parameters

• **value**: `CanvasLineJoin`

#### Returns

`CanvasLineJoin`

***

### lineWidth

> `get` **lineWidth**(): `number`

> `set` **lineWidth**(`value`): `void`

线宽。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineWidth)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### miterLimit

> `get` **miterLimit**(): `number`

> `set` **miterLimit**(`value`): `void`

当两条线段以尖角相交时，如果尖角的长度超过 miterLimit 的值，尖角会被切断，转而使用斜角（bevel join）来绘制。这可以防止尖角过长，导致视觉上的不美观。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/miterLimit)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowBlur

> `get` **shadowBlur**(): `number`

> `set` **shadowBlur**(`value`): `void`

描述模糊效果程度的属性；它既不对应像素值也不受当前转换矩阵的影响。默认值是 0。，浮动值，单位没有含义
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowBlur)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowColor

> `get` **shadowColor**(): `string`

> `set` **shadowColor**(`value`): `void`

阴影颜色，不透明，阴影才会被绘制。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowColor)

#### Parameters

• **value**: `string`

#### Returns

`string`

***

### shadowOffsetX

> `get` **shadowOffsetX**(): `number`

> `set` **shadowOffsetX**(`value`): `void`

描述阴影垂直偏移距离的属性。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### shadowOffsetY

> `get` **shadowOffsetY**(): `number`

> `set` **shadowOffsetY**(`value`): `void`

描述阴影垂直偏移距离的属性。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY)

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### strokeStyle

> `get` **strokeStyle**(): `string` \| `CanvasGradient` \| `CanvasPattern`

> `set` **strokeStyle**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeStyle)

#### Parameters

• **value**: `string` \| `CanvasGradient` \| `CanvasPattern`

#### Returns

`string` \| `CanvasGradient` \| `CanvasPattern`

***

### textAlign

> `get` **textAlign**(): `CanvasTextAlign`

> `set` **textAlign**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textAlign)

#### Parameters

• **value**: `CanvasTextAlign`

#### Returns

`CanvasTextAlign`

***

### textBaseline

> `get` **textBaseline**(): `CanvasTextBaseline`

> `set` **textBaseline**(`value`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textBaseline)

#### Parameters

• **value**: `CanvasTextBaseline`

#### Returns

`CanvasTextBaseline`

## Methods

### arc()

> **arc**(`x`, `y`, `radius`, `startAngle`, `endAngle`, `counterclockwise`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arc)

#### Parameters

• **x**: `number`

• **y**: `number`

• **radius**: `number`

• **startAngle**: `number`

• **endAngle**: `number`

• **counterclockwise?**: `boolean`

#### Returns

`void`

***

### arcTo()

> **arcTo**(`x1`, `y1`, `x2`, `y2`, `radius`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arcTo)

#### Parameters

• **x1**: `number`

• **y1**: `number`

• **x2**: `number`

• **y2**: `number`

• **radius**: `number`

#### Returns

`void`

***

### beginPath()

> **beginPath**(): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/beginPath)

#### Returns

`void`

***

### bezierCurveTo()

> **bezierCurveTo**(`cp1x`, `cp1y`, `cp2x`, `cp2y`, `x`, `y`): `void`

绘制三次贝赛尔曲线路径的方法。该方法需要三个点。第一、第二个点是控制点，第三个点是结束点。起始点是当前路径的最后一个点，绘制贝赛尔曲线前，可以通过调用 moveTo() 进行修改。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)

#### Parameters

• **cp1x**: `number`

• **cp1y**: `number`

• **cp2x**: `number`

• **cp2y**: `number`

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### clearRect()

> **clearRect**(`x`, `y`, `w`, `h`): `void`

清除一个矩形区域为黑色透明颜色。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clearRect)

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

#### Returns

`void`

***

### clip()

> **clip**(`path_or_rule`, `fillRule`?): `void`

将当前创建的路径设置为当前剪切路径的方法。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clip)

#### Parameters

• **path\_or\_rule**: `CanvasFillRule` \| [`Path2D`](Path2D.md)

• **fillRule?**: `CanvasFillRule`

#### Returns

`void`

***

### closePath()

> **closePath**(): `void`

将笔点返回到当前子路径起始点的方法。它尝试从当前点到起始点绘制一条直线。如果图形已经是封闭的或者只有一个点，那么此方法不会做任何操作。
不调用路径可能未闭合。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/closePath)

#### Returns

`void`

***

### createConicGradient()

> **createConicGradient**(`startAngle`, `x`, `y`): `CanvasGradient`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createConicGradient)

#### Parameters

• **startAngle**: `number`

• **x**: `number`

• **y**: `number`

#### Returns

`CanvasGradient`

***

### createImageData()

> **createImageData**(`sw_or_imagedata`, `sh`?, `settings`?): `ImageData`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createImageData)

#### Parameters

• **sw\_or\_imagedata**: `number` \| `ImageData`

• **sh?**: `number`

• **settings?**: `ImageDataSettings`

#### Returns

`ImageData`

***

### createLinearGradient()

> **createLinearGradient**(`x0`, `y0`, `x1`, `y1`): `CanvasGradient`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)

#### Parameters

• **x0**: `number`

• **y0**: `number`

• **x1**: `number`

• **y1**: `number`

#### Returns

`CanvasGradient`

***

### createPattern()

> **createPattern**(`image`, `repetition`): `CanvasPattern`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createPattern)

#### Parameters

• **image**: `CanvasImageSource`

• **repetition**: `string`

#### Returns

`CanvasPattern`

***

### createRadialGradient()

> **createRadialGradient**(`x0`, `y0`, `r0`, `x1`, `y1`, `r1`): `CanvasGradient`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createRadialGradient)

#### Parameters

• **x0**: `number`

• **y0**: `number`

• **r0**: `number`

• **x1**: `number`

• **y1**: `number`

• **r1**: `number`

#### Returns

`CanvasGradient`

***

### Draw()

> **Draw**(`queue`, `method`, `params`): `void`

直接渲染画布到网格。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

渲染队列。

• **method**: `string`

渲染方法。

• **params**: `number`[]

渲染参数。

#### Returns

`void`

***

### drawFocusIfNeeded()

> **drawFocusIfNeeded**(`path_or_element`, `element`?): `void`

如果指定HTML元素处于焦点状态，绘制当前PATH或指定PATH。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawFocusIfNeeded)

#### Parameters

• **path\_or\_element**: `Element` \| [`Path2D`](Path2D.md)

• **element?**: `Element`

#### Returns

`void`

***

### drawImage()

> **drawImage**(`image`, `dx_or_sx`, `dy_or_sy`, `dw_or_sw`?, `dh_or_sh`?, `dx`?, `dy`?, `dw`?, `dh`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawImage)

#### Parameters

• **image**: `CanvasImageSource`

• **dx\_or\_sx**: `number`

• **dy\_or\_sy**: `number`

• **dw\_or\_sw?**: `number`

• **dh\_or\_sh?**: `number`

• **dx?**: `number`

• **dy?**: `number`

• **dw?**: `number`

• **dh?**: `number`

#### Returns

`void`

***

### ellipse()

> **ellipse**(`x`, `y`, `radiusX`, `radiusY`, `rotation`, `startAngle`, `endAngle`, `counterclockwise`?): `void`

添加椭圆路径的方法。椭圆的圆心在（x,y）位置，半径分别是radiusX 和 radiusY，按照anticlockwise（默认顺时针）指定的方向，从 startAngle 开始绘制，到 endAngle 结束。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/ellipse)

#### Parameters

• **x**: `number`

• **y**: `number`

• **radiusX**: `number`

• **radiusY**: `number`

• **rotation**: `number`

• **startAngle**: `number`

• **endAngle**: `number`

• **counterclockwise?**: `boolean`

#### Returns

`void`

***

### fill()

> **fill**(`path_or_rule`?, `fillRule`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fill)

#### Parameters

• **path\_or\_rule?**: `CanvasFillRule` \| [`Path2D`](Path2D.md)

• **fillRule?**: `CanvasFillRule`

#### Returns

`void`

***

### fillRect()

> **fillRect**(`x`, `y`, `w`, `h`): `void`

填充矩形。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillRect)

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

#### Returns

`void`

***

### fillText()

> **fillText**(`text`, `x`, `y`, `maxWidth`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillText)

#### Parameters

• **text**: `string`

• **x**: `number`

• **y**: `number`

• **maxWidth?**: `number`

#### Returns

`void`

***

### Flush()

> **Flush**(`drawMode`): `void`

刷新绘制实例数据。

#### Parameters

• **drawMode**: `number`

当前绘制模式：1-填充、2-描边

#### Returns

`void`

***

### getContextAttributes()

> **getContextAttributes**(): `CanvasRenderingContext2DSettings`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getContextAttributes)

#### Returns

`CanvasRenderingContext2DSettings`

***

### getImageData()

> **getImageData**(`sx`, `sy`, `sw`, `sh`, `settings`?): `ImageData`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getImageData)

#### Parameters

• **sx**: `number`

• **sy**: `number`

• **sw**: `number`

• **sh**: `number`

• **settings?**: `ImageDataSettings`

#### Returns

`ImageData`

***

### getLineDash()

> **getLineDash**(): `number`[]

获取虚线交替长度。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getLineDash)

#### Returns

`number`[]

***

### getTransform()

> **getTransform**(): `DOMMatrix`

获取当前被应用到上下文的转换矩阵。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getTransform)

#### Returns

`DOMMatrix`

***

### isPointInPath()

> **isPointInPath**(`path_or_x`, `x_or_y`, `y_or_rule`, `fillRule`?): `boolean`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInPath)

#### Parameters

• **path\_or\_x**: `number` \| [`Path2D`](Path2D.md)

• **x\_or\_y**: `number`

• **y\_or\_rule**: `number` \| `CanvasFillRule`

• **fillRule?**: `CanvasFillRule`

#### Returns

`boolean`

***

### isPointInStroke()

> **isPointInStroke**(`path_or_x`, `x_or_y`, `y`?): `boolean`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInStroke)

#### Parameters

• **path\_or\_x**: [`Path2D`](Path2D.md)

• **x\_or\_y**: `number`

• **y?**: `number`

#### Returns

`boolean`

***

### lineTo()

> **lineTo**(`x`, `y`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineTo)

#### Parameters

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### measureText()

> **measureText**(`text`): `TextMetrics`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/measureText)

#### Parameters

• **text**: `string`

#### Returns

`TextMetrics`

***

### moveTo()

> **moveTo**(`x`, `y`): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/moveTo)

#### Parameters

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### putImageData()

> **putImageData**(`imagedata`, `dx`, `dy`, `dirtyX`?, `dirtyY`?, `dirtyWidth`?, `dirtyHeight`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/putImageData)

#### Parameters

• **imagedata**: `ImageData`

• **dx**: `number`

• **dy**: `number`

• **dirtyX?**: `number`

• **dirtyY?**: `number`

• **dirtyWidth?**: `number`

• **dirtyHeight?**: `number`

#### Returns

`void`

***

### quadraticCurveTo()

> **quadraticCurveTo**(`cpx`, `cpy`, `x`, `y`): `void`

新增二次贝塞尔曲线路径的方法。它需要 2 个点。第一个点是控制点，第二个点是终点。起始点是当前路径最新的点，当创建二次贝赛尔曲线之前，可以使用 moveTo() 方法进行改变。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo)

#### Parameters

• **cpx**: `number`

• **cpy**: `number`

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### rect()

> **rect**(`x`, `y`, `w`, `h`): `void`

创建矩形路径。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rect)

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

#### Returns

`void`

***

### resetTransform()

> **resetTransform**(): `void`

重新设置当前变形为单位矩阵。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/resetTransform)

#### Returns

`void`

***

### restore()

> **restore**(): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/restore)

#### Returns

`void`

***

### rotate()

> **rotate**(`angle`): `void`

在当前变换矩阵中增加旋转的方法（角度变量表示一个顺时针旋转角度并且用弧度表示）。
执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rotate)

#### Parameters

• **angle**: `number`

#### Returns

`void`

***

### roundRect()

> **roundRect**(`x`, `y`, `w`, `h`, `radii`?): `void`

创建圆角矩形路径。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/roundRect)

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

• **radii?**: `number` \| `DOMPointInit` \| (`number` \| `DOMPointInit`)[]

#### Returns

`void`

***

### save()

> **save**(): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/save)

#### Returns

`void`

***

### scale()

> **scale**(`x`, `y`): `void`

画布默认单位是1像素，如果设置缩放为0.5，则单位是0.5像素。
执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/scale)

#### Parameters

• **x**: `number`

• **y**: `number`

#### Returns

`void`

***

### setLineDash()

> **setLineDash**(`segments`): `void`

设置虚线交替长度。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash)

#### Parameters

• **segments**: `number`[]

#### Returns

`void`

***

### setTransform()

> **setTransform**(`a_or_transform`?, `b`?, `c`?, `d`?, `e`?, `f`?): `void`

重设变换矩阵（注意不是叠加的）。
默认情况下，变换按以下顺序应用：缩放、旋转、平移。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setTransform)

#### Parameters

• **a\_or\_transform?**: `number` \| `DOMMatrix2DInit`

• **b?**: `number`

• **c?**: `number`

• **d?**: `number`

• **e?**: `number`

• **f?**: `number`

#### Returns

`void`

***

### stroke()

> **stroke**(`path`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/stroke)

#### Parameters

• **path?**: [`Path2D`](Path2D.md)

#### Returns

`void`

***

### strokeRect()

> **strokeRect**(`x`, `y`, `w`, `h`): `void`

描边，线宽向基线两边延展。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeRect)

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

#### Returns

`void`

***

### strokeText()

> **strokeText**(`text`, `x`, `y`, `maxWidth`?): `void`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeText)

#### Parameters

• **text**: `string`

• **x**: `number`

• **y**: `number`

• **maxWidth?**: `number`

#### Returns

`void`

***

### transform()

> **transform**(`a`, `b`, `c`, `d`, `e`, `f`): `void`

设置叠加变换（注意变换是叠加的）。
这个方法可以用来同时进行缩放、旋转、平移和倾斜（注意倾斜的概念）。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/transform)

#### Parameters

• **a**: `number`

• **b**: `number`

• **c**: `number`

• **d**: `number`

• **e**: `number`

• **f**: `number`

#### Returns

`void`

***

### translate()

> **translate**(`x`, `y`): `void`

平移画布空间。
执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
[MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/translate)

#### Parameters

• **x**: `number`

• **y**: `number`

#### Returns

`void`
