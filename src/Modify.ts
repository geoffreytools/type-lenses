import { self, Param, Output, Key, PathItem, Fn, Indexable } from './types'
import { Next } from './utils'
import { Type, apply } from 'free-types-core';

export { ModifyPath };

type ModifyPath<I extends PathItem, Data, V> =
    I extends Output ? Data extends Fn ? (...args: Parameters<Data>) => V : never
    : I extends Param ? Data extends Fn
        ? (...args: SetIndex<I['key'], V, Parameters<Data>>) =>
        ReturnType<Data>
        : never
    : I extends number ? Data extends unknown[] ? SetIndex<I, V, Data> : never
    : I extends Key ? Data extends Indexable ? {
        [K in keyof Data as FilteredKeys<Data, K>]
            : K extends I | `${I & string}` ? V : Data[K];
    } : never
    : I extends self ? V
    : I extends Type ? V extends unknown[] ? apply<I, V> : never
    : never


type SetIndex<
    A extends number,
    V,
    T extends unknown[],
    I extends number = 0,
    R extends unknown[] = []
> = number extends T['length'] ? T
    : I extends T['length'] ? R
    : SetIndex<A, V, T, Next<I>, [
        ...R, I extends A ? V : T[I]
    ]>;

type FilteredKeys<T, K extends keyof T> =
    [unknown] extends [T[K]]
        ? string extends K ? never
        : number extends K ? never
        : symbol extends K ? never
        : K
    : K;