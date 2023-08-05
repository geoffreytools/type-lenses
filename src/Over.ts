import { PathItem, Query } from './types'
import { Type, apply } from 'free-types-core';
import { Next } from './utils';
import { ModifyPath } from './Modify';
import { FollowPath, NOT_FOUND } from './Follow';
import { Lens } from './Lens';

export { Over, $Over };

type Over<Q extends Query, Data, V extends Type> =
    _Over<Lens<Q>, Data, V>

type _Over<
    L extends Lens,
    Data,
    V extends Type,
    I extends number = 0,
    C extends PathItem = L['path'][I],
    F = FollowPath<C, Data, Data>
> = I extends L['path']['length'] ? apply<V, [Data]>
    : F extends NOT_FOUND ? Data
    : ModifyPath<C, Data, _Over<L, F, V, Next<I>>>;

interface $Over<Q extends Query, V extends Type> extends Type<1> {
    type: _Over<Lens<Q>, this[0], V>
}