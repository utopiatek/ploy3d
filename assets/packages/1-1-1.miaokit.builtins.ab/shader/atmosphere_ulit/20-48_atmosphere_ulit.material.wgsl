
fn material_fs() {
    let color = atmosphere_proc(inputs_litPosition.xyz);

    material_emissive = color.rgb;
    material_alpha = color.a;
}
