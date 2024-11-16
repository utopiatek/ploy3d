
fn material_fs() {
    let linZ = ((inputs_depth / frameUniforms.vsmExponent) + 1.0) * 0.5;
    let depth_scatter_alpha = earlyProc(linZ, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, true);

    if (SHADING_SKIP) {
        return;
    }

    let layer = materialParams.layers_layer.y;
    let uvst = materialParams.layers_uvst1;
    let uv = uvst.xy + uvst.zw * inputs_uv;

    material_emissive = sRGBToLinear_vec3(textureSample(atlas2D, splln1, uv, layer).xyz);

    let vLit = mulMat3x3Float3((frameUniforms.vfgMat * frameUniforms.gfwMat), frameUniforms.sunlitDirection.xyz);
    let NoL = saturate(dot(inputs_geometricNormal, vLit));
    if (NoL > 0.0) {
        let visibility = shadow(0);

        material_emissive = material_emissive * (0.5 + 0.5 * visibility);
    }

    let color = encodeRGBM(material_emissive, uRGBMRange);
    // var color = atmosphere_proc(inputs_custom2.xyz, true);
    // var rgb = decodeRGBM(color, uRGBMRange);
    // rgb = material_emissive + material_emissive * rgb;
    // color = encodeRGBM(rgb, uRGBMRange);

    material_emissive = color.rgb;
    material_alpha = color.a;
}
