
fn material_vs() ->OutputVS {
    var output: OutputVS;
    
    output.instanceData = instance_data;

    // 在此可以添加一些用户代码来修改或提供模型空间顶点属性 ...

    let worldPosition = mulMat4x4Float3(instance_wfmMat, vec3f(mesh_position.x, mesh_position.y - 6378137.0, mesh_position.z));
    let worldNormal = instance_normal_wfmMat * mesh_normal;
    let worldTangent = instance_normal_wfmMat * mesh_tangent.xyz;

    // 在此可以添加一些用户代码来修改或提供世界空间顶点属性 ...

    output.viewPosition = instance_vfwMat * worldPosition;
    // 我们不需要在这里对向量进行归一化，即使矩阵中包含缩放
    // 我们确保instance_normal_wfmMat的缩放使法线所有通道小于1.0
    // 这样可以防止副法线超过fp16的范围，我们在插值后的片元着色器中重新归一化
    output.viewNormal = mulMat3x3Float3(instance_vfwMat, worldNormal);
    output.viewTangent = vec4f(mulMat3x3Float3(instance_vfwMat, worldTangent), mesh_tangent.w);
    output.uv = mesh_uv;

    // 在此可以添加一些用户代码来修改或提供相机空间顶点属性 ...

    output.clipPosition = frameUniforms.cfvMat * output.viewPosition;
    output.gl_Position = output.clipPosition;

    // 使用litPosition字段保存worldPosition
    output.litPosition = worldPosition;

    return output;
}
