[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Material

# Class: Material

材质资源实例（G0、G2）。

## Extends

- [`Uniform`](Uniform.md)\<[`Material_kernel`](Material_kernel.md)\>

## Constructors

### new Material()

> **new Material**(`impl`, `ptr`, `id`): [`Material`](Material.md)

构造函数。

#### Parameters

• **impl**: [`Material_kernel`](Material_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Material`](Material.md)

#### Overrides

[`Uniform`](Uniform.md).[`constructor`](Uniform.md#constructors)

## Accessors

### bindingID

> `get` **bindingID**(): `number`

资源组绑定对象ID（0或1）。

> `set` **bindingID**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`bindingID`](Uniform.md#bindingid)

***

### blockPtr

> `get` **blockPtr**(): `never`

属性块地址指针。

#### Returns

`never`

#### Inherited from

[`Uniform`](Uniform.md).[`blockPtr`](Uniform.md#blockptr)

***

### bufferID

> `get` **bufferID**(): `number`

GPU常量缓存实例ID。

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`bufferID`](Uniform.md#bufferid)

***

### bufferPtr

> `get` **bufferPtr**(): `never`

缓存地址指针。

#### Returns

`never`

#### Inherited from

[`Uniform`](Uniform.md).[`bufferPtr`](Uniform.md#bufferptr)

***

### bufferSize

> `get` **bufferSize**(): `number`

缓存字节大小（256的倍数）。

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`bufferSize`](Uniform.md#buffersize)

***

### enableFlags

> `get` **enableFlags**(): `number`

材质属性启用标志集（G2，RENDER_FLAGS高24位）。

> `set` **enableFlags**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### group

> `get` **group**(): `number`

资源组编号（可选值有0、1、2、3）。

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`group`](Uniform.md#group)

***

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`id`](Uniform.md#id)

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`

#### Inherited from

[`Uniform`](Uniform.md).[`internalPtr`](Uniform.md#internalptr)

***

### layoutID

> `get` **layoutID**(): `number`

资源绑定组布局ID（同时也是着色器内部实例ID）。

#### Returns

`number`

#### Overrides

[`Uniform`](Uniform.md).[`layoutID`](Uniform.md#layoutid)

***

### offset

> `get` **offset**(): `number`

属性块在缓存中的字节偏移（256对齐）。

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`offset`](Uniform.md#offset)

***

### readTS

> `get` **readTS**(): `number`

属性用于渲染读取时间戳。

> `set` **readTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`readTS`](Uniform.md#readts)

***

### shader

> `get` **shader**(): [`ShaderRes`](ShaderRes.md)

材质使用的着色器资源。

#### Returns

[`ShaderRes`](ShaderRes.md)

***

### size

> `get` **size**(): `number`

属性块在缓存中的字节大小（256对齐）。

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`size`](Uniform.md#size)

***

### tuple

> `get` **tuple**(): [`PropTuple`](../interfaces/PropTuple.md)

资源绑定组属性元组。

#### Returns

[`PropTuple`](../interfaces/PropTuple.md)

#### Inherited from

[`Uniform`](Uniform.md).[`tuple`](Uniform.md#tuple)

***

### updated

> `get` **updated**(): `boolean`

属性块数据更新状态。

> `set` **updated**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Inherited from

[`Uniform`](Uniform.md).[`updated`](Uniform.md#updated)

***

### view

> `get` **view**(): `Record`\<`string`, `number`[]\>

材质属性访问视图。

#### Returns

`Record`\<`string`, `number`[]\>

***

### writeTS

> `get` **writeTS**(): `number`

属性上传GPU时间戳。

> `set` **writeTS**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

#### Inherited from

[`Uniform`](Uniform.md).[`writeTS`](Uniform.md#writets)

## Methods

### AddRef()

> **AddRef**(): `void`

增加实例引用。

#### Returns

`void`

***

### Bind()

> **Bind**(`passEncoder`): `void`

绑定资源组到着色器管线（包括统一缓存和所有贴图）。

#### Parameters

• **passEncoder**: `GPURenderPassEncoder`

渲染通道命令编码器。

#### Returns

`void`

#### Inherited from

[`Uniform`](Uniform.md).[`Bind`](Uniform.md#bind)

***

### Enable()

> **Enable**(`enable`, `flag`): `void`

启用材质设置标志。

#### Parameters

• **enable**: `boolean`

启用或禁用材质特性。

• **flag**: [`DRAW_ARRAYS`](../enumerations/RENDER_FLAGS.md#draw_arrays) \| [`HAS_DOUBLE_SIDED`](../enumerations/RENDER_FLAGS.md#has_double_sided) \| [`HAS_EMISSIVE`](../enumerations/RENDER_FLAGS.md#has_emissive) \| [`HAS_REFLECTIONS`](../enumerations/RENDER_FLAGS.md#has_reflections) \| [`HAS_CLEAR_COAT`](../enumerations/RENDER_FLAGS.md#has_clear_coat) \| [`HAS_ANISOTROPY`](../enumerations/RENDER_FLAGS.md#has_anisotropy)

材质特性标志。

#### Returns

`void`

***

### GetTexture()

> **GetTexture**(`name`): [`TextureNode`](../interfaces/TextureNode.md)

获取贴图属性。

#### Parameters

• **name**: `string`

属性名称。

#### Returns

[`TextureNode`](../interfaces/TextureNode.md)

返回贴图描述符。

***

### GetVector()

> **GetVector**(`name`): `number`[]

获取向量属性（标量被视为一维向量）。

#### Parameters

• **name**: `string`

属性名称。

#### Returns

`number`[]

返回数值数组。

***

### HasProperty()

> **HasProperty**(`name`): `boolean`

判断材质是否包含指定属性。

#### Parameters

• **name**: `string`

属性名称（注意贴图属性需要加上"_uuid"后缀）。

#### Returns

`boolean`

返回true则包含指定属性。

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

#### Inherited from

[`Uniform`](Uniform.md).[`ReadBufferNode`](Uniform.md#readbuffernode)

***

### Release()

> **Release**(): `void`

释放实例引用。

#### Returns

`void`

***

### SetBlendMode()

> **SetBlendMode**(`blendMode`): `void`

设置材质混合模式。

#### Parameters

• **blendMode**: [`BLEND_MODE`](../enumerations/BLEND_MODE.md)

材质混合模式。

#### Returns

`void`

***

### SetTexture()

> **SetTexture**(`name`, `value`): `void`

设置贴图属性。

#### Parameters

• **name**: `string`

属性名称。

• **value**: [`TextureNode`](../interfaces/TextureNode.md)

贴图描述符（注意，贴图URI必须是UUID）。

#### Returns

`void`

***

### SetVector()

> **SetVector**(`name`, `value`): `void`

设置向量属性（标量被视为一维向量）。

#### Parameters

• **name**: `string`

属性名称。

• **value**: `number`[]

数值数组。

#### Returns

`void`

***

### SubmitVector()

> **SubmitVector**(`name`, `value`): `void`

设置向量属性并立即提交到GPU（用于小数据直接更新，标量被视为一维向量）。

#### Parameters

• **name**: `string`

属性名称。

• **value**: `number`[]

数值数组。

#### Returns

`void`
