import { Type } from 'free-types-core';
import { Lens } from './Lens'

export { self, Query, QueryItem, Param, Output, Key, PathItem, Fn, Indexable }

type PathItem = Param | Output | self | Key | Type;
type QueryItem = PathItem | Lens;
type Query = QueryItem | QueryItem[];
type Param<K extends number=number> = { __type_lenses: 'param', key: K };
type Output = { __type_lenses: 'output' };

type self = { __type_lenses: 'self' };
type Fn = (...args: any[]) => unknown
type Indexable = { [k: Key]: any } & { readonly [Symbol.toStringTag]?: never };
type Key = number | string | symbol;