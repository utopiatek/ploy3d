[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Assembly\_config

# Interface: Assembly\_config

渲染管线装配器配置。

## Properties

### framePass

> **framePass**: `object`

帧通道配置。

#### list

> **list**: [`GLFramePass`](GLFramePass.md)[]

帧通道配置列表。

#### lut?

> `optional` **lut**: `Record`\<`string`, [`GLFramePass`](GLFramePass.md)\>

帧通道配置查找表。

***

### frameUniforms

> **frameUniforms**: `object`

帧绘制资源组G0。

#### list

> **list**: `object`[]

帧绘制资源组G0定义列表。

#### lut?

> `optional` **lut**: `Record`\<`string`, `object`\>

帧绘制资源组G0查找表。

***

### ibl

> **ibl**: `object`

IBL默认资源配置。

#### dfg

> **dfg**: `object`

DFG数据配置。

#### dfg.uri

> **uri**: `string`

数据文件URI。

#### dfg.writeHeight

> **writeHeight**: `number`

数据写入目标贴图高度。

#### dfg.writeLayer

> **writeLayer**: `number`

数据写入目标贴图层索引。

#### dfg.writeLevel

> **writeLevel**: `number`

数据写入目标贴图LOD级别（128大小的贴图，4K情况下写入L5，否则写入L4）。

#### dfg.writeOffsetX

> **writeOffsetX**: `number`

数据写入目标贴图X偏移。

#### dfg.writeOffsetY

> **writeOffsetY**: `number`

数据写入目标贴图Y偏移。

#### dfg.writeRT

> **writeRT**: `string`

数据写入目标贴图。

#### dfg.writeWidth

> **writeWidth**: `number`

数据写入目标贴图宽度。

#### diffuse

> **diffuse**: `number`[]

漫反射球谐系数。

#### specular

> **specular**: `object`

高光反射贴图。

#### specular.texture?

> `optional` **texture**: [`Texture`](../classes/Texture.md)

高光反射贴图资源实例。

#### specular.uri

> **uri**: `string`

高光反射贴图URI。

***

### pipelines

> **pipelines**: `Record`\<`string`, `object`\>

渲染管线配置。

***

### renderTargets

> **renderTargets**: `object`

渲染目标。

#### height

> **height**: `number`

渲染目标高度。

#### list

> **list**: `object`[]

渲染目标定义列表。

#### lut?

> `optional` **lut**: `Record`\<`string`, `object`\>

渲染目标查找表。

#### scale

> **scale**: `number`

渲染目标动态渲染分辨率倍数。

#### width

> **width**: `number`

渲染目标宽度。
