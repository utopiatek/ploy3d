[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Camera

# Class: Camera

相机组件实例。

## Extends

- [`Resource`](Resource.md)\<[`Camera`](Camera.md)\>

## Constructors

### new Camera()

> **new Camera**(`impl`, `ptr`, `id`): [`Camera`](Camera.md)

构造函数。

#### Parameters

• **impl**: [`Camera_kernel`](Camera_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Camera`](Camera.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### cullingFilter

> `get` **cullingFilter**(): `number`

裁剪过滤，被标记的层不会被视锥裁剪。

> `set` **cullingFilter**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### depth

> `get` **depth**(): `number`

相机渲染排序（数值越高越优先渲染，最大值视为主相机）。

> `set` **depth**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### distance

> `get` **distance**(): `number`

相机距观察目标距离（用于脱离变换组件控制相机姿态）。

> `set` **distance**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### enabled

> `get` **enabled**(): `boolean`

是否启用组件。

> `set` **enabled**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

***

### farZ

> `get` **farZ**(): `number`

远平面距离（用于计算相机投影矩阵）。

> `set` **farZ**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### fov

> `get` **fov**(): `number`

垂直视角（弧度，用于计算相机投影矩阵）。

> `set` **fov**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### height

> `get` **height**(): `number`

画布高度（用于计算相机投影矩阵）。

> `set` **height**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

#### Inherited from

[`Resource`](Resource.md).[`id`](Resource.md#id)

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`

#### Inherited from

[`Resource`](Resource.md).[`internalPtr`](Resource.md#internalptr)

***

### nearZ

> `get` **nearZ**(): `number`

近平面距离（用于计算相机投影矩阵）。

> `set` **nearZ**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### pitch

> `get` **pitch**(): `number`

相机俯角（角度，用于脱离变换组件控制相机姿态）。

> `set` **pitch**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### readTS

> `get` **readTS**(): `number`

相机参数应用时间戳（传递到GPU的时间戳）。

> `set` **readTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### roll

> `get` **roll**(): `number`

相机翻滚角（角度，用于脱离变换组件控制相机姿态）。

> `set` **roll**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### target

> `get` **target**(): `Float32Array`

观察目标世界空间坐标（用于脱离变换组件控制相机姿态）。

> `set` **target**(`value`): `void`

#### Parameters

• **value**: `ArrayLike`\<`number`\>

#### Returns

`Float32Array`

***

### transformCtrl

> `get` **transformCtrl**(): `boolean`

是否由所依附对象变换组件控制相机姿态。

> `set` **transformCtrl**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

***

### type

> `get` **type**(): `number`

相机类型（0-透视投影相机、1-正交投影相机）。

#### Returns

`number`

***

### updated

> `get` **updated**(): `boolean`

相机参数是否有更新。

> `set` **updated**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

***

### wdirection

> `get` **wdirection**(): [`Vector3`](Vector3.md)

世界空间观察向量。

#### Returns

[`Vector3`](Vector3.md)

***

### width

> `get` **width**(): `number`

画布宽度（用于计算相机投影矩阵）。

> `set` **width**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### wposition

> `get` **wposition**(): [`Vector3`](Vector3.md)

世界空间坐标。

#### Returns

[`Vector3`](Vector3.md)

***

### writeTS

> `get` **writeTS**(): `number`

相机参数更新时间戳（计算各个变换矩阵的时间戳）。

> `set` **writeTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### yaw

> `get` **yaw**(): `number`

相机偏航角（角度，用于脱离变换组件控制相机姿态）。

> `set` **yaw**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

## Methods

### Fit()

> **Fit**(`bounding`, `pitch`?, `yaw`?): `void`

使相机姿态适应观察内容范围。

#### Parameters

• **bounding**

观察内容范围。

• **bounding.center**: `number`[]

• **bounding.extents?**: `number`[]

• **pitch?**: `number`

• **yaw?**: `number`

#### Returns

`void`

***

### GetMatrix()

> **GetMatrix**(`key`): [`Matrix4x4`](Matrix4x4.md)

获取相机相关变换矩阵。

#### Parameters

• **key**: `"vfgMat"` \| `"gfvMat"` \| `"cfvMat"` \| `"vfcMat"` \| `"cfgMat"` \| `"gfcMat"` \| `"gfwMat"` \| `"wfgMat"` \| `"uvfvMat"` \| `"last_uvfvMat"` \| `"lastcfwMat"` \| `"cullingMat"`

变换矩阵名称。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

返回矩阵数据。

***

### Move()

> **Move**(`offsetX`, `offsetY`, `width`, `height`): `void`

相机平移控制方法。

#### Parameters

• **offsetX**: `number`

光标横向平移像素数。

• **offsetY**: `number`

光标纵向平移像素数。

• **width**: `number`

事件源元素宽度。

• **height**: `number`

事件源元素高度。

#### Returns

`void`

***

### Reset()

> **Reset**(): `void`

重置相机基本状态。

#### Returns

`void`

***

### Rotate()

> **Rotate**(`offsetX`, `offsetY`, `width`, `height`): `void`

相机旋转控制方法。

#### Parameters

• **offsetX**: `number`

光标横向平移像素数。

• **offsetY**: `number`

光标纵向平移像素数。

• **width**: `number`

事件源元素宽度。

• **height**: `number`

事件源元素高度。

#### Returns

`void`

***

### Scale()

> **Scale**(`delta`, `width`, `height`): `void`

相机推拉控制方法。

#### Parameters

• **delta**: `number`

滚轮方向。

• **width**: `number`

事件源元素宽度。

• **height**: `number`

事件源元素高度。

#### Returns

`void`

***

### ScreenPointToRay()

> **ScreenPointToRay**(`x`, `y`): `object`

屏幕空间坐标[0, 1]转世界空间射线。

#### Parameters

• **x**: `number`

屏幕空间坐标X[0,1]。

• **y**: `number`

屏幕空间坐标Y[0,1]。

#### Returns

`object`

返回世界空间射线起点和方向。

##### dir

> **dir**: [`Vector3`](Vector3.md)

##### origin

> **origin**: [`Vector3`](Vector3.md)

***

### Set3D()

> **Set3D**(`target`?, `distance`?, `pitch`?, `yaw`?): `void`

设置相机姿态。

#### Parameters

• **target?**: `ArrayLike`\<`number`\>

观察目标坐标（世界空间）。

• **distance?**: `number`

距观察目标距离。

• **pitch?**: `number`

相机俯角。

• **yaw?**: `number`

相机偏航角。

#### Returns

`void`

***

### WorldToScreen()

> **WorldToScreen**(`wpos`): `number`[]

世界坐标转相机屏幕坐标。

#### Parameters

• **wpos**: `number`[]

世界坐标

#### Returns

`number`[]

返回屏幕坐标。
