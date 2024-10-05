import { PackageReg } from "../../dist/esm/mod.js"
import { PloyApp_editor } from "./index.js"
import { React, molecule, Header, Content } from "../../lib/molecule.js"

export class Packages implements molecule.model.IExtension {
    /**
     * 构造函数。
     * @param app 应用实例。
     */
    public constructor(app: PloyApp_editor) {
        this.app = app;
    }

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
    public renderSidebar() {
        return (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Header title='资源包管理' toolbar={
                    <molecule.component.Toolbar data={this.sidebarCfg.toolbar} />
                } />
                <Content>
                    <molecule.component.Collapse data={this.sidebarCfg.collapse} />
                </Content>
            </div>
        )
    }

    /** 资源包收集列表。 */
    public get collections() {
        if (!this.app.engine.started) {
            return [];
        }

        const list: PackageReg[] = this.app.engine.resources.packageList;
        const pathLut: Record<string, molecule.component.ITreeNodeItemProps> = {};

        const GetFolder = (path: string) => {
            let folder = pathLut[path];
            if (!folder) {
                let parts = path.split("/");
                let cur = "";

                for (let part of parts) {
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

            return folder;
        };

        for (let pkg of list) {
            if (pkg) {
                const folder = GetFolder(pkg.folder || ""); // "/aa/bb"

                folder.children.push({
                    id: pkg.uuid,
                    name: pkg.key,
                    icon: "archive",
                    isLeaf: true
                });
            }
        }

        return pathLut[""].children;
    }

    /** 应用实例。 */
    public app: PloyApp_editor;

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
    public activityBar: molecule.model.IActivityBarItem = {
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
    public sidebar: molecule.model.ISidebarPane = {
        id: this.id,
        title: this.name,
        render: () => this.renderSidebar()
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
        ] as molecule.component.IActionBarItemProps[],
        /** 折叠面板列表。 */
        collapse: [
            {
                id: 'collections',
                name: '收集列表',
                hidden: undefined,
                toolbar: undefined,
                renderPanel: () => {
                    //expandKeys = { this.lastRef.expandKeys }
                    //activeKey = { this.lastRef.activeKey }
                    //draggable = { true}
                    //onExpand = { onExpand }
                    //onDropTree = { onDropTree }

                    return (
                        <molecule.component.Scrollbar>
                            <molecule.component.TreeView
                                data={this.collections}
                                onSelect={(node) => {
                                    if (node.isLeaf) {
                                        const pkg = this.app.engine.resources.GetPackageByUUID(node.id as string);
                                        this.app.signals.select_package.Dispatch(pkg);
                                    }
                                }}
                            />
                        </molecule.component.Scrollbar>
                    )
                }
            },
            {
                id: 'unsaved',
                name: '待保存',
                renderPanel: function () {
                    return (
                        <molecule.component.Scrollbar>
                            <div>待保存</div>
                        </molecule.component.Scrollbar>
                    )
                }
            }
        ] as molecule.component.ICollapseProps["data"],
    };
}
