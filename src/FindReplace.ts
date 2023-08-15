import { FindPaths } from "./FindPaths";
import { Path } from "./types";
import { Next } from "./utils";
import { Type, A, B, C, Checked, apply, Last, partialRight } from "free-types-core";
import { Replace } from "./Replace";
import { Over } from "./Over";

export { FindReplace, $Callback as $ReplaceCallback }

type $Callback<T = unknown> = Type<[T, Path?]>;

type FindReplace<T, Needle, V extends [unknown, ...unknown[]] | $Callback<Needle>, From extends Path = [], Limit extends number = number> =
    FindPaths<T, Needle, From, Limit> extends infer Queries
        ? [Queries] extends [never]
        ? T
        : Queries extends Path[]
        ? Fold<Queries, T,
            V extends unknown[] ? $WithValue<V>
            : V extends Type<[Needle]>
            ? $WithUnaryCallback<V>
            : V extends Type
            ? $WithBinaryCallback<V>
            : never>
        : never
    : never

interface $WithValue<V extends unknown[]> extends Type<[unknown, Path, number]> {
    type: unknown extends this[1] ? unknown
        : Replace<Checked<B, this>, A<this>, LastAvailable<V, C<this>>, any>
}

interface $WithUnaryCallback<V extends Type<1>> extends Type<[unknown, Path]> {
    type: unknown extends this[1] ? unknown
        : Over<Checked<B, this>, A<this>, V, any>
}

interface $WithBinaryCallback<V extends Type> extends Type<[unknown, Path]> {
    type: unknown extends this[1] ? unknown
        : Over<Checked<B, this>, A<this>,
            partialRight<V, [Checked<B, this>], $Callback>, any>
}

// TODO: make free-types/Fold accept an index
type Fold<
    T extends readonly $T['constraints'][1][],
    Init extends $T['constraints'][0] & $T['type'],
    $T extends Type<2 | 3>,
    Acc extends unknown = Init,
    I extends number = 0
> = I extends T['length'] ? Acc
    : Fold<T, Init, $T, apply<$T, [Acc, T[I], I]>, Next<I>>;

type LastAvailable<V extends unknown[], I extends number> =
    IsIndexOf<V, I> extends true ? V[I] : Last<V>;

type IsIndexOf<T extends unknown[], I extends number> =
    `${I}` extends Extract<keyof T, `${number}`> ? true : false;