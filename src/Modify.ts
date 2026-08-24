import { self, Param, Output, Key, PathItem, Fn, Indexable } from './types'
import { HeadLength, IsArray, IsOpenEnded, Next, RestElement } from './utils'
import { Type, Expect, apply } from 'free-types-core';

export { ModifyPath };

type ModifyPath<I extends PathItem, Data, V> =
    I extends Output ? Data extends Fn ? (...args: Parameters<Data>) => V : never
    : I extends Param ? Data extends Fn
        ? (...args: SetIndex<I['key'], V, Parameters<Data>>) =>
        ReturnType<Data>
        : never
    : I extends number ? IsArray<Data> extends true ? SetElement<Data, V>
        : Data extends readonly unknown[]
            ? AsMutableAs<Data, IsOpenEnded<Data> extends true
                ? SetOpenEnded<I, V, Data>
                : SetIndex<I, V, Mutable<Data>>>
        : never
    : I extends Key ? Data extends Indexable ? {
        [K in keyof Data as FilteredKeys<Data, K>]
            : K extends I | `${I & string}` ? V : Data[K];
    } : never
    : I extends self ? V
    : I extends Expect<Type> ? V extends unknown[] ? apply<I, V> : never
    : never

type AsMutableAs<Model extends readonly unknown[], T extends readonly unknown[]> =
    Model extends unknown[] ? T : Readonly<T>;

type Mutable<T extends readonly unknown[]> = [...T];

type SetOpenEnded<
    I extends number,
    V,
    T extends readonly unknown[],
    Head extends unknown[] = HeadOf<T, HeadLength<T>>
> = number extends I ? [...Head, ...V[]]
    : [...SetIndex<I, V, Head>, ...RestElement<T>[]];

type HeadOf<
    T extends readonly unknown[],
    N extends number,
    R extends unknown[] = []
> = R['length'] extends N ? R : HeadOf<T, N, [...R, T[R['length']]]>;

type SetElement<Data, V> =
    Data extends unknown[] ? V[]
    : Data extends readonly unknown[] ? readonly V[]
    : never;

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