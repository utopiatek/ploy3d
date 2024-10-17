[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / AnimationCtrl

# Class: AnimationCtrl

动画控制器。
装载若干个动画片段，通过状态机管理这些动画片段的播放程序。

## Constructors

### new AnimationCtrl()

> **new AnimationCtrl**(`_animator`): [`AnimationCtrl`](AnimationCtrl.md)

构造函数。

#### Parameters

• **\_animator**: [`Animator`](Animator.md)

动画组件实例。

#### Returns

[`AnimationCtrl`](AnimationCtrl.md)

## Methods

### AddListener()

> **AddListener**(`listener`): `void`

添加状态变化监听器。

#### Parameters

• **listener**

事件响应函数。

#### Returns

`void`

***

### EnterState()

> **EnterState**(`key_`, `break_`?): `number`

触发状态。

#### Parameters

• **key\_**: `string`

指定状态键。

• **break\_?**: `boolean`

是否需要中断当前播放的状态（状态运行中断的前提下）。

#### Returns

`number`

返回值：-1-无效操作、0-立即播放、1-下次播放、2-等待播放。

***

### Init()

> **Init**(`states`, `triggers`): `void`

初始化动画状态机。

#### Parameters

• **states**: [`AnimationState`](../interfaces/AnimationState.md)[]

状态节点列表。

• **triggers**: [`AnimationTrigger`](../interfaces/AnimationTrigger.md)[]

状态触发器列表。

#### Returns

`void`

***

### Trigger()

> **Trigger**(`type`, `code`): `void`

触发状态触发器。

#### Parameters

• **type**: `"timeout"` \| `"key_down"` \| `"key_up"` \| `"mouse_down"` \| `"mouse_up"`

事件类型。

• **code**: `number`

触发器识别码。

#### Returns

`void`

***

### Update()

> **Update**(): `void`

更新动画播放状态。

#### Returns

`void`
