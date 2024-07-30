
var<private> material_alpha: f32 = 1.0;
var<private> material_baseColor: vec3f = vec3f(0.0);

fn material_fs() {
    let layer = materialParams.layers_layer.y;
    let uvst = materialParams.layers_uvst1;
    let uv = uvst.xy + uvst.zw * inputs_uv;

    material_baseColor = textureSample(atlas2D, splln1, uv, layer).xyz;
}
