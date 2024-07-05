
// 圆弧路径（常量缓存可容纳65536 / 32 == 2048个实例）。
struct CircularArc {
    // 圆弧半径。
    radius : f32,
    // 起始弧度（顺时针旋转）。
    start : f32,
    // 弧度细分跨距。
    stride : f32,
    // 圆弧细分线段数。
    subdivision : u32,

    // 圆心坐标。
    center : vec2<f32>,
    // 角点坐标。
    corner : vec2<f32>,
}


// 顶点材质方法（在顶点着色器入口函数中先调用init_vertex_0，后调用material_vs）
fn material_vs() ->OutputVS {
    var shape : CircularArc;

    let width = 1578.0;
    let height = 1578.0;

    shape.radius = height * 0.25;
    shape.start = 0.0;
    shape.stride = 3.141592654 / 20.0;
    shape.subdivision = 40u;
    shape.center = vec2<f32>(width * 0.5, height * 0.5);
    shape.corner = vec2<f32>(width, height);

    let triIndex = gl_VertexID / 3u;
    let verIndex = gl_VertexID % 3u;

    let x1 = shape.radius * sin(shape.start + shape.stride * (0.0 + f32(triIndex)));
    let y1 = shape.radius * cos(shape.start + shape.stride * (0.0 + f32(triIndex)));

    let x2 = shape.radius * sin(shape.start + shape.stride * (1.0 + f32(triIndex)));
    let y2 = shape.radius * cos(shape.start + shape.stride * (1.0 + f32(triIndex)));

    var center = shape.center;

    if (false) {
        let begX = shape.radius * sin(shape.start);
        let begY = shape.radius * cos(shape.start);

        let endX = shape.radius * sin(shape.start + shape.stride * f32(shape.subdivision));
        let endY = shape.radius * cos(shape.start + shape.stride * f32(shape.subdivision));

        let beg = shape.center + vec2<f32>(begX, begY);
        let end = shape.center + vec2<f32>(endX, endY);

        center = (beg + end) * 0.5;
    }
    else if (false) {
        center = shape.corner;
    }

    var vertices = array<vec2<f32>, 3>(
        center,
        shape.center + vec2(x2, y2),
        shape.center + vec2(x1, y1),
    );

    var pos = vertices[verIndex] * vec2<f32>(2.0 / width, 2.0 / height) - 1.0;
    var uv = vertices[verIndex] * vec2<f32>(1.0 / width, 1.0 / height);

    // =================--------------------------------------------

    var output: OutputVS;

    output.gl_Position = vec4(pos, 0.0, 1.0);
    output.clipPosition = vec4(pos, 0.0, 1.0);
    
    output.litPosition = vec4f(0.0);
    output.viewPosition = vec4f(0.0);
    output.viewNormal = vec3f(0.0, 0.0, 1.0);
    output.viewTangent = vec4f(1.0, 0.0, 0.0, 1.0);
    output.uv = uv;

    return output;
}
