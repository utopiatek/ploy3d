
//------------------------------------------------------------------------------
// 材质定义模块通用代码
//------------------------------------------------------------------------------

// 片段的屏幕空间坐标
// 在WGSL中，gl_FragCoord的等价内置变量是@builtin(position)
var<private> gl_FragCoord: vec4f = vec4f(0.0);

// 材质需要完整定义以下值，并标记出实际启用了哪些值
// 材质表面不透明度（material_alpha = computeMaskedAlpha(inputs_alpha、inputs_maskThreshold)）
// #MATERIAL_HAS_ALPHA
var<private> material_alpha: f32 = 1.0;
// 材质金属成分的反射率【F0】，非金属成分的折射光线散射率【pixel_diffuseColor】（未预乘不透明度），UNLIT模型输出颜色
// #MATERIAL_HAS_BASECOLOR
var<private> material_baseColor: vec3f = vec3f(0.0);
// 清漆层强度，控制清漆层反射率
// #MATERIAL_HAS_CLEAR_COAT
var<private> material_clearCoat: f32 = 0.0;
// 清漆层粗糙度线性值（取值范围[MIN_PERCEPTUAL_ROUGHNESS, 1]）
// #MATERIAL_HAS_CLEAR_COAT_ROUGHNESS
var<private> material_clearCoatPerceptualRoughness: f32 = 0.5;
// 各项异性计算的偏移方向(anisotropicT，正数)或(anisotropicB，负数)和强度参数([-1, 1]线性值，0为各向同性)
// #MATERIAL_HAS_ANISOTROPY
var<private> material_anisotropy: f32 = 0.0;
// 环境光遮蔽度（[0, 1]线性值）
// #MATERIAL_HAS_AMBIENT_OCCLUSION
var<private> material_ambientOcclusion: f32 = 1.0;
// 粗糙度线性值（用于折射计算，取值范围[0, 1]）
// #MATERIAL_HAS_ROUGHNESS
var<private> material_perceptualRoughnessUnclamped: f32 = 0.5;
// 材质表面金属度
// #MATERIAL_HAS_METALLI
var<private> material_metallic: f32 = 0.0;
// 材质表面非金属成分反射率【F0】
// #MATERIAL_HAS_SPECULAR
var<private> material_reflectance: f32 = 0.5;
// 自发光颜色强度（HDR）
// #MATERIAL_HAS_EMISSIVE
var<private> material_emissive: vec3f = vec3f(0.0);
// 附加的用于和光照计算后的结果混合产生最后输出的颜色
// #MATERIAL_HAS_POST_LIGHTING_COLOR
var<private> material_postLightingColor: vec4f = vec4f(0.0);
// PBR计算所用的次表面光照颜色，光穿过物体被吸收后的散射颜色
// #MATERIAL_HAS_SUBSURFACECOLOR
var<private> material_subsurfaceColor: vec3f = vec3f(0.0);
// 次表面光照强度
// #MATERIAL_HAS_SUBSURFACE_POWER
var<private> material_subsurfacePower: f32 = 12.0;
// 光泽层、布料（绒毛）的反射率【F0】
// #MATERIAL_HAS_SHEENCOLOR
var<private> material_sheenColor: vec3f = vec3f(0.0);
// 光泽层粗糙度线性值（取值范围[MIN_PERCEPTUAL_ROUGHNESS, 1]）
// #MATERIAL_HAS_SHEEN_ROUGHNESS
var<private> material_sheenPerceptualRoughness: f32 = 0.0;
// 材质的物理折射率（光在真空中的传播速度与光在该介质中的传播速度之比，可用于计算出f0）
// #MATERIAL_HAS_IOR
var<private> material_ior: f32 = 1.5;
// 折射光线穿过率（折射后有多少比重光通过物体，剩余比重被吸收和散射，取值范围[0.0, 1.0]）
// #MATERIAL_HAS_TRANSMISSION
var<private> material_transmission: f32 = 1.0;
// 材质对穿过它的光线的吸收率（比如穿过墨水瓶）
// #MATERIAL_HAS_ABSORPTION
var<private> material_absorption: vec3f = vec3f(0.0);
// 实心半透明材质厚度（也用于次表面散射波瓣衰减）
// #MATERIAL_HAS_THICKNESS
var<private> material_thickness: f32 = 0.5;
// 空心半透明材质壳厚度
// #MATERIAL_HAS_MICRO_THICKNESS
var<private> material_uThickness: f32 = 0.1;

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

// 着色光照模型标识(shading_model = SHADING_MODEL)
var<private> shading_model: u32 = 0u;
// 渲染标志集
// 最高8BIT记录混合模式(会写入GBUFFER)
// 次高8BIT记录着色模型相关通道开关(会写入GBUFFER)
// 最低16BIT记录在延迟着色中记录各材质属性启用状态(最多记录4个属性启用)
var<private> shading_flags: u32 = 0u;
// 相机空间坐标
var<private> shading_position: vec3f = vec3f(0.0, 0.0, -1.0);
// 相机空间单位化几何法线
var<private> shading_geometricNormal: vec3f = vec3f(0.0, 0.0, 1.0);
// TBN矩阵（切线空间 -> 相机空间）
// 我们使用非规范化的插值值，并假设使用Mikktspace算法计算切线，http://mikktspace.com/
var<private> shading_tangentToView: mat3x3f = mat3x3f(1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0);

// 视口空间坐标（NDC之后，屏幕空间，原点位于左下角）
// 裁剪空间坐标vertex_clipPosition进行透视除法后从[-1, 1]范围转换到[0, 1]范围（shading_normalizedViewportCoord = vertex_clipPosition.xy * (0.5 / vertex_clipPosition.w) + 0.5）
// 我们避免了使用矩阵乘法，也因此多开销了4个varyings单元，使用矩阵乘法的方法如下
// p = cfvMat * shading_position;
// shading_normalizedViewportCoord = p.xy * 0.5 / p.w + 0.5
var<private> shading_normalizedViewportCoord: vec2f = vec2f(0.5, 0.5);
// 相机空间单位化观察向量，从片元指向相机（shading_view = normalize(-shading_position)）
var<private> shading_view: vec3f = vec3f(0.0, 0.0, 1.0);
// 单位化细节法线(相机空间，normalize(shading_tangentToView * inputs_normal))
// #MATERIAL_HAS_NORMAL
var<private> shading_normal: vec3f = vec3f(0.0, 0.0, 1.0);
// 片元的相机空间内观察向量(shading_view)的反射向量(基于shading_normal反射，指向离开片元方向)
var<private> shading_reflected: vec3f = vec3f(0.0, 0.0, 1.0);
// 片元的shading_normal与shading_view的点积，表示两者夹角大小。1表示夹角等于0，0表示夹角等于90，负数表示夹角大于90，夹取到[MIN_N_DOT_V, 1]正数
var<private> shading_NoV: f32 = 1.0;
// 环境光偏向法线(相机空间，normalize(shading_tangentToView * inputs_bentNormal)，指向当前片元不被其它片元遮挡光照的平均方向，也即光线传入的主要方向(材质通过烘焙提供，可选))
// #MATERIAL_HAS_BENT_NORMAL
var<private> shading_bentNormal: vec3f = vec3f(0.0, 0.0, 1.0);
// 清漆层法线
// #MATERIAL_HAS_CLEAR_COAT_NORMAL
var<private> shading_clearCoatNormal: vec3f = vec3f(0.0, 0.0, 1.0);
// 各项异性计算的切线方向参数(相机空间，normalize(shading_tangentToView * inputs_anisotropyDirection))
// #MATERIAL_HAS_ANISOTROPY_DIRECTION
var<private> shading_anisotropicT: vec3f = vec3f(1.0, 0.0, 0.0);

// 根据材质属性输入，计算光照可能用到的一些全局变量
fn prepareShading(clipPosition: vec4f, normal: vec3f, bentNormal: vec3f, clearCoatNormal: vec3f, anisotropyDirection: vec3f) {
    shading_normalizedViewportCoord = clipPosition.xy * (0.5 / clipPosition.w) + 0.5;
    shading_view = normalize(-shading_position);

    shading_normal = select(normal, normalize(shading_tangentToView * normal), MATERIAL_HAS_NORMAL);

    shading_reflected = reflect(-shading_view, shading_normal);
    shading_NoV = clampNoV(dot(shading_normal, shading_view));

    shading_bentNormal = select(shading_normal, normalize(shading_tangentToView * bentNormal), MATERIAL_HAS_BENT_NORMAL);
    shading_clearCoatNormal = select(shading_geometricNormal, normalize(shading_tangentToView * clearCoatNormal), MATERIAL_HAS_CLEAR_COAT_NORMAL);

    shading_anisotropicT = shading_tangentToView[0];
    if (material_anisotropy != 0.0 && MATERIAL_HAS_ANISOTROPY_DIRECTION) {
        shading_anisotropicT = normalize(shading_tangentToView * anisotropyDirection);
    }
}

// VSM需要知道深度值的方差，而深度值的方差=深度值平方的期望-深度值期望的平方，需要额外写入深度值的平方，期望（均值）通过SAT计算
// 有了以上几个值，利用切比雪夫不等式估计范围内深度大于当前片元深度的概率，该概率即为遮挡率
// https://blog.csdn.net/qq_39300235/article/details/118338139
// 受到直接光照的片元的方差非常小，且t - E(x)的值始终在零的附近，分母接近0，因此容易产生明暗交加的条纹
// 可以使用一个最小方差来解决该问题，也可以使用下面方法来移除最小方差
fn computeDepthMomentsVSM(depth: f32) -> vec2f {
    // computes the moments
    // See GPU Gems 3
    // https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-8-summed-area-variance-shadow-maps
    var moments: vec2f;

    // the first moment is just the depth (average)
    moments.x = depth;

    // compute the 2nd moment over the pixel extents.
    let dx = dpdx(depth);
    let dy = dpdy(depth);
    moments.y = depth * depth + 0.25 * (dx * dx + dy * dy);

    return moments;
}

// 编码阴影贴图
// 线性深度值[-vsmExponent, +vsmExponent]存储在vertex_viewPosition.w中，经过内插
// linearDepth = vertex_viewPosition.w
fn encodeShadow(linearDepth: f32, alpha: f32) -> vec4f {
    if (BLEND_MODE_TRANSPARENT || BLEND_MODE_FADE) {
        // 半透明对象投射阴影时，阴影强度要弱于不透明对象投射阴影
        // 要弱化阴影强度，使阴影密度降低，从而避免在阴影贴图中记录阴影强度
        let noise = interleavedGradientNoise(gl_FragCoord.xy);
        if (noise >= alpha) {
            discard;
        }
    }

    // 我们使用指数方差阴影EVSM，可以优化VSM在高方差区域的漏光问题，并且可以使用图像空间的Blur实现软阴影
    // https://www.cnblogs.com/X-Jun/p/16269653.html
    // 线性深度值[-vsmExponent, +vsmExponent]存储在vertex_viewPosition.w中，经过内插
    // 线性深度值vsmExponent表示指数，通过exp方法转换为曲线，指数小于0时，结果小于1，结果始终大于0
    let depth = exp(linearDepth);
    // 写入深度和深度的平方，对深度的平方做一个优化以避免方差过小产生副作用
    // 启用EVSM4（需要更大的Blurs，需要RGBA16F格式）
    // fragColor.zw = computeDepthMomentsVSM(-1.0 / depth);
    return vec4f(computeDepthMomentsVSM(depth), vec2f(0.0));
}

struct DataGB {
    pack0 : vec4<u32>,
    pack1 : vec4<u32>,
};

// 编码GBUFFER
fn encodeGB() -> DataGB {
    var out: DataGB;

    // ULIT模型按以下方式编码GBUFFER
    if (SHADING_AS_UNLIT) {
        out.pack0 = vec4<u32>(1u, 0u, 0u, 0u);
        out.pack1 = vec4<u32>(vec4f(material_baseColor, 1.0));

        return out;
    }

    // PACK0编码必含数据：
    // X: shading_model + material_baseColor
    // Y: (pixel_clearCoatPerceptualRoughness + pixel_clearCoat) + shading_geometricNormal
    // Z: material_ambientOcclusion + pixel_perceptualRoughnessUnclamped + material_metallic + material_reflectance
    // W: shading_flags = datas:16 + channels:8 + blend_mode:8
    out.pack0[0] = pack4x8unorm(vec4f(0.0, material_baseColor));
    out.pack0[1] = pack4x8snorm(vec4f(0.0, shading_geometricNormal));
    out.pack0[2] = pack4x8unorm(vec4f(material_ambientOcclusion, material_perceptualRoughnessUnclamped, material_metallic, material_reflectance));

    let clearCoat: u32 = u32(ceil(material_clearCoat * 15.0) * 16.0) + u32(material_clearCoatPerceptualRoughness * 15.0);

    out.pack0[0] = out.pack0[0] + shading_model;
    out.pack0[1] = out.pack0[1] + clearCoat;

    // PACK1按优先顺序编码以下数据：
    // 0: shading_normal
    // 1: material_emissive
    // 2: shading_anisotropicT + material_anisotropy
    // 3: material_postLightingColor
    // 4: material_subsurfaceColor + material_subsurfacePower
    // 5: material_sheenColor + material_sheenPerceptualRoughness
    // 6: shading_bentNormal
    // 7: shading_clearCoatNormal

    // 最低16BIT记录在延迟着色中记录各材质属性启用状态(最多记录4个属性启用)
    var datas: u32 = shading_flags & 0xFFFF0000u;
    var index = 0u;

    out.pack1 = vec4<u32>(0u);

    if (MATERIAL_HAS_NORMAL) {
        out.pack1[index] = pack4x8snorm(vec4f(shading_normal, 0.0));
        datas += (0u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_EMISSIVE) {
        let nor = 1.0 / max_in_vec3(material_emissive);
        out.pack1[index] = pack4x8unorm(vec4f(material_emissive * nor, nor));
        datas += (1u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_ANISOTROPY) {
        out.pack1[index] = pack4x8snorm(vec4f(shading_anisotropicT, material_anisotropy));
        datas += (2u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_POST_LIGHTING_COLOR) {
        out.pack1[index] = pack4x8unorm(material_postLightingColor);
        datas += (3u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_SUBSURFACECOLOR && index < 4u) {
        let power = min(material_subsurfacePower / 32.0, 1.0);
        out.pack1[index] = pack4x8unorm(vec4(material_subsurfaceColor, power));
        datas += (4u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_SHEENCOLOR && index < 4u) {
        out.pack1[index] = pack4x8unorm(vec4(material_sheenColor, material_sheenPerceptualRoughness));
        datas += (5u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_BENT_NORMAL) {
        out.pack1[index] = pack4x8snorm(vec4f(shading_bentNormal, 0.0));
        datas += (6u << (4u * index));
        index += 1u;
    }

    if (MATERIAL_HAS_CLEAR_COAT_NORMAL) {
        out.pack1[index] = pack4x8snorm(vec4f(shading_clearCoatNormal, 0.0));
        datas += (7u << (4u * index));
        index += 1u;
    }

    out.pack0[3] = datas;

    return out;

    //==========================================

    // 以下数据不写入GBUFFER，在解码GBUFFER时根据深度缓存计算得出
    // material_alpha
    // shading_tangentToView
    // shading_position
    // shading_view
    // shading_normalizedViewportCoord
    // shading_reflected
    // shading_NoV
    // 以下参数仅在半透明材质中使用，所以不会执行延迟着色，也就不会经过GBUFFER的编解码
    // material_ior
    // material_transmission
    // material_absorption
    // material_thickness
    // material_uThickness
}

// 解码GBUFFER
fn decodeGB(pack0: vec4<u32>, pack1: vec4<u32>, position: vec3f, clipPosition: vec4f) {

    // ULIT模型按以下方式解码GBUFFER
    if(pack0.x == 1u) {
        shading_model = 1u;
        shading_flags = 0u;
        material_baseColor = vec3f(pack1.xyz);
        return;
    }

    shading_model = pack0[0] & 0xFF;

    let clearCoat = pack0[1] & 0xFF;

    material_clearCoat = f32(clearCoat >> 4u) / 15.0;
    material_clearCoatPerceptualRoughness = f32(clearCoat & 15u) / 15.0;

    material_baseColor = unpack4x8unorm(pack0[0]).yzw;
    shading_geometricNormal = unpack4x8snorm(pack0[1]).yzw;

    let ao_roughness_metallic_reflectance = unpack4x8unorm(pack0[2]);

    material_ambientOcclusion = ao_roughness_metallic_reflectance.x;
    material_perceptualRoughnessUnclamped = ao_roughness_metallic_reflectance.y;
    material_metallic = ao_roughness_metallic_reflectance.z;
    material_reflectance = ao_roughness_metallic_reflectance.w;

    shading_flags = pack0[3];

    var datas = 0u;
    var unpack: vec4f;

    // 以下数据不一定有保存，在此初始化
    shading_normal = shading_geometricNormal;
    shading_bentNormal = shading_geometricNormal;
    shading_clearCoatNormal = shading_geometricNormal;

    for (var i = 0u; i < 4u; i++) {
        let index = (shading_flags >> (i * 4u)) & 15u;

        datas = datas & (1u << index);

        switch(index) {
            case 0u: {
                shading_normal = unpack4x8snorm(pack1[i]).xyz;
            }
            case 1u: {
                unpack = unpack4x8unorm(pack1[i]);
                material_emissive = unpack.xyz / unpack.w;
            }
            case 2u: {
                unpack = unpack4x8snorm(pack1[i]);
                shading_anisotropicT = unpack.xyz;
                material_anisotropy = unpack.w;
            }
            case 3u: {
                material_postLightingColor = unpack4x8unorm(pack1[i]);
            }
            case 4u: {
                unpack = unpack4x8unorm(pack1[i]);
                material_subsurfaceColor = unpack.xyz;
                material_subsurfacePower = f32(unpack.w) * 32.0;
            }
            case 5u: {
                unpack = unpack4x8unorm(pack1[i]);
                material_sheenColor = unpack.xyz;
                material_sheenPerceptualRoughness = unpack.w;
            }
            case 6u: {
                shading_bentNormal = unpack4x8snorm(pack1[i]).xyz;
            }
            case 7u: {
                shading_clearCoatNormal = unpack4x8snorm(pack1[i]).xyz;
            }
            default: {
                // ...
            }
        }
    }

    //==========================================

    shading_flags = (shading_flags & 0xFFFF0000u) | datas;

    // 以下数据不写入GBUFFER，在解码GBUFFER时根据深度缓存计算得出
    // material_alpha
    // shading_tangentToView 延迟着色下无效
    // shading_position
    // shading_view
    // shading_normalizedViewportCoord
    // shading_reflected
    // shading_NoV

    material_alpha = 1.0;
    shading_position = position;
    shading_view = normalize(-position);
    shading_normalizedViewportCoord = clipPosition.xy * (0.5 / clipPosition.w) + 0.5;
    shading_reflected = reflect(-shading_view, shading_normal);
    shading_NoV = clampNoV(dot(shading_normal, shading_view));

    // 以下参数仅在半透明材质中使用，所以不会执行延迟着色，也就不会经过GBUFFER的编解码
    // material_ior
    // material_transmission
    // material_absorption
    // material_thickness
    // material_uThickness
}

// 根据裁剪空间Z值计算所在相机空间线性距离值
fn linearizeDepth(depth: f32, vfcMat: mat4x4f) -> f32 {
    // 我们的远平面处于无穷大，这会导致之后计算被零除，这反过来又会导致一些GPU出现一些问题
    // 我们通过将“无穷大”替换为24位深度缓冲区中可表示的最接近的值来解决此问题
    let preventDiv0 = 1.0 / 16777216.0;
    // 该方法适用于透视投影和正交投影
    // 对于透视投影：-near / depth
    // 对于正交投影：depth * (far - near) - far
    return (depth * vfcMat[2].z + vfcMat[3].z) / max(depth * vfcMat[2].w + vfcMat[3].w, preventDiv0);
}

// 采样裁剪空间Z值（the depth texture in reversed-Z）
fn sampleDepth(uv: vec2f, lod: f32) -> f32 {
    // 从深度贴图采样（深度图生成了MIPMAP）
    let z = textureSampleLevel(depthRT, spnnn1, uv, lod).r;
    // 我们从贴图采样的值范围[1, 0]，但实际写入的深度值为[1, -1]
    return z * 2.0 - 1.0;
}

// 采样裁剪空间Z值并转换为相机空间线性距离值
fn sampleDepthLinear(uv: vec2f, lod: f32, vfcMat: mat4x4f) -> f32 {
    return linearizeDepth(sampleDepth(uv, lod), vfcMat);
}

// 根据深度计算相机空间坐标
// uv             : normalized coordinates
// linearDepth    : linear depth at uv
// positionParams : invProjection[0][0] * 2, invProjection[1][1] * 2
fn computeViewSpacePositionFromDepth(uv: vec2f, linearDepth: f32, positionParams: vec2f) -> vec3f {
    return vec3f((0.5 - uv) * positionParams * linearDepth, linearDepth);
}

// 计算面向法线
fn faceNormal(dpdx: vec3f, dpdy: vec3f) -> vec3f {
    return normalize(cross(dpdx, dpdy));
}

// 直接从深度纹理计算法线，生成全分辨率法线
// 注意：这实际上和使用导数一样高效，因为纹理提取本质上等同于textureGather（我们在ES3.0上没有），并且只执行一次。
// uv             : normalized coordinates
// position       : view space position at uv
// texel          : 1/depth_width, 1/depth_height
// positionParams : invProjection[0][0] * 2, invProjection[1][1] * 2
// vfcMat         : viewFromClipMatrix
// lod            : depth sample level
fn computeViewSpaceNormalMediumQ(
    uv: vec2f,
    position: vec3f,
    texel: vec2f,
    positionParams: vec2f,
    vfcMat: mat4x4f,
    lod: f32,
) -> vec3f {
    let uvdx = uv + vec2(texel.x, 0.0);
    let uvdy = uv + vec2(0.0, texel.y);

    let px = computeViewSpacePositionFromDepth(uvdx, sampleDepthLinear(uvdx, lod, vfcMat), positionParams);
    let py = computeViewSpacePositionFromDepth(uvdy, sampleDepthLinear(uvdy, lod, vfcMat), positionParams);

    let dpdx = px - position;
    let dpdy = py - position;

    return faceNormal(dpdx, dpdy);
}

// 精确视图空间法线重建
// Based on Yuwen Wu "Accurate Normal Reconstruction" (https://atyuwen.github.io/posts/normal-reconstruction)
// uv             : normalized coordinates
// depth          : linear depth at uv
// position       : view space position at uv
// texel          : 1/depth_width, 1/depth_height
// positionParams : invProjection[0][0] * 2, invProjection[1][1] * 2
// vfcMat         : viewFromClipMatrix
// lod            : depth sample level
fn computeViewSpaceNormalHighQ(
    uv: vec2f,
    depth: f32,
    position: vec3f,
    texel: vec2f,
    positionParams: vec2f,
    vfcMat: mat4x4f,
    lod: f32,
) -> vec3f {
    let pos_c = position;

    let dx = vec2(texel.x, 0.0);
    let dy = vec2(0.0, texel.y);

    var H: vec4f;
    H.x = sampleDepth(uv - dx, lod);
    H.y = sampleDepth(uv + dx, lod);
    H.z = sampleDepth(uv - dx * 2.0, lod);
    H.w = sampleDepth(uv + dx * 2.0, lod);

    let he = abs((2.0 * H.xy - H.zw) - depth);
    let pos_l = computeViewSpacePositionFromDepth(uv - dx, linearizeDepth(H.x, vfcMat), positionParams);
    let pos_r = computeViewSpacePositionFromDepth(uv + dx, linearizeDepth(H.y, vfcMat), positionParams);
    let dpdx = select((pos_r - pos_c), (pos_c - pos_l), (he.x < he.y));

    var V: vec4f;
    V.x = sampleDepth(uv - dy, lod);
    V.y = sampleDepth(uv + dy, lod);
    V.z = sampleDepth(uv - dy * 2.0, lod);
    V.w = sampleDepth(uv + dy * 2.0, lod);

    let ve = abs((2.0 * V.xy - V.zw) - depth);
    let pos_d = computeViewSpacePositionFromDepth(uv - dy, linearizeDepth(V.x, vfcMat), positionParams);
    let pos_u = computeViewSpacePositionFromDepth(uv + dy, linearizeDepth(V.y, vfcMat), positionParams);
    let dpdy = select((pos_u - pos_c), (pos_c - pos_d), (ve.x < ve.y));

    return faceNormal(dpdx, dpdy);
}

// 根据深度计算相机空间法线，深度记录的是面元深度，反推出来的是面元法线
// uv             : normalized coordinates
// depth          : linear depth at uv
// position       : view space position at uv
// texel          : 1/depth_width, 1/depth_height
// positionParams : invProjection[0][0] * 2, invProjection[1][1] * 2
// vfcMat         : viewFromClipMatrix
// lod            : depth sample level
fn computeViewSpaceNormal(
    uv: vec2f,
    depth: f32,
    position: vec3f,
    texel: vec2f,
    positionParams: vec2f,
    vfcMat: mat4x4f,
    lod: f32,
) -> vec3f {
    if (QUALITY_LEVEL_HIGH) {
        return computeViewSpaceNormalHighQ(uv, depth, position, texel, positionParams, vfcMat, lod);
    }

    return computeViewSpaceNormalMediumQ(uv, position, texel, positionParams, vfcMat, lod);
}

// 计算延迟着色参数（TODO: 修改4096为实际内容尺寸）
// uv             : depth sample uv
// resolution     : depth resolution
// positionParams : invProjection[0][0] * 2, invProjection[1][1] * 2
fn computeDeferredParams(uv: vec2f, resolution: vec2f, positionParams: vec2f) {
    let pack0 = textureLoad(gbRT, vec2<u32>(uv * resolution), 0, 0);
    let model = (pack0.x) & 255u;

    if (model > 0u) {
        let pack1 = textureLoad(gbRT, vec2<u32>(uv * resolution), 1, 0);

        let depth = sampleDepth(uv, 0.0);
        let z = linearizeDepth(depth, frameUniforms.vfcMat);
        let viewPosition = computeViewSpacePositionFromDepth(uv, z, positionParams);
        let clipPosition = mulMat4x4Float3(frameUniforms.cfvMat, viewPosition);

        // GBUFFER已经保存了geometricNormal
        // shading_geometricNormal = computeViewSpaceNormal(uv, depth, viewPosition, resolution.zw, positionParams, frameUniforms.cfvMat, lod);

        decodeGB(pack0, pack1, viewPosition, clipPosition);
    }
}

// 材质方法应在最后调用以下2个函数：
// computeMaskedAlpha
// prepareShading
// 对于阴影投射帧通道中，应调用以下方法：
// encodeShadow
// 对于GBUFFER写入帧通道中，应调用以下方法：
// encodeGB
// 在延迟着色材质方法中，应调用以下方法：
// computeDeferredParams
