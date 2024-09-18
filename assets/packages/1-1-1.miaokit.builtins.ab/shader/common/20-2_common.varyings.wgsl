
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
    @interpolate(flat) @location(6) instanceData: vec4<u32>,

    // 用户定义属性1
    @interpolate(flat) @location(7) custom1: vec4<i32>,
    // 用户定义属性2
    @location(8) custom2: vec4<f32>,
};

// 片元输入结构
struct InputFS {
    // 片元是否朝向正面
    @builtin(front_facing) gl_FrontFacing: bool,
    // 片元坐标
    @builtin(position) gl_FragCoord: vec4<f32>,
    
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
    @interpolate(flat) @location(6) instanceData: vec4<u32>,

    // 用户定义属性1
    @interpolate(flat) @location(7) custom1: vec4<i32>,
    // 用户定义属性2
    @location(8) custom2: vec4<f32>,
};

var<private> gl_FrontFacing: bool = false;
var<private> gl_FragCoord: vec4f = vec4f(0.0);

var<private> inputs_instanceData: vec4<u32> = vec4<u32>(0u);

var<private> inputs_clipPosition: vec4f = vec4f(0.0);
var<private> inputs_litPosition: vec4f = vec4f(0.0);

var<private> inputs_depth: f32 = 0.0;
var<private> inputs_position: vec3f = vec3f(0.0);
var<private> inputs_uv: vec2f = vec2f(0.0);
var<private> inputs_geometricNormal: vec3f = vec3f(0.0, 0.0, 1.0);
var<private> inputs_geometricTangent: vec3f = vec3f(1.0, 0.0, 0.0);
var<private> inputs_vftMat: mat3x3f = mat3x3f(1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0);
var<private> inputs_custom1: vec4<i32> = vec4<i32>(0);
var<private> inputs_custom2: vec4<f32> = vec4<f32>(0.0);

// 初始化从顶点着色器传输进来的参数
fn varyings_init(frag: InputFS) {
    gl_FrontFacing = frag.gl_FrontFacing;
    gl_FragCoord = frag.gl_FragCoord;

    inputs_instanceData = frag.instanceData;

    inputs_clipPosition = frag.clipPosition;
    inputs_litPosition = frag.litPosition;

    inputs_depth = frag.viewPosition.w;
    inputs_position = frag.viewPosition.xyz;
    inputs_uv = frag.uv;
    inputs_vftMat[2] = normalize(frag.viewNormal);

    if (MATERIAL_NEEDS_TBN) {
        inputs_vftMat[0] = normalize(frag.viewTangent.xyz);
        inputs_vftMat[1] = cross(inputs_vftMat[2], inputs_vftMat[0]) * sign(frag.viewTangent.w);
    }

    if (VARIANT_HAS_DOUBLESIDED && !gl_FrontFacing) {
        inputs_vftMat[0] = -inputs_vftMat[0];
        inputs_vftMat[1] = -inputs_vftMat[1];
        inputs_vftMat[2] = -inputs_vftMat[2];
    }

    inputs_geometricNormal = normalize(inputs_vftMat[2]);
    inputs_geometricTangent = normalize(inputs_vftMat[0]);

    inputs_custom1 = frag.custom1;
    inputs_custom2 = frag.custom2;
}

// 计算指定相机空间点的阴影贴图采样UV和光照空间深度
fn computeLightSpacePosition(viewPosition: vec3f, viewNormal: vec3f, cascade: u32) ->vec4f {
    // 相机空间到世界空间变换矩阵
    let wfvMat = frameUniforms.wfgMat * frameUniforms.gfvMat;

    // 将全局空间光照向量转到相机空间
    let viewLit = normalize(mulMat3x3Float3(frameUniforms.vfgMat, frameUniforms.sunlitDirection.xyz));
    // 片元法线和光照方向COS值
    let NoL = saturate(dot(viewNormal, viewLit));
    // 片元法线和光照方向SIN值
    let sinTheta = sqrt(1.0 - NoL * NoL);
    // 将坐标沿法线偏移一定距离（由frameUniforms.shadowBias指定），避免出现自遮挡问题（acne），VSM阴影不需要偏移
    let vPos = viewPosition + normalize(viewNormal) * (sinTheta * frameUniforms.shadowBias);

    // 返回阴影贴图采样UV和光照空间深度
    return mulMat4x4Float3((frameUniforms.sm_uvfwMat * wfvMat), vPos);
}

// 计算指定相机空间视锥分片内点的阴影贴图采样UV和光照空间深度
fn getCascadeLightSpacePosition(cascade: u32) ->vec4f {
    // 在片元着色器中计算片元所属阴影联级，0号是大多数的，从顶点着色器获取，其它联级的在片元着色器中计算片元在光照空间坐标，这么做可以节省性能
    if (cascade == 0u) {
        return inputs_litPosition;
    }

    // 计算指定联级的光照空间坐标，与vertex_lightSpacePosition的计算方法是一样的，但后者在顶点着色器中计算插值的，并且占大部分
    return computeLightSpacePosition(inputs_position, inputs_geometricNormal, cascade);
}
