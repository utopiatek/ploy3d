[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Device

# Class: Device

GPU虚拟设备接口。

## Constructors

### new Device()

> **new Device**(`_global`): [`Device`](Device.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`Device`](Device.md)

## Accessors

### device

> `get` **device**(): `GPUDevice`

GPU设备，管理资源和指令。

#### Returns

`GPUDevice`

## Methods

### CreateBuffer()

> **CreateBuffer**(`classid`, `size`, `offset`?, `data`?): `number`

创建缓存实例。

#### Parameters

• **classid**: `number`

缓存类型【CLASSID】。

• **size**: `number`

缓存大小。

• **offset?**: `number`

初始化数据偏移。

• **data?**: `ArrayBuffer`

初始化数据。

#### Returns

`number`

返回缓存ID。

***

### CreateSampler()

> **CreateSampler**(`flags`): `number`

创建贴图采样器实例。

#### Parameters

• **flags**: `number`

采样器标识符。

#### Returns

`number`

返回采样器实例ID。

***

### CreateTexture2D()

> **CreateTexture2D**(`width`, `height`, `depth`, `levelCount`, `format`, `usage`?): `number`

创建2D贴图实例。

#### Parameters

• **width**: `number`

贴图宽度。

• **height**: `number`

贴图高度。

• **depth**: `number`

贴图数组层数。

• **levelCount**: `number`

贴图LOD级别数。

• **format**: [`GLTextureFormat`](../type-aliases/GLTextureFormat.md)

贴图像素格式。

• **usage?**: `number`

#### Returns

`number`

返回贴图实例ID。

***

### CreateTextureRT()

> **CreateTextureRT**(`width`, `height`, `depth`, `levelCount`, `format`, `bindable`, `resizable`): `number`

创建渲染贴图实例。

#### Parameters

• **width**: `number`

贴图宽度。

• **height**: `number`

贴图高度。

• **depth**: `number`

贴图数组层数。

• **levelCount**: `number`

贴图LOD级别数。

• **format**: [`GLTextureFormat`](../type-aliases/GLTextureFormat.md)

贴图像素格式。

• **bindable**: `boolean`

是否可以作为绑定资源。

• **resizable**: `boolean`

是否可重设大小。

#### Returns

`number`

返回贴图实例ID。

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### FreeBuffer()

> **FreeBuffer**(`id`): `void`

释放缓存实例。

#### Parameters

• **id**: `number`

缓存实例ID。

#### Returns

`void`

***

### FreeSampler()

> **FreeSampler**(`id`): `void`

释放贴图采样器实例。

#### Parameters

• **id**: `number`

贴图采样器实例ID。

#### Returns

`void`

***

### FreeTexture2D()

> **FreeTexture2D**(`id`): `void`

释放贴图实例。

#### Parameters

• **id**: `number`

贴图实例ID。

#### Returns

`void`

***

### FreeTextureRT()

> **FreeTextureRT**(`id`): `void`

释放贴图实例。

#### Parameters

• **id**: `number`

贴图实例ID。

#### Returns

`void`

***

### GC()

> **GC**(): `void`

垃圾回收。

#### Returns

`void`

***

### GenerateSamplerFlags()

> **GenerateSamplerFlags**(`desc`): `number`

根据贴图采样器描述符生成标识符。

#### Parameters

• **desc**: `GPUSamplerDescriptor`

贴图采样器描述符。

#### Returns

`number`

返回采样器标识符。

***

### GetBuffer()

> **GetBuffer**(`id`): `object`

获取缓存实例。

#### Parameters

• **id**: `number`

缓存实例ID。

#### Returns

`object`

返回缓存实例。

##### buffer

> **buffer**: `GPUBuffer`

缓存对象。

##### classid

> **classid**: `number`

缓存类型【CLASSID】。

##### id

> **id**: `number`

缓存ID。

##### refCount

> **refCount**: `number`

缓存引用计数。

##### size

> **size**: `number`

缓存大小，不可扩容。

***

### GetRenderTextureAttachment()

> **GetRenderTextureAttachment**(`id`, `layer`, `level`, `format`?): `GPUTextureView`

获取渲染贴图附件。

#### Parameters

• **id**: `number`

贴图实例ID。

• **layer**: `number`

图层。

• **level**: `number`

LOD级别。

• **format?**: `GPUTextureFormat`

指定视图解析格式（应于贴图格式兼容）。

#### Returns

`GPUTextureView`

返回渲染贴图视图。

***

### GetSampler()

> **GetSampler**(`id`): `object`

获取贴图采样器实例。

#### Parameters

• **id**: `number`

贴图采样器实例ID。

#### Returns

`object`

返回贴图采样器实例。

##### desc

> **desc**: `GPUSamplerDescriptor`

采样器描述符。

##### flags

> **flags**: `number`

采样器标识。

##### id

> **id**: `number`

采样器ID。

##### refCount

> **refCount**: `number`

采样器引用计数。

##### sampler

> **sampler**: `GPUSampler`

采样器对象。

***

### GetTexture2D()

> **GetTexture2D**(`id`): `object`

获取2D贴图实例。

#### Parameters

• **id**: `number`

贴图实例ID。

#### Returns

`object`

返回贴图实例。

##### depth

> **depth**: `number`

贴图层数。

##### format

> **format**: `GPUTextureFormat`

贴图像素格式。

##### height

> **height**: `number`

贴图高度。

##### id

> **id**: `number`

贴图ID。

##### layerSize

> **layerSize**: `number`

纹理集单层占用空间大小。

##### levelCount

> **levelCount**: `number`

贴图细节级别数。

##### refCount

> **refCount**: `number`

贴图引用计数。

##### texture

> **texture**: `GPUTexture`

贴图对象。

##### view

> **view**: `GPUTextureView`

贴图视图。

##### width

> **width**: `number`

贴图宽度。

***

### GetTextureRT()

> **GetTextureRT**(`id`): `object` & `object`

获取渲染贴图实例。

#### Parameters

• **id**: `number`

贴图实例ID。

#### Returns

`object` & `object`

返回贴图实例。

***

### Init()

> **Init**(): `Promise`\<[`Device`](Device.md)\>

初始化GPU虚拟设备接口。

#### Returns

`Promise`\<[`Device`](Device.md)\>

返回GPU虚拟设备接口。

***

### ParseSamplerFlags()

> **ParseSamplerFlags**(`flags`): `GPUSamplerDescriptor`

解析贴图采样器标识符为贴图采样器描述符。

#### Parameters

• **flags**: `number`

贴图采样器标识符。

#### Returns

`GPUSamplerDescriptor`

返回贴图采样器描述符。

***

### ReadTextureRT()

> **ReadTextureRT**(`id`, `layer`, `pixelX`, `pixelY`): `Promise`\<`ArrayBuffer`\>

读取渲染贴图像素值。

#### Parameters

• **id**: `number`

渲染贴图ID。

• **layer**: `number`

读取贴图数组图层索引。

• **pixelX**: `number`

读取像素坐标X。

• **pixelY**: `number`

读取像素坐标Y。

#### Returns

`Promise`\<`ArrayBuffer`\>

返回数据缓存。

***

### Resize()

> **Resize**(`width`?, `height`?): `boolean`

重设渲染目标大小。

#### Parameters

• **width?**: `number`

宽度。

• **height?**: `number`

高度。

#### Returns

`boolean`

画布过小将返回假。

***

### ResizeAtlas()

> **ResizeAtlas**(`id`, `layer`): `boolean`

扩展纹理数组容量。

#### Parameters

• **id**: `number`

贴图实例ID。

• **layer**: `number`

确保数组容量包含指定图层。

#### Returns

`boolean`

返回扩展是否成功。

***

### WriteBuffer()

> **WriteBuffer**(`id`, `bufferOffset`, `data`, `dataOffset`, `size`): `void`

写入缓存数据。

#### Parameters

• **id**: `number`

缓存实例ID。

• **bufferOffset**: `number`

缓存写入偏移。

• **data**: `SharedArrayBuffer` \| `BufferSource`

数据源。

• **dataOffset**: `number`

数据源偏移。

• **size**: `number`

写入大小。

#### Returns

`void`

***

### WriteTexture2D\_KTX2()

> **WriteTexture2D\_KTX2**(`id`, `data`): `void`

写入2D贴图数据。

#### Parameters

• **id**: `number`

2D贴图实例ID。

• **data**: [`GLTextureSource_KTX2`](../interfaces/GLTextureSource_KTX2.md)

贴图数据源。

#### Returns

`void`

***

### WriteTexture2D\_RAW()

> **WriteTexture2D\_RAW**(`id`, `rt`, `data`): `void`

写入2D贴图或渲染贴图数据。

#### Parameters

• **id**: `number`

2D贴图或渲染贴图实例ID。

• **rt**: `boolean`

是否为渲染贴图。

• **data**: [`GLTextureSource`](../interfaces/GLTextureSource.md)

贴图数据源。

#### Returns

`void`
