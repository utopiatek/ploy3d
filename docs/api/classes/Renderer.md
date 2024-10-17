[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Renderer

# Class: Renderer

渲染器接口。

## Constructors

### new Renderer()

> **new Renderer**(`_global`): [`Renderer`](Renderer.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`Renderer`](Renderer.md)

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### GetQueue()

> **GetQueue**(`callback`): `void`

获取渲染队列。

#### Parameters

• **callback**

等待后回调返回渲染队列。

#### Returns

`void`

***

### Init()

> **Init**(): `Promise`\<[`Renderer`](Renderer.md)\>

初始化渲染器接口。

#### Returns

`Promise`\<[`Renderer`](Renderer.md)\>

返回渲染器接口。
