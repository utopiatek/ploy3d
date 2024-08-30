
fn material_fs() {
    let color_baseTex = textureSample(baseTex, sampler_baseTex, inputs_uv);
    let color_glossinessTex = textureSample(glossinessTex, sampler_glossinessTex, inputs_uv);
    let color_specularTex = textureSample(specularTex, sampler_specularTex, inputs_uv);
    let color_normalTex = textureSample(normalTex, sampler_normalTex, inputs_uv);
    let color_aoTex = textureSample(aoTex, sampler_aoTex, inputs_uv);
    let color_emissiveTex = textureSample(emissiveTex, sampler_emissiveTex, inputs_uv);

    material_baseColor = color_emissiveTex.xyz;
    //material_baseColor = inputs_geometricNormal;

    // ...

    computeMaskedAlpha(1.0, 0.0);
    prepareShading(vec4f(0.0), vec3f(0.0), vec3f(0.0), vec3f(0.0), vec3f(0.0));
}
