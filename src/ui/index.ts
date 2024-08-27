import * as Miaoverse from "../mod.js"

/** UI系统。 */
export class CalynUI {
    /**
     * 构造函数。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;

        this.show_id_color = false;
        this.highlight_id = undefined;

        this._elementList = [null];
        this._createrLut = {};

        this._createrLut["Canvas"] = { type: "canvas", creater: Canvas };
        this._createrLut["Panel"] = { type: "panel", creater: Panel };
        this._createrLut["Component_image"] = { type: "component", creater: Component_image };
        this._createrLut["Component_text"] = { type: "component", creater: Component_text };
        this._createrLut["Component_button"] = { type: "component", creater: Component_button };
        this._createrLut["Component_echart"] = { type: "component", creater: Component_echart };
        this._createrLut["Layout_grid"] = { type: "layout", creater: Layout_grid };
        this._createrLut["Layout_vert_list"] = { type: "layout", creater: Layout_vert_list };
        this._createrLut["Layout_frame_1"] = { type: "layout", creater: Layout_frame_1 };

        //this.InitEventSystem();
    }

    /**
     * 初始化UI系统。
     * @returns 返回UI系统接口。
     */
    public async Init() {
        return this;
    }

    /**
     * 初始化UI事件系统。
     */
    public InitEventSystem() {
        const system = this;

        const pointer_event_names = ["click", "dblclick", "mousewheel", "wheel", "pointerout", "pointerup", "pointerdown", "pointermove", "contextmenu"];

        let pointerdown_target: ReturnType<Canvas["Hit"]>[0] = null;

        for (let name_ of pointer_event_names) {
            const name = name_;

            system._global.app.AddEventListener(name, async (event: any) => {
                const hits = system.canvas.Hit(event.layerX, event.layerY);

                if (hits.length > 0) {
                    const target = hits[hits.length - 1];
                    const dom = (target.element as any)._dom;

                    if (dom) {
                        const proxy = (target.element as any)._echart.getZr().handler.proxy;
                        const handler = proxy._localHandlerScope.domHandlers;

                        // 设置这两个坐标（通过分析源码得知）
                        event.zrX = Math.floor(target.x * dom.width);
                        event.zrY = Math.floor(target.y * dom.height);

                        // 以为我们提供了zrX，所以原实现跳过了一些步骤，有问题请查看ECharts源码
                        if (name == "wheel" || name == "mousewheel") {
                            const wheelDelta = event.wheelDelta;
                            event.zrDelta = wheelDelta ? wheelDelta / 120 : -(event.detail || 0) / 3;
                        }

                        // 注意，事件响应有顺序关联影响，如果在按下和弹起之间图表重新setOption，会导致命中的元素ID不同，从而忽略单击事件
                        handler[name].call(proxy, event);

                        // TODO：应使用计时器刷新画面，绘制有一定延迟，并且我们可以不使用动画来节省性能
                        // ...
                    }
                }

                if (name == "pointerdown") {
                    pointerdown_target = hits.length > 0 ? hits[hits.length - 1] : null;
                }
                else if (name == "pointermove") {
                    if (pointerdown_target) {
                        const devicePixelRatio = window.devicePixelRatio || 1;
                        const width = system.canvas.width.width;
                        const height = system.canvas.height.height;

                        pointerdown_target.element.OnDrag(width, height, event);
                    }
                }
                else {
                    pointerdown_target = null;
                }

                if (pointerdown_target) {
                    //system.show_id_color = true;
                    system.highlight_id = pointerdown_target.element.id;
                }
                else {
                    //system.show_id_color = false;
                    system.highlight_id = 0;
                }
            });
        }
    }

    /**
     * 拖拽式往面板中添加子元素。
     * @param x 添加位置。
     * @param y 添加位置。
     * @param type 元素构造器类型。
     * @param option 元素初始化配置。
     */
    public DropAdd(x: number, y: number, type: string, option?: Options) {
        const hits = this.canvas.Hit(x, y);
        if (hits.length > 0) {
            const parent: Panel = hits[hits.length - 1] as any;
            if (parent.type == "panel") {
                parent.AddChild(option);
            }
        }
    }

    /**
     * 创建元素实例。
     * @param option 元素初始化配置。
     */
    public CreateElement<T extends Element>(canvas: Canvas, option: Options) {
        const creater = this._createrLut[option.creator];
        if (!creater) {
            console.error("未注册元素构造器类型：", option.creator);
            return null;
        }

        const id = this._elementList.length;

        this._elementList.push(null);
        const element = new creater.creater(this, canvas, id, option);
        this._elementList[id] = element;

        element["_type"] = creater.type;

        return element as T;
    }

    /**
     * 绘制指定画布内容到指定窗口的指定矩形区域。
     * @param canvas 指定画布。
     * @param window 指定窗口。
     * @param renderer 指定窗口渲染器。
     * @param rect 指定矩形区域。
     * @param aspectMode 画布宽高比约束模式。
     */
    public async Draw(canvas: Canvas, window?: HTMLCanvasElement, renderer?: CanvasRenderingContext2D, rect?: number[]) {
        return canvas.Update({
            bg_fill: false,
            bg_fill_color: "#0958d9",
            bg_stroke: false,
            bg_stroke_color: "white",
            bg_stroke_width: 1,
            bg_stroke_dash: 2,
            bg_radii: 6,

            font: "Arial",
            font_size: 24,
            font_color: "white",
        }, window, renderer, rect);
    }

    /** 当前UI画布。 */
    public get canvas() {
        return this._canvas;
    }
    public set canvas(_canvas: Canvas) {
        this._canvas = _canvas;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;

    /** 是否显示元素颜色标识（编辑模式使用）。 */
    public show_id_color: boolean;
    /** 需高亮提示的元素ID（编辑模式使用）。 */
    public highlight_id: number;

    /** 当前UI画布。 */
    protected _canvas: Canvas;

    /** UI元素实例列表。 */
    protected _elementList: Element[];
    /** UI元素实例构造器查找表。 */
    protected _createrLut: Record<string, {
        /** 构造器构造实例类型。 */
        type: "canvas" | "panel" | "layout" | "component";
        /** 构造方法。 */
        creater: (new (system: CalynUI, canvas: Canvas, id: number, option?: Options) => Element);
    }>;
}

/** UI元素基类。 */
export class Element {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Element["_options"]) {
        this._system = system;
        this._canvas = canvas;
        this._parent = null;
        this._children = [];

        const i = Math.floor(id % 10);
        const j = Math.floor(id / 10) % 10;
        const k = Math.floor(id / 100);

        this._id = id;
        this._id_color = `rgba(${255 - 25 * i}, ${255 - 25 * j}, ${255 - 25 * k}, 0.5)`;
        this._type = undefined;
        this._active = true;
        this._rect = [0, 0, 64, 64];

        this._updateTS = 0;
        this._currentTS = -1;
        this._parentTS = -1;

        this._width = {
            timestrap: -1,
            width: 64,
            occ_width: 64
        };

        this._height = {
            timestrap: -1,
            height: 64,
            occ_height: 64
        };

        this._scroll = undefined;

        this._options = {};
        this._options.guid = options.guid || /*this._system._global.env.guidGet()*/"";
        this._options.enable_scroll = options.enable_scroll || false;
        this._options.aspect_mode = options.aspect_mode || "none";
        this._options.aspect_ratio = options.aspect_ratio || 1;
        this._options.horiz_align = options.horiz_align || "left";
        this._options.vert_align = options.vert_align || "top";
        this._options.auto_width = options.auto_width || false;
        this._options.auto_height = options.auto_height || false;
        this._options.x = options.x === undefined ? 0 : options.x;
        this._options.y = options.y === undefined ? 0 : options.y;
        this._options.z = options.z === undefined ? (this._options.horiz_align == "stretch" ? 0 : 64) : options.z;
        this._options.w = options.w === undefined ? (this._options.vert_align == "stretch" ? 0 : 64) : options.w;

        this._options.style = {
            bg_fill: false,
            bg_stroke: false,
            ...options.style
        };

        if (this._options.aspect_mode == "fit_in" || this._options.aspect_mode == "fit_out") {
            this._options.horiz_align = "stretch";
            this._options.vert_align = "stretch";

            this._options.x = 0;
            this._options.y = 0;
            this._options.z = 0;
            this._options.w = 0;
        }

        if (options.children) {
            for (let child of options.children) {
                this.AddChild(child);
            }
        }
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        const parent = this._parent;

        if (!this.active || !parent.active) {
            return false;
        }

        this._style = style = { ...style, ...this.style };

        if (this._parentTS != parent._currentTS) {
            this._parentTS = parent._currentTS;
            this._updateTS++;
        }

        const width = this.width.width;
        const height = this.height.height;

        if (this._currentTS != this._updateTS) {
            this._currentTS = this._updateTS;

            const options = this._options;
            const rect = [0, 0, width, height];

            if (options.horiz_align == "center") {
                rect[0] = parent._rect[0] + parent._rect[2] * 0.5 - rect[2] * 0.5 + options.x;
            }
            else if (options.horiz_align == "right") {
                rect[0] = parent._rect[0] + parent._rect[2] - rect[2] - options.x;
            }
            else if (options.aspect_mode == "fit_in" || options.aspect_mode == "fit_out") {
                rect[0] = parent._rect[0] + (parent._rect[2] - rect[2]) * 0.5;
            }
            else {
                rect[0] = parent._rect[0] + options.x;
            }

            if (options.vert_align == "center") {
                rect[1] = parent._rect[1] + parent._rect[3] * 0.5 - rect[3] * 0.5 + options.y;
            }
            else if (options.vert_align == "bottom") {
                rect[1] = parent._rect[1] + parent._rect[3] - rect[3] - options.y;
            }
            else if (options.aspect_mode == "fit_in" || options.aspect_mode == "fit_out") {
                rect[1] = parent._rect[1] + (parent._rect[3] - rect[3]) * 0.5;
            }
            else {
                rect[1] = parent._rect[1] + options.y;
            }

            if (this._parent._scroll) {
                rect[0] -= this._parent._scroll.scroll_x;
                rect[1] -= this._parent._scroll.scroll_y;
            }

            this._rect = rect;
        }

        if (this._options.enable_scroll) {
            this._scroll = this._scroll || { scroll_x: 0, scroll_y: 0 } as any;
            this._scroll.children_width = this.children_occ_width;
            this._scroll.children_height = this.children_occ_height;
            this._scroll.scroll_width = Math.max(this._scroll.children_width - this._rect[2], 0);
            this._scroll.scroll_height = Math.max(this._scroll.children_height - this._rect[3], 0);
            this._scroll.scroll_x = Math.min(this._scroll.scroll_x, this._scroll.scroll_width);
            this._scroll.scroll_y = Math.min(this._scroll.scroll_y, this._scroll.scroll_height);
        }

        {
            const ctx = this._canvas.renderer;
            const scale = this._canvas.canvas_scale;
            const show_id = this._system.show_id_color;
            const highlight_id = this._system.highlight_id;

            const x = scale * this._rect[0];
            const y = scale * this._rect[1];
            const w = scale * this._rect[2];
            const h = scale * this._rect[3];

            if (style.bg_fill || style.bg_stroke) {
                if (style.bg_radii) {
                    ctx.beginPath();
                    ctx.rect(x, y, w, h);
                    //ctx.roundRect(x, y, w, h, Math.ceil(style.bg_radii * scale));
                    ctx.closePath();

                    if (style.bg_fill) {
                        ctx.fillStyle = style.bg_fill_color;
                        ctx.fill();
                    }

                    if (style.bg_stroke) {
                        ctx.strokeStyle = style.bg_stroke_color;
                        ctx.lineWidth = Math.ceil(style.bg_stroke_width * scale);

                        if (style.bg_stroke_dash) {
                            const space = Math.ceil(style.bg_stroke_dash * scale);
                            ctx.setLineDash([space * 2, space]);
                        }
                        else {
                            ctx.setLineDash([]);
                        }

                        ctx.stroke();
                    }
                }
                else {
                    if (style.bg_fill) {
                        ctx.fillStyle = style.bg_fill_color;
                        ctx.fillRect(x, y, w, h);
                    }

                    if (style.bg_stroke) {
                        ctx.strokeStyle = style.bg_stroke_color;
                        ctx.lineWidth = Math.ceil(style.bg_stroke_width * scale);

                        if (style.bg_stroke_dash) {
                            const space = Math.ceil(style.bg_stroke_dash * scale);
                            ctx.setLineDash([space * 2, space]);
                        }
                        else {
                            ctx.setLineDash(null);
                        }

                        ctx.strokeRect(x, y, w, h);
                    }
                }
            }

            await this.Draw(0, style);

            if (show_id) {
                ctx.fillStyle = highlight_id != this._id ? this._id_color : "gray";
                ctx.fillRect(x, y, w, h);
            }

            if (this._scroll && (this._scroll.scroll_width > 0 || this._scroll.scroll_height > 0)) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.closePath();
                ctx.clip();
            }

            for (let child of this.children) {
                await child.Update(style);
            }

            if (this._scroll) {
                if (this._scroll.scroll_width > 0) {
                    const w_scale = this._rect[2] / this._scroll.children_width;

                    ctx.fillStyle = "white";
                    ctx.fillRect(
                        x + (this._scroll.scroll_x / this._scroll.scroll_width) * (1 - w_scale) * w,
                        y + h - 4,
                        w * w_scale,
                        2,
                    );
                }

                if (this._scroll.scroll_height > 0) {
                    const h_scale = this._rect[3] / this._scroll.children_height;

                    ctx.fillStyle = "white";
                    ctx.fillRect(
                        x + w - 4,
                        y + (this._scroll.scroll_y / this._scroll.scroll_height) * (1 - h_scale) * h,
                        2,
                        h * h_scale
                    );
                }

                ctx.restore();
            }

            await this.Draw(1, style);
        }

        return true;
    }

    /**
     * 绘制元素（派生类应当重写该方法）。
     * @param pass 绘制阶段。
     */
    public async Draw(pass: number, style: Element["_options"]["style"]) {
    }

    /**
     * 添加子级元素。
     * @param option 子级元素配置。
     */
    public AddChild<T extends Element>(option: Options) {
        const element = this._system.CreateElement<T>(this._canvas, option);

        element._parent = this;

        this._children.push(element);
        this._updateTS++;

        return element;
    }

    /**
     * 拖拽元素。
     * @param width 拖拽实际所在平面宽度。
     * @param height 拖拽实际所在平面高度。
     * @param event 鼠标事件对象。
     */
    public OnDrag(width: number, height: number, event: MouseEvent & { deltaY?: number }) {
        const scroll = this._parent?._scroll;
        if (scroll) {
            if (scroll.scroll_width > 0) {
                const movementX = event.movementX * this._canvas.canvas_width / width;
                scroll.scroll_x = Math.max(Math.min(scroll.scroll_width, scroll.scroll_x - movementX), 0.0);
                this._parent._updateTS++;
            }

            if (scroll.scroll_height > 0) {
                const movementY = event.movementY * this._canvas.canvas_height / height;
                scroll.scroll_y = Math.max(Math.min(scroll.scroll_height, scroll.scroll_y - movementY), 0.0);
                this._parent._updateTS++;
            }
        }
    }

    /** 元素ID。 */
    public get id() {
        return this._id;
    }

    /** 元素GUID。 */
    public get guid() {
        return this._options.guid;
    }

    /** 元素类型（"layout"，"canvas"都派生自"panel"，所以可以认为只有两大类"component"，"panel"）。 */
    public get type() {
        return this._type;
    }

    /** 元素是否激活。 */
    public get active() {
        return this._active;
    }
    public set active(b: boolean) {
        if (this._active != b) {
            this._active = b;
            this._updateTS++;
        }
    }

    /** 元素宽高比约束模式。 */
    public get aspect_mode() {
        if (this._options.aspect_mode == "fit_in") {
            return this.aspect_ratio > this._parent.aspect_ratio ? "width_ctrl" : "height_ctrl";
        }
        else if (this._options.aspect_mode == "fit_out") {
            return this.aspect_ratio > this._parent.aspect_ratio ? "height_ctrl" : "width_ctrl";
        }

        return this._options.aspect_mode;
    }

    /** 元素当前宽高比。 */
    public get aspect_ratio() {
        if (this._options.aspect_mode == "none") {
            return this.width.width / this.height.height;
        }

        return this._options.aspect_ratio || 1.0;
    }

    /** 元素当前设计宽度。 */
    public get width() {
        const options = this._options;
        const record = this._width;

        let updated = options.auto_width;

        if (record.timestrap != this._updateTS) {
            record.timestrap = this._updateTS;
            updated = true;
        }

        if (updated == false) {
            return record;
        }

        // ======================---------------------------------

        let width = 0;

        // 根据高度等比缩放计算出宽度
        if (this.aspect_mode == "height_ctrl") {
            // 注意这种情况：
            // CalynUI框架的内容大小以宽度为优先进行计算，比如多行文本先要确定行宽才能计算出行数；
            // 如果元素高度根据内容高度自动计算（auto_height），则需要先计算内容高度，而内容高度又可能依赖元素宽度；
            // 所以，同一元素中height_ctrl和auto_height不能同时设置！
            if (options.auto_height) {
                console.error("布局异常：同一元素中height_ctrl和auto_height不能同时设置！");
            }
            // 这种情况下元素高度明确的（上中下对齐模式）或者是拉伸的
            else {
                width = this.height.height * this.aspect_ratio;
            }
        }
        // 根据内容大小确定当前元素宽度
        else if (options.auto_width) {
            if (this.aspect_mode == "width_ctrl") {
                console.error("布局异常：同一元素中width_ctrl和auto_width不能同时设置！");
            }
            else {
                // 子级最大总占用设计宽度的计算并不依赖当前元素信息（即计算排除了"stretch"模式的子级）
                width = this.children_occ_width;
            }
        }
        // 拉伸为等同父级宽度
        else if (options.horiz_align == "stretch") {
            // 拉伸模式下子级总占用设计宽度等于父级内容区域设计宽度
            // 此类子级即不决定父级宽度，也不对父级滚动条状态起影响
            // 此外，元素width属性不应访问水平对齐模式为"stretch"的子级，从而避免陷入死循环
            width = this._parent.width.width - options.x - options.z;
        }
        // 左中右对齐模式都明确设置了元素的宽度（"puppet"模式下，父级想控制宽度需要设置options.z）
        else {
            width = options.z;
        }

        let occ_width = width + options.x;
        if (options.horiz_align == "center") {
            occ_width += options.x;
        }
        else if (options.horiz_align == "stretch") {
            occ_width += options.z;
        }

        if (record.width != width || record.occ_width != occ_width) {
            this._updateTS++;

            record.timestrap = this._updateTS;
            record.width = width;
            record.occ_width = occ_width;
        }

        return record;
    }

    /** 子级最大总占用设计宽度（包含子级边距，元素自动宽度或启用滚动条时需要计算子级最大总占用设计宽度）。 */
    public get children_occ_width() {
        let occ_width = 0

        for (let child of this.children) {
            // 存在这种情况：当前元素宽度自动，子元素0宽度拉伸，子元素1宽度确定
            // 我们先根据宽度确定的子级1来计算当前元素宽度，再计算宽度拉伸的子级0的宽度
            // 只有"stretch"模式的子级依赖父级宽度，对父级自动宽度和滚动条参数也不起决定影响，因此不纳入计算，并且纳入计算会陷入死循环
            // 如果依赖高度，高度为"stretch"依赖父级，进入的也是另一个分支，不会有死循环问题
            if (child._options.horiz_align != "stretch") {
                const child_width = child.width;

                if (occ_width < child_width.occ_width) {
                    occ_width = child_width.occ_width;
                }
            }
        }

        return occ_width;
    }

    /** 元素当前设计高度。 */
    public get height() {
        const options = this._options;
        const record = this._height;

        let updated = options.auto_height;

        if (record.timestrap != this._updateTS) {
            record.timestrap = this._updateTS;
            updated = true;
        }

        if (updated == false) {
            return record;
        }

        // ======================---------------------------------

        let height = 0;

        // 根据宽度等比缩放计算出高度
        if (this.aspect_mode == "width_ctrl") {
            // 同一元素中width_ctrl和auto_width不能同时设置！
            if (options.auto_width) {
                console.error("布局异常：同一元素中width_ctrl和auto_width不能同时设置！");
            }
            // 这种情况下元素宽度明确的（左中右对齐模式）或者是拉伸的
            else {
                height = this.width.width / this.aspect_ratio;
            }
        }
        // 根据内容大小确定当前元素高度
        else if (options.auto_height) {
            if (this.aspect_mode == "height_ctrl") {
                console.error("布局异常：同一元素中height_ctrl和auto_height不能同时设置！");
            }
            else {
                // 子级最大总占用设计高度的计算并不依赖当前元素信息（即计算排除了"stretch"模式的子级）
                height = this.children_occ_height;
            }
        }
        // 拉伸为等同父级高度
        else if (options.vert_align == "stretch") {
            // 拉伸模式下子级总占用设计高度等于父级内容区域设计高度
            // 此类子级即不决定父级高度，也不对父级滚动条状态起影响
            // 此外，元素height属性不应访问垂直对齐模式为"stretch"的子级，从而避免陷入死循环
            height = this._parent.height.height - options.y - options.w;
        }
        // 上中下对齐模式都明确设置了元素的高度（"puppet"模式下，父级想控制高度需要设置options.w）
        else {
            height = options.w;
        }

        let occ_height = height + options.y;
        if (options.vert_align == "center") {
            occ_height += options.y;
        }
        else if (options.vert_align == "stretch") {
            occ_height += options.w;
        }

        if (record.height != height || record.occ_height != occ_height) {
            this._updateTS++;

            record.timestrap = this._updateTS;
            record.height = height;
            record.occ_height = occ_height;
        }

        return record;
    }

    /** 子级最大总占用设计高度（包含子级边距，元素自动高度或启用滚动条时需要计算子级最大总占用设计高度）。 */
    public get children_occ_height() {
        let occ_height = 0

        for (let child of this.children) {
            // 只有"stretch"模式的子级依赖父级高度，对父级自动高度和滚动条参数也不起决定影响，因此不纳入计算，并且纳入计算会陷入死循环
            // 如果依赖宽度，宽度为"stretch"依赖父级，进入的也是另一个分支，不会有死循环问题
            if (child._options.vert_align != "stretch") {
                const child_height = child.height;

                if (occ_height < child_height.occ_height) {
                    occ_height = child_height.occ_height;
                }
            }
        }

        return occ_height;
    }

    /** 子级元素列表。 */
    public get children() {
        return this._children;
    }

    /** 样式设置。 */
    public get style() {
        return this._options.style || {};
    }

    /** UI系统实例。 */
    protected _system: CalynUI;
    /** UI画布实例。 */
    protected _canvas: Canvas;
    /** 当前父级元素。 */
    protected _parent: Element;
    /** 子级元素列表（控件、面板、布局）。 */
    protected _children: Element[];

    /** UI元素ID。 */
    protected _id: number;
    /** UI元素颜色标识。 */
    protected _id_color: string;
    /** 元素类型（"layout"，"canvas"都派生自"panel"，所以可以认为只有两大类"component"，"panel"）。 */
    protected _type: "component" | "panel" | "layout" | "canvas";
    /** 元素是否激活（默认值true）。 */
    protected _active: boolean;
    /** 元素矩形设计范围（距画布左上角坐标，元素宽高）。 */
    protected _rect: number[];
    /** 元素设置更新时间戳。 */
    protected _updateTS: number;
    /** 元素应用更新时间戳。 */
    protected _currentTS: number;
    /** 父级应用更新时间戳。 */
    protected _parentTS: number;

    /** 实际应用的样式对象。 */
    protected _style: Element["style"];

    /** 元素设计宽度。 */
    protected _width: {
        /** 数据时间戳。 */
        timestrap: number;
        /** 内容区域设计宽度。 */
        width: number;
        /** 总占用设计宽度（包含边距）。 */
        occ_width: number;
    };

    /** 元素设计高度。 */
    protected _height: {
        /** 数据时间戳。 */
        timestrap: number;
        /** 内容区域设计高度。 */
        height: number;
        /** 总占用设计高度（包含边距）。 */
        occ_height: number;
    };

    /** 滚动条参数。 */
    protected _scroll: {
        /** 内容水平平移。 */
        scroll_x: number;
        /** 内容垂直平移。 */
        scroll_y: number;
        /** 内容水平可平移宽度。 */
        scroll_width: number;
        /** 内容垂直可平移高度。 */
        scroll_height: number;
        /** 内容宽度。 */
        children_width: number;
        /** 内容高度。 */
        children_height: number;
    };

    /** 元素配置。 */
    protected _options: {
        /** 元素GUID（默认自动分配）。 */
        guid?: string;
        /** 是否启用滚动条（默认值false）。 */
        enable_scroll?: boolean;
        /** 
         * 元素宽高比约束模式（默认值"none"）。
         * "none": 不约束宽高比。
         * "width_ctrl": 根据元素宽度和宽高比计算出高度。
         * "height_ctrl": 根据元素高度和宽高比计算出宽度。
         * "fit_in": 选取某一控制边等同父级大小并使自动计算出的另一边大小在父级范围之内（计算时转换为“width_ctrl”或“height_ctrl”，并设置"stretch"模式）。
         * "fit_out": 选取某一控制边等同父级大小并使自动计算出的另一边大小在父级范围之外（计算时转换为“width_ctrl”或“height_ctrl”，并设置"stretch"模式）。
         */
        aspect_mode?: "none" | "width_ctrl" | "height_ctrl" | "fit_in" | "fit_out";
        /** 元素宽高比约束（默认无定义）。 */
        aspect_ratio?: number;
        /** 与父级水平对齐方式（默认值"left"）。 */
        horiz_align?: "left" | "center" | "right" | "stretch";
        /** 与父级垂直对齐方式（默认值"top"）。 */
        vert_align?: "top" | "center" | "bottom" | "stretch";
        /** 是否根据内容大小自动计算元素宽度（不能是"stretch"模式，默认值false）。 */
        auto_width?: boolean;
        /** 是否根据内容大小自动计算元素高度（不能是"stretch"模式，默认值false）。 */
        auto_height?: boolean;
        /** 与父级左边或中线或右边水平间距（分别对应拉伸、左中右水平对齐模式，默认值0.0）。 */
        x?: number;
        /** 与父级上边或中线或下边垂直间距（分别对应拉伸、上中下垂直对齐模式，默认值0.0）。 */
        y?: number;
        /** 元素宽度（左中右水平对齐模式，默认值64）或与父级右边间距（"stretch"水平对齐模式，默认值0）。 */
        z?: number;
        /** 元素高度（上中下垂直对齐模式，默认值64）或与父级底边间距（"stretch"垂直对齐模式，默认值0）。 */
        w?: number;
        /** 子级元素列表。 */
        children?: Options[];
        /** 样式设置（未定义则继承父级，定义为空则不启用）。 */
        style?: {
            /** 是否填充背景。 */
            bg_fill?: boolean;
            /** 背景填充颜色。 */
            bg_fill_color?: string;
            /** 是否描绘背景边框。 */
            bg_stroke?: boolean;
            /** 背景边框颜色。 */
            bg_stroke_color?: string;
            /** 背景边框线宽。 */
            bg_stroke_width?: number;
            /** 背景边框虚线间隔（实线长度为间隔的2倍）。 */
            bg_stroke_dash?: number;
            /** 圆角矩形圆弧半径。*/
            bg_radii?: number;

            /** 字体。 */
            font?: string;
            /** 字体大小（单位PX）。 */
            font_size?: number;
            /** 字体颜色。 */
            font_color?: string;
        };
    };
}

/** UI控件。 */
export class Component extends Element {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Component["_options"]) {
        super(system, canvas, id, options);

        const component = options && options.component;

        this._options.component = {
            ...component
        };
    }

    /** 控件配置。 */
    protected declare _options: Element["_options"] & {
        /** 控件配置选项。 */
        component?: {
            /** 可用于索引的位移名称。 */
            name?: string;
        };
    };
}

/** UI面板。 */
export class Panel extends Element {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Panel["_options"]) {
        super(system, canvas, id, options);
    }

    /** 面板配置。 */
    protected declare _options: Element["_options"] & {
        /** 面板配置选项。 */
        panel?: {
        };
    };
}

/** UI布局。 */
export class Layout extends Panel {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout["_options"]) {
        super(system, canvas, id, options);

        const layout = options && options.layout;

        this._options.layout = {
            static: layout.static || false
        };
    }

    /** 布局配置。 */
    protected declare _options: Panel["_options"] & {
        /** 布局配置选项。 */
        layout?: {
            /** 当前布局是静态布局还是动态布局（列表布局为动态布局）。 */
            static: boolean;
        };
    };
}

/** UI画布。 */
export class Canvas extends Panel {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, __: Canvas, id: number, options: Canvas["_options"]) {
        super(system, __, id, options);

        const canvas = options && options.canvas;
        const width = canvas.width || 1920;
        const height = canvas.height || 1080;

        this._canvas = this;
        this._options.canvas = {
            width: width,
            height: height
        };

        // UI画布不存在父级，此处模拟一个父级。
        this._parent = {
            _updateTS: 0,
            _currentTS: 0,
            _rect: [0, 0, width, height],
            active: true,
            aspect_ratio: width / height,
            width: { width: width, occ_width: width, timestrap: 0 },
            height: { height: height, occ_height: height, timestrap: 0 }
        } as any;

        this._width.width = width;
        this._width.occ_width = width;
        this._height.height = height;
        this._height.occ_height = height;

        this._Update = Element.prototype.Update.bind(this);
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"], window?: HTMLCanvasElement, renderer?: CanvasRenderingContext2D, rect?: number[]) {
        this._style = { ...style, ...this.style };

        this._cur_window = window;
        this._cur_renderer = renderer;

        let parent_x = 0;
        let parent_y = 0;
        let parent_width = this.window.width;
        let parent_height = this.window.height;

        if (rect) {
            parent_x = rect[0];
            parent_y = rect[1];
            parent_width = rect[2];
            parent_height = rect[3];
        }

        const width = this.width.width;
        const height = this.height.height;

        const aspect_ratio = width / height;
        const parent_aspect_ratio = parent_width / parent_height;

        let aspect_mode = this._options.aspect_mode;

        if (aspect_mode == "fit_in" || aspect_mode == "none") {
            aspect_mode = (aspect_ratio > parent_aspect_ratio) ? "width_ctrl" : "height_ctrl";
        }
        else if (aspect_mode == "fit_out") {
            aspect_mode = (aspect_ratio > parent_aspect_ratio) ? "height_ctrl" : "width_ctrl";
        }

        // 参数和计算结果都是在设计尺寸下定义的
        // 计算窗口缩放，使canvas计算出的_rect等同设计尺寸
        let scale = 1.0;

        if (aspect_mode == "width_ctrl") {
            scale = parent_width / width;
        }
        else if (aspect_mode == "height_ctrl") {
            scale = parent_height / height;
        }
        else {
            console.error("不应该执行此处，请检视代码逻辑！！！");
        }

        const ctx = this.renderer;

        ctx.clearRect(parent_x, parent_y, parent_width, parent_height);

        // 该参数可控制整体渐隐渐显
        ctx.globalAlpha = 1.0;

        {
            const x = parent_x + parent_width * 0.5;
            const y = parent_y + parent_height * 0.5;
            const r0 = Math.min(parent_width, parent_height) * 0.5 * 0.75;
            const r1 = Math.sqrt(parent_width * parent_width + parent_height * parent_height) * 0.5;

            const gradient = ctx.createRadialGradient(x, y, r0, x, y, r1);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0.0)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 1.0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(parent_x, parent_y, parent_width, parent_height);
        }

        const parent: any = this._parent;
        const parent_rect = this._parent["_rect"];

        parent_x /= scale;
        parent_y /= scale;
        parent_width /= scale;
        parent_height /= scale;

        if (parent_rect[0] != parent_x ||
            parent_rect[1] != parent_y ||
            parent_rect[2] != parent_width ||
            parent_rect[3] != parent_height) {

            parent._updateTS++;
            parent._currentTS = parent._updateTS;

            parent_rect[0] = parent_x;
            parent_rect[1] = parent_y;
            parent_rect[2] = parent_width;
            parent_rect[3] = parent_height;

            parent.active = true;
            parent.aspect_ratio = parent_aspect_ratio;

            parent.width.width = parent_width;
            parent.width.occ_width = parent_width;
            parent.width.timestrap = parent._updateTS;

            parent.height.height = parent_height;
            parent.height.occ_height = parent_height;
            parent.height.timestrap = parent._updateTS;
        }

        if (this._parentTS != parent._currentTS) {
            this._parentTS = parent._currentTS;
            this._updateTS++;
        }

        if (this._scale != scale) {
            this._scale = scale;
            this._updateTS++;
        }

        return this._Update(style);
    }

    /**
     * 遍历画布中所有UI元素（先根顺序）。
     * @param func UI元素处理方法（返回值决定是否往当前元素子级遍历）。
     */
    public Foreach(func: (element: Element) => boolean) {
        function For(element: Element) {
            if (func(element)) {
                for (let child of element.children) {
                    For(child);
                }
            }
        }

        For(this);
    }

    /**
     * 获取当前光标命中的元素列表。
     * @param x 光标在画布中的X轴坐标。
     * @param y 光标在画布中的Y轴坐标。
     * @returns 返回命中的所有元素（元素深度递减）。
     */
    public Hit(x: number, y: number) {
        const elements: { element: Element; x: number; y: number; }[] = [];

        x /= this.canvas_scale;
        y /= this.canvas_scale;

        this.Foreach(function (element) {
            const rect = element["_rect"];

            if (x < rect[0] ||
                x > rect[0] + rect[2] ||
                y < rect[1] ||
                y > rect[1] + rect[3]) {

                return false;
            }

            elements.push({ element, x: (x - rect[0]) / rect[2], y: (y - rect[1]) / rect[3] });

            return true;
        });

        return elements;
    }

    /** 元素当前设计宽度。 */
    public get width() {
        return this._width;
    }

    /** 元素当前设计高度。 */
    public get height() {
        return this._height;
    }

    /** HTML画布元素。 */
    public get window() {
        let window = this._cur_window || this._window;
        if (!window) {
            window = this._window = this._system["_global"].CreateCanvas(this.canvas_width, this.canvas_height);
        }

        return window;
    }

    /** HTML画布上下文。 */
    public get renderer() {
        let renderer = this._cur_renderer || this._renderer;
        if (!renderer) {
            renderer = this._cur_renderer = this.window.getContext("2d");
        }

        return renderer;
    }

    /** 画布设计宽度。 */
    public get canvas_width() {
        return this._options.canvas.width;
    }

    /** 画布设计高度。 */
    public get canvas_height() {
        return this._options.canvas.height;
    }

    /** 画布绘制缩放。 */
    public get canvas_scale() {
        return this._scale;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;

    /** HTML画布元素。 */
    protected _window: HTMLCanvasElement;
    /** HTML画布上下文。 */
    protected _renderer: CanvasRenderingContext2D;

    /** 外部绑定HTML画布元素。 */
    protected _cur_window: HTMLCanvasElement;
    /** 外部绑定HTML画布上下文。 */
    protected _cur_renderer: CanvasRenderingContext2D;

    /** 画布绘制缩放。 */
    protected _scale: number;

    /** 画布配置。 */
    protected declare _options: Panel["_options"] & {
        /** 画布配置选项。 */
        canvas?: {
            /** UI设计宽度。 */
            width?: number;
            /** UI设计高度。 */
            height?: number;
        };
    };
}

/** UI元素构造配置。 */
export type Options = { creator: string; } & (Component_image["_options"] | Component_text["_options"] | Component_button["_options"] | Component_echart["_options"] | Panel["_options"] | Layout["_options"] | Layout_grid["_options"] | Layout_vert_list["_options"] | Layout_frame_1["_options"] | Canvas["_options"]);

/** UI图片。 */
export class Component_image extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_image["_options"]) {
        super(system, canvas, id, options);

        const image = options && options.component && options.component.image;

        this._options.component.image = {
            url: image.url
        };

        this._Update = Element.prototype.Update.bind(this);
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        if (!this._image) {
            this._image = await this._system["_global"].LoadImage(this._options.component.image.url, "anonymous");
        }

        return this._Update(style);
    }

    /**
     * 绘制元素。
     * @param pass 绘制阶段。
     */
    public async Draw(pass: number, style: Element["_options"]["style"]) {
        if (pass == 1) {
            const ctx = this._canvas.renderer;
            const scale = this._canvas.canvas_scale;

            const x = Math.ceil(scale * this._rect[0]);
            const y = Math.ceil(scale * this._rect[1]);
            const w = Math.ceil(scale * this._rect[2]);
            const h = Math.ceil(scale * this._rect[3]);

            if (!this._image) {
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, w, h);
            }
            else if ((this._image as any).svg) {
                ctx.fillStyle = "green";

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y);
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x, y + h);
                ctx.closePath();

                ctx.fill(this._image as any);
            }
            else {
                ctx.drawImage(this._image, 0, 0, this._image.width, this._image.height, x, y, w, h);
            }
        }
    }

    /** 元素当前宽高比。 */
    public get aspect_ratio() {
        return this.children_occ_width / this.children_occ_height;
    }

    /** 文本占用宽度。 */
    public get children_occ_width() {
        return this._image ? this._image.width : 64;
    }

    /** 文本占用高度。 */
    public get children_occ_height() {
        return this._image ? this._image.height : 64;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;

    /** 图片资源。 */
    protected _image: HTMLImageElement;

    /** 控件配置。 */
    protected declare _options: Component["_options"] & {
        /** 控件配置选项。 */
        component?: {
            /** 图像控件配置选项。 */
            image?: {
                /** 图片URL。 */
                url?: string;
            };
        };
    };
}

/** UI文本控件。 */
export class Component_text extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_text["_options"]) {
        super(system, canvas, id, options);

        const text = options && options.component && options.component.text;

        this._options.component.text = {
            text: text.text || "请设置文本内容",
            padding: text.padding || [4, 4, 4, 4],
            multi_line: text.multi_line || false,
            line_spacing: text.line_spacing || 4
        };

        this._multi_line_settings = {
            font_size: 0,
            font: "24px Arial",
            text: null,
            default_lines: [],
            dynamic_lines: [],
            line_width: 100,
            line_height: 20,
            line_actualBoundingBoxAscent: 20,
            line_actualBoundingBoxDescent: 0
        };

        this.get_width = Object.getOwnPropertyDescriptor(Element.prototype, 'width').get.bind(this);
        this.get_height = Object.getOwnPropertyDescriptor(Element.prototype, 'height').get.bind(this);
    }

    /**
     * 绘制元素。
     * @param pass 绘制阶段。
     */
    public async Draw(pass: number, style: Element["_options"]["style"]) {
        if (pass == 1) {
            const scale = this._canvas.canvas_scale;
            const settings = this.multi_line_settings;
            const text = this._options.component.text;
            const ctx = this._canvas.renderer;

            let x = Math.ceil(scale * (this._rect[0] + text.padding[0]));
            let y = Math.ceil(scale * (this._rect[1] + text.padding[1]));

            const w = scale * this._rect[2];
            const h = scale * this._rect[3];

            const stride = settings.line_height + text.line_spacing * scale;

            //ctx.fillStyle = "red";
            //ctx.fillRect(x - scale * text.padding[0], y - scale * text.padding[1], w, h);

            // 设置文本基线，使绘制参数指定的Y坐标在文本顶部
            ctx.textBaseline = "bottom";
            // 设置文本水平对齐，使绘制参数指定的X坐标在文本最左端
            ctx.textAlign = "left";
            // 设置文本字体
            ctx.font = settings.font;
            // 设置文本填充颜色
            ctx.fillStyle = style.font_color;

            for (let text of settings.dynamic_lines) {
                ctx.fillText(text, x, y + settings.line_actualBoundingBoxAscent); y += stride;
            }
        }
    }

    /** 多行文本设置。 */
    public get multi_line_settings() {
        const settings = this._multi_line_settings;
        const text = this._options.component.text;
        const ctx = this._canvas.renderer;

        // 从当前样式或父级样式中取得设计字体
        const font_size_ = this.style.font_size || this._parent["_style"].font_size;
        // 当前绘制窗口尺寸相较设计画布尺寸的缩放
        const scale = this._canvas.canvas_scale;
        // 根据实际绘制缩放字体大小
        const font_size = Math.ceil(font_size_ * scale);

        // 实际绘制字体设置有变化
        if (settings.font_size != font_size) {
            let font = this.style.font || this._parent["_style"].font;
            if (Deno) {
                font = 'Arial';
            }

            settings.font_size = font_size;
            settings.font = "" + font_size + "px " + font;
            settings.text = null;
        }

        if (settings.text != text.text) {
            ctx.font = settings.font;

            if (text.multi_line) {
                settings.text = text.text;
                settings.default_lines = text.text.split("\n");
                settings.dynamic_lines = settings.default_lines.slice();
                settings.line_width = 0;
                settings.line_height = 0;

                for (let line of settings.default_lines) {
                    const metrics = this._system["_global"].MeasureText(line, ctx);

                    if (settings.line_width < metrics.width) {
                        settings.line_width = metrics.width;
                    }

                    if (settings.line_height == 0) {
                        settings.line_height = metrics.height;
                        settings.line_actualBoundingBoxAscent = metrics.actualBoundingBoxAscent;
                        settings.line_actualBoundingBoxDescent = metrics.actualBoundingBoxDescent;
                    }
                }
            }
            else {
                settings.text = text.text;
                settings.default_lines = [text.text];
                settings.dynamic_lines = [text.text];

                const metrics = this._system["_global"].MeasureText(text.text, ctx);

                settings.line_width = metrics.width;
                settings.line_height = metrics.height;
                settings.line_actualBoundingBoxAscent = metrics.actualBoundingBoxAscent;
                settings.line_actualBoundingBoxDescent = metrics.actualBoundingBoxDescent;
            }
        }

        // 越界处理方法，裁剪或分为多行
        if (!this._options.auto_width) {
            ctx.font = settings.font;

            const tolerance = this._system["_global"].MeasureText("我", ctx);
            const width = this.get_width();
            const line_width = (width.width - text.padding[0] - text.padding[2]) * this._canvas.canvas_scale - tolerance.width * 0.5;

            if (settings.line_width > line_width) {
                settings.line_width = line_width;
                settings.dynamic_lines = [];

                const Wrap = (text_: string) => {
                    const metrics = this._system["_global"].MeasureText(text_, ctx);

                    if (metrics.width < line_width) {
                        return [text_];
                    }
                    else {
                        let cur_chars = text_.split("");
                        let cur_lines = [];
                        let cur_line = "";
                        let cur_width = 0;

                        for (let i = 0; i < cur_chars.length; i++) {
                            const char_width = this._system["_global"].MeasureText(cur_chars[i], ctx).width;

                            cur_line += cur_chars[i];
                            cur_width += char_width;

                            if (cur_width > line_width) {
                                cur_lines.push(cur_line);

                                cur_line = "";
                                cur_width = 0;

                                if (!text.multi_line) {
                                    break;
                                }
                            }
                        }

                        if (cur_width > 0) {
                            cur_lines.push(cur_line);
                        }

                        return cur_lines;
                    }
                }

                for (let text of settings.default_lines) {
                    const lines = Wrap(text);

                    settings.dynamic_lines.push(...lines);
                }
            }
        }

        return settings;
    }

    /** 文本占用宽度。 */
    public get children_occ_width() {
        const text = this._options.component.text;
        const settings = this.multi_line_settings;

        // 文本尺寸根据实际绘制进行了缩放，此处需要返回设计画布下的尺寸，所以要还原缩放
        const occ_width = settings.line_width / this._canvas.canvas_scale + text.padding[0] + text.padding[2];

        return occ_width;
    }

    /** 文本占用高度。 */
    public get children_occ_height() {
        const text = this._options.component.text;
        const settings = this.multi_line_settings;

        // 文本尺寸根据实际绘制进行了缩放，此处需要返回设计画布下的尺寸，所以要还原缩放
        let occ_height = settings.line_height / this._canvas.canvas_scale + text.padding[1] + text.padding[3];

        if (text.multi_line) {
            occ_height += (settings.line_height / this._canvas.canvas_scale + text.line_spacing) * (settings.dynamic_lines.length - 1);
        }

        return occ_height;
    }

    /** 设置文本。 */
    public set text(value: string) {
        const text = this._options.component.text;
        if (text.text != value) {
            text.text = value;
            this._updateTS++;
        }
    }

    /** 原width属性访问器。 */
    protected get_width: any;
    /** 原height属性访问器。 */
    protected get_height: any;

    /** 多行绘制设置。 */
    protected _multi_line_settings: {
        /** 当前字体大小。 */
        font_size: number;
        /** 当前字体。 */
        font: string;
        /** 当前设置对应的文本。 */
        text: string;
        /** 当前文本默认分行。 */
        default_lines: string[];
        /** 当前文本动态分行。 */
        dynamic_lines: string[];
        /** 当前文本最大行宽。 */
        line_width: number;
        /** 当前文本行高。 */
        line_height: number;
        /** 表示从textBaseline属性指示的水平线到用于渲染文本的边界矩形顶部的距离。 */
        line_actualBoundingBoxAscent: number;
        /** 表示从textBaseline属性指示的水平线到用于渲染文本的边界矩形底部的距离。 */
        line_actualBoundingBoxDescent: number;
    };

    /** 控件配置。 */
    protected declare _options: Component["_options"] & {
        /** 控件配置选项。 */
        component?: {
            /** 文本控件配置选项。 */
            text?: {
                /** 文本。 */
                text?: string;
                /** 文本绘制内边距 */
                padding?: number[];
                /** 是否允许多行绘制。 */
                multi_line?: boolean;
                /** 文本行间距。 */
                line_spacing?: number;
            };
        };
    };
}

/** UI按钮。 */
export class Component_button extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_button["_options"]) {
        super(system, canvas, id, options);

        const button = options && options.component && options.component.button;

        this._options.component.button = {
            icon: button.icon,
            text: button.text,
            spacing: button.spacing || 8
        };

        if (button.icon) {
            this._icon = this.AddChild<Component_image>({
                creator: "Component_image",
                component: {
                    image: {
                        url: button.icon
                    }
                }
            });
        }

        if (button.text) {
            this._text = this.AddChild<Component_text>({
                creator: "Component_text",
                auto_width: true,
                auto_height: true,
                component: {
                    text: {
                        text: button.text,
                        padding: [4, 4, 4, 4]
                    }
                }
            });
        }

        this._content_size = {
            icon_aspect_ratio: 0,
            font: undefined,
            height: 16,
            icon_width: 16,
            text_width: 0,
            width: 16
        };

        this._Update = Element.prototype.Update.bind(this);
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        this._style = { ...style, ...this.style };

        const content_size = this.content_size;
        const width = this.width.width;
        const height = this.height.height;

        let x = Math.max((width - content_size.width) * 0.5, 0.0);
        let y = Math.max((height - content_size.height) * 0.5, 0.0);

        if (this._icon) {
            const icon_options = this._icon["_options"];
            icon_options.x = x;
            icon_options.y = y;
            icon_options.z = content_size.icon_width;
            icon_options.w = content_size.height;

            this._icon["_updateTS"]++;

            x += content_size.icon_width + 8;
        }

        if (this._text) {
            const text_options = this._text["_options"];
            text_options.x = x;
            text_options.y = y;

            this._text["_updateTS"]++;
        }

        return this._Update(style);
    }

    /** 文本占用宽度。 */
    public get children_occ_width() {
        return this.content_size.width + 16;
    }

    /** 文本占用高度。 */
    public get children_occ_height() {
        return this.content_size.height + 16;
    }

    /** 内容尺寸。 */
    public get content_size() {
        const button = this._options.component.button;
        const font = this._text ? this._text.multi_line_settings.font : undefined;
        const icon_aspect_ratio = this._icon ? this._icon.aspect_ratio : 0;

        if (this._content_size.icon_aspect_ratio != icon_aspect_ratio || this._content_size.font != font) {
            const text_width = this._text ? this._text.width.width : 0;
            const text_height = this._text ? this._text.height.height : 0;

            const height = text_height || 16;

            const icon_width = icon_aspect_ratio ? height / icon_aspect_ratio : 0;

            const width = text_width + icon_width + ((text_width && icon_width) ? button.spacing : 0);

            this._content_size = {
                icon_aspect_ratio,
                font,
                height,
                icon_width,
                text_width,
                width
            };
        }

        return this._content_size;
    }

    /** 设置按钮文本。 */
    public set text(value: string) {
        if (!this._text) {
            return;
        }

        this._text.text = value;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;
    /** 图标组件。 */
    protected _icon: Component_image;
    /** 标题组件。 */
    protected _text: Component_text;

    /** 内容尺寸。 */
    protected _content_size: {
        /** 图标宽高比。 */
        icon_aspect_ratio: number;
        /** 按钮文本字体。 */
        font: string;
        /** 内容高度由文本高度决定。 */
        height: number;
        /** 图标宽度。 */
        icon_width: number;
        /** 文本宽度。 */
        text_width: number;
        /** 内容宽度。 */
        width: number;
    };

    /** 控件配置。 */
    protected declare _options: Component["_options"] & {
        /** 控件配置选项。 */
        component?: {
            /** 按钮配置选项。 */
            button?: {
                /** 图标URL。 */
                icon?: string;
                /** 按钮文字。 */
                text?: string;
                /** 两个元素的间隔。 */
                spacing?: number;
            };
        };
    };
}

/** UI图表。 */
export class Component_echart extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_echart["_options"]) {
        super(system, canvas, id, options);

        const echart = options && options.component && options.component.echart;

        this._options.component.echart = echart;

        this._Update = Element.prototype.Update.bind(this);

        this._dataset = this.echart_option.dataset as any;
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        return this._Update(style);
    }

    /**
     * 绘制元素。
     * @param pass 绘制阶段。
     */
    public async Draw(pass: number, style: Element["_options"]["style"]) {
        if (pass == 1) {
            const ctx = this._canvas.renderer;
            const scale = this._canvas.canvas_scale;

            const x = Math.ceil(scale * this._rect[0]);
            const y = Math.ceil(scale * this._rect[1]);
            const w = Math.ceil(scale * this._rect[2]);
            const h = Math.ceil(scale * this._rect[3]);

            if (this._last_draw_width != w || this._last_draw_height != h) {
                this._last_draw_width = w;
                this._last_draw_height = h;

                if (!this._echart) {
                    this._dom = this._system["_global"].CreateCanvas(w, h);
                    this._echart = this._system["_global"].echarts.init(this._dom, this._options.component.theme);
                    // TODO: 检测发现此处会创建一个画布
                    this._echart.setOption(this.echart_option);
                }
                else {
                    // TODO: DENO环境下不支持重设大小
                    if (!Deno) {
                        this._dom.width = w;
                        this._dom.height = h;

                        this._echart.resize({ width: w, height: h });
                    }
                }

                // TODO：数据更新时才刷新图表数据，每帧刷新数据会影响事件响应
                if (this.echart_option.dataset !== this._dataset) {
                    this.echart_option.dataset = this._dataset;
                    this._echart.setOption(this.echart_option);
                }
            }

            // 绘制图表
            // const image = this._echart.renderToCanvas();
            const image = this._dom;

            // 绘制到画布
            ctx.drawImage(image, 0, 0, image.width, image.height, x, y, w, h);
        }
    }

    /** 图表样式配置。 */
    public get echart_option() {
        return this._options.component.echart;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;

    /** 上一内容面板绘制宽度。 */
    protected _last_draw_width: number;
    /** 上一内容面板绘制高度。 */
    protected _last_draw_height: number;

    /** 图表画布。 */
    private _dom: HTMLCanvasElement;
    /** 图表实例。 */
    private _echart: Miaoverse.echarts.ECharts;
    /** 数据集（使用键值对这种最简单常见的数据格式）。 */
    private _dataset: Miaoverse.echarts.DatasetComponentOption;

    /** 控件配置。 */
    protected declare _options: Component["_options"] & {
        /** 控件配置选项。 */
        component?: {
            /** 样式主题。 */
            theme?: string;
            /** 
             * 图表样式配置（应该携带默认数据集）：
             * title.text：标题
             * backgroundColor = 'transparent'：设置画布背景透明
             * legend.data：图例名称数组（比如一个商品的'产量'，'销量'一同显示）
             * legend.right = 0：图例开关按钮距画布右边距为0
             * grid: 允许在一个画布中绘制多个图表，该选项将画布划分出多个区块
             * grid.top = 32：在区块顶部留出32像素高度来显示标题
             * xAxis.data：图表横轴标签列表
             * xAxis.gridIndex：该横轴标签配置所属画布区块
             * yAxis.gridIndex：该纵轴标签配置所属画布区块
             * series[].name：图例名称
             * series[].type：图例类型
             * series[].data：图例各横轴标签对应的Y轴值
             */
            echart?: Miaoverse.echarts.EChartsOption;
        };
    };
}

/** 24栅格布局。 */
export class Layout_grid extends Layout {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout_grid["_options"]) {
        super(system, canvas, id, options);

        const grid = options && options.layout && options.layout.grid;

        const grid_ = this._options.layout.grid = {
            direction: grid.direction || "horiz",
            spans: grid.spans ? grid.spans.slice() : [12, 12],
            padding: grid.padding ? grid.padding.slice() : [4, 4, 4, 4],
            spacing: grid.spacing || 4
        };

        this._panels = [];

        for (let i = 0; i < grid_.spans.length; i++) {
            this._panels[i] = this.AddChild<Panel>({
                creator: "Panel"
            });
        }

        this._Update = Element.prototype.Update.bind(this);
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        const grid = this._options.layout.grid;
        const content_width = this.width.width;
        const content_height = this.height.height;

        if (this._last_content_width != content_width || this._last_content_height != content_height) {
            this._last_content_width = content_width;
            this._last_content_height = content_height;

            if (grid.direction == "horiz") {
                let x = grid.padding[0];
                let y = grid.padding[1];

                const width = content_width - grid.padding[0] - grid.padding[2] - grid.spacing * (grid.spans.length - 1);
                const height = content_height - grid.padding[1] - grid.padding[3];

                for (let i = 0; i < grid.spans.length; i++) {
                    const panel_ = this._panels[i]["_options"];
                    const width_ = Math.floor(width * grid.spans[i] / 24);

                    panel_.x = x;
                    panel_.y = y;
                    panel_.z = width_;
                    panel_.w = height;

                    this._panels[i]["_updateTS"]++;

                    x += width_ + grid.spacing;
                }
            }
            else if (grid.direction == "vert") {
                let x = grid.padding[0];
                let y = grid.padding[1];

                const width = content_width - grid.padding[0] - grid.padding[2];
                const height = content_height - grid.padding[1] - grid.padding[3] - grid.spacing * (grid.spans.length - 1);

                for (let i = 0; i < grid.spans.length; i++) {
                    const panel_ = this._panels[i]["_options"];
                    const height_ = Math.floor(height * grid.spans[i] / 24);

                    panel_.x = x;
                    panel_.y = y;
                    panel_.z = width;
                    panel_.w = height_;

                    this._panels[i]["_updateTS"]++;

                    y += height_ + grid.spacing;
                }
            }
        }

        return this._Update(style);
    }

    /** 布局中的面板列表。 */
    public get panels() {
        return this._panels;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;

    /** 布局中的面板列表。 */
    protected _panels: Panel[];
    /** 上一内容面板宽度。 */
    protected _last_content_width: number;
    /** 上一内容面板高度。 */
    protected _last_content_height: number;

    /** 布局配置。 */
    protected declare _options: Layout["_options"] & {
        /** 布局配置选项。 */
        layout?: {
            /** 24栅格配置选项。 */
            grid?: {
                /** 栅格方向。 */
                direction: "horiz" | "vert";
                /** 栅格宽度列表（列表长度为栅格数量，总和需为24）。 */
                spans: number[];
                /** 各栅格内边距 */
                padding?: number[];
                /** 栅格间间隔。 */
                spacing?: number;
            };
        };
    };
}

/** 垂直列表布局。 */
export class Layout_vert_list extends Layout {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout_vert_list["_options"]) {
        super(system, canvas, id, options);

        const vert_list = options && options.layout && options.layout.vert_list;

        this._options.layout.vert_list = {
            spacing: vert_list.spacing || 4
        };

        this._Update = Element.prototype.Update.bind(this);
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * 当前布局宽高、子级宽高使用标准方法确定，列表布局仅确定子级坐标。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        // TODO：是否应该先计算子级的_rect数据，这样才能实现更通用的排布

        const vert_list = this._options.layout.vert_list;

        let y = 0;

        for (let child of this.children) {
            const child_options = child["_options"];

            if (child_options.vert_align != "top") {
                console.warn("Layout_vert_list仅支持vert_align == 'top'的元素！");
                continue;
            }

            if (child_options.y != y) {
                child_options.y = y;
                child["_updateTS"]++;
            }

            y += Math.ceil(child.height.height) + vert_list.spacing;
        }

        let content_width = this.width.width;
        let content_height = y;

        if (this._last_content_width != content_width || this._last_content_height != content_height) {
            this._last_content_width = content_width;
            this._last_content_height = content_height;

            this._updateTS++;
        }

        return this._Update(style);
    }

    /** 子级占用宽度。 */
    public get children_occ_width() {
        return this._last_content_width || this.width.width;
    }

    /** 子级占用高度。 */
    public get children_occ_height() {
        return this._last_content_height || this.height.height;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;

    /** 上一内容面板宽度。 */
    protected _last_content_width: number;
    /** 上一内容面板高度。 */
    protected _last_content_height: number;

    /** 布局配置。 */
    protected declare _options: Layout["_options"] & {
        /** 布局配置选项。 */
        layout?: {
            /** 垂直列表配置选项。 */
            vert_list?: {
                /** 栅格间间隔。 */
                spacing?: number;
            };
        };
    };
}

/** UI面板框架设计1。 */
export class Layout_frame_1 extends Layout {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    public constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout_frame_1["_options"]) {
        super(system, canvas, id, options);

        const frame_1 = options && options.layout && options.layout.frame_1;

        this._options.layout.frame_1 = { ...frame_1 };

        this._design = Layout_frame_1.designs[frame_1.design_guid];
        this._design.config(this, true);

        this._panels = [];

        for (let i = 0; i < this._design.panel_count; i++) {
            this._panels[i] = this.AddChild<Panel>({
                creator: "Panel"
            });
        }

        this._Update = Element.prototype.Update.bind(this);
    }

    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    public async Update(style: Element["_options"]["style"]) {
        await this._design.Update(style, this);
        return this._Update(style);
    }

    /**
     * 绘制元素（派生类应当重写该方法）。
     * @param pass 绘制阶段。
     */
    public async Draw(pass: number, style: Element["_options"]["style"]) {
        return this._design.Draw(pass, style, this);
    }

    /** 布局中的面板列表。 */
    public get panels() {
        return this._panels;
    }

    /** 原UI元素更新逻辑。 */
    protected _Update: any;

    /** 布局中的面板列表。 */
    protected _panels: Panel[];
    /** 上一内容面板宽度。 */
    protected _last_content_width: number;
    /** 上一内容面板高度。 */
    protected _last_content_height: number;

    /** 面板设计。 */
    protected _design: {
        /** 面板设计GUID。 */
        guid: string;
        /** 面板设计标签。 */
        label: string;
        /** 子面板数量。 */
        panel_count: number;
        /** 面板设计配置。 */
        config: (master: Layout_frame_1, init?: boolean) => any;
        /** 面板布局刷新方法。 */
        Update: (style: Element["_options"]["style"], master: Layout_frame_1) => Promise<boolean>;
        /** 面板布局绘制方法。 */
        Draw: (pass: number, style: Element["_options"]["style"], master: Layout_frame_1) => Promise<void>;
    };

    /** 面板设计实例数据缓存。 */
    protected _cache: any = {};

    /** 布局配置。 */
    protected declare _options: Layout["_options"] & {
        /** 布局配置选项。 */
        layout?: {
            /** UI面板框架设计1。 */
            frame_1?: {
                /** 采用的面板设计GUID。 */
                design_guid: string;
                /** 面板设计配置。 */
                design_config?: any;
            };
        };
    };

    public static designs: Record<string, Layout_frame_1["_design"]> = {};
}

const CALYNUI_LAYOUT_FRAME1_BUILTIN_000001 = {
    guid: "CALYNUI_LAYOUT_FRAME1_BUILTIN_000001",
    label: "",
    panel_count: 1,
    config(master: Layout_frame_1, init?: boolean) {
        let options = master["_options"].layout.frame_1;

        let config: {
            direction: "left" | "right";
            padding: number[];
            fill_gradient: [number, string][];
            stroke_gradient: [number, string][];
            stroke_shadow_color: string;
            stroke_shadow_blur: number;
            stroke_width: number;
        } = options.design_config;

        if (init) {
            options.design_config = config = {
                direction: "left",
                padding: [0, 0, 0, 0],
                fill_gradient: [
                    [0.0, "rgba(7,13,27,0.2)"],
                    [0.3, "rgba(10,23,38,0.6)"],
                    [1.0, "rgba(20,45,75,0.9)"]
                ],
                stroke_gradient: [
                    [0.0, "rgba(141,182,210, 0.0)"],
                    [0.3, "rgba(141,182,210, 0.6)"],
                    [1.0, "rgba(141,182,210, 0.9)"]
                ],
                stroke_shadow_color: "#8DB6D2",
                stroke_shadow_blur: 4,
                stroke_width: 2,
                ...config
            };
        }

        return config;
    },
    async Update(style: Element["_options"]["style"], master: Layout_frame_1) {
        const config = CALYNUI_LAYOUT_FRAME1_BUILTIN_000001.config(master);
        const content_width = master.width.width;
        const content_height = master.height.height;

        if (master["_last_content_width"] != content_width || master["_last_content_height"] != content_height) {
            master["_last_content_width"] = content_width;
            master["_last_content_height"] = content_height;

            const r = 12;
            const a = content_width / 6;

            const x = config.padding[0] + r;
            const y = config.padding[1] + r + a;
            const w = content_width - config.padding[0] - config.padding[2] - r - r;
            const h = content_height - config.padding[1] - config.padding[3] - r - r - a - a;

            const panel = master["_panels"][0];
            const panel_options = panel["_options"];

            panel_options.x = x;
            panel_options.y = y;
            panel_options.z = w;
            panel_options.w = h;

            panel["_updateTS"]++;
        }

        return true;
    },
    async Draw(pass: number, style: Element["_options"]["style"], master: Layout_frame_1) {
        if (pass == 0) {
            const ctx = master["_canvas"].renderer;
            const scale = master["_canvas"].canvas_scale;
            const cache = master["_cache"];
            const config = CALYNUI_LAYOUT_FRAME1_BUILTIN_000001.config(master);

            const x = Math.ceil(scale * master["_rect"][0]);
            const y = Math.ceil(scale * master["_rect"][1]);
            const w = Math.ceil(scale * master["_rect"][2]);
            const h = Math.ceil(scale * master["_rect"][3]);
            const r = 12;
            const a = w / 6;

            if (cache.x != x || cache.y != y || cache.w != w || cache.h != h) {
                cache.x = x;
                cache.y = y;
                cache.w = w;
                cache.h = h;

                // arcTo()方法将利用当前端点、端点1(x1,y1)和端点2(x2,y2)这三个点所形成的夹角，绘制一段与夹角的两边相切并且半径为radius的圆上的弧线

                const fill_gradient = ctx.createLinearGradient(x, y, x + w, y);
                const stroke_gradient = ctx.createLinearGradient(x, y, x + w, y);

                if (config.direction == "left") {
                    for (let stop of config.fill_gradient) {
                        fill_gradient.addColorStop(stop[0], stop[1]);
                    }

                    for (let stop of config.stroke_gradient) {
                        stroke_gradient.addColorStop(stop[0], stop[1]);
                    }
                }
                else {
                    for (let stop of config.fill_gradient) {
                        fill_gradient.addColorStop(1 - stop[0], stop[1]);
                    }

                    for (let stop of config.stroke_gradient) {
                        stroke_gradient.addColorStop(1 - stop[0], stop[1]);
                    }
                }

                cache.fill_gradient = fill_gradient;
                cache.stroke_gradient = stroke_gradient;
            }

            ctx.save();

            if (config.direction == "left") {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y + a, x + w, y + h - a, r);
                ctx.arcTo(x + w, y + h - a, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
            }
            else if (config.direction == "right") {
                ctx.beginPath();
                ctx.moveTo(x, y + a + r);
                ctx.arcTo(x, y + a, x + w, y, r);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h - a, r);
                ctx.arcTo(x, y + h - a, x, y, r);
                ctx.closePath();
            }
            else {
                ctx.restore();
                return;
            }

            ctx.fillStyle = cache.fill_gradient;
            ctx.fill();

            if (config.stroke_width) {
                ctx.shadowColor = config.stroke_shadow_color;
                ctx.shadowBlur = config.stroke_shadow_blur;
                ctx.strokeStyle = cache.stroke_gradient;
                ctx.lineWidth = config.stroke_width;

                ctx.stroke();
            }

            ctx.restore();
        }
    }
};

const CALYNUI_LAYOUT_FRAME1_BUILTIN_000002 = {
    guid: "CALYNUI_LAYOUT_FRAME1_BUILTIN_000002",
    label: "",
    panel_count: 2,
    config(master: Layout_frame_1, init?: boolean) {
        let options = master["_options"].layout.frame_1;

        let config: {
            direction: "left" | "right";
            padding: number[];

            left_fill_gradient: [number, string][];
            left_stroke_gradient: [number, string][];
            left_stroke_shadow_color: string;
            left_stroke_shadow_blur: number;
            left_stroke_width: number;

            center_fill_gradient: [number, string][];
            center_stroke_gradient: [number, string][];
            center_stroke_width: number;

            right_fill_color: string;
            right_stroke_color: string;
            right_stroke_width: number;

            decorate_color: string[];
            bg_image?: string;
        } = options.design_config;

        if (init) {
            options.design_config = config = {
                direction: "left",
                padding: [10, 10, 10, 10],

                left_fill_gradient: [
                    [0.0, "rgba(0,0,0,1.0)"],
                    [1.0, "rgba(0,0,0,0.0)"]
                ],
                left_stroke_gradient: [
                    [0.0, "rgba(200,242,255,0.0)"],
                    [0.3, "rgba(200,242,255,0.6)"],
                    [1.0, "rgba(200,242,255,0.9)"]
                ],
                left_stroke_shadow_color: "#8DB6D2",
                left_stroke_shadow_blur: 4,
                left_stroke_width: 2,

                center_fill_gradient: [
                    [0.0, "rgba(6,11,17,1.0)"],
                    [1.0, "rgba(11,43,84,0.9)"]
                ],
                center_stroke_gradient: [
                    [0.0, "rgba(100,162,209,0.0)"],
                    [0.3, "rgba(100,162,209,0.6)"],
                    [1.0, "rgba(100,162,209,0.9)"]
                ],
                center_stroke_width: 1,

                right_fill_color: "rgba(9,27,50,0.9)",
                right_stroke_color: "rgba(0,182,0,0.6)",
                right_stroke_width: 1,

                decorate_color: ["red", "green", "blue"],

                ...config
            };
        }

        return config;
    },
    async Update(style: Element["_options"]["style"], master: Layout_frame_1) {
        const config = CALYNUI_LAYOUT_FRAME1_BUILTIN_000002.config(master);
        const content_width = master.width.width;
        const content_height = master.height.height;

        if (master["_last_content_width"] != content_width || master["_last_content_height"] != content_height) {
            master["_last_content_width"] = content_width;
            master["_last_content_height"] = content_height;

            const t1 = 0.5;
            const t2 = 0.8;

            const r1 = 0.5;
            const r2 = r1 - (t2 - t1) * content_height / content_width;
            const r4 = r2 - content_height / content_width;
            const r5 = r4 - (1.0 - t2) * content_height / content_width;
            const r3 = r5 + content_height / content_width;

            const cache = master["_cache"];

            cache.t1 = t1;
            cache.t2 = t2;

            cache.r1 = r1;
            cache.r2 = r2;
            cache.r3 = r3;
            cache.r4 = r4;
            cache.r5 = r5;

            const panel0 = master["_panels"][0];
            const panel0_options = panel0["_options"];

            panel0_options.x = config.padding[0];
            panel0_options.y = config.padding[1];
            panel0_options.z = content_width * r5 - config.padding[0] - config.padding[2];
            panel0_options.w = content_height - config.padding[1] - config.padding[3];

            panel0["_updateTS"]++;

            const panel1 = master["_panels"][1];
            const panel1_options = panel1["_options"];

            panel1_options.x = content_width * r1 + config.padding[0];
            panel1_options.y = config.padding[1];
            panel1_options.z = content_width * r1 - config.padding[0] - config.padding[2];
            panel1_options.w = content_height * t2 - config.padding[1] - config.padding[3];

            panel1["_updateTS"]++;
        }

        return true;
    },
    async Draw(pass: number, style: Element["_options"]["style"], master: Layout_frame_1) {
        if (pass == 0) {
            const ctx = master["_canvas"].renderer;
            const scale = master["_canvas"].canvas_scale;
            const cache = master["_cache"];
            const config = CALYNUI_LAYOUT_FRAME1_BUILTIN_000002.config(master);

            const x = Math.ceil(scale * master["_rect"][0]);
            const y = Math.ceil(scale * master["_rect"][1]);
            const w = Math.ceil(scale * master["_rect"][2]);
            const h = Math.ceil(scale * master["_rect"][3]);

            if (cache.x != x || cache.y != y || cache.w != w || cache.h != h) {
                cache.x = x;
                cache.y = y;
                cache.w = w;
                cache.h = h;

                const left_fill_gradient = ctx.createLinearGradient(x, y, x, y + h);
                const left_stroke_gradient = ctx.createLinearGradient(x, y, x, y + h);
                const center_fill_gradient = ctx.createLinearGradient(x, y, x, y + h);
                const center_stroke_gradient = ctx.createLinearGradient(x, y, x, y + h);

                for (let stop of config.left_fill_gradient) {
                    left_fill_gradient.addColorStop(stop[0], stop[1]);
                }

                for (let stop of config.left_stroke_gradient) {
                    left_stroke_gradient.addColorStop(stop[0], stop[1]);
                }

                for (let stop of config.center_fill_gradient) {
                    center_fill_gradient.addColorStop(stop[0], stop[1]);
                }

                for (let stop of config.center_stroke_gradient) {
                    center_stroke_gradient.addColorStop(stop[0], stop[1]);
                }

                cache.left_fill_gradient = left_fill_gradient;
                cache.left_stroke_gradient = left_stroke_gradient;
                cache.center_fill_gradient = center_fill_gradient;
                cache.center_stroke_gradient = center_stroke_gradient;

                if (config.bg_image && !cache.bg_image) {
                    cache.bg_image = await master["_system"]["_global"].LoadImage(config.bg_image, "anonymous");
                }
            }

            ctx.save();

            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + w * cache.r5, y + h);
            ctx.lineTo(x + w * cache.r3, y);
            ctx.lineTo(x, y);
            ctx.closePath();

            if (cache.bg_image) {
                ctx.save();

                ctx.clip();

                const panel_w = x + w * cache.r3;
                const panel_h = h;
                const image_w = cache.bg_image.width;
                const image_h = Math.min(image_w * panel_h / panel_w, cache.bg_image.height);
                const image_y = 0;

                ctx.globalAlpha = 0.9;
                ctx.drawImage(cache.bg_image, 0, image_y, image_w, image_h, x, y, panel_w, panel_h);

                ctx.restore();
            }

            ctx.fillStyle = cache.left_fill_gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x + w * cache.r4, y + h * cache.t2);
            ctx.lineTo(x + w * cache.r2, y + h * cache.t2);
            ctx.lineTo(x + w * cache.r1, y + h * cache.t1);
            ctx.lineTo(x + w * cache.r1, y);
            ctx.lineTo(x + w * cache.r3, y);
            ctx.closePath();
            ctx.fillStyle = cache.center_fill_gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x + w * cache.r2, y + h * cache.t2);
            ctx.lineTo(x + w * cache.r1, y + h * cache.t1);
            ctx.lineTo(x + w * cache.r1, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h * cache.t2);
            ctx.closePath();
            ctx.fillStyle = config.right_fill_color;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + w * cache.r5, y + h);
            ctx.lineTo(x + w * cache.r3, y);
            ctx.lineWidth = config.left_stroke_width;
            ctx.strokeStyle = cache.left_stroke_gradient;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + w * cache.r4, y + h * cache.t2);
            ctx.lineTo(x + w * cache.r2, y + h * cache.t2);
            ctx.lineTo(x + w * cache.r1, y + h * cache.t1);
            ctx.lineTo(x + w * cache.r1, y);
            ctx.lineWidth = config.center_stroke_width;
            ctx.strokeStyle = cache.center_stroke_gradient;
            ctx.stroke();

            ctx.restore();
        }
    }
};

Layout_frame_1.designs[CALYNUI_LAYOUT_FRAME1_BUILTIN_000001.guid] = CALYNUI_LAYOUT_FRAME1_BUILTIN_000001;
Layout_frame_1.designs[CALYNUI_LAYOUT_FRAME1_BUILTIN_000002.guid] = CALYNUI_LAYOUT_FRAME1_BUILTIN_000002;