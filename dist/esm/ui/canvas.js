export class Renderer2D {
    constructor(_global) {
        this._global = _global;
        this._frameTS = 1;
        this._drawList = [];
        this._drawData = null;
        this._styleLut = {};
    }
    async Init() {
        this.CreateStyle2D("white");
        return this;
    }
    CreateCanvas(width, height) {
        return new Canvas2D(this, width, height);
    }
    CreateStyle2D(color) {
        let style = this._styleLut[color];
        if (style) {
            return style;
        }
        style = new Style2D(this, color);
        style.type = 0;
        style.color = 0xFF00FF;
        this._styleLut[color] = style;
        return style;
    }
    BeginFrame() {
        this._frameTS++;
        this._drawList = [];
    }
    AddDraw(canvas) {
        if (this._drawList.indexOf(canvas) == -1) {
            this._drawList.push(canvas);
            canvas.data.frameTS = this.frameTS;
        }
    }
    EndFrame() {
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
            total_instanceCount = (total_instanceCount + 15) >> 4 << 4;
            total_transformCount = (total_transformCount + 7) >> 3 << 3;
            total_geometryCount = (total_geometryCount + 15) >> 4 << 4;
            total_styleCount = (total_styleCount + 7) >> 3 << 3;
        }
        let byteLength = 0;
        let instancesPtr = byteLength;
        byteLength += 16 * total_instanceCount;
        let transformsPtr = byteLength;
        byteLength += 32 * total_transformCount;
        let geometriesPtr = byteLength;
        byteLength += 16 * total_geometryCount;
        let stylesPtr = byteLength;
        byteLength += 32 * total_styleCount;
        byteLength = byteLength + 16384;
        byteLength = (byteLength + 0xFFFFF) & 0xFFF00000;
        if (!this._drawData || byteLength > this._drawData.capacity) {
            if (this._drawData) {
                this._global.device.FreeBuffer(this._drawData.bufferID);
            }
            const buffer = new ArrayBuffer(byteLength);
            const bufferID = this._global.device.CreateBuffer(1, byteLength);
            this._drawData = {
                buffer,
                bufferID,
                capacity: byteLength
            };
        }
        const instances = this._drawData.instances = new Uint32Array(this._drawData.buffer, instancesPtr, 4 * total_instanceCount);
        const transforms = this._drawData.transforms = new Float32Array(this._drawData.buffer, transformsPtr, 8 * total_transformCount);
        const geometries = this._drawData.geometries = new Uint32Array(this._drawData.buffer, geometriesPtr, 4 * total_geometryCount);
        const styles = this._drawData.styles = new Uint32Array(this._drawData.buffer, stylesPtr, 8 * total_styleCount);
        for (let canvas of this._drawList) {
            const data = canvas["data"];
            let offset = data.instancesOffset * 4;
            let count = data.instanceCount * 4;
            let array = data.instances;
            for (let i = 0; i < count; i++) {
                instances[offset + i] = array[i];
            }
            offset = data.stylesOffset;
            count = data.styleCount;
            for (let i = 0; i < count; i++) {
                const o8 = (offset + i) * 8;
                array = data.styles[i]["_data"];
                for (let j = 0; j < 8; j++) {
                    styles[o8 + j] = array[j];
                }
            }
            offset = data.transformsOffset * 8;
            count = data.transformCount * 8;
            array = data.transforms;
            for (let i = 0; i < count; i++) {
                transforms[offset + i] = array[i];
            }
            offset = data.geometriesOffset * 4;
            count = data.geometryCount * 4;
            array = data.geometries;
            for (let i = 0; i < count; i++) {
                geometries[offset + i] = array[i];
            }
        }
        this._global.device.WriteBuffer(this._drawData.bufferID, 0, this._drawData.buffer, 0, styles.byteOffset + styles.byteLength);
    }
    get frameTS() {
        return this._frameTS;
    }
    get defaultStyle() {
        return this._styleLut["white"];
    }
    _global;
    _frameTS;
    _drawList;
    _drawData;
    _styleLut;
}
export class Path2D {
    constructor() {
    }
    Rect(mode, x, y, w, h) {
        let n0 = 0;
        n0 += 0 << 16;
        n0 += (mode & 3) << 8;
        n0 += 1;
        w = Math.floor(w * 0.5);
        h = Math.floor(h * 0.5);
        let n2 = (h << 16) + w;
        x = Math.floor(x + w);
        y = Math.floor(y + h);
        let n1 = (y << 16) + x;
        let n3 = 0;
        this.type = 1;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }
    Arc(x, y, radius, startAngle, endAngle) {
        let n0 = 0;
        n0 += 0 << 16;
        n0 += (0 & 3) << 8;
        n0 += 2;
        x = Math.floor(x);
        y = Math.floor(y);
        let n1 = (y << 16) + x;
        startAngle = Math.floor(startAngle / (2.0 * Math.PI)) * 65535;
        endAngle = Math.floor(endAngle / (2.0 * Math.PI)) * 65535;
        let n2 = (endAngle << 16) + startAngle;
        radius = Math.ceil(radius);
        let n3 = (0 << 16) + radius;
        this.type = 2;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }
    set mode(value) {
        this.geometries[0] = (this.geometries[0] & 0xFFFF00FF) | ((value & 0xFF) << 8);
    }
    get mode() {
        return (this.geometries[0] >> 8) & 0xFF;
    }
    type;
    applied;
    geometryCount;
    geometries;
}
export class Style2D {
    constructor(renderer, id) {
        this._renderer = renderer;
        this._id = id;
        this._data = new Uint32Array(8);
    }
    get id() {
        return this._id;
    }
    get type() {
        return this._data[0] & 0xFF;
    }
    set type(value) {
        this._data[0] = (this._data[0] & 0xFFFFFF00) | (value & 0xFF);
    }
    get gradient_stop_count() {
        return (this._data[0] >> 8) & 0xFF;
    }
    get pattern_texture_layer() {
        return (this._data[0] >> 8) & 0xFF;
    }
    get color() {
        return this._data[1];
    }
    set color(value) {
        this._data[1] = value;
    }
    get gradient_radial_start_radius() {
        return this._data[1] & 0xFFFF;
    }
    get gradient_conic_start_angle() {
        return ((this._data[1] & 0xFFFF) / 65535) * (2 * Math.PI);
    }
    get pattern_rotation() {
        return ((this._data[1] & 0xFFFF) / 65535) * (2 * Math.PI);
    }
    get gradient_radial_end_radius() {
        return (this._data[1] >> 16) & 0xFFFF;
    }
    get gradient_conic_end_angle() {
        return (((this._data[1] >> 16) & 0xFFFF) / 65535) * (2 * Math.PI);
    }
    get pattern_scale() {
        const data = (this._data[1] >> 16) & 0xFFFF;
        if (data < 32768) {
            return data / 32767;
        }
        else {
            return 1.0 + (data - 32768) / 32767 * 256;
        }
    }
    get gradient_linear_start() {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }
    get gradient_radial_start_center() {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }
    get gradient_conic_center() {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }
    get pattern_uv_offset() {
        const x = (this._data[2]) & 0xFFFF;
        const y = (this._data[2] >> 16) & 0xFFFF;
        return [x, y];
    }
    get gradient_linear_end() {
        const x = (this._data[3]) & 0xFFFF;
        const y = (this._data[3] >> 16) & 0xFFFF;
        return [x, y];
    }
    get gradient_radial_end_center() {
        const x = (this._data[3]) & 0xFFFF;
        const y = (this._data[3] >> 16) & 0xFFFF;
        return [x, y];
    }
    get pattern_uv_scale() {
        const x = (this._data[3]) & 0xFFFF;
        const y = (this._data[3] >> 16) & 0xFFFF;
        return [x, y];
    }
    get gradient_stops_offset() {
        const x = (this._data[4]) & 0xFF;
        const y = (this._data[4] >> 8) & 0xFF;
        const z = (this._data[4] >> 16) & 0xFF;
        return [x / 255, y / 255, z / 255];
    }
    get gradient_stops_color() {
        return [this._data[5], this._data[6], this._data[7]];
    }
    _renderer;
    _id;
    _data;
}
export class Canvas2D {
    constructor(renderer, width, height) {
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
    Flush() {
        const data = this.data;
        if (data.frameTS != this.renderer.frameTS) {
            data.frameTS = this.renderer.frameTS;
            data.instancesOffset = 0;
            data.instanceCount = 0;
            data.transformsOffset = 0;
            data.transformCount = 0;
            data.geometriesOffset = 0;
            data.geometryCount = 0;
            data.stylesOffset = 0;
            data.styleCount = 0;
            data.batches = [];
            data.batch = null;
            this.renderer.AddDraw(this);
        }
        if (!data.path) {
            return;
        }
        if (data.batch == null ||
            (data.instanceCount - data.batch.instancesOffset) >= 1024 ||
            (data.transformCount - data.batch.transformsOffset) >= 512 ||
            (data.geometryCount + data.path.geometryCount - data.batch.geometriesOffset) > 1024 ||
            Object.keys(data.batch.stylesLut).length > 510) {
            data.instanceCount = (data.instanceCount + 15) >> 4 << 4;
            data.transformCount = (data.transformCount + 7) >> 3 << 3;
            data.geometryCount = (data.geometryCount + 15) >> 4 << 4;
            data.styleCount = (data.styleCount + 7) >> 3 << 3;
            data.batch = {
                instancesCount: 0,
                instancesOffset: data.instanceCount,
                transformsOffset: data.transformCount,
                geometriesOffset: data.geometryCount,
                stylesOffset: data.styleCount,
                stylesLut: {}
            };
            data.batches.push(data.batch);
        }
        let instance = data.instanceCount;
        if (data.transform.applied == false) {
            data.transform.applied = true;
            const i8 = data.transformCount * 8;
            data.transforms[i8 + 0] = data.transform.data[0];
            data.transforms[i8 + 1] = data.transform.data[1];
            data.transforms[i8 + 2] = data.transform.data[2];
            data.transforms[i8 + 3] = data.transform.data[3];
            data.transforms[i8 + 4] = data.transform.data[4];
            data.transforms[i8 + 5] = data.transform.data[5];
            data.transforms[i8 + 6] = data.transform.data[6];
            data.transforms[i8 + 7] = data.transform.data[7];
            data.transformCount++;
        }
        let transform = data.transformCount - 1;
        let geometryBeg = data.geometryCount;
        let geometryEnd = geometryBeg + data.path.geometryCount;
        let geometryType = data.path.type;
        if (data.path.applied == false) {
            data.path.applied = true;
            const rcount = data.path.geometryCount;
            const rarray = data.path.geometries;
            const warray = data.geometries;
            const woffset = data.geometryCount;
            for (let i = 0; i < rcount; i++) {
                const r4 = i * 4;
                const w4 = (woffset + i) * 4;
                warray[w4 + 0] = rarray[r4 + 0];
                warray[w4 + 1] = rarray[r4 + 1];
                warray[w4 + 2] = rarray[r4 + 2];
                warray[w4 + 3] = rarray[r4 + 3];
            }
            data.geometryCount += rcount;
        }
        let fillStyle = data.batch.stylesLut[data.fillStyle.id];
        if (fillStyle == undefined) {
            fillStyle = data.styleCount;
            data.batch.stylesLut[data.fillStyle.id] = fillStyle;
            data.styles[fillStyle] = data.fillStyle;
            data.styleCount++;
        }
        let strokeStyle = data.batch.stylesLut[data.strokeStyle.id];
        if (strokeStyle == undefined) {
            strokeStyle = data.styleCount;
            data.batch.stylesLut[data.strokeStyle.id] = strokeStyle;
            data.styles[strokeStyle] = data.strokeStyle;
            data.styleCount++;
        }
        transform -= data.batch.transformsOffset;
        geometryBeg -= data.batch.geometriesOffset;
        geometryEnd -= data.batch.geometriesOffset;
        fillStyle -= data.batch.stylesOffset;
        strokeStyle -= data.batch.stylesOffset;
        data.instances[instance * 4 + 0] = (transform << 16) + geometryType;
        data.instances[instance * 4 + 1] = (geometryEnd << 16) + geometryBeg;
        data.instances[instance * 4 + 2] = (strokeStyle << 16) + fillStyle;
        data.instances[instance * 4 + 3] = this.data.lineWidth & 0xFF;
        data.batch.instancesCount++;
        data.instanceCount++;
        {
            let index = data.batch.instancesOffset * 4 + 3;
            let count = (data.instances[index] & 0xFFFF) | (data.batch.instancesCount << 16);
            data.instances[index] = count;
        }
    }
    Draw(queue, method, params) {
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
        const binding = context.CreateBindGroupCustom(queue.activeG2, [
            {
                binding: 0,
                resource: {
                    buffer: buffer.buffer,
                    offset: offset0,
                    size: 16384
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: buffer.buffer,
                    offset: offset1,
                    size: 16384
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: buffer.buffer,
                    offset: offset2,
                    size: 16384
                }
            },
            {
                binding: 3,
                resource: {
                    buffer: buffer.buffer,
                    offset: offset3,
                    size: 16384
                }
            }
        ]);
        if (!binding) {
            return;
        }
        queue.passEncoder.setBindGroup(3, binding.binding);
        if (method == "drawIndexed") {
            queue.passEncoder.drawIndexed(params[0], params[1], params[2], params[3], params[4]);
        }
        else if (method == "draw") {
            queue.passEncoder.draw(params[0], params[1], params[2], params[3]);
        }
    }
    get canvas() {
        throw "TODO: Canvas.canvas!";
    }
    getContextAttributes() {
        throw "TODO: Canvas.getContextAttributes!";
    }
    set globalAlpha(value) {
        throw "TODO: Canvas.globalAlpha!";
    }
    get globalAlpha() {
        throw "TODO: Canvas.globalAlpha!";
    }
    set globalCompositeOperation(value) {
        throw "TODO: Canvas.globalCompositeOperation!";
    }
    get globalCompositeOperation() {
        throw "TODO: Canvas.globalCompositeOperation!";
    }
    drawImage(image, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
        throw "TODO: Canvas.drawImage!";
    }
    beginPath() {
        throw "TODO: Canvas.beginPath!";
    }
    clip(path_or_rule, fillRule) {
        throw "TODO: Canvas.clip!";
    }
    fill(path_or_rule, fillRule) {
        if (path_or_rule) {
            throw "TODO: Canvas.fill!";
        }
        if (!this.data.path) {
            return;
        }
        this.data.path.mode = 1;
        this.Flush();
    }
    isPointInPath(path_or_x, x_or_y, y_or_rule, fillRule) {
        throw "TODO: Canvas.fillStyle!";
    }
    isPointInStroke(path_or_x, x_or_y, y) {
        throw "TODO: Canvas.isPointInStroke!";
    }
    stroke(path) {
        if (path) {
            throw "TODO: Canvas.stroke!";
        }
        if (!this.data.path) {
            return;
        }
        this.data.path.mode = 2;
        this.Flush();
    }
    set fillStyle(value) {
        if (typeof value == "string") {
            this.data.fillStyle = this.renderer.CreateStyle2D(value);
        }
    }
    get fillStyle() {
        throw "TODO: Canvas.fillStyle!";
    }
    set strokeStyle(value) {
        if (typeof value == "string") {
            this.data.strokeStyle = this.renderer.CreateStyle2D(value);
        }
    }
    get strokeStyle() {
        throw "TODO: Canvas.strokeStyle!";
    }
    createConicGradient(startAngle, x, y) {
        throw "TODO: Canvas.createConicGradient!";
    }
    createLinearGradient(x0, y0, x1, y1) {
        throw "TODO: Canvas.createLinearGradient!";
    }
    createPattern(image, repetition) {
        throw "TODO: Canvas.createPattern!";
    }
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        throw "TODO: Canvas.createRadialGradient!";
    }
    set filter(value) {
        throw "TODO: Canvas.filter!";
    }
    get filter() {
        throw "TODO: Canvas.filter!";
    }
    createImageData(sw_or_imagedata, sh, settings) {
        throw "TODO: Canvas.createImageData!";
    }
    getImageData(sx, sy, sw, sh, settings) {
        throw "TODO: Canvas.getImageData!";
    }
    putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        throw "TODO: Canvas.putImageData!";
    }
    set imageSmoothingEnabled(value) {
        throw "TODO: Canvas.imageSmoothingEnabled!";
    }
    get imageSmoothingEnabled() {
        throw "TODO: Canvas.imageSmoothingEnabled!";
    }
    set imageSmoothingQuality(value) {
        throw "TODO: Canvas.imageSmoothingQuality!";
    }
    get imageSmoothingQuality() {
        throw "TODO: Canvas.imageSmoothingQuality!";
    }
    arc(x, y, radius, startAngle, endAngle, counterclockwise) {
        const path = new Path2D();
        path.Arc(x, y, radius, startAngle, endAngle);
        this.data.path = path;
    }
    arcTo(x1, y1, x2, y2, radius) {
        throw "TODO: Canvas.arcTo!";
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        throw "TODO: Canvas.bezierCurveTo!";
    }
    closePath() {
        throw "TODO: Canvas.closePath!";
    }
    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise) {
        throw "TODO: Canvas.ellipse!";
    }
    lineTo(x, y) {
        throw "TODO: Canvas.lineTo!";
    }
    moveTo(x, y) {
        throw "TODO: Canvas.moveTo!";
    }
    quadraticCurveTo(cpx, cpy, x, y) {
        throw "TODO: Canvas.quadraticCurveTo!";
    }
    rect(x, y, w, h) {
        throw "TODO: Canvas.rect!";
    }
    roundRect(x, y, w, h, radii) {
        throw "TODO: Canvas.roundRect!";
    }
    set lineCap(value) {
        throw "TODO: Canvas.lineCap!";
    }
    get lineCap() {
        throw "TODO: Canvas.lineCap!";
    }
    set lineDashOffset(value) {
        throw "TODO: Canvas.lineDashOffset!";
    }
    get lineDashOffset() {
        throw "TODO: Canvas.lineDashOffset!";
    }
    set lineJoin(value) {
        throw "TODO: Canvas.lineJoin!";
    }
    get lineJoin() {
        throw "TODO: Canvas.lineJoin!";
    }
    set lineWidth(value) {
        this.data.lineWidth = value;
    }
    get lineWidth() {
        throw "TODO: Canvas.lineWidth!";
    }
    set miterLimit(value) {
        throw "TODO: Canvas.miterLimit!";
    }
    get miterLimit() {
        throw "TODO: Canvas.miterLimit!";
    }
    getLineDash() {
        throw "TODO: Canvas.getLineDash!";
    }
    setLineDash(segments) {
        throw "TODO: Canvas.setLineDash!";
    }
    clearRect(x, y, w, h) {
        throw "TODO: Canvas.clearRect!";
    }
    fillRect(x, y, w, h) {
        const path = new Path2D();
        path.Rect(1, x, y, w, h);
        this.data.path = path;
        this.Flush();
    }
    strokeRect(x, y, w, h) {
        throw "TODO: Canvas.strokeRect!";
    }
    set shadowBlur(value) {
        throw "TODO: Canvas.shadowBlur!";
    }
    get shadowBlur() {
        throw "TODO: Canvas.shadowBlur!";
    }
    set shadowColor(value) {
        throw "TODO: Canvas.shadowColor!";
    }
    get shadowColor() {
        throw "TODO: Canvas.shadowColor!";
    }
    set shadowOffsetX(value) {
        throw "TODO: Canvas.shadowOffsetX!";
    }
    get shadowOffsetX() {
        throw "TODO: Canvas.shadowOffsetX!";
    }
    set shadowOffsetY(value) {
        throw "TODO: Canvas.shadowOffsetY!";
    }
    get shadowOffsetY() {
        throw "TODO: Canvas.shadowOffsetY!";
    }
    restore() {
        throw "TODO: Canvas.restore!";
    }
    save() {
        throw "TODO: Canvas.save!";
    }
    fillText(text, x, y, maxWidth) {
        throw "TODO: Canvas.fillText!";
    }
    measureText(text) {
        throw "TODO: Canvas.measureText!";
    }
    strokeText(text, x, y, maxWidth) {
        throw "TODO: Canvas.strokeText!";
    }
    set direction(value) {
        throw "TODO: Canvas.direction!";
    }
    get direction() {
        throw "TODO: Canvas.direction!";
        return null;
    }
    set font(value) {
        throw "TODO: Canvas.font!";
    }
    get font() {
        throw "TODO: Canvas.font!";
        return null;
    }
    set fontKerning(value) {
        throw "TODO: Canvas.fontKerning!";
    }
    get fontKerning() {
        throw "TODO: Canvas.fontKerning!";
        return null;
    }
    set textAlign(value) {
        throw "TODO: Canvas.textAlign!";
    }
    get textAlign() {
        throw "TODO: Canvas.textAlign!";
        return null;
    }
    set textBaseline(value) {
        throw "TODO: Canvas.textBaseline!";
    }
    get textBaseline() {
        throw "TODO: Canvas.textBaseline!";
        return null;
    }
    getTransform() {
        const a = this.data.transform.data[0];
        const b = this.data.transform.data[1];
        const c = this.data.transform.data[2];
        const d = this.data.transform.data[3];
        const e = this.data.transform.data[4];
        const f = this.data.transform.data[5];
        return { a, b, c, d, e, f };
    }
    resetTransform() {
        this.setTransform(1, 0, 0, 1, 0, 0);
    }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        this.transform(cos, sin, -sin, cos, 0, 0);
    }
    scale(x, y) {
        this.transform(x, 0, 0, y, 0, 0);
    }
    setTransform(a_or_transform, b, c, d, e, f) {
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
    transform(a, b, c, d, e, f) {
        const cur = this.getTransform();
        const a_ = cur.a * a + cur.c * b;
        const b_ = cur.b * a + cur.d * b;
        const c_ = cur.a * c + cur.c * d;
        const d_ = cur.b * c + cur.d * d;
        const e_ = cur.a * e + cur.c * f + cur.e;
        const f_ = cur.b * e + cur.d * f + cur.f;
        this.setTransform(a_, b_, c_, d_, e_, f_);
    }
    translate(x, y) {
        this.transform(0, 0, 0, 0, x, y);
    }
    drawFocusIfNeeded(path_or_element, element) {
        throw "TODO: Canvas.drawFocusIfNeeded!";
    }
    renderer;
    data;
}
//# sourceMappingURL=canvas.js.map