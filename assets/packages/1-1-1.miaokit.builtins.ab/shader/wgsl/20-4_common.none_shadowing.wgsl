
fn computeLightSpacePosition(viewPosition: vec3f, viewNormal: vec3f, cascade: u32) ->vec4f {
    return vec4(0.0, 0.0, 1.0, 1.0);
}

fn encodeShadow(linearDepth: f32, alpha: f32, threshold: f32) -> vec4f {
    return vec4f(255.93748, 65504.0, 255.93748, 65504.0);
}
