[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / ShaderRes

# Class: ShaderRes

着色器资源实例。

## Extends

- [`Resource`](Resource.md)\<[`ShaderRes`](ShaderRes.md)\>

## Constructors

### new ShaderRes()

> **new ShaderRes**(`impl`, `shader`, `id`): [`ShaderRes`](ShaderRes.md)

构造函数。

#### Parameters

• **impl**: [`Shader_kernel`](Shader_kernel.md)

实例管理器。

• **shader**: [`Shader`](../interfaces/Shader.md)

内部实例。

• **id**: `number`

实例ID。

#### Returns

[`ShaderRes`](ShaderRes.md)

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

着色器内部实例ID。

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

### shader

> `get` **shader**(): [`Shader`](../interfaces/Shader.md)

资源实例内部实现。

#### Returns

[`Shader`](../interfaces/Shader.md)

***

### uniformSize

> `get` **uniformSize**(): `number`

着色器属性统一变量块大小。

#### Returns

`number`

***

### uuid

> `get` **uuid**(): `string`

着色器资源UUID。

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
