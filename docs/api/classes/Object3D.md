[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Object3D

# Class: Object3D

3D对象实例。

## Extends

- [`Resource`](Resource.md)\<[`Object3D`](Object3D.md)\>

## Constructors

### new Object3D()

> **new Object3D**(`impl`, `ptr`, `id`): [`Object3D`](Object3D.md)

构造函数。

#### Parameters

• **impl**: [`Object_kernel`](Object_kernel.md)

内核实现。

• **ptr**: `never`

内核实例指针。

• **id**: `number`

实例ID。

#### Returns

[`Object3D`](Object3D.md)

#### Overrides

[`Resource`](Resource.md).[`constructor`](Resource.md#constructors)

## Accessors

### active

> `get` **active**(): `boolean`

对象激活状态。

> `set` **active**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### animator

> `set` **animator**(`component`): `void`

动画组件。

#### Parameters

• **component**: [`Animator`](Animator.md)

***

### childCount

> `get` **childCount**(): `number`

子级数量。

#### Returns

`number`

***

### eulerAngles

> `get` **eulerAngles**(): [`Vector3`](Vector3.md)

世界空间旋转欧拉角（单位度）。

> `set` **eulerAngles**(`v`): `void`

#### Parameters

• **v**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)

***

### firstChild

> `get` **firstChild**(): [`Object3D`](Object3D.md)

第一个子级对象（子级链表头）。

#### Returns

[`Object3D`](Object3D.md)

***

### forward

> `get` **forward**(): [`Vector3`](Vector3.md)

世界空间前向量。

#### Returns

[`Vector3`](Vector3.md)

***

### highlight

> `get` **highlight**(): `boolean`

对象高亮状态。

> `set` **highlight**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

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

### lastSib

> `get` **lastSib**(): [`Object3D`](Object3D.md)

上一个兄弟实例。

#### Returns

[`Object3D`](Object3D.md)

***

### layers

> `get` **layers**(): `number`

对象自定义层标记。

> `set` **layers**(`value`): `void`

#### Parameters

• **value**: `number`

#### Returns

`number`

***

### localEulerAngles

> `get` **localEulerAngles**(): [`Vector3`](Vector3.md)

父级空间旋转欧拉角（单位度）。

> `set` **localEulerAngles**(`v`): `void`

#### Parameters

• **v**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)

***

### localMatrix

> `set` **localMatrix**(`value`): `void`

本地矩阵（模型空间到父级空间）。

#### Parameters

• **value**: [`Matrix4x4`](Matrix4x4.md)

***

### localPosition

> `get` **localPosition**(): [`Vector3`](Vector3.md)

本地坐标（父级空间）。

> `set` **localPosition**(`value`): `void`

#### Parameters

• **value**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)

***

### localRotation

> `get` **localRotation**(): [`Quaternion`](Quaternion.md)

本地旋转（父级空间）。

> `set` **localRotation**(`value`): `void`

#### Parameters

• **value**: [`Quaternion`](Quaternion.md)

#### Returns

[`Quaternion`](Quaternion.md)

***

### localScale

> `get` **localScale**(): [`Vector3`](Vector3.md)

本地缩放（父级空间）。

> `set` **localScale**(`value`): `void`

#### Parameters

• **value**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)

***

### meshRenderer

> `get` **meshRenderer**(): [`MeshRenderer`](MeshRenderer.md)

> `set` **meshRenderer**(`component`): `void`

网格渲染器组件。

#### Parameters

• **component**: [`MeshRenderer`](MeshRenderer.md)

#### Returns

[`MeshRenderer`](MeshRenderer.md)

***

### mfwMat

> `get` **mfwMat**(): [`Matrix4x4`](Matrix4x4.md)

世界空间到对象空间变换矩阵。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

***

### name

> `get` **name**(): `string`

对象名称。

> `set` **name**(`name`): `void`

#### Parameters

• **name**: `string`

#### Returns

`string`

***

### nextSib

> `get` **nextSib**(): [`Object3D`](Object3D.md)

下一个兄弟实例。

#### Returns

[`Object3D`](Object3D.md)

***

### parent

> `get` **parent**(): [`Object3D`](Object3D.md)

父级对象实例。

#### Returns

[`Object3D`](Object3D.md)

***

### parentTS

> `get` **parentTS**(): `number`

父级变换组件应用时间戳。

#### Returns

`number`

***

### position

> `get` **position**(): [`Vector3`](Vector3.md)

世界空间坐标。

> `set` **position**(`pos`): `void`

#### Parameters

• **pos**: [`Vector3`](Vector3.md)

#### Returns

[`Vector3`](Vector3.md)

***

### readTS

> `get` **readTS**(): `number`

变换组件应用时间戳。

#### Returns

`number`

***

### right

> `get` **right**(): [`Vector3`](Vector3.md)

世界空间右向量。

#### Returns

[`Vector3`](Vector3.md)

***

### root

> `get` **root**(): [`Object3D`](Object3D.md)

层次结构中最顶级实例。

#### Returns

[`Object3D`](Object3D.md)

***

### rotation

> `get` **rotation**(): [`Quaternion`](Quaternion.md)

旋转（世界空间。缩放造成空间尺度变形，方向被扭曲，所以带缩放的变换矩阵变换方向无法得到等比例空间的方向）。

> `set` **rotation**(`q`): `void`

#### Parameters

• **q**: [`Quaternion`](Quaternion.md)

#### Returns

[`Quaternion`](Quaternion.md)

***

### staticWorld

> `get` **staticWorld**(): `boolean`

对象坐标不跟随世界空间原点变化。

> `set` **staticWorld**(`b`): `void`

#### Parameters

• **b**: `boolean`

#### Returns

`boolean`

***

### up

> `get` **up**(): [`Vector3`](Vector3.md)

世界空间上向量。

#### Returns

[`Vector3`](Vector3.md)

***

### wfmMat

> `get` **wfmMat**(): [`Matrix4x4`](Matrix4x4.md)

对象空间到世界空间变换矩阵。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

***

### writeTS

> `get` **writeTS**(): `number`

变换组件更新时间戳。

#### Returns

`number`

## Methods

### Destroy()

> **Destroy**(): `void`

销毁对象。

#### Returns

`void`

***

### ForEachChild()

> **ForEachChild**(`proc`): `void`

遍历处理每个子对象。

#### Parameters

• **proc**

#### Returns

`void`

***

### SetLngLat()

> **SetLngLat**(`lng`, `lat`, `altitude`): `void`

设置根对象变换参考的经纬度和海拔高度。
请传入GCJ02坐标系（高德地图、腾讯地图）经纬度。
经纬度拾取器：https://lbs.qq.com/getPoint/

#### Parameters

• **lng**: `number`

经度。

• **lat**: `number`

纬度。

• **altitude**: `number`

海拔高度。

#### Returns

`void`

***

### SetParent()

> **SetParent**(`parent`, `worldPositionStays`?): `void`

设置父级对象实例。

#### Parameters

• **parent**: [`Object3D`](Object3D.md)

父级对象实例。

• **worldPositionStays?**: `boolean`

是否保持世界空间位置。

#### Returns

`void`
