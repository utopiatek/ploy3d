[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / MaterialPropTypeDesc

# Interface: MaterialPropTypeDesc

材质属性类型描述。

## Properties

### default\_

> `readonly` **default\_**: `number`[]

默认值。

***

### format

> `readonly` **format**: [`PropFormat`](../enumerations/PropFormat.md)

格式枚举。

***

### signGLSL

> `readonly` **signGLSL**: `string`

GLSL签名。

***

### signWGSL

> `readonly` **signWGSL**: `string`

WGSL签名。

***

### size

> `readonly` **size**: `number`

字节大小。

***

### texture\_dim?

> `readonly` `optional` **texture\_dim**: `GPUTextureViewDimension`

贴图纬度（贴图属性特有）。

***

### texture\_type?

> `readonly` `optional` **texture\_type**: `GPUTextureSampleType`

贴图像素类型（贴图属性特有）。

***

### type

> `readonly` **type**: [`PropType`](../enumerations/PropType.md)

类型枚举。
