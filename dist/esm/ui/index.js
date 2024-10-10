export class CalynUI {
    constructor(_global) {
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
    }
    async Init() {
        return this;
    }
    InitEventSystem() {
        const system = this;
        const pointer_event_names = ["click", "dblclick", "mousewheel", "wheel", "pointerout", "pointerup", "pointerdown", "pointermove", "contextmenu"];
        let pointerdown_target = null;
        for (let name_ of pointer_event_names) {
            const name = name_;
            system._global.app.AddEventListener(name, async (event) => {
                const hits = system.canvas.Hit(event.layerX, event.layerY);
                if (hits.length > 0) {
                    const target = hits[hits.length - 1];
                    const dom = target.element._dom;
                    if (dom) {
                        const proxy = target.element._echart.getZr().handler.proxy;
                        const handler = proxy._localHandlerScope.domHandlers;
                        event.zrX = Math.floor(target.x * dom.width);
                        event.zrY = Math.floor(target.y * dom.height);
                        if (name == "wheel" || name == "mousewheel") {
                            const wheelDelta = event.wheelDelta;
                            event.zrDelta = wheelDelta ? wheelDelta / 120 : -(event.detail || 0) / 3;
                        }
                        handler[name].call(proxy, event);
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
                    system.highlight_id = pointerdown_target.element.id;
                }
                else {
                    system.highlight_id = 0;
                }
            });
        }
    }
    DropAdd(x, y, type, option) {
        const hits = this.canvas.Hit(x, y);
        if (hits.length > 0) {
            const parent = hits[hits.length - 1];
            if (parent.type == "panel") {
                parent.AddChild(option);
            }
        }
    }
    CreateElement(canvas, option) {
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
        return element;
    }
    async Draw(canvas, window, renderer, rect) {
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
    get canvas() {
        return this._canvas;
    }
    set canvas(_canvas) {
        this._canvas = _canvas;
    }
    _global;
    show_id_color;
    highlight_id;
    _canvas;
    _elementList;
    _createrLut;
}
export class Element {
    constructor(system, canvas, id, options) {
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
        this._options.guid = options.guid || "";
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
    async Update(style) {
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
            this._scroll = this._scroll || { scroll_x: 0, scroll_y: 0 };
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
                    ctx.fillRect(x + (this._scroll.scroll_x / this._scroll.scroll_width) * (1 - w_scale) * w, y + h - 4, w * w_scale, 2);
                }
                if (this._scroll.scroll_height > 0) {
                    const h_scale = this._rect[3] / this._scroll.children_height;
                    ctx.fillStyle = "white";
                    ctx.fillRect(x + w - 4, y + (this._scroll.scroll_y / this._scroll.scroll_height) * (1 - h_scale) * h, 2, h * h_scale);
                }
                ctx.restore();
            }
            await this.Draw(1, style);
        }
        return true;
    }
    async Draw(pass, style) {
    }
    AddChild(option) {
        const element = this._system.CreateElement(this._canvas, option);
        element._parent = this;
        this._children.push(element);
        this._updateTS++;
        return element;
    }
    OnDrag(width, height, event) {
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
    get id() {
        return this._id;
    }
    get guid() {
        return this._options.guid;
    }
    get type() {
        return this._type;
    }
    get active() {
        return this._active;
    }
    set active(b) {
        if (this._active != b) {
            this._active = b;
            this._updateTS++;
        }
    }
    get aspect_mode() {
        if (this._options.aspect_mode == "fit_in") {
            return this.aspect_ratio > this._parent.aspect_ratio ? "width_ctrl" : "height_ctrl";
        }
        else if (this._options.aspect_mode == "fit_out") {
            return this.aspect_ratio > this._parent.aspect_ratio ? "height_ctrl" : "width_ctrl";
        }
        return this._options.aspect_mode;
    }
    get aspect_ratio() {
        if (this._options.aspect_mode == "none") {
            return this.width.width / this.height.height;
        }
        return this._options.aspect_ratio || 1.0;
    }
    get width() {
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
        let width = 0;
        if (this.aspect_mode == "height_ctrl") {
            if (options.auto_height) {
                console.error("布局异常：同一元素中height_ctrl和auto_height不能同时设置！");
            }
            else {
                width = this.height.height * this.aspect_ratio;
            }
        }
        else if (options.auto_width) {
            if (this.aspect_mode == "width_ctrl") {
                console.error("布局异常：同一元素中width_ctrl和auto_width不能同时设置！");
            }
            else {
                width = this.children_occ_width;
            }
        }
        else if (options.horiz_align == "stretch") {
            width = this._parent.width.width - options.x - options.z;
        }
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
    get children_occ_width() {
        let occ_width = 0;
        for (let child of this.children) {
            if (child._options.horiz_align != "stretch") {
                const child_width = child.width;
                if (occ_width < child_width.occ_width) {
                    occ_width = child_width.occ_width;
                }
            }
        }
        return occ_width;
    }
    get height() {
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
        let height = 0;
        if (this.aspect_mode == "width_ctrl") {
            if (options.auto_width) {
                console.error("布局异常：同一元素中width_ctrl和auto_width不能同时设置！");
            }
            else {
                height = this.width.width / this.aspect_ratio;
            }
        }
        else if (options.auto_height) {
            if (this.aspect_mode == "height_ctrl") {
                console.error("布局异常：同一元素中height_ctrl和auto_height不能同时设置！");
            }
            else {
                height = this.children_occ_height;
            }
        }
        else if (options.vert_align == "stretch") {
            height = this._parent.height.height - options.y - options.w;
        }
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
    get children_occ_height() {
        let occ_height = 0;
        for (let child of this.children) {
            if (child._options.vert_align != "stretch") {
                const child_height = child.height;
                if (occ_height < child_height.occ_height) {
                    occ_height = child_height.occ_height;
                }
            }
        }
        return occ_height;
    }
    get children() {
        return this._children;
    }
    get style() {
        return this._options.style || {};
    }
    _system;
    _canvas;
    _parent;
    _children;
    _id;
    _id_color;
    _type;
    _active;
    _rect;
    _updateTS;
    _currentTS;
    _parentTS;
    _style;
    _width;
    _height;
    _scroll;
    _options;
}
export class Component extends Element {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const component = options && options.component;
        this._options.component = {
            ...component
        };
    }
}
export class Panel extends Element {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
    }
}
export class Layout extends Panel {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const layout = options && options.layout;
        this._options.layout = {
            static: layout.static || false
        };
    }
}
export class Canvas extends Panel {
    constructor(system, __, id, options) {
        super(system, __, id, options);
        const canvas = options && options.canvas;
        const width = canvas.width || 1920;
        const height = canvas.height || 1080;
        this._canvas = this;
        this._options.canvas = {
            width: width,
            height: height
        };
        this._parent = {
            _updateTS: 0,
            _currentTS: 0,
            _rect: [0, 0, width, height],
            active: true,
            aspect_ratio: width / height,
            width: { width: width, occ_width: width, timestrap: 0 },
            height: { height: height, occ_height: height, timestrap: 0 }
        };
        this._width.width = width;
        this._width.occ_width = width;
        this._height.height = height;
        this._height.occ_height = height;
        this._Update = Element.prototype.Update.bind(this);
    }
    async Update(style, window, renderer, rect) {
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
        const parent = this._parent;
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
    Foreach(func) {
        function For(element) {
            if (func(element)) {
                for (let child of element.children) {
                    For(child);
                }
            }
        }
        For(this);
    }
    Hit(x, y) {
        const elements = [];
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
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get window() {
        let window = this._cur_window || this._window;
        if (!window) {
            window = this._window = this._system["_global"].CreateCanvas(this.canvas_width, this.canvas_height);
        }
        return window;
    }
    get renderer() {
        let renderer = this._cur_renderer || this._renderer;
        if (!renderer) {
            renderer = this._cur_renderer = this.window.getContext("2d");
        }
        return renderer;
    }
    get canvas_width() {
        return this._options.canvas.width;
    }
    get canvas_height() {
        return this._options.canvas.height;
    }
    get canvas_scale() {
        return this._scale;
    }
    _Update;
    _window;
    _renderer;
    _cur_window;
    _cur_renderer;
    _scale;
}
export class Component_image extends Component {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const image = options && options.component && options.component.image;
        this._options.component.image = {
            url: image.url
        };
        this._Update = Element.prototype.Update.bind(this);
    }
    async Update(style) {
        if (!this._image) {
            this._image = await this._system["_global"].LoadImage(this._options.component.image.url, "anonymous");
        }
        return this._Update(style);
    }
    async Draw(pass, style) {
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
            else if (this._image.svg) {
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y);
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x, y + h);
                ctx.closePath();
                ctx.fill(this._image);
            }
            else {
                ctx.drawImage(this._image, 0, 0, this._image.width, this._image.height, x, y, w, h);
            }
        }
    }
    get aspect_ratio() {
        return this.children_occ_width / this.children_occ_height;
    }
    get children_occ_width() {
        return this._image ? this._image.width : 64;
    }
    get children_occ_height() {
        return this._image ? this._image.height : 64;
    }
    _Update;
    _image;
}
export class Component_text extends Component {
    constructor(system, canvas, id, options) {
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
    async Draw(pass, style) {
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
            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
            ctx.font = settings.font;
            ctx.fillStyle = style.font_color;
            for (let text of settings.dynamic_lines) {
                ctx.fillText(text, x, y + settings.line_actualBoundingBoxAscent);
                y += stride;
            }
        }
    }
    get multi_line_settings() {
        const settings = this._multi_line_settings;
        const text = this._options.component.text;
        const ctx = this._canvas.renderer;
        const font_size_ = this.style.font_size || this._parent["_style"].font_size;
        const scale = this._canvas.canvas_scale;
        const font_size = Math.ceil(font_size_ * scale);
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
        if (!this._options.auto_width) {
            ctx.font = settings.font;
            const tolerance = this._system["_global"].MeasureText("我", ctx);
            const width = this.get_width();
            const line_width = (width.width - text.padding[0] - text.padding[2]) * this._canvas.canvas_scale - tolerance.width * 0.5;
            if (settings.line_width > line_width) {
                settings.line_width = line_width;
                settings.dynamic_lines = [];
                const Wrap = (text_) => {
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
                };
                for (let text of settings.default_lines) {
                    const lines = Wrap(text);
                    settings.dynamic_lines.push(...lines);
                }
            }
        }
        return settings;
    }
    get children_occ_width() {
        const text = this._options.component.text;
        const settings = this.multi_line_settings;
        const occ_width = settings.line_width / this._canvas.canvas_scale + text.padding[0] + text.padding[2];
        return occ_width;
    }
    get children_occ_height() {
        const text = this._options.component.text;
        const settings = this.multi_line_settings;
        let occ_height = settings.line_height / this._canvas.canvas_scale + text.padding[1] + text.padding[3];
        if (text.multi_line) {
            occ_height += (settings.line_height / this._canvas.canvas_scale + text.line_spacing) * (settings.dynamic_lines.length - 1);
        }
        return occ_height;
    }
    set text(value) {
        const text = this._options.component.text;
        if (text.text != value) {
            text.text = value;
            this._updateTS++;
        }
    }
    get_width;
    get_height;
    _multi_line_settings;
}
export class Component_button extends Component {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const button = options && options.component && options.component.button;
        this._options.component.button = {
            icon: button.icon,
            text: button.text,
            spacing: button.spacing || 8
        };
        if (button.icon) {
            this._icon = this.AddChild({
                creator: "Component_image",
                component: {
                    image: {
                        url: button.icon
                    }
                }
            });
        }
        if (button.text) {
            this._text = this.AddChild({
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
    async Update(style) {
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
    get children_occ_width() {
        return this.content_size.width + 16;
    }
    get children_occ_height() {
        return this.content_size.height + 16;
    }
    get content_size() {
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
    set text(value) {
        if (!this._text) {
            return;
        }
        this._text.text = value;
    }
    _Update;
    _icon;
    _text;
    _content_size;
}
export class Component_echart extends Component {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const echart = options && options.component && options.component.echart;
        this._options.component.echart = echart;
        this._Update = Element.prototype.Update.bind(this);
        this._dataset = this.echart_option.dataset;
    }
    async Update(style) {
        return this._Update(style);
    }
    async Draw(pass, style) {
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
                    this._echart.setOption(this.echart_option);
                }
                else {
                    if (!Deno) {
                        this._dom.width = w;
                        this._dom.height = h;
                        this._echart.resize({ width: w, height: h });
                    }
                }
                if (this.echart_option.dataset !== this._dataset) {
                    this.echart_option.dataset = this._dataset;
                    this._echart.setOption(this.echart_option);
                }
            }
            const image = this._dom;
            ctx.drawImage(image, 0, 0, image.width, image.height, x, y, w, h);
        }
    }
    get echart_option() {
        return this._options.component.echart;
    }
    _Update;
    _last_draw_width;
    _last_draw_height;
    _dom;
    _echart;
    _dataset;
}
export class Layout_grid extends Layout {
    constructor(system, canvas, id, options) {
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
            this._panels[i] = this.AddChild({
                creator: "Panel"
            });
        }
        this._Update = Element.prototype.Update.bind(this);
    }
    async Update(style) {
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
    get panels() {
        return this._panels;
    }
    _Update;
    _panels;
    _last_content_width;
    _last_content_height;
}
export class Layout_vert_list extends Layout {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const vert_list = options && options.layout && options.layout.vert_list;
        this._options.layout.vert_list = {
            spacing: vert_list.spacing || 4
        };
        this._Update = Element.prototype.Update.bind(this);
    }
    async Update(style) {
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
    get children_occ_width() {
        return this._last_content_width || this.width.width;
    }
    get children_occ_height() {
        return this._last_content_height || this.height.height;
    }
    _Update;
    _last_content_width;
    _last_content_height;
}
export class Layout_frame_1 extends Layout {
    constructor(system, canvas, id, options) {
        super(system, canvas, id, options);
        const frame_1 = options && options.layout && options.layout.frame_1;
        this._options.layout.frame_1 = { ...frame_1 };
        this._design = Layout_frame_1.designs[frame_1.design_guid];
        this._design.config(this, true);
        this._panels = [];
        for (let i = 0; i < this._design.panel_count; i++) {
            this._panels[i] = this.AddChild({
                creator: "Panel"
            });
        }
        this._Update = Element.prototype.Update.bind(this);
    }
    async Update(style) {
        await this._design.Update(style, this);
        return this._Update(style);
    }
    async Draw(pass, style) {
        return this._design.Draw(pass, style, this);
    }
    get panels() {
        return this._panels;
    }
    _Update;
    _panels;
    _last_content_width;
    _last_content_height;
    _design;
    _cache = {};
    static designs = {};
}
const CALYNUI_LAYOUT_FRAME1_BUILTIN_000001 = {
    guid: "CALYNUI_LAYOUT_FRAME1_BUILTIN_000001",
    label: "",
    panel_count: 1,
    config(master, init) {
        let options = master["_options"].layout.frame_1;
        let config = options.design_config;
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
    async Update(style, master) {
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
    async Draw(pass, style, master) {
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
    config(master, init) {
        let options = master["_options"].layout.frame_1;
        let config = options.design_config;
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
    async Update(style, master) {
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
    async Draw(pass, style, master) {
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
