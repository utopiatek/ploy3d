
var<private> fragColor0: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);
var<private> fragColor1: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);

fn shading_fs() {
    fragColor0 = vec4f(material_baseColor, material_alpha);
}
