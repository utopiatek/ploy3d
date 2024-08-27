
// 顶点材质方法（在顶点着色器入口函数中先调用init_vertex_1/init_vertex_3，后调用material_vs）
fn material_vs() ->OutputVS {
    var output: OutputVS;
    
    output.instanceID = gl_InstanceID;

    // 在此可以添加一些用户代码来修改或提供模型空间顶点属性 ...

    let worldPosition = mulMat4x4Float3(instance_wfmMat, mesh_position);
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
    
    output.litPosition = vec4f(0.0);
    if (VARIANT_HAS_DIRECTIONAL_LIGHTING && VARIANT_HAS_SHADOWING) {
        output.litPosition = computeLightSpacePosition(output.viewPosition.xyz, output.viewNormal, 0u);
    }

    if (VARIANT_HAS_VSM) {
        // 对于VSM，我们使用线性光照空间Z坐标作为深度度量，它适用于平行光和聚光灯，并且可以安全地进行插值
        // 在相机空间中，该值保证在[-znear，-zfar]之间，使用output.viewPosition.w存储内插光照空间深度
        let z = output.viewPosition.z;
        // 重新缩放 [near, far] 到 [0, 1]
        let depth = -z * frameUniforms.camera_params.y/*oneOverFarMinusNear*/ - frameUniforms.camera_params.z/*nearOverFarMinusNear*/;
        // EVSM pre-mapping，结果在[-vsmExponent, +vsmExponent]之间，表示指数，其后用exp方法转换为曲线
        output.viewPosition.w = frameUniforms.vsmExponent * (depth * 2.0 - 1.0);
    }

    return output;
}
