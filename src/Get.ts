import { Query } from './types'
import { Next } from './utils';
import { FollowPath } from './Follow';
import { Lens } from './Lens';
import { Type, Checked, A, B, C, $partial, $apply } from 'free-types/core'
import { PipeUnsafe } from 'free-types/utility-types/composition';
import { $Map } from 'free-types/utility-types/mappables'

export { Get, GetMulti, $Get }

type Get<Q extends Query, Data, Self = Data> =
    _Get<Lens<Q>, Data, Self>

type _Get<L extends Lens, Data, Self, I extends number = 0> = 
    Next<I> extends L['path']['length']
    ? FollowPath<L['path'][I], Data, Self>
    : _Get<L, FollowPath<L['path'][I], Data, Self>, Self, Next<I>>;

// naive implementation but it is not obvious that a custom traversal would perform better
type GetMulti<Qs extends Query[], Data, Self = Data> =
    PipeUnsafe<[Qs], [$Map<$partial<$Get>>, $Map<$apply<[Data, Self]>>]>

interface $Get extends Type<[Query, unknown, unknown]> {
    type: Get<Checked<A, this>, B<this>, C<this>>
}