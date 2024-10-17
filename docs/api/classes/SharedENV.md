[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / SharedENV

# Class: SharedENV

共享数据环境。

## Constructors

### new SharedENV()

> **new SharedENV**(`_global`): [`SharedENV`](SharedENV.md)

构造函数。

#### Parameters

• **\_global**: `Ploy3D`

模块实例对象。

#### Returns

[`SharedENV`](SharedENV.md)

## Accessors

### buffer

> `get` **buffer**(): `ArrayBuffer`

系统内存空间。

#### Returns

`ArrayBuffer`

***

### bufferView

> `get` **bufferView**(): `ArrayBufferView`

系统内存空间视图。

#### Returns

`ArrayBufferView`

***

### defaultG2

> `get` **defaultG2**(): `never`

默认材质指针。

> `set` **defaultG2**(`g2`): `void`

#### Parameters

• **g2**: `never`

#### Returns

`never`

***

### frameTS

> `get` **frameTS**(): `number`

系统帧时间戳。

#### Returns

`number`

***

### gisState

> `get` **gisState**(): `number`

当前GIS状态：0-不启用GIS，1-启用一般GIS，2-启用带地形GIS。

#### Returns

`number`

***

### gisTS

> `get` **gisTS**(): `number`

世界坐标原点经纬度或者地形启用状态更新时间戳。

#### Returns

`number`

***

### reversedZ

> `get` **reversedZ**(): `number`

是否翻转相机Z值。

#### Returns

`number`

***

### sizeG0

> `get` **sizeG0**(): `number`

G0常量缓存大小。

#### Returns

`number`

***

### sizeG1

> `get` **sizeG1**(): `number`

G1常量缓存大小。

#### Returns

`number`

***

### textDecoder

> `get` **textDecoder**(): `TextDecoder`

字符串解码器。

#### Returns

`TextDecoder`

***

### textEncoder

> `get` **textEncoder**(): `TextEncoder`

字符串编码器。

#### Returns

`TextEncoder`

***

### ubufferAlign

> `get` **ubufferAlign**(): `number`

统一缓存动态偏移地址对齐。

#### Returns

`number`

***

### ubufferSize

> `get` **ubufferSize**(): `number`

统一缓存大小。

#### Returns

`number`

***

### utextureSize

> `get` **utextureSize**(): `number`

统一贴图大小。

#### Returns

`number`

***

### webGL

> `get` **webGL**(): `number`

是否使用WebGL API。

#### Returns

`number`

***

### worldLngLat

> `get` **worldLngLat**(): `Float32Array`

当前世界坐标原点经纬度和墨卡托坐标。

#### Returns

`Float32Array`

## Methods

### AllocaCall()

> **AllocaCall**(`size`, `func`): `void`

在栈上分配空间后调用方法（栈空间在共享内存头部，所以地址永远不会大于4G）。

#### Parameters

• **size**: `number`

• **func**

#### Returns

`void`

***

### arrayGet()

> **arrayGet**(`type`, `ptr`, `intOffset`, `count`): `ArrayLike`\<`number`\>

读取指定类型数组数据（不允许读取字节类型数组）。

#### Parameters

• **type**: `number`

• **ptr**: `never`

• **intOffset**: `number`

• **count**: `number`

#### Returns

`ArrayLike`\<`number`\>

***

### arraySet()

> **arraySet**(`type`, `ptr`, `intOffset`, `data`): `void`

写入指定类型数组数据（不允许写入字节类型数组）。

#### Parameters

• **type**: `number`

• **ptr**: `never`

• **intOffset**: `number`

• **data**: `ArrayLike`\<`number`\>

#### Returns

`void`

***

### bufferSet1()

> **bufferSet1**(`ptr`, `buffer`, `byteOffset`, `byteLength`): `void`

写入字节缓存数据（数据大小不一定是四字节对齐，须保证地址不越界4G空间）。

#### Parameters

• **ptr**: `never`

• **buffer**: `ArrayBuffer`

• **byteOffset**: `number`

• **byteLength**: `number`

#### Returns

`void`

***

### Dispose()

> **Dispose**(): `Promise`\<`void`\>

清除对象。

#### Returns

`Promise`\<`void`\>

***

### farrayGet()

> **farrayGet**(`ptr`, `intOffset`, `count`): `Float32Array`

读取浮点型数组数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **count**: `number`

#### Returns

`Float32Array`

***

### farrayRef()

> **farrayRef**(`ptr`, `intOffset`, `count`): `Float32Array`

引用浮点型数组数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **count**: `number`

#### Returns

`Float32Array`

***

### farraySet()

> **farraySet**(`ptr`, `intOffset`, `data`): `void`

写入浮点型数组数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **data**: `ArrayLike`\<`number`\>

#### Returns

`void`

***

### fscalarGet()

> **fscalarGet**(`ptr`, `intOffset`): `number`

读取浮点型数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

#### Returns

`number`

***

### fscalarSet()

> **fscalarSet**(`ptr`, `intOffset`, `value`): `void`

写入浮点型数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **value**: `number`

#### Returns

`void`

***

### guidGet()

> **guidGet**(): `string`

生成GUID。

#### Returns

`string`

***

### Init()

> **Init**(`buffer`, `ptr`): `Promise`\<[`SharedENV`](SharedENV.md)\>

初始化共享数据环境接口。

#### Parameters

• **buffer**: `ArrayBuffer`

内核内存。

• **ptr**: `never`

共享环境变量数据指针。

#### Returns

`Promise`\<[`SharedENV`](SharedENV.md)\>

返回共享数据环境接口。

***

### iscalarGet()

> **iscalarGet**(`ptr`, `intOffset`): `number`

读取整型数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

#### Returns

`number`

***

### iscalarSet()

> **iscalarSet**(`ptr`, `intOffset`, `value`): `void`

写入整型数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **value**: `number`

#### Returns

`void`

***

### path\_guidGet()

> **path\_guidGet**(): `object`

生成日期和GUID构成的路径。

#### Returns

`object`

##### guid

> **guid**: `string`

##### path

> **path**: `string`

***

### Printf()

> **Printf**(`sys`, `bufsize`, `format`, `argv`): `number`

格式化C字符串（参数sys、format、argv均为地址）。

#### Parameters

• **sys**: `number`

• **bufsize**: `number`

• **format**: `number`

• **argv**: `number`

#### Returns

`number`

***

### ptrCreate()

> **ptrCreate**(`ptr`): `never`

数据指针构造。

#### Parameters

• **ptr**: `number`

#### Returns

`never`

***

### ptrGet()

> **ptrGet**(`ptr`, `intOffset`): `never`

读取指针数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

#### Returns

`never`

***

### ptrMove()

> **ptrMove**(`ptr`, `intOffset`): `never`

数据指针移动。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

#### Returns

`never`

***

### ptrSet()

> **ptrSet**(`ptr`, `intOffset`, `value`): `void`

写入指针数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **value**: `never`

#### Returns

`void`

***

### ptrValid()

> **ptrValid**(`ptr`): `boolean`

数据指针是否有效。

#### Parameters

• **ptr**: `never`

#### Returns

`boolean`

***

### ptrValue()

> **ptrValue**(`ptr`): `number`

数据指针值（以4字节为单位的地址）。

#### Parameters

• **ptr**: `never`

#### Returns

`number`

***

### ptrZero()

> **ptrZero**(): `never`

数据指针默认值。

#### Returns

`never`

***

### Reinit()

> **Reinit**(`buffer`): `void`

重新设置共享数据环境接口。

#### Parameters

• **buffer**: `ArrayBuffer`

内核内存。

#### Returns

`void`

***

### stringGet()

> **stringGet**(`ptr`): `string`

读取字符串数据（遇0结束）。

#### Parameters

• **ptr**: `never`

#### Returns

`string`

***

### stringSet()

> **stringSet**(`ptr`, `intOffset`, `value`, `maxLength`?): `void`

写入字符串数据（以0结束）。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **value**: `string`

• **maxLength?**: `number`

#### Returns

`void`

***

### Tick()

> **Tick**(`gisState`, `worldLngLat`): `void`

系统时间滴答。

#### Parameters

• **gisState**: `number`

• **worldLngLat**: [`number`, `number`, `number`, `number`]

#### Returns

`void`

***

### uarrayGet()

> **uarrayGet**(`ptr`, `intOffset`, `count`): `Uint32Array`

读取无符号整型数组数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **count**: `number`

#### Returns

`Uint32Array`

***

### uarrayRef()

> **uarrayRef**(`ptr`, `intOffset`, `count`): `Uint32Array`

引用无符号整型数组数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **count**: `number`

#### Returns

`Uint32Array`

***

### uarraySet()

> **uarraySet**(`ptr`, `intOffset`, `data`): `void`

写入无符号整型数组数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **data**: `ArrayLike`\<`number`\>

#### Returns

`void`

***

### uscalarGet()

> **uscalarGet**(`ptr`, `intOffset`): `number`

读取无符号整型数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

#### Returns

`number`

***

### uscalarSet()

> **uscalarSet**(`ptr`, `intOffset`, `value`): `void`

写入无符号整型数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **value**: `number`

#### Returns

`void`

***

### uuidDec()

> **uuidDec**(`uuid`): `number`[]

解码UUID字符串。

#### Parameters

• **uuid**: `string`

#### Returns

`number`[]

***

### uuidEnc()

> **uuidEnc**(`uuid`): `string`

编码UUID为字符串。

#### Parameters

• **uuid**: `ArrayLike`\<`number`\>

#### Returns

`string`

***

### uuidGen()

> **uuidGen**(): `Promise`\<`string`\>

生成基于注册用户的UUID。

#### Returns

`Promise`\<`string`\>

***

### uuidGet()

> **uuidGet**(`ptr`, `intOffset`): `string`

读取UUID字符串数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

#### Returns

`string`

***

### uuidSet()

> **uuidSet**(`ptr`, `intOffset`, `value`): `void`

写入UUID字符串数据。

#### Parameters

• **ptr**: `never`

• **intOffset**: `number`

• **value**: `string`

#### Returns

`void`
