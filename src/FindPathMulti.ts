import { GenericFree, Next, Union2Tuple, Parameters, IsAny, GetOrElse, Subtract, Prev } from "./utils";
import { Fn, NOT_FOUND, Output, PathItem, self } from "./types";
import { Get } from "./Get";
import { apply, unwrap, Unwrapped } from "free-types-core";
import { Iterable, $Iterator, $Struct, $Tuple, $FnParams, $Free } from "./Iterators";

export { FindPathMulti }

type FindPathMulti<
    T,
    Needle,
    From extends PathItem[] = [],
    Limit extends number = number
> = From extends [] ? FormatSelf<Extract<GetPaths<T, Needle, Limit>, unknown[]>>
    : GetPaths<Get<From, T>, Needle, Limit> extends infer P
        extends unknown[][] ? FormatSelf<{
            [K in keyof P]: [...From, ...P[K]]
        }> : never

type FormatSelf<T> = GetOrElse<T, [unknown, ...unknown[]], [[self]]>;

type GetPaths<T, Needle, Limit extends number, Acc extends unknown[] = []> = 
    Limit extends 0 | never ? Acc

    : IsAny<T> extends true ? IsAny<Needle> extends true ? [] : NOT_FOUND

    : IsNeedle<T, Needle> extends true ? []

    : T extends readonly unknown[]
        ? (any[] extends T ? 1 : never[] extends T ? 1 : 0) extends 1
        ? NonEmpty<DeepSearch<Needle, Limit, Acc, T[number], [number]>>
        : Search<T, Needle, Limit, Acc>

    : T extends GenericFree
    ? unwrap<T> extends infer U extends Unwrapped
        ? Search<U['args'], Needle, Limit, Acc, $Free<U['type']>>
        : never

    : T extends Fn ? NonEmpty<[
        ...GetOrElse<Search<Parameters<T>, Needle, Limit, Acc, $FnParams>, any[], []>,
        ...DeepSearch<Needle, Limit, Acc, ReturnType<T>, [Output]>
    ]>

    : T extends { [k: PropertyKey]: unknown }
    ? Search<T, Needle, Limit, Acc, $Struct<Union2Tuple<keyof T>>>

    : NOT_FOUND;

type Search<
    T extends Iterable,
    Needle,
    Limit extends number,
    Acc extends unknown[],
    $I extends $Iterator = $Tuple,
    I extends number = 0,
    Shallow extends number[][] = ShallowSearch<T, Needle, Limit, $I>,
    Deep extends unknown[] = [],
    Path extends unknown[] = apply<$I['path'], [T, I]>,
    End = apply<$I['done'], [T, I]>,
    L extends number = number & Subtract<Limit, Shallow['length']>
> = (L extends 0 | never ? true : End) extends true
    ? NonEmpty<[...Acc, ...Shallow, ...Deep]>
    : Search<
        T, Needle, Limit, Acc, $I, Next<I>, Shallow,
        // maybe optimise this by comparing keys? $Free would be an edge case
        Path extends Shallow[number] ? Deep : [
            ...Deep, 
            ...DeepSearch<Needle, L, Acc, apply<$I['value'], [T, I]>, Path>
        ]
    >;

type ShallowSearch<
    T extends Iterable,
    Needle,
    Limit extends number,
    $I extends $Iterator,
    I extends number = 0,
    R extends unknown[] = [],
    End = apply<$I['done'], [T, I]>,
> = Limit extends 0 ? R
    : End extends true ? R
    : IsNeedle<apply<$I['value'], [T, I]>, Needle> extends true
    ? ShallowSearch<T, Needle, Prev<Limit>, $I, Next<I>,[...R, apply<$I['path'], [T, I]>]>
    : ShallowSearch<T, Needle, Limit, $I, Next<I>, R>;

type DeepSearch<
    Needle,
    Limit extends number,
    Acc extends unknown[],
    Value,
    Path extends unknown[]
> = IsNeedle<Value, Needle> extends true ? [...Acc, Path]
    : GetPaths<Value, Needle, Limit, []> extends infer P
    ? P extends NOT_FOUND ? Acc
    : [...Acc, ...Spread<{[K in keyof P]: [...Path, ...Spread<P[K]>]}>]
    : never;

type Spread<T> = GetOrElse<T, unknown[], []>;
type NonEmpty<T> = GetOrElse<T, [unknown, ...unknown[]], NOT_FOUND>;

type IsNeedle<T, Needle> =
    IsAny<T> extends true ? IsAny<Needle> extends true ? true : false
    : IsAny<Needle> extends true ? false
    : [T] extends [never] ? [Needle] extends [never] ? true : false
    : [Needle] extends [never] ? [T] extends [never] ? true : false
    : unknown extends Needle ? unknown extends T ? true : false
    : T extends Needle ? true
    : false;