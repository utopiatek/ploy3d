[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Mesh\_kernel

# Class: Mesh\_kernel

网格资源内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Mesh`](Mesh.md), *typeof* [`Mesh_member_index`](../variables/Mesh_member_index.md)\>

## Constructors

### new Mesh\_kernel()

> **new Mesh\_kernel**(`_global`): [`Mesh_kernel`](Mesh_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Mesh_kernel`](Mesh_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Mesh, typeof Mesh_member_index>.constructor`

## Methods

### Create()

> **Create**(`asset`, `pkg`?): `Promise`\<[`Mesh`](Mesh.md)\>

运行时创建网格资源实例。

#### Parameters

• **asset**: [`Asset_mesh`](../interfaces/Asset_mesh.md)

网格资源描述符。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`Mesh`](Mesh.md)\>

返回网格资源实例。

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"id"` \| `"center"` \| `"unloaded"` \| `"next"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"reserved"` \| `"geometryPTR"` \| `"geometryUUID"` \| `"uvPTR"` \| `"uvUUID"` \| `"skinPTR"` \| `"skinUUID"` \| `"morphPTR"` \| `"morphUUID"` \| `"vertexBufferLayout"` \| `"vertexBufferCount"` \| `"indexBufferFormat"` \| `"submeshCount"` \| `"vertexCount"` \| `"indexCount"` \| `"extents"` \| `"skinMethod"` \| `"vertexBuffer"` \| `"indexBuffer"` \| `"meshData"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Mesh`](Mesh.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Mesh`](Mesh.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Mesh`](Mesh.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Mesh`](Mesh.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### Instance()

> **Instance**(`data_ptr`, `data_size`, `uuid`?): [`Mesh`](Mesh.md)

实例化网格资源。

#### Parameters

• **data\_ptr**: `never`

网格数据指针。

• **data\_size**: `number`

网格数据大小。

• **uuid?**: `string`

网格资源UUID。

#### Returns

[`Mesh`](Mesh.md)

返回网格资源实例。

***

### Load()

> **Load**(`uri`, `pkg`?): `Promise`\<[`Mesh`](Mesh.md)\>

装载网格资源。

#### Parameters

• **uri**: `string`

网格资源URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包注册信息。

#### Returns

`Promise`\<[`Mesh`](Mesh.md)\>

异步返回网格资源实例。

***

### MakeGeometry()

> **MakeGeometry**(`data`): [`number`, `never`]

从网格几何数据对象构建网格资源文件数据。

#### Parameters

• **data**

网格几何数据对象。

• **data.groups**: `object`[]

子网格描述。

• **data.normals**: `number`[]

法线数组。

• **data.uvs**: `number`[]

纹理坐标数组。

• **data.vertices**: `number`[]

顶点数组。

#### Returns

[`number`, `never`]

返回网格资源文件数据大小和数据指针。

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"id"` \| `"center"` \| `"unloaded"` \| `"next"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"reserved"` \| `"geometryPTR"` \| `"geometryUUID"` \| `"uvPTR"` \| `"uvUUID"` \| `"skinPTR"` \| `"skinUUID"` \| `"morphPTR"` \| `"morphUUID"` \| `"vertexBufferLayout"` \| `"vertexBufferCount"` \| `"indexBufferFormat"` \| `"submeshCount"` \| `"vertexCount"` \| `"indexCount"` \| `"extents"` \| `"skinMethod"` \| `"vertexBuffer"` \| `"indexBuffer"` \| `"meshData"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
