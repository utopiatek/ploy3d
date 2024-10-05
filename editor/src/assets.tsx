import { PackageReg } from "../../dist/esm/mod.js"
import { PloyApp_editor } from "./index.js"
import { React, molecule, useDrag } from "../../lib/molecule.js"

export class Assets implements molecule.model.IExtension {
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
        molecule.panel.add(this.panel);

        this.app.signals.select_package.AddListener((pkg) => {

            this.app.engine.resources.Browse(pkg).then((menu) => {
                this.menu = menu;

                const { panel: e } = molecule.layout.getState();

                if (e.hidden) {
                    molecule.layout.togglePanelVisibility();
                }

                molecule.panel.open(this.panel);
            });
        });
    }

    /**
     * 扩展取消激活时调用。
     * @param extensionCtx 扩展服务上下文。
     */
    public dispose(extensionCtx: molecule.IExtensionService) {
        molecule.panel.remove(this.panel.id);
    }

    /**
     * 渲染扩展在侧边栏的界面。
     * @returns
     */
    public renderPane(item: any, tab?: molecule.component.ITabProps, group?: molecule.model.IEditorGroup) {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <molecule.component.Scrollbar>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {this.menu.list.map((item: any) => <this.renderItem item={item} />)}
                    </div>
                </molecule.component.Scrollbar>
            </div>
        )
    }

    /**
     * 渲染面板列表元素。
     * @param props 列表元素属性。
     * @returns
     */
    public renderItem(props: {
        item: PackageReg["menu"]["list"][0]
    }) {
        // https://www.cnblogs.com/sanhuamao/p/17318203.html
        // 将dragRef注入到标签中，该标签就会变成一个可拖拽的标签
        const [collected, dragRef, previewRef] = useDrag({
            // 给拖拽物分类，与接收物分类相同才能进行Drop操作
            type: '3d_resource',
            // 拖拽物所携带的数据，让后面一些事件可以拿到数据，以达到交互的目的
            item: props.item,
            // 构造传递给响应事件的monitor状态对象
            collect: (monitor: any) => {
                return {
                    isDragging: monitor.isDragging(),
                };
            },
        }, []);

        return (
            <div ref={dragRef} style={{
                width: "96px",
                height: "120px",
                margin: "4px"
            }}>
                <div style={{
                    width: "96px",
                    height: "96px",
                    color: "Highlight",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textAlign: "left",
                    lineHeight: "14px",
                    background: "gray"
                }}>
                    {props.item.classid}
                </div>

                <div style={{
                    width: "96px",
                    height: "28px",
                    color: "white",
                    fontSize: "12px",
                    textAlign: "center",
                    wordWrap: "break-word",
                    lineHeight: "14px",
                    backgroundColor: "Highlight"
                }}>
                    {props.item.label}
                </div>
            </div>
        );
    }

    /** 应用实例。 */
    public app: PloyApp_editor;
    /** 当前用于渲染的资源清单数据。*/
    public menu: PackageReg["menu"];

    /** 扩展ID。 */
    public id = 'ext_assets';
    /** 扩展名称。 */
    public name = '资源浏览器';
    /** 扩展显示名称。 */
    public displayName = '资源浏览器';
    /** 扩展版本。 */
    public version = '1.0.0';
    /** 扩展类别。 */
    public categories = [molecule.model.IExtensionType.Workbench];
    /** 扩展图标。 */
    public icon = 'browser';
    /** 是否禁用扩展。 */
    public disable = false;

    /** 扩展在面板栏的界面。 */
    public panel: molecule.model.IPanelItem = {
        active: true,
        closable: true,
        editable: false,
        status: undefined,
        icon: this.icon,
        id: this.id,
        name: this.name,

        title: this.name,
        toolbox: [],
        data: undefined,
        sortIndex: 2,

        renderPane: (item: any, tab?: molecule.component.ITabProps, group?: molecule.model.IEditorGroup) => this.renderPane(item, tab, group)
    };
}
