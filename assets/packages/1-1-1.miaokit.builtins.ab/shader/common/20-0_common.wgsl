
// TODO：将以下变量迁移到G0中
const uHalton: vec4f = vec4f(0.0, 0.0, -1.0, 12.0);
const uFrameMod: f32 = 7.0;
const uRGBMRange: f32 = 7.0;
const uSketchfabLight0_viewDirection: vec3f = vec3f(-0.5919, 0.3152, -0.7418);
const uSketchfabLight1_viewDirection: vec3f = vec3f(-0.2468, 0.8314, 0.4978);
const uSketchfabLight0_diffuse: vec4f = vec4f(1.0);
const uSketchfabLight1_diffuse: vec4f = vec4f(0.2200, 0.2200, 0.2200, 1.0);

//------------------------------------------------------------------------------
// 着色器通用宏定义
//------------------------------------------------------------------------------

// 阴影渲染帧通道
override SHADING_CAST_SHADOW = false;
// EARLYZ帧通道
override SHADING_EARLYZ = false;
// 是否仅绘制不透明片元（某些材质时半透明的但帧通道并不启用混，BLEND_MODE_TRANSPARENT代表的是材质期望的混合模式）
override SHADING_ONLY_OPACITY = false;
// 使用抖色丢弃部分片元来模拟半透明渲染
override SHADING_DITHERING_TRANSPARENT = false;
// 使用ALPHA_TO_COVERAGE技术平滑过渡不透明度裁剪边缘
override SHADING_MASKED_ALPHA_TO_COVERAGE = true;
// 输出线性颜色值
override SHADING_OUTPUT_LINEAR = true;
// 跳过着色方法shading_fs
override SHADING_SKIP = false;

override VARIANT_NEEDS_MORPHING = false;
override VARIANT_NEEDS_SKINNING = false;
override VARIANT_HAS_DOUBLESIDED = false;
override VARIANT_HAS_SHADOWING = false;

override BLEND_MODE_MASKED = false;
override BLEND_MODE_TRANSPARENT = false;
override BLEND_MODE_FADE = false;

override MATERIAL_NEEDS_TBN = true;
override MATERIAL_SLOT = 0u;

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

// 计算两个浮点数的模
fn fmod(x: f32, y: f32) ->f32 {
    return x - y * floor(x / y);
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
fn interleavedGradientNoise(fragCoord: vec2f, frameMod: f32) ->f32 {
    let magic = vec3f(0.06711056, 0.00583715, 52.9829189);
    return fract(magic.z * fract(dot(fragCoord.xy + frameMod * vec2(47.0, 17.0) * 0.695, magic.xy)));
}

fn pseudoRandom(fragCoord: vec2f) ->f32 {
    var p3 = fract(vec3f(fragCoord.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

fn checkerboard(uv: vec2f, halton: vec4f) ->f32 {
    let flooredUV = floor(uv);
    return fmod((select(1.0, 0.0, halton.z < 0.0)) + flooredUV.x + flooredUV.y, 2.0);
}

// 将深度、透明度、次表面散射的配置和强度进行打包编码到一个四维向量中
// 编码主要涉及深度的高精度存储、透明度的保留以及散射效果的调整
// 深度值是一个0到1之间的线性浮点数，表示片元到相机近平面的距离
// 为了提高深度存储的精度（因为 GPU 在传递时可能存在精度丢失），该函数将深度拆分成不同的精度级别，分别存储到 vec4f 的 r、g 和 b 分量中
// 次表面散射（Subsurface Scattering, SSS）是通过 scatter 和 profile 参数进行控制的。为了使渲染中可以正确区分不同的散射强度和配置，需要对 scatter 和 profile 进行编码
fn encodeDepthAlphaProfileScatter(depth: f32, alpha: f32, profile: f32, scatter: f32) ->vec4f {
    var pack = vec4f(0.0);

    // 不透明度存储在A通道中
    pack.a = alpha;

    // 当 profile 为 0.0 时，采用了一种高精度的深度编码方法
    // 这种编码方式可以确保在高精度下存储深度信息，避免浮点数在不同精度下传递时的丢失。
    if(profile == 0.0) {
        // 使用 vec3f(1.0, 255.0, 65025.0) 作为编码系数，它们分别代表 8-bit、16-bit 和 24-bit 的编码精度
        let code = vec3f(1.0, 255.0, 65025.0);

        // 通过对深度值乘以这些系数，将其映射到较大的数值范围以提高精度
        pack = vec4f(vec3f(code * depth), pack.a);
        // 保留小数部分的值
        pack = vec4f(pack.r, fract(pack.gb), pack.a);
        // 消除精度的误差，将深度的不同部分存储在 pack.r 和 pack.g 中
        pack = vec4f(pack.rg - pack.gb * (1.0 / 256.0), pack.ba);
    }
    // 当 profile 不为 0 时，使用了简化的深度编码方式
    // 这种方式牺牲了部分精度，适合次表面散射效果优先的情况，减少了对深度精度的需求
    else {
        pack.g = fract(depth * 255.0);
        pack.r = depth - pack.g / 255.0;
        // 先将 scatter 值映射到 0 到 63 的离散整数区间，在重新归一化
        pack.b = floor(0.5 + scatter * 63.0) * 4.0 / 255.0;
    }

    // 为了保证精度，对 pack.b 进行调整，使其在 4 的倍数范围内精确化
    pack.b -= fmod(pack.b, 4.0 / 255.0);
    // pack.b 余数（1、2、3）可以用于保存 profile， profile 的值为0或1
    pack.b += profile / 255.0;

    return pack;
}

fn decodeProfile(pack: vec4f) ->i32 {
    let packValue = floor(pack.b * 255.0 + 0.5);
    var profile = fmod(packValue, 2.0);
    profile += fmod(packValue - profile, 4.0);
    return i32(profile);
}

fn decodeDepth(pack: vec4f) ->f32 {
    if (decodeProfile(pack) == 0) {
        let decode: vec3f = 1.0 / vec3(1.0, 255.0, 65025.0);
        return dot(pack.rgb, decode);
    }
    return pack.r + pack.g / 255.0;
}

fn encodeRGBM(color: vec3f, range: f32) ->vec4f {
    if (range <= 0.0) {
        return vec4f(color, 1.0);
    }

    var rgbm = vec4f(0.0);
    var col = color * (1.0 / range);
    rgbm.a = clamp( max( max( col.r, col.g ), max( col.b, 1e-6 ) ), 0.0, 1.0 );
    rgbm.a = ceil( rgbm.a * 255.0 ) / 255.0;
    rgbm = vec4f(col / rgbm.a, rgbm.a);

    return rgbm;
}

fn decodeRGBM(color: vec4f, range: f32) ->vec3f {
    if (range <= 0.0) {
        return color.rgb;
    }

    return range * color.rgb * color.a;
}

fn luminanceLinear(color: vec3f) ->f32 {
    return dot(color, vec3f(0.3, 0.59, 0.11));
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

// 参数a为不透明度，当a小于threshold时，丢弃该像素
fn computeMaskedAlpha(a: f32, threshold: f32) -> f32 {
    // 执行不透明度裁剪。BLEND_MODE_MASKED实际在不透明通道执行，片元要么完全可见，要么完全不可见
    if (BLEND_MODE_MASKED) {
        // 使用导数平滑经过alpha测试的边。分母为a的变化梯度，最小0.001
        // 设threshold = 0.5，fwidth = 0.1，当a = 0.45时，(0.45 - 0.5) / 0.1 + 0.5 = 0.0
        // 以上条件，当a < 0.45时返回值将小于0.0，像素被丢弃
        let clip = (a - threshold) / max(fwidth(a), 1e-3) + 0.5;
        if (clip <= 0.0) {
            discard;
        }
    }

    return a;
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
fn equirectangularUV(n: vec3f) -> vec2f{
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

    // QUALITY_USE_SPHERICAL_HARMONICS_BANDS >= 2
    irr = irr + frameUniforms.iblSH1 * (n.y) + frameUniforms.iblSH2 * (n.z) + frameUniforms.iblSH3 * (n.x);

    // QUALITY_USE_SPHERICAL_HARMONICS_BANDS >= 3
    irr = irr + frameUniforms.iblSH4 * (n.y * n.x) + frameUniforms.iblSH5 * (n.y * n.z) + frameUniforms.iblSH6 * (3.0 * n.z * n.z - 1.0) + frameUniforms.iblSH7 * (n.z * n.x) + frameUniforms.iblSH8 * (n.x * n.x - n.y * n.y);
    
    return max(irr, vec4f(0.0)).xyz;
}
