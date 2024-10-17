[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / MeshRenderer

# Class: MeshRenderer

网格渲染器组件（G1）。

## Extends

- [`Uniform`](Uniform.md)\<[`MeshRenderer_kernel`](MeshRenderer_kernel.md)\>

## Constructors

### new MeshRenderer()

> **new MeshRenderer**(`impl`, `ptr`, `id`): [`MeshRenderer`](MeshRenderer.md)

构造函数。

#### Parameters

• **impl**: [`MeshRenderer_kernel`](MeshRenderer_kernel.md)

• **ptr**: `never`

实例内部指针。

• **id**: `number`

实例ID。

#### Returns

[`MeshRenderer`](MeshRenderer.md)

#### Overrides

[`Uniform`](Uniform.md).[`constructor`](Uniform.md#constructors)

## Properties

### drawCustom()

> **drawCustom**: (`queue`, `method`, `params`) => `void`

自定义网格渲染器绘制方法（主要用于在网格上直接绘制UI）。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

• **method**: `string`

• **params**: `number`[]

#### Returns

`void`

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

### boneArrayStart

> `get` **boneArrayStart**(): `number`

骨骼蒙皮骨骼变换数据数组空间起始索引。。

#### Returns

`number`

***

### boneBuffer

> `get` **boneBuffer**(): `number`

骨骼蒙皮骨骼变换数据缓存ID。

#### Returns

`number`

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

### cullMode

> `get` **cullMode**(): `number`

多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1）。

> `set` **cullMode**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### drawTS

> `get` **drawTS**(): `number`

渲染时间戳（用于判断是否清空当前绘制实例列表）。

#### Returns

`number`

***

### enabled

> `get` **enabled**(): `boolean`

是否启用组件。

> `set` **enabled**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### flush

> `get` **flush**(): `boolean`

是否需要刷新渲染设置（刷新将重新编译着色器分支）。

> `set` **flush**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### frontFace

> `get` **frontFace**(): `number`

正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0）。

> `set` **frontFace**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### g1\_morphTargets

> `get` **g1\_morphTargets**(): `number`

需要在G1绑定对象中设置网格变形目标数据贴图ID。

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

### materialCount

> `get` **materialCount**(): `number`

材质数量。

#### Returns

`number`

***

### mesh

> `get` **mesh**(): [`Mesh`](Mesh.md)

网格资源实例。

#### Returns

[`Mesh`](Mesh.md)

***

### offset

> `get` **offset**(): `number`

数据块在缓存中的字节偏移（256对齐，G1前256字节为系统字段且不绑定到着色器）。

#### Returns

`number`

#### Overrides

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

数据块在缓存中的字节大小（256对齐，G1前256字节为系统字段且不绑定到着色器）。

#### Returns

`number`

#### Overrides

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

### vertexArray

> `get` **vertexArray**(): `number`

顶点数组对象缓存（WebGL中使用）。

> `set` **vertexArray**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### view

> `get` **view**(): `Record`\<`string`, `number`[]\>

属性访问视图。

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

### BindSkeleton()

> **BindSkeleton**(`joints`): `void`

绑定网格骨骼蒙皮骨架关节实例。

#### Parameters

• **joints**: `never`[]

关节实例指针数组。

#### Returns

`void`

***

### GetMaterial()

> **GetMaterial**(`slot`): [`Material`](Material.md)

获取指定材质插槽材质。

#### Parameters

• **slot**: `number`

材质插槽。

#### Returns

[`Material`](Material.md)

返回材质实例。

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

### SetMaterial()

> **SetMaterial**(`slot`, `submesh`, `material`): `void`

设置材质节点。

#### Parameters

• **slot**: `number`

材质插槽。

• **submesh**: `number`

材质应用到子网格索引。

• **material**: [`Material`](Material.md)

材质资源实例。

#### Returns

`void`

***

### UpdateG1()

> **UpdateG1**(`object3d`): `void`

基于指定3D对象更新G1相关数据。

#### Parameters

• **object3d**: [`Object3D`](Object3D.md)

3D对象内核实例指针。

#### Returns

`void`
