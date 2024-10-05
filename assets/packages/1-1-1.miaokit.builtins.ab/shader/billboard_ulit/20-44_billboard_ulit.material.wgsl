
struct UIInstanceUniforms {
    data : array<vec4<u32>, 1024>,
};

struct UIStyleUniforms {
    data : array<vec4<u32>, 1024>,
};

struct UITransformUniforms {
    data : array<vec4<f32>, 1024>,
};

struct UIPathUniforms {
    data : array<vec4<u32>, 1024>,
};

@group(3) @binding(0) var<uniform> ui_instances : UIInstanceUniforms;
@group(3) @binding(1) var<uniform> ui_styles : UIStyleUniforms;
@group(3) @binding(2) var<uniform> ui_transforms : UITransformUniforms;
@group(3) @binding(3) var<uniform> ui_paths : UIPathUniforms;

fn sample_style(index: u32) ->vec4f {
    let style_a = ui_styles.data[index * 2];
    let style_type = style_a.x & 0xFF;

    var color = vec4f(1.0, 0.0, 1.0, 1.0);

    if (style_type == 0) {
        color = unpack4x8unorm(style_a.y).zyxw;
    }
    else {
        // ...
    }

    return color;
}

fn fill_arc(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32) ->vec4f {
    let path = ui_paths.data[geometry_beg];
    let path_type = path.x & 0xF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;

    let center = unpack2x16unorm(path.y) * 65535.0;
    let angles = unpack2x16unorm(path.z) * 2.0 * PI;
    let radius = f32(path.w & 0xFFFF);

    let dir = vec2f(x, y) - center;
    var angle = atan2(dir.y, dir.x);

    angle = select(angle, angle + 2.0 * PI, angle < 0.0);

    let factor_a = step(angles.x, angle) * step(angle, angles.y);
    let factor_b = smoothstep(0.0, 1.0, radius - length(dir));

    let color = sample_style(style) * factor_b * factor_a;

    return color;
}

fn stroke_arc(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32, line_width: u32) ->vec4f {
    let path = ui_paths.data[geometry_beg];
    let path_type = path.x & 0xF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;
    let half_line_w = 0.5 * f32(line_width);

    let center = unpack2x16unorm(path.y) * 65535.0;
    let angles = unpack2x16unorm(path.z) * 2.0 * PI;
    let radius = f32(path.w & 0xFFFF);

    let dir = vec2f(x, y) - center;
    var angle = atan2(dir.y, dir.x);

    angle = select(angle, angle + 2.0 * PI, angle < 0.0);

    let factor_a = step(angles.x, angle) * step(angle, angles.y);
    let factor_b = smoothstep(0.0, 1.0, half_line_w - abs(radius - length(dir)));

    let color = sample_style(style) * factor_b * factor_a;

    return color;
}

fn fill_rect(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32) ->vec4f {
    let path = ui_paths.data[geometry_beg];
    let path_type = path.x & 0xF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;

    let center = unpack2x16unorm(path.y) * 65535.0;
    let extent = unpack2x16unorm(path.z) * 65535.0;
    let dis_to_edge = extent - abs(vec2f(x, y) - center);
    let factor = smoothstep(vec2f(0.0), vec2f(1.0), dis_to_edge);
    let color = sample_style(style) * factor.x * factor.y;

    return color;
} 

fn stroke_rect(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32, line_width: u32) ->vec4f {
    let path = ui_paths.data[geometry_beg];
    let path_type = path.x & 0xF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;
    let half_line_w = 0.5 * f32(line_width);

    let center = unpack2x16unorm(path.y) * 65535.0;
    let extent = unpack2x16unorm(path.z) * 65535.0;

    let dis_to_outer = extent + vec2f(half_line_w) - abs(vec2f(x, y) - center);
    let factor_outer = smoothstep(vec2f(0.0), vec2f(1.0), dis_to_outer);

    let dis_to_inner = extent - vec2f(half_line_w) - abs(vec2f(x, y) - center);
    let factor_inner = smoothstep(vec2f(0.0), vec2f(1.0), dis_to_inner);

    let factor = (factor_outer.x * factor_outer.y) * (1.0 - factor_inner.x * factor_inner.y);
    let color = sample_style(style) * factor;

    return color;
}

fn fill_rect_round(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32) ->vec4f {
    let path = ui_paths.data[geometry_beg];
    let path_type = path.x & 0xF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;

    let center = unpack2x16unorm(path.y) * 65535.0;
    let extent = unpack2x16unorm(path.z) * 65535.0;
    let radius = 15.0;

    let dis_to_outer = extent - abs(vec2f(x, y) - center);
    let in_rect = smoothstep(vec2f(0.0), vec2f(1.0), dis_to_outer);
    let dis_to_inner = vec2f(radius) - dis_to_outer;
    let in_corner = step(vec2(0.0), dis_to_inner);
    let in_corner_corner = 1.0 - smoothstep(-1.0, 0.0, radius - length(dis_to_inner));
    let out_in_corner_corner = 1.0 - ceil(in_rect.x * in_rect.y) * (in_corner.x * in_corner.y) * (in_corner_corner);
    let in_rect_round = in_rect.x * in_rect.y * out_in_corner_corner;

    let color = sample_style(style) * in_rect_round;

    return color;
} 

fn stroke_rect_round(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32, line_width: u32) ->vec4f {
    let path = ui_paths.data[geometry_beg];
    let path_type = path.x & 0xF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;
    let half_line_w = 0.5 * f32(line_width);

    let center = unpack2x16unorm(path.y) * 65535.0;
    let extent = unpack2x16unorm(path.z) * 65535.0;
    let radius = 15.0;

    var factor_a = 0.0;
    {
        let radius_ = radius + half_line_w;

        let dis_to_outer = extent + vec2f(half_line_w) - abs(vec2f(x, y) - center);
        let in_rect = smoothstep(vec2f(0.0), vec2f(1.0), dis_to_outer);
        let dis_to_inner = vec2f(radius_) - dis_to_outer;
        let in_corner = step(vec2(0.0), dis_to_inner);
        let in_corner_corner = 1.0 - smoothstep(-1.0, 0.0, radius_ - length(dis_to_inner));
        let out_in_corner_corner = 1.0 - ceil(in_rect.x * in_rect.y) * (in_corner.x * in_corner.y) * (in_corner_corner);
        let in_rect_round = in_rect.x * in_rect.y * out_in_corner_corner;

        factor_a = in_rect_round;
    }

    var factor_b = 0.0;
    {
        let radius_ = max(radius - half_line_w, 1.0);

        let dis_to_outer = extent - vec2f(half_line_w) - abs(vec2f(x, y) - center);
        let in_rect = smoothstep(vec2f(0.0), vec2f(1.0), dis_to_outer);
        let dis_to_inner = vec2f(radius_) - dis_to_outer;
        let in_corner = step(vec2(0.0), dis_to_inner);
        let in_corner_corner = 1.0 - smoothstep(-1.0, 0.0, radius_ - length(dis_to_inner));
        let out_in_corner_corner = 1.0 - ceil(in_rect.x * in_rect.y) * (in_corner.x * in_corner.y) * (in_corner_corner);
        let in_rect_round = in_rect.x * in_rect.y * out_in_corner_corner;

        factor_b = in_rect_round;
    }

    let factor = factor_a * (1.0 - factor_b);

    let color = sample_style(style) * factor;

    return color;
}

fn fill_text(uv: vec2<f32>, geometry_beg: u32, geometry_end: u32, transform_idx: u32, style: u32) -> vec4f {
    let path_a = ui_paths.data[geometry_beg + 0];
    let path_type = path_a.x & 0xF;
    let char_count = (path_a.x >> 4) & 0xFFF;
    let atlas_layer = (path_a.x >> 16) & 0xFF;

    let transform_a = ui_transforms.data[transform_idx * 2];
    let transform_b = ui_transforms.data[transform_idx * 2 + 1];

    let canvas_wh = transform_b.zw;
    let point = uv * canvas_wh;

    let bb_center = unpack2x16unorm(path_a.y) * 65535.0;
    let bb_extent = unpack2x16unorm(path_a.z) * 65535.0;

    let dis_to_edge = bb_extent - abs(vec2f(point.x, point.y) - bb_center);

    // ===========================------------------------------

    var glyph_uv = vec2f(0.0);
    var inside = 0.0;

    if (dis_to_edge.x > 0.0 && dis_to_edge.y > 0.0) {
        let path_b = ui_paths.data[geometry_beg + 1];

        let atlas_xy = vec2f(f32(path_b.x & 0xFFFF), f32((path_b.x >> 16) & 0xFFFF));
        let atlas_wh = vec2f(f32(path_b.y & 0xFFFF), f32((path_b.y >> 16) & 0xFFFF));

        for (var c = 0u; c < char_count; c++) {
            let char_path = ui_paths.data[geometry_beg + c + 2];

            let x = f32(char_path.x & 0xFFFF);
            let y = f32((char_path.x >> 16) & 0xFFFF);
            let one_div_wh = unpack2x16unorm(char_path.y);

            let ratio_ = (point - vec2f(x, y)) * one_div_wh;
            let inside_ = (step(0.0, ratio_.x) * step(ratio_.x, 1.0)) * (step(0.0, ratio_.y) * step(ratio_.y, 1.0));

            if (inside_ > 0.5) {
                inside = inside_;

                let glyph_xy = unpack2x16unorm(char_path.z) * atlas_wh;
                let glyph_wh = unpack2x16unorm(char_path.w) * atlas_wh;

                glyph_uv = (atlas_xy + glyph_xy + glyph_wh * ratio_) * 0.00024414;

                break;
            }
        }
    }

    // ===========================------------------------------

    var screen_px_range = (72.0 / 32.0) * 2.0;
    {
        let unit_range = vec2f(2.0) / vec2f(4096.0);
        let screen_tex_size = vec2f(1.0) / fwidth(glyph_uv);

        screen_px_range = 0.5 * dot(unit_range, screen_tex_size);
        screen_px_range *= 0.5; // 非标准做法，适当的柔和边缘
        screen_px_range = max(screen_px_range, 1.0);
    }
    
    let bg_color = vec4f(0.0f, 0.0f, 0.0f, 0.0f);
    let fg_color = vec4f(1.0f, 1.0f, 1.0f, 1.0f);
    
    let msdf = textureSample(atlas2D, splln1, glyph_uv, atlas_layer);
    let sd = max(min(msdf.r, msdf.g), min(max(msdf.r, msdf.g), msdf.b));
    let screen_px_distance = screen_px_range * (sd - 0.5);
    let opacity = clamp(screen_px_distance + 0.5, 0.0, 1.0);
    let color = mix(bg_color, fg_color, opacity) * inside;

    return color;
}

fn draw_instance(index: u32) ->vec4f {
    let instance = ui_instances.data[index];
    let instance_x = instance.x;
    let instance_y = instance.y;

    let geometry_beg = (instance_x >> 0) & 0x3FF;
    let geometry_end = (instance_x >> 10) & 0x3FF;
    let transform_idx = (instance_x >> 20) & 0x3FF;
    let draw_mode =  (instance_x >> 30) & 0x3;

    let fill_style = (instance_y >> 0) & 0x3FF;
    let stroke_tyle = (instance_y >> 10) & 0x3FF;
    let line_width = (instance_y >> 20) & 0xFF;
    let geometry_type =  (instance_y >> 28) & 0xF;

    let uv = vec2f(inputs_uv.x, 1.0 - inputs_uv.y);
    var color = vec4f(0.0);

    if (draw_mode == 1) {
        switch (geometry_type) {
            case 1: {
                color = fill_rect(inputs_uv.xy, geometry_beg, geometry_end, transform_idx, fill_style);
            }
            case 2: {
                color = fill_arc(inputs_uv.xy, geometry_beg, geometry_end, transform_idx, fill_style);
            }
            case 3: {
                color = fill_rect_round(inputs_uv.xy, geometry_beg, geometry_end, transform_idx, fill_style);
            }
            case 4: {
                color = fill_text(uv, geometry_beg, geometry_end, transform_idx, fill_style);
            }
            default: {
                // ...
            }
        }
    }
    else {
        switch (geometry_type) {
            case 1: {
                color = stroke_rect(inputs_uv.xy, geometry_beg, geometry_end, transform_idx, stroke_tyle, line_width);
            }
            case 2: {
                color = stroke_arc(inputs_uv.xy, geometry_beg, geometry_end, transform_idx, stroke_tyle, line_width);
            }
            case 3: {
                color = stroke_rect_round(inputs_uv.xy, geometry_beg, geometry_end, transform_idx, stroke_tyle, line_width);
            }
            default: {
                // ...
            }
        }
    }

    // 各返回值应预乘了不透明度
    return color;
}

fn material_fs() {
    if (inputs_uv.x > 1.0 || inputs_uv.y > 1.0) {
        discard;
    }

    let pixel_mask: u32 = 0xFFFFFFFF;
    let batch_mask = ui_instances.data[0].x;

    if ((pixel_mask & batch_mask) > 0u) {
        let instance_count = ui_instances.data[0].y;
        var colors = vec4f(0.0, 0.0, 0.0, 0.0);

        for (var i = 1u; i < instance_count && i < 1024; i++) {
            let instance_mask = ui_instances.data[i].w;

            if ((pixel_mask & instance_mask) > 0u) {
                let color = draw_instance(i);
                let rgb = (color.rgb) + (colors.rgb * (1.0 - color.a));
                let a = color.a + (colors.a * (1.0 - color.a));

                colors = vec4f(rgb, a);
            }
        }

        material_emissive = colors.rgb;
        material_alpha = colors.a;
    }

    let points: array<vec2f, 7> = array<vec2f, 7>(
        vec2f(400.0, 200.0),
        vec2f(600.0, 200.0),
        vec2f(600.0, 100.0),
        vec2f(800.0, 100.0),
        vec2f(700.0, 300.0),
        vec2f(800.0, 400.0),
        vec2f(400.0, 400.0),
    );

    let x = inputs_uv.x * 1024.0;
    let y = 512.0 - inputs_uv.y * 512.0;
    let line_width = 5.0;

    var minDis = line_width * 2.0;

    var inside = false;
    var last_point = points[6];

    for (var i = 0; i < 7; i++) {
        let cur_point = points[i];

        let t = (y - last_point.y) / (cur_point.y - last_point.y);
        let x_on_line = last_point.x + t * (cur_point.x - last_point.x);
        let b = ((last_point.y > y) != (cur_point.y > y)) && (x < x_on_line);

        inside = select(inside, !inside, b);

        // ==================---------------------------

        let pa = vec2f(x, y) - last_point;
        let ba = cur_point - last_point;

        let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        let dis = length(pa - ba * h);

        minDis = min(minDis, dis);

        // ==================---------------------------

        last_point = cur_point;
    }

    // 如果最小距离小于描边宽度，则为描边颜色，否则为填充颜色
    inside = minDis < line_width;

    if (inside) {
        let f = smoothstep(0, 2, line_width - minDis);
        material_emissive = vec3(1.0, 1.0, 0.0) * f;
    }

    let linZ = ((inputs_depth / frameUniforms.vsmExponent) + 1.0) * 0.5;
    let depth_scatter_alpha = earlyProc(linZ, 0.0, material_alpha, 1.0, 0.0, 0.0, 1.0, true);

    if (SHADING_SKIP) {
        return;
    }
}
