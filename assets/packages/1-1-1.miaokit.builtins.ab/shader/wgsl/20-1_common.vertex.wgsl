
//------------------------------------------------------------------------------
// 顶点着色器模块通用代码
//------------------------------------------------------------------------------

struct MorphOut {
    position : vec3f,
    normal : vec3f,
    tangent : vec3f,
};

// 网格顶点坐标、法线、切线变形
// vertexID     : 顶点索引
// position     : 初始顶点坐标
// normal       : 初始顶点法线
// tangent      : 初始顶点切线
// morphINFO    : 数据贴图宽度、变形顶点数量、变形目标数量、0
// weights      : 变形目标权重数组，支持最大16个变形目标（不支持不同子网格使用不同变形目标权重数组）
fn morphPosition(
    vertexID: u32,
    position: vec3f,
    normal: vec3f,
    tangent: vec3f,
    morphINFO: vec4<u32>,
    weights: mat4x4f,
) ->MorphOut {

    var out: MorphOut;
    out.position = position;
    out.normal = normal;
    out.tangent = tangent;

    // 遍历所有变形目标
    for (var i = 0u; i < morphINFO[2]; i++) {
        // 变形目标逐一存储，每个变形目标包含全部顶点的变形数据，每个顶点变形数据占用3个像素，VERTEX_INDEX表示当前顶点变形数据起始像素索引
        let PIXEL_INDEX = 3 * (morphINFO[1] * i + vertexID);
        // 第1像素采样纹理坐标X值
        let uv_x_0 = ((0 + PIXEL_INDEX) % morphINFO[0]);
        // 第1像素采样纹理坐标Y值
        let uv_y_0 = ((0 + PIXEL_INDEX) / morphINFO[0]);
        // 第2像素采样纹理坐标X值
        let uv_x_1 = ((1 + PIXEL_INDEX) % morphINFO[0]);
        // 第2像素采样纹理坐标Y值
        let uv_y_1 = ((1 + PIXEL_INDEX) / morphINFO[0]);
        // 第3像素采样纹理坐标X值
        let uv_x_2 = ((2 + PIXEL_INDEX) % morphINFO[0]);
        // 第3像素采样纹理坐标Y值
        let uv_y_2 = ((2 + PIXEL_INDEX) / morphINFO[0]);

        // 相邻两个像素中每两通道分别保存顶点偏移XYZ和数据归一化缩放
        let data_0 = textureLoad(morphTG, vec2<u32>(uv_x_0, uv_y_0), 0);
        let data_1 = textureLoad(morphTG, vec2<u32>(uv_x_1, uv_y_1), 0);
        // 第3像素保存切线空间的变形
        let data_2 = textureLoad(morphTG, vec2<u32>(uv_x_2, uv_y_2), 0);

        let offset_x = (data_0.x * (256.0 / 257.0) + data_0.y * (1.0 / 257.0));
        let offset_y = (data_0.z * (256.0 / 257.0) + data_0.w * (1.0 / 257.0));
        let offset_z = (data_1.x * (256.0 / 257.0) + data_1.y * (1.0 / 257.0));
        let offset_w = (data_1.z * (256.0 / 257.0) + data_1.w * (1.0 / 257.0));

        // 当前顶点变形坐标偏移
        let offset = ((vec3f(offset_x, offset_y, offset_z) - 0.5) * 2.0) / offset_w;

        // 变形后的法线和切线
        let qtbn = (data_2 - 0.5) * 2.0;
        let normal_ = vec3f(0.0, 0.0, 1.0) + vec3f(2.0, -2.0, -2.0) * qtbn.x * qtbn.zwx + vec3f(2.0, 2.0, -2.0) * qtbn.y * qtbn.wzy;
        let tangent_ = vec3f(1.0, 0.0, 0.0) + vec3f(-2.0, 2.0, -2.0) * qtbn.y * qtbn.yxw + vec3f(-2.0, 2.0, 2.0) * qtbn.z * qtbn.zwx;

        // 当前顶点变形法线、切线偏移
        let offset_n = normal_ - normal;
        let offset_t = tangent_ - tangent;

        // 当前变形目标的变形权重
        let weight = weights[i / 4u][i % 4u];

        out.position += weight * offset;
        out.normal += weight * offset_n;
        out.tangent += weight * offset_t;
    }

    return out;
}

// ======================================================================================================

// 为顶点应用骨骼变换影响
fn mulBoneVertex(v: vec3f, i: u32) -> vec3f {
    let m = bonesUniforms.bones[i];
    return v.x * m[0].xyz + (v.y * m[1].xyz + (v.z * m[2].xyz + m[3].xyz));
}

// 为法线应用骨骼变换影响
fn mulBoneNormal(n: vec3f, i: u32) -> vec3f {
    // 如果已知模型矩阵是刚性变换（均匀缩放），我们可以使用模型矩阵作为法线矩阵；
    // 对法线应用含非均匀缩放的矩阵，会导致法线不再垂直面元，所以需要单独提供法线矩阵；
    // 注意没有提供内置方法(inverse)：transformed_normal = transpose(inverse(bone[i])) * normal;
    let cof = cofactor(bonesUniforms.bones[i]);
    return normalize(cof * n);
}

// 为坐标应用蒙皮变换影响
fn skinPosition(p: vec3f, ids: vec4<u32>, weights: vec4f) -> vec3f {
    return mulBoneVertex(p, ids.x) * weights.x + mulBoneVertex(p, ids.y) * weights.y + mulBoneVertex(p, ids.z) * weights.z + mulBoneVertex(p, ids.w) * weights.w;
}

// 为法线应用蒙皮变换影响
fn skinNormal(n: vec3f, ids: vec4<u32>, weights: vec4f) -> vec3f {
    return mulBoneNormal(n, ids.x) * weights.x + mulBoneNormal(n, ids.y) * weights.y + mulBoneNormal(n, ids.z) * weights.z + mulBoneNormal(n, ids.w) * weights.w;
}

// ======================================================================================================

// 计算指定相机空间点的灯光空间位置
fn computeLightSpacePosition(viewPosition: vec3f, viewNormal: vec3f, cascade: u32) ->vec4f {
    var vPos = viewPosition;

    if (VARIANT_HAS_VSM) {
        // 将全局空间光照向量转到相机空间
        let viewLit = normalize(mulMat3x3Float3(frameUniforms.vfgMat, frameUniforms.lightDirection.xyz));
        let NoL = saturate(dot(viewNormal, viewLit));
        let sinTheta = sqrt(1.0 - NoL * NoL);
        // 将坐标沿法线偏移一定距离（由frameUniforms.shadowBias指定），避免出现自遮挡问题（acne），VSM阴影不需要偏移
        vPos += viewNormal * (sinTheta * frameUniforms.shadowBias);
    }

    return mulMat4x4Float3((frameUniforms.lfgMat/*TODO:[cascade]*/ * frameUniforms.gfvMat), vPos);
}

// ======================================================================================================

// 实例化绘制中当前实例索引
var<private> gl_InstanceID = 0u;
// 当前处理顶点索引
var<private> gl_VertexID = 0u;

// 实例对象ID
var<private> instance_id = 0u;
// 实例对象状态标志集
var<private> instance_flags = 0u;
// 实例对象自定义层标志集
var<private> instance_layers = 0u;
// 实例对象用户数据
var<private> instance_user = 0u;

// 对象网格包围盒中心
var<private> instance_bbCenter = vec3(0.0);
// 对象网格包围盒延展大小
var<private> instance_bbExtents = vec3(0.5);

// 世界空间到相机空间变换矩阵
var<private> instance_vfwMat: mat4x4f;
// 模型空间到世界空间变换矩阵
var<private> instance_wfmMat: mat4x4f;
// 模型空间到世界空间法线变换矩阵
var<private> instance_normal_wfmMat: mat3x3f;

// 初始化实例属性
fn init_instance() {
    instance_id = objectUniforms.id;
    instance_flags = objectUniforms.flags;
    instance_layers = objectUniforms.layers;
    instance_user = objectUniforms.user;

    instance_bbCenter = objectUniforms.bbCenter.xyz;
    instance_bbExtents = objectUniforms.bbExtents.xyz;

    instance_wfmMat = objectUniforms.wfmMat;
    instance_normal_wfmMat = mat3x3<f32>(
        objectUniforms.normal_wfmMat[0].xyz,
        objectUniforms.normal_wfmMat[1].xyz,
        objectUniforms.normal_wfmMat[2].xyz,
    );

    if(0 < gl_InstanceID) {
        instance_wfmMat = instanceUniforms.data[gl_InstanceID].wfmMat;
        instance_normal_wfmMat = mat3x3<f32>(
            instanceUniforms.data[gl_InstanceID].normal_wfmMat[0].xyz,
            instanceUniforms.data[gl_InstanceID].normal_wfmMat[1].xyz,
            instanceUniforms.data[gl_InstanceID].normal_wfmMat[2].xyz,
        );

        instance_id = instanceUniforms.data[gl_InstanceID].id;
        instance_flags = instanceUniforms.data[gl_InstanceID].flags;
        instance_layers = instanceUniforms.data[gl_InstanceID].layers;
        instance_user = instanceUniforms.data[gl_InstanceID].user;
    }

    instance_vfwMat = frameUniforms.vfgMat * frameUniforms.gfwMat;
}

// ======================================================================================================

// 不包含顶点缓存
struct InputVS_0 {
    @builtin(instance_index) gl_InstanceID: u32,
    @builtin(vertex_index) gl_VertexID: u32,
};

// 仅包含第1顶点缓存的顶点属性结构
struct InputVS_1 {
    @builtin(instance_index) gl_InstanceID: u32,
    @builtin(vertex_index) gl_VertexID: u32,

    @location(0) position: vec4f,
    @location(1) qtbn: vec4f,
    @location(2) uv: vec2f,
};

// 包含第1、2顶点缓存的顶点属性结构
struct InputVS_3 {
    @builtin(instance_index) gl_InstanceID: u32,
    @builtin(vertex_index) gl_VertexID: u32,

    @location(0) position: vec4f,
    @location(1) qtbn: vec4f,
    @location(2) uv: vec2f,

    @location(3) bones: vec4<u32>,
    @location(4) weights: vec4f,
};

// 进行网格变形和骨骼蒙皮后的模型空间顶点坐标
var<private> mesh_position = vec3f(0.0);
// 顶点纹理坐标0
var<private> mesh_uv = vec2f(0.0);
// 进行网格变形和骨骼蒙皮后的模型空间顶点法线
var<private> mesh_normal = vec3f(0.0, 0.0, 1.0);
// 进行网格变形和骨骼蒙皮后的模型空间顶点切线（W通道为负表示切线方向需要镜像）
var<private> mesh_tangent = vec4f(1.0, 0.0, 0.0, 1.0);

// 初始化顶点属性
fn init_vertex_0(vertex: InputVS_0) {
    gl_InstanceID = vertex.gl_InstanceID;
    gl_VertexID = vertex.gl_VertexID;

    init_instance();

    // 该分支中，需要在material_vs中计算mesh_position、mesh_uv、mesh_normal、mesh_tangent
}

// 初始化顶点属性
fn init_vertex_1(vertex: InputVS_1) {
    gl_InstanceID = vertex.gl_InstanceID;
    gl_VertexID = vertex.gl_VertexID;

    init_instance();

    // 顶点缓存中的坐标基于网格中心和网格大小进行归一化压缩
    mesh_position = vertex.position.xyz * instance_bbExtents + instance_bbCenter;
    // 顶点缓存中的属性vertex.position.w存储UV压缩时的缩小倍数
    mesh_uv = vertex.uv / vertex.position.w;
    // 顶点缓存中将法线和切线压缩为四元数
    mesh_normal = decodeNormal(vertex.qtbn);

    var tangent = vec3f(1.0, 0.0, 0.0);

    // 启用宏定义MATERIAL_NEEDS_TBN时解压出切线（通常在各向异性效果或法线贴图映射中使用切线）
    if (MATERIAL_NEEDS_TBN) {
        tangent = decodeTangent(vertex.qtbn);
    }

    // 在模型空间进行顶点变形、法线、切线变形
    if (VARIANT_NEEDS_MORPHING) {
        let morphOut = morphPosition(
            gl_VertexID,
            mesh_position,
            mesh_normal,
            tangent,
            objectUniforms.morphSampler,
            objectUniforms.morphWeights);

        mesh_position = morphOut.position;
        mesh_normal = morphOut.normal;
        tangent = morphOut.tangent;
    }

    // 如果顶点缓存中的属性vertex.qtbn.w < 0，将切线镜像到反方向
    mesh_tangent = vec4f(tangent, vertex.qtbn.w);
}

// 初始化顶点属性
fn init_vertex_3(vertex: InputVS_3) {
    gl_InstanceID = vertex.gl_InstanceID;
    gl_VertexID = vertex.gl_VertexID;

    init_instance();

    // 顶点缓存中的坐标基于网格中心和网格大小进行归一化压缩
    mesh_position = vertex.position.xyz * instance_bbExtents + instance_bbCenter;
    // 顶点缓存中的属性vertex.position.w存储UV压缩时的缩小倍数
    mesh_uv = vertex.uv / vertex.position.w;
    // 顶点缓存中将法线和切线压缩为四元数
    mesh_normal = decodeNormal(vertex.qtbn);

    var tangent = vec3f(1.0, 0.0, 0.0);

    // 启用宏定义MATERIAL_NEEDS_TBN时解压出切线（通常在各向异性效果或法线贴图映射中使用切线）
    if (MATERIAL_NEEDS_TBN) {
        tangent = decodeTangent(vertex.qtbn);
    }

    // 在模型空间进行顶点变形、法线、切线变形
    if (VARIANT_NEEDS_MORPHING) {
        let morphOut = morphPosition(
            gl_VertexID,
            mesh_position,
            mesh_normal,
            tangent,
            objectUniforms.morphSampler,
            objectUniforms.morphWeights);

        mesh_position = morphOut.position;
        mesh_normal = morphOut.normal;
        tangent = morphOut.tangent;
    }

    // 进行顶点骨骼蒙皮
    if (VARIANT_NEEDS_SKINNING) {
        mesh_position = skinPosition(mesh_position, vertex.bones, vertex.weights);
        mesh_normal = skinNormal(mesh_normal, vertex.bones, vertex.weights);

        if (MATERIAL_NEEDS_TBN) {
            tangent = skinNormal(tangent, vertex.bones, vertex.weights);
        }
    }

    // 如果顶点缓存中的属性vertex.qtbn.w < 0，将切线镜像到反方向
    mesh_tangent = vec4f(tangent, vertex.qtbn.w);
}
