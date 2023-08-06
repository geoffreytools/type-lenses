import { self, Param, Output, Key, PathItem, Fn } from './types'
import { Type, inferArgs, Generic, apply } from 'free-types-core';
import { IsAny } from './utils';

export { FollowPath, NOT_FOUND }

declare const NOT_FOUND: unique symbol;
type NOT_FOUND = typeof NOT_FOUND;

type FollowPath<I extends PathItem, Data, Self> =
    I extends Output ? Data extends Fn ? ReturnType<Data> : NOT_FOUND
    : I extends Param ? Data extends Fn ? IfDefined<Parameters<Data>[I['key']]> : NOT_FOUND
    : I extends Key ?
        Data extends ReadonlyArray<unknown>
            ? I extends keyof Data ? IfDefined<Data[I]> : NOT_FOUND
        : Data extends Record<PropertyKey, unknown>
            ? I extends keyof Data ? Data[I] : NOT_FOUND
        : NOT_FOUND
    : I extends self ? Self
    : I extends Type ? FreeTypeArgs<Data, I>
    : NOT_FOUND

type IfDefined<T> =
    IsAny<T> extends true ? T
    : [T] extends [undefined] ? NOT_FOUND
    : T;

type FreeTypeArgs<T, $T extends Type> =
    apply<$T, any[]> extends T
    ? T extends Generic<$T>
        ? inferArgs<T, $T>
        : NOT_FOUND
    : NOT_FOUND;