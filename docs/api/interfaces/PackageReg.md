[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / PackageReg

# Interface: PackageReg

资源包注册项。

## Properties

### folder?

> `optional` **folder**: `string`

包归档目录（限3级）

***

### index?

> `optional` **index**: `number`

资源包注册号。

***

### invalid

> **invalid**: `boolean`

资源包无效（本地和云端仓库都无法访问到时标记为无效）。

***

### key

> **key**: `string`

资源包键名（如："1-1-1.miaokit.builtins"）。

***

### license?

> `optional` **license**: `string`

知识共享许可协议。

***

### location?

> `optional` **location**: `"memory"` \| `"store"` \| `"local"`

资源包存储位置（默认"memory"）。

***

### menu?

> `optional` **menu**: `object`

资源选单（用于在UI中显示可用资源列表）。

#### list

> **list**: `object`[]

资源清单。

#### thumbnail?

> `optional` **thumbnail**: `string`

缩略图文件路径。

#### thumbnail\_blob?

> `optional` **thumbnail\_blob**: `Blob`

缩略图数据对象。

#### thumbnail\_per\_row?

> `optional` **thumbnail\_per\_row**: `number`

缩略图文件中每行包含缩略图数量。

#### thumbnail\_row\_count?

> `optional` **thumbnail\_row\_count**: `number`

缩略图行数。

***

### meta?

> `optional` **meta**: [`Package`](Package.md)

资源包元数据缓存（空表示当前资源包仅已注册但未缓存）。

***

### path

> **path**: `string`

资源包存放路径（访问失败时尝试切换路径，最终失败时标记资源包无效。查找不到的资源包也会注册并标记为无效，以此屏蔽多次重复无效访问）。

***

### price?

> `optional` **price**: `number`

包售价。

***

### private?

> `optional` **private**: `boolean`

包是否私有。

***

### resid\_path?

> `optional` **resid\_path**: `Record`\<`string`, `any`\>

资源ID到资源文件路径映射表（通过Package.library构建）。

***

### tags?

> `optional` **tags**: `string`

包标签。

***

### uuid

> **uuid**: `string`

资源包UUID（如："1-1-1"）。

***

### zip

> **zip**: `boolean`

资源包是否压缩存储。
