[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / AnimationState

# Interface: AnimationState

动画状态机状态。

## Properties

### animation

> **animation**: `object`

当前状态动画设置。

#### clip

> **clip**: `number`

动画片段索引。

#### loop

> **loop**: `boolean`

状态结束前动画是否循环播放。

#### span

> **span**: `number`

持续时间长度（毫秒）。

#### start

> **start**: `number`

起始关键帧时间戳。

***

### can\_break

> **can\_break**: `boolean`

是否允许打断当前状态。

***

### can\_speedup

> **can\_speedup**: `number`

是否允许加速播放以尽快结束当前状态（大于1时有效）。

***

### key

> **key**: `string`

状态键（唯一，用于状态查找）。

***

### next

> **next**: `string`

当前状态结束后建议的下一状态。

***

### nexts

> **nexts**: `string`[]

可以从当前状态切换到的下一状态列表。

***

### parallels

> **parallels**: `string`[]

可以从当前状态触发并能并行播放的状态列表。
