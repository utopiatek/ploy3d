[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Package

# Interface: Package

资源包元数据。

## Properties

### animations\_library?

> `optional` **animations\_library**: [`Asset_animations`](Asset_animations.md)[]

动画数据资源列表。

***

### author

> **author**: `string`

包作者名。

***

### desc

> **desc**: `string`

用户可理解的包描述。

***

### engine

> **engine**: `number`

资源包引擎版本（主次版本）。

***

### file\_library?

> `optional` **file\_library**: `string`[]

共享资源文件清单（其它包仅能引用注册在该清单中的资源，此举确保UUID能索引到文件）。

***

### guid

> **guid**: `string`

包GUID（全球唯一）。

***

### material\_library?

> `optional` **material\_library**: [`Asset_material`](Asset_material.md)[]

内嵌材质资源列表。

***

### mesh\_library?

> `optional` **mesh\_library**: [`Asset_mesh`](Asset_mesh.md)[]

内嵌网格资源列表。

***

### mesh\_renderer\_library?

> `optional` **mesh\_renderer\_library**: [`Asset_meshrenderer`](Asset_meshrenderer.md)[]

内嵌网格网格渲染器组件列表。

***

### name

> **name**: `string`

包名。

***

### pid

> **pid**: `number`

包ID（UUID第2段）。

***

### prefab\_library?

> `optional` **prefab\_library**: [`Asset_prefab`](Asset_prefab.md)[]

内嵌预制件资源列表。

***

### timestrap

> **timestrap**: `number`

包创建时间戳。

***

### uid

> **uid**: `number`

用户ID（UUID第1段）。

***

### uuid

> **uuid**: `string`

包UUID（平台唯一，uid-pid-ver）。

***

### version

> **version**: `number`

包版本号（UUID第3段）。
