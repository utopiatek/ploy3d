import * as Miaoverse from "../mod.js"

/**
 * 2D渲染器接口。
 */
export class Renderer2D {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
        this._frameTS = 1;
        this._drawList = [];
        this._drawData = null;
        this._styleLut = {};
        this._rem_font_size = 16;
        this._font_glyphs_lut = null;
        this._font_atlas = null;
    }

    /**
     * 初始化2D渲染器。
     * @returns 返回2D渲染器接口实例。
     */
    public async Init() {
        // #AARRGGBB: https://learn.microsoft.com/zh-cn/power-platform/power-fx/reference/function-colors#built-in-colors

        const colors: Record<string, number> = {
            red: 0xff0000,
            green: 0x00ff00,
            blue: 0x0000ff,
            white: 0xffffff,
        };

        for (let key in colors) {
            const style = this.CreateStyle2D(key);
            style.color = colors[key] | 0xFF000000;
        }

        this._font_glyphs_lut = await this._global.Fetch<any>("./assets/fonts/simhei.json", null, "json");
        if (!this._font_glyphs_lut) {
            throw "字体文件加载失败！";
        }

        const atlas_w = this._font_glyphs_lut.atlas.width;
        const atlas_h = this._font_glyphs_lut.atlas.height;

        const lut: Record<number, number[]> = this._font_glyphs_lut.lut = {};

        for (let glyph of this._font_glyphs_lut.glyphs) {
            if (!glyph.atlasBounds) {
                continue;
            }

            // 字形数据在图集中的像素矩形范围（原点在左上角）
            const bounds = glyph.atlasBounds;
            const left = Math.floor((bounds.left) / atlas_w * 65535.0);
            const top = Math.floor((atlas_h - bounds.top) / atlas_h * 65535.0);
            const width = Math.floor((bounds.right - bounds.left) / atlas_w * 65535.0);
            const height = Math.floor((bounds.top - bounds.bottom) / atlas_h * 65535.0);

            const nx = ((top << 16) >>> 0) + left;
            const ny = ((height << 16) >>> 0) + width;

            /*/
            lt_bias |
                    |
                  --|------
                            rb_bias
            绘制时传入几点像素坐标，加上lt_bias得左上角坐标
            /*/

            const desc = [
                glyph.unicode,
                glyph.advance,

                glyph.planeBounds.left,
                glyph.planeBounds.top,
                glyph.planeBounds.right - glyph.planeBounds.left,
                glyph.planeBounds.top - glyph.planeBounds.bottom,

                nx,
                ny
            ];

            lut[glyph.unicode] = desc;
        }

        const blob = await this._global.Fetch<Blob>("./assets/fonts/simhei.png", null, "blob");
        const option: ImageBitmapOptions = undefined;
        const bitmap = await createImageBitmap(blob, option);
        if (!bitmap) {
            throw "字体字形图集纹理加载失败！";
        }

        const tile = this._global.resources.Texture._CreateTile(bitmap.width, bitmap.height, 0);
        const info = this._global.env.uarrayGet(tile, 12, 8);

        this._global.resources.Texture._WriteTile(tile, bitmap);

        bitmap.close();

        this._font_atlas = {
            tile_ptr: tile,
            layer: info[1],
            x: info[6] * 64,
            y: info[7] * 64,
            width: info[2],
            height: info[3],
        };

        return this;
    }

    /**
     * 创建2D画布。
     * @param width 画布宽度。
     * @param height 画布高度。
     * @returns 返回2D绘制接口实例。
     */
    public CreateCanvas(width: number, height: number) {
        return new Canvas2D(this, width, height);
    }

    /**
     * 创建样式实例。
     * @param color 颜色字符串。
     * @returns 返回样式实例。
     */
    public CreateStyle2D(color: string) {
        let style = this._styleLut[color];
        if (style) {
            return style;
        }

        style = new Style2D(this, color);
        style.type = 0;
        style.color = 0xFFFFFFFF;

        this._styleLut[color] = style;

        return style;
    }

    /**
     * 创建字符串图形路径数据。
     * @param text 字符串。
     * @param x 起始光标像素坐标。
     * @param y 文本行基线像素坐标。
     * @param canvas_w 画布宽度。
     * @param canvas_h 画布高度。
     */
    public CreateString2D(text: string, x: number, y: number, canvas_w: number, canvas_h: number) {
        const glyphs = this._font_glyphs_lut.lut;
        const em_font_size = this._rem_font_size;

        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const glyph = glyphs[code];

            if (glyph) {
                let left = x + glyph[2] * em_font_size;
                let top = (y - glyph[3] * em_font_size);

                let width = glyph[4] * em_font_size;
                let height = glyph[5] * em_font_size;

                left = Math.floor(Math.max(Math.min(left, canvas_w), 0));
                top = Math.floor(Math.max(Math.min(top, canvas_h), 0));

                width = Math.ceil(65535 / (width));
                height = Math.ceil(65535 / (height));

                const nx = ((top << 16) >>> 0) + left;
                const ny = ((height << 16) >>> 0) + width;

                const data = [
                    nx,
                    ny,
                    glyph[6],
                    glyph[7]
                ];

                console.error("-------", data);

                // 横向推进光标移动
                x += glyph[1] * em_font_size;
            }
            else {
                // 横向推进光标移到
                x += 0.5 * em_font_size;
            }
        }
    }

    /**
     * 开始UI帧绘制预备工作。
     */
    public BeginFrame() {
        this._frameTS++;
        this._drawList = [];
    }

    /**
     * 添加绘制画布。
     * @param canvas 画布实例。
     */
    public AddDraw(canvas: Canvas2D) {
        if (this._drawList.indexOf(canvas) == -1) {
            this._drawList.push(canvas);

            canvas.data.frameTS = this.frameTS;
        }
    }

    /**
     * 结束UI帧绘制预备工作。
     */
    public EndFrame() {
        let total_instanceCount = 0;
        let total_transformCount = 0;
        let total_geometryCount = 0;
        let total_styleCount = 0;

        for (let canvas of this._drawList) {
            const data = canvas["data"];

            data.instancesOffset = total_instanceCount;
            data.transformsOffset = total_transformCount;
            data.geometriesOffset = total_geometryCount;
            data.stylesOffset = total_styleCount;

            total_instanceCount += data.instanceCount;
            total_transformCount += data.transformCount;
            total_geometryCount += data.geometryCount;
            total_styleCount += data.styleCount;

            // GPU缓存绑定需要256字节对齐
            total_instanceCount = (total_instanceCount + 15) >> 4 << 4;
            total_transformCount = (total_transformCount + 7) >> 3 << 3;
            total_geometryCount = (total_geometryCount + 15) >> 4 << 4;
            total_styleCount = (total_styleCount + 7) >> 3 << 3;
        }

        // =======================-------------------------------

        let byteLength = 0;
        let instancesPtr = byteLength; byteLength += 16 * total_instanceCount;
        let transformsPtr = byteLength; byteLength += 32 * total_transformCount;
        let geometriesPtr = byteLength; byteLength += 16 * total_geometryCount;
        let stylesPtr = byteLength; byteLength += 32 * total_styleCount;

        // 区别GPU缓存有16384的绑定大小
        byteLength = byteLength + 16384;
        // 以MB为单位分配缓存空间
        byteLength = (byteLength + 0xFFFFF) & 0xFFF00000;

        let drawData = this._drawData;

        if (!drawData || byteLength > drawData.capacity) {
            const device = this._global.device;

            if (drawData) {
                device.FreeBuffer(drawData.bufferID);
            }

            const buffer = new ArrayBuffer(byteLength);
            const bufferID = device.CreateBuffer(Miaoverse.CLASSID.GPU_UNIFORM_BUFFER, byteLength);

            drawData = this._drawData = {
                buffer,
                bufferID,
                capacity: byteLength
            };
        }

        const buffer = drawData.buffer;

        const instances = drawData.instances = new Uint32Array(buffer, instancesPtr, 4 * total_instanceCount);
        const transforms = drawData.transforms = new Float32Array(buffer, transformsPtr, 8 * total_transformCount);
        const geometries = drawData.geometries = new Uint32Array(buffer, geometriesPtr, 4 * total_geometryCount);
        const styles = drawData.styles = new Uint32Array(buffer, stylesPtr, 8 * total_styleCount);

        // =======================-------------------------------

        for (let canvas of this._drawList) {
            const data = canvas["data"];

            let offset = data.instancesOffset * 4;
            let count = data.instanceCount * 4;
            let array = data.instances;

            for (let i = 0; i < count; i++) {
                instances[offset + i] = array[i];
            }

            // ===========------------------

            offset = data.transformsOffset * 8;
            count = data.transformCount * 8;
            array = data.transforms;

            for (let i = 0; i < count; i++) {
                transforms[offset + i] = array[i];
            }

            // ===========------------------

            offset = data.geometriesOffset * 4;
            count = data.geometryCount * 4;
            array = data.geometries;

            for (let i = 0; i < count; i++) {
                geometries[offset + i] = array[i];
            }

            // ===========------------------

            offset = data.stylesOffset * 8;
            count = data.styleCount;

            for (let i = 0; i < count; i++) {
                array = data.styles[i]?.["_data"] as any;

                if (array) {
                    const i8 = i * 8;

                    for (let j = 0; j < 8; j++) {
                        styles[offset + i8 + j] = array[j];
                    }
                }
            }
        }

        this._global.device.WriteBuffer(
            this._drawData.bufferID,                // 缓存实例ID
            0,                                      // 缓存写入偏移
            this._drawData.buffer,                  // 数据源
            0,                                      // 数据源偏移
            styles.byteOffset + styles.byteLength   // 写入大小
        );

        // console.error(this);
    }

    /** 当前UI系统帧时间戳。 */
    public get frameTS() {
        return this._frameTS;
    }

    /** 默认样式实例。 */
    public get defaultStyle() {
        return this._styleLut["white"];
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
    /** 当前2D渲染器帧时间戳。 */
    private _frameTS: number;
    /** 当前2D画布绘制列表。 */
    private _drawList: Canvas2D[];
    /** 当前2D渲染器绘制数据。*/
    private _drawData: {
        /** 绘制数据缓存。 */
        buffer: ArrayBuffer;
        /** 绘制数据GPU缓存ID。 */
        bufferID: number;
        /** 绘制数据缓存容量。 */
        capacity: number;

        /** 当前实例数据数组。 */
        instances?: Uint32Array;
        /** 当前变换矩阵数据数组。 */
        transforms?: Float32Array;
        /** 当前路径点数据数组。 */
        geometries?: Uint32Array;
        /** 当前样式数据数组。 */
        styles?: Uint32Array;
    };
    /** 样式实例查找表。 */
    private _styleLut: Record<string, Style2D>;
    /** 1REM对应的像素数（Renderer2D统一以EM为单位）。 */
    private _rem_font_size: number;
    /** 字形数据查找表。 */
    private _font_glyphs_lut: FontAtlas;
    /** 字形图集纹理数据。 */
    private _font_atlas: {
        /** 图块实例指针。 */
        tile_ptr: Miaoverse.io_ptr;
        /** 图块所在图层。 */
        layer: number;
        /** 图块左上角X像素坐标。 */
        x: number;
        /** 图块左上角Y像素坐标。 */
        y: number;
        /** 图块像素宽度。 */
        width: number;
        /** 图块像素高度。 */
        height: number;
    };
}

/**
 * UI路径实例。
 */
export class Path2D {
    /**
     * 构造函数。
     */
    public constructor() {
    }

    /**
     * 构造矩形数据。
     * @param x 左上角X像素坐标。
     * @param y 左上角Y像素坐标。
     * @param w 矩形像素宽度。
     * @param h 矩形像素高度。
     */
    public Rect(x: number, y: number, w: number, h: number) {
        // 基本信息（低4位记录图形类型，当前矩形为1）
        let n0 = 1;

        // 半宽高
        w = Math.floor(w * 0.5);
        h = Math.floor(h * 0.5);
        let n2 = (h << 16) + w;

        // 中心点
        x = Math.floor(x + w);
        y = Math.floor(y + h);
        let n1 = (y << 16) + x;

        // 保留字段
        let n3 = 0;

        this.type = 1;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }

    /**
     * 创建圆角矩形路径。
     */
    public RoundRect(x: number, y: number, w: number, h: number, radii: number) {
        if (!radii) {
            this.Rect(x, y, w, h);
            return;
        }

        // 基本信息（低4位记录图形类型，当前圆角矩形为3）
        let n0 = 3;

        // 半宽高
        w = Math.floor(w * 0.5);
        h = Math.floor(h * 0.5);
        let n2 = (h << 16) + w;

        // 中心点
        x = Math.floor(x + w);
        y = Math.floor(y + h);
        let n1 = (y << 16) + x;

        // 圆角半径
        radii = Math.ceil(radii);
        let n3 = (0 << 16) + radii;

        this.type = 3;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }

    /**
     * 构造圆形数据。
     * @param x 圆形X像素坐标。
     * @param y 圆形Y像素坐标。
     * @param radius 半径像素大小。
     * @param startAngle 起始弧度。
     * @param endAngle 终止弧度。
     */
    public Arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        // 基本信息（低4位记录图形类型，当前圆形为2）
        let n0 = 2;

        // 中心点
        x = Math.floor(x);
        y = Math.floor(y);
        let n1 = (y << 16) + x;

        // 起止弧度
        startAngle = Math.floor(startAngle / (2.0 * Math.PI) * 65535);
        endAngle = Math.floor(endAngle / (2.0 * Math.PI) * 65535);
        let n2 = (endAngle << 16) + startAngle;

        // 半径
        radius = Math.ceil(radius);
        let n3 = (0 << 16) + radius;

        this.type = 2;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }

    /**
     * 构造文本图形数据。
     * @param text 字符串行。
     * @param x 光标位置。
     * @param y 基线位置。
     * @param maxWidth 最大绘制行宽。
     * @param params 字体数据。
     */
    public Text(text: string, x: number, y: number, maxWidth?: number, params?: {
        /** 1EM对应像素数。 */
        em_font_size: number;
        /** 字形数据查找表。 */
        glyphs: FontAtlas;
        /** 字形图集信息。 */
        atlas: Renderer2D["_font_atlas"];
        /** 画布宽度。 */
        canvas_width: number;
        /** 画布高度。 */
        canvas_height: number;
    }) {
        const { em_font_size, atlas, canvas_width, canvas_height } = params;
        const glyphs = params.glyphs.lut;
        const geometries: number[] = [];

        // 起始光标X像素坐标
        let start_x = x;
        {
            const start_glyph = glyphs[text.charCodeAt(0)];
            if (start_glyph) {
                start_x += start_glyph[2] * em_font_size;
            }
        }

        // 实际绘制字符数量
        let char_count = 0;

        // 逐一添加字符绘制
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const glyph = glyphs[code];

            if (glyph) {
                let left = x + glyph[2] * em_font_size;
                let top = (y - glyph[3] * em_font_size);

                let width = glyph[4] * em_font_size;
                let height = glyph[5] * em_font_size;

                left = Math.floor(Math.max(Math.min(left, canvas_width), 0));
                top = Math.floor(Math.max(Math.min(top, canvas_height), 0));

                width = Math.ceil(65535 / (width));
                height = Math.ceil(65535 / (height));

                const nx = ((top << 16) >>> 0) + left;
                const ny = ((height << 16) >>> 0) + width;

                let i4 = char_count * 4 + 8;

                geometries[i4 + 0] = nx;
                geometries[i4 + 1] = ny;
                geometries[i4 + 2] = glyph[6];
                geometries[i4 + 3] = glyph[7];

                // 横向推进光标移动
                x += glyph[1] * em_font_size;

                // 统计实际绘制字符数量
                char_count += 1;
            }
            else {
                // 横向推进光标移到
                x += 0.5 * em_font_size;
            }

            // 达到行宽限制，忽略后续字符绘制
            if (maxWidth && maxWidth < (x - start_x)) {
                break;
            }
        }

        // ====================--------------------------------

        // 基本信息
        // type         :4
        // char_count   :12
        // atlas_layer  :8

        let n0 = (atlas.layer << 16) + (char_count << 4) + 4;

        // ====================--------------------------------

        let min_x = start_x;
        let max_x = x;
        let min_y = y - params.glyphs.metrics.ascender * em_font_size;
        let max_y = y - params.glyphs.metrics.descender * em_font_size;

        let rect_center_x = Math.floor((min_x + max_x) * 0.5);
        let rect_center_y = Math.floor((min_y + max_y) * 0.5);
        let rect_center_w = Math.floor((max_x - min_x) * 0.5);
        let rect_center_h = Math.floor((max_y - min_y) * 0.5);

        // 文本行中心点
        let n1 = (rect_center_y << 16) + rect_center_x;

        // 文本行半宽高
        let n2 = (rect_center_h << 16) + rect_center_w;

        // 保留字段
        let n3 = 0;

        geometries[0] = n0;
        geometries[1] = n1;
        geometries[2] = n2;
        geometries[3] = n3;

        // ====================--------------------------------

        let n4 = (atlas.y << 16) + atlas.x;
        let n5 = (atlas.height << 16) + atlas.width;
        let n6 = 0;
        let n7 = 0;

        geometries[4] = n4;
        geometries[5] = n5;
        geometries[6] = n6;
        geometries[7] = n7;

        // ====================--------------------------------

        this.type = 4;
        this.applied = false;
        this.geometryCount = 2 + char_count;
        this.geometries = geometries;
    }

    public Mask(transform: number[]) {
        // // 边界框，变换矩阵，新边界框，掩码
        return 0xFFFFFFFF;
    }

    /** 
     * 当前路径类型：
     * 1-矩形；
     * 2-圆形；
     * 3-圆角矩形；
     * 4-字符串；
     */
    public type: number;
    /** 当前路径是否已应用。*/
    public applied: boolean;
    /** 当前路径几何数据单元数量。 */
    public geometryCount: number;
    /** 几何数据单元数组（每个占用4个UINT）。 */
    public geometries: number[];
}

/**
 * UI样式实例。
 */
export class Style2D {
    /**
     * 构造函数。
     * @param renderer 2D渲染器实例。
     * @param id 样式实例ID。
     */
    public constructor(renderer: Renderer2D, id: string) {
        this._renderer = renderer;
        this._id = id;
        this._data = new Uint32Array(8);
    }

    /**
     * 样式实例ID。
     */
    public get id() {
        return this._id;
    }

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
    public get type(): number {
        return this._data[0] & 0xFF;
    }
    public set type(value) {
        this._data[0] = (this._data[0] & 0xFFFFFF00) | (value & 0xFF);
    }

    /**
     * 渐变色渐变停靠点数量（最大3个）。
     */
    public get gradient_stop_count(): number {
        return (this._data[0] >> 8) & 0xFF;
    }

    /**
     * 填充图案所在图集图层。
     */
    public get pattern_texture_layer(): number {
        return (this._data[0] >> 8) & 0xFF;
    }

    /**
     * 纯色颜色值（#AARRGGBB）；
     */
    public get color(): number {
        return this._data[1];
    }
    public set color(value) {
        this._data[1] = value;
    }

    /**
     * Radial渐变起始圆弧半径（范围：[0, 65535]）。
     */
    public get gradient_radial_start_radius(): number {
        return this._data[1] & 0xFFFF;
    }

    /**
     * Conic渐变起始弧度（顺时针渐变）。
     */
    public get gradient_conic_start_angle(): number {
        return ((this._data[1] & 0xFFFF) / 65535) * (2 * Math.PI);
    }

    /**
     * Pattern图案旋转弧度（顺时针）。
     */
    public get pattern_rotation(): number {
        return ((this._data[1] & 0xFFFF) / 65535) * (2 * Math.PI);
    }

    /**
     * Radial渐变终止圆弧半径（范围：[0, 65535]）。
     */
    public get gradient_radial_end_radius(): number {
        return (this._data[1] >> 16) & 0xFFFF;
    }

    /**
     * Conic渐变终止弧度（顺时针渐变）。
     */
    public get gradient_conic_end_angle(): number {
        return (((this._data[1] >> 16) & 0xFFFF) / 65535) * (2 * Math.PI);
    }

    /**
     * Pattern图案整体缩放（最大放大256倍）。
     */
    public get pattern_scale(): number {
        const data = (this._data[1] >> 16) & 0xFFFF;

        if (data < 32768) {
            return data / 32767;
        }
        else {
            return 1.0 + (data - 32768) / 32767 * 256;
        }
    }

    /**
     * Linear渐变线的起点坐标（画布空间，范围：[0, 65535]）。
     */
    public get gradient_linear_start(): number[] {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * Radial渐变起始圆心坐标（画布空间，范围：[0, 65535]）。
     */
    public get gradient_radial_start_center(): number[] {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * Conic渐变中心点坐标（画布空间，范围：[0, 65535]）。
     */
    public get gradient_conic_center(): number[] {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * Pattern图案采样图集图层UV偏移。
     */
    public get pattern_uv_offset(): number[] {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * Linear渐变线的终点坐标（画布空间，范围：[0, 65535]）。
     */
    public get gradient_linear_end(): number[] {
        const x = (this._data[3]) & 0xFFFF;
        const y = (this._data[3] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * Radial渐变终止圆心坐标（画布空间，范围：[0, 65535]）。
     */
    public get gradient_radial_end_center(): number[] {
        const x = (this._data[3]) & 0xFFFF;
        const y = (this._data[3] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * Pattern图案采样图集图层UV缩放。
     */
    public get pattern_uv_scale(): number[] {
        const x = (this._data[3]) & 0xFFFF;
        const y = (this._data[3] >> 16) & 0xFFFF;
        return [x, y];
    }

    /**
     * 渐变色各停靠点偏移（根据渐变区间归一化，最多3个停靠点）。
     */
    public get gradient_stops_offset(): number[] {
        const x = (this._data[4]) & 0xFF;
        const y = (this._data[4] >> 8) & 0xFF;
        const z = (this._data[4] >> 16) & 0xFF;

        return [x / 255, y / 255, z / 255];
    }

    /**
     * 渐变色各停靠点颜色（根据渐变区间归一化，最多3个停靠点）。
     */
    public get gradient_stops_color(): number[] {
        return [this._data[5], this._data[6], this._data[7]];
    }

    /** 2D渲染器实例。 */
    private _renderer: Renderer2D;
    /** 样式实例ID。 */
    private _id: string;

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
    private _data: Uint32Array;
}

/**
 * 2D绘制接口。
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D)
 */
export class Canvas2D {
    /**
     * 构造函数。
     * @param renderer 2D渲染器实例。
     * @param width 画布宽度。
     * @param height 画布高度。
     */
    public constructor(renderer: Renderer2D, width: number, height: number) {
        this.renderer = renderer;
        this.data = {
            width: width,
            height: height,
            frameTS: 0,

            instances: [],
            instancesOffset: 0,
            instanceCount: 0,

            transforms: [],
            transformsOffset: 0,
            transformCount: 0,
            transform: {
                data: [1, 0, 0, 1, 0, 0, width, height],
                applied: false
            },

            geometries: [],
            geometriesOffset: 0,
            geometryCount: 0,
            geometryCur: 0,
            path: null,

            styles: [],
            stylesOffset: 0,
            styleCount: 0,
            fillStyle: renderer.defaultStyle,
            strokeStyle: renderer.defaultStyle,

            lineWidth: 2,

            batches: [],
            batch: null
        };
    }

    /**
     * 刷新绘制实例数据。
     * @param drawMode 当前绘制模式：1-填充、2-描边
     */
    public Flush(drawMode: number) {
        const data = this.data;
        const path = data.path;
        const transform = data.transform;

        // 如果帧时间戳不一致，清除当前绘制实例数据
        if (data.frameTS != this.renderer.frameTS) {
            data.frameTS = this.renderer.frameTS;

            data.instancesOffset = 0;
            data.instanceCount = 0;

            data.transformsOffset = 0;
            data.transformCount = 0;

            data.geometriesOffset = 0;
            data.geometryCount = 0;
            data.geometryCur = 0;

            data.stylesOffset = 0;
            data.styleCount = 0;

            data.batches = [];
            data.batch = null;

            this.renderer.AddDraw(this);
        }

        // 当前未设置几何路径
        if (!path) {
            return;
        }

        // 当前批次数据
        let batch = data.batch;

        // 因为GPU缓存绑定需要256字节对齐，因此在写入最新数据前，我们需要进行批次数据起始地址对齐
        if (batch == null ||                                    // 当前批次未设置
            batch.instanceCount == 1024 ||                      // 当前批次实例数已满（无法写入新数据）
            batch.transformCount == 512 ||                      // 当前批次变换矩阵数已满（无法写入新数据）
            batch.geometryCount + path.geometryCount > 1024 ||  // 当前批次几何数据单元数据空间余量不足
            batch.styleCount > 510                              // 当前批次样式数据空间余量不足（1个实例使用2个样式）
        ) {
            // 需要重新应用图形路径数据和变换矩阵数据
            path.applied = false;
            transform.applied = false;

            // 进行256字节对齐
            data.instanceCount = (data.instanceCount + 15) >> 4 << 4;
            data.transformCount = (data.transformCount + 7) >> 3 << 3;
            data.geometryCount = (data.geometryCount + 15) >> 4 << 4;
            data.styleCount = (data.styleCount + 7) >> 3 << 3;

            // 设置新的绘制批次
            batch = data.batch = {
                instancesOffset: data.instanceCount,
                instanceCount: 0,

                transformsOffset: data.transformCount,
                transformCount: 0,

                geometriesOffset: data.geometryCount,
                geometryCount: 0,

                stylesOffset: data.styleCount,
                styleCount: 0,
                styleLut: {}
            };

            // 使用第1实例保存批次相关信息
            data.instanceCount++;
            batch.instanceCount++;

            // 批次图形影响画布区块掩码
            data.instances[batch.instancesOffset * 4 + 0] = 0;
            // 批次绘制实例数量
            data.instances[batch.instancesOffset * 4 + 1] = 0;
            // 批次保留字段
            data.instances[batch.instancesOffset * 4 + 2] = 0;
            // 批次保留字段
            data.instances[batch.instancesOffset * 4 + 3] = 0;

            // 添加入批次数组
            data.batches.push(batch);
        }

        // 应用最新变换矩阵设置
        if (transform.applied == false) {
            transform.applied = true;

            const i8 = data.transformCount * 8;

            data.transforms[i8 + 0] = transform.data[0];
            data.transforms[i8 + 1] = transform.data[1];
            data.transforms[i8 + 2] = transform.data[2];
            data.transforms[i8 + 3] = transform.data[3];
            data.transforms[i8 + 4] = transform.data[4];
            data.transforms[i8 + 5] = transform.data[5];
            data.transforms[i8 + 6] = transform.data[6];
            data.transforms[i8 + 7] = transform.data[7];

            data.transformCount++;
            batch.transformCount++;
        }

        // 引用最新应用的变换矩阵
        let transformIndex = data.transformCount - 1;

        // 应用最新图形路径设置
        if (path.applied == false) {
            path.applied = true;

            const offset = data.geometryCount * 4;
            const count = path.geometryCount * 4;

            for (let i = 0; i < count; i++) {
                data.geometries[offset + i] = path.geometries[i];
            }

            data.geometryCur = data.geometryCount;
            data.geometryCount += path.geometryCount;
            batch.geometryCount += path.geometryCount;
        }

        // 引用最新应用的图形路径几何数据
        let geometryBeg = data.geometryCur;
        let geometryEnd = data.geometryCount;
        let geometryType = path.type;
        let geometryMask = path.Mask(transform.data);

        // 添加填充样式实例的使用
        let fillStyle = batch.styleLut[data.fillStyle.id];
        if (fillStyle == undefined) {
            fillStyle = data.styleCount;

            batch.styleLut[data.fillStyle.id] = fillStyle;
            data.styles[fillStyle] = data.fillStyle;

            batch.styleCount++;
            data.styleCount++;
        }

        // 添加描边样式实例的使用
        let strokeStyle = batch.styleLut[data.strokeStyle.id];
        if (strokeStyle == undefined) {
            strokeStyle = data.styleCount;

            batch.styleLut[data.strokeStyle.id] = strokeStyle;
            data.styles[strokeStyle] = data.strokeStyle;

            batch.styleCount++;
            data.styleCount++;
        }

        // 当前实例索引
        let instance = data.instanceCount;
        // 当前线条宽度
        let lineWidth = data.lineWidth;

        transformIndex -= batch.transformsOffset;
        geometryBeg -= batch.geometriesOffset;
        geometryEnd -= batch.geometriesOffset;
        fillStyle -= batch.stylesOffset;
        strokeStyle -= batch.stylesOffset;

        // ======================-------------------------------

        let instance_nx = 0;
        {
            /*/
            geometry_beg:   10
            geometry_end:   10
            transform:      10
            draw_mode:      2
            /*/

            instance_nx += (drawMode & 0x3) << 30;
            instance_nx += (transformIndex & 0x3FF) << 20;
            instance_nx += (geometryEnd & 0x3FF) << 10;
            instance_nx += (geometryBeg & 0x3FF) << 0;
        }

        let instance_ny = 0;
        {
            /*/
            fill_style:     10
            stroke_tyle:    10
            line_width:     8
            geometry_type:  4
            /*/

            instance_ny += (geometryType & 0xF) << 28;
            instance_ny += (lineWidth & 0xFF) << 20;
            instance_ny += (strokeStyle & 0x3FF) << 10;
            instance_ny += (fillStyle & 0x3FF) << 0;
        }

        let instance_nz = 0;
        {
            /*/
            保留字段
            /*/
        }

        let instance_nw = 0;
        {
            /*/
            将画布划分为8 * 4 = 32个区块，如果图形影响到某区块，标记区块对应二进制位。以此提升着色器填充效率
            /*/

            instance_nw = geometryMask;
        }

        data.instances[instance * 4 + 0] = instance_nx;
        data.instances[instance * 4 + 1] = instance_ny;
        data.instances[instance * 4 + 2] = instance_nz;
        data.instances[instance * 4 + 3] = instance_nw;

        data.instanceCount++;
        batch.instanceCount++;

        // 更新批次数据
        {
            data.instances[batch.instancesOffset * 4 + 0] |= geometryMask;
            data.instances[batch.instancesOffset * 4 + 1] = batch.instanceCount;
        }
    }

    /**
     * 直接渲染画布到网格。
     * @param queue 渲染队列。
     * @param method 渲染方法。
     * @param params 渲染参数。
     */
    public Draw(queue: Miaoverse.DrawQueue, method: string, params: number[]) {
        if (this.data.frameTS != this.renderer.frameTS) {
            return;
        }

        const device = this.renderer["_global"].device;
        const context = this.renderer["_global"].context;
        const data = this.renderer["_drawData"];
        const buffer = device.GetBuffer(data.bufferID);

        if (!buffer) {
            return;
        }

        const offset0 = data.instances.byteOffset + this.data.instancesOffset * 16;
        const offset1 = data.styles.byteOffset + this.data.stylesOffset * 32;
        const offset2 = data.transforms.byteOffset + this.data.transformsOffset * 32;
        const offset3 = data.geometries.byteOffset + this.data.geometriesOffset * 16;

        for (let batch of this.data.batches) {
            const offsets = [
                offset0 + batch.instancesOffset * 16,
                offset1 + batch.stylesOffset * 32,
                offset2 + batch.transformsOffset * 32,
                offset3 + batch.geometriesOffset * 16
            ];

            const binding_key = `${data.capacity}-${offsets[0]}-${offsets[1]}-${offsets[2]}-${offsets[3]}`;

            if (batch.binding_key != binding_key) {
                const entries: GPUBindGroupEntry[] = [];

                for (let i = 0; i < 4; i++) {
                    entries.push({
                        binding: i,
                        resource: {
                            buffer: buffer.buffer,
                            offset: offsets[i],
                            size: 16384
                        }
                    });
                }

                const binding = context.CreateBindGroupCustom(queue.activeG2, entries);

                if (!binding) {
                    continue;
                }

                batch.binding_key = binding_key;
                batch.binding = binding.binding;
            }

            queue.passEncoder.setBindGroup(3, batch.binding);

            if (method == "drawIndexed") {
                queue.passEncoder.drawIndexed(
                    params[0],  // indexCount
                    params[1],  // instanceCount
                    params[2],  // firstIndex
                    params[3],  // baseVertex
                    params[4],  // firstInstance
                );
            }
            else if (method == "draw") {
                queue.passEncoder.draw(
                    params[0],  // vertexCount
                    params[1],  // instanceCount
                    params[2],  // firstVertex
                    params[3],  // firstInstance
                );
            }
        }
    }

    // CanvasRenderingContext2D =================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/canvas)
     */
    public get canvas(): HTMLCanvasElement {
        throw "TODO: Canvas.canvas!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getContextAttributes)
     */
    public getContextAttributes(): CanvasRenderingContext2DSettings {
        throw "TODO: Canvas.getContextAttributes!";
    }

    // CanvasCompositing ========================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalAlpha)
     */
    public set globalAlpha(value) {
        throw "TODO: Canvas.globalAlpha!";
    }
    public get globalAlpha(): number {
        throw "TODO: Canvas.globalAlpha!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
     */
    public set globalCompositeOperation(value) {
        throw "TODO: Canvas.globalCompositeOperation!";
    }
    public get globalCompositeOperation(): GlobalCompositeOperation {
        throw "TODO: Canvas.globalCompositeOperation!";
    }

    // CanvasDrawImage ==========================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawImage)
     */
    public drawImage(image: CanvasImageSource, dx_or_sx: number, dy_or_sy: number, dw_or_sw?: number, dh_or_sh?: number, dx?: number, dy?: number, dw?: number, dh?: number): void {
        throw "TODO: Canvas.drawImage!";
    }

    // CanvasDrawPath ===========================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/beginPath)
     */
    public beginPath(): void {
        throw "TODO: Canvas.beginPath!";
    }

    /**
     * 将当前创建的路径设置为当前剪切路径的方法。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clip)
     */
    public clip(path_or_rule: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void {
        throw "TODO: Canvas.clip!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fill)
     */
    public fill(path_or_rule?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void {
        if (path_or_rule) {
            throw "TODO: Canvas.fill!";
        }

        if (!this.data.path) {
            return;
        }

        this.Flush(1);
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInPath)
     */
    public isPointInPath(path_or_x: Path2D | number, x_or_y: number, y_or_rule: number | CanvasFillRule, fillRule?: CanvasFillRule): boolean {
        throw "TODO: Canvas.fillStyle!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/isPointInStroke)
     */
    public isPointInStroke(path_or_x: Path2D, x_or_y: number, y?: number): boolean {
        throw "TODO: Canvas.isPointInStroke!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/stroke)
     */
    public stroke(path?: Path2D): void {
        if (path) {
            throw "TODO: Canvas.stroke!";
        }

        if (!this.data.path) {
            return;
        }

        this.Flush(2);
    }

    // CanvasFillStrokeStyles ===================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillStyle)
     */
    public set fillStyle(value) {
        if (typeof value == "string") {
            this.data.fillStyle = this.renderer.CreateStyle2D(value);
        }
    }
    public get fillStyle(): string | CanvasGradient | CanvasPattern {
        throw "TODO: Canvas.fillStyle!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeStyle)
     */
    public set strokeStyle(value) {
        if (typeof value == "string") {
            this.data.strokeStyle = this.renderer.CreateStyle2D(value);
        }
    }
    public get strokeStyle(): string | CanvasGradient | CanvasPattern {
        throw "TODO: Canvas.strokeStyle!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createConicGradient)
     */
    public createConicGradient(startAngle: number, x: number, y: number): CanvasGradient {
        throw "TODO: Canvas.createConicGradient!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)
     */
    public createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
        throw "TODO: Canvas.createLinearGradient!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createPattern)
     */
    public createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null {
        throw "TODO: Canvas.createPattern!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createRadialGradient)
     */
    public createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
        throw "TODO: Canvas.createRadialGradient!";
    }

    // CanvasFilters ============================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/filter)
     */
    public set filter(value) {
        throw "TODO: Canvas.filter!";
    }
    public get filter(): string {
        throw "TODO: Canvas.filter!";
    }

    // CanvasImageData ==========================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createImageData)
     */
    public createImageData(sw_or_imagedata: number | ImageData, sh?: number, settings?: ImageDataSettings): ImageData {
        throw "TODO: Canvas.createImageData!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getImageData)
     */
    public getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData {
        throw "TODO: Canvas.getImageData!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/putImageData)
     */
    public putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void {
        throw "TODO: Canvas.putImageData!";
    }

    // CanvasImageSmoothing =====================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled)
     */
    public set imageSmoothingEnabled(value) {
        throw "TODO: Canvas.imageSmoothingEnabled!";
    }
    public get imageSmoothingEnabled(): boolean {
        throw "TODO: Canvas.imageSmoothingEnabled!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality)
     */
    public set imageSmoothingQuality(value) {
        throw "TODO: Canvas.imageSmoothingQuality!";
    }
    public get imageSmoothingQuality(): ImageSmoothingQuality {
        throw "TODO: Canvas.imageSmoothingQuality!";
    }

    // CanvasPath ===============================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arc)
     */
    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
        const path = new Path2D();

        path.Arc(x, y, radius, startAngle, endAngle);

        this.data.path = path;
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arcTo)
     */
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
        throw "TODO: Canvas.arcTo!";
    }

    /**
     *  绘制三次贝赛尔曲线路径的方法。该方法需要三个点。第一、第二个点是控制点，第三个点是结束点。起始点是当前路径的最后一个点，绘制贝赛尔曲线前，可以通过调用 moveTo() 进行修改。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
     */
    public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
        throw "TODO: Canvas.bezierCurveTo!";
    }

    /**
     * 将笔点返回到当前子路径起始点的方法。它尝试从当前点到起始点绘制一条直线。如果图形已经是封闭的或者只有一个点，那么此方法不会做任何操作。
     * 不调用路径可能未闭合。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/closePath)
     */
    public closePath(): void {
        throw "TODO: Canvas.closePath!";
    }

    /**
     * 添加椭圆路径的方法。椭圆的圆心在（x,y）位置，半径分别是radiusX 和 radiusY，按照anticlockwise（默认顺时针）指定的方向，从 startAngle 开始绘制，到 endAngle 结束。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/ellipse)
     */
    public ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
        throw "TODO: Canvas.ellipse!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineTo)
     */
    public lineTo(x: number, y: number): void {
        throw "TODO: Canvas.lineTo!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/moveTo)
     */
    public moveTo(x: number, y: number): void {
        throw "TODO: Canvas.moveTo!";
    }

    /**
     * 新增二次贝塞尔曲线路径的方法。它需要 2 个点。第一个点是控制点，第二个点是终点。起始点是当前路径最新的点，当创建二次贝赛尔曲线之前，可以使用 moveTo() 方法进行改变。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo)
     */
    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        throw "TODO: Canvas.quadraticCurveTo!";
    }

    /**
     * 创建矩形路径。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rect)
     */
    public rect(x: number, y: number, w: number, h: number): void {
        const path = new Path2D();

        path.Rect(x, y, w, h);

        this.data.path = path;
    }

    /**
     * 创建圆角矩形路径。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/roundRect)
     */
    public roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]): void {
        const path = new Path2D();

        path.RoundRect(x, y, w, h, radii as number);

        this.data.path = path;
    }

    // CanvasPathDrawingStyles ==================--------------------------------------------------

    /**
     * 指示如何绘制线段末端。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineCap)
     */
    public set lineCap(value) {
        throw "TODO: Canvas.lineCap!";
    }
    public get lineCap(): CanvasLineCap {
        throw "TODO: Canvas.lineCap!";
    }

    /**
     * 虚线交替起始偏移，依此可实现动画效果。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
     */
    public set lineDashOffset(value) {
        throw "TODO: Canvas.lineDashOffset!";
    }
    public get lineDashOffset(): number {
        throw "TODO: Canvas.lineDashOffset!";
    }

    /**
     * 描述两线段连接属性。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineJoin)
     */
    public set lineJoin(value) {
        throw "TODO: Canvas.lineJoin!";
    }
    public get lineJoin(): CanvasLineJoin {
        throw "TODO: Canvas.lineJoin!";
    }

    /**
     * 线宽。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/lineWidth)
     */
    public set lineWidth(value) {
        this.data.lineWidth = value;
    }
    public get lineWidth(): number {
        throw "TODO: Canvas.lineWidth!";
    }

    /**
     * 当两条线段以尖角相交时，如果尖角的长度超过 miterLimit 的值，尖角会被切断，转而使用斜角（bevel join）来绘制。这可以防止尖角过长，导致视觉上的不美观。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/miterLimit)
     */
    public set miterLimit(value) {
        throw "TODO: Canvas.miterLimit!";
    }
    public get miterLimit(): number {
        throw "TODO: Canvas.miterLimit!";
    }

    /**
     * 获取虚线交替长度。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getLineDash)
     */
    public getLineDash(): number[] {
        throw "TODO: Canvas.getLineDash!";
    }

    /**
     * 设置虚线交替长度。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash)
     */
    public setLineDash(segments: number[]): void {
        throw "TODO: Canvas.setLineDash!";
    }

    // CanvasRect ===============================--------------------------------------------------

    /**
     * 清除一个矩形区域为黑色透明颜色。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clearRect)
     */
    public clearRect(x: number, y: number, w: number, h: number): void {
        throw "TODO: Canvas.clearRect!";
    }

    /**
     * 填充矩形。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillRect)
     */
    public fillRect(x: number, y: number, w: number, h: number): void {
        const path = new Path2D();

        path.Rect(x, y, w, h);

        this.data.path = path;

        this.Flush(1);
    }

    /**
     * 描边，线宽向基线两边延展。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeRect)
     */
    public strokeRect(x: number, y: number, w: number, h: number): void {
        const path = new Path2D();

        path.Rect(x, y, w, h);

        this.data.path = path;

        this.Flush(2);
    }

    // CanvasShadowStyles =======================--------------------------------------------------

    /**
     * 描述模糊效果程度的属性；它既不对应像素值也不受当前转换矩阵的影响。默认值是 0。，浮动值，单位没有含义
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowBlur)
     */
    public set shadowBlur(value) {
        throw "TODO: Canvas.shadowBlur!";
    }
    public get shadowBlur(): number {
        throw "TODO: Canvas.shadowBlur!";
    }

    /**
     * 阴影颜色，不透明，阴影才会被绘制。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowColor)
     */
    public set shadowColor(value) {
        throw "TODO: Canvas.shadowColor!";
    }
    public get shadowColor(): string {
        throw "TODO: Canvas.shadowColor!";
    }

    /**
     * 描述阴影垂直偏移距离的属性。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX)
     */
    public set shadowOffsetX(value) {
        throw "TODO: Canvas.shadowOffsetX!";
    }
    public get shadowOffsetX(): number {
        throw "TODO: Canvas.shadowOffsetX!";
    }

    /**
     * 描述阴影垂直偏移距离的属性。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY)
     */
    public set shadowOffsetY(value) {
        throw "TODO: Canvas.shadowOffsetY!";
    }
    public get shadowOffsetY(): number {
        throw "TODO: Canvas.shadowOffsetY!";
    }

    // CanvasState ==============================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/restore)
     */
    public restore(): void {
        throw "TODO: Canvas.restore!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/save)
     */
    public save(): void {
        throw "TODO: Canvas.save!";
    }

    // CanvasText ===============================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillText)
     */
    public fillText(text: string, x: number, y: number, maxWidth?: number): void {
        const path = new Path2D();

        path.Text(text, x, y, maxWidth, {
            em_font_size: this.renderer["_rem_font_size"],
            glyphs: this.renderer["_font_glyphs_lut"],
            atlas: this.renderer["_font_atlas"],
            canvas_width: this.data.width,
            canvas_height: this.data.height
        });

        this.data.path = path;

        this.Flush(1);
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/measureText)
     */
    public measureText(text: string): TextMetrics {
        throw "TODO: Canvas.measureText!";
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/strokeText)
     */
    public strokeText(text: string, x: number, y: number, maxWidth?: number): void {
        throw "TODO: Canvas.strokeText!";
    }

    // CanvasTextDrawingStyles ==================--------------------------------------------------

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/direction)
     */
    public set direction(value) {
        throw "TODO: Canvas.direction!";
    }
    public get direction(): CanvasDirection {
        throw "TODO: Canvas.direction!";
        return null;
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/font)
     */
    public set font(value) {
        throw "TODO: Canvas.font!";
    }
    public get font(): string {
        throw "TODO: Canvas.font!";
        return null;
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fontKerning)
     */
    public set fontKerning(value) {
        throw "TODO: Canvas.fontKerning!";
    }
    public get fontKerning(): CanvasFontKerning {
        throw "TODO: Canvas.fontKerning!";
        return null;
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textAlign)
     */
    public set textAlign(value) {
        throw "TODO: Canvas.textAlign!";
    }
    public get textAlign(): CanvasTextAlign {
        throw "TODO: Canvas.textAlign!";
        return null;
    }

    /**
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     */
    public set textBaseline(value) {
        throw "TODO: Canvas.textBaseline!";
    }
    public get textBaseline(): CanvasTextBaseline {
        throw "TODO: Canvas.textBaseline!";
        return null;
    }

    // CanvasTransform ==========================--------------------------------------------------

    /**
     * 获取当前被应用到上下文的转换矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getTransform)
     */
    public getTransform(): DOMMatrix {
        const a = this.data.transform.data[0];
        const b = this.data.transform.data[1];
        const c = this.data.transform.data[2];
        const d = this.data.transform.data[3];
        const e = this.data.transform.data[4];
        const f = this.data.transform.data[5];

        return { a, b, c, d, e, f } as any;
    }

    /**
     * 重新设置当前变形为单位矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/resetTransform)
     */
    public resetTransform(): void {
        this.setTransform(1, 0, 0, 1, 0, 0);
    }

    /**
     * 在当前变换矩阵中增加旋转的方法（角度变量表示一个顺时针旋转角度并且用弧度表示）。
     * 执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rotate)
     */
    public rotate(angle: number): void {
        /*/
        a:cos c:-sin e:0
        b:sin d: cos f:0
        0     0      1
        /*/

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        this.transform(cos, sin, -sin, cos, 0, 0);
    }

    /**
     * 画布默认单位是1像素，如果设置缩放为0.5，则单位是0.5像素。
     * 执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/scale)
     */
    public scale(x: number, y: number): void {
        /*/
        a:x c:0 e:0
        b:0 d:y f:0
        0   0   1
        /*/

        this.transform(x, 0, 0, y, 0, 0);
    }

    /**
     * 重设变换矩阵（注意不是叠加的）。
     * 默认情况下，变换按以下顺序应用：缩放、旋转、平移。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setTransform)
     */
    public setTransform(a_or_transform?: number | DOMMatrix2DInit, b?: number, c?: number, d?: number, e?: number, f?: number): void {
        this.data.transform.applied = false;

        if (a_or_transform == undefined) {
            this.data.transform.data[0] = 1;
            this.data.transform.data[1] = 0;
            this.data.transform.data[2] = 0;
            this.data.transform.data[3] = 1;
            this.data.transform.data[4] = 0;
            this.data.transform.data[5] = 0;
            this.data.transform.data[6] = this.data.width;
            this.data.transform.data[7] = this.data.height;
        }
        else if (typeof a_or_transform == "number") {
            this.data.transform.data[0] = a_or_transform;
            this.data.transform.data[1] = b;
            this.data.transform.data[2] = c;
            this.data.transform.data[3] = d;
            this.data.transform.data[4] = e;
            this.data.transform.data[5] = f;
            this.data.transform.data[6] = this.data.width;
            this.data.transform.data[7] = this.data.height;
        }
        else {
            this.data.transform.data[0] = a_or_transform.a;
            this.data.transform.data[1] = a_or_transform.b;
            this.data.transform.data[2] = a_or_transform.c;
            this.data.transform.data[3] = a_or_transform.d;
            this.data.transform.data[4] = a_or_transform.e;
            this.data.transform.data[5] = a_or_transform.f;
            this.data.transform.data[6] = this.data.width;
            this.data.transform.data[7] = this.data.height;
        }
    }

    /**
     * 设置叠加变换（注意变换是叠加的）。
     * 这个方法可以用来同时进行缩放、旋转、平移和倾斜（注意倾斜的概念）。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/transform)
     */
    public transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
        /*/
        A C E   a c e   (Aa + Cb) (Ac + Cd) (Ae + Cf + E)
        B D F * b d f = (Ba + Db) (Bc + Dd) (Be + Df + F)
        0 0 1   0 0 1   (   0   ) (   0   ) (     1     )

        坐标变换 = [Ax + Cy + E, Bx + Dy + F]

        A、D控制缩放和旋转
        B、C控制倾斜
        E、F控制平移
        /*/

        // 当前变换矩阵的元素
        const cur = this.getTransform();

        // 计算新的变换矩阵
        const a_ = cur.a * a + cur.c * b;
        const b_ = cur.b * a + cur.d * b;
        const c_ = cur.a * c + cur.c * d;
        const d_ = cur.b * c + cur.d * d;
        const e_ = cur.a * e + cur.c * f + cur.e;
        const f_ = cur.b * e + cur.d * f + cur.f;

        // 设置新的变换矩阵
        this.setTransform(a_, b_, c_, d_, e_, f_);
    }

    /**
     * 平移画布空间。
     * 执行translate、rotate、scale的顺序由我们的调用顺序决定，每次调用都会叠加之前执行的效果，因此注意清除当前矩阵。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/translate)
     */
    public translate(x: number, y: number): void {
        /*/
        a:0 c:0 e:x
        b:0 d:0 f:y
        0   0   1
        /*/

        this.transform(0, 0, 0, 0, x, y);
    }

    // CanvasUserInterface ======================--------------------------------------------------

    /**
     * 如果指定HTML元素处于焦点状态，绘制当前PATH或指定PATH。
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawFocusIfNeeded)
     */
    public drawFocusIfNeeded(path_or_element: Path2D | Element, element?: Element): void {
        throw "TODO: Canvas.drawFocusIfNeeded!";
    }

    // ==========================================--------------------------------------------------

    /** 2D渲染器实例。 */
    public renderer: Renderer2D;

    /** 2D绘制接口实例数据。 */
    public data: {
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

/**
 * 字体图集字符布局数据查找表。
 * https://github.com/Chlumsky/msdf-atlas-gen
 */
export interface FontAtlas {
    /**
     * 图集纹理的元数据。
     */
    atlas: {
        /**
         * 距离场的类型。
         */
        type: string;
        /**
         * 距离场精确的像素范围。
         */
        distanceRange: number;
        /**
         * 距离场像素范围中值。
         */
        distanceRangeMiddle: number;
        /**
         * 在图集纹理中保存字形信息时，1em对应的纹理像素数量。
         */
        size: number;
        /**
         * 图集纹理的宽度。
         */
        width: number;
        /**
         * 图集纹理的高度。
         */
        height: number;
        /**
         * 图集纹理的起始行在底部还是顶部。
         */
        yOrigin: "bottom" | "top";
    };
    /**
     * 定义应用于所有字符的全局字体度量。
     */
    metrics: {
        /**
         * 字形的轮廓信息是基于字体设计单位（EM）的。
         * 为了将这些值转换为可用于渲染的坐标，通常需要将这些单位转换为像素单位。
         * 这个转换取决于字体的unitsPerEm和目标渲染的尺寸。
         * 1em等于多少像素取决于使用的字体大小。em是一个相对单位，其值基于当前字体的font-size。
         * 如果当前font-size为16像素：1em = 16px；
         * h1 { font-size: 20px } 1em == 20px
         * p { font - size: 16px } 1em == 16px
         * h1 { font-size: 2em } 这里的h1元素字体像素大小根据父级的font-size决定，大多数浏览器的默认font-size为16像素；
         * 相对根元素字体大小的设置rem，h1 { font-size: 2rem }；
         * 如果属性尺寸要根据元素字体进行缩放（比如字间距），则使用em，否则使用rem是比较好的设计思路。
         * https://zhuanlan.zhihu.com/p/37956549
         */
        emSize: number;
        /**
         * 两行文本的基线之间的垂直距离。
         * 字形的轮廓通常相对于基线来定义，基线是字体中字符对齐的参考线。
         * 通常，字母的底部在基线上。
         * 字形的top和bottom值表示的是字形最高点和最低点相对于基线的距离。
         */
        lineHeight: number;
        /**
         * 超出基线的字形最大高度。
         */
        ascender: number;
        /**
         * 低于基线的字形最大深度。
         */
        descender: number;
        /**
         * 相对于基线的下划线位置。
         */
        underlineY: number;
        /**
         * 相对于基线的下划线厚度。
         */
        underlineThickness: number;
    },
    /**
     * 包含图集中每个字形（字符）信息的数组。
     */
    glyphs: {
        /**
         * 字形的Unicode编码。
         */
        unicode: number;
        /**
         * 渲染字形后水平前进的距离，用于定位下一个字形。
         */
        advance: number;
        /**
         * 描述字形在字体设计单位中的边界框（相对于基线，以EM为单位）。
         * X原点位于光标位置。
         */
        planeBounds: {
            left: number;
            bottom: number;
            right: number;
            top: number;
        };
        /**
         * 字形在图集纹理中的边界框。
         */
        atlasBounds: {
            left: number;
            bottom: number;
            right: number;
            top: number;
        };
    }[];
    /**
     * 解析后字形数据查找表。
     */
    lut?: Record<number, number[]>;
}


/*/

canvas 原点在左上角
fillText(text: string, x: number, y: number, maxWidth?: number): void;
文本根据 font、textAlign、textBaseline 和 direction 属性所定义的字体和文本布局来渲染。
开始横向坐标，起始光标位置，每绘制一个字偏移一次光标
开始绘制文本的基线的 Y 轴坐标，单位为像素。
文本渲染后的最大像素宽度。如果未指定，则文本宽度没有限制。
font 使用rem或em作为单位
textAlign 
对齐是相对于fillText方法的x值的
如果textAlign是"center"，那么该文本的左侧边界会是x - (textWidth / 2)
"start"、"end"依赖文本方向
textBaseline
"alphabetic"
文本基线是标准的字母基线。默认值。仅支持这个
direction
从左向右还是从右向左

定义X，定义Y，Y是基线位置，X逐字推进
根据ascender、descender定义行的上限和下限
换行是每次偏移lineHeight
所有计算都以emSize * font_size为单位
起始X偏移1个

        const rem_font_size = 16;

        for (let i = 0; i < 6; i++) {
            const glyph = this._font_glyphs_lut.glyphs[3];

            // 计算出插值点，在atlasBounds的left、right，bottom，top插值出采样像素点
            // 当前填充左下角像素点，像素宽高

            // 包围框在左下角
            //const top = 
        }

        //c
        //const em_font_size
        //Text(, maxWidth ?: number)


        let n = "伴"//20276
        console.error(n.charCodeAt(0));

m_nMode:4
m_nCount:4

m_nStart:16 + m_nEnd: 16
m_mPoint0: U32
m_mPoint1: U32

++++当前画布变换矩阵，画布变换矩阵索引
字体样式索引
裁剪区域
阴影处理
边线与虚线
射线与贝塞尔曲线交点

圆弧连接 - 贝塞尔曲线链接

ui_instances: 16384 / 16 = 1024
ui_tyles: 16384 / 32 = 512
ui_transforms: 16384 / 24 = 682
ui_geometries: 16字节对齐
 16 + 8
 16 + 8
 // 48

// 批次
// 实例缓存满，样式缓存满、变换组件满、几何缓存满



// 16,384，682个实例
// 6个浮点型，
// 24，2,730个实例
// 8 * 4 = 32 16384 / 32
使用填充矩形法绘制多边形和文字
文字使用SDF字体描述填充
多边形填充使用射线法判断像素点是否在多边形内部
使用实例绘制，每个实例绘制3个顶点，每个实例填充1个多边形或1个文字
使用3个缓存辅助绘制：
1.几何缓存：每个UINT存储一个像素坐标点，常量缓存限制65536，最多存储16384个像素点
2.材质缓存：材质可共享
3.实例缓存：多边形类型，多边形起始顶点、多边形顶点数量、材质索引

贴图可以存储更多数据：但贴图采样慢，可以使用最快的贴图采样方法
：类型枚举
：绘制

多画布
画布间拷贝

贝塞尔曲线不能填充


标准网格渲染器
标准网格绘制逻辑
调用canvas绘制方法，我们基于网格的UV填充UI
多次绑定G4并多次绘制，这是在模型表面绘制的方案
如果存粹后期绘制，参考Dioramas_3mx实现

实例数组
common/miaoverse/shader/billboard.vertex.glsl

/*/
