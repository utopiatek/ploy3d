[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Miaoworker

# Class: Miaoworker

事务处理器。

## Constructors

### new Miaoworker()

> **new Miaoworker**(`_global`?): [`Miaoworker`](Miaoworker.md)

构造函数。

#### Parameters

• **\_global?**: `any`

#### Returns

[`Miaoworker`](Miaoworker.md)

## Properties

### baseURI

> **baseURI**: `string`

根路径。

***

### dazServ

> **dazServ**: `string`

DAZ资源服务地址。

***

### env

> **env**: [`SharedENV`](SharedENV.md)

共享数据环境。

***

### gltfCache

> **gltfCache**: `Record`\<`string`, `object`\>

GLTF导入缓存（避免运行期内重复导入）。

***

### importer

> **importer**: `Importer`

资源导入器接口。

***

### internal

> **internal**: [`Internal`](../interfaces/Internal.md)

内核接口。

***

### kernel

> **kernel**: [`Kernel`](Kernel.md)

内核管理器。

***

### kernelCode

> **kernelCode**: `ArrayBuffer`

内核代码。

***

### startTS

> **startTS**: `number`

事务处理器启动时间戳。

***

### uid

> **uid**: `number`

用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。

***

### webgl

> **webgl**: `boolean`

是否使用的是WebGL图形API

## Methods

### Decode\_dem()

> **Decode\_dem**(`worker`, `url`): `Promise`\<`Uint8Array`\>

加载并解码DEM数据。

#### Parameters

• **worker**: `number`

派遣线程索引，0为主线程。

• **url**: `string`

数据URL。

#### Returns

`Promise`\<`Uint8Array`\>

异步对象。

***

### Earcut()

> **Earcut**(`vertices`, `holeIndices`?, `dim`?): `number`[]

多边形三角化。

#### Parameters

• **vertices**: `number`[]

顶点坐标数组。

• **holeIndices?**: `number`[]

孔洞顶点索引数组。

• **dim?**: `number`

图形维度（2/3）。

#### Returns

`number`[]

返回三角形索引数组。

***

### EncodeTexture()

> **EncodeTexture**(`data_`, `has_alpha`): `Promise`\<`object`\>

压缩贴图数据。

#### Parameters

• **data\_**: `ArrayBuffer`

原始贴图数据。

• **has\_alpha**: `boolean`

数据是否包含不透明度。

#### Returns

`Promise`\<`object`\>

返回压缩结果。

##### data

> **data**: `ArrayBuffer`

##### has\_alpha

> **has\_alpha**: `boolean`

***

### Fetch()

> **Fetch**\<`T`\>(`input`, `init`, `type`): `Promise`\<`T`\>

网络请求方法。

#### Type Parameters

• **T**

#### Parameters

• **input**: `string`

请求路径（请保证路径的正确性）。

• **init**: `RequestInit`

请求参数。

• **type**: `"formData"` \| `"text"` \| `"blob"` \| `"json"` \| `"arrayBuffer"`

请求数据类型。

#### Returns

`Promise`\<`T`\>

返回指定类型数据。

***

### Import\_daz()

> **Import\_daz**(`worker`, `url`, `progress`): `Promise`\<`object`\>

导入DAZ文件，返回资源包UUID。

#### Parameters

• **worker**: `number`

派遣线程索引，0为主线程。

• **url**: `string`

DAZ文件路径。

• **progress**

#### Returns

`Promise`\<`object`\>

异步对象

##### main

> **main**: `string`

##### pkgs

> **pkgs**: `object`[]

***

### Import\_gltf()

> **Import\_gltf**(`worker`, `url`, `progress`): `Promise`\<`object`\>

导入GLTF文件，返回资源包内容。

#### Parameters

• **worker**: `number`

派遣线程索引，0为主线程。

• **url**: `string`

GLTF文件路径。

• **progress**

#### Returns

`Promise`\<`object`\>

异步对象

##### files

> **files**: `Record`\<`string`, `any`\>

##### pkg

> **pkg**: [`PackageReg`](../interfaces/PackageReg.md)

***

### Import\_gltf\_file()

> **Import\_gltf\_file**(`worker`, `file`, `progress`): `Promise`\<[`PackageReg`](../interfaces/PackageReg.md)\>

导入GLTF文件，返回资源包内容。

#### Parameters

• **worker**: `number`

派遣线程索引，0为主线程。

• **file**: `File`

GLTF文件描述。

• **progress**

#### Returns

`Promise`\<[`PackageReg`](../interfaces/PackageReg.md)\>

异步对象。

***

### Import\_vtile\_bd()

> **Import\_vtile\_bd**(`worker`, `param`, `progress`): `Promise`\<`object`\>

装载百度地图矢量瓦片，返回网格数据。

#### Parameters

• **worker**: `number`

派遣线程索引，0为主线程。

• **param**

瓦片参数。

• **param.col**: `number`

• **param.level**: `number`

• **param.row**: `number`

• **progress**

#### Returns

`Promise`\<`object`\>

异步对象。

##### groups

> **groups**: `object`[]

##### normals

> **normals**: `number`[]

##### uvs

> **uvs**: `number`[]

##### vertices

> **vertices**: `number`[]

***

### Load\_3mxb\_resource()

> **Load\_3mxb\_resource**(`worker`, `group`, `progress`): `Promise`\<`object`\>

加载3MX场景分组资源实例。

#### Parameters

• **worker**: `number`

派遣线程索引，0为主线程。

• **group**

• **group.\_ab?**: `ArrayBuffer`

资源数据缓存。

• **group.\_ab\_offset**: `number`

资源数据缓存偏移。

• **group.\_file**: `string`

3MXB文件名。

• **group.\_path**: `string`

3MXB文件文件夹路径。

• **group.resources**: `object`[]

资源列表。

• **progress**

#### Returns

`Promise`\<`object`\>

异步对象

##### \_ab?

> `optional` **\_ab**: `ArrayBuffer`

##### \_ab\_offset

> **\_ab\_offset**: `number`

##### \_file

> **\_file**: `string`

##### \_path

> **\_path**: `string`

##### resources

> **resources**: `object`[]

***

### Pako\_inflate()

> **Pako\_inflate**(`buffer`): `Uint8Array`

GZIP数据解压。

#### Parameters

• **buffer**: `ArrayBuffer`

压缩数据。

#### Returns

`Uint8Array`

返回解压后数据。

***

### Shutdown()

> **Shutdown**(): `Promise`\<`object`\>

事务处理器关闭方法。

#### Returns

`Promise`\<`object`\>

异步对象

##### child

> **child**: `any`

##### recvTick

> **recvTick**: `number`

##### sendTick

> **sendTick**: `number`

##### slot

> **slot**: `number`

##### slots

> **slots**: `number`

***

### Startup()

> **Startup**(`args`?): `Promise`\<[`Miaoworker`](Miaoworker.md)\>

事务处理器启动方法。

#### Parameters

• **args?**

• **args.baseURI?**: `string`

根路径。

• **args.dazServ?**: `string`

DAZ资源服务地址。

• **args.kernelCode?**: `ArrayBuffer`

内核代码。

• **args.uid?**: `number`

用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。

• **args.webgl?**: `boolean`

是否使用的是WebGL图形API

#### Returns

`Promise`\<[`Miaoworker`](Miaoworker.md)\>

异步对象

***

### Track()

> **Track**(`msg`, `ctrl`?): `void`

事务处理器日志打印方法。

#### Parameters

• **msg**: `string`

日志信息。

• **ctrl?**: `number`

打印模式（0:log，1:info，2:warn，>2:error）。

#### Returns

`void`
