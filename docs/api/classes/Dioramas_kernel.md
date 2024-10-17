[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Dioramas\_kernel

# Class: Dioramas\_kernel

倾斜摄影组件内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Dioramas_3mx`](Dioramas_3mx.md), `any`\>

## Constructors

### new Dioramas\_kernel()

> **new Dioramas\_kernel**(`_global`): [`Dioramas_kernel`](Dioramas_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Dioramas_kernel`](Dioramas_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Dioramas_3mx, any>.constructor`

## Methods

### Create\_3mx()

> **Create\_3mx**(`scene`, `url`, `lnglat_alt`?): `Promise`\<[`Dioramas_3mx`](Dioramas_3mx.md)\>

创建倾斜摄影组件（3MX）。

#### Parameters

• **scene**: [`Scene`](Scene.md)

模型所属场景实例。

• **url**: `string`

场景根文件路径。

• **lnglat\_alt?**: `number`[]

模型经纬度和海拔高度（请传入GCJ02坐标系（高德地图、腾讯地图）经纬度）。

#### Returns

`Promise`\<[`Dioramas_3mx`](Dioramas_3mx.md)\>

异步返回倾斜摄影组件实例。

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除所有。

#### Returns

`Promise`\<`void`\>

***

### FreeBuffer()

> **FreeBuffer**(`node`): `void`

释放GPU缓存节点。

#### Parameters

• **node**

缓存节点。

• **node.buffer**: `number`

GPU缓存ID。

• **node.count**: `number`

实际元素数量。

• **node.offset**: `number`

数据在缓存中的字节偏移。

• **node.rows**: `number`

节点级别[1, 64]。

• **node.size**: `number`

数据字节大小。

• **node.type**: `number`

缓存类型（0：顶点缓存，1：索引缓存）。

#### Returns

`void`

***

### GenBuffer()

> **GenBuffer**(`type`, `count`): `object`

分配GPU缓存节点。

#### Parameters

• **type**: `number`

缓存类型（0：顶点缓存，1：索引缓存）。

• **count**: `number`

元素数量。

#### Returns

`object`

返回缓存节点。

##### buffer

> **buffer**: `number`

GPU缓存ID。

##### count

> **count**: `number`

实际元素数量。

##### offset

> **offset**: `number`

数据在缓存中的字节偏移。

##### rows

> **rows**: `number`

节点级别[1, 64]。

##### size

> **size**: `number`

数据字节大小。

##### type

> **type**: `number`

缓存类型（0：顶点缓存，1：索引缓存）。

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

> **GetInstanceByID**(`id`): [`Dioramas_3mx`](Dioramas_3mx.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Dioramas_3mx`](Dioramas_3mx.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Dioramas_3mx`](Dioramas_3mx.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Dioramas_3mx`](Dioramas_3mx.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

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
