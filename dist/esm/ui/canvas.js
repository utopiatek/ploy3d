export class Renderer2D {
    constructor(_global) {
        this._global = _global;
        this._frameTS = 1;
        this._drawList = [];
        this._drawData = null;
        this._styleLut = {};
        this._rem_font_size = 16;
        this._font_glyphs_lut = null;
        this._font_atlas = null;
    }
    async Init() {
        const colors = {
            red: 0xff0000,
            green: 0x00ff00,
            blue: 0x0000ff,
            white: 0xffffff,
        };
        for (let key in colors) {
            const style = this.CreateStyle2D(key);
            style.color = colors[key] | 0xFF000000;
        }
        this._font_glyphs_lut = await this._global.Fetch("./assets/fonts/simhei.json", null, "json");
        if (!this._font_glyphs_lut) {
            throw "字体文件加载失败！";
        }
        const atlas_w = this._font_glyphs_lut.atlas.width;
        const atlas_h = this._font_glyphs_lut.atlas.height;
        const lut = this._font_glyphs_lut.lut = {};
        for (let glyph of this._font_glyphs_lut.glyphs) {
            if (!glyph.atlasBounds) {
                continue;
            }
            const bounds = glyph.atlasBounds;
            const left = Math.floor((bounds.left) / atlas_w * 65535.0);
            const top = Math.floor((atlas_h - bounds.top) / atlas_h * 65535.0);
            const width = Math.floor((bounds.right - bounds.left) / atlas_w * 65535.0);
            const height = Math.floor((bounds.top - bounds.bottom) / atlas_h * 65535.0);
            const nx = ((top << 16) >>> 0) + left;
            const ny = ((height << 16) >>> 0) + width;
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
        const blob = await this._global.Fetch("./assets/fonts/simhei.png", null, "blob");
        const option = undefined;
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
        style.color = 0xFFFFFFFF;
        this._styleLut[color] = style;
        return style;
    }
    CreateString2D(text, x, y, canvas_w, canvas_h) {
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
                x += glyph[1] * em_font_size;
            }
            else {
                x += 0.5 * em_font_size;
            }
        }
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
        let drawData = this._drawData;
        if (!drawData || byteLength > drawData.capacity) {
            const device = this._global.device;
            if (drawData) {
                device.FreeBuffer(drawData.bufferID);
            }
            const buffer = new ArrayBuffer(byteLength);
            const bufferID = device.CreateBuffer(1, byteLength);
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
        for (let canvas of this._drawList) {
            const data = canvas["data"];
            let offset = data.instancesOffset * 4;
            let count = data.instanceCount * 4;
            let array = data.instances;
            for (let i = 0; i < count; i++) {
                instances[offset + i] = array[i];
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
            offset = data.stylesOffset * 8;
            count = data.styleCount;
            for (let i = 0; i < count; i++) {
                array = data.styles[i]?.["_data"];
                if (array) {
                    const i8 = i * 8;
                    for (let j = 0; j < 8; j++) {
                        styles[offset + i8 + j] = array[j];
                    }
                }
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
    _rem_font_size;
    _font_glyphs_lut;
    _font_atlas;
}
export class Path2D {
    constructor() {
    }
    Rect(x, y, w, h) {
        let n0 = 1;
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
    RoundRect(x, y, w, h, radii) {
        if (!radii) {
            this.Rect(x, y, w, h);
            return;
        }
        let n0 = 3;
        w = Math.floor(w * 0.5);
        h = Math.floor(h * 0.5);
        let n2 = (h << 16) + w;
        x = Math.floor(x + w);
        y = Math.floor(y + h);
        let n1 = (y << 16) + x;
        radii = Math.ceil(radii);
        let n3 = (0 << 16) + radii;
        this.type = 3;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }
    Arc(x, y, radius, startAngle, endAngle) {
        let n0 = 2;
        x = Math.floor(x);
        y = Math.floor(y);
        let n1 = (y << 16) + x;
        startAngle = Math.floor(startAngle / (2.0 * Math.PI) * 65535);
        endAngle = Math.floor(endAngle / (2.0 * Math.PI) * 65535);
        let n2 = (endAngle << 16) + startAngle;
        radius = Math.ceil(radius);
        let n3 = (0 << 16) + radius;
        this.type = 2;
        this.applied = false;
        this.geometryCount = 1;
        this.geometries = [n0, n1, n2, n3];
    }
    Text(text, x, y, maxWidth, params) {
        const { em_font_size, atlas, canvas_width, canvas_height } = params;
        const glyphs = params.glyphs.lut;
        const geometries = [];
        let start_x = x;
        {
            const start_glyph = glyphs[text.charCodeAt(0)];
            if (start_glyph) {
                start_x += start_glyph[2] * em_font_size;
            }
        }
        let char_count = 0;
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
                x += glyph[1] * em_font_size;
                char_count += 1;
            }
            else {
                x += 0.5 * em_font_size;
            }
            if (maxWidth && maxWidth < (x - start_x)) {
                break;
            }
        }
        let n0 = (atlas.layer << 16) + (char_count << 4) + 4;
        let min_x = start_x;
        let max_x = x;
        let min_y = y - params.glyphs.metrics.ascender * em_font_size;
        let max_y = y - params.glyphs.metrics.descender * em_font_size;
        let rect_center_x = Math.floor((min_x + max_x) * 0.5);
        let rect_center_y = Math.floor((min_y + max_y) * 0.5);
        let rect_center_w = Math.floor((max_x - min_x) * 0.5);
        let rect_center_h = Math.floor((max_y - min_y) * 0.5);
        let n1 = (rect_center_y << 16) + rect_center_x;
        let n2 = (rect_center_h << 16) + rect_center_w;
        let n3 = 0;
        geometries[0] = n0;
        geometries[1] = n1;
        geometries[2] = n2;
        geometries[3] = n3;
        let n4 = (atlas.y << 16) + atlas.x;
        let n5 = (atlas.height << 16) + atlas.width;
        let n6 = 0;
        let n7 = 0;
        geometries[4] = n4;
        geometries[5] = n5;
        geometries[6] = n6;
        geometries[7] = n7;
        this.type = 4;
        this.applied = false;
        this.geometryCount = 2 + char_count;
        this.geometries = geometries;
    }
    Mask(transform) {
        return 0xFFFFFFFF;
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
    Flush(drawMode) {
        const data = this.data;
        const path = data.path;
        const transform = data.transform;
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
        if (!path) {
            return;
        }
        let batch = data.batch;
        if (batch == null ||
            batch.instanceCount == 1024 ||
            batch.transformCount == 512 ||
            batch.geometryCount + path.geometryCount > 1024 ||
            batch.styleCount > 510) {
            path.applied = false;
            transform.applied = false;
            data.instanceCount = (data.instanceCount + 15) >> 4 << 4;
            data.transformCount = (data.transformCount + 7) >> 3 << 3;
            data.geometryCount = (data.geometryCount + 15) >> 4 << 4;
            data.styleCount = (data.styleCount + 7) >> 3 << 3;
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
            data.instanceCount++;
            batch.instanceCount++;
            data.instances[batch.instancesOffset * 4 + 0] = 0;
            data.instances[batch.instancesOffset * 4 + 1] = 0;
            data.instances[batch.instancesOffset * 4 + 2] = 0;
            data.instances[batch.instancesOffset * 4 + 3] = 0;
            data.batches.push(batch);
        }
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
        let transformIndex = data.transformCount - 1;
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
        let geometryBeg = data.geometryCur;
        let geometryEnd = data.geometryCount;
        let geometryType = path.type;
        let geometryMask = path.Mask(transform.data);
        let fillStyle = batch.styleLut[data.fillStyle.id];
        if (fillStyle == undefined) {
            fillStyle = data.styleCount;
            batch.styleLut[data.fillStyle.id] = fillStyle;
            data.styles[fillStyle] = data.fillStyle;
            batch.styleCount++;
            data.styleCount++;
        }
        let strokeStyle = batch.styleLut[data.strokeStyle.id];
        if (strokeStyle == undefined) {
            strokeStyle = data.styleCount;
            batch.styleLut[data.strokeStyle.id] = strokeStyle;
            data.styles[strokeStyle] = data.strokeStyle;
            batch.styleCount++;
            data.styleCount++;
        }
        let instance = data.instanceCount;
        let lineWidth = data.lineWidth;
        transformIndex -= batch.transformsOffset;
        geometryBeg -= batch.geometriesOffset;
        geometryEnd -= batch.geometriesOffset;
        fillStyle -= batch.stylesOffset;
        strokeStyle -= batch.stylesOffset;
        let instance_nx = 0;
        {
            instance_nx += (drawMode & 0x3) << 30;
            instance_nx += (transformIndex & 0x3FF) << 20;
            instance_nx += (geometryEnd & 0x3FF) << 10;
            instance_nx += (geometryBeg & 0x3FF) << 0;
        }
        let instance_ny = 0;
        {
            instance_ny += (geometryType & 0xF) << 28;
            instance_ny += (lineWidth & 0xFF) << 20;
            instance_ny += (strokeStyle & 0x3FF) << 10;
            instance_ny += (fillStyle & 0x3FF) << 0;
        }
        let instance_nz = 0;
        {
        }
        let instance_nw = 0;
        {
            instance_nw = geometryMask;
        }
        data.instances[instance * 4 + 0] = instance_nx;
        data.instances[instance * 4 + 1] = instance_ny;
        data.instances[instance * 4 + 2] = instance_nz;
        data.instances[instance * 4 + 3] = instance_nw;
        data.instanceCount++;
        batch.instanceCount++;
        {
            data.instances[batch.instancesOffset * 4 + 0] |= geometryMask;
            data.instances[batch.instancesOffset * 4 + 1] = batch.instanceCount;
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
        for (let batch of this.data.batches) {
            const offsets = [
                offset0 + batch.instancesOffset * 16,
                offset1 + batch.stylesOffset * 32,
                offset2 + batch.transformsOffset * 32,
                offset3 + batch.geometriesOffset * 16
            ];
            const binding_key = `${data.capacity}-${offsets[0]}-${offsets[1]}-${offsets[2]}-${offsets[3]}`;
            if (batch.binding_key != binding_key) {
                const entries = [];
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
                queue.passEncoder.drawIndexed(params[0], params[1], params[2], params[3], params[4]);
            }
            else if (method == "draw") {
                queue.passEncoder.draw(params[0], params[1], params[2], params[3]);
            }
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
        this.Flush(1);
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
        this.Flush(2);
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
        const path = new Path2D();
        path.Rect(x, y, w, h);
        this.data.path = path;
    }
    roundRect(x, y, w, h, radii) {
        const path = new Path2D();
        path.RoundRect(x, y, w, h, radii);
        this.data.path = path;
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
        path.Rect(x, y, w, h);
        this.data.path = path;
        this.Flush(1);
    }
    strokeRect(x, y, w, h) {
        const path = new Path2D();
        path.Rect(x, y, w, h);
        this.data.path = path;
        this.Flush(2);
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