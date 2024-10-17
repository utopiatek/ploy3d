[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset\_prefab

# Interface: Asset\_prefab

预制件资源描述符。
预制件是一组结构化、编排设计好的3D对象集合，用于快速重用该组3D对象。3D场景也是标准的预制件。
预制件记录了一组3D对象的实例化方法以及它们的结构关系与渲染设置等。
一个工程存储为一个资源包，一个场景存储为一个预制件，也可以在工程中编辑非场景型预制件（构建预制件和保存场景的操作方式类似）。
3D世界可以在运行时动态装载卸载任意数量的场景，基于可见性查询来确认场景的可见性。
预制件是一组设计确认好的3D对象，可以共享使用，因此预制件不应该被修改。
我们不应删除已共享预制件中的某个对象，我们可以把它隐藏（不激活）。

## Extends

- [`Asset`](Asset.md)

## Properties

### altitude?

> `optional` **altitude**: `number`

预制件参考海拔高度。

***

### animators?

> `optional` **animators**: `object`[]

动画组件数据。

***

### batches

> **batches**: `object`[]

实例化批次列表。

***

### classid

> **classid**: `number`

资源类型ID。

#### Inherited from

[`Asset`](Asset.md).[`classid`](Asset.md#classid)

***

### instanceCount

> **instanceCount**: `number`

预制件实例化3D对象数量。
实例化时需要自动创建一个根对象来包容预制件，因此该数量比所有批次实例化批次实例对象总和多1。
该自动创建的根对象放置在当前实例数组末尾，不影响实例索引排序。

***

### label

> **label**: `string`

用户可理解的外部标签。

#### Inherited from

[`Asset`](Asset.md).[`label`](Asset.md#label)

***

### lnglat?

> `optional` **lnglat**: [`number`, `number`]

预制件参考经纬度坐标（使用GCJ02坐标系）。

***

### mesh\_renderers

> **mesh\_renderers**: `object`[]

3D对象实例网格渲染器组件数据。

***

### name

> **name**: `string`

内部名称（同级唯一，优先使用名称在同级中查找）。

#### Inherited from

[`Asset`](Asset.md).[`name`](Asset.md#name)

***

### nodes

> **nodes**: `object`[]

节点数组。
节点用于实例化出3D对象，保存时会重新生成完整节点数组。
预制件节点仅被当前预制件内部引用，此约束确保了可安全删除预制件。
保存时遇到以下情况，会将3D对象（直属于当前预制件实例的非临时对象）作为一个实例化批次的节点源：
 1.父级为空；
 2.父级非直属于当前预制件实例；
 3.父级标识为运行时临时对象；
作为节点源的节点、其父级节点字段置空。
节点保存以先根顺序进行，遇到非直属于当前预制件实例的对象或临时对象则结束分支的深入遍历（记录中断对象后续遍历）。

***

### scheme?

> `optional` **scheme**: `"daz"`

预制件构建体系（不同体系预制件实例化方法存在一些区别）。

***

### transforms

> **transforms**: `object`[]

3D对象实例变换组件数据。
直属于当前预制件实例的非临时对象都会保存变换组件数据。
非直属于当前预制件实例的对象，如果变换组件标记有持久化修改，则保存变换组件数据。

***

### uuid

> **uuid**: `string`

全局唯一ID。

#### Inherited from

[`Asset`](Asset.md).[`uuid`](Asset.md#uuid)
