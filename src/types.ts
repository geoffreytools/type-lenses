import { Type } from 'free-types-core';

export { self, Query, QueryItem, Param, Output, Key, PathItem, Path, Fn, Indexable, Lens as ILens, NOT_FOUND, BaseType }

type BaseType = string | number | boolean | symbol | undefined | void ;

type PathItem = Param | Output | self | Key | Type;
type Lens = { __type_lenses: 'lens', path: PathItem[] }
type QueryItem = PathItem | Lens;
type Path = PathItem[]
type Query = QueryItem | QueryItem[];
type Param<K extends number=number> = { __type_lenses: 'param', key: K };
type Output = { __type_lenses: 'output' };

type self = { __type_lenses: 'self' };
type Fn = (...args: any[]) => unknown
type Indexable = { [k: Key]: any } & { readonly [Symbol.toStringTag]?: never };
type Key = number | string | symbol;
declare const NOT_FOUND: unique symbol;
type NOT_FOUND = typeof NOT_FOUND;