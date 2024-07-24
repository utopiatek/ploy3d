
var<private> material_alpha: f32 = 1.0;
var<private> material_baseColor: vec3f = vec3f(0.0);

fn material_fs() {
    material_baseColor = textureSample(colorRT, splln1, vec2f(inputs_uv.x, 1.0 - inputs_uv.y)).xyz;
}
