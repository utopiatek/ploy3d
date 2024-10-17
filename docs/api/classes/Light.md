[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Light

# Class: Light

相机组件实例。

## Extends

- [`Resource`](Resource.md)\<[`Light`](Light.md)\>

## Constructors

### new Light()

> **new Light**(`impl`, `ptr`, `id`): [`Light`](Light.md)

构造函数。

#### Parameters

• **impl**: [`Light_kernel`](Light_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Light`](Light.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### channels

> `get` **channels**(): `number`

光源所属通道（仅对应通道打开时光源起作用）。

> `set` **channels**(`n`): `void`

#### Parameters

• **n**: `number`

#### Returns

`number`

***

### color

> `get` **color**(): `Float32Array`

光源颜色（线性空间）。

> `set` **color**(`value`): `void`

#### Parameters

• **value**: `number`[]

#### Returns

`Float32Array`

***

### direction

> `get` **direction**(): [`Vector3`](Vector3.md)

光源在世界空间中方向（等同全局空间方向，指向光源）。

#### Returns

[`Vector3`](Vector3.md)

***

### enabled

> `get` **enabled**(): `boolean`

是否启用组件。

> `set` **enabled**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### falloff

> `get` **falloff**(): `number`

点光源和聚光灯的衰减因子。

> `set` **falloff**(`value`): `void`

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

### lux

> `get` **lux**(): `number`

光源强度（照度，单位lux）。
对于方向光，它是以lux为单位的照度（太阳照度为100000lux）。
对于点光源和聚光灯，它是以lumen为单位的发光功率。

> `set` **lux**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### object3d

> `get` **object3d**(): [`Object3D`](Object3D.md)

组件所属对象。

#### Returns

[`Object3D`](Object3D.md)

***

### position

> `get` **position**(): [`Vector3`](Vector3.md)

点光源和聚光灯在世界空间中坐标。
太阳光：
X[SunAngularRadius]：太阳的角半径，太阳的实际半径与太阳到地球的距离的比值（单位为弧度，0.25°至20.0°之间，默认度数0.545°）。
Y[SunHaloSize]：太阳的光晕半径（太阳角半径的倍数，默认值10.0）。
Z[SunHaloFalloff]：太阳的光晕衰减（无量纲数值，用作指数，默认值80.0）。

#### Returns

[`Vector3`](Vector3.md)

***

### radius

> `get` **radius**(): `number`

光源辐射半径（影响范围，单位米。在该距离之外，光源影响为0）。

> `set` **radius**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### spotCone

> `get` **spotCone**(): `Float32Array`

X[InnerAngle]：聚光灯的内部圆锥角度（弧度，在~0.00873到m_nOuterAngle范围之间）。
Y[OuterAngle]：聚光灯的外部圆锥角度（弧度，在m_nInnerAngle到0.5PI范围之间）。

> `set` **spotCone**(`value`): `void`

#### Parameters

• **value**: `number`[]

#### Returns

`Float32Array`

***

### spotScaleOffset

> `get` **spotScaleOffset**(): `Float32Array`

聚光灯角度衰减参数（根据m_mSpotCone计算所得）。

> `set` **spotScaleOffset**(`value`): `void`

#### Parameters

• **value**: `number`[]

#### Returns

`Float32Array`

***

### type

> `get` **type**(): `"sun"` \| `"directional"` \| `"point"` \| `"focused_spot"` \| `"spot"`

光源类型。

> `set` **type**(`value`): `void`

#### Parameters

• **value**: `"sun"` \| `"directional"` \| `"point"` \| `"focused_spot"` \| `"spot"`

#### Returns

`"sun"` \| `"directional"` \| `"point"` \| `"focused_spot"` \| `"spot"`
