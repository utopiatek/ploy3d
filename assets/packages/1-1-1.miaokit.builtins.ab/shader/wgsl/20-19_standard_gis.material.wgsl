
var<private> material_alpha: f32 = 1.0;
var<private> material_baseColor: vec3f = vec3f(0.0);

fn material_fs() {
    material_baseColor = vec3f(inputs_uv, 0.0);
}
