[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / TransformCtrl

# Class: TransformCtrl

变换组件控制器。

## Constructors

### new TransformCtrl()

> **new TransformCtrl**(`_global`): [`TransformCtrl`](TransformCtrl.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`TransformCtrl`](TransformCtrl.md)

## Accessors

### ctrl

> `get` **ctrl**(): `boolean`

是否处于控制之中。

#### Returns

`boolean`

## Methods

### Begin()

> **Begin**(`target`): `boolean`

开始控制。

#### Parameters

• **target**: [`Object3D`](Object3D.md)

起始光标命中对象。

#### Returns

`boolean`

返回是否命中控制轴。

***

### Build()

> **Build**(`scene`): `Promise`\<[`TransformCtrl`](TransformCtrl.md)\>

构建变换组件控制器对象。

#### Parameters

• **scene**: [`Scene`](Scene.md)

#### Returns

`Promise`\<[`TransformCtrl`](TransformCtrl.md)\>

***

### Destroy()

> **Destroy**(): `void`

销毁变换组件控制器。

#### Returns

`void`

***

### Drag()

> **Drag**(`camera`, `layerX`, `layerY`, `clientWidth`, `clientHeight`): `void`

拖拽控制手柄。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例。

• **layerX**: `number`

光标位置像素坐标X。

• **layerY**: `number`

光标位置像素坐标Y。

• **clientWidth**: `number`

事件源元素宽度。

• **clientHeight**: `number`

事件源元素高度。

#### Returns

`void`

***

### End()

> **End**(): `void`

结束控制。

#### Returns

`void`

***

### Update()

> **Update**(`camera`): `void`

更新变换组件控制器。

#### Parameters

• **camera**: [`Camera`](Camera.md)

#### Returns

`void`
