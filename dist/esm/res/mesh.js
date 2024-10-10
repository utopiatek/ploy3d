import * as Miaoverse from "../mod.js";
export class Mesh extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._impl.Set(this._ptr, "id", id);
        const env = this._global.env;
        const ptrVB = this.ptrVB;
        const ptrIB = this.ptrIB;
        this._vertices = [];
        this._triangles = [];
        for (let i = 0; i < this.vbCount; i++) {
            const index5 = i * 5;
            this._vertices[i] = {
                get index() { return env.uscalarGet(ptrVB, index5 + 0); },
                get layout() { return env.uscalarGet(ptrVB, index5 + 1); },
                get buffer() { return env.uscalarGet(ptrVB, index5 + 2); },
                get offset() { return env.uscalarGet(ptrVB, index5 + 3); },
                get size() { return env.uscalarGet(ptrVB, index5 + 4); },
            };
        }
        for (let i = 0; i < this.ibCount; i++) {
            const index5 = i * 5;
            this._triangles[i] = {
                get index() { return env.uscalarGet(ptrIB, index5 + 0); },
                get topology() { return env.uscalarGet(ptrIB, index5 + 1); },
                get buffer() { return env.uscalarGet(ptrIB, index5 + 2); },
                get offset() { return env.uscalarGet(ptrIB, index5 + 3); },
                get size() { return env.uscalarGet(ptrIB, index5 + 4); },
            };
        }
    }
    Release() {
        if (this.internalPtr) {
            this._impl["_Release"](this.internalPtr);
        }
    }
    AddRef() {
        const refCount = this._impl.Get(this._ptr, "refCount");
        this._impl.Set(this._ptr, "refCount", refCount + 1);
    }
    Dispose() {
        if (this._skeleton?.skeleton) {
            this._global.internal.System_Delete(this._skeleton?.skeleton);
        }
        this._vertices = null;
        this._triangles = null;
        this._skeleton = null;
    }
    get vbLayout() {
        return this._impl.Get(this._ptr, "vertexBufferLayout");
    }
    get vbCount() {
        return this._impl.Get(this._ptr, "vertexBufferCount");
    }
    get ibFormat() {
        return this._impl.Get(this._ptr, "indexBufferFormat");
    }
    get ibCount() {
        return this._impl.Get(this._ptr, "submeshCount");
    }
    get vCount() {
        return this._impl.Get(this._ptr, "vertexCount");
    }
    get iCount() {
        return this._impl.Get(this._ptr, "indexCount");
    }
    get center() {
        return this._impl.Get(this._ptr, "center");
    }
    get extents() {
        return this._impl.Get(this._ptr, "extents");
    }
    get skinMethod() {
        return this._impl.Get(this._ptr, "skinMethod");
    }
    get ptrVB() {
        return this._impl.Get(this._ptr, "vertexBuffer");
    }
    get ptrIB() {
        return this._impl.Get(this._ptr, "indexBuffer");
    }
    get ptrData() {
        return this._impl.Get(this._ptr, "meshData");
    }
    get vertices() {
        return this._vertices;
    }
    get triangles() {
        return this._triangles;
    }
    get skeleton() {
        return this._skeleton;
    }
    _impl;
    _vertices;
    _triangles;
    _skeleton;
}
export class Mesh_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, Mesh_member_index);
    }
    async Load(uri, pkg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }
        if (this._instanceLut[uuid]) {
            return this._instanceLut[uuid];
        }
        const desc = await this._global.resources.Load_file("json", uri, true, pkg);
        if (!desc) {
            return null;
        }
        desc.data.uuid = uuid;
        return this.Create(desc.data, desc.pkg);
    }
    async Create(asset, pkg) {
        const env = this._global.env;
        const resources = this._global.resources;
        const internal = this._global.internal;
        let type = asset.creater?.type;
        let data = null;
        let res = null;
        if (type == "grid") {
            data = this.MakeGrid(asset.creater.grid);
        }
        else if (type == "box") {
            data = this.MakeBox(asset.creater.box);
        }
        else if (type == "sphere") {
            data = this.MakeSphere(asset.creater.sphere);
        }
        else if (type == "cylinder") {
            data = this.MakeCylinder(asset.creater.cylinder);
        }
        else if (type == "lod_tile") {
            data = this.MakeLodTile(asset.creater.lod_tile);
        }
        else if (type == "lod_plane") {
            data = this.MakeLodPlane(asset.creater.lod_plane);
        }
        if (data) {
            res = this.MakeGeometry(data);
        }
        else if (asset.meshdata) {
            const meshdata = await resources.Load_file("arrayBuffer", asset.meshdata, true, pkg);
            if (!meshdata.data) {
                return null;
            }
            const meshdata_ptr = internal.System_New(meshdata.data.byteLength);
            env.bufferSet1(meshdata_ptr, meshdata.data, 0, meshdata.data.byteLength);
            res = [meshdata.data.byteLength, meshdata_ptr];
        }
        else if (asset.geometry) {
            const geometry = await resources.Load_file("arrayBuffer", asset.geometry, true, pkg);
            if (!geometry.data) {
                return null;
            }
            const uv_set = await resources.Load_file("arrayBuffer", asset.uv_set, true, pkg);
            if (!uv_set.data) {
                return null;
            }
            const static_morph = [];
            if (asset.static_morph) {
                for (let morph of asset.static_morph) {
                    const weights = morph.weights.slice();
                    const deltas = await resources.Load_file("arrayBuffer", morph.deltas, true, pkg);
                    if (deltas) {
                        static_morph.push({ weights, deltas: deltas.data });
                    }
                }
            }
            const skin_uri = asset.skeleton_skin?.skin;
            const skin = skin_uri ? await resources.Load_file("arrayBuffer", skin_uri, true, pkg) : null;
            if (skin_uri && !skin) {
                console.error("网格骨骼蒙皮数据加载失败！", skin_uri);
            }
            const data = await this._global.worker.importer.Gen_mesh_data(new DataView(geometry.data), new DataView(uv_set.data), new DataView(skin.data), static_morph);
            const data_ptr = internal.System_New(data.byteLength);
            env.bufferSet1(data_ptr, data, 0, data.byteLength);
            res = this._CreateData(data_ptr, data.byteLength);
            internal.System_Delete(data_ptr);
        }
        const instance = this.Instance(res[1], res[0], asset.uuid);
        internal.System_Delete(res[1]);
        if (asset.skeleton_skin) {
            const skeleton = await resources.Load_file("arrayBuffer", asset.skeleton_skin.skeleton, true, pkg);
            if (skeleton && skeleton.data) {
                const skeleton_ptr = internal.System_New(skeleton.data.byteLength);
                env.bufferSet1(skeleton_ptr, skeleton.data, 0, skeleton.data.byteLength);
                const skeleton_data = env.uarrayRef(skeleton_ptr, Skeleton_member_index.initDatas[3], 3);
                env.uscalarSet(skeleton_ptr, 3, 1);
                if (skeleton_data[0]) {
                    skeleton_data[0] += skeleton_ptr;
                }
                if (skeleton_data[1]) {
                    skeleton_data[1] += skeleton_ptr;
                }
                if (skeleton_data[2]) {
                    skeleton_data[2] += skeleton_ptr;
                }
                instance["_skeleton"] = {
                    joints: asset.skeleton_skin.joints,
                    root: asset.skeleton_skin.root,
                    skeleton: skeleton_ptr
                };
            }
            else {
                console.error("网格骨骼蒙皮骨架数据加载失败！", asset.skeleton_skin);
            }
        }
        return instance;
    }
    Instance(data_ptr, data_size, uuid) {
        const ptr = this._Create(data_ptr);
        if (!this._global.env.ptrValid(ptr)) {
            return null;
        }
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Mesh(this, ptr, id);
        this._instanceCount++;
        this._gcList.push(() => {
            instance.Release();
        });
        if (uuid) {
            this.Set(ptr, "uuid", uuid);
            this._instanceLut[uuid] = instance;
        }
        return instance;
    }
    MakeGeometry(data) {
        let vCount = data.vertices.length / 3;
        let ibCount = data.groups.length;
        let iCount = 0;
        let ibList = [];
        for (let group of data.groups) {
            ibList.push(group.topology);
            ibList.push(iCount);
            ibList.push(group.indices.length);
            ibList.push(0);
            iCount += group.indices.length;
        }
        let intLength = 0;
        let headerOffset = intLength;
        intLength += 8;
        let ibListOffset = intLength;
        intLength += ibList.length;
        let indicesOffset = intLength;
        intLength += iCount;
        let verticesOffset = intLength;
        intLength += data.vertices.length;
        let normalsOffset = intLength;
        intLength += data.normals.length;
        let uvsOffset = intLength;
        intLength += data.uvs.length;
        const data_ptr = this._global.internal.System_New(4 * intLength);
        const env = this._global.env;
        env.uarraySet(data_ptr, headerOffset, [(1 + 2 + 4 + 8), iCount, vCount, ibCount, 0, 0, 0, 0]);
        env.uarraySet(data_ptr, ibListOffset, ibList);
        for (let i = 0; i < ibCount; i++) {
            env.uarraySet(data_ptr, indicesOffset + ibList[i * 4 + 1], data.groups[i].indices);
        }
        env.farraySet(data_ptr, verticesOffset, data.vertices);
        env.farraySet(data_ptr, normalsOffset, data.normals);
        env.farraySet(data_ptr, uvsOffset, data.uvs);
        const resource = this._CreateData(data_ptr, 4 * intLength);
        this._global.internal.System_Delete(data_ptr);
        return resource;
    }
    MakeGrid(desc) {
        const center = desc.divisions / 2;
        const step = desc.size / desc.divisions;
        const halfSize = desc.size / 2;
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const Add = (vertexX, vertexY, vertexZ) => {
            vertices.push(vertexX);
            vertices.push(vertexY);
            vertices.push(vertexZ);
            normals.push(0);
            normals.push(1);
            normals.push(0);
            uvs.push((vertexX / halfSize) * 0.5 + 0.5);
            uvs.push((vertexZ / halfSize) * 0.5 + 0.5);
            indices.push(indices.length);
        };
        for (let i = 0, k = -halfSize; i <= desc.divisions; i++, k += step) {
            Add(-halfSize, 0, k);
            Add(halfSize, 0, k);
            Add(k, 0, -halfSize);
            Add(k, 0, halfSize);
        }
        return {
            vertices,
            normals,
            uvs,
            groups: [{
                    topology: 1,
                    indices: indices
                }]
        };
    }
    MakeBox(desc) {
        desc.widthSegments = Math.floor(desc.widthSegments);
        desc.heightSegments = Math.floor(desc.heightSegments);
        desc.depthSegments = Math.floor(desc.depthSegments);
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        let numberOfVertices = 0;
        function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {
            const segmentWidth = width / gridX;
            const segmentHeight = height / gridY;
            const widthHalf = width / 2;
            const heightHalf = height / 2;
            const depthHalf = depth / 2;
            const gridX1 = gridX + 1;
            const gridY1 = gridY + 1;
            const vector = [0, 0, 0];
            let vertexCounter = 0;
            let groupCount = 0;
            for (let iy = 0; iy < gridY1; iy++) {
                const y = iy * segmentHeight - heightHalf;
                for (let ix = 0; ix < gridX1; ix++) {
                    const x = ix * segmentWidth - widthHalf;
                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;
                    vertices.push(vector[0]);
                    vertices.push(vector[1]);
                    vertices.push(vector[2]);
                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : -1;
                    normals.push(vector[0]);
                    normals.push(vector[1]);
                    normals.push(vector[2]);
                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));
                    vertexCounter += 1;
                }
            }
            for (let iy = 0; iy < gridY; iy++) {
                for (let ix = 0; ix < gridX; ix++) {
                    const a = numberOfVertices + ix + gridX1 * iy;
                    const b = numberOfVertices + ix + gridX1 * (iy + 1);
                    const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    const d = numberOfVertices + (ix + 1) + gridX1 * iy;
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }
            numberOfVertices += vertexCounter;
        }
        buildPlane(2, 1, 0, -1, -1, desc.depth, desc.height, desc.width, desc.depthSegments, desc.heightSegments);
        buildPlane(2, 1, 0, 1, -1, desc.depth, desc.height, -desc.width, desc.depthSegments, desc.heightSegments);
        buildPlane(0, 2, 1, 1, 1, desc.width, desc.depth, desc.height, desc.widthSegments, desc.depthSegments);
        buildPlane(0, 2, 1, 1, -1, desc.width, desc.depth, -desc.height, desc.widthSegments, desc.depthSegments);
        buildPlane(0, 1, 2, 1, -1, desc.width, desc.height, desc.depth, desc.widthSegments, desc.heightSegments);
        buildPlane(0, 1, 2, -1, -1, desc.width, desc.height, -desc.depth, desc.widthSegments, desc.heightSegments);
        return {
            vertices,
            normals,
            uvs,
            groups: [{
                    topology: 3,
                    indices: indices
                }]
        };
    }
    MakeSphere(desc) {
        const widthSegments = Math.max(3, Math.floor(desc.widthSegments));
        const heightSegments = Math.max(2, Math.floor(desc.heightSegments));
        const thetaEnd = Math.min(desc.thetaStart + desc.thetaLength, Math.PI);
        let index = 0;
        let grid = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const vertex = this._global.Vector3([0, 0, 0]);
        for (let iy = 0; iy <= heightSegments; iy++) {
            const verticesRow = [];
            const v = iy / heightSegments;
            let uOffset = 0;
            if (iy === 0 && desc.thetaStart === 0) {
                uOffset = 0.5 / widthSegments;
            }
            else if (iy === heightSegments && thetaEnd === Math.PI) {
                uOffset = -0.5 / widthSegments;
            }
            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;
                vertex.x = -desc.radius * Math.cos(desc.phiStart + u * desc.phiLength) * Math.sin(desc.thetaStart + v * desc.thetaLength);
                vertex.y = desc.radius * Math.cos(desc.thetaStart + v * desc.thetaLength);
                vertex.z = desc.radius * Math.sin(desc.phiStart + u * desc.phiLength) * Math.sin(desc.thetaStart + v * desc.thetaLength);
                vertices.push(vertex.x, vertex.y, vertex.z);
                vertex.Normalize();
                normals.push(vertex.x, vertex.y, vertex.z);
                uvs.push(u + uOffset, 1 - v);
                verticesRow.push(index++);
            }
            grid.push(verticesRow);
        }
        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];
                if (iy !== 0 || desc.thetaStart > 0)
                    indices.push(a, b, d);
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI)
                    indices.push(b, c, d);
            }
        }
        return {
            vertices,
            normals,
            uvs,
            groups: [{
                    topology: 3,
                    indices: indices
                }]
        };
    }
    MakeCylinder(desc) {
        desc.radialSegments = Math.floor(desc.radialSegments);
        desc.heightSegments = Math.floor(desc.heightSegments);
        const vertices = [];
        const normals = [];
        const uvs = [];
        const groups = [];
        let icount = 0;
        let indices = [];
        let index = 0;
        let groupStart = 0;
        const indexArray = [];
        const halfHeight = desc.height / 2;
        const scope = {
            addGroup: (start, count, materialIndex) => {
                if (icount !== start) {
                    console.error("icount !== start", icount, start);
                }
                if (indices.length !== count) {
                    console.error("indices.length !== count", indices.length, count);
                }
                icount += count;
                groups.push({
                    topology: 3,
                    indices: indices,
                });
                indices = [];
            }
        };
        generateTorso();
        if (desc.openEnded === false) {
            if (desc.radiusTop > 0)
                generateCap(true);
            if (desc.radiusBottom > 0)
                generateCap(false);
        }
        function generateTorso() {
            const normal = { x: 0, y: 0, z: 0 };
            const vertex = { x: 0, y: 0, z: 0 };
            let groupCount = 0;
            const slope = (desc.radiusBottom - desc.radiusTop) / desc.height;
            for (let y = 0; y <= desc.heightSegments; y++) {
                const indexRow = [];
                const v = y / desc.heightSegments;
                const radius = v * (desc.radiusBottom - desc.radiusTop) + desc.radiusTop;
                for (let x = 0; x <= desc.radialSegments; x++) {
                    const u = x / desc.radialSegments;
                    const theta = u * desc.thetaLength + desc.thetaStart;
                    const sinTheta = Math.sin(theta);
                    const cosTheta = Math.cos(theta);
                    vertex.x = radius * sinTheta;
                    vertex.y = -v * desc.height + halfHeight;
                    vertex.z = radius * cosTheta;
                    vertices.push(vertex.x, vertex.y, vertex.z);
                    normal.x = sinTheta;
                    normal.y = slope;
                    normal.z = cosTheta;
                    const s = (1.0 / Math.sqrt((normal.x * normal.x) + (normal.y * normal.y) + (normal.z * normal.z)));
                    normals.push(normal.x * s, normal.y * s, normal.z * s);
                    uvs.push(u, 1 - v);
                    indexRow.push(index++);
                }
                indexArray.push(indexRow);
            }
            for (let x = 0; x < desc.radialSegments; x++) {
                for (let y = 0; y < desc.heightSegments; y++) {
                    const a = indexArray[y][x];
                    const b = indexArray[y + 1][x];
                    const c = indexArray[y + 1][x + 1];
                    const d = indexArray[y][x + 1];
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                    groupCount += 6;
                }
            }
            scope.addGroup(groupStart, groupCount, 0);
            groupStart += groupCount;
        }
        function generateCap(top) {
            const centerIndexStart = index;
            const uv = { x: 0, y: 0 };
            const vertex = { x: 0, y: 0, z: 0 };
            let groupCount = 0;
            const radius = (top === true) ? desc.radiusTop : desc.radiusBottom;
            const sign = (top === true) ? 1 : -1;
            for (let x = 1; x <= desc.radialSegments; x++) {
                vertices.push(0, halfHeight * sign, 0);
                normals.push(0, sign, 0);
                uvs.push(0.5, 0.5);
                index++;
            }
            const centerIndexEnd = index;
            for (let x = 0; x <= desc.radialSegments; x++) {
                const u = x / desc.radialSegments;
                const theta = u * desc.thetaLength + desc.thetaStart;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                vertex.x = radius * sinTheta;
                vertex.y = halfHeight * sign;
                vertex.z = radius * cosTheta;
                vertices.push(vertex.x, vertex.y, vertex.z);
                normals.push(0, sign, 0);
                uv.x = (cosTheta * 0.5) + 0.5;
                uv.y = (sinTheta * 0.5 * sign) + 0.5;
                uvs.push(uv.x, uv.y);
                index++;
            }
            for (let x = 0; x < desc.radialSegments; x++) {
                const c = centerIndexStart + x;
                const i = centerIndexEnd + x;
                if (top === true) {
                    indices.push(i, i + 1, c);
                }
                else {
                    indices.push(i + 1, i, c);
                }
                groupCount += 3;
            }
            scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);
            groupStart += groupCount;
        }
        return {
            vertices,
            normals,
            uvs,
            groups
        };
    }
    MakeLodTile(desc) {
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const segment_width = desc.width / desc.widthSegments;
        const segment_height = desc.height / desc.heightSegments;
        for (let col = 0; col <= desc.widthSegments; col++) {
            for (let row = 0; row <= desc.heightSegments; row++) {
                vertices.push(col * segment_width);
                vertices.push(row * segment_height);
                vertices.push(0);
                normals.push(0);
                normals.push(0);
                normals.push(1);
                uvs.push(col / desc.widthSegments);
                uvs.push(row / desc.heightSegments);
            }
        }
        for (let i = 0; i < 2; i++) {
            const begRow = 0 == i ? 0 : desc.heightSegments / 2;
            const endRow = 0 == i ? desc.heightSegments / 2 : desc.heightSegments;
            for (let j = 0; j < 2; j++) {
                const begCol = 0 == j ? 0 : desc.widthSegments / 2;
                const endCol = 0 == j ? desc.widthSegments / 2 : desc.widthSegments;
                for (let col = begCol; col < endCol; col++) {
                    for (let row = begRow; row < endRow; row++) {
                        let vertex0 = (row * (desc.widthSegments + 1)) + col;
                        let vertex1 = vertex0 + 1;
                        let vertex2 = ((row + 1) * (desc.widthSegments + 1)) + col;
                        let vertex3 = vertex2 + 1;
                        if (!desc.flipFace) {
                            indices.push(vertex0);
                            indices.push(vertex3);
                            indices.push(vertex2);
                            indices.push(vertex0);
                            indices.push(vertex1);
                            indices.push(vertex3);
                        }
                        else {
                            indices.push(vertex0);
                            indices.push(vertex2);
                            indices.push(vertex3);
                            indices.push(vertex0);
                            indices.push(vertex3);
                            indices.push(vertex1);
                        }
                    }
                }
            }
        }
        return {
            vertices,
            normals,
            uvs,
            groups: [{
                    topology: 3,
                    indices: indices
                }]
        };
    }
    MakeLodPlane(desc) {
        const vertices = [];
        const normals = [];
        const uvs = [];
        const groups = [];
        let vcount = 0;
        let cell_num = desc.segments;
        let cell_size = Math.pow(2, desc.levels - 1);
        let group_num = cell_num / 2;
        let group_size = cell_size * 2;
        let block_num = 4;
        let block_size = cell_size * cell_num;
        let level_num = desc.levels;
        let level_orgin = block_size * block_num * -0.5;
        const Add = (vertexX, vertexZ, uvX, uvZ) => {
            vertices.push(vertexX);
            vertices.push(0);
            vertices.push(vertexZ);
            normals.push(0);
            normals.push(1);
            normals.push(0);
            uvs.push(uvX);
            uvs.push(uvZ);
            return vcount++;
        };
        for (let level = 0; level < level_num; level++) {
            let icount = 0;
            let triangles = [];
            for (let block_row = 0; block_row < block_num; block_row++) {
                for (let block_col = 0; block_col < block_num; block_col++) {
                    if (level_num - 1 > level) {
                        if (0 < block_row && block_num - 1 > block_row) {
                            if (0 < block_col && block_num - 1 > block_col) {
                                continue;
                            }
                        }
                    }
                    for (let group_row = 0; group_row < group_num; group_row++) {
                        for (let group_col = 0; group_col < group_num; group_col++) {
                            const top_x = level_orgin + block_col * block_size + group_size * group_col;
                            const bottom_z = level_orgin + block_row * block_size + group_size * group_row;
                            const uv_col = (block_col * cell_num) + (group_col * 2);
                            const uv_row = (block_row * cell_num) + (group_row * 2);
                            const uv_size = block_num * cell_num;
                            const p00 = Add(top_x, bottom_z, (uv_col) / uv_size, (uv_row) / uv_size);
                            const p10 = Add(top_x + cell_size, bottom_z, (uv_col + 1) / uv_size, (uv_row) / uv_size);
                            const p20 = Add(top_x + cell_size + cell_size, bottom_z, (uv_col + 2) / uv_size, (uv_row) / uv_size);
                            const p01 = Add(top_x, bottom_z + cell_size, (uv_col) / uv_size, (uv_row + 1) / uv_size);
                            const p11 = Add(top_x + cell_size, bottom_z + cell_size, (uv_col + 1) / uv_size, (uv_row + 1) / uv_size);
                            const p21 = Add(top_x + cell_size + cell_size, bottom_z + cell_size, (uv_col + 2) / uv_size, (uv_row + 1) / uv_size);
                            const p02 = Add(top_x, bottom_z + cell_size + cell_size, (uv_col) / uv_size, (uv_row + 2) / uv_size);
                            const p12 = Add(top_x + cell_size, bottom_z + cell_size + cell_size, (uv_col + 1) / uv_size, (uv_row + 2) / uv_size);
                            const p22 = Add(top_x + cell_size + cell_size, bottom_z + cell_size + cell_size, (uv_col + 2) / uv_size, (uv_row + 2) / uv_size);
                            if (0 == group_row && 0 == block_row) {
                                triangles[icount++] = (p00);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p20);
                                triangles[icount++] = (p02);
                                triangles[icount++] = (p12);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p12);
                                triangles[icount++] = (p22);
                                triangles[icount++] = (p11);
                            }
                            else if (group_num - 1 == group_row && block_num - 1 == block_row) {
                                triangles[icount++] = (p00);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p10);
                                triangles[icount++] = (p10);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p20);
                                triangles[icount++] = (p02);
                                triangles[icount++] = (p22);
                                triangles[icount++] = (p11);
                            }
                            else {
                                triangles[icount++] = (p00);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p10);
                                triangles[icount++] = (p10);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p20);
                                triangles[icount++] = (p02);
                                triangles[icount++] = (p12);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p12);
                                triangles[icount++] = (p22);
                                triangles[icount++] = (p11);
                            }
                            if (0 == group_col && 0 == block_col) {
                                triangles[icount++] = (p00);
                                triangles[icount++] = (p02);
                                triangles[icount++] = (p11);
                            }
                            else {
                                triangles[icount++] = (p00);
                                triangles[icount++] = (p01);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p01);
                                triangles[icount++] = (p02);
                                triangles[icount++] = (p11);
                            }
                            if (group_num - 1 == group_col && block_num - 1 == block_col) {
                                triangles[icount++] = (p20);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p22);
                            }
                            else {
                                triangles[icount++] = (p20);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p21);
                                triangles[icount++] = (p21);
                                triangles[icount++] = (p11);
                                triangles[icount++] = (p22);
                            }
                        }
                    }
                }
            }
            level_orgin += block_size;
            block_size *= 0.5;
            group_size *= 0.5;
            cell_size *= 0.5;
            groups.push({
                topology: 3,
                indices: triangles
            });
        }
        return {
            vertices,
            normals,
            uvs,
            groups
        };
    }
    Remove(id) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Mesh_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }
        instance["Dispose"]();
        instance["_impl"] = null;
        instance["_global"] = null;
        instance["_ptr"] = 0;
        instance["_id"] = this._instanceIdle;
        this._instanceIdle = id;
        this._instanceCount -= 1;
    }
    DisposeAll() {
        if (this._instanceCount != 0) {
            console.error("异常！存在未释放的网格资源", this._instanceCount);
        }
        this._global = null;
        this._members = null;
        this._instanceList = null;
        this._instanceLut = null;
        this._gcList = null;
    }
    _Create;
    _Release;
    _CreateData;
    _DecodeCTM;
    _AutoFit;
    _gcList = [];
}
export const Mesh_member_index = {
    ...Miaoverse.Binary_member_index,
    unloaded: ["uscalarGet", "uscalarSet", 1, 12],
    reserved: ["uarrayGet", "uarraySet", 3, 13],
    geometryPTR: ["ptrGet", "ptrSet", 1, 16],
    geometryUUID: ["uuidGet", "uuidSet", 3, 17],
    uvPTR: ["ptrGet", "ptrSet", 1, 20],
    uvUUID: ["uuidGet", "uuidSet", 3, 21],
    skinPTR: ["ptrGet", "ptrSet", 1, 24],
    skinUUID: ["uuidGet", "uuidSet", 3, 25],
    morphPTR: ["ptrGet", "ptrSet", 1, 28],
    morphUUID: ["uuidGet", "uuidSet", 3, 29],
    vertexBufferLayout: ["uscalarGet", "uscalarSet", 1, 32],
    vertexBufferCount: ["uscalarGet", "uscalarSet", 1, 33],
    indexBufferFormat: ["uscalarGet", "uscalarSet", 1, 34],
    submeshCount: ["uscalarGet", "uscalarSet", 1, 35],
    vertexCount: ["uscalarGet", "uscalarSet", 1, 36],
    indexCount: ["uscalarGet", "uscalarSet", 1, 37],
    center: ["farrayGet", "farraySet", 3, 38],
    extents: ["farrayGet", "farraySet", 3, 41],
    skinMethod: ["uscalarGet", "uscalarSet", 1, 44],
    vertexBuffer: ["ptrGet", "ptrSet", 1, 45],
    indexBuffer: ["ptrGet", "ptrSet", 1, 46],
    meshData: ["ptrGet", "ptrSet", 1, 47],
};
export const UVSet_member_index = {
    ...Miaoverse.Binary_member_index,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 12],
    uvCount: ["uscalarGet", "uscalarSet", 1, 13],
    mappingCount: ["uscalarGet", "uscalarSet", 1, 14],
    unloaded: ["uscalarGet", "uscalarSet", 1, 15],
    unused0: ["uscalarGet", "uscalarSet", 1, 16],
    unused1: ["uscalarGet", "uscalarSet", 1, 17],
    uv: ["ptrGet", "ptrSet", 1, 18],
    polygonVertexIndices: ["ptrGet", "ptrSet", 1, 19],
};
export const Geometry_member_index = {
    ...Miaoverse.Binary_member_index,
    defaultUVPTR: ["ptrGet", "ptrSet", 1, 12],
    defaultUVUUID: ["uuidGet", "uuidSet", 3, 13],
    type: ["uscalarGet", "uscalarSet", 1, 16],
    edgeInterpolationMode: ["uscalarGet", "uscalarSet", 1, 17],
    vertexCount: ["uscalarGet", "uscalarSet", 1, 18],
    polyCount: ["uscalarGet", "uscalarSet", 1, 19],
    center: ["farrayGet", "farraySet", 3, 20],
    extents: ["farrayGet", "farraySet", 3, 23],
    vertices: ["ptrGet", "ptrSet", 1, 26],
    polylist: ["ptrGet", "ptrSet", 1, 27],
    materialGroupsNameLength: ["uscalarGet", "uscalarSet", 1, 28],
    polygonGroupsNameLength: ["uscalarGet", "uscalarSet", 1, 29],
    materialGroupsName: ["ptrGet", "ptrSet", 1, 30],
    polygonGroupsName: ["ptrGet", "ptrSet", 1, 31],
};
export const Morph_member_index = {
    ...Miaoverse.Binary_member_index,
    type: ["uscalarGet", "uscalarSet", 1, 12],
    deltasByteSize: ["uscalarGet", "uscalarSet", 1, 13],
    min: ["farrayGet", "farraySet", 3, 14],
    max: ["farrayGet", "farraySet", 3, 17],
    textureWidth: ["uscalarGet", "uscalarSet", 1, 20],
    vertexCount: ["uscalarGet", "uscalarSet", 1, 21],
    targetCount: ["uscalarGet", "uscalarSet", 1, 22],
    morphTargets: ["ptrGet", "ptrSet", 1, 23],
    deltaCounts: ["ptrGet", "ptrSet", 1, 24],
    deltas: ["ptrGet", "ptrSet", 1, 25],
    reserved104: ["uscalarGet", "uscalarSet", 1, 26],
    reserved108: ["uscalarGet", "uscalarSet", 1, 27],
};
export const Skin_member_index = {
    ...Miaoverse.Binary_member_index,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 12],
    method: ["uscalarGet", "uscalarSet", 1, 13],
    reserved56: ["uscalarGet", "uscalarSet", 1, 14],
    vertices: ["ptrGet", "ptrSet", 1, 15],
};
export const Skeleton_member_index = {
    ...Miaoverse.Binary_member_index,
    flags: ["uscalarGet", "uscalarSet", 1, 12],
    jointCount: ["uscalarGet", "uscalarSet", 1, 13],
    jointRootIndex: ["uscalarGet", "uscalarSet", 1, 14],
    jointsNameLength: ["uscalarGet", "uscalarSet", 1, 15],
    reserved64: ["uscalarGet", "uscalarSet", 1, 16],
    initDatas: ["ptrGet", "ptrSet", 1, 17],
    inverseBindMatrices: ["ptrGet", "ptrSet", 1, 18],
    jointsName: ["ptrGet", "ptrSet", 1, 19],
};
