export type TypedArray = Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array | BigUint64Array | BigInt64Array;
export type TypedArrayConstructor<T extends TypedArray> = T extends Uint8Array ? Uint8ArrayConstructor : T extends Uint8ClampedArray ? Uint8ClampedArrayConstructor : T extends Int8Array ? Int8ArrayConstructor : T extends Uint16Array ? Uint16ArrayConstructor : T extends Int16Array ? Int16ArrayConstructor : T extends Uint32Array ? Uint32ArrayConstructor : T extends Int32Array ? Int32ArrayConstructor : T extends Float32Array ? Float32ArrayConstructor : T extends Float64Array ? Float64ArrayConstructor : T extends BigUint64Array ? BigUint64ArrayConstructor : T extends BigInt64Array ? BigInt64ArrayConstructor : never;
export type InnerFFIType<T> = T extends FFIType<infer I> ? I : never;
export interface FFIType<T> {
    size?: number;
    read(view: Deno.UnsafePointerView, offset?: number): T;
}
export type SizedFFIType<T> = FFIType<T> & {
    size: number;
};
export declare class I8 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class U8 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class I16 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class U16 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class I32 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class U32 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class I64 implements FFIType<bigint | number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): bigint | number;
}
export declare class U64 implements FFIType<bigint | number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): bigint | number;
}
export declare class F32 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class F64 implements FFIType<number> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): number;
}
export declare class Bool implements FFIType<boolean> {
    size: number;
    read(view: Deno.UnsafePointerView, offset?: number): boolean;
}
export declare class Struct<T extends Record<string, SizedFFIType<unknown>>, V extends Record<string, unknown> = {
    [K in keyof T]: InnerFFIType<T[K]>;
}> implements FFIType<V> {
    size: number;
    types: T;
    constructor(types: T);
    read(view: Deno.UnsafePointerView, offset?: number): V;
    get<K extends keyof T>(view: Deno.UnsafePointerView, offset: number, key: K): InnerFFIType<T[K]> | undefined;
}
export declare class FixedArray<T extends SizedFFIType<V>, V> implements FFIType<V[]> {
    size: number;
    type: T;
    constructor(type: T, length: number);
    read(view: Deno.UnsafePointerView, offset?: number): V[];
    get(view: Deno.UnsafePointerView, offset: number, index: number): V;
}
export declare class Tuple<T extends [...SizedFFIType<unknown>[]], V extends [...unknown[]] = {
    [I in keyof T]: InnerFFIType<T[I]>;
}> implements SizedFFIType<V> {
    size: number;
    types: T;
    constructor(types: T);
    read(view: Deno.UnsafePointerView, offset?: number): V;
    get<I extends keyof V>(view: Deno.UnsafePointerView, offset: number, index: I): V[I];
}
export declare class FixedString implements FFIType<string> {
    size: number;
    type: SizedFFIType<number>;
    constructor(length: number, type?: SizedFFIType<number>);
    read(view: Deno.UnsafePointerView, offset?: number): string;
}
export declare class CString implements FFIType<string> {
    read(view: Deno.UnsafePointerView, offset?: number): string;
}
export declare class BitFlags8<T extends Record<string, number>, V extends Record<string, boolean> = {
    [K in keyof T]: boolean;
}> implements FFIType<V> {
    size: number;
    flags: T;
    constructor(flags: T);
    read(view: Deno.UnsafePointerView, offset?: number): V;
}
export declare class BitFlags16<T extends Record<string, number>, V extends Record<string, boolean> = {
    [K in keyof T]: boolean;
}> implements FFIType<V> {
    size: number;
    flags: T;
    constructor(flags: T);
    read(view: Deno.UnsafePointerView, offset?: number): V;
}
export declare class BitFlags32<T extends Record<string, number>, V extends Record<string, boolean> = {
    [K in keyof T]: boolean;
}> implements FFIType<V> {
    size: number;
    flags: T;
    constructor(flags: T);
    read(view: Deno.UnsafePointerView, offset?: number): V;
}
export declare class Expect<V, T extends FFIType<V>> implements FFIType<V> {
    size: any;
    type: T;
    expected: V;
    constructor(type: T, expected: V);
    is(view: Deno.UnsafePointerView, offset?: number, value?: V): boolean;
    read(view: Deno.UnsafePointerView, offset?: number): V;
}
export declare class TypedArrayFFIType<T extends TypedArray> implements FFIType<T> {
    size: number;
    length: number;
    type: TypedArrayConstructor<T>;
    constructor(type: TypedArrayConstructor<T>, length: number);
    read(view: Deno.UnsafePointerView, offset?: number): T;
}
export declare class Uint8ArrayFFIType extends TypedArrayFFIType<Uint8Array> {
    constructor(length: number);
}
export declare class Uint8ClampedArrayFFIType extends TypedArrayFFIType<Uint8ClampedArray> {
    constructor(length: number);
}
export declare class Int8ArrayFFIType extends TypedArrayFFIType<Int8Array> {
    constructor(length: number);
}
export declare class Uint16ArrayFFIType extends TypedArrayFFIType<Uint16Array> {
    constructor(length: number);
}
export declare class Int16ArrayFFIType extends TypedArrayFFIType<Int16Array> {
    constructor(length: number);
}
export declare class Uint32ArrayFFIType extends TypedArrayFFIType<Uint32Array> {
    constructor(length: number);
}
export declare class Int32ArrayFFIType extends TypedArrayFFIType<Int32Array> {
    constructor(length: number);
}
export declare class Float32ArrayFFIType extends TypedArrayFFIType<Float32Array> {
    constructor(length: number);
}
export declare class Float64ArrayFFIType extends TypedArrayFFIType<Float64Array> {
    constructor(length: number);
}
export declare class BigUint64ArrayFFIType extends TypedArrayFFIType<BigUint64Array> {
    constructor(length: number);
}
export declare class BigInt64ArrayFFIType extends TypedArrayFFIType<BigInt64Array> {
    constructor(length: number);
}
export declare const i8: I8;
export declare const u8: U8;
export declare const i16: I16;
export declare const u16: U16;
export declare const i32: I32;
export declare const u32: U32;
export declare const i64: I64;
export declare const u64: U64;
export declare const f32: F32;
export declare const f64: F64;
export declare const bool: Bool;
export declare const cstring: CString;
