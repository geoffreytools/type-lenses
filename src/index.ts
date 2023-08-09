export { Get, GetMulti, $Get, $GetMulti } from './Get'
// export { ReplaceMulti } from './ReplaceMulti'
export { Replace, $Replace } from './Replace'
export { Over, $Over } from './Over'
export { FindPaths } from './FindPaths'
export { FindPathMulti } from './FindPathMulti'
export { FindPath } from './FindPath'
export * from './placeholders'
export { self, Output, QueryItem, Query, Param } from './types'
export { free } from 'free-types-core';
export { inferArgs } from 'free-types-core';

import { Audit } from './Audit'
import { Lens as CreateLens, $Lens } from './Lens';
import { ILens, Query } from './types'

export { Lens, $Lens }

type Lens<
    Q extends Check = never,
    Model = never,
    Check = CheckQuery<Q, Model>
> = [Q] extends [never] ? ILens : CreateLens<Q>

type CheckQuery<Q, Model> =
    [Model] extends [never] ? Query
    : Q extends Query ? Audit<Q, Model>
    : Query;