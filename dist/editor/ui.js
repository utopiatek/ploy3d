import { React, molecule, Responsive, WidthProvider, Header, Content } from "../../lib/molecule.js";
const ResponsiveGridLayout = WidthProvider(Responsive);
const ui_theme = {
    canvas_background: "linear-gradient(to right, #2b5876, #4e4376)",
    grid_margin: [5, 5],
    grid_style: {
        background: "rgba( 9, 12, 44, 0.6 )",
        boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
        backdropFilter: "blur( 8.5px )",
        WebkitBackdropFilter: "blur( 8.5px )",
        borderRadius: "10px",
        border: "1px solid rgba( 255, 255, 255, 0.18 )"
    },
};
export class UIEditor {
    constructor(app) {
        this.app = app;
        this.componentLut = {};
        this.renderComponent = this.renderComponent.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
    }
    renderSidebar() {
        const { Toolbar, Collapse } = molecule.component;
        const { toolbar, collapse } = this.sidebarCfg;
        return (React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column" } },
            React.createElement(Header, { title: 'UI\u7BA1\u7406', toolbar: React.createElement(Toolbar, { data: toolbar }) }),
            React.createElement(Content, null,
                React.createElement(Collapse, { activePanelKeys: [], data: collapse }))));
    }
    renderEditor(props) {
        props.data.data.components = [{ id: "4", controller: "0-0-0-68-1?StatisticCard", configure: "0-0-0-69-2?statistic_card" }];
        props.data.data.layouts.lg = [{ i: "4", x: 0, y: 0, w: 1, h: 1 }];
        const data = props.data.data;
        const override = data.dataset;
        const [id, setId] = React.useState(data.increment_id);
        const [items, setItems] = React.useState(data.components);
        const [layouts, setLayouts] = React.useState((() => {
            const breakpoint_keys = ["lg", "md", "sm", "xs", "xxs"];
            const layouts = {};
            let layout = data.layouts["lg"];
            for (let key of breakpoint_keys) {
                layout = data.layouts[key] || layout;
                layouts[key] = [...layout];
            }
            return layouts;
        })());
        const Remove = (id) => {
            const items_ = items.filter((item, i) => item.id != id);
            const layouts_ = [];
            for (let key in layouts) {
                layouts_[key] = layouts[key].filter((item) => item.i != id);
            }
            setItems(items_);
            setLayouts(layouts_);
        };
        return (React.createElement("div", { style: {
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "block",
                background: "linear-gradient(to right, #2b5876, #4e4376)",
            } },
            React.createElement(ResponsiveGridLayout, { className: "layout", layouts: layouts, compactType: null, preventCollision: true, breakpoints: { lg: 1920, md: 1440, sm: 960, xs: 720, xxs: 0 }, cols: { lg: 24 * 2, md: 18 * 2, sm: 12 * 2, xs: 9 * 2, xxs: 6 * 2 }, rowHeight: 80 * 0.5, margin: ui_theme.grid_margin, droppingItem: { i: "newid", w: 1, h: 1 }, isDroppable: true, onDropDragOver: (e) => {
                    return this.dragAdd ? { w: this.dragAdd.w, h: this.dragAdd.h } : false;
                }, onDrop: (layout, item, e) => {
                    const id_ = "" + id;
                    const items_ = items.concat([{
                            id: id_,
                            controller: this.dragAdd.controller,
                            configure: this.dragAdd.configure
                        }]);
                    const layouts_ = { ...layouts };
                    for (let key in layouts_) {
                        layouts_[key] = layouts_[key].concat([{
                                i: id_,
                                x: item.x,
                                y: item.y,
                                w: item.w,
                                h: item.h,
                            }]);
                    }
                    setId(id + 1);
                    setItems(items_);
                    setLayouts(layouts_);
                }, onLayoutChange: (currentLayout, allLayouts, e) => {
                    setLayouts(allLayouts);
                } }, items.map((item) => (React.createElement("div", { key: item.id, style: ui_theme.grid_style },
                React.createElement(this.renderComponent, { pathid: props.uiid + "-" + item.id, config: item, override: override }),
                React.createElement("div", { style: { position: "absolute", top: "4px", left: "4px" } }, item.id),
                React.createElement("span", { className: "react-resizable-handle", style: {
                        top: "4px",
                        right: 0,
                        textAlign: "center"
                    }, onClick: (e) => {
                        Remove(item.id);
                    } }, "X")))))));
    }
    renderComponent(props) {
        const resources = this.app.engine.resources;
        const configure = props.config;
        const override = props.override[props.pathid];
        if (override) {
            if (override.configure) {
                configure.configure = override.configure;
            }
            if (override.provider) {
                configure.provider = override.provider;
            }
            if (override.converter) {
                configure.converter = override.converter;
            }
        }
        const [config, setConfig] = React.useState(configure.configure ? null : {});
        const [data, setData] = React.useState(null);
        React.useEffect(() => {
            if (configure.configure) {
                resources.Script.QueryData({ provider: configure.configure }).then(res => {
                    if (res.success) {
                        setConfig(res.data);
                    }
                    else {
                        console.warn(res.message);
                    }
                }).catch(e => {
                    console.error(`配置请求异常：${e}！`);
                });
            }
            if (configure.provider) {
                resources.Script.QueryData({ provider: configure.provider }).then(res => {
                    if (res.success) {
                        setData(res.data);
                    }
                    else {
                        console.warn(res.message);
                    }
                }).catch(e => {
                    console.error(`数据请求异常：${e}！`);
                });
            }
            return () => {
            };
        }, [configure.configure, configure.provider]);
        let controller = configure.controller;
        let Component = this.componentLut[controller];
        if (!Component) {
            Component = this.componentLut[controller] = React.lazy(async () => {
                const parts = controller.split("?");
                const module = await resources.Script.Load(parts[0]);
                const component = this.componentLut[controller] = module.exports[parts[1]];
                return {
                    default: component
                };
            });
        }
        return (React.createElement(React.Suspense, { fallback: React.createElement("div", null, "\u52A0\u8F7D\u4E2D...") }, (config) && React.createElement(Component, { pathid: props.pathid, config: config, data: data })));
    }
    app;
    componentLut;
    dragAdd;
    sidebarCfg = {
        toolbar: [
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
                id: 'panels',
                name: '面板列表',
                hidden: undefined,
                config: {
                    grow: 3
                },
                toolbar: [
                    {
                        id: 'refresh',
                        title: '刷新',
                        name: '刷新',
                        icon: 'refresh',
                        disabled: false,
                        onClick: () => { }
                    },
                ],
                renderPanel: () => {
                    return (React.createElement("div", { id: "drag-item", draggable: true, onDragStart: (e) => {
                            const present = {
                                label: "present",
                                type: "component",
                                w: 4,
                                h: 2,
                                controller: "0-0-0-68-1?Echarts",
                                configure: "0-0-0-69-2?basic_bar"
                            };
                            this.dragAdd = present;
                            const jpresent = JSON.stringify(present);
                            e.dataTransfer.setData("text", jpresent);
                        } }, "Droppable Element (Drag me!)"));
                }
            },
            {
                id: 'components',
                name: '控件列表',
                hidden: undefined,
                config: {
                    grow: 3
                },
                toolbar: [
                    {
                        id: 'refresh',
                        title: '刷新',
                        name: '刷新',
                        icon: 'refresh',
                        disabled: false,
                        onClick: () => { }
                    },
                ],
                renderPanel: () => {
                    const { Card, Statistic } = antd;
                    const Icon = icons["AccountBookFilled"];
                    return (React.createElement(Card, { bordered: false },
                        React.createElement(Statistic, { title: "Active", value: 11.28, precision: 2, valueStyle: { color: '#3f8600' }, prefix: React.createElement(Icon, null), suffix: "%" })));
                }
            },
        ],
    };
}
