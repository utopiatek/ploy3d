import * as Miaoverse from "../mod.js";
/** 物理头发组件。 */
export declare class PhysicsHair extends Miaoverse.Resource<PhysicsHair> {
}
/** 物理头发组件内核实现。 */
export declare class PhysicsHair_kernel extends Miaoverse.Base_kernel<PhysicsHair, any> {
}
/** 头发设置数据。 */
export declare class HairSettings {
    /** 发缕设置对象。 */
    StandsSettings: HairStandsSettings;
}
/** 发缕设置对象。 */
declare class HairStandsSettings {
    /**
     * 构造函数。
     * @param filters 原始头发数据分组数据。
     */
    constructor(settings: {
        /** 几何数据设置。 */
        geometry: {
            /** 原始头发数据分组数据。 */
            groups: HairGroupsProvider["HairFilters"];
        };
    });
    /** 发缕数据导入器。 */
    Provider: HairGeometryImporter;
}
/** 发缕数据导入器。 */
declare class HairGeometryImporter {
    /**
     * 构造函数。
     * @param settings 数据设置。
     */
    constructor(settings: {
        /** 原始头发数据分组数据。 */
        groups: HairGroupsProvider["HairFilters"];
    });
    /**
     * 处理头发数据。
     * @param _global 模块实例对象。
     */
    Process(_global: Miaoverse.Ploy3D): void;
    /** 发缕数据提供器。 */
    HairGroupsProvider: HairGroupsProvider;
}
/** 发缕数据提供器。 */
declare class HairGroupsProvider {
    /**
     * 构造函数。
     * @param filters 原始头发数据分组数据。
     */
    constructor(filters: HairGroupsProvider["HairFilters"]);
    /**
     * 处理发缕顶点数据。
     * @param _global 模块实例对象。
     * @param worldToObject 世界空间到头发模型空间变换矩阵。
     */
    Process(_global: Miaoverse.Ploy3D, worldToObject: number[]): void;
    /** 原始头发数据分组数据。 */
    HairFilters: {
        /** 发缕建模空间到世界空间变换矩阵。 */
        localToWorldMatrix: number[];
        /** 发缕顶点坐标数据。 */
        vertices: number[];
        /** 发缕顶点颜色数据。 */
        colors: number[];
        /** 发缕顶点数量。 */
        vertexCount: number;
    }[];
    /** 各组发缕顶点坐标数据。 */
    VerticesGroups: HairGroupsProvider["Vertices"][];
    /** 发缕顶点坐标数据。 */
    Vertices: {
        Count: number;
        Array: number[];
    };
    /** 各组发缕顶点颜色数据。 */
    ColorsGroups: HairGroupsProvider["Colors"][];
    /** 发缕顶点颜色数据。 */
    Colors: {
        Count: number;
        Array: number[];
    };
}
export {};
