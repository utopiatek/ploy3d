
// ============================------------------------------------------------

// 投影平面高度与投影距离之比
var<private> fov                = tan(radians(60.0));
// 视口分辨率
var<private> iResolution        = vec2f(2048.0);
// 程序运行时间
var<private> iTime              = 0.0;
// 噪音贴图分辨率
var<private> iChannelResolution0 = vec2f(256.0);

// 噪音贴图采样函数
fn sample_iChannel0(uv: vec2f, lod: f32) ->vec4f {
    return textureSampleLevel(noiseTex, splln1, uv, 0.0);
}

// 月亮表面贴图采样函数
fn sample_iChannel1(uv: vec2f, lod: f32) ->vec4f {
    return textureSampleLevel(moonTex, splln1, uv, 0.0);
}

// 背景贴图采样函数
fn sample_iChannel2(uv: vec2f, lod: f32) ->vec4f {
    return vec4f(0.0);
}

// ============================------------------------------------------------

// 地球半径
const R0                        = 6378137.0;
// 大气层半径
const Ra                        = 6378137.0 + 8000.0;
// 大气层边界高度，超过这个高度，大气变得非常稀薄，光的散射变得越来越少
const Hr                        = 7.994e3;
// 地球中心世界坐标
const C                         = vec3f(0.0, -R0, 0.0);
// 薄雾散射
const haze                      = 0.01;
// 云层最低高度
const mincloudheight            = 5000.0;
// 云层最高高度
const maxcloudheight            = 8000.0;
// 用于影响云层噪音参数
const cloudnoise                = 0.0002;
// 云层最近显示距离
const cloudnear                 = 1.0;
// 云层最远显示距离
const cloudfar                  = 160e3;
// 相机观察路径上颜色贡献点采样数量
const scatter_steps             = 8;
// 采样点到光源路径上采样数量
const scatter_steps2            = 4;

// 云层密度，0表示晴空
var<private> cloudy             = 0.3;
// cld1 和 cld2 之间的差距越大则云层覆盖范围越广
var<private> cld1               = 0.4;
// cld1 和 cld2 之间的差距越大则云层覆盖范围越广
var<private> cld2               = 0.6;
// 使云层更暗，密度更大
var<private> rainmulti          = 8.0;

// ============================------------------------------------------------

fn round_(x: f32, f: f32) ->f32 {
    return (floor((x) / (f) + 0.5) * (f));
}

fn random(p: f32) ->f32 {
    return fract(52.043 * sin(p * 205.429));
}

fn random2(p: f32) ->f32 {
    return random(p) * 2.0 - 1.0;
}

fn meteor(uv_: vec2f, gtime: f32, delay: f32) ->vec3f {
    var uv = uv_;
    let seed = round_(gtime, delay);

    let startTime = (delay - 1.5) * random(seed);
    let time = max(0.0, min(1.0, gtime - seed - startTime));

    let start = vec2f(
        random2(seed),
        0.7 + 0.3 * random(seed + 0.1)
    );

    var end = start * 0.5;

    uv = uv - mix(start, end, time);

    end = normalize(end - start);
    uv = uv * mat2x2<f32>(end.x, end.y, -end.y, end.x);
    uv.x *= 0.1;

    let alpha = 16.0 * pow(time, 2.0) * pow(time - 1.0, 2.0);
    return vec3f(max(0.0, alpha - iResolution.y * length(uv)));
}

fn meteorstorm(uv: vec2f) ->vec3f {
    return
        meteor(uv, iTime, 9.5837) +
        meteor(uv, iTime + 15.3, 15.459) +
        meteor(uv, iTime + 125.0, 31.2);
}

fn Noise2(x: vec3f) ->f32 {
    let p = floor(x);
    var f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    let uv = (p.xy + vec2f(37.0, 17.0) * p.z) + f.xy;
    let rg1 = sample_iChannel0((uv + 0.5) / 256.0, -100.0).yx;
    return mix(rg1.x, rg1.y, f.z);
}

fn fnoise2(p_: vec3f, t: f32) ->f32 {
    var p = p_ * 0.25;
    var f = 0.0;

    f = 0.5000 * Noise2(p); p = p * 3.02; p.y -= t * 0.02;
    f += 0.2500 * Noise2(p); p = p * 3.03; p.y += t * 0.06;
    f += 0.1250 * Noise2(p); p = p * 3.01;
    f += 0.0625 * Noise2(p); p = p * 3.03;
    f += 0.03125 * Noise2(p); p = p * 3.02;
    f += 0.015625 * Noise2(p);

    return f;
}

fn noisef2(t: f32) ->f32 {
    return sample_iChannel0(vec2f(t, 0.0) / iChannelResolution0.xy, 0.0).x;
}

fn noisev2(t: vec2f) ->f32 {
    return sample_iChannel0(t / iChannelResolution0.xy, 0.0).x;
}

fn shiftHue(col_: vec3f, Shift: f32) ->vec3f {
    var col = col_;
    let P = vec3f(0.55735) * dot(vec3f(0.55735), col);
    let U = col - P;
    let V = cross(vec3f(0.55735), U);    
    col = U * cos(Shift * 6.2832) + V * sin(Shift * 6.2832) + P;
    return col;
}

// ============================------------------------------------------------

fn xaxiscloud() ->f32 {
    // t * 5e2 + t left -t right * speed
    return -100.0 * iTime;
}

fn yaxiscloud() ->f32 {
    // hmmm?
    return iTime * 100.0;
}

fn zaxiscloud() ->f32 {
    // t * 6e2 + t away from horizon -t towards horizon * speed
    return 250.0 * iTime;
}

fn cloud(p: vec3f, t: f32) ->f32 {
    var cld = 0.0;
    cld = fnoise2(p * cloudnoise, t) + cloudy * 0.1;
    cld = smoothstep(cld1 + 0.04, cld2 + 0.04, cld);
    cld *= cld * (5.0 * rainmulti);
    return cld + haze;
}

// 计算指定点的 rayleigh 散射和 mie 散射
// pos: 指定点世界坐标
// Hm1: 颗粒物悬浮层最大高度
// dist: 指定点到相机距离
fn densities(pos: vec3f, Hm1: f32) ->vec2f {
    // 指定点海拔高度
    let h = length(pos - C) - R0;
    // 指数函数，表示随着高度增加，大气中的瑞利散射会按指数级减少
    // 在较低的高度，rayleigh 值比较大，说明瑞利散射比较强烈，这也就是为什么我们在地面看天空会呈现蓝色
    // 使用曲线负半轴，值范围[0, 1]
    let rayleigh = exp(-h / Hr);
    // TODO: 参数点在相机空间Z轴距离
    var d = pos * fov; d.y = 0.0;
    let dist = length(d);

    // 云层是 mie 散射成分之一
    var cld = 0.0;

    // 指定点在云层高度范围内
    if (mincloudheight < h && h < maxcloudheight) {
        cld = cloud(pos + vec3f(xaxiscloud(), yaxiscloud(), zaxiscloud()), iTime) * cloudy;
        cld *= sin(3.1415 * (h - mincloudheight) / mincloudheight) * cloudy;
    }

    // TODO: cld22
    // TODO: highclouds
    // TODO: rain
    // TODO: godray

    // 距离云层越近云层散射越强？
    // dist == cloudnear: factor == 2.0
    // dist == cloudfar: factor == 1.0
    let factor = clamp(1.0 - ((dist - cloudfar) / (cloudfar - cloudnear)), 0.0, 10.0);
    cld *= factor;

    // 指数函数，表示随着高度增加，大气中的米氏散射会按指数级减少
    // Hm1表示颗粒物悬浮层最大高度
    // 云层和薄雾也是米氏散射的成分之一
    let mie = exp(-h / Hm1) + cld + haze;

    return vec2f(rayleigh, mie);
}

// ============================------------------------------------------------

// 计算从一个点出发的射线到大气层边缘的最远距离
fn escape(p: vec3f, d: vec3f) ->f32 {
    let v = p - C;
    let b = dot(v, d);
    let c = dot(v, v) - Ra * Ra;
    let det2 = b * b - c;
    if (det2 < 0.0) {
        return -1.0;
    }
    let det = sqrt(det2);
    let t1 = -b - det;
    let t2 = -b + det;
    return select(t2, t1, t1 >= 0.0);
}

// ============================------------------------------------------------

fn DrawCircle(uv: vec2f, radius: f32, fade: f32) ->vec3f {
    // Determine the length of the point away from the "center" of the circle.
    let uvLength = length(uv);
    // Apply color to any coordinate that lies within the circle.
    // Black if coord is outside and white if it is inside the circle.
    // The smoothstep function applies the fade to the circle.
    // The min value is the radius, and max value is the radius minus
    // the "fade" variable.
    // This means the fade is applied within the bounds of the circle.
    let circle = vec3f(smoothstep(radius, radius - fade, uvLength));
    
    return vec3f(circle);
}

// 计算背景颜色
// 通过 dot 点乘操作计算背景颜色的渐变，并使用 mix 混合两种颜色生成最终的背景色
fn bg(rd: vec3f) ->vec3f {
    var sd = dot(normalize(vec3f(-0.5, -0.6, 0.9)), rd) * 0.5 + 0.5;
    sd = pow(sd, 5.0);
    let col = mix(vec3f(0.05, 0.01, 0.15), vec3f(0.01, 0.05, 0.15), sd);
    return col * 0.63;
}

// 太阳光芒模拟
fn lensFlare(uv: vec2f, pos: vec2f) ->vec3f {
    let main = uv - pos;
    let uvd = uv * (length(uv));

    let ang = atan(main.x / main.y); // TODO: atan(main.x, main.y);
    var dist = length(main); dist = pow(dist, 0.1);
    let n = noisev2(vec2f(ang * 16.0, dist * 32.0));

    var f0 = 1.0 / (length(uv - pos) * 16.0 + 6.0);
    f0 = f0 * (sin(noisef2(sin(ang * 2.0 + pos.x - (sin(iTime * 0.05)) * 2.0) * 4.0 - cos(ang * 4.0 + pos.y + cos(iTime * 0.15))) * 16.0) * 0.1 + dist * 0.1 + 0.8) * 2.2;

    let f1 = max(0.01 - pow(length(uv + 1.2 * pos), 1.9), 0.0) * 7.0;
    var f2 = 0.0; var f22 =0.0; var f23 = 0.0;
    var f4 = 0.0; var f42 =0.0; var f43 = 0.0;
    var f5 = 0.0; var f52 =0.0; var f53 = 0.0;
    var f6 = 0.0; var f62 =0.0; var f63 = 0.0;
    
    f2 = max(1.0 / (1.0 + 32.0 * pow(length(uv - 0.05 - pos), 1.5)), 0.0) * 00.25;
    f22 = max(1.0 / (1.0 + 32.0 * pow(length(uv + 0.0 - pos), 1.5)), 0.0) * 00.23;
    f23 = max(1.0 / (1.0 + 32. * pow(length(uv + 0.05 - pos), 1.5)), 0.0) * 00.25;

    var uvx = mix(uv, uvd, -0.5);

    f4 = max(0.01 - pow(length(uv + 0.0 - pos), 1.4), 0.0) * 6.0;
    f42 = max(0.01 - pow(length(uv + 0.0 - pos), 1.4), 0.0) * 5.0;
    f43 = max(0.01 - pow(length(uv + 0.0 - pos), 1.4), 0.0) * 3.0;

    uvx = mix(uv, uvd, -0.4);

    f5 = max(0.01 - pow(length(uv + 0.0 - pos), 2.5), 0.0) * 2.0;
    f52 = max(0.01 - pow(length(uv + 0.0 - pos), 2.5), 0.0) * 2.0;
    f53 = max(0.01 - pow(length(uv + 0.0 - pos), 2.5), 0.0) * 2.0;


    uvx = mix(uv, uvd, -0.5);

    f6 = max(0.01 - pow(length(uv + 0.0 - pos), 1.6), 0.0) * 6.0;
    f62 = max(0.01 - pow(length(uv + 0.0 - pos), 1.6), 0.0) * 3.0;
    f63 = max(0.01 - pow(length(uv + 0.0 - pos), 1.6), 0.0) * 5.0;

    var c = vec3(0.0);

    c.r += f2 + f4 + f5 + f6; 
    c.g += f22 + f42 + f52 + f62; 
    c.b += f23 + f43 + f53 + f63;

    c = c * 1.3 - vec3f(length(uvd) * 0.05);
    c += vec3f(f0);

    return c;
}

// TODO: 天空模拟
fn emulation_sky(camera_position: vec3f, camera_vector_: vec3f, light_dir: vec3f, moon_light_dir: vec3f, aur_pos: vec3f, BR1: vec3f, bM1: vec3f, MI: f32, RI: f32, Hm1: f32, g1: f32, ground: bool) ->vec3f {
    let camera_vector = vec3f(camera_vector_.x, select(camera_vector_.y, -camera_vector_.y, ground), camera_vector_.z);

    // ============================------------------------------------------------

    let SI = 10.0;
    let Rm = 120.0;

    let mu = dot(camera_vector, light_dir);
    let opmu2 = 1.0 + mu * mu;
    let g = g1 / fov;
    let g2 = g * g;
    let s = 0.999;
    let s2 = s * s;

    let phaseR = 0.0596831 * opmu2;
    let phaseM = 0.1193662 * (1.0 - g2) * opmu2 / ((2.0 + g2) * pow(1.0 + g2 - 2.0 * g * mu, 1.5));
    let phaseS = 0.1193662 * (1.0 - s2) * opmu2 / ((2.0 + s2) * pow(1.0 + s2 - 2.0 * s * mu, 1.5));

    // ============================------------------------------------------------

    var raleigh = vec3f(0.0);
    var themie = vec3f(0.0);
    var thesun = vec3f(0.0);
    var themoon = vec3f(0.0);
    var auro = vec3f(0.0);
    var scat = 0.0;

    var depthR = 0.0;
    var depthM = 0.0;

    var R = vec3f(0.0);
    var M = vec3f(0.0);

    var R2 = vec3f(0.0);
    var M2 = vec3f(0.0);

    {
        var light_dir2 = normalize(normalize(vec3f(light_dir.x, 0.0, light_dir.z)) - normalize(vec3f(frameUniforms.camera_wPos.x, 0.0, frameUniforms.camera_wPos.z)));

        light_dir2.y = 0.16;
        light_dir2 = normalize(light_dir2);

        let L = escape(camera_position, camera_vector);
        let step_size_i = L / f32(scatter_steps);

        for (var i = 0; i < scatter_steps; i++) {
            let l = f32(i) * step_size_i;
            let p = (camera_position + camera_vector * l);
            var dRdM = densities(p, Hm1);

            dRdM.x *= step_size_i;
            dRdM.y *= step_size_i;
            depthR += dRdM.x;
            depthM += dRdM.y;

            let Ls = escape(p, light_dir);
            if (Ls > 0.0) {
                var depthRs = 0.0;
                var depthMs = 0.0;
                let step_size_l = Ls / f32(scatter_steps2);

                for (var j = 0; j < scatter_steps2; j++) {
                    let ls = f32(j) * step_size_l;
                    let ps = (p + light_dir * ls);
                    let dRdMs = densities(ps, Hm1);

                    depthRs += dRdMs.x * step_size_l;
                    depthMs += dRdMs.y * step_size_l;
                }
                
                let A = exp(-(BR1 * (depthRs + depthR) + bM1 * (depthMs + depthM)));
                R += A * dRdM.x;
                M += A * dRdM.y;
            }

            let Ls2 = escape(p, light_dir2);
            if (true && Ls2 > 0.0) {
                var depthRs = 0.0;
                var depthMs = 0.0;
                let step_size_l = Ls2 / f32(scatter_steps2);

                for (var j = 0; j < scatter_steps2; j++) {
                    let ls = f32(j) * step_size_l;
                    let ps = (p + light_dir2 * ls);
                    let dRdMs = densities(ps, Hm1);

                    depthRs += dRdMs.x * step_size_l;
                    depthMs += dRdMs.y * step_size_l;
                }

                var A = exp(-(BR1 * (depthRs + depthR) + bM1 * (depthMs + depthM)));
                R2 += A * dRdM.x;
                M2 += A * dRdM.y;
            }
        }

        themie = (MI) * (select(M, M2, true) * bM1  * (phaseM));
        raleigh = (RI) * (max(R, vec3f(Rm)) * BR1 * phaseR);

        thesun = (SI) * (M * bM1  * phaseS);

        let scatfactor = ((abs(camera_vector.y) / 0.5) * 0.00003) + 0.00001;

        scat = 1.0 - clamp(depthM * scatfactor, 0.0, 0.99);
    }

    // return vec3(raleigh * 50.0);     // OK
    // return vec3(themie);             // OK
    // return vec3(thesun);             // OK
    // return vec3(themoon);            // ERR
    // return vec3(auro);               // ERR
    // return vec3(scat);               // OK
    // return vec3(depthM * 0.00001);   // OK
    // ============================------------------------------------------------

    let vfwMat = frameUniforms.vfgMat * frameUniforms.gfwMat;
    let vsLit = mulMat3x3Float3(vfwMat, light_dir);
    let vsView = mulMat3x3Float3(vfwMat, camera_vector);

    let ralatt = 1.0;
    let mieatt = 1.0;
    let refatt = select(1.0, pow((1.0 - camera_vector.y), 5.0), ground);
    let sunatt = 1.0;
    let moonatt = 1.0;
    let staratt = 1.1;
    let scatatt = 1.0;
    let rain13 = 0.25;
    let RE = rain13;
    let MI2 = 1.0;
    let rgam = clamp(((2.2 - 1.0) * (light_dir.y / 0.5)) + 1.0, 1.0, 2.2);
    let gam = 1.6;
    let att_moon = 1.0;
    let moonillumination = 1.0;


    var color = vec3(0.0);
    var star = vec3f(0.0);
    var lensf = vec3f(0.0);
    var fire = vec3f(0.0);
    var sun2 = vec3f(0.0);
    var aur = vec4f(0.0);
    var fireworkCol = vec3f(0.0);

    let fade = smoothstep(0.0, 0.01, abs(camera_vector.y)) * 0.1 + 0.9;
    let bg1 = bg(camera_vector) * fade;

    let layer1 = vec4f(0.0, 0.0, 0.0, 1.0);
    let layer2 = DrawCircle(vsLit.xy, 0.05, 0.01);
    var moon_texture = layer2 * sample_iChannel1(vsLit.xy, 0.0).rgb;

    moon_texture = pow(moon_texture, vec3f(2.2));
    moon_texture *= att_moon;

    let back_texture = pow(sample_iChannel2(vec2f(0.0), 0.0).xyz, vec3f(2.2)) * 0.8; // TODO

    // ============================------------------------------------------------

    let seed = round_(iTime, 1.0);
    let metx = random(seed);

    var met = meteorstorm(vec2f(camera_vector.x - metx, camera_vector.y + 0.5));

    themie *= refatt;
    raleigh *= refatt;

    // ============================------------------------------------------------

    color += back_texture.rgb * scat * scatatt;

    themoon *= moonatt;
    thesun *= sunatt;

    star *= staratt * refatt * scat;
    met *= staratt * refatt * scat;
    fire *= staratt * refatt * scat;

    // ============================------------------------------------------------

    var mcolor = ((vec3f(scat))) * themie;

    // 月亮位置和太阳位置重叠时的日食效果
    if (false) {
        let diffEIp = 0.0; // TODO
        let newsun = clamp(thesun, vec3f(0.0), vec3f(1.0));
        let newsun2 = clamp(sun2, vec3f(0.0), vec3f(1.0));
        color += (themoon * moonillumination * scat) * (1.0 - diffEIp);
        color += moon_texture.rgb * scat * (1.0 - diffEIp);
        let moon2 = clamp(moon_texture.rgb * 1000.0, vec3f(0.0), vec3f(1.0));
        color += clamp(newsun - (moon2), vec3f(0.0), vec3f(1.0)) * refatt * (scat);
        color += clamp(newsun2 - (moon2), vec3f(0.0), vec3f(1.0)) * refatt * (scat);
    }
    else{
        mcolor *= moon_texture.rgb * 30.0;
        color += mix(mcolor, color, 0.9);
        color += sun2 * (scat);
        color += thesun * (scat);
        color += (themoon * moonillumination * scat);
        color += moon_texture.rgb * scat;
    }

    // ============================------------------------------------------------

    // color += clamp(auro * (aur.rgb * 2.0 * themie) * scatatt * refatt, vec3f(0.0), vec3f(1.0));

    // ============================------------------------------------------------

    raleigh = mix(raleigh * refatt, raleigh * refatt * scat, RE);

    color += pow(raleigh * ralatt, vec3f(rgam));
    color += pow(themie, vec3f(gam));

    // ============================------------------------------------------------

    color += pow(star, vec3f(2.2));
    color += pow(met, vec3f(2.2));

    var firescatter = ((vec3f(1.0 - scat))) * themie;
    firescatter *= (fireworkCol * MI2);
    // color += mix(firescatter, color, 0.5) * scatatt;
    // color += fire;

    var aur_col = bg1 * (1.0 - aur.a) + (aur.rgb * 2.0) * (scat);
    aur_col = pow(aur_col, vec3f(2.2));
    aur_col *= scatatt * refatt;
    // color += aur_col;

    // ============================------------------------------------------------

    // ENABLE_LENS_FLARE
    if (vsLit.z < 0.0) {
        lensf = vec3f(1.4, 1.2, 1.0) * lensFlare(vsView.xy * 0.5, vsLit.xy * 0.5);
        lensf = clamp(lensf * scat * 1.0, vec3f(0.0), vec3f(1.0));
        lensf = pow(lensf, vec3f(1.4));
        color += lensf * ralatt;
    }

    // ============================------------------------------------------------

    color = pow(color, vec3f(1.0 / 2.2));

    // ============================------------------------------------------------

    const sat = 1.1;
    const vib = 0.0;
    const hue = 0.0;

    let weights_ = vec3f(0.2125, 0.7154, 0.0721);
    let luminance_ = dot(color, weights_);

    color = mix(vec3f(luminance_), color, sat);

    let average = (color.r + color.g + color.b) / 3.0;
    let mx = max(color.r, max(color.g, color.b));
    let vibrance = (mx - average) * vib;
    color = clamp(color - (mx - color) * vibrance, vec3f(0.0), vec3f(1.0));

    color = shiftHue(color, hue);

    return vec3f(color);
}

// ============================------------------------------------------------

fn atmosphere_proc(wpos: vec3f, ground: bool) ->vec4f {
    iTime = frameUniforms.time;

    // 大气层表面世界空间坐标（由于使用正面裁剪，所以看到的始终是离相机最远的那个点，如果相机在大气层外，则绝大部分将被地球遮挡而不渲染）
    let atmospheric_pos_position = wpos;
    // 相机世界空间坐标
    let camera_position = frameUniforms.camera_wPos.xyz;
    // 相机世界空间观察向量（从相机到大气层表面点）
    let camera_vector = normalize(atmospheric_pos_position - camera_position);
    // 太阳世界空间光照方向（指向太阳的方向）
    let light_dir = normalize(frameUniforms.sunlitDirection.xyz);
    // 月亮世界空间光照方向（指向月亮的方向）
    let moon_light_dir = normalize(vec3f(0.0, 0.0, -1.0));
    // 极光位置
    let aur_pos = vec3f(0.0);

    // 表示 Rayleigh 散射的吸收系数，通常是与光波长相关的常量。它用于计算光在大气中散射时的强度衰减。
    // 通常较短波长的蓝光会比长波长的红光更容易被散射，这也是天空呈现蓝色的原因之一。
    var BR1 = vec3f(0.0000059, 0.0000121, 0.0000182);
    // 表示 Mie 散射的吸收系数，但用于描述 Mie 散射的特性。
    var bM1 = 0.000021;
    // 表示与月光相关的强度系数。这个参数用于计算月光对散射效果的影响。
    var MI1 = 8.0;
    // 表示与 Rayleigh 散射相关的强度系数。它用于影响 Rayleigh 散射的计算，决定了光的散射强度。
    var RI1 = 20.0;
    // 高度相关的参数，通常与散射和吸收的高度分布有关。它可能用来调整光的散射在不同高度上的特性。
    var Hm1 = 1.2e3;
    // 表示与光线的相位函数相关的参数，通常用于描述光在散射过程中的方向性。这个参数影响散射光的分布，尤其是在不均匀介质中。
    var g1 = 0.76;

    // TODO: 增强晚霞的红色
    BR1.x = clamp(((BR1.x - 0.0000025) * (light_dir.y / 0.3)) + 0.0000025, 0.0000025, BR1.x);

    let rgb = emulation_sky(camera_position, camera_vector, light_dir, moon_light_dir, aur_pos, BR1, vec3f(bM1), MI1, RI1, Hm1, g1, ground); 
    let color = encodeRGBM(sRGBToLinear_vec3(rgb), uRGBMRange);

    return color;
}
