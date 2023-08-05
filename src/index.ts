export { Get, GetMulti, $Get, $GetMulti } from './Get'
// export { ReplaceMulti } from './ReplaceMulti'
export { Replace, $Replace } from './Replace'
export { Over, $Over } from './Over'
export * from './placeholders'
export { self, Output, QueryItem, Query, Param } from './types'
export { free } from 'free-types-core';
export { inferArgs } from 'free-types-core';

import { Audit } from './Audit'
import { Get } from './Get'
import { Lens as CreateLens } from './Lens';
import { ILens, Query } from './types'

export type Lens<
    Q extends Check & Query = never,
    Model = never,
    Check = CheckQuery<Q, Model>
> = [Q] extends [never] ? ILens : CreateLens<Q>

type CheckQuery<Q extends Query, Model> =
    [Model] extends [never] ? unknown
    : [Get<Q, Model>] extends [never] ? Audit<Lens<Q>, Model>
    : unknown;