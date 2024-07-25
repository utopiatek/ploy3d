
fn material_vs() ->OutputVS {
    var output: OutputVS;

    // 在此可以添加一些用户代码来修改或提供模型空间顶点属性 ...

    // 相机观察点墨卡托坐标
    let focusMC = materialParams.focusMC;
    // 相机观察点世界坐标
    let focusPos = materialParams.focusPos;

    // 相机观察点所在纬度
    var lat_ = focusMC.y / 20037508.3427892 * 3.141592654;

    lat_ = (2.0 * atan(exp(lat_)) - 1.570796327);

    let sinLat = sin(lat_);
    let cosLat = cos(lat_);

    // ===============-------------------------------------

    // 网格原点墨卡托坐标
    let centerMC = materialParams.centerMC;
    // 网格顶点墨卡托坐标偏移
    let offsetMC = mesh_position.xyz * materialParams.size;

    // 网格顶点所在纬度
    let mc_z = offsetMC.z - centerMC.y;
    var lat = mc_z / 20037508.3427892 * 3.141592654;

    lat = (2.0 * atan(exp(lat)) - 1.570796327);

    var y = cos(lat);
    let z = sin(lat);

    // 网格顶点与相机观察点的经度夹角，操作将使观察点X值为0
    var mc_x = offsetMC.x + centerMC.x - focusMC.x;
    mc_x = min(20037508.34, mc_x);
    mc_x = max(-20037508.34, mc_x);

    let lng = (mc_x / 40075016.69) * (3.1415926536 * 2.0);

    let x = y * sin(lng);

    // 根据经度最终确定Y值
    y = y * cos(lng);

    // ===============-------------------------------------

    // 网格顶点法线，绕X轴旋转，使观察点Y、Z值为0
    let normal = normalize(vec3f(x, y * cosLat - z * sinLat, y * sinLat + z * cosLat));

    // 网格顶点海拔高度
    let height = 0.0;

    // 生成地球大小网格
    var vertex = normal * (height + 6378137.0);
    // 使观察点在XZ平面上
    vertex.y -= 6378137.0;

    // 平移地球至世界空间（球面坐标单位）相机观察点坐标处
    vertex.x += focusPos.x;
    vertex.z += focusPos.y;

    ////////////////////////////////////////////

    let worldPosition = vec4f(vertex, 1.0);
    let worldNormal = normal;
    let worldTangent = vec3f(1.0, 0.0, 0.0);

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

    return output;
}
