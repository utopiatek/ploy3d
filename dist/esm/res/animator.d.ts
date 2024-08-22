import * as Miaoverse from "../mod.js";
/** 动画组件实例。 */
export declare class Animator extends Miaoverse.Resource<Animator> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    constructor(impl: Animator_kernel, ptr: Miaoverse.io_ptr, id: number);
    /**
     * 添加动画片段实例。
     * @param data 动画片段数据。
     * @returns 返回动画片段实例索引。
     */
    AddClip(data: AnimationClip): number;
    /**
     * 更新动画帧。
     */
    Update(): void;
    /**
     * 采样动画片段。
     * @param _clip 动画片段索引。
     * @param _curTS 当前时间。
     * @param _startTS 起始播放时间
     * @returns
     */
    SampleClip(_clip: number, _curTS?: number, _startTS?: number): void;
    /**
     * 设置动画关节帧数据。
     * @param target 驱动目标对象索引。
     * @param attr 目标属性类型。
     * @param value 属性值。
     */
    SetValue(target: number, attr: number, value: number[]): void;
    /** 动画控制器。 */
    get ctrl(): Miaoverse.AnimationCtrl;
    /** 动画驱动目标数组。 */
    set targets(targets: Miaoverse.Object3D[]);
    get targets(): Miaoverse.Object3D[];
    /** 启用动画播放。 */
    set enabled(b: boolean);
    get enabled(): boolean;
    /** 内核实现。 */
    private _impl;
    /** 是否启用动画播放。 */
    private _enabled;
    /** 引用计数。 */
    private _refCount;
    /** 动画控制器。 */
    private _ctrl;
    /** 动画驱动目标数组。 */
    private _targets;
    /** 动画片段数组。 */
    private _clips;
}
/** 动画片段实例。 */
export declare class AnimationClip {
    /**
     * 构造函数。
     * @param _data 动画片段数据。
     * @param _animations 动画集。
     */
    constructor(_data: Uint32Array, _animations: AnimationClip["_animations"]);
    /** 当前动画片段在所在动画数据包中的索引。 */
    get index(): number;
    /** 动画片段时间线上最大时间戳。 */
    get timestampMax(): number;
    /**  驱动目标对象数量。 */
    get targetCount(): number;
    /** 动画驱动通道数组。 */
    get channels(): {
        /** 关键帧数据采样器索引。 */
        sampler: number;
        /** 驱动目标索引。 */
        target: number;
        /** 驱动属性类型枚举。 */
        attr: number;
    }[];
    /** 动画数据采样器数组。 */
    get samplers(): {
        /** 最大关键帧时间戳。 */
        timestampMax: number;
        /** 关键帧时间戳数组。 */
        timestamps: Float32Array;
        /** 关键帧之间的插值方式：0-LINEAR、1-STEP、2-CUBICSPLINE。 */
        interpolation: number;
        /** 关键帧数据数组（长度等同timestamps）。 */
        keyframes: Float32Array[];
    }[];
    /** 动画集。 */
    private _animations;
    /** 动画片段数据。 */
    private _data;
    /** 动画驱动通道数组。 */
    private _channels;
    /** 动画数据采样器数组。 */
    private _samplers;
}
/**
 * 动画控制器。
 * 装载若干个动画片段，通过状态机管理这些动画片段的播放程序。
 */
export declare class AnimationCtrl {
    /**
     * 构造函数。
     * @param _animator 动画组件实例。
     */
    constructor(_animator: Animator);
    /**
     * 初始化动画状态机。
     * @param states 状态节点列表。
     * @param triggers 状态触发器列表。
     */
    Init(states: AnimationState[], triggers: AnimationTrigger[]): void;
    /**
     * 更新动画播放状态。
     */
    Update(): void;
    /**
     * 添加状态变化监听器。
     * @param listener 事件响应函数。
     */
    AddListener(listener: (type: string, state: AnimationState) => void): void;
    /**
     * 触发状态触发器。
     * @param type 事件类型。
     * @param code 触发器识别码。
     */
    Trigger(type: "timeout" | "key_down" | "key_up" | "mouse_down" | "mouse_up", code: number): void;
    /**
     * 触发状态。
     * @param key_ 指定状态键。
     * @param break_ 是否需要中断当前播放的状态（状态运行中断的前提下）。
     * @returns 返回值：-1-无效操作、0-立即播放、1-下次播放、2-等待播放。
     */
    EnterState(key_: string, break_?: boolean): number;
    /**
     * 开始状态播放。
     * @param state 动画状态。
     * @returns 如果新插入状态混合列表，返回混合槽。
     */
    private PlayState;
    /**
     * 打断状态播放。
     * @param slot 动画状态混合槽。
     */
    private BreakState;
    /**
     * 结束状态播放。
     * @param slot 动画状态混合槽。
     */
    private EndState;
    /**
     * 更新状态播放。
     * @param slot 动画状态混合槽。
     * @returns
     */
    private UpdateState;
    /** 动画组件实例。 */
    private _animator;
    /** 状态列表。 */
    private _stateList;
    /** 状态查找表。 */
    private _stateLut;
    /** 活动状态混合列表（允许多状态共存混合，实现类似移动中施法的功能，最多允许混合4个动画状态）。 */
    private _blendList;
    /** 各事件类型状态触发器列表。 */
    private _triggers;
    /** 状态事件监听器。 */
    private _listeners;
    /** 下一个状态。 */
    private _nextState;
    /** 等待中的状态（在条件满足时触发）。 */
    private _waitState;
    /** 状态保持标记查找表（通过状态键查找是否需要维持状态，维持循环或维持最后姿态）。 */
    private _holdingLut;
}
/** 动画状态触发器。 */
export interface AnimationTrigger {
    /** 触发器描述。 */
    desc: string;
    /** 响应事件类型。 */
    type: "timeout" | "key_down" | "key_up" | "mouse_down" | "mouse_up";
    /** 响应事件代码（在相同事件类型下识别不同触发器）。 */
    code: number;
    /** 触发动画状态键。 */
    enter: string;
    /** 设置指定状态保持标志。 */
    hold?: string;
    /** 取消指定状态保持标记。 */
    unhold?: string;
}
/** 动画状态机状态。 */
export interface AnimationState {
    /** 状态键（唯一，用于状态查找）。 */
    key: string;
    /** 可以从当前状态触发并能并行播放的状态列表。 */
    parallels: string[];
    /** 可以从当前状态切换到的下一状态列表。 */
    nexts: string[];
    /** 当前状态结束后建议的下一状态。 */
    next: string;
    /** 是否允许打断当前状态。 */
    can_break: boolean;
    /** 是否允许加速播放以尽快结束当前状态（大于1时有效）。 */
    can_speedup: number;
    /** 当前状态动画设置。 */
    animation: {
        /** 动画片段索引。 */
        clip: number;
        /** 起始关键帧时间戳。 */
        start: number;
        /** 持续时间长度（毫秒）。 */
        span: number;
        /** 状态结束前动画是否循环播放。 */
        loop: boolean;
    };
}
/** 动画状态混合槽（允许多状态并发混合，实现类似移动中施法的功能）。 */
export interface AnimationBlendEntry {
    /** 当前活动状态。 */
    state: AnimationState;
    /** 当前播放起始时间。 */
    start_time: number;
    /** 当前状态动画播放速度（默认1.0）。 */
    speed: number;
}
/** 动画组件内核实现。 */
export declare class Animator_kernel extends Miaoverse.Base_kernel<Animator, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    constructor(_global: Miaoverse.Ploy3D);
    /**
     * 创建动画组件实例。
     * @param targets 动画驱动目标数组。
     * @param animationsList 动画数据列表。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回动画组件实例。
     */
    Create(targets: Miaoverse.Object3D[], animationsList: string[], pkg?: Miaoverse.PackageReg): Promise<Miaoverse.Animator>;
    /**
     * 装载动画数据。
     * @param uri 动画数据URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回动画数据。
     */
    LoadAnimations(uri: string, pkg?: Miaoverse.PackageReg): Promise<{
        /** 动画数据资产信息。 */
        asset: Miaoverse.Asset_animations;
        /** 动画片段数组。 */
        clips: Miaoverse.AnimationClip[];
        /** 动画数据。 */
        data: Uint32Array;
        /** 动画数据引用计数。 */
        refCount: number;
    }>;
    /**
     * 更新动画组件（对象在视锥范围内时触发调用）。
     * @param animator_id 动画组件ID。
     */
    Update(animator_id: number): void;
    /** 动画数据查找表。 */
    private _animationsLut;
}
/** 动画数据描述符。 */
export interface Asset_animations extends Miaoverse.Asset {
    /** 动画驱动目标对象名称数组。 */
    targets: string[];
    /** 数据URI。 */
    data?: string;
}
/** 动画数据内核实现的数据结构成员列表。 */
export declare const AnimationData_member_index: {
    readonly targetCount: Miaoverse.Kernel_member;
    readonly clipCount: Miaoverse.Kernel_member;
    readonly targetsName: Miaoverse.Kernel_member;
    readonly clips: Miaoverse.Kernel_member;
    readonly magic: Miaoverse.Kernel_member;
    readonly version: Miaoverse.Kernel_member;
    readonly byteSize: Miaoverse.Kernel_member;
    readonly refCount: Miaoverse.Kernel_member;
    readonly id: Miaoverse.Kernel_member;
    readonly uuid: Miaoverse.Kernel_member;
    readonly writeTS: Miaoverse.Kernel_member;
    readonly readTS: Miaoverse.Kernel_member;
    readonly last: Miaoverse.Kernel_member;
    readonly next: Miaoverse.Kernel_member;
};
