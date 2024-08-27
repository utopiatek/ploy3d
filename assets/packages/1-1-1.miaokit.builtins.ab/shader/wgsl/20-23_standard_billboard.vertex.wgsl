
var<private> vertices : array<vec4f, 3> = array<vec4f, 3>(
    vec4f(-0.5, -0.5, 0.0, 0.0),
    vec4f( 1.5, -0.5, 2.0, 0.0),
    vec4f(-0.5, 1.5, 0.0, 2.0),
);

fn material_vs() ->OutputVS {
    // 采样三角形顶点坐标
    var vertex = vertices[gl_VertexID];

    // 纹理映射坐标
    let uv = vertex.zw;

    // 齐次坐标
    vertex.z = 0.0;
    vertex.w = 1.0;

    // 缩放广告牌
    vertex.x *= materialParams.spriteSize.x;
    vertex.y *= materialParams.spriteSize.y;

    // 模型到相机空间变换矩阵
    var vfmMat = instance_vfwMat * instance_wfmMat;

    // 1:解锁绕X轴旋转、2:解锁绕Y轴旋转、3:解锁绕X|Y轴旋转
    let flags = materialParams.ctrlFlags;
    if(flags > 0) {
        if(flags == 1) {
            // 模型右向量在相机空间中的表示
            var vt = vfmMat[0].xyz;
            // 模型上向量在相机空间中的表示
            var vb = vfmMat[1].xyz;
            // 模型前向量在相机空间中的表示
            var vn = vfmMat[2].xyz;

            vt = vec3f(1.0, 0.0, 0.0);
            vn = cross(vt, vb);

            // 构造一个面向摄像机的模型矩阵
            let viewMat = transpose(mat4x4<f32>(vec4f(vt, 0.0), vec4f(vb, 0.0), vec4f(vn, 0.0), vec4f(0.0, 0.0, 0.0, 1.0)));

            // 更新模型到相机空间变换矩阵
            vfmMat = vfmMat * viewMat;
        } else {
            // https://github.com/vsgopenmw-dev/vsgopenmw/blob/7d0720581545553144963e03243fae071e142793/files/shaders/lib/math/billboard.glsl#L4

            vfmMat[0][0] = 1.0;
            vfmMat[0][1] = 0.0;
            vfmMat[0][2] = 0.0;

            if(flags == 3) {
                vfmMat[1][0] = 0.0;
                vfmMat[1][1] = 1.0;
                vfmMat[1][2] = 0.0;
            }

            vfmMat[2][0] = 0.0;
            vfmMat[2][1] = 0.0;
            vfmMat[2][2] = 1.0;
        }
    }

    // ==================---------------------------------------------

    var output: OutputVS;
    
    output.instanceID = gl_InstanceID;

    output.viewPosition = vfmMat * vertex;
    output.viewNormal = vec3f(0.0, 0.0, 1.0);
    output.viewTangent = vec4f(1.0, 0.0, 0.0, 1.0);
    output.uv = uv;

    output.litPosition = output.viewPosition;
    output.clipPosition = frameUniforms.cfvMat * output.viewPosition;

    output.gl_Position = output.clipPosition;

    return output;
}
