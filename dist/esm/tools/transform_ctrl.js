export class TransformCtrl {
    constructor(_global) {
        this._global = _global;
    }
    async Build(scene) {
        const resources = this._global.resources;
        const MakeMaterial = async (color) => {
            const material = await resources.Material.Create({
                uuid: "",
                classid: 32,
                name: "transform_ctrl " + color.join("_"),
                label: "transform_ctrl " + color.join("_"),
                shader: "1-1-1.miaokit.builtins:/shader/gltf_sketchfab/17-10_gltf_sketchfab.json",
                flags: 1 || (6 << 28),
                properties: {
                    textures: {},
                    vectors: {}
                }
            });
            if (material) {
                material.view.baseColorFactor = color;
            }
            return material;
        };
        const MakeCylinder = async (radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) => {
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
        };
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
            [
                [this.mesh_cube, this.mat_red_axis, [0.25, 0, 0], [0, 0, -90], [0.0075, 0.5, 0.0075]],
                [this.mesh_cone, this.mat_red_move, [0.5, 0, 0], [0, 0, -90], [0.02828, 0.1, 0.02828]],
                [this.mesh_arc, this.mat_red_rot, [0, 0, 0], [0, 0, 90], [0.52, 0.5, 0.52]],
                [this.mesh_cube, this.mat_red_scale, [-0.5, 0, 0], [0, 45, 0], [0.08, 0.08, 0.08]],
            ],
            [
                [this.mesh_cube, this.mat_green_axis, [0, 0.25, 0], [0, 0, 0], [0.0075, 0.5, 0.0075]],
                [this.mesh_cone, this.mat_green_move, [0, 0.5, 0], [0, 0, 0], [0.02828, 0.1, 0.02828]],
                [this.mesh_arc, this.mat_green_rot, [0, 0, 0], [0, 90, 0], [0.52, 0.5, 0.52]],
                [this.mesh_cube, this.mat_green_scale, [0, -0.5, 0], [0, 45, 0], [0.08, 0.08, 0.08]],
            ],
            [
                [this.mesh_cube, this.mat_blue_axis, [0, 0, 0.25], [90, 0, 0], [0.0075, 0.5, 0.0075]],
                [this.mesh_cone, this.mat_blue_move, [0, 0, 0.5], [90, 0, 0], [0.02828, 0.1, 0.02828]],
                [this.mesh_arc, this.mat_blue_rot, [0, 0, 0], [90, 0, 0], [0.52, 0.5, 0.52]],
                [this.mesh_cube, this.mat_blue_scale, [0, 0, -0.5], [0, 45, 0], [0.08, 0.08, 0.08]],
            ],
            [
                [this.mesh_fan, this.mat_yellow_move, [0.05, 0.05, 0], [-90, 0, 0], [0.3, 0.01, 0.3]],
                [this.mesh_fan, this.mat_purple_move, [0.05, 0, 0.05], [0, 0, 0], [0.3, 0.01, 0.3]],
                [this.mesh_fan, this.mat_cyan_move, [0, 0.05, 0.05], [0, 0, 90], [0.3, 0.01, 0.3]],
                [this.mesh_cube, this.mat_white_scale, [0, 0, 0], [0, 45, 0], [0.08, 0.08, 0.08]],
            ],
            [
                [this.mesh_cylinder, this.mat_red_rot, [0, 0, -0.4], [0, 0, 90], [0.05, 0.03, 0.05]],
                [this.mesh_cylinder, this.mat_green_rot, [-0.4, 0, 0.0], [0, 0, 0], [0.05, 0.03, 0.05]],
                [this.mesh_cylinder, this.mat_blue_rot, [0, -0.4, 0.], [90, 0, 0], [0.05, 0.03, 0.05]],
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
                const meshRenderer = await resources.MeshRenderer.Create(desc[0], [
                    {
                        slot: 0,
                        submesh: 0,
                        material: desc[1]
                    },
                    {
                        slot: 1,
                        submesh: 1,
                        material: desc[1]
                    },
                    {
                        slot: 2,
                        submesh: 2,
                        material: desc[1]
                    }
                ]);
                object3D.meshRenderer = meshRenderer;
                object3D.localPosition = this._global.Vector3(desc[2]);
                object3D.localRotation = (this._global.Vector3(desc[3])).toQuaternion();
                object3D.localScale = this._global.Vector3(desc[4]);
                object3D.SetParent(this.obj_root, false);
                this.obj_lut[object3D.internalPtr] = 4 * i + j;
                this.obj_list[4 * i + j] = object3D;
            }
        }
        return this;
    }
    Destroy() {
        this._ctrl = undefined;
        this._camPos = undefined;
        this._camDir = undefined;
        this._planeNor = undefined;
        this._planePos = undefined;
        this._planeDis = undefined;
        this._lastPos = undefined;
        this._lastScale = undefined;
        this._lastRot = undefined;
        this.obj_root.Destroy();
        this.obj_root = undefined;
        this.obj_list = undefined;
        this.obj_lut = undefined;
        this.mesh_cube = undefined;
        this.mesh_cone = undefined;
        this.mesh_arc = undefined;
        this.mesh_fan = undefined;
        this.mesh_cylinder = undefined;
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
    Update(camera) {
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
    }
    Begin(target) {
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
    Drag(camera, layerX, layerY, clientWidth, clientHeight) {
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
            let dir = null;
            if (1 == this._ctrl) {
                dir = object3D.right;
            }
            else if (5 == this._ctrl) {
                dir = object3D.up;
            }
            else {
                dir = object3D.forward;
            }
            const offset = pos.SubVector3(this._lastPos);
            const dis = offset.Dot(dir);
            const curpos = this._planePos.AddVector3(dir.MultiplyScalar(dis));
            object3D.position = curpos;
        }
        else if (12 == this._ctrl || 13 == this._ctrl || 14 == this._ctrl) {
            const offset = pos.SubVector3(this._lastPos);
            const curpos = this._planePos.AddVector3(offset);
            object3D.position = curpos;
        }
        else if (3 == this._ctrl || 7 == this._ctrl || 11 == this._ctrl) {
            let dir = null;
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
            const offset = pos.SubVector3(this._planePos);
            const dis = offset.Dot(dir);
            const unit = this._lastPos.SubVector3(this._planePos).length;
            const scale = Math.max(-dis / unit, 0.0001);
            values[index] *= scale;
            object3D.localScale = this._global.Vector3(values);
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
            const dir = object3D.right;
            const offset = pos.SubVector3(this._planePos);
            const dis = offset.Dot(dir);
            let unit = 1.0;
            unit = this.obj_list[3].position.SubVector3(this._planePos).length;
            const scale = Math.max(dis / unit + 1, 0.0001);
            object3D.localScale = this._global.Vector3([this._lastScale.x * scale, this._lastScale.y * scale, this._lastScale.z * scale]);
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
            const currot = this._lastRot.Multiply(curbias.toQuaternion());
            object3D.rotation = currot;
            const beglen = begvec.length;
            const curlen = curvec.length;
            const pointPos = this._planePos.AddVector3(curvec.MultiplyScalar(beglen / curlen));
            this.obj_list[this._ctrl].position = pointPos;
        }
    }
    End() {
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
    HitPlane(camera, pointX, pointY) {
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
    get ctrl() {
        return this._ctrl > -1;
    }
    _global;
    _selectedObject;
    _ctrl;
    _camPos;
    _camDir;
    _planeNor;
    _planePos;
    _planeDis;
    _lastPos;
    _lastScale;
    _lastRot;
    obj_root;
    obj_list;
    obj_lut;
    mesh_cube;
    mesh_cone;
    mesh_arc;
    mesh_fan;
    mesh_cylinder;
    mat_red_axis;
    mat_green_axis;
    mat_blue_axis;
    mat_red_move;
    mat_green_move;
    mat_blue_move;
    mat_yellow_move;
    mat_purple_move;
    mat_cyan_move;
    mat_red_rot;
    mat_green_rot;
    mat_blue_rot;
    mat_red_scale;
    mat_green_scale;
    mat_blue_scale;
    mat_white_scale;
}
//# sourceMappingURL=transform_ctrl.js.map