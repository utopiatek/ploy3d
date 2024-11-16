import * as Miaoverse from "../mod.js";
/** 用户空间（本地项目空间、云端用户私有文件空间）。 */
export declare class UserSpace {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 打开用户空间。
     * @param url 用户空间结构数据URL。
     * @param user 用户代码。
     * @param version 用户空间版本（本地版本与线上版本一致才可提交，没提交一次版本做一次更新）。
     */
    Open(url: string, user: string, version: number): Promise<TreeNode>;
    /**
     * 获取文件夹路径指向的节点索引。
     * @param path 文件夹路径（不能以'/'为开头和结尾）。
     * @returns 返回节点索引。
     */
    GetFolder(path: string): TreeNode;
    /**
     * 获取下一个用于分配的资源索引。
     * @param classid 类型ID。
     * @returns 资源索引。
     */
    GetNextIdx(classid: Miaoverse.CLASSID): number;
    /**
     * 通过节点ID获取节点对象。
     * @param id 节点ID。
     * @returns 返回节点对象。
     */
    GetNode(id: string): TreeNode;
    /**
     * 获取文件节点数据。
     * @param id 文件节点ID。
     */
    GetData(id: string): Promise<string | Uint8Array>;
    /**
     * 新建节点。
     * @param classid 类型ID。
     * @param name 节点名。
     * @param path 节点存储路径。
     * @returns 返回新建节点索引。
     */
    New(classid: Miaoverse.CLASSID, name: string, path: string): TreeNode;
    /**
     * 删除节点（附带删除其所有子级）。
     * 文件节点将移入回收站（未提交到云端的数据将会丢失）。
     * 已提交的数据可以从回收站找回，未提交的数据无法再找回。
     * 清空回收站将删除云端存档。
     * @param id 节点ID。
     */
    Delete(id: string): void;
    /**
     * 重命名节点。
     * @param id 节点ID。
     * @param name 新名称。
     */
    Rename(id: string, name: string): boolean;
    /**
     * 移动节点（注意，不能往子级移动）。
     * @param id 节点ID。
     * @param parent 父级节点ID。
     */
    Move(id: string, parentId: string): void;
    /**
     * 更新文件数据。
     * @param id 节点ID。
     * @param content 新文件数据。
     */
    Update(id: string, content: any): void;
    /**
     * 暂存最新数据到本地存储器（建议定时调用）。
     */
    Store(): Promise<boolean>;
    /**
     * 提交最新数据到云端用户空间。
     * 存储库版本不同时不接受提交。注意切换另一个环境工作前，请先提交当前工作环境的工作数据。
     */
    Submit(): Promise<{
        data: {
            repo_version: number;
            idx_table: number[];
            recycle_bin: TreeNode[];
            node_list: TreeNode[];
            files: {
                /** 文件信息列表。 */
                infos: {
                    /** 文件相对路径。 */
                    path: string;
                    /** 文件字节大小。 */
                    size: number;
                    /** 文件上传签名。 */
                    sign: any;
                }[];
                /** 文件数据列表。 */
                datas: {
                    /** 文件源节点。 */
                    src: TreeNode;
                    /** 文件存储节点。 */
                    dst: TreeNode;
                    /** 文件数据。 */
                    data: string | Blob;
                }[];
                /** 总文件数量。 */
                count: number;
                /** 总字节大小。 */
                size: number;
            };
        };
        form: {
            usage: string;
            key: string;
            byte_size: number;
            file_count: number;
            files: {
                /** 文件相对路径。 */
                path: string;
                /** 文件字节大小。 */
                size: number;
                /** 文件上传签名。 */
                sign: any;
            }[];
        };
        callback: (repo_version: number) => void;
    }>;
    /**
     * 获取保存数据。
     */
    protected Save(online?: boolean): Promise<{
        repo_version: number;
        idx_table: number[];
        recycle_bin: TreeNode[];
        node_list: TreeNode[];
        files: {
            /** 文件信息列表。 */
            infos: {
                /** 文件相对路径。 */
                path: string;
                /** 文件字节大小。 */
                size: number;
                /** 文件上传签名。 */
                sign: any;
            }[];
            /** 文件数据列表。 */
            datas: {
                /** 文件源节点。 */
                src: TreeNode;
                /** 文件存储节点。 */
                dst: TreeNode;
                /** 文件数据。 */
                data: string | Blob;
            }[];
            /** 总文件数量。 */
            count: number;
            /** 总字节大小。 */
            size: number;
        };
    }>;
    /**
     * 清除对象。
     */
    Dispose(): void;
    /** 根文件夹。 */
    get root(): TreeNode;
    /** 模块实例对象。 */
    private _global;
    /** 用户代码。 */
    private _user_code;
    /** 云端地址。 */
    private _repo_url;
    /** 存储库版本。 */
    private _repo_version;
    /** 存储库是否存在更新（未提交到线上则不提升版本）。 */
    private _repo_updated;
    /** 索引分配记录。 */
    private _idx_table;
    /** 节点查找表（通过ID查找）。 */
    private _node_lut;
    /** 节点查找表（通过路径查找，用户结构空间变换后需要刷新该字典）。 */
    private _node_lut_by_loc;
    /** 文件回收站（平台仅标记文件被删除，而不会真正删除文件，始终占用用户的存储空间，直到用户点击清空回收站）。 */
    private _recycle_bin;
    /**
     * 初始化本地用户空间。
     * https://localforage.docschina.org/
     * @returns 返回用户空间结构数据。
     */
    protected InitDB(): Promise<any>;
}
/** 用户空间结构节点。 */
interface TreeNode {
    /** 文件或文件夹唯一ID（我们通过ID引用文件或文件夹，因此我们能轻易对其进行重命名、移动、删除）。 */
    id: string;
    /** 类型ID（文件夹类型ID为Miaoverse.CLASSID.INVALID）。 */
    classid: Miaoverse.CLASSID;
    /** 同类型ID索引。 */
    idx: number;
    /** 文件名或文件夹名（文件名包含后缀，重命名仅需修改该字段）。 */
    name: string;
    /** 所属文件夹ID（进行移动仅需修改该字段）。 */
    parent: string;
    /** 相对用户空间完整虚拟路径（实际上文件总是直接存储在用户空间根路径。注意，这是一个Get访问器，在运行时设置）。 */
    location?: string;
    /** 创建时间戳。 */
    created_at: number;
    /** 更新时间戳（更新时间戳不等于存档时间戳，表示数据相对云端有更新）。 */
    updated_at: number;
    /** 存档时间戳。 */
    version_at: number;
    /** 存档版本号（存档目录）。 */
    version: number;
    /** 是否为叶子节点（仅在表示文件时为真）。 */
    isLeaf: boolean;
    /** 节点类型。 */
    fileType: "File" | "Folder" | "RootFolder";
    /** 文件图标。 */
    icon?: string;
    /** 子级节点列表（运行时构建，不应保存该列表）。 */
    children?: TreeNode[];
    /** 是否已删除。 */
    deleted?: boolean;
    /** 文件内容描述。 */
    data: {
        /** 文件内容语言。 */
        language?: string;
        /** 文件内容（如果为空则加载文件最新存档）。 */
        value?: string | Uint8Array;
        /** 文件内容是否已被编辑。 */
        status?: "edited";
    };
}
export {};
