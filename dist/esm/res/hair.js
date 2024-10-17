import * as Miaoverse from "../mod.js";
export class PhysicsHair extends Miaoverse.Resource {
}
export class PhysicsHair_kernel extends Miaoverse.Base_kernel {
}
export class HairSettings {
    StandsSettings;
}
class HairStandsSettings {
    constructor(settings) {
        this.Provider = new HairGeometryImporter(settings.geometry);
    }
    Provider;
}
class HairGeometryImporter {
    constructor(settings) {
        this.HairGroupsProvider = new HairGroupsProvider(settings.groups);
    }
    Process(_global) {
        const worldToObject = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        this.HairGroupsProvider.Process(_global, worldToObject);
    }
    HairGroupsProvider;
}
class HairGroupsProvider {
    constructor(filters) {
        this.HairFilters = filters;
    }
    Process(_global, worldToObject) {
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
                    Array: [],
                };
                const colors = this.ColorsGroups[f] = {
                    Count: 0,
                    Array: [],
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
                    this.Colors.Count++;
                }
            }
        });
    }
    HairFilters;
    VerticesGroups;
    Vertices;
    ColorsGroups;
    Colors;
}
