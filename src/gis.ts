import * as Miaoverse from "./mod.js"
import proj4 from "./worker/proj4.js"

/** GIS系统。 */
export class Gis {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;

        this._originMC = [12270000, 2910000];
        this._originLL = this.MC2LL(this._originMC);
        this._centerMC = [12270000, 2910000];
    }

    /**
     *初始化GIS系统。
     */
    public async Init() {
        const resources = this._global.resources;

        this._districts = await (new Gis_districts(this)).Init();
        this._kmls = await (new Gis_kmls(this)).Init();

        this._pyramid = new Gis_pyramid(this, 8, 4);

        // 最内层子网格7，大小64 * 4 = 256
        this._mesh = await resources.Mesh.Create({
            uuid: "",
            classid: Miaoverse.CLASSID.ASSET_MESH,
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
                classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                name: "gis:" + i,
                label: "gis:" + i,

                shader: "1-1-1.miaokit.builtins:/shader/gis_ulit/17-11_gis_ulit.json",
                flags: Miaoverse.RENDER_FLAGS.ATTRIBUTES0,
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
            // 从LOD网格内层往外层绘制，可减少开销
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

    /**
     * 清除对象。
     */
    public async Dispose() {
        if (this._flushing > 0) {
            await (new Promise<void>((resolve, reject) => {
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
        this._kmls = undefined;

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

    /**
     * 根据相机姿态刷新地图。
     * 注意：应当在帧绘制前应用相机最新姿态更新GIS。如果帧绘制使用的相机姿态与GIS当前使用的相机姿态不同，会导致画面不同步或抖动。
     * @param camera 相机组件实例。
     */
    public Update(camera: Miaoverse.Camera) {
        const target = camera.target;
        const distance = camera.distance;
        const pitch = camera.pitch;
        const yaw = camera.yaw;
        const height = camera.height;
        const fov = camera.fov;

        // 当前世界空间原点经纬度和墨卡托坐标
        const originMC = this._originMC;
        const originLL = this._originLL;

        // 3D交互在地球表面进行，将地球表面的空间距离转换为墨卡托投影空间的距离，再换算为经纬度
        // 相机在球面世界空间中平移，使用该缩放将平移量转换到墨卡托投影空间
        const scaleMC = 1.0 / Math.cos(originLL[1] / 180.0 * Math.PI);

        let offsetX = target[0] * scaleMC;
        let offsetZ = -target[2] * scaleMC;
        let resetOrigin = false;

        // 如果偏移量大于20000MC，则重新设置世界空间原点经纬度和墨卡托坐标
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

            // 设置新世界空间原点后，重新计算相机观察点世界空间坐标
            const _scaleMC = Math.cos(this._originLL[1] / 180.0 * Math.PI);
            target[0] = offsetX * _scaleMC;
            target[2] = -offsetZ * _scaleMC;

            resetOrigin = true;
        }

        // 当前相机观察点墨卡托坐标和经纬度
        const targetMC = [originMC[0] + offsetX, originMC[1] + offsetZ];
        const targetLL = this.MC2LL(targetMC);

        // 在35度垂直视角下，屏幕像素高度对应的屏幕像素距离
        const distancePix = Math.round(height * 0.5 / Math.tan(0.5 * fov));
        // 中心图层分辨率（米/像素）
        const dpi = distance / (distancePix);
        // 中心图层级别
        const pow = 40075016.685578488 / (256 * dpi);
        // 计算最高精度显示级别
        const level = Math.log2(pow);

        this.FlushMaterial({
            centerMC: this._centerMC,
            targetMC: targetMC,
            movedMC: [targetMC[0] - this._centerMC[0], targetMC[1] - this._centerMC[1]],
            targetXZ: [target[0], target[2]],
            originMC: [this._originMC[0], this._originMC[1]],
        });

        // 刷新地图
        this.Flush(target[0], target[2], targetLL[0], targetLL[1], level, pitch, yaw);

        return resetOrigin ? target : null;
    }

    /**
     * 设置当前GIS状态。
     * @param x 世界空间相机观察点坐标X（网格中心坐标）。
     * @param z 世界空间相机观察点坐标Z（网格中心坐标）。
     * @param lng 相机观察点经度（WGS84）。
     * @param lat 相机观察点纬度（WGS84）。
     * @param level 相机观察点瓦片级别。
     * @param pitch 观察俯仰角。
     * @param yaw 观察偏航角。
     */
    public Flush(x: number, z: number, lng: number, lat: number, level: number, pitch: number, yaw: number) {
        /*/
        当前世界空间原点墨卡托坐标originMC和经纬度originLL
        当前世界空间相机观察点坐标camera.target
        当前相机观察点墨卡托坐标targetMC和经纬度targetLL
        当前相机观察点瓦片级别level

        网格中心墨卡托坐标centerMC，各层级瓦片平铺和采样范围以低频方式更新
        渲染GIS球体，首先计算每个网格顶点对应的经纬度，根据经纬度构造球面

        相机观察点经纬度targetLL、世界空间相机观察点坐标camera.target实时更新
        根据targetLL、camera.target旋转平移球体
        /*/

        // PLOY3D世界空间原点经纬度通常固定，相机相对世界空间原点移动观察
        // 渲染GIS球体时，首先计算每个网格顶点对应的经纬度，根据经纬度构造球面
        // 旋转GIS球体使观察点垂直向上
        // 平移GIS球体观察点至相机观察点坐标

        if (this._lock || this._waitClose) {
            return;
        }

        const timestamp = Date.now();

        if (this._flushing > 0) {
            // 上一次刷新响应未超时的情况下，将当前刷新命令置入等待队列
            // 保证了异常超时的情况下仍可刷新
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

        // 经纬度投影L2时分2行，为保证底层能包含8+1个瓦片，底层最小级别为5
        // 为了支持更高清的正射影像，顶层最大级别为23
        // 天地图地形DEM瓦片仅存在于[7, 12]级别之间，L5、L6的地形不加载，如果底层级别大于L12，加载L12的瓦片

        level = Math.ceil(level);

        // TODO ...
        if (level > 18) {
            level = 18;
        }

        // =========================================================

        const layerTiling = this._pyramid.layerTiling;
        const layerTilingHalf = layerTiling * 0.5;

        const centerMC = this.LL2MC([lng, lat]);
        const tileY = Math.floor(level);
        const tileS = this.perimeter / Math.pow(2, tileY);
        // 注意，最内层子网格大小64 * 4 = 256
        const meshS = (tileS * (layerTiling - 1)) / (1 * 64 * 4);
        // 注意，列从经度-180度开始划分，而我们LL2MC是从经度0开始的
        const unitX = (this.perimeter_half + centerMC[0]) / tileS;
        const tileX = Math.floor(unitX);
        // 注意，行从纬度+90度开始划分，而我们LL2MC是从纬度0开始的
        const unitZ = (this.perimeter_half - centerMC[1]) / tileS;
        const tileZ = Math.floor(unitZ);

        // 中心瓦片不变，无需刷新地图数据
        if (tileX == this._tileX && tileZ == this._tileZ && tileY == this._tileY) {
            return;
        }

        this._centerMC = centerMC;
        this._centerPos = [x, z];
        this._tileX = tileX;
        this._tileZ = tileZ;
        this._tileY = tileY;
        this._meshS = meshS;

        // 要使中心经纬度对应的像素位于网格中心，需要计算图层采样偏移
        const localX = unitX - tileX;
        const localZ = unitZ - tileZ;

        // 左下角起始瓦片行列号和采样偏移
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
            size: [/*16384 * */this._meshS],
            originMC: [this._originMC[0], this._originMC[1]],
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
                //this._global.Track(`Gis.Flush: 该GIS刷新响应已经超时！${Math.ceil((Date.now() - timestamp) / 1000)}s`, 2);
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

    /**
     * 刷新材质属性。
     * @param values 材质属性值。
     */
    public FlushMaterial(values?: {
        centerMC?: number[];
        targetMC?: number[];
        movedMC?: number[];
        targetXZ?: number[];
        size?: number[];
        originMC?: number[];
    }) {
        if (values) {
            for (let key in values) {
                const value = values[key as keyof typeof values];

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

            if (values.originMC) {
                this._districts["_area_renderer"].material.view["originMC"] = values.originMC;
                this._districts["_line_renderer"].material.view["originMC"] = values.originMC;
            }

            return;
        }

        // ==============--------------------------

        const levelCount = this._pyramid["levelCount"];
        const levels = this._pyramid["_pyramid"];
        const top = this._pyramid["_pyramidTop"];
        const top_level = this._tileY;
        const layers = this._pyramid["_layers"];
        const tileS = this.perimeter / Math.pow(2, top_level);

        this._districts["_area_renderer"].material.view["pixelS"] = [tileS / 256];
        this._districts["_line_renderer"].material.view["pixelS"] = [tileS / 256];

        let dem_region_low: number[];
        let dem_uvst_low: number[];
        let dem_region_high: number[];
        let dem_uvst_high: number[];

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

                // 从最高级别取地图图层数据，用于绘制矢量图形
                if (j == 0 && (cur_level.level > 9 && cur_level.level < 13) && !layer_data.inherit) {
                    const tiling = this._pyramid.layerTiling + 1;
                    const lb_col = cur_level.projections[Gis_projection.LNGLAT].lb_col;
                    const lb_row = cur_level.projections[Gis_projection.LNGLAT].lb_row;

                    const rc_count = Math.pow(2, (cur_level.level - 2));
                    const rc_stride = 90.0 / rc_count;
                    const blat = 90 - ((lb_row + 1) * rc_stride);
                    const tlat = 90 - ((lb_row - tiling + 1) * rc_stride);
                    const llng = lb_col * rc_stride - 180;
                    const rlng = (lb_col + tiling) * rc_stride - 180;

                    const lb_mc = this.LL2MC([llng, blat]);
                    const rt_mc = this.LL2MC([rlng, tlat]);

                    dem_region_low = [lb_mc[0], rt_mc[0], lb_mc[1], rt_mc[1]];
                    dem_uvst_low = texture.rect;

                    if (!dem_region_high) {
                        dem_region_high = dem_region_low;
                        dem_uvst_high = dem_uvst_low;
                    }
                }
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

        if (!dem_region_low) {
            dem_region_low = [0, 0, 0, 0];
            dem_uvst_low = [0, 0, 1, 1];

            dem_region_high = [0, 0, 0, 0];
            dem_uvst_high = [0, 0, 1, 1];
        }

        this._districts["_area_renderer"].material.view["dem_region_low"] = dem_region_low;
        this._districts["_line_renderer"].material.view["dem_region_low"] = dem_region_low;

        this._districts["_area_renderer"].material.view["dem_uvst_low"] = dem_uvst_low;
        this._districts["_line_renderer"].material.view["dem_uvst_low"] = dem_uvst_low;

        this._districts["_area_renderer"].material.view["dem_region_high"] = dem_region_high;
        this._districts["_line_renderer"].material.view["dem_region_high"] = dem_region_high;

        this._districts["_area_renderer"].material.view["dem_uvst_high"] = dem_uvst_high;
        this._districts["_line_renderer"].material.view["dem_uvst_high"] = dem_uvst_high;
    }

    /**
     * 绘制场景。
     * @param passEncoder 渲染通道命令编码器。
     */
    public DrawMesh(queue: Miaoverse.DrawQueue) {
        this.FlushMaterial();

        this._drawParams.mesh = this._mesh;
        this._drawParams.materials = this._materials;

        queue.DrawMesh(this._drawParams);
    }

    /**
     * 绘制矢量瓦片。
     * @param queue passEncoder 渲染通道命令编码器。
     */
    public Draw(queue: Miaoverse.DrawQueue) {
        this.districts.Draw(queue);
    }

    /**
     * 计算太阳方位角和高度角。
     * 方位角：单位度，正北为0，顺时针增加，[0, 360]；
     * 高度角：单位度，地平线为0，向上增加，[-90, 90]；
     * @param params 经纬度和时间参数。
     * @returns 返回太阳方位角和高度角。
     */
    public CalSunlight(params: {
        /** 经度，单位度，东经为正，西经为负。 */
        lng?: number;
        /** 纬度，单位度，北纬为正，南纬为负。 */
        lat?: number;
        /** 时区，单位小时，东区为正，西区为负。 */
        tz?: number;
        /** 年份，如2023。 */
        year: number;
        /** 月份，1-12。 */
        month: number;
        /** 日期，1-31。 */
        day: number;
        /** 小时，0-23。 */
        hours: number;
        /** 分钟，0-59。 */
        minutes: number;
        /** 秒钟，0-59。 */
        seconds: number;
    }) {
        // http://www.jgiesen.de/astro/astroJS/sunriseJS/index.htm

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

        const utDate: any = new Date(millis);
        const utYear = utDate.getYear() + 1900;
        const utMonth = utDate.getMonth() + 1;
        const utDay = utDate.getDate();
        const utHours = utDate.getHours();
        const utMinutes = utDate.getMinutes();
        const UT = utHours + utMinutes / 60 + params.seconds / 3600;

        // 用来计算给定日期的儒略日
        function julian_day(d: number, m: number, y: number, u: number) {
            if (m <= 2) {
                m += 12;
                y -= 1;
            }

            const a = Math.floor(y / 100);
            const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 13 - 1524.5 + u / 24.0;

            return jd;
        }

        const jd = julian_day(utDay, utMonth, utYear, UT);

        const K = Math.PI / 180.0; // 弧度转换系数
        const T0 = 2451545.0; // 儒略日历的起始日
        const L0 = 280.46645; // 太阳的平黄经
        const M0 = 357.5291; // 太阳的平近点角
        const C1 = 1.9146; // 太阳的黄经方程的第一项
        const C2 = 0.019993; // 太阳的黄经方程的第二项

        // 计算太阳赤纬
        function declination(day: number, month: number, year: number, UT: number) {
            const T = (jd - T0) / 36525.0; // 儒略世纪数
            const L = L0 + (36000.76983 + 0.0003032 * T) * T; // 太阳的平黄经
            let M = M0 + (35999.0503 - (0.0001559 * T + 0.00000048 * T) * T) * T; // 太阳的平近点角
            M = K * M; // 太阳的平近点角（弧度）
            const theta = L + (C1 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (C2 - 0.000101 * T) * Math.sin(2 * M) + 0.000290 * Math.sin(3 * M); // 太阳的真黄经
            const omega = 125.04 - 1934.136 * T;
            const lambda = theta - 0.00569 - 0.00478 * Math.sin(K * omega);
            const eps0 = 23.0 + 26.0 / 60.0 + 21.448 / 3600.0 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
            const eps = eps0 + 0.00256 * Math.cos(K * omega);
            let declin = Math.sin(K * eps) * Math.sin(K * lambda);
            declin = Math.asin(declin) / K; // 太阳的赤纬
            let RA = Math.atan2(Math.cos(K * eps) * Math.sin(K * lambda), Math.cos(K * lambda)) / K; // 太阳的赤经
            if (RA < 0) RA = RA + 360; // 保证赤经在0-2π之间
            return { declin, RA };
        }

        const { declin, RA } = declination(utDay, utMonth, utYear, UT);

        // 用来计算格林时角GHA
        function computeGHA(T: number, M: number, J: number, STD: number) {
            let K = Math.PI / 180.0, N, X, XX, P;
            N = 365 * J + T + 31 * M - 46;
            if (M < 3) N = N + Math.floor((J - 1) / 4);
            else N = N - Math.floor(0.4 * M + 2.3) + Math.floor(J / 4);
            P = STD / 24.0;
            X = (P + N - 7.22449E5) * 0.98564734 + 279.306;
            X = X * K;
            XX = -104.55 * Math.sin(X) - 429.266 * Math.cos(X) + 595.63 * Math.sin(2.0 * X) - 2.283 * Math.cos(2.0 * X);
            XX = XX + 4.6 * Math.sin(3.0 * X) + 18.7333 * Math.cos(3.0 * X);
            XX = XX - 13.2 * Math.sin(4.0 * X) - Math.cos(5.0 * X) - Math.sin(5.0 * X) / 3.0 + 0.5 * Math.sin(6.0 * X) + 0.231;
            XX = XX / 240.0 + 360.0 * (P + 0.5);
            if (XX > 360.0) XX = XX - 360.0;
            return XX;
        }

        const GHA = computeGHA(utDay, utMonth, utYear, UT);

        // 计算太阳高度角
        function computeHeight(dec: number, latitude: number, longit: number, gha: number) {
            const lat_K = latitude * K;
            const dec_K = dec * K;
            const x = gha + longit;
            // 计算太阳高度角的正弦值
            const sinHeight = Math.sin(dec_K) * Math.sin(lat_K) + Math.cos(dec_K) * Math.cos(lat_K) * Math.cos(K * x);
            // 计算太阳高度角
            return Math.asin(sinHeight) / K;
        }

        let elev = computeHeight(declin, params.lat, params.lng, GHA);

        elev = Math.round(10 * elev) / 10;

        // 计算太阳方位角
        function computeAzimut(dec: number, latitude: number, longitude: number, GHA: number, hoehe: number) {
            let cosAz, Az, nenner;
            let lat_K = latitude * K;
            let hoehe_K = hoehe * K;
            nenner = Math.cos(hoehe_K) * Math.cos(lat_K);
            // 计算太阳方位角的余弦值
            cosAz = (Math.sin(dec * K) - Math.sin(lat_K) * Math.sin(hoehe_K)) / nenner;
            Az = Math.PI / 2.0 - Math.asin(cosAz);
            Az = Az / K;
            if (Math.sin(K * (Number(GHA) + Number(longitude))) <= 0) Az = Az;
            else Az = 360.0 - Az;
            return Az;
        }

        // 计算太阳方位角
        let azimuth = computeAzimut(declin, params.lat, params.lng, GHA, elev);

        azimuth = Math.round(10 * azimuth) / 10;

        // 光照方向
        const direction = (this._global.Vector3([elev, -azimuth, 0])).toQuaternion().RotateVector(this._global.Vector3([0, 0, -1]));

        return {
            /** 太阳方位角。 */
            azimuth: azimuth,
            /** 太阳高度角。 */
            altitude: elev,
            /** 太阳光照方向。 */
            direction: direction
        };
    }

    /**
     * 计算指定经纬度所在当前世界空间坐标。
     * @param lng 指定经度（WGS84）。
     * @param lat 指定纬度（WGS84）。
     * @returns 返回当前世界空间坐标。
     */
    public CalPosition(lng: number, lat: number) {
        // 当前世界空间原点经纬度和墨卡托坐标
        const originMC = this._originMC;
        const originLL = this._originLL;

        // 指定位置点经纬度和墨卡托坐标
        const targetLL = [lng, lat];
        const targetMC = this.LL2MC(targetLL);

        let offsetX = targetMC[0] - originMC[0];
        let offsetZ = targetMC[1] - originMC[1];

        // 使用该缩放将平移量从墨卡托投影空间转换到球面世界空间
        const scaleMC = Math.cos(originLL[1] / 180.0 * Math.PI);

        offsetX = offsetX * scaleMC;
        offsetZ = -offsetZ * scaleMC;

        return this._global.Vector3([offsetX, 0, offsetZ]);
    }

    /**
     * 生成瓦片请求URL。
     * @param type 瓦片服务类型。
     * @param token 瓦片服务TOKEN。
     * @param col 瓦片列号。
     * @param row 瓦片行号。
     * @param level 瓦片级别。
     * @returns 返回URL。
     */
    public ServeUrl(type: Gis_layer["type"], token: string, col: number, row: number, level: number) {
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

    /**
     * 经纬度转当前世界空间坐标（当前世界空间原点经纬度_originLL）。
     * 注意：
     * 我们基于当前世界空间原点纬度_originLL[1]来转换世界距离到墨卡托投影距离；
     * 两个地理位置点间的世界空间距离不是准确的，特别是在纬度跨度很大时；
     * @param ll 经纬度。
     * @returns 当前世界空间坐标。
     */
    public LL2WPOS(ll: number[]): number[] {
        const mc = this.LL2MC(ll);
        // 相机在球面世界空间中平移，将墨卡托投影空间的距离转换为地球表面的空间距离
        const scale = Math.cos(this._originLL[1] / 180.0 * Math.PI);

        return [(mc[0] - this._originMC[0]) * scale, 0, (this._originMC[1] - mc[1]) * scale];
    }

    /** GIS行政区管理。 */
    public get districts() {
        return this._districts;
    }

    /** GIS行政区管理。 */
    public get kmls() {
        return this._kmls;
    }

    /** 是否启用GIS系统。 */
    public get enable() {
        return this._enable;
    }
    public set enable(b) {
        this._enable = b;
    }

    /** 当前中心经度。 */
    public get lng() {
        return this._lng;
    }

    /** 当前中心纬度。 */
    public get lat() {
        return this._lat;
    }

    /** 当前中心显示级别（[9, 16]显示地形，[17, ~]显示3D）。 */
    public get level() {
        return this._level;
    }

    /** 当前中心墨卡托坐标。 */
    public get centerMC() {
        return this._centerMC;
    }

    /** 当前中心世界坐标。 */
    public get centerPos() {
        return this._centerPos;
    }

    /** 当前是否锁定GIS状态。 */
    public get lock() {
        return this._lock;
    }

    /** 当前是否锁定GIS状态。 */
    public set lock(lock: boolean) {
        this._lock = lock;
    }

    /** 当前刷新时间戳。 */
    public get timestamp() {
        return this._timestamp;
    }

    /** 瓦片服务信息（可自己扩展添加）。 */
    public get servers() {
        return this._servers;
    }

    /** GIS各层级材质数组。 */
    public get materials() {
        return this._materials;
    }

    /** 地球半径。 */
    public get radius() {
        return 6378137.0;
    }

    /** 地球直径。 */
    public get diameter() {
        return 12756274.0;
    }

    /** 地球周长。 */
    public get perimeter() {
        return 40075016.6855784;
    }

    /** 地球半周长。 */
    public get perimeter_half() {
        return 20037508.3427892;
    }

    /** 当前是否显示地形。 */
    public get enable_terrain() {
        return this._pyramid.terrain;
    }
    public set enable_terrain(b: boolean) {
        this._pyramid.terrain = b;
    }

    /** 地形数据可用时，强制开启地形。 */
    public get force_terrain() {
        return this._pyramid.forceTerrain;
    }
    public set force_terrain(enable: boolean) {
        this._pyramid.forceTerrain = enable;
    }

    /** 引擎实例。 */
    private _global: Miaoverse.Ploy3D;
    /** 是否启用GIS系统。 */
    private _enable: boolean;

    /** GIS行政区管理。 */
    private _districts: Gis_districts;
    /** GIS标记数据管理。 */
    private _kmls: Gis_kmls;

    /** GIS金字塔结构。 */
    private _pyramid: Gis_pyramid;
    /** GIS网格。 */
    private _mesh: Miaoverse.Mesh;
    /** GIS各层级材质数组。 */
    private _materials: {
        /** 材质插槽。 */
        slot: number;
        /** 材质所属子网格索引。 */
        submesh: number;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
    }[];
    /** GIS绘制参数。 */
    private _drawParams = {
        flags: 0,
        layers: Miaoverse.LAYER_FLAGS.GIS,
        userData: 0,

        castShadows: false,
        receiveShadows: false,
        frontFace: 0,
        cullMode: 1,

        mesh: null as Gis["_mesh"],
        materials: null as Gis["_materials"],

        instances: [
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ]
    };

    /** 当前中心经度。 */
    private _lng: number;
    /** 当前中心纬度。 */
    private _lat: number;
    /** 当前中心显示级别。 */
    private _level: number;
    /** 当前观察俯仰角。 */
    private _pitch: number;
    /** 当前观察偏航角。 */
    private _yaw: number;

    /** 世界空间原点墨卡托坐标。 */
    private _originMC: number[];
    /** 世界空间原点经纬度。 */
    private _originLL: number[];
    /** 当前中心墨卡托坐标。 */
    private _centerMC: number[];
    /** 当前中心世界坐标。 */
    private _centerPos: number[];
    /** 当前中心瓦片列号。 */
    private _tileX: number;
    /** 当前中心瓦片行号。 */
    private _tileZ: number;
    /** 当前中心瓦片层号。 */
    private _tileY: number;
    /** 网格缩放。 */
    private _meshS: number;
    /** 当前是否锁定GIS状态。 */
    private _lock: boolean;
    /** 当前刷新时间戳。 */
    private _timestamp: number = 0;

    /** 是否正在刷新（限制刷新频率）。 */
    private _flushing: number = 0;
    /** 等待刷新参数。 */
    private _waiting: number[];
    /** 等待退出方法。 */
    private _waitClose: () => void;
    /** 瓦片服务信息（对应Gis_serv_type）。 */
    private _servers = {
        tianditu_img_w: {
            label: "天地图-影像底图-CGCS2000",
            url: "https://t{index}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&tk={token}&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}",
            count: 8,
            projection: Gis_projection.CGCS2000,
            tile_size: 256,
            max_level: 18,
            min_level: 1
        },
        tianditu_img_c: {
            label: "天地图-影像底图-LNGLAT",
            url: "https://t{index}.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&tk={token}&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}",
            count: 8,
            projection: Gis_projection.LNGLAT,
            tile_size: 256,
            max_level: 18,
            min_level: 1
        },
        tianditu_dem_c: {
            label: "天地图-地形高度-LNGLAT",
            url: "https://t{index}.tianditu.gov.cn/mapservice/swdx?tk={token}&x={col}&y={row}&l={level}",
            count: 8,
            projection: Gis_projection.LNGLAT,
            tile_size: 64,
            max_level: 12,
            min_level: 7
        },
        arcgisonline_img_w: {
            label: "ARCGIS-影像底图-WGS84",
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level}/{row}/{col}",
            count: 1,
            projection: Gis_projection.WGS84,
            tile_size: 256,
            max_level: 18,
            min_level: 1
        },
        earthol_img_w: {
            label: "EARTHOL-影像底图-WGS84",
            url: "https://m.earthol.me/map.jpg?lyrs=y&gl=cn&x={col}&y={row}&z={level}",
            count: 1,
            projection: Gis_projection.WGS84,
            tile_size: 256,
            max_level: 20,
            min_level: 1
        }
    };

    /**
     * 解析3MX图层原点经纬度。
     */
    public Proj4(params: {
        SRS: string;
        SRSOrigin: number[];
    }) {
        const ll_wgs84 = proj4(params.SRS, "EPSG:4326", params.SRSOrigin) as number[];
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

    /**
     * 检测指定经纬度是否在中国范围框之外（纬度3.86~53.55、经度73.66~135.05）。
     * 范围框之内使用GCJ02加密。
     * @param ll 经纬度。
     * @returns 返回真表示指定经纬度在中国范围框之外。
     */
    public OutOfChina(ll: number[]): boolean {
        const lng = ll[0];
        const lat = ll[1];

        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    }

    /**
     * 对经度进行第1次GCJ02加密转换。
     * @param ll 经纬度。
     * @returns 返回第1次加密后的经度。
     */
    public TransformLng(ll: number[]): number {
        const lng = ll[0];
        const lat = ll[1];

        let lng_ = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        lng_ += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        lng_ += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
        lng_ += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;

        return lng_;
    }

    /**
     * 对纬度进行第1次GCJ02加密转换。
     * @param ll 经纬度。
     * @returns 返回第1次加密后的纬度。
     */
    public TransformLat(ll: number[]): number {
        const lng = ll[0];
        const lat = ll[1];

        let lat_ = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        lat_ += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        lat_ += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
        lat_ += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;

        return lat_;
    }

    /**
     * GPS坐标系（WGS84）转火星坐标系（GCJ02）。
     * @param ll 经纬度（WGS84）。
     * @returns 经纬度（GCJ02）。
     */
    public WGS84_GCJ02(ll: number[]): number[] {
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
            let magic = Math.sin(rlat); magic = 1 - ee * magic * magic;
            let magicSqrt = Math.sqrt(magic);

            lng_ = (lng_ * 180.0) / (a / magicSqrt * Math.cos(rlat) * Math.PI);
            lat_ = (lat_ * 180.0) / ((a * (1 - ee)) / (magic * magicSqrt) * Math.PI);

            lng_ += lng;
            lat_ += lat;

            return [lng_, lat_];
        }
    }

    /**
     * 火星坐标系（GCJ02）转GPS坐标系（WGS84）。
     * @param ll 经纬度（GCJ02）。
     * @returns 经纬度（WGS84）。
     */
    public GCJ02_WGS84(ll: number[]): number[] {
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
            let magic = Math.sin(rlat); magic = 1 - ee * magic * magic;
            let magicSqrt = Math.sqrt(magic);

            lng_ = (lng_ * 180.0) / (a / magicSqrt * Math.cos(rlat) * Math.PI);
            lat_ = (lat_ * 180.0) / ((a * (1 - ee)) / (magic * magicSqrt) * Math.PI);

            lng_ = lng * 2 - (lng + lng_);
            lat_ = lat * 2 - (lat + lat_);

            return [lng_, lat_];
        }
    }

    /**
     * 火星坐标系（GCJ02）转百度坐标系（BD09）。
     * @param ll 经纬度（GCJ02）。
     * @returns 经纬度（BD09）。
     */
    public GCJ02_BD09(ll: number[]): number[] {
        const lng = ll[0];
        const lat = ll[1];
        const xpi = Math.PI * 3000.0 / 180.0;

        const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xpi);
        const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xpi);

        const lng_ = z * Math.cos(theta) + 0.0065;
        const lat_ = z * Math.sin(theta) + 0.006;

        return [lng_, lat_];
    }

    /**
     * 百度坐标系（BD09）转火星坐标系（GCJ02）。
     * @param ll 经纬度（BD09）。
     * @returns 经纬度（GCJ02）。
     */
    public BD09_GCJ02(ll: number[]): number[] {
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

    /**
     * GPS坐标系（WGS84）转百度坐标系（BD09）。
     * @param ll 经纬度（WGS84）。
     * @returns 经纬度（BD09）。
     */
    public WGS84_BD09(ll: number[]): number[] {
        return this.GCJ02_BD09(this.WGS84_GCJ02(ll));
    }

    /**
     * 百度坐标系（BD09）转GPS坐标系（WGS84）。
     * @param ll 经纬度（BD09）。
     * @returns 经纬度（WGS84）。
     */
    public BD09_WGS84(ll: number[]): number[] {
        return this.GCJ02_WGS84(this.BD09_GCJ02(ll));
    }

    /**
     * 经纬度转墨卡托坐标（墨卡托坐标用于计算瓦片行列号）。
     * @param ll 经纬度。
     * @returns 墨卡托坐标。
     */
    public LL2MC(ll: number[]): number[] {
        const lng = ll[0];
        const lat = ll[1];

        // https://www.cnblogs.com/94cool/p/4109944.html
        let lng_ = lng * this.perimeter_half / 180.0;
        let lat_ = Math.log(Math.tan((90.0 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0);

        lat_ = lat_ * this.perimeter_half / 180.0;

        return [lng_, lat_];
    }

    /**
     * 墨卡托坐标转经纬度。
     * @param mc 墨卡托坐标。
     * @returns 经纬度。
     */
    public MC2LL(mc: number[]): number[] {
        const x = mc[0];
        const y = mc[1];

        // https://www.cnblogs.com/94cool/p/4109944.html
        let lng_ = x / this.perimeter_half * 180;
        let lat_ = y / this.perimeter_half * 180;

        lat_ = 180 / Math.PI * (2 * Math.atan(Math.exp(lat_ * Math.PI / 180.0)) - Math.PI / 2.0);

        return [lng_, lat_];
    }

    /**
     * 百度经纬度百度转墨卡托坐标（墨卡托坐标用于计算瓦片行列号）。
     * https://www.cnblogs.com/xiaozhi_5638/p/4748186.html
     * @param ll 百度经纬度。
     * @returns 百度墨卡托坐标。
     */
    public LL2MC_BD09(ll: number[]): number[] {
        // const lat_ = ll[1] > 74 ? 74 : ll[1]; ll[1] = ll[1] < -74 ? -74 : ll[1];

        const lng_ = ll[0];
        const lat_ = ll[1];

        let lut: number[] = null;

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

        // ================------------------------------

        const T = lut[0] + lut[1] * Math.abs(lng_);
        const cC = Math.abs(lat_) / lut[9];
        const cF = lut[2] + lut[3] * cC + lut[4] * cC * cC + lut[5] * cC * cC * cC + lut[6] * cC * cC * cC * cC + lut[7] * cC * cC * cC * cC * cC + lut[8] * cC * cC * cC * cC * cC * cC;

        const lng = T * (lng_ < 0 ? -1 : 1);
        const lat = cF * (lat_ < 0 ? -1 : 1);

        return [lng, lat];
    }

    /**
     * 百度墨卡托坐标转百度经纬度。
     * @param mc 百度墨卡托坐标。
     * @returns 百度经纬度。
     */
    public MC2LL_BD09(mc: number[]): number[] {
        const lng_ = Math.abs(mc[0]);
        const lat_ = Math.abs(mc[1]);

        let lut: number[] = null;

        for (let i = 0; i < 6; i++) {
            if (lat_ >= this._lut3[i]) {
                lut = this._lut4[i];
                break;
            }
        }

        // ================------------------------------

        const T = lut[0] + lut[1] * Math.abs(lng_);
        const cC = Math.abs(lat_) / lut[9];
        const cF = lut[2] + lut[3] * cC + lut[4] * cC * cC + lut[5] * cC * cC * cC + lut[6] * cC * cC * cC * cC + lut[7] * cC * cC * cC * cC * cC + lut[8] * cC * cC * cC * cC * cC * cC;

        const lng = T * (lng_ < 0 ? -1 : 1);
        const lat = cF * (lat_ < 0 ? -1 : 1);

        return [lng, lat];
    }

    /** BD09_MC计算查找表。 */
    private _lut1 = [75, 60, 45, 30, 15, 0];
    /** BD09_MC计算查找表。 */
    private _lut2 = [
        [-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
        [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5],
        [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5],
        [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
        [-0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
        [-0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]
    ];
    /** BD09_MC计算查找表。 */
    private _lut3 = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
    /** BD09_MC计算查找表。 */
    private _lut4 = [
        [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
        [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86],
        [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
        [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
        [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
        [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]
    ];
}

/** GIS LOD层级金字塔。 */
export class Gis_pyramid {
    /**
     * 构造函数。
     * @param _gis GIS实例。
     * @param _levels LOD层级数（建议值8）。
     * @param _tiling  LOD层级图层瓦片平铺数量（移动端建议值4、PC端建议值8）。
     */
    public constructor(_gis: Gis, _levels: number, _tiling: number) {
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
            {} as any,
            {} as any
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

    /**
     * 清除对象。
     */
    public async Dispose() {
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

    /**
     * 更新LOD层级金字塔。
     * @param level 顶层级别。
     * @param lb_col 顶层左下角列号。
     * @param lb_row 顶层左下角行号。
     * @param lb_bias_x 顶层左下角瓦片采样偏移。
     * @param lb_bias_z 顶层左下角瓦片采样偏移。
     * @param callback 刷新完成回调。
     */
    public Update(level: number, lb_col: number, lb_row: number, lb_bias_x: number, lb_bias_z: number, callback: () => void) {
        const levelCount = this.levelCount;
        const levels = this._pyramid;

        let top = this._pyramidTop;

        // 尽可能使结构变化量最小，减少刷新量
        if (0 < levels[top].level) {
            // 滑动距离，级别往右递减，负数右滑，正数左滑
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

        // 由于计算参考原点位于左下角，因此暂时翻转行增长方向
        lb_row = (Math.pow(2, level) - 1) - lb_row;

        // 计算所有投影坐标系下各LOD级别瓦片平铺和采样参数
        for (let j = 0; j < 4; j++) {
            // 因为不同投影坐标系需要缩放偏移以对齐的关系，非WGS84、CGCS2000层平铺数量+1
            const tiling = j > Gis_projection.CGCS2000 ? this._tiling + 1 : this._tiling;

            let lb_col_ = lb_col;
            let lb_row_ = lb_row;
            // 层间间隔非偶数会导致某一层级可能并不从瓦片的最左边开始采样
            // 换算成不同坐标系的瓦片也会产生采样偏移
            let offset_x_ = lb_bias_x;
            let offset_z_ = lb_bias_z;
            // 由于采样偏移的存在，为了覆盖4个瓦片区域，就必须加载5个瓦片区域，我们需要缩放实际采样的范围
            let scale_x_ = (this._tiling - 1) / tiling;
            let scale_z_ = (this._tiling - 1) / tiling;

            if (j > Gis_projection.CGCS2000) {
                // TODO 转为其它坐标系参数 ...
            }

            for (let i = 0; i < levelCount; i++) {
                const cur = (top + i) % levelCount;
                const cur_level = levels[cur];
                const projection = cur_level.projections[j];

                // 设置LOD层级相关状态
                if (j == 0) {
                    cur_level.submesh = (levelCount - 1) - i;
                    cur_level.outer = i == (levelCount - 1);

                    if (cur_level.level != level - i) {
                        // 越界级别不启用
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

                // 当前图层左下角行列号
                projection.lb_col = Math.floor(lb_col_);
                projection.lb_row = Math.floor(lb_row_);

                // 层级间对齐换算后，图层左下角行列号并不一定是整数，因此产生一个采样偏差
                projection.offset_x = offset_x_ + ((lb_col_ - projection.lb_col) * (1 / tiling));
                projection.offset_z = offset_z_ + ((lb_row_ - projection.lb_row) * (1 / tiling));

                // 累计采样偏移大于1单位，则增长起始列
                if (projection.offset_x > (1 / tiling)) {
                    projection.offset_x -= (1 / tiling);
                    projection.lb_col += 1;
                }

                // 累计采样偏移大于1单位，则增长起始行
                if (projection.offset_z > (1 / tiling)) {
                    projection.offset_z -= (1 / tiling);
                    projection.lb_row += 1;
                }

                projection.scale_x = scale_x_;
                projection.scale_z = scale_z_;

                // 下一级图层左下角行列号
                lb_col_ = (projection.lb_col - ((this._tiling - 1) * 0.5)) * 0.5;
                lb_row_ = (projection.lb_row - ((this._tiling - 1) * 0.5)) * 0.5;

                // 逐级累积采样偏移
                offset_x_ = projection.offset_x * 0.5;
                offset_z_ = projection.offset_z * 0.5;

                // 将行增长方向恢复正常
                projection.lb_row = (Math.pow(2, cur_level.level) - 1) - projection.lb_row;

                //=============-----------------------------

                // 由于墨卡托投影和经纬度投影是非线性关系，每层级换算出经纬度投影
                if (j == 0) {
                    // 墨卡托投影：以经度0维度90为原点，往东南方向划分，L1经纬度划分为2；
                    // https://t2.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=0&TILEROW=0&TILEMATRIX=1&tk=c6f5fc06a3eeb819a9af72da96665a04
                    // 经纬度投影：以经度0维度90为原点，往东南方向划分，L1经度划分为2；
                    // https://t2.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILECOL=0&TILEROW=0&TILEMATRIX=1&tk=c6f5fc06a3eeb819a9af72da96665a04

                    const tileS = this._gis.perimeter / Math.pow(2, cur_level.level);
                    // 注意，行从纬度+90度开始划分，而我们LL2MC是从纬度0开始的
                    const bottomMC = this._gis.perimeter_half - ((projection.lb_row + 1) * tileS);
                    const topMC = bottomMC + tileS * this._tiling;

                    let bottomLat = bottomMC / this._gis.perimeter_half * 180.0;
                    let topLat = topMC / this._gis.perimeter_half * 180.0;

                    bottomLat = 180 / Math.PI * (2 * Math.atan(Math.exp(bottomLat * Math.PI / 180.0)) - Math.PI / 2.0);
                    topLat = 180 / Math.PI * (2 * Math.atan(Math.exp(topLat * Math.PI / 180.0)) - Math.PI / 2.0);

                    // L2时分2行，北半球占1行
                    const rowCount = Math.pow(2, (cur_level.level - 2));
                    // 每行间隔纬度度数
                    const rowStride = 90.0 / rowCount;

                    const bottomRow = Math.floor((90.0 - bottomLat) / rowStride);
                    const topRow = Math.floor((90.0 - topLat) / rowStride);

                    // 由于追加了偏移，所以平铺数量+1
                    if ((bottomRow - topRow) > this._tiling) {
                        this._gis["_global"].Track(`图层由墨卡托投影转经纬度投影时瓦片平铺数量溢出：${bottomRow} - ${topRow} > ${this._tiling}`, 2);
                    }

                    const offset_z__ = ((1.0 - (((90.0 - bottomLat) / rowStride) - bottomRow)) * (1 / (this._tiling + 1)));
                    const scale_z__ = (topLat - bottomLat) / (rowStride * (this._tiling + 1));

                    const projection_ = cur_level.projections[Gis_projection.LNGLAT];
                    projection_.lb_col = projection.lb_col;
                    projection_.lb_row = bottomRow;

                    // TODO：应当根据纬度区间比例计算（墨卡托投影像素等大，经纬度投影像素不等大）
                    projection_.offset_z = offset_z__ + scale_z__ * projection.offset_z;
                    projection_.offset_x = (this._tiling / (this._tiling + 1)) * projection.offset_x;
                    // TODO：应当根据纬度区间比例计算（墨卡托投影像素等大，经纬度投影像素不等大）
                    projection_.scale_z = scale_z__ * projection.scale_z;
                    projection_.scale_x = (this._tiling / (this._tiling + 1)) * projection.scale_x;

                    projection_.offset_z = (1 - projection_.scale_z) - projection_.offset_z;
                }

                //=============-----------------------------

                projection.offset_z = (1.0 / tiling) - projection.offset_z;
            }
        }

        // 当前加载任务时间戳
        const timestamp = this._gis.timestamp;

        // 到此已计算出了所有层级对象的级别、子网格、左下角瓦片行列号，图层采样偏移和缩放...

        // 刷新并加载瓦片资源
        this.Flush(timestamp, (reuse, total, succeed, failed) => {
            console.log(timestamp, ":", reuse, total, succeed, failed);
            callback();
        });
    }

    /**
     * 刷新并加载瓦片资源。
     * @param timestamp 加载任务时间戳。
     * @param callback 加载完成回调。
     */
    private Flush(timestamp: number, callback: (reuse: number, total: number, succeed: number, failed: number) => void) {
        // 图层待刷新瓦片量小于1/3时，允许被更高层采样，为避免显示错乱，待刷新瓦片区域应当填充为白色
        // 优先加载待刷新瓦片量较少的图层，图层实际刷新间隔应大于1秒
        // 优先加载较低层图层，更高层在图层尚不可用时可以采样较低层图层，直到加载完毕
        // 缩小时，通常新顶层已经加载，此时仅需加载新底层（底层通常可见度低，用户体验影响不大）
        // 放大时，通常新底层已经加载，此时仅需加载新顶层（顶层加载期间采样较低层，用户体验影响不大）

        const levelCount = this.levelCount;
        const levels = this._pyramid;
        const top = this._pyramidTop;

        // 各图层当前替补级别索引（如果某图层需加载瓦片较多，暂时采样当前可用替补级别索引）
        const understudy: number[] = [];
        // 重用瓦片数量统计
        let reuse = 0;

        // 从底层往顶层处理
        for (let i = levelCount - 1; i > -1; i--) {
            const cur = (top + i) % levelCount;
            const cur_level = levels[cur];

            // 加载当前层级的每个图层的瓦片数据
            for (let j = 0; j < this._layers.length; j++) {
                // 如果图层不激活则跳过处理
                const layer = this._layers[j];
                if (!layer.enabled) {
                    continue;
                }

                // 当前图层瓦片数据
                const layer_data = cur_level.layers[j];
                // 当前图层瓦片服务配置
                const layer_serv = this._gis.servers[layer.type];
                // 当前层级当前图层瓦片平铺与采样参数
                const layer_projection = cur_level.projections[layer_serv.projection];
                // 新建当前层级当前图层瓦片缓存
                const cache: Record<string, Miaoverse.GLTextureSource> = {};

                // 设置当前图层采样偏移缩放
                layer_data.uvst = layer_projection;

                // 不绘制当前层级
                if (cur_level.level < 1) {
                    continue;
                }

                layer_data.invalid = false;
                layer_data.inherit = null;

                // 当前图层当前级别下没有瓦片数据
                if (cur_level.level < layer_serv.min_level) {
                    layer_data.invalid = true;
                    continue;
                }

                // 超过瓦片服务提供的最大级别，采样较低级别图层
                if (cur_level.level > layer_serv.max_level) {
                    // 最底层级别依然超过瓦片服务提供的最大级别
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

                        const uvst: Gis_uvst = {
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

                const tiling = layer_serv.projection > Gis_projection.CGCS2000 ? this._tiling + 1 : this._tiling;

                if (cur_level.reset) {
                    // 释放所有瓦片缓存
                    for (let key in layer_data.cache) {
                        const tile: ImageBitmap = layer_data.cache[key] as any;
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

                        // 复用缓存中的瓦片
                        if (tile) {
                            cache[key] = tile;
                            layer_data.cache[key] = null;

                            this.FillTexture(
                                layer_data.texture,
                                tile,
                                layer_serv.tile_size * c,
                                layer_serv.tile_size * (tiling - r - 1)
                            );

                            reuse++;
                        }
                        // 新加载瓦片
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
                                this.FillTexture(
                                    layer_data.texture,
                                    this._blankTile,
                                    layer_serv.tile_size * c,
                                    layer_serv.tile_size * (tiling - r - 1)
                                );
                            }
                        }
                    }
                }

                // 释放所有未复用的瓦片缓存
                for (let key in layer_data.cache) {
                    const tile: ImageBitmap = layer_data.cache[key] as any;
                    if (tile && tile.close) {
                        tile.close();
                    }
                }

                layer_data.cache = cache;

                // 当前层级需要加载的瓦片较多，先采样较低图层
                if (layer_data.loading.length > Math.ceil(tiling * tiling * 0.33)) {
                    if (understudy[j] != undefined) {
                        const bias = understudy[j] - i;
                        const last = (top + i + bias) % levelCount;
                        const last_level = levels[last];
                        const last_data = last_level.layers[j];
                        const last_projection = last_level.projections[layer_serv.projection];

                        const uvst: Gis_uvst = {
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

        // 我们总是应当立即应用各图层贴图采样偏移参数，瓦片加载在最后整体等待完成即可
        this._gis["_global"].app.DrawFrame(1);

        this.Load(timestamp, (total: number, succeed: number, failed: number) => {
            callback(reuse, total, succeed, failed);
        });
    }

    /**
     * 填充贴图数据。
     * @param texture 贴图实例。
     * @param data 贴图数据。
     * @param xoffset 写入横向像素偏移。 
     * @param yoffset 写入纵向像素偏移。
     */
    private FillTexture(texture: Gis_texture, data: Miaoverse.GLTextureSource, xoffset: number, yoffset: number) {
        const Texture = this._gis["_global"].resources.Texture;

        Texture._WriteTile(texture.tile, data, xoffset, yoffset);
    }

    /**
     * 加载瓦片资源。
     * @param timestamp 加载任务时间戳。
     * @param callback 加载完成回调。
     */
    private Load(timestamp: number, callback: (total: number, succeed: number, failed: number) => void) {
        // 优先从高层往低层加载待加载瓦片量小于图层瓦片总量1/2的图层瓦片
        // 其次从低层往高层加载其它图层瓦片
        const sort_weight = (level: Gis_level) => {
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
        }

        const levels = this._pyramid;

        const sorted_levels = levels.slice().sort((a, b) => {
            return sort_weight(b) - sort_weight(a);
        });

        const promises: Promise<void>[] = [];
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
                const tiling = layer_serv.projection > Gis_projection.CGCS2000 ? this._tiling + 1 : this._tiling;

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

                    function load_buffer(url: string, times: number, callback_: (buffer: ArrayBuffer) => void) {
                        function response_(buffer: ArrayBuffer) {
                            if (buffer) {
                                callback_(buffer);
                            }
                            else if (0 < --times) {
                                // 天地图拒绝频繁多次请求，因此我们等待0.5秒
                                setTimeout(load_, 500);
                            }
                            else {
                                callback_(null);
                            }
                        }

                        function load_() {
                            _global.Fetch<ArrayBuffer>(url, null, "arrayBuffer").then(response_).catch((e) => {
                                console.error(e);
                                response_(null);
                            });
                        }

                        load_();
                    }

                    promises.push((new Promise<void>((resolve, reject) => {
                        const flush = (succ: boolean) => {
                            if (succ === true) {
                                succeed++;
                            }
                            else {
                                failed++;
                            }

                            this._gis["_global"].app.DrawFrame(1);

                            if (0 == --loading) {
                                layer_data.loading = [];

                                // 撤换掉替补数据
                                if (layer_data.inherit && layer_data.inherit.temporary) {
                                    layer_data.inherit = null;
                                }

                                resolve();
                            }
                        }

                        for (let info_ of layer_data.loading) {
                            const info = info_;
                            const key = "" + info.col + "_" + info.row + "_" + info.level;
                            const url = this._gis.ServeUrl(layer.type, layer.token, info.col, info.row, info.level);

                            if (layer.type == "tianditu_dem_c") {
                                _global.worker.Decode_dem(1, url).then((data) => {
                                    if (data && timestamp == this._gis.timestamp) {
                                        const bitmap: Miaoverse.GLTextureSource = {
                                            width: layer_serv.tile_size,
                                            height: layer_serv.tile_size,
                                            data: data,
                                            dataLayout: {
                                                offset: 0,
                                                bytesPerRow: 4 * layer_serv.tile_size,
                                                rowsPerImage: layer_serv.tile_size
                                            }
                                        };

                                        this.FillTexture(
                                            layer_data.texture,
                                            bitmap,
                                            layer_serv.tile_size * info.xoffset,
                                            layer_serv.tile_size * (tiling - info.zoffset - 1)
                                        );

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
                                        const option: ImageBitmapOptions = undefined;

                                        createImageBitmap(blob, option).then((bitmap: Miaoverse.GLTextureSource) => {
                                            this.FillTexture(
                                                layer_data.texture,
                                                bitmap,
                                                layer_serv.tile_size * info.xoffset,
                                                layer_serv.tile_size * (tiling - info.zoffset - 1)
                                            );

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

    /** 
     * 获取GIS当前渲染经纬度范围。
     */
    public GetDrawRegion() {
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

        // =====================--------------------------------

        // 墨卡托投影：以经度0维度90为原点，往东南方向划分，L1经纬度划分为2；
        const projection = level.projections[Gis_projection.WGS84];
        const tileS = this._gis.perimeter / Math.pow(2, level.level);

        // 注意，行从纬度+90度开始划分，而我们LL2MC是从纬度0开始的
        const bottomMC = this._gis.perimeter_half - ((projection.lb_row + 1) * tileS);
        const topMC = bottomMC + tileS * this._tiling;

        // 注意，列从经度-180度开始划分，而我们LL2MC是从经度0开始的
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

    /** LOD层级数。 */
    public get levelCount() {
        return this._pyramidHeight;
    }

    /** LOD层级图层瓦片平铺数量。 */
    public get layerTiling() {
        return this._tiling;
    }

    /** 地形数据可用时，强制开启地形。 */
    public set forceTerrain(enable: boolean) {
        this._forceTerrain = enable;
    }

    /** 当前是否启用地形。 */
    public get terrain() {
        return this._layers[0].enabled && (this._forceTerrain || (this._gis.level > 8 && this._gis.level < 17));
    }
    public set terrain(b: boolean) {
        this._layers[0].enabled = b;
    }

    /** GIS实例。 */
    private _gis: Gis;
    /** 地形数据可用时，强制开启地形。 */
    private _forceTerrain: boolean;

    /** 空白瓦片数据（用于默认填充）。 */
    private _blankTile: Miaoverse.GLTextureSource;
    /** 图层资源定义数组（最多叠加4个图层）。 */
    private _layers: Gis_layer[];

    /** LOD层级图层瓦片平铺数量（移动端建议值4、PC端建议值8、非WGS84、CGCS2000层平铺数量+1）。 */
    private _tiling: number;
    /** LOD层级金字塔。 */
    private _pyramid: Gis_level[];
    /** LOD层级金字塔顶层索引（最精细层，往右降低）。 */
    private _pyramidTop: number;
    /** LOD层级金字塔高度（建议值8）。 */
    private _pyramidHeight: number;
}

/** GIS行政区管理。 */
export class Gis_districts {
    /**
     * 构造函数。
     */
    public constructor(_gis: Gis) {
        this._gis = _gis;
        this._countries = {};
    }

    /**
     * 初始化GIS行政区管理。
     */
    public async Init() {
        const global = this._gis["_global"];

        this._area_renderer = await (async () => {
            const material = await global.resources.Material.Create({
                uuid: "",
                classid: Miaoverse.CLASSID.ASSET_MATERIAL,
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
                classid: Miaoverse.CLASSID.ASSET_MATERIAL,
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

    /**
     * 清除对象。
     */
    public async Dispose() {
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

    /**
     * 加载GIS行政区。
     * https://lbs.amap.com/api/webservice/guide/api/district
     * @param keywords 行政区关键词[国家, 省份|直辖市, 市, 区县]。
     * @param token 高德地图AK（ad592e63640a58865bd1640560cbe82e）。
     * @returns 返回GIS行政区对象。
     */
    public async Load(keywords: string[], token: string) {
        let serv = `https://restapi.amap.com/v3/config/district?key=${token}&extensions=all&subdistrict=`;
        let container = this._countries;
        let district: Gis_district = null;

        for (let i = 0; i < 4; i++) {
            if (!keywords[i]) {
                break;
            }

            district = container[keywords[i]];
            if (!district) {
                // 区县一级同时返回下级街道乡镇数据（街道乡镇不含边界数据）
                const path = serv + (i == 3 ? 1 : 0) + "&keywords=" + keywords[i];
                const jdata = await this._gis["_global"].Fetch<any>(path, null, "json");

                if (!jdata || jdata.status != "1" || jdata.infocode != "10000") {
                    break;
                }

                district = container[keywords[i]] = await (new Gis_district()).Build(this._gis, jdata);
                container = district.districts;
            }
        }

        return district;
    }

    /**
     * 绘制GIS行政区分界线。
     */
    public Draw(queue: Miaoverse.DrawQueue) {
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

            passEncoder.drawIndexed(
                instance.indexCount,    // indexCount
                1,                      // instanceCount
                0,                      // firstIndex
                0,                      // baseVertex
                instance.instanceIndex, // firstInstance
            );
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

                passEncoder.draw(
                    6,                      // vertexCount
                    instanceCount,          // instanceCount
                    0,                      // firstVertex
                    0,                      // firstInstance
                );
            }
        }
    }

    /** 国家行政区域信息查找表。 */
    public get countries() {
        return this._countries;
    }

    /** GIS实例。 */
    private _gis: Gis;

    /** 矢量图形区域渲染资源。 */
    private _area_renderer: {
        /** 材质资源实例。 */
        material: Miaoverse.Material;
        /** 网格渲染器组件实例（用于提供绘制所需的G1数据）。 */
        mesh_renderer: Miaoverse.MeshRenderer;
        /** 着色器管线实例ID。 */
        pipeline: number;
    };

    /** 矢量图形边线渲染资源。 */
    private _line_renderer: {
        /** 材质资源实例。 */
        material: Miaoverse.Material;
        /** 网格渲染器组件实例（用于提供绘制所需的G1数据）。 */
        mesh_renderer: Miaoverse.MeshRenderer;
        /** 着色器管线实例ID。 */
        pipeline: number;
    };

    /** 国家行政区域信息查找表。 */
    private _countries: Record<string, Gis_district>;
}

/** GIS行政区。 */
export class Gis_district {
    /**
     * 构造函数。
     */
    public constructor() {
    }

    /**
     * 构建行政区实例对象。
     * @param gis GIS系统接口。
     * @param jdata 行政区数据。
     * @returns 返回行政区对象。
     */
    public async Build(gis: Gis, jdata: any) {
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

        // ====================--------------------------------

        if (district.polyline) {
            const areas: string[] = district.polyline.split("|");

            // 追加10段线，国境线有些许偏差、细节视图下应隐藏国境线
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

            // 处理后的行政区域边界数据
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
                const points_: number[] = [];
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

                    if (min_x > mc[0]) min_x = mc[0];
                    if (max_x < mc[0]) max_x = mc[0];

                    if (min_z > mc[1]) min_z = mc[1];
                    if (max_z < mc[1]) max_z = mc[1];

                    points_[i + 0] = mc[0];
                    points_[i + 1] = mc[1];
                }

                const triangles = global.worker.Earcut(points_);

                for (let i = 0; i < triangles.length; i++) {
                    triangles[i] += polygons.vertexCount;
                }

                const polygon: typeof polygons["list"][0] = {
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

            // GIS矢量多边形顶点占用8字节，3MX顶点占用20字节，所以我们除2.5
            polygons.vertexBuffer = global.resources.Dioramas.GenBuffer(0, Math.ceil(polygons.vertexCount / 2.5));
            polygons.indexBuffer = global.resources.Dioramas.GenBuffer(1, polygons.indexCount);

            const vbuffer = new Float32Array(polygons.vertexCount * 2);
            const ibuffer = new Uint32Array(polygons.indexCount);

            for (let sub of polygons.list) {
                vbuffer.set(sub.points, sub.vertexStart * 2);
                ibuffer.set(sub.indices, sub.indexStart);
            }

            global.device.WriteBuffer(
                polygons.vertexBuffer.buffer,   // 缓存实例ID
                polygons.vertexBuffer.offset,   // 缓存写入偏移
                vbuffer.buffer,                 // 数据源
                0,                              // 数据源偏移
                vbuffer.byteLength);            // 数据字节大小

            global.device.WriteBuffer(
                polygons.indexBuffer.buffer,    // 缓存实例ID
                polygons.indexBuffer.offset,    // 缓存写入偏移
                ibuffer.buffer,                 // 数据源
                0,                              // 数据源偏移
                ibuffer.byteLength);            // 数据字节大小
        }

        return this;
    }

    /**
     * 清除对象。
     */
    public Dispose(gis: Gis) {
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

    /** 行政区编码（街道编码等同所属区县编码）。 */
    adcode: string;
    /** 行政区划级别：国家 | 省份,直辖市 | 市 | 区县 | 街道（乡镇）。 */
    level: "country" | "province" | "city" | "district" | "street";
    /** 行政区名称。 */
    name: string;
    /** 行政区中心点。 */
    center: number[];
    /** 城市编码（国家、省份｜直辖市级别不含城市编码。市及其下级行政区拥有共同城市编码）。 */
    citycode?: string;
    /** 下级行政区查找表（通过下级行政区名称查找）。 */
    districts: Record<string, Gis_district>;
    /** 行政区域边界数据。 */
    polygons?: {
        /** 绘制实例索引。 */
        instanceIndex: number;
        /** 总顶点数量。 */
        vertexCount: number;
        /** 总索引数量。 */
        indexCount: number;

        /** 顶点缓存节点。 */
        vertexBuffer: ReturnType<Miaoverse.Dioramas_kernel["GenBuffer"]>;
        /** 索引缓存节点。 */
        indexBuffer: ReturnType<Miaoverse.Dioramas_kernel["GenBuffer"]>;

        /** 边界子图形列表。 */
        list: {
            /** 顶点数组起始偏移。 */
            vertexStart: number;
            /** 顶点数量。 */
            vertexCount: number;

            /** 索引数组起始偏移。 */
            indexStart: number;
            /** 索引数量。  */
            indexCount: number;

            /** MC坐标包围盒。 */
            region: number[];
            /** MC坐标数组（自行保证图形左下角MC坐标在1倍墨卡托投影范围内）。 */
            points: number[];
            /** 索引数组。 */
            indices: number[];
        }[];
    };
}

/** GIS KML地图标记数据。 */
export class Gis_kmls {
    /**
     * 构造函数。
     */
    public constructor(_gis: Gis) {
        this._gis = _gis;
    }

    /**
     * 初始化GIS标记管理。
     */
    public async Init() {
        return this;
    }

    /**
     * 装载新的标记数据到GIS上。
     * @param url KML文件URL。
     */
    protected async LoadKml(url: string) {
        const engine = this._gis["_global"];
        const worker = engine.worker;

        const kmlStr = await engine.Fetch<string>(url, null, "text");
        const xmlParser = new (globalThis as any).XMLParser();
        const kmlObj = xmlParser.parse(kmlStr);
        const kmlRoot = kmlObj["kml"];

        const kml: Gis_kml = {
            region: [Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_VALUE, Number.MIN_VALUE],
            vertexCount: 0,
            indexCount: 0,
            pointVertexStart: 0,
            pointVertexCount: 0,
            lineVertexStart: 0,
            lineVertexCount: 0,
            polygonVertexStart: 0,
            polygonVertexCount: 0,
            vertexArray: [],
            indexArray: [],
            vertexBuffer: undefined,
            indexBuffer: undefined,
            placemarks: [],
            nodes: []
        };

        const containers: Record<string, {
            type: "kml" | "document" | "folder",
            path: string;
            data: any;
            node?: typeof kml["nodes"][0];
            parent?: any;
        }> = {};

        const TraverseFolder = (parent: typeof containers[""]) => {
            let folders = parent.data["Folder"];
            if (folders) {
                folders = Array.isArray(folders) ? folders : [folders];
                for (let folder of folders) {
                    const path = parent.path + "/" + folder.name;

                    const my_folder = containers[path] = {
                        type: "folder",
                        path: path,
                        data: folder,
                        parent: parent
                    } as typeof containers[""];

                    my_folder.node = {
                        id: kml.nodes.length,
                        name: my_folder.data.name,
                        type: my_folder.type,
                        path: my_folder.path,
                        icon: undefined,
                        isLeaf: false,
                        children: [],
                        data: undefined,
                    };

                    kml.nodes.push(my_folder.node);

                    parent.node.children.push(my_folder.node);

                    TraverseFolder(my_folder);
                }
            }
        };

        const my_kml = containers["KML"] = {
            type: "kml",
            path: "KML",
            data: kmlRoot,
        } as typeof containers[""];

        my_kml.node = {
            id: kml.nodes.length,
            name: "KML",
            type: my_kml.type,
            path: my_kml.path,
            icon: undefined,
            isLeaf: false,
            children: [],
            data: undefined,
        };

        kml.nodes.push(my_kml.node);

        TraverseFolder(my_kml);

        let documents = kmlRoot["Document"];
        if (documents) {
            documents = Array.isArray(documents) ? documents : [documents];
            for (let document of documents) {
                const parent = my_kml;
                const path = parent.path + "/" + document.name;

                const my_document = containers[path] = {
                    type: "document",
                    path: path,
                    data: document,
                    parent: parent
                } as typeof containers[""];

                my_document.node = {
                    id: kml.nodes.length,
                    name: my_document.data.name,
                    type: my_document.type,
                    path: my_document.path,
                    icon: undefined,
                    isLeaf: false,
                    children: [],
                    data: undefined,
                };

                kml.nodes.push(my_document.node);

                parent.node.children.push(my_document.node);

                TraverseFolder(my_document);
            }
        }

        const placemarks: {
            container: typeof containers[""],
            data: any;

            node?: Gis_kml["nodes"][0];
            Point?: any;
            LineString?: any;
            Polygon?: any;
        }[] = [];

        for (let key in containers) {
            let container_ = containers[key];
            let placemarks_ = container_.data["Placemark"];
            if (placemarks_) {
                placemarks_ = Array.isArray(placemarks_) ? placemarks_ : [placemarks_];
                placemarks.push(...placemarks_.map((item: any) => {
                    return {
                        container: container_,
                        data: item
                    }
                }));
            }
        }

        const ConvertCoordinates = (type: "point" | "line" | "polygon", altitudeMode: string, str: string) => {
            const polygon_: Gis_kml["nodes"][0]["data"]["polygons"][0] = {
                type: type,
                altitudeMode: altitudeMode,
                region: [Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_VALUE, Number.MIN_VALUE],
                vertexStart: kml.vertexCount,
                vertexCount: 0,
                indexStart: kml.indexCount,
                indexCount: 0
            };

            const xz_: number[] = [];

            str.split(' ').map((point) => {
                const lla = point.split(',').map(nb => parseFloat(nb));
                const mc = this._gis.LL2MC([lla[0], lla[1]]);

                if (polygon_.region[0] > mc[0]) polygon_.region[0] = mc[0];
                if (polygon_.region[1] < mc[0]) polygon_.region[1] = mc[0];

                if (polygon_.region[2] > mc[1]) polygon_.region[2] = mc[1];
                if (polygon_.region[3] < mc[1]) polygon_.region[3] = mc[1];

                xz_.push(mc[0]);
                xz_.push(mc[1]);

                kml.vertexArray.push(mc[0]);
                // TODO: 我们移除了高度分量 kml.vertexArray.push(lla[2]);
                kml.vertexArray.push(mc[1]);

                polygon_.vertexCount++;
            });

            if (type == "polygon") {
                const triangles = worker.Earcut(xz_);

                for (let i of triangles) {
                    kml.indexArray.push(i + polygon_.vertexStart);
                }

                // 此次多边形首尾顶点相同（闭合），所以会有4个顶点、3个索引、表示1个三角形的情况
                polygon_.indexCount = triangles.length;
            }
            else if (type == "line") {
                // 设置线路断点
                kml.vertexArray.push(0);
                kml.vertexArray.push(0);

                polygon_.vertexCount++;
            }

            kml.vertexCount += polygon_.vertexCount;
            kml.indexCount += polygon_.indexCount;

            if (kml.region[0] > polygon_.region[0]) kml.region[0] = polygon_.region[0];
            if (kml.region[1] < polygon_.region[1]) kml.region[1] = polygon_.region[1];

            if (kml.region[2] > polygon_.region[2]) kml.region[2] = polygon_.region[2];
            if (kml.region[3] < polygon_.region[3]) kml.region[3] = polygon_.region[3];

            return polygon_;
        };

        for (let placemark of placemarks) {
            let Point = placemark.data["Point"];
            let LineString = placemark.data["LineString"];
            let Polygon = placemark.data["Polygon"];
            let MultiGeometry = placemark.data["MultiGeometry"];

            if (MultiGeometry) {
                Point = MultiGeometry["Point"];
                LineString = MultiGeometry["LineString"];
                Polygon = MultiGeometry["Polygon"];
            }

            const node: Gis_kml["nodes"][0] = {
                id: kml.nodes.length,
                name: placemark.data.name,
                type: "placemark",
                path: placemark.container.path,
                icon: undefined,
                isLeaf: true,
                children: null,
                data: {
                    polygons: []
                }
            };

            kml.nodes.push(node);
            kml.placemarks.push(node.id);
            placemark.container.node.children.push(node);

            // 1个顶点。绘制矩形
            if (Point) {
                Point = Array.isArray(Point) ? Point : [Point];
            }

            // 若干个顶点连线。两个顶点为一个实例输入，绘制一个矩形线段
            if (LineString) {
                LineString = Array.isArray(LineString) ? LineString : [LineString];
            }

            // 若干顶点多边形。首尾闭合，内边界孔洞可选
            if (Polygon) {
                Polygon = Array.isArray(Polygon) ? Polygon : [Polygon];
            }

            placemark.node = node;
            placemark.Point = Point;
            placemark.LineString = LineString;
            placemark.Polygon = Polygon;
        }

        kml.pointVertexStart = kml.vertexCount;

        for (let placemark of placemarks) {
            if (placemark.Point) {
                for (let point of placemark.Point) {
                    const altitudeMode = point["altitudeMode"];
                    const coordinates = point["coordinates"];
                    const polygon_ = ConvertCoordinates('point', altitudeMode, coordinates);
                    if (polygon_) {
                        placemark.node.data.polygons.push(polygon_);
                    }
                }
            }
        }

        kml.pointVertexCount = kml.vertexCount - kml.pointVertexStart;

        kml.lineVertexStart = kml.vertexCount;

        for (let placemark of placemarks) {
            if (placemark.LineString) {
                for (let line of placemark.LineString) {
                    const altitudeMode = line["altitudeMode"];
                    const coordinates = line["coordinates"];
                    const polygon_ = ConvertCoordinates('line', altitudeMode, coordinates);
                    if (polygon_) {
                        placemark.node.data.polygons.push(polygon_);
                    }
                }
            }
        }

        kml.lineVertexCount = kml.vertexCount - kml.lineVertexStart;

        kml.polygonVertexStart = kml.vertexCount;

        for (let placemark of placemarks) {
            if (placemark.Polygon) {
                for (let polygon of placemark.Polygon) {
                    const altitudeMode = polygon["altitudeMode"];
                    // 外边界，定义多边形的外围轮廓
                    const outerBoundaryIs = polygon["outerBoundaryIs"];
                    // 可选）：内边界，定义多边形的孔洞部分，允许在多边形内部有空白区域
                    const innerBoundaryIs = polygon["innerBoundaryIs"];

                    const LinearRing = outerBoundaryIs["LinearRing"];
                    const coordinates = LinearRing["coordinates"];

                    const polygon_ = ConvertCoordinates('polygon', altitudeMode, coordinates);
                    if (polygon_) {
                        placemark.node.data.polygons.push(polygon_);
                    }
                }
            }
        }

        kml.polygonVertexCount = kml.vertexCount - kml.polygonVertexStart;

        kml.nodes = [my_kml.node];

        return kml;
    }

    /**
     * 装载新的标记数据到GIS上。
     * @param url KML文件URL。
     */
    public async Load(url: string) {
        const Dioramas = this._gis["_global"].resources.Dioramas;
        const device = this._gis["_global"].device;
        const kml = await this.LoadKml('.projects/1115/滨海-柏树线路路径(输出).kml');

        // KML标记顶点占用8字节，3MX顶点占用20字节，所以我们除2.5
        kml.vertexBuffer = Dioramas.GenBuffer(0, Math.ceil(kml.vertexCount / 2.5));
        kml.indexBuffer = Dioramas.GenBuffer(1, kml.indexCount);

        const vbuffer = new Float32Array(kml.vertexCount * 2);
        const ibuffer = new Uint32Array(kml.indexCount);

        vbuffer.set(kml.vertexArray);
        ibuffer.set(kml.indexArray);

        device.WriteBuffer(
            kml.vertexBuffer.buffer,        // 缓存实例ID
            kml.vertexBuffer.offset,        // 缓存写入偏移
            vbuffer.buffer,                 // 数据源
            0,                              // 数据源偏移
            vbuffer.byteLength);            // 数据字节大小

        device.WriteBuffer(
            kml.indexBuffer.buffer,         // 缓存实例ID
            kml.indexBuffer.offset,         // 缓存写入偏移
            ibuffer.buffer,                 // 数据源
            0,                              // 数据源偏移
            ibuffer.byteLength);            // 数据字节大小

        return kml;
    }

    /**
     * 绘制GIS行政区分界线。
     */
    public Draw(queue: Miaoverse.DrawQueue, instance: Gis_kml) {
        // TODO: 网格划分过于细碎
        // 绘制精灵：有多少个精灵就绘制多少实例，每实例绘制6个顶点
        // 绘制线段：有多少个线段就绘制多少个实例，每个实例绘制绑定2个输入，绘制6个顶点

        const context = this._gis["_global"].context;
        const area_renderer = this._gis.districts["_area_renderer"];
        const line_renderer = this._gis.districts["_line_renderer"];
        const passEncoder = queue.passEncoder;

        {
            queue.BindMeshRenderer(area_renderer.mesh_renderer);
            queue.BindMaterial(area_renderer.material);
            queue.SetPipeline(area_renderer.pipeline, 0);

            const dbuffer = instance.vertexBuffer;
            const vbuffer = instance.vertexBuffer;
            const ibuffer = instance.indexBuffer;

            context.SetVertexBuffer(0, vbuffer.buffer, vbuffer.offset, 8 * instance.vertexCount, passEncoder);
            context.SetVertexBuffer(1, vbuffer.buffer, vbuffer.offset, 8 * instance.vertexCount, passEncoder);
            context.SetIndexBuffer(4, ibuffer, passEncoder);

            passEncoder.drawIndexed(
                instance.indexCount,    // indexCount
                1,                      // instanceCount
                0,                      // firstIndex
                0,                      // baseVertex
                0,                      // firstInstance
            );
        }

        {
            queue.BindMeshRenderer(line_renderer.mesh_renderer);
            queue.BindMaterial(line_renderer.material);
            queue.SetPipeline(line_renderer.pipeline, 0);

            const vbuffer = instance.vertexBuffer;
            const instanceCount = instance.lineVertexCount - 1;
            const offset = instance.lineVertexStart * 8;
            const size = instanceCount * 8;

            context.SetVertexBuffer(0, vbuffer.buffer, vbuffer.offset + offset, size, passEncoder);
            context.SetVertexBuffer(1, vbuffer.buffer, vbuffer.offset + offset + 8, size, passEncoder);

            passEncoder.draw(
                6,                      // vertexCount
                instanceCount,          // instanceCount
                0,                      // firstVertex
                0,                      // firstInstance
            );
        }
    }

    /** GIS实例。 */
    private _gis: Gis;
}

/** GIS KML地图标记数据。 */
export interface Gis_kml {
    /** 标记MC坐标范围（min_x, max_x, min_z, max_z）。 */
    region: number[];
    /** 总顶点数量。 */
    vertexCount: number;
    /** 总索引数量。 */
    indexCount: number;
    /** 标记点顶点数组起始偏移。 */
    pointVertexStart: number;
    /** 标记点顶点数量。 */
    pointVertexCount: number;
    /** 标记线顶点数组起始偏移。 */
    lineVertexStart: number;
    /** 标记线顶点数量。 */
    lineVertexCount: number;
    /** 标记面顶点数组起始偏移。 */
    polygonVertexStart: number;
    /** 标记面顶点数量。 */
    polygonVertexCount: number;
    /** 顶点数组。 */
    vertexArray: number[];
    /** 索引数组。 */
    indexArray: number[];
    /** 顶点缓存节点。 */
    vertexBuffer?: ReturnType<Miaoverse.Dioramas_kernel["GenBuffer"]>;
    /** 索引缓存节点。 */
    indexBuffer?: ReturnType<Miaoverse.Dioramas_kernel["GenBuffer"]>;
    /** 标记信息节点索引列表。 */
    placemarks: number[];
    /** 标记根节点列表。 */
    nodes: {
        /** 节点ID。 */
        id: number;
        /** 节点名称。 */
        name: string;
        /** 分组容器类型。 */
        type: "kml" | "document" | "folder" | "placemark";
        /** 标记所属分组路径。 */
        path?: string;
        /** 节点图标。 */
        icon?: string;
        /** 是否为叶子节点。 */
        isLeaf: boolean;
        /** 子级节点列表。 */
        children: Gis_kml["nodes"];
        /** 节点附加数据。 */
        data?: {
            /** 标记图形数据。 */
            polygons: {
                /** 图形类型。 */
                type: "point" | "line" | "polygon",
                /** 海拔高度计算模式。 */
                altitudeMode: string;
                /** MC坐标包围盒。 */
                region: number[];

                /** 顶点数组起始偏移。 */
                vertexStart: number;
                /** 顶点数量。 */
                vertexCount: number;

                /** 索引数组起始偏移。 */
                indexStart: number;
                /** 索引数量。  */
                indexCount: number;
            }[];
        };
    }[];
}

/** GIS图层贴图采样偏移缩放。 */
interface Gis_uvst {
    /** 图层左下角采样偏移。 */
    offset_x: number;
    /** 图层左下角采样偏移。 */
    offset_z: number;
    /** 图层采样缩放。 */
    scale_x: number;
    /** 图层采样缩放。 */
    scale_z: number;
}

/** GIS图层贴图（我们使用图集图块实现）。 */
interface Gis_texture {
    /** 贴图图块内部实例指针。 */
    tile: Miaoverse.io_ptr;
    /** 图块所在图集图层。 */
    layer: number;
    /** 图块所在图层区域(uoffset, voffset, uscale, vscale)。 */
    rect: number[];
}

/** GIS LOD层级结构。 */
export interface Gis_level {
    /** 层级ID。 */
    id: number;
    /** 层级LOD级别[1, 23]。 */
    level: number;
    /** 层级子网格索引。 */
    submesh: number;
    /** 是否是最外环层级。 */
    outer: boolean;
    /** 是否重置层级状态。 */
    reset: boolean;
    /** 瓦片各坐标系下投影参数（以WGS84为基准）。 */
    projections: ({
        /** 上一帧左下角瓦片列号（用于检测刷新）。 */
        last_lb_col: number;
        /** 上一帧左下角瓦片行号（用于检测刷新）。 */
        last_lb_row: number;
        /** 左下角瓦片列号。 */
        lb_col: number;
        /** 左下角瓦片行号。 */
        lb_row: number;
    } & Gis_uvst)[];
    /** 图层数组。 */
    layers: {
        /** 图层数据无效。 */
        invalid?: boolean;
        /** 继承上级图层。 */
        inherit?: {
            /** 继承图层贴图图块。 */
            texture: Gis_texture;
            /** 继承图层采样偏移缩放。 */
            uvst: Gis_uvst;
            /** 是否是临时的替补数据。 */
            temporary: boolean;
        };
        /** 图层贴图图块。 */
        texture?: Gis_texture;
        /** 图层采样偏移缩放。 */
        uvst?: Gis_uvst;
        /** 图层瓦片缓存（重置层级状态时清空）。 */
        cache?: Record<string, Miaoverse.GLTextureSource>;
        /** 图层瓦片加载任务列表。 */
        loading?: {
            /** 瓦片列号。 */
            col: number;
            /** 瓦片行号。 */
            row: number;
            /** 瓦片级别。 */
            level: number;
            /** 当前瓦片距图层左下角瓦片列偏移。 */
            xoffset: number;
            /** 当前瓦片距图层左下角瓦片行偏移。 */
            zoffset: number;
        }[];
    }[];
}

/** GIS图层（不同数据叠加层）。 */
export interface Gis_layer {
    /** 
     * 瓦片数据服务类型：
     * tianditu_img_w: 天地图影像数据源，使用CGCS2000投影坐标系。
     * tianditu_img_c: 天地图影像数据源，使用LNGLAT投影坐标系。
     * tianditu_dem_c: 天地图地形数据源，使用LNGLAT投影坐标系。
     * arcgisonline_img_w: ARCGIS影像数据源，使用WGS84投影坐标系。
     * earthol_img_w: EARTHOL影像数据源，使用WGS84投影坐标系。
     */
    type: "tianditu_img_w" | "tianditu_img_c" | "tianditu_dem_c" | "arcgisonline_img_w" | "earthol_img_w";
    /** 瓦片数据服务TOKEN。 */
    token: string;
    /** 是否启用该图层。 */
    enabled: boolean;
}

/** 经纬度投影坐标系（经纬度转换为以米为单位的MC坐标，再根据MC坐标计算瓦片行列号，此处枚举表示各种转换算法）。 */
export const enum Gis_projection {
    /** 谷歌地图、OSM。 */
    WGS84 = 0,
    /** 天地图（与WGS84近似，非厘米精度需求可忽略差异）。 */
    CGCS2000,
    /** 高德地图、腾讯地图（基于WGS84加密）。 */
    GCJ02,
    /** 百度地图（基于GCJ02加密）。 */
    BD09,
    /** 经纬度直接投影。 */
    LNGLAT,
}
