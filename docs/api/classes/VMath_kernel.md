[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / VMath\_kernel

# Class: VMath\_kernel

矢量数学方法内核实现。

## Constructors

### new VMath\_kernel()

> **new VMath\_kernel**(`_global`): [`VMath_kernel`](VMath_kernel.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

#### Returns

[`VMath_kernel`](VMath_kernel.md)

## Properties

### \_global

> **\_global**: [`Ploy3D`](Ploy3D.md)

模块实例对象。

***

### Matrix4x4\_FromTransform()

> **Matrix4x4\_FromTransform**: (`mO`, `posX`, `posY`, `posZ`, `rotX`, `rotY`, `rotZ`, `rotW`, `scaleX`, `scaleY`, `scaleZ`) => `void`

根据变换数据计算模型矩阵。

#### Parameters

• **mO**: `never`

• **posX**: `number`

• **posY**: `number`

• **posZ**: `number`

• **rotX**: `number`

• **rotY**: `number`

• **rotZ**: `number`

• **rotW**: `number`

• **scaleX**: `number`

• **scaleY**: `number`

• **scaleZ**: `number`

#### Returns

`void`

***

### Matrix4x4\_Invert()

> **Matrix4x4\_Invert**: (`m1`, `mO`) => `void`

获取矩阵的逆矩阵。

#### Parameters

• **m1**: `never`

• **mO**: `never`

#### Returns

`void`

***

### Matrix4x4\_MultiplyMatrices()

> **Matrix4x4\_MultiplyMatrices**: (`m1`, `m2`, `mO`) => `void`

左乘矩阵。

#### Parameters

• **m1**: `never`

• **m2**: `never`

• **mO**: `never`

#### Returns

`void`

***

### Matrix4x4\_MultiplyVector()

> **Matrix4x4\_MultiplyVector**: (`m1`, `v1`, `vO`) => `void`

向量左乘矩阵。

#### Parameters

• **m1**: `never`

• **v1**: `never`

• **vO**: `never`

#### Returns

`void`

***

### Quaternion\_FromEulerAngles()

> **Quaternion\_FromEulerAngles**: (`x`, `y`, `z`, `order`) => `number`[]

从欧拉角（内旋顺序，默认102-[Y-X-Z]）转换到四元数，正方向为看向旋转轴方向顺时针旋转。

#### Parameters

• **x**: `number`

• **y**: `number`

• **z**: `number`

• **order**: `number`

#### Returns

`number`[]

***

### Quaternion\_FromVectors()

> **Quaternion\_FromVectors**: (`fromX`, `fromY`, `fromZ`, `toX`, `toY`, `toZ`) => `number`[]

从两个向量方向变换构造四元数。

#### Parameters

• **fromX**: `number`

• **fromY**: `number`

• **fromZ**: `number`

• **toX**: `number`

• **toY**: `number`

• **toZ**: `number`

#### Returns

`number`[]

***

### Quaternion\_Invert()

> **Quaternion\_Invert**: (`x`, `y`, `z`, `w`) => `number`[]

计算四元数的逆。

#### Parameters

• **x**: `number`

• **y**: `number`

• **z**: `number`

• **w**: `number`

#### Returns

`number`[]

***

### Quaternion\_Multiply()

> **Quaternion\_Multiply**: (`x1`, `y1`, `z1`, `w1`, `x2`, `y2`, `z2`, `w2`) => `number`[]

当前四元数乘以参数四元数（q1 * q2 = qO）。

#### Parameters

• **x1**: `number`

• **y1**: `number`

• **z1**: `number`

• **w1**: `number`

• **x2**: `number`

• **y2**: `number`

• **z2**: `number`

• **w2**: `number`

#### Returns

`number`[]

***

### Quaternion\_RotateVector()

> **Quaternion\_RotateVector**: (`qx`, `qy`, `qz`, `qw`, `vx`, `vy`, `vz`) => `number`[]

使用四元数旋转向量。

#### Parameters

• **qx**: `number`

• **qy**: `number`

• **qz**: `number`

• **qw**: `number`

• **vx**: `number`

• **vy**: `number`

• **vz**: `number`

#### Returns

`number`[]

***

### Quaternion\_Slerp()

> **Quaternion\_Slerp**: (`x1`, `y1`, `z1`, `w1`, `x2`, `y2`, `z2`, `w2`, `t`) => `number`[]

两四元数插值。。

#### Parameters

• **x1**: `number`

• **y1**: `number`

• **z1**: `number`

• **w1**: `number`

• **x2**: `number`

• **y2**: `number`

• **z2**: `number`

• **w2**: `number`

• **t**: `number`

#### Returns

`number`[]

***

### Quaternion\_ToEulerAngles()

> **Quaternion\_ToEulerAngles**: (`x`, `y`, `z`, `w`) => `number`[]

转换为欧拉角。

#### Parameters

• **x**: `number`

• **y**: `number`

• **z**: `number`

• **w**: `number`

#### Returns

`number`[]
