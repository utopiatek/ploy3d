
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
    if (angle < 0.0){
        angle += 2.0 * PI; 
    }
    let factor_a = select(0.0, 1.0, (angle > angles.x) && (angle < angles.y));

    let factor = 1.0 - floor(min(length(dir) / radius, 1.0));
    let color = sample_style(style) * factor * factor_a;

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
    if (angle < 0.0){
        angle += 2.0 * PI; 
    }
    let factor_a = select(0.0, 1.0, (angle > angles.x) && (angle < angles.y));

    let bias = abs(length(length(dir) - radius));
    let factor = 1.0 - floor(min(bias / half_line_w, 1.0));
    let color = sample_style(style) * factor * factor_a;
    
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

    let factor = max(sign(extent - abs(vec2f(x, y) - center)), vec2f(0.0));
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

    let factor_outer = max(sign(extent + vec2f(half_line_w) - abs(vec2f(x, y) - center)), vec2f(0.0));
    let factor_inner = max(sign(extent - vec2f(half_line_w) - abs(vec2f(x, y) - center)), vec2f(0.0));
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
    let in_rect = max(sign(dis_to_outer), vec2(0.0));
    let dis_to_inner = vec2f(radius) - dis_to_outer;
    let in_corner = max(sign(dis_to_inner), vec2(0.0));
    let in_corner_corner = 1.0 - max(sign(radius - length(dis_to_inner)), 0.0);
    let out_in_corner_corner = 1.0 - (in_rect.x * in_rect.y) * (in_corner.x * in_corner.y) * (in_corner_corner);
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
        let factor_inner = 0.0;
        let dis_to_outer = extent + vec2f(half_line_w) - abs(vec2f(x, y) - center);
        let in_rect = max(sign(dis_to_outer), vec2(0.0));
        let dis_to_inner = vec2f(radius_) - dis_to_outer;
        let in_corner = max(sign(dis_to_inner), vec2(0.0));
        let in_corner_corner = 1.0 - max(sign(radius_ - length(dis_to_inner)), 0.0);
        let out_in_corner_corner = 1.0 - (in_rect.x * in_rect.y) * (in_corner.x * in_corner.y) * (in_corner_corner);
        let in_rect_round = in_rect.x * in_rect.y * out_in_corner_corner;

        factor_a = in_rect_round;
    }

    var factor_b = 0.0;
    {
        let radius_ = max(radius - half_line_w, 1.0);
        let factor_inner = 0.0;
        let dis_to_outer = extent - vec2f(half_line_w) - abs(vec2f(x, y) - center);
        let in_rect = max(sign(dis_to_outer), vec2(0.0));
        let dis_to_inner = vec2f(radius_) - dis_to_outer;
        let in_corner = max(sign(dis_to_inner), vec2(0.0));
        let in_corner_corner = 1.0 - max(sign(radius_ - length(dis_to_inner)), 0.0);
        let out_in_corner_corner = 1.0 - (in_rect.x * in_rect.y) * (in_corner.x * in_corner.y) * (in_corner_corner);
        let in_rect_round = in_rect.x * in_rect.y * out_in_corner_corner;

        factor_b = in_rect_round;
    }

    let factor = factor_a * (1.0 - factor_b);

    let color = sample_style(style) * factor;

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

    return color;
}

var<private> material_alpha: f32 = 0.0;
var<private> material_baseColor: vec3f = vec3f(0.0);

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

                let rgb = (color.rgb * color.a) + (colors.rgb * (1.0 - color.a));
                let a = 1.0;

                colors = vec4f(rgb, a);
            }
        }

        material_baseColor = colors.rgb;
        material_alpha = colors.a;
    }
}
