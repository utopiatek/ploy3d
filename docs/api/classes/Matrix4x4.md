[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Matrix4x4

# Class: Matrix4x4

四阶矩阵。

## Constructors

### new Matrix4x4()

> **new Matrix4x4**(`impl`, `values`): [`Matrix4x4`](Matrix4x4.md)

构造函数。

#### Parameters

• **impl**: [`VMath_kernel`](VMath_kernel.md)

• **values**: `ArrayLike`\<`number`\>

矩阵值。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

## Accessors

### inverse

> `get` **inverse**(): [`Matrix4x4`](Matrix4x4.md)

矩阵的逆。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

***

### values

> `get` **values**(): `number`[]

矩阵值。

#### Returns

`number`[]

## Methods

### Compose()

> **Compose**(`pos`, `rot`, `scale`): [`Matrix4x4`](Matrix4x4.md)

构建模型到世界变换矩阵。

#### Parameters

• **pos**: [`Vector3`](Vector3.md)

模型坐标。

• **rot**: [`Quaternion`](Quaternion.md)

模型旋转四元数。

• **scale**: [`Vector3`](Vector3.md)

模型缩放。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

返回变换矩阵。

***

### Multiply()

> **Multiply**(`m`): [`Matrix4x4`](Matrix4x4.md)

左乘矩阵。

#### Parameters

• **m**: [`Matrix4x4`](Matrix4x4.md)

乘数矩阵。

#### Returns

[`Matrix4x4`](Matrix4x4.md)

返回结果矩阵。

***

### MultiplyVector3()

> **MultiplyVector3**(`homogeneous`, `v`): [`Vector3`](Vector3.md)

矩阵变换向量。

#### Parameters

• **homogeneous**: `number`

向量齐次分量。

• **v**: [`Vector3`](Vector3.md)

三维向量。

#### Returns

[`Vector3`](Vector3.md)
