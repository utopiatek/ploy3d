[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Signal

# Class: Signal

信号对象。

## Constructors

### new Signal()

> **new Signal**(): [`Signal`](Signal.md)

构造函数。

#### Returns

[`Signal`](Signal.md)

## Methods

### add()

> **add**(`listener`, `context`, `priority`?): `SignalBinding`

添加事件监听器。

#### Parameters

• **listener**: `any`

事件监听器。

• **context**: `any`

事件监听器上下文（事件监听器方法内的this变量）。

• **priority?**: `number`

事件侦听器的优先级（默认值=0，越大越优先）。

#### Returns

`SignalBinding`

***

### addOnce()

> **addOnce**(`listener`, `context`, `priority`?): `SignalBinding`

添加事件监听器（在触发1次后自动移除）。

#### Parameters

• **listener**: `any`

事件监听器。

• **context**: `any`

事件监听器上下文（事件监听器方法内的this变量）。

• **priority?**: `number`

事件侦听器的优先级（默认值=0，越大越优先）。

#### Returns

`SignalBinding`

***

### dispatch()

> **dispatch**(...`params`): `void`

向添加到队列中的所有听众发送/广播信号。

#### Parameters

• ...**params**: `any`

传递给事件监听器的参数列表。

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

销毁当前信号对象。

#### Returns

`void`

***

### forget()

> **forget**(): `void`

遗忘上一次事件派遣的参数列表。

#### Returns

`void`

***

### halt()

> **halt**(): `void`

停止事件的传播，阻止向队列上的下一个侦听器分派。
注意：只应在信号调度期间调用，在调度之前/之后调用它不会影响信号广播。

#### Returns

`void`

***

### has()

> **has**(`listener`, `context`): `boolean`

判断事件监听器是否已经绑定到信号上。

#### Parameters

• **listener**: `any`

事件监听器。

• **context**: `any`

事件监听器上下文（事件监听器方法内的this变量）。

#### Returns

`boolean`

***

### remove()

> **remove**(`listener`, `context`): `any`

移除事件监听器。

#### Parameters

• **listener**: `any`

事件监听器。

• **context**: `any`

事件监听器上下文（事件监听器方法内的this变量）。

#### Returns

`any`

***

### removeAll()

> **removeAll**(): `void`

移除所有事件监听器。

#### Returns

`void`
