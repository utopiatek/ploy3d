import { PackageReg } from "../../dist/esm/mod.js"
import { PloyApp_editor } from "./index.js"
import { React, molecule, Header, Content, getEventPosition } from "../../lib/molecule.js"

type ITreeProps = molecule.component.ITreeProps;
type ITreeNodeItemProps<T> = molecule.component.ITreeNodeItemProps<T>;
type IActivityBarItem = molecule.model.IActivityBarItem;
type IActionBarItemProps = molecule.component.IActionBarItemProps;
type IMenuItemProps = molecule.component.IMenuItemProps;
type ISidebarPane = molecule.model.ISidebarPane;
type ICollapseItem = molecule.component.ICollapseProps["data"][0];

export class Packages implements molecule.model.IExtension {
    /**
     * 构造函数。
     * @param app 应用实例。
     */
    public constructor(app: PloyApp_editor) {
        this.app = app;
    }

    /**
     * 刷新用户资源包列表。
     */
    public async refreshMy() {
        const engine = this.app.engine;
        const res = await engine.Fetch<any>(document.location.origin + "/serv/my_packages", null, "json");
        if (res?.success) {
            const pkgs: PackageReg[] = res.data;
            for (let pkg of pkgs) {
                engine.resources.Register(pkg);
            }

            molecule.sidebar.update(this.sidebar);
        }
    }

    /**
     * 打开资源包上传面板。
     * @param key 资源包标识。
     * @returns 
     */
    public openUpload(item: Packages["imports"][0], callback: (item: Packages["imports"][0]["data"]) => void) {
        const data = item.data;
        const pkg = data.reg;
        if (!pkg || pkg.location == "store" || !this.app.userInfo) {
            return;
        }

        const onClick = (form: any) => {
            if (this.uploading) {
                return;
            }

            this.uploading = true;
            this.app.Notify("开始执行资源包上传。", "info");
            molecule.editor.updateTab(tab);

            this.doUpload(form, data)
                .then(res => {
                    if (res) {
                        const index = this.imports.findIndex((i) => { return i.name == data.key });
                        this.imports.splice(index, 1);
                        molecule.sidebar.update(this.sidebar);

                        const groupId = molecule.editor.getGroupIdByTab(tab.id);
                        molecule.editor.closeTab(tab.id, groupId);
                        this.app.Notify("资源包上传成功。", "info");
                    }
                    else {
                        this.app.Notify("资源包上传失败！", "warn");
                    }

                    this.uploading = false;
                    molecule.editor.updateTab(tab);
                    callback(res);
                })
                .catch(e => {
                    this.app.Notify(`资源包上传异常：${e}！`, "error", true);
                    this.uploading = false;
                    molecule.editor.updateTab(tab);
                    callback(null);
                });
        }

        const tab: molecule.model.IEditorTab = {
            id: data.key,
            name: "上传资源包",
            icon: "cloud-upload",
            closable: true,
            editable: false,
            status: undefined,
            breadcrumb: [{ id: 0, name: "upload" }, { id: 1, name: data.key }],
            renderPane: () => {
                return <this.renderUpload uploading={this.uploading} data={data} onClick={onClick}></this.renderUpload>;
            }
        };

        molecule.editor.open(tab);
    }

    /**
     * 执行上传操作。
     */
    public async doUpload(form: any, pkg: Packages["imports"][0]["data"]) {
        const engine = this.app.engine;

        const Upload = async () => {
            const res_ask: any = await engine.Request("POST", document.location.origin + "/serv/upload_ask", "json", JSON.stringify(form), 'application/json', null);
            if (res_ask?.success) {
                const policy = res_ask.data;
                const datas = pkg.files.datas;
                const signatures: string[] = [];

                for (let i = 0; i < policy.files.length; i++) {
                    const info = policy.files[i];
                    const data = datas[i];

                    const form = new FormData();
                    form.append("OSSAccessKeyId", policy.accessid);
                    form.append("policy", policy.policy);
                    form.append("signature", policy.signature);
                    form.append("key", policy.dir + info.path);
                    form.append("callback", policy.callback);
                    form.append("success_action_status", "200");
                    form.append("file", data);
                    form.append("x:sign", info.sign);

                    const res_upload: any = await engine.Request("POST", policy.host, "json", form, null, null);
                    if (res_upload?.success) {
                        signatures.push(res_upload.message);
                        this.app.Notify(`上传文件成功：${info.path}！`, "info");
                    }
                    else {
                        signatures.push("");
                        this.app.Notify(`上传文件失败：${info.path}，${res_upload}！`, "warn");
                    }
                }

                return { usage: "packages", upload_id: policy.upload_id as number, signatures: signatures.join() };
            }
            else {
                this.app.Notify(`上传请求失败：${res_ask.message}！`, "warn", true);
                return null;
            }
        };

        const Verify = async (info: { upload_id: number, signatures: string }) => {
            const res_verify: any = await engine.Request("POST", document.location.origin + "/serv/upload_verify", "json", JSON.stringify(info), 'application/json', null);
            if (res_verify?.success) {
                this.app.Notify(`上传验证成功。`, "info");
                return res_verify.data;
            }
            else {
                this.app.Notify(`上传验证失败：${res_verify?.message}！`, "warn", true);
                return null;
            }
        };

        const upload_res = await Upload();
        if (!upload_res) {
            return null;
        }

        const res = await Verify(upload_res);
        if (!res) {
            return null;
        }

        pkg.reg.invalid = res.invalid;
        pkg.reg.path = res.path;
        pkg.reg.zip = res.zip;
        pkg.reg.location = res.location;
        pkg.reg.private = res.private;
        pkg.reg.license = res.license;
        pkg.reg.price = res.price;
        pkg.reg.folder = res.folder;
        pkg.reg.tags = res.tags;
        pkg.reg.menu = res.menu;

        this.app.Notify(`资源包上传成功。`, "info");

        return pkg;
    }

    /**
     * 打开资源包导入操作。
     * @param file 
     * @returns 
     */
    public openImport(file: File, callback: (entry: Packages["imports"][0]) => void) {
        if (this.importing || !this.app.userInfo) {
            return;
        }

        this.importing = true;
        this.app.Notify("开始执行资源包导入。", "info");
        molecule.sidebar.update(this.sidebar);

        this.doImport(file).then(entry => {
            if (entry) {
                this.app.Notify("资源包导入成功。", "info");

            }
            else {
                this.app.Notify("资源包导入失败！", "warn");
            }

            this.importing = false;
            molecule.sidebar.update(this.sidebar);
            callback(entry);
        }).catch(e => {
            this.app.Notify(`资源包导入异常：${e}！`, "error", true);
            this.importing = false;
            molecule.sidebar.update(this.sidebar);
            callback(null);
        });
    }

    /**
     * 导入资源包。
     */
    public async doImport(file: File) {
        const engine = this.app.engine;
        const res = await engine.worker.Import_gltf_file(1, file, (rate, msg) => { console.log("import:", rate, msg); });

        engine.resources.Register(res.pkg, res.files);

        const menu = await engine.resources.Browse(res.pkg);

        await new Promise<void>((resolve) => {
            this.app.AddSnapshot(menu, resolve);
            this.app.DrawFrame(10);
        });

        // ====================------------------------------------------------

        const entry: Packages["imports"][0] = {
            id: res.pkg.uuid,
            name: res.pkg.key,
            icon: "archive",
            isLeaf: true,
            data: {
                key: res.pkg.key,
                reg: res.pkg,
                menu: (() => {
                    return {
                        thumbnail: "thumbnail.jpg",
                        thumbnail_per_row: menu.thumbnail_per_row,
                        thumbnail_row_count: menu.thumbnail_row_count,
                        list: menu.list.map((item) => {
                            return {
                                ...item,
                                thumbnail_href: null
                            };
                        }),
                    };
                })(),
                files: {
                    infos: [],
                    datas: [],
                    count: 0,
                    size: 0,
                },
            }
        };

        const files = entry.data.files;

        const meta = (() => {
            const materials = res.pkg.meta.material_library;
            for (let material of materials) {
                const textures = material.properties.textures;
                for (let key in textures) {
                    textures[key].texture = null;
                }
            }

            const str = JSON.stringify(res.pkg.meta);
            return new Blob([str]);
        })();

        files.infos.push({
            path: "package.json",
            size: meta.size,
            sign: meta
        });

        files.infos.push({
            path: "thumbnail.jpg",
            size: menu.thumbnail_blob.size,
            sign: menu.thumbnail_blob
        });

        for (let key in res.files) {
            const data: Uint8Array | string = res.files[key];

            if (typeof data == "string") {
                // 不同的操作系统使用不同的换行符
                // Unix/Linux 系统 使用 LF（换行符），编码为 0A
                // Windows 系统 使用 CR+LF（回车+换行），编码为 0D 0A
                // OSS上传会自动转为 CR+LF，为避免上传前后验证大小不一致，因此在JS端转换为CR+LF再上传
                const crlf = data.replace(/(?<!\r)\n/g, '\r\n');
                const blob = new Blob([crlf]);

                files.infos.push({
                    path: key,
                    size: blob.size,
                    sign: blob
                });
            }
            else {
                files.infos.push({
                    path: key,
                    size: data.byteLength,
                    sign: new Blob([data.buffer])
                });
            }
        }

        files.datas = files.infos.map((file) => {
            const data = file.sign;

            file.sign = null;
            files.count += 1;
            files.size += file.size;

            return data;
        });

        // ====================------------------------------------------------

        this.imports.push(entry);

        return entry;
    }

    // ========================------------------------------------------------

    /**
     * 扩展激活时调用。
     * @param extensionCtx 扩展服务上下文。
     */
    public activate(extensionCtx: molecule.IExtensionService) {
        molecule.activityBar.add(this.activityBar);
        molecule.sidebar.add(this.sidebar);
    }

    /**
     * 扩展取消激活时调用。
     * @param extensionCtx 扩展服务上下文。
     */
    public dispose(extensionCtx: molecule.IExtensionService) {
        molecule.activityBar.remove(this.activityBar.id);
        molecule.sidebar.remove(this.sidebar.id);
    }

    /**
     * 渲染扩展在侧边栏的界面。
     * @returns
     */
    public renderSidebar(props: { toolbar: IActionBarItemProps[]; collapse: ICollapseItem[]; }) {
        const { Toolbar, Collapse } = molecule.component;

        return (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Header title='资源包管理' toolbar={
                    <Toolbar data={props.toolbar} />
                } />
                <Content>
                    <Collapse activePanelKeys={['collections', 'imports']} data={props.collapse} />
                </Content>
            </div>
        )
    }

    /**
     * 渲染资源包收集列表。
     * @returns 
     */
    public renderCollections(props: { data: Packages["collections"]; contentMenu: IMenuItemProps[]; onSelect: (node: ITreeNodeItemProps<any>, isUpdate?: any) => void; }) {
        // expandKeys = { this.lastRef.expandKeys }
        // activeKey = { this.lastRef.activeKey }
        // draggable = { true}
        // onExpand = { onExpand }
        // onDropTree = { onDropTree }

        const contextView = molecule.component.useContextViewEle();
        const { Menu, Scrollbar, TreeView } = molecule.component;

        const handleRightClick: ITreeProps["onRightClick"] = (event, data) => {
            if ((event.target as HTMLElement).nodeName !== 'INPUT') {
                event.preventDefault();

                contextView.show(getEventPosition(event), () => (
                    <Menu
                        role="menu"
                        onClick={(_: any, item: any) => item.handleClick(_, item, data)}
                        data={props.contentMenu}
                    />
                ));
            }
        };

        return (
            <Scrollbar>
                <TreeView
                    data={props.data}
                    onSelect={props.onSelect}
                    onRightClick={handleRightClick}
                />
            </Scrollbar>
        )
    }

    /**
     * 渲染导入列表面板。
     * @param props 
     * @returns 
     */
    public renderImports(props: { data: Packages["collections"]; contentMenu: IMenuItemProps[]; onSelect: (node: ITreeNodeItemProps<any>, isUpdate?: any) => void; onImport: (file: File) => void; isImporting: boolean; }) {
        // expandKeys = { this.lastRef.expandKeys }
        // activeKey = { this.lastRef.activeKey }
        // draggable = { true }
        // onExpand = { onExpand }
        // onDropTree = { onDropTree }

        const contextView = molecule.component.useContextViewEle();
        const { Menu, Scrollbar, TreeView } = molecule.component;

        const handleRightClick: ITreeProps["onRightClick"] = (event, data) => {
            if ((event.target as HTMLElement).nodeName !== 'INPUT') {
                event.preventDefault();

                contextView.show(getEventPosition(event), () => (
                    <Menu
                        role="menu"
                        onClick={(_: any, item: any) => item.handleClick(_, item, data)}
                        data={props.contentMenu}
                    />
                ));
            }
        };

        return (
            <>
                <input
                    type="file"
                    id="pkg_import_input"
                    accept=".zip"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        props.onImport(e.target.files[0]);
                    }}>
                </input>

                <Scrollbar>
                    {props.isImporting ? <div>正在导入 ...</div> : <div />}

                    <TreeView
                        data={props.data}
                        onSelect={props.onSelect}
                        onRightClick={handleRightClick}
                    />
                </Scrollbar>
            </>
        )
    }

    /**
     * 资源包上传面板组件。
     * @param props 面板属性。
     * @returns 
     */
    public renderUpload(props: { uploading: boolean, data: Packages["imports"][0]["data"]; onClick: (form: any) => void; }) {
        const pkg: PackageReg = props.data.reg;

        const { key, uuid } = pkg;
        const { size, count } = props.data.files;
        const { Input, Select, Option } = molecule.component;

        const [label, setLabel] = React.useState(pkg.key.split(".")[2]);
        const [priv, setPriv] = React.useState(pkg.private || false);
        const [license, setLicense] = React.useState(pkg.license || "CC0");
        const [price, setPrice] = React.useState(pkg.price || 0);
        const [folder, setFolder] = React.useState(pkg.folder || "");
        const [tags, setTags] = React.useState(pkg.tags || "");

        const Submit = () => {
            const form = {
                usage: "packages",

                label,
                key,
                uuid,

                byte_size: size,
                file_count: count,

                private: priv,
                license,
                price,
                folder,
                tags,
                menu: props.data.menu,

                files: props.data.files.infos,
            };

            props.onClick(form);
        };

        return (
            <div style={{
                width: "50%",
                margin: "auto"
            }}>
                <div>
                    <h2>资源包上传</h2>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="名称" style={{ lineHeight: "28px" }}>名称</div>
                        <Input id="label" name="label" value={label} onChange={(e: any) => {
                            setLabel((e.target as any).value);
                        }}>
                        </Input>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="标识名" style={{ lineHeight: "28px" }}>标识名</div>
                        <Input id="key" name="key" value={key} disabled={true}>
                        </Input>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="唯一编号" style={{ lineHeight: "28px" }}>唯一编号</div>
                        <Input id="uuid" name="uuid" value={uuid} disabled={true}>
                        </Input>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="分类目录" style={{ lineHeight: "28px" }}>分类目录(最多3级:/A/B/C)</div>
                        <Input id="folder" name="folder" value={folder} onChange={(e: any) => {
                            setFolder((e.target as any).value);
                        }}>
                        </Input>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="标签" style={{ lineHeight: "28px" }}>标签(使用"、"分隔，建议从以下热门词汇选择)</div>
                        <Input id="tags" name="tags" value={tags} onChange={(e: any) => {
                            setTags((e.target as any).value);
                        }}>
                        </Input>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="标签词汇" style={{ color: "gray", lineHeight: "28px" }}>人物、女性、男性、动物、宠物、生物、角色、建筑、历史古迹、文化遗产、汽车、车辆、武器、工具、电子产品、服装、时尚、食物、饮料、家具、自然、植物、艺术、抽象</div>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="CC协议" style={{ lineHeight: "28px" }}>CC协议</div>
                        <Select defaultValue={license} onSelect={(e, option) => {
                            setLicense(option.value);
                        }}>
                            <Option value="CC0">CC0</Option>
                            <Option value="CC BY">CC BY</Option>
                            <Option value="CC BY-SA">CC BY-SA</Option>
                            <Option value="CC BY-ND">CC BY-ND</Option>
                            <Option value="CC BY-NC">CC BY-NC</Option>
                            <Option value="CC BY-NC-SA">CC BY-NC-SA</Option>
                            <Option value="CC BY-NC-ND">CC BY-NC-ND</Option>
                        </Select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", marginBottom: "10px" }}>
                        <div title="私有" style={{ lineHeight: "28px" }}>私有</div>
                        <Input size='normal' type={"checkbox"} checked={priv} disabled={true} style={{ width: "18px", height: "18px" }} onChange={(e: any) => {
                            setPriv((e.target as any).checked && false);
                        }}>
                        </Input>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <div title="概要" style={{ color: "gray", lineHeight: "28px" }}>概要：上传大小{(size / 1024 / 1024).toFixed(2)}MB，文件数量{count}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", marginBottom: "10px" }}>
                        <Input size='normal' type={"button"} style={{ width: "120px", height: "auto" }} value={props.uploading ? "上传中 ..." : "上传"} onClick={(e: any) => {
                            Submit();
                        }}>
                        </Input>
                    </div>
                </div >
            </div >
        );
    }

    /** 资源包收集列表。 */
    public get collections() {
        const engine = this.app.engine;
        const resources = engine.resources;

        if (!engine.started) {
            return [];
        }

        const list = resources.packageList;
        const pathLut: Record<string, ITreeNodeItemProps<never>> = {};

        const GetFolder = (path: string) => {
            let folder = pathLut[path];
            if (!folder) {
                let parts = path.split("/");
                let cur = "";

                for (let part of parts) {
                    if (part || !cur) {
                        cur += part;

                        let folder_ = pathLut[cur];
                        if (!folder_) {
                            folder_ = pathLut[cur] = {
                                id: cur,
                                name: part,
                                icon: "folder",
                                isLeaf: false,
                                children: []
                            };

                            if (folder) {
                                folder.children.push(folder_);
                            }
                        }

                        folder = folder_;

                        cur += "/";
                    }
                }
            }

            return folder;
        };

        const excludes = ["0-0-0", "1-1-1"];

        for (let pkg of list) {
            if (pkg && excludes.indexOf(pkg.uuid) == -1) {
                const folder = GetFolder(pkg.folder || ""); // "/aa/bb/cc"

                folder.children.push({
                    id: pkg.uuid,
                    name: pkg.key,
                    icon: "archive",
                    isLeaf: true
                });
            }
        }

        return pathLut[""]?.children || [];
    }

    /** 应用实例。 */
    public app: PloyApp_editor;

    /** 已导入列表。 */
    public imports: ITreeNodeItemProps<{
        /** 资源包标识名。 */
        key: string;
        /** 资源包注册信息。 */
        reg: PackageReg;
        /** 资源清单。 */
        menu: PackageReg["menu"];
        /** 资源文件列表。 */
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
            datas: (string | Blob)[];
            /** 总文件数量。 */
            count: number;
            /** 总字节大小。 */
            size: number;
        };
    }>[] = [];
    /** 正在执行导入。 */
    public importing: boolean;
    /** 正在执行上传。 */
    public uploading: boolean;

    /** 扩展ID。 */
    public id = 'ext_packages';
    /** 扩展名称。 */
    public name = '资源包管理';
    /** 扩展显示名称。 */
    public displayName = '资源包管理';
    /** 扩展版本。 */
    public version = '1.0.0';
    /** 扩展类别。 */
    public categories = [molecule.model.IExtensionType.Workbench];
    /** 扩展图标。 */
    public icon = 'package';
    /** 是否禁用扩展。 */
    public disable = false;

    /** 扩展在激活栏的信息。 */
    public activityBar: IActivityBarItem = {
        title: this.name,
        id: this.id,
        name: this.name,
        hidden: false,
        data: this,
        icon: this.icon,
        checked: false,
        disabled: false,
        type: 'normal',
        contextMenu: undefined,
        sortIndex: -1,
        render: undefined,
    };

    /** 扩展在侧边栏的界面。 */
    public sidebar: ISidebarPane = {
        id: this.id,
        title: this.name,
        render: () => {
            return <this.renderSidebar toolbar={this.sidebarCfg.toolbar} collapse={this.sidebarCfg.collapse} />
        }
    };

    /** 扩展在侧边栏的界面配置。 */
    public sidebarCfg = {
        /** 工具栏定义。 */
        toolbar: [
            {
                id: 'download',
                title: '下载',
                name: '下载',
                icon: 'cloud-download',
                disabled: false,
                onClick: () => { }
            },
            {
                id: 'refresh',
                title: '刷新',
                name: '刷新',
                icon: 'refresh',
                disabled: false,
                onClick: () => { }
            }
        ] as IActionBarItemProps[],
        /** 折叠面板列表。 */
        collapse: [
            {
                id: 'collections',
                name: '收集列表',
                hidden: undefined,
                config: {
                    grow: 3
                },
                toolbar: undefined,
                renderPanel: () => {
                    return <this.renderCollections data={this.collections} contentMenu={[]} onSelect={(node) => {
                        if (node.isLeaf) {
                            const pkg = this.app.engine.resources.GetPackageByUUID(node.id as string);
                            this.app.signals.select_package.Dispatch(pkg);
                        }
                    }} />
                }
            },
            {
                id: 'imports',
                name: '导入列表',
                hidden: undefined,
                config: {
                    grow: 1
                },
                toolbar: [
                    {
                        id: 'import',
                        title: '导入',
                        name: '导入',
                        icon: 'add',
                        disabled: false,
                        onClick: () => {
                            if (!this.importing) {
                                document.getElementById('pkg_import_input').click();
                            }
                        },
                    }
                ] as IActionBarItemProps[],
                renderPanel: () => {
                    return <this.renderImports data={this.imports} contentMenu={[
                        {
                            id: 'upload',
                            name: '上传',
                            icon: 'cloud-upload',
                            disabled: false,
                            handleClick: (e: any, menu: any, item?: any) => {
                                this.openUpload(item, (entry) => { console.log(entry); });
                            }
                        },
                    ]} onSelect={(node) => {
                        if (node.isLeaf) {
                            const pkg = this.app.engine.resources.GetPackageByUUID(node.id as string);
                            this.app.signals.select_package.Dispatch(pkg);
                        }
                    }} onImport={(file) => {
                        this.openImport(file, (entry) => { console.log(this); })
                    }} isImporting={this.importing} />
                }
            }
        ] as ICollapseItem[],
    };
}
