[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Dioramas\_3mx

# Class: Dioramas\_3mx

倾斜摄影组件（3MX）。

## Extends

- [`Resource`](Resource.md)\<[`Dioramas_3mx`](Dioramas_3mx.md)\>

## Constructors

### new Dioramas\_3mx()

> **new Dioramas\_3mx**(`impl`, `ptr`, `id`): [`Dioramas_3mx`](Dioramas_3mx.md)

构造函数。

#### Parameters

• **impl**: `any`

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Dioramas_3mx`](Dioramas_3mx.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### id

> `get` **id**(): `number`

实例ID。

#### Returns

`number`

#### Inherited from

[`Resource`](Resource.md).[`id`](Resource.md#id)

***

### internalPtr

> `get` **internalPtr**(): `never`

内核实例指针。

#### Returns

`never`

#### Inherited from

[`Resource`](Resource.md).[`internalPtr`](Resource.md#internalptr)

***

### object3d

> `get` **object3d**(): [`Object3D`](Object3D.md)

3D对象实例（用于定位模型位置）。

#### Returns

[`Object3D`](Object3D.md)

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### Draw()

> **Draw**(`queue`): `void`

绘制场景。

#### Parameters

• **queue**: [`DrawQueue`](DrawQueue.md)

绘制队列。

#### Returns

`void`

***

### Init()

> **Init**(`scene`, `url`, `lnglat_alt`?): `Promise`\<`void`\>

初始化倾斜摄影组件。

#### Parameters

• **scene**: [`Scene`](Scene.md)

模型所属场景实例。

• **url**: `string`

场景根文件路径。

• **lnglat\_alt?**: `number`[]

模型经纬度和海拔高度（请传入GCJ02坐标系（高德地图、腾讯地图）经纬度）。

#### Returns

`Promise`\<`void`\>

***

### Update()

> **Update**(`camera`): `void`

更新绘制场景。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例（用于获取全局空间到相机空间变换矩阵）。

#### Returns

`void`
