[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Vector3

# Class: Vector3

三维向量。

## Constructors

### new Vector3()

> **new Vector3**(`impl`, `values`): [`Vector3`](Vector3.md)

构造函数。

#### Parameters

• **impl**: [`VMath_kernel`](VMath_kernel.md)

• **values**: `ArrayLike`\<`number`\>

向量值（实例将维持该引用）。

#### Returns

[`Vector3`](Vector3.md)

## Accessors

### length

> `get` **length**(): `number`

向量长度。

#### Returns

`number`

***

### normalized

> `get` **normalized**(): [`Vector3`](Vector3.md)

单位向量。

#### Returns

[`Vector3`](Vector3.md)

***

### values

> `get` **values**(): `number`[]

向量值。

#### Returns

`number`[]

***

### x

> `get` **x**(): `number`

向量X通道值。

> `set` **x**(`x`): `void`

#### Parameters

• **x**: `number`

#### Returns

`number`

***

### y

> `get` **y**(): `number`

向量Y通道值。

> `set` **y**(`y`): `void`

#### Parameters

• **y**: `number`

#### Returns

`number`

***

### z

> `get` **z**(): `number`

向量Z通道值。

> `set` **z**(`z`): `void`

#### Parameters

• **z**: `number`

#### Returns

`number`

## Methods

### AddVector3()

> **AddVector3**(`v`): [`Vector3`](Vector3.md)

向量相加。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

加数向量。

#### Returns

[`Vector3`](Vector3.md)

***

### AngleTo()

> **AngleTo**(`v`): `number`

当前向量与目标向量夹角（弧度）。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

目标向量。

#### Returns

`number`

***

### Cross()

> **Cross**(`v`): [`Vector3`](Vector3.md)

两向量叉乘。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

目标向量。

#### Returns

[`Vector3`](Vector3.md)

***

### DistanceTo()

> **DistanceTo**(`v`): `number`

当前点到目标点距离。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

目标点坐标。

#### Returns

`number`

***

### Dot()

> **Dot**(`v`): `number`

向量点积。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

点积向量。

#### Returns

`number`

***

### Multiply()

> **Multiply**(`v`): [`Vector3`](Vector3.md)

向量乘向量。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

乘数向量。

#### Returns

[`Vector3`](Vector3.md)

***

### MultiplyScalar()

> **MultiplyScalar**(`s`): [`Vector3`](Vector3.md)

向量乘标量（向量长度缩放）。

#### Parameters

• **s**: `number`

缩放值。

#### Returns

[`Vector3`](Vector3.md)

***

### Normalize()

> **Normalize**(): `void`

单位化向量。

#### Returns

`void`

***

### SubVector3()

> **SubVector3**(`v`): [`Vector3`](Vector3.md)

向量相减。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

减数向量。

#### Returns

[`Vector3`](Vector3.md)

***

### toQuaternion()

> **toQuaternion**(`order`?): [`Quaternion`](Quaternion.md)

欧拉角转四元数。

#### Parameters

• **order?**: `number`

内旋顺序，默认102-[Y-X-Z]

#### Returns

[`Quaternion`](Quaternion.md)

返回四元数。
