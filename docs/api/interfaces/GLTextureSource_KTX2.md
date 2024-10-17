[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / GLTextureSource\_KTX2

# Interface: GLTextureSource\_KTX2

贴图数据源（KTX）。

## Properties

### buffer

> `readonly` **buffer**: `SharedArrayBuffer` \| `BufferSource`

数据缓存（依次存储各层级各张贴图压缩数据）。

***

### count

> `readonly` **count**: `number`

贴图实例数量（目前仅支持1个贴图实例）。

***

### dataOffset

> `readonly` **dataOffset**: `number`

数据缓存偏移。

***

### depth

> `readonly` **depth**: `number`

贴图层数（非贴图数组为1，每层可能是2D贴图或CUBE贴图）。

***

### faces

> `readonly` **faces**: `number`

贴图面数（2D:1、CUBE:6，每个面都包含多个MIP层级数）。

***

### format

> `readonly` **format**: `number`

贴图像素格式。

***

### hasAlpha

> `readonly` **hasAlpha**: `number`

贴图像素是否包含透明通道。

***

### height

> `readonly` **height**: `number`

贴图像素高度。

***

### layer?

> `optional` **layer**: `number`

数据写入层偏移。

***

### level?

> `optional` **level**: `number`

数据写入LOD偏移。

***

### levelCount

> `readonly` **levelCount**: `number`

贴图细节级别数。

***

### levelInfos

> `readonly` **levelInfos**: `object`[]

贴图各MIP层级信息。

***

### width

> `readonly` **width**: `number`

贴图像素宽度。

***

### xoffset?

> `optional` **xoffset**: `number`

数据写入列偏移。

***

### yoffset?

> `optional` **yoffset**: `number`

数据写入行偏移。
