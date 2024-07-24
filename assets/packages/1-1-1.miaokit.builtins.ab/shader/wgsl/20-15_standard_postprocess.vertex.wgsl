
const positions : array<vec4f, 3> = array<vec4f, 3>(
    vec4f(-1.0, -1.0, 1.0, 1.0),
    vec4f( 3.0, -1.0, 1.0, 1.0),
    vec4f(-1.0,  3.0, 1.0, 1.0),
);

// 顶点材质方法（在顶点着色器入口函数中先调用init_vertex_0，后调用material_vs）
fn material_vs() ->OutputVS {
    var output: OutputVS;

    output.gl_Position = positions[gl_VertexID];
    output.clipPosition = positions[gl_VertexID];
    
    output.litPosition = vec4f(0.0);
    output.viewPosition = vec4f(0.0);
    output.viewNormal = vec3f(0.0, 0.0, 1.0);
    output.viewTangent = vec4f(1.0, 0.0, 0.0, 1.0);
    output.uv = output.gl_Position.xy * 0.5 + 0.5;

    return output;
}
