[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Assembly

# Class: Assembly

渲染管线装配器。

## Constructors

### new Assembly()

> **new Assembly**(`_global`): [`Assembly`](Assembly.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`Assembly`](Assembly.md)

## Accessors

### config

> `get` **config**(): [`Assembly_config`](../interfaces/Assembly_config.md)

渲染管线装配器配置。

#### Returns

[`Assembly_config`](../interfaces/Assembly_config.md)

***

### default\_iblSpecular

> `get` **default\_iblSpecular**(): `GPUTextureView`

默认IBL高光反射贴图资源视图。

#### Returns

`GPUTextureView`

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### GetFramePass()

> **GetFramePass**(`key`): [`GLFramePass`](../interfaces/GLFramePass.md)

获取帧通道。

#### Parameters

• **key**: `string`

帧通道名称。

#### Returns

[`GLFramePass`](../interfaces/GLFramePass.md)

返回帧通道。

***

### GetFramePassList()

> **GetFramePassList**(`key`): `object`

获取渲染管线帧通道集。

#### Parameters

• **key**: `string`

配置键。

#### Returns

`object`

返回帧通道集。

##### framePass?

> `optional` **framePass**: [`GLFramePass`](../interfaces/GLFramePass.md)[]

渲染管线使用的帧通道列表。

##### framePassName

> **framePassName**: `string`[]

渲染管线使用的帧通道列表。

***

### GetFrameUniforms()

> **GetFrameUniforms**(`key`): [`FrameUniforms`](FrameUniforms.md)

获取帧绘制资源组G0实例。

#### Parameters

• **key**: `string`

实例键。

#### Returns

[`FrameUniforms`](FrameUniforms.md)

返回帧绘制资源组G0实例。

***

### GetObjectInScreen()

> **GetObjectInScreen**(`x`, `y`): `Promise`\<`object` \| `object`\>

获取屏幕上像素对应的对象。

#### Parameters

• **x**: `number`

平幕坐标[0, 1]。

• **y**: `number`

平幕坐标[0, 1]。

#### Returns

`Promise`\<`object` \| `object`\>

返回对象。

***

### Init()

> **Init**(): `Promise`\<[`Assembly`](Assembly.md)\>

初始化渲染管线装配器。

#### Returns

`Promise`\<[`Assembly`](Assembly.md)\>

返回渲染管线装配器。
