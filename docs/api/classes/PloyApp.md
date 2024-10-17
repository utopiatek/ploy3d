[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / PloyApp

# Class: PloyApp

应用基类。

## Constructors

### new PloyApp()

> **new PloyApp**(`engine`): [`PloyApp`](PloyApp.md)

构造函数。

#### Parameters

• **engine**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`PloyApp`](PloyApp.md)

## Properties

### engine

> **engine**: [`Ploy3D`](Ploy3D.md)

引擎实例。

***

### event\_listener

> **event\_listener**: `Record`\<`string`, (`event`) => `Promise`\<`void`\>[]\>

事件监听器。

***

### events

> **events**: `Record`\<`string`, `any`\>

事件绑定列表。

***

### sdl\_canvas?

> `optional` **sdl\_canvas**: `any`

本机窗口UI画布。

***

### sdl\_window?

> `optional` **sdl\_window**: `any`

本机窗口实例。

***

### started

> **started**: `boolean`

应用是否已启动。

***

### ui\_canvas?

> `optional` **ui\_canvas**: `HTMLCanvasElement`

UI画布元素（DENO环境下用于创建Image等资源）。

***

### ui\_ctx

> **ui\_ctx**: `CanvasRenderingContext2D`

UI画布渲染上下文。

***

### CK\_InitUI()

> `static` **CK\_InitUI**: (`app`) => `Promise`\<`void`\>

CanvasKit初始化主画布。

#### Parameters

• **app**: [`PloyApp`](PloyApp.md)

#### Returns

`Promise`\<`void`\>

***

### SDL2\_InitEvent()

> `static` **SDL2\_InitEvent**: (`app`) => `Promise`\<`void`\>

SDL2事件绑定。

#### Parameters

• **app**: [`PloyApp`](PloyApp.md)

#### Returns

`Promise`\<`void`\>

***

### SDL2\_InitWindow()

> `static` **SDL2\_InitWindow**: (`app`, `title`, `width`, `height`, `progress`) => `Promise`\<`boolean`\>

SDL2窗口初始化。

#### Parameters

• **app**: [`PloyApp`](PloyApp.md)

• **title**: `string`

• **width**: `number`

• **height**: `number`

• **progress**

#### Returns

`Promise`\<`boolean`\>

***

### SDL2\_SolveEvent()

> `static` **SDL2\_SolveEvent**: () => `void`

SDL2事件处理方法。

#### Returns

`void`

## Methods

### AddEventListener()

> **AddEventListener**(`type`, `listener`): `void`

注册事件监听器。

#### Parameters

• **type**: `string`

事件类型。

• **listener**

事件监听器。

#### Returns

`void`

***

### Awake()

> **Awake**(): `void`

唤醒帧循环（部分终端中setInterval会引起页面卡顿，应使用requestAnimationFrame）。

#### Returns

`void`

***

### CreateAtmosphere()

> **CreateAtmosphere**(`scene`): `Promise`\<`object`\>

创建地球大气层对象。

#### Parameters

• **scene**: [`Scene`](Scene.md)

场景实例。

#### Returns

`Promise`\<`object`\>

返回地球大气层相关资源。

##### draw\_params

> **draw\_params**: `object`

网格绘制参数对象。

##### draw\_params.castShadows?

> `optional` **castShadows**: `boolean`

##### draw\_params.cullMode

> **cullMode**: `number`

##### draw\_params.flags

> **flags**: `number`

##### draw\_params.frontFace

> **frontFace**: `number`

##### draw\_params.instances

> **instances**: `number`[][]

##### draw\_params.layers

> **layers**: `number`

##### draw\_params.materials

> **materials**: `object`[]

##### draw\_params.mesh

> **mesh**: [`Mesh`](Mesh.md)

##### draw\_params.receiveShadows?

> `optional` **receiveShadows**: `boolean`

##### draw\_params.topology?

> `optional` **topology**: [`GLPrimitiveTopology`](../enumerations/GLPrimitiveTopology.md)

##### draw\_params.userData

> **userData**: `number`

##### material

> **material**: [`Material`](Material.md)

材质资源实例。

##### mesh

> **mesh**: [`Mesh`](Mesh.md)

网格资源实例。

***

### CreateTransformCtrl()

> **CreateTransformCtrl**(`scene`): `Promise`\<[`TransformCtrl`](TransformCtrl.md)\>

创建变换组件控制器工具。

#### Parameters

• **scene**: [`Scene`](Scene.md)

场景实例。

#### Returns

`Promise`\<[`TransformCtrl`](TransformCtrl.md)\>

返回变换组件控制器工具。

***

### Draw2D()

> **Draw2D**(): `void`

绘制场景2D画面。

#### Returns

`void`

***

### Draw3D()

> **Draw3D**(): `void`

绘制场景3D画面。

#### Returns

`void`

***

### DrawFrame()

> **DrawFrame**(`count`, `count2d`?): `void`

绘制3D帧（该方法的调用不影响帧率）。

#### Parameters

• **count**: `number`

将绘制不小于参数指定的帧数。

• **count2d?**: `number`

将绘制不小于参数指定的2D帧数。

#### Returns

`void`

***

### InitEngine()

> **InitEngine**(`progress`): `Promise`\<`boolean`\>

初始化引擎。

#### Parameters

• **progress**

进度刷新函数。

#### Returns

`Promise`\<`boolean`\>

是否初始化成功。

***

### InitEvent()

> **InitEvent**(): `Promise`\<`void`\>

初始化事件系统。

#### Returns

`Promise`\<`void`\>

返回事件协程。

***

### InitScene()

> **InitScene**(`progress`): `Promise`\<`boolean`\>

初始化场景。

#### Parameters

• **progress**

进度刷新函数。

#### Returns

`Promise`\<`boolean`\>

是否初始化成功。

***

### InitUI()

> **InitUI**(`progress`): `Promise`\<`boolean`\>

初始化UI。

#### Parameters

• **progress**

进度刷新函数。

#### Returns

`Promise`\<`boolean`\>

是否初始化成功。

***

### InitWindow()

> **InitWindow**(`title`, `width`, `height`, `progress`): `Promise`\<`boolean`\>

初始化窗口。

#### Parameters

• **title**: `string`

主窗口标题。

• **width**: `number`

主窗口宽度。

• **height**: `number`

主窗口高度。

• **progress**

进度刷新函数。

#### Returns

`Promise`\<`boolean`\>

是否初始化成功。

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

### Shutdown()

> **Shutdown**(): `Promise`\<`void`\>

关闭主程序。

#### Returns

`Promise`\<`void`\>

***

### Startup()

> **Startup**(`title`, `width`, `height`): `Promise`\<`void`\>

启动主程序。

#### Parameters

• **title**: `string`

主窗口标题。

• **width**: `number`

主窗口宽度。

• **height**: `number`

主窗口高度。

#### Returns

`Promise`\<`void`\>

返回事件协程。

***

### Status()

> **Status**(): `void`

收集当前运行状态信息。

#### Returns

`void`

***

### Step()

> **Step**(): `boolean`

场景帧更新绘制。

#### Returns

`boolean`

返回false表示无必要进一步步进。

***

### Update()

> **Update**(`flags`): `void`

更新场景。

#### Parameters

• **flags**: `number`

更新标志集（1-更新2D场景，2-更新3D场景）。

#### Returns

`void`
