[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / AnimationTrigger

# Interface: AnimationTrigger

动画状态触发器。

## Properties

### code

> **code**: `number`

响应事件代码（在相同事件类型下识别不同触发器）。

***

### desc

> **desc**: `string`

触发器描述。

***

### enter

> **enter**: `string`

触发动画状态键。

***

### hold?

> `optional` **hold**: `string`

设置指定状态保持标志。

***

### type

> **type**: `"timeout"` \| `"key_down"` \| `"key_up"` \| `"mouse_down"` \| `"mouse_up"`

响应事件类型。

***

### unhold?

> `optional` **unhold**: `string`

取消指定状态保持标记。
