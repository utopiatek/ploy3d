[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Shader

# Interface: Shader

着色器。

## Extends

- [`PropLayout`](PropLayout.md)

## Properties

### asset

> **asset**: [`ShaderAsset`](ShaderAsset.md)

着色器资产。

***

### branchKeys

> **branchKeys**: `string`[]

分支健数组。

***

### custom\_g3?

> `optional` **custom\_g3**: `GPUBindGroupLayout`

自定义GPU资源绑定组布局实例G3。

#### Inherited from

[`PropLayout`](PropLayout.md).[`custom_g3`](PropLayout.md#custom_g3)

***

### fscode

> **fscode**: `string`

资源绑定组代码。

#### Inherited from

[`PropLayout`](PropLayout.md).[`fscode`](PropLayout.md#fscode)

***

### group

> **group**: `number`

资源组索引。

#### Inherited from

[`PropLayout`](PropLayout.md).[`group`](PropLayout.md#group)

***

### id

> **id**: `number`

着色器ID。

***

### layout?

> `optional` **layout**: `GPUBindGroupLayout`

GPU资源绑定组布局实例。

#### Inherited from

[`PropLayout`](PropLayout.md).[`layout`](PropLayout.md#layout)

***

### module?

> `optional` **module**: `GPUShaderModule`[]

分别存储编译后的顶点、片元、计算着色器模块。

***

### name

> **name**: `string`

着色器唯一名称。

***

### refCount

> **refCount**: `number`

着色器引用计数。

***

### tuple

> **tuple**: [`PropTuple`](PropTuple.md)

资源绑定组属性元组。

#### Inherited from

[`PropLayout`](PropLayout.md).[`tuple`](PropLayout.md#tuple)

***

### vscode

> **vscode**: `string`

资源绑定组代码。

#### Inherited from

[`PropLayout`](PropLayout.md).[`vscode`](PropLayout.md#vscode)
