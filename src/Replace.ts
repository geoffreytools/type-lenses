import { PathItem, Query, ILens } from './types'
import { Type } from 'free-types-core';
import { Next, Last } from './utils';
import { ModifyPath } from './Modify';
import { Lens } from './Lens';
import { FollowPath, NOT_FOUND } from './Follow';

export { Replace, $Replace };

type Replace<Q extends Query, Data, V extends ValidValue<Q>> =
    _Replace<Lens<Q>, Data, V>

type ValidValue<Q extends Query, L = Last<Lens<Q>['path']>> =
    L extends Type ? L['constraints'] : unknown 

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