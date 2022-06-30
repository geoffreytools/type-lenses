import { Type } from 'free-types/core';
import { Lens } from './Lens'

export { brand, self, Query, QueryItem, Param, Output, Key, PathItem, Fn, Indexable }

declare const brand: unique symbol;

type PathItem = Param | Output | self | Key | Type;
type QueryItem = PathItem | Lens;
type Query = QueryItem | QueryItem[];
type Param<K extends number=number> = { [brand]: 'param', key: K };
type Output = { [brand]: 'output' };

type self = { [brand]: 'self' };
type Fn = (...args: any[]) => unknown
type Indexable = { [k: Key]: any } & { readonly [Symbol.toStringTag]?: never };
type Key = number | string | symbol;