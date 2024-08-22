import * as Miaoverse from "../mod.js";
export class Animator extends Miaoverse.Resource {
    constructor(impl, ptr, id) {
        super(impl["_global"], ptr, id);
        this._impl = impl;
        this._enabled = true;
        this._refCount = 1;
        this._ctrl = new AnimationCtrl(this);
        this._targets = [];
        this._clips = [];
    }
    AddClip(data) {
        const id = this._clips.length;
        const clip = {
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
        return id;
    }
    Update() {
        if (!this._enabled) {
            return;
        }
        this._ctrl.Update();
    }
    SampleClip(_clip, _curTS, _startTS) {
        const clip = this._clips[_clip];
        if (!clip) {
            return;
        }
        if (_startTS) {
            clip.startTS = _startTS;
        }
        const curTS = _curTS ? _curTS : this._global.env.frameTS;
        let sampleTS = curTS - clip.startTS;
        if (!clip.startTS) {
            clip.startTS = curTS;
            clip.sampleTS = 0;
            sampleTS = 1;
        }
        if (clip.sampleTS == sampleTS) {
            return;
        }
        if (sampleTS > clip.data.timestampMax) {
            sampleTS = sampleTS % clip.data.timestampMax;
            clip.startTS = curTS - sampleTS;
        }
        clip.sampleTS = sampleTS;
        for (let i = 0; i < clip.data.samplers.length; i++) {
            const sampler = clip.samplers[i];
            const timestamps = clip.data.samplers[i].timestamps;
            const sampleTS_ = 0.001 * sampleTS;
            while (true) {
                if (sampleTS_ >= timestamps[sampler.index]) {
                    if (sampler.index == timestamps.length - 1) {
                        sampler.ctrl = 0;
                        break;
                    }
                    else if (sampleTS_ < timestamps[sampler.index + 1]) {
                        sampler.ctrl = 1;
                        break;
                    }
                    else {
                        sampler.index++;
                    }
                }
                else {
                    if (sampler.index == 0) {
                        sampler.ctrl = 0;
                        break;
                    }
                    else if (sampleTS_ >= timestamps[sampler.index - 1]) {
                        sampler.ctrl = -1;
                        break;
                    }
                    else {
                        sampler.index--;
                    }
                }
            }
            sampler.updateTS = clip.sampleTS;
        }
        for (let i = 0; i < clip.data.channels.length; i++) {
            const channel = clip.data.channels[i];
            const sampler = clip.samplers[channel.sampler];
            const sampler_data = clip.data.samplers[channel.sampler];
            const timestamps = sampler_data.timestamps;
            const keyframes = sampler_data.keyframes;
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
                if (channel.attr == 1) {
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
                else if (channel.attr == 2) {
                    const lvalue = keyframes[left];
                    const rvalue = keyframes[right];
                    let value = [lvalue[0], lvalue[1], lvalue[2], lvalue[3]];
                    if (sampler_data.interpolation == 0) {
                        value = this._global.internal.Quaternion_Slerp(lvalue[0], lvalue[1], lvalue[2], lvalue[3], rvalue[0], rvalue[1], rvalue[2], rvalue[3], lerp);
                    }
                    this.SetValue(channel.target, channel.attr, value);
                }
                else if (channel.attr == 3) {
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
                else if (channel.attr == 4) {
                    const lvalue = keyframes[left];
                    const rvalue = keyframes[right];
                    const value = [];
                    for (let j = 0; j < lvalue.length; j++) {
                        value[j] = lvalue[j] + (rvalue[j] - lvalue[j]) * lerp;
                    }
                    this.SetValue(channel.target, channel.attr, value);
                }
            }
        }
    }
    SetValue(target, attr, value) {
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
            }
        }
    }
    get ctrl() {
        return this._ctrl;
    }
    set targets(targets) {
        this._targets = targets;
    }
    get targets() {
        return this._targets;
    }
    set enabled(b) {
        this.enabled = b;
    }
    get enabled() {
        return this._enabled;
    }
    _impl;
    _enabled;
    _refCount;
    _ctrl;
    _targets;
    _clips;
}
export class AnimationClip {
    constructor(_data, _animations) {
        this._animations = _animations;
        this._data = _data;
    }
    get index() {
        return this._data[0];
    }
    get timestampMax() {
        return this._data[2];
    }
    get targetCount() {
        return this._data[3];
    }
    get channels() {
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
    get samplers() {
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
    _animations;
    _data;
    _channels;
    _samplers;
}
export class AnimationCtrl {
    constructor(_animator) {
        this._animator = _animator;
    }
    Init(states, triggers) {
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
    Update() {
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
    AddListener(listener) {
        this._listeners.push(listener);
    }
    Trigger(type, code) {
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
    EnterState(key_, break_ = false) {
        const state_ = this._stateLut[key_];
        if (!state_) {
            return -1;
        }
        let parallel = true;
        let next = null;
        for (let i = 0; i < 4; i++) {
            const slot = this._blendList[i];
            const state = slot.state;
            if (state) {
                if (state.key == key_) {
                    return -1;
                }
                if (!state.parallels.includes(key_)) {
                    parallel = false;
                }
                if (state.nexts.includes(key_)) {
                    if (break_ && state.can_break) {
                        this.BreakState(slot);
                        this.PlayState(state_);
                        return 0;
                    }
                    else if (state.can_speedup > 1) {
                        if (next) {
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
        if (parallel) {
            this._nextState = null;
            this._waitState = null;
            this.PlayState(state_);
            return 0;
        }
        else {
            if (next) {
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
    PlayState(state) {
        for (let slot of this._blendList) {
            if (slot.state && slot.state.key == state.key) {
                return null;
            }
        }
        for (let slot of this._blendList) {
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
    BreakState(slot) {
        for (let listener of this._listeners) {
            listener("break", slot.state);
        }
        slot.state = null;
        slot.start_time = 0;
        slot.speed = 1.0;
    }
    EndState(slot) {
        for (let listener of this._listeners) {
            listener("end", slot.state);
        }
        slot.state = null;
        slot.start_time = 0;
        slot.speed = 1.0;
    }
    UpdateState(slot) {
        const state = slot.state;
        const animation = state.animation;
        let pass = Date.now() - slot.start_time;
        if (pass > animation.span) {
            if (!this._holdingLut[state.key]) {
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
            else {
                if (animation.loop) {
                    pass = pass % animation.span;
                }
                else {
                    pass = animation.span;
                }
            }
        }
        this._animator.SampleClip(animation.clip, animation.start + pass);
        for (let listener of this._listeners) {
            listener("update", state);
        }
    }
    _animator;
    _stateList;
    _stateLut;
    _blendList;
    _triggers;
    _listeners;
    _nextState;
    _waitState;
    _holdingLut;
}
export class Animator_kernel extends Miaoverse.Base_kernel {
    constructor(_global) {
        super(_global, {});
        this._animationsLut = {};
    }
    async Create(targets, animationsList, pkg) {
        const id = this._instanceIdle;
        this._instanceIdle = this._instanceList[id]?.id || id + 1;
        const instance = this._instanceList[id] = new Animator(this, 0, id);
        this._instanceCount++;
        instance.targets = targets.slice();
        for (let i = 0; i < animationsList.length; i++) {
            const animations = await this.LoadAnimations(animationsList[i], pkg);
            for (let clip of animations.clips) {
                instance.AddClip(clip);
            }
        }
        return instance;
    }
    async LoadAnimations(uri, pkg) {
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
        const desc = await resources.Load_file("json", uri, true, pkg);
        if (!desc?.data) {
            return null;
        }
        desc.data.uuid = uuid;
        let data = null;
        if (desc.data.data) {
            const data_ab = await resources.Load_file("arrayBuffer", desc.data.data, true, desc.pkg);
            if (data_ab?.data) {
                data = new Uint32Array(data_ab?.data);
            }
            else {
                console.error("动画数据加载失败！", desc.data.data);
            }
        }
        const _animations = {
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
        return _animations;
    }
    Update(animator_id) {
        const animator = this.GetInstanceByID(animator_id);
        if (animator) {
            animator.Update();
        }
    }
    _animationsLut;
}
export const AnimationData_member_index = {
    ...Miaoverse.Binary_member_index,
    targetCount: ["uscalarGet", "uscalarSet", 1, 12],
    clipCount: ["uscalarGet", "uscalarSet", 1, 13],
    targetsName: ["ptrGet", "ptrSet", 1, 14],
    clips: ["ptrGet", "ptrSet", 1, 15]
};
//# sourceMappingURL=animator.js.map