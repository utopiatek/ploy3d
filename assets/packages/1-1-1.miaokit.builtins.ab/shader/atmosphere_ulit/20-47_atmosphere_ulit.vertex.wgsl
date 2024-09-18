var<private> v_viewDir: vec3f = vec3f(0.0);
var<private> v_scattering: vec3f = vec3f(0.0);
var<private> v_attenuate: vec3f = vec3f(0.0);
var<private> v_attenuateGround: vec3f = vec3f(0.0);

// 计算射线与球面交点。
// p: 采样点（设为射线起点）；
// ray: 光照方向（设为射线方法，远离光源的方向）；
// o: 球中心坐标；
// r: 球半径；
// 算法解析：https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection.html
// 射线上所有点表示为：p + t * ray
// 球面上所有点表示为（假设球心位于0点）：x² + y² + z² = r²
// 当射线上点P² - R² = 0时，P为射线与球面交点，则
// |p + t * ray|² - r² = 0
// p² + (t * ray)² + 2 * (p * t * ray) - r²
// ray² * t² + (2 * p * ray) * t + p² - r²
// 令a = ray²、b = 2 * p * ray、c = p² - r²，则灯饰转换为
// a * t² + b * t + c = 0
// 当判别式b² - 4ac大于0时有两个根，等于0时有一个根，小于0时没有根
fn CalculateIntersection(p: vec3f, ray: vec3f, o: vec3f, r: f32) ->vec3f {
    // 使相关计算中圆心位于0点
	let p_ = p - o;

	// 由于射线方向为单位向量，所以a为1，以下计算将省略a
	// let a = dot(ray, ray);
	let b = 2.0 * dot(p_, ray);
	let c = dot(p_, p_) - (r * r);

	var det = (b * b) - (4.0 * c);
	// 令其必然产生一个交点（即使实际不相交）
	det = sqrt(max(0.0, det));
	
	let t = 0.5 * (-b - det);

	let intersect = p + t * ray;

	return intersect;
}

fn atmosphereVertex(worldPos: vec3f, eyePos: vec3f, lightDir: vec3f) {
	// 650 nm for red; 570 nm for green; 475 nm for blue
	let _Wave = vec3f(5.602046, 9.473285, 20.49314);
	let _ESun = vec3f(20.0, 20.0, 20.0);
	let _PlanetPos = vec3f(0.0, -6378137.0, 0.0);

	let _Sealevel = 6378137.0;
	let _OuterRadius = 6478137.0;
	let _SampleNum = 5.0;

	// Rayleigh scattering constant
	let _Kr = 0.0025;
	// Mie scattering constant
	let _Km = 0.001;
	// the altitude at which the atmosphere's average density is found
	let _H0 = 0.25;

	let invOuterH = 1.0 / (_OuterRadius - _Sealevel);

	var inScattering = vec3f(0.0, 0.0, 0.0);
	var outGroundScatteringAB = vec3f(0.0, 0.0, 0.0);

	// ============================-----------------------------------

	// 相机到观察点射线
	var ray = worldPos - eyePos;
	// 相机到观察点射线长度
	let depth = length(ray);
	// 相机到观察点射线单位化
	ray = ray / depth;

	// 在相机到观察点之间获取多个采样点，此为采样点间距
	let sampleStride = depth / _SampleNum;
	// 采样点迭代移动向量
	let sampleRay = ray * sampleStride;
	// 第一个采样点坐标
	var samplePoint = eyePos + sampleRay * 0.5;

	// 累积5个采样点接收到的大气散射光照
	for (var i = 0; i < 5; i++) {
        // 光源到P点射线与大气层边缘交点
		let crossPoint = CalculateIntersection(samplePoint, -lightDir, _PlanetPos, _OuterRadius);

        // 在散射采样点到相机路径上的5个点分别进行衰减
		let rayAP = (samplePoint - eyePos) / _SampleNum;
		let strideAP = length(rayAP);
		var sampleAP = eyePos + rayAP * 0.5;
		var outScatteringAP = vec3f(0.0, 0.0, 0.0);

		for (var m = 0; m < 5; m++) {
            // 累积衰减度
			outScatteringAP += exp(-(length(sampleAP - _PlanetPos) - _Sealevel) * invOuterH / _H0) * strideAP * invOuterH;
			sampleAP += rayAP;
		}

		outScatteringAP = 4.0 * 3.14 * (_Km + _Kr * _Wave) * outScatteringAP;

        // 在光源到散射点路径上的5个点分别进行衰减
		let rayPC = (crossPoint - samplePoint) / _SampleNum;
		let stridePC = length(rayPC);
		var samplePC = samplePoint + rayPC * 0.5;
		var outScatteringPC = vec3f(0.0, 0.0, 0.0);

		for (var n = 0; n < 5; n++) {
            // 累积衰减度
			outScatteringPC += exp(-(length(samplePC - _PlanetPos) - _Sealevel) * invOuterH / _H0) * stridePC * invOuterH;
			samplePC += rayPC;
		}

		outScatteringPC = 4.0 * 3.14 * (_Km + _Kr * _Wave) * outScatteringPC;

        // 累积太阳光散射
		inScattering += exp(-(length(samplePoint - _PlanetPos) - _Sealevel) * invOuterH / _H0) * sampleStride * invOuterH * exp(-outScatteringAP - outScatteringPC);
		samplePoint += sampleRay;

        // 累积地面基础色的衰减（因为离散采样所以结果并不准确）
		outGroundScatteringAB = outScatteringAP;// + outScatteringPC;
	}

	v_viewDir = eyePos - worldPos;
	v_scattering = inScattering * _ESun * _Kr * _Wave;
	v_attenuate = inScattering * _ESun * _Km;
	v_attenuateGround = exp(-outGroundScatteringAB);
}

// 顶点材质方法（在顶点着色器入口函数中先调用init_vertex_1/init_vertex_3，后调用material_vs）
fn material_vs() ->OutputVS {
    var output: OutputVS;
    
    output.instanceData = instance_data;

    // 在此可以添加一些用户代码来修改或提供模型空间顶点属性 ...

    let worldPosition = mulMat4x4Float3(instance_wfmMat, vec3f(mesh_position.x, mesh_position.y - 6378137.0, mesh_position.z));
    let worldNormal = instance_normal_wfmMat * mesh_normal;
    let worldTangent = instance_normal_wfmMat * mesh_tangent.xyz;

    // 在此可以添加一些用户代码来修改或提供世界空间顶点属性 ...

    atmosphereVertex(worldPosition.xyz, frameUniforms.camera_wPos.xyz, frameUniforms.sunlitDirection.xyz);
    
    output.viewPosition = instance_vfwMat * worldPosition;
    // 我们不需要在这里对向量进行归一化，即使矩阵中包含缩放
    // 我们确保instance_normal_wfmMat的缩放使法线所有通道小于1.0
    // 这样可以防止副法线超过fp16的范围，我们在插值后的片元着色器中重新归一化
    output.viewNormal = mulMat3x3Float3(instance_vfwMat, worldNormal);
    output.viewTangent = vec4f(mulMat3x3Float3(instance_vfwMat, worldTangent), mesh_tangent.w);
    output.uv = mesh_uv;

    // 在此可以添加一些用户代码来修改或提供相机空间顶点属性 ...

    output.clipPosition = frameUniforms.cfvMat * output.viewPosition;
    output.gl_Position = output.clipPosition;

    // 使用viewPosition字段保存v_viewDir
    output.viewPosition = vec4f(v_viewDir, 0.0);
    // 使用clipPosition字段保存v_scattering
    output.clipPosition = vec4f(v_scattering, 0.0);
    // 使用litPosition字段保存v_attenuate
    output.litPosition = vec4f(v_attenuate, 0.0);
    // 使用custom2字段保存v_attenuateGround
    output.custom2 = vec4f(v_attenuateGround, 0.0);

    return output;
}
