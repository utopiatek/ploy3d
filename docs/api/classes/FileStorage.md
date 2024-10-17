[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / FileStorage

# Class: FileStorage

文件存储器。

## Constructors

### new FileStorage()

> **new FileStorage**(`_global`, `root`?): [`FileStorage`](FileStorage.md)

构造函数。

#### Parameters

• **\_global**: [`Ploy3D`](Ploy3D.md)

引擎实例。

• **root?**: `FileSystemDirectoryHandle`

根路径句柄。

#### Returns

[`FileStorage`](FileStorage.md)

## Methods

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### GetDir()

> **GetDir**(`path`, `uncreate`?): `Promise`\<`FileSystemDirectoryHandle`\>

获取指定相对路径句柄。

#### Parameters

• **path**: `string`

指定相对路径（以'/'分隔）。

• **uncreate?**: `boolean`

#### Returns

`Promise`\<`FileSystemDirectoryHandle`\>

返回路径句柄。

***

### HasFile()

> **HasFile**(`path`, `filename`): `Promise`\<`boolean`\>

判断指定相对路径下是否存在指定文件。

#### Parameters

• **path**: `string`

指定相对路径（以'/'分隔）。

• **filename**: `string`

指定文件名。

#### Returns

`Promise`\<`boolean`\>

存在时返回真。

***

### Map()

> **Map**\<`T`\>(`path`, `tochildren`, `callbackfn`): `Promise`\<`T`[]\>

遍历处理指定相对路径下的内容。

#### Type Parameters

• **T**

#### Parameters

• **path**: `string`

指定相对路径（以'/'分隔）。

• **tochildren**: `boolean`

是否往子级路径遍历。

• **callbackfn**

处理方法。

#### Returns

`Promise`\<`T`[]\>

返回遍历处理生成的数组。

***

### ReadFile()

> **ReadFile**\<`T`\>(`path`, `filename`, `type`): `Promise`\<`any`\>

读取文件存储器中指定相对路径文件数据。

#### Type Parameters

• **T**

#### Parameters

• **path**: `string`

指定相对路径（以'/'分隔）。

• **filename**: `string`

文件名称。

• **type**: `"text"` \| `"json"` \| `"arrayBuffer"`

文件类型。

#### Returns

`Promise`\<`any`\>

返回文件数据。

***

### WriteFile()

> **WriteFile**(`path`, `filename`, `data`): `Promise`\<`void`\>

向文件存储器中指定相对路径覆盖写入文件。

#### Parameters

• **path**: `string`

指定相对路径（以'/'分隔）。

• **filename**: `string`

文件名称，如果已存在将被覆盖。

• **data**: `string` \| `BufferSource` \| `Blob`

文件数据。

#### Returns

`Promise`\<`void`\>
