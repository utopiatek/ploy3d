
var<private> fragColor0: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);
var<private> fragColor1: vec4f = vec4f(0.0, 0.0, 0.0, 1.0);

fn shading_fs() {
    let vlit = mulMat3x3Float3((frameUniforms.vfgMat * frameUniforms.gfwMat), frameUniforms.sunlitDirection.xyz);
    let nol = saturate(dot(inputs_geometricNormal, vlit));
    var visibility = 0.0;
    if (nol > 0.0) {
        visibility = shadow(0);
    }

    fragColor0 = vec4f(material_baseColor * (0.5 + 0.5 * visibility), material_alpha);
}
