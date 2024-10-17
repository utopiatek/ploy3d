[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Texture

# Class: Texture

贴图资源实例。

## Extends

- [`Resource`](Resource.md)\<[`Texture`](Texture.md)\>

## Constructors

### new Texture()

> **new Texture**(`impl`, `texture`, `id`, `uuid`): [`Texture`](Texture.md)

构造函数。

#### Parameters

• **impl**: [`Texture_kernel`](Texture_kernel.md)

实例管理器。

• **texture**: `any`

内部实例。

• **id**: `number`

实例ID。

• **uuid**: `string`

资源UUID。

#### Returns

[`Texture`](Texture.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

#### Inherited from

[`Resource`](Resource.md).[`id`](Resource.md#id)

***

### internalID

> `get` **internalID**(): `number`

贴图内部实例ID。

#### Returns

`number`

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`

#### Inherited from

[`Resource`](Resource.md).[`internalPtr`](Resource.md#internalptr)

***

### uuid

> `get` **uuid**(): `string`

贴图资源UUID。

#### Returns

`string`

## Methods

### AddRef()

> **AddRef**(): `void`

增加实例引用。

#### Returns

`void`

***

### Release()

> **Release**(): `void`

释放实例引用。

#### Returns

`void`
