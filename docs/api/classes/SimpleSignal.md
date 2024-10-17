[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / SimpleSignal

# Class: SimpleSignal\<T, G\>

信号对象。

## Type Parameters

• **T**

• **G**

## Constructors

### new SimpleSignal()

> **new SimpleSignal**\<`T`, `G`\>(`generator`?, `cfg`?): [`SimpleSignal`](SimpleSignal.md)\<`T`, `G`\>

构造函数。

#### Parameters

• **generator?**

事件最新参数生成器。

• **cfg?**: `G`

#### Returns

[`SimpleSignal`](SimpleSignal.md)\<`T`, `G`\>

## Accessors

### data

> `get` **data**(): `T`

事件最新参数。

#### Returns

`T`

***

### generatorParam

> `get` **generatorParam**(): `G`

事件最新参数生成器生成参数。

> `set` **generatorParam**(`param`): `void`

#### Parameters

• **param**: `G`

#### Returns

`G`

## Methods

### AddListener()

> **AddListener**(`listener`): `void`

添加事件监听器。

#### Parameters

• **listener**

事件监听器。

#### Returns

`void`

***

### Destroy()

> **Destroy**(): `void`

销毁事件管理器。

#### Returns

`void`

***

### Dispatch()

> **Dispatch**(`data`?): `Promise`\<`void`\>

设置事件最新参数并触发事件。

#### Parameters

• **data?**: `T`

事件最新参数，未定义则内部通过参数生成器生成。

#### Returns

`Promise`\<`void`\>
