
fn material_fs() {

    // ========================--------------------------------

    var color_baseTex = vec4f(1.0);

    if (materialParams.baseTex_sampler.x > 0) {
        color_baseTex = textureSample(baseTex, sampler_baseTex, inputs_uv * materialParams.baseTex_uvts.zw + materialParams.baseTex_uvts.xy);
    }
    else {
        color_baseTex = unpack4x8unorm(materialParams.baseTex_sampler.y);
    }

    // ========================--------------------------------

    var color_alphaTex = color_baseTex.a;

    if (materialParams.alphaTex_sampler.x > 0) {
        color_alphaTex = textureSample(alphaTex, sampler_alphaTex, inputs_uv * materialParams.alphaTex_uvts.zw + materialParams.alphaTex_uvts.xy).r;
    }

    // ========================--------------------------------

    var alpha = color_alphaTex * materialParams.baseColor.w + materialParams.alphaBias;
    var alpha_maskThreshold = 0.5;

    material_alpha = computeMaskedAlpha(alpha, alpha_maskThreshold);

    // ========================--------------------------------

    var color_specularTex = 1.0;

    if (false && materialParams.specularTex_sampler.x > 0) {
        color_specularTex = textureSample(specularTex, sampler_specularTex, inputs_uv * materialParams.specularTex_uvts.zw + materialParams.specularTex_uvts.xy).b;
    }
    else {
        color_specularTex = unpack4x8unorm(materialParams.specularTex_sampler.y).r;
    }

    // ========================--------------------------------

    var color_glossinessTex = 1.0;

    if (materialParams.glossinessTex_sampler.x > 0) {
        color_glossinessTex = textureSample(glossinessTex, sampler_glossinessTex, inputs_uv * materialParams.glossinessTex_uvts.zw + materialParams.glossinessTex_uvts.xy).g;
    }
    else {
        color_glossinessTex = unpack4x8unorm(materialParams.glossinessTex_sampler.y).r;
    }

    // TODO：当前传入的是粗糙度贴图
    color_glossinessTex = 1.0 - color_glossinessTex;

    // ========================--------------------------------

    var color_aoTex = 1.0;

    if (materialParams.aoTex_sampler.x > 0) {
        color_aoTex = textureSample(aoTex, sampler_aoTex, inputs_uv * materialParams.aoTex_uvts.zw + materialParams.aoTex_uvts.xy).r;
    }

    // ========================--------------------------------

    var color_emissiveTex = vec3f(0.0);

    if (materialParams.emissiveTex_sampler.x > 0) {
        color_emissiveTex = textureSample(emissiveTex, sampler_emissiveTex, inputs_uv * materialParams.emissiveTex_uvts.zw + materialParams.emissiveTex_uvts.xy).xyz;
    }
    else {
        color_emissiveTex = unpack4x8unorm(materialParams.emissiveTex_sampler.y).xyz;
    }

    // ========================--------------------------------

    let uDiffusePBRFactor   = materialParams.baseColor.xyz;
    // 1.0倍表示0.08，最高表示为钻石0.16
    let uSpecularPBRFactor  = materialParams.specularFactor;
    let uNormalMapFactor    = materialParams.bumpinessFactor;
    let uRoughnessPBRFactor = 1.0; // (1.0 / materialParams.glossinessFactor);
    let uAOPBRFactor        = 1.0;
    let uCavityPBRFactor    = 0.5732;

    // ========================--------------------------------

    material_baseColor = uDiffusePBRFactor * sRGBToLinear_vec3(color_baseTex.rgb);
    material_ambientOcclusion = mix(1.0, color_aoTex, uAOPBRFactor);
    material_metallic = materialParams.metallicFactor;
    material_reflectance = uSpecularPBRFactor * color_specularTex;
    material_emissive = color_emissiveTex * materialParams.emissiveFactor * materialParams.emissiveIntensity;

    material_perceptualRoughnessUnclamped = uRoughnessPBRFactor * (1.0 - color_glossinessTex);

    // ========================--------------------------------

    var color_normalTex = inputs_geometricNormal;

    if (materialParams.normalTex_sampler.x > 0) {
        color_normalTex = textureSample(normalTex, sampler_normalTex, inputs_uv * materialParams.normalTex_uvts.zw + materialParams.normalTex_uvts.xy).xyz;
        color_normalTex = color_normalTex * 2.0 - 1.0;

        color_normalTex.x *= uNormalMapFactor;
        color_normalTex.y *= uNormalMapFactor;

        // TODO: VARIANT_USE_NORMAL_MAP_FLIPY
        color_normalTex.y = -color_normalTex.y;

        material_perceptualRoughnessUnclamped = adjustRoughnessNormalMap(material_perceptualRoughnessUnclamped, color_normalTex);
    }

    // ========================--------------------------------

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

    shading_position = inputs_position;
    shading_geometricNormal = inputs_geometricNormal;
    shading_tangentToView = inputs_vftMat;
    
    // clipPosition, normal, bentNormal, clearCoatNormal, anisotropyDirection
    prepareShading(inputs_clipPosition, color_normalTex, color_normalTex, color_normalTex, vec3f(1.0, 0.0, 0.0));
}
