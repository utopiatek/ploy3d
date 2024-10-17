[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Kernel

# Class: Kernel

内核接口实例。

## Constructors

### new Kernel()

> **new Kernel**(`_global`): [`Kernel`](Kernel.md)

构造函数。

#### Parameters

• **\_global**: `Ploy3D`

#### Returns

[`Kernel`](Kernel.md)

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`object`\>

清除对象。

#### Returns

`Promise`\<`object`\>

##### Engine\_cameraCount

> **Engine\_cameraCount**: `number`

##### Engine\_frameUniformsCount

> **Engine\_frameUniformsCount**: `number`

##### Engine\_lightCount

> **Engine\_lightCount**: `number`

##### Engine\_materialCount

> **Engine\_materialCount**: `number`

##### Engine\_meshCount

> **Engine\_meshCount**: `number`

##### Engine\_meshRendererCount

> **Engine\_meshRendererCount**: `number`

##### Engine\_objectCount

> **Engine\_objectCount**: `number`

##### Engine\_sceneCount

> **Engine\_sceneCount**: `number`

##### Engine\_spriteCount

> **Engine\_spriteCount**: `number`

##### Engine\_uniformBufferCount

> **Engine\_uniformBufferCount**: `number`

##### Engine\_uniformCount

> **Engine\_uniformCount**: `number`

##### Engine\_volumeCount

> **Engine\_volumeCount**: `number`

##### Memory\_blockCount

> **Memory\_blockCount**: `number`

##### Memory\_blockSize

> **Memory\_blockSize**: `number`

##### Memory\_freeCount

> **Memory\_freeCount**: `number`

##### Memory\_freeSize

> **Memory\_freeSize**: `number`

##### Memory\_growSize

> **Memory\_growSize**: `number`

##### Memory\_useCount

> **Memory\_useCount**: `number`

##### Memory\_useSize

> **Memory\_useSize**: `number`

##### System\_frameTS

> **System\_frameTS**: `number`

##### System\_moduleCount

> **System\_moduleCount**: `number`

***

### Init()

> **Init**(`_imports`): `Promise`\<[`Kernel`](Kernel.md)\>

初始化引擎内核。

#### Parameters

• **\_imports**

#### Returns

`Promise`\<[`Kernel`](Kernel.md)\>

***

### Status()

> **Status**(): `object`

状态统计。

#### Returns

`object`

##### Engine\_cameraCount

> **Engine\_cameraCount**: `number`

##### Engine\_frameUniformsCount

> **Engine\_frameUniformsCount**: `number`

##### Engine\_lightCount

> **Engine\_lightCount**: `number`

##### Engine\_materialCount

> **Engine\_materialCount**: `number`

##### Engine\_meshCount

> **Engine\_meshCount**: `number`

##### Engine\_meshRendererCount

> **Engine\_meshRendererCount**: `number`

##### Engine\_objectCount

> **Engine\_objectCount**: `number`

##### Engine\_sceneCount

> **Engine\_sceneCount**: `number`

##### Engine\_spriteCount

> **Engine\_spriteCount**: `number`

##### Engine\_uniformBufferCount

> **Engine\_uniformBufferCount**: `number`

##### Engine\_uniformCount

> **Engine\_uniformCount**: `number`

##### Engine\_volumeCount

> **Engine\_volumeCount**: `number`

##### Memory\_blockCount

> **Memory\_blockCount**: `number`

##### Memory\_blockSize

> **Memory\_blockSize**: `number`

##### Memory\_freeCount

> **Memory\_freeCount**: `number`

##### Memory\_freeSize

> **Memory\_freeSize**: `number`

##### Memory\_growSize

> **Memory\_growSize**: `number`

##### Memory\_useCount

> **Memory\_useCount**: `number`

##### Memory\_useSize

> **Memory\_useSize**: `number`

##### System\_frameTS

> **System\_frameTS**: `number`

##### System\_moduleCount

> **System\_moduleCount**: `number`
