
@group(3) @binding(0) var<storage, read> inputBuffer: array<f32>;
@group(3) @binding(1) var<storage, read_write> outputBuffer: array<f32>;

@compute @workgroup_size(4)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    outputBuffer[index] = inputBuffer[index] + 1.54321;
}
