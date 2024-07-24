
var<private> material_alpha: f32 = 1.0;
var<private> material_baseColor: vec3f = vec3f(0.0);

fn material_fs() {
    var uv = fract(inputs_uv);
    uv.y = 1.0 - uv.y;
	uv = inputs_custom2.xy + inputs_custom2.zw * uv;

    material_baseColor = textureSample(atlas2D, splln1, uv, inputs_custom1.x).xyz;
}
