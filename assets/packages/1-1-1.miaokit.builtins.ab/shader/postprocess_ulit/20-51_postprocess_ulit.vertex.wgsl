
override MIPMAP_ZDEPTH = 0u;
override EXTRACT_SSAO = 0u;
override EXTRACT_SSR = 0u;
override EXTRACT_SSS = 0u;
override BLUR_SSS = 0u;
override BLIT_CANVAS = 0u;
override BLIT_CANVAS_COMBINE_SSS = 1u;
override BLIT_CANVAS_TONE_MAPPING = 1u;

var<private> positions : array<vec4f, 3> = array<vec4f, 3>(
    vec4f(-1.0, -1.0, 1.0, 1.0),
    vec4f( 3.0, -1.0, 1.0, 1.0),
    vec4f(-1.0,  3.0, 1.0, 1.0),
);

fn material_vs() ->OutputVS {
    let MIPMAP_ZDEPTH_ = MIPMAP_ZDEPTH;
    let EXTRACT_SSAO_ = EXTRACT_SSAO;
    let EXTRACT_SSR_ = EXTRACT_SSR;
    let EXTRACT_SSS_ = EXTRACT_SSS;
    let BLUR_SSS_ = BLUR_SSS;
    let BLIT_CANVAS_ = BLIT_CANVAS;
    let BLIT_CANVAS_COMBINE_SSS_ = BLIT_CANVAS_COMBINE_SSS;
    let BLIT_CANVAS_TONE_MAPPING_ = BLIT_CANVAS_TONE_MAPPING;

    // ============================-------------------------------------

    var output: OutputVS;

    output.instanceData = instance_data;

    output.gl_Position = positions[gl_VertexID];
    output.clipPosition = positions[gl_VertexID];
    
    output.litPosition = vec4f(0.0);
    output.viewPosition = vec4f(0.0);
    output.viewNormal = vec3f(0.0, 0.0, 1.0);
    output.viewTangent = vec4f(1.0, 0.0, 0.0, 1.0);
    output.uv = output.gl_Position.xy * 0.5 + 0.5;

    return output;
}
