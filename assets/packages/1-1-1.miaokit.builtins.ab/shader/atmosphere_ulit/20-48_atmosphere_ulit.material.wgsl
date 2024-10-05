
// 瑞利散射（太阳光在P点散射的部分进入相机，小分子作用）
fn PhaseRayleigh(costheta: f32) -> f32 {
	return 0.75 * (1.0 + costheta * costheta);
}

// 米氏散射（太阳光在P点散射的部分进入相机，大颗粒作用）
fn PhaseMie(costheta: f32, g: f32, g2: f32) -> f32 {
	return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + costheta * costheta) / pow(1.0 + g2 - 2.0 * g * costheta, 1.5);
}

fn material_fs() {
    let lightDir = frameUniforms.sunlitDirection.xyz;

    let v_viewDir = inputs_position;
	let v_scattering = inputs_clipPosition.xyz;
	let v_attenuate = inputs_litPosition.xyz;
	let v_attenuateGround = inputs_custom2.xyz;

    let _G = -0.990;
    let _G2 = _G * _G;	

    let costheta = dot(normalize(v_viewDir), lightDir);
    let phaseMie = PhaseMie(costheta, _G, _G2);
    let phaseRayleigh = PhaseRayleigh(costheta);

    var color = vec3(0.0, 0.0, 0.0);
    color = v_scattering * phaseRayleigh + v_attenuate * phaseMie;
    color = color * (color * (color * 0.305306011 + 0.682171111) + 0.012522878);

    let linZ = ((inputs_depth / frameUniforms.vsmExponent) + 1.0) * 0.5;
    let depth_scatter_alpha = earlyProc(linZ, 0.0, color.b, 1.0, 0.0, 0.0, 1.0, false);

    if (SHADING_SKIP) {
        return;
    }

    let color_ = encodeRGBM(sRGBToLinear_vec3(color), uRGBMRange);

    material_emissive = color_.rgb;
    material_alpha = color_.a;
}
