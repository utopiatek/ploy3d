[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / GLFramePass

# Interface: GLFramePass

帧通道配置。

## Extends

- `GPURenderPassDescriptor`

## Properties

### colorAttachments

> **colorAttachments**: `GPUColorTargetState` & `GPURenderPassColorAttachment` & `object`[]

颜色渲染目标设置。
注意，通常帧通道仅配置渲染队列过滤范围，不描述颜色渲染目标混合模式。
颜色渲染目标混合模式通常由材质指定。
处于特殊用途考虑，也帧通道配置中指定颜色渲染目标混合模式，并优先采用该配置而不使用材质的配置。

#### Overrides

`GPURenderPassDescriptor.colorAttachments`

***

### depthCtrl?

> `optional` **depthCtrl**: `boolean`

是否由着色器控制深度写入值（深度贴图MIPMAP帧通道使用）。

***

### depthStencilAttachment?

> `optional` **depthStencilAttachment**: `GPUDepthStencilState` & `object`

深度和模板渲染目标设置。

#### Type declaration

##### depthClearValue?

> `optional` **depthClearValue**: `number`

深度渲染目标清空值。

##### depthCompare

> **depthCompare**: `GPUCompareFunction`

深度比较方法。

##### depthLoadOp

> **depthLoadOp**: `GPULoadOp`

深度渲染目标渲染装载到渲染通道时的操作。

##### depthReadOnly?

> `optional` **depthReadOnly**: `boolean`

深度渲染目标是否只读。

##### depthStoreOp

> **depthStoreOp**: `GPUStoreOp`

深度渲染目标写操作。

##### depthWriteEnabled

> **depthWriteEnabled**: `boolean`

是否允许写入深度值。

##### format

> **format**: `GPUTextureFormat`

深度和模板渲染贴图格式。

##### target

> **target**: `object`

渲染目标实例引用。

##### target.layer

> **layer**: `number`

渲染目标贴图层索引。

##### target.level

> **level**: `number`

渲染目标贴图级别。

##### target.name

> **name**: `string`

唯一标识。

##### view

> **view**: `GPUTextureView`

深度渲染目标贴图视图。

#### Overrides

`GPURenderPassDescriptor.depthStencilAttachment`

***

### Execute()?

> `optional` **Execute**: (`variant`, `queue`) => `void`

执行帧通道。

#### Parameters

• **variant**: `number`

• **queue**: [`DrawQueue`](../classes/DrawQueue.md)

#### Returns

`void`

***

### frameUniforms

> **frameUniforms**: `string`

帧绘制资源组G0。

***

### id?

> `optional` **id**: `number`

唯一编号（第一变体编号）。

***

### index?

> `optional` **index**: `number`

唯一编号（变体唯一）。

***

### invertCull?

> `optional` **invertCull**: `boolean`

是否翻转由网格渲染器定义的裁剪面向。

***

### label

> **label**: `string`

唯一标识。

#### Overrides

`GPURenderPassDescriptor.label`

***

### layerMask?

> `optional` **layerMask**: `number`

层掩码，用于在渲染前过滤对象。

***

### materialSpec?

> `optional` **materialSpec**: [`Asset_material`](Asset_material.md) & `object`

指定固定使用的材质绘制帧（通常在后处理帧通道使用）。

#### Type declaration

##### g3?

> `optional` **g3**: `GPUBindGroup`

##### instance?

> `optional` **instance**: [`Material`](../classes/Material.md)

***

### mode

> **mode**: `"shading"` \| `"postprocess"` \| `"compute"`

通道所用着色器类型。

***

### multisample?

> `optional` **multisample**: `GPUMultisampleState`

多重采样设置（在GPURenderPipelineDescriptor中使用）。
https://zhuanlan.zhihu.com/p/647524274
多重采样是一种抗锯齿技术，用于提高图形渲染的质量。它通过对一个像素的多个样本进行采样和平均，来减少边缘的锯齿状不平滑现象。
开启了Alpha To Coverage后，fragment的alpha值会影响该fragment对应像素的采样点是否被覆盖。
启用ALPHA_TO_COVERAGE标记可以使内部颜色根据不透明度平滑过渡到边缘。A值会影响样点遮挡信息（coverage）的计算，从而影响写入的颜色比例；
步骤：
1、创建一个具有多重采样能力的渲染目标纹理（msaaTexture）；
 GPUTextureDescriptor.sampleCount = 4;
 在光栅化阶段，在1个像素周围使用4个子采样点，但每个像素仍只执行1次像素着色器的计算。
 这4个子采样点都会计算自己的深度值，然后根据深度测试（Occlusion）和三角形覆盖性测试（Coverage）来决定是否复制该像素的计算结果。
 为此深度缓冲区和渲染目标需要的空间为非多重采样的4倍。
 MSAA在光栅化阶段只是生成覆盖信息，计算像素颜色，根据覆盖信息和深度信息决定是否将像素颜色写入子采样点。
 整个光栅化完成后再通过某个过滤器进行解析（Resolve）得到最终的图像。
 在更大的分辨率上计算覆盖信息和遮挡信息后，得到4个样点的平均覆盖率和平均遮挡率，解析根据该平均值向4个样点混合入片元颜色
2、在创建渲染管线时指定多重采样状态；
 GPURenderPipelineDescriptor.multisample.count = 4;
3、在渲染通道描述符中设置多重采样纹理视图：
 GPURenderPassColorAttachment.view = msaaTexture.view;
4、在渲染通道描述符中设置解析目标（通常是交换链的纹理视图）：
 GPURenderPassColorAttachment.resolveTarget = canvas.view;
 用于存储多重采样渲染操作的解析结果。
 当你使用MSAA时，每个像素会有多个样本。这些样本需要被合并或“解析”成单个样本存储到resolveTarget中。

***

### PreExecute()?

> `optional` **PreExecute**: (`variant`, `queue`) => `boolean`

预备执行帧通道。

#### Parameters

• **variant**: `number`

• **queue**: [`DrawQueue`](../classes/DrawQueue.md)

#### Returns

`boolean`

***

### queueRange

> **queueRange**: [`RENDER_QUEUE_RANGE`](../enumerations/RENDER_QUEUE_RANGE.md)

渲染队列范围。

***

### rect

> **rect**: `number`[]

绘制渲染目标区域。

***

### shaderMacro?

> `optional` **shaderMacro**: `Record`\<`string`, `number`\>

特别指定着色器通道宏定义。

***

### sortingCriteria?

> `optional` **sortingCriteria**: `number`

渲染排序方法（多重方法标志集，越低位权重越高）。

***

### unclippedDepth?

> `optional` **unclippedDepth**: `boolean`

是否启用depth-clip-control特性（在GPUPrimitiveState中使用）。
默认情况下，多边形的深度在光栅化过程中会被裁剪到0-1的范围内，超出这个范围的部分会被拒绝，相关的片元也不会被处理。
启用depth-clip-control特性后，可以禁用这种裁剪。

***

### variantCount?

> `optional` **variantCount**: `number`

帧通道变体数量（默认1，每个变体）。

***

### viewport?

> `optional` **viewport**: `number`[]

渲染视口。
