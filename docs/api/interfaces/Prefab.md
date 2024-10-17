[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Prefab

# Interface: Prefab

预制件实例。

## Properties

### instanceBeg

> **instanceBeg**: `number`

3D对象数组起始索引。

***

### instanceCount

> **instanceCount**: `number`

直属于当前预制件的3D对象数量。

***

### instanceList

> **instanceList**: [`Object3D`](../classes/Object3D.md)[]

3D对象数组。

***

### master?

> `optional` **master**: [`Prefab`](Prefab.md)

根源预制件实例（预制件可嵌套）。

***

### root

> **root**: [`Object3D`](../classes/Object3D.md)

当前预制件根对象（不是从预制件节点实例化出的，而是引擎自动创建用于容纳预制件的，预制件实例化3D对象数量包含了该实例）。

***

### uuid

> **uuid**: `string`

预制件UUID。
