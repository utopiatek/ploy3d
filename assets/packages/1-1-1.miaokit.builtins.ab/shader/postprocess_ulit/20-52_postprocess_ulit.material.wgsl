
override MIPMAP_ZDEPTH = 0u;
override EXTRACT_SSAO = 0u;
override EXTRACT_SSR = 0u;
override EXTRACT_SSS = 0u;
override BLUR_SSS = 0u;
override BLIT_CANVAS = 0u;
override BLIT_CANVAS_COMBINE_SSS = 1u;
override BLIT_CANVAS_TONE_MAPPING = 1u;

const uvts_sssBlur1: vec4f = vec4f((0.5 + 1.0 / 2048), (0.0 + 1.0 / 2048.0), (1022.0 / 2048.0), (1022.0 / 2048.0));
const uvts_sssBlur2: vec4f = vec4f((0.0 + 1.0 / 1024), (0.0 + 1.0 / 1024), (1022.0 / 1024), (1022.0 / 1024));

var<private> uTextureSSSKernel : array<vec4f, 27> = array<vec4f, 27>(
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

// screen_height / (tan(fov * 0.5) * 2.0)
var<private> uSsaoProjectionScale = -1040.0;
// 影响范围的半径，控制在屏幕空间中用于计算遮蔽效果的采样点的半径
// 这个值影响的是环境光遮蔽的“感知距离”，半径越大，遮蔽的效果越大，但也会导致遮蔽效果变得过于扩散、不精确
// 通常设置在 0.5 到 3.0 之间，具体取决于场景的尺寸，如果场景很大，遮蔽半径可以设置得更大一些
// 可以根据视距或者摄像机的位置动态调整。例如，在远距离时，半径可以适当调大
var<private> uSsaoRadius = 0.1441;
// 用于避免“自遮蔽”问题的偏移量，通常用于控制遮蔽效果的起始距离
// 如果 uSsaoBias 设置得太小，可能会产生自遮蔽，即物体表面会遮蔽自己，产生不真实的暗影；如果设置得太大，则遮蔽效果可能不够明显
// 较为平滑的表面需要较小的偏移量，而较复杂或粗糙的表面则可能需要更大的偏移量
// 一般在 0.01 到 0.1 之间，视场景的复杂度而定
// 根据物体的法线和深度值计算，适当调整偏移量
var<private> uSsaoBias = 0.0114;
var<private> uSsaoIntensity = 0.2;
var<private> uSsaoProjectionInfo = vec4f(-0.0014, -0.0014, 0.7404, 0.4142);

var<private> uFrameModTaaSS = 0.0;
var<private> uQuality = 1.0;
var<private> uTextureOutputSize = vec2f(1024.0);
var<private> uNearFar = vec2f(1.0, 128.0);
// 视锥平面深度与视锥平面大小的比值
var<private> uProjFactor = 1.3517;
// 单位距离对应的次表面散射衰减强度
var<private> uScatteringFactorPacker = 0.1018;

var<private> uToneExposure = 1.0;
var<private> uToneBrightness = 0.0;
var<private> uToneSaturation = 1.0;
var<private> uToneContrast = 0.0;
var<private> uToneMethod = 2;

@group(3) @binding(0) var curRT : texture_2d<f32>;

// ============================-------------------------------------

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

fn fetchDepthLevel(uv: vec2f, level: f32) ->f32 {
    //return textureSampleLevel(colorRT, spnnn1, uv * vec2f(0.5) + vec2f(0.5, 0.0), level).a;
    //return textureSampleLevel(colorRT, spnnn1, uv * vec2f(0.5) + vec2f(0.5, 0.0), 0.0).a;
    let pack = textureLoad(gbRT, vec2<u32>(uv * 2048.0), 0, 0);
    let depth = f32(pack.x) / 4294967295.0;

    return depth;
}

fn zValueFromScreenSpacePosition(depth: f32) ->f32 {
    return uNearFar.x + (uNearFar.y - uNearFar.x) * depth;
}

fn reconstructCSPosition(ssP: vec2f, z: f32) ->vec3f {
    return vec3f((ssP.xy * uSsaoProjectionInfo.xy + uSsaoProjectionInfo.zw) * z, -z);
}

fn getPosition(uv: vec2f) ->vec3f {
    return reconstructCSPosition(uv * uTextureOutputSize, zValueFromScreenSpacePosition(fetchDepthLevel(uv, 0.0)));
}

fn getOffsetedPixelPos(uv: vec2f, unitOffset: vec2f, screenSpaceRadius: f32) ->vec3f {
    let mipLevel = clamp(floor(log2(screenSpaceRadius)) - f32(3), 0.0, f32(5));
    let uvOff = uv + floor(screenSpaceRadius * unitOffset) / uTextureOutputSize;
    let d = zValueFromScreenSpacePosition(fetchDepthLevel(uvOff, mipLevel));
    return reconstructCSPosition(uvOff * uTextureOutputSize, d);
}

fn ssaoExtract(uv: vec2f) ->f32 {
    let depthPacked = fetchDepthLevel(uv, 0.0);
    var cameraSpacePosition = getPosition(uv);
    var ssRadius = uSsaoProjectionScale * uSsaoRadius / cameraSpacePosition.z;
    var normal = cross(dpdy(cameraSpacePosition), dpdx(cameraSpacePosition));
    if (depthPacked > 0.99) {
        return 1.0;
    }
    if (ssRadius < 1.0) {
        return 1.0;
    }
    normal = normalize(normal);
    var nFalloff = mix(1.0, max(0.0, 1.5 * normal.z), 0.35);
    var randomAngle = 6.28 * interleavedGradientNoise(gl_FragCoord.xy, uFrameModTaaSS);
    var invRadius2 = 1.0 / (uSsaoRadius * uSsaoRadius);
    var contrib = 0.0;
    var vv = 0.0;
    var vn = 0.0;
    var screenSpaceRadius = 0.0;
    var angle = 0.0;
    var occludingPoint =  vec3f(0.0);
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

fn postprocess_ssao(uv: vec2f) {
    let ao = ssaoExtract(uv);
    material_emissive = vec3f(ao);
    material_alpha = ao;
}

// ============================-------------------------------------

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

fn computeLodUVNearest(uvIn: vec2f, pixelSizePowLevel: vec3f) ->vec2f {
    let uv = max(pixelSizePowLevel.xy, min(1.0 - pixelSizePowLevel.xy, uvIn));
    return vec2f(2.0 * uv.x, pixelSizePowLevel.z - 1.0 - uv.y) / pixelSizePowLevel.z;
}

fn fetchColorLod(level: f32, uv: vec2f) ->vec3f {
    //const uPreviousGlobalTexSize = vec2f(2048.0);
    //let pixelSizePowLevel = computeLodNearestPixelSizePowLevel(7.0 * level, 7.0, uPreviousGlobalTexSize);
    //let uvNearest = computeLodUVNearest(uv, pixelSizePowLevel);
    let color = textureSampleLevel(colorRT, splln1, vec2f(uv.x, 1.0 - uv.y), 0.0);
    return color.rgb;
}

fn fetchDepthLod(uv: vec2f, pixelSizePowLevel: vec3f) ->f32 {
    let pack = textureLoad(gbRT, vec2<u32>((saturate(vec2f(uv.x, 1.0 - uv.y))) * 2048.0), 0, 0);
    let depth = f32(pack.x) / 4294967295.0;

    // 返回-Z轴坐标
    if (depth >= 1.0) {
        return -uNearFar.y * 100.0;
    }

    return -uNearFar.x - depth * (uNearFar.y - uNearFar.x);
}

fn ssrViewToScreen(projection: mat4x4<f32>, viewVertex: vec3f) ->vec3f {
    let projected = projection * vec4f(viewVertex, 1.0);
    return vec3f(0.5 + 0.5 * projected.xy / projected.w, projected.w);
}

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

fn getStepOffset(frameMod: f32) ->f32 {
    return (interleavedGradientNoise(gl_FragCoord.xy, frameMod) - 0.5);
}

fn rayTraceUnrealSimple(viewVertex: vec3f, rayOriginUV: vec3f, rayLen: f32, depthTolerance_: f32, rayDirView: vec3f, roughness: f32, frameMod: f32) ->vec4f {
    const uTextureToBeRefractedSize = vec2f(2048.0, 2048.0);
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

fn ssr(roughness: f32, normal: vec3f, eyeVector: vec3f, viewVertex: vec3f) ->vec4f {
    const uSsrFactor = 1.0;
    var result = vec4f(0.0);
    var rough4 = roughness * roughness;
    rough4 = rough4 * rough4;
    let upVector = select(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), abs(normal.z) < 0.999);
    let tangentX = normalize(cross(upVector, normal));
    let tangentY = cross(normal, tangentX);
    var maskSsr = uSsrFactor * clamp(-4.0 * dot(eyeVector, normal) + 3.8, 0.0, 1.0);
    maskSsr *= clamp(4.7 - roughness * 5.0, 0.0, 1.0);
    var rayOriginUV = ssrViewToScreen(frameUniforms.cfvMat, viewVertex.xyz);
    /// Y轴向上，贴图采样UV Y轴向下
    rayOriginUV.z = 1.0 / rayOriginUV.z;
    var rayDirView = unrealImportanceSampling(uFrameModTaaSS, tangentX, tangentY, normal, eyeVector, rough4);
    /// rayDirView.z == -1，射线指向屏幕里，因子算得0，射线长度等于远平面距离减像素坐标Z值（Z值为负）
    /// rayDirView.z == +1，射线指向屏幕外，因子算得1，射线长度等于像素坐标Z值（Z值为负）减近平面距离
    var rayLen = mix(uNearFar.y + viewVertex.z, -viewVertex.z - uNearFar.x, rayDirView.z * 0.5 + 0.5);
    let maxLen = select(select(1000.0, 100.0, viewVertex.z > -100.0), 10.0, viewVertex.z > -10.0);
    rayLen = min(rayLen, maxLen);
    let depthTolerance = 0.5 * rayLen;
    if (dot(rayDirView, normal) > 0.001 && maskSsr > 0.0) {
        let resRay = rayTraceUnrealSimple(viewVertex, rayOriginUV, rayLen, depthTolerance, rayDirView, roughness, uFrameModTaaSS);
        if (resRay.w > 0.0 && resRay.w < 0.95) { // 添加上限排除自我相交，可能有更好的方案
            result = fetchColorContribution(resRay, maskSsr, roughness);
        }
    }
    // 光照着色时按以下方法进行混合
    // mix(specularEnvironment, specularColor * sssColor.rgb, sssColor.a);
    return result;
}

fn faceNormal(dpdx: vec3f, dpdy: vec3f) -> vec3f {
    return normalize(cross(dpdx, dpdy));
}

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

fn postprocess_ssr(uv: vec2f, resolution: vec4f) {
    let depth = fetchDepthLevel(uv, 0.0);
    if (depth > 0.99) {
        material_emissive =vec3f(0.0);
        material_alpha = 0.0;
        return;
    }

    let z = zValueFromScreenSpacePosition(depth);
    let viewVertex = reconstructCSPosition(uv * resolution.xy, z);
    let normal = computeViewSpaceNormalHighQ(uv, depth, viewVertex, resolution, 0.0);
    let eyeVector = normalize(-viewVertex);

    // TODO: 需要额外编码粗糙度线性输入值
    let color = ssr(0.1, normal, eyeVector, viewVertex);
    material_emissive = color.rgb;
    material_alpha = color.a;
}

// ============================-------------------------------------

fn fetchScatter(uv: vec2f) ->vec2f {
    let pack = textureLoad(gbRT, vec2<u32>(uv * 2048.0), 0, 0);
    let scatter = f32((pack.y >> 8u) & 0x7Fu) * (1.0 / 127.0);
    let profile = f32((pack.y >> 15u) & 0x1u);

    return vec2f(scatter, profile);
}

fn sssExtract(uv: vec2f) ->vec4f {
    let uTextureSSSColorSize = vec2f(2048.0);
    let uTextureSSSColorRatio = vec2f(1.0);

    let coordCenter = floor(uv * uTextureSSSColorSize) + 0.5;
    let uvCenter = coordCenter / uTextureSSSColorSize;
    let offset = vec3f(1.0, 1.0, 0.0);

    let colorA = textureSampleLevel(colorRT, splln1, (min((coordCenter + offset.xz) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let colorB = textureSampleLevel(colorRT, splln1, (min((coordCenter - offset.xz) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let colorC = textureSampleLevel(colorRT, splln1, (min((coordCenter + offset.zy) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let colorD = textureSampleLevel(colorRT, splln1, (min((coordCenter - offset.zy) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);

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
    let quantColor = textureSampleLevel(colorRT, splln1, (min(uvCenter, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let quant0: vec3f = (vec4(decodeRGBM(quantColor, uRGBMRange), 1.0)).rgb;
    let checker = checkerboard(coordCenter, uHalton);

    let diffuse = mix(quant1, quant0, checker);
    let specular = mix(quant0, quant1, checker);

    // ============================-------------------------------------

    let scatter_profile = fetchScatter(uv);

    let pack = textureLoad(gbRT, vec2<u32>(uv * 2048.0), 0, 0);
    let scatter = f32((pack.y >> 8u) & 0x7Fu) * (1.0 / 127.0);
    let profile = f32((pack.y >> 15u) & 0x1u);
    let depth = f32(pack.x) / 4294967295.0;

    return select(vec4f(diffuse, depth), vec4f(0.0), (scatter_profile.x == 0.0 || profile == 0.0));
}

fn sssCombine(uv: vec2f, sss: vec3f) ->vec4f {
    let uTextureSSSColorSize = vec2f(2048.0);
    let uTextureSSSColorRatio = vec2f(1.0);

    let coordCenter = floor(uv * uTextureSSSColorSize) + 0.5;
    let uvCenter = coordCenter / uTextureSSSColorSize;
    let offset = vec3f(1.0, 1.0, 0.0);

    let colorA = textureSampleLevel(curRT, splln1, (min((coordCenter + offset.xz) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let colorB = textureSampleLevel(curRT, splln1, (min((coordCenter - offset.xz) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let colorC = textureSampleLevel(curRT, splln1, (min((coordCenter + offset.zy) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let colorD = textureSampleLevel(curRT, splln1, (min((coordCenter - offset.zy) / uTextureSSSColorSize.xy, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);

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
    let quantColor = textureSampleLevel(curRT, splln1, (min(uvCenter, 1.0 - 1e+0 / uTextureSSSColorSize.xy)) * uTextureSSSColorRatio, 0.0);
    let quant0: vec3f = (vec4(decodeRGBM(quantColor, uRGBMRange), 1.0)).rgb;
    let checker = checkerboard(coordCenter, uHalton);

    var diffuse = mix(quant1, quant0, checker);
    let specular = mix(quant0, quant1, checker);

    // ============================-------------------------------------

    let pack = textureLoad(gbRT, vec2<u32>(uv * 2048.0), 0, 0);
    let scatter = f32((pack.y >> 8u) & 0x7Fu) * (1.0 / 127.0);
    let profile = f32((pack.y >> 15u) & 0x1u);
    let depth = f32(pack.x) / 4294967295.0;

    let scatterWorld = scatter / uScatteringFactorPacker;
    let worldPos = uNearFar.x + (uNearFar.y - uNearFar.x) * depth;
    var factor = uProjFactor * scatterWorld / worldPos;
    factor = smoothstep(0.05, 0.3, factor * 50.0);
    diffuse = mix(diffuse, sss, factor);

    return vec4(diffuse + specular, 1.0);
}

fn postprocess_extract_sss(uv: vec2f) {
    let color = sssExtract(uv);

    material_emissive = color.rgb;
    material_alpha = color.a;
}

fn sample_sssKernel(uv: vec2f) ->vec4f {
    let coord = floor(fract(uv) * vec2f(8.99, 2.99));
    let index = i32(floor(coord.x + 0.0 * 9.0));
    return uTextureSSSKernel[index];
}

fn sample_sssBlur(uv: vec2f) ->vec4f {
    let uvts = select(uvts_sssBlur2, uvts_sssBlur1, BLUR_SSS == 1u) ;
    let level = select(1.0, 0.0, BLUR_SSS == 1u);

    return textureSampleLevel(colorRT, splln1, uv * uvts.zw + uvts.xy, level);
}

fn sssFetchColor(uv: vec2f, colorM: vec4f, depthNormBias: f32) ->vec3f {
    let fetch = sample_sssBlur(saturate(uv));
    var invalid = uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0 || fetch.a == 0.0;

    if (invalid) {
        return colorM.rgb;
    }

    // 0.1、0.9两个数值是为了增强效果
    let factor = smoothstep(0.0, 0.05, abs(colorM.a - fetch.a) * depthNormBias * 0.1) * 0.9;

    return mix(fetch.rgb, colorM.rgb, max(factor, 0.1));
}

fn sssBlur(uv: vec2f) ->vec4f {
    let colorM = sample_sssBlur(saturate(uv));

    // 当前次表面散射模糊方向
    let uBlurDir = vec2f(1.0, 0.0);
    // 当前像素的次表面散射强度
    let scatter_profile = fetchScatter(uv);
    // 当前像素的次表面散射覆盖范围（打包scatter参数时乘了uScatteringFactorPacker，scatterWorld除uSubsurfaceScatteringFactor等于scatter）
    let scatterWorld = scatter_profile.x / uScatteringFactorPacker;
    // 视锥深度范围
    let depthRange = (uNearFar.y - uNearFar.x);
    // 两像素间归一化深度差为0时：abs(colorM.a - fetch.a) * depthNormBias == 0
    // 两像素间归一化深度差为（(scatterWorld * 0.05) / (depthRange * 0.05)）时：abs(colorM.a - fetch.a) * depthNormBias == 0.05
    // 两像素间归一化深度差为（scatterWorld / (depthRange * 0.05)）时：abs(colorM.a - fetch.a) * depthNormBias == 1
    // 引入0.05降低深度值范围大小，提供计算精度：smoothstep(0.0, 0.05, abs(colorM.a - fetch.a) * depthNormBias)
    let depthNormBias = depthRange * 0.05 / scatterWorld;
    // 当前像素在视锥中的深度
    let worldPos = uNearFar.x + depthRange * colorM.a;
    // 根据视锥平面深度缩放平面上的单位向量：(uBlurDir * uProjFactor) / worldPos
    // 次表面模糊像素数
    var finalStep = uBlurDir * uProjFactor * scatterWorld / worldPos;
    // 模糊的步长（3步模糊）
    finalStep *= 1.0 / 3.0;
    // 如果模型放大，将后面的0.1倍数移除
    finalStep *= 2.0 * 0.1;

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

    //C0_D1_G0
    //return vec3f(colorM.rgb);
    //return vec3f(colorM.rgb * 10.0);
    //return vec3f(colorM.aaa);
    //return vec3f(scatter_profile.x);
    //return vec3f(scatter_profile.y);
    //return vec3f(scatterWorld);
    //return vec3f(depthNormBias * 0.1);
    //return vec3f(worldPos / 127.0);
    //return vec3f(finalStep * 10.0, 0.0);
    //return vec3f(kernel0);
    //return vec3f(colorM.rgb * kernel0);
    //return vec3f(offKernelNearest * 10.0, 0.0);
    //return vec3f(rnd);
    //return vec3f(offKernelJitter * 10.0, 0.0);

    return vec4f(colorBlurred, colorM.a);
}

fn postprocess_blur_sss(uv: vec2f) {
    let color = sssBlur(uv);

    material_emissive = color.rgb;
    material_alpha = color.a;
}

// ============================-------------------------------------

fn getLuminance(color: vec3f) ->f32 {
    let colorBright = vec3f(0.2126, 0.7152, 0.0722);
    return dot(color, colorBright);
}

fn toneMapping(color: vec3f) ->vec3f {
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
    let MIPMAP_ZDEPTH_ = MIPMAP_ZDEPTH;
    let EXTRACT_SSAO_ = EXTRACT_SSAO;
    let EXTRACT_SSR_ = EXTRACT_SSR;
    let EXTRACT_SSS_ = EXTRACT_SSS;
    let BLUR_SSS_ = BLUR_SSS;
    let BLIT_CANVAS_ = BLIT_CANVAS;
    let BLIT_CANVAS_COMBINE_SSS_ = BLIT_CANVAS_COMBINE_SSS;
    let BLIT_CANVAS_TONE_MAPPING_ = BLIT_CANVAS_TONE_MAPPING;

    // ============================-------------------------------------

    let uv = vec2f(inputs_uv.x, 1.0 - inputs_uv.y);

    let resolution = frameUniforms.resolution;
    let pi_z = 1.0 / frameUniforms.cfvMat[0][0];
    let pi_w = 1.0 / frameUniforms.cfvMat[1][1];
    let pi_xy = pi_w / (resolution.y * 0.5);

    //深度缓存写入时映射的深度范围并不要求与后处理中解码映射的深度范围相同，但需要保证写入的精度
    //当然如果映射范围前后不一致，解码出的相机空间坐标也不一致，因此最好设置为一致的范围
    //深度范围对SSR效果影响很大
    uNearFar = vec2f(frameUniforms.camera_params.x - (1.0 / frameUniforms.camera_params.y), frameUniforms.camera_params.x);
    //将范围放大10倍可增强SSAO效果
    uNearFar.y = uNearFar.x + (uNearFar.y - uNearFar.x) * 10.0;

    // 在reconstructCSPosition用于计算相机空间坐标
    uSsaoProjectionInfo = vec4f(pi_xy, -pi_xy, -pi_z, pi_w);

    // ============================-------------------------------------

    if (MIPMAP_ZDEPTH > 0u) {
        postprocess_mipmap_z(uv);
    }
    else if (EXTRACT_SSAO > 0u) {
        postprocess_ssao(uv);
    }
    else if (EXTRACT_SSR > 0u) {
        postprocess_ssr(uv, resolution);
    }
    else if (EXTRACT_SSS > 0u) {
        postprocess_extract_sss(uv);
    }
    else if (BLUR_SSS > 0u) {
        postprocess_blur_sss(uv);
    }
    else if (BLIT_CANVAS > 0u) {
        let base = decodeRGBM(textureSampleLevel(curRT, splln1, uv, 0.0), uRGBMRange);
        var color = base;

        if (BLIT_CANVAS_COMBINE_SSS > 0u) {
            let sss = textureSampleLevel(colorRT, splln1, uv * 0.5 + vec2(0.5, 0.0), 0.0).rgb;
            color = sssCombine(uv, sss).rgb;
        }

        if (BLIT_CANVAS_TONE_MAPPING > 0u) {
            color = toneMapping(color);
        }

        color = linearTosRGB_vec3(color);

        material_emissive = color;
        material_alpha = 1.0;
    }
}
