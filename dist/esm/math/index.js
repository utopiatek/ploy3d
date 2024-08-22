export class VMath_kernel {
    constructor(_global) {
        this._global = _global;
        this.Quaternion_RotateVector = _global.internal.Quaternion_RotateVector;
        this.Quaternion_Multiply = _global.internal.Quaternion_Multiply;
        this.Quaternion_ToEulerAngles = _global.internal.Quaternion_ToEulerAngles;
        this.Quaternion_FromEulerAngles = _global.internal.Quaternion_FromEulerAngles;
        this.Quaternion_Invert = _global.internal.Quaternion_Invert;
        this.Matrix4x4_Invert = _global.internal.Matrix4x4_Invert;
        this.Matrix4x4_MultiplyVector = _global.internal.Matrix4x4_MultiplyVector;
        this.Matrix4x4_MultiplyMatrices = _global.internal.Matrix4x4_MultiplyMatrices;
        this.Matrix4x4_FromTransform = _global.internal.Matrix4x4_FromTransform;
    }
    Quaternion_RotateVector;
    Quaternion_Multiply;
    Quaternion_ToEulerAngles;
    Quaternion_FromEulerAngles;
    Quaternion_Invert;
    Quaternion_Slerp;
    Matrix4x4_Invert;
    Matrix4x4_MultiplyVector;
    Matrix4x4_MultiplyMatrices;
    Matrix4x4_FromTransform;
    _global;
}
//# sourceMappingURL=index.js.map