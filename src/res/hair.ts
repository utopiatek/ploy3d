import * as Miaoverse from "../mod.js"

/** 物理头发组件。 */
export class PhysicsHair extends Miaoverse.Resource<PhysicsHair> {
}

/** 物理头发组件内核实现。 */
export class PhysicsHair_kernel extends Miaoverse.Base_kernel<PhysicsHair, any> {
}

/** 头发设置数据。 */
export class HairSettings {
    /** 发缕设置对象。 */
    public StandsSettings: HairStandsSettings;
}

/** 发缕设置对象。 */
class HairStandsSettings {
    /**
     * 构造函数。
     * @param filters 原始头发数据分组数据。
     */
    public constructor(settings: {
        /** 几何数据设置。 */
        geometry: {
            /** 原始头发数据分组数据。 */
            groups: HairGroupsProvider["HairFilters"];
        };
    }) {
        this.Provider = new HairGeometryImporter(settings.geometry);
    }

    /** 发缕数据导入器。 */
    public Provider: HairGeometryImporter;
}

/** 发缕数据导入器。 */
class HairGeometryImporter {
    /**
     * 构造函数。
     * @param settings 数据设置。
     */
    public constructor(settings: {
        /** 原始头发数据分组数据。 */
        groups: HairGroupsProvider["HairFilters"];
    }) {
        this.HairGroupsProvider = new HairGroupsProvider(settings.groups);
    }

    /**
     * 处理头发数据。
     * @param _global 模块实例对象。
     */
    public Process(_global: Miaoverse.Ploy3D) {
        const worldToObject = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.HairGroupsProvider.Process(_global, worldToObject);
    }

    /** 发缕数据提供器。 */
    public HairGroupsProvider: HairGroupsProvider;
}

/** 发缕数据提供器。 */
class HairGroupsProvider {
    /**
     * 构造函数。
     * @param filters 原始头发数据分组数据。
     */
    public constructor(filters: HairGroupsProvider["HairFilters"]) {
        this.HairFilters = filters;
    }

    /**
     * 处理发缕顶点数据。
     * @param _global 模块实例对象。
     * @param worldToObject 世界空间到头发模型空间变换矩阵。
     */
    public Process(_global: Miaoverse.Ploy3D, worldToObject: number[]) {
        this.VerticesGroups = [];
        this.Vertices = {
            Count: 0,
            Array: []
        };

        this.ColorsGroups = [];
        this.Colors = {
            Count: 0,
            Array: []
        };

        _global.env.AllocaCall(128, (ptr) => {
            for (let f = 0; f < this.HairFilters.length; f++) {
                const filter = this.HairFilters[f];

                const vertices = this.VerticesGroups[f] = {
                    Count: 0,
                    Array: [] as number[],
                };

                const colors = this.ColorsGroups[f] = {
                    Count: 0,
                    Array: [] as number[],
                };

                _global.env.farraySet(ptr, 0, worldToObject);
                _global.env.farraySet(ptr, 16, filter.localToWorldMatrix);
                _global.internal.Matrix4x4_MultiplyMatrices(ptr, _global.env.ptrMove(ptr, 16), ptr);

                for (let i = 0; i < filter.vertexCount; i++) {
                    let i3 = i * 3;
                    let i4 = i * 4;

                    const x = filter.vertices[i3 + 0];
                    const y = filter.vertices[i3 + 1];
                    const z = filter.vertices[i3 + 2];

                    const r = filter.colors[i3 + 0] || 0;
                    const g = filter.colors[i3 + 1] || 0;
                    const b = filter.colors[i3 + 2] || 0;
                    const a = filter.colors[i3 + 3] || 0;

                    _global.env.farraySet(ptr, 16, [x, y, z, 1.0]);
                    _global.internal.Matrix4x4_MultiplyVector(ptr, _global.env.ptrMove(ptr, 16), _global.env.ptrMove(ptr, 16));

                    const v = _global.env.farrayRef(ptr, 16, 3);

                    vertices.Array[i3 + 0] = v[0];
                    vertices.Array[i3 + 1] = v[1];
                    vertices.Array[i3 + 2] = v[2];
                    vertices.Count++;

                    colors.Array[i4 + 0] = r;
                    colors.Array[i4 + 1] = g;
                    colors.Array[i4 + 2] = b;
                    colors.Array[i4 + 2] = a;
                    colors.Count++;

                    const o3 = this.Vertices.Count * 3;
                    const o4 = this.Colors.Count * 4;

                    this.Vertices.Array[o3 + 0] = v[0];
                    this.Vertices.Array[o3 + 1] = v[1];
                    this.Vertices.Array[o3 + 2] = v[2];
                    this.Vertices.Count++;

                    this.Colors.Array[o4 + 0] = r;
                    this.Colors.Array[o4 + 1] = g;
                    this.Colors.Array[o4 + 2] = b;
                    this.Colors.Array[o4 + 2] = a;
                    this.Colors.Count++
                }
            }
        });
    }

    /** 原始头发数据分组数据。 */
    public HairFilters: {
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
    public VerticesGroups: HairGroupsProvider["Vertices"][];
    /** 发缕顶点坐标数据。 */
    public Vertices: {
        Count: number;
        Array: number[];
    };

    /** 各组发缕顶点颜色数据。 */
    public ColorsGroups: HairGroupsProvider["Colors"][];
    /** 发缕顶点颜色数据。 */
    public Colors: {
        Count: number;
        Array: number[];
    };
}
