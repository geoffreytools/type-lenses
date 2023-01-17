import { Query } from './types'
import { Next } from './utils';
import { FollowPath } from './Follow';
import { Lens } from './Lens';
import { Type, Checked, Optional, A, B, C, $partial, $apply } from 'free-types-core'
import { MapOver, _$Optional, _ } from 'free-types/essential';

export { Get, GetMulti, $Get, $GetMulti }

type Get<Q extends Query, Data, Self = Data> =
    _Get<Lens<Q>, Data, Self>

type _Get<L extends Lens, Data, Self, I extends number = 0> = 
    Next<I> extends L['path']['length']
    ? FollowPath<L['path'][I], Data, Self>
    : _Get<L, FollowPath<L['path'][I], Data, Self>, Self, Next<I>>;

// naive implementation but it is not obvious that a custom traversal would perform better
type GetMulti<Qs extends Query[], Data, Self = Data> =
    MapOver<MapOver<Qs, $partial<$Get>>, $apply<[Data, Self]>>

interface _$Get extends Type<[Query, unknown, unknown?]> {
    type: Get<Checked<A, this>, B<this>, Optional<C, this, B<this>>>
}

type $Get<Q extends Query= never, Self = never> =
    _$Optional<_$Get, [Q, _, Self]>

interface _$GetMulti extends Type<[Query[], unknown, unknown?]> {
    type: GetMulti<Checked<A, this>, B<this>, Optional<C, this, B<this>>>
}

type $GetMulti<Qs extends Query[]= never, Self = never> =
    _$Optional<_$GetMulti, [Qs, _, Self]>