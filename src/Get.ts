import { Query, ILens } from './types';
import { Next, _, _$Optional } from './utils';
import { FollowPath, NOT_FOUND } from './Follow';
import { Lens } from './Lens';
import { Type, Optional, B, C } from 'free-types-core'

export { Get, GetMulti, $Get, $GetMulti }

type Get<Q extends Query, Data, Self = Data> =
    _Get<Lens<Q>, Data, Self>

type _Get<
    L extends ILens,
    Data,
    Self,
    I extends number = 0,
    F = FollowPath<L['path'][I], Data, Self>
> = F extends NOT_FOUND ? never
    : Next<I> extends L['path']['length'] ? F
    : _Get<L, F, Self, Next<I>>;

type GetMulti<Qs extends Query[], Data, Self = Data> = {
    [K in keyof Qs]: Qs[K] extends infer Q extends Query ? Get<Q, Data, Self> : never
}

interface _$Get extends Type<[Query, unknown, unknown?]> {
    type: this[0] extends infer Q extends Query
        ? Get<Q, B<this>, Optional<C, this, B<this>>>
        : never
}

type $Get<Q extends Query= never, Self = never> =
    _$Optional<_$Get, [Q, _, Self]>

interface _$GetMulti extends Type<[Query[], unknown, unknown?]> {
    type: this[0] extends infer Qs extends Query[]
        ? GetMulti<Qs, B<this>, Optional<C, this, B<this>>>
        : never
}

type $GetMulti<Qs extends Query[]= never, Self = never> =
    _$Optional<_$GetMulti, [Qs, _, Self]>