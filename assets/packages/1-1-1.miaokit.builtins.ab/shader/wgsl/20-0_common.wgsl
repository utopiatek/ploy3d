
//------------------------------------------------------------------------------
// 着色器通用宏定义
//------------------------------------------------------------------------------

override QUALITY_LEVEL_HIGH = true;
override QUALITY_USE_SPHERICAL_HARMONICS_BANDS = 3;

override SHADING_MODEL = 1u;
override SHADING_AS_UNLIT: bool = true;

override VARIANT_NEEDS_MORPHING = false;
override VARIANT_NEEDS_SKINNING = false;
override VARIANT_HAS_DOUBLESIDED = false;
override VARIANT_HAS_DIRECTIONAL_LIGHTING = true;
override VARIANT_HAS_SHADOWING = true;
override VARIANT_HAS_VSM = true;

override BLEND_MODE_MASKED = false;
override BLEND_MODE_TRANSPARENT = false;
override BLEND_MODE_FADE = false;

override MATERIAL_NEEDS_TBN = false;
override MATERIAL_HAS_NORMAL = false;
override MATERIAL_HAS_EMISSIVE = false;
override MATERIAL_HAS_ANISOTROPY = false;

// 避免这些宏常量定义被优化移除
fn save_override() ->u32 {
    let QUALITY_LEVEL_HIGH_ = QUALITY_LEVEL_HIGH;
    let QUALITY_USE_SPHERICAL_HARMONICS_BANDS_ = QUALITY_USE_SPHERICAL_HARMONICS_BANDS;

    let SHADING_MODEL_ = SHADING_MODEL;
    let SHADING_AS_UNLIT_ = SHADING_AS_UNLIT;

    let VARIANT_NEEDS_MORPHING_ = VARIANT_NEEDS_MORPHING;
    let VARIANT_NEEDS_SKINNING_ = VARIANT_NEEDS_SKINNING;
    let VARIANT_HAS_DOUBLESIDED_ = VARIANT_HAS_DOUBLESIDED;
    let VARIANT_HAS_DIRECTIONAL_LIGHTING_ = VARIANT_HAS_DIRECTIONAL_LIGHTING;
    let VARIANT_HAS_SHADOWING_ = VARIANT_HAS_SHADOWING;
    let VARIANT_HAS_VSM_ = VARIANT_HAS_VSM;

    let BLEND_MODE_MASKED_ = BLEND_MODE_MASKED;
    let BLEND_MODE_TRANSPARENT_ = BLEND_MODE_TRANSPARENT;
    let BLEND_MODE_FADE_ = BLEND_MODE_FADE;

    let MATERIAL_NEEDS_TBN_ = MATERIAL_NEEDS_TBN;
    let MATERIAL_HAS_NORMAL_ = MATERIAL_HAS_NORMAL;
    let MATERIAL_HAS_EMISSIVE_ = MATERIAL_HAS_EMISSIVE;
    let MATERIAL_HAS_ANISOTROPY_ = MATERIAL_HAS_ANISOTROPY;

    return SHADING_MODEL_;
}

//------------------------------------------------------------------------------
// 所有着色器模块必含的共享通用代码
//------------------------------------------------------------------------------

// 常数Π
const PI                = 3.14159265359;
// 常数二分之一Π
const HALF_PI           = 1.570796327;

// 半精度浮点型正数最大值，半精度浮点型表示范围[-65504, 65504]
const MEDIUMP_FLT_MAX   = 65504.0;
// 半精度浮点型正数最小值，最小识别粒度大小
const MEDIUMP_FLT_MIN   = 0.00006103515625;
// FLT_EPSILON，浮点型最小识别粒度大小，两浮点值之差的绝对值不小于FLT_EPSILON才会判断为不等
const FLT_EPS: f32      = 1e-5;

// 最小粗糙度输入值，需要保证在单精度浮点型下(MIN_PERCEPTUAL_ROUGHNESS^4=MIN_ROUGHNESS^2) > 0
const MIN_PERCEPTUAL_ROUGHNESS  = 0.045;
// 最小粗糙度参数（参与PBR计算），需要保证在单精度浮点型下(MIN_ROUGHNESS^2) > 0
const MIN_ROUGHNESS             = 0.002025;

// 片元的shading_normal与shading_view的点积最小值，用于避免0和负值，对应最大夹角不到90度
const MIN_N_DOT_V: f32          = 1e-4;

// 计算x^2的结果
fn sq(x: f32) -> f32 {
    return x * x;
}

// 计算x^5的结果
fn pow5(x: f32) -> f32 {
    let x2 = x * x;
    return x2 * x2 * x;
}

// 取二维向量中最大元素值
fn max_in_vec2(v: vec2f) -> f32 {
    return max(v.x, v.y);
}

// 取三维向量中最大元素值
fn max_in_vec3(v: vec3f) -> f32 {
    return max(v.x, max(v.y, v.z));
}

// 取四维向量中最大元素值
fn max_in_vec4(v: vec4f) -> f32 {
    return max(max(v.x, v.y), max(v.y, v.z));
}

// 取二维向量中最小元素值
fn min_in_vec2(v: vec2f) -> f32 {
    return min(v.x, v.y);
}

// 取三维向量中最小元素值
fn min_in_vec3(v: vec3f) -> f32 {
    return min(v.x, min(v.y, v.z));
}

// 取四维向量中最小元素值
fn min_in_vec4(v: vec4f) -> f32 {
    return min(min(v.x, v.y), min(v.y, v.z));
}

// 函数acos(x)的近似高效方法，最大误差绝对值0.009，定义域[-1, 1]内有效
fn acosFast(x: f32) -> f32 {
    // Lagarde 2014, "Inverse trigonometric functions GPU optimization for AMD GCN architecture"
    // This is the approximation of degree 1, with a max absolute error of 9.0x10^-3
    let y = abs(x);
    var p = -0.1565827 * y + 1.570796;
    p *= sqrt(1.0 - y);
    return select(PI - p, p, x >= 0.0);
}

// 函数acos(x)的近似高效方法，最大误差绝对值0.009，定义域[0, 1]内有效
fn acosFastPositive(x: f32) -> f32 {
    let p = -0.1565827 * x + 1.570796;
    return p * sqrt(1.0 - x);
}

// 三维向量右乘四阶矩阵，相当于齐次坐标W=1，返回四维向量
fn mulMat4x4Float3(m: mat4x4f, v: vec3f) -> vec4f {
    return v.x * m[0] + (v.y * m[1] + (v.z * m[2] + m[3]));
}

// 三维向量右乘三阶矩阵，相当于齐次坐标W=0，返回三维向量
fn mulMat3x3Float3(m: mat4x4f, v: vec3f) -> vec3f {
    return v.x * m[0].xyz + (v.y * m[1].xyz + (v.z * m[2].xyz));
}

// 从四元数中解码出切线空间法线
fn decodeNormal(q: vec4f) -> vec3f {
    return vec3f(0.0, 0.0, 1.0) +
        vec3f(2.0, -2.0, -2.0) * q.x * q.zwx +
        vec3f(2.0, 2.0, -2.0) * q.y * q.wzy;
}

// 从四元数中解码出切线空间法线
fn decodeTangent(q: vec4f) -> vec3f {
    return vec3f(1.0, 0.0, 0.0) +
        vec3f(-2.0, 2.0, -2.0) * q.y * q.yxw +
        vec3f(-2.0, 2.0, 2.0) * q.z * q.zwx;
}

// 生成矩阵的代数余子式矩阵（transpose(inverse(M)) = cof(M) / det(M)），法线矩阵等于模型矩阵的逆矩阵的转置
fn cofactor(m: mat4x4f) -> mat3x3f {
    // https://blog.csdn.net/u011661574/article/details/109764912

    // 假设输入的列主矩阵如下：
    // | a b c |
    // | d e f |
    // | g h i |

    // 各元素余子式行列式计算如下（此处穿插了负号，所以求的是代数余子式的行列式）：
    // A = (ei - fh), B = (fg - di), C = (dh - eg)
    // D = (ch - bi), E = (ai - cg), F = (bg - ah)
    // G = (bf - ce), H = (cd - af), I = (ae - bd)

    // 它的代数余子式矩阵如下：
    // | A B C |
    // | D E F |
    // | G H I |

    // 逆矩阵的转置：transpose(inverse(M)) = cof(M) / det(M)
    // 法线矩阵等于模型矩阵的逆矩阵的转置
    // 我们避免了求逆再转置的过程，用该矩阵转换的法线不保证得到单位长度

    // 代数余子式矩阵转置存储为伴随矩阵
    // 法线矩阵=伴随矩阵/行列式，因为行列式是标量，不影响法线的变换，所以不进行该操作，因此法线变换后非单位长度

    let a = m[0][0];
    let b = m[1][0];
    let c = m[2][0];
    let d = m[0][1];
    let e = m[1][1];
    let f = m[2][1];
    let g = m[0][2];
    let h = m[1][2];
    let i = m[2][2];

    var cof: mat3x3f;

    cof[0][0] = e * i - f * h;
    cof[0][1] = c * h - b * i;
    cof[0][2] = b * f - c * e;
    cof[1][0] = f * g - d * i;
    cof[1][1] = a * i - c * g;
    cof[1][2] = c * d - a * f;
    cof[2][0] = d * h - e * g;
    cof[2][1] = b * g - a * h;
    cof[2][2] = a * e - b * d;

    return cof;
}

// 随机稳定噪声函数，输入屏幕坐标（非单位化向量），返回[0, 1]区间的随机数 
fn interleavedGradientNoise(w: vec2f) -> f32 {
    let m = vec3f(0.06711056, 0.00583715, 52.9829189);
    return fract(m.z * fract(dot(w, m.xy)));
}

// 线性颜色通道值转sRGB颜色通道值
fn linearTosRGB(color: f32) -> f32 {
    return select(1.055 * pow(color, 1.0 / 2.4) - 0.055, color * 12.92, color < 0.0031308);
}

// 线性颜色值转sRGB颜色值
fn linearTosRGB_vec3(color: vec3f) -> vec3f {
    let r = select(1.055 * pow(color.r, 1.0 / 2.4) - 0.055, color.r * 12.92, color.r < 0.0031308);
    let g = select(1.055 * pow(color.g, 1.0 / 2.4) - 0.055, color.g * 12.92, color.g < 0.0031308);
    let b = select(1.055 * pow(color.b, 1.0 / 2.4) - 0.055, color.b * 12.92, color.b < 0.0031308);

    return vec3f(r, g, b);
}

// 线性颜色值转sRGB颜色值（a通道不转换）
fn linearTosRGB_vec4(color: vec4f) -> vec4f {
    let r = select(1.055 * pow(color.r, 1.0 / 2.4) - 0.055, color.r * 12.92, color.r < 0.0031308);
    let g = select(1.055 * pow(color.g, 1.0 / 2.4) - 0.055, color.g * 12.92, color.g < 0.0031308);
    let b = select(1.055 * pow(color.b, 1.0 / 2.4) - 0.055, color.b * 12.92, color.b < 0.0031308);

    return vec4f(r, g, b, color.a);
}

// sRGB颜色通道值转线性颜色通道值
fn sRGBToLinear(color: f32) -> f32 {
    return select(pow((color + 0.055) * (1.0 / 1.055), 2.4), color * (1.0 / 12.92), color < 0.04045);
}

// sRGB颜色值转线性颜色值
fn sRGBToLinear_vec3(color: vec3f) -> vec3f{
    let r = select(pow((color.r + 0.055) * (1.0 / 1.055), 2.4), color.r * (1.0 / 12.92), color.r < 0.04045);
    let g = select(pow((color.g + 0.055) * (1.0 / 1.055), 2.4), color.g * (1.0 / 12.92), color.g < 0.04045);
    let b = select(pow((color.b + 0.055) * (1.0 / 1.055), 2.4), color.b * (1.0 / 12.92), color.b < 0.04045);

    return vec3f(r, g, b);
}

// sRGB颜色值转线性颜色值（a通道不转换）
fn sRGBToLinear_vec4(color: vec4f) -> vec4f{
    let r = select(pow((color.r + 0.055) * (1.0 / 1.055), 2.4), color.r * (1.0 / 12.92), color.r < 0.04045);
    let g = select(pow((color.g + 0.055) * (1.0 / 1.055), 2.4), color.g * (1.0 / 12.92), color.g < 0.04045);
    let b = select(pow((color.b + 0.055) * (1.0 / 1.055), 2.4), color.b * (1.0 / 12.92), color.b < 0.04045);

    return vec4f(r, g, b, color.a);
}

// 夹取使片元的shading_normal与shading_view的夹角小于90度，其点积避免0和负值
fn clampNoV(NoV: f32) -> f32 {
    // Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
    return max(NoV, MIN_N_DOT_V);
}

// 粗糙度线性值转换为实际PBR计算所用的粗糙度参数
fn perceptualRoughnessToRoughness(perceptualRoughness: f32) -> f32 {
    return perceptualRoughness * perceptualRoughness;
}

// 实际PBR计算所用的粗糙度参数转换为粗糙度线性值
fn roughnessToPerceptualRoughness(roughness: f32) -> f32 {
    return sqrt(roughness);
}

// 根据法线贴图调节粗糙度线性值参数
fn adjustRoughnessNormalMap(perceptualRoughness: f32, normal: vec3f) -> f32 {
    let nlen2 = dot(normal, normal);
    if(nlen2 < 1.0) {
        let nlen = sqrt(nlen2);
        let kappa = (3.0 * nlen - nlen2 * nlen) / (1.0 - nlen2);
        return min(1.0, sqrt(perceptualRoughness * perceptualRoughness + 1.0 / kappa));
    }

    return perceptualRoughness;
}

// 根据非金属物质的折射率计算反射率（Lagarde 2011 提出了一种转换公式）
// 折射率，光在真空中的传播速度与光在该介质中的传播速度之比
// transmittedIor 折射介质的折射率
// incidentIor 入射介质的折射率
fn iorToF0(transmittedIor: f32, incidentIor: f32) -> f32 {
    return sq((transmittedIor - incidentIor) / (transmittedIor + incidentIor));
}

// 根据非金属物质的反射率计算折射率（Lagarde 2011 提出了一种转换公式）
// 该计算假设了incidentIor==1，即入射介质为真空
fn f0ToIor(f0: f32) -> f32 {
    let r = sqrt(f0);
    return (1.0 + r) / (1.0 - r);
}

// 立方体贴图UV转换方法（左手坐标系，球谐系数同样，朝+Z方向[图像中间]看时，则+X方向[图像右半边中间]在右边）
fn cal_equirectangular_map_uv(n: vec3f) -> vec2f{
    // tan(a)=3/2, a=atan2(3,2)
    // 返回原点至(2,3)点向量的方位角，即与X轴的夹角，单位为弧度
    // 取值[-PI,PI]，正值表示逆时针夹角，负值为顺时针夹角
    // 计算结果-180度到+180度，U值从0到1
    // 此处计算与Z轴夹角，夹角为0时U为0.5
    var u = atan2(n.x, n.z);
    u = (u + PI) / (2.0 * PI);

    // -1:-90，+1:+90，避免1值，它会循环采样到0点
    var v = asin(min(n.y, 0.999));
    v = 1.0 - (v * 2.0 + PI) / (2.0 * PI);

    return vec2f(u, v);
}

// 采样编码在球谐系数中的辐照度
fn Irradiance_SphericalHarmonics(n: vec3f) -> vec3f{
    var irr = frameUniforms.iblSH;

    if (QUALITY_USE_SPHERICAL_HARMONICS_BANDS >= 2) {
        irr = irr + frameUniforms.iblSH1 * (n.y) + frameUniforms.iblSH2 * (n.z) + frameUniforms.iblSH3 * (n.x);
    }

    if (QUALITY_USE_SPHERICAL_HARMONICS_BANDS >= 3) {
        irr = irr + frameUniforms.iblSH4 * (n.y * n.x) + frameUniforms.iblSH5 * (n.y * n.z) + frameUniforms.iblSH6 * (3.0 * n.z * n.z - 1.0) + frameUniforms.iblSH7 * (n.z * n.x) + frameUniforms.iblSH8 * (n.x * n.x - n.y * n.y);
    }
    
    return max(irr, vec4f(0.0)).xyz;
}
