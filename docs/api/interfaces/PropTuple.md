[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / PropTuple

# Interface: PropTuple

材质属性元组。

## Properties

### lut?

> `optional` **lut**: `Record`\<`string`, [`PropVar`](PropVar.md)\>

元组中变量查找表。

***

### size

> **size**: `number`

元组占用空间大小。

***

### vars

> **vars**: [`PropVar`](PropVar.md)[]

元组中变量列表。

***

### view()

> **view**: (`master`) => `Record`\<`string`, `number`[]\>

元组访问视图构造器。

#### Parameters

• **master**

• **master.blockPtr**: `never`

属性缓存块地址。

• **master.enableFlags**: `number`

标准材质材质属性启用标志集。

• **master.updated**: `boolean`

属性块数据更新状态。

#### Returns

`Record`\<`string`, `number`[]\>
