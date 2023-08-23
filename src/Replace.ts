import { PathItem, Query, ILens } from './types'
import { Type } from 'free-types-core';
import { Next, Last } from './utils';
import { ModifyPath } from './Modify';
import { Lens } from './Lens';
import { FollowPath, NOT_FOUND } from './Follow';

export { Replace, $Replace };

type Replace<Q extends Query, Data, V extends Constraint, Constraint = ValidValue<Q>> =
    [Q] extends [never] ? Data : _Replace<Lens<Q>, Data, V>

type ValidValue<Q extends Query, Path extends readonly unknown[] = Lens<Q>['path']> =
    [Q] extends [never] ? unknown
    : Path extends [...any[], infer $T extends Type] ? $T['constraints']
    : Path extends [...any[], infer $T extends Type, infer N extends number] ? $T['constraints'][N]
    : unknown 

type _Replace<
    L extends ILens,
    Data,
    V,
    I extends number = 0,
    C extends PathItem = L['path'][I],
    F = FollowPath<C, Data, Data>,
> =
    I extends L['path']['length'] ? V
    : F extends NOT_FOUND ? Data
    : ModifyPath<C, Data, _Replace<L, F, V, Next<I>>>;

interface $Replace<Q extends Query, V extends ValidValue<Q>> extends Type<1> {
    type: _Replace<Lens<Q>, this[0], V>
}