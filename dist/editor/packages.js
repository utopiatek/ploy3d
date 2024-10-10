import { React, molecule, Header, Content } from "../../lib/molecule.js";
export class Packages {
    constructor(app) {
        this.app = app;
    }
    activate(extensionCtx) {
        molecule.activityBar.add(this.activityBar);
        molecule.sidebar.add(this.sidebar);
    }
    dispose(extensionCtx) {
        molecule.activityBar.remove(this.activityBar.id);
        molecule.sidebar.remove(this.sidebar.id);
    }
    renderSidebar() {
        return (React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column" } },
            React.createElement(Header, { title: '\u8D44\u6E90\u5305\u7BA1\u7406', toolbar: React.createElement(molecule.component.Toolbar, { data: this.sidebarCfg.toolbar }) }),
            React.createElement(Content, null,
                React.createElement(molecule.component.Collapse, { data: this.sidebarCfg.collapse }))));
    }
    get collections() {
        if (!this.app.engine.started) {
            return [];
        }
        const list = this.app.engine.resources.packageList;
        const pathLut = {};
        const GetFolder = (path) => {
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
                const folder = GetFolder(pkg.folder || "");
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
    app;
    id = 'ext_packages';
    name = '资源包管理';
    displayName = '资源包管理';
    version = '1.0.0';
    categories = [molecule.model.IExtensionType.Workbench];
    icon = 'package';
    disable = false;
    activityBar = {
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
    sidebar = {
        id: this.id,
        title: this.name,
        render: () => this.renderSidebar()
    };
    sidebarCfg = {
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
        ],
        collapse: [
            {
                id: 'collections',
                name: '收集列表',
                hidden: undefined,
                toolbar: undefined,
                renderPanel: () => {
                    return (React.createElement(molecule.component.Scrollbar, null,
                        React.createElement(molecule.component.TreeView, { data: this.collections, onSelect: (node) => {
                                if (node.isLeaf) {
                                    const pkg = this.app.engine.resources.GetPackageByUUID(node.id);
                                    this.app.signals.select_package.Dispatch(pkg);
                                }
                            } })));
                }
            },
            {
                id: 'unsaved',
                name: '待保存',
                renderPanel: function () {
                    return (React.createElement(molecule.component.Scrollbar, null,
                        React.createElement("div", null, "\u5F85\u4FDD\u5B58")));
                }
            }
        ],
    };
}
