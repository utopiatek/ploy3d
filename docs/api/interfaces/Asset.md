[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Asset

# Interface: Asset

资源描述符基类。

## Extended by

- [`Asset_shader`](Asset_shader.md)
- [`Asset_texture`](Asset_texture.md)
- [`Asset_material`](Asset_material.md)
- [`Asset_mesh`](Asset_mesh.md)
- [`Asset_meshrenderer`](Asset_meshrenderer.md)
- [`Asset_light`](Asset_light.md)
- [`Asset_animations`](Asset_animations.md)
- [`Asset_prefab`](Asset_prefab.md)

## Properties

### classid

> **classid**: `number`

资源类型ID。

***

### label

> **label**: `string`

用户可理解的外部标签。

***

### name

> **name**: `string`

内部名称（同级唯一，优先使用名称在同级中查找）。

***

### uuid

> **uuid**: `string`

全局唯一ID。
