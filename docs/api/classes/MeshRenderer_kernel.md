[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / MeshRenderer\_kernel

# Class: MeshRenderer\_kernel

网格渲染器组件内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`MeshRenderer`](MeshRenderer.md), *typeof* [`MeshRendere_member_index`](../variables/MeshRendere_member_index.md)\>

## Constructors

### new MeshRenderer\_kernel()

> **new MeshRenderer\_kernel**(`_global`): [`MeshRenderer_kernel`](MeshRenderer_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`MeshRenderer_kernel`](MeshRenderer_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<MeshRenderer, typeof MeshRendere_member_index>.constructor`

## Properties

### defaultG1

> **defaultG1**: [`MeshRenderer`](MeshRenderer.md)

内置默认网格渲染器组件实例。

***

### instanceVBL

> **instanceVBL**: `GPUVertexBufferLayout`

实例绘制数据顶点缓存布局。

## Methods

### Create()

> **Create**(`mesh`, `materials`?): `Promise`\<[`MeshRenderer`](MeshRenderer.md)\>

创建网格渲染器组件实例。

#### Parameters

• **mesh**: [`Mesh`](Mesh.md)

网格资源内核实例指针。

• **materials?**: `object`[]

#### Returns

`Promise`\<[`MeshRenderer`](MeshRenderer.md)\>

返回网格渲染器组件实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"buffer"` \| `"id"` \| `"center"` \| `"next"` \| `"group"` \| `"flush"` \| `"buffer_bufferID"` \| `"buffer_size"` \| `"buffer_addr"` \| `"buffer_next"` \| `"bn_buffer"` \| `"bn_bufferID"` \| `"bn_offset"` \| `"bn_size"` \| `"bufferID"` \| `"bufferBlockOffset"` \| `"bufferBlockSize"` \| `"binding"` \| `"updated"` \| `"m_reserved76"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"extents"` \| `"skeleton_skin_enabled"` \| `"skeleton_skin_writeTS"` \| `"skeleton_skin_memorySize"` \| `"skeleton_skin_memory"` \| `"skeleton_skin_joints"` \| `"skeleton_skin_ctrls"` \| `"skeleton_skin_jointsTS"` \| `"skeleton_skin_pose"` \| `"skeletonPTR"` \| `"skeletonUUID"` \| `"meshPTR"` \| `"meshUUID"` \| `"enabled"` \| `"frontFace"` \| `"cullMode"` \| `"boneBuffer"` \| `"boneArrayStart"` \| `"g1_morphTargets"` \| `"vertexArray"` \| `"drawTS"` \| `"materialCount"` \| `"drawInstanceList"` \| `"materials"` \| `"renderFlags"` \| `"drawInstanceCount"` \| `"morphSampler"` \| `"morphTargetsWeight"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`MeshRenderer`](MeshRenderer.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`MeshRenderer`](MeshRenderer.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`MeshRenderer`](MeshRenderer.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`MeshRenderer`](MeshRenderer.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### Load()

> **Load**(`uri`, `pkg`?): `Promise`\<[`MeshRenderer`](MeshRenderer.md)\>

装载网格渲染器组件资源。

#### Parameters

• **uri**: `string`

网格渲染器组件资源URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`MeshRenderer`](MeshRenderer.md)\>

异步返回网格渲染器组件资源实例。

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"buffer"` \| `"id"` \| `"center"` \| `"next"` \| `"group"` \| `"flush"` \| `"buffer_bufferID"` \| `"buffer_size"` \| `"buffer_addr"` \| `"buffer_next"` \| `"bn_buffer"` \| `"bn_bufferID"` \| `"bn_offset"` \| `"bn_size"` \| `"bufferID"` \| `"bufferBlockOffset"` \| `"bufferBlockSize"` \| `"binding"` \| `"updated"` \| `"m_reserved76"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"extents"` \| `"skeleton_skin_enabled"` \| `"skeleton_skin_writeTS"` \| `"skeleton_skin_memorySize"` \| `"skeleton_skin_memory"` \| `"skeleton_skin_joints"` \| `"skeleton_skin_ctrls"` \| `"skeleton_skin_jointsTS"` \| `"skeleton_skin_pose"` \| `"skeletonPTR"` \| `"skeletonUUID"` \| `"meshPTR"` \| `"meshUUID"` \| `"enabled"` \| `"frontFace"` \| `"cullMode"` \| `"boneBuffer"` \| `"boneArrayStart"` \| `"g1_morphTargets"` \| `"vertexArray"` \| `"drawTS"` \| `"materialCount"` \| `"drawInstanceList"` \| `"materials"` \| `"renderFlags"` \| `"drawInstanceCount"` \| `"morphSampler"` \| `"morphTargetsWeight"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
