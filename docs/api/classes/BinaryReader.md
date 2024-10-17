[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / BinaryReader

# Class: BinaryReader

二进制数据读取器。

## Constructors

### new BinaryReader()

> **new BinaryReader**(`_global`, `buffer`): [`BinaryReader`](BinaryReader.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

• **buffer**: `ArrayBuffer`

数据缓存。

#### Returns

[`BinaryReader`](BinaryReader.md)

## Accessors

### Length

> `get` **Length**(): `number`

数据缓存大小。

#### Returns

`number`

***

### Position

> `get` **Position**(): `number`

当前读取指针。

> `set` **Position**(`position`): `void`

当前读取指针。

#### Parameters

• **position**: `number`

#### Returns

`number`

## Methods

### ReadBoolean()

> **ReadBoolean**(): `boolean`

读取8位布尔型。

#### Returns

`boolean`

返回布尔型。

***

### ReadBuffer()

> **ReadBuffer**(`size`): `ArrayBuffer`

读取一段数据缓存。

#### Parameters

• **size**: `number`

读取大小。

#### Returns

`ArrayBuffer`

返回缓存。

***

### ReadInt16()

> **ReadInt16**(): `number`

读取16位短整型。

#### Returns

`number`

返回整型数值。

***

### ReadInt32()

> **ReadInt32**(): `number`

读取32位整型。

#### Returns

`number`

返回整型数值。

***

### ReadInt32Array()

> **ReadInt32Array**(`count`): `Int32Array`

读取32位整型数组。

#### Parameters

• **count**: `number`

数组长度。

#### Returns

`Int32Array`

返回整型数组。

***

### ReadInt8()

> **ReadInt8**(): `number`

读取8位字节型。

#### Returns

`number`

返回整型数值。

***

### ReadSingle()

> **ReadSingle**(): `number`

读取32位浮点型。

#### Returns

`number`

返回浮点型数值。

***

### ReadSingleArray()

> **ReadSingleArray**(`count`): `Float32Array`

读取32位浮点型数组。

#### Parameters

• **count**: `number`

数组长度。

#### Returns

`Float32Array`

返回浮点型数组。

***

### ReadString()

> **ReadString**(): `string`

读取C#格式字符串。

#### Returns

`string`

返回字符串。

***

### ReadUInt16()

> **ReadUInt16**(): `number`

读取16位无符号短整型。

#### Returns

`number`

返回整型数值。

***

### ReadUInt32()

> **ReadUInt32**(): `number`

读取32位无符号整型。

#### Returns

`number`

返回整型数值。

***

### ReadUInt32Array()

> **ReadUInt32Array**(`count`): `Uint32Array`

读取32位无符号整型数组。

#### Parameters

• **count**: `number`

数组长度。

#### Returns

`Uint32Array`

返回整型数组。

***

### ReadUInt8()

> **ReadUInt8**(): `number`

读取8位无符号字节型。

#### Returns

`number`

返回整型数值。
