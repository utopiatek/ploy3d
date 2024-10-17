[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / RENDER\_FLAGS

# Enumeration: RENDER\_FLAGS

渲染设置标记。

## Enumeration Members

### ATTRIBUTES0

> **ATTRIBUTES0**: `1`

包含顶点缓存布局0中定义的顶点属性（坐标、法线、切线、UV）。

***

### ATTRIBUTES1

> **ATTRIBUTES1**: `2`

包含顶点缓存布局1中定义的顶点属性（骨骼索引、骨骼权重）。

***

### ATTRIBUTES2

> **ATTRIBUTES2**: `4`

包含顶点缓存布局2中定义的顶点属性（保留，未使用）。

***

### BLEND\_MODE\_INDEX

> **BLEND\_MODE\_INDEX**: `28`

最高4位记录混合模式索引。

***

### CAST\_SHADOWS

> **CAST\_SHADOWS**: `16`

投射阴影。

***

### DRAW\_ARRAYS

> **DRAW\_ARRAYS**: `8`

使用DrawArrays方法绘制材质，该方法绘制不依赖顶点缓存和索引缓存，材质必须包含drawCount属性。

***

### HAS\_ANISOTROPY

> **HAS\_ANISOTROPY**: `134217728`

启用各向异性效果。

***

### HAS\_CLEAR\_COAT

> **HAS\_CLEAR\_COAT**: `67108864`

启用清漆层效果。

***

### HAS\_DOUBLE\_SIDED

> **HAS\_DOUBLE\_SIDED**: `8388608`

启用双面渲染。

***

### HAS\_EMISSIVE

> **HAS\_EMISSIVE**: `16777216`

启用自发光效果。

***

### HAS\_REFLECTIONS

> **HAS\_REFLECTIONS**: `33554432`

启用反射效果。

***

### MORPHING

> **MORPHING**: `128`

子网格形变。

***

### RECEIVE\_SHADOWS

> **RECEIVE\_SHADOWS**: `32`

接收阴影。

***

### SKINNING

> **SKINNING**: `64`

骨骼蒙皮。
