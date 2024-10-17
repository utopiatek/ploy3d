[**Ploy3D**](../README.md) • **Docs**

***

[Ploy3D](../README.md) / CLASSID

# Enumeration: CLASSID

类型ID。

## Enumeration Members

### ASSET\_ANIMATIONS

> **ASSET\_ANIMATIONS**: `41`

动画数据。

***

### ASSET\_ANIMATIONS\_DATA

> **ASSET\_ANIMATIONS\_DATA**: `40`

动画数据（BIN，数据文件）。

***

### ASSET\_COMPONENT\_ANIMATOR

> **ASSET\_COMPONENT\_ANIMATOR**: `51`

动画组件（JSON，描述文件，引用ASSET_ANIMATION_DATA、ASSET_COMPONENT_MESH_RENDERER）。

***

### ASSET\_COMPONENT\_CAMERA

> **ASSET\_COMPONENT\_CAMERA**: `49`

相机组件（JSON，描述文件）。

***

### ASSET\_COMPONENT\_LIGHT

> **ASSET\_COMPONENT\_LIGHT**: `50`

光源组件（JSON，描述文件）。

***

### ASSET\_COMPONENT\_MESH\_RENDERER

> **ASSET\_COMPONENT\_MESH\_RENDERER**: `48`

网格渲染器组件（JSON，描述文件，引用SE_SKELETON、SE_MESH、SE_MATERIAL）。

***

### ASSET\_COMPONENT\_PANORAMA

> **ASSET\_COMPONENT\_PANORAMA**: `53`

全景图组件（JSON，描述文件）。

***

### ASSET\_COMPONENT\_VOLUME

> **ASSET\_COMPONENT\_VOLUME**: `52`

体积组件（JSON，描述文件）。

***

### ASSET\_CUSTOM

> **ASSET\_CUSTOM**: `16`

自定义资源。

***

### ASSET\_FRAME\_UNIFORMS

> **ASSET\_FRAME\_UNIFORMS**: `21`

着色器资源组G0（JSON，描述文件）。

***

### ASSET\_MATERIAL

> **ASSET\_MATERIAL**: `32`

材质资源（JSON，描述文件，引用ASSET_SHADER，包含贴图描述符）。

***

### ASSET\_MESH

> **ASSET\_MESH**: `39`

网格资源（JSON，描述文件，引用ASSET_MESH_GEOMETRY、ASSET_MESH_UVSET、ASSET_MESH_DATA、ASSET_SKIN、ASSET_MORPH）。

***

### ASSET\_MESH\_DATA

> **ASSET\_MESH\_DATA**: `38`

网格数据（BIN，数据文件）。

***

### ASSET\_MESH\_GEOMETRY

> **ASSET\_MESH\_GEOMETRY**: `36`

几何数据（BIN，数据文件）。

***

### ASSET\_MESH\_UVSET

> **ASSET\_MESH\_UVSET**: `37`

几何UV数据（BIN，数据文件）。

***

### ASSET\_MORPH

> **ASSET\_MORPH**: `35`

网格变形数据（BIN，数据文件）。

***

### ASSET\_OBJECT

> **ASSET\_OBJECT**: `67`

3D对象（JSON，描述文件）。

***

### ASSET\_PACKAGE

> **ASSET\_PACKAGE**: `64`

资源包（JSON，描述文件）。

***

### ASSET\_PREFAB

> **ASSET\_PREFAB**: `65`

预制件定义数据（JSON，描述文件，3D模组）。

***

### ASSET\_SCENE

> **ASSET\_SCENE**: `66`

3D场景（BIN，数据文件，类似于ASSET_PREFAB，但以二进制形式保存，不可作为预制件使用）。

***

### ASSET\_SHADER

> **ASSET\_SHADER**: `17`

着色器资源（JSON，描述文件，引用ASSET_SHADER_GRAPH和ASSET_SHADER_CODE）。

***

### ASSET\_SHADER\_CODE

> **ASSET\_SHADER\_CODE**: `20`

着色器代码（WGSL，代码文件）。

***

### ASSET\_SHADER\_GRAPH

> **ASSET\_SHADER\_GRAPH**: `18`

着色器图（JSON，数据文件，可解析为着色器资源）。

***

### ASSET\_SKELETON

> **ASSET\_SKELETON**: `33`

骨架定义数据（BIN，数据文件）。

***

### ASSET\_SKIN

> **ASSET\_SKIN**: `34`

蒙皮数据（BIN，数据文件）。

***

### ASSET\_TEXTURE\_1D

> **ASSET\_TEXTURE\_1D**: `24`

一维贴图资源（JSON，描述文件，引用图像数据文件）。

***

### ASSET\_TEXTURE\_2D

> **ASSET\_TEXTURE\_2D**: `25`

二维贴图资源（JSON，描述文件，引用图像数据文件。可以是贴图数组）。

***

### ASSET\_TEXTURE\_3D

> **ASSET\_TEXTURE\_3D**: `27`

三维贴图资源（JSON，描述文件，引用图像数据文件）。

***

### ASSET\_TEXTURE\_CUBE

> **ASSET\_TEXTURE\_CUBE**: `26`

立方体贴图资源（JSON，描述文件，引用图像数据文件。可以是贴图数组）。

***

### ASSET\_TEXTURE\_FILE

> **ASSET\_TEXTURE\_FILE**: `29`

图像数据文件。

***

### ASSET\_TEXTURE\_RT

> **ASSET\_TEXTURE\_RT**: `28`

渲染贴图资源（JSON，描述文件，引用图像数据文件，可以是贴图数组）。

***

### GPU\_BIND\_GROUP

> **GPU\_BIND\_GROUP**: `12`

GPU资源组绑定对象（一组资源实例）。

***

### GPU\_INDEX\_BUFFER

> **GPU\_INDEX\_BUFFER**: `3`

GPU索引缓存。

***

### GPU\_INDIRECT\_BUFFER

> **GPU\_INDIRECT\_BUFFER**: `5`

GPU绘制指令参数缓存（用于drawIndirect、drawIndexedIndirect、dispatchWorkgroupsIndirect，在WebGL中不支持）。

***

### GPU\_PIPELINE

> **GPU\_PIPELINE**: `13`

GPU管线（包括渲染管线和计算管线）。

***

### GPU\_SAMPLER

> **GPU\_SAMPLER**: `11`

GPU贴图采样器。

***

### GPU\_STORAGE\_BUFFER

> **GPU\_STORAGE\_BUFFER**: `4`

GPU存储缓存（用于计算着色器的输入输出，在WebGL中不支持）。

***

### GPU\_TEXTURE\_1D

> **GPU\_TEXTURE\_1D**: `6`

GPU一维贴图。

***

### GPU\_TEXTURE\_2D

> **GPU\_TEXTURE\_2D**: `7`

GPU二维贴图（可以是数组）。

***

### GPU\_TEXTURE\_3D

> **GPU\_TEXTURE\_3D**: `9`

GPU三维贴图。

***

### GPU\_TEXTURE\_CUBE

> **GPU\_TEXTURE\_CUBE**: `8`

GPU立方体贴图（可以是数组）。

***

### GPU\_TEXTURE\_RT

> **GPU\_TEXTURE\_RT**: `10`

GPU渲染贴图（可以是数组）。

***

### GPU\_UNIFORM\_BUFFER

> **GPU\_UNIFORM\_BUFFER**: `1`

GPU常量缓存。

***

### GPU\_VERTEX\_BUFFER

> **GPU\_VERTEX\_BUFFER**: `2`

GPU顶点缓存。

***

### INVALID

> **INVALID**: `0`

无效类型。
