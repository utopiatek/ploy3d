
// 可以使用smoothstep方法替代
fn linstep(min_: f32, max_: f32, v_: f32) ->f32 {
    return clamp((v_ - min_) / (max_ - min_), 0.0, 1.0);
}

// 令[0, amount]的部分归零并将(amount, 1]重新映射到(0, 1]
fn reduceLightBleed(max_: f32, amount_: f32) ->f32 {
    return linstep(amount_, 1.0, max_);
}

// 使用切比雪夫不等式计算可见度
fn chebyshevUpperBound(moments: vec2f, mean: f32, minVariance: f32, lightBleedReduction: f32) ->f32 {

    // 参考：Donnelly and Lauritzen 2006, "Variance Shadow Maps"

    // 深度值的方差=深度值平方的期望-深度值期望的平方
    var variance = moments.y - (moments.x * moments.x);
    // 受到直接光照的片元的方差非常小，且t - E(x)的值始终在零的附近，切比雪夫不等式的分母接近0，因此容易产生明暗交加的条纹
    // 可以使用一个最小方差来解决该问题，EVSM方法也可以移除最小方差的引入
    variance = max(variance, minVariance);

    // t - E(x)
    let d = mean - moments.x;
    // 切比雪夫不等式
    var max_ = variance / (variance + d * d);

    // 处理渗光问题，将结果映射到(lightBleedReduction, 1]区间
    max_ = reduceLightBleed(max_, lightBleedReduction);

    // 如果像素被遮挡，返回根据切比雪夫不等式算出的光照可见度
    return select(max_, 1.0, mean <= moments.x);
}

// VSM光照可见度计算
fn evaluateVSM(moments: vec2f, depth: f32) -> f32 {
    // 参考：https://www.cnblogs.com/X-Jun/p/16269653.html#_lab2_1_1
    // 参考：https://zhuanlan.zhihu.com/p/498067785?utm_id=0

    let depthScale = frameUniforms.vsmDepthScale * depth;
    let minVariance = depthScale * depthScale;

    return chebyshevUpperBound(moments, depth, minVariance, frameUniforms.vsmLightBleedReduction);
}

// 采样阴影贴图
fn sampleSM(uv_: vec2f, cascade: u32) ->vec2f {
    let rects : array<vec4f, 4> = array<vec4f, 4>(
        vec4f(0.0, 0.0, 1.0, 0.5),
        vec4f(0.0, 0.0, 1.0, 0.5),
        vec4f(0.0, 0.5, 1.0, 0.5),
        vec4f(0.0, 0.5, 1.0, 0.5),
    );

    let rect = rects[cascade];
    let uv = vec2f(uv_.x, 1.0 - uv_.y) * rect.zw + rect.xy;

    // 贴图L1大小
    let rtSize = frameUniforms.targetInfo.x * 0.5;
    // 贴图L1绘制大小
    let drawSize = frameUniforms.targetInfo.y * 0.5;

    let coordCenter = min(uv * drawSize, vec2f(drawSize - 1.0)) + 0.5;
    let coordToUV = vec2f(1.0 / rtSize);
    let offset = vec3f(1.0, 1.0, 0.0);
    let uv0 = coordCenter * coordToUV;

    let uv1 = min((coordCenter + offset.xz), vec2f(drawSize - 1.0)) * coordToUV;
    let uv2 = max((coordCenter - offset.xz), vec2f(0.0)) * coordToUV;
    let uv3 = min((coordCenter + offset.zy), vec2f(drawSize - 1.0)) * coordToUV;
    let uv4 = max((coordCenter - offset.zy), vec2f(0.0)) * coordToUV;

    // ======================----------------------------------

    // TODO: 优化，生成阴影贴图MIPMAP

    let data0 = textureSampleLevel(colorRT, splln1, uv0, 1.0);
    let data1 = textureSampleLevel(colorRT, splln1, uv1, 1.0);
    let data2 = textureSampleLevel(colorRT, splln1, uv2, 1.0);
    let data3 = textureSampleLevel(colorRT, splln1, uv3, 1.0);
    let data4 = textureSampleLevel(colorRT, splln1, uv4, 1.0);

    let data  = (data0 + (data1 + data2 + data3 + data4) * 0.25) * 0.5;

    // ======================----------------------------------

    if ((cascade % 2) == 1u) {
        return data.zw;
    }

    return data.xy;
}

// VSM计算光照深度和采样阴影贴图。
fn sampleVSM(shadowPosition: vec4f, cascade: u32) -> f32{

    // XY进行透视除法后变为屏幕空间坐标，Z值是光照空间中[0,1]的线性值
    // 参见：[ShadowMap.cpp]ShadowMap::computeVsmLightSpaceMatrix()，[common_shadowing.fs]computeLightSpacePosition()
    let position = vec3f(shadowPosition.xy * (1.0 / shadowPosition.w), shadowPosition.z);

    // 采样阴影贴图深度的期望和深度平方的期望
    let moments = sampleSM(position.xy, cascade);

    var depth = position.z;

    if (shadowPosition.x < 0.0 || shadowPosition.x > 1.0 || shadowPosition.y < 0.0 || shadowPosition.y > 1.0 || depth > 0.999) {
        return 1;
    }

    // EVSM pre-mapping，结果在[-vsmExponent, +vsmExponent]之间，表示指数，其后用exp方法转换为曲线
    depth = depth * 2.0 - 1.0;
    depth = exp(frameUniforms.vsmExponent * depth);

    let p = evaluateVSM(moments, depth);

    return p;
}

// 返回阴影级联索引[0, 3]
// 因为光照方向不垂直于观察方向，即光照方向不平行于视锥屏幕，而我们使用视锥平面划分区块，因此会有一个像素属于多个区块的情况，我们总取最大的索引
// TODO: 投射物在第0区块，接收物在第1区块，能否往第0区块采样以提高精度
fn getShadowCascade(z: f32) ->u32 {
    // 判断是否位于各级别深度阈值之前
    let greaterZ = step(frameUniforms.cascadeSplits, vec4f(z));
    // 点乘方法是对应元素相乘然后累加，因此此处点乘结果是能通过greaterThan判断的离相机最近的级别索引
    return clamp(u32(dot(greaterZ, vec4f(1.0))), 0u, 3u);
}

// 在光照空间中指定位置点采样光照可见度，返回结果可以用于与光照强度相乘
fn shadow(cascade: u32) -> f32 {
    if (frameUniforms.shadowDisable > 0u) {
        return 1.0;
    }

    let shadowPosition = getCascadeLightSpacePosition(cascade);
    return sampleVSM(shadowPosition, cascade);
}
