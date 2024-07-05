import * as Miaoverse from "../mod.js";
/** UI系统。 */
export declare class CalynUI {
    /**
     * 构造函数。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 初始化UI系统。
     * @returns 返回UI系统接口。
     */
    Init(): Promise<this>;
    /**
     * 初始化UI事件系统。
     */
    InitEventSystem(): void;
    /**
     * 拖拽式往面板中添加子元素。
     * @param x 添加位置。
     * @param y 添加位置。
     * @param type 元素构造器类型。
     * @param option 元素初始化配置。
     */
    DropAdd(x: number, y: number, type: string, option?: Options): void;
    /**
     * 创建元素实例。
     * @param option 元素初始化配置。
     */
    CreateElement<T extends Element>(canvas: Canvas, option: Options): T;
    /**
     * 绘制指定画布内容到指定窗口的指定矩形区域。
     * @param canvas 指定画布。
     * @param window 指定窗口。
     * @param renderer 指定窗口渲染器。
     * @param rect 指定矩形区域。
     * @param aspectMode 画布宽高比约束模式。
     */
    Draw(canvas: Canvas, window?: HTMLCanvasElement, renderer?: CanvasRenderingContext2D, rect?: number[]): Promise<any>;
    /** 当前UI画布。 */
    get canvas(): Canvas;
    set canvas(_canvas: Canvas);
    /** 模块实例对象。 */
    _global: Miaoverse.Ploy3D;
    /** 是否显示元素颜色标识（编辑模式使用）。 */
    show_id_color: boolean;
    /** 需高亮提示的元素ID（编辑模式使用）。 */
    highlight_id: number;
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
export declare class Element {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Element["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<boolean>;
    /**
     * 绘制元素（派生类应当重写该方法）。
     * @param pass 绘制阶段。
     */
    Draw(pass: number, style: Element["_options"]["style"]): Promise<void>;
    /**
     * 添加子级元素。
     * @param option 子级元素配置。
     */
    AddChild<T extends Element>(option: Options): T;
    /**
     * 拖拽元素。
     * @param width 拖拽实际所在平面宽度。
     * @param height 拖拽实际所在平面高度。
     * @param event 鼠标事件对象。
     */
    OnDrag(width: number, height: number, event: MouseEvent & {
        deltaY?: number;
    }): void;
    /** 元素ID。 */
    get id(): number;
    /** 元素GUID。 */
    get guid(): string;
    /** 元素类型（"layout"，"canvas"都派生自"panel"，所以可以认为只有两大类"component"，"panel"）。 */
    get type(): "canvas" | "layout" | "panel" | "component";
    /** 元素是否激活。 */
    get active(): boolean;
    set active(b: boolean);
    /** 元素宽高比约束模式。 */
    get aspect_mode(): "none" | "width_ctrl" | "height_ctrl";
    /** 元素当前宽高比。 */
    get aspect_ratio(): number;
    /** 元素当前设计宽度。 */
    get width(): {
        /** 数据时间戳。 */
        timestrap: number;
        /** 内容区域设计宽度。 */
        width: number;
        /** 总占用设计宽度（包含边距）。 */
        occ_width: number;
    };
    /** 子级最大总占用设计宽度（包含子级边距，元素自动宽度或启用滚动条时需要计算子级最大总占用设计宽度）。 */
    get children_occ_width(): number;
    /** 元素当前设计高度。 */
    get height(): {
        /** 数据时间戳。 */
        timestrap: number;
        /** 内容区域设计高度。 */
        height: number;
        /** 总占用设计高度（包含边距）。 */
        occ_height: number;
    };
    /** 子级最大总占用设计高度（包含子级边距，元素自动高度或启用滚动条时需要计算子级最大总占用设计高度）。 */
    get children_occ_height(): number;
    /** 子级元素列表。 */
    get children(): Miaoverse.Element[];
    /** 样式设置。 */
    get style(): {
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
export declare class Component extends Element {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Component["_options"]);
    /** 控件配置。 */
    protected _options: Element["_options"] & {
        /** 控件配置选项。 */
        component?: {
            /** 可用于索引的位移名称。 */
            name?: string;
        };
    };
}
/** UI面板。 */
export declare class Panel extends Element {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Panel["_options"]);
    /** 面板配置。 */
    protected _options: Element["_options"] & {
        /** 面板配置选项。 */
        panel?: {};
    };
}
/** UI布局。 */
export declare class Layout extends Panel {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout["_options"]);
    /** 布局配置。 */
    protected _options: Panel["_options"] & {
        /** 布局配置选项。 */
        layout?: {
            /** 当前布局是静态布局还是动态布局（列表布局为动态布局）。 */
            static: boolean;
        };
    };
}
/** UI画布。 */
export declare class Canvas extends Panel {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, __: Canvas, id: number, options: Canvas["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"], window?: HTMLCanvasElement, renderer?: CanvasRenderingContext2D, rect?: number[]): Promise<any>;
    /**
     * 遍历画布中所有UI元素（先根顺序）。
     * @param func UI元素处理方法（返回值决定是否往当前元素子级遍历）。
     */
    Foreach(func: (element: Element) => boolean): void;
    /**
     * 获取当前光标命中的元素列表。
     * @param x 光标在画布中的X轴坐标。
     * @param y 光标在画布中的Y轴坐标。
     * @returns 返回命中的所有元素（元素深度递减）。
     */
    Hit(x: number, y: number): {
        element: Element;
        x: number;
        y: number;
    }[];
    /** 元素当前设计宽度。 */
    get width(): {
        /** 数据时间戳。 */
        timestrap: number;
        /** 内容区域设计宽度。 */
        width: number;
        /** 总占用设计宽度（包含边距）。 */
        occ_width: number;
    };
    /** 元素当前设计高度。 */
    get height(): {
        /** 数据时间戳。 */
        timestrap: number;
        /** 内容区域设计高度。 */
        height: number;
        /** 总占用设计高度（包含边距）。 */
        occ_height: number;
    };
    /** HTML画布元素。 */
    get window(): HTMLCanvasElement;
    /** HTML画布上下文。 */
    get renderer(): CanvasRenderingContext2D;
    /** 画布设计宽度。 */
    get canvas_width(): number;
    /** 画布设计高度。 */
    get canvas_height(): number;
    /** 画布绘制缩放。 */
    get canvas_scale(): number;
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
    protected _options: Panel["_options"] & {
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
export type Options = {
    creator: string;
} & (Component_image["_options"] | Component_text["_options"] | Component_button["_options"] | Component_echart["_options"] | Panel["_options"] | Layout["_options"] | Layout_grid["_options"] | Layout_vert_list["_options"] | Layout_frame_1["_options"] | Canvas["_options"]);
/** UI图片。 */
export declare class Component_image extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_image["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<any>;
    /**
     * 绘制元素。
     * @param pass 绘制阶段。
     */
    Draw(pass: number, style: Element["_options"]["style"]): Promise<void>;
    /** 元素当前宽高比。 */
    get aspect_ratio(): number;
    /** 文本占用宽度。 */
    get children_occ_width(): number;
    /** 文本占用高度。 */
    get children_occ_height(): number;
    /** 原UI元素更新逻辑。 */
    protected _Update: any;
    /** 图片资源。 */
    protected _image: HTMLImageElement;
    /** 控件配置。 */
    protected _options: Component["_options"] & {
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
export declare class Component_text extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_text["_options"]);
    /**
     * 绘制元素。
     * @param pass 绘制阶段。
     */
    Draw(pass: number, style: Element["_options"]["style"]): Promise<void>;
    /** 多行文本设置。 */
    get multi_line_settings(): {
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
    /** 文本占用宽度。 */
    get children_occ_width(): number;
    /** 文本占用高度。 */
    get children_occ_height(): number;
    /** 设置文本。 */
    set text(value: string);
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
    protected _options: Component["_options"] & {
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
export declare class Component_button extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_button["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<any>;
    /** 文本占用宽度。 */
    get children_occ_width(): number;
    /** 文本占用高度。 */
    get children_occ_height(): number;
    /** 内容尺寸。 */
    get content_size(): {
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
    /** 设置按钮文本。 */
    set text(value: string);
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
    protected _options: Component["_options"] & {
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
export declare class Component_echart extends Component {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Component_echart["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<any>;
    /**
     * 绘制元素。
     * @param pass 绘制阶段。
     */
    Draw(pass: number, style: Element["_options"]["style"]): Promise<void>;
    /** 图表样式配置。 */
    get echart_option(): Miaoverse.echarts.EChartsOption;
    /** 原UI元素更新逻辑。 */
    protected _Update: any;
    /** 上一内容面板绘制宽度。 */
    protected _last_draw_width: number;
    /** 上一内容面板绘制高度。 */
    protected _last_draw_height: number;
    /** 图表画布。 */
    private _dom;
    /** 图表实例。 */
    private _echart;
    /** 数据集（使用键值对这种最简单常见的数据格式）。 */
    private _dataset;
    /** 控件配置。 */
    protected _options: Component["_options"] & {
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
export declare class Layout_grid extends Layout {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout_grid["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<any>;
    /** 布局中的面板列表。 */
    get panels(): Miaoverse.Panel[];
    /** 原UI元素更新逻辑。 */
    protected _Update: any;
    /** 布局中的面板列表。 */
    protected _panels: Panel[];
    /** 上一内容面板宽度。 */
    protected _last_content_width: number;
    /** 上一内容面板高度。 */
    protected _last_content_height: number;
    /** 布局配置。 */
    protected _options: Layout["_options"] & {
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
export declare class Layout_vert_list extends Layout {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout_vert_list["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * 当前布局宽高、子级宽高使用标准方法确定，列表布局仅确定子级坐标。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<any>;
    /** 子级占用宽度。 */
    get children_occ_width(): number;
    /** 子级占用高度。 */
    get children_occ_height(): number;
    /** 原UI元素更新逻辑。 */
    protected _Update: any;
    /** 上一内容面板宽度。 */
    protected _last_content_width: number;
    /** 上一内容面板高度。 */
    protected _last_content_height: number;
    /** 布局配置。 */
    protected _options: Layout["_options"] & {
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
export declare class Layout_frame_1 extends Layout {
    /**
     * 构造函数。
     * @param system UI系统实例。
     * @param canvas UI画布实例。
     * @param id 实例ID。
     * @param options 可选的初始化数据。
     */
    constructor(system: CalynUI, canvas: Canvas, id: number, options: Layout_frame_1["_options"]);
    /**
     * 更新元素绘制范围参数（先根遍历更新）。
     * @returns 返回是否绘制当前元素。
     */
    Update(style: Element["_options"]["style"]): Promise<any>;
    /**
     * 绘制元素（派生类应当重写该方法）。
     * @param pass 绘制阶段。
     */
    Draw(pass: number, style: Element["_options"]["style"]): Promise<void>;
    /** 布局中的面板列表。 */
    get panels(): Miaoverse.Panel[];
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
    protected _cache: any;
    /** 布局配置。 */
    protected _options: Layout["_options"] & {
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
    static designs: Record<string, Layout_frame_1["_design"]>;
}
