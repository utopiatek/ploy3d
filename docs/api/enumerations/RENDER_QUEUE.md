[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / RENDER\_QUEUE

# Enumeration: RENDER\_QUEUE

渲染队列，默认由远及近排序渲染，以此降低写入和测试的开销，数值越低越优先渲染。

## Enumeration Members

### ALPHA\_TEST

> **ALPHA\_TEST**: `2450`

需要开启透明度测试的不透明几何。

***

### BACKGROUND

> **BACKGROUND**: `1000`

背景，天空盒。

***

### GEOMETRY

> **GEOMETRY**: `2000`

默认，绝大多数，不透明几何。

***

### OVERLAY

> **OVERLAY**: `4000`

叠加效果，比如镜头光晕。

***

### TRANSPARENT

> **TRANSPARENT**: `3000`

透明几何，按照从后向前的顺序渲染。
