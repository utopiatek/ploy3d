import * as Miaoverse from "../mod.js";
/** GIS系统。 */
export declare class Gis {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     *初始化GIS系统。
     */
    Init(): Promise<this>;
    /**
     * 销毁GIS系统。
     */
    Destroy(): void;
    /**
     * 根据相机姿态刷新地图。
     * @param camera 相机组件实例。
     */
    Update(camera: Miaoverse.Camera): Float32Array;
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
    Flush(x: number, z: number, lng: number, lat: number, level: number, pitch: number, yaw: number): void;
    /**
     * 刷新材质属性。
     * @param values 材质属性值。
     */
    FlushMaterial(values?: {
        centerMC?: number[];
        targetMC?: number[];
        movedMC?: number[];
        targetXZ?: number[];
        size?: number[];
    }): void;
    /**
     * 绘制场景。
     * @param passEncoder 渲染通道命令编码器。
     */
    Draw(queue: Miaoverse.DrawQueue): void;
    /**
     * 计算太阳方位角和高度角。
     * 方位角：单位度，正北为0，顺时针增加，[0, 360]；
     * 高度角：单位度，地平线为0，向上增加，[-90, 90]；
     * @param params 经纬度和时间参数。
     * @returns 返回太阳方位角和高度角。
     */
    CalSunlight(params: {
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
    }): {
        /** 太阳方位角。 */
        azimuth: number;
        /** 太阳高度角。 */
        altitude: number;
        /** 太阳光照方向。 */
        direction: Miaoverse.Vector3;
    };
    /**
     * 计算指定经纬度所在当前世界空间坐标。
     * @param lng 指定经度（WGS84）。
     * @param lat 指定纬度（WGS84）。
     * @returns 返回当前世界空间坐标。
     */
    CalPosition(lng: number, lat: number): Miaoverse.Vector3;
    /**
     * 生成瓦片请求URL。
     * @param type 瓦片服务类型。
     * @param token 瓦片服务TOKEN。
     * @param col 瓦片列号。
     * @param row 瓦片行号。
     * @param level 瓦片级别。
     * @returns 返回URL。
     */
    ServeUrl(type: Gis_layer["type"], token: string, col: number, row: number, level: number): string;
    /**
     * 经纬度转当前世界空间坐标（当前世界空间原点经纬度_originLL）。
     * 注意：
     * 我们基于当前世界空间原点纬度_originLL[1]来转换世界距离到墨卡托投影距离；
     * 两个地理位置点间的世界空间距离不是准确的，特别是在纬度跨度很大时；
     * @param ll 经纬度。
     * @returns 当前世界空间坐标。
     */
    LL2WPOS(ll: number[]): number[];
    /** 当前中心经度。 */
    get lng(): number;
    /** 当前中心纬度。 */
    get lat(): number;
    /** 当前中心显示级别（[9, 16]显示地形，[17, ~]显示3D）。 */
    get level(): number;
    /** 当前中心墨卡托坐标。 */
    get centerMC(): number[];
    /** 当前中心世界坐标。 */
    get centerPos(): number[];
    /** 当前是否锁定GIS状态。 */
    get lock(): boolean;
    /** 当前是否锁定GIS状态。 */
    set lock(lock: boolean);
    /** 当前刷新时间戳。 */
    get timestamp(): number;
    /** 瓦片服务信息（可自己扩展添加）。 */
    get servers(): {
        tianditu_img_w: {
            label: string;
            url: string;
            count: number;
            projection: Miaoverse.Gis_projection;
            tile_size: number;
            max_level: number;
            min_level: number;
        };
        tianditu_img_c: {
            label: string;
            url: string;
            count: number;
            projection: Miaoverse.Gis_projection;
            tile_size: number;
            max_level: number;
            min_level: number;
        };
        tianditu_dem_c: {
            label: string;
            url: string;
            count: number;
            projection: Miaoverse.Gis_projection;
            tile_size: number;
            max_level: number;
            min_level: number;
        };
        arcgisonline_img_w: {
            label: string;
            url: string;
            count: number;
            projection: Miaoverse.Gis_projection;
            tile_size: number;
            max_level: number;
            min_level: number;
        };
        earthol_img_w: {
            label: string;
            url: string;
            count: number;
            projection: Miaoverse.Gis_projection;
            tile_size: number;
            max_level: number;
            min_level: number;
        };
    };
    /** GIS各层级材质数组。 */
    get materials(): {
        /** 材质插槽。 */
        slot: number;
        /** 材质所属子网格索引。 */
        group: number;
        /** 材质资源实例。 */
        material: Miaoverse.Material;
    }[];
    /** 地球半径。 */
    get radius(): number;
    /** 地球直径。 */
    get diameter(): number;
    /** 地球周长。 */
    get perimeter(): number;
    /** 地球半周长。 */
    get perimeter_half(): number;
    /** 当前是否显示地形。 */
    get enable_terrain(): boolean;
    /** 地形数据可用时，强制开启地形。 */
    get force_terrain(): boolean;
    set force_terrain(enable: boolean);
    /** 引擎实例。 */
    private _global;
    /** GIS金字塔结构。 */
    private _pyramid;
    /** GIS网格。 */
    private _mesh;
    /** GIS各层级材质数组。 */
    private _materials;
    /** 当前中心经度。 */
    private _lng;
    /** 当前中心纬度。 */
    private _lat;
    /** 当前中心显示级别。 */
    private _level;
    /** 当前观察俯仰角。 */
    private _pitch;
    /** 当前观察偏航角。 */
    private _yaw;
    /** 世界空间原点墨卡托坐标。 */
    private _originMC;
    /** 世界空间原点经纬度。 */
    private _originLL;
    /** 当前中心墨卡托坐标。 */
    private _centerMC;
    /** 当前中心世界坐标。 */
    private _centerPos;
    /** 当前中心瓦片列号。 */
    private _tileX;
    /** 当前中心瓦片行号。 */
    private _tileZ;
    /** 当前中心瓦片层号。 */
    private _tileY;
    /** 网格缩放。 */
    private _meshS;
    /** 当前是否锁定GIS状态。 */
    private _lock;
    /** 当前刷新时间戳。 */
    private _timestamp;
    /** 是否正在刷新（限制刷新频率）。 */
    private _flushing;
    /** 等待刷新参数。 */
    private _waiting;
    /** 瓦片服务信息（对应Gis_serv_type）。 */
    private _servers;
    /**
     * 检测指定经纬度是否在中国范围框之外（纬度3.86~53.55、经度73.66~135.05）。
     * 范围框之内使用GCJ02加密。
     * @param ll 经纬度。
     * @returns 返回真表示指定经纬度在中国范围框之外。
     */
    OutOfChina(ll: number[]): boolean;
    /**
     * 对经度进行第1次GCJ02加密转换。
     * @param ll 经纬度。
     * @returns 返回第1次加密后的经度。
     */
    TransformLng(ll: number[]): number;
    /**
     * 对纬度进行第1次GCJ02加密转换。
     * @param ll 经纬度。
     * @returns 返回第1次加密后的纬度。
     */
    TransformLat(ll: number[]): number;
    /**
     * GPS坐标系（WGS84）转火星坐标系（GCJ02）。
     * @param ll 经纬度（WGS84）。
     * @returns 经纬度（GCJ02）。
     */
    WGS84_GCJ02(ll: number[]): number[];
    /**
     * 火星坐标系（GCJ02）转GPS坐标系（WGS84）。
     * @param ll 经纬度（GCJ02）。
     * @returns 经纬度（WGS84）。
     */
    GCJ02_WGS84(ll: number[]): number[];
    /**
     * 火星坐标系（GCJ02）转百度坐标系（BD09）。
     * @param ll 经纬度（GCJ02）。
     * @returns 经纬度（BD09）。
     */
    GCJ02_BD09(ll: number[]): number[];
    /**
     * 百度坐标系（BD09）转火星坐标系（GCJ02）。
     * @param ll 经纬度（BD09）。
     * @returns 经纬度（GCJ02）。
     */
    BD09_GCJ02(ll: number[]): number[];
    /**
     * GPS坐标系（WGS84）转百度坐标系（BD09）。
     * @param ll 经纬度（WGS84）。
     * @returns 经纬度（BD09）。
     */
    WGS84_BD09(ll: number[]): number[];
    /**
     * 百度坐标系（BD09）转GPS坐标系（WGS84）。
     * @param ll 经纬度（BD09）。
     * @returns 经纬度（WGS84）。
     */
    BD09_WGS84(ll: number[]): number[];
    /**
     * 经纬度转墨卡托坐标（墨卡托坐标用于计算瓦片行列号）。
     * @param ll 经纬度。
     * @returns 墨卡托坐标。
     */
    LL2MC(ll: number[]): number[];
    /**
     * 墨卡托坐标转经纬度。
     * @param mc 墨卡托坐标。
     * @returns 经纬度。
     */
    MC2LL(mc: number[]): number[];
    /**
     * 百度经纬度百度转墨卡托坐标（墨卡托坐标用于计算瓦片行列号）。
     * https://www.cnblogs.com/xiaozhi_5638/p/4748186.html
     * @param ll 百度经纬度。
     * @returns 百度墨卡托坐标。
     */
    LL2MC_BD09(ll: number[]): number[];
    /**
     * 百度墨卡托坐标转百度经纬度。
     * @param mc 百度墨卡托坐标。
     * @returns 百度经纬度。
     */
    MC2LL_BD09(mc: number[]): number[];
    /** BD09_MC计算查找表。 */
    private _lut1;
    /** BD09_MC计算查找表。 */
    private _lut2;
    /** BD09_MC计算查找表。 */
    private _lut3;
    /** BD09_MC计算查找表。 */
    private _lut4;
}
/** GIS LOD层级金字塔。 */
export declare class Gis_pyramid {
    /**
     * 构造函数。
     * @param _gis GIS实例。
     * @param _levels LOD层级数（建议值8）。
     * @param _tiling  LOD层级图层瓦片平铺数量（移动端建议值4、PC端建议值8）。
     */
    constructor(_gis: Gis, _levels: number, _tiling: number);
    /**
     * 更新LOD层级金字塔。
     * @param level 顶层级别。
     * @param lb_col 顶层左下角列号。
     * @param lb_row 顶层左下角行号。
     * @param lb_bias_x 顶层左下角瓦片采样偏移。
     * @param lb_bias_z 顶层左下角瓦片采样偏移。
     * @param callback 刷新完成回调。
     */
    Update(level: number, lb_col: number, lb_row: number, lb_bias_x: number, lb_bias_z: number, callback: () => void): void;
    /**
     * 刷新并加载瓦片资源。
     * @param timestamp 加载任务时间戳。
     * @param callback 加载完成回调。
     */
    private Flush;
    /**
     * 填充贴图数据。
     * @param texture 贴图实例。
     * @param data 贴图数据。
     * @param xoffset 写入横向像素偏移。
     * @param yoffset 写入纵向像素偏移。
     */
    private FillTexture;
    /**
     * 加载瓦片资源。
     * @param timestamp 加载任务时间戳。
     * @param callback 加载完成回调。
     */
    private Load;
    /** LOD层级数。 */
    get levelCount(): number;
    /** LOD层级图层瓦片平铺数量。 */
    get layerTiling(): number;
    /** 地形数据可用时，强制开启地形。 */
    set forceTerrain(enable: boolean);
    /** 当前是否启用地形。 */
    get terrain(): boolean;
    /** GIS实例。 */
    private _gis;
    /** 地形数据可用时，强制开启地形。 */
    private _forceTerrain;
    /** 空白瓦片数据（用于默认填充）。 */
    private _blankTile;
    /** 图层资源定义数组（最多叠加4个图层）。 */
    private _layers;
    /** LOD层级图层瓦片平铺数量（移动端建议值4、PC端建议值8、非WGS84、CGCS2000层平铺数量+1）。 */
    private _tiling;
    /** LOD层级金字塔。 */
    private _pyramid;
    /** LOD层级金字塔顶层索引（最精细层，往右降低）。 */
    private _pyramidTop;
    /** LOD层级金字塔高度（建议值8）。 */
    private _pyramidHeight;
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
export declare const enum Gis_projection {
    /** 谷歌地图、OSM。 */
    WGS84 = 0,
    /** 天地图（与WGS84近似，非厘米精度需求可忽略差异）。 */
    CGCS2000 = 1,
    /** 高德地图、腾讯地图（基于WGS84加密）。 */
    GCJ02 = 2,
    /** 百度地图（基于GCJ02加密）。 */
    BD09 = 3,
    /** 经纬度直接投影。 */
    LNGLAT = 4
}
export {};
