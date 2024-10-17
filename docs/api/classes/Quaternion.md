[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Quaternion

# Class: Quaternion

四元数。

## Constructors

### new Quaternion()

> **new Quaternion**(`impl`, `values`): [`Quaternion`](Quaternion.md)

构造函数。

#### Parameters

• **impl**: [`VMath_kernel`](VMath_kernel.md)

• **values**: `ArrayLike`\<`number`\>

四元数值（实例将维持该引用）。

#### Returns

[`Quaternion`](Quaternion.md)

## Accessors

### eulerAngles

> `get` **eulerAngles**(): [`Vector3`](Vector3.md)

转换为欧拉角表示（单位度）。

> `set` **eulerAngles**(`value`): `void`

#### Parameters

• **value**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)

***

### inverse

> `get` **inverse**(): [`Quaternion`](Quaternion.md)

四元数的逆。

#### Returns

[`Quaternion`](Quaternion.md)

***

### values

> `get` **values**(): `number`[]

四元数值。

#### Returns

`number`[]

***

### w

> `get` **w**(): `number`

四元数W通道值。

> `set` **w**(`w`): `void`

#### Parameters

• **w**: `number`

#### Returns

`number`

***

### x

> `get` **x**(): `number`

四元数X通道值。

> `set` **x**(`x`): `void`

#### Parameters

• **x**: `number`

#### Returns

`number`

***

### y

> `get` **y**(): `number`

四元数Y通道值。

> `set` **y**(`y`): `void`

#### Parameters

• **y**: `number`

#### Returns

`number`

***

### z

> `get` **z**(): `number`

四元数Z通道值。

> `set` **z**(`z`): `void`

#### Parameters

• **z**: `number`

#### Returns

`number`

## Methods

### Multiply()

> **Multiply**(`q1`): [`Quaternion`](Quaternion.md)

当前四元数乘以参数四元数（this * q = out）。

#### Parameters

• **q1**: [`Quaternion`](Quaternion.md)

#### Returns

[`Quaternion`](Quaternion.md)

***

### RotateVector()

> **RotateVector**(`v`): [`Vector3`](Vector3.md)

使用四元数旋转向量。

#### Parameters

• **v**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)
