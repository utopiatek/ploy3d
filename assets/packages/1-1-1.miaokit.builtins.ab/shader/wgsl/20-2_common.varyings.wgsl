
//------------------------------------------------------------------------------
// 着色器阶段传递变量定义模块通用代码
//------------------------------------------------------------------------------

// 片元输出结构
struct OutputVS {
    // 顶点裁剪空间坐标
    @builtin(position) gl_Position: vec4f,

    // 顶点裁剪空间坐标
    @location(0) clipPosition: vec4f,
    // 顶点在光照空间中的坐标，启用阴影时有效
    @location(1) litPosition: vec4f,
    // 顶点相机空间坐标，VSM时使用W位保存经特殊处理的深度
    @location(2) viewPosition: vec4f,
    // 顶点相机空间法线
    @location(3) viewNormal: vec3f,
    // 顶点相机空间切线，W位保存切线镜像方向
    @location(4) viewTangent: vec4f,
    // 顶点纹理坐标，仅包含一套的情况下是VEC2类型
    @location(5) uv: vec2f,

    // 用户定义属性1
    @interpolate(flat) @location(6) custom1: vec4<i32>,
    // 用户定义属性2
    @location(7) custom2: vec4<f32>,
};

// 片元输入结构
struct InputFS {
    // 片元是否朝向正面
    @builtin(front_facing) gl_FrontFacing: bool,
    
    // 顶点裁剪空间坐标
    @location(0) clipPosition: vec4f,
    // 顶点在光照空间中的坐标，启用阴影时有效
    @location(1) litPosition: vec4f,
    // 顶点相机空间坐标，VSM时使用W位保存经特殊处理的深度
    @location(2) viewPosition: vec4f,
    // 顶点相机空间法线
    @location(3) viewNormal: vec3f,
    // 顶点相机空间切线，W位保存切线镜像方向
    @location(4) viewTangent: vec4f,
    // 顶点纹理坐标，仅包含一套的情况下是VEC2类型
    @location(5) uv: vec2f,
    
    // 用户定义属性1
    @interpolate(flat) @location(6) custom1: vec4<i32>,
    // 用户定义属性2
    @location(7) custom2: vec4<f32>,
};

var<private> gl_FrontFacing: bool = false;

var<private> inputs_depth: f32 = 0.0;
var<private> inputs_position: vec3f = vec3f(0.0);
var<private> inputs_uv: vec2f = vec2f(0.0);
var<private> inputs_geometricNormal: vec3f = vec3f(0.0, 0.0, 1.0);
var<private> inputs_geometricTangent: vec3f = vec3f(1.0, 0.0, 0.0);
var<private> inputs_vftMat: mat3x3f = mat3x3f(1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0);
var<private> inputs_custom1: vec4<i32> = vec4<i32>(0);
var<private> inputs_custom2: vec4<f32> = vec4<f32>(0.0);

fn varyings_init(frag: InputFS) {
    gl_FrontFacing = frag.gl_FrontFacing;

    inputs_depth = frag.viewPosition.w;
    inputs_position = frag.viewPosition.xyz;
    inputs_uv = frag.uv;
    inputs_vftMat[2] = frag.viewNormal;

    if (MATERIAL_NEEDS_TBN) {
        inputs_vftMat[0] = frag.viewTangent.xyz;
        inputs_vftMat[1] = cross(inputs_vftMat[2], inputs_vftMat[0]) * sign(frag.viewTangent.w);
    }

    if (VARIANT_HAS_DOUBLESIDED && gl_FrontFacing) {
        inputs_vftMat[0] = -inputs_vftMat[0];
        inputs_vftMat[1] = -inputs_vftMat[1];
        inputs_vftMat[2] = -inputs_vftMat[2];
    }

    inputs_geometricNormal = normalize(inputs_vftMat[2]);
    inputs_geometricTangent = normalize(inputs_vftMat[0]);

    inputs_custom1 = frag.custom1;
    inputs_custom2 = frag.custom2;
}
