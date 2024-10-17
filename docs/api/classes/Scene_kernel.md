[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Scene\_kernel

# Class: Scene\_kernel

场景内核实现。

## Extends

- [`Base_kernel`](Base_kernel.md)\<[`Scene`](Scene.md), *typeof* [`Scene_member_index`](../variables/Scene_member_index.md)\>

## Constructors

### new Scene\_kernel()

> **new Scene\_kernel**(`_global`): [`Scene_kernel`](Scene_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

#### Returns

[`Scene_kernel`](Scene_kernel.md)

#### Overrides

`Miaoverse.Base_kernel<Scene, typeof Scene_member_index>.constructor`

## Methods

### Create()

> **Create**(): `Promise`\<[`Scene`](Scene.md)\>

创建场景实例。

#### Returns

`Promise`\<[`Scene`](Scene.md)\>

返回场景实例。

***

### Culling()

> **Culling**(`camera`, `layerMask`): `object`

基于相机视锥裁剪场景绘制对象。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例。

• **layerMask**: `number`

3D对象层掩码。

#### Returns

`object`

返回绘制列表。

##### count

> **count**: `number`

##### params

> **params**: `Uint32Array`

***

### Get()

> **Get**\<`N`\>(`ptr`, `key`): `N`

获取资源内核实例属性值。

#### Type Parameters

• **N**

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"id"` \| `"next"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"worldLLMC"` \| `"altitude"` \| `"unused2"` \| `"unused3"` \| `"unused1"`

资源内核实现的数据结构成员名称。

#### Returns

`N`

返回对应属性值。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Get`](Base_kernel.md#get)

***

### GetInstanceByID()

> **GetInstanceByID**(`id`): [`Scene`](Scene.md)

根据资源实例ID获取资源实例。

#### Parameters

• **id**: `number`

资源实例ID。

#### Returns

[`Scene`](Scene.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByID`](Base_kernel.md#getinstancebyid)

***

### GetInstanceByPtr()

> **GetInstanceByPtr**(`ptr`): [`Scene`](Scene.md)

资源内核实例指针获取资源实例。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

#### Returns

[`Scene`](Scene.md)

返回资源实例。

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`GetInstanceByPtr`](Base_kernel.md#getinstancebyptr)

***

### InstancePrefab()

> **InstancePrefab**(`scene`, `uri`, `pkg`?, `master`?, `listBeg`?): `Promise`\<[`Prefab`](../interfaces/Prefab.md)\>

实例化预制件。

#### Parameters

• **scene**: [`Scene`](Scene.md)

实例化出的3D对象所属场景。

• **uri**: `string`

预制件URI。

• **pkg?**: [`PackageReg`](../interfaces/PackageReg.md)

预制件所属资源包。

• **master?**: [`Prefab`](../interfaces/Prefab.md)

根源预制件。

• **listBeg?**: `number`

3D对象数组起始添加偏移。

#### Returns

`Promise`\<[`Prefab`](../interfaces/Prefab.md)\>

返回预制件实例数据。

***

### Raycast()

> **Raycast**(`camera`, `point`, `layerMask`?): [`Object3D`](Object3D.md)

基于屏幕拾取射线与对象包围盒相交法拾取最近对象。

#### Parameters

• **camera**: [`Camera`](Camera.md)

相机组件实例。

• **point**: `number`[]

屏幕坐标[0, 1]。

• **layerMask?**: `number`

3D对象层掩码。

#### Returns

[`Object3D`](Object3D.md)

返回拾取到的最近对象。

***

### Set()

> **Set**(`ptr`, `key`, `value`): `void`

设置资源内核实例属性值。

#### Parameters

• **ptr**: `never`

资源内核实例指针。

• **key**: `"id"` \| `"next"` \| `"magic"` \| `"version"` \| `"byteSize"` \| `"refCount"` \| `"uuid"` \| `"writeTS"` \| `"readTS"` \| `"last"` \| `"worldLLMC"` \| `"altitude"` \| `"unused2"` \| `"unused3"` \| `"unused1"`

资源内核实现的数据结构成员名称。

• **value**: `any`

属性值。

#### Returns

`void`

#### Inherited from

[`Base_kernel`](Base_kernel.md).[`Set`](Base_kernel.md#set)
