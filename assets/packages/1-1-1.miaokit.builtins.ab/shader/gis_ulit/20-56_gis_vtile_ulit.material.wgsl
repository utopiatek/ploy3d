
override VARIANT_DRAW_LINE = false;

fn material_fs() {
    let linZ = ((inputs_depth / frameUniforms.vsmExponent) + 1.0) * 0.5;
    let depth_scatter_alpha = earlyProc(linZ, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, true);

    if (SHADING_SKIP) {
        return;
    }

    material_emissive = vec3f(1.0, 0.0, 0.0);

    if (VARIANT_DRAW_LINE) {
        material_emissive.g = 1.0;
    }

    let vLit = mulMat3x3Float3((frameUniforms.vfgMat * frameUniforms.gfwMat), frameUniforms.sunlitDirection.xyz);
    let NoL = saturate(dot(inputs_geometricNormal, vLit));
    if (NoL > 0.0) {
        let visibility = shadow(0);

        material_emissive = material_emissive * (0.5 + 0.5 * visibility);
    }

    let color = encodeRGBM(material_emissive, uRGBMRange);

    material_emissive = color.rgb;
    material_alpha = color.a;
}
