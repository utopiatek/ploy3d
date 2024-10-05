
override MIPMAP_COLOR = 0u;
override MIPMAP_ZDEPTH = 0u;
override EXTRACT_SSAO = 0u;
override EXTRACT_SSR = 0u;
override EXTRACT_SSS = 0u;
override BLUR_SSS = 0u;
override PROC_BLOOM = 0u;
override BLIT_CANVAS = 0u;
override BLIT_CANVAS_COMBINE_SSS = 1u;
override BLIT_CANVAS_COMBINE_BLOOM = 1u;
override BLIT_CANVAS_TONE_MAPPING = 1u;

const uTextureSSSKernel : array<vec4f, 27> = array<vec4f, 27>(
    vec4f(0.3086736798286438, 0.8812364339828491, 0.8812364339828491, 0),
    vec4f(0.004732436966150999, 3.3884941073603894e-15, 3.3884941073603894e-15, 2),
    vec4f(0.014967787079513073, 3.679268834044791e-10, 3.679268834044791e-10, 1.53125),
    vec4f(0.02156166173517704, 4.027149600460689e-7, 4.027149600460689e-7, 1.125),
    vec4f(0.03225111588835716, 0.000025830706363194622, 0.000025830706363194622, 0.78125),
    vec4f(0.051785923540592194, 0.00026728285592980683, 0.00026728285592980683, 0.5),
    vec4f(0.08514602482318878, 0.0026894384063780308, 0.0026894384063780308, 0.28125),
    vec4f(0.0868399366736412, 0.010861646384000778, 0.010861646384000778, 0.125),
    vec4f(0.048378266394138336, 0.045537181198596954, 0.045537181198596954, 0.03125),
    vec4f(0.644216001033783, 0.4196479618549347, 0.3565818667411804, 0),
    vec4f(0.00040439789881929755, 0.001812448725104332, 0.001433727564290166, 2),
    vec4f(0.002511073835194111, 0.007804500870406628, 0.007076999172568321, 1.53125),
    vec4f(0.005695845931768417, 0.013200906105339527, 0.013086692430078983, 1.125),
    vec4f(0.01026744581758976, 0.020621201023459435, 0.021195298060774803, 0.78125),
    vec4f(0.017370862886309624, 0.033684760332107544, 0.035102907568216324, 0.5),
    vec4f(0.031951211392879486, 0.062477957457304, 0.06480367481708527, 0.28125),
    vec4f(0.06265216320753098, 0.09223703294992447, 0.10731679201126099, 0.125),
    vec4f(0.04703899100422859, 0.05833721160888672, 0.07169298082590103, 0.03125),
    vec4f(0.868208110332489, 0.9274238348007202, 0.9927160143852234, 0),
    vec4f(1.0292710683756923e-8, 4.6367248453563995e-15, 0, 2),
    vec4f(0.000001976042085516383, 3.575248708198586e-10, 0, 1.53125),
    vec4f(0.000034762877476168796, 3.1306072401093843e-7, 0, 1.125),
    vec4f(0.00021065410692244768, 0.00001753747528709937, 1.0235266096668523e-26, 0.78125),
    vec4f(0.0014086710289120674, 0.00017243721231352538, 2.7012035186749217e-13, 0.5),
    vec4f(0.0056115323677659035, 0.0016976697370409966, 5.221181709202938e-7, 0.28125),
    vec4f(0.014802428893744946, 0.006672171410173178, 0.0001199894686578773, 0.125),
    vec4f(0.0438259020447731, 0.027727944776415825, 0.0035214917734265327, 0.03125),
);


var<private> uFrameModTaaSS = 0.0;
// 单位距离对应的次表面散射衰减强度
var<private> uScatteringFactorPacker = 0.1018;
// 视锥平面深度与视锥平面大小的比值（1.0 / frameUniforms.projectionInfo.z）
var<private> uProjFactor = 1.3517;

// ============================-------------------------------------

// 当前渲染目标贴图，采样的Level与写入的Level不同
@group(3) @binding(0) var curRT : texture_2d<f32>;

// 当前渲染目标信息：渲染贴图大小，渲染区域大小，1.0/渲染区域大小，渲染缩放
var<private> infoRT = vec4f(2048.0, 2048.0 * 1.0, 1.0 / (2048.0 * 1.0), 1.0);

// 根据当前渲染区域大小将UV转换为渲染贴图采样像素坐标
fn coordRT(uv: vec2f) ->vec2<u32> {
    return vec2<u32>(min(uv * infoRT.y, vec2f(infoRT.y - 1.0)));
}

// ============================-------------------------------------

fn postprocess_mipmap_color(uv: vec2f) {
    let level = f32(MIPMAP_COLOR - 1);
    let color = textureSampleLevel(curRT, splln1, uv, level);

    material_emissive = color.rgb;
    material_alpha = color.a;
}

fn postprocess_mipmap_z(uv: vec2f) {
    if (MIPMAP_ZDEPTH == 1u) {
        let coord_c = vec2<i32>(uv * 2047.0);
        let coord_l = vec2<i32>(max(coord_c.x - 1, 0), coord_c.y);
        let coord_r = vec2<i32>(min(coord_c.x + 1, 2047), coord_c.y);
        let coord_t = vec2<i32>(coord_c.x, max(coord_c.y - 1, 0));
        let coord_b = vec2<i32>(coord_c.x, min(coord_c.y + 1, 2047));

        let pack_c = textureLoad(gbRT, coord_c, 0, 0);
        let pack_l = textureLoad(gbRT, coord_l, 0, 0);
        let pack_r = textureLoad(gbRT, coord_r, 0, 0);
        let pack_t = textureLoad(gbRT, coord_t, 0, 0);
        let pack_b = textureLoad(gbRT, coord_b, 0, 0);

        let inv_range = 1.0 / 4294967295.0;

        let depth_c = f32(pack_c.x) * inv_range;
        let depth_l = f32(pack_l.x) * inv_range;
        let depth_r = f32(pack_r.x) * inv_range;
        let depth_t = f32(pack_t.x) * inv_range;
        let depth_b = f32(pack_b.x) * inv_range;

        let depth = depth_c * 0.4 + (depth_l + depth_r + depth_t + depth_b) * 0.15;

        material_emissive = vec3f(depth);
        material_alpha = min(depth, 1.0);
    }
    else {
        let level = f32(MIPMAP_ZDEPTH - 2);
        let color = textureSampleLevel(curRT, splln1, uv * vec2f(0.5) + vec2f(0.5, 0.0), level);

        material_emissive = color.rgb;
        material_alpha = color.a;
    }
}

// ============================-------------------------------------

// 从GB中采样线性归一化深度值
fn fetchDepthLevel(uv: vec2f, level: f32) ->f32 {
    let pack = textureLoad(gbRT, coordRT(uv), 0, 0);
    let depth = f32(pack.x) / 4294967295.0;

    return depth;
}

// 从线性归一化深度值转换到相机空间深度距离（正数）
fn zValueFromScreenSpacePosition(depth: f32) ->f32 {
    return frameUniforms.cameraNearFar.x + (frameUniforms.cameraNearFar.y - frameUniforms.cameraNearFar.x) * depth;
}

// 屏幕像素坐标转相机空间坐标
fn reconstructCSPosition(point: vec2f, z: f32) ->vec3f {
    return vec3f((point * (1.0 / infoRT.w) * frameUniforms.projectionInfo.xy + frameUniforms.projectionInfo.zw) * -z, -z);
}

// 屏幕UV转相机空间坐标
fn getPosition(uv: vec2f) ->vec3f {
    return reconstructCSPosition(vec2f(coordRT(uv)), zValueFromScreenSpacePosition(fetchDepthLevel(uv, 0.0)));
}

// 屏幕UV加像素偏移转相机空间坐标
fn getOffsetedPixelPos(uv: vec2f, unitOffset: vec2f, screenSpaceRadius: f32) ->vec3f {
    let mipLevel = clamp(floor(log2(screenSpaceRadius)) - 3.0, 0.0, 5.0);
    let uvOff = uv + floor(screenSpaceRadius * unitOffset) / infoRT.x;
    let d = zValueFromScreenSpacePosition(fetchDepthLevel(uvOff, mipLevel));
    let coordOff = vec2f(coordRT(uvOff));
    return reconstructCSPosition(coordOff, d);
}

// 提取SSAO强度
fn ssaoExtract(uv: vec2f) ->f32 {
    let depthPacked = fetchDepthLevel(uv, 0.0);
    var cameraSpacePosition = getPosition(uv);

    // 遮蔽效果质量
    let uQuality = 1.0;
    // 遮蔽效果强度
    let uSsaoIntensity = 0.2;
    // 用于避免“自遮蔽”问题的偏移量，通常用于控制遮蔽效果的起始距离
    // 如果 uSsaoBias 设置得太小，可能会产生自遮蔽，即物体表面会遮蔽自己，产生不真实的暗影；如果设置得太大，则遮蔽效果可能不够明显
    // 较为平滑的表面需要较小的偏移量，而较复杂或粗糙的表面则可能需要更大的偏移量
    // 一般在 0.01 到 0.1 之间，视场景的复杂度而定
    // 根据物体的法线和深度值计算，适当调整偏移量
    let uSsaoBias = 0.0114;
    // 控制在屏幕空间中用于计算遮蔽效果的采样半径，我们基于2048的视锥平面高度直观设置该值
    // 这个值影响的是环境光遮蔽的“感知距离”，半径越大，遮蔽的效果越大，但也会导致遮蔽效果变得过于扩散、不精确
    // 通常设置在 0.1 到 3.0 之间，具体取决于场景的尺寸，如果场景很大，遮蔽半径可以设置得更大一些
    let uSsaoRadius = 0.15;
    // 2048高度的视锥平面对应的Z坐标
    let screenZ = 1024 / frameUniforms.projectionInfo.w;
    // 根据视距动态调整，距离近时缩小，距离大时放大
    var ssRadius = uSsaoRadius * screenZ / cameraSpacePosition.z;

    let normal = normalize(cross(dpdy(cameraSpacePosition), dpdx(cameraSpacePosition)));
    if (depthPacked > 0.9) {
        return 1.0;
    }
    if (ssRadius < 1.0) {
        return 1.0;
    }

    var nFalloff = mix(1.0, max(0.0, 1.5 * normal.z), 0.35);
    var randomAngle = 6.28 * interleavedGradientNoise(gl_FragCoord.xy, uFrameModTaaSS);
    var invRadius2 = 1.0 / (uSsaoRadius * uSsaoRadius);
    var contrib = 0.0;
    var vv = 0.0;
    var vn = 0.0;
    var screenSpaceRadius = 0.0;
    var angle = 0.0;
    var occludingPoint = vec3f(0.0);
    var offsetUnitVec = vec2f(0.0);
    var offset = 0;
    var nbSamples = 11.0;
    if (uQuality > 0.33) { nbSamples += 11.0; }
    if (uQuality > 0.66) { nbSamples += 11.0; }

    screenSpaceRadius = (f32(offset + 0) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 1) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 2) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 3) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 4) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 5) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 6) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 7) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 8) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 9) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    screenSpaceRadius = (f32(offset + 10) + 0.5) * (1.0 / nbSamples);
    angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
    screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
    offsetUnitVec = vec2(cos(angle), sin(angle));
    occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
    occludingPoint -= cameraSpacePosition;
    vv = dot(occludingPoint, occludingPoint);
    vn = dot(occludingPoint, normal);
    contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
    offset += 11;
    if (uQuality > 0.33) {
        screenSpaceRadius = (f32(offset + 0) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 1) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 2) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 3) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 4) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 5) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 6) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 7) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 8) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 9) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 10) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        offset += 11;
    }
    if (uQuality > 0.66) {
        screenSpaceRadius = (f32(offset + 0) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 1) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 2) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 3) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 4) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 5) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 6) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 7) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 8) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 9) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        screenSpaceRadius = (f32(offset + 10) + 0.5) * (1.0 / nbSamples);
        angle = screenSpaceRadius * (3.0 * 6.28) + randomAngle;
        screenSpaceRadius = max(0.75, screenSpaceRadius * ssRadius);
        offsetUnitVec = vec2(cos(angle), sin(angle));
        occludingPoint = getOffsetedPixelPos(uv, offsetUnitVec, screenSpaceRadius);
        occludingPoint -= cameraSpacePosition;
        vv = dot(occludingPoint, occludingPoint);
        vn = dot(occludingPoint, normal);
        contrib += max(1.0 - vv * invRadius2, 0.0) * max((vn - uSsaoBias) * inverseSqrt(vv), 0.0);
        offset += 11;
    }
    var aoValue = max(0.0, 1.0 - sqrt(contrib * nFalloff / nbSamples));
    aoValue = pow(aoValue, 10.0 * uSsaoIntensity);
    aoValue = mix(1.0, aoValue, clamp(ssRadius - 1.0, 0.0, 1.0));
    return aoValue;
}

// 提取SSAO强度
fn postprocess_ssao(uv: vec2f) {
    let ao = ssaoExtract(uv);
    material_emissive = vec3f(ao);
    material_alpha = ao;
}

// ============================-------------------------------------

// 计算LOD对应像素步进大小
fn computeLodNearestPixelSizePowLevel(lodLevelIn: f32, maxLod: f32, size: vec2f) ->vec3f {
    let lodLevel = min(maxLod - 0.01, lodLevelIn);
    let lowerLevel = floor(lodLevel);
    let higherLevel = min(maxLod, lowerLevel + 1.0);
    var powLevel = pow(2.0, higherLevel);
    let pixelSize = 2.0 * powLevel / size;
    if (lodLevel - lowerLevel > 0.5) {
        powLevel *= 2.0;
    }
    return vec3f(pixelSize, powLevel);
}

// 采样屏幕空间反射颜色
fn fetchColorLod(level: f32, uv: vec2f) ->vec3f {
    // 采样MIPMAP效果影响不大，因此我们不在生成渲染结果的MIPMAP，始终采样LOD0
    let color = textureSampleLevel(colorRT, splln1, vec2f(uv.x, 1.0 - uv.y) * infoRT.w, 0.0);
    return decodeRGBM(color, uRGBMRange);
}

// 从GB中采样相机空间Z值
fn fetchDepthLod(uv: vec2f, pixelSizePowLevel: vec3f) ->f32 {
    let depth = fetchDepthLevel(vec2f(uv.x, 1.0 - uv.y), 0.0);

    // 返回-Z轴坐标
    if (depth >= 1.0) {
        return -frameUniforms.cameraNearFar.y * 100.0;
    }

    return -frameUniforms.cameraNearFar.x - depth * (frameUniforms.cameraNearFar.y - frameUniforms.cameraNearFar.x);
}

// 相机空间坐标转屏幕空间
fn ssrViewToScreen(projection: mat4x4<f32>, viewVertex: vec3f) ->vec3f {
    let projected = projection * vec4f(viewVertex, 1.0);
    return vec3f(0.5 + 0.5 * projected.xy / projected.w, projected.w);
}

// 屏幕空间反射射线屏幕空间向量
fn computeRayDirUV(viewVertex: vec3f, rayOriginUV: vec3f, rayLen: f32, rayDirView: vec3f) ->vec3f {
    var rayDirUV = ssrViewToScreen(frameUniforms.cfvMat, viewVertex.xyz + rayDirView * rayLen);
    rayDirUV.z = 1.0 / rayDirUV.z;
    rayDirUV -= rayOriginUV;
    let scaleMaxX = min(1.0, 0.99 * (1.0 - rayOriginUV.x) / max(1e-5, rayDirUV.x));
    let scaleMaxY = min(1.0, 0.99 * (1.0 - rayOriginUV.y) / max(1e-5, rayDirUV.y));
    let scaleMinX = min(1.0, 0.99 * rayOriginUV.x / max(1e-5, -rayDirUV.x));
    let scaleMinY = min(1.0, 0.99 * rayOriginUV.y / max(1e-5, -rayDirUV.y));
    return rayDirUV * min(scaleMaxX, scaleMaxY) * min(scaleMinX, scaleMinY);
}

// 屏幕空间反射射线追踪步进偏移噪音
fn getStepOffset(frameMod: f32) ->f32 {
    return (interleavedGradientNoise(gl_FragCoord.xy, frameMod) - 0.5);
}

// 屏幕空间反射射线追踪
fn rayTraceUnrealSimple(viewVertex: vec3f, rayOriginUV: vec3f, rayLen: f32, depthTolerance_: f32, rayDirView: vec3f, roughness: f32, frameMod: f32) ->vec4f {
    let uTextureToBeRefractedSize = infoRT.yy;
    var pixelSizePowLevel = computeLodNearestPixelSizePowLevel(5.0 * roughness, 5.0, uTextureToBeRefractedSize);
    var invNumSteps = 1.0 / f32(8);
    if (true) {
        invNumSteps /= 2.0;
    }
    let depthTolerance = depthTolerance_ * invNumSteps;
    var rayDirUV = computeRayDirUV(viewVertex, rayOriginUV, rayLen, rayDirView);
    var sampleTime = getStepOffset(frameMod) * invNumSteps + invNumSteps;
    var diffSampleW = vec3f(0.0, sampleTime, 1.0);
    var sampleUV = vec3f(0.0);
    var depth = 0.0;
    var depthDiff = 0.0;
    var timeLerp = 0.0;
    var hitTime = 0.0;
    var hit = false;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
    depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
    depthDiff = -1.0 / sampleUV.z - depth;
    hit = abs(depthDiff + depthTolerance) < depthTolerance;
    timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
    hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
    diffSampleW.z = min(diffSampleW.z, hitTime);
    diffSampleW.x = depthDiff;
    diffSampleW.y += invNumSteps;
    if (true) {
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
        sampleUV = rayOriginUV + rayDirUV * diffSampleW.y;
        depth = fetchDepthLod(sampleUV.xy, pixelSizePowLevel);
        depthDiff = -1.0 / sampleUV.z - depth;
        hit = abs(depthDiff + depthTolerance) < depthTolerance;
        timeLerp = clamp(diffSampleW.x / (diffSampleW.x - depthDiff), 0.0, 1.0);
        hitTime = select(1.0, (diffSampleW.y + timeLerp * invNumSteps - invNumSteps), hit);
        diffSampleW.z = min(diffSampleW.z, hitTime);
        diffSampleW.x = depthDiff;
        diffSampleW.y += invNumSteps;
    }
    return vec4(rayOriginUV + rayDirUV * diffSampleW.z, 1.0 - diffSampleW.z);
}

// 屏幕空间反射重要性采样
fn unrealImportanceSampling(frameMod: f32, tangentX: vec3f, tangentY: vec3f, tangentZ: vec3f, eyeVector: vec3f, rough4: f32) ->vec3f {
    var E: vec2f;
    E.x = interleavedGradientNoise(gl_FragCoord.yx, frameMod);
    E.y = fract(E.x * 52.9829189);
    E.y = mix(E.y, 1.0, 0.7);
    let phi = 2.0 * 3.14159 * E.x;
    let cosTheta = pow(max(E.y, 0.000001), rough4 / (2.0 - rough4));
    let sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    var h = vec3f(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
    h = h.x * tangentX + h.y * tangentY + h.z * tangentZ;
    return normalize((2.0 * dot(eyeVector, h)) * h - eyeVector);
}

// 屏幕空间反射颜色贡献
fn fetchColorContribution(resRay_: vec4f, maskSsr: f32, roughness: f32) ->vec4f {
    let pi_x = 1.0 / frameUniforms.last_uvfvMat[0][0];
    let pi_y = 1.0 / frameUniforms.last_uvfvMat[1][1];
    let uTaaCornersCSLeft = array<vec4f, 2>(
        vec4f( pi_x, pi_y,  pi_x, -pi_y),
        vec4f(-pi_x, pi_y, -pi_x, -pi_y),
    );

    var resRay = resRay_.xyz;
    var AB = mix(uTaaCornersCSLeft[0], uTaaCornersCSLeft[1], resRay.x);
    resRay = vec3f(mix(AB.xy, AB.zw, resRay.y), 1.0) * -1.0 / resRay.z;
    resRay = (frameUniforms.last_uvfvMat * vec4(resRay.xyz, 1.0)).xyw;
    resRay = vec3f(resRay.xy / resRay.z, resRay.z);
    let maskEdge = clamp(6.0 - 6.0 * max(abs(resRay.x), abs(resRay.y)), 0.0, 1.0);
    resRay = vec3f(0.5 + 0.5 * resRay.xy, resRay.z);
    let fetchColor = fetchColorLod(roughness * (1.0 - resRay_.w), resRay.xy);
    return vec4f(fetchColor, maskSsr * maskEdge);
}

// 屏幕空间反射计算
fn ssr(roughness: f32, normal: vec3f, eyeVector: vec3f, viewVertex: vec3f) ->vec4f {
    const uSsrFactor = 1.0;
    var result = vec4f(0.0);
    var rough4 = roughness * roughness;
    rough4 = rough4 * rough4;
    let upVector = select(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), abs(normal.z) < 0.999);
    let tangentX = normalize(cross(upVector, normal));
    let tangentY = cross(normal, tangentX);
    var maskSsr = uSsrFactor * clamp(-4.0 * dot(eyeVector, normal) + 3.999, 0.0, 1.0);
    maskSsr *= clamp(4.7 - roughness * 5.0, 0.0, 1.0);
    var rayOriginUV = ssrViewToScreen(frameUniforms.cfvMat, viewVertex.xyz);
    /// Y轴向上，贴图采样UV Y轴向下
    rayOriginUV.z = 1.0 / rayOriginUV.z;
    var rayDirView = unrealImportanceSampling(uFrameModTaaSS, tangentX, tangentY, normal, eyeVector, rough4);
    /// rayDirView.z == -1，射线指向屏幕里，因子算得0，射线长度等于远平面距离减像素坐标Z值（Z值为负）
    /// rayDirView.z == +1，射线指向屏幕外，因子算得1，射线长度等于像素坐标Z值（Z值为负）减近平面距离
    var rayLen = mix(frameUniforms.cameraNearFar.y + viewVertex.z, -viewVertex.z - frameUniforms.cameraNearFar.x, rayDirView.z * 0.5 + 0.5);
    let maxLen = select(select(1000.0, 100.0, viewVertex.z > -100.0), 10.0, viewVertex.z > -10.0);
    rayLen = min(rayLen, maxLen);
    let depthTolerance = 0.5 * rayLen;
    if (maskSsr > 0.0) {
        let resRay = rayTraceUnrealSimple(viewVertex, rayOriginUV, rayLen, depthTolerance, rayDirView, roughness, uFrameModTaaSS);
        if (resRay.w > 0.0) {
            result = fetchColorContribution(resRay, maskSsr, roughness);
        }
    }
    // TODO: 光照着色时按以下方法进行混合
    // mix(specularEnvironment, specularColor * ssrColor.rgb, ssrColor.a);
    return result;
}

// 根据斜率计算法线
fn faceNormal(dpdx: vec3f, dpdy: vec3f) -> vec3f {
    return normalize(cross(dpdx, dpdy));
}

// 还原相机空间法线
fn computeViewSpaceNormalHighQ(
    uv: vec2f,
    depth: f32,
    position: vec3f,
    texel: vec4f,
    lod: f32,
) -> vec3f {
    let pos_c = position;

    let dx = vec2(texel.z, 0.0);
    let dy = vec2(0.0, texel.w);

    var H: vec4f;
    H.x = fetchDepthLevel(uv - dx, lod);
    H.y = fetchDepthLevel(uv + dx, lod);
    H.z = fetchDepthLevel(uv - dx * 2.0, lod);
    H.w = fetchDepthLevel(uv + dx * 2.0, lod);

    let he = abs((2.0 * H.xy - H.zw) - depth);
    let pos_l = reconstructCSPosition(saturate(uv - dx) * texel.xy, zValueFromScreenSpacePosition(H.x));
    let pos_r = reconstructCSPosition(saturate(uv + dx) * texel.xy, zValueFromScreenSpacePosition(H.y));
    let dpdx = select((pos_r - pos_c), (pos_c - pos_l), (he.x < he.y));

    var V: vec4f;
    V.x = fetchDepthLevel(uv - dy, lod);
    V.y = fetchDepthLevel(uv + dy, lod);
    V.z = fetchDepthLevel(uv - dy * 2.0, lod);
    V.w = fetchDepthLevel(uv + dy * 2.0, lod);

    let ve = abs((2.0 * V.xy - V.zw) - depth);
    let pos_d = reconstructCSPosition(saturate(uv - dy) * texel.xy, zValueFromScreenSpacePosition(V.x));
    let pos_u = reconstructCSPosition(saturate(uv + dy) * texel.xy, zValueFromScreenSpacePosition(V.y));
    let dpdy = select((pos_u - pos_c), (pos_c - pos_d), (ve.x < ve.y));

    return -faceNormal(dpdx, dpdy);
}

// 屏幕空间反射计算
fn postprocess_ssr(uv: vec2f) {
    let pack = textureLoad(gbRT, coordRT(uv), 0, 0);
    let depth = f32(pack.x) / 4294967295.0;
    let roughness = f32(pack.z & 0xFF) / 255.0;

    if (depth > 0.999) {
        material_emissive =vec3f(0.0);
        material_alpha = 0.0;
        return;
    }

    let z = zValueFromScreenSpacePosition(depth);
    let viewVertex = reconstructCSPosition(vec2f(coordRT(uv)), z);
    let normal = computeViewSpaceNormalHighQ(uv, depth, viewVertex, vec4f(infoRT.yy, infoRT.zz), 0.0);
    let eyeVector = normalize(-viewVertex);

    let color = ssr(roughness, normal, eyeVector, viewVertex);
    material_emissive = color.rgb;
    material_alpha = color.a;
}

// ============================-------------------------------------

// 从GB中采样次表面散射强度系数
fn fetchScatter(uv: vec2f) ->vec2f {
    let pack = textureLoad(gbRT, coordRT(uv), 0, 0);
    let scatter = f32((pack.y >> 8u) & 0x7Fu) * (1.0 / 127.0);
    let profile = f32((pack.y >> 15u) & 0x1u);

    return vec2f(scatter, profile);
}

// 提取漫反射和散射强度
fn sssExtract(uv: vec2f) ->vec4f {
    let coordCenter = vec2f(coordRT(uv)) + 0.5;
    let coordToUV = vec2f(1.0 / infoRT.x);
    let offset = vec3f(1.0, 1.0, 0.0);
    let uvCenter = coordCenter * coordToUV;

    let uvA = min((coordCenter + offset.xz), vec2f(infoRT.y - 1.0)) * coordToUV;
    let uvB = max((coordCenter - offset.xz), vec2f(0.0)) * coordToUV;
    let uvC = min((coordCenter + offset.zy), vec2f(infoRT.y - 1.0)) * coordToUV;
    let uvD = max((coordCenter - offset.zy), vec2f(0.0)) * coordToUV;

    let colorA = textureSampleLevel(colorRT, splln1, uvA, 0.0);
    let colorB = textureSampleLevel(colorRT, splln1, uvB, 0.0);
    let colorC = textureSampleLevel(colorRT, splln1, uvC, 0.0);
    let colorD = textureSampleLevel(colorRT, splln1, uvD, 0.0);

    let A = (vec4f(decodeRGBM(colorA, uRGBMRange), 1.0)).rgb;
    let B = (vec4f(decodeRGBM(colorB, uRGBMRange), 1.0)).rgb;
    let C = (vec4f(decodeRGBM(colorC, uRGBMRange), 1.0)).rgb;
    let D = (vec4f(decodeRGBM(colorD, uRGBMRange), 1.0)).rgb;

    let a = luminanceLinear(A);
    let b = luminanceLinear(B);
    let c = luminanceLinear(C);
    let d = luminanceLinear(D);

    let ab = abs(a - b);
    let cd = abs(c - d);
    let quant1: vec3f = 0.5 * mix(A + B, C + D, select(0.0, 1.0, ab > cd));
    let quantColor = textureSampleLevel(colorRT, splln1, uvCenter, 0.0);
    let quant0: vec3f = (vec4f(decodeRGBM(quantColor, uRGBMRange), 1.0)).rgb;
    let checker = checkerboard(coordCenter, uHalton);

    let diffuse = max(mix(quant1, quant0, checker), vec3f(0.0));
    let specular = max(mix(quant0, quant1, checker), vec3f(0.0));

    // ============================-------------------------------------

    let scatter_profile = fetchScatter(uv);
    let pack = textureLoad(gbRT, coordRT(uv), 0, 0);
    let scatter = f32((pack.y >> 8u) & 0x7Fu) * (1.0 / 127.0);
    let profile = f32((pack.y >> 15u) & 0x1u);
    let depth = f32(pack.x) / 4294967295.0;

    return select(vec4f(diffuse, depth), vec4f(0.0), (scatter_profile.x == 0.0 || profile == 0.0));
}

// 混合SSS颜色
fn sssCombine(uv: vec2f, sss: vec3f) ->vec4f {
    let coordCenter = vec2f(coordRT(uv)) + 0.5;
    let coordToUV = vec2f(1.0 / infoRT.x);
    let offset = vec3f(1.0, 1.0, 0.0);
    let uvCenter = coordCenter * coordToUV;
    
    let uvA = min((coordCenter + offset.xz), vec2f(infoRT.y - 1.0)) * coordToUV;
    let uvB = max((coordCenter - offset.xz), vec2f(0.0)) * coordToUV;
    let uvC = min((coordCenter + offset.zy), vec2f(infoRT.y - 1.0)) * coordToUV;
    let uvD = max((coordCenter - offset.zy), vec2f(0.0)) * coordToUV;

    let colorA = textureSampleLevel(curRT, splln1, uvA, 0.0);
    let colorB = textureSampleLevel(curRT, splln1, uvB, 0.0);
    let colorC = textureSampleLevel(curRT, splln1, uvC, 0.0);
    let colorD = textureSampleLevel(curRT, splln1, uvD, 0.0);

    let A = (vec4f(decodeRGBM(colorA, uRGBMRange), 1.0)).rgb;
    let B = (vec4f(decodeRGBM(colorB, uRGBMRange), 1.0)).rgb;
    let C = (vec4f(decodeRGBM(colorC, uRGBMRange), 1.0)).rgb;
    let D = (vec4f(decodeRGBM(colorD, uRGBMRange), 1.0)).rgb;

    let a = luminanceLinear(A);
    let b = luminanceLinear(B);
    let c = luminanceLinear(C);
    let d = luminanceLinear(D);

    let ab = abs(a - b);
    let cd = abs(c - d);
    let quant1: vec3f = 0.5 * mix(A + B, C + D, select(0.0, 1.0, ab > cd));
    let quantColor = textureSampleLevel(curRT, splln1, uvCenter, 0.0);
    let quant0: vec3f = (vec4f(decodeRGBM(quantColor, uRGBMRange), 1.0)).rgb;
    let checker = checkerboard(coordCenter, uHalton);

    var diffuse = max(mix(quant1, quant0, checker), vec3f(0.0));
    let specular = max(mix(quant0, quant1, checker), vec3f(0.0));

    // ============================-------------------------------------

    let pack = textureLoad(gbRT, coordRT(uv), 0, 0);
    let scatter = f32((pack.y >> 8u) & 0x7Fu) * (1.0 / 127.0);
    let profile = f32((pack.y >> 15u) & 0x1u);
    let depth = f32(pack.x) / 4294967295.0;

    let scatterWorld = scatter / uScatteringFactorPacker;
    let worldPos = frameUniforms.cameraNearFar.x + (frameUniforms.cameraNearFar.y - frameUniforms.cameraNearFar.x) * depth;
    var factor = uProjFactor * scatterWorld / worldPos;
    factor = smoothstep(0.05, 0.3, factor * 50.0);
    diffuse = mix(diffuse, sss, factor);

    return vec4f(diffuse + specular, 1.0);
}

// 提取漫反射和散射强度
fn postprocess_extract_sss(uv: vec2f) {
    let color = sssExtract(uv);

    material_emissive = color.rgb;
    material_alpha = color.a;
}

// 获取SSS模糊卷积核
fn sample_sssKernel(uv: vec2f) ->vec4f {
    let coord = floor(fract(uv) * vec2f(8.99, 2.99));
    let index = i32(floor(coord.x + 0.0 * 9.0));
    return uTextureSSSKernel[index];
}

// SSS模糊过程中的上阶段结果采样
fn sample_sssBlur(uv: vec2f) ->vec4f {
    // 由于我们使用图集，并且使用线性过滤采样，所以我们约束避免采样到边界
    let bolder = 1.0 / (infoRT.y * infoRT.w);
    let clampedUV = min(max(uv, vec2f(bolder)), vec2f(1.0 - bolder));

    let uvts1 = vec4f(0.5, 0.0, 0.5, 0.5) * infoRT.w;
    let uvts2 = vec4f(0.0, 0.0, 1.0, 1.0) * infoRT.w;

    let uvts = select(uvts2, uvts1, BLUR_SSS == 1u);
    let level = select(1.0, 0.0, BLUR_SSS == 1u);

    return textureSampleLevel(colorRT, splln1, clampedUV * uvts.zw + uvts.xy, level);
}

// 根据SSS强度获取采样点处贡献颜色
fn sssFetchColor(uv: vec2f, colorM: vec4f, depthNormBias: f32) ->vec3f {
    let fetch = sample_sssBlur(saturate(uv));
    var invalid = uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0 || fetch.a == 0.0;

    if (invalid) {
        return colorM.rgb;
    }

    // TODO: 0.1、0.9两个数值是为了增强效果
    let factor = smoothstep(0.0, 0.05, abs(colorM.a - fetch.a) * depthNormBias * 0.1) * 0.9;

    // TODO: 最小混合因子取0.1为了增强效果
    return mix(fetch.rgb, colorM.rgb, max(factor, 0.1));
}

// 模糊SSS
fn sssBlur(uv: vec2f) ->vec4f {
    let colorM = sample_sssBlur(saturate(uv));

    // 当前次表面散射模糊方向
    let uBlurDir = select(vec2f(0.0, 1.0), vec2f(1.0, 0.0), BLUR_SSS == 1u);
    // 当前像素的次表面散射强度
    let scatter_profile = fetchScatter(uv);
    // 当前像素的次表面散射覆盖范围（打包scatter参数时乘了uScatteringFactorPacker，scatterWorld除uSubsurfaceScatteringFactor等于scatter）
    let scatterWorld = scatter_profile.x / uScatteringFactorPacker;
    // 视锥深度范围
    // TODO: 我们发现乘上10倍效果更理想
    let depthRange = (frameUniforms.cameraNearFar.y - frameUniforms.cameraNearFar.x) * 10.0;
    // 两像素间归一化深度差为0时：abs(colorM.a - fetch.a) * depthNormBias == 0
    // 两像素间归一化深度差为（(scatterWorld * 0.05) / (depthRange * 0.05)）时：abs(colorM.a - fetch.a) * depthNormBias == 0.05
    // 两像素间归一化深度差为（scatterWorld / (depthRange * 0.05)）时：abs(colorM.a - fetch.a) * depthNormBias == 1
    // 引入0.05降低深度值范围大小，提供计算精度：smoothstep(0.0, 0.05, abs(colorM.a - fetch.a) * depthNormBias)
    let depthNormBias = depthRange * 0.05 / scatterWorld;
    // 当前像素在视锥中的深度
    let worldPos = frameUniforms.cameraNearFar.x + depthRange * colorM.a;
    // 根据视锥平面深度缩放平面上的单位向量：(uBlurDir * uProjFactor) / worldPos
    // 次表面模糊像素数
    var finalStep = uBlurDir * uProjFactor * scatterWorld / worldPos;
    // 模糊的步长（3步模糊）
    finalStep *= 1.0 / 3.0;

    let yProfile = 1.0 - (f32(scatter_profile.y) - 0.5) / 3.0;
    let xKernelSize = 1.0 / 9.0;
    let kernel0 = sample_sssKernel(vec2f(xKernelSize * 0.5, yProfile)).rgb;
    var colorBlurred = colorM.rgb * kernel0;
    let offKernelNearest = vec2f(0.5 * xKernelSize, 0.0);
    var rnd = interleavedGradientNoise(gl_FragCoord.xy, 0.0);
    rnd = mix(0.5, rnd, 1e+0);
    let offKernelJitter = vec2f(rnd * xKernelSize, 0.0);

    for (var i = 1; i < 9; i++) {
        let uvKernel = vec2f(f32(i) * xKernelSize, yProfile);
        let kernel = sample_sssKernel(uvKernel + offKernelNearest).rgb;
        let kernelDither = sample_sssKernel(uvKernel + offKernelJitter).a;
        let offset = kernelDither * finalStep;
        var fetch = sssFetchColor(uv + offset, colorM, depthNormBias);
        fetch += sssFetchColor(uv - offset, colorM, depthNormBias);
        colorBlurred += kernel.rgb * fetch;
    }

    return vec4f(colorBlurred, colorM.a);
}

// 模糊SSS
fn postprocess_blur_sss(uv: vec2f) {
    let color = sssBlur(uv);

    material_emissive = color.rgb;
    material_alpha = color.a;
}

// ============================-------------------------------------

// 计算颜色亮度值
fn getLuminance(color: vec3f) ->f32 {
    let colorBright = vec3f(0.2126, 0.7152, 0.0722);
    return dot(color, colorBright);
}

// 与周边像素颜色平均
fn box4x4(s0: vec3f, s1: vec3f, s2: vec3f, s3: vec3f) ->vec3f {
    return (s0 + s1 + s2 + s3) * 0.25;
}

// 辉光效果
fn postprocess_bloom(uv: vec2f) {
    // see SIGGRAPH 2014: Advances in Real-Time Rendering
    //     "Next Generation Post-Processing in Call of Duty Advanced Warfare"
    //      Jorge Jimenez

    let uBloomThreshold = 0.5118;

    // 第1趟，从LOD0提取高光到LOD1
    if (PROC_BLOOM == 1u) {
        let coord = uv * infoRT.y;
        let coordMax = vec2f(infoRT.y - 1.0);
        let coordToUV = 1.0  / infoRT.x;

        var color = decodeRGBM(textureSampleLevel(curRT, splln1, (max(min(coord, coordMax), vec2f(1.0)) * coordToUV), 0.0), uRGBMRange);

        color = clamp(color * clamp(getLuminance(color) - uBloomThreshold, 0.0, 1.0), vec3f(0.0), vec3f(1.0));

        material_emissive = color.rgb;
        material_alpha = 1.0;
    }
    // 降采样，分别写入LOD2-LOD5
    else if (PROC_BLOOM < 6u) {
        let levelScale = 1.0 / pow(2.0, f32(i32(PROC_BLOOM - 1u)));
        let coord = uv * infoRT.y * levelScale;
        let coordMax = vec2f(infoRT.y * levelScale - 1.0);
        let coordToUV = 1.0  / (infoRT.x  * levelScale);

        let uv_lt = (max(min(coord + vec2f(-1, -1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_rt = (max(min(coord + vec2f( 1, -1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_rb = (max(min(coord + vec2f( 1,  1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_lb = (max(min(coord + vec2f(-1,  1), coordMax), vec2f(1.0)) * coordToUV);

        let uv_lt2 = (max(min(coord + vec2f(-2, -2), coordMax), vec2f(1.0)) * coordToUV);
        let uv_rt2 = (max(min(coord + vec2f( 2, -2), coordMax), vec2f(1.0)) * coordToUV);
        let uv_rb2 = (max(min(coord + vec2f( 2,  2), coordMax), vec2f(1.0)) * coordToUV);
        let uv_lb2 = (max(min(coord + vec2f(-2,  2), coordMax), vec2f(1.0)) * coordToUV);

        let uv_l = (max(min(coord + vec2f(-2,  0), coordMax), vec2f(1.0)) * coordToUV);
        let uv_t = (max(min(coord + vec2f( 0, -2), coordMax), vec2f(1.0)) * coordToUV);
        let uv_r = (max(min(coord + vec2f( 2,  0), coordMax), vec2f(1.0)) * coordToUV);
        let uv_b = (max(min(coord + vec2f( 0,  2), coordMax), vec2f(1.0)) * coordToUV);

        let uv_c = (max(min(coord, coordMax), vec2f(1.0)) * coordToUV);

        // ====================--------------------------------
        // 我们只绑定了1个贴图MIPMAP层级范围，level参数是相对于该范围的，所以我们总是取0

        let lt  = textureSampleLevel(curRT, splln1, uv_lt, 0.0).rgb;
        let rt  = textureSampleLevel(curRT, splln1, uv_rt, 0.0).rgb;
        let rb  = textureSampleLevel(curRT, splln1, uv_rb, 0.0).rgb;
        let lb  = textureSampleLevel(curRT, splln1, uv_lb, 0.0).rgb;

        let lt2 = textureSampleLevel(curRT, splln1, uv_lt2, 0.0).rgb;
        let rt2 = textureSampleLevel(curRT, splln1, uv_rt2, 0.0).rgb;
        let rb2 = textureSampleLevel(curRT, splln1, uv_rb2, 0.0).rgb;
        let lb2 = textureSampleLevel(curRT, splln1, uv_lb2, 0.0).rgb;

        let l   = textureSampleLevel(curRT, splln1, uv_l, 0.0).rgb;
        let t   = textureSampleLevel(curRT, splln1, uv_t, 0.0).rgb;
        let r   = textureSampleLevel(curRT, splln1, uv_r, 0.0).rgb;
        let b   = textureSampleLevel(curRT, splln1, uv_b, 0.0).rgb;

        let c   = textureSampleLevel(curRT, splln1, uv_c, 0.0).rgb;

        // ====================--------------------------------
        // five h4x4 boxes

        var c0 = vec3f(0.0);
        var c1 = vec3f(0.0);

        c0  = box4x4(lt, rt, rb, lb);
        c1  = box4x4(c, l, t, lt2);
        c1 += box4x4(c, r, t, rt2);
        c1 += box4x4(c, r, b, rb2);
        c1 += box4x4(c, l, b, lb2);

        // weighted average of the five boxes
        material_emissive = c0 * 0.5 + c1 * 0.125;
        material_alpha = 1.0;
    }
    // 升采样（6-5、7-4、8-3、9-2）
    else {
        let level = f32(i32(5u - (PROC_BLOOM - 6u)));
        let levelScale = 1.0 / pow(2.0, level);
        let coord = uv * infoRT.y * levelScale;
        let coordMax = vec2f(infoRT.y * levelScale - 1.0);
        let coordToUV = 1.0  / (infoRT.x  * levelScale);

        let uv_lt = (max(min(coord + vec2f(-1, -1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_rt = (max(min(coord + vec2f( 1, -1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_rb = (max(min(coord + vec2f( 1,  1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_lb = (max(min(coord + vec2f(-1,  1), coordMax), vec2f(1.0)) * coordToUV);

        let uv_l = (max(min(coord + vec2f(-1,  0), coordMax), vec2f(1.0)) * coordToUV);
        let uv_t = (max(min(coord + vec2f( 0, -1), coordMax), vec2f(1.0)) * coordToUV);
        let uv_r = (max(min(coord + vec2f( 1,  0), coordMax), vec2f(1.0)) * coordToUV);
        let uv_b = (max(min(coord + vec2f( 0,  1), coordMax), vec2f(1.0)) * coordToUV);

        let uv_c = (max(min(coord, coordMax), vec2f(1.0)) * coordToUV);

        // ====================--------------------------------

        var c0 = vec3f(0.0);
        var c1 = vec3f(0.0);

        c0  = textureSampleLevel(curRT, splln1, uv_lt, 0.0).rgb;
        c0 += textureSampleLevel(curRT, splln1, uv_rt, 0.0).rgb;
        c0 += textureSampleLevel(curRT, splln1, uv_rb, 0.0).rgb;
        c0 += textureSampleLevel(curRT, splln1, uv_lb, 0.0).rgb;

        c0 += textureSampleLevel(curRT, splln1, uv_c, 0.0).rgb * 4.0;

        c1  = textureSampleLevel(curRT, splln1, uv_l, 0.0).rgb;
        c1 += textureSampleLevel(curRT, splln1, uv_t, 0.0).rgb;
        c1 += textureSampleLevel(curRT, splln1, uv_r, 0.0).rgb;
        c1 += textureSampleLevel(curRT, splln1, uv_b, 0.0).rgb;

        material_emissive = (c0 + 2.0 * c1) * (1.0 / 16.0);
        material_alpha = 1.0;
    }
}

// ============================-------------------------------------

// 色阶映射
fn toneMapping(color: vec3f) ->vec3f {
    let uToneExposure = 1.0;
    let uToneBrightness = 0.0;
    let uToneSaturation = 1.0;
    let uToneContrast = 0.0;
    let uToneMethod = 2;

    var col = color * uToneExposure;
    let luminance = dot(col * (1.0 + uToneBrightness), vec3f(0.2126, 0.7152, 0.0722));
    col = mix(vec3f(luminance), col * (1.0 + uToneBrightness), vec3f(uToneSaturation));
    let toneContrast = uToneContrast;
    col = max(vec3f(0.0), col * (1.0 + toneContrast) - 0.5 * toneContrast);
    if (uToneMethod == 1) {
        col /= 1.0 + getLuminance(col);
    }
    else if(uToneMethod == 2) {
        let x = max(vec3f(0.0), col - 0.004);
        col = (x * (6.2 * x + 0.5) ) / ( x * (6.2 * x + 1.7) + 0.06);
        col = pow(col, vec3f(2.2));
    }
    return col;
}

// ============================-------------------------------------

var<private> material_alpha: f32 = 1.0;
var<private> material_emissive: vec3f = vec3f(0.0);

fn material_fs() {
    let MIPMAP_COLOR_ = MIPMAP_COLOR;
    let MIPMAP_ZDEPTH_ = MIPMAP_ZDEPTH;
    let EXTRACT_SSAO_ = EXTRACT_SSAO;
    let EXTRACT_SSR_ = EXTRACT_SSR;
    let EXTRACT_SSS_ = EXTRACT_SSS;
    let BLUR_SSS_ = BLUR_SSS;
    let PROC_BLOOM_ = PROC_BLOOM;
    let BLIT_CANVAS_ = BLIT_CANVAS;
    let BLIT_CANVAS_COMBINE_SSS_ = BLIT_CANVAS_COMBINE_SSS;
    let BLIT_CANVAS_COMBINE_BLOOM_ = BLIT_CANVAS_COMBINE_BLOOM;
    let BLIT_CANVAS_TONE_MAPPING_ = BLIT_CANVAS_TONE_MAPPING;

    // ============================-------------------------------------

    let uv = vec2f(inputs_uv.x, 1.0 - inputs_uv.y);

    infoRT = frameUniforms.targetInfo;

    // ============================-------------------------------------

    if (MIPMAP_COLOR > 0u) {
        postprocess_mipmap_color(uv);
    }
    else if (MIPMAP_ZDEPTH > 0u) {
        postprocess_mipmap_z(uv);
    }
    else if (EXTRACT_SSAO > 0u) {
        postprocess_ssao(uv);
    }
    else if (EXTRACT_SSR > 0u) {
        postprocess_ssr(uv);
    }
    else if (EXTRACT_SSS > 0u) {
        postprocess_extract_sss(uv);
    }
    else if (BLUR_SSS > 0u) {
        postprocess_blur_sss(uv);
    }
    else if (PROC_BLOOM > 0u) {
        postprocess_bloom(uv);
    }
    else if (BLIT_CANVAS > 0u) {
        let coord = uv * infoRT.y;
        let coordMax = vec2f(infoRT.y - 1.0);
        let coordToUV = 1.0  / infoRT.x;
        let rt_uv = max(min(coord, coordMax), vec2f(1.0)) * coordToUV;

        var color = vec3f(0.0);

        if (BLIT_CANVAS_COMBINE_SSS > 0u) {
            let sss = textureSampleLevel(colorRT, splln1, rt_uv * 0.5 + vec2(0.5, 0.0) * infoRT.w, 0.0).rgb;
            color = sssCombine(uv, sss).rgb;
        }
        else {
            color = decodeRGBM(textureSampleLevel(curRT, splln1, rt_uv, 0.0), uRGBMRange);
        }

        if (BLIT_CANVAS_TONE_MAPPING > 0u) {
            color = toneMapping(color);
        }

        if (BLIT_CANVAS_COMBINE_BLOOM > 0u) {
            color += textureSampleLevel(curRT, splln1, rt_uv, 1.0).rgb * 0.5;
        }

        color = linearTosRGB_vec3(color);

        material_emissive = color;
        material_alpha = 1.0;
    }
}
