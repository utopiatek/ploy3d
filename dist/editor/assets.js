import { React, molecule, useDrag } from "../../lib/molecule.js";
export class Assets {
    constructor(app) {
        this.app = app;
    }
    activate(extensionCtx) {
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
    dispose(extensionCtx) {
        molecule.panel.remove(this.panel.id);
    }
    renderPane(item, tab, group) {
        if (!this.menu) {
            return React.createElement("div", null, "\u8BF7\u5728\u8D44\u6E90\u5305\u7BA1\u7406\u9762\u677F\u9009\u62E9\u4E00\u4E2A\u8D44\u6E90\u5305\u67E5\u770B\uFF01");
        }
        const thumbnailUrl = this.menu.thumbnail;
        const thumbnailWidth = this.menu.thumbnail_per_row * 96;
        const thumbnailHeight = this.menu.thumbnail_row_count * 96;
        const rowSize = this.menu.thumbnail_per_row;
        const thumbnailSize = `/ ${thumbnailWidth}px ${thumbnailHeight}px`;
        for (let entry of this.menu.list) {
            let iconUrl = "gray";
            if (thumbnailUrl) {
                const index = entry.thumbnail_index;
                const col = index % rowSize;
                const row = Math.floor(index / rowSize);
                iconUrl = `url(${thumbnailUrl}) -${96 * col}px -${96 * row}px ${thumbnailSize} no-repeat`;
            }
            entry.thumbnail_href = iconUrl;
        }
        return (React.createElement("div", { style: { width: "100%", height: "100%" } },
            React.createElement(molecule.component.Scrollbar, null,
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap" } }, this.menu.list.map((item) => React.createElement(this.renderItem, { item: item }))))));
    }
    renderItem(props) {
        const [collected, dragRef, previewRef] = useDrag({
            type: '3d_resource',
            item: props.item,
            collect: (monitor) => {
                return {
                    isDragging: monitor.isDragging(),
                };
            },
        }, [props.item]);
        return (React.createElement("div", { ref: dragRef, style: {
                width: "96px",
                height: "120px",
                margin: "4px"
            } },
            React.createElement("div", { style: {
                    width: "96px",
                    height: "96px",
                    color: "Highlight",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textAlign: "left",
                    lineHeight: "14px",
                    background: props.item.thumbnail_href,
                } }, props.item.classid),
            React.createElement("div", { style: {
                    width: "96px",
                    height: "28px",
                    color: "white",
                    fontSize: "12px",
                    textAlign: "center",
                    wordWrap: "break-word",
                    lineHeight: "14px",
                    backgroundColor: "Highlight"
                } }, props.item.label)));
    }
    app;
    menu;
    id = 'ext_assets';
    name = '资源浏览器';
    displayName = '资源浏览器';
    version = '1.0.0';
    categories = [molecule.model.IExtensionType.Workbench];
    icon = 'browser';
    disable = false;
    panel = {
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
        renderPane: (item, tab, group) => this.renderPane(item, tab, group)
    };
}
