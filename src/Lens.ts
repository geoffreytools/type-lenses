import { Type } from 'free-types-core';
import { PathItem, Query, ILens, QueryItem } from './types';
import { Next } from './utils';

export { Lens, $Lens }

/** @internal */
type Lens<Q> =
    Q extends ILens ? Q
    : Q extends PathItem ? { __type_lenses: 'lens', path: [Q] }
    : Q extends QueryItem[] ? { __type_lenses: 'lens', path: Flatten<Q> }
    : never ;

interface $Lens extends Type<[Query], ILens> {
    type: this[0] extends Query ? Lens<this[0]> : ILens
}

type Flatten<T extends unknown[], I extends number = 0, R extends unknown[] = []> =
    I extends T['length'] ? R
    : T[I] extends PathItem
    ? Flatten<T, Next<I>, [...R, T[I]]>
    : T[I] extends ILens
    ? Flatten<T, Next<I>, [...R, ...T[I]['path']]>
    : never;