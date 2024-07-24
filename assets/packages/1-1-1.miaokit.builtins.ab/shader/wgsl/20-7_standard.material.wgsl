
fn material_fs() {
    material_baseColor = inputs_geometricNormal;

    // ...

    computeMaskedAlpha(1.0, 0.0);
    prepareShading(vec4f(0.0), vec3f(0.0), vec3f(0.0), vec3f(0.0), vec3f(0.0));
}
