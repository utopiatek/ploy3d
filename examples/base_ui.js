/** 导入PLOY3D引擎。 */
import * as ploycloud from "../dist/esm/mod.js"

/** 扩展实现APP类[base_ui]。 */
export class PloyApp_base_ui extends ploycloud.PloyApp {
    /**
     * 构造函数。
     * @constructor
     * @param {ploycloud.Ploy3D} engine 引擎实例。
     */
    constructor(engine) {
        super(engine);
    }

    /**
     * 初始化UI。
     * @param {ploycloud.Ploy3D["Progress"]} progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    async InitUI(progress) {
        this.ui_design = await InitUI_0(this.engine);
        this.engine.ui._canvas = this.ui_design;
        this.engine.ui.show_id_color = true;

        return true;
    }

    /**
     * 初始化场景。
     * @param {ploycloud.Ploy3D["Progress"]} progress 进度刷新函数。
     * @returns 是否初始化成功。
     */
    async InitScene(progress) {
        console.log(this.engine);

        const resources = this.engine.resources;
        const scene = await resources.Scene.Create();
        const object3d = await resources.Object.Create(scene);
        const volume = await resources.Volume.Create(object3d);
        const camera = await resources.Camera.Create(object3d);

        const texture2d = await resources.Texture.CreateTexture({
            uuid: "",
            classid: 25,
            name: "_builtin2D",
            label: "_builtin2D",
            uri: "1-1-1.miaokit.builtins:/texture/25-0_color.ktx2"
        });

        resources.Texture.default2D = texture2d;

        const colorRT = this.engine.device.CreateTextureRT(2048, 2048, 1, 6, "rgba16float", true, false);
        const depthRT = this.engine.device.CreateTextureRT(2048, 2048, 1, 6, "depth32float", true, false);
        const gbRT = this.engine.device.CreateTextureRT(2048, 2048, 2, 1, "rgba32uint", true, false);
        const frameUniformsG0 = await resources.Material.CreateFrameUniforms(colorRT, depthRT, gbRT, 0);
        const materialG2 = await resources.Material.Load("1-1-1.miaokit.builtins:/material/32-1_standard_ui.json");
        const mesh = resources.Mesh.Create({
            uuid: "",
            classid: /*CLASSID.ASSET_MESH*/38,
            name: "cube mesh",
            label: "cube mesh",

            creater: {
                type: "box",
                box: {
                    width: 1,
                    height: 1,
                    depth: 1,
                    widthSegments: 2,
                    heightSegments: 2,
                    depthSegments: 2
                }
            }
        });
        const meshRendererG1 = await resources.MeshRenderer.Create(mesh, null);
        const pipeline = this.engine.context.CreateRenderPipeline({
            g0: frameUniformsG0.layoutID,
            g1: meshRendererG1.layoutID,
            g2: materialG2.layoutID,
            g3: 0,
            flags: 0,
            topology: 3,
            frontFace: 0,
            cullMode: 1
        });

        console.log("scene:", scene);
        console.log("object3d:", object3d);
        console.log("volume:", volume);
        console.log("camera:", camera);
        console.log("texture2d:", texture2d);
        console.log("colorRT", colorRT);
        console.log("depthRT", depthRT);
        console.log("gbRT", gbRT);
        console.log("frameUniformsG0:", frameUniformsG0);
        console.log("materialG2:", materialG2);
        console.log("mesh:", mesh);
        console.log("meshRendererG1:", meshRendererG1);
        console.log("pipeline:", pipeline);

        //以上测试================------------------------

        this.scene_draw = (passEncoder) => {
            passEncoder.setViewport(0, 0, this.engine.width, this.engine.height, 0.0, 1.0);
            passEncoder.setPipeline(pipeline);
            this.engine.context.SetVertexBuffers(0, mesh.vertices, passEncoder);
            this.engine.context.SetIndexBuffer(mesh.ibFormat, mesh.triangles[0], passEncoder);
            frameUniformsG0.Bind(passEncoder);
            meshRendererG1.Bind(passEncoder);
            materialG2.Bind(passEncoder);
            // 需要保证顶点缓存足够大
            passEncoder.draw(4 * 30);
        };

        this.DrawFrame(1);

        progress(1.0, "完成场景初始化");

        return true;
    }

    /**
     * 绘制场景2D画面。
     */
    Draw2D() {
        return;
        if (this.ui_drawing) {
            return;
        }

        this.ui_drawing = true;

        this.engine.ui.Draw(this.ui_design, this.ui_canvas, this.ui_ctx)
            .then(() => {
                if (this.ui_canvas._extra) {
                    this.ui_canvas._extra.Present();
                }

                this.ui_drawing = false;
            })
            .catch((e) => {
                this.engine.Track(e, 3);
                this.ui_drawing = false;
            });
    }

    /**
     * 绘制场景3D画面。
     */
    Draw3D() {
        const commandEncoder = this.engine.device.CreateCommandEncoder();

        const textureView = this.engine.device["_swapchain"].getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: [1, 1, 0, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        this.scene_draw(passEncoder);
        passEncoder.end();

        //this.engine.Track("开始提交");

        this.engine.device.Submit([commandEncoder.finish()], (err) => {

            //this.engine.config.surface.present();

            //this.engine.Track("完成提交");
        });
    }

    /** @type {ploycloud.Canvas} UI布局实例。 */
    ui_design;
    /** @type {boolean} UI正在绘制。 */
    ui_drawing;
    /** 场景绘制。 */
    scene_draw;
}

/**
 * 创建UI布局实例0。
 * @param {ploycloud.Ploy3D} engine 引擎实例。
 * @returns 返回UI布局实例。
 */
export async function InitUI_0(engine) {
    const svg_map = await engine.Fetch("./packages/examples.ploy3d.1/ui/MacOdrum-LV5-floorplan-web.svg", null, "text");

    //engine.echarts.registerMap('MacOdrum-LV5-floorplan-web', { svg: svg_map });

    const ui_design = engine.ui.CreateElement(null, {
        creator: "Canvas",
        aspect_mode: "fit_in",
        aspect_ratio: 1920 / 1080,
        canvas: {
            width: 1920,
            height: 1080
        }
    });

    const main_vgrid = ui_design.AddChild({
        creator: "Layout_grid",
        horiz_align: "stretch",
        vert_align: "stretch",
        x: 10,
        y: 10,
        z: 10,
        w: 10,
        layout: {
            static: true,
            grid: {
                direction: "vert",
                spans: [2, 22]
            }
        }
    });
    /*
    const top_frame_0 = main_vgrid.panels[0].AddChild({
        creator: "Layout_frame_1",
        horiz_align: "stretch",
        vert_align: "stretch",
        layout: {
            static: true,
            frame_1: {
                design_guid: "CALYNUI_LAYOUT_FRAME1_BUILTIN_000002",
                design_config: {
                    bg_image: "./packages/examples.ploy3d.1/ui/科技背景1.png"
                }
            }
        }
    });

    const top_frame_text_0 = top_frame_0.panels[0].AddChild({
        creator: "Component_text",
        //启用scroll才有裁剪效果
        horiz_align: "stretch",
        vert_align: "stretch",
        component: {
            text: {
                text: "CalynUI—数字大屏模板库",
                padding: [4, 4, 4, 4]
            }
        },
        style: {
            font: "Impact",
            font_size: 64,
            font_color: "#C3DFEB"
        }
    });

    const top_frame_hgrid_0 = top_frame_0.panels[1].AddChild({
        creator: "Layout_grid",
        horiz_align: "stretch",
        vert_align: "stretch",
        layout: {
            static: true,
            grid: {
                direction: "horiz",
                spans: [6, 6, 6, 6],
                spacing: 10
            }
        }
    });

    const top_button_0 = top_frame_hgrid_0.panels[0].AddChild({
        creator: "Component_button",
        horiz_align: "center",
        vert_align: "center",
        auto_width: true,
        auto_height: true,
        component: {
            button: {
                text: "大数据平台"
            }
        },
        style: {
            bg_stroke: true
        }
    });

    const top_button_1 = top_frame_hgrid_0.panels[1].AddChild({
        creator: "Component_button",
        horiz_align: "center",
        vert_align: "center",
        auto_width: true,
        auto_height: true,
        component: {
            button: {
                text: "数字驾驶舱"
            }
        },
        style: {
            bg_fill: true,
            bg_fill_color: "rgba(100,162,209,1.0)"
        }
    });

    const top_button_2 = top_frame_hgrid_0.panels[2].AddChild({
        creator: "Component_button",
        horiz_align: "center",
        vert_align: "center",
        auto_width: true,
        auto_height: true,
        component: {
            button: {
                text: "数据资产"
            }
        },
        style: {
            bg_fill: true,
            bg_stroke: true,
            bg_fill_color: "#085BAB",
            bg_stroke_color: "green",
            bg_stroke_width: 4,
            font_color: "#CDE9F7",
        }
    });

    const top_button_3 = top_frame_hgrid_0.panels[3].AddChild({
        creator: "Component_button",
        horiz_align: "center",
        vert_align: "center",
        auto_width: true,
        auto_height: true,
        component: {
            button: {
                icon: "./packages/examples.ploy3d.1/ui/account.jpg",
                text: "数字应用"
            }
        },
        style: {
            bg_fill: true,
            bg_stroke: true,
            bg_stroke_dash: 0
        }
    });

    const main_hgrid = main_vgrid.panels[1].AddChild({
        creator: "Layout_grid",
        horiz_align: "stretch",
        vert_align: "stretch",
        x: 10,
        y: 10,
        z: 10,
        w: 10,
        layout: {
            static: true,
            grid: {
                direction: "horiz",
                spans: [6, 12, 6]
            }
        }
    });

    const left_frame_0 = main_hgrid.panels[0].AddChild({
        creator: "Layout_frame_1",
        horiz_align: "stretch",
        vert_align: "stretch",
        x: 10,
        y: 10,
        z: 10,
        w: 10,
        layout: {
            static: true,
            frame_1: {
                design_guid: "CALYNUI_LAYOUT_FRAME1_BUILTIN_000001"
            }
        }
    });

    const rightframe_0 = main_hgrid.panels[2].AddChild({
        creator: "Layout_frame_1",
        horiz_align: "stretch",
        vert_align: "stretch",
        x: 10,
        y: 10,
        z: 10,
        w: 10,
        layout: {
            static: true,
            frame_1: {
                design_guid: "CALYNUI_LAYOUT_FRAME1_BUILTIN_000001",
                design_config: {
                    direction: "right"
                }
            }
        }
    });

    const left_frame_0_vgrid = left_frame_0.panels[0].AddChild({
        creator: "Layout_grid",
        horiz_align: "stretch",
        vert_align: "stretch",
        x: 10,
        y: 10,
        z: 10,
        w: 10,
        layout: {
            static: true,
            grid: {
                direction: "vert",
                spans: [2, 13, 9]
            }
        }
    });

    const left_vgrid_text_0 = left_frame_0_vgrid.panels[0].AddChild({
        creator: "Component_text",
        horiz_align: "stretch",
        vert_align: "center",
        auto_height: true,
        component: {
            text: {
                text: "室内示意图",
                padding: [4, 4, 4, 4]
            }
        },
        style: {
            font_size: 32,
            font_color: "white"
        }
    });

    const echart_0 = left_frame_0_vgrid.panels[2].AddChild({
        creator: "Component_echart",
        horiz_align: "stretch",
        vert_align: "stretch",
        component: {
            theme: 'dark',
            echart: {
                title: {
                    text: '农业产值'
                },
                tooltip: {},
                backgroundColor: 'transparent',
                legend: {
                    data: ['总产值(亿元)', '增加值(亿元)'],
                    right: 0
                },
                grid: {
                    left: 0,
                    top: 36,
                    right: 0,
                    bottom: 0,
                    containLabel: true
                },
                xAxis: {
                    data: ['2018', '2019', '2020', '2021', '2022', '2023'],
                    gridIndex: 0
                },
                yAxis: {
                    gridIndex: 0
                },
                series: [
                    {
                        name: '总产值(亿元)',
                        type: 'bar',
                        data: [26, 32, 33, 34, 36, 39]
                    },
                    {
                        name: '增加值(亿元)',
                        type: 'line',
                        data: [5, 6, 1, 1, 2, 3]
                    }
                ]
            }
        }
    });

    const right_vlist = rightframe_0.panels[0].AddChild({
        creator: "Layout_vert_list",
        horiz_align: "stretch",
        vert_align: "stretch",
        enable_scroll: true,
        layout: {
            static: true,
            vert_list: {
                spacing: 4
            }
        }
    });

    const right_vlist_text_0 = right_vlist.AddChild({
        creator: "Component_text",
        horiz_align: "stretch",
        auto_height: true,
        component: {
            text: {
                text: "Ploy3D编辑器",
                padding: [4, 4, 4, 4]
            }
        },
        style: {
            font: "Impact",
            font_size: 32,
            font_color: "white"
        }
    });

    const right_vlist_image_0 = right_vlist.AddChild({
        creator: "Component_image",
        aspect_mode: "width_ctrl",
        horiz_align: "stretch",
        component: {
            image: {
                url: "./packages/examples.ploy3d.1/ui/ploy3d.jpg"
            }
        }
    });

    const right_vlist_text_1 = right_vlist.AddChild({
        creator: "Component_text",
        horiz_align: "stretch",
        auto_height: true,
        component: {
            text: {
                text: "支持可交互的ECharts图表",
                padding: [4, 4, 4, 4]
            }
        },
        style: {
            font: "Impact", // TODO 此处不设置字体会有问题，初始显示位置异常
            font_size: 32,
            font_color: "white"
        }
    });

    const right_vlist_echart_0 = right_vlist.AddChild({
        creator: "Component_echart",
        horiz_align: "stretch",
        aspect_mode: "width_ctrl",
        aspect_ratio: 16 / 9,
        component: {
            theme: 'dark',
            echart: {
                backgroundColor: 'transparent',
                title: {
                    text: '饼图程序调用高亮示例',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: [
                            { value: 335, name: '直接访问' },
                            { value: 310, name: '邮件营销' },
                            { value: 234, name: '联盟广告' },
                            { value: 135, name: '视频广告' },
                            { value: 1548, name: '搜索引擎' }
                        ],
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            }
        }
    });

    const right_vlist_text_2 = right_vlist.AddChild({
        creator: "Component_text",
        horiz_align: "stretch",
        auto_height: true,
        component: {
            text: {
                text: "支持文本手动和自动换行",
                padding: [4, 4, 4, 4]
            }
        },
        style: {
            font: "Impact",
            font_size: 32,
            font_color: "white"
        }
    });

    const right_vlist_text_3 = right_vlist.AddChild({
        creator: "Component_text",
        horiz_align: "stretch",
        auto_height: true,
        component: {
            text: {
                text: "    Ploy3D平台包括Ploy3D引擎SDK和卜云元宇宙内容创作平台。引擎SDK包括C++编译的WASM模块和TYPESCRIPT编译的JS模块，我们从底层内存管理模块开始，完整构建了一个轻量化高性能的WebGL引擎。\n    Ploy3D引擎内置有功能完善的GIS模块，支持在全球坐标系下搭建3D场景、支持地形、矢量3D瓦片、卫星影像、行政区划分矢量渲染，支持大气衍射天空效果，支持经纬度真实的昼夜变换，支持全景图融合叠加，实现地图与3D场景的完美结合。\n......",
                multi_line: true,
                padding: [4, 4, 4, 4]
            }
        },
        style: {
            font: "Impact",
            font_size: 24,
            font_color: "white"
        }
    });

    const left_vgrid_echart_1 = left_frame_0_vgrid.panels[1].AddChild({
        creator: "Component_echart",
        horiz_align: "stretch",
        vert_align: "stretch",
        component: {
            theme: 'dark',
            echart: {
                backgroundColor: 'transparent',
                title: {
                    text: 'Visit Route',
                    left: 'center',
                    bottom: 10
                },
                tooltip: {},
                geo: {
                    map: 'MacOdrum-LV5-floorplan-web',
                    roam: true,
                    emphasis: {
                        itemStyle: {
                            color: undefined
                        },
                        label: {
                            show: false
                        }
                    }
                },
                series: [
                    {
                        name: 'Route',
                        type: 'lines',
                        coordinateSystem: 'geo',
                        geoIndex: 0,
                        emphasis: {
                            label: {
                                show: false
                            }
                        },
                        polyline: true,
                        lineStyle: {
                            color: '#c46e54',
                            width: 5,
                            opacity: 1,
                            type: 'dotted'
                        },
                        effect: {
                            show: true,
                            period: 8,
                            color: '#a10000',
                            constantSpeed: 80,
                            trailLength: 0,
                            symbolSize: [20, 12],
                            symbol:
                                'path://M35.5 40.5c0-22.16 17.84-40 40-40s40 17.84 40 40c0 1.6939-.1042 3.3626-.3067 5H35.8067c-.2025-1.6374-.3067-3.3061-.3067-5zm90.9621-2.6663c-.62-1.4856-.9621-3.1182-.9621-4.8337 0-6.925 5.575-12.5 12.5-12.5s12.5 5.575 12.5 12.5a12.685 12.685 0 0 1-.1529 1.9691l.9537.5506-15.6454 27.0986-.1554-.0897V65.5h-28.7285c-7.318 9.1548-18.587 15-31.2715 15s-23.9535-5.8452-31.2715-15H15.5v-2.8059l-.0937.0437-8.8727-19.0274C2.912 41.5258.5 37.5549.5 33c0-6.925 5.575-12.5 12.5-12.5S25.5 26.075 25.5 33c0 .9035-.0949 1.784-.2753 2.6321L29.8262 45.5h92.2098z'
                        },
                        data: [
                            {
                                coords: [
                                    [110.6189462165178, 456.64349563895087],
                                    [124.10988522879458, 450.8570048730469],
                                    [123.9272226116071, 389.9520693708147],
                                    [61.58708083147317, 386.87942320312504],
                                    [61.58708083147317, 72.8954315876116],
                                    [258.29514854771196, 72.8954315876116],
                                    [260.75457021484374, 336.8559607533482],
                                    [280.5277985253906, 410.2406672084263],
                                    [275.948185765904, 528.0254369698661],
                                    [111.06907909458701, 552.795792593471],
                                    [118.87138231445309, 701.365737015904],
                                    [221.36468155133926, 758.7870354617745],
                                    [307.86195445452006, 742.164737297712],
                                    [366.8489324762834, 560.9895157073103],
                                    [492.8750778390066, 560.9895157073103],
                                    [492.8750778390066, 827.9639780566406],
                                    [294.9255269587053, 827.9639780566406],
                                    [282.79803391043527, 868.2476088113839]
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    });
    */
    return ui_design;
}
