[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / BinaryWriter

# Class: BinaryWriter

二进制数据写入器。

## Constructors

### new BinaryWriter()

> **new BinaryWriter**(`_global`, `buffer`): [`BinaryWriter`](BinaryWriter.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

• **buffer**: `ArrayBuffer`

数据缓存。

#### Returns

[`BinaryWriter`](BinaryWriter.md)

## Accessors

### Length

> `get` **Length**(): `number`

数据缓存大小。

#### Returns

`number`

***

### Position

> `get` **Position**(): `number`

当前写入指针。

> `set` **Position**(`position`): `void`

当前写入指针。

#### Parameters

• **position**: `number`

#### Returns

`number`

## Methods

### WriteBoolean()

> **WriteBoolean**(`value`): `void`

写入8位布尔型。

#### Parameters

• **value**: `boolean`

布尔型。

#### Returns

`void`

***

### WriteBuffer()

> **WriteBuffer**(`buffer`): `void`

写入数据缓存。

#### Parameters

• **buffer**: `ArrayBuffer`

数据缓存。

#### Returns

`void`

***

### WriteInt16()

> **WriteInt16**(`value`): `void`

写入16位整型。

#### Parameters

• **value**: `number`

整型值。

#### Returns

`void`

***

### WriteInt32()

> **WriteInt32**(`value`): `void`

写入32位整型。

#### Parameters

• **value**: `number`

整型值。

#### Returns

`void`

***

### WriteInt32Array()

> **WriteInt32Array**(`value`): `void`

写入32位整数组。

#### Parameters

• **value**: `Int32Array`

整数组。

#### Returns

`void`

***

### WriteInt8()

> **WriteInt8**(`value`): `void`

写入8位整型。

#### Parameters

• **value**: `number`

整型值。

#### Returns

`void`

***

### WriteSingle()

> **WriteSingle**(`value`): `void`

写入32位浮点型。

#### Parameters

• **value**: `number`

浮点型值。

#### Returns

`void`

***

### WriteSingleArray()

> **WriteSingleArray**(`value`): `void`

写入32位浮点型数组。

#### Parameters

• **value**: `Float32Array`

浮点型数组。

#### Returns

`void`

***

### WriteUInt16()

> **WriteUInt16**(`value`): `void`

写入8位无符号整型。

#### Parameters

• **value**: `number`

整型值。

#### Returns

`void`

***

### WriteUInt32()

> **WriteUInt32**(`value`): `void`

写入32位整型。

#### Parameters

• **value**: `number`

整型值。

#### Returns

`void`

***

### WriteUInt32Array()

> **WriteUInt32Array**(`value`): `void`

写入32位无符号整数组。

#### Parameters

• **value**: `Uint32Array`

整数组。

#### Returns

`void`

***

### WriteUInt8()

> **WriteUInt8**(`value`): `void`

写入8位无符号整型。

#### Parameters

• **value**: `number`

整型值。

#### Returns

`void`
