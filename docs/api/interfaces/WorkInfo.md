[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / WorkInfo

# Interface: WorkInfo

事务信息。

## Properties

### args

> **args**: `any`

事务参数。

***

### id?

> `optional` **id**: `number`

事务ID。

***

### reject()?

> `optional` **reject**: (`err`?) => `void`

事务异常回调。

#### Parameters

• **err?**: `any`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`out`) => `void`

事务解决回调。

#### Parameters

• **out**: `any`

#### Returns

`void`

***

### slot?

> `optional` **slot**: `number`

事务槽。

***

### state

> **state**: `number`

事务状态：0-未发送，1-已发送，2-已返回，-1-已返回异常。

***

### transfer?

> `optional` **transfer**: `any`

事务附加参数。

***

### type

> **type**: [`WorkType`](../enumerations/WorkType.md)

事务类型。
