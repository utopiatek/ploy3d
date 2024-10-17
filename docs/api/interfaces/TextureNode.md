[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / TextureNode

# Interface: TextureNode

贴图资源引用节点。

## Properties

### color?

> `optional` **color**: `number`[]

缺省贴图默认颜色值（RGBA[0, 255]）。

***

### sampler?

> `optional` **sampler**: `GPUSamplerDescriptor`

采样器设置。

***

### texture?

> `optional` **texture**: [`Texture`](../classes/Texture.md)

贴图资源实例。

***

### uri?

> `optional` **uri**: `string`

贴图资源URI（texture、uri二选一，均未设置则清除材质当前贴图属性）。

***

### uvts?

> `optional` **uvts**: `number`[]

纹理采样时UV的平移和缩放。
