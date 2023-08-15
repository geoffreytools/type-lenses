import { test } from 'ts-spec';
import { FindReplace, $ReplaceCallback } from '../src/';
import { Type, A, B, Optional, Last } from "free-types-core";
import { Next } from '../src/utils';

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

test('FindReplace with unary free type', t => [
    t.equal<FindReplace<{ a: 1, b: 2 }, number, $Next>, { a: 2, b: 3 }>(),
])

test('FindReplace with binary free type', t => [
    t.equal<FindReplace<{ a: 1, b: 2 }, number, $Callback>, { a: 42, b: 2001 }>(),
])

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