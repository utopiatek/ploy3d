[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / FrameUniforms

# Class: FrameUniforms

帧统一资源组实例（G0）。

## Extends

- [`Uniform`](Uniform.md)\<[`Material_kernel`](Material_kernel.md)\>

## Constructors

### new FrameUniforms()

> **new FrameUniforms**(`impl`, `ptr`, `id`): [`FrameUniforms`](FrameUniforms.md)

构造函数。

#### Parameters

• **impl**: [`Material_kernel`](Material_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`FrameUniforms`](FrameUniforms.md)

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

相关状态标志集。

> `set` **enableFlags**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### g0\_colorRT

> `get` **g0\_colorRT**(): `number`

颜色渲染目标贴图ID。

> `set` **g0\_colorRT**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### g0\_depthRT

> `get` **g0\_depthRT**(): `number`

深度渲染目标贴图ID。

> `set` **g0\_depthRT**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### g0\_froxelList

> `get` **g0\_froxelList**(): `object`

光源体素列表缓存（绑定到G0）。

#### Returns

`object`

##### buffer

> **buffer**: `never`

##### bufferID

> **bufferID**: `number`

##### offset

> **offset**: `number`

##### size

> **size**: `number`

***

### g0\_gbufferRT

> `get` **g0\_gbufferRT**(): `number`

GB渲染目标贴图ID。

> `set` **g0\_gbufferRT**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### g0\_lightList

> `get` **g0\_lightList**(): `object`

光源列表缓存（绑定到G0）。

#### Returns

`object`

##### buffer

> **buffer**: `never`

##### bufferID

> **bufferID**: `number`

##### offset

> **offset**: `number`

##### size

> **size**: `number`

***

### g0\_lightVoxel

> `get` **g0\_lightVoxel**(): `object`

光源索引表缓存（绑定到G0）。

#### Returns

`object`

##### buffer

> **buffer**: `never`

##### bufferID

> **bufferID**: `number`

##### offset

> **offset**: `number`

##### size

> **size**: `number`

***

### g0\_spriteAtlas

> `get` **g0\_spriteAtlas**(): `number`

精灵图集ID（用于UI和粒子）。

> `set` **g0\_spriteAtlas**(`value`): `void`

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

#### Inherited from

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

### ComputeLightSpaceMatrixes()

> **ComputeLightSpaceMatrixes**(`camera`, `cascadeIndex`): `void`

计算用于阴影投影的相关矩阵。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例，用于获取视锥信息。

• **cascadeIndex**: `number`

Cascaded Shadow Maps视锥分片索引（大于-1时设置阴影投影渲染相关矩阵）。

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

#### Inherited from

[`Uniform`](Uniform.md).[`ReadBufferNode`](Uniform.md#readbuffernode)

***

### Release()

> **Release**(): `void`

释放实例引用。

#### Returns

`void`

***

### UpdateFrameUniforms()

> **UpdateFrameUniforms**(`camera`, `volume`): `void`

根据相机组件数据和体积组件数据更新数据。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例。

• **volume**: [`Volume`](Volume.md)

体积组件实例。

#### Returns

`void`
