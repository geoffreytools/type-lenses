import { test } from 'ts-spec';
import { FindReplace, $ReplaceCallback } from '../src/';
import { Type, A, B, Optional, Last } from "free-types-core";
import { Next } from '../src/utils';
import type { $ReplaceTable } from '../src/FindReplace';

interface $Next extends Type<[number], number> { type: Next<A<this>> }

interface $Callback extends $ReplaceCallback<number> {
    type: this['prop'] extends 'a' ? 42
        : this['prop'] extends 'b' ? 2001
        : never
    prop: Last<Optional<B, this>>
}

test('FindReplace', t => [
    t.equal<FindReplace<1, number, [42]>, 42>(),
    t.equal<FindReplace<[1], number, [42]>, [42]>(),
    t.equal<FindReplace<[1, 'b'], number, [42]>, [42, 'b']>(),
    t.equal<FindReplace<{ a: 1, b: 'b' }, number, [42]>, { a: 42, b: 'b' }>(),
    t.equal<FindReplace<{ a: 1, b: 'b' }, number, [42]>, { a: 42, b: 'b' }>(),
])

test('FindReplace nested', t => [
    t.equal<FindReplace<{ a: number, b: number[] }, number, [boolean]>, { a: boolean, b: boolean[] }>(),
    t.equal<FindReplace<{ a: number, b: readonly number[] }, number, [boolean]>, { a: boolean, b: readonly boolean[] }>(),
])

test('FindReplace open-ended tuple', t => [
    t.equal<FindReplace<[string, ...number[]], number, [boolean]>, [string, ...boolean[]]>(),
    t.equal<FindReplace<[number, ...number[]], number, [boolean]>, [boolean, ...boolean[]]>(),
])

test('FindReplace preserves the mutability of a tuple', t => [
    t.equal<FindReplace<readonly [number, string], number, [boolean]>, readonly [boolean, string]>(),
    t.equal<FindReplace<[readonly [number]], number, [boolean]>, [readonly [boolean]]>(),
])

test('FindReplace with unary free type', t => [
    t.equal<FindReplace<{ a: 1, b: 2 }, number, $Next>, { a: 2, b: 3 }>(),
])

test('FindReplace with binary free type', t => [
    t.equal<FindReplace<{ a: 1, b: 2 }, number, $Callback>, { a: 42, b: 2001 }>(),
])

test('FindReplace with a replace table', t => {
    type From = { a: Float32Array, b: Float32Array[] };
    type To = { a: { data: number[][] }, b: { data: number[][][]}};
    type Needles = Table[number][0];
    type Table = [
        [Float32Array[], { data: number[][][] }],
        [Float32Array,   { data: number[][] }],
    ];
    return t.equal<FindReplace<From, Needles, $ReplaceTable<Table>>, To>()
})

test('FindReplace multiple needles', t => [
    t.equal<FindReplace<{ a: 1, b: 2 }, number, [42]>, { a: 42, b: 42 }>(),
])

test('FindReplace multiple needles and values', t => [
    t.equal<FindReplace<[ a: 1, b: 2 ], number, [42, 2001]>, [ a: 42, b: 2001 ]>(),
    t.equal<FindReplace<[ a: 1, b: 2, c: 3 ], number, [42, 2001], [], 2>, [ a: 42, b: 2001, c: 3 ]>(),
    t.equal<FindReplace<[ a: 1, b: 2, c: 3 ], number, [42, 2001]>, [ a: 42, b: 2001, c: 2001 ]>(),
])

test('FindReplace Limit', t => [
    t.equal<FindReplace<[ a: 1, b: 2 ], number, [42], [], 1>, [ a: 42, b: 2 ]>(),
])

test('FindReplace no match', t => [
    t.equal<FindReplace<{ a: 1, b: 2 }, string, [42]>, { a: 1, b: 2 }>(),
])

// @ts-expect-error: Values[] can't be empty
{type Fail = FindReplace<{ a: 1, b: 2 }, number, []>}