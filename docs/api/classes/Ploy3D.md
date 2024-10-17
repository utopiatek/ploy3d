[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Ploy3D

# Class: Ploy3D

引擎模块。

## Constructors

### new Ploy3D()

> **new Ploy3D**(`options`): [`Ploy3D`](Ploy3D.md)

构造函数。

#### Parameters

• **options**

引擎模块实例选项。

• **options.appLut?**: `Record`\<`string`, (`engine`) => [`PloyApp`](PloyApp.md)\>

应用查找表。

• **options.config?**

引擎实例配置。

• **options.config.alphaMode**: `"opaque"` \| `"premultiplied"`

画布混合模式。

• **options.config.colorSpace**: `"srgb"`

画布色彩空间类型。

• **options.config.devicePixelRatio**: `number`

画布物理像素/设备独立像素比率。

• **options.config.enable4k**: `boolean`

是否启用4K支持。

• **options.config.initHeight**: `number`

画布初始高度。

• **options.config.initWidth**: `number`

画布初始宽度。

• **options.config.mobile**: `boolean`

是否是移动端。

• **options.config.powerPreference**: `"high-performance"` \| `"low-power"`

引擎选用低功耗还是高性能的显卡。

• **options.config.surface**: `any`

画布，用于创建默认交换链。

• **options.config.web**: `boolean`

是否为Web平台。

• **options.config.webgl**: `boolean`

是否使用WebGL。

• **options.CreateCanvas?**

自定义Canvas元素创建方法。

• **options.dazServ?**: `string`

DAZ资源服务地址。

• **options.echarts?**: `__module`

导入ECharts图表库。

• **options.Fetch?**

自定义网络请求方法。

• **options.kernelUrl?**: `string`

内核模块URL。

• **options.LoadImage?**

自定义图像元素加载器。

• **options.MakeUrl?**

根据路径拼接出用于请求数据的URL。

• **options.MeasureText?**

自定义文本宽高计算方法。

• **options.Progress?**

自定义主进度条显示控制。

• **options.Request?**

自定义网络请求方法。

• **options.rootFS**: `string` \| `FileSystemDirectoryHandle`

本地文件系统根路径。

• **options.sdl2?**: [`sdl2`](../namespaces/sdl2/README.md)

SDL2模块名字空间。

• **options.startTS?**: `number`

启动时间戳。

• **options.Track?**

自定义日志打印方法。

• **options.workerUrl?**: `string`

线程模块URL。

• **options.workerUrlJS?**: `string`

线程模块URL。

#### Returns

[`Ploy3D`](Ploy3D.md)

## Properties

### app

> **app**: [`PloyApp`](PloyApp.md)

当前应用实例。

***

### appLut

> **appLut**: `Record`\<`string`, (`engine`) => [`PloyApp`](PloyApp.md)\>

应用查找表。

***

### assembly

> **assembly**: [`Assembly`](Assembly.md)

渲染管线装配器。

***

### baseURI

> **baseURI**: `string`

根路径。

***

### config

> **config**: `object`

引擎配置。

#### alphaMode

> **alphaMode**: `"opaque"` \| `"premultiplied"`

画布混合模式。

#### colorSpace

> **colorSpace**: `"srgb"`

画布色彩空间类型。

#### devicePixelRatio

> **devicePixelRatio**: `number`

画布物理像素/设备独立像素比率。

#### enable4k

> **enable4k**: `boolean`

是否启用4K支持。

#### initHeight

> **initHeight**: `number`

画布初始高度。

#### initWidth

> **initWidth**: `number`

画布初始宽度。

#### mobile

> **mobile**: `boolean`

是否是移动端。

#### powerPreference

> **powerPreference**: `"high-performance"` \| `"low-power"`

引擎选用低功耗还是高性能的显卡。

#### surface

> **surface**: `any`

画布，用于创建默认交换链。

#### web

> **web**: `boolean`

是否为Web平台。

#### webgl

> **webgl**: `boolean`

是否使用WebGL。

***

### context

> **context**: [`Context`](Context.md)

渲染设备上下文接口。

***

### ctf

> **ctf**: `number`

压缩贴图支持标志集：0-不支持，1-s3tc，2-etc，4-astc。

***

### dazServ

> **dazServ**: `string`

DAZ资源服务地址。

***

### device

> **device**: [`Device`](Device.md)

GPU虚拟设备接口。

***

### echarts

> **echarts**: `__module`

ECharts模块名字空间。

***

### env

> **env**: [`SharedENV`](SharedENV.md)

共享数据环境。

***

### gis

> **gis**: [`Gis`](Gis.md)

GIS系统。

***

### height

> **height**: `number`

渲染目标高度。

***

### internal

> **internal**: [`Internal`](../interfaces/Internal.md)

内核接口。

***

### kernel

> **kernel**: [`Kernel`](Kernel.md)

内核管理器。

***

### kernelCode

> **kernelCode**: `ArrayBuffer`

内核代码。

***

### kernelUrl

> **kernelUrl**: `string`

内核模块URL。

***

### localFS

> **localFS**: [`FileStorage`](FileStorage.md)

本地文件系统。

***

### preloader

> **preloader**: `Promise`\<`void`\>

资源预加载器。

***

### renderer

> **renderer**: [`Renderer`](Renderer.md)

渲染器。

***

### renderer2d

> **renderer2d**: [`Renderer2D`](Renderer2D.md)

2D渲染器接口。

***

### resources

> **resources**: [`Resources`](Resources.md)

资源管理器。

***

### sdl2

> **sdl2**: [`sdl2`](../namespaces/sdl2/README.md)

SDL2模块名字空间。

***

### started

> **started**: `boolean`

引擎是否已启动。

***

### startTS

> **startTS**: `number`

引擎启动时间戳。

***

### ui

> **ui**: [`CalynUI`](CalynUI.md)

CalynUI系统。

***

### uid

> **uid**: `number`

用户ID（请登陆并设置真实用户ID，用户仅能上传使用真实用户ID标识的资源，模拟用户ID可能会导致资源UUID冲突）。

***

### width

> **width**: `number`

渲染目标宽度。

***

### worker

> **worker**: [`Miaoworker`](Miaoworker.md)

多线程事务处理器。

***

### workerUrl

> **workerUrl**: `string`

线程模块URL。

***

### workerUrlJS

> **workerUrlJS**: `string`

线程模块URL。

## Accessors

### webgl

> `get` **webgl**(): `boolean`

是否使用的是WebGL图形API

#### Returns

`boolean`

## Methods

### CreateCanvas()

> **CreateCanvas**(`width`, `height`): `HTMLCanvasElement`

创建Canvas元素。

#### Parameters

• **width**: `number`

宽度。

• **height**: `number`

高度。

#### Returns

`HTMLCanvasElement`

返回Canvas元素。

***

### Fetch()

> **Fetch**\<`T`\>(`input`, `init`, `type`): `Promise`\<`T`\>

网络请求方法。

#### Type Parameters

• **T**

#### Parameters

• **input**: `string`

请求路径。

• **init**: `RequestInit`

请求参数。

• **type**: `"formData"` \| `"text"` \| `"blob"` \| `"json"` \| `"arrayBuffer"`

请求数据类型。

#### Returns

`Promise`\<`T`\>

返回指定类型数据。

***

### LoadImage()

> **LoadImage**(`src`, `crossOrigin`?): `Promise`\<`HTMLImageElement`\>

加载图像元素。

#### Parameters

• **src**: `string`

图片URL。

• **crossOrigin?**: `string`

允许跨域资源。

#### Returns

`Promise`\<`HTMLImageElement`\>

返回图像元素。

***

### MakeUrl()

> **MakeUrl**(`path`): `string`

根据路径拼接出用于请求数据的URL。

#### Parameters

• **path**: `string`

路径。

#### Returns

`string`

返回URL。

***

### Matrix4x4()

> **Matrix4x4**(`values`): [`Matrix4x4`](Matrix4x4.md)

构造四阶矩阵。

#### Parameters

• **values**: `ArrayLike`\<`number`\>

矩阵值。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

返回四阶矩阵。

***

### MeasureText()

> **MeasureText**(`text`, `ctx`): `object`

计算字符串宽高。

#### Parameters

• **text**: `string`

字符串。

• **ctx**: `CanvasRenderingContext2D`

渲染上下文。

#### Returns

`object`

返回宽高。

##### actualBoundingBoxAscent

> **actualBoundingBoxAscent**: `number`

##### actualBoundingBoxDescent

> **actualBoundingBoxDescent**: `number`

##### height

> **height**: `number`

##### width

> **width**: `number`

***

### Progress()

> **Progress**(`rate`, `msg`, `log`?): `void`

主进度条显示控制。

#### Parameters

• **rate**: `number`

进度（-1表示隐藏进度条）。

• **msg**: `string`

进度提示。

• **log?**: `boolean`

是否在控制台打印。

#### Returns

`void`

***

### Quaternion()

> **Quaternion**(`values`): [`Quaternion`](Quaternion.md)

构造四元数。

#### Parameters

• **values**: `ArrayLike`\<`number`\>

四元数值。

#### Returns

[`Quaternion`](Quaternion.md)

返回四元数。

***

### Request()

> **Request**\<`T`\>(`method`, `url`, `type`, `body`, `content_type`?, `onprogress`?): `Promise`\<`unknown`\>

网络请求方法。

#### Type Parameters

• **T**

#### Parameters

• **method**: `"GET"` \| `"POST"`

请求类型。

• **url**: `string`

请求路径。

• **type**: `"text"` \| `"arraybuffer"` \| `"blob"` \| `"document"` \| `"json"`

请求数据类型。

• **body**: `Document` \| `XMLHttpRequestBodyInit`

表单数据。

• **content\_type?**: `string`

表单数据类型。

• **onprogress?**

进度刷新函数。

#### Returns

`Promise`\<`unknown`\>

返回指定类型数据。

***

### Shutdown()

> **Shutdown**(): `Promise`\<`object`\>

关闭引擎实例。

#### Returns

`Promise`\<`object`\>

##### kernel

> **kernel**: `object`

##### kernel.Engine\_cameraCount

> **Engine\_cameraCount**: `number`

##### kernel.Engine\_frameUniformsCount

> **Engine\_frameUniformsCount**: `number`

##### kernel.Engine\_lightCount

> **Engine\_lightCount**: `number`

##### kernel.Engine\_materialCount

> **Engine\_materialCount**: `number`

##### kernel.Engine\_meshCount

> **Engine\_meshCount**: `number`

##### kernel.Engine\_meshRendererCount

> **Engine\_meshRendererCount**: `number`

##### kernel.Engine\_objectCount

> **Engine\_objectCount**: `number`

##### kernel.Engine\_sceneCount

> **Engine\_sceneCount**: `number`

##### kernel.Engine\_spriteCount

> **Engine\_spriteCount**: `number`

##### kernel.Engine\_uniformBufferCount

> **Engine\_uniformBufferCount**: `number`

##### kernel.Engine\_uniformCount

> **Engine\_uniformCount**: `number`

##### kernel.Engine\_volumeCount

> **Engine\_volumeCount**: `number`

##### kernel.Memory\_blockCount

> **Memory\_blockCount**: `number`

##### kernel.Memory\_blockSize

> **Memory\_blockSize**: `number`

##### kernel.Memory\_freeCount

> **Memory\_freeCount**: `number`

##### kernel.Memory\_freeSize

> **Memory\_freeSize**: `number`

##### kernel.Memory\_growSize

> **Memory\_growSize**: `number`

##### kernel.Memory\_useCount

> **Memory\_useCount**: `number`

##### kernel.Memory\_useSize

> **Memory\_useSize**: `number`

##### kernel.System\_frameTS

> **System\_frameTS**: `number`

##### kernel.System\_moduleCount

> **System\_moduleCount**: `number`

***

### Startup()

> **Startup**(`progress`): `Promise`\<`void`\>

启动引擎实例。

#### Parameters

• **progress**

进度刷新函数。

#### Returns

`Promise`\<`void`\>

***

### Track()

> **Track**(`msg`, `ctrl`?): `void`

日志打印方法。

#### Parameters

• **msg**: `string`

日志信息。

• **ctrl?**: `number`

打印模式（0:log，1:info，2:warn，>2:error）。

#### Returns

`void`

***

### Vector3()

> **Vector3**(`values`): [`Vector3`](Vector3.md)

构造三维向量。

#### Parameters

• **values**: `ArrayLike`\<`number`\>

三维向量值。

#### Returns

[`Vector3`](Vector3.md)

返回三维向量。
