import { GenericFree, Next, IsAny, GetOrElse, Subtract, Prev } from "./utils";
import { BaseType, Fn, NOT_FOUND, PathItem, self } from "./types";
import { Get } from "./Get";
import { Type, apply } from "free-types-core";
import { $Iterator, $Struct, $Tuple, $Fn, $Free } from "./Iterators";

export { FindPaths}

type FindPaths<
    T,
    Needle = self,
    From extends PathItem[] = [],
    Limit extends number = number
> = [T] extends [T]
        ? From extends []
        ? GetPaths<T, Needle, Limit> extends infer P
            extends unknown[][] ? FormatSelf<P> : []
        : GetPaths<Get<From, T>, Needle, Limit> extends infer P
            extends unknown[][] 
            ? P extends [] ? From : FormatSelf<{
                [K in keyof P]: [...From, ...P[K]]
            }> : []
    : never

type GetPaths<T, Needle, Limit extends number, Acc extends unknown[][] = []> = 
    Limit extends 0 | never ? Acc

    : IsAny<T> extends true ? IsAny<Needle> extends true ? [] : NOT_FOUND

    : IsNeedle<T, Needle> extends true ? []

    : T extends readonly unknown[]
        ? (any[] extends T ? 1 : never[] extends T ? 1 : 0) extends 1
        ? NonEmpty<DeepSearch<Needle, Limit, Acc, T[number], [number]>>
        : Search<Needle, Limit, Acc, $Tuple<T>>

    : T extends GenericFree
    ? Search<Needle, Limit, Acc, $Free<T>>

    : T extends Fn ? NonEmpty<Search<Needle, Limit, Acc, $Fn<T>>>

    : T extends { [k: PropertyKey]: unknown }
    ? Search<Needle, Limit, Acc, $Struct<T>>

    : NOT_FOUND;

type Search<
    Needle,
    Limit extends number,
    Acc extends unknown[][],
    $I extends $Iterator,
    I extends number = 0,
    Shallow extends { partial: unknown[][], true: unknown[][] } = ShallowSearch<Needle, Limit, $I>,
    Deep extends unknown[][] = [],
    Path extends unknown[] = apply<$I['path'], [I]>,
    End = apply<$I['done'], [I]>,
    L extends number = number & Subtract<Limit, Shallow['true']['length']>
> = (L extends 0 | never ? true : End) extends true
    ? [...Acc, ...Shallow['true'], ...Deep] extends infer R extends unknown[][]
        ? NonEmpty<MatchAll<Needle> extends true ? PrependType<R> : R> : never
    : Search<
        Needle, Limit, Acc, $I, Next<I>, Shallow,
        Path extends Shallow['true'][number] ? Deep : [
            ...Merge<Shallow['partial'], Deep>, 
            ...DeepSearch<Needle, L, Acc, apply<$I['value'], [I]>, Path>
        ]
    >;

type Merge<A extends unknown[], B extends unknown[], I extends number = 0, R extends unknown[] = []> =
    I extends A['length'] ? [...R, ...B]
    : Merge<A, B, Next<I>, A[I] extends B[number] ? R : [...R, A[I]]>

type PrependType<T extends unknown[][], I extends number = 0, R extends unknown[] = []> =
    I extends T['length'] ? R
    : PrependType<T, Next<I>,
        T[I][0] extends Type
        ? [T[I][0]] extends R[number]
        ? [...R, T[I]]
        : [...R, [T[I][0]], T[I]]
        : [...R, T[I]]
    >;

type ShallowSearch<
    Needle,
    Limit extends number,
    $I extends $Iterator,
    I extends number = 0,
    TrueMatch extends unknown[] = [],
    PartialMatch extends unknown[] = [],
    End = apply<$I['done'], [I]>
> = Limit extends 0 ? { partial: PartialMatch, true: TrueMatch }
    : End extends true ? { partial: PartialMatch, true: TrueMatch }
    : IsNeedle<apply<$I['value'], [I]>, Needle> extends true
    ? ShallowSearch<Needle, Prev<Limit>, $I, Next<I>,[...TrueMatch, apply<$I['path'], [I]>], PartialMatch>
    : true extends IsNeedle<apply<$I['value'], [I]>, Needle>
    ? ShallowSearch<Needle, Prev<Limit>, $I, Next<I>, TrueMatch, [...PartialMatch, apply<$I['path'], [I]>]>
    : ShallowSearch<Needle, Limit, $I, Next<I>, TrueMatch>;

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

type FormatSelf<T> = GetOrElse<T, [unknown, ...unknown[]], [[self]]>;
type Spread<T> = GetOrElse<T, unknown[], []>;
type NonEmpty<T> = GetOrElse<T, [unknown, ...unknown[]], NOT_FOUND>;

type MatchAll<Needle> = Needle extends self ? true : false;

type IsNeedle<T, Needle> =
    IsAny<T> extends true ? IsAny<Needle> extends true ? true : false
    : IsAny<Needle> extends true ? false
    : [T] extends [never] ? [Needle] extends [never] ? true : MatchAll<Needle> extends true ? true : false
    : [Needle] extends [never] ? [T] extends [never] ? true : false
    : unknown extends Needle ? unknown extends T ? true : false
    : T extends Needle ? true
    : MatchAll<Needle> extends true ? T extends BaseType ? true : boolean
    : false;