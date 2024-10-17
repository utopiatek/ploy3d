[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Resources

# Class: Resources

资源管理器。

## Constructors

### new Resources()

> **new Resources**(`_global`): [`Resources`](Resources.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`Resources`](Resources.md)

## Properties

### Animator

> **Animator**: [`Animator_kernel`](Animator_kernel.md)

动画组件内核实现。

***

### Camera

> **Camera**: [`Camera_kernel`](Camera_kernel.md)

相机组件内核实现。

***

### Dioramas

> **Dioramas**: [`Dioramas_kernel`](Dioramas_kernel.md)

倾斜摄影组件内核实现。

***

### Light

> **Light**: [`Light_kernel`](Light_kernel.md)

光源组件内核实现。

***

### Material

> **Material**: [`Material_kernel`](Material_kernel.md)

材质资源内核实现。

***

### Mesh

> **Mesh**: [`Mesh_kernel`](Mesh_kernel.md)

网格资源内核实现。

***

### MeshRenderer

> **MeshRenderer**: [`MeshRenderer_kernel`](MeshRenderer_kernel.md)

网格渲染器组件内核实现。

***

### Object

> **Object**: [`Object_kernel`](Object_kernel.md)

3D对象内核实现。

***

### Scene

> **Scene**: [`Scene_kernel`](Scene_kernel.md)

场景内核实现。

***

### Shader

> **Shader**: [`Shader_kernel`](Shader_kernel.md)

着色器资源实例管理器（没有内核实现）。

***

### Texture

> **Texture**: [`Texture_kernel`](Texture_kernel.md)

贴图资源实例管理器（没有内核实现）。

***

### VMath

> **VMath**: [`VMath_kernel`](VMath_kernel.md)

矢量数学方法内核实现。

***

### Volume

> **Volume**: [`Volume_kernel`](Volume_kernel.md)

体积组件内核实现。

## Accessors

### packageList

> `get` **packageList**(): [`PackageReg`](../interfaces/PackageReg.md)[]

资源包注册表（该清单可缓存）。

#### Returns

[`PackageReg`](../interfaces/PackageReg.md)[]

## Methods

### Browse()

> **Browse**(`pkg`): `Promise`\<`object`\>

浏览资源包中的可用资源。

#### Parameters

• **pkg**: [`PackageReg`](../interfaces/PackageReg.md)

资源包注册信息。

#### Returns

`Promise`\<`object`\>

资源信息列表。

##### list

> **list**: `object`[]

资源清单。

##### thumbnail?

> `optional` **thumbnail**: `string`

缩略图文件路径。

##### thumbnail\_blob?

> `optional` **thumbnail\_blob**: `Blob`

缩略图数据对象。

##### thumbnail\_per\_row?

> `optional` **thumbnail\_per\_row**: `number`

缩略图文件中每行包含缩略图数量。

##### thumbnail\_row\_count?

> `optional` **thumbnail\_row\_count**: `number`

缩略图行数。

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### Download()

> **Download**(`keys`): `Promise`\<`void`\>

下载资源包并注册到缓存。

#### Parameters

• **keys**: `object` \| `object`

资源访问键。

#### Returns

`Promise`\<`void`\>

***

### Find()

> **Find**(`keys`): `Promise`\<[`PackageReg`](../interfaces/PackageReg.md)\>

查找资源包注册信息。

#### Parameters

• **keys**: `object` \| `object`

资源访问键。

#### Returns

`Promise`\<[`PackageReg`](../interfaces/PackageReg.md)\>

返回资源包注册信息。

***

### GC()

> **GC**(): `void`

进行动态资源回收。

#### Returns

`void`

***

### GetPackageByKey()

> **GetPackageByKey**(`key`): [`PackageReg`](../interfaces/PackageReg.md)

根据资源包名称获取资源包注册信息。

#### Parameters

• **key**: `string`

资源包名称。

#### Returns

[`PackageReg`](../interfaces/PackageReg.md)

返回资源包注册信息。

***

### GetPackageByUUID()

> **GetPackageByUUID**(`uuid`): [`PackageReg`](../interfaces/PackageReg.md)

根据资源包UUID获取资源包注册信息。

#### Parameters

• **uuid**: `string`

资源包UUID。

#### Returns

[`PackageReg`](../interfaces/PackageReg.md)

返回资源包注册信息。

***

### Init()

> **Init**(): `Promise`\<[`Resources`](Resources.md)\>

初始化资源管理器。

#### Returns

`Promise`\<[`Resources`](Resources.md)\>

返回资源管理器。

***

### Load\_file()

> **Load\_file**\<`T`\>(`type`, `uri`, `not_cache`?, `cur_pkg`?): `Promise`\<`object`\>

加载指定URI的文件数据。

#### Type Parameters

• **T**

#### Parameters

• **type**: `"text"` \| `"json"` \| `"arrayBuffer"`

资源文件类型。

• **uri**: `string`

资源文件URI。

• **not\_cache?**: `boolean`

是否缓存文件数据。

• **cur\_pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前包注册信息。

#### Returns

`Promise`\<`object`\>

返回文件数据。

##### data

> **data**: `T`

##### path

> **path**: `string`

##### pkg

> **pkg**: [`PackageReg`](../interfaces/PackageReg.md)

***

### ParseUri()

> **ParseUri**(`uri`, `cur_pkg`?): `object` \| `object`

解析资源UIR。
资源URI有以下4种模式：
"1-1-1.Miaokit.Builtin:/aa/bb/cc.json"
":/aa/bb/cc.json"
"1-1-1-17-1"
"17-1"

#### Parameters

• **uri**: `string`

资源URI。

• **cur\_pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前资源包。

#### Returns

`object` \| `object`

返回资源访问键。

***

### Preview()

> **Preview**(`pkg`): `Promise`\<`void`\>

预览资源包（完成资源包预览后，可以通过RESID访问资源包内的内容）。

#### Parameters

• **pkg**: [`PackageReg`](../interfaces/PackageReg.md)

#### Returns

`Promise`\<`void`\>

***

### Refresh()

> **Refresh**(): `Promise`\<`void`\>

刷新本地资源包目录（在允许访问本地文件系统的前提下进行）。

#### Returns

`Promise`\<`void`\>

***

### Register()

> **Register**(`entry`, `files`?): `void`

注册资源包。

#### Parameters

• **entry**: [`PackageReg`](../interfaces/PackageReg.md)

资源包注册信息。

• **files?**: `Record`\<`string`, `any`\>

#### Returns

`void`

***

### Remove()

> **Remove**(`classid`, `id`): `void`

移除资源类型（何时移除交由内核实现决定）。

#### Parameters

• **classid**: [`CLASSID`](../enumerations/CLASSID.md)

资源类型ID。

• **id**: `number`

资源实例ID。

#### Returns

`void`

***

### Scan()

> **Scan**(): `Promise`\<[`PackageReg`](../interfaces/PackageReg.md)[]\>

扫描本地资源包目录（在允许访问本地文件系统的前提下进行）。

#### Returns

`Promise`\<[`PackageReg`](../interfaces/PackageReg.md)[]\>

返回资源包可注册信息列表。

***

### ToUUID()

> **ToUUID**(`uri`, `cur_pkg`?): `string`

资源URI转资源UUID。

#### Parameters

• **uri**: `string`

资源URI。

• **cur\_pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

当前包注册信息。

#### Returns

`string`

返回资源UUID。
