[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / BLEND\_MODE

# Enumeration: BLEND\_MODE

材质混合模式。

## Enumeration Members

### ADD

> **ADD**: `4`

开启混合，采用预乘不透明度，执行混合操作RGB_target = RGB_src + RGB_target；
用于火焰、蒸气、全息等效果；

***

### FADE

> **FADE**: `3`

开启混合，与BLEND_MODE_TRANSPARENT模式类似；
参数material.baseColor的值是预乘不透明度的，所以不透明度影响了散射率和反射率，从而影响光照效果；
该模式将消除baseColor的预乘，不透明度在不影响光照计算结果的情况下实现对象渐隐渐显的效果；

***

### MASKED

> **MASKED**: `1`

禁用混合，启用alpha测试，在不透明渲染通道中使用，透明顺序无关，当alpha值小于阈值时，片元被丢弃，否则写入片元颜色；
启用ALPHA_TO_COVERAGE标记可以使内部颜色根据不透明度平滑过渡到边缘，设置GPUMultisampleState.alphaToCoverageEnabled启用；
Alpha to coverage是基于MSAA的技术，A值会影响样点遮挡信息（coverage）的计算，从而影响写入的颜色比例；

***

### MULTIPLY

> **MULTIPLY**: `5`

开启混合，采用预乘不透明度，执行混合操作RGB_target = RGB_src * RGB_target；
使渲染缓存内容变暗，用于某些粒子效果；

***

### OPAQUE

> **OPAQUE**: `0`

禁用混合，A通道被忽略，用于渲染不透明对象。

***

### SCREEN

> **SCREEN**: `6`

开启混合，采用预乘不透明度，执行混合操作RGB_target += RGB_src * (1.0 - RGB_target)；
使渲染缓存内容变亮；

***

### TRANSPARENT

> **TRANSPARENT**: `2`

开启混合，该混合模式采用预乘不透明度；
RGB_target = (A_src * RGB_src) + (A_target * RGB_target) * (1.0 - A_src)；A * RGB即为预乘不透明度；
渲染目标是预乘的、片元也是预乘的，硬件执行混合操作RGB_target = RGB_src + RGB_target * (1.0 - A_src)，其结果也是预乘的；
所以仅需要保证初始渲染目标状态是预乘的，写入的片元也是预乘的即可保证混合效果一致；
