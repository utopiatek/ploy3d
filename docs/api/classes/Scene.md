[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Scene

# Class: Scene

场景实例。

## Extends

- [`Resource`](Resource.md)\<[`Scene`](Scene.md)\>

## Constructors

### new Scene()

> **new Scene**(`impl`, `ptr`, `id`): [`Scene`](Scene.md)

构造函数。

#### Parameters

• **impl**: [`Scene_kernel`](Scene_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Scene`](Scene.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

#### Inherited from

[`Resource`](Resource.md).[`id`](Resource.md#id)

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`

#### Inherited from

[`Resource`](Resource.md).[`internalPtr`](Resource.md#internalptr)

## Methods

### Destroy()

> **Destroy**(): `void`

销毁场景。

#### Returns

`void`
