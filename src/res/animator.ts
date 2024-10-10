import * as Miaoverse from "../mod.js"

/** 动画组件实例。 */
export class Animator extends Miaoverse.Resource<Animator> {
    /**
     * 构造函数。
     * @param impl 内核实现。
     * @param ptr 内核实例指针。
     * @param id 实例ID。
     */
    public constructor(impl: Animator_kernel, ptr: Miaoverse.io_ptr, id: number) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._enabled = true;
        this._refCount = 1;
        this._ctrl = new AnimationCtrl(this);
        this._targets = [];
        this._clips = [];
    }

    /**
     * 添加动画片段实例。
     * @param data 动画片段数据。
     * @returns 返回动画片段实例索引。
     */
    public AddClip(data: AnimationClip) {
        const id = this._clips.length;

        const clip: Animator["_clips"][0] = {
            data: data,
            startTS: 0,
            sampleTS: 0,
            samplers: []
        };

        const samplerCount = data.samplers.length;

        for (let i = 0; i < samplerCount; i++) {
            clip.samplers[i] = {
                index: 0,
                ctrl: 0,
                updateTS: 0
            };
        }

        this._clips.push(clip);

        // 增加动画数据引用计数
        data["_animations"].refCount++;

        return id;
    }

    /**
     * 移除动画片段实例。
     * @param _clip
     * @returns
     */
    public RemoveClip(_clip: number) {
        const clip = this._clips[_clip];
        if (!clip) {
            return;
        }

        this._clips[_clip] = null;

        this._impl.ReleaseAnimations(clip.data["_animations"].asset.uuid);
        clip.data["_animations"] = null;

        // 多有数据都是从_data中读取，而_data属于_animations._data的一部分
        clip.data["_data"] = null;
        clip.data["_channels"] = null;
        clip.data["_samplers"] = null;

        clip.data = null;
        clip.samplers = null;
    }

    /**
     * 更新动画帧。
     */
    public Update() {
        if (!this._enabled) {
            return;
        }

        this._ctrl.Update();
    }

    /**
     * 采样动画片段。
     * @param _clip 动画片段索引。
     * @param _curTS 当前时间。
     * @param _startTS 起始播放时间
     * @returns 
     */
    public SampleClip(_clip: number, _curTS?: number, _startTS?: number) {
        // 获取动画片段实例
        const clip = this._clips[_clip];
        if (!clip) {
            return;
        }

        // 重新设置起始采样时间
        if (_startTS) {
            clip.startTS = _startTS;
        }

        // 当前世界
        const curTS = _curTS ? _curTS : this._global.env.frameTS;

        // 计算循环内采样时间戳
        let sampleTS = curTS - clip.startTS;

        // 开始播放动画，初始化起始时间戳
        if (!clip.startTS) {
            clip.startTS = curTS;
            clip.sampleTS = 0;

            sampleTS = 1;
        }

        // 避免一帧内多次更新动画
        if (clip.sampleTS == sampleTS) {
            return;
        }

        // 如果超过当前动画最大时间戳，进入新循环
        if (sampleTS > clip.data.timestampMax) {
            sampleTS = sampleTS % clip.data.timestampMax;

            clip.startTS = curTS - sampleTS;
        }

        // 设置当前循环内采样时间戳
        clip.sampleTS = sampleTS;

        // ==========================----------------------------------------------

        for (let i = 0; i < clip.data.samplers.length; i++) {
            const sampler = clip.samplers[i];
            const timestamps = clip.data.samplers[i].timestamps;
            const sampleTS_ = 0.001 * sampleTS;

            while (true) {
                // 尝试向右移动采样窗口
                if (sampleTS_ >= timestamps[sampler.index]) {
                    // 无法继续向右移动采样窗口，取最右端关键帧
                    if (sampler.index == timestamps.length - 1) {
                        sampler.ctrl = 0;
                        break;
                    }
                    // 可以在当前采样窗口插值
                    else if (sampleTS_ < timestamps[sampler.index + 1]) {
                        sampler.ctrl = 1;
                        break;
                    }
                    // 右移采样窗口
                    else {
                        sampler.index++;
                    }
                }
                // 尝试向左移动采样窗口
                else {
                    // 无法继续向左移动采样窗口，取最左端关键帧
                    if (sampler.index == 0) {
                        sampler.ctrl = 0;
                        break;
                    }
                    // 可以在当前采样窗口插值
                    else if (sampleTS_ >= timestamps[sampler.index - 1]) {
                        sampler.ctrl = -1;
                        break;
                    }
                    // 左移采样窗口
                    else {
                        sampler.index--;
                    }
                }
            }

            sampler.updateTS = clip.sampleTS;
        }

        // ==========================----------------------------------------------

        for (let i = 0; i < clip.data.channels.length; i++) {
            const channel = clip.data.channels[i];
            const sampler = clip.samplers[channel.sampler];
            const sampler_data = clip.data.samplers[channel.sampler];
            const timestamps = sampler_data.timestamps;
            const keyframes = sampler_data.keyframes;

            // 采样时间戳相同则应用更新
            if (sampler.updateTS == clip.sampleTS) {
                let left = sampler.index;
                let right = sampler.index;
                let lerp = 0.0;

                if (-1 == sampler.ctrl) {
                    left = left - 1;
                    lerp = ((0.001 * sampler.updateTS) - timestamps[left]) / (timestamps[right] - timestamps[left]);
                }
                else if (+1 == sampler.ctrl) {
                    right = right + 1;
                    lerp = ((0.001 * sampler.updateTS) - timestamps[left]) / (timestamps[right] - timestamps[left]);
                }

                if (channel.attr == 1) { // TRANSFORM_LOCAL_POSITION
                    const lvalue = keyframes[left];
                    const rvalue = keyframes[right];
                    const value = [lvalue[0], lvalue[1], lvalue[2]];

                    if (sampler_data.interpolation == 0) {
                        value[0] = lvalue[0] + (rvalue[0] - lvalue[0]) * lerp;
                        value[1] = lvalue[1] + (rvalue[1] - lvalue[1]) * lerp;
                        value[2] = lvalue[2] + (rvalue[2] - lvalue[2]) * lerp;
                    }

                    this.SetValue(channel.target, channel.attr, value);
                }
                else if (channel.attr == 2) { // TRANSFORM_LOCAL_ROTATION
                    const lvalue = keyframes[left];
                    const rvalue = keyframes[right];
                    let value = [lvalue[0], lvalue[1], lvalue[2], lvalue[3]];

                    if (sampler_data.interpolation == 0) {
                        value = this._global.internal.Quaternion_Slerp(
                            lvalue[0], lvalue[1], lvalue[2], lvalue[3],
                            rvalue[0], rvalue[1], rvalue[2], rvalue[3],
                            lerp
                        );
                    }

                    this.SetValue(channel.target, channel.attr, value);
                }
                else if (channel.attr == 3) { // TRANSFORM_LOCAL_SCALE
                    const lvalue = keyframes[left];
                    const rvalue = keyframes[right];
                    const value = [lvalue[0], lvalue[1], lvalue[2]];

                    if (sampler_data.interpolation == 0) {
                        value[0] = lvalue[0] + (rvalue[0] - lvalue[0]) * lerp;
                        value[1] = lvalue[1] + (rvalue[1] - lvalue[1]) * lerp;
                        value[2] = lvalue[2] + (rvalue[2] - lvalue[2]) * lerp;
                    }

                    this.SetValue(channel.target, channel.attr, value);
                }
                else if (channel.attr == 4) { // MORPH_WEIGHTS
                    const lvalue = keyframes[left];
                    const rvalue = keyframes[right];
                    const value: number[] = [];

                    for (let j = 0; j < lvalue.length; j++) {
                        value[j] = lvalue[j] + (rvalue[j] - lvalue[j]) * lerp;
                    }

                    this.SetValue(channel.target, channel.attr, value);
                }
            }
        }
    }

    /**
     * 设置动画关节帧数据。
     * @param target 驱动目标对象索引。
     * @param attr 目标属性类型。
     * @param value 属性值。
     */
    public SetValue(target: number, attr: number, value: number[]) {
        const target_obj = this._targets[target];
        if (target_obj) {
            if (attr == 1) {
                target_obj.localPosition = this._global.Vector3(value);
            }
            else if (attr == 2) {
                target_obj.localRotation = this._global.Quaternion(value);
            }
            else if (attr == 3) {
                target_obj.localScale = this._global.Vector3(value);
            }
            else if (attr == 4) {
                // TODO ...
            }
        }
    }

    /**
     * 释放实例引用。
     */
    protected Release() {
        if (--this._refCount == 0) {
            this.Dispose();
        }
    }

    /**
     * 清除对象。
     */
    protected Dispose() {
        if (this._refCount != 0) {
            console.error("动画组件引用计数不为0，无法清除", this._refCount);
            return;
        }

        for (let i = 0; i < this._clips.length; i++) {
            this.RemoveClip(i);
        }

        this._enabled = false;
        this._refCount = 0;
        this._ctrl = null;
        this._targets = null;
        this._clips = null;

        this._global.resources.Remove(Miaoverse.CLASSID.ASSET_COMPONENT_ANIMATOR, this.id);
    }

    /** 动画控制器。 */
    public get ctrl() {
        return this._ctrl;
    }

    /** 动画驱动目标数组。 */
    public set targets(targets) {
        this._targets = targets;
    }
    public get targets() {
        return this._targets;
    }

    /** 启用动画播放。 */
    public set enabled(b: boolean) {
        this.enabled = b;
    }
    public get enabled() {
        return this._enabled;
    }

    /** 内核实现。 */
    private _impl: Animator_kernel;
    /** 是否启用动画播放。 */
    private _enabled: boolean;
    /** 引用计数。 */
    private _refCount: number;
    /** 动画控制器。 */
    private _ctrl: AnimationCtrl;
    /** 动画驱动目标数组。 */
    private _targets: Miaoverse.Object3D[];
    /** 动画片段数组。 */
    private _clips: {
        /** 动画片段数据。 */
        data: AnimationClip;
        /** 当前循环采样起始时间戳（系统时间，毫秒）。 */
        startTS: number;
        /** 当前循环内当前采样时间戳（毫秒）。 */
        sampleTS: number;
        /** 实时采样状态数组。 */
        samplers: {
            /** 当前采样时间戳索引。 */
            index: number;
            /** 插值方向：-1:与左邻接关键帧插值，0:取当前关键帧值，1:与右邻接关键帧插值。 */
            ctrl: number;
            /** 更新时间戳，如果等同采样时间戳说明数据刚更新。 */
            updateTS: number;
        }[];
    }[];
}

/** 动画片段实例。 */
export class AnimationClip {
    /**
     * 构造函数。
     * @param _data 动画片段数据。
     * @param _animations 动画集。
     */
    public constructor(_data: Uint32Array, _animations: AnimationClip["_animations"]) {
        this._animations = _animations;
        this._data = _data;
    }

    /** 当前动画片段在所在动画数据包中的索引。 */
    public get index() {
        return this._data[0];
    }

    /** 动画片段时间线上最大时间戳。 */
    public get timestampMax() {
        return this._data[2];
    }

    /**  驱动目标对象数量。 */
    public get targetCount() {
        return this._data[3];
    }

    /** 动画驱动通道数组。 */
    public get channels() {
        if (!this._channels) {
            this._channels = [];

            const count = this._data[4];
            const start = this._data[8];

            for (let i = 0; i < count; i++) {
                const begin = start + i * 3;
                const entry = this._data.subarray(begin, begin + 3);

                this._channels[i] = {
                    sampler: entry[0],
                    target: entry[1],
                    attr: entry[2]
                };
            }
        }

        return this._channels;
    }

    /** 动画数据采样器数组。 */
    public get samplers() {
        if (!this._samplers) {
            this._samplers = [];

            const count = this._data[5];
            const start = this._data[9];
            const start_timeline = this._data[10];
            const start_keyframes = this._data[11];

            for (let i = 0; i < count; i++) {
                const begin = start + i * 6;
                const entry = this._data.subarray(begin, begin + 6);

                const timestamps = this._data.subarray(start_timeline + entry[0], start_timeline + entry[0] + entry[1]);
                const timestampMax = entry[2];

                let read = start_keyframes + entry[3];

                const keyframes = [];
                const stride = entry[4];
                const interpolation = entry[5];

                for (let k = 0; k < entry[1]; k++) {
                    const keyframe = this._data.subarray(read, read + stride);

                    read += stride;

                    keyframes.push(new Float32Array(keyframe.buffer, keyframe.byteOffset, keyframe.length));
                }

                this._samplers[i] = {
                    timestamps: new Float32Array(timestamps.buffer, timestamps.byteOffset, timestamps.length),
                    timestampMax,
                    keyframes,
                    interpolation
                };
            }
        }

        return this._samplers;
    }

    /** 动画集。 */
    private _animations: Animator_kernel["_animationsLut"][""];
    /** 动画片段数据。 */
    private _data: Uint32Array;
    /** 动画驱动通道数组。 */
    private _channels: {
        /** 关键帧数据采样器索引。 */
        sampler: number;
        /** 驱动目标索引。 */
        target: number;
        /** 驱动属性类型枚举。 */
        attr: number;
    }[];
    /** 动画数据采样器数组。 */
    private _samplers: {
        /** 最大关键帧时间戳。 */
        timestampMax: number;
        /** 关键帧时间戳数组。 */
        timestamps: Float32Array;

        /** 关键帧之间的插值方式：0-LINEAR、1-STEP、2-CUBICSPLINE。 */
        interpolation: number;
        /** 关键帧数据数组（长度等同timestamps）。 */
        keyframes: Float32Array[];
    }[];
}

/**
 * 动画控制器。
 * 装载若干个动画片段，通过状态机管理这些动画片段的播放程序。
 */
export class AnimationCtrl {
    /**
     * 构造函数。
     * @param _animator 动画组件实例。
     */
    public constructor(_animator: Animator) {
        this._animator = _animator;
    }

    /**
     * 初始化动画状态机。
     * @param states 状态节点列表。
     * @param triggers 状态触发器列表。
     */
    public Init(states: AnimationState[], triggers: AnimationTrigger[]) {
        this._stateList = states;
        this._stateLut = {};

        for (let state of states) {
            this._stateLut[state.key] = state;
        }

        this._blendList = [];

        for (let i = 0; i < 4; i++) {
            this._blendList[i] = {
                state: null,
                start_time: 0.0,
                speed: 1.0
            };
        }

        this._triggers = {
            timeout: [],
            key_down: [],
            key_up: [],
            mouse_down: [],
            mouse_up: []
        };

        for (let trigger of triggers) {
            this._triggers[trigger.type].push(trigger);
        }

        this._listeners = [];
        this._holdingLut = {};
    }

    /** 
     * 更新动画播放状态。
     */
    public Update() {
        if (!this._stateList) {
            this._animator.SampleClip(0);
        }
        else {
            for (let slot of this._blendList) {
                if (slot.state) {
                    this.UpdateState(slot);
                }
            }
        }
    }

    /**
     * 添加状态变化监听器。
     * @param listener 事件响应函数。
     */
    public AddListener(listener: (type: string, state: AnimationState) => void) {
        this._listeners.push(listener);
    }

    /**
     * 触发状态触发器。
     * @param type 事件类型。
     * @param code 触发器识别码。
     */
    public Trigger(type: "timeout" | "key_down" | "key_up" | "mouse_down" | "mouse_up", code: number) {
        const triggers = this._triggers[type];

        for (let trigger of triggers) {
            if (trigger.code == code) {
                if (trigger.hold) {
                    this._holdingLut[trigger.hold] = true;
                }

                if (trigger.unhold) {
                    this._holdingLut[trigger.unhold] = false;
                }

                this.EnterState(trigger.enter, true);
            }
        }
    }

    /**
     * 触发状态。
     * @param key_ 指定状态键。
     * @param break_ 是否需要中断当前播放的状态（状态运行中断的前提下）。
     * @returns 返回值：-1-无效操作、0-立即播放、1-下次播放、2-等待播放。
     */
    public EnterState(key_: string, break_: boolean = false): number {
        const state_ = this._stateLut[key_];

        // 不存在指定状态
        if (!state_) {
            return -1;
        }

        // 是否允许并行播放新状态（所有活动状态都允许的情况下允许）
        let parallel = true;
        // 是否能够在下次进行播放，否则无限期等待条件满足，两者等待皆可能被后续触发覆盖
        let next: { speedup_slot?: AnimationBlendEntry; } = null;

        // 遍历所有状态槽
        for (let i = 0; i < 4; i++) {
            const slot = this._blendList[i];
            const state = slot.state;

            if (state) {
                // 当前状态已播放
                if (state.key == key_) {
                    return -1;
                }

                // 当前状态不允许并行播放指定状态
                if (!state.parallels.includes(key_)) {
                    parallel = false
                }

                // 支持当前状态结束后播放
                if (state.nexts.includes(key_)) {
                    // 允许打断当前状态播放并播放指定状态
                    if (break_ && state.can_break) {
                        this.BreakState(slot);
                        this.PlayState(state_);
                        return 0;
                    }
                    // 允许加速播放当前状态以尽快进入下一状态
                    else if (state.can_speedup > 1) {
                        if (next) {
                            // 优先选择先播放的进行加速
                            if (next.speedup_slot.start_time > slot.start_time) {
                                next = { speedup_slot: slot };
                            }
                        }
                        else {
                            next = { speedup_slot: slot };
                        }
                    }
                    else if (!next) {
                        next = {};
                    }
                }
            }
        }

        // 启用新的状态槽触发指定状态
        if (parallel) {
            this._nextState = null;
            this._waitState = null;
            this.PlayState(state_);
            return 0;
        }
        // 当前无法切换到指定状态，进入等待
        else {
            if (next) {
                // 加速播放当前状态以尽快进入下一状态
                if (next.speedup_slot) {
                    next.speedup_slot.speed = next.speedup_slot.state.can_speedup;
                }

                this._nextState = state_;
                this._waitState = null;
                return 1;
            }
            else {
                this._waitState = state_;
                return 2;
            }
        }

        return -1;
    }

    /**
     * 开始状态播放。
     * @param state 动画状态。
     * @returns 如果新插入状态混合列表，返回混合槽。
     */
    private PlayState(state: AnimationState) {
        for (let slot of this._blendList) {
            // 状态已激活
            if (slot.state && slot.state.key == state.key) {
                return null;
            }
        }

        for (let slot of this._blendList) {
            // 添加到空间混合槽
            if (!slot.state) {
                slot.state = state;
                slot.start_time = Date.now();
                slot.speed = 1.0;

                for (let listener of this._listeners) {
                    listener("play", slot.state);
                }

                return slot;
            }
        }

        return null;
    }

    /**
     * 打断状态播放。
     * @param slot 动画状态混合槽。
     */
    private BreakState(slot: AnimationBlendEntry) {
        for (let listener of this._listeners) {
            listener("break", slot.state);
        }

        slot.state = null;
        slot.start_time = 0;
        slot.speed = 1.0;
    }

    /**
     * 结束状态播放。
     * @param slot 动画状态混合槽。
     */
    private EndState(slot: AnimationBlendEntry) {
        for (let listener of this._listeners) {
            listener("end", slot.state);
        }

        slot.state = null;
        slot.start_time = 0;
        slot.speed = 1.0;
    }

    /**
     * 更新状态播放。
     * @param slot 动画状态混合槽。
     * @returns 
     */
    private UpdateState(slot: AnimationBlendEntry) {
        const state = slot.state;
        const animation = state.animation;

        // 从开始播放起所经过毫秒数
        let pass = Date.now() - slot.start_time;

        // 已经播放完一趟
        if (pass > animation.span) {
            // 允许结束状态
            if (!this._holdingLut[state.key]) {
                // 最终所有活动状态都会回退到初始状态，而初始状态将只播放一个
                if (!this._nextState && state.next) {
                    this._nextState = this._stateLut[state.next];
                }

                this.EndState(slot);

                if (this._nextState) {
                    this.PlayState(this._nextState);
                    this._nextState = null;
                }

                return;
            }
            // 维持当前状态
            else {
                // 循环播放
                if (animation.loop) {
                    pass = pass % animation.span;
                }
                // 位置最后姿势
                else {
                    pass = animation.span;
                }
            }
        }

        // 采用动画片段动画帧
        this._animator.SampleClip(animation.clip, animation.start + pass);

        for (let listener of this._listeners) {
            listener("update", state);
        }
    }

    /** 动画组件实例。 */
    private _animator: Animator;
    /** 状态列表。 */
    private _stateList: AnimationState[];
    /** 状态查找表。 */
    private _stateLut: Record<string, AnimationState>;
    /** 活动状态混合列表（允许多状态共存混合，实现类似移动中施法的功能，最多允许混合4个动画状态）。 */
    private _blendList: AnimationBlendEntry[];
    /** 各事件类型状态触发器列表。 */
    private _triggers: Record<"timeout" | "key_down" | "key_up" | "mouse_down" | "mouse_up", AnimationTrigger[]>;
    /** 状态事件监听器。 */
    private _listeners: ((type: string, state: AnimationState) => void)[];
    /** 下一个状态。 */
    private _nextState: AnimationState;
    /** 等待中的状态（在条件满足时触发）。 */
    private _waitState: AnimationState;
    /** 状态保持标记查找表（通过状态键查找是否需要维持状态，维持循环或维持最后姿态）。 */
    private _holdingLut: Record<string, boolean>;
}

/** 动画状态触发器。 */
export interface AnimationTrigger {
    /** 触发器描述。 */
    desc: string;
    /** 响应事件类型。 */
    type: "timeout" | "key_down" | "key_up" | "mouse_down" | "mouse_up",
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
    key: string,
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

// ===============-----------------------------------------

/** 动画组件内核实现。 */
export class Animator_kernel extends Miaoverse.Base_kernel<Animator, any> {
    /**
     * 构造函数。
     * @param _global 引擎实例。
     */
    public constructor(_global: Miaoverse.Ploy3D) {
        super(_global, {});
        this._animationsLut = {};
        this._animationsCount = 0;
    }

    /**
     * 创建动画组件实例。
     * @param targets 动画驱动目标数组。
     * @param animationsList 动画数据列表。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回动画组件实例。
     */
    public async Create(
        targets: Miaoverse.Object3D[],
        animationsList: string[],
        pkg?: Miaoverse.PackageReg) {

        // 创建实例 ===============-----------------------

        const id = this._instanceIdle;

        this._instanceIdle = this._instanceList[id]?.id || id + 1;

        const instance = this._instanceList[id] = new Animator(this, 0 as never, id);

        this._instanceCount++;

        this._gcList.push(() => {
            instance["Release"]();
        });

        // 添加动画数据 ===============-----------------------

        instance.targets = targets.slice();

        for (let i = 0; i < animationsList.length; i++) {
            const animations = await this.LoadAnimations(animationsList[i], pkg);

            for (let clip of animations.clips) {
                instance.AddClip(clip);
            }
        }

        return instance;
    }

    /**
     * 移除动画组件实例。
     * @param id 动画组件实例ID。
     */
    protected Remove(id: number) {
        const instance = this._instanceList[id];
        if (!instance || instance.id != id) {
            this._global.Track("Animator_kernel.Remove: 实例ID=" + id + "无效！", 3);
            return;
        }

        instance["_impl"] = null;

        instance["_global"] = null;
        instance["_ptr"] = 0 as never;
        instance["_id"] = this._instanceIdle;

        this._instanceIdle = id;
        this._instanceCount -= 1;
    }

    /**
     * 装载动画数据。
     * @param uri 动画数据URI。
     * @param pkg 当前资源包注册信息。
     * @returns 异步返回动画数据。
     */
    public async LoadAnimations(uri: string, pkg?: Miaoverse.PackageReg) {
        const resources = this._global.resources;

        const uuid = resources.ToUUID(uri, pkg);
        if (!uuid) {
            return null;
        }

        let animations = this._animationsLut[uuid];
        if (animations) {
            animations.refCount++;

            return animations;
        }

        // 加载装配动画资产 ===============-----------------------

        const desc = await resources.Load_file<Asset_animations>("json", uri, true, pkg);
        if (!desc?.data) {
            return null;
        }

        desc.data.uuid = uuid;

        let data: Uint32Array = null;

        if (desc.data.data) {
            const data_ab = await resources.Load_file<ArrayBuffer>("arrayBuffer", desc.data.data, true, desc.pkg);
            if (data_ab?.data) {
                data = new Uint32Array(data_ab?.data);
            }
            else {
                console.error("动画数据加载失败！", desc.data.data);
            }
        }

        // 创建实例 ===============-----------------------

        const _animations: AnimationClip["_animations"] = {
            asset: desc.data,
            clips: [],
            data: data,
            refCount: 1
        };

        const targetCount = data[12 + 0];
        const clipsOffset = data.subarray(data[12 + 3], data[12 + 3] + data[12 + 1]);

        for (let i = 0; i < clipsOffset.length; i++) {
            const clip_data = data.subarray(clipsOffset[i]);
            const clip = new AnimationClip(clip_data, _animations);

            _animations.clips.push(clip);
        }

        this._animationsLut[uuid] = _animations;
        this._animationsCount++;

        this._gcList.push(() => {
            this.ReleaseAnimations(uuid);
        });

        return _animations;
    }

    /**
     * 释放动画数据。
     * @param uuid 动画数据ID。
     * @returns
     */
    public ReleaseAnimations(uuid: string) {
        let animations = this._animationsLut[uuid];
        if (!animations) {
            console.error("释放动画数据UUID无效", uuid);
            return;
        }

        if (--animations.refCount > 0) {
            return;
        }

        animations.asset = null;
        animations.clips = null;
        // 该数据不存在与内核内存中，仅为JS端普通数组
        animations.data = null;
        animations.refCount = 0;

        this._animationsLut[uuid] = undefined;
        this._animationsCount--;
    }

    /**
     * 更新动画组件（对象在视锥范围内时触发调用）。
     * @param animator_id 动画组件ID。
     */
    public Update(animator_id: number) {
        const animator = this.GetInstanceByID(animator_id);
        if (animator) {
            animator.Update();
        }
    }

    /**
     * 清除所有。
     */
    protected DisposeAll() {
        if (this._instanceCount != 0) {
            console.error("异常！存在未释放的动画组件实例", this._instanceCount);
        }

        if (this._animationsCount != 0) {
            console.error("异常！存在未释放的动画数据", this._animationsCount);
        }

        this._global = null;
        this._members = null;

        this._instanceList = null;
        this._instanceLut = null;

        this._animationsLut = null;
        this._gcList = null;
    }

    /** 动画数据查找表。 */
    private _animationsLut: Record<string, {
        /** 动画数据资产信息。 */
        asset: Asset_animations;
        /** 动画片段数组。 */
        clips: AnimationClip[];
        /** 动画数据。 */
        data: Uint32Array;
        /** 动画数据引用计数。 */
        refCount: number;
    }>;
    /** 已装载动画数据数量。 */
    private _animationsCount: number;

    /** 待GC资源实例列表（资源在创建时产生1引用计数，需要释放）。 */
    private _gcList: (() => void)[] = [];
}

/** 动画数据描述符。 */
export interface Asset_animations extends Miaoverse.Asset {
    /** 动画驱动目标对象名称数组。 */
    targets: string[];
    /** 数据URI。 */
    data?: string;
}

/** 动画数据内核实现的数据结构成员列表。 */
export const AnimationData_member_index = {
    ...Miaoverse.Binary_member_index,

    targetCount: ["uscalarGet", "uscalarSet", 1, 12] as Miaoverse.Kernel_member,
    clipCount: ["uscalarGet", "uscalarSet", 1, 13] as Miaoverse.Kernel_member,
    targetsName: ["ptrGet", "ptrSet", 1, 14] as Miaoverse.Kernel_member,
    clips: ["ptrGet", "ptrSet", 1, 15] as Miaoverse.Kernel_member
} as const;
