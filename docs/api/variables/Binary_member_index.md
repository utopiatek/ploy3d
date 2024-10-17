[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / Binary\_member\_index

# Variable: Binary\_member\_index

> `const` **Binary\_member\_index**: `object`

资源基类（48字节）。

## Type declaration

### byteSize

> `readonly` **byteSize**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源数据字节大小。

### id

> `readonly` **id**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源实例ID。

### last

> `readonly` **last**: [`Kernel_member`](../type-aliases/Kernel_member.md)

上一个资源实例指针。

### magic

> `readonly` **magic**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源数据格式标识（MAGIC_INVALID + CLASSID）。

### next

> `readonly` **next**: [`Kernel_member`](../type-aliases/Kernel_member.md)

下一个资源实例指针。

### readTS

> `readonly` **readTS**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源实例数据使用时间戳（不同资源类型使用含义不同，注意区分）。

### refCount

> `readonly` **refCount**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源实例引用计数。

### uuid

> `readonly` **uuid**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源UUID。

### version

> `readonly` **version**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源数据格式版本号。

### writeTS

> `readonly` **writeTS**: [`Kernel_member`](../type-aliases/Kernel_member.md)

资源实例数据更新时间戳（不同资源类型使用含义不同，注意区分）。
