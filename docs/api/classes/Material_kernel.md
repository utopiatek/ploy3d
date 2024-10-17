[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Material\_kernel

# Class: Material\_kernel

材质资源内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Material`](Material.md) \| [`FrameUniforms`](FrameUniforms.md), *typeof* [`Material_member_index`](../variables/Material_member_index.md)\>

## Constructors

### new Material\_kernel()

> **new Material\_kernel**(`_global`): [`Material_kernel`](Material_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Material_kernel`](Material_kernel.md)

#### Overrides

Miaoverse.Base\_kernel\<Material \| FrameUniforms, typeof Material\_member\_index\>.constructor

## Methods

### Create()

> **Create**(`asset`): `Promise`\<[`Material`](Material.md)\>

创建材质资源实例。

#### Parameters

• **asset**: [`Asset_material`](../interfaces/Asset_material.md)

材质资源描述符。

#### Returns

`Promise`\<[`Material`](Material.md)\>

异步返回材质资源实例。

***

### CreateFrameUniforms()

> **CreateFrameUniforms**(`colorRT`, `depthRT`, `gbufferRT`, `spriteAtlas`): `Promise`\<[`FrameUniforms`](FrameUniforms.md)\>

创建G0资源实例。

#### Parameters

• **colorRT**: `number`

颜色渲染目标贴图ID。

• **depthRT**: `number`

深度渲染目标贴图ID。

• **gbufferRT**: `number`

GB渲染目标贴图ID。

• **spriteAtlas**: `number`

精灵图集ID（用于UI和粒子）。

#### Returns

`Promise`\<[`FrameUniforms`](FrameUniforms.md)\>

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"buffer"` \| `"id"` \| `"next"` \| `"group"` \| `"buffer_bufferID"` \| `"buffer_size"` \| `"buffer_addr"` \| `"buffer_next"` \| `"bn_buffer"` \| `"bn_bufferID"` \| `"bn_offset"` \| `"bn_size"` \| `"bufferID"` \| `"bufferBlockOffset"` \| `"bufferBlockSize"` \| `"binding"` \| `"updated"` \| `"m_reserved76"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"g0_colorRT"` \| `"g0_depthRT"` \| `"g0_gbufferRT"` \| `"g0_spriteAtlas"` \| `"g0_froxelList"` \| `"g0_lightVoxel"` \| `"g0_lightList"` \| `"shaderID"` \| `"shaderUUID"` \| `"enableFlags"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### Load()

> **Load**(`uri`, `pkg`?): `Promise`\<[`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md)\>

装载材质资源。

#### Parameters

• **uri**: `string`

材质资源URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md)\>

异步返回材质资源实例。

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"buffer"` \| `"id"` \| `"next"` \| `"group"` \| `"buffer_bufferID"` \| `"buffer_size"` \| `"buffer_addr"` \| `"buffer_next"` \| `"bn_buffer"` \| `"bn_bufferID"` \| `"bn_offset"` \| `"bn_size"` \| `"bufferID"` \| `"bufferBlockOffset"` \| `"bufferBlockSize"` \| `"binding"` \| `"updated"` \| `"m_reserved76"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"g0_colorRT"` \| `"g0_depthRT"` \| `"g0_gbufferRT"` \| `"g0_spriteAtlas"` \| `"g0_froxelList"` \| `"g0_lightVoxel"` \| `"g0_lightList"` \| `"shaderID"` \| `"shaderUUID"` \| `"enableFlags"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
