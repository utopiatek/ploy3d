
var<private> vViewVertex: vec3f = vec3f(0.0);
var<private> uAlbedoPBRFactor: vec3f = vec3f(1.0);
var<private> uOpacityFactor: f32 = 1.0;
var<private> uOpacityThinLayer = 0.0;
var<private> uMetalnessPBRFactor: f32 = 1.0;
var<private> uSpecularF0Factor: f32 = 1.0;
var<private> uRoughnessPBRFactor: f32 = 1.0;
var<private> uNormalMapFlipY: i32 = 1;
var<private> uNormalMapFactor: f32 = 1.0;
var<private> uScatteringFactorPacker = 0.1018;
var<private> uSubsurfaceScatteringFactor = 2.0;
var<private> uSubsurfaceScatteringProfile = 1.0;

fn init_uniforms() {
    vViewVertex = inputs_position;
    uAlbedoPBRFactor = materialParams.baseColorFactor.rgb;
    uOpacityFactor = materialParams.baseColorFactor.a;
    uOpacityThinLayer = 0.0;
    uMetalnessPBRFactor = materialParams.metallicFactor;
    uSpecularF0Factor = materialParams.specularFactor.x;
    uRoughnessPBRFactor = materialParams.roughnessFactor;
    uNormalMapFlipY = 1;
    uNormalMapFactor = 1.0;
    uScatteringFactorPacker = 0.1018;
    uSubsurfaceScatteringFactor = 2.0;
    uSubsurfaceScatteringProfile = 1.0;
}

fn sample_albedo() ->vec3f {
    var albedo = vec3f(1.0);

    if (materialParams.baseColorTexture_sampler.x > 0) {
        albedo = textureSample(baseColorTexture, sampler_baseColorTexture, inputs_uv * materialParams.baseColorTexture_uvts.zw + materialParams.baseColorTexture_uvts.xy).rgb;
    }

    return albedo;
}

fn sample_opacity() ->f32 {
    var opacity = 1.0;

    if (materialParams.baseColorTexture_sampler.x > 0) {
        opacity = textureSample(baseColorTexture, sampler_baseColorTexture, inputs_uv * materialParams.baseColorTexture_uvts.zw + materialParams.baseColorTexture_uvts.xy).a;
    }

    return opacity;
}

fn sample_metalness() ->f32 {
    var metalness = 0.0;

    if (materialParams.metallicRoughnessTexture_sampler.x > 0) {
        metalness = textureSample(metallicRoughnessTexture, sampler_metallicRoughnessTexture, inputs_uv * materialParams.metallicRoughnessTexture_uvts.zw + materialParams.metallicRoughnessTexture_uvts.xy).b;
    }

    return metalness;
}

fn sample_materialF0() ->f32 {
    var materialF0 = 1.0;

    if (materialParams.specularTexture_sampler.x > 0) {
        materialF0 = textureSample(specularTexture, sampler_specularTexture, inputs_uv * materialParams.specularTexture_uvts.zw + materialParams.specularTexture_uvts.xy).a;
    }

    return materialF0;
}

fn sample_scattering() ->f32 {
    var scattering = 0.0;

    if (materialParams.metallicRoughnessTexture_sampler.x > 0) {
        scattering = 1.0 - textureSample(metallicRoughnessTexture, sampler_metallicRoughnessTexture, inputs_uv * materialParams.metallicRoughnessTexture_uvts.zw + materialParams.metallicRoughnessTexture_uvts.xy).r;
    }

    return scattering;
}

fn sample_normalMap() ->vec3f {
    var normalMap = vec3f(0.5, 0.5, 1.0);

    if (materialParams.normalTexture_sampler.x > 0) {
        normalMap = textureSample(normalTexture, sampler_normalTexture, inputs_uv * materialParams.normalTexture_uvts.zw + materialParams.normalTexture_uvts.xy).rgb;
    }

    return normalMap;
}

fn getMaterialAlbedo() ->vec3f {
    return uAlbedoPBRFactor * sRGBToLinear_vec3(sample_albedo());
}

fn getMaterialOpacity() ->f32 {
    return uOpacityFactor * (sample_opacity());
}

fn getMaterialMetalness() ->f32 {
    return uMetalnessPBRFactor * (sample_metalness());
}

fn getMaterialF0() ->f32 {
    return uSpecularF0Factor * (sample_materialF0());
}

fn getMaterialRoughness() ->f32 {
    return uRoughnessPBRFactor;
}

fn getMaterialNormalMap() ->vec3f {
    var nmap = (sample_normalMap()) * 2.0 - 1.0;
    nmap.y = select(nmap.y, -nmap.y, uNormalMapFlipY == 1);
    return nmap;
}

fn transformNormal(factor: f32, normal: vec3f, t: vec3f, b: vec3f, n: vec3f) ->vec3f {
    let normal_ = vec3f(factor * normal.xy, normal.z);
    return normalize(normal_.x * t + normal_.y * b + normal_.z * n);
}

fn material_sketchfab() {
    init_uniforms();

    let linZ = ((inputs_depth / frameUniforms.vsmExponent) + 1.0) * 0.5;
    let thinLayer = uOpacityThinLayer;

    let alpha = getMaterialOpacity();
    let alphaCutoff = materialParams.alphaCutoff;

    let profile = uSubsurfaceScatteringProfile;
    let scatter = uScatteringFactorPacker * uSubsurfaceScatteringFactor * sample_scattering();

    let depth_scatter_alpha = earlyProc(linZ, thinLayer, alpha, alphaCutoff, profile, scatter, true);

    if (SHADING_SKIP) {
        return;
    }

    // ===================----------------------------------

    let frontNormal = inputs_geometricNormal;
    let tangent = inputs_geometricTangent;
    let binormal = normalize(inputs_vftMat[1]);

    let f0 = 0.08 * getMaterialF0();
    let metal = getMaterialMetalness();

    var materialDiffuse = getMaterialAlbedo();
    var materialSpecular = mix(vec3f(f0), materialDiffuse, metal);

    materialDiffuse *= 1.0 - metal;

    var materialRoughness = getMaterialRoughness();

    var materialNormal = frontNormal;
    materialNormal = getMaterialNormalMap();
    materialRoughness = adjustRoughnessNormalMap(materialRoughness, materialNormal);
    materialNormal = transformNormal(uNormalMapFactor, materialNormal, tangent.xyz, binormal, frontNormal);

    let materialEmit = vec3f(0.0);
    let materialAO = 0.0;

    // ===================----------------------------------

    material_alpha = depth_scatter_alpha.a;
    material_diffuseColor = materialDiffuse;
    material_f0 = materialSpecular;
    material_perceptualRoughnessUnclamped = materialRoughness;
    material_emissive = materialEmit;
    material_ambientOcclusion = materialAO;

    // material_clearCoat = materialParams.clearcoatFactor;
    // material_clearCoatPerceptualRoughness = materialParams.clearcoatRoughnessFactor;
    // material_anisotropy = 0.0;
    // material_postLightingColor = vec4f(0.0);
    // material_subsurfaceColor = vec3f(0.0);
    // material_subsurfacePower = 12.0;
    // material_sheenColor = vec3f(0.0);
    // material_sheenPerceptualRoughness = 0.0;
    // material_ior = 1.5;
    // material_transmission = 1.0;
    // material_absorption = vec3f(0.0);
    // material_thickness = 0.5;
    // material_uThickness = 0.1;

    // 以下代码等同调用prepareShading函数

    shading_flags = 0;
    shading_position = vViewVertex;
    shading_normalizedViewportCoord = inputs_clipPosition.xy * (0.5 / inputs_clipPosition.w) + 0.5;
    shading_view = normalize(-vViewVertex);

    shading_geometricNormal = frontNormal;
    shading_normal = materialNormal;
    shading_bentNormal = materialNormal;
    shading_clearCoatNormal = frontNormal;
    shading_anisotropicT = normalize(inputs_vftMat * vec3f(1.0, 0.0, 0.0));

    shading_reflected = reflect(-shading_view, shading_normal);
    shading_NoV = clampNoV(dot(shading_normal, shading_view));
}
