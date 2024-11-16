import { React, molecule, Header, Content, getEventPosition } from "../../lib/molecule.js";
export class Hierarchy {
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
    renderSidebar(props) {
        const { Toolbar, Collapse } = molecule.component;
        return (React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column" } },
            React.createElement(Header, { title: '\u573A\u666F\u7BA1\u7406', toolbar: React.createElement(Toolbar, { data: props.toolbar }) }),
            React.createElement(Content, null,
                React.createElement(Collapse, { data: props.collapse }))));
    }
    renderHierarchy(props) {
        const contextView = molecule.component.useContextViewEle();
        const { Menu, Scrollbar, TreeView } = molecule.component;
        const handleRightClick = (event, data) => {
            if (event.target.nodeName !== 'INPUT') {
                event.preventDefault();
                contextView.show(getEventPosition(event), () => (React.createElement(Menu, { role: "menu", onClick: (_, item) => item.handleClick(_, item, data), data: props.contentMenu })));
            }
        };
        return (React.createElement(Scrollbar, null,
            React.createElement(TreeView, { data: props.data, onSelect: props.onSelect, onRightClick: handleRightClick })));
    }
    onSelect(node) {
        this.app["_editor"].OnSelect(node.data ? {
            object3d: node.data
        } : null);
        console.error("onSelect:", node);
    }
    get collapse() {
        const resources = this.app.engine.resources;
        if (!resources) {
            return [];
        }
        const sceneList = resources.Scene.GetInstanceList();
        const collapseList = [];
        for (let scene_ of sceneList) {
            let key = scene_.prefab?.uuid;
            if (key && scene_.prefab?.needSave) {
                let scene = this.sceneLut[key];
                if (!scene) {
                    scene = this.sceneLut[key] = {
                        scene: scene_,
                        collapse: {
                            id: key,
                            name: scene_.name,
                            hidden: undefined,
                            toolbar: undefined,
                            renderPanel: () => {
                                return React.createElement(this.renderHierarchy, { data: scene.hierarchy, contentMenu: [], onSelect: (node) => {
                                        this.onSelect(node);
                                    } });
                            }
                        },
                        hierarchy: [],
                        updated: true,
                    };
                }
                if (scene.updated) {
                    scene.updated = false;
                    scene.hierarchy = [];
                    const TraverseTree = (parent, obj) => {
                        const obj_master_prefab = obj.prefab?.master || obj.prefab;
                        if (obj_master_prefab?.needSave) {
                            const node = {
                                id: obj.id,
                                name: obj.name,
                                icon: "symbol-method",
                                disabled: false,
                                isLeaf: true,
                                isEditable: false,
                                children: [],
                                data: obj,
                            };
                            if (parent) {
                                parent.children.push(node);
                                parent.isLeaf = false;
                            }
                            obj.ForEachChild((_, child) => {
                                TraverseTree(node, child);
                            });
                            return node;
                        }
                        return null;
                    };
                    scene.scene.ForEachRoot((_, root) => {
                        const rootNode = TraverseTree(null, root);
                        if (rootNode) {
                            scene.hierarchy.push(rootNode);
                        }
                    });
                }
                collapseList.push(scene.collapse);
            }
        }
        return collapseList;
    }
    app;
    sceneLut = {};
    scene;
    id = 'ext_hierarchy';
    name = '场景管理';
    displayName = '场景管理';
    version = '1.0.0';
    categories = [molecule.model.IExtensionType.Workbench];
    icon = 'map';
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
        render: () => {
            return React.createElement(this.renderSidebar, { toolbar: this.toolbar, collapse: this.collapse });
        }
    };
    toolbar = [
        {
            id: 'add',
            title: '新建场景',
            name: '新建场景',
            icon: 'add',
            disabled: false,
            onClick: async () => {
                const scene = await this.app.editor.NewScene();
                if (scene) {
                    await this.app.editor.EditScene(scene.collapse.id);
                    return true;
                }
                return false;
            }
        }
    ];
}
