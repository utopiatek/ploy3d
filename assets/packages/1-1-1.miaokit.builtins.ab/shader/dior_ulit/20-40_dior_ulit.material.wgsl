
fn material_fs() {
    let linZ = ((inputs_depth / frameUniforms.vsmExponent) + 1.0) * 0.5;
    let depth_scatter_alpha = earlyProc(linZ, 0.0, 1.0, 1.0, 0.0, 0.0, true);

    if (SHADING_SKIP) {
        return;
    }

    var uv = fract(inputs_uv);
    uv.y = 1.0 - uv.y;
	uv = inputs_custom2.xy + inputs_custom2.zw * uv;

    material_emissive = textureSample(atlas2D, splln1, uv, inputs_custom1.x).xyz;
}
