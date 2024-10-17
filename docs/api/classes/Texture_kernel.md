[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Texture\_kernel

# Class: Texture\_kernel

贴图资源实例管理器（没有内核实现）。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Texture`](Texture.md), `any`\>

## Constructors

### new Texture\_kernel()

> **new Texture\_kernel**(`_global`): [`Texture_kernel`](Texture_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Texture_kernel`](Texture_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Texture, any>.constructor`

## Properties

### \_CreateTile()

> **\_CreateTile**: (`width`, `height`, `format`) => `never`

创建图块实例（分配图集中的存储区块）。

#### Parameters

• **width**: `number`

贴图像素宽度。

• **height**: `number`

贴图像素高度。

• **format**: `number`

贴图像素格式（当前固定为0）。

#### Returns

`never`

返回图块描述符指针，注意GPU资源并未分配，需要使用贴图数据进行初始化。

***

### \_ReleaseTile()

> **\_ReleaseTile**: (`tile`) => `number`

释放图块实例。

#### Parameters

• **tile**: `never`

图块实例指针。

#### Returns

`number`

返回当前图块实例引用计数。

***

### default2D

> **default2D**: [`Texture`](Texture.md)

内置默认2D贴图资源实例。

***

### defaultAtlas

> **defaultAtlas**: `number`

默认贴图图集内部实例ID（"rgba8unorm"格式）。

## Methods

### \_WriteTile()

> **\_WriteTile**(`tile`, `bitmap`, `xoffset`?, `yoffset`?): `void`

写图块数据。

#### Parameters

• **tile**: `never`

图集图块实例指针。

• **bitmap**: [`GLTextureSource`](../interfaces/GLTextureSource.md)

位图数据。

• **xoffset?**: `number`

写入横向像素偏移。

• **yoffset?**: `number`

写入纵向像素偏移。

#### Returns

`void`

***

### AddRef()

> **AddRef**(`id`): `void`

增加实例引用计数。

#### Parameters

• **id**: `number`

实例ID。

#### Returns

`void`

***

### CreateTexture()

> **CreateTexture**(`asset`): `Promise`\<[`Texture`](Texture.md)\>

创建贴图资源实例。

#### Parameters

• **asset**: [`Asset_texture`](../interfaces/Asset_texture.md)

贴图资源描述符。

#### Returns

`Promise`\<[`Texture`](Texture.md)\>

异步返回贴图资源实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `string` \| `number` \| `symbol`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Texture`](Texture.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Texture`](Texture.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Texture`](Texture.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Texture`](Texture.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### Load()

> **Load**(`uri`, `pkg`?): `Promise`\<[`Texture`](Texture.md)\>

装载贴图资源。

#### Parameters

• **uri**: `string`

贴图资源URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`Texture`](Texture.md)\>

异步返回贴图资源实例。

***

### Release()

> **Release**(`id`): `void`

释放实例引用。

#### Parameters

• **id**: `number`

实例ID。

#### Returns

`void`

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `string` \| `number` \| `symbol`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
