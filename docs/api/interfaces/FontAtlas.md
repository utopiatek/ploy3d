[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / FontAtlas

# Interface: FontAtlas

字体图集字符布局数据查找表。
https://github.com/Chlumsky/msdf-atlas-gen

## Properties

### atlas

> **atlas**: `object`

图集纹理的元数据。

#### distanceRange

> **distanceRange**: `number`

距离场精确的像素范围。

#### distanceRangeMiddle

> **distanceRangeMiddle**: `number`

距离场像素范围中值。

#### height

> **height**: `number`

图集纹理的高度。

#### size

> **size**: `number`

在图集纹理中保存字形信息时，1em对应的纹理像素数量。

#### type

> **type**: `string`

距离场的类型。

#### width

> **width**: `number`

图集纹理的宽度。

#### yOrigin

> **yOrigin**: `"top"` \| `"bottom"`

图集纹理的起始行在底部还是顶部。

***

### glyphs

> **glyphs**: `object`[]

包含图集中每个字形（字符）信息的数组。

***

### lut?

> `optional` **lut**: `Record`\<`number`, `number`[]\>

解析后字形数据查找表。

***

### metrics

> **metrics**: `object`

定义应用于所有字符的全局字体度量。

#### ascender

> **ascender**: `number`

超出基线的字形最大高度。

#### descender

> **descender**: `number`

低于基线的字形最大深度。

#### emSize

> **emSize**: `number`

字形的轮廓信息是基于字体设计单位（EM）的。
为了将这些值转换为可用于渲染的坐标，通常需要将这些单位转换为像素单位。
这个转换取决于字体的unitsPerEm和目标渲染的尺寸。
1em等于多少像素取决于使用的字体大小。em是一个相对单位，其值基于当前字体的font-size。
如果当前font-size为16像素：1em = 16px；
h1 { font-size: 20px } 1em == 20px
p { font - size: 16px } 1em == 16px
h1 { font-size: 2em } 这里的h1元素字体像素大小根据父级的font-size决定，大多数浏览器的默认font-size为16像素；
相对根元素字体大小的设置rem，h1 { font-size: 2rem }；
如果属性尺寸要根据元素字体进行缩放（比如字间距），则使用em，否则使用rem是比较好的设计思路。
https://zhuanlan.zhihu.com/p/37956549

#### lineHeight

> **lineHeight**: `number`

两行文本的基线之间的垂直距离。
字形的轮廓通常相对于基线来定义，基线是字体中字符对齐的参考线。
通常，字母的底部在基线上。
字形的top和bottom值表示的是字形最高点和最低点相对于基线的距离。

#### underlineThickness

> **underlineThickness**: `number`

相对于基线的下划线厚度。

#### underlineY

> **underlineY**: `number`

相对于基线的下划线位置。
