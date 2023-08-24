import { test, Context } from 'ts-spec';
import { Lens, a, b, r, Output, Get, Replace, free, self, QueryItem, Audit, Successful } from '../src/';

test('r', t => [
    t.equal<r, Output>(),
    t.equal<r<a>, Lens<[a, r]>>(),
    t.equal<r<[a, b]>, Lens<[a, b, r]>>(),
    t.equal<r<r>, Lens<[r, r]>>(),
    t.equal<r<r<a>>, Lens<[a, r, r]>>()
])

test('Lens can take a standalone path item or a tupe', t => [
    t.equal<Lens<'foo'>, Lens<['foo']>>(),
    t.equal<Lens<1>, Lens<[1]>>(),
    t.equal<Lens<a>, Lens<[a]>>(),
    t.equal<Lens<r>, Lens<[r]>>(),
    t.equal<Lens<self>, Lens<[self]>>(),
]);

test('Lens idempotence', t =>
    t.equal<Lens<Lens<[a, r]>>, Lens<[a, r]>>()
)

test('Lens composition', t =>
    t.equal<
        Lens<[Lens<1>, Lens<['a', 2, r]>]>,
        Lens<[1, ...['a', 2, r]]>
    >()
)

test('laws: identity', t => {
    type FocusName = Lens<'name'>;
    type User = { name: 'foo' };

    return t.equal<Replace<FocusName, User, Get<FocusName, User>>, User>()
})

test('laws: retention', t => {
    type FocusName = Lens<'name'>;
    type User = { name: 'foo' };

    return t.equal<Get<FocusName, Replace<FocusName, User, 'bar'>>, 'bar'>()
})

test('laws: recency', t => {
    type FocusName = Lens<'name'>;
    type User = { name: 'foo' };

    return t.equal<Get<FocusName, Replace<FocusName, Replace<FocusName, User, 'bar'>, 'baz'>>, 'baz'>()
})

const OK = <T extends string>(t: Context<T>) => t.equal<QueryItem[]>();

test('Flat Lens type checking', t => [
    OK(t)<Audit<['a'], { a: [1, 2, 3] }>>(),
    OK(t)<Audit<['a', 0], { a: [1, 2, 3] }>>(),
    OK(t)<Audit<['a', 'c'], { a: { c: 1 } }>>(),
    OK(t)<Audit<[free.Map], Map<string, unknown>>>(),
    OK(t)<Audit<['a', free.Map], { a: Map<string, unknown> }>>(),
    OK(t)<Audit<[a], (a: any, b: any) => unknown>>(),
    OK(t)<Audit<[b], {
        (a: any, b: any, c: any): unknown
        (a: any, b: any): unknown
        (a: any): unknown
    }>>(),

    t.equal<
        Audit<'b', { a: [1, 2, 3] }>,
        'a'
    >(),
    t.equal<
        Audit<['a', 0, 0], { a: [1, 2, 3] }>,
        ['a', 0]
    >(),
    t.equal<
        Audit<['a', 0, 0, 0], { a: [1, 2, 3] }>,
        ['a', 0]
    >(),
    t.equal<
        Audit<['b'], { a: [1, 2, 3] }>,
        ['a']
    >(),
    t.equal<
        Audit<['a', 'b'], { a: [1, 2, 3] }>,
        ['a', 0 | 1 | 2]
    >(),
    t.equal<
        Audit<['a', 'b'], { a: { c: 1 } }>,
        ['a', 'c']
    >(),
    t.equal<
        Audit<['a', 'b', 'd'], { a: { b: {c: 1 } } }>,
        ['a', 'b', 'c']
    >(),
    t.equal<
        Audit<['a', 'b', 'c', 'e'], { a: { b: { c: { d: 1} } } }>,
        ['a', 'b', 'c', 'd']
    >(),
    t.equal<
        Audit<['a', 'b'], { a: Map<string, unknown> }>,
        ['a', free.Map]
    >(),
    t.equal<
        Audit<['a', 'b'], { a: (...args: any[]) => unknown }>,
        ['a', a | r]
    >(),
    t.equal<
        Audit<[free.Set], Map<string, unknown>>,
        [free.Map]
    >(),
    t.equal<
        Audit<[1, free.Set], [0, Map<string, unknown>]>,
        [1, free.Map]
    >(),
    t.equal<
        Audit<[free.Map, 2], Map<string, unknown>>,
        [free.Map, 0 | 1]
    >(),
    t.equal<
        Audit<[b], (a: any) => unknown>,
        [a | r]
    >(),
])

test('Nested Lens type checking', t => [
    t.equal<QueryItem, Audit<Lens<['a', 0]>, { a: [1, 2, 3] }>>(),
    OK(t)<Audit<[Lens<['a', 0]>], { a: [1, 2, 3] }>>(),
    OK(t)<Audit<[Lens<'a'>, Lens<0>], { a: [1, 2, 3] }>>(),

    t.equal<
        Audit<Lens<['a', 'b']>, { a: [1, 2, 3] }>,
        Lens<["a", 0 | 1 | 2]>
    >(),
    t.equal<
        Audit<[Lens<['a', 'b']>], { a: [1, 2, 3] }>,
        [Lens<["a", 0 | 1 | 2]>]
    >(),
    t.equal<
        Audit<[Lens<'a'>, Lens<'b'>], { a: [1, 2, 3] }>,
        [Lens<'a'>, Lens<0 | 1 | 2>]
    >(),
    t.equal<
        Audit<['a', Lens<'b'>], { a: [1, 2, 3] }>,
        ['a', Lens<0 | 1 | 2>]
    >(),
    t.equal<
        Audit<[Lens<'a'>, 'b'], { a: [1, 2, 3] }>,
        [Lens<'a'>, 0 | 1 | 2]
    >(),

    // They are expected to flatten
    t.equal<
        Audit<Lens<[Lens<'a'>, Lens<'b'>]>, { a: [1, 2, 3] }>,
        Lens<['a' , 0 | 1 | 2]>
    >(),
]);

test('The audit is open-ended when the error is not the last query item', t => [
    t.equal<Audit<['h', 'b'], { a: { b: 1 } }>, ['a', ...QueryItem[]]>()
])

test('Successful returns a boolean representing success', t => [
    t.true<Successful<Audit<['a'], { a: 1 }>>>(),
    t.false<Successful<Audit<['b'], { a: 1 }>>>(),
])