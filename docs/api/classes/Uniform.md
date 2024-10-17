[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Uniform

# Class: Uniform\<T\>

着色器资源组基类。

## Extends

- [`Resource`](Resource.md)\<[`Uniform`](Uniform.md)\<`T`\>\>

## Extended by

- [`Material`](Material.md)
- [`FrameUniforms`](FrameUniforms.md)
- [`MeshRenderer`](MeshRenderer.md)

## Type Parameters

• **T**

## Constructors

### new Uniform()

> **new Uniform**\<`T`\>(`impl`, `ptr`, `id`): [`Uniform`](Uniform.md)\<`T`\>

构造函数。

#### Parameters

• **impl**: `any`

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Uniform`](Uniform.md)\<`T`\>

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### bindingID

> `get` **bindingID**(): `number`

资源组绑定对象ID（0或1）。

> `set` **bindingID**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### blockPtr

> `get` **blockPtr**(): `never`

属性块地址指针。

#### Returns

`never`

***

### bufferID

> `get` **bufferID**(): `number`

GPU常量缓存实例ID。

#### Returns

`number`

***

### bufferPtr

> `get` **bufferPtr**(): `never`

缓存地址指针。

#### Returns

`never`

***

### bufferSize

> `get` **bufferSize**(): `number`

缓存字节大小（256的倍数）。

#### Returns

`number`

***

### group

> `get` **group**(): `number`

资源组编号（可选值有0、1、2、3）。

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

### layoutID

> `get` **layoutID**(): `number`

资源绑定组布局ID（同时也是着色器内部实例ID）。

#### Returns

`number`

***

### offset

> `get` **offset**(): `number`

属性块在缓存中的字节偏移（256对齐）。

#### Returns

`number`

***

### readTS

> `get` **readTS**(): `number`

属性用于渲染读取时间戳。

> `set` **readTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### size

> `get` **size**(): `number`

属性块在缓存中的字节大小（256对齐）。

#### Returns

`number`

***

### tuple

> `get` **tuple**(): [`PropTuple`](../interfaces/PropTuple.md)

资源绑定组属性元组。

#### Returns

[`PropTuple`](../interfaces/PropTuple.md)

***

### updated

> `get` **updated**(): `boolean`

属性块数据更新状态。

> `set` **updated**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

***

### writeTS

> `get` **writeTS**(): `number`

属性上传GPU时间戳。

> `set` **writeTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

## Methods

### Bind()

> **Bind**(`passEncoder`): `void`

绑定资源组到着色器管线（包括统一缓存和所有贴图）。

#### Parameters

• **passEncoder**: `GPURenderPassEncoder`

渲染通道命令编码器。

#### Returns

`void`

***

### ReadBufferNode()

> **ReadBufferNode**(`ptr`): `object`

读取GPU常量缓存占用节点。

#### Parameters

• **ptr**: `never`

缓存占用节点指针。

#### Returns

`object`

返回缓存占用节点成员数据。

##### buffer

> **buffer**: `never`

##### bufferID

> **bufferID**: `number`

##### offset

> **offset**: `number`

##### size

> **size**: `number`
