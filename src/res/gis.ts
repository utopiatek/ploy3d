import * as Miaoverse from "../mod.js"

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

        // 将当前世界空间原点经纬度和MC坐标同步到内核
        this._global.env.Tick(
            this.enable_terrain ? 2 : 1,
            [
                this["_originLL"][0], this["_originLL"][1],
                this["_originMC"][0], this["_originMC"][1]
            ]
        );
    }

    /**
     *初始化GIS系统。
     */
    public async Init() {
        this._pyramid = new Gis_pyramid(this, 8, 4);
        // TODO
        /*
        this._materials = [];

        for (let i = 0; i < this._pyramid.levelCount; i++) {
            const material = await Global.resources.CreateMaterial("gis", 0);

            this._materials[i] = {
                slot: this._pyramid.levelCount - i - 1,
                group: i,
                material: material
            };
        }

        this._object3D = await Global.resources.CreateObject("Gis");
        this._object3D.staticWorld = true;

        this._mesh = await Global.resources.CreateMesh({
            type: "lod_plane",
            lod_plane: {
                levels: this._pyramid.levelCount,
                segments: 64
            }
        });

        const meshRenderer = await Global.resources.CreateMeshRenderer({
            master: this._object3D,
            mesh: this._mesh,
            materials: this._materials
        });
        */
        return this;
    }

    /** 
     * 销毁GIS系统。
     */
    public Destroy() {
        // TODO ...

        this._global = undefined;

        this._pyramid = undefined;
        this._object3D = undefined;
        this._mesh = undefined;
        this._materials = undefined;

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

        this._flushing = false;
        this._waiting = undefined;
        this._servers = undefined;
    }

    /**
     * 根据相机姿态刷新地图。
     * @param camera 相机组件实例。
     * @param target 相机观察目标。
     * @param distance 相机距观察目标距离。
     * @param pitch 相机俯角。
     * @param yaw 相机偏航角。
     */
    public Set3D(camera: Miaoverse.Camera, target: number[], distance: number, pitch: number, yaw: number) {
        // 当前世界空间原点经纬度和墨卡托坐标
        const originMC = this._originMC;
        const originLL = this._originLL;

        // 3D交互在地球表面进行，将地球表面的空间距离转换为墨卡托投影空间的距离，再换算为经纬度
        // 相机在球面世界空间中平移，使用该缩放将平移量转换到墨卡托投影空间
        const scaleMC = 1.0 / Math.cos(originLL[1] / 180.0 * Math.PI);

        let offsetX = target[0] * scaleMC;
        let offsetZ = -target[2] * scaleMC;

        // 如果偏移量大于10000MC，则重新设置世界空间原点经纬度和墨卡托坐标
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

            // 将当前世界空间原点经纬度和MC坐标同步到内核
            this._global.env.Tick(
                this.enable_terrain ? 2 : 1,
                [
                    this["_originLL"][0], this["_originLL"][1],
                    this["_originMC"][0], this["_originMC"][1]
                ]
            );

            // 设置新世界空间原点后，重新计算相机观察点世界空间坐标
            target[0] = offsetX / scaleMC;
            target[2] = -offsetZ / scaleMC;

            camera.target = target;
        }

        // 当前相机观察点墨卡托坐标和经纬度
        const targetMC = [originMC[0] + offsetX, originMC[1] + offsetZ];
        const targetLL = this.MC2LL(targetMC);

        // 在35度垂直视角下，屏幕像素高度对应的屏幕像素距离
        const distancePix = Math.round(camera.height * 0.5 / Math.tan(0.5 * camera.fov));
        // 中心图层分辨率（米/像素）
        const dpi = distance / (distancePix);
        // 中心图层级别
        const pow = 40075016.685578488 / (256 * dpi);
        // 计算最高精度显示级别
        const level = Math.log2(pow);

        // 刷新地图
        this.Flush(target[0], target[2], targetLL[0], targetLL[1], level, pitch, yaw);
    }

    /**
     * 设置当前GIS状态。
     * @param x 网格中心坐标X（世界空间）。
     * @param z 网格中心坐标Z（世界空间）。
     * @param lng 当前中心经度（WGS84）。
     * @param lat 当前中心纬度（WGS84）。
     * @param level 当前中心显示级别。
     * @param pitch 当前观察俯仰角。
     * @param yaw 当前观察偏航角。
     */
    public Flush(x: number, z: number, lng: number, lat: number, level: number, pitch: number, yaw: number) {
        // PLOY3D世界原点经纬度通常固定，相机相对世界原点移动观察
        // 渲染GIS球体时，首先计算每个网格顶点对应的经纬度，根据经纬度构造球面
        // 旋转GIS球体至观察点坐标变换为(0, 0, 0)
        // 平移GIS球体观察点至相机观察点坐标

        if (this._lock) {
            return;
        }

        const centerMC = this.LL2MC([lng, lat]);
        const timestamp = Date.now();

        if (this._flushing) {
            // 上一次刷新响应未超时的情况下，将当前刷新命令置入等待队列
            if (Math.ceil((timestamp - this._timestamp) / 1000) < 5) {
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

        const tileY = Math.floor(level);
        const tileS = this.perimeter / Math.pow(2, tileY);
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
        this._flushing = true;
        this._waiting = null;

        this._pyramid.Flush(tileY, lb_tile_bias[0], lb_tile_bias[1], lb_tile_bias[2], lb_tile_bias[3], () => {
            if (timestamp != this._timestamp) {
                console.warn("该GIS刷新响应已经超时！", Math.ceil((Date.now() - timestamp) / 1000));
                return;
            }

            this._flushing = false;

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

    /** 地形数据可用时，强制开启地形。 */
    public get force_terrain() {
        return this._pyramid.forceTerrain;
    }
    public set force_terrain(enable: boolean) {
        this._pyramid.forceTerrain = enable;
    }

    /** 引擎实例。 */
    private _global: Miaoverse.Ploy3D;

    /** GIS金字塔结构。 */
    private _pyramid: Gis_pyramid;
    /** GIS对象。 */
    private _object3D: Miaoverse.Object3D;
    /** GIS网格。 */
    private _mesh: Miaoverse.Mesh;
    /** GIS各层级材质数组。 */
    private _materials: {
        /** 材质插槽。 */
        slot: number;
        /** 材质所属子网格索引。 */
        group: number;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
    }[];

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
    private _flushing: boolean;
    /** 等待刷新参数。 */
    private _waiting: number[];
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
                token: "c6f5fc06a3eeb819a9af72da96665a04",
                enabled: true
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
     * 刷新LOD层级金字塔。
     * @param level 顶层级别。
     * @param lb_col 顶层左下角列号。
     * @param lb_row 顶层左下角行号。
     * @param lb_bias_x 顶层左下角瓦片采样偏移。
     * @param lb_bias_z 顶层左下角瓦片采样偏移。
     * @param callback 刷新完成回调。
     */
    public Flush(level: number, lb_col: number, lb_row: number, lb_bias_x: number, lb_bias_z: number, callback: () => void) {
        // 将当前世界空间原点经纬度和MC坐标同步到内核
        this._gis["_global"].env.Tick(
            this.terrain ? 2 : 1,
            [
                this._gis["_originLL"][0], this._gis["_originLL"][1],
                this._gis["_originMC"][0], this._gis["_originMC"][1]
            ]
        );

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

        // 即使所有投影坐标系下各LOD级别瓦片平铺和采样参数
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
                        if ((level - i) < 1) {
                            cur_level.level = 0;
                            cur_level.reset = true;
                            continue;
                        }

                        if (!cur_level.reset) {
                            console.error("layer.reset state error!");
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
                        console.error("图层由墨卡托投影转经纬度投影时瓦片平铺数量溢出：", (bottomRow - topRow));
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

        // 加载影像瓦片
        this.Load(timestamp, (reuse, total, succeed, failed) => {
            callback();
        });
    }

    /**
     * 瓦片资源加载映射。
     * @param callback 加载完成回调。
     */
    private Load(timestamp: number, callback: (reuse: number, total: number, succeed: number, failed: number) => void) {
        // 图层待刷新瓦片量小于1/3时，允许被更高层采样，为避免显示错乱，待刷新瓦片区域应当填充为白色
        // 优先加载待刷新瓦片量较少的图层，图层实际刷新间隔应大于1秒
        // 优先加载较低层图层，更高层在图层尚不可用时可以采样较低层图层，直到加载完毕
        // 缩小时，通常新顶层已经加载，此时仅需加载新底层（底层通常可见度低，用户体验影响不大）
        // 放大时，通常新底层已经加载，此时仅需加载新顶层（顶层加载期间采样较低层，用户体验影响不大）

        const levelCount = this.levelCount;
        const levels = this._pyramid;
        const top = this._pyramidTop;
        const dem_enabled = this.terrain;

        // 各图层当前替补级别索引（如果某图层需加载瓦片较多，暂时采样当前可用替补级别索引）
        const understudy: number[] = [];
        // 上层地形采样数据，LOD边缘从上层采样以缝合边缘
        let last_dem = null;
        // 当前层地形采样数据
        let cur_dem = null;

        let reuse = 0;

        // 从底层往顶层处理
        for (let i = levelCount - 1; i > -1; i--) {
            const cur = (top + i) % levelCount;
            const cur_level = levels[cur];
            const material = this._gis.materials[cur_level.submesh];

            // 。。。加载当前层级的每个图层的瓦片数据
            for (let j = 0; j < this._layers.length; j++) {
                // 图层激活配置，如果不激活则跳过处理
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
                // 天地图地形DEM瓦片仅存在于[7, 12]级别之间
                const has_dem = dem_enabled && cur_level.level > 6;

                // 地形图层贴图引用设置
                if (j == 0 && has_dem) {
                    cur_dem = {
                        level: cur_level.level,
                        texture: layer_data.texture,
                        uvst: layer_projection,
                    };

                    last_dem = last_dem || cur_dem;

                    if (last_dem) {
                        this.SetTexture(material.material, last_dem.texture, last_dem.uvst, undefined, "baseDemTex");
                    }

                    last_dem = cur_dem;
                }

                // 在处理图层1时设置层级绘制参数
                if (j == 1) {
                    // 基础地形层级、当前层级、层级网格中心墨卡托坐标
                    material.material.view["params"] = [
                        has_dem ? last_dem.level : 0,
                        cur_level.level,
                        Math.round(this._gis.centerMC[0]),
                        Math.round(this._gis.centerMC[1])
                    ];
                }

                // 不绘制当前层级
                if (cur_level.level < 1) {
                    continue;
                }

                layer_data.inherit = null;

                // 超过瓦片服务提供的最大级别，采样较低级别图层
                if (cur_level.level > layer_serv.max_level) {
                    // 最底层级别依然超过瓦片服务提供的最大级别（通常不会）
                    if (i == (levelCount - 1)) {
                        console.error("todo ...");
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
                            parent: last_data,
                            uvst: uvst,
                            layer: j,
                            material: material.material,
                            temporary: false
                        };

                        continue;
                    }
                }

                this.SetTexture(material.material, layer_data.texture, layer_projection, j);

                const flush = cur_level.reset || layer_projection.lb_col !== layer_projection.last_lb_col || layer_projection.lb_row !== layer_projection.last_lb_row;
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
                else {
                    if (j == 1 && Object.keys(layer_data.cache).length != (tiling * tiling)) {
                        console.error("layer cache count error:", Object.keys(layer_data.cache).length, (tiling * tiling));
                    }
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

                            tile.layer = 0;
                            tile.level = 0;
                            tile.xoffset = layer_serv.tile_size * c;
                            tile.yoffset = layer_serv.tile_size * (tiling - r - 1);

                            this.FillTexture(layer_data.texture, tile);

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
                                this._blankTile.layer = 0;
                                this._blankTile.level = 0;
                                this._blankTile.xoffset = layer_serv.tile_size * c;
                                this._blankTile.yoffset = layer_serv.tile_size * (tiling - r - 1);

                                this.FillTexture(layer_data.texture, this._blankTile);
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
                            parent: last_data,
                            uvst: uvst,
                            layer: j,
                            material: material.material,
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

        const this_ = this;
        const global_ = this._gis["_global"];

        global_.app.DrawFrame(1);

        (async function () {
            // 优先从高层往低层加载待加载瓦片量小于图层瓦片总量1/2的图层瓦片
            // 其次从低层往高层加载其它图层瓦片
            function sort_weight(level: Gis_level) {
                let max_loading = this_._tiling * this_._tiling;

                for (let j = 0; j < this_._layers.length; j++) {
                    if (this_._layers[j].enabled) {
                        const layer = level.layers[j];

                        if (layer.loading && max_loading > layer.loading.length) {
                            max_loading = layer.loading.length;
                        }
                    }
                }

                if (max_loading < (this_._tiling * 2)) {
                    return level.level * 100;
                }
                else {
                    return 100 - level.level;
                }
            }

            const sorted_levels = levels.slice().sort((a, b) => {
                return sort_weight(b) - sort_weight(a);
            });

            // 我们总是应当立即应用各图层贴图采样偏移参数，瓦片加载在最后整体等待完成即可
            const promises: Promise<void>[] = [];

            let inherits = [];
            let total = 0;
            let succeed = 0;
            let failed = 0;

            for (let level of sorted_levels) {
                const cur_level = level;
                const material = this_._gis.materials[cur_level.submesh];

                for (let j = 0; j < this_._layers.length; j++) {
                    const layer_index = j;
                    const layer = this_._layers[j];
                    if (!layer.enabled) {
                        continue;
                    }

                    const layer_data = cur_level.layers[j];

                    if (layer_data.inherit) {
                        inherits.push(layer_data.inherit);
                        if (!layer_data.inherit.temporary) {
                            continue;
                        }
                    }

                    const layer_serv = this_._gis.servers[layer.type];
                    const layer_projection = cur_level.projections[layer_serv.projection];
                    const tiling = layer_serv.projection > Gis_projection.CGCS2000 ? this_._tiling + 1 : this_._tiling;

                    if (!layer_data.texture) {
                        //TODO
                        //layer_data.texture = await Global.resources.CreateTexture2D("gis.jpg", false, layer_serv.tile_size * tiling, layer_serv.tile_size * tiling);
                        //layer_data.texture.AddRef();
                    }

                    if (!layer_data.inherit) {
                        this.SetTexture(material.material, layer_data.texture, layer_projection, j);
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
                                    console.warn("再次尝试加载瓦片：", url);
                                    setTimeout(load_, 500);
                                }
                                else {
                                    callback_(null);
                                }
                            }

                            function load_() {
                                global_.Fetch<ArrayBuffer>(url, null, "arrayBuffer").then(response_).catch((e) => {
                                    console.error(e);
                                    response_(null);
                                });
                            }

                            load_();
                        }

                        promises.push((new Promise<void>(function (resolve, reject) {
                            function flush(succ: boolean) {
                                if (succ === true) {
                                    succeed++;
                                }
                                else {
                                    failed++;
                                }

                                global_.app.DrawFrame(1);

                                if (0 == --loading) {
                                    layer_data.loading = [];

                                    // 此调用将撤换掉替补数据
                                    this.SetTexture(material.material, layer_data.texture, layer_projection, layer_index);

                                    resolve();
                                }
                            }

                            for (let info_ of layer_data.loading) {
                                const info = info_;
                                const key = "" + info.col + "_" + info.row + "_" + info.level;
                                const url = this_._gis.ServeUrl(layer.type, layer.token, info.col, info.row, info.level);

                                if (layer.type == "tianditu_dem_c") {
                                    //TODO
                                    /*
                                    Global.worker.Decode_dem(0, url).then((data) => {
                                        if (data && timestamp == this_._gis.timestamp) {
                                            const bitmap: Asset_wrapper_bitmap = {
                                                data: data,
                                                dataLayout: {
                                                    offset: 0,
                                                    bytesPerRow: 4 * layer_serv.tile_size,
                                                    rowsPerImage: layer_serv.tile_size
                                                },
                                                xoffset: layer_serv.tile_size * info.xoffset,
                                                yoffset: layer_serv.tile_size * (tiling - info.zoffset - 1),
                                                layer: 0,
                                                level: 0,
                                                width: layer_serv.tile_size,
                                                height: layer_serv.tile_size
                                            };

                                            layer_data.texture.Fill(bitmap);
                                            cache[key] = bitmap;

                                            flush(true);
                                        }
                                        else {
                                            flush(false);
                                        }
                                    }).catch(e => {
                                        flush(false);
                                    });
                                    */
                                }
                                else {
                                    load_buffer(url, 3, function (buffer) {
                                        if (buffer && timestamp == this_._gis.timestamp) {
                                            const blob = new Blob([new Int8Array(buffer)]);
                                            const option: ImageBitmapOptions = undefined;

                                            createImageBitmap(blob, option).then((bitmap: Miaoverse.GLTextureSource) => {
                                                bitmap.layer = 0;
                                                bitmap.level = 0;
                                                bitmap.xoffset = layer_serv.tile_size * info.xoffset;
                                                bitmap.yoffset = layer_serv.tile_size * (tiling - info.zoffset - 1);

                                                this.FillTexture(layer_data.texture, bitmap);
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

            for (let inherit of inherits) {
                this.SetTexture(inherit.material, inherit.parent.texture, inherit.uvst, inherit.layer);
            }

            await Promise.all(promises);

            callback(reuse, total, succeed, failed);
        })();
    }

    /**
     * 为材质设置图层贴图属性。
     * @param material 材质资源实例。
     * @param texture 图层贴图（我们使用图集图块实现）。
     * @param uvst 图层贴图采样偏移缩放。
     * @param layer 贴图对应图层。
     * @param name 贴图属性名称。
     */
    private SetTexture(material: Miaoverse.Material, texture: Gis_texture, uvst: Gis_uvst, layer?: number, name?: string) {
        // TODO ...
    }

    /**
     * 填充贴图数据。
     * @param texture 贴图实例。
     * @param data 贴图数据。
     */
    private FillTexture(texture: Gis_texture, data: Miaoverse.GLTextureSource) {
        // ...
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
        /** 继承上级图层。 */
        inherit?: {
            /** 上级图层数据。 */
            parent: {
                /** 贴图对象。 */
                texture?: Gis_texture;
            };
            /** 继承图层UV偏移缩放。 */
            uvst: {
                offset_x: number;
                offset_z: number;
                scale_x: number;
                scale_z: number;
            };
            /** 图层索引。 */
            layer: number;
            /** 材质对象。 */
            material: Miaoverse.Material;
            /** 是否为临时的替补数据。 */
            temporary: boolean;
        };
        /** 图层贴图图块。 */
        texture?: Gis_texture;
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