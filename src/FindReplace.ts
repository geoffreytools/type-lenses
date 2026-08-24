import { FindPaths } from "./FindPaths";
import { Path } from "./types";
import { Next } from "./utils";
import { Type, Expect, A, B, C, Checked, _apply, Last, partialRight } from "free-types-core";
import { Replace } from "./Replace";
import { Over } from "./Over";

export { FindReplace, $ReplaceTable, $Callback as $ReplaceCallback }

type $Callback<T = unknown> = Type<[T, Path?]>;

type FindReplace<T, Needle, V extends [unknown, ...unknown[]] | $Callback<Needle>, From extends Path = [], Limit extends number = number> =
    FindPaths<T, Needle, From, Limit> extends infer Queries
        ? [Queries] extends [never]
        ? T
        : Queries extends Path[]
        ? Fold<Queries, T,
            V extends infer _V
                ? _V extends unknown[] ? $WithValue<_V>
                : _V extends Expect<Type<[Needle]>>
                ? $WithUnaryCallback<_V>
                : _V extends Expect<Type>
                ? $WithBinaryCallback<_V>
                : never
            : never>
        : never
    : never

interface $WithValue<V extends unknown[]> extends Type<[unknown, Path, number]> {
    type: unknown extends this[1] ? unknown
        : Replace<Checked<B, this>, A<this>, LastAvailable<V, C<this>>, any>
}

interface $WithUnaryCallback<V extends Expect<Type<1>>> extends Type<[unknown, Path]> {
    type: unknown extends this[1] ? unknown
        : Over<Checked<B, this>, A<this>, V, any>
}

interface $WithBinaryCallback<V extends Expect<Type>> extends Type<[unknown, Path]> {
    type: unknown extends this[1] ? unknown
        : Over<Checked<B, this>, A<this>,
            partialRight<V, [Checked<B, this>], $Callback>, any>
}

// TODO: make free-types/Fold accept an index
type Fold<
    T extends readonly $T['constraints'][1][],
    Init extends $T['constraints'][0] & $T['type'],
    $T extends Expect<Type<2>> | Expect<Type<3>>,
    Acc extends unknown = Init,
    I extends number = 0
> = I extends T['length'] ? Acc
    : Fold<T, Init, $T, _apply<$T, [Acc, T[I], I]>, Next<I>>;

type LastAvailable<V extends unknown[], I extends number> =
    IsIndexOf<V, I> extends true ? V[I] : Last<V>;

type IsIndexOf<T extends unknown[], I extends number> =
    `${I}` extends Extract<keyof T, `${number}`> ? true : false;


type Entry = [needle: unknown, value: unknown];

type Needles<T extends readonly Entry[]> = T[number][0];

type Lookup<T extends readonly Entry[], V> =
    T extends readonly [infer H extends Entry, ...infer R extends Entry[]]
        ? [V] extends [H[0]] ? H[1] : Lookup<R, V>
    : never;

interface $ReplaceTable<T extends readonly Entry[]> extends $Callback<Needles<T>> {
    type: Lookup<T, A<this>>
}