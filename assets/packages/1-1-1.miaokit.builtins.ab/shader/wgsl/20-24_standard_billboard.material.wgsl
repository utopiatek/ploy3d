
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

fn draw_rect(instance: vec4<u32>, uv: vec2<f32>) -> i32 {
    let path_type_a = instance.x & 0xFFFF;
    let transform_index = instance.x >> 16;

    let path_index_beg = instance.y & 0xFFFF;
    let path_index_end = instance.y >> 16;

    let fill_style_index = instance.z & 0xFFFF;
    let stroke_style_index = instance.z >> 16;

    let line_half_width = f32(instance.w & 0xFF) * 0.5;

    // ===================------------------

    let path = ui_paths.data[path_index_beg];
    let path_type_b = path.x & 0xFF;
    let path_draw_mode = (path.x >> 8) & 0xFF;
    let path_point_count = path.x >> 16;

    if (path_type_a != path_type_b || path_point_count != 0) {
        return 0;
    }

    // ===================------------------

    let transform_a = ui_transforms.data[transform_index];
    let transform_b = ui_transforms.data[transform_index + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;

    let center = unpack2x16unorm(path.y) * 65535.0;
    let extent = unpack2x16unorm(path.z) * 65535.0;

    let wh_diff = abs(vec2f(x, y) - center) - extent;

    var mode = 0;

    if (wh_diff.x < line_half_width && wh_diff.y < line_half_width) {
        if ((path_draw_mode & 1) == 1 && wh_diff.x < 0.0 && wh_diff.y < 0.0) {
            mode += 1;
        }

        if ((path_draw_mode & 2) == 2 && (wh_diff.x > -line_half_width || wh_diff.y > -line_half_width)) {
            mode += 2;
        }
    }

    return mode;
}

fn draw_arc(instance: vec4<u32>, uv: vec2<f32>) -> i32 {
    let path_type_a = instance.x & 0xFFFF;
    let transform_index = instance.x >> 16;

    let path_index_beg = instance.y & 0xFFFF;
    let path_index_end = instance.y >> 16;

    let fill_style_index = instance.z & 0xFFFF;
    let stroke_style_index = instance.z >> 16;

    let line_half_width = f32(instance.w & 0xFF) * 0.5;

    // ===================------------------

    let path = ui_paths.data[path_index_beg];
    let path_type_b = path.x & 0xFF;
    let path_draw_mode = (path.x >> 8) & 0xFF;
    let path_point_count = path.x >> 16;

    if (path_type_a != path_type_b || path_point_count != 0) {
        return 0;
    }

    // ===================------------------

    let transform_a = ui_transforms.data[transform_index];
    let transform_b = ui_transforms.data[transform_index + 1];

    let w = transform_b.z;
    let h = transform_b.w;
    let x = uv.x * w;
    let y = h - uv.y * h;

    let center = unpack2x16unorm(path.y) * 65535.0;
    let angles = unpack2x16unorm(path.z) * 2.0 * PI;
    let radius = unpack2x16unorm(path.w).x * 65535.0;

    var mode = 0;

    let len = length(vec2f(x, y) - center);

    if ((path_draw_mode & 1) == 1 && len < radius) {
        mode += 1;
    }

    if((path_draw_mode & 2) == 2 && abs(len - radius) < line_half_width){
        mode += 2;
    }

    return mode;
}

fn draw_instance(index: u32) ->vec4f {
    let instance = ui_instances.data[index];
    let path_type = instance.x & 0xFFFF;
    var draw_mode = 0;

    switch (path_type) {
        case 1: {
            draw_mode = draw_rect(instance, inputs_uv.xy);
        }
        case 2: {
            draw_mode = draw_arc(instance, inputs_uv.xy);
        }
        default:{
            draw_mode = 0;
        }
    }
    
    if ((draw_mode & 2) == 2) {
        return vec4f(1.0, 0.0, 0.0, 1.0);
    }
    else if (draw_mode == 1) {
        return vec4f(1.0, 1.0, 0.0, 1.0);
    }
    
    return vec4f(0.0, 0.0, 0.0, 0.0);
}

var<private> material_alpha: f32 = 1.0;
var<private> material_baseColor: vec3f = vec3f(0.0);

fn material_fs() {
    if (inputs_uv.x > 1.0 || inputs_uv.y > 1.0) {
        discard;
    }

    var colors = vec4f(0.0, 0.0, 0.0, 0.0);

    let instance_count = ui_instances.data[0].w >> 16;
    for (var i = 0u; i < instance_count && i < 1024; i++) {
        let color = draw_instance(i);
        let rgb = (color.rgb * color.a) + (colors.rgb * (1.0 - color.a));

        colors = vec4f(rgb, 1.0);
    }
    
    material_baseColor = colors.xyz;

    // ===================------------------

    // let fill_style = ui_tyles.data[fill_style_index];
    // let fill_style_type = fill_style.x & 0xFF;
    // let fill_style_color = unpack4x8unorm(fill_style.y);
}
