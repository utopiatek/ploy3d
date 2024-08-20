import type * as Miaoverse from "../mod.js";
import type { Miaoworker } from './worker.js';
/** DAZ资产管理器。 */
export declare class Resources_daz {
    /**
     * 构造函数。
     * @param _worker 事务处理器对象。
     */
    constructor(_worker: Miaoworker);
    /**
     * 装载DAZ资源文件。
     * @param path DAZ资源文件路径。
     * @param progress 进度刷新方法。
     * @returns 返回资源包。
     */
    Load(path: string, progress: (rate: number, msg: string) => void): Promise<{
        /** DAZ文件路径。 */
        path: string;
        /** 资源包UUID。 */
        uuid: string;
        /** 资源包键。 */
        key: string;
        /** 资源包注册数据。 */
        pkg: Miaoverse.PackageReg;
        /** 资源包资源文件数据缓存（使用文件相对路径索引）。 */
        files?: Record<string, any>;
        /** DAZ原数据条目ID转资产UUID映射。 */
        uuidLut: Record<string, any>;
        /** DAZ节点库。 */
        nodeLib: {
            lut: Record<string, Daz_node>;
            list: string[];
        };
    }>;
    /**
     * 装载DAZ贴图文件。
     * @param path
     * @returns
     */
    Load_texture(path: string): Promise<string>;
    /**
     * 导入DAZ资源文件。
     * @param path DAZ资源文件路径。
     * @param progress 进度刷新方法。
     * @returns 返回资源包。
     */
    private Import;
    /**
     * DAZ欧拉角旋转序转PLOY3D欧拉角旋转序。
     */
    EulerOrder(name: string): 12 | 21 | 102 | 120 | 210 | 201;
    /** 事务处理器。 */
    private _worker;
    /** DAZ文件缓存（使用路径查找）。*/
    private _cache;
    /** 最新导入的DAZ文件缓存列表。*/
    private _news;
}
/** DAZ导入器。 */
export declare class Importer_daz {
    /**
     * 构造函数。
     * @param _resources DAZ资产管理器。
     * @param _path DAZ文件路径。
     * @param _data DAZ文件数据对象。
     */
    constructor(_resources: Resources_daz, _path: string, _data: daz_asset);
    /**
     * 装载DAZ资源。
     */
    Load(): Promise<{
        /** DAZ文件路径。 */
        path: string;
        /** 资源包UUID。 */
        uuid: string;
        /** 资源包键。 */
        key: string;
        /** 资源包注册数据。 */
        pkg: Miaoverse.PackageReg;
        /** 资源包资源文件数据缓存（使用文件相对路径索引）。 */
        files?: Record<string, any>;
        /** DAZ原数据条目ID转资产UUID映射。 */
        uuidLut: Record<string, any>;
        /** DAZ节点库。 */
        nodeLib: {
            lut: Record<string, Daz_node>;
            list: string[];
        };
    }>;
    /**
     * 加载几何数据。
     * @param geometry
     * @returns
     */
    private Load_geometry_library;
    /**
     * 加载几何数据。
     * @param geometry
     * @returns
     */
    private Load_geometry;
    /**
     * 加载几何UV数据。
     * @param geometry
     * @returns
     */
    private Load_uv_set_library;
    /**
     * 加载几何UV数据。
     * @param uv_set
     * @returns
     */
    private Load_uv_set;
    /**
     * 装载材质库。
     * @returns
     */
    private Load_material_library;
    /**
     * 装载材质属性。
     * @param entry
     * @returns
     */
    private Load_material_properties;
    /**
     * 装载场景节点。
     * @returns
     */
    private Load_nodes;
    /**
     * 构建节点实例批次数据。
     * @param url 源节点URL。
     * @param instanceList 节点实例列表。
     */
    private Instance_node;
    /**
     * 加载DAZ节点库。
     * @returns
     */
    private Load_node_library;
    /**
     * 加载节点变换组件数据。
     * @param node
     * @returns
     */
    private Load_node_transform;
    /**
     * 加载骨骼蒙皮数据和变形数据。
     */
    private Load_modifier_library;
    /**
     * 加载骨骼蒙皮数据。
     * @param skin
     */
    private Load_skeleton_skin;
    /**
     * 加载网格变形数据。
     * @param morph
     * @returns
     */
    private Load_morph;
    /**
     * 获取引用资源。
     * @param url 资源URL。
     * @param type 资源类型：0-其它资源，1-节点资源。
     * @returns
     */
    private GetReference;
    /** DAZ资产管理器。 */
    private _resources;
    /** DAZ文件数据对象。 */
    private _data;
    /** DAZ文件转资源包数据缓存。 */
    private _cache;
}
/** DAZ节点数据。 */
export interface Daz_node {
    /** 节点编号。 */
    index: number;
    /** 节点层级深度。 */
    depth: number;
    /** 节点ID。 */
    id: string;
    /** 节点名称。 */
    name: string;
    /** 对象层标识（用于过滤筛选对象，默认1）。 */
    layers: number;
    /** 父节点ID。 */
    parent: string;
    /** 骨骼初始变换。 */
    bone_init?: Miaoverse.Asset_prefab["transforms"][0]["bone_init"];
    /** 骨骼控制参数。 */
    bone_ctrl?: Miaoverse.Asset_prefab["transforms"][0]["bone_ctrl"];
}
/** DAZ资产（文件）。 */
interface daz_asset {
    /** 文件格式版本（major.minor.revision）。 */
    file_version: string;
    /** DAZ资产信息。 */
    asset_info: {
        /** 资产ID，资产文件相对路径。 */
        id: string;
        /** 资产类型，提示如何解析该文件。 */
        type?: "figure" | "modifier";
        /** 贡献者信息。 */
        contributor: {
            /** 作者。 */
            author: string;
            /** 邮箱。 */
            email?: string;
            /** 网站。 */
            website?: string;
        };
        /** 资产修订版本（默认1.0）。 */
        revision: string;
        /** 当前修订版本时间。 */
        modified?: string;
    };
    /** 几何资产数组。 */
    geometry_library?: daz_geometry[];
    /** UV集资产数组。 */
    uv_set_library?: daz_uv_set[];
    /** 修饰符资产数组。 */
    modifier_library?: daz_modifier[];
    /** 材质资产数组。 */
    material_library?: daz_material[];
    /** 图像资产数组。 */
    image_library?: daz_image[];
    /** 场景节点资产数组。 */
    node_library?: daz_node[];
    /** 一个场景对象，用于实例化和配置要添加到当前场景的资产。 */
    scene?: daz_scene;
}
/** DAZ几何资产条目。 */
interface daz_geometry {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 网格类型（默认polygon_mesh）。 */
    type?: "polygon_mesh" | "subdivision_surface";
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** 网格类型为subdivision_surface时，在细分期间要执行的边插值的类型（默认no_interpolation）。 */
    edge_interpolation_mode?: "no_interpolation" | "edges_and_corners" | "edges_only";
    /** 网格顶点数组。 */
    vertices: daz_float3_array;
    /** 网格面元分组名称数组。 */
    polygon_groups: daz_string_array;
    /** 网格材质分组名称数组。 */
    polygon_material_groups: daz_string_array;
    /** 多边形索引信息（[polygon_group、polygon_material_group、vert0、vert1、vert2、vert3?]）。 */
    polylist: {
        count: daz_int;
        values: [daz_int, daz_int, daz_int, daz_int, daz_int, daz_int?][];
    };
    /** 网格默认UV集的URI。 */
    default_uv_set?: string;
    /** 区域层级结构。 */
    root_region?: {
        /** 当前区域在区域层级结构中的唯一编号。 */
        id: string;
        /** 用户可理解的外部标签。 */
        label?: string;
        /** 特定于应用程序的区域显示提示。 */
        display_hint?: "cards_on" | "cards_off" | string;
        /** 属于该区域的所有面的索引。 */
        map?: daz_int_array;
        /** 子区域的数组（如果区域包含map属性，则为叶节点。如果包含子区域则为组节点，不包含map属性）。 */
        children?: daz_geometry["root_region"];
    };
    /** 几何移植信息对象。 */
    graft?: {
        /** 目标几何中应存在的顶点数。 */
        vertex_count: daz_int;
        /** 目标几何中应存在的面数。 */
        poly_count: daz_int;
        /** 几何移植时的顶点映射数组（源顶点索引、目标顶点索引）。 */
        vertex_pairs: daz_int2_array;
        /** 应隐藏的目标几何图形上的面索引数组。 */
        hidden_polys: daz_int_array;
    };
    /** 几何刚性数据。 */
    rigidity?: {
        /** 刚度权重映射。 */
        weights?: daz_float_indexed_array;
        /** 刚性数据组。 */
        groups: {
            /** 当前文件范围内的唯一ID。 */
            id: string;
            /** 旋转模式（默认none）。 */
            rotation_mode?: "none" | "full" | "primary" | "secondary";
            /** 每个轴的缩放模式。 */
            scale_modes: ("none" | "primary" | "secondary" | "secondary")[];
            /** 参考几何中顶点的顶点索引数组。 */
            reference_vertices?: daz_int_array;
            /** 刚性掩码的顶点索引数组。 */
            mask_vertices?: daz_int_array;
            /** 参考节点的URI。 */
            reference?: string;
            /** 计算刚性几何图形的变换时使用的节点URI数组。 */
            transform_nodes?: string[];
        }[];
    };
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}
/** DAZ纹理坐标集资产。*/
interface daz_uv_set {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称（同级唯一，优先于ID用于查找）。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** UV集应用到的几何图形中预期包含的顶点数。 */
    vertex_count: daz_int;
    /**
     * UV数据。
     * 多个面元共享顶点，虽然顶点坐标相同，但顶点UV可能不同，因此UV数量要大于顶点坐标数量。
     * 渲染时需要基于顶点UV的数量来构建顶点缓存，并且修改某些面源的某个顶点索引为UV索引，同时复制一份顶点坐标过来。
     */
    uvs: daz_float2_array;
    /** 图元顶点索引替换信息数组（polygon_index、polygon_vertex_index、uv_index）。 */
    polygon_vertex_indices?: [daz_int, daz_int, daz_int][];
}
/** DAZ变形、外观绑定、通道或应用程序定义的修饰符类型。 */
interface daz_modifier {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称（同级唯一，优先于ID用于查找）。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** 父修饰符URI，父修饰符须先于子修饰符定义。 */
    parent?: string;
    /** 用于描述如何向用户呈现资产的信息和图像。 */
    presentation?: daz_presentation;
    /** 参数控制通道。 */
    channel?: daz_channel;
    /** 修饰符应应用的区域。 */
    region?: daz_geometry["root_region"];
    /** 修改器分组（目录）。 */
    group?: string;
    /** 给定属性操作时的参数作用公式。 */
    formulas?: any[];
    /** MORPH变形数据。 */
    morph?: daz_modifier_morph;
    /** 蒙皮绑定数据。 */
    skin?: daz_modifier_skin_binding;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}
/** DAZ网格变形数据。 */
interface daz_modifier_morph {
    /** 目标几何图形中预期的顶点数。 */
    vertex_count: daz_int;
    /** 形态增量数据（第1个值为顶点索引）。 */
    deltas: daz_float3_indexed_array;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}
/** DAZ蒙皮绑定数据。 */
interface daz_modifier_skin_binding {
    /** 要绑定到的根节点URI。 */
    node: string;
    /** 要绑定到的几何体URI。 */
    geometry: string;
    /** 网格几何体中预期的顶点数。 */
    vertex_count: daz_int;
    /** 骨骼蒙皮绑定数组。 */
    joints?: {
        /** 当前文件范围内唯一ID。 */
        id: string;
        /** 关节节点的URI。 */
        node: string;
        /** 该关节影响的顶点索引和权重。 */
        node_weights?: daz_float_indexed_array;
        /** 该关节影响的顶点索引和缩放权重。 */
        scale_weights?: daz_float_indexed_array;
        /** 该关节影响的顶点索引和局部权重。 */
        local_weights?: {
            x?: daz_float_indexed_array;
            y?: daz_float_indexed_array;
            z?: daz_float_indexed_array;
        };
        /** 该关节影响的顶点索引和凸起权重。 */
        bulge_weights?: {
            x?: {
                /** 4个加权因子（positive-left, positive-right, negative-left, negative-right）。 */
                bulges: [daz_channel_float, daz_channel_float, daz_channel_float, daz_channel_float];
                /** 该关节影响的顶点索引和凸起权重1。 */
                left_map: daz_float_indexed_array;
                /** 该关节影响的顶点索引和凸起权重2。 */
                right_map: daz_float_indexed_array;
            };
            y?: daz_modifier_skin_binding["joints"][0]["bulge_weights"]["x"];
            z?: daz_modifier_skin_binding["joints"][0]["bulge_weights"]["x"];
        };
    }[];
    /** 网格几何体上面元分组和节点的映射关系。 */
    selection_sets?: {
        /** 在selection_sets中的唯一ID。 */
        id: string;
        /** 映射关系（face group name, node name）。 */
        mappings: [string, string][];
    }[];
}
/** DAZ材质资产。 */
interface daz_material {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称。 */
    name?: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** UV集URI。 */
    uv_set?: string;
    /** 应用程序要使用的着色器类型的提示（glass, metal, plastic, skin）。 */
    type?: string;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
    diffuse?: daz_channel_prop;
    diffuse_strength?: daz_channel_prop;
    specular?: daz_channel_prop;
    specular_strength?: daz_channel_prop;
    glossiness?: daz_channel_prop;
    ambient?: daz_channel_prop;
    ambient_strength?: daz_channel_prop;
    reflection?: daz_channel_prop;
    reflection_strength?: daz_channel_prop;
    refraction?: daz_channel_prop;
    refraction_strength?: daz_channel_prop;
    ior?: daz_channel_prop;
    bump?: daz_channel_prop;
    bump_min?: daz_channel_prop;
    bump_max?: daz_channel_prop;
    displacement?: daz_channel_prop;
    displacement_min?: daz_channel_prop;
    displacement_max?: daz_channel_prop;
    transparency?: daz_channel_prop;
    normal?: daz_channel_prop;
    u_offset?: daz_channel_prop;
    u_scale?: daz_channel_prop;
    v_offfset?: daz_channel_prop;
    v_scale?: daz_channel_prop;
}
/** DAZ图像资产。 */
interface daz_image {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称。 */
    name: string;
    /** 派生此资产的源资产URI。 */
    source?: string;
    /** 表示图像灰度系数的浮点数（小于或等于0则由程序计算出）。 */
    map_gamma?: daz_float;
    /** 组合映射时的首选图像大小。 */
    map_size?: daz_int;
    /**
     * 图像混合堆栈（第一个为最底层）。
     * DAZ定义可与堆栈中的其他图像映射合成以定义单个输出映射的图像映射。
     * PLOY3D当前仅支持第一个图层。
     */
    map: {
        /** 图片URI。 */
        url?: string;
        /** 用户可理解的外部标签。 */
        label?: string;
        /** 当前图层是否起作用。 */
        active?: boolean;
        /** 图层颜色。 */
        color?: daz_float3;
        /** 图层不透明度（1表示不透明）。 */
        transparency?: daz_float;
        /** 是否反转图层颜色。 */
        invert?: boolean;
        /** 图层绕中心旋转（度）。 */
        rotation?: daz_float;
        /** 图层是否水平镜像。 */
        xmirror?: boolean;
        /** 图层是否垂直镜像。 */
        ymirror?: boolean;
        /** 图层水平缩放比例。 */
        xscale?: daz_float;
        /** 图层垂直缩放比例。 */
        yscale?: daz_float;
        /** 图层水平规范化偏移。 */
        xoffset?: daz_float;
        /** 图层垂直规范化偏移。 */
        yoffset?: daz_float;
        /** 图层混合操作类型。 */
        operation?: "add";
    }[];
}
/** DAZ节点（变换矩阵计算方式：http://docs.daz3d.com/doku.php/public/dson_spec/object_definitions/node/start）。 */
interface daz_node {
    /** 当前文件范围内此资产的唯一ID。 */
    id: string;
    /** 内部名称（同级唯一，优先于ID用于查找）。 */
    name: string;
    /** ID别名列表。 */
    id_aliases?: string[];
    /** 内部名称别名列表。 */
    name_aliases?: string[];
    /** 节点类型（默认node。figure为场景根节点）。 */
    type?: "node" | "bone" | "figure" | "camera" | "light";
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 派生此节点的源节点URI。 */
    source?: string;
    /** 父节点URI，父节点须先于子节点定义。 */
    parent?: string;
    /** 当使用基于通道的动画数据时采用的旋转顺序（默认XYZ）。 */
    rotation_order?: "XYZ" | "YZX" | "ZYX" | "ZXY" | "XZY" | "YXZ";
    /** 是否累积父级的缩放（通常为真，具有父骨骼的骨骼除外。可单独缩放骨骼所影响顶点）。 */
    inherits_scale?: boolean;
    /** 坐标系参考中心点（子空间的origin_point位于父空间的center_point）。 */
    center_point?: daz_channel_vector;
    /** 骨骼端点，位于骨骼的末端，连接到另一个骨骼或终止。 */
    end_point?: daz_channel_vector;
    /** 旋转、缩放操作的参考轴向（orientation * (rotation | scale) * inv(orientation)）。 */
    orientation?: daz_channel_vector;
    /** 节点相对orientation轴向欧拉角旋转（默认[0, 0, 0]）。 */
    rotation?: daz_channel_vector;
    /** 节点相对center_point平移（默认[0, 0, 0]）。 */
    translation?: daz_channel_vector;
    /** 节点相对orientation轴向缩放（默认[1, 1, 1]）。 */
    scale?: daz_channel_vector;
    /** 节点整体缩放（默认1，scale * general_scale）。 */
    general_scale?: daz_channel_float;
    /** 用于描述如何向用户呈现资产的信息和图像。 */
    presentation?: daz_presentation;
    /** 给定属性操作时的参数作用公式。 */
    formulas?: any[];
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}
/** DAZ场景。 */
interface daz_scene {
    /** 用于描述如何向用户呈现资产的信息和图像。 */
    presentation?: daz_presentation;
    /** 节点实例化数组（按定义顺序进行实例化，父级应先于子级实例化，如果给定节点已经实例化则跳过。给定节点及其所有后代都被实例化，即不仅仅是单个节点，除非它没有子节点）。 */
    nodes?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该实例的资产URI（资产节点的子级也被构造）。 */
        url: string;
        /** 父级节点URI（父级须先于子级构造，应该是另一个节点的实例ID）。 */
        parent?: string;
        /** 父级节点URI，附加时保持世界坐标不变。 */
        parent_in_place?: boolean;
        /** 跟随当前场景中另一节点的URI。 */
        conform_target?: string;
        /** 节点网格几何体实例。 */
        geometries?: ({
            /** 当前文件范围内此资产的唯一ID。 */
            id: string;
            /** 用于构造该节点实例的资产URI。 */
            url: string;
        } & daz_geometry)[];
        /** 在找不到节点网格几何体时用作替身的预览对象。 */
        preview?: {
            /** 定义替身项的边界框的包围盒参数（轴对齐）。 */
            oriented_box?: {
                /** 包围盒最小坐标。 */
                min?: daz_float3;
                /** 包围盒最大坐标。 */
                max?: daz_float3;
            };
            /** 节点几何体的中心坐标。 */
            center_point?: daz_float3;
            /** 替身对象的终点。 */
            end_point?: daz_float3;
            /** 预览该替身包围盒时要使用的旋转顺序（默认XYZ。PLOY3D使用Y-X-Z的内旋顺序）。 */
            rotation_order?: "XYZ" | "YZX" | "ZYX" | "ZXY" | "XZY" | "YXZ";
        };
    } & daz_node)[];
    /** 场景UV集列表。 */
    uvs?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该节点实例的资产URI。 */
        url: string;
        /** UV集应附加到的几何图形的URI。 */
        parent: string;
    } & daz_uv_set)[];
    /** 场景修饰符列表。 */
    modifiers?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该节点实例的资产URI。 */
        url: string;
        /** 此修饰符实例影响的节点或元素的URI。 */
        parent: string;
    } & daz_modifier)[];
    /** 场景材质列表。 */
    materials?: ({
        /** 当前文件范围内此资产的唯一ID。 */
        id: string;
        /** 用于构造该节点实例的资产URI。 */
        url: string;
        /** 应用到几何URI。 */
        geometry: string;
        /** 应用到几何材质组。 */
        groups: string[];
    } & daz_material)[];
    /** 场景动画轨道列表。 */
    animations?: {
        /** 动画所驱动目标通道的URI。 */
        url: string;
        /** 时间/值对的数组。 */
        keys: [
            daz_float,
            /*时间戳*/ number | number[],
            [
                string,
                number?,
                number?,
                number?,
                number?
            ]?
        ][];
    }[];
    /** 场景中用作当前相机的节点实例的URI。 */
    current_camera?: string;
    /** 其它特定于应用程序的信息对象数组。 */
    extra?: any[];
}
type daz_int = number;
type daz_float = number;
type daz_int2 = [number, number];
type daz_float2 = [number, number];
type daz_float3 = [number, number, number];
type daz_float_indexed = [daz_int, daz_float];
type daz_float3_indexed = [daz_int, daz_float, daz_float, daz_float];
type daz_string_array = {
    count: daz_int;
    values: string[];
};
type daz_int_array = {
    count: daz_int;
    values: daz_int[];
};
type daz_int2_array = {
    count: daz_int;
    values: daz_int2[];
};
type daz_float2_array = {
    count: daz_int;
    values: daz_float2[];
};
type daz_float3_array = {
    count: daz_int;
    values: daz_float3[];
};
type daz_float_indexed_array = {
    count: daz_int;
    values: daz_float_indexed[];
};
type daz_float3_indexed_array = {
    count: daz_int;
    values: daz_float3_indexed[];
};
type daz_channel_vector = daz_channel_float[];
/** DAZ浮点型参数通道。 */
interface daz_channel_float extends daz_channel {
    /** 默认值（默认0.0）。 */
    value?: number;
    /** 当前值（默认0.0）。 */
    current_value?: number;
    /** 最小值（默认0.0）。 */
    min?: number;
    /** 最大值（默认1.0）。 */
    max?: number;
    /** 是否强制约束在最大最小值之间（默认false）。 */
    clamped?: boolean;
    /** 是否应以百分比的形式向用户显示（默认false）。 */
    display_as_percent?: boolean;
    /** 通过UI控制参数时，修改的步进大小。 */
    step_size?: daz_float;
    /** 是否可映射（默认false）。 */
    mappable?: boolean;
}
/** DAZ材质属性通道。 */
interface daz_channel_prop {
    /** 属性通道。 */
    channel?: daz_channel;
    /** 属性分组（目录）。 */
    group?: string;
    /** RGB颜色。 */
    color?: daz_float3;
    /** 强度（[0, 1]）。 */
    strength?: daz_float;
    /** 图像文件URI（如果存在，在颜色或强度要乘图像颜色。颜色和强度至少存在1个）。 */
    image?: string;
}
/** DAZ参数通道。 */
interface daz_channel {
    /** 包含对象范围内的唯一ID。 */
    id: string;
    /** 数据类型（默认float）。 */
    type: "alias" | "bool" | "color" | "enum" | "float" | "image" | "int" | "string";
    /** 内部名称。 */
    name: string;
    /** 用户可理解的外部标签。 */
    label?: string;
    /** 是否在UI中显示参数（默认true）。 */
    visible?: boolean;
    /** 是否禁止修改参数（默认false）。 */
    locked?: boolean;
    /** 在匹配期间，通道是否应当自动链接到相应的通道上（默认false）。 */
    auto_follow?: boolean;
}
/** DAZ用于描述如何向用户呈现资产的信息和图像。 */
interface daz_presentation {
    /** 内容类型（目录）。 */
    type: string;
    /** 用户可理解的外部标签。 */
    label: string;
    /** 描述语句。 */
    description: string;
    /** 大图标URL（132 x 176）。 */
    icon_large: string;
    /** 小图标URL（132 x 176）。 */
    icon_small?: string;
    /** 与图标颜色兼容的两种RGB颜色。 */
    colors: daz_float3[];
}
export {};
