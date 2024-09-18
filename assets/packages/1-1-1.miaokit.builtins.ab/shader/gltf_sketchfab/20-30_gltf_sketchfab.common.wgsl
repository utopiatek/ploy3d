
const QUALITY_USE_GEOMETRIC_SPECULAR_AA = true;
const QUALITY_USE_ALPHA_TO_COVERAGE = true;
const SHADING_AS_CLOTH = false;

const inputs_specularAntiAliasingVariance: f32 = 0.15;
const inputs_specularAntiAliasingThreshold: f32 = 0.04;
const inputs_iblRoughnessOneLevel: f32 = 4.0;

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

// 在没有清漆层的情况下，入射介质被假定为真空，即incidentIor = 1.0，又material_f0 = iorToF0(material_ior, 1.0)
// 根据material_f0可求材质折射率：material_ior = f0ToIor(material_f0)
// 加入清漆层后，incidentIor变为了1.5，需要重新计算material_f0，即material_f0 = iorToF0(material_ior, clearcoat_ior)
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
    return decodeDataForIBL(textureSampleLevel(iblSpecular, splll1, equirectangularUV(r), lod));
}

// 获取各项异性的偏置法线
fn getBentNormal(v: vec3f, n: vec3f) ->vec3f {
    if (material_anisotropy != 0.0) {
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
    return select(mix(pixel_dfg.xxx, pixel_dfg.yyy, material_f0), material_f0 * pixel_dfg.z, SHADING_AS_CLOTH);
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
    // ==getRoughnessPixelParams=============--------------------------------------------

    pixel_perceptualRoughness = material_perceptualRoughnessUnclamped;

	// 对粗糙度进行滤波，高光降噪
    if (QUALITY_USE_GEOMETRIC_SPECULAR_AA) {
        pixel_perceptualRoughness = normalFiltering(pixel_perceptualRoughness, shading_geometricNormal);
    }

    if (material_clearCoat > 0.0) {
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
        pixel_energyCompensation = 1.0 + material_f0 * (1.0 / pixel_dfg.y - 1.0);
    }
    else {
        pixel_energyCompensation = vec3(1.0);

        if (length(material_sheenColor) > 0.0) {
            // 用于光泽层的预积分的几何遮挡项G项
            pixel_sheenDFG = prefilteredDFG(material_sheenPerceptualRoughness, shading_NoV).z;
            // 光泽层源于表面绒毛作为几何遮挡项的遮挡反射，综合考虑其遮挡率和反射率得出底层光照穿过光泽层可穿透度
            pixel_sheenScaling = 1.0 - max_in_vec3(material_sheenColor) * pixel_sheenDFG;
        }
    }

    // END getPixelParams
}

// PBR ========================--------------------------------

fn computeAnisotropicBentNormal(v: vec3f, n: vec3f) ->vec3f {
    return getBentNormal(v, n);
}

fn computeDiffuseSPH(normal: vec3f) ->vec3f {
    // 将法线从相机空间转为全局空间，IBL在全局空间定义
    let n = mulMat3x3Float3(frameUniforms.gfvMat, normal);
    let diff = Irradiance_SphericalHarmonics(n);

    return diff; // TODO: diff / 3.1415926;
}

fn integrateBRDF() ->vec3f {
   return specularDFG();
}

fn prefilterEnvMapCube(r: vec3f, perceptualRoughness: f32) ->vec3f {
    return prefilteredRadiance(r, perceptualRoughness);
}

fn getSpecularDominantDir(n: vec3f, r: vec3f, roughness: f32) ->vec3f {
    return getSpecularDominantDirection(n, r, roughness);
}


fn getPrefilteredEnvMapColor(
    normal: vec3f,      // bentNormal
    eyeVector: vec3f,   // shading_view
    roughness: f32,     // pixel_perceptualRoughness
    frontNormal: vec3f  // shading_geometricNormal
) ->vec3f {
    var R = reflect(-eyeVector, normal);
    R = getSpecularDominantDir(normal, R, roughness);
    // 将反射向量从相机空间转为全局空间，IBL在全局空间定义
    R = mulMat3x3Float3(frameUniforms.gfvMat, R);
    var prefilteredColor = prefilterEnvMapCube(R, roughness);
    let factor = clamp(1.0 + dot(R, frontNormal), 0.0, 1.0);
    prefilteredColor *= factor * factor;
    return prefilteredColor;
}

fn computeIBLSpecularUE4(normal: vec3f, eyeVector: vec3f, roughness: f32, specular: vec3f, frontNormal: vec3f, f90: f32) ->vec3f {
    return specular * getPrefilteredEnvMapColor(normal, eyeVector, roughness, frontNormal) * integrateBRDF();
}

fn specularOcclusion(occlude: i32, ao: f32, normal: vec3f, eyeVector: vec3f) ->f32 {
    if (occlude == 0) {
        return 1.0;
    }

    let d = dot(normal, eyeVector) + ao;
    return clamp((d * d) - 1.0 + ao, 0.0, 1.0);
}

fn precomputeGGX(normal: vec3f, eyeVector: vec3f, roughness: f32) ->vec4f {
    let NoV = clamp(dot(normal, eyeVector), 0., 1.);
    let r2 = roughness * roughness;
    return vec4(r2, r2 * r2, NoV, NoV * (1.0 - r2));
}


fn D_GGX(precomputeGGX: vec4f, NoH: f32) ->f32 {
    let a2 = precomputeGGX.y;
    let d = (NoH * a2 - NoH) * NoH + 1.0;
    return a2 / (3.141593 * d * d);
}

fn D_GGX_Anisotropic(at: f32, ab: f32, ToH: f32, BoH: f32, NoH: f32) ->f32 {
    let a2 = at * ab;
    let d = vec3(ab * ToH, at * BoH, a2 * NoH);
    let x = a2 / dot(d, d);
    return a2 * (x * x) / 3.141593;
}

fn F_Schlick(f0: vec3f, f90: f32, VoH: f32) ->vec3f {
    let VoH5 = pow(1.0 - VoH, 5.0);
    return f90 * VoH5 + (1.0 - VoH5) * f0;
}

fn F_Schlick_(f0: f32, f90: f32, VoH: f32) ->f32 {
    return f0 + (f90 - f0) * pow(1.0 - VoH, 5.0);
}

fn V_SmithCorrelated(precomputeGGX: vec4f, NoL: f32) ->f32 {
    let a = precomputeGGX.x;
    let smithV = NoL * (precomputeGGX.w + a);
    let smithL = precomputeGGX.z * (NoL * (1.0 - a) + a);
    return 0.5 / (smithV + smithL);
}

fn V_SmithGGXCorrelated_Anisotropic(at: f32, ab: f32, ToV: f32, BoV: f32, ToL: f32, BoL: f32, NoV: f32, NoL: f32) ->f32 {
    let lambdaV = NoL * length(vec3(at * ToV, ab * BoV, NoV));
    let lambdaL = NoV * length(vec3(at * ToL, ab * BoL, NoL));
    return 0.5 / (lambdaV + lambdaL);
}

fn specularLobe(precomputeGGX: vec4f, normal: vec3f, eyeVector: vec3f, eyeLightDir: vec3f, specular: vec3f, NoL: f32, f90: f32) ->vec3f {
    let H = normalize(eyeVector + eyeLightDir);
    let NoH = clamp(dot(normal, H), 0., 1.);
    let VoH = clamp(dot(eyeLightDir, H), 0., 1.);
    let D = D_GGX(precomputeGGX, NoH);
    let V = V_SmithCorrelated(precomputeGGX, NoL);
    let F = F_Schlick(specular, f90, VoH);
    return (D * V * 3.141593) * F;
}

fn anisotropicLobe(precomputeGGX: vec4f, normal: vec3f, eyeVector: vec3f, eyeLightDir: vec3f, specular: vec3f, NoL: f32, f90: f32, anisotropicT: vec3f, anisotropicB: vec3f, anisotropy: f32) ->vec3f {
    let H = normalize(eyeVector + eyeLightDir);
    let NoH = clamp(dot(normal, H), 0., 1.);
    let NoV = clamp(dot(normal, eyeVector), 0., 1.);
    let VoH = clamp(dot(eyeLightDir, H), 0., 1.);
    let ToV = dot(anisotropicT, eyeVector);
    let BoV = dot(anisotropicB, eyeVector);
    let ToL = dot(anisotropicT, eyeLightDir);
    let BoL = dot(anisotropicB, eyeLightDir);
    let ToH = dot(anisotropicT, H);
    let BoH = dot(anisotropicB, H);
    var aspect = sqrt(1.0 - abs(anisotropy) * 0.9);
    if (anisotropy > 0.0) {
        aspect = 1.0 / aspect;
    }
    let at = precomputeGGX.x * aspect;
    let ab = precomputeGGX.x / aspect;
    let D = D_GGX_Anisotropic(at, ab, ToH, BoH, NoH);
    let V = V_SmithGGXCorrelated_Anisotropic(at, ab, ToV, BoV, ToL, BoL, NoV, NoL);
    let F = F_Schlick(specular, f90, VoH);
    return (D * V * 3.141593) * F;
}

fn computeLightLambertGGX(
    normal: vec3f,
    eyeVector: vec3f,
    NoL: f32,
    precomputeGGX: vec4f,
    diffuse: vec3f,
    specular: vec3f,
    attenuation: f32,
    lightColor: vec3f,
    eyeLightDir: vec3f,
    f90: f32) ->array<vec3f, 2> {

    let colorAttenuate = attenuation * NoL * lightColor;
    let specularOut = colorAttenuate * specularLobe(precomputeGGX, normal, eyeVector, eyeLightDir, specular, NoL, f90);
    let diffuseOut = colorAttenuate * diffuse;

    return array<vec3f, 2>(diffuseOut, specularOut);
}

fn PBR_main() ->vec4f {
    let uEnvironmentExposure            = 0.2; // frameUniforms.iblLuminance;
    let uAOPBROccludeSpecular           = 1;
    let uSketchfabLight0_diffuse        = vec4f(0.3894, 0.3983, 0.4988, 1.0) * 2.0;

    let materialDiffuse = material_diffuseColor;
    let materialSpecular = material_f0;
    let materialF90 = clamp(50.0 * material_f0.g, 0.0, 1.0);
    let materialRoughness = material_perceptualRoughnessUnclamped;
    let frontNormal = shading_geometricNormal;
    let materialNormal = shading_normal;
    let eyeVector = shading_view;
    let bentAnisotropicNormal = computeAnisotropicBentNormal(eyeVector, materialNormal);

    getPixelParams();

    // ========================--------------------------------

    var diffuse = materialDiffuse * computeDiffuseSPH(materialNormal);
    var specular = computeIBLSpecularUE4(bentAnisotropicNormal, eyeVector, materialRoughness, materialSpecular, frontNormal, materialF90);

    var materialAO = 1.0; // TODO: material_ambientOcclusion;
    if (true) {
        let uv = gl_FragCoord.xy * (1.0 / 2048.0) * 0.25 + vec2f(0.25, 0.0);
        let ssao = textureSampleLevel(colorRT, splln1, uv, 0.0).a;
        materialAO = min(materialAO, ssao);
    }

    let aoSpec = specularOcclusion(uAOPBROccludeSpecular, materialAO, materialNormal, eyeVector);

    diffuse *= uEnvironmentExposure * materialAO;
    specular *= uEnvironmentExposure * aoSpec;

    // ========================--------------------------------

    // prepGGX.x = pixel_roughness
    // prepGGX.y = pixel_roughness * pixel_roughness
    // prepGGX.z = shading_NoV
    // prepGGX.w = shading_NoV * (1.0 - pixel_roughness)
    let prepGGX = precomputeGGX(materialNormal, eyeVector, max(0.045, materialRoughness));

    var lightSpecular = vec3f(0.0);
    var lightDiffuse = vec3f(0.0);

    var attenuation = 0.0;
    var dotNL = 0.0;
    var eyeLightDir = vec3f(0.0);
    var lighted = true;

    //precomputeSun
    {
        attenuation = 1.0;
        eyeLightDir = -uSketchfabLight0_viewDirection;
        dotNL = dot(eyeLightDir, materialNormal);
    }

    //computeLightLambertGGX(materialNormal, eyeVector, dotNL, prepGGX, materialDiffuse, materialSpecular, attenuation, uSketchfabLight0_diffuse.rgb, eyeLightDir, materialF90, lightDiffuse, lightSpecular, lighted);
    {
        let normal = materialNormal;
        let NoL = dotNL;
        let diffuse_ = materialDiffuse;
        let specular_ = materialSpecular;
        let lightColor = uSketchfabLight0_diffuse.rgb;
        let f90 = materialF90;

        lighted = NoL > 0.0;

        if (lighted == false) {
            lightSpecular = vec3f(0.0);
            lightDiffuse = vec3f(0.0);
        }
        else {
            let colorAttenuate = attenuation * NoL * lightColor;
            lightSpecular = colorAttenuate * specularLobe(prepGGX, normal, eyeVector, eyeLightDir, specular_, NoL, f90);
            lightDiffuse = colorAttenuate * diffuse_;
        }
    }

    diffuse += lightDiffuse;
    specular += lightSpecular;

    //precomputeSun
    {
        attenuation = 1.0;
        //eyeLightDir = -uSketchfabLight1_viewDirection;
        eyeLightDir = mulMat3x3Float3(frameUniforms.vfgMat * frameUniforms.gfwMat, normalize(vec3f(1.0, 1.0, 0.0)));
        dotNL = dot(eyeLightDir, materialNormal);
    }

    //computeLightLambertGGX(materialNormal, eyeVector, dotNL, prepGGX, materialDiffuse, materialSpecular, attenuation, uSketchfabLight0_diffuse.rgb, eyeLightDir, materialF90, lightDiffuse, lightSpecular, lighted);
    {
        let normal = materialNormal;
        let NoL = dotNL;
        let diffuse = materialDiffuse;
        let specular = materialSpecular;
        let lightColor = uSketchfabLight1_diffuse.rgb * 0.5;
        let f90 = materialF90;

        lighted = NoL > 0.0;

        if (lighted == false) {
            lightSpecular = vec3f(0.0);
            lightDiffuse = vec3f(0.0);
        }
        else {
            let colorAttenuate = attenuation * NoL * lightColor;
            lightSpecular = colorAttenuate * specularLobe(prepGGX, normal, eyeVector, eyeLightDir, specular, NoL, f90);
            lightDiffuse = colorAttenuate * diffuse;
        }
    }

    var visibility = select(1.0, 0.0, VARIANT_HAS_SHADOWING);

    if (VARIANT_HAS_SHADOWING && dotNL > 0.0) {
        visibility = shadow(0);
    }

    diffuse += lightDiffuse * visibility;
    specular += lightSpecular * visibility;

    var frag = mix(specular, diffuse, checkerboard(gl_FragCoord.xy, uHalton));

    frag += material_emissive;

    if (!SHADING_OUTPUT_LINEAR) {
        frag = linearTosRGB_vec3(frag);
    }

    return encodeRGBM(frag, uRGBMRange);
}
