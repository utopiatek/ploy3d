import * as Miaoverse from "../mod.js"

/** 网格资源实例。 */
export class Mesh extends Miaoverse.Resource<Mesh> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Mesh_kernel, ptr: Miaoverse.io_ptr, id: number) {
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

    /** 顶点缓存数组布局（组合标记）。 */
    public get vbLayout(): number {
        return this._impl.Get(this._ptr, "vertexBufferLayout");
    }

    /** 顶点缓存数量。 */
    public get vbCount(): number {
        return this._impl.Get(this._ptr, "vertexBufferCount");
    }

    /** 索引缓存格式：2 | 4。 */
    public get ibFormat(): number {
        return this._impl.Get(this._ptr, "indexBufferFormat");
    }

    /** 索引缓存数量（子网格数量）。 */
    public get ibCount(): number {
        return this._impl.Get(this._ptr, "submeshCount");
    }

    /** 网格顶点数量。 */
    public get vCount(): number {
        return this._impl.Get(this._ptr, "vertexCount");
    }

    /** 网格索引数量。 */
    public get iCount(): number {
        return this._impl.Get(this._ptr, "indexCount");
    }

    /** 包围盒中心。 */
    public get center(): ArrayLike<number> {
        return this._impl.Get(this._ptr, "center");
    }

    /** 包围盒范围。 */
    public get extents(): ArrayLike<number> {
        return this._impl.Get(this._ptr, "extents");
    }

    /** 蒙皮方法（0-默认，1-三角形混合蒙皮"TriAx"）。 */
    public get skinMethod(): number {
        return this._impl.Get(this._ptr, "skinMethod");
    }

    /** 顶点缓存数组指针。 */
    public get ptrVB(): Miaoverse.io_ptr {
        return this._impl.Get(this._ptr, "vertexBuffer");
    }

    /** 索引缓存数组指针。 */
    public get ptrIB(): Miaoverse.io_ptr {
        return this._impl.Get(this._ptr, "indexBuffer");
    }

    /** 网格数据指针。 */
    public get ptrData(): Miaoverse.io_ptr {
        return this._impl.Get(this._ptr, "meshData");
    }

    /** 顶点缓存数组。 */
    public get vertices() {
        return this._vertices;
    }

    /** 索引缓存数组。 */
    public get triangles() {
        return this._triangles;
    }

    /** 内核实现。 */
    private _impl: Mesh_kernel;
    /** 顶点缓存数组。 */
    private _vertices: {
        /** 缓存序号。 */
        index: number;
        /** 缓存数据布局。 */
        layout: number;
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }[];
    /** 索引缓存数组。 */
    private _triangles: {
        /** 缓存序号。 */
        index: number;
        /** 图元类型。 */
        topology: number;
        /** 缓存对象ID。 */
        buffer: number;
        /** 数据在缓存中的字节偏移。 */
        offset: number;
        /** 数据字节大小。 */
        size: number;
    }[];
}

/** 网格资源内核实现。 */
export class Mesh_kernel extends Miaoverse.Base_kernel<Mesh, typeof Mesh_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Mesh_member_index);
    }

    /**
     * 装载网格资源。
     * @param uri 网格资源URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回网格资源实例。
     */
    public async Load(uri: string, pkg?: Miaoverse.PackageReg) {
        const uuid = this._global.resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }

        if (this._instanceLut[uuid]) {
            return this._instanceLut[uuid];
        }

        // 加载装配材质资产 ===============-----------------------

        const desc = await this._global.resources.Load_file<Asset_mesh>("json", uri, true, pkg);
        if (!desc) {
            return null;
        }

        desc.data.uuid = uuid;

        // 创建实例 ===============-----------------------

        return this.Create(desc.data, desc.pkg);
    }

    /**
     * 运行时创建网格资源实例。
     * @param asset 网格资源描述符。
     * @param pkg 当前资源包注册信息。
     * @returns 返回网格资源实例。
     */
    public async Create(asset: Asset_mesh, pkg?: Miaoverse.PackageReg) {
        let type = asset.creater?.type;
        let data: Parameters<Mesh_kernel["MakeGeometry"]>[0] = null;
        let res: ReturnType<Mesh_kernel["MakeGeometry"]> = null;

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
            const meshdata = await this._global.resources.Load_file<ArrayBuffer>("arrayBuffer", asset.meshdata, true, pkg);
            if (!meshdata.data) {
                return null;
            }

            const meshdata_ptr = this._global.internal.System_New(meshdata.data.byteLength);

            this._global.env.bufferSet1(meshdata_ptr, meshdata.data, 0, meshdata.data.byteLength);

            res = [meshdata.data.byteLength, meshdata_ptr];
        }
        else if (asset.geometry) {
            const geometry = await this._global.resources.Load_file<ArrayBuffer>("arrayBuffer", asset.geometry, true, pkg);
            if (!geometry.data) {
                return null;
            }

            const uv_set = await this._global.resources.Load_file<ArrayBuffer>("arrayBuffer", asset.uv_set, true, pkg);
            if (!uv_set.data) {
                return null;
            }

            this._global.worker.importer.Gen_mesh_data(new DataView(geometry.data), new DataView(uv_set.data));

            return null;
        }

        // ========================-------------------------------

        const instance = this.Instance(res[1], res[0], asset.uuid);

        this._global.internal.System_Delete(res[1]);

        return instance;
    }

    /**
     * 实例化网格资源。
     * @param data_ptr 网格数据指针。
     * @param data_size 网格数据大小。
     * @param uuid 网格资源UUID。
     * @returns 返回网格资源实例。
     */
    public Instance(data_ptr: Miaoverse.io_ptr, data_size: number, uuid?: string) {
        const ptr = this._Create(data_ptr);

        if (!this._global.env.ptrValid(ptr)) {
            return null;
        }

        // ========================-------------------------------

        const id = this._instanceIdle;

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Mesh(this, ptr, id);

        this._instanceCount++;

        // 注册垃圾回收 ===============-----------------------

        this._gcList.push(instance);

        if (uuid) {
            this.Set(ptr, "uuid", uuid);
            this._instanceLut[uuid] = instance;
        }

        return instance;
    }

    /**
     * 从网格几何数据对象构建网格资源文件数据。
     * @param data 网格几何数据对象。
     * @returns 返回网格资源文件数据大小和数据指针。
     */
    public MakeGeometry(data: {
        /** 顶点数组。 */
        vertices: number[];
        /** 法线数组。 */
        normals: number[];
        /** 纹理坐标数组。 */
        uvs: number[];
        /** 子网格描述。 */
        groups: {
            /** 子网格图元类型。 */
            topology: Miaoverse.GLPrimitiveTopology;
            /** 子网格索引数组。 */
            indices: number[];
        }[];
    }) {
        let vCount = data.vertices.length / 3;

        let ibCount = data.groups.length;
        let iCount = 0;

        // 子网格：图元类型、索引数组偏移、索引数量、保留字段
        let ibList = [];

        for (let group of data.groups) {
            ibList.push(group.topology);
            ibList.push(iCount);
            ibList.push(group.indices.length);
            ibList.push(0);

            iCount += group.indices.length;
        }

        let intLength = 0;

        let headerOffset = intLength; intLength += 8;
        let ibListOffset = intLength; intLength += ibList.length;

        let indicesOffset = intLength; intLength += iCount;

        let verticesOffset = intLength; intLength += data.vertices.length;
        let normalsOffset = intLength; intLength += data.normals.length;
        let uvsOffset = intLength; intLength += data.uvs.length;

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

        const resource = this._CreateData(data_ptr);

        this._global.internal.System_Delete(data_ptr);

        return resource;
    }

    /**
     * 构建格栅网格。
     * @param desc 格栅网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeGrid(desc: {
        /** 格栅边长。 */
        size: number;
        /** 划分格子数（偶数）。 */
        divisions: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0] {

        // 中心点索引
        const center = desc.divisions / 2;
        // 小格子边长
        const step = desc.size / desc.divisions;
        // 格栅边长一半。
        const halfSize = desc.size / 2;

        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        const Add = (vertexX: number, vertexY: number, vertexZ: number) => {
            vertices.push(vertexX);
            vertices.push(vertexY);
            vertices.push(vertexZ);

            normals.push(0);
            normals.push(1);
            normals.push(0);

            uvs.push((vertexX / halfSize) * 0.5 + 0.5);
            uvs.push((vertexZ / halfSize) * 0.5 + 0.5);

            indices.push(indices.length);
        }

        for (let i = 0, k = -halfSize; i <= desc.divisions; i++, k += step) {
            // 横线左端点
            Add(-halfSize, 0, k);
            // 横线右端点
            Add(halfSize, 0, k);

            // 竖线上端点
            Add(k, 0, -halfSize);
            // 竖线下端点
            Add(k, 0, halfSize);
        }

        // =====================----------------------------------

        return {
            vertices,
            normals,
            uvs,
            groups: [{
                topology: Miaoverse.GLPrimitiveTopology.line_list,
                indices: indices
            }]
        };
    }

    /**
     * 构建立方体网格。
     * @param desc 立方体网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeBox(desc: {
        /** 立方体宽度。 */
        width: number,
        /** 立方体高度。 */
        height: number,
        /** 立方体深度。 */
        depth: number,
        /** 立方体宽度分段数。 */
        widthSegments: number,
        /** 立方体高度分段数。 */
        heightSegments: number,
        /** 立方体深度分段数。 */
        depthSegments: number
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0] {

        desc.widthSegments = Math.floor(desc.widthSegments);
        desc.heightSegments = Math.floor(desc.heightSegments);
        desc.depthSegments = Math.floor(desc.depthSegments);

        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        let numberOfVertices = 0;

        function buildPlane(u: number, v: number, w: number, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number) {

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

            // 生成顶点、法线和UV
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
                    vector[w] = depth > 0 ? 1 : - 1;

                    normals.push(vector[0]);
                    normals.push(vector[1]);
                    normals.push(vector[2]);

                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));

                    vertexCounter += 1;
                }
            }

            // 索引数据
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

        buildPlane(2, 1, 0, - 1, - 1, desc.depth, desc.height, desc.width, desc.depthSegments, desc.heightSegments); // px
        buildPlane(2, 1, 0, 1, - 1, desc.depth, desc.height, - desc.width, desc.depthSegments, desc.heightSegments); // nx
        buildPlane(0, 2, 1, 1, 1, desc.width, desc.depth, desc.height, desc.widthSegments, desc.depthSegments); // py
        buildPlane(0, 2, 1, 1, - 1, desc.width, desc.depth, - desc.height, desc.widthSegments, desc.depthSegments); // ny
        buildPlane(0, 1, 2, 1, - 1, desc.width, desc.height, desc.depth, desc.widthSegments, desc.heightSegments); // pz
        buildPlane(0, 1, 2, - 1, - 1, desc.width, desc.height, - desc.depth, desc.widthSegments, desc.heightSegments); // nz

        // =====================----------------------------------

        return {
            vertices,
            normals,
            uvs,
            groups: [{
                topology: Miaoverse.GLPrimitiveTopology.triangle_list,
                indices: indices
            }]
        };
    }

    /**
     * 构建球体网格。
     * @param desc 球体网格描述。
     * @returns 返回网格几何数据对象。
     */
    protected MakeSphere(desc: {
        radius: number;
        widthSegments: number;
        heightSegments: number;
        phiStart: number;
        phiLength: number;
        thetaStart: number;
        thetaLength: number;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0] {

        const widthSegments = Math.max(3, Math.floor(desc.widthSegments));
        const heightSegments = Math.max(2, Math.floor(desc.heightSegments));
        const thetaEnd = Math.min(desc.thetaStart + desc.thetaLength, Math.PI);

        let index = 0;
        let grid = [];

        // buffers

        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // generate vertices, normals and uvs

        const vertex = this._global.Vector3([0, 0, 0]);

        for (let iy = 0; iy <= heightSegments; iy++) {

            const verticesRow = [];

            const v = iy / heightSegments;

            // special case for the poles

            let uOffset = 0;

            if (iy === 0 && desc.thetaStart === 0) {

                uOffset = 0.5 / widthSegments;

            } else if (iy === heightSegments && thetaEnd === Math.PI) {

                uOffset = - 0.5 / widthSegments;

            }

            for (let ix = 0; ix <= widthSegments; ix++) {

                const u = ix / widthSegments;

                // vertex

                vertex.x = - desc.radius * Math.cos(desc.phiStart + u * desc.phiLength) * Math.sin(desc.thetaStart + v * desc.thetaLength);
                vertex.y = desc.radius * Math.cos(desc.thetaStart + v * desc.thetaLength);
                vertex.z = desc.radius * Math.sin(desc.phiStart + u * desc.phiLength) * Math.sin(desc.thetaStart + v * desc.thetaLength);

                vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                vertex.Normalize();
                normals.push(vertex.x, vertex.y, vertex.z);

                // uv

                uvs.push(u + uOffset, 1 - v);

                verticesRow.push(index++);

            }

            grid.push(verticesRow);

        }

        // indices

        for (let iy = 0; iy < heightSegments; iy++) {

            for (let ix = 0; ix < widthSegments; ix++) {

                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];

                if (iy !== 0 || desc.thetaStart > 0) indices.push(a, b, d);
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);

            }

        }

        return {
            vertices,
            normals,
            uvs,
            groups: [{
                topology: Miaoverse.GLPrimitiveTopology.triangle_list,
                indices: indices
            }]
        };
    }

    /**
     * 构建圆柱体网格。
     * @param desc 圆柱体网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeCylinder(desc: {
        /** 顶面半径。 */
        radiusTop: number,
        /** 底面半径。 */
        radiusBottom: number,
        /** 圆柱高度。 */
        height: number,
        /** 径向分段数。 */
        radialSegments: number,
        /** 高度分段数。 */
        heightSegments: number,
        /** 是否开口（删除顶面和底面）。 */
        openEnded: boolean,
        /** 径面起始弧度。 */
        thetaStart: number,
        /** 镜面弧长（2Π封闭）。 */
        thetaLength: number
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0] {

        desc.radialSegments = Math.floor(desc.radialSegments);
        desc.heightSegments = Math.floor(desc.heightSegments);

        // buffers

        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const groups: {
            topology: Miaoverse.GLPrimitiveTopology,
            indices: number[]
        }[] = [];
        let icount = 0;
        let indices: number[] = [];

        // helper variables

        let index = 0;
        let groupStart = 0;
        const indexArray: number[][] = [];
        const halfHeight = desc.height / 2;

        const scope = {
            addGroup: (start: number, count: number, materialIndex: number) => {
                if (icount !== start) {
                    console.error("icount !== start", icount, start);
                }

                if (indices.length !== count) {
                    console.error("indices.length !== count", indices.length, count);
                }

                icount += count;

                groups.push({
                    topology: Miaoverse.GLPrimitiveTopology.triangle_list,
                    indices: indices,
                });

                indices = [];
            }
        };

        // generate geometry

        generateTorso();

        if (desc.openEnded === false) {

            if (desc.radiusTop > 0) generateCap(true);
            if (desc.radiusBottom > 0) generateCap(false);

        }

        // build geometry

        function generateTorso() {

            const normal = { x: 0, y: 0, z: 0 };
            const vertex = { x: 0, y: 0, z: 0 };

            let groupCount = 0;

            // this will be used to calculate the normal
            const slope = (desc.radiusBottom - desc.radiusTop) / desc.height;

            // generate vertices, normals and uvs

            for (let y = 0; y <= desc.heightSegments; y++) {

                const indexRow: number[] = [];

                const v = y / desc.heightSegments;

                // calculate the radius of the current row

                const radius = v * (desc.radiusBottom - desc.radiusTop) + desc.radiusTop;

                for (let x = 0; x <= desc.radialSegments; x++) {

                    const u = x / desc.radialSegments;

                    const theta = u * desc.thetaLength + desc.thetaStart;

                    const sinTheta = Math.sin(theta);
                    const cosTheta = Math.cos(theta);

                    // vertex

                    vertex.x = radius * sinTheta;
                    vertex.y = - v * desc.height + halfHeight;
                    vertex.z = radius * cosTheta;
                    vertices.push(vertex.x, vertex.y, vertex.z);

                    // normal
                    normal.x = sinTheta;
                    normal.y = slope;
                    normal.z = cosTheta;
                    const s = (1.0 / Math.sqrt((normal.x * normal.x) + (normal.y * normal.y) + (normal.z * normal.z)));
                    normals.push(normal.x * s, normal.y * s, normal.z * s);

                    // uv

                    uvs.push(u, 1 - v);

                    // save index of vertex in respective row

                    indexRow.push(index++);

                }

                // now save vertices of the row in our index array

                indexArray.push(indexRow);

            }

            // generate indices

            for (let x = 0; x < desc.radialSegments; x++) {

                for (let y = 0; y < desc.heightSegments; y++) {

                    // we use the index array to access the correct indices

                    const a = indexArray[y][x];
                    const b = indexArray[y + 1][x];
                    const c = indexArray[y + 1][x + 1];
                    const d = indexArray[y][x + 1];

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);

                    // update group counter

                    groupCount += 6;

                }

            }

            // add a group to the geometry. this will ensure multi material support

            scope.addGroup(groupStart, groupCount, 0);

            // calculate new start value for groups

            groupStart += groupCount;

        }

        function generateCap(top: boolean) {

            // save the index of the first center vertex
            const centerIndexStart = index;

            const uv = { x: 0, y: 0 };
            const vertex = { x: 0, y: 0, z: 0 };

            let groupCount = 0;

            const radius = (top === true) ? desc.radiusTop : desc.radiusBottom;
            const sign = (top === true) ? 1 : - 1;

            // first we generate the center vertex data of the cap.
            // because the geometry needs one set of uvs per face,
            // we must generate a center vertex per face/segment

            for (let x = 1; x <= desc.radialSegments; x++) {

                // vertex

                vertices.push(0, halfHeight * sign, 0);

                // normal

                normals.push(0, sign, 0);

                // uv

                uvs.push(0.5, 0.5);

                // increase index

                index++;

            }

            // save the index of the last center vertex
            const centerIndexEnd = index;

            // now we generate the surrounding vertices, normals and uvs

            for (let x = 0; x <= desc.radialSegments; x++) {

                const u = x / desc.radialSegments;
                const theta = u * desc.thetaLength + desc.thetaStart;

                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                // vertex

                vertex.x = radius * sinTheta;
                vertex.y = halfHeight * sign;
                vertex.z = radius * cosTheta;
                vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                normals.push(0, sign, 0);

                // uv

                uv.x = (cosTheta * 0.5) + 0.5;
                uv.y = (sinTheta * 0.5 * sign) + 0.5;
                uvs.push(uv.x, uv.y);

                // increase index

                index++;

            }

            // generate indices

            for (let x = 0; x < desc.radialSegments; x++) {

                const c = centerIndexStart + x;
                const i = centerIndexEnd + x;

                if (top === true) {

                    // face top

                    indices.push(i, i + 1, c);

                } else {

                    // face bottom

                    indices.push(i + 1, i, c);

                }

                groupCount += 3;

            }

            // add a group to the geometry. this will ensure multi material support

            scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

            // calculate new start value for groups

            groupStart += groupCount;

        }

        // =====================----------------------------------

        return {
            vertices,
            normals,
            uvs,
            groups
        };
    }

    /**
     * 构建LOD瓦片网格。
     * @param desc LOD瓦片网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeLodTile(desc: {
        /** 平面宽度。 */
        width: number;
        /** 平面高度。 */
        height: number;
        /** 平面宽度分段数（偶数）。 */
        widthSegments: number;
        /** 平面高度分段数（偶数）。 */
        heightSegments: number;
        /** 是否翻转面朝向。 */
        flipFace?: boolean;
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0] {
        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

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

        // 分4个子区域构建索引数组，以此我们可以绘制更低精度的网格
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

                        // 从左上角开始

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
                topology: Miaoverse.GLPrimitiveTopology.triangle_list,
                indices: indices
            }]
        };
    }

    /**
     * 构建LOD平面网格。
     * @param desc LOD平面网格描述符。
     * @returns 返回网格几何数据对象。
     */
    protected MakeLodPlane(desc: {
        // LOD层级数（系统值8）
        levels: number,
        // LOD层级分块分段数（系统值64）
        segments: number
    }): Parameters<Mesh_kernel["MakeGeometry"]>[0] {

        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const groups = [];

        // 顶点计数
        let vcount = 0;

        // 每个块细分为64个晶格
        let cell_num = desc.segments;
        // 每个晶格大小（最内层晶格大小为1）
        let cell_size = Math.pow(2, desc.levels - 1);

        // 以4个晶格为一组
        let group_num = cell_num / 2;
        // 每个组大小
        let group_size = cell_size * 2;

        // 每个层划分为4*4=16块
        let block_num = 4;
        // 每个块大小
        let block_size = cell_size * cell_num;

        // 层数量
        let level_num = desc.levels;
        // 层原点坐标
        let level_orgin = block_size * block_num * -0.5;

        const Add = (vertexX: number, vertexZ: number, uvX: number, uvZ: number) => {
            vertices.push(vertexX);
            vertices.push(0);
            vertices.push(vertexZ);

            normals.push(0);
            normals.push(1);
            normals.push(0);

            uvs.push(uvX);
            uvs.push(uvZ);

            return vcount++;
        }

        for (let level = 0; level < level_num; level++) {
            let icount = 0;
            let triangles = [];

            for (let block_row = 0; block_row < block_num; block_row++) {
                for (let block_col = 0; block_col < block_num; block_col++) {
                    if (level_num - 1 > level) {
                        if (0 < block_row && block_num - 1 > block_row) {
                            if (0 < block_col && block_num - 1 > block_col) {
                                // 环形层中间的4个块不生成
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


                            // 上下边
                            if (0 == group_row && 0 == block_row) {
                                // 顶部
                                triangles[icount++] = (p00); triangles[icount++] = (p11); triangles[icount++] = (p20);
                                // 底部
                                triangles[icount++] = (p02); triangles[icount++] = (p12); triangles[icount++] = (p11);
                                triangles[icount++] = (p12); triangles[icount++] = (p22); triangles[icount++] = (p11);
                            }
                            else if (group_num - 1 == group_row && block_num - 1 == block_row) {
                                // 顶部
                                triangles[icount++] = (p00); triangles[icount++] = (p11); triangles[icount++] = (p10);
                                triangles[icount++] = (p10); triangles[icount++] = (p11); triangles[icount++] = (p20);
                                // 底部
                                triangles[icount++] = (p02); triangles[icount++] = (p22); triangles[icount++] = (p11);
                            }
                            else {
                                // 顶部
                                triangles[icount++] = (p00); triangles[icount++] = (p11); triangles[icount++] = (p10);
                                triangles[icount++] = (p10); triangles[icount++] = (p11); triangles[icount++] = (p20);
                                // 底部
                                triangles[icount++] = (p02); triangles[icount++] = (p12); triangles[icount++] = (p11);
                                triangles[icount++] = (p12); triangles[icount++] = (p22); triangles[icount++] = (p11);
                            }

                            // 左侧
                            if (0 == group_col && 0 == block_col) {
                                triangles[icount++] = (p00); triangles[icount++] = (p02); triangles[icount++] = (p11);
                            }
                            else {
                                triangles[icount++] = (p00); triangles[icount++] = (p01); triangles[icount++] = (p11);
                                triangles[icount++] = (p01); triangles[icount++] = (p02); triangles[icount++] = (p11);
                            }

                            // 右侧
                            if (group_num - 1 == group_col && block_num - 1 == block_col) {
                                triangles[icount++] = (p20); triangles[icount++] = (p11); triangles[icount++] = (p22);
                            }
                            else {
                                triangles[icount++] = (p20); triangles[icount++] = (p11); triangles[icount++] = (p21);
                                triangles[icount++] = (p21); triangles[icount++] = (p11); triangles[icount++] = (p22);
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
                topology: Miaoverse.GLPrimitiveTopology.triangle_list,
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

    /**
     * 实例化网格资源内核实例。
     * @param data 网格资源文件数据指针。
     * @returns 返回网格资源内核实例指针。
     */
    protected _Create: (data: Miaoverse.io_ptr) => Miaoverse.io_ptr;

    /**
     * 创建网格资源文件数据。
     * @param geo 网格几何数据指针（数据布局结构请查阅MakeGeometry代码）。
     * @returns 返回网格资源文件数据大小和数据指针。
     */
    protected _CreateData: (geo: Miaoverse.io_ptr) => [number, Miaoverse.io_ptr];

    /**
     * 解压CTM网格数据。
     * @param ctmData CTM数据指针。
     * @returns 返回网格几何数据大小和网格几何数据指针。
     */
    protected _DecodeCTM: (ctmData: Miaoverse.io_ptr) => [number, Miaoverse.io_ptr];
}

/** 几何UV数据内核实现。 */
export class UVSet_kernel extends Miaoverse.Base_kernel<any, typeof UVSet_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, UVSet_member_index);
    }
}

/** 几何数据内核实现。 */
export class Geometry_kernel extends Miaoverse.Base_kernel<any, typeof Geometry_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Geometry_member_index);
    }
}

/** 网格变形数据内核实现。 */
export class Morph_kernel extends Miaoverse.Base_kernel<any, typeof Morph_member_index> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, Morph_member_index);
    }
}

/** 网格资源内核实现的数据结构成员列表。 */
export const Mesh_member_index = {
    ...Miaoverse.Binary_member_index,

    unloaded: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    reserved: ["uarrayGet", "uarraySet", 3, 13] as Miaoverse.Kernel_member,

    geometryPTR: ["ptrGet", "ptrSet", 1, 16] as Miaoverse.Kernel_member,
    geometryUUID: ["uuidGet", "uuidSet", 3, 17] as Miaoverse.Kernel_member,

    uvPTR: ["ptrGet", "ptrSet", 1, 20] as Miaoverse.Kernel_member,
    uvUUID: ["uuidGet", "uuidSet", 3, 21] as Miaoverse.Kernel_member,

    skinPTR: ["ptrGet", "ptrSet", 1, 24] as Miaoverse.Kernel_member,
    skinUUID: ["uuidGet", "uuidSet", 3, 25] as Miaoverse.Kernel_member,

    morphPTR: ["ptrGet", "ptrSet", 1, 28] as Miaoverse.Kernel_member,
    morphUUID: ["uuidGet", "uuidSet", 3, 29] as Miaoverse.Kernel_member,

    vertexBufferLayout: ["uscalarGet", "uscalarSet", 1, 32] as Miaoverse.Kernel_member,
    vertexBufferCount: ["uscalarGet", "uscalarSet", 1, 33] as Miaoverse.Kernel_member,
    indexBufferFormat: ["uscalarGet", "uscalarSet", 1, 34] as Miaoverse.Kernel_member,
    submeshCount: ["uscalarGet", "uscalarSet", 1, 35] as Miaoverse.Kernel_member,

    vertexCount: ["uscalarGet", "uscalarSet", 1, 36] as Miaoverse.Kernel_member,
    indexCount: ["uscalarGet", "uscalarSet", 1, 37] as Miaoverse.Kernel_member,

    center: ["farrayGet", "farraySet", 3, 38] as Miaoverse.Kernel_member,
    extents: ["farrayGet", "farraySet", 3, 41] as Miaoverse.Kernel_member,

    skinMethod: ["uscalarGet", "uscalarSet", 1, 44] as Miaoverse.Kernel_member,

    vertexBuffer: ["ptrGet", "ptrSet", 1, 45] as Miaoverse.Kernel_member,
    indexBuffer: ["ptrGet", "ptrSet", 1, 46] as Miaoverse.Kernel_member,
    meshData: ["ptrGet", "ptrSet", 1, 47] as Miaoverse.Kernel_member,
} as const;

/** 几何UV数据内核实现的数据结构成员列表。 */
export const UVSet_member_index = {
    ...Miaoverse.Binary_member_index,

    vertexCount: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    uvCount: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    mappingCount: ["uscalarGet", "uscalarSet", 1, 14] as Miaoverse.Kernel_member,
    unloaded: ["uscalarGet", "uscalarSet", 1, 15] as Miaoverse.Kernel_member,

    unused0: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    unused1: ["uscalarGet", "uscalarSet", 1, 17] as Miaoverse.Kernel_member,
    uv: ["ptrGet", "ptrSet", 1, 18] as Miaoverse.Kernel_member,
    polygonVertexIndices: ["ptrGet", "ptrSet", 1, 19] as Miaoverse.Kernel_member,
} as const;

/** 几何数据内核实现的数据结构成员列表。 */
export const Geometry_member_index = {
    ...Miaoverse.Binary_member_index,

    defaultUVPTR: ["ptrGet", "ptrSet", 1, 12] as Miaoverse.Kernel_member,
    defaultUVUUID: ["uuidGet", "uuidSet", 3, 13] as Miaoverse.Kernel_member,

    type: ["uscalarGet", "uscalarSet", 1, 16] as Miaoverse.Kernel_member,
    edgeInterpolationMode: ["uscalarGet", "uscalarSet", 1, 17] as Miaoverse.Kernel_member,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 18] as Miaoverse.Kernel_member,
    polyCount: ["uscalarGet", "uscalarSet", 1, 19] as Miaoverse.Kernel_member,

    center: ["farrayGet", "farraySet", 3, 20] as Miaoverse.Kernel_member,
    extents: ["farrayGet", "farraySet", 3, 23] as Miaoverse.Kernel_member,

    vertices: ["ptrGet", "ptrSet", 1, 26] as Miaoverse.Kernel_member,
    polylist: ["ptrGet", "ptrSet", 1, 27] as Miaoverse.Kernel_member,

    materialGroupsNameLength: ["uscalarGet", "uscalarSet", 1, 28] as Miaoverse.Kernel_member,
    polygonGroupsNameLength: ["uscalarGet", "uscalarSet", 1, 29] as Miaoverse.Kernel_member,

    materialGroupsName: ["ptrGet", "ptrSet", 1, 30] as Miaoverse.Kernel_member,
    polygonGroupsName: ["ptrGet", "ptrSet", 1, 31] as Miaoverse.Kernel_member,
} as const;

/** 网格变形数据内核实现的数据结构成员列表。 */
export const Morph_member_index = {
    ...Miaoverse.Binary_member_index,

    type: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    deltasByteSize: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,

    min: ["farrayGet", "farraySet", 3, 14] as Miaoverse.Kernel_member,
    max: ["farrayGet", "farraySet", 3, 17] as Miaoverse.Kernel_member,

    textureWidth: ["uscalarGet", "uscalarSet", 1, 20] as Miaoverse.Kernel_member,
    vertexCount: ["uscalarGet", "uscalarSet", 1, 21] as Miaoverse.Kernel_member,
    targetCount: ["uscalarGet", "uscalarSet", 1, 22] as Miaoverse.Kernel_member,
    morphTargets: ["ptrGet", "ptrSet", 1, 23] as Miaoverse.Kernel_member,

    modifyCount: ["ptrGet", "ptrSet", 1, 24] as Miaoverse.Kernel_member,
    deltas: ["ptrGet", "ptrSet", 1, 25] as Miaoverse.Kernel_member,
    unloaded: ["uscalarGet", "uscalarSet", 1, 26] as Miaoverse.Kernel_member,
    unused3: ["uscalarGet", "uscalarSet", 1, 27] as Miaoverse.Kernel_member,

    reserved: ["uarrayGet", "uarraySet", 4, 28] as Miaoverse.Kernel_member,
} as const;

/** 网格资源描述符。 */
export interface Asset_mesh extends Miaoverse.Asset {
    /** 网格几何数据构建器。 */
    creater?: Asset_mesh_creater;
    /** 网格数据URI（集合了ASSET_MESH_GEOMETRY、ASSET_MESH_UVSET、ASSET_SKIN等数据）。 */
    meshdata?: string;
    /** 基础几何体URI（仅包含第1顶点缓存，meshdata与geometry&uv_set二选一）。 */
    geometry?: string;
    /** UV数据URI。 */
    uv_set?: string;
}

/** 网格几何数据构建器。 */
export interface Asset_mesh_creater {
    type: "grid" | "box" | "sphere" | "cylinder" | "lod_tile" | "lod_plane";
    grid?: Parameters<Mesh_kernel["MakeGrid"]>[0],
    box?: Parameters<Mesh_kernel["MakeBox"]>[0],
    sphere?: Parameters<Mesh_kernel["MakeSphere"]>[0],
    cylinder?: Parameters<Mesh_kernel["MakeCylinder"]>[0],
    lod_tile?: Parameters<Mesh_kernel["MakeLodTile"]>[0],
    lod_plane?: Parameters<Mesh_kernel["MakeLodPlane"]>[0]
}
