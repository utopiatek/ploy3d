/// <reference types="dist" />
import * as Miaoverse from "../mod.js";
/**
 * 2D渲染器接口。
 */
export declare class Renderer2D {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化2D渲染器。
     * @returns 返回2D渲染器接口实例。
     */
    Init(): Promise<this>;
    /**
     * 创建2D画布。
     * @param width 画布宽度。
     * @param height 画布高度。
     * @returns 返回2D绘制接口实例。
     */
    CreateCanvas(width: number, height: number): Miaoverse.Canvas2D;
    /**
     * 创建样式实例。
     * @param color 颜色字符串。
     * @returns 返回样式实例。
     */
    CreateStyle2D(color: string): Miaoverse.Style2D;
    /**
     * 开始UI帧绘制预备工作。
     */
    BeginFrame(): void;
    /**
     * 添加绘制画布。
     * @param canvas 画布实例。
     */
    AddDraw(canvas: Canvas2D): void;
    /**
     * 结束UI帧绘制预备工作。
     */
    EndFrame(): void;
    /** 当前UI系统帧时间戳。 */
    get frameTS(): number;
    /** 默认样式实例。 */
    get defaultStyle(): Miaoverse.Style2D;
    /** 模块实例对象。 */
    private _global;
    /** 当前2D渲染器帧时间戳。 */
    private _frameTS;
    /** 当前2D画布绘制列表。 */
    private _drawList;
    /** 当前2D渲染器绘制数据。*/
    private _drawData;
    /** 样式实例查找表。 */
    private _styleLut;
}
/**
 * UI路径实例。
 */
export declare class Path2D {
    /**
     * 构造函数。
     */
    constructor();
    /**
     * 构造矩形数据。
     * @param x 左上角X像素坐标。
     * @param y 左上角Y像素坐标。
     * @param w 矩形像素宽度。
     * @param h 矩形像素高度。
     */
    Rect(x: number, y: number, w: number, h: number): void;
    /**
     * 创建圆角矩形路径。
     */
    RoundRect(x: number, y: number, w: number, h: number, radii: number): void;
    /**
     * 构造圆形数据。
     * @param x 圆形X像素坐标。
     * @param y 圆形Y像素坐标。
     * @param radius 半径像素大小。
     * @param startAngle 起始弧度。
     * @param endAngle 终止弧度。
     */
    Arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
    Mask(transform: number[]): number;
    /**
     * 当前路径类型：
     * 1-矩形；
     * 2-圆形；
     * 3-圆角矩形；
     */
    type: number;
    /** 当前路径是否已应用。*/
    applied: boolean;
    /** 当前路径几何数据单元数量。 */
    geometryCount: number;
    /** 几何数据单元数组（每个占用4个UINT）。 */
    geometries: number[];
}
/**
 * UI样式实例。
 */
export declare class Style2D {
    /**
     * 构造函数。
     * @param renderer 2D渲染器实例。
     * @param id 样式实例ID。
     */
    constructor(renderer: Renderer2D, id: string);
    /**
     * 样式实例ID。
     */
    get id(): string;
    /**
     * 样式类型：
     * 0-Color：纯色；
     * 1-Gradient_linear：渐变色。渐变方向为线段方向，起始点外为起始色，终止点外为终止色；
     * 2-Gradient_radial：渐变色。渐变方向为径向，起始圆内为起始色，终止圆外为终止色；
     * 3-Gradient_conic：渐变色。渐变方向为弧向；
     * 4-Pattern_repeat：填充图案。重复平铺。
     * 5-Pattern_repeat_x：填充图案。横向重复平铺。
     * 6-Pattern_repeat_y：填充图案。纵向重复平铺。
     * 7-Pattern_clamp：填充图案。不平铺。
     */
    get type(): number;
    set type(value: number);
    /**
     * 渐变色渐变停靠点数量（最大3个）。
     */
    get gradient_stop_count(): number;
    /**
     * 填充图案所在图集图层。
     */
    get pattern_texture_layer(): number;
    /**
     * 纯色颜色值（#AARRGGBB）；
     */
    get color(): number;
    set color(value: number);
    /**
     * Radial渐变起始圆弧半径（范围：[0, 65535]）。
     */
    get gradient_radial_start_radius(): number;
    /**
     * Conic渐变起始弧度（顺时针渐变）。
     */
    get gradient_conic_start_angle(): number;
    /**
     * Pattern图案旋转弧度（顺时针）。
     */
    get pattern_rotation(): number;
    /**
     * Radial渐变终止圆弧半径（范围：[0, 65535]）。
     */
    get gradient_radial_end_radius(): number;
    /**
     * Conic渐变终止弧度（顺时针渐变）。
     */
    get gradient_conic_end_angle(): number;
    /**
     * Pattern图案整体缩放（最大放大256倍）。
     */
    get pattern_scale(): number;
    /**
     * Linear渐变线的起点坐标（画布空间，范围：[0, 65535]）。
     */
    get gradient_linear_start(): number[];
    /**
     * Radial渐变起始圆心坐标（画布空间，范围：[0, 65535]）。
     */
    get gradient_radial_start_center(): number[];
    /**
     * Conic渐变中心点坐标（画布空间，范围：[0, 65535]）。
     */
    get gradient_conic_center(): number[];
    /**
     * Pattern图案采样图集图层UV偏移。
     */
    get pattern_uv_offset(): number[];
    /**
     * Linear渐变线的终点坐标（画布空间，范围：[0, 65535]）。
     */
    get gradient_linear_end(): number[];
    /**
     * Radial渐变终止圆心坐标（画布空间，范围：[0, 65535]）。
     */
    get gradient_radial_end_center(): number[];
    /**
     * Pattern图案采样图集图层UV缩放。
     */
    get pattern_uv_scale(): number[];
    /**
     * 渐变色各停靠点偏移（根据渐变区间归一化，最多3个停靠点）。
     */
    get gradient_stops_offset(): number[];
    /**
     * 渐变色各停靠点颜色（根据渐变区间归一化，最多3个停靠点）。
     */
    get gradient_stops_color(): number[];
    /** 2D渲染器实例。 */
    private _renderer;
    /** 样式实例ID。 */
    private _id;
    /**
     * 样式数据。
     * =U0=====================
     * uint type: 8;
     * ------------------------
     * uint gradient_stop_count: 8;
     * uint pattern_texture_layer: 8;
     * ------------------------
     * uint reserved2: 16;
     * =U1=====================
     * uint color: 32;
     * ------------------------
     * uint gradient_radial_start_radius: 16;
     * uint gradient_conic_start_angle: 16;
     * uint pattern_rotation: 16;
     * ------------------------
     * uint gradient_radial_end_radius: 16;
     * uint gradient_conic_end_angle: 16;
     * uint pattern_scale: 16;
     * =U2=====================
     * uint gradient_linear_start: 32;
     * uint gradient_radial_start_center: 32;
     * uint gradient_conic_center: 32;
     * uint pattern_uv_offset: 32;
     * =U3=====================
     * uint gradient_linear_end: 32;
     * uint gradient_radial_end_center: 32;
     * uint pattern_uv_scale: 32;
     * =U4=====================
     * uint gradient_stops_offset: 32;
     * =U567===================
     * uint gradient_stops_color: 32[3];
     */
    private _data;
}
/**
 * 2D绘制接口。
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D)
 */
export declare class Canvas2D {
    /**
     * 构造函数。
     * @param renderer 2D渲染器实例。
     * @param width 画布宽度。
     * @param height 画布高度。
     */
    constructor(renderer: Renderer2D, width: number, height: number);
    /**
     * 刷新绘制实例数据。
     * @param drawMode 当前绘制模式：1-填充、2-描边
     */
    Flush(drawMode: number): void;
    /**
     * 直接渲染画布到网格。
     * @param queue 渲染队列。
     * @param method 渲染方法。
     * @param params 渲染参数。
     */
    Draw(queue: Miaoverse.DrawQueue, method: string, params: number[]): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/canvas)
     */
    get canvas(): HTMLCanvasElement;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getContextAttributes)
     */
    getContextAttributes(): CanvasRenderingContext2DSettings;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalAlpha)
     */
    set globalAlpha(value: number);
    get globalAlpha(): number;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
     */
    set globalCompositeOperation(value: GlobalCompositeOperation);
    get globalCompositeOperation(): GlobalCompositeOperation;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawImage)
     */
    drawImage(image: CanvasImageSource, dx_or_sx: number, dy_or_sy: number, dw_or_sw?: number, dh_or_sh?: number, dx?: number, dy?: number, dw?: number, dh?: number): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/beginPath)
     */
    beginPath(): void;
    /**
     * 将当前创建的路径设置为当前剪切路径的方法。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clip)
     */
    clip(path_or_rule: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fill)
     */
    fill(path_or_rule?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInPath)
     */
    isPointInPath(path_or_x: Path2D | number, x_or_y: number, y_or_rule: number | CanvasFillRule, fillRule?: CanvasFillRule): boolean;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInStroke)
     */
    isPointInStroke(path_or_x: Path2D, x_or_y: number, y?: number): boolean;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/stroke)
     */
    stroke(path?: Path2D): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillStyle)
     */
    set fillStyle(value: string | CanvasGradient | CanvasPattern);
    get fillStyle(): string | CanvasGradient | CanvasPattern;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeStyle)
     */
    set strokeStyle(value: string | CanvasGradient | CanvasPattern);
    get strokeStyle(): string | CanvasGradient | CanvasPattern;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createConicGradient)
     */
    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)
     */
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createPattern)
     */
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createRadialGradient)
     */
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/filter)
     */
    set filter(value: string);
    get filter(): string;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createImageData)
     */
    createImageData(sw_or_imagedata: number | ImageData, sh?: number, settings?: ImageDataSettings): ImageData;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getImageData)
     */
    getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/putImageData)
     */
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled)
     */
    set imageSmoothingEnabled(value: boolean);
    get imageSmoothingEnabled(): boolean;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality)
     */
    set imageSmoothingQuality(value: ImageSmoothingQuality);
    get imageSmoothingQuality(): ImageSmoothingQuality;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arc)
     */
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arcTo)
     */
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    /**
     *  绘制三次贝赛尔曲线路径的方法。该方法需要三个点。第一、第二个点是控制点，第三个点是结束点。起始点是当前路径的最后一个点，绘制贝赛尔曲线前，可以通过调用 moveTo() 进行修改。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
     */
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    /**
     * 将笔点返回到当前子路径起始点的方法。它尝试从当前点到起始点绘制一条直线。如果图形已经是封闭的或者只有一个点，那么此方法不会做任何操作。
     * 不调用路径可能未闭合。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/closePath)
     */
    closePath(): void;
    /**
     * 添加椭圆路径的方法。椭圆的圆心在（x,y）位置，半径分别是radiusX 和 radiusY，按照anticlockwise（默认顺时针）指定的方向，从 startAngle 开始绘制，到 endAngle 结束。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/ellipse)
     */
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineTo)
     */
    lineTo(x: number, y: number): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/moveTo)
     */
    moveTo(x: number, y: number): void;
    /**
     * 新增二次贝塞尔曲线路径的方法。它需要 2 个点。第一个点是控制点，第二个点是终点。起始点是当前路径最新的点，当创建二次贝赛尔曲线之前，可以使用 moveTo() 方法进行改变。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo)
     */
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    /**
     * 创建矩形路径。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rect)
     */
    rect(x: number, y: number, w: number, h: number): void;
    /**
     * 创建圆角矩形路径。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/roundRect)
     */
    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]): void;
    /**
     * 指示如何绘制线段末端。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineCap)
     */
    set lineCap(value: CanvasLineCap);
    get lineCap(): CanvasLineCap;
    /**
     * 虚线交替起始偏移，依此可实现动画效果。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
     */
    set lineDashOffset(value: number);
    get lineDashOffset(): number;
    /**
     * 描述两线段连接属性。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineJoin)
     */
    set lineJoin(value: CanvasLineJoin);
    get lineJoin(): CanvasLineJoin;
    /**
     * 线宽。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineWidth)
     */
    set lineWidth(value: number);
    get lineWidth(): number;
    /**
     * 当两条线段以尖角相交时，如果尖角的长度超过 miterLimit 的值，尖角会被切断，转而使用斜角（bevel join）来绘制。这可以防止尖角过长，导致视觉上的不美观。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/miterLimit)
     */
    set miterLimit(value: number);
    get miterLimit(): number;
    /**
     * 获取虚线交替长度。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getLineDash)
     */
    getLineDash(): number[];
    /**
     * 设置虚线交替长度。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash)
     */
    setLineDash(segments: number[]): void;
    /**
     * 清除一个矩形区域为黑色透明颜色。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clearRect)
     */
    clearRect(x: number, y: number, w: number, h: number): void;
    /**
     * 填充矩形。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillRect)
     */
    fillRect(x: number, y: number, w: number, h: number): void;
    /**
     * 描边，线宽向基线两边延展。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeRect)
     */
    strokeRect(x: number, y: number, w: number, h: number): void;
    /**
     * 描述模糊效果程度的属性；它既不对应像素值也不受当前转换矩阵的影响。默认值是 0。，浮动值，单位没有含义
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowBlur)
     */
    set shadowBlur(value: number);
    get shadowBlur(): number;
    /**
     * 阴影颜色，不透明，阴影才会被绘制。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowColor)
     */
    set shadowColor(value: string);
    get shadowColor(): string;
    /**
     * 描述阴影垂直偏移距离的属性。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX)
     */
    set shadowOffsetX(value: number);
    get shadowOffsetX(): number;
    /**
     * 描述阴影垂直偏移距离的属性。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY)
     */
    set shadowOffsetY(value: number);
    get shadowOffsetY(): number;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/restore)
     */
    restore(): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/save)
     */
    save(): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillText)
     */
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/measureText)
     */
    measureText(text: string): TextMetrics;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeText)
     */
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/direction)
     */
    set direction(value: CanvasDirection);
    get direction(): CanvasDirection;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/font)
     */
    set font(value: string);
    get font(): string;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fontKerning)
     */
    set fontKerning(value: CanvasFontKerning);
    get fontKerning(): CanvasFontKerning;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textAlign)
     */
    set textAlign(value: CanvasTextAlign);
    get textAlign(): CanvasTextAlign;
    /**
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     */
    set textBaseline(value: CanvasTextBaseline);
    get textBaseline(): CanvasTextBaseline;
    /**
     * 获取当前被应用到上下文的转换矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getTransform)
     */
    getTransform(): DOMMatrix;
    /**
     * 重新设置当前变形为单位矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/resetTransform)
     */
    resetTransform(): void;
    /**
     * 在当前变换矩阵中增加旋转的方法（角度变量表示一个顺时针旋转角度并且用弧度表示）。
     * 执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rotate)
     */
    rotate(angle: number): void;
    /**
     * 画布默认单位是1像素，如果设置缩放为0.5，则单位是0.5像素。
     * 执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/scale)
     */
    scale(x: number, y: number): void;
    /**
     * 重设变换矩阵（注意不是叠加的）。
     * 默认情况下，变换按以下顺序应用：缩放、旋转、平移。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setTransform)
     */
    setTransform(a_or_transform?: number | DOMMatrix2DInit, b?: number, c?: number, d?: number, e?: number, f?: number): void;
    /**
     * 设置叠加变换（注意变换是叠加的）。
     * 这个方法可以用来同时进行缩放、旋转、平移和倾斜（注意倾斜的概念）。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/transform)
     */
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    /**
     * 平移画布空间。
     * 执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/translate)
     */
    translate(x: number, y: number): void;
    /**
     * 如果指定HTML元素处于焦点状态，绘制当前PATH或指定PATH。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawFocusIfNeeded)
     */
    drawFocusIfNeeded(path_or_element: Path2D | Element, element?: Element): void;
    /** 2D渲染器实例。 */
    renderer: Renderer2D;
    /** 2D绘制接口实例数据。 */
    data: {
        /** 画布宽度。 */
        width: number;
        /** 画布高度。 */
        height: number;
        /** 当前绘制实例数据帧时间戳。 */
        frameTS: number;
        /** 绘制实例数组（每个占用1个UVEC4）。 */
        instances: number[];
        /** 绘制实例数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。 */
        instancesOffset: number;
        /** 绘制实例数量（最大1024）。 */
        instanceCount: number;
        /** 变换矩阵数组（每个占用2个VEC4，最后2个浮点型记录画布宽高）。 */
        transforms: number[];
        /** 变换矩阵数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。 */
        transformsOffset: number;
        /** 变换矩阵数量（最大512）。 */
        transformCount: number;
        /** 当前变换组件。 */
        transform: {
            /** 当前变换组件数据。 */
            data: number[];
            /** 当前变换矩阵是否已应用。*/
            applied: boolean;
        };
        /** 几何数据单元数组（每个占用4个UINT）。 */
        geometries: number[];
        /** 几何数据单元数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。 */
        geometriesOffset: number;
        /** 几何数据单元数量（最大1024）。 */
        geometryCount: number;
        /** 最新应用几何数据单元起始索引。 */
        geometryCur: number;
        /** 当前操作的几何路径实例。 */
        path: Path2D;
        /** 样式实例数组（每个占用2个UVEC4）。 */
        styles: Style2D[];
        /** 样式实例数组在常量缓存中偏移（在Renderer2D.EndDraw中确定）。 */
        stylesOffset: number;
        /** 样式实例数量（最大512）。 */
        styleCount: number;
        /** 当前用于填充的样式实例。 */
        fillStyle: Style2D;
        /** 当前用于描边的样式实例。 */
        strokeStyle: Style2D;
        /** 当前线条宽度。 */
        lineWidth: number;
        /** 绘制批次数组。 */
        batches: Canvas2D["data"]["batch"][];
        /** 当前绘制批次。 */
        batch: {
            /** 绘制实例数组偏移。 */
            instancesOffset: number;
            /** 绘制实例数量（最大1024）。 */
            instanceCount: number;
            /** 变换矩阵数组偏移。 */
            transformsOffset: number;
            /** 变换矩阵数量（最大512）。 */
            transformCount: number;
            /** 几何数据单元数组偏移。 */
            geometriesOffset: number;
            /** 几何数据单元数量（最大1024）。 */
            geometryCount: number;
            /** 样式实例数组偏移。 */
            stylesOffset: number;
            /** 样式实例数量（最大512）。 */
            styleCount: number;
            /** 引用的样式实例查找表。 */
            styleLut: Record<string, number>;
            /** 当前批次资源绑定组实例标识。 */
            binding_key?: string;
            /** 当前批次资源绑定组实例。 */
            binding?: GPUBindGroup;
        };
    };
}
