
//let linRoughnessToMipmap            = perceptualRoughnessToLod
//let uEnvironmentTransform           = mat3x3<f32>(frameUniforms.gfvMat);

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

// =================-------------------------------------

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
    return getPrefilteredEnvMapColor(normal, eyeVector, roughness, frontNormal) * integrateBRDF();
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

fn sketchfab_fs() ->vec4f {
    getPixelParams();

    let eyeVector                       = shading_view;
    let frontNormal                     = shading_geometricNormal;
    let materialSpecular                = pixel_f0;
    let materialDiffuse                 = pixel_diffuseColor;
    let materialRoughness               = material_perceptualRoughnessUnclamped;
    let materialNormal                  = shading_normal;
    let uEnvironmentExposure            = 0.2; // frameUniforms.iblLuminance;
    let uAOPBROccludeSpecular           = 1;
    let uOutputLinear                   = 1;
    let uSketchfabLight0_diffuse        = vec4f(0.3894, 0.3983, 0.4988, 1.0) * 2.0;
    let uSubsurfaceTranslucencyThicknessFactor  = 2.7614;
    let uSubsurfaceTranslucencyColor    = vec3f(0.0); // pixel_subsurfaceColor;
    let uSubsurfaceTranslucencyFactor   = 0.2628;
    
    let materialF90 = clamp(50.0 * materialSpecular.g, 0.0, 1.0);
    let bentAnisotropicNormal = computeAnisotropicBentNormal(eyeVector, materialNormal);

    var diffuse = materialDiffuse * computeDiffuseSPH(materialNormal);
    var specular = computeIBLSpecularUE4(bentAnisotropicNormal, eyeVector, materialRoughness, materialSpecular, frontNormal, materialF90);

    var materialAO = material_ambientOcclusion;
    // #if 1
    // float ssao = evaluateSSAO();
    // materialAO = min(materialAO, ssao);
    // #endif

    let aoSpec = specularOcclusion(uAOPBROccludeSpecular, materialAO, materialNormal, eyeVector);

    diffuse *= uEnvironmentExposure * materialAO;
    specular *= uEnvironmentExposure * aoSpec;

    // prepGGX.x = pixel_roughness
    // prepGGX.y = pixel_roughness * pixel_roughness
    // prepGGX.z = shading_NoV
    // prepGGX.w = shading_NoV * (1.0 - pixel_roughness)
    let prepGGX = precomputeGGX(materialNormal, eyeVector, pixel_perceptualRoughness);

    // BEG precomputeSun
    let eyeLightDir = normalize(mulMat3x3Float3(frameUniforms.vfgMat, frameUniforms.sunlitDirection.xyz));
    let attenuation = 1.0;
    let dotNL = dot(eyeLightDir, materialNormal);
    let geometry_dotNL = dot(eyeLightDir, frontNormal);
    // END precomputeSun

    if(geometry_dotNL > 0.01) {
        let lit = computeLightLambertGGX(materialNormal, eyeVector, dotNL, prepGGX, materialDiffuse, materialSpecular, attenuation, uSketchfabLight0_diffuse.rgb, eyeLightDir, materialF90);
        let lightDiffuse = lit[0];
        let lightSpecular = lit[1];

        var shadow = shadow(0);
        // 此举优化边缘处的锯齿
        let sm = min((geometry_dotNL - 0.01) * 10.0, 1.0);
        shadow = shadow * sm * sm;

        diffuse += lightDiffuse * shadow;
        specular += lightSpecular * shadow;
    }

    let frag = linearTosRGB_vec3(diffuse + specular) + material_emissive;

    return vec4f(frag, 1.0);
}

var<private> fragColor0: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);
var<private> fragColor1: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);

fn shading_fs() {
    fragColor0 = sketchfab_fs();

    // let vlit = mulMat3x3Float3((frameUniforms.vfgMat * frameUniforms.gfwMat), frameUniforms.sunlitDirection.xyz);
    // let nol = saturate(dot(inputs_geometricNormal, vlit));
    // var visibility = 0.0;
    // if (nol > 0.0) {
    //     visibility = shadow(0);
    // }

    //fragColor0 = vec4f(material_baseColor * (0.5 + 0.5 * visibility), material_alpha);

    //fragColor0 = vec4f(vec3(material_alpha), 1.0);
    //fragColor0 = vec4f(vec3(material_baseColor), 1.0);
    //fragColor0 = vec4f(vec3(material_clearCoat), 1.0);
    //fragColor0 = vec4f(vec3(material_clearCoatPerceptualRoughness), 1.0);
    //fragColor0 = vec4f(vec3(material_anisotropy), 1.0);
    //fragColor0 = vec4f(vec3(material_ambientOcclusion), 1.0);
    //fragColor0 = vec4f(vec3(material_perceptualRoughnessUnclamped), 1.0);
    //fragColor0 = vec4f(vec3(material_metallic), 1.0);
    //fragColor0 = vec4f(vec3(material_reflectance), 1.0);
    //fragColor0 = vec4f(vec3(material_emissive), 1.0);
    //fragColor0 = vec4f(vec3(material_postLightingColor.xyz), 1.0);
    //fragColor0 = vec4f(vec3(material_subsurfaceColor), 1.0);
    //fragColor0 = vec4f(vec3(material_subsurfacePower), 1.0);
    //fragColor0 = vec4f(vec3(material_sheenColor), 1.0);
    //fragColor0 = vec4f(vec3(material_sheenPerceptualRoughness), 1.0);
    //fragColor0 = vec4f(vec3(material_ior), 1.0);
    //fragColor0 = vec4f(vec3(material_transmission), 1.0);
    //fragColor0 = vec4f(vec3(material_absorption), 1.0);
    //fragColor0 = vec4f(vec3(material_thickness), 1.0);
    //fragColor0 = vec4f(vec3(material_uThickness), 1.0);

    //fragColor0 = vec4f(vec3(shading_position), 1.0);
    //fragColor0 = vec4f(vec3(shading_geometricNormal), 1.0);
    //fragColor0 = vec4f(vec3(shading_tangentToView[0]), 1.0);
    //fragColor0 = vec4f(vec3(shading_tangentToView[1]), 1.0);
    //fragColor0 = vec4f(vec3(shading_tangentToView[2]), 1.0);
    //fragColor0 = vec4f(vec3(shading_normalizedViewportCoord, 0.0), 1.0);
    //fragColor0 = vec4f(vec3(shading_view), 1.0);
    //fragColor0 = vec4f(vec3(shading_normal), 1.0);
    //fragColor0 = vec4f(vec3(shading_reflected), 1.0);
    //fragColor0 = vec4f(vec3(shading_NoV), 1.0);
    //fragColor0 = vec4f(vec3(shading_bentNormal), 1.0);
    //fragColor0 = vec4f(vec3(shading_clearCoatNormal), 1.0);
    //fragColor0 = vec4f(vec3(shading_anisotropicT), 1.0);
}
