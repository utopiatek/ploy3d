
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
fn sampleSM(uv: vec2f, cascade: u32) ->vec2f {

    // [0, 1024, 1024, 1024]
    // [1024, 1024, 1024, 1024]
    // [0, 512, 512, 512]

    let rects : array<vec4f, 6> = array<vec4f, 6>(
        vec4f(0.0, 0.50, 0.4995, 0.4995),
        vec4f(0.0, 0.50, 0.4995, 0.4995),
        vec4f(0.5, 0.50, 0.4995, 0.4995),
        vec4f(0.5, 0.50, 0.4995, 0.4995),
        vec4f(0.0, 0.25, 0.2495, 0.2495),
        vec4f(0.0, 0.25, 0.2495, 0.2495)
    );

    let rect = rects[cascade];

    let uvstride = vec2f(2.0 / 1024.0);
    var uv_ = vec2f(uv.x * rect[2] + rect[0], (1.0 - uv.y) * rect[3] + rect[1]);

    // TODO: 优化，生成阴影贴图MIPMAP
    let data0 = textureSampleLevel(colorRT, splln1, uv_, 0.0);
    let data1 = textureSampleLevel(colorRT, splln1, uv_ + uvstride, 0.0);
    let data2 = textureSampleLevel(colorRT, splln1, uv_ - uvstride, 0.0);
    let data3 = textureSampleLevel(colorRT, splln1, vec2f(uv_.x + uvstride.x, uv_.y - uvstride.y), 0.0);
    let data4 = textureSampleLevel(colorRT, splln1, vec2f(uv_.x - uvstride.x, uv_.y + uvstride.y), 0.0);
    let data  = (data0 + (data1 + data2 + data3 + data4) * 0.25) * 0.5;

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

    if (shadowPosition.x < 0.0 || shadowPosition.x > 1.0 || shadowPosition.y < 0.0 || shadowPosition.y > 1.0) {
        return 1;
    }

    var depth = position.z;

    // EVSM pre-mapping，结果在[-vsmExponent, +vsmExponent]之间，表示指数，其后用exp方法转换为曲线
    depth = depth * 2.0 - 1.0;
    depth = exp(frameUniforms.vsmExponent * depth);

    let p = evaluateVSM(moments, depth);

    return p;
}

// 在光照空间中指定位置点采样光照可见度，返回结果可以用于与光照强度相乘
fn shadow(cascade: u32) -> f32 {
    let shadowPosition = getCascadeLightSpacePosition(cascade);
    return sampleVSM(shadowPosition, cascade);
}
