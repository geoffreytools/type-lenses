import { apply } from 'free-types-core';
import { test } from 'ts-spec';
import { a, r, Replace, $Replace, free, Query } from '../src/';

declare const needle: unique symbol;
type needle = typeof needle;

type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

// @ts-expect-error: Check replace value
{ type Fail = Replace<[free.WeakSet, 0], WeakSet<{ a: number}>, 3> }

// @ts-expect-error: Check replace value
{ type Fail = Replace<[free.WeakSet], WeakSet<{ a: number}>, [3]> }

// Replace: `any` silences false positive when Query is generic
{type Generic<Q extends Query> = Replace<Q, WeakSet<{ a: number}>, object, any>}


test('Replace: return the input unchanged when needle is not found', t => [
    t.equal<Haystack, Replace<[free.Function], Haystack, ['X'[], 'X']>>(),
    t.equal<Haystack, Replace<[free.ReadonlySet], Haystack, ['X']>>(),
    // @ts-expect-error: [free.Map, 5] is undefined
    t.equal<Haystack, Replace<[free.Map, 5], Haystack, 'X'>>(),
    t.equal<Haystack, Replace<[free.Map, 1, 'bar'], Haystack, 'X'>>(),
    t.equal<Haystack, Replace<[free.Map, 1, 'foo', 2], Haystack, 'X'>>(),
])

test('Replace: return the input unchanged when the query is `never`', t => [
    t.equal<Haystack, Replace<never, Haystack, 'X'>>()
])

test('Bare Replace object', t => [
    t.equal<Replace<'a', { a: 1, b: 2 }, 'foo'>, {a: 'foo', b: 2 }>()
])

test('Bare Replace function', t => [
    t.equal<Replace<a, (a: number) => string, string>, (a: string) => string>(),
    t.equal<Replace<r, (a: number) => string, number>, (a: number) => number>()
])


test('Bare Replace free type', t => [
    t.equal<
        Replace<free.Map, Map<number, string>, [string, number]>,
        Map<string, number>
    >()
])

test('Replace tuple', t => [
    t.equal<Replace<0, [1, 2, 3], 'foo'>, ['foo', 2, 3]>(),
    t.equal<
        Replace<[1, 2], [1, [2, 20, 200, 2000], 3], 'foo'>,
        [1, [2, 20, 'foo', 2000], 3]
    >()
])

test('Replace free deep', t => [
    t.equal<
    Replace<[1, free.Map, 1, free.Set], [1, Map<string, Set<2>>, 3], ['foo']>,
        [1, Map<string, Set<'foo'>>, 3]
    >()
])

test('$Replace produces a free type expecting Data', t => {
    type $Action = $Replace<'foo', 'hello'>;
    type Data = { foo: needle };
    type Result = apply<$Action, [Data]>

    return t.equal<Result, { foo: 'hello' }>()
})