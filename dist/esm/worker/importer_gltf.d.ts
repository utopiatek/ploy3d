import type * as Miaoverse from "../mod.js";
import type { Miaoworker } from './worker.js';
/** GLTF导入器。 */
export declare class Importer_gltf {
    /**
     * 构造函数。
     * @param _worker 事务处理器对象。
     */
    constructor(_worker: Miaoworker);
    /**
     * 装载GLTF场景数据。
     */
    Load(data: Gltf, progress: (rate: number, msg: string) => void): Promise<{
        pkg: Miaoverse.PackageReg;
        files: Record<string, any>;
    }>;
    /**
     * 异步装载所有缓存数据。
     */
    private LoadBuffers;
    /**
     * 异步请求二进制数据缓存。
     * @param uri
     * @returns
     */
    private LoadBuffer;
    /**
     * 解析所有网格数据。
     */
    private LoadMeshes;
    /**
     * 解析指定索引的网格数据。
     * @param meshIndex 网格索引。
     */
    private LoadMesh;
    /**
     * 获取顶点属性数据。
     * @param meshIndex
     * @param subIndex
     * @param name
     * @returns
     */
    private GetAttribute;
    /**
     * 获取子网格索引数据。
     * @param meshIndex
     * @param subIndex
     * @param vertexOffset
     * @returns
     */
    private GetIndices;
    /**
     * 获取数据访问器数据。
     * @param buffer
     * @param offset
     * @param type
     * @param componentType
     * @param count
     * @returns
     */
    private GetAccessorData;
    /**
     * 解析所有材质贴图属性。
     * @param progress 解析进度。
     */
    private LoadTextures;
    /**
     * 装载指定索引图像。
     * @param index 图像索引。
     */
    private LoadImage;
    /**
     * 解析所有材质定义。
     * @param getTexture 贴图属性查询方法。
     */
    private LoadMaterials;
    /**
     * 装载场景数据为预制件。
     */
    private LoadNodes;
    private LoadSkeleton;
    /** 事务处理器。 */
    private _worker;
    /** GLTF数据对象。 */
    private _data;
    /** 资源文件数据缓存（使用文件相对路径索引）。 */
    private _files_cache;
}
/** GLTF数据格式。 */
interface Gltf {
    /** 资产元数据。 */
    asset: {
        /** 资产版本号。 */
        version: string;
        /** 装载器最小版本号需求。 */
        minVersion?: string;
        /** 创建工具信息。 */
        generator?: string;
        /** 版权信息。 */
        copyright?: string;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            /** 使用压缩包加载。 */
            zip: Miaoverse.JSZip;
            /** 资产路径。 */
            path: string;
            /** 资产名称。 */
            name: string;
            /** 初始位置平移。 */
            position: number[];
            /** 初始欧拉角旋转。 */
            rotation: number[];
            /** 初始大小缩放。 */
            scale: number[];
        };
    };
    /** 默认活动场景索引。 */
    scene?: number;
    /** 场景数组。 */
    scenes?: {
        /** 场景名称。 */
        name?: string;
        /** 场景根节点索引数组。 */
        nodes?: number[];
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 节点数组。 */
    nodes?: {
        /** 节点名称。 */
        name?: string;
        /** 节点变换平移参数（默认[0,0,0]）。 */
        translation?: number[];
        /** 节点变换旋转参数（四元数，XYZ顺序，默认[0,0,0,1]）。 */
        rotation?: number[];
        /** 节点变换缩放参数（默认[1,1,1]）。 */
        scale?: number[];
        /** 节点变换矩阵参数（列主矩阵，默认[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]）。 */
        matrix?: number[];
        /** 子节点索引数据。 */
        children?: number[];
        /** 节点关联相机组件索引。 */
        camera?: number;
        /** 节点关联网格索引。 */
        mesh?: number;
        /** 节点关联网格蒙皮数据索引。 */
        skin?: number;
        /** 节点所关联网格的变形实例所用的权重数组。 */
        weights?: number[];
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            node: Miaoverse.Asset_prefab["nodes"][0];
            mesh_renderer?: Miaoverse.Asset_meshrenderer;
        };
    }[];
    /** 网格数组。 */
    meshes?: {
        /** 网格几何定义数组，每个元素表示一个子网格。 */
        primitives: {
            /** 属性名与属性数据访问器索引字典。 */
            attributes: Record<string, number>;
            /** 索引数据访问器索引。 */
            indices?: number;
            /** 图元类型，默认4。 */
            mode?: number;
            /** 材质索引。 */
            material?: number;
            /** 网格变形目标数组。 */
            targets?: any[];
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        }[];
        /** 网格名称。 */
        name?: string;
        /** 网格变形所用的权重数组。 */
        weights?: number[];
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.Asset_mesh;
    }[];
    /** 网格蒙皮数组。 */
    skins?: {
        /** 蒙皮名称。 */
        name?: string;
        /** 骨架（关节）节点索引数组。 */
        joints: number[];
        /** 根关节节点索引。 */
        skeleton?: number;
        /** 包含每个关节逆变换矩阵（逆变换旨在消除绑定时关节的初始变换，单位矩阵将表示初始姿势）数据的缓存访问器索引。 */
        inverseBindMatrices?: number;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 动画数组。 */
    animations?: {
        /** 动画名称。 */
        name?: string;
        /** 属性动画通道数组。 */
        channels: {
            /** 数据采样器索引。 */
            sampler: number;
            /** 目标属性。 */
            target: {
                /** 对象索引。 */
                node: number;
                /** 属性名称。 */
                path: string;
                /** 扩展信息。 */
                extensions?: never;
                /** 特定于应用程序的数据。 */
                extras?: never;
            };
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        }[];
        /** 动画数据采样器数组。 */
        samplers: {
            /** 样点时间戳访问器索引。 */
            input: number;
            /** 样点数据访问器索引。 */
            output: number;
            /** 样点数据插值方式：LINEAR、STEP、CUBICSPLINE。 */
            interpolation: string;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        }[];
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 材质数组。 */
    materials?: {
        /** 材质名称。 */
        name?: string;
        /** ALPHA混合模式，默认OPAQUE。 */
        alphaMode?: string;
        /** ALPHA截断阈值，默认0.5。 */
        alphaCutoff?: number;
        /** 是否双面渲染，默认否。 */
        doubleSided?: boolean;
        /** PBR参数集。 */
        pbrMetallicRoughness?: {
            /** 非金属表面的漫反射反照率，金属表面的镜面反射颜色，颜色因子，默认[1,1,1,1]。 */
            baseColorFactor?: number[];
            /** 非金属表面的漫反射反照率，金属表面的镜面反射颜色，贴图信息。 */
            baseColorTexture?: {
                /** 贴图索引。 */
                index: number;
                /** UV通道，默认0。 */
                texCoord?: number;
                /** 扩展信息。 */
                extensions?: never;
                /** 特定于应用程序的数据。 */
                extras?: never;
            };
            /** 金属度，默认值1。 */
            metallicFactor?: number;
            /** 粗糙度，默认值1。 */
            roughnessFactor?: number;
            /** 金属度粗糙度贴图信息。 */
            metallicRoughnessTexture?: {
                /** 贴图索引。 */
                index: number;
                /** UV通道，默认0。 */
                texCoord?: number;
                /** 扩展信息。 */
                extensions?: never;
                /** 特定于应用程序的数据。 */
                extras?: never;
            };
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 切线空间的法线贴图信息。 */
        normalTexture?: {
            /** 贴图索引。 */
            index: number;
            /** UV通道，默认0。 */
            texCoord?: number;
            /** 法线强度缩放，默认1。 */
            scale?: number;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 环境光遮蔽贴图信息。 */
        occlusionTexture?: {
            /** 贴图索引。 */
            index: number;
            /** UV通道，默认0。 */
            texCoord?: number;
            /** 环境光遮蔽强度缩放，默认1。 */
            strength?: number;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 自发光贴图信息。 */
        emissiveTexture?: {
            /** 贴图索引。 */
            index: number;
            /** UV通道，默认0。 */
            texCoord?: number;
            /** 扩展信息。 */
            extensions?: never;
            /** 特定于应用程序的数据。 */
            extras?: never;
        };
        /** 自发光颜色因子。 */
        emissiveFactor?: number[];
        /** 扩展信息。 */
        extensions?: any;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.Asset_material;
    }[];
    /** 数据访问器数组。 */
    accessors?: {
        /** 访问器名称。 */
        name?: string;
        /** 缓存视图索引。 */
        bufferView?: number;
        /** 数据相对缓存视图字节偏移，默认0。 */
        byteOffset?: number;
        /** 数据类型枚举。 */
        componentType: number;
        /** 整型类型数据是否归一化，默认否。 */
        normalized?: boolean;
        /** 数据数量。 */
        count: number;
        /** 数据元素是数值、向量还是矩阵。 */
        type: string;
        /** 数据元素每个通道的最大值。 */
        max?: number[];
        /** 数据元素每个通道的最小值。 */
        min?: number[];
        /** 偏离其初始化值的元素的稀疏存储。 */
        sparse?: {};
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 数据缓存视图数组。 */
    bufferViews?: {
        /** 视图名称。 */
        name?: string;
        /** 缓存索引。 */
        buffer: number;
        /** 视图数据字节偏移，默认0。 */
        byteOffset?: number;
        /** 视图数据字节大小。 */
        byteLength: number;
        /** 视图数据跨距。 */
        byteStride?: number;
        /** 视图绑定到管线槽位枚举。 */
        target?: number;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 数据缓存数组。 */
    buffers?: {
        /** 数据名称。 */
        name?: string;
        /** 数据URI。 */
        uri?: string;
        /** 数据字节大小。 */
        byteLength: number;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            buffer: ArrayBuffer;
        };
    }[];
    /** 贴图访问器数组。 */
    textures?: {
        /** 贴图名称。 */
        name?: string;
        /** 源图像索引。 */
        sampler?: number;
        /** 图像采样器索引。 */
        source?: number;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: Miaoverse.TextureNode;
    }[];
    /** 贴图源图像索引。 */
    images?: {
        /** 图像名称。 */
        name?: string;
        /** 图像URI。 */
        uri?: string;
        /** 图像数据缓存视图索引。 */
        bufferView?: number;
        /** 图像MIME（在使用bufferView的情况下必须包含该字段）。 */
        mimeType?: string;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: {
            /** 贴图文件URI（如果未设置则从UUID加载）。 */
            uri?: string;
            /** 贴图类型。 */
            mime?: string;
            /** 是否包含A通道。 */
            has_alpha?: boolean;
        };
    }[];
    /** 图像采样器数组。 */
    samplers?: {
        /** 采样器名称。 */
        name?: string;
        /** 放大过滤方法枚举。 */
        magFilter?: number;
        /** 缩小过滤方法枚举。 */
        minFilter?: number;
        /** U方向环绕模式（默认10497 REPEAT）。 */
        wrapS?: number;
        /** V方向环绕模式（默认10497 REPEAT）。 */
        wrapT?: number;
        /** 扩展信息。 */
        extensions?: never;
        /** 特定于应用程序的数据。 */
        extras?: never;
    }[];
    /** 特定于应用程序的数据。 */
    extras: never;
}
export {};
