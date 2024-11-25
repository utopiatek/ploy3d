import { IDataProvider } from "../../dist/esm/mod.js"
import { PloyApp_editor } from "./index.js"
import { React, molecule, GridLayout, Responsive, WidthProvider, Header, Content } from "../../lib/molecule.js"

declare var antd: typeof import('antd');
declare var icons: typeof import('@ant-design/icons');

const ResponsiveGridLayout = WidthProvider(Responsive);

type IActionBarItemProps = molecule.component.IActionBarItemProps;
type ICollapseItem = molecule.component.ICollapseProps["data"][0];

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

/** UI编辑器。 */
export class UIEditor {
    /**
     * 构造函数。
     * @param app 应用实例。
     */
    public constructor(app: PloyApp_editor) {
        this.app = app;
        this.componentLut = {};
        this.renderPresets = this.renderPresets.bind(this);
        this.renderComponent = this.renderComponent.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
    }

    /**
     * 渲染辅助侧边栏面板。
     */
    public renderSidebar() {
        const { Toolbar, Collapse } = molecule.component;
        const { toolbar, collapse } = this.sidebarCfg;

        return (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Header title='UI管理' toolbar={
                    <Toolbar data={toolbar} />
                } />
                <Content>
                    <Collapse activePanelKeys={[]} data={collapse} />
                </Content>
            </div>
        )
    }

    /**
     * 渲染UI布局界面。
     * @param props 
     * @returns 
     */
    public renderEditor(props: {
        /** 首页页面实例ID。 */
        uiid: string;
        /** 首页页面配置。 */
        data: UIPanelProps;
        /** 页面更新回调。 */
        onUpdate: (data: UIPanelProps) => void;
    }) {
        /*/
        行高固定80像素，为尽量使格子宽度近似于高度，在容器行宽达到不同级别时划分为不同列数：
        80 * 24 = 1920
        80 * 18 = 1440
        80 * 12 = 960
        80 * 9  = 720
        80 * 6  = 480
        1920容器下，6*6的元素分辨率为480*480
        1440容器下，6*6的元素分辨率依然为480*480
        1440到1920之间的容器，6*6的元素宽高比会放大，但该比例变形合理
        注意：我们已经将栅格划分数由24格提升为48格
        /*/
        // props.data.data.components = [{ id: "4", controller: "0-0-0-68-1?Echarts", configure: "0-0-0-69-2?basic_bar" }];
        props.data.data.components = [{ id: "4", controller: "0-0-0-68-1?StatisticCard", configure: "0-0-0-69-2?statistic_card" }];
        props.data.data.layouts.lg = [{ i: "4", x: 0, y: 0, w: 1, h: 1 }];

        const data = props.data.data;
        const override = data.dataset;
        const [id, setId] = React.useState(data.increment_id);
        const [items, setItems] = React.useState(data.components);
        const [layouts, setLayouts] = React.useState((() => {
            const breakpoint_keys = ["lg", "md", "sm", "xs", "xxs"];
            const layouts: any = {};

            let layout = data.layouts["lg"];

            for (let key of breakpoint_keys) {
                layout = (data.layouts as any)[key] || layout;
                layouts[key] = [...layout];
            }

            return layouts;
        })());

        const Remove = (id: string) => {
            const items_ = items.filter((item, i) => item.id != id);
            const layouts_: any[] = [];

            for (let key in layouts) {
                layouts_[key as any] = layouts[key as any].filter((item: any) => item.i != id);
            }

            setItems(items_);
            setLayouts(layouts_);
        }

        return (
            <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "block",
                background: "linear-gradient(to right, #2b5876, #4e4376)",
            }}>
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    compactType={null}
                    preventCollision={true}
                    breakpoints={{ lg: 1920, md: 1440, sm: 960, xs: 720, xxs: 0 }}
                    cols={{ lg: 24 * 2, md: 18 * 2, sm: 12 * 2, xs: 9 * 2, xxs: 6 * 2 }}
                    rowHeight={80 * 0.5}
                    margin={ui_theme.grid_margin}
                    droppingItem={{ i: "newid", w: 1, h: 1 }}
                    isDroppable={true}
                    onDropDragOver={(e: any) => {
                        return this.dragAdd ? { w: this.dragAdd.w, h: this.dragAdd.h } : false;
                    }}
                    onDrop={(layout: any, item: any, e: any) => {
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
                    }}
                    onLayoutChange={(currentLayout: any, allLayouts: any, e: any) => {
                        setLayouts(allLayouts);
                    }}
                >
                    {items.map((item) => (
                        <div key={item.id} style={ui_theme.grid_style}>
                            <this.renderComponent pathid={props.uiid + "-" + item.id} config={item} override={override} />
                            <div style={{ position: "absolute", top: "4px", left: "4px" }}>{item.id}</div>
                            <span className="react-resizable-handle"
                                style={{
                                    top: "4px",
                                    right: 0,
                                    textAlign: "center"
                                }} onClick={(e) => {
                                    Remove(item.id);
                                }}>
                                X
                            </span>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </div>
        );
    }

    /**
     * 渲染远程UI组件。
     * @param props 组件属性。
     */
    public renderComponent(props: {
        /** 组件实例路径ID。 */
        pathid: string;
        /** 组件配置。 */
        config: UIPanelProps["data"]["components"][0];
        /** 组件配置重写。 */
        override: UIPanelProps["data"]["dataset"];
    }) {
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

        // useState 定义的状态不会因为外部属性（props）的变化而自动刷新或重置
        // useState 状态在组件生命周期内是持久的，只有在调用更新函数（如 setState）时才会改变
        // 当组件接收到新的 props 并希望更新 useState 状态时，可以使用 useEffect 来监听 props 的变化并手动更新状态

        // 组件配置是必须提供的
        const [config, setConfig] = React.useState(configure.configure ? null : {});
        // 组件数据是可选的，因为组件配置中存在默认数据
        const [data, setData] = React.useState(null);

        // 依赖数组为空意味着只在挂载和卸载时执行一次，否则当依赖数组内的任何值发生改变，该函数都会调用
        React.useEffect(() => {
            // 刷新逻辑 ...

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

            // 返回组件卸载时的清理函数（或者组件更新前函数，依赖数组不为空的情况下）
            return () => {
                // 清理逻辑 ...
            };
        }, [configure.configure, configure.provider]);

        let controller = configure.controller;
        let Component = this.componentLut[controller];
        if (!Component) {
            // 异步导入组件
            Component = this.componentLut[controller] = React.lazy(async () => {
                const parts = controller.split("?");
                const module = await resources.Script.Load(parts[0]);
                const component = this.componentLut[controller] = module.exports[parts[1]];

                return {
                    default: component
                };
            });
        }

        return (
            <React.Suspense fallback={<div>加载中...</div>}>
                {(config) && <Component pathid={props.pathid} config={config} data={data} />}
            </React.Suspense>
        )
    }

    /**
     * 渲染UI预设列表。
     */
    public renderPresets(props: {
        data: UIPreset[]
    }) {
        const handleDragStart = (e: any) => {
            const index = parseInt(e.target.id);
            const present = props.data[index];

            if (present) {
                this.dragAdd = present;

                const jpresent = JSON.stringify(present);

                e.dataTransfer.setData("text", jpresent);
            }
        };

        return (
            <ul>
                {props.data.map((item, index) => <li id={`${index}-drag-item`} draggable={true} onDragStart={handleDragStart}>{item.label}</li>)}
            </ul>
        )
    }

    /** 应用实例。 */
    public app: PloyApp_editor;
    /** 远程组件缓存查找表。 */
    public componentLut: Record<string, React.LazyExoticComponent<React.ComponentType<{ pathid: string, config: any, data: any }>>>;
    /** 当前拖拽添加预设。 */
    public dragAdd: UIPreset;

    /** 预设列表。 */
    public presetList = {
        components: [
            {
                label: "柱状图",
                type: "component",
                w: 8,
                h: 6,
                controller: "0-0-0-68-1?Echarts",
                configure: "0-0-0-69-2?basic_bar"
            }
        ] as UIPreset[],
    };

    /** 扩展在辅助侧边栏的界面配置。 */
    public sidebarCfg = {
        /** 工具栏定义。 */
        toolbar: [
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
                    return (
                        <div id="drag-item" draggable={true} onDragStart={(e) => {
                            const present: UIPreset = {
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
                        }}>
                            Droppable Element (Drag me!)
                        </div>
                    )
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
                    return <this.renderPresets data={this.presetList.components}></this.renderPresets>
                }
            },
        ] as ICollapseItem[],
    };
}

/** UI面板配置数据。 */
export type UIPanelProps = IDataProvider<{
    /** 用于组件实例ID分配的自增量。 */
    increment_id: number;
    /** 面板布局描述（默认需要提供lg的布局描述）。 */
    layouts: Record<"lg" | "md" | "sm" | "xs" | "xxs", {
        /** 组件实例ID。 */
        i: string;

        /** 起始列号。 */
        x: number;
        /** 起始行号。 */
        y: number;
        /** 宽列数。 */
        w: number;
        /** 高行数。 */
        h: number;

        /** 最小宽列数（默认0）。 */
        minW?: number;
        /** 最大宽列数（默认Infinity）。 */
        maxW?: number;
        /** 最小高行数（默认0）。 */
        minH?: number;
        /** 最大高行数（默认Infinity）。 */
        maxH?: number;

        /** 如果为真，组件不可拖拽不可缩放（默认假）。 */
        static?: boolean;
        /** 组件是否可拖拽（默认真）。 */
        isDraggable?: boolean;
        /** 组件是否可缩放（默认真）。 */
        isResizable?: boolean;
    }[]>;
    /** 面板组件实例列表（加载面板数据集文件以修改其中的设置）。 */
    components: {
        /** 组件实例ID（不可通过数据集文件修改）。 */
        id: string;
        /** 组件方法URI（不可通过数据集文件修改）。 */
        controller: string;

        /** 组件配置URI（需包含默认数据集）。 */
        configure: string;
        /** 组件数据URI（非必须项，因为配置带有默认数据集）。 */
        provider?: string;
        /** 组件数据转换器URI（非必须项）。 */
        converter?: string;
    }[];
    /** 
     * 默认数据集。
     * KEY：组件实例组合ID（"${祖父面板ID}-${父面板ID}-{组件ID}"）。
     * 后根顺序设置数据集数据（即可覆盖原设置）。
     */
    dataset: Record<string, {
        /** 组件配置URI（需包含默认数据集）。 */
        configure: string;
        /** 组件数据URI（非必须项，因为配置带有默认数据集）。 */
        provider?: string;
        /** 组件数据转换器URI（非必须项）。 */
        converter?: string;
    }>;
}>;

/** UI组件预设数据（可直接编辑预设文件，使用预设构建更高级UI面板）。 */
export interface UIPreset {
    /** 预设标签。 */
    label: string;
    /** 预设类型（在不同列表中展示）。 */
    type: "panel" | "component";
    /** 预设在48栅格系统中默认占用的列数。 */
    w: number;
    /** 预设在48栅格系统中默认占用的行数。 */
    h: number;

    /** 组件方法URI。 */
    controller: string;
    /** 组件默认配置URI。 */
    configure: string;
}
