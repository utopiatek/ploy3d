import * as Miaoverse from "../mod.js";
/** 网格资源实例。 */
export declare class Mesh extends Miaoverse.Resource<Mesh> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
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
    /** 内核实现。 */
    private _impl;
    /** 顶点缓存数组。 */
    private _vertices;
    /** 索引缓存数组。 */
    private _triangles;
}
/** 网格资源内核实现。 */
export declare class Mesh_kernel extends Miaoverse.Base_kernel<Mesh, typeof Mesh_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 装载网格资源。
     * @param uri 网格资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回网格资源实例。
     */
    Load(uri: string, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.Mesh>;
    /**
     * 运行时创建网格资源实例。
     * @param asset 网格资源描述符。
     * @param pkg 当前资源包注册信息。
     * @returns 返回网格资源实例。
     */
    Create(asset: Asset_mesh, pkg?: Miaoverse.PackageReg): Promise<Miaoverse.Mesh>;
    /**
     * 实例化网格资源。
     * @param data_ptr 网格数据指针。
     * @param data_size 网格数据大小。
     * @param uuid 网格资源UUID。
     * @returns 返回网格资源实例。
     */
    Instance(data_ptr: Miaoverse.io_ptr, data_size: number, uuid?: string): Miaoverse.Mesh;
    /**
     * 从网格几何数据对象构建网格资源文件数据。
     * @param data 网格几何数据对象。
     * @returns 返回网格资源文件数据大小和数据指针。
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
     * @returns 返回网格几何数据对象。
     */
    protected MakeGrid(desc: {
        /** 格栅边长。 */
        size: number;
        /** 划分格子数（偶数）。 */
        divisions: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0];
    /**
     * 构建立方体网格。
     * @param desc 立方体网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeBox(desc: {
        /** 立方体宽度。 */
        width: number;
        /** 立方体高度。 */
        height: number;
        /** 立方体深度。 */
        depth: number;
        /** 立方体宽度分段数。 */
        widthSegments: number;
        /** 立方体高度分段数。 */
        heightSegments: number;
        /** 立方体深度分段数。 */
        depthSegments: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0];
    /**
     * 构建球体网格。
     * @param desc 球体网格描述。
     * @returns 返回网格几何数据对象。
     */
    protected MakeSphere(desc: {
        radius: number;
        widthSegments: number;
        heightSegments: number;
        phiStart: number;
        phiLength: number;
        thetaStart: number;
        thetaLength: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0];
    /**
     * 构建圆柱体网格。
     * @param desc 圆柱体网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeCylinder(desc: {
        /** 顶面半径。 */
        radiusTop: number;
        /** 底面半径。 */
        radiusBottom: number;
        /** 圆柱高度。 */
        height: number;
        /** 径向分段数。 */
        radialSegments: number;
        /** 高度分段数。 */
        heightSegments: number;
        /** 是否开口（删除顶面和底面）。 */
        openEnded: boolean;
        /** 径面起始弧度。 */
        thetaStart: number;
        /** 镜面弧长（2Π封闭）。 */
        thetaLength: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0];
    /**
     * 构建LOD瓦片网格。
     * @param desc LOD瓦片网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeLodTile(desc: {
        /** 平面宽度。 */
        width: number;
        /** 平面高度。 */
        height: number;
        /** 平面宽度分段数（偶数）。 */
        widthSegments: number;
        /** 平面高度分段数（偶数）。 */
        heightSegments: number;
        /** 是否翻转面朝向。 */
        flipFace?: boolean;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0];
    /**
     * 构建LOD平面网格。
     * @param desc LOD平面网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeLodPlane(desc: {
        levels: number;
        segments: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0];
    /**
     * 实例化网格资源内核实例。
     * @param data 网格资源文件数据指针。
     * @returns 返回网格资源内核实例指针。
     */
    protected _Create: (data: Miaoverse.io_ptr) => Miaoverse.io_ptr;
    /**
     * 创建网格资源文件数据。
     * @param geo 网格几何数据指针（数据布局结构请查阅MakeGeometry代码）。
     * @returns 返回网格资源文件数据大小和数据指针。
     */
    protected _CreateData: (geo: Miaoverse.io_ptr) => [number, Miaoverse.io_ptr];
    /**
     * 解压CTM网格数据。
     * @param ctmData CTM数据指针。
     * @returns 返回网格几何数据大小和网格几何数据指针。
     */
    protected _DecodeCTM: (ctmData: Miaoverse.io_ptr) => [number, Miaoverse.io_ptr];
}
/** 几何UV数据内核实现。 */
export declare class UVSet_kernel extends Miaoverse.Base_kernel<any, typeof UVSet_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
}
/** 几何数据内核实现。 */
export declare class Geometry_kernel extends Miaoverse.Base_kernel<any, typeof Geometry_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
}
/** 网格变形数据内核实现。 */
export declare class Morph_kernel extends Miaoverse.Base_kernel<any, typeof Morph_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
}
/** 网格资源内核实现的数据结构成员列表。 */
export declare const Mesh_member_index: {
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
/** 几何UV数据内核实现的数据结构成员列表。 */
export declare const UVSet_member_index: {
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
/** 几何数据内核实现的数据结构成员列表。 */
export declare const Geometry_member_index: {
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
/** 网格变形数据内核实现的数据结构成员列表。 */
export declare const Morph_member_index: {
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
/** 网格资源描述符。 */
export interface Asset_mesh extends Miaoverse.Asset {
    /** 网格几何数据构建器。 */
    creater?: Asset_mesh_creater;
    /** 网格数据URI（集合了ASSET_MESH_GEOMETRY、ASSET_MESH_UVSET、ASSET_SKIN等数据）。 */
    meshdata?: string;
}
/** 网格几何数据构建器。 */
export interface Asset_mesh_creater {
    type: "grid" | "box" | "sphere" | "cylinder" | "lod_tile" | "lod_plane";
    grid?: Parameters<Mesh_kernel["MakeGrid"]>[0];
    box?: Parameters<Mesh_kernel["MakeBox"]>[0];
    sphere?: Parameters<Mesh_kernel["MakeSphere"]>[0];
    cylinder?: Parameters<Mesh_kernel["MakeCylinder"]>[0];
    lod_tile?: Parameters<Mesh_kernel["MakeLodTile"]>[0];
    lod_plane?: Parameters<Mesh_kernel["MakeLodPlane"]>[0];
}
