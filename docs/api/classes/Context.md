[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Context

# Class: Context

渲染设备上下文接口。

## Constructors

### new Context()

> **new Context**(`_global`): [`Context`](Context.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`Context`](Context.md)

## Methods

### CompileShaderModule()

> **CompileShaderModule**(`shader`, `g0`, `g1`, `g3`): `GPUShaderModule`[]

编译着色器分支实例。

#### Parameters

• **shader**: [`Shader`](../interfaces/Shader.md)

着色器实例。

• **g0**: [`Shader`](../interfaces/Shader.md)

• **g1**: [`Shader`](../interfaces/Shader.md)

• **g3**: [`Shader`](../interfaces/Shader.md)

#### Returns

`GPUShaderModule`[]

返回着色器模块。

***

### CreateBindGroup()

> **CreateBindGroup**(`uniform`): `object`

创建资源组绑定对象实例。

#### Parameters

• **uniform**: [`FrameUniforms`](FrameUniforms.md) \| [`Material`](Material.md) \| [`MeshRenderer`](MeshRenderer.md)

统一资源组实例。

#### Returns

`object`

返回绑定对象实例。

##### binding

> **binding**: `GPUBindGroup`

##### id

> **id**: `number`

##### offset

> **offset**: `number`

***

### CreateBindGroupCustom()

> **CreateBindGroupCustom**(`uniform`, `entries`): `object`

创建自定义资源组G3绑定对象实例。

#### Parameters

• **uniform**: [`Material`](Material.md)

统一资源组实例。

• **entries**: `GPUBindGroupEntry`[]

资源实例引用。

#### Returns

`object`

返回绑定对象实例。

##### binding

> **binding**: `GPUBindGroup`

##### id

> **id**: `number`

##### offset

> **offset**: `number`

***

### CreateRenderPipeline()

> **CreateRenderPipeline**(`desc`): `number`

创建着色器管线实例。

#### Parameters

• **desc**: `any`

着色器管线描述符。

#### Returns

`number`

返回着色器管线实例ID。

***

### CreateShader()

> **CreateShader**(`asset`): [`Shader`](../interfaces/Shader.md)

从着色器资产创建着色器实例。

#### Parameters

• **asset**: [`ShaderAsset`](../interfaces/ShaderAsset.md)

着色器资产。

#### Returns

[`Shader`](../interfaces/Shader.md)

返回着色器实例。

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### FreeShader()

> **FreeShader**(`id`): `void`

释放着色器实例。

#### Parameters

• **id**: `number`

着色器实例ID。

#### Returns

`void`

***

### GenerateGroupLayout\_G2()

> **GenerateGroupLayout\_G2**(`properties`, `hide_textures`?): [`PropLayout`](../interfaces/PropLayout.md)

构建资源绑定组布局。

#### Parameters

• **properties**: `Record`\<`string`, `object`\>

• **hide\_textures?**: `string`[]

#### Returns

[`PropLayout`](../interfaces/PropLayout.md)

返回资源绑定组布局ID。

***

### GenerateMaterialPropTuple()

> **GenerateMaterialPropTuple**(`properties`, `uniformGroup`, `hide_textures`?): [`PropLayout`](../interfaces/PropLayout.md)

生成属性值定义代码。

#### Parameters

• **properties**: `Record`\<`string`, `object`\>

属性定义。

• **uniformGroup**

属性组定义。

• **uniformGroup.alignSize**: `number`

统一缓存大小对齐。

• **uniformGroup.binding?**: `number`

绑定槽索引。

• **uniformGroup.group?**: `number`

资源组索引。

• **uniformGroup.tname?**: `string`

结构定义名称。

• **uniformGroup.vname?**: `string`

统一变量定义名称。

• **hide\_textures?**: `string`[]

#### Returns

[`PropLayout`](../interfaces/PropLayout.md)

返回属性资源绑定组布局。

***

### GetRenderPipeline()

> **GetRenderPipeline**(`id`, `framePass`, `materialSlot`): `GPURenderPipeline`

获取对应帧通道使用的GPU着色器管线实例。

#### Parameters

• **id**: `number`

着色器管线实例ID。

• **framePass**: [`GLFramePass`](../interfaces/GLFramePass.md)

帧通道配置。

• **materialSlot**: `number`

材质槽索引。

#### Returns

`GPURenderPipeline`

返回GPU着色器管线实例。

***

### GetShader()

> **GetShader**(`id`): [`Shader`](../interfaces/Shader.md)

获取着色器实例。

#### Parameters

• **id**: `number`

着色器实例ID。

#### Returns

[`Shader`](../interfaces/Shader.md)

返回着色器实例。

***

### Init()

> **Init**(): `Promise`\<[`Context`](Context.md)\>

初始化GPU上下文接口。

#### Returns

`Promise`\<[`Context`](Context.md)\>

返回GPU上下文接口。

***

### SetIndexBuffer()

> **SetIndexBuffer**(`format`, `buffer`, `passEncoder`): `void`

设置索引缓存。

#### Parameters

• **format**: `number`

索引格式（2/4）。

• **buffer**

索引缓存绑定描述。

• **buffer.buffer**: `number`

缓存对象ID。

• **buffer.offset**: `number`

数据在缓存中的字节偏移。

• **buffer.size**: `number`

数据字节大小。

• **passEncoder**: `GPURenderPassEncoder`

渲染通道命令编码器。

#### Returns

`void`

***

### SetVertexBuffer()

> **SetVertexBuffer**(`slot`, `bufferID`, `offset`, `size`, `passEncoder`): `void`

设置顶点缓存。

#### Parameters

• **slot**: `number`

顶点缓存插槽。

• **bufferID**: `number`

顶点缓存ID。

• **offset**: `number`

顶点缓存绑定字节偏移。

• **size**: `number`

顶点缓存绑定字节大小。

• **passEncoder**: `GPURenderPassEncoder`

渲染通道命令编码器。

#### Returns

`void`

***

### SetVertexBuffers()

> **SetVertexBuffers**(`vertexArray`, `buffers`, `passEncoder`): `number`

批量绑定网格顶点缓存。

#### Parameters

• **vertexArray**: `number`

顶点数组对象ID（WebGL使用）。

• **buffers**: `object`[]

顶点缓存数组。

• **passEncoder**: `GPURenderPassEncoder`

渲染通道命令编码器。

#### Returns

`number`

返回顶点数组对象ID（WebGL使用）。
