import { PathItem, Query, ILens } from './types'
import { Type, apply } from 'free-types-core';
import { Next } from './utils';
import { ModifyPath } from './Modify';
import { FollowPath, NOT_FOUND } from './Follow';
import { Lens } from './Lens';

export { Over, $Over, ValidTransform };

type Over<Q extends Query, Data, V extends Constraint, Constraint = ValidTransform<Q, V>> =
    _Over<Lens<Q>, Data, Extract<V, Type>>


type ValidTransform<Q extends Query, $V, Path extends unknown[] = Lens<Q>['path']> =
    $V extends Type ?
        Path extends [...any[], infer $T extends Type]
        ? RelatedTo<$T['constraints'], $V['constraints']> extends true
            ? Type<$V['constraints']['length'], $T['constraints']>
            : Audit<$T['constraints'], $V['constraints'], $T['constraints']>
        : Path extends [...any[], infer $T extends Type, infer N extends number]
        ? RelatedTo<[$T['constraints'][N]], $V['constraints']> extends true
            ? Type<1, $T['constraints'][N]>
            : Audit<[$T['constraints'][N]], $V['constraints'], $T['constraints'][N]>
        : Type
    : Type


type Audit<T extends any[], V extends any[], R, I extends number = 0, C extends any[] = []> =
    V['length'] extends T['length']
    ? I extends T['length']
        ? Type<C>
        : Audit<T, V, R, Next<I>, [...C,  RelatedTo<T[I], V[I]> extends true ? V[I]: Unrelated<V[I], T[I]>]>
    : Type<T['length'], R>

type _Over<
    L extends ILens,
    Data,
    $V extends Type,
    I extends number = 0,
    C extends PathItem = L['path'][I],
    F = FollowPath<C, Data, Data>
> = I extends L['path']['length'] ? apply<$V, [Data]>
    : F extends NOT_FOUND ? Data
    : ModifyPath<C, Data, _Over<L, F, $V, Next<I>>>;

interface $Over<Q extends Query, $V extends Type> extends Type<1> {
    type: _Over<Lens<Q>, this[0], $V>
}

type Unrelated<V, T> = [V, 'and', T, 'are unrelated' ];

type RelatedTo<T, U> = T extends U ? true : U extends T ? true : false;