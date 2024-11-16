import { PloyApp_editor } from "./index.js"
import { React, molecule, Header, Content, getEventPosition } from "../../lib/molecule.js"
import { Scene, Object3D, CLASSID } from "../../dist/esm/mod.js";

type ITreeProps = molecule.component.ITreeProps;
type ITreeNodeItemProps<T> = molecule.component.ITreeNodeItemProps<T>;
type IActivityBarItem = molecule.model.IActivityBarItem;
type IActionBarItemProps = molecule.component.IActionBarItemProps;
type IMenuItemProps = molecule.component.IMenuItemProps;
type ISidebarPane = molecule.model.ISidebarPane;
type ICollapseItem = molecule.component.ICollapseProps["data"][0];

export class Hierarchy implements molecule.model.IExtension {
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
    public renderSidebar(props: { toolbar: IActionBarItemProps[]; collapse: ICollapseItem[]; }) {
        const { Toolbar, Collapse } = molecule.component;

        return (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Header title='场景管理' toolbar={
                    <Toolbar data={props.toolbar} />
                } />
                <Content>
                    <Collapse data={props.collapse} />
                </Content>
            </div>
        )
    }

    /**
     * 渲染场景层级树型结构。
     * @returns 
     */
    public renderHierarchy(props: { data: ITreeNodeItemProps<Object3D>[]; contentMenu: IMenuItemProps[]; onSelect: (node: ITreeNodeItemProps<any>, isUpdate?: any) => void; }) {
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
     * 响应场景节点选中。
     */
    public onSelect(node: ITreeNodeItemProps<Object3D>) {
        this.app["_editor"].OnSelect(node.data ? {
            object3d: node.data
        } : null);
        console.error("onSelect:", node);
    }

    /** 折叠面板数组（每个场景是一个折叠面板）。 */
    public get collapse() {
        const resources = this.app.engine.resources;
        if (!resources) {
            return [];
        }

        const sceneList = resources.Scene.GetInstanceList();
        const collapseList: ICollapseItem[] = [];

        // TODO: 优化减少刷新
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
                                return <this.renderHierarchy data={scene.hierarchy} contentMenu={[]} onSelect={(node) => {
                                    this.onSelect(node);
                                }} />
                            }
                        },
                        hierarchy: [],
                        updated: true,
                    };
                }

                if (scene.updated) {
                    scene.updated = false;
                    scene.hierarchy = [];

                    const TraverseTree = (parent: ITreeNodeItemProps<Object3D>, obj: Object3D) => {
                        // 对象所属根源预制件
                        const obj_master_prefab = obj.prefab?.master || obj.prefab;
                        // 根源预制件实例指示跟随场景保存
                        if (obj_master_prefab?.needSave) {
                            const node: ITreeNodeItemProps<Object3D> = {
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

    /** 应用实例。 */
    public app: PloyApp_editor;

    /** 场景结构数据缓存。 */
    public sceneLut: Record<string, {
        /** 场景实例对象。 */
        scene: Scene;
        /** 折叠面板设置。 */
        collapse: ICollapseItem;
        /** 场景层次结构数据。 */
        hierarchy: ITreeNodeItemProps<Object3D>[];
        /** 场景是否有刷新。 */
        updated: boolean;
    }> = {};
    /** 当前活动场景。 */
    public scene: Hierarchy["sceneLut"][""];

    /** 扩展ID。 */
    public id = 'ext_hierarchy';
    /** 扩展名称。 */
    public name = '场景管理';
    /** 扩展显示名称。 */
    public displayName = '场景管理';
    /** 扩展版本。 */
    public version = '1.0.0';
    /** 扩展类别。 */
    public categories = [molecule.model.IExtensionType.Workbench];
    /** 扩展图标。 */
    public icon = 'map';
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
            return <this.renderSidebar toolbar={this.toolbar} collapse={this.collapse} />
        }
    };

    /** 扩展在侧边栏的界面的主工具栏。 */
    public toolbar: IActionBarItemProps[] = [
        {
            id: 'add',
            title: '新建场景',
            name: '新建场景',
            icon: 'add',
            disabled: false,
            onClick: async () => {
                const scene = await this.app.editor.NewScene();
                if (scene) {
                    await this.app.editor.EditScene(scene.collapse.id as string);
                    return true;
                }

                return false;
            }
        }
    ];
}
