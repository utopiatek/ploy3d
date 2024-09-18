import * as Miaoverse from "../mod.js"

/** 变换组件控制器。 */
export class TransformCtrl {
    /**
     * 构造函数。
     * @param _global 模块实例对象。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        this._global = _global;
    }

    /**
     * 构建变换组件控制器对象。
     */
    public async Build(scene: Miaoverse.Scene) {
        const resources = this._global.resources;

        const MakeMaterial = async (color: number[]) => {
            // SCREEN混合模式，显示在最前端，GIZMO效果
            // BLEND_MODE.SCREEN << RENDER_FLAGS.BLEND_MODE_INDEX

            const material = await resources.Material.Create({
                uuid: "",
                classid: Miaoverse.CLASSID.ASSET_MATERIAL,
                name: "transform_ctrl " + color.join("_"),
                label: "transform_ctrl " + color.join("_"),

                shader: "1-1-1.miaokit.builtins:/shader/gltf_sketchfab/17-10_gltf_sketchfab.json",
                flags: Miaoverse.RENDER_FLAGS.ATTRIBUTES0 || (Miaoverse.BLEND_MODE.SCREEN << Miaoverse.RENDER_FLAGS.BLEND_MODE_INDEX),
                properties: {
                    textures: {},
                    vectors: {}
                }
            });

            if (material) {
                material.view.baseColorFactor = color;
            }

            return material;
        }

        const MakeCylinder = async (radiusTop: number, radiusBottom: number, height: number, radialSegments: number, heightSegments: number, openEnded: boolean, thetaStart: number, thetaLength: number) => {
            return resources.Mesh.Create({
                uuid: "",
                classid: 39,
                name: "transform_ctrl cylinder",
                label: "transform_ctrl cylinder",

                creater: {
                    type: "cylinder",
                    cylinder: {
                        radiusTop,
                        radiusBottom,
                        height,
                        radialSegments,
                        heightSegments,
                        openEnded,
                        thetaStart,
                        thetaLength
                    }
                }
            });
        }


        this.mesh_cube = await MakeCylinder(1.4142 * 0.5, 1.4142 * 0.5, 1.0, 4, 1, false, 0, Math.PI * 2);

        this.mesh_cone = await MakeCylinder(0, 1.4142, 1.0, 12, 1, false, 0, Math.PI * 2);

        this.mesh_arc = await MakeCylinder(1.4142 * 0.5, 1.4142 * 0.5, 0.05, 32, 1, true, 0, Math.PI * 2);

        this.mesh_fan = await MakeCylinder(1.4142 * 0.5, 1.4142 * 0.5, 0.05, 12, 1, false, 0, Math.PI * 0.5);

        this.mesh_cylinder = await MakeCylinder(1.4142 * 0.5, 1.4142 * 0.5, 1.0, 32, 1, false, 0, Math.PI * 2);


        this.mat_red_axis = await MakeMaterial([1, 0, 0, 1]);

        this.mat_green_axis = await MakeMaterial([0, 1, 0, 1]);

        this.mat_blue_axis = await MakeMaterial([0, 0, 1, 1]);


        this.mat_red_move = await MakeMaterial([1, 0, 0, 1]);

        this.mat_green_move = await MakeMaterial([0, 1, 0, 1]);

        this.mat_blue_move = await MakeMaterial([0, 0, 1, 1]);

        this.mat_yellow_move = await MakeMaterial([1, 1, 0, 1]);

        this.mat_purple_move = await MakeMaterial([1, 0, 1, 1]);

        this.mat_cyan_move = await MakeMaterial([0, 1, 1, 1]);


        this.mat_red_rot = await MakeMaterial([1, 0, 0, 1]);

        this.mat_green_rot = await MakeMaterial([0, 1, 0, 1]);

        this.mat_blue_rot = await MakeMaterial([0, 0, 1, 1]);


        this.mat_red_scale = await MakeMaterial([1, 0, 0, 1]);

        this.mat_green_scale = await MakeMaterial([0, 1, 0, 1]);

        this.mat_blue_scale = await MakeMaterial([0, 0, 1, 1]);

        this.mat_white_scale = await MakeMaterial([1, 1, 1, 1]);


        const composes = [
            // X
            [
                [this.mesh_cube, this.mat_red_axis, [0.25, 0, 0], [0, 0, -90], [0.0075, 0.5, 0.0075]],		// 0
                [this.mesh_cone, this.mat_red_move, [0.5, 0, 0], [0, 0, -90], [0.02828, 0.1, 0.02828]],		// 1
                [this.mesh_arc, this.mat_red_rot, [0, 0, 0], [0, 0, 90], [0.52, 0.5, 0.52]],				// 2
                [this.mesh_cube, this.mat_red_scale, [-0.5, 0, 0], [0, 45, 0], [0.08, 0.08, 0.08]],			// 3
            ],
            // Y
            [
                [this.mesh_cube, this.mat_green_axis, [0, 0.25, 0], [0, 0, 0], [0.0075, 0.5, 0.0075]],		// 4
                [this.mesh_cone, this.mat_green_move, [0, 0.5, 0], [0, 0, 0], [0.02828, 0.1, 0.02828]],		// 5
                [this.mesh_arc, this.mat_green_rot, [0, 0, 0], [0, 90, 0], [0.52, 0.5, 0.52]],				// 6
                [this.mesh_cube, this.mat_green_scale, [0, -0.5, 0], [0, 45, 0], [0.08, 0.08, 0.08]],		// 7
            ],
            // Z
            [
                [this.mesh_cube, this.mat_blue_axis, [0, 0, 0.25], [90, 0, 0], [0.0075, 0.5, 0.0075]],		// 8
                [this.mesh_cone, this.mat_blue_move, [0, 0, 0.5], [90, 0, 0], [0.02828, 0.1, 0.02828]],		// 9
                [this.mesh_arc, this.mat_blue_rot, [0, 0, 0], [90, 0, 0], [0.52, 0.5, 0.52]],				// 10
                [this.mesh_cube, this.mat_blue_scale, [0, 0, -0.5], [0, 45, 0], [0.08, 0.08, 0.08]],		// 11
            ],
            // &
            [
                [this.mesh_fan, this.mat_yellow_move, [0.05, 0.05, 0], [-90, 0, 0], [0.3, 0.01, 0.3]],		// 12
                [this.mesh_fan, this.mat_purple_move, [0.05, 0, 0.05], [0, 0, 0], [0.3, 0.01, 0.3]],		// 13
                [this.mesh_fan, this.mat_cyan_move, [0, 0.05, 0.05], [0, 0, 90], [0.3, 0.01, 0.3]],			// 14
                [this.mesh_cube, this.mat_white_scale, [0, 0, 0], [0, 45, 0], [0.08, 0.08, 0.08]],			// 15
            ],
            // R
            [
                [this.mesh_cylinder, this.mat_red_rot, [0, 0, -0.4], [0, 0, 90], [0.05, 0.03, 0.05]],		// 16
                [this.mesh_cylinder, this.mat_green_rot, [-0.4, 0, 0.0], [0, 0, 0], [0.05, 0.03, 0.05]],	// 17
                [this.mesh_cylinder, this.mat_blue_rot, [0, -0.4, 0.], [90, 0, 0], [0.05, 0.03, 0.05]],		// 18
            ]
        ];

        this.obj_root = await resources.Object.Create(scene);
        this.obj_root.staticWorld = true;
        this.obj_lut = {};
        this.obj_list = [];

        for (let i = 0; i < 5; i++) {
            const compose = composes[i];
            for (let j = 0; j < 4; j++) {
                const desc = compose[j];
                if (!desc) {
                    continue;
                }

                const object3D = await resources.Object.Create(scene);

                const meshRenderer = await resources.MeshRenderer.Create(desc[0] as Miaoverse.Mesh, [
                    {
                        slot: 0,
                        submesh: 0,
                        material: desc[1] as Miaoverse.Material
                    },
                    {
                        slot: 1,
                        submesh: 1,
                        material: desc[1] as Miaoverse.Material
                    },
                    {
                        slot: 2,
                        submesh: 2,
                        material: desc[1] as Miaoverse.Material
                    }
                ]);

                object3D.meshRenderer = meshRenderer;

                object3D.localPosition = this._global.Vector3(desc[2] as number[]);
                object3D.localRotation = (this._global.Vector3(desc[3] as number[])).toQuaternion();
                object3D.localScale = this._global.Vector3(desc[4] as number[]);

                object3D.SetParent(this.obj_root, false);

                this.obj_lut[object3D.internalPtr as any] = 4 * i + j;
                this.obj_list[4 * i + j] = object3D;
            }
        }

        return this;
    }

    /** 
     * 销毁变换组件控制器。
     */
    public Destroy() {
        this._ctrl = undefined;
        this._camPos = undefined;
        this._camDir = undefined;
        this._planeNor = undefined;
        this._planePos = undefined;
        this._planeDis = undefined;
        this._lastPos = undefined;
        this._lastScale = undefined;
        this._lastRot = undefined;

        // 手动销毁根对象即可
        this.obj_root.Destroy();
        this.obj_root = undefined;
        this.obj_list = undefined;
        this.obj_lut = undefined;

        // 网格资源自动释放

        this.mesh_cube = undefined;
        this.mesh_cone = undefined;
        this.mesh_arc = undefined;
        this.mesh_fan = undefined;
        this.mesh_cylinder = undefined;

        // 材质资源自动释放

        this.mat_red_axis = undefined;
        this.mat_green_axis = undefined;
        this.mat_blue_axis = undefined;

        this.mat_red_move = undefined;
        this.mat_green_move = undefined;
        this.mat_blue_move = undefined;
        this.mat_yellow_move = undefined;
        this.mat_purple_move = undefined;
        this.mat_cyan_move = undefined;

        this.mat_red_rot = undefined;
        this.mat_green_rot = undefined;
        this.mat_blue_rot = undefined;

        this.mat_red_scale = undefined;
        this.mat_green_scale = undefined;
        this.mat_blue_scale = undefined;
        this.mat_white_scale = undefined;
    }

    /**
     * 更新变换组件控制器。
     */
    public Update(camera: Miaoverse.Camera) {
        this._camPos = camera.wposition;
        this._camDir = camera.wdirection;

        const target = this._selectedObject;
        const objpos = target ? target.position : this._global.Vector3([0, 0, 0]);
        const objrot = target ? target.rotation : this._global.Quaternion([0, 0, 0, 1]);
        const dis = this._camPos.DistanceTo(objpos);
        const factor = dis * Math.min(1.0 * Math.tan(camera.fov * 0.5), 7);
        const scale = factor * 0.5;

        this.obj_root.localPosition = objpos;
        this.obj_root.localRotation = objrot;
        this.obj_root.localScale = this._global.Vector3([scale, scale, scale]);

        // Global.internal.Object3D_SetHighlight(this.obj_root.internalPtr, target ? 1 : 0, 1);
    }

    /**
     * 开始控制。
     * @param target 起始光标命中对象。
     * @returns 返回是否命中控制轴。
     */
    public Begin(target: Miaoverse.Object3D) {
        this._ctrl = this.obj_lut[target?.internalPtr];
        if (this._ctrl == undefined) {
            this._ctrl = -1;

            this._selectedObject = target;
        }

        let object3D = this._selectedObject;
        if (!object3D) {
            this._ctrl = -1;
            return false;
        }

        if (1 == this._ctrl || 5 == this._ctrl || 9 == this._ctrl) {
            this._planeNor = this._global.Vector3([-this._camDir.x, -this._camDir.y, -this._camDir.z]);
            this._planePos = object3D.position;
            this._planeDis = 0 - this._planeNor.Dot(this._planePos);
            this._lastPos = null;
        }
        else if (12 == this._ctrl || 13 == this._ctrl || 14 == this._ctrl) {
            if (12 == this._ctrl) {
                this._planeNor = object3D.forward;
            }
            else if (13 == this._ctrl) {
                this._planeNor = object3D.up;
            }
            else {
                this._planeNor = object3D.right;
            }

            this._planePos = object3D.position;
            this._planeDis = 0 - this._planeNor.Dot(this._planePos);
            this._lastPos = null;
        }
        else if (3 == this._ctrl || 7 == this._ctrl || 11 == this._ctrl) {
            this._planeNor = this._global.Vector3([-this._camDir.x, -this._camDir.y, -this._camDir.z]);
            this._planePos = object3D.position;
            this._planeDis = 0 - this._planeNor.Dot(this._planePos);
            this._lastPos = null;
            this._lastScale = object3D.localScale;
        }
        else if (15 == this._ctrl) {
            this._planeNor = this._global.Vector3([-this._camDir.x, -this._camDir.y, -this._camDir.z]);
            this._planePos = object3D.position;
            this._planeDis = 0 - this._planeNor.Dot(this._planePos);
            this._lastPos = null;
            this._lastScale = object3D.localScale;
        }
        else if (16 == this._ctrl || 17 == this._ctrl || 18 == this._ctrl) {
            if (16 == this._ctrl) {
                this._planeNor = object3D.right;
            }
            else if (17 == this._ctrl) {
                this._planeNor = object3D.up;
            }
            else {
                this._planeNor = object3D.forward;
            }

            this._planePos = object3D.position;
            this._planeDis = 0 - this._planeNor.Dot(this._planePos);
            this._lastPos = null;
            this._lastRot = object3D.rotation;
        }

        return this._ctrl > -1;
    }

    /**
     * 拖拽控制手柄。
     * @param camera 相机组件实例。
     * @param layerX 光标位置像素坐标X。
     * @param layerY 光标位置像素坐标Y。
     * @param clientWidth 事件源元素宽度。
     * @param clientHeight 事件源元素高度。
     */
    public Drag(camera: Miaoverse.Camera, layerX: number, layerY: number, clientWidth: number, clientHeight: number) {
        let object3D = this._selectedObject;
        if (!object3D) {
            return;
        }

        const x = layerX / clientWidth;
        const y = layerY / clientHeight;
        const pos = this.HitPlane(camera, x, y);
        if (!pos) {
            return;
        }

        if (!this._lastPos) {
            this._lastPos = pos;
            return;
        }

        if (1 == this._ctrl || 5 == this._ctrl || 9 == this._ctrl) {
            // 当前移动方向
            let dir: Miaoverse.Vector3 = null;

            if (1 == this._ctrl) {
                dir = object3D.right;
            }
            else if (5 == this._ctrl) {
                dir = object3D.up;
            }
            else {
                dir = object3D.forward;
            }

            // 当前鼠标坐标与起始对象坐标偏移
            const offset = pos.SubVector3(this._lastPos);
            // 当前移动方向上偏移距离
            const dis = offset.Dot(dir);
            // 当前对象最新坐标
            const curpos = this._planePos.AddVector3(dir.MultiplyScalar(dis));

            // 应用最新坐标
            object3D.position = curpos;
        }
        else if (12 == this._ctrl || 13 == this._ctrl || 14 == this._ctrl) {
            // 当前鼠标坐标与起始对象坐标偏移
            const offset = pos.SubVector3(this._lastPos);
            // 当前对象最新坐标
            const curpos = this._planePos.AddVector3(offset);

            // 应用最新坐标
            object3D.position = curpos;
        }
        else if (3 == this._ctrl || 7 == this._ctrl || 11 == this._ctrl) {
            // 当前移动方向
            let dir: Miaoverse.Vector3 = null;
            let values = [this._lastScale.x, this._lastScale.y, this._lastScale.z];
            let index = 0;

            if (3 == this._ctrl) {
                dir = object3D.right;
                index = 0;
            }
            else if (7 == this._ctrl) {
                dir = object3D.up;
                index = 1;
            }
            else {
                dir = object3D.forward;
                index = 2;
            }

            // 当前鼠标坐标与起始对象坐标偏移
            const offset = pos.SubVector3(this._planePos);
            // 当前移动方向上偏移距离
            const dis = offset.Dot(dir);
            // 当前缩放倍距
            const unit = this._lastPos.SubVector3(this._planePos).length;
            // 当前缩放倍数
            const scale = Math.max(-dis / unit, 0.0001);

            values[index] *= scale;

            // 应用最新坐标
            object3D.localScale = this._global.Vector3(values);

            // 控制点跟随拖动
            if (3 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([-0.5 * scale, 0, 0]);
            }
            else if (7 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, -0.5 * scale, 0]);
            }
            else {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, 0, -0.5 * scale]);
            }
        }
        else if (15 == this._ctrl) {
            // 当前移动方向（X轴）
            const dir = object3D.right;

            // 当前鼠标坐标与起始对象坐标偏移
            const offset = pos.SubVector3(this._planePos);
            // 当前移动方向上偏移距离
            const dis = offset.Dot(dir);
            // 当前缩放倍距
            let unit = 1.0;
            // 将X轴缩放控制点世界坐标到变换组件控制器世界坐标距离作为当前缩放倍距
            unit = this.obj_list[3].position.SubVector3(this._planePos).length;

            // 当前缩放倍数
            const scale = Math.max(dis / unit + 1, 0.0001);

            // 应用最新坐标
            object3D.localScale = this._global.Vector3([this._lastScale.x * scale, this._lastScale.y * scale, this._lastScale.z * scale]);

            // 控制点跟随拖动
            if (15 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0.5 * (scale - 1.0), 0, 0]);
            }
        }
        else if (16 == this._ctrl || 17 == this._ctrl || 18 == this._ctrl) {
            const begvec = this._lastPos.SubVector3(this._planePos);
            const curvec = pos.SubVector3(this._planePos);
            const nor = begvec.Cross(curvec);
            const sign = nor.Dot(this._planeNor);

            let rad = begvec.AngleTo(curvec);
            if (0 > sign) {
                rad = 2 * Math.PI - rad;
            }

            const index = this._ctrl - 16;
            const values = [0, 0, 0];

            values[index] = rad / Math.PI * 180;

            const curbias = this._global.Vector3(values);
            // 右乘，先对本地空间做旋转，再从本地空间转换到世界空间表示
            const currot = this._lastRot.Multiply(curbias.toQuaternion());

            object3D.rotation = currot;

            const beglen = begvec.length;
            const curlen = curvec.length;
            const pointPos = this._planePos.AddVector3(curvec.MultiplyScalar(beglen / curlen));

            // 控制点跟随拖动
            this.obj_list[this._ctrl].position = pointPos;
        }
    }

    /**
     * 结束控制。
     */
    public End(): void {
        // 还原缩放控制点位置
        if (3 == this._ctrl || 7 == this._ctrl || 11 == this._ctrl) {
            if (3 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([-0.5, 0, 0]);
            }
            else if (7 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, -0.5, 0]);
            }
            else {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, 0, -0.5]);
            }
        }
        else if (15 == this._ctrl) {
            if (15 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, 0, 0]);
            }
        }
        else if (16 == this._ctrl || 17 == this._ctrl || 18 == this._ctrl) {
            if (16 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, 0, -0.4]);
            }
            else if (17 == this._ctrl) {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([-0.4, 0, 0.0]);
            }
            else {
                this.obj_list[this._ctrl].localPosition = this._global.Vector3([0, -0.4, 0.]);
            }
        }

        this._ctrl = -1;
    }

    /**
     * 点击控制辅助平面。
     * @param camera 相机组件实例。
     * @param pointX pointX 屏幕坐标X[0, 1]。
     * @param pointY pointY 屏幕坐标X[0, 1]。
     */
    private HitPlane(camera: Miaoverse.Camera, pointX: number, pointY: number): Miaoverse.Vector3 {
        const ray = camera.ScreenPointToRay(pointX, pointY);
        const num = ray.dir.Dot(this._planeNor);
        const num2 = 0 - ray.origin.Dot(this._planeNor) - this._planeDis;
        if (Math.abs(num) < 0.01) {
            return;
        }

        const dis = num2 / num;
        if (dis < 0) {
            return;
        }

        const dir = ray.dir.MultiplyScalar(dis);

        const pos = ray.origin.AddVector3(dir);

        return pos;
    }

    /** 是否处于控制之中。 */
    public get ctrl() {
        return this._ctrl > -1;
    }

    /** 模块实例对象。 */
    private _global: Miaoverse.Ploy3D;
    private _selectedObject: Miaoverse.Object3D;

    private _ctrl: number;
    private _camPos: Miaoverse.Vector3;
    private _camDir: Miaoverse.Vector3;
    private _planeNor: Miaoverse.Vector3;
    private _planePos: Miaoverse.Vector3;
    private _planeDis: number;
    private _lastPos: Miaoverse.Vector3;
    private _lastScale: Miaoverse.Vector3;
    private _lastRot: Miaoverse.Quaternion;

    private obj_root: Miaoverse.Object3D;
    private obj_list: Miaoverse.Object3D[];
    private obj_lut: Record<number, number>;

    private mesh_cube: Miaoverse.Mesh;
    private mesh_cone: Miaoverse.Mesh;
    private mesh_arc: Miaoverse.Mesh;
    private mesh_fan: Miaoverse.Mesh;
    private mesh_cylinder: Miaoverse.Mesh;

    private mat_red_axis: Miaoverse.Material;
    private mat_green_axis: Miaoverse.Material;
    private mat_blue_axis: Miaoverse.Material;

    private mat_red_move: Miaoverse.Material;
    private mat_green_move: Miaoverse.Material;
    private mat_blue_move: Miaoverse.Material;
    private mat_yellow_move: Miaoverse.Material;
    private mat_purple_move: Miaoverse.Material;
    private mat_cyan_move: Miaoverse.Material;

    private mat_red_rot: Miaoverse.Material;
    private mat_green_rot: Miaoverse.Material;
    private mat_blue_rot: Miaoverse.Material;

    private mat_red_scale: Miaoverse.Material;
    private mat_green_scale: Miaoverse.Material;
    private mat_blue_scale: Miaoverse.Material;
    private mat_white_scale: Miaoverse.Material;
}
