import { self, Param, Output, Key, PathItem, Indexable, Fn } from './types'
import { Type, inferArgs } from 'free-types/core';

export { FollowPath }

type FollowPath<I extends PathItem, Data, Self> =
    I extends Output ? Data extends Fn ? ReturnType<Data> : never
    : I extends Param ? Data extends Fn ? Parameters<Data>[I['key']] : never
    : I extends Key ? Data extends Indexable ? Data[I] : never
    : I extends self ? Self
    : I extends Type ? inferArgs<Data, I> : never
