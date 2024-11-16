import proj4 from "./worker/proj4.js";
export class Gis {
    constructor(_global) {
        this._global = _global;
        this._originMC = [12270000, 2910000];
        this._originLL = this.MC2LL(this._originMC);
        this._centerMC = [12270000, 2910000];
    }
    async Init() {
        const resources = this._global.resources;
        this._districts = await (new Gis_districts(this)).Init();
        this._pyramid = new Gis_pyramid(this, 8, 4);
        this._mesh = await resources.Mesh.Create({
            uuid: "",
            classid: 39,
            name: "lod plane",
            label: "lod plane",
            creater: {
                type: "lod_plane",
                lod_plane: {
                    levels: this._pyramid.levelCount,
                    segments: 64
                }
            }
        });
        this._mesh.AddRef();
        this._materials = [];
        for (let i = 0; i < this._pyramid.levelCount; i++) {
            const material = await resources.Material.Create({
                uuid: "",
                classid: 32,
                name: "gis:" + i,
                label: "gis:" + i,
                shader: "1-1-1.miaokit.builtins:/shader/gis_ulit/17-11_gis_ulit.json",
                flags: 1,
                properties: {
                    textures: {
                        noiseTex: {
                            uri: "1-1-1.miaokit.builtins:/texture/25-3_noise2.png"
                        },
                        moonTex: {
                            uri: "1-1-1.miaokit.builtins:/texture/25-4_color2.jpg"
                        }
                    },
                    vectors: {}
                }
            });
            const slot = this._pyramid.levelCount - i - 1;
            material.AddRef();
            this._materials[slot] = {
                slot: slot,
                submesh: i,
                material: material
            };
        }
        return this;
    }
    async Dispose() {
        if (this._flushing > 0) {
            await (new Promise((resolve, reject) => {
                this._waitClose = resolve;
            }));
        }
        await this.districts.Dispose();
        await this._pyramid.Dispose();
        if (this._mesh) {
            this._mesh.Release();
        }
        if (this._materials) {
            for (let mat of this._materials) {
                mat.material.Release();
            }
        }
        this._global = undefined;
        this._enable = false;
        this._districts = undefined;
        this._pyramid = undefined;
        this._mesh = undefined;
        this._materials = undefined;
        this._drawParams = undefined;
        this._lng = undefined;
        this._lat = undefined;
        this._level = undefined;
        this._pitch = undefined;
        this._yaw = undefined;
        this._originMC = undefined;
        this._originLL = undefined;
        this._centerMC = undefined;
        this._centerPos = undefined;
        this._tileX = undefined;
        this._tileZ = undefined;
        this._tileY = undefined;
        this._meshS = undefined;
        this._lock = undefined;
        this._timestamp = undefined;
        this._flushing = 0;
        this._waiting = undefined;
        this._servers = undefined;
        this._lut1 = undefined;
        this._lut2 = undefined;
        this._lut3 = undefined;
        this._lut4 = undefined;
    }
    Update(camera) {
        const target = camera.target;
        const distance = camera.distance;
        const pitch = camera.pitch;
        const yaw = camera.yaw;
        const height = camera.height;
        const fov = camera.fov;
        const originMC = this._originMC;
        const originLL = this._originLL;
        const scaleMC = 1.0 / Math.cos(originLL[1] / 180.0 * Math.PI);
        let offsetX = target[0] * scaleMC;
        let offsetZ = -target[2] * scaleMC;
        let resetOrigin = false;
        if (Math.abs(offsetX) > 20000 || Math.abs(offsetZ) > 20000) {
            if (Math.abs(offsetX) > 20000) {
                const carry = Math.floor(offsetX * 0.0001) * 10000;
                offsetX -= carry;
                originMC[0] += carry;
            }
            if (Math.abs(offsetZ) > 20000) {
                const carry = Math.floor(offsetZ * 0.0001) * 10000;
                offsetZ -= carry;
                originMC[1] += carry;
            }
            this._originLL = this.MC2LL(originMC);
            const _scaleMC = Math.cos(this._originLL[1] / 180.0 * Math.PI);
            target[0] = offsetX * _scaleMC;
            target[2] = -offsetZ * _scaleMC;
            resetOrigin = true;
        }
        const targetMC = [originMC[0] + offsetX, originMC[1] + offsetZ];
        const targetLL = this.MC2LL(targetMC);
        const distancePix = Math.round(height * 0.5 / Math.tan(0.5 * fov));
        const dpi = distance / (distancePix);
        const pow = 40075016.685578488 / (256 * dpi);
        const level = Math.log2(pow);
        this.FlushMaterial({
            centerMC: this._centerMC,
            targetMC: targetMC,
            movedMC: [targetMC[0] - this._centerMC[0], targetMC[1] - this._centerMC[1]],
            targetXZ: [target[0], target[2]]
        });
        this.Flush(target[0], target[2], targetLL[0], targetLL[1], level, pitch, yaw);
        return resetOrigin ? target : null;
    }
    Flush(x, z, lng, lat, level, pitch, yaw) {
        if (this._lock || this._waitClose) {
            return;
        }
        const timestamp = Date.now();
        if (this._flushing > 0) {
            if (Math.ceil((timestamp - this._timestamp) / 1000) < 1) {
                this._waiting = [x, z, lng, lat, level, pitch, yaw];
                return;
            }
        }
        this._lng = lng;
        this._lat = lat;
        this._level = level;
        this._pitch = pitch;
        this._yaw = yaw;
        level = Math.ceil(level);
        if (level > 18) {
            level = 18;
        }
        const layerTiling = this._pyramid.layerTiling;
        const layerTilingHalf = layerTiling * 0.5;
        const centerMC = this.LL2MC([lng, lat]);
        const tileY = Math.floor(level);
        const tileS = this.perimeter / Math.pow(2, tileY);
        const meshS = (tileS * (layerTiling - 1)) / (1 * 64 * 4);
        const unitX = (this.perimeter_half + centerMC[0]) / tileS;
        const tileX = Math.floor(unitX);
        const unitZ = (this.perimeter_half - centerMC[1]) / tileS;
        const tileZ = Math.floor(unitZ);
        if (tileX == this._tileX && tileZ == this._tileZ && tileY == this._tileY) {
            return;
        }
        this._centerMC = centerMC;
        this._centerPos = [x, z];
        this._tileX = tileX;
        this._tileZ = tileZ;
        this._tileY = tileY;
        this._meshS = meshS;
        const localX = unitX - tileX;
        const localZ = unitZ - tileZ;
        const lb_tile_bias = [0, 0, 0, 0];
        if (localX > 0.5) {
            lb_tile_bias[0] = tileX - layerTilingHalf + 1;
            lb_tile_bias[2] = (localX - 0.5) / layerTiling;
        }
        else {
            lb_tile_bias[0] = tileX - layerTilingHalf;
            lb_tile_bias[2] = (localX + 0.5) / layerTiling;
        }
        if (localZ > 0.5) {
            lb_tile_bias[1] = tileZ + layerTilingHalf;
            lb_tile_bias[3] = (1.5 - localZ) / layerTiling;
        }
        else {
            lb_tile_bias[1] = tileZ + layerTilingHalf - 1;
            lb_tile_bias[3] = (0.5 - localZ) / layerTiling;
        }
        this._timestamp = timestamp;
        this._flushing++;
        this._waiting = null;
        this.FlushMaterial({
            centerMC: centerMC,
            movedMC: [0, 0],
            size: [this._meshS],
        });
        this._pyramid.Update(tileY, lb_tile_bias[0], lb_tile_bias[1], lb_tile_bias[2], lb_tile_bias[3], () => {
            this._flushing--;
            if (this._flushing == 0) {
                if (this._waitClose) {
                    this._waitClose();
                    return;
                }
            }
            if (timestamp != this._timestamp) {
                return;
            }
            if (this._waiting) {
                x = this._waiting[0];
                z = this._waiting[1];
                lng = this._waiting[2];
                lat = this._waiting[3];
                level = this._waiting[4];
                pitch = this._waiting[5];
                yaw = this._waiting[6];
                this._waiting = null;
                this.Flush(x, z, lng, lat, level, pitch, yaw);
            }
        });
    }
    FlushMaterial(values) {
        if (values) {
            for (let key in values) {
                const value = values[key];
                for (let mat of this.materials) {
                    mat.material.view[key] = value;
                }
            }
            if (values.targetMC) {
                this._districts["_area_renderer"].material.view["targetMC"] = values.targetMC;
                this._districts["_line_renderer"].material.view["targetMC"] = values.targetMC;
            }
            if (values.targetXZ) {
                this._districts["_area_renderer"].material.view["targetXZ"] = values.targetXZ;
                this._districts["_line_renderer"].material.view["targetXZ"] = values.targetXZ;
            }
            return;
        }
        const levelCount = this._pyramid["levelCount"];
        const levels = this._pyramid["_pyramid"];
        const top = this._pyramid["_pyramidTop"];
        const top_level = this._tileY;
        const layers = this._pyramid["_layers"];
        const tileS = this.perimeter / Math.pow(2, top_level);
        this._districts["_area_renderer"].material.view["pixelS"] = [tileS / 256];
        this._districts["_line_renderer"].material.view["pixelS"] = [tileS / 256];
        for (let i = 0; i < levelCount; i++) {
            const cur = (top + i) % levelCount;
            const cur_level = levels[cur];
            const material = this._materials[i];
            const layers_enabled = [0, 0, 0, 0];
            const layers_layer = [0, 0, 0, 0];
            const layers_uvst = [
                [0, 0, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 1, 1]
            ];
            for (let j = 0; j < layers.length; j++) {
                const layer = layers[j];
                if (!layer.enabled) {
                    continue;
                }
                const layer_data = cur_level.layers[j];
                if (layer_data.invalid) {
                    continue;
                }
                layers_enabled[j] = 1;
                const texture = layer_data.inherit?.texture || layer_data.texture;
                if (!texture) {
                    continue;
                }
                const block_layer = texture.layer;
                const block_uvst = texture.rect;
                const layer_uvst = layer_data.inherit?.uvst || layer_data.uvst;
                layers_layer[j] = block_layer;
                layers_uvst[j] = [
                    block_uvst[0] + block_uvst[2] * layer_uvst.offset_x,
                    block_uvst[1] + block_uvst[3] * layer_uvst.offset_z,
                    block_uvst[2] * layer_uvst.scale_x,
                    block_uvst[3] * layer_uvst.scale_z,
                ];
            }
            if (cur_level.level && cur_level.level != (top_level - i)) {
                this._global.Track(`Gis.FlushMaterial: LOD层级编排异常：cur_level.level = ${cur_level.level}, (top_level - i) = ${top_level - i}`, 2);
            }
            material.material.view["level"] = [cur_level.level];
            material.material.view["layers_enabled"] = layers_enabled;
            material.material.view["layers_layer"] = layers_layer;
            material.material.view["layers_uvst0"] = layers_uvst[0];
            material.material.view["layers_uvst1"] = layers_uvst[1];
            material.material.view["layers_uvst2"] = layers_uvst[2];
            material.material.view["layers_uvst3"] = layers_uvst[3];
        }
    }
    DrawMesh(queue) {
        this.FlushMaterial();
        this._drawParams.mesh = this._mesh;
        this._drawParams.materials = this._materials;
        queue.DrawMesh(this._drawParams);
    }
    Draw(queue) {
        this.districts.Draw(queue);
    }
    CalSunlight(params) {
        if (params.lng == undefined) {
            params.lng = this._lng;
        }
        if (params.lat == undefined) {
            params.lat = this._lat;
        }
        if (params.tz == undefined) {
            params.tz = 8;
        }
        const date = new Date(params.year, params.month - 1, params.day, params.hours, params.minutes, params.seconds);
        const millis = date.getTime() - params.tz * 3600 * 1000;
        const utDate = new Date(millis);
        const utYear = utDate.getYear() + 1900;
        const utMonth = utDate.getMonth() + 1;
        const utDay = utDate.getDate();
        const utHours = utDate.getHours();
        const utMinutes = utDate.getMinutes();
        const UT = utHours + utMinutes / 60 + params.seconds / 3600;
        function julian_day(d, m, y, u) {
            if (m <= 2) {
                m += 12;
                y -= 1;
            }
            const a = Math.floor(y / 100);
            const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 13 - 1524.5 + u / 24.0;
            return jd;
        }
        const jd = julian_day(utDay, utMonth, utYear, UT);
        const K = Math.PI / 180.0;
        const T0 = 2451545.0;
        const L0 = 280.46645;
        const M0 = 357.5291;
        const C1 = 1.9146;
        const C2 = 0.019993;
        function declination(day, month, year, UT) {
            const T = (jd - T0) / 36525.0;
            const L = L0 + (36000.76983 + 0.0003032 * T) * T;
            let M = M0 + (35999.0503 - (0.0001559 * T + 0.00000048 * T) * T) * T;
            M = K * M;
            const theta = L + (C1 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (C2 - 0.000101 * T) * Math.sin(2 * M) + 0.000290 * Math.sin(3 * M);
            const omega = 125.04 - 1934.136 * T;
            const lambda = theta - 0.00569 - 0.00478 * Math.sin(K * omega);
            const eps0 = 23.0 + 26.0 / 60.0 + 21.448 / 3600.0 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
            const eps = eps0 + 0.00256 * Math.cos(K * omega);
            let declin = Math.sin(K * eps) * Math.sin(K * lambda);
            declin = Math.asin(declin) / K;
            let RA = Math.atan2(Math.cos(K * eps) * Math.sin(K * lambda), Math.cos(K * lambda)) / K;
            if (RA < 0)
                RA = RA + 360;
            return { declin, RA };
        }
        const { declin, RA } = declination(utDay, utMonth, utYear, UT);
        function computeGHA(T, M, J, STD) {
            let K = Math.PI / 180.0, N, X, XX, P;
            N = 365 * J + T + 31 * M - 46;
            if (M < 3)
                N = N + Math.floor((J - 1) / 4);
            else
                N = N - Math.floor(0.4 * M + 2.3) + Math.floor(J / 4);
            P = STD / 24.0;
            X = (P + N - 7.22449E5) * 0.98564734 + 279.306;
            X = X * K;
            XX = -104.55 * Math.sin(X) - 429.266 * Math.cos(X) + 595.63 * Math.sin(2.0 * X) - 2.283 * Math.cos(2.0 * X);
            XX = XX + 4.6 * Math.sin(3.0 * X) + 18.7333 * Math.cos(3.0 * X);
            XX = XX - 13.2 * Math.sin(4.0 * X) - Math.cos(5.0 * X) - Math.sin(5.0 * X) / 3.0 + 0.5 * Math.sin(6.0 * X) + 0.231;
            XX = XX / 240.0 + 360.0 * (P + 0.5);
            if (XX > 360.0)
                XX = XX - 360.0;
            return XX;
        }
        const GHA = computeGHA(utDay, utMonth, utYear, UT);
        function computeHeight(dec, latitude, longit, gha) {
            const lat_K = latitude * K;
            const dec_K = dec * K;
            const x = gha + longit;
            const sinHeight = Math.sin(dec_K) * Math.sin(lat_K) + Math.cos(dec_K) * Math.cos(lat_K) * Math.cos(K * x);
            return Math.asin(sinHeight) / K;
        }
        let elev = computeHeight(declin, params.lat, params.lng, GHA);
        elev = Math.round(10 * elev) / 10;
        function computeAzimut(dec, latitude, longitude, GHA, hoehe) {
            let cosAz, Az, nenner;
            let lat_K = latitude * K;
            let hoehe_K = hoehe * K;
            nenner = Math.cos(hoehe_K) * Math.cos(lat_K);
            cosAz = (Math.sin(dec * K) - Math.sin(lat_K) * Math.sin(hoehe_K)) / nenner;
            Az = Math.PI / 2.0 - Math.asin(cosAz);
            Az = Az / K;
            if (Math.sin(K * (Number(GHA) + Number(longitude))) <= 0)
                Az = Az;
            else
                Az = 360.0 - Az;
            return Az;
        }
        let azimuth = computeAzimut(declin, params.lat, params.lng, GHA, elev);
        azimuth = Math.round(10 * azimuth) / 10;
        const direction = (this._global.Vector3([elev, -azimuth, 0])).toQuaternion().RotateVector(this._global.Vector3([0, 0, -1]));
        return {
            azimuth: azimuth,
            altitude: elev,
            direction: direction
        };
    }
    CalPosition(lng, lat) {
        const originMC = this._originMC;
        const originLL = this._originLL;
        const targetLL = [lng, lat];
        const targetMC = this.LL2MC(targetLL);
        let offsetX = targetMC[0] - originMC[0];
        let offsetZ = targetMC[1] - originMC[1];
        const scaleMC = Math.cos(originLL[1] / 180.0 * Math.PI);
        offsetX = offsetX * scaleMC;
        offsetZ = -offsetZ * scaleMC;
        return this._global.Vector3([offsetX, 0, offsetZ]);
    }
    ServeUrl(type, token, col, row, level) {
        const serv = this.servers[type];
        const tile_count = Math.pow(2, level);
        if (col < 0) {
            col = (tile_count + (col % tile_count)) % tile_count;
        }
        else {
            col = col % tile_count;
        }
        let url = serv.url;
        url = url.replace(new RegExp("\\{token\\}", "g"), "" + token);
        url = url.replace(new RegExp("\\{col\\}", "g"), "" + col);
        url = url.replace(new RegExp("\\{row\\}", "g"), "" + row);
        url = url.replace(new RegExp("\\{level\\}", "g"), "" + level);
        if (serv.count > 1) {
            const index = Math.floor(Math.random() * serv.count);
            url = url.replace(new RegExp("\\{index\\}", "g"), "" + index);
        }
        return url;
    }
    LL2WPOS(ll) {
        const mc = this.LL2MC(ll);
        const scale = Math.cos(this._originLL[1] / 180.0 * Math.PI);
        return [(mc[0] - this._originMC[0]) * scale, 0, (this._originMC[1] - mc[1]) * scale];
    }
    get districts() {
        return this._districts;
    }
    get enable() {
        return this._enable;
    }
    set enable(b) {
        this._enable = b;
    }
    get lng() {
        return this._lng;
    }
    get lat() {
        return this._lat;
    }
    get level() {
        return this._level;
    }
    get centerMC() {
        return this._centerMC;
    }
    get centerPos() {
        return this._centerPos;
    }
    get lock() {
        return this._lock;
    }
    set lock(lock) {
        this._lock = lock;
    }
    get timestamp() {
        return this._timestamp;
    }
    get servers() {
        return this._servers;
    }
    get materials() {
        return this._materials;
    }
    get radius() {
        return 6378137.0;
    }
    get diameter() {
        return 12756274.0;
    }
    get perimeter() {
        return 40075016.6855784;
    }
    get perimeter_half() {
        return 20037508.3427892;
    }
    get enable_terrain() {
        return this._pyramid.terrain;
    }
    set enable_terrain(b) {
        this._pyramid.terrain = b;
    }
    get force_terrain() {
        return this._pyramid.forceTerrain;
    }
    set force_terrain(enable) {
        this._pyramid.forceTerrain = enable;
    }
    _global;
    _enable;
    _districts;
    _pyramid;
    _mesh;
    _materials;
    _drawParams = {
        flags: 0,
        layers: 64,
        userData: 0,
        castShadows: false,
        receiveShadows: false,
        frontFace: 0,
        cullMode: 1,
        mesh: null,
        materials: null,
        instances: [
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ]
    };
    _lng;
    _lat;
    _level;
    _pitch;
    _yaw;
    _originMC;
    _originLL;
    _centerMC;
    _centerPos;
    _tileX;
    _tileZ;
    _tileY;
    _meshS;
    _lock;
    _timestamp = 0;
    _flushing = 0;
    _waiting;
    _waitClose;
    _servers = {
        tianditu_img_w: {
            label: "天地图-影像底图-CGCS2000",
            url: "https://t{index}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&tk={token}&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}",
            count: 8,
            projection: 1,
            tile_size: 256,
            max_level: 18,
            min_level: 1
        },
        tianditu_img_c: {
            label: "天地图-影像底图-LNGLAT",
            url: "https://t{index}.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&tk={token}&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}",
            count: 8,
            projection: 4,
            tile_size: 256,
            max_level: 18,
            min_level: 1
        },
        tianditu_dem_c: {
            label: "天地图-地形高度-LNGLAT",
            url: "https://t{index}.tianditu.gov.cn/mapservice/swdx?tk={token}&x={col}&y={row}&l={level}",
            count: 8,
            projection: 4,
            tile_size: 64,
            max_level: 12,
            min_level: 7
        },
        arcgisonline_img_w: {
            label: "ARCGIS-影像底图-WGS84",
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level}/{row}/{col}",
            count: 1,
            projection: 0,
            tile_size: 256,
            max_level: 18,
            min_level: 1
        },
        earthol_img_w: {
            label: "EARTHOL-影像底图-WGS84",
            url: "https://m.earthol.me/map.jpg?lyrs=y&gl=cn&x={col}&y={row}&z={level}",
            count: 1,
            projection: 0,
            tile_size: 256,
            max_level: 20,
            min_level: 1
        }
    };
    Proj4(params) {
        const ll_wgs84 = proj4(params.SRS, "EPSG:4326", params.SRSOrigin);
        const mc_wgs84 = this.LL2MC(ll_wgs84);
        const ll_gcj02 = this.WGS84_GCJ02(ll_wgs84);
        const altitude = ll_wgs84[2];
        return {
            ll_gcj02,
            ll_wgs84,
            mc_wgs84,
            altitude
        };
    }
    OutOfChina(ll) {
        const lng = ll[0];
        const lat = ll[1];
        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    }
    TransformLng(ll) {
        const lng = ll[0];
        const lat = ll[1];
        let lng_ = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        lng_ += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        lng_ += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
        lng_ += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
        return lng_;
    }
    TransformLat(ll) {
        const lng = ll[0];
        const lat = ll[1];
        let lat_ = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        lat_ += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        lat_ += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
        lat_ += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
        return lat_;
    }
    WGS84_GCJ02(ll) {
        if (this.OutOfChina(ll)) {
            return [ll[0], ll[1]];
        }
        else {
            const lng = ll[0];
            const lat = ll[1];
            const rlat = lat / 180.0 * Math.PI;
            const ee = 0.00669342162296594323;
            const a = 6378245.0;
            let lng_ = this.TransformLng([lng - 105.0, lat - 35.0]);
            let lat_ = this.TransformLat([lng - 105.0, lat - 35.0]);
            let magic = Math.sin(rlat);
            magic = 1 - ee * magic * magic;
            let magicSqrt = Math.sqrt(magic);
            lng_ = (lng_ * 180.0) / (a / magicSqrt * Math.cos(rlat) * Math.PI);
            lat_ = (lat_ * 180.0) / ((a * (1 - ee)) / (magic * magicSqrt) * Math.PI);
            lng_ += lng;
            lat_ += lat;
            return [lng_, lat_];
        }
    }
    GCJ02_WGS84(ll) {
        if (this.OutOfChina(ll)) {
            return [ll[0], ll[1]];
        }
        else {
            const lng = ll[0];
            const lat = ll[1];
            const rlat = lat / 180.0 * Math.PI;
            const ee = 0.00669342162296594323;
            const a = 6378245.0;
            let lng_ = this.TransformLng([lng - 105.0, lat - 35.0]);
            let lat_ = this.TransformLat([lng - 105.0, lat - 35.0]);
            let magic = Math.sin(rlat);
            magic = 1 - ee * magic * magic;
            let magicSqrt = Math.sqrt(magic);
            lng_ = (lng_ * 180.0) / (a / magicSqrt * Math.cos(rlat) * Math.PI);
            lat_ = (lat_ * 180.0) / ((a * (1 - ee)) / (magic * magicSqrt) * Math.PI);
            lng_ = lng * 2 - (lng + lng_);
            lat_ = lat * 2 - (lat + lat_);
            return [lng_, lat_];
        }
    }
    GCJ02_BD09(ll) {
        const lng = ll[0];
        const lat = ll[1];
        const xpi = Math.PI * 3000.0 / 180.0;
        const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xpi);
        const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xpi);
        const lng_ = z * Math.cos(theta) + 0.0065;
        const lat_ = z * Math.sin(theta) + 0.006;
        return [lng_, lat_];
    }
    BD09_GCJ02(ll) {
        const lng = ll[0];
        const lat = ll[1];
        const xpi = Math.PI * 3000.0 / 180.0;
        const x = lng - 0.0065;
        const y = lat - 0.006;
        const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xpi);
        const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xpi);
        const lng_ = z * Math.cos(theta);
        const lat_ = z * Math.sin(theta);
        return [lng_, lat_];
    }
    WGS84_BD09(ll) {
        return this.GCJ02_BD09(this.WGS84_GCJ02(ll));
    }
    BD09_WGS84(ll) {
        return this.GCJ02_WGS84(this.BD09_GCJ02(ll));
    }
    LL2MC(ll) {
        const lng = ll[0];
        const lat = ll[1];
        let lng_ = lng * this.perimeter_half / 180.0;
        let lat_ = Math.log(Math.tan((90.0 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0);
        lat_ = lat_ * this.perimeter_half / 180.0;
        return [lng_, lat_];
    }
    MC2LL(mc) {
        const x = mc[0];
        const y = mc[1];
        let lng_ = x / this.perimeter_half * 180;
        let lat_ = y / this.perimeter_half * 180;
        lat_ = 180 / Math.PI * (2 * Math.atan(Math.exp(lat_ * Math.PI / 180.0)) - Math.PI / 2.0);
        return [lng_, lat_];
    }
    LL2MC_BD09(ll) {
        const lng_ = ll[0];
        const lat_ = ll[1];
        let lut = null;
        for (let i = 0; i < 6; i++) {
            if (lat_ >= this._lut1[i]) {
                lut = this._lut2[i];
                break;
            }
        }
        if (lut == null) {
            for (let i = 5; i >= 0; i--) {
                if (lat_ <= -this._lut1[i]) {
                    lut = this._lut2[i];
                    break;
                }
            }
        }
        const T = lut[0] + lut[1] * Math.abs(lng_);
        const cC = Math.abs(lat_) / lut[9];
        const cF = lut[2] + lut[3] * cC + lut[4] * cC * cC + lut[5] * cC * cC * cC + lut[6] * cC * cC * cC * cC + lut[7] * cC * cC * cC * cC * cC + lut[8] * cC * cC * cC * cC * cC * cC;
        const lng = T * (lng_ < 0 ? -1 : 1);
        const lat = cF * (lat_ < 0 ? -1 : 1);
        return [lng, lat];
    }
    MC2LL_BD09(mc) {
        const lng_ = Math.abs(mc[0]);
        const lat_ = Math.abs(mc[1]);
        let lut = null;
        for (let i = 0; i < 6; i++) {
            if (lat_ >= this._lut3[i]) {
                lut = this._lut4[i];
                break;
            }
        }
        const T = lut[0] + lut[1] * Math.abs(lng_);
        const cC = Math.abs(lat_) / lut[9];
        const cF = lut[2] + lut[3] * cC + lut[4] * cC * cC + lut[5] * cC * cC * cC + lut[6] * cC * cC * cC * cC + lut[7] * cC * cC * cC * cC * cC + lut[8] * cC * cC * cC * cC * cC * cC;
        const lng = T * (lng_ < 0 ? -1 : 1);
        const lat = cF * (lat_ < 0 ? -1 : 1);
        return [lng, lat];
    }
    _lut1 = [75, 60, 45, 30, 15, 0];
    _lut2 = [
        [-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
        [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5],
        [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5],
        [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
        [-0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
        [-0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]
    ];
    _lut3 = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
    _lut4 = [
        [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
        [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86],
        [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
        [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
        [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
        [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]
    ];
}
export class Gis_pyramid {
    constructor(_gis, _levels, _tiling) {
        this._gis = _gis;
        this._forceTerrain = false;
        this._blankTile = {
            width: 256,
            height: 256,
            data: (() => {
                const data = new Uint8Array(4 * 256 * 256);
                for (let r = 0; r < 256; r++) {
                    for (let c = 0; c < 256; c++) {
                        const i4 = 4 * (256 * r + c);
                        data[i4 + 0] = 89;
                        data[i4 + 1] = 102;
                        data[i4 + 2] = 48;
                        data[i4 + 3] = 255;
                    }
                }
                return data;
            })(),
            dataLayout: {
                offset: 0,
                bytesPerRow: 4 * 256,
                rowsPerImage: 256
            }
        };
        this._layers = [
            {
                type: "tianditu_dem_c",
                token: "d46eda25e81327fdc47e09e286751657",
                enabled: false
            },
            {
                type: "arcgisonline_img_w",
                token: "f35283eaf85bbe2c25f701338a6dadc2",
                enabled: true
            },
            {},
            {}
        ];
        this._tiling = _tiling;
        this._pyramid = [];
        this._pyramidTop = 0;
        this._pyramidHeight = _levels;
        for (let i = 0; i < this._pyramidHeight; i++) {
            this._pyramid[i] = {
                id: i + 1,
                level: 0,
                submesh: 0,
                outer: false,
                reset: true,
                projections: [],
                layers: [{}, {}, {}, {}]
            };
            for (let j = 0; j < 5; j++) {
                this._pyramid[i].projections[j] = {
                    last_lb_col: 0,
                    last_lb_row: 0,
                    lb_col: 0,
                    lb_row: 0,
                    offset_x: 0,
                    offset_z: 0,
                    scale_x: 1,
                    scale_z: 1
                };
            }
        }
    }
    async Dispose() {
        const _global = this._gis["_global"];
        for (let level of this._pyramid) {
            for (let layer of level.layers) {
                if (layer.texture) {
                    _global.resources.Texture._ReleaseTile(layer.texture.tile);
                }
                layer.invalid = undefined;
                layer.inherit = undefined;
                layer.texture = undefined;
                layer.uvst = undefined;
                layer.cache = undefined;
                layer.loading = undefined;
            }
            level.id = 0;
            level.level = 0;
            level.submesh = 0;
            level.outer = false;
            level.reset = false;
            level.projections = null;
            level.layers = null;
        }
        this._gis = null;
        this._forceTerrain = false;
        this._blankTile = null;
        this._layers = null;
        this._tiling = 0;
        this._pyramid = null;
        this._pyramidTop = 0;
        this._pyramidHeight = 0;
    }
    Update(level, lb_col, lb_row, lb_bias_x, lb_bias_z, callback) {
        const levelCount = this.levelCount;
        const levels = this._pyramid;
        let top = this._pyramidTop;
        if (0 < levels[top].level) {
            let slide = level - levels[top].level;
            if (0 < slide) {
                if (slide > levelCount) {
                    slide = levelCount;
                }
                for (let i = 0; i < slide; i++) {
                    if (0 > --top) {
                        top = levelCount - 1;
                    }
                    levels[top].reset = true;
                }
            }
            else if (0 > slide) {
                if (slide < -levelCount) {
                    slide = levelCount;
                }
                else {
                    slide = -slide;
                }
                for (let i = 0; i < slide; i++) {
                    levels[top].reset = true;
                    if (levelCount == ++top) {
                        top = 0;
                    }
                }
            }
            this._pyramidTop = top;
        }
        lb_row = (Math.pow(2, level) - 1) - lb_row;
        for (let j = 0; j < 4; j++) {
            const tiling = j > 1 ? this._tiling + 1 : this._tiling;
            let lb_col_ = lb_col;
            let lb_row_ = lb_row;
            let offset_x_ = lb_bias_x;
            let offset_z_ = lb_bias_z;
            let scale_x_ = (this._tiling - 1) / tiling;
            let scale_z_ = (this._tiling - 1) / tiling;
            if (j > 1) {
            }
            for (let i = 0; i < levelCount; i++) {
                const cur = (top + i) % levelCount;
                const cur_level = levels[cur];
                const projection = cur_level.projections[j];
                if (j == 0) {
                    cur_level.submesh = (levelCount - 1) - i;
                    cur_level.outer = i == (levelCount - 1);
                    if (cur_level.level != level - i) {
                        if ((level - i) < 1) {
                            cur_level.level = 0;
                            cur_level.reset = true;
                            continue;
                        }
                        if (!cur_level.reset) {
                            this._gis["_global"].Track("Gis_pyramid.Update LOD层级重制状态标记异常！", 2);
                            cur_level.reset = true;
                        }
                        cur_level.level = level - i;
                    }
                }
                projection.lb_col = Math.floor(lb_col_);
                projection.lb_row = Math.floor(lb_row_);
                projection.offset_x = offset_x_ + ((lb_col_ - projection.lb_col) * (1 / tiling));
                projection.offset_z = offset_z_ + ((lb_row_ - projection.lb_row) * (1 / tiling));
                if (projection.offset_x > (1 / tiling)) {
                    projection.offset_x -= (1 / tiling);
                    projection.lb_col += 1;
                }
                if (projection.offset_z > (1 / tiling)) {
                    projection.offset_z -= (1 / tiling);
                    projection.lb_row += 1;
                }
                projection.scale_x = scale_x_;
                projection.scale_z = scale_z_;
                lb_col_ = (projection.lb_col - ((this._tiling - 1) * 0.5)) * 0.5;
                lb_row_ = (projection.lb_row - ((this._tiling - 1) * 0.5)) * 0.5;
                offset_x_ = projection.offset_x * 0.5;
                offset_z_ = projection.offset_z * 0.5;
                projection.lb_row = (Math.pow(2, cur_level.level) - 1) - projection.lb_row;
                if (j == 0) {
                    const tileS = this._gis.perimeter / Math.pow(2, cur_level.level);
                    const bottomMC = this._gis.perimeter_half - ((projection.lb_row + 1) * tileS);
                    const topMC = bottomMC + tileS * this._tiling;
                    let bottomLat = bottomMC / this._gis.perimeter_half * 180.0;
                    let topLat = topMC / this._gis.perimeter_half * 180.0;
                    bottomLat = 180 / Math.PI * (2 * Math.atan(Math.exp(bottomLat * Math.PI / 180.0)) - Math.PI / 2.0);
                    topLat = 180 / Math.PI * (2 * Math.atan(Math.exp(topLat * Math.PI / 180.0)) - Math.PI / 2.0);
                    const rowCount = Math.pow(2, (cur_level.level - 2));
                    const rowStride = 90.0 / rowCount;
                    const bottomRow = Math.floor((90.0 - bottomLat) / rowStride);
                    const topRow = Math.floor((90.0 - topLat) / rowStride);
                    if ((bottomRow - topRow) > this._tiling) {
                        this._gis["_global"].Track(`图层由墨卡托投影转经纬度投影时瓦片平铺数量溢出：${bottomRow} - ${topRow} > ${this._tiling}`, 2);
                    }
                    const offset_z__ = ((1.0 - (((90.0 - bottomLat) / rowStride) - bottomRow)) * (1 / (this._tiling + 1)));
                    const scale_z__ = (topLat - bottomLat) / (rowStride * (this._tiling + 1));
                    const projection_ = cur_level.projections[4];
                    projection_.lb_col = projection.lb_col;
                    projection_.lb_row = bottomRow;
                    projection_.offset_z = offset_z__ + scale_z__ * projection.offset_z;
                    projection_.offset_x = (this._tiling / (this._tiling + 1)) * projection.offset_x;
                    projection_.scale_z = scale_z__ * projection.scale_z;
                    projection_.scale_x = (this._tiling / (this._tiling + 1)) * projection.scale_x;
                    projection_.offset_z = (1 - projection_.scale_z) - projection_.offset_z;
                }
                projection.offset_z = (1.0 / tiling) - projection.offset_z;
            }
        }
        const timestamp = this._gis.timestamp;
        this.Flush(timestamp, (reuse, total, succeed, failed) => {
            console.log(timestamp, ":", reuse, total, succeed, failed);
            callback();
        });
    }
    Flush(timestamp, callback) {
        const levelCount = this.levelCount;
        const levels = this._pyramid;
        const top = this._pyramidTop;
        const understudy = [];
        let reuse = 0;
        for (let i = levelCount - 1; i > -1; i--) {
            const cur = (top + i) % levelCount;
            const cur_level = levels[cur];
            for (let j = 0; j < this._layers.length; j++) {
                const layer = this._layers[j];
                if (!layer.enabled) {
                    continue;
                }
                const layer_data = cur_level.layers[j];
                const layer_serv = this._gis.servers[layer.type];
                const layer_projection = cur_level.projections[layer_serv.projection];
                const cache = {};
                layer_data.uvst = layer_projection;
                if (cur_level.level < 1) {
                    continue;
                }
                layer_data.invalid = false;
                layer_data.inherit = null;
                if (cur_level.level < layer_serv.min_level) {
                    layer_data.invalid = true;
                    continue;
                }
                if (cur_level.level > layer_serv.max_level) {
                    if (i == (levelCount - 1)) {
                        console.error("todo ...");
                        layer_data.invalid = true;
                        continue;
                    }
                    else {
                        const bias = cur_level.level - layer_serv.max_level;
                        const last = (top + i + bias) % levelCount;
                        const last_level = levels[last];
                        const last_data = last_level.layers[j];
                        const last_projection = last_level.projections[layer_serv.projection];
                        const uvst = {
                            offset_x: last_projection.offset_x,
                            offset_z: last_projection.offset_z,
                            scale_x: last_projection.scale_x,
                            scale_z: last_projection.scale_z
                        };
                        for (let k = 0; k < bias; k++) {
                            uvst.offset_x = uvst.offset_x + uvst.scale_x * 0.25;
                            uvst.offset_z = uvst.offset_z + uvst.scale_z * 0.25;
                            uvst.scale_x = uvst.scale_x * 0.5;
                            uvst.scale_z = uvst.scale_z * 0.5;
                        }
                        layer_data.inherit = {
                            texture: last_data.texture,
                            uvst: uvst,
                            temporary: false
                        };
                        continue;
                    }
                }
                const flush = cur_level.reset || layer_projection.lb_col != layer_projection.last_lb_col || layer_projection.lb_row != layer_projection.last_lb_row;
                if (!flush) {
                    understudy[j] = i;
                    continue;
                }
                layer_projection.last_lb_col = layer_projection.lb_col;
                layer_projection.last_lb_row = layer_projection.lb_row;
                const tiling = layer_serv.projection > 1 ? this._tiling + 1 : this._tiling;
                if (cur_level.reset) {
                    for (let key in layer_data.cache) {
                        const tile = layer_data.cache[key];
                        if (tile.close) {
                            tile.close();
                        }
                    }
                    layer_data.cache = {};
                }
                layer_data.loading = [];
                const lb_col = layer_projection.lb_col;
                const lb_row = layer_projection.lb_row;
                for (let r = 0; r < tiling; r++) {
                    const row = lb_row - r;
                    for (let c = 0; c < tiling; c++) {
                        const col = lb_col + c;
                        const key = "" + col + "_" + row + "_" + cur_level.level;
                        const tile = layer_data.cache[key];
                        if (tile) {
                            cache[key] = tile;
                            layer_data.cache[key] = null;
                            this.FillTexture(layer_data.texture, tile, layer_serv.tile_size * c, layer_serv.tile_size * (tiling - r - 1));
                            reuse++;
                        }
                        else {
                            if (cur_level.level > (layer_serv.min_level - 1) && cur_level.level < (layer_serv.max_level + 1)) {
                                layer_data.loading.push({
                                    col: col,
                                    row: row,
                                    level: cur_level.level,
                                    xoffset: c,
                                    zoffset: r
                                });
                            }
                            if (layer_data.texture && layer_serv.tile_size == 256) {
                                this.FillTexture(layer_data.texture, this._blankTile, layer_serv.tile_size * c, layer_serv.tile_size * (tiling - r - 1));
                            }
                        }
                    }
                }
                for (let key in layer_data.cache) {
                    const tile = layer_data.cache[key];
                    if (tile && tile.close) {
                        tile.close();
                    }
                }
                layer_data.cache = cache;
                if (layer_data.loading.length > Math.ceil(tiling * tiling * 0.33)) {
                    if (understudy[j] != undefined) {
                        const bias = understudy[j] - i;
                        const last = (top + i + bias) % levelCount;
                        const last_level = levels[last];
                        const last_data = last_level.layers[j];
                        const last_projection = last_level.projections[layer_serv.projection];
                        const uvst = {
                            offset_x: last_projection.offset_x,
                            offset_z: last_projection.offset_z,
                            scale_x: last_projection.scale_x,
                            scale_z: last_projection.scale_z
                        };
                        for (let k = 0; k < bias; k++) {
                            uvst.offset_x = uvst.offset_x + uvst.scale_x * 0.25;
                            uvst.offset_z = uvst.offset_z + uvst.scale_z * 0.25;
                            uvst.scale_x = uvst.scale_x * 0.5;
                            uvst.scale_z = uvst.scale_z * 0.5;
                        }
                        layer_data.inherit = {
                            texture: last_data.texture,
                            uvst: uvst,
                            temporary: true
                        };
                    }
                }
                else {
                    understudy[j] = i;
                }
            }
            if (cur_level.reset) {
                cur_level.reset = false;
            }
        }
        this._gis["_global"].app.DrawFrame(1);
        this.Load(timestamp, (total, succeed, failed) => {
            callback(reuse, total, succeed, failed);
        });
    }
    FillTexture(texture, data, xoffset, yoffset) {
        const Texture = this._gis["_global"].resources.Texture;
        Texture._WriteTile(texture.tile, data, xoffset, yoffset);
    }
    Load(timestamp, callback) {
        const sort_weight = (level) => {
            let max_loading = this._tiling * this._tiling;
            for (let j = 0; j < this._layers.length; j++) {
                if (this._layers[j].enabled) {
                    const layer = level.layers[j];
                    if (layer.loading && max_loading > layer.loading.length) {
                        max_loading = layer.loading.length;
                    }
                }
            }
            if (max_loading < (this._tiling * 2)) {
                return level.level * 100;
            }
            else {
                return 100 - level.level;
            }
        };
        const levels = this._pyramid;
        const sorted_levels = levels.slice().sort((a, b) => {
            return sort_weight(b) - sort_weight(a);
        });
        const promises = [];
        const _global = this._gis["_global"];
        let total = 0;
        let succeed = 0;
        let failed = 0;
        for (let level of sorted_levels) {
            const cur_level = level;
            for (let j = 0; j < this._layers.length; j++) {
                const layer_index = j;
                const layer = this._layers[j];
                if (!layer.enabled) {
                    continue;
                }
                const layer_data = cur_level.layers[j];
                if (layer_data.invalid) {
                    continue;
                }
                if (layer_data.inherit && !layer_data.inherit.temporary) {
                    continue;
                }
                const layer_serv = this._gis.servers[layer.type];
                const layer_projection = cur_level.projections[layer_serv.projection];
                const tiling = layer_serv.projection > 1 ? this._tiling + 1 : this._tiling;
                if (!layer_data.texture) {
                    const tile = _global.resources.Texture._CreateTile(layer_serv.tile_size * tiling, layer_serv.tile_size * tiling, 0);
                    const info = _global.env.uarrayGet(tile, 12, 8);
                    const layer = info[1];
                    const rect = [
                        info[6] * 64 / 4096,
                        info[7] * 64 / 4096,
                        (info[2] - 1) / 4096,
                        (info[3] - 1) / 4096
                    ];
                    layer_data.texture = {
                        tile,
                        layer,
                        rect
                    };
                }
                let loading = layer_data.loading?.length || 0;
                total += loading;
                if (loading > 0) {
                    const cache = layer_data.cache;
                    function load_buffer(url, times, callback_) {
                        function response_(buffer) {
                            if (buffer) {
                                callback_(buffer);
                            }
                            else if (0 < --times) {
                                setTimeout(load_, 500);
                            }
                            else {
                                callback_(null);
                            }
                        }
                        function load_() {
                            _global.Fetch(url, null, "arrayBuffer").then(response_).catch((e) => {
                                console.error(e);
                                response_(null);
                            });
                        }
                        load_();
                    }
                    promises.push((new Promise((resolve, reject) => {
                        const flush = (succ) => {
                            if (succ === true) {
                                succeed++;
                            }
                            else {
                                failed++;
                            }
                            this._gis["_global"].app.DrawFrame(1);
                            if (0 == --loading) {
                                layer_data.loading = [];
                                if (layer_data.inherit && layer_data.inherit.temporary) {
                                    layer_data.inherit = null;
                                }
                                resolve();
                            }
                        };
                        for (let info_ of layer_data.loading) {
                            const info = info_;
                            const key = "" + info.col + "_" + info.row + "_" + info.level;
                            const url = this._gis.ServeUrl(layer.type, layer.token, info.col, info.row, info.level);
                            if (layer.type == "tianditu_dem_c") {
                                _global.worker.Decode_dem(1, url).then((data) => {
                                    if (data && timestamp == this._gis.timestamp) {
                                        const bitmap = {
                                            width: layer_serv.tile_size,
                                            height: layer_serv.tile_size,
                                            data: data,
                                            dataLayout: {
                                                offset: 0,
                                                bytesPerRow: 4 * layer_serv.tile_size,
                                                rowsPerImage: layer_serv.tile_size
                                            }
                                        };
                                        this.FillTexture(layer_data.texture, bitmap, layer_serv.tile_size * info.xoffset, layer_serv.tile_size * (tiling - info.zoffset - 1));
                                        cache[key] = bitmap;
                                        flush(true);
                                    }
                                    else {
                                        flush(false);
                                    }
                                }).catch(e => {
                                    flush(false);
                                });
                            }
                            else {
                                load_buffer(url, 3, (buffer) => {
                                    if (buffer && timestamp == this._gis.timestamp) {
                                        const blob = new Blob([new Int8Array(buffer)]);
                                        const option = undefined;
                                        createImageBitmap(blob, option).then((bitmap) => {
                                            this.FillTexture(layer_data.texture, bitmap, layer_serv.tile_size * info.xoffset, layer_serv.tile_size * (tiling - info.zoffset - 1));
                                            cache[key] = bitmap;
                                            flush(true);
                                        }).catch(flush);
                                    }
                                    else {
                                        flush(false);
                                    }
                                });
                            }
                        }
                    })));
                }
            }
        }
        Promise.all(promises).then(() => {
            callback(total, succeed, failed);
        }).catch((e) => {
            console.error(e);
            callback(total, succeed, failed);
        });
    }
    GetDrawRegion() {
        let index = this._pyramidTop + this.levelCount - 1;
        let level = this._pyramid[index % this.levelCount];
        for (let i = 0; i < this.levelCount; i++) {
            if (level.level > 3) {
                break;
            }
            else {
                index -= 1;
                level = this._pyramid[index % this.levelCount];
            }
        }
        const projection = level.projections[0];
        const tileS = this._gis.perimeter / Math.pow(2, level.level);
        const bottomMC = this._gis.perimeter_half - ((projection.lb_row + 1) * tileS);
        const topMC = bottomMC + tileS * this._tiling;
        let leftMC = projection.lb_col * tileS - this._gis.perimeter_half;
        if (leftMC < -this._gis.perimeter_half) {
            leftMC = this._gis.perimeter_half + (leftMC % this._gis.perimeter_half);
        }
        else if (leftMC > this._gis.perimeter_half) {
            leftMC = -this._gis.perimeter_half + (leftMC % this._gis.perimeter_half);
        }
        const rightMC = leftMC + tileS * this._tiling;
        return [leftMC, rightMC, bottomMC, topMC];
    }
    get levelCount() {
        return this._pyramidHeight;
    }
    get layerTiling() {
        return this._tiling;
    }
    set forceTerrain(enable) {
        this._forceTerrain = enable;
    }
    get terrain() {
        return this._layers[0].enabled && (this._forceTerrain || (this._gis.level > 8 && this._gis.level < 17));
    }
    set terrain(b) {
        this._layers[0].enabled = b;
    }
    _gis;
    _forceTerrain;
    _blankTile;
    _layers;
    _tiling;
    _pyramid;
    _pyramidTop;
    _pyramidHeight;
}
export class Gis_districts {
    constructor(_gis) {
        this._gis = _gis;
        this._countries = {};
    }
    async Init() {
        const global = this._gis["_global"];
        this._area_renderer = await (async () => {
            const material = await global.resources.Material.Create({
                uuid: "",
                classid: 32,
                name: "gis_districts",
                label: "gis_districts",
                shader: "1-1-1.miaokit.builtins:/shader/gis_ulit/17-16_gis_vtile_ulit.json",
                flags: 0,
                properties: {
                    textures: {},
                    vectors: {}
                }
            });
            material.AddRef();
            const mesh_renderer = await global.resources.MeshRenderer.Create(null, null);
            mesh_renderer.AddRef();
            const pipeline = global.context.CreateRenderPipeline({
                g1: mesh_renderer.layoutID,
                g2: material.layoutID,
                g3: 0,
                flags: 0,
                topology: 3,
                frontFace: 0,
                cullMode: 1
            });
            return { material, mesh_renderer, pipeline };
        })();
        this._line_renderer = await (async () => {
            const material = await global.resources.Material.Create({
                uuid: "",
                classid: 32,
                name: "gis_districts",
                label: "gis_districts",
                shader: "1-1-1.miaokit.builtins:/shader/gis_ulit/17-17_gis_vline_ulit.json",
                flags: 0,
                properties: {
                    textures: {},
                    vectors: {}
                }
            });
            material.AddRef();
            const mesh_renderer = await global.resources.MeshRenderer.Create(null, null);
            mesh_renderer.AddRef();
            const pipeline = global.context.CreateRenderPipeline({
                g1: mesh_renderer.layoutID,
                g2: material.layoutID,
                g3: 0,
                flags: 0,
                topology: 3,
                frontFace: 0,
                cullMode: 1
            });
            return { material, mesh_renderer, pipeline };
        })();
        return this;
    }
    async Dispose() {
        for (let key in this._countries) {
            const district = this._countries[key];
            if (district) {
                district.Dispose(this._gis);
            }
        }
        if (this._area_renderer) {
            this._area_renderer.material.Release();
            this._area_renderer.mesh_renderer.Release();
            this._area_renderer.pipeline = null;
        }
        if (this._line_renderer) {
            this._line_renderer.material.Release();
            this._line_renderer.mesh_renderer.Release();
            this._line_renderer.pipeline = null;
        }
        this._gis = null;
        this._area_renderer = null;
        this._line_renderer = null;
        this._countries = null;
    }
    async Load(keywords, token) {
        let serv = `https://restapi.amap.com/v3/config/district?key=${token}&extensions=all&subdistrict=`;
        let container = this._countries;
        let district = null;
        for (let i = 0; i < 4; i++) {
            if (!keywords[i]) {
                break;
            }
            district = container[keywords[i]];
            if (!district) {
                const path = serv + (i == 3 ? 1 : 0) + "&keywords=" + keywords[i];
                const jdata = await this._gis["_global"].Fetch(path, null, "json");
                if (!jdata || jdata.status != "1" || jdata.infocode != "10000") {
                    break;
                }
                district = container[keywords[i]] = await (new Gis_district()).Build(this._gis, jdata);
                container = district.districts;
            }
        }
        return district;
    }
    Draw(queue) {
        const context = this._gis["_global"].context;
        const passEncoder = queue.passEncoder;
        const instance = this._countries["中华人民共和国"].polygons;
        {
            queue.BindMeshRenderer(this._area_renderer.mesh_renderer);
            queue.BindMaterial(this._area_renderer.material);
            queue.SetPipeline(this._area_renderer.pipeline, 0);
            const dbuffer = instance.vertexBuffer;
            const vbuffer = instance.vertexBuffer;
            const ibuffer = instance.indexBuffer;
            context.SetVertexBuffer(0, vbuffer.buffer, vbuffer.offset, 8 * instance.vertexCount, passEncoder);
            context.SetVertexBuffer(1, vbuffer.buffer, vbuffer.offset, 8 * instance.vertexCount, passEncoder);
            context.SetIndexBuffer(4, ibuffer, passEncoder);
            passEncoder.drawIndexed(instance.indexCount, 1, 0, 0, instance.instanceIndex);
        }
        {
            queue.BindMeshRenderer(this._line_renderer.mesh_renderer);
            queue.BindMaterial(this._line_renderer.material);
            queue.SetPipeline(this._line_renderer.pipeline, 0);
            const vbuffer = instance.vertexBuffer;
            for (let sub of instance.list) {
                const instanceCount = sub.vertexCount - 1;
                const offset = sub.vertexStart * 8;
                const size = instanceCount * 8;
                context.SetVertexBuffer(0, vbuffer.buffer, vbuffer.offset + offset, size, passEncoder);
                context.SetVertexBuffer(1, vbuffer.buffer, vbuffer.offset + offset + 8, size, passEncoder);
                passEncoder.draw(6, instanceCount, 0, 0);
            }
        }
    }
    get countries() {
        return this._countries;
    }
    _gis;
    _area_renderer;
    _line_renderer;
    _countries;
}
export class Gis_district {
    constructor() {
    }
    async Build(gis, jdata) {
        const district = jdata.districts[0];
        const global = gis["_global"];
        this.adcode = district.adcode;
        this.level = district.level;
        this.name = district.name;
        let center = district.center.split(",");
        let centerLL = gis.GCJ02_WGS84([parseFloat(center[0]), parseFloat(center[1])]);
        this.center = gis.LL2MC(centerLL);
        this.citycode = district.citycode.length > 0 ? district.citycode : undefined;
        this.districts = {};
        for (let child of district.districts) {
            if (child.districts.length > 0 || child.polyline) {
                console.error("一个请求中，子级行政区不能包含下级行政区数据或边界数据！");
                continue;
            }
            center = child.center.split(",");
            centerLL = gis.GCJ02_WGS84([parseFloat(center[0]), parseFloat(center[1])]);
            child.center = center;
            child.districts = {};
            this.districts[child.name] = child;
        }
        if (district.polyline) {
            const areas = district.polyline.split("|");
            if (this.adcode == "100000") {
                areas.push("109.880724,15.120251;109.628081,15.76963;109.308068,16.206794;109.628081,15.76963;");
                areas.push("110.065994,11.201393;110.268109,11.597645;110.301794,12.207428;110.268109,11.597645;");
                areas.push("108.297498,5.973936;108.196441,6.55991;108.230127,7.061627;108.196441,6.55991;");
                areas.push("112.85019,3.748308;111.805039,3.402625;");
                areas.push("116.245928,7.991342;115.559288,7.14203;");
                areas.push("118.973393,11.963476;118.535888,10.891413;");
                areas.push("119.063434,16.018959;119.058695,15.02373;");
                areas.push("120.030011,19.033867;119.473776,18.01388;");
                areas.push("121.918731,21.685607;121.206531,20.853372;");
                areas.push("122.796478,24.555838;122.513859,23.471598;");
            }
            this.polygons = {
                instanceIndex: 0,
                vertexCount: 0,
                indexCount: 0,
                vertexBuffer: null,
                indexBuffer: null,
                list: []
            };
            const polygons = this.polygons;
            for (let a = 0; a < areas.length; a++) {
                const points = areas[a].split(/[,;]/);
                const points_ = [];
                const length = points[points.length - 1] == "" ? points.length - 1 : points.length;
                let min_x = Number.MAX_VALUE;
                let max_x = Number.MIN_VALUE;
                let min_z = Number.MAX_VALUE;
                let max_z = Number.MIN_VALUE;
                for (let i = 0; i < length; i += 2) {
                    const lng = parseFloat(points[i + 0]);
                    const lat = parseFloat(points[i + 1]);
                    const ll = gis.GCJ02_WGS84([lng, lat]);
                    const mc = gis.LL2MC(ll);
                    if (min_x > mc[0])
                        min_x = mc[0];
                    if (max_x < mc[0])
                        max_x = mc[0];
                    if (min_z > mc[1])
                        min_z = mc[1];
                    if (max_z < mc[1])
                        max_z = mc[1];
                    points_[i + 0] = mc[0];
                    points_[i + 1] = mc[1];
                }
                const triangles = global.worker.Earcut(points_);
                for (let i = 0; i < triangles.length; i++) {
                    triangles[i] += polygons.vertexCount;
                }
                const polygon = {
                    vertexStart: polygons.vertexCount,
                    vertexCount: points_.length / 2,
                    indexStart: polygons.indexCount,
                    indexCount: triangles.length,
                    region: [min_x, max_x, min_z, max_z],
                    points: points_,
                    indices: triangles,
                };
                polygons.vertexCount += polygon.vertexCount;
                polygons.indexCount += polygon.indexCount;
                polygons.list.push(polygon);
            }
            polygons.vertexBuffer = global.resources.Dioramas.GenBuffer(0, Math.ceil(polygons.vertexCount / 2.5));
            polygons.indexBuffer = global.resources.Dioramas.GenBuffer(1, polygons.indexCount);
            const vbuffer = new Float32Array(polygons.vertexCount * 2);
            const ibuffer = new Uint32Array(polygons.indexCount);
            for (let sub of polygons.list) {
                vbuffer.set(sub.points, sub.vertexStart * 2);
                ibuffer.set(sub.indices, sub.indexStart);
            }
            global.device.WriteBuffer(polygons.vertexBuffer.buffer, polygons.vertexBuffer.offset, vbuffer.buffer, 0, vbuffer.byteLength);
            global.device.WriteBuffer(polygons.indexBuffer.buffer, polygons.indexBuffer.offset, ibuffer.buffer, 0, ibuffer.byteLength);
        }
        return this;
    }
    Dispose(gis) {
        const global = gis["_global"];
        for (let key in this.districts) {
            const district = this.districts[key];
            if (district) {
                district.Dispose(gis);
            }
        }
        if (this.polygons) {
            if (this.polygons.vertexBuffer) {
                global.resources.Dioramas.FreeBuffer(this.polygons.vertexBuffer);
            }
            if (this.polygons.indexBuffer) {
                global.resources.Dioramas.FreeBuffer(this.polygons.indexBuffer);
            }
            this.polygons.instanceIndex = 0;
            this.polygons.vertexCount = 0;
            this.polygons.indexCount = 0;
            this.polygons.vertexBuffer = null;
            this.polygons.indexBuffer = null;
            this.polygons.list = null;
        }
        this.adcode = undefined;
        this.level = undefined;
        this.name = undefined;
        this.center = undefined;
        this.citycode = undefined;
        this.districts = undefined;
        this.polygons = undefined;
    }
    adcode;
    level;
    name;
    center;
    citycode;
    districts;
    polygons;
}
