
fn material_fs() {
    var uv = fract(inputs_uv);
    uv.y = 1.0 - uv.y;
	uv = inputs_custom2.xy + inputs_custom2.zw * uv;

    inputs_geometricNormal = textureSample(atlas2D, splln1, uv, inputs_custom1.x).xyz;
}
