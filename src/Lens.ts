import { Type } from 'free-types-core';
import { PathItem, Query } from './types';
import { Next } from './utils';
import { Audit } from './Audit';
import { Get } from './Get';

export { Lens, $Lens }

type Lens<Q extends Check & Query = never, Model = never, Check = CheckQuery<Q, Model>> =
    [Q] extends [never] ? { __type_lenses: 'lens', path: PathItem[] }
    : Q extends { __type_lenses: 'lens' } ? Q
    : Q extends PathItem ? { __type_lenses: 'lens', path: [Q] }
    : Q extends (PathItem | Lens)[] ? { __type_lenses: 'lens', path: Flatten<Q> }
    : never ;

interface $Lens extends Type<[Query], Lens> {
    type: this[0] extends Query ? Lens<this[0]> : Lens
}

type Flatten<T extends (PathItem | Lens)[], I extends number = 0, R extends PathItem[] = []> =
    I extends T['length'] ? R
    : T[I] extends PathItem
    ? Flatten<T, Next<I>, [...R, T[I]]>
    : T[I] extends Lens
    ? Flatten<T, Next<I>, [...R, ...T[I]['path']]>
    : never;

type CheckQuery<Q extends Query, Model> =
    [Model] extends [never] ? unknown
    : [Get<Q, Model>] extends [never] ? Audit<Lens<Q>, Model>
    : unknown;