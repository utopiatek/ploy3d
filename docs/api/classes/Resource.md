[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Resource

# Class: Resource\<T\>

资源实例基类。

## Extended by

- [`ShaderRes`](ShaderRes.md)
- [`Texture`](Texture.md)
- [`Uniform`](Uniform.md)
- [`Mesh`](Mesh.md)
- [`Camera`](Camera.md)
- [`Light`](Light.md)
- [`Volume`](Volume.md)
- [`Animator`](Animator.md)
- [`Dioramas_3mx`](Dioramas_3mx.md)
- [`Object3D`](Object3D.md)
- [`Scene`](Scene.md)

## Type Parameters

• **T**

## Constructors

### new Resource()

> **new Resource**\<`T`\>(`_global`, `ptr`, `id`): [`Resource`](Resource.md)\<`T`\>

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

• **ptr**: `never`

实例内部指针。

• **id**: `number`

实例ID。

#### Returns

[`Resource`](Resource.md)\<`T`\>

## Accessors

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`
