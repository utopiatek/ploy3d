import * as Miaoverse from "../mod.js";
/** 变换组件控制器。 */
export declare class TransformCtrl {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 构建变换组件控制器对象。
     */
    Build(scene: Miaoverse.Scene): Promise<this>;
    /**
     * 销毁变换组件控制器。
     */
    Destroy(): void;
    /**
     * 更新变换组件控制器。
     */
    Update(camera: Miaoverse.Camera): void;
    /**
     * 开始控制。
     * @param target 起始光标命中对象。
     * @returns 返回是否命中控制轴。
     */
    Begin(target: Miaoverse.Object3D): boolean;
    /**
     * 拖拽控制手柄。
     * @param camera 相机组件实例。
     * @param layerX 光标位置像素坐标X。
     * @param layerY 光标位置像素坐标Y。
     * @param clientWidth 事件源元素宽度。
     * @param clientHeight 事件源元素高度。
     */
    Drag(camera: Miaoverse.Camera, layerX: number, layerY: number, clientWidth: number, clientHeight: number): void;
    /**
     * 结束控制。
     */
    End(): void;
    /**
     * 点击控制辅助平面。
     * @param camera 相机组件实例。
     * @param pointX pointX 屏幕坐标X[0, 1]。
     * @param pointY pointY 屏幕坐标X[0, 1]。
     */
    private HitPlane;
    /** 是否处于控制之中。 */
    get ctrl(): boolean;
    /** 模块实例对象。 */
    private _global;
    private _selectedObject;
    private _ctrl;
    private _camPos;
    private _camDir;
    private _planeNor;
    private _planePos;
    private _planeDis;
    private _lastPos;
    private _lastScale;
    private _lastRot;
    private obj_root;
    private obj_list;
    private obj_lut;
    private mesh_cube;
    private mesh_cone;
    private mesh_arc;
    private mesh_fan;
    private mesh_cylinder;
    private mat_red_axis;
    private mat_green_axis;
    private mat_blue_axis;
    private mat_red_move;
    private mat_green_move;
    private mat_blue_move;
    private mat_yellow_move;
    private mat_purple_move;
    private mat_cyan_move;
    private mat_red_rot;
    private mat_green_rot;
    private mat_blue_rot;
    private mat_red_scale;
    private mat_green_scale;
    private mat_blue_scale;
    private mat_white_scale;
}
