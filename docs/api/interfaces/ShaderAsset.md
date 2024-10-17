[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / ShaderAsset

# Interface: ShaderAsset

着色器预制资产。

## Properties

### codes

> **codes**: `object`

着色器代码。

#### material

> **material**: `object`

材质着色器代码。

#### material.code?

> `optional` **code**: `string`

装配所得代码

#### material.includes

> **includes**: `string`[]

材质着色器依赖代码文件。

#### material.main

> **main**: `string`

材质着色器实现代码文件。

#### shading

> **shading**: `object`

光照着色器代码。

#### shading.code?

> `optional` **code**: `string`

装配所得代码

#### shading.includes

> **includes**: `string`[]

光照着色器依赖代码文件。

#### shading.main

> **main**: `string`

光照着色器实现代码文件。

#### vertex

> **vertex**: `object`

顶点着色器代码。

#### vertex.code?

> `optional` **code**: `string`

装配所得代码

#### vertex.includes

> **includes**: `string`[]

顶点着色器依赖代码文件。

#### vertex.main

> **main**: `string`

顶点着色器实现代码文件。

***

### custom\_g3?

> `optional` **custom\_g3**: `GPUBindGroupLayoutDescriptor`

自定义G3资源组布局。

***

### depth\_stencil?

> `optional` **depth\_stencil**: `object`

深度和模板测试设置（GPUDepthStencilState，format字段由帧缓存设置）。

#### depthBias?

> `optional` **depthBias**: `number`

设置深度偏移参数1（深度贴图格式的最小表示值的倍数。在插值前给顶点Z值加的偏移，因此会影响写入。TODO:应当由着色器设置）。

#### depthBiasClamp?

> `optional` **depthBiasClamp**: `number`

最大深度偏移约束。

#### depthBiasSlopeScale?

> `optional` **depthBiasSlopeScale**: `number`

设置深度偏移参数2（受观察向量与相机平面斜率影响的深度偏移值。在插值前给顶点Z值加的偏移，因此会影响写入。TODO:应当由着色器设置）；
m：像素深度值的水平斜率和垂直斜率的最大值，与远近平面平行的面时，m = 0；
r：深度缓冲区格式的最小可表示值；
offset = (m * depthBiasSlopeScale) + (r * depthBias)。

#### depthCompare?

> `optional` **depthCompare**: `GPUCompareFunction`

深度比较方法。

#### depthWriteEnabled?

> `optional` **depthWriteEnabled**: `boolean`

是否允许写入深度值。

#### stencilBack?

> `optional` **stencilBack**: `GPUStencilFaceState`

模板背面测试和测试后操作方法。

#### stencilFront?

> `optional` **stencilFront**: `GPUStencilFaceState`

模板正面测试和测试后操作方法。

#### stencilReadMask?

> `optional` **stencilReadMask**: `number`

模板测试时读取模板值的位掩码。

#### stencilWriteMask?

> `optional` **stencilWriteMask**: `number`

模板测试后写入模板值的位掩码。

***

### filtering?

> `optional` **filtering**: `number`

渲染标志过滤设置，将过滤着色器永远不会用到的标志，可以显著减少分支数量（取反后与渲染标志集进行与运算）。

***

### instance?

> `optional` **instance**: `number`

着色器实例ID（着色器资产装载后生成）。

***

### name

> **name**: `string`

唯一名称。

***

### properties

> **properties**: `Record`\<`string`, `object`\>

属性声明（为了能使材质属性能在不同着色器之间正确转移，请使用标准PBR属性名称）。

***

### settings

> **settings**: `any`

默认启用特性配置（分支编译时会结合渲染设置中的特性配置）。

***

### type

> **type**: `"shading"` \| `"postprocess"` \| `"compute"`

着色器类型。

***

### vertex\_buffers?

> `optional` **vertex\_buffers**: `GPUVertexBufferLayout`[]

自定义顶点缓存布局。
