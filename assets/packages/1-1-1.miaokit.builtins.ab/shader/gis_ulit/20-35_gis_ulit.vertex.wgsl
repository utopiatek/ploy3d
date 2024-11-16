
fn material_vs() ->OutputVS {
    var output: OutputVS;
    
    output.instanceData = instance_data;

    // 地球半周长
    let perimeter_half = 20037508.3428;
    // 地球赤道半径
    let radius = 6378137.0;

    // 原始网格顶点坐标（单位MC）
    let mesh_xz = mesh_position.xz * materialParams.size;

    // 传递片元真实墨卡托坐标
    output.custom2 = vec4f(vec2f(mesh_xz.x + materialParams.centerMC.x, -(mesh_xz.y - materialParams.centerMC.y)), 0.0, 0.0);

    // 平移网格，使相机观察点顶点坐标X值为0
    var x_mc = mesh_xz.x - materialParams.movedMC.x;
    // 计算网格顶点的真实纬度以生成正确的球面（注意网格南正北负、而墨卡托投影南负北正）
    var z_mc = mesh_xz.y - materialParams.centerMC.y;

    // 约束顶点MC坐标有效范围
    x_mc = max(min(x_mc, perimeter_half), -perimeter_half);
    z_mc = max(min(z_mc, perimeter_half), -perimeter_half);

    // 因为浮点型计算精度有限，我们取东西南北4个样点来插值出当前顶点经纬度，样点间隔1000MC
    let z_mc_north = floor(z_mc * 0.001) * 1000.0;
    let z_mc_south = ceil(z_mc * 0.001) * 1000.0;

    let lat_north = (2.0 * atan(exp((z_mc_north * 3.141592654) / perimeter_half)) - 1.570796327);
    let lat_south = (2.0 * atan(exp((z_mc_south * 3.141592654) / perimeter_half)) - 1.570796327);

    let x_mc_west = floor(x_mc * 0.001) * 1000.0;
    let x_mc_east = ceil(x_mc * 0.001) * 1000.0;

    let lng_west = (x_mc_west * 3.1415926536) / perimeter_half;
    let lng_east = (x_mc_east * 3.1415926536) / perimeter_half;

    // 纬线截面圆半径，在该截面圆周上确定XY值
    let radius_north = radius * cos(lat_north);
    let radius_south = radius * cos(lat_south);

    let z_north = radius * sin(lat_north);
    let z_south = radius * sin(lat_south);

    let lerp_z = (z_mc - z_mc_north) * 0.001;

    let radius_lat = radius_north + (radius_south - radius_north) * lerp_z;
    let z = z_north + (z_south - z_north) * lerp_z;

    let x_west = radius_lat * sin(lng_west);
    let x_east = radius_lat * sin(lng_east);

    let y_west = radius_lat * cos(lng_west);
    let y_east = radius_lat * cos(lng_east);

    let lerp_x = (x_mc - x_mc_west) * 0.001;

    let x = x_west + (x_east - x_west) * lerp_x;
    let y = y_west + (y_east - y_west) * lerp_x;

    var vertex = vec3f(x, y, z);

    // 绕X轴旋转球体网格，使相机观察点纬线居中显示
    let rad = (2.0 * atan(exp((materialParams.targetMC.y * 3.141592654) / perimeter_half)) - 1.570796327);
    let c = cos(rad);
    let s = sin(rad) ;

    vertex.x = x;
    vertex.y = y * c - z * s;
    vertex.z = y * s + z * c;

    vertex *= radius / length(vertex);

    var normal = normalize(vertex);

    // 计算地形高度
    let had_dem = materialParams.layers_enabled.x;
    var height = 0.0;
    if (had_dem > 0 && materialParams.layers_uvst0.z < 1.0) {
        let layer = materialParams.layers_layer.x;
        let uvst = materialParams.layers_uvst0;
        let uv = uvst.xy + uvst.zw * mesh_uv;
        let dem = textureSampleLevel(atlas2D, splln1, uv, layer, 0);
        height = ((dem.r * 256.0 * 256.0 * 256.0) + (dem.g * 256.0 * 256.0) + (dem.b * 256.0)) * 0.001 - 991.0;
    }

    vertex.y -= radius - height;

    if (materialParams.level > 16) {
        let center_lat = (2.0 * atan(exp((materialParams.centerMC.y * 3.141592654) / perimeter_half)) - 1.570796327);
        let scale = cos(center_lat);

        vertex = vec3f((mesh_xz.x - materialParams.movedMC.x) * scale, height, (mesh_xz.y + materialParams.movedMC.y) * scale);
    }

    vertex.x += materialParams.targetXZ.x;
    vertex.z += materialParams.targetXZ.y;

    // ===============-------------------------------------

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

    output.litPosition = computeLightSpacePosition(output.viewPosition.xyz, output.viewNormal, 0u);
    output.custom2 = worldPosition;

    // 对于VSM，我们使用光照空间线性Z坐标作为深度度量，它适用于平行光和聚光灯，并且可以安全地进行插值
    // 在相机空间中，该值保证在[-znear，-zfar]之间，使用output.viewPosition.w存储内插光照空间深度
    let z_ = output.viewPosition.z;
    // 重新缩放 [near, far] 到 [0, 1]
    let depth = -z_ * frameUniforms.cameraNearFar.z - frameUniforms.cameraNearFar.w;
    // EVSM pre-mapping，结果在[-vsmExponent, +vsmExponent]之间，表示指数，其后用exp方法转换为曲线
    output.viewPosition.w = frameUniforms.vsmExponent * (depth * 2.0 - 1.0);

    return output;
}
