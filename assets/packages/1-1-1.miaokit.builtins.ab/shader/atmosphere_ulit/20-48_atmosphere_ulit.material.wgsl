
fn material_fs() {
    let color = atmosphere_proc(inputs_litPosition.xyz, false);

    material_emissive = color.rgb;
    material_alpha = color.a;
}
