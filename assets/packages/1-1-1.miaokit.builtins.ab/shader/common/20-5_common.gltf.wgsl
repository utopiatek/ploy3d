
fn sample_baseColorTexture(uv: vec2f) ->vec4f {
    var color = vec4f(1.0);

    if (materialParams.baseColorTexture_sampler.x > 0) {
        color = textureSample(baseColorTexture, sampler_baseColorTexture, uv * materialParams.baseColorTexture_uvts.zw + materialParams.baseColorTexture_uvts.xy);
    }

    return color;
}

fn sample_diffuseTexture(uv: vec2f) ->vec4f {
    // 因为 KHR_materials_pbrSpecularGlossiness 扩展与 pbrMetallicRoughness 互斥，且功能类似，因此使用 pbrMetallicRoughness.baseColorTexture 代表 KHR_materials_pbrSpecularGlossiness.diffuseTexture
    return sample_baseColorTexture(uv);
}

fn sample_specularTexture(uv: vec2f) ->vec4f {
    var color = vec4f(1.0);

    if (materialParams.specularTexture_sampler.x > 0) {
        color = textureSample(specularTexture, sampler_specularTexture, uv * materialParams.specularTexture_uvts.zw + materialParams.specularTexture_uvts.xy);
    }

    return color;
}

fn sample_specularColorTexture(uv: vec2f) ->vec4f {
    var color = vec4f(1.0);

    if (materialParams.specularColorTexture_sampler.x > 0) {
        color = textureSample(specularColorTexture, sampler_specularColorTexture, uv * materialParams.specularColorTexture_uvts.zw + materialParams.specularColorTexture_uvts.xy);
    }

    return color;
}

fn sample_specularGlossinessTexture(uv: vec2f) ->vec4f {
    // 因为 KHR_materials_pbrSpecularGlossiness 扩展已经被 KHR_materials_specular 扩展取代，且两个扩展互斥，因此使用 KHR_materials_specular.specularColorTexture 代表 KHR_materials_pbrSpecularGlossiness.specularGlossinessTexture
    return sample_specularColorTexture(uv);
}

fn sample_metallicRoughnessTexture(uv: vec2f) ->vec4f {
    var color = vec4f(1.0);

    if (materialParams.metallicRoughnessTexture_sampler.x > 0) {
        color = textureSample(metallicRoughnessTexture, sampler_metallicRoughnessTexture, uv * materialParams.metallicRoughnessTexture_uvts.zw + materialParams.metallicRoughnessTexture_uvts.xy);
    }

    return color;
}

fn sample_emissiveTexture(uv: vec2f) ->vec4f {
    var color = vec4f(1.0);

    if (materialParams.emissiveTexture_sampler.x > 0) {
        color = textureSample(emissiveTexture, sampler_emissiveTexture, uv * materialParams.emissiveTexture_uvts.zw + materialParams.emissiveTexture_uvts.xy);
    }

    return color;
}

fn sample_occlusionTexture(uv: vec2f) ->vec4f {
    var color = vec4f(1.0);

    if (materialParams.occlusionTexture_sampler.x > 0) {
        color = textureSample(occlusionTexture, sampler_occlusionTexture, uv * materialParams.occlusionTexture_uvts.zw + materialParams.occlusionTexture_uvts.xy);
    }

    return color;
}

fn sample_normalTexture(uv: vec2f, frontNormal: vec3f) ->vec3f {
    return textureSample(normalTexture, sampler_normalTexture, uv * materialParams.normalTexture_uvts.zw + materialParams.normalTexture_uvts.xy).rgb;
}

fn material_gltf() {
    // 额外的控制参数
    let uAOPBRFactor        = 1.0;
    let uRoughnessPBRFactor = 1.0;
    let uCavityPBRFactor    = 0.5732;
    let uNormalMapFactor    = 1.0;

    // 扩展启用标志集
    // https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
    // https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos
    /// 0x1:    KHR_materials_pbrSpecularGlossiness (与 KHR_materials_specular 共用 specularFactor 属性变量)
    // 0x2: 
    // 0x3:
    // 0x4:
    // 0x10:   KHR_materials_anisotropy
    // 0x20:   KHR_materials_clearcoat
    // 0x40:   KHR_materials_dispersion
    // 0x80:   KHR_materials_emissive_strength
    // 0x100:  KHR_materials_ior
    // 0x200:  KHR_materials_iridescence
    // 0x400:  KHR_materials_sheen
    /// 0x800:  KHR_materials_specular
    // 0x1000: KHR_materials_transmission
    /// 0x2000: KHR_materials_unlit
    // 0x4000: KHR_materials_variants
    // 0x8000: KHR_materials_volume
    let extensions = materialParams.extensions;

    // 启用了非光照扩展
    if ((extensions & 0x2000) == 0x2000) {
        let color_baseColorTexture = sRGBToLinear_vec4(sample_baseColorTexture(inputs_uv));
        let baseColor = color_baseColorTexture * materialParams.baseColorFactor;

        material_alpha = computeMaskedAlpha(baseColor.a, materialParams.alphaCutoff);
        material_emissive = baseColor.rgb;

        return;
    }

    // 折射光线散射率，金属不存在散射（漫反射）
    var materialDiffuse = vec3f(1.0);
    // 垂直入射光线反射率（F0）
    var materialSpecular = vec3f(1.0);
    // 材质粗糙度线性值
    var materialRoughness = 1.0;
    // 材质不透明度
    var materialOpacity = 1.0;

    // 启用了 KHR_materials_pbrSpecularGlossiness 扩展
    if ((extensions & 0x1) == 0x1) {
        // 使用 sRGB 编码的反射颜色（RGB）和线性光泽度值（A）
        let color_specularGlossinessTexture = sRGBToLinear_vec4(sample_specularGlossinessTexture(inputs_uv));
        // 使用 sRGB 编码的散射颜色（RGB）和不透明度（A）
        let color_diffuseTexture = sRGBToLinear_vec4(sample_diffuseTexture(inputs_uv));

        let specular = color_specularGlossinessTexture.rgb * materialParams.specularFactor;
        let diffuse = color_diffuseTexture * materialParams.diffuseFactor;
        let glossiness = color_specularGlossinessTexture.a * materialParams.glossinessFactor;

        // KHR_materials_pbrSpecularGlossiness.specularFactor 含义等同 pbrMetallicRoughness.baseColorFactor
        materialSpecular = specular;
        // 散射率 * 折射率，确保 materialDiffuse + materialSpecular <= 1
        materialDiffuse = diffuse.rgb * (1.0 - max_in_vec3(specular));
        materialRoughness = 1.0 - glossiness;
        materialOpacity = diffuse.a;
    }
    // 启用了 pbrMetallicRoughness 扩展
    else {
        // 使用 sRGB 编码的散射颜色（RGB）和不透明度（A）
        let color_baseColorTexture = sRGBToLinear_vec4(sample_baseColorTexture(inputs_uv));
        // 使用线性编码，金属度值从 B 通道采样。粗糙度值从 G 通道采样
        let color_metallicRoughnessTexture = sample_metallicRoughnessTexture(inputs_uv);

        let diffuse = color_baseColorTexture * materialParams.baseColorFactor;
        let roughness = color_metallicRoughnessTexture.g * materialParams.roughnessFactor;
        let metallic = color_metallicRoughnessTexture.b * materialParams.metallicFactor;

        // 非金属成分入射后散射率，金属没有散射
        materialDiffuse = diffuse.rgb * (1.0 - metallic);
        materialRoughness = roughness;
        materialOpacity = diffuse.a;

        // 材质输入的 reflectance 输入范围[0, 1]，而自然界非金属物质反射率最高为钻石（0.16），所以需要对输入进行一个映射转换（computeDielectricF0）
        // 材质的 reflectance 也可以根据材质的折射率（IOR）计算得出
        // 单通道值，因此反射白色（非金属对不同波长反射率相等）
        // 默认 dielectricF0 == 0.04
        let reflectance = 0.5;
        var dielectricF0 = vec3f(0.16 * reflectance * reflectance);

        // 纯金属的反射率为baseColor
        var specular = diffuse.rgb;

        // 启用了 KHR_materials_specular 扩展
        if ((extensions & 0x800) == 0x800) {
            // 使用 sRGB 编码的F0颜色（RGB）
            let color_specularColorTexture = sRGBToLinear_vec4(sample_specularColorTexture(inputs_uv));
            // 使用线性编码，反射强度（A）
            let color_specularTexture= sample_specularTexture(inputs_uv);

            let specularColor = materialParams.specularColorFactor * color_specularColorTexture.rgb;
            let specularFactor = materialParams.specularFactor * color_specularTexture.a;

            // dielectricF90 = vec3f(specularFactor);
            dielectricF0 = min(0.04 * specularColor, vec3f(1.0)) * specularFactor;
            
            specular = specularColor * specularFactor;
        }

        materialSpecular = specular * metallic + (dielectricF0 * (1.0 - metallic));
    }

    // 进行可能的不透明度裁剪
    materialOpacity = computeMaskedAlpha(materialOpacity, materialParams.alphaCutoff);

    // 缩放粗糙度线性值
    materialRoughness *= uRoughnessPBRFactor;

    // 使用 sRGB 编码的自发光颜色（RGB）
    let color_emissiveTexture = sRGBToLinear_vec4(sample_emissiveTexture(inputs_uv));
    let materialEmit = materialParams.emissiveFactor * color_emissiveTexture.rgb;
    
    // 使用线性编码的间接光照接收度（R）
    let color_occlusionTexture = sample_occlusionTexture(inputs_uv);
    let materialAO = mix(1.0, color_occlusionTexture.r, uAOPBRFactor);

    let frontNormal = inputs_geometricNormal;
    var materialNormal = vec3(0.0, 0.0, 1.0);

    // 启用法线贴图
    if (materialParams.normalTexture_sampler.x > 0) {
        // 使用线性编码的切线空间法线（RBG）
        materialNormal = sample_normalTexture(inputs_uv, frontNormal);

        materialNormal = materialNormal * 2.0 - 1.0;

        materialNormal.x *= uNormalMapFactor;
        materialNormal.y *= uNormalMapFactor;

        materialNormal.y = -materialNormal.y;

        materialRoughness = adjustRoughnessNormalMap(materialRoughness, materialNormal);
    }

    // 相机空间坐标
    let vViewVertex = inputs_position;

    // ========================--------------------------------

    material_alpha = materialOpacity;
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

    prepareShading(
        0,
        inputs_position,
        inputs_clipPosition,
        frontNormal,
        materialNormal,
        vec3f(0.0, 0.0, 1.0),
        vec3f(0.0, 0.0, 1.0),
        vec3f(1.0, 0.0, 0.0)
    );
}
