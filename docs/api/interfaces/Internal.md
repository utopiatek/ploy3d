[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Internal

# Interface: Internal

内核接口。

## Properties

### \_\_indirect\_function\_table

> **\_\_indirect\_function\_table**: `Table`

间接函数索引表。

***

### \_\_stack\_pointer

> **\_\_stack\_pointer**: `Global`\<keyof `ValueTypeMap`\>

栈指针，向低地址增长。

***

### Engine\_Export()

> **Engine\_Export**: () => `number`[]

导出引擎模块对象实现。

#### Returns

`number`[]

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

***

### System\_Analyse()

> **System\_Analyse**: () => `never`

系统运行状态分析。

#### Returns

`never`

***

### System\_Delete()

> **System\_Delete**: (`ptr`) => `void`

系统堆内存回收方法。

#### Parameters

• **ptr**: `never`

#### Returns

`void`

***

### System\_New()

> **System\_New**: (`size`) => `never`

系统堆内存分配方法。

#### Parameters

• **size**: `number`

#### Returns

`never`

***

### System\_Shutdown()

> **System\_Shutdown**: () => `void`

系统关闭方法。

#### Returns

`void`

***

### System\_Startup()

> **System\_Startup**: (`ptr`) => `never`

系统启动方法。

#### Parameters

• **ptr**: `never`

#### Returns

`never`

***

### Util\_Compress\_lz4()

> **Util\_Compress\_lz4**: (`src`, `dst`, `srcSize`, `dstCapacity`) => `number`

压缩LZ4数据。

#### Parameters

• **src**: `never`

• **dst**: `never`

• **srcSize**: `number`

• **dstCapacity**: `number`

#### Returns

`number`

***

### Util\_Compress\_lzma()

> **Util\_Compress\_lzma**: (`dest`, `destSize`, `src`, `srcSize`) => `number`

压缩LZMA数据。

#### Parameters

• **dest**: `never`

• **destSize**: `number`

• **src**: `never`

• **srcSize**: `number`

#### Returns

`number`

***

### Util\_Decompress\_lz4()

> **Util\_Decompress\_lz4**: (`src`, `dst`, `compressedSize`, `dstCapacity`) => `number`

解压缩LZ4数据。

#### Parameters

• **src**: `never`

• **dst**: `never`

• **compressedSize**: `number`

• **dstCapacity**: `number`

#### Returns

`number`

***

### Util\_Decompress\_lzma()

> **Util\_Decompress\_lzma**: (`dest`, `destSize`, `src`, `drcSize`) => `number`

解压缩LZMA数据。

#### Parameters

• **dest**: `never`

• **destSize**: `number`

• **src**: `never`

• **drcSize**: `number`

#### Returns

`number`

***

### Util\_Free\_ktx2()

> **Util\_Free\_ktx2**: (`ptr`) => `void`

释放压缩纹理数据。

#### Parameters

• **ptr**: `never`

#### Returns

`void`

***

### Util\_Transcoder\_ktx2()

> **Util\_Transcoder\_ktx2**: (`data`, `size`, `format`) => `never`

转换压缩纹理数据。

#### Parameters

• **data**: `never`

• **size**: `number`

• **format**: `number`

#### Returns

`never`

***

### Worker\_CreateMeshData()

> **Worker\_CreateMeshData**: (`geo`) => [`number`, `never`]

创建网格资源文件数据。

#### Parameters

• **geo**: `never`

#### Returns

[`number`, `never`]

***

### Worker\_DecodeCTM()

> **Worker\_DecodeCTM**: (`ctmData`) => [`number`, `never`]

解压CTM网格数据。

#### Parameters

• **ctmData**: `never`

#### Returns

[`number`, `never`]
