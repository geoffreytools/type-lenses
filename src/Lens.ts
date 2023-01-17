import { Next } from './utils';

import { PathItem, Query } from './types'
import { Type, A } from 'free-types-core';

export { Lens, $Lens }

type Lens<Q extends Query=never> =
    [Q] extends [never] ? { __type_lenses: 'lens' , path: PathItem[] }
    : Q extends { __type_lenses: 'lens' } ? Q
    : Q extends PathItem ? { __type_lenses: 'lens', path: [Q] }
    : Q extends (PathItem | Lens)[] ? { __type_lenses: 'lens', path: Flatten<Q> }
    : never ;

interface $Lens extends Type<[Query], Lens> {
    type: this[A] extends Query ? Lens<this[A]> : Lens
}

type Flatten<T extends (PathItem | Lens)[], I extends number = 0, R extends PathItem[] = []> =
    I extends T['length'] ? R
    : T[I] extends PathItem
    ? Flatten<T, Next<I>, [...R, T[I]]>
    : T[I] extends Lens
    ? Flatten<T, Next<I>, [...R, ...T[I]['path']]>
    : never;