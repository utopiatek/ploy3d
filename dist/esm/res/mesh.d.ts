import * as Miaoverse from "../mod.js";
/** 网格资源。 */
export declare class Mesh extends Miaoverse.Resource<Mesh> {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     * @param ptr 实例内部指针。
     * @param id 实例ID。
     */
    constructor(impl: Mesh_kernel, ptr: Miaoverse.io_ptr, id: number);
    /** 顶点缓存数组布局（组合标记）。 */
    get vbLayout(): number;
    /** 顶点缓存数量。 */
    get vbCount(): number;
    /** 索引缓存格式：2 | 4。 */
    get ibFormat(): number;
    /** 索引缓存数量（子网格数量）。 */
    get ibCount(): number;
    /** 网格顶点数量。 */
    get vCount(): number;
    /** 网格索引数量。 */
    get iCount(): number;
    /** 包围盒中心。 */
    get center(): ArrayLike<number>;
    /** 包围盒范围。 */
    get extents(): ArrayLike<number>;
    /** 蒙皮方法（0-默认，1-三角形混合蒙皮"TriAx"）。 */
    get skinMethod(): number;
    /** 顶点缓存数组指针。 */
    get ptrVB(): Miaoverse.io_ptr;
    /** 索引缓存数组指针。 */
    get ptrIB(): Miaoverse.io_ptr;
    /** 网格数据指针。 */
    get ptrData(): Miaoverse.io_ptr;
    /** 顶点缓存数组。 */
    get vertices(): {
        /** 缓存序号。 */
        index: number;
        /** 缓存数据布局。 */
        layout: number;
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }[];
    /** 索引缓存数组。 */
    get triangles(): {
        /** 缓存序号。 */
        index: number;
        /** 图元类型。 */
        topology: number;
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }[];
    /** 网格资源内核实现。 */
    private _impl;
    /** 顶点缓存数组。 */
    private _vertices;
    /** 索引缓存数组。 */
    private _triangles;
}
/** 网格资源（192+字节）。 */
export declare class Mesh_kernel {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建网格资源实例。
     * @param asset 网格资源描述符。
     * @returns 异步返回网格资源实例。
     */
    Create(asset: Asset_mesh): Miaoverse.Mesh;
    /**
     * 根据内核对象指针获取对象实例。
     * @param self 内核对象指针。
     * @returns 返回对象实例。
     */
    GetInstanceByPtr(ptr: Miaoverse.io_ptr): Miaoverse.Mesh;
    /**
     * 根据实例ID获取对象实例。
     * @param id 实例ID。
     * @returns 返回对象实例。
     */
    GetInstanceByID(id: number): Miaoverse.Mesh;
    /**
     * 获取内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @returns 返回对应属性值。
     */
    Get<T>(self: Miaoverse.io_ptr, key: Mesh_kernel["_members_key"]): T;
    /**
     * 设置内核对象属性值。
     * @param self 实例指针。
     * @param key 内核对象数据成员名称。
     * @param value 属性值。
     */
    Set<T>(self: Miaoverse.io_ptr, key: Mesh_kernel["_members_key"], value: any): void;
    /**
     * 从网格数据构建网格实例。
     * @param data 网格数据。
     * @returns 返回网格实例。
     */
    MakeGeometry(data: {
        /** 顶点数组。 */
        vertices: number[];
        /** 法线数组。 */
        normals: number[];
        /** 纹理坐标数组。 */
        uvs: number[];
        /** 子网格描述。 */
        groups: {
            /** 子网格图元类型。 */
            topology: Miaoverse.GLPrimitiveTopology;
            /** 子网格索引数组。 */
            indices: number[];
        }[];
    }): [number, never];
    /**
     * 构建格栅网格。
     * @param desc 格栅网格描述符。
     * @returns 返回网格数据。
     */
    private MakeGrid;
    /**
     * 构建立方体网格。
     * @param desc 立方体网格描述符。
     * @returns 返回网格数据。
     */
    private MakeBox;
    /**
     * 构建球体网格。
     * @param desc 球体网格描述。
     * @returns 返回网格数据。
     */
    private MakeSphere;
    /**
     * 构建圆柱体网格。
     * @param desc 圆柱体网格描述符。
     * @returns 返回网格数据。
     */
    private MakeCylinder;
    /**
     * 构建LOD瓦片网格。
     * @param desc LOD瓦片网格描述符。
     * @returns 返回网格数据。
     */
    private MakeLodTile;
    /**
     * 构建LOD平面网格。
     * @param desc LOD平面网格描述符。
     * @returns 返回构建异常信息。
     */
    private MakeLodPlane;
    /** 实例化网格资源实例。 */
    InstanceMesh: (data: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /** 创建网格资源。 */
    CreateMesh: (data: Miaoverse.io_ptr) => [number, Miaoverse.io_ptr];
    /** 模块实例对象。 */
    protected _global: Miaoverse.Ploy3D;
    /** 实例容器列表。 */
    protected _instanceList: Mesh[];
    /** 已分配实例查找表（通过UUID字符串）。 */
    protected _instanceLut: Record<string, Mesh>;
    /** 已分配实例数量。 */
    protected _instanceCount: number;
    /** 待空闲实例索引。 */
    protected _instanceIdle: number;
    /** 待GC列表。 */
    protected _gcList: Mesh[];
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly unloaded: Miaoverse.Kernel_member;
        readonly reserved: Miaoverse.Kernel_member;
        readonly geometryPTR: Miaoverse.Kernel_member;
        readonly geometryUUID: Miaoverse.Kernel_member;
        readonly uvPTR: Miaoverse.Kernel_member;
        readonly uvUUID: Miaoverse.Kernel_member;
        readonly skinPTR: Miaoverse.Kernel_member;
        readonly skinUUID: Miaoverse.Kernel_member;
        readonly morphPTR: Miaoverse.Kernel_member;
        readonly morphUUID: Miaoverse.Kernel_member;
        readonly vertexBufferLayout: Miaoverse.Kernel_member;
        readonly vertexBufferCount: Miaoverse.Kernel_member;
        readonly indexBufferFormat: Miaoverse.Kernel_member;
        readonly submeshCount: Miaoverse.Kernel_member;
        readonly vertexCount: Miaoverse.Kernel_member;
        readonly indexCount: Miaoverse.Kernel_member;
        readonly center: Miaoverse.Kernel_member;
        readonly extents: Miaoverse.Kernel_member;
        readonly skinMethod: Miaoverse.Kernel_member;
        readonly vertexBuffer: Miaoverse.Kernel_member;
        readonly indexBuffer: Miaoverse.Kernel_member;
        readonly meshData: Miaoverse.Kernel_member;
        readonly magic: Miaoverse.Kernel_member;
        readonly version: Miaoverse.Kernel_member;
        readonly byteSize: Miaoverse.Kernel_member;
        readonly refCount: Miaoverse.Kernel_member;
        readonly id: Miaoverse.Kernel_member;
        readonly uuid: Miaoverse.Kernel_member;
        readonly writeTS: Miaoverse.Kernel_member;
        readonly readTS: Miaoverse.Kernel_member;
        readonly last: Miaoverse.Kernel_member;
        readonly next: Miaoverse.Kernel_member;
    };
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Mesh_kernel["_members"];
}
/** 几何体UV数据（80+字节）。 */
export declare class UVSet_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly vertexCount: Miaoverse.Kernel_member;
        readonly uvCount: Miaoverse.Kernel_member;
        readonly mappingCount: Miaoverse.Kernel_member;
        readonly unloaded: Miaoverse.Kernel_member;
        readonly unused0: Miaoverse.Kernel_member;
        readonly unused1: Miaoverse.Kernel_member;
        readonly uv: Miaoverse.Kernel_member;
        readonly polygonVertexIndices: Miaoverse.Kernel_member;
        readonly magic: Miaoverse.Kernel_member;
        readonly version: Miaoverse.Kernel_member;
        readonly byteSize: Miaoverse.Kernel_member;
        readonly refCount: Miaoverse.Kernel_member;
        readonly id: Miaoverse.Kernel_member;
        readonly uuid: Miaoverse.Kernel_member;
        readonly writeTS: Miaoverse.Kernel_member;
        readonly readTS: Miaoverse.Kernel_member;
        readonly last: Miaoverse.Kernel_member;
        readonly next: Miaoverse.Kernel_member;
    };
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof UVSet_kernel["_members"];
}
/** 基础网格几何体数据（144+字节）。 */
export declare class Geometry_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly defaultUVPTR: Miaoverse.Kernel_member;
        readonly defaultUVUUID: Miaoverse.Kernel_member;
        readonly type: Miaoverse.Kernel_member;
        readonly edgeInterpolationMode: Miaoverse.Kernel_member;
        readonly vertexCount: Miaoverse.Kernel_member;
        readonly polyCount: Miaoverse.Kernel_member;
        readonly center: Miaoverse.Kernel_member;
        readonly extents: Miaoverse.Kernel_member;
        readonly vertices: Miaoverse.Kernel_member;
        readonly polylist: Miaoverse.Kernel_member;
        readonly materialGroupsNameLength: Miaoverse.Kernel_member;
        readonly polygonGroupsNameLength: Miaoverse.Kernel_member;
        readonly materialGroupsName: Miaoverse.Kernel_member;
        readonly polygonGroupsName: Miaoverse.Kernel_member;
        readonly unloaded: Miaoverse.Kernel_member;
        readonly reserved: Miaoverse.Kernel_member;
        readonly magic: Miaoverse.Kernel_member;
        readonly version: Miaoverse.Kernel_member;
        readonly byteSize: Miaoverse.Kernel_member;
        readonly refCount: Miaoverse.Kernel_member;
        readonly id: Miaoverse.Kernel_member;
        readonly uuid: Miaoverse.Kernel_member;
        readonly writeTS: Miaoverse.Kernel_member;
        readonly readTS: Miaoverse.Kernel_member;
        readonly last: Miaoverse.Kernel_member;
        readonly next: Miaoverse.Kernel_member;
    };
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Geometry_kernel["_members"];
}
/** 网格变形资源（128+字节）。 */
export declare class Morph_kernel {
    /** 内核实现的数据结构成员列表。 */
    protected _members: {
        readonly type: Miaoverse.Kernel_member;
        readonly deltasByteSize: Miaoverse.Kernel_member;
        readonly min: Miaoverse.Kernel_member;
        readonly max: Miaoverse.Kernel_member;
        readonly textureWidth: Miaoverse.Kernel_member;
        readonly vertexCount: Miaoverse.Kernel_member;
        readonly targetCount: Miaoverse.Kernel_member;
        readonly morphTargets: Miaoverse.Kernel_member;
        readonly modifyCount: Miaoverse.Kernel_member;
        readonly deltas: Miaoverse.Kernel_member;
        readonly unloaded: Miaoverse.Kernel_member;
        readonly unused3: Miaoverse.Kernel_member;
        readonly reserved: Miaoverse.Kernel_member;
        readonly magic: Miaoverse.Kernel_member;
        readonly version: Miaoverse.Kernel_member;
        readonly byteSize: Miaoverse.Kernel_member;
        readonly refCount: Miaoverse.Kernel_member;
        readonly id: Miaoverse.Kernel_member;
        readonly uuid: Miaoverse.Kernel_member;
        readonly writeTS: Miaoverse.Kernel_member;
        readonly readTS: Miaoverse.Kernel_member;
        readonly last: Miaoverse.Kernel_member;
        readonly next: Miaoverse.Kernel_member;
    };
    /** 内核实现的数据结构成员名称声明列表。 */
    protected _members_key: keyof Morph_kernel["_members"];
}
/** 网格资源。 */
export interface Asset_mesh extends Miaoverse.Asset {
    /** 网格数据构建器。 */
    creater?: Asset_mesh_creater;
}
/** 网格数据构建器。 */
export interface Asset_mesh_creater {
    type: "grid" | "box" | "sphere" | "cylinder" | "lod_tile" | "lod_plane";
    grid?: Parameters<Mesh_kernel["MakeGrid"]>[0];
    box?: Parameters<Mesh_kernel["MakeBox"]>[0];
    sphere?: Parameters<Mesh_kernel["MakeSphere"]>[0];
    cylinder?: Parameters<Mesh_kernel["MakeCylinder"]>[0];
    lod_tile?: Parameters<Mesh_kernel["MakeLodTile"]>[0];
    lod_plane?: Parameters<Mesh_kernel["MakeLodPlane"]>[0];
}
