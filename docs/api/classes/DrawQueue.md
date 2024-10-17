[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / DrawQueue

# Class: DrawQueue

渲染队列。

## Constructors

### new DrawQueue()

> **new DrawQueue**(`_global`): [`DrawQueue`](DrawQueue.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`DrawQueue`](DrawQueue.md)

## Properties

### activeG0

> **activeG0**: [`FrameUniforms`](FrameUniforms.md)

当前活动GO常量缓存。

***

### activeG1

> **activeG1**: [`MeshRenderer`](MeshRenderer.md)

当前活动G1常量缓存。

***

### activeG2

> **activeG2**: [`Material`](Material.md)

当前活动G2常量缓存。

***

### activeG3

> **activeG3**: `any`

当前活动G3常量缓存。

***

### activeMesh

> **activeMesh**: [`Mesh`](Mesh.md)

当前活动网格顶点缓存。

***

### activePipeline

> **activePipeline**: `GPURenderPipeline`

当前活动着色管线。

***

### camera

> **camera**: [`Camera`](Camera.md)

当前相机组件实例。

***

### cmdEncoder

> **cmdEncoder**: `GPUCommandEncoder`

当前GPU指令编码器。

***

### computeEncoder

> **computeEncoder**: `GPUComputePassEncoder`

当前计算指令编码器。

***

### Draw()?

> `optional` **Draw**: (`queue`) => `void`

当前场景绘制方法。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

#### Returns

`void`

***

### drawList

> **drawList**: `object`

当前绘制列表。

#### drawCalls

> **drawCalls**: `object`[]

当前动态绘制命令列表。

#### drawParts

> **drawParts**: `number`[][]

材质绘制参数集列表。

#### drawParts2?

> `optional` **drawParts2**: `object`

场景材质绘制参数集列表。

#### drawParts2.count

> **count**: `number`

#### drawParts2.indices?

> `optional` **indices**: `number`[]

#### drawParts2.params

> **params**: `ArrayLike`\<`number`\>

#### instanceCount

> **instanceCount**: `number`

实例绘制数据数量（每个104字节）。

#### instanceVB

> **instanceVB**: `number`

实例绘制数据缓存。

***

### execStat

> **execStat**: [`ExecuteStat`](../interfaces/ExecuteStat.md)

当前相机渲染执行统计。

***

### framePass

> **framePass**: [`GLFramePass`](../interfaces/GLFramePass.md)

当前活动帧通道。

***

### framePassList

> **framePassList**: `object`

当前帧通道配置列表。

#### framePass?

> `optional` **framePass**: [`GLFramePass`](../interfaces/GLFramePass.md)[]

渲染管线使用的帧通道列表。

#### framePassName

> **framePassName**: `string`[]

渲染管线使用的帧通道列表。

***

### passEncoder

> **passEncoder**: `GPURenderPassEncoder`

当前渲染指令编码器。

***

### target

> **target**: `object`

当前相机渲染目标贴图视图。

#### texture

> **texture**: `GPUTexture`

目标贴图。

#### view

> **view**: `GPUTextureView`

目标贴图视图。

#### viewport

> **viewport**: `number`[]

目标视口。

***

### volume

> **volume**: [`Volume`](Volume.md)

当前体积组件实例。

## Methods

### Begin()

> **Begin**(`callback`): `void`

获取渲染队列。

#### Parameters

• **callback**

等待后回调返回渲染队列。

#### Returns

`void`

***

### BindFrameUniforms()

> **BindFrameUniforms**(`frameUniforms`, `shadow_cast_index`?): `void`

绑定帧统一资源组实例（G0）。

#### Parameters

• **frameUniforms**: [`FrameUniforms`](FrameUniforms.md)

帧统一资源组实例（G0）。

• **shadow\_cast\_index?**: `number`

阴影投射通道索引（Cascaded Shadow Maps视锥分片索引（大于-1时设置阴影投影渲染相关矩阵））。

#### Returns

`void`

***

### BindMaterial()

> **BindMaterial**(`material`): `void`

绑定材质资源实例。

#### Parameters

• **material**: [`Material`](Material.md)

材质资源实例。

#### Returns

`void`

***

### BindMeshRenderer()

> **BindMeshRenderer**(`meshRenderer`): `void`

绑定网格渲染器组件。

#### Parameters

• **meshRenderer**: [`MeshRenderer`](MeshRenderer.md)

网格渲染器组件实例。

#### Returns

`void`

***

### BindRenderPipeline()

> **BindRenderPipeline**(`config`): `void`

基于当前资源绑定设置着色器管线（需要先调用BindFrameUniforms、BindMeshRenderer、BindMaterial，在后期帧通道绘制中有使用）。

#### Parameters

• **config**

• **config.cullMode**: `number`

多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1。网格渲染器设置）。

• **config.flags**: `number`

渲染设置标记集（材质与网格渲染器共同设置）。

• **config.frontFace**: `number`

正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0。网格渲染器设置）。

• **config.topology**: `number`

图元类型（子网格设置）。

#### Returns

`void`

***

### DrawList()

> **DrawList**(): `void`

绘制当前绘制列表。

#### Returns

`void`

***

### DrawMesh()

> **DrawMesh**(`params`): `void`

动态绘制网格。

#### Parameters

• **params**

动态绘制参数。

• **params.castShadows?**: `boolean`

是否投射阴影。

• **params.cullMode**: `number`

多边形裁剪模式（0-不裁剪、1-裁剪背面、2-裁剪正面、默认1）。

• **params.flags**: `number`

3D对象渲染标志集。

• **params.frontFace**: `number`

正面的定义顺序（0-CCW逆时针、1-CW顺时针、默认0）。

• **params.instances**: `number`[][]

实例数据列表（模型空间到世界空间转换矩阵）。

• **params.layers**: `number`

3D对象层标记。

• **params.materials**: `object`[]

绘制材质列表。

• **params.mesh**: [`Mesh`](Mesh.md)

网格资源实例（可为空）。

• **params.receiveShadows?**: `boolean`

是否接收阴影。

• **params.topology?**: [`GLPrimitiveTopology`](../enumerations/GLPrimitiveTopology.md)

图元类型（网格资源为空时需指定该参数）。

• **params.userData**: `number`

用户数据。

#### Returns

`void`

***

### DrawPart()

> **DrawPart**(`g1`, `g2`, `pipeline`, `mesh`, `submesh`, `instanceCount`?, `firstInstance`?, `materialSlot`?): `void`

子网格绘制方法。

#### Parameters

• **g1**: `number`

网格渲染器实例ID。

• **g2**: `number`

材质实例ID。

• **pipeline**: `number`

着色器管线实例ID。

• **mesh**: `number`

网格资源ID。

• **submesh**: `number`

子网格索引。

• **instanceCount?**: `number`

绘制实例数量。

• **firstInstance?**: `number`

起始绘制实例索引。

• **materialSlot?**: `number`

#### Returns

`void`

***

### End()

> **End**(`end`?): `void`

结束当前对渲染队列的使用。

#### Parameters

• **end?**: `boolean`

#### Returns

`void`

***

### Execute()

> **Execute**(`camera`, `volume`, `target`, `framePassList`, `draw`, `callback`): `void`

执行帧绘制。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例。

• **volume**: [`Volume`](Volume.md)

体积组件实例。

• **target**

帧绘制目标贴图视图。

• **target.texture**: `GPUTexture`

目标贴图。

• **target.view**: `GPUTextureView`

目标贴图视图。

• **target.viewport**: `number`[]

目标视口。

• **framePassList**

帧通道配置列表。

• **framePassList.framePass?**: [`GLFramePass`](../interfaces/GLFramePass.md)[]

渲染管线使用的帧通道列表。

• **framePassList.framePassName**: `string`[]

渲染管线使用的帧通道列表。

• **draw**

场景绘制方法。

• **callback**

绘制完成回调。

#### Returns

`void`

***

### SetPipeline()

> **SetPipeline**(`pipelineID`, `materialSlot`): `void`

绑定对应当前帧通道设置的GPU着色器管线实例。

#### Parameters

• **pipelineID**: `number`

着色器管线实例ID。

• **materialSlot**: `number`

材质槽索引。

#### Returns

`void`

***

### Snapshot()

> **Snapshot**(`scene`, `menu`, `surface`, `camera`, `volume`, `framePassList`, `end`): `void`

对资源包进行快照渲染。

#### Parameters

• **scene**: [`Scene`](Scene.md)

• **menu**

• **menu.list**: `object`[]

资源清单。

• **menu.thumbnail?**: `string`

缩略图文件路径。

• **menu.thumbnail\_blob?**: `Blob`

缩略图数据对象。

• **menu.thumbnail\_per\_row?**: `number`

缩略图文件中每行包含缩略图数量。

• **menu.thumbnail\_row\_count?**: `number`

缩略图行数。

• **surface**: `HTMLCanvasElement`

• **camera**: [`Camera`](Camera.md)

• **volume**: [`Volume`](Volume.md)

• **framePassList**

• **framePassList.framePass?**: [`GLFramePass`](../interfaces/GLFramePass.md)[]

渲染管线使用的帧通道列表。

• **framePassList.framePassName**: `string`[]

渲染管线使用的帧通道列表。

• **end**

#### Returns

`void`
