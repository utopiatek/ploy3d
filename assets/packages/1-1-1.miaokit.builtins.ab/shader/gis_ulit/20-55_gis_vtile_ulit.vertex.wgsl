
fn material_vs() ->OutputVS {
    // 地球半周长
    let perimeter_half = 20037508.3428;
    // 地球赤道半径
    let radius = 6378137.0;

    // 网格顶点真实MC坐标
    let mesh_xz = mesh_position.xz;

    // 平移网格，使相机观察点顶点坐标X值为0
    var x_mc = mesh_xz.x - materialParams.targetMC.x;
    // 网格顶点的真实纬度用于生成正确的球面
    var z_mc = -mesh_xz.y;

    let lng = (x_mc * 3.1415926536) / perimeter_half;
    let lat = (2.0 * atan(exp((z_mc * 3.141592654) / perimeter_half)) - 1.570796327);

    // 纬线截面圆半径，在该截面圆周上确定XY值
    let radius_lat = radius * cos(lat);
    let z = radius * sin(lat);

    let x = radius_lat * sin(lng);
    let y = radius_lat * cos(lng);

    var vertex = vec3f(x, y, z);

    // 绕X轴旋转球体网格，使相机观察点纬线居中显示
    let rad = (2.0 * atan(exp((materialParams.targetMC.y * 3.141592654) / perimeter_half)) - 1.570796327);
    let c = cos(rad);
    let s = sin(rad) ;

    vertex.x = x;
    vertex.y = y * c - z * s;
    vertex.z = y * s + z * c;

    vertex *= radius / length(vertex);

    let normal = normalize(vertex);

    // ===============-------------------------------------

    // 计算地形高度
    var height = 0.0;

    if (materialParams.dem_uvst_low.z < 1.0) {
        var layer = 0;
        var uvst = materialParams.dem_uvst_high;
        var region = materialParams.dem_region_high;

        var u = (mesh_xz.x - region.x) / (region.y - region.x);
        var v = (mesh_xz.y - region.z) / (region.w - region.z);

        if (!(u > 0.0 && u < 1.0 && v > 0.0 && v < 1.0)) {
            uvst = materialParams.dem_uvst_low;
            region = materialParams.dem_region_low;

            u = (mesh_xz.x - region.x) / (region.y - region.x);
            v = (mesh_xz.y - region.z) / (region.w - region.z);
        }

        if (u > 0.0 && u < 1.0 && v > 0.0 && v < 1.0) {
            let uv = uvst.xy + uvst.zw * vec2f(u, 1.0 - v);
            let dem = textureSampleLevel(atlas2D, splln1, uv, layer, 0);
            height = ((dem.r * 256.0 * 256.0 * 256.0) + (dem.g * 256.0 * 256.0) + (dem.b * 256.0)) * 0.001 - 991.0;
        }
    }

    // 至此，相机观察点在0点位置
    vertex.y -= radius - height;

    // 将相机观察点从0点坐标移动到相机观察坐标
    vertex.x += materialParams.targetXZ.x;
    vertex.z += materialParams.targetXZ.y;

    // TODO: 较高分辨率绘制
    if (true) {
        let target_lat = (2.0 * atan(exp((materialParams.originMC.y * 3.141592654) / perimeter_half)) - 1.570796327);
        let scale = cos(target_lat);
        let pos_xz = (mesh_xz - materialParams.originMC) * scale;

        vertex = vec3f(pos_xz.x, height, -pos_xz.y);
    }

    // ===============-------------------------------------

    let worldPosition = vec4f(vertex, 1.0);
    let worldNormal = normal;
    let worldTangent = vec3f(1.0, 0.0, 0.0);

    // 在此可以添加一些用户代码来修改或提供世界空间顶点属性 ...

    var output: OutputVS;

    output.instanceData = instance_data;
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
    
    // 对于VSM，我们使用光照空间线性Z坐标作为深度度量，它适用于平行光和聚光灯，并且可以安全地进行插值
    // 在相机空间中，该值保证在[-znear，-zfar]之间，使用output.viewPosition.w存储内插光照空间深度
    let z_ = output.viewPosition.z;
    // 重新缩放 [near, far] 到 [0, 1]
    let depth = -z_ * frameUniforms.cameraNearFar.z - frameUniforms.cameraNearFar.w;
    // EVSM pre-mapping，结果在[-vsmExponent, +vsmExponent]之间，表示指数，其后用exp方法转换为曲线
    output.viewPosition.w = frameUniforms.vsmExponent * (depth * 2.0 - 1.0);

    return output;
}

override VARIANT_DRAW_LINE = false;

// 自定义顶点属性结构
struct InputVS_X {
    @builtin(instance_index) gl_InstanceID: u32,
    @builtin(vertex_index) gl_VertexID: u32,

    @location(0) position0: vec2<f32>,
    @location(1) position1: vec2<f32>,
};

// 初始化顶点属性
fn init_vertex_X(vertex: InputVS_X) {
    gl_InstanceID = vertex.gl_InstanceID;
    gl_VertexID = vertex.gl_VertexID;

    init_instance();

    if (VARIANT_DRAW_LINE) {
        let dir = normalize(vertex.position1 - vertex.position0);
        let width = ceil(materialParams.pixelS) * 2.0; // TODO 1倍宽度线段两端宽度明显不一致，原因未明
        let pnor = vec2f(dir.y, -dir.x);
        let nnor = vec2f(-dir.y, dir.x);

        let vertices = array<vec2f, 4>(
            vertex.position0 + (pnor - dir) * width,
            vertex.position0 + (nnor - dir) * width,
            vertex.position1 + (nnor + dir) * width,
            vertex.position1 + (pnor + dir) * width,
        );

        let indices = array<u32, 6>(0u, 2u, 1u, 0u, 3u, 2u);
        let index = indices[gl_VertexID % 6u];
        let pos = vertices[index];

        mesh_position = vec3f(pos.x, 0.0, pos.y);

        // 一次绘制多条线段，使用(0,0)点作为断点
        if ((length(vertex.position0) * length(vertex.position1)) == 0.0) {
            mesh_position = vec3f(0.0);
        }
    }
    else {
        mesh_position = vec3f(vertex.position0.x, 0.0, vertex.position0.y);
    }
    
    mesh_uv = vec2f(0.0);
}

@vertex fn vsmain_X(vertex: InputVS_X) ->OutputVS {
    defend_override();

    init_vertex_X(vertex);

    return material_vs();
}
