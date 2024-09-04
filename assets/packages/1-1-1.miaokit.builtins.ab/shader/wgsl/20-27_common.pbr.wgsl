
//------------------------------------------------------------------------------
// PBR渲染通用代码
//------------------------------------------------------------------------------

const inputs_specularAntiAliasingVariance: f32 = 0.15;
const inputs_specularAntiAliasingThreshold: f32 = 0.04;
const inputs_iblRoughnessOneLevel: f32 = 4.0;

// PBR计算所用的折射光线散射率，金属不存在漫反射（散射）
var<private> pixel_diffuseColor: vec3f = vec3f(0.0);
// PBR计算所用的光线垂直入射（入射角为0）时的反射率
var<private> pixel_f0: vec3f = vec3f(0.0);
// 空气到材质内部的折射率（空气折射率 / 材质折射率，用于计算折射角）
var<private> pixel_etaIR: f32 = 0.0;
// 材质内部到空气的折射率（材质折射率 / 空气折射率，用于计算折射角）
var<private> pixel_etaRI: f32 = 0.0;
// PBR计算所用的光泽层粗糙度参数（影响D项，等于perceptualRoughness * perceptualRoughness）
var<private> pixel_sheenRoughness: f32 = 0.0;
// PBR计算所用的清漆层粗糙度参数，越粗糙光照穿透力越弱（等于perceptualRoughness * perceptualRoughness）
var<private> pixel_clearCoatRoughness: f32 = 0.0;
// 粗糙度线性值（inputs_roughness，取值范围[MIN_PERCEPTUAL_ROUGHNESS, 1]）
var<private> pixel_perceptualRoughness: f32 = 0.0;
// PBR计算所用的粗糙度参数（等于perceptualRoughness * perceptualRoughness）
var<private> pixel_roughness: f32 = 0.0;
// 各项异性计算的副法线方向参数（相机空间，normalize(cross(shading_geometricNormal, pixel_anisotropicT))）
var<private> pixel_anisotropicB: vec3f = vec3f(0.0);
// 间接光照反射波瓣BDRF函数D、F、G项的预积分缓存
var<private> pixel_dfg: vec3f = vec3f(0.0);
// BDRF函数中几何遮挡项能量补偿
var<private> pixel_energyCompensation: vec3f = vec3f(0.0);
// 光泽层反射波瓣BDRF函数D、F、G项的预积分缓存，光泽层仅使用几何遮挡项G项
var<private> pixel_sheenDFG: f32 = 0.0;
// 光泽层源于表面绒毛作为几何遮挡项的遮挡反射，综合考虑其遮挡率和反射率得出底层光照穿过光泽层可穿透度
var<private> pixel_sheenScaling: f32 = 0.0;

// 对粗糙度进行正规滤波，避免产生高光噪点（材质提供inputs_specularAntiAliasingVariance、inputs_specularAntiAliasingThreshold参数并启用GEOMETRIC_SPECULAR_AA宏）
fn normalFiltering(perceptualRoughness: f32, worldNormal: vec3f) ->f32 {
    // Kaplanyan 2016, "Stable specular highlights"
    // Tokuyoshi 2017, "Error Reduction and Simplification for Shading Anti-Aliasing"
    // Tokuyoshi and Kaplanyan 2019, "Improved Geometric Specular Antialiasing"

    // 原论文的近似实现，以在向前着色中低开销运行，不作推导
    // This implementation is meant for deferred rendering in the original paper but
    // we use it in forward rendering as well (as discussed in Tokuyoshi and Kaplanyan
    // 2019). The main reason is that the forward version requires an expensive transform
    // of the half vector by the tangent frame for every light. This is therefore an
    // approximation but it works well enough for our needs and provides an improvement
    // over our original implementation based on Vlachos 2015, "Advanced VR Rendering".

    let du = dpdx(worldNormal);
    let dv = dpdy(worldNormal);

    let variance = inputs_specularAntiAliasingVariance * (dot(du, du) + dot(dv, dv));

    let roughness = perceptualRoughnessToRoughness(perceptualRoughness);
    let kernelRoughness = min(2.0 * variance, inputs_specularAntiAliasingThreshold);
    let squareRoughness = saturate(roughness * roughness + kernelRoughness);

    return roughnessToPerceptualRoughness(sqrt(squareRoughness));
}

// 在没有清漆层的情况下，入射介质被假定为真空，即incidentIor = 1.0，又pixel_f0 = iorToF0(material_ior, 1.0)
// 根据pixel_f0可求材质折射率：material_ior = f0ToIor(pixel_f0)
// 加入清漆层后，incidentIor变为了1.5，需要重新计算pixel_f0，即pixel_f0 = iorToF0(material_ior, clearcoat_ior)
// 所以，这个方法是iorTof0(f0ToIor(f0), 1.5)的近似
fn f0ClearCoatToSurface(f0: vec3f) ->vec3f {
    // QUALITY_LEVEL_LOW
    // saturate(f0 * (f0 * 0.526868 + 0.529324) - 0.0482256);

    return saturate(f0 * (f0 * (0.941892 - 0.263008 * f0) + 0.346479) - 0.0285998);
}

// DFG贴图采样方法
fn TextureLod_light_iblDFG(uv: vec2f, level: f32) ->vec4f {
    return textureSampleLevel(colorRT, splln1, vec2f(uv.x * 0.1240 + 0.0000, uv.y * 0.1240 + 0.0000), 1.0);
}

// 根据LOD和NoV采样DFG数据
fn PrefilteredDFG_LUT(lod: f32, NoV: f32) ->vec3f {
    // coord = sqrt(linear_roughness), which is the mapping used by cmgen.
    return TextureLod_light_iblDFG(vec2(NoV, lod), 0.0).rgb;
}

// 根据粗糙度线性值和NoV采样DFG数据
fn prefilteredDFG(perceptualRoughness: f32, NoV: f32) ->vec3f {
	// PrefilteredDFG_LUT() takes a LOD, which is sqrt(roughness) = perceptualRoughness
    return PrefilteredDFG_LUT(perceptualRoughness, NoV);
}

// 粗糙度线性值转环境反射贴图采样LOD
fn perceptualRoughnessToLod(perceptualRoughness: f32) ->f32 {
	// The mapping below is a quadratic fit for log2(perceptualRoughness)+iblRoughnessOneLevel when
	// iblRoughnessOneLevel is 4. We found empirically that this mapping works very well for
	// a 256 cubemap with 5 levels used. But also scales well for other iblRoughnessOneLevel values.
    return inputs_iblRoughnessOneLevel * perceptualRoughness * (2.0 - perceptualRoughness);
}

// 解码环境反射贴图像素
fn decodeDataForIBL(data: vec4f) ->vec3f {
    return sRGBToLinear_vec3(data.rgb);
}

// 采样环境反射贴图
fn prefilteredRadiance(r: vec3f, perceptualRoughness: f32) ->vec3f {
    let lod = perceptualRoughnessToLod(perceptualRoughness);
    return decodeDataForIBL(textureSampleLevel(iblSpecular, splll1, cal_equirectangular_map_uv(r), lod));
}

// 获取各项异性的偏置法线
fn getBentNormal(v: vec3f, n: vec3f) ->vec3f {
    if (MATERIAL_HAS_ANISOTROPY) {
        // 往副法线方向拉丝
        let anisotropyDirection = select(shading_anisotropicT, pixel_anisotropicB, material_anisotropy >= 0.0);
        // 令切线方向（丝线圆周上的一个切线方向）垂直于观察向量和拉丝方向
        let anisotropicTangent = cross(anisotropyDirection, v);
        // 丝线上观察点的法线方向
        let anisotropicNormal = cross(anisotropicTangent, anisotropyDirection);
        // 根据拉丝强度，计算丝线上观察点的法线方向和表面法向方向的混合因子
        let bendFactor = abs(material_anisotropy) * saturate(5.0 * pixel_perceptualRoughness);
        // 混合出用于反射观察向量的法向
        let bentNormal = normalize(mix(n, anisotropicNormal, bendFactor));

        return bentNormal;
    }

    return n;
}

// 计算观察向量的反射向量，相较于shading_reflected，它会在各向异性材质中偏置法线，该方法主要用于IBL
fn getReflectedVector(v: vec3f, n: vec3f) ->vec3f {
    return reflect(-v, getBentNormal(v, n));
}

fn specularDFG() ->vec3f {
    return select(mix(pixel_dfg.xxx, pixel_dfg.yyy, pixel_f0), pixel_f0 * pixel_dfg.z, SHADING_AS_CLOTH);
}

fn getSpecularDominantDirection(n: vec3f, r: vec3f, roughness: f32) ->vec3f {
    return mix(r, n, roughness * roughness);
}

// 光照计算中并没有不透明度参与计算，光照结束之后需要计算结果的不透明度
fn computeDiffuseAlpha(a: f32) ->f32 {
    // 如果启用混合，则返回真是不透明度，否则返回1.0
    // 如果代码运行到该位置，就可以确定片元通过了Alpha测试，因此我们可以仅输出1.0
    // 如果当前渲染目标结果需要用于混合，则需要分配不透明分量
    // 启用带ALPHA_TO_COVERAGE的MSAA时，保留不透明度可以实现颜色向BLEND_MODE_MASKED边缘的逐渐减淡
    let real = (BLEND_MODE_TRANSPARENT || BLEND_MODE_FADE) || (BLEND_MODE_MASKED && QUALITY_USE_ALPHA_TO_COVERAGE);
    return select(1.0, a, real);
}


// 计算除G缓存提供的参数之外的其它必要的渲染参数
fn getPixelParams() {
    // ==getCommonPixelParams================--------------------------------------------

    // BLEND_MODE_FADE模式下要消除透明度预乘，这样可以在最终结果上应用Alpha，使透明度不影响光照效果
    // RGB_target = (A_new * RGB_new) + (A_target * RGB_target) * (1.0 - A_new)；A * RGB即为预乘Alpha
    // 渲染目标是预乘Alpha的、片元也是预乘Alpha的，硬件执行混合操作RGB_target = RGB_new + RGB_target * (1.0 - A_new)，其结果也是预乘Alpha的
    // 所以仅需要保证初始渲染目标状态是预乘Alpha的，写入的片元也是预乘Alpha的即可保证混合效果一致
    // material_baseColor未预乘不透明度
    // unpremultiply(material_baseColor);
    var baseColor = material_baseColor;
    // 预乘不透明度
    if (!BLEND_MODE_FADE && !SHADING_AS_UNLIT) {
        baseColor = material_baseColor * material_alpha;
    }

    if (SHADING_AS_CLOTH) {
        // 使用材质基础色作为光线入射后散射率
        pixel_diffuseColor = baseColor;
        // 使用材质光泽层颜色作为布料表面综合反射率
        pixel_f0 = material_sheenColor;
    }
    else {
        // 非金属成分入射后散射率，金属没有散射（computeDiffuseColor）
        pixel_diffuseColor = baseColor * (1.0 - material_metallic);
        // 材质输入的reflectance输入范围[0, 1]，而自然界非金属物质反射率最高为钻石（0.16），所以需要对输入进行一个映射转换（computeDielectricF0）
        // 材质的reflectance可以根据材质的折射率（IOR）计算得出
        // 单通道值，因此反射白色（非金属对不同波长反射率相等）
        let dielectricF0 = 0.16 * material_reflectance * material_reflectance;
        // 表面综合反射率计算（computeF0）
        // 纯金属的反射率为baseColor
        // 纯非金属的反射率为dielectricF0
        // 对于SPECULAR_GLOSSINESS材质模型：
        // 如果为金属：将specularColor保存为material_baseColor，没有散射
        // 如果为非金属：将specularColor保存为material_reflectance，散射率保存为material_baseColor
        // 所以我们的SPECULAR_GLOSSINESS材质模型也需要提供Metallic参数
        pixel_f0 = baseColor * material_metallic + (dielectricF0 * (1.0 - material_metallic));
    }

    if (MATERIAL_HAS_REFRACTION) {
        // 从材质获取表面折射率，不应小于1.0，分开单独设置IOR可能导致材质不真实
        // 函数f0ToIor是根据Lagarde 2011 提出了一种转换公式，将非金属表面的反射率转换为折射率
        let materialor = select(f0ToIor(pixel_f0.g), max(1.0, material_ior), MATERIAL_HAS_IOR);

        // 空气折射率为1.0（真空中与空气中光速之比，实际为1.000277）
        let airIor = 1.0;
        // 两介质折射率之比，用于计算折射角
        pixel_etaIR = airIor / materialor;  // air -> material
        pixel_etaRI = materialor / airIor;  // material -> air
    }

    // ==getSheenPixelParams=================--------------------------------------------

    if (MATERIAL_HAS_SHEENCOLOR) {
        // 对粗糙度进行滤波，高光降噪
        if (QUALITY_USE_GEOMETRIC_SPECULAR_AA) {
            material_sheenPerceptualRoughness = normalFiltering(material_sheenPerceptualRoughness, shading_geometricNormal);
        }

        pixel_sheenRoughness = perceptualRoughnessToRoughness(material_sheenPerceptualRoughness);
    }

    // ==getClearCoatPixelParams=============--------------------------------------------

    if (MATERIAL_HAS_CLEAR_COAT) {
        // 对粗糙度进行滤波，高光降噪
        if (QUALITY_USE_GEOMETRIC_SPECULAR_AA) {
            material_clearCoatPerceptualRoughness = normalFiltering(material_clearCoatPerceptualRoughness, shading_geometricNormal);
        }
        
        pixel_clearCoatRoughness = perceptualRoughnessToRoughness(material_clearCoatPerceptualRoughness);

        if (MATERIAL_HAS_CLEAR_COAT_IOR_CHANGE)
        {
            // 表面f0的计算是假定界面由折射率1.0的空气到折射率1.5的材质，或者iorToF0(material.ior, 1.0)
            // 但清漆层形成了由折射率1.5的清漆层到折射率1.5的材质的新界面，或者iorToF0(material.ior, clearcoat.ior)
            // 我们首先根据原f0计算其折射率，再使用清漆层折射率作为入射折射率重新计算f0
            // 这个方法是iorTof0(f0ToIor(f0), 1.5)的近似
            pixel_f0 = mix(pixel_f0, f0ClearCoatToSurface(pixel_f0), material_clearCoat);
        }
    }

    // ==getRoughnessPixelParams=============--------------------------------------------

    pixel_perceptualRoughness = material_perceptualRoughnessUnclamped;

	// 对粗糙度进行滤波，高光降噪
    if (QUALITY_USE_GEOMETRIC_SPECULAR_AA) {
        pixel_perceptualRoughness = normalFiltering(pixel_perceptualRoughness, shading_geometricNormal);
    }

    if (MATERIAL_HAS_CLEAR_COAT) {
	    // 考虑到顶层可能的散射，表面至少需要像清漆层一样粗糙
        let basePerceptualRoughness = max(pixel_perceptualRoughness, material_clearCoatPerceptualRoughness);
        pixel_perceptualRoughness = mix(pixel_perceptualRoughness, basePerceptualRoughness, material_clearCoat);
    }

	// Clamp the roughness to a minimum value to avoid divisions by 0 during lighting
    pixel_perceptualRoughness = clamp(pixel_perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);
	// Remaps the roughness to a perceptually linear roughness (roughness^2)
    pixel_roughness = perceptualRoughnessToRoughness(pixel_perceptualRoughness);

    // ==getSubsurfacePixelParams============--------------------------------------------

    material_thickness = saturate(material_thickness);

    // ==getAnisotropyPixelParams============--------------------------------------------

    pixel_anisotropicB = normalize(cross(shading_geometricNormal, shading_anisotropicT));

    // ==getEnergyCompensationPixelParams====--------------------------------------------

    // 用于IBL的预积分的DFG项
    pixel_dfg = prefilteredDFG(pixel_perceptualRoughness, shading_NoV);

    if (!SHADING_AS_CLOTH) {
        // 非布料材质情况下（布料遮挡吸收，无多次反弹），追加BDRF函数中几何遮挡项的能量补偿
        // See "Multiple-Scattering Microfacet BSDFs with the Smith Model"
        pixel_energyCompensation = 1.0 + pixel_f0 * (1.0 / pixel_dfg.y - 1.0);
    }
    else {
        pixel_energyCompensation = vec3(1.0);

        if (MATERIAL_HAS_SHEENCOLOR) {
            // 用于光泽层的预积分的几何遮挡项G项
            pixel_sheenDFG = prefilteredDFG(material_sheenPerceptualRoughness, shading_NoV).z;
            // 光泽层源于表面绒毛作为几何遮挡项的遮挡反射，综合考虑其遮挡率和反射率得出底层光照穿过光泽层可穿透度
            pixel_sheenScaling = 1.0 - max_in_vec3(material_sheenColor) * pixel_sheenDFG;
        }
    }

    // END getPixelParams
}
