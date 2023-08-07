import { apply, Type, A } from 'free-types-core';
import { test, Context } from 'ts-spec';
import {
    Lens,
    a,
    b,
    r,
    Output,
    Get,
    $Get,
    GetMulti,
    $GetMulti,
    Replace,
    $Replace,
    Over,
    $Over,
    FindPaths,
    free,
    self,
    Query
} from './src/';

import { Next } from './src/utils';

interface $Next extends Type<[number], number> { type: Next<A<this>> }

import { Audit } from './src/Audit';

declare const needle: unique symbol;
type needle = typeof needle;

const found = <T extends string>(t: Context<T>) => t.equal<needle>();

test('readme example', t => {
    type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;
    
    type YihaStack = Map<string, { foo: [(f: (arg: string) => 'Yiha!') => void, 'bar'] }>;
    
    type TweenStack = Map<string, {foo: [(f: (arg: string) => Promise<needle>) => void, 'bar'] }>;
    
    type FocusNeedle = Lens<[free.Map, 1, 'foo', 0, a, r]>;

    return [
        found(t)<Get<FocusNeedle, Haystack>>(),
        t.equal<Replace<FocusNeedle, Haystack, 'Yiha!'>, YihaStack>(),
        t.equal<Over<FocusNeedle, Haystack, free.Promise>, TweenStack>(),
        t.equal<
            Replace<FindPaths<Haystack, needle>, Haystack, 'Yiha!'>,
            YihaStack
        >(),
        t.equal<
            FindPaths<Haystack>, 
            | [free.Map, 0]
            | [free.Map, 1, "foo", 0, r]
            | [free.Map, 1, "foo", 0, a, r]
            | [free.Map, 1, "foo", 0, a, a]
            | [free.Map, 1, "foo", 1]
        >()
    ];
})


test('Get: return `never` when needle is not found', t =>  {
    type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

    return [
        t.never<Get<[free.Function], Haystack>>(),
        t.never<Get<[free.ReadonlySet], Haystack>>(),
        t.never<Get<[free.Map, 5], Haystack>>(),
        t.never<Get<[free.Map, 1, 'bar'], Haystack>>(),
        t.never<Get<[free.Map, 1, 'foo', 2], Haystack>>(),
        t.never<Get<[b], (a: any) => unknown>>(),
        t.equal<[never], GetMulti<[[free.Function]], Haystack>>()
    ];
})

test('Replace: return the input unchanged when needle is not found', t =>  {
    type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

    return [
        t.equal<Haystack, Replace<[free.Function], Haystack, ['X'[], 'X']>>(),
        t.equal<Haystack, Replace<[free.ReadonlySet], Haystack, ['X']>>(),
        t.equal<Haystack, Replace<[free.Map, 5], Haystack, 'X'>>(),
        t.equal<Haystack, Replace<[free.Map, 1, 'bar'], Haystack, 'X'>>(),
        t.equal<Haystack, Replace<[free.Map, 1, 'foo', 2], Haystack, 'X'>>(),
    ];
})

test('Over: return the input unchanged when needle is not found', t =>  {
    type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

    return [
        t.equal<Haystack, Over<[free.Function], Haystack, free.Promise>>(),
        t.equal<Haystack, Over<[free.ReadonlySet], Haystack, free.Promise>>(),
        t.equal<Haystack, Over<[free.Map, 5], Haystack, free.Promise>>(),
        t.equal<Haystack, Over<[free.Map, 1, 'bar'], Haystack, free.Promise>>(),
        t.equal<Haystack, Over<[free.Map, 1, 'foo', 2], Haystack, free.Promise>>(),
    ];
})

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

const OK = <T extends string>(t: Context<T>) => t.equal<Query>();

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
    OK(t)<Audit<Lens<['a', 0]>, { a: [1, 2, 3] }>>(),
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

test('bare Get: tuple, object', t => [
    found(t)<Get<0, [needle, 2, 3]>>(),
    found(t)<Get<'a', { a: needle, b: 2 }>>(),
]);

test('Get `any`', t => [
    t.any<Get<'a', { a: any }>>(),
    t.any<Get<0, [any, 2, 3]>>(),
    t.any<Get<a, (a: any) => unknown>>(),
    t.any<Get<r, () => any>>(),
    t.any<Get<[free.Map, 1], Map<string, any>>>(),
])

test('bare Get: function', t => [
    found(t)<Get<a, (arg1: needle, arg2: number) => void>>(),
    found(t)<Get<r, () => needle>>(),
    found(t)<Get<r<1>, [1, () => needle]>>(),
    found(t)<Get<r<a>, (arg1: () => needle) => void>>(),
    t.equal<Get<b, {
        (a: any, b: needle, c: any): unknown
        (a: any, b: needle): unknown
        (a: any): unknown
    }>, needle | undefined>()
]);

test('tuple Get: tuple, object', t =>  [
    found(t)<Get<[0], [needle, 2, 3]>>(),
    found(t)<Get<['a'], { a: needle, b: 2 }>>(),
    found(t)<Get<[1, 0], [1, [needle, 2], 3]>>(),
    found(t)<Get<['a', 1], { a: [1, needle], b: 2 }>>(),
]);

test('path Get: tuple, object', t => [
    found(t)<Get<Lens<[0]>, [needle, 2, 3]>>(),
    found(t)<Get<Lens<['a']>, { a: needle, b: 2 }>>(),
    found(t)<Get<Lens<[1, 0]>, [1, [needle, 2], 3]>>(),
    found(t)<Get<Lens<['a', 1]>, { a: [1, needle], b: 2 }>>()
]);

test('tuple Get: function', t =>  [
    found(t)<Get<[1, a], [0, (a: needle) => void]>>(),
    found(t)<Get<['a', r], { a: () => needle, b: 2 }>>(),
    found(t)<Get<['b', r<1>], {a: 1, b: [2, (a: string) => needle]}>>(),
    found(t)<Get<['b', 1, r], {a: 1, b: [2, (a: string) => needle]}>>(),
    found(t)<Get<[a, r], (arg1: () => needle) => void>>()
]);

test('path Get', t => [
    found(t)<Get<Lens<[a]>, (a: needle) => void>>(),
    found(t)<Get<Lens<[r]>, () => needle>>(),
    found(t)<Get<Lens<[r<1>]>, [1, () => needle]>>(),
    found(t)<Get<Lens<[1, a]>, [0, (a: needle) => void]>>(),
    found(t)<Get<Lens<['a', r]>, { a: () => needle, b: 2 }>>(),
    found(t)<Get<Lens<['b', r<1>]>, {a: 1, b: [2, (a: string) => needle]}>>(),
    found(t)<Get<Lens<['b', 1, r]>, {a: 1, b: [2, (a: string) => needle]}>>(),
    found(t)<Get<Lens<[a, r]>, (arg1: () => needle) => void>>()
]);

test('Get self', t => [
    found(t)<Get<Lens<[self]>, [], needle>>(),
    found(t)<Get<[self], [], needle>>(),
    found(t)<Get<self, [], needle>>(),
    found(t)<Get<self, [1], needle>>(),
])

test('Get free type', t =>
    found(t)<Get<[free.WeakMap, 0, 'a'], WeakMap<{ a: needle }, number>>>(),
)


test('Bare Set object', t => [
    t.equal<Replace<'a', { a: 1, b: 2 }, 'foo'>, {a: 'foo', b: 2 }>()
])

test('Bare Set function', t => [
    t.equal<Replace<a, (a: number) => string, string>, (a: string) => string>(),
    t.equal<Replace<r, (a: number) => string, number>, (a: number) => number>()
])


test('Bare Set free type', t => [
    t.equal<
        Replace<free.Map, Map<number, string>, [string, number]>,
        Map<string, number>
    >()
])

test('Set tuple', t => [
    t.equal<Replace<0, [1, 2, 3], 'foo'>, ['foo', 2, 3]>(),
    t.equal<
        Replace<[1, 2], [1, [2, 20, 200, 2000], 3], 'foo'>,
        [1, [2, 20, 'foo', 2000], 3]
    >()
])

test('Set free deep', t => [
    t.equal<
    Replace<[1, free.Map, 1, free.Set], [1, Map<string, Set<2>>, 3], ['foo']>,
        [1, Map<string, Set<'foo'>>, 3]
    >()
])

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

test('GetMulti', t => {
    type Model = { a: {foo: 1}, b: [false, [2]], c: Set<3> }
    type Paths = [['a', 'foo'], ['b', 1, 0], ['c', free.Set, 0]]
    type Test = GetMulti<Paths, Model>;
    return t.equal<Test, [1,2,3]>()
})

test('$Replace produces a free type expecting Data', t => {
    type $Action = $Replace<'foo', 'hello'>;
    type Data = { foo: needle };
    type Result = apply<$Action, [Data]>

    return t.equal<Result, { foo: 'hello' }>()
})

test('$Over produces a free type expecting Data', t => {
    type $Action = $Over<'foo', $Next>;
    type Data = { foo: 1 };
    type Result = apply<$Action, [Data]>

    return t.equal<Result, { foo: 2 }>()
})

test('$Get produces a free type expecting Data', t => {
    type $Action = $Get<'foo'>;
    type Data = { foo: needle };
    type Result = apply<$Action, [Data]>

    return t.equal<Result, needle>()
})

test('$Get produces a free type expecting Data - Self', t => {
    type $Action = $Get<self>;
    type Data = { foo: needle };
    type Self = needle;
    type Result = apply<$Action, [Data, Self]>

    return t.equal<Result, needle>()
})

test('$GetMulti produces a free type expecting Data', t => {
    type $Action = $GetMulti<['foo', ['bar', 2]]>;
    type Data = { foo: 'hello', bar: [0, 1, 'world'] };
    type Result = apply<$Action, [Data]>

    return t.equal<Result, ['hello', 'world']>()
})


test('FindPaths', t =>  [
    t.equal<
        FindPaths<{ a: needle }, needle>,
        ['a']
    >(),
    t.equal<
        FindPaths<{ a: unknown }, unknown>,
        ['a']
    >(),
    t.equal<
        FindPaths<{ a: any }, any>,
        ['a']
    >(),
    t.equal<
        FindPaths<{ a: 1, b: needle }, needle>,
        ['b']
    >(),
    t.equal<
        FindPaths<{ a: any, b: needle }, needle>,
        ['b']
    >(),
    t.equal<
        FindPaths<{ a: any, b: { c: needle } }, needle>,
        ['b', 'c']
    >(),
    t.equal<
        FindPaths<needle[], needle>,
        [number]
    >(),
    t.equal<
        FindPaths<{ a: needle }[], needle>,
        [number, 'a']
    >(),
    t.equal<
        FindPaths<[any, [needle]], needle>,
        [1, 0]
    >(),
    t.equal<
        FindPaths<Map<string, needle>, needle>,
        [free.Map, 1]
    >(),
    t.equal<
        FindPaths<Map<string, {a: needle}>, needle>,
        [free.Map, 1, 'a']
    >(),
    t.equal<
        FindPaths<(a: needle, b: number) => void, needle>,
        [a]
    >(),
    t.equal<
        FindPaths<() => needle, needle>,
        [r]
    >(),
    t.equal<
        FindPaths<(f: (a: needle, b: number) => void) => void, needle>,
        [a, a]
    >(),
    t.equal<
        FindPaths<() => { a: needle }, needle>,
        [r, 'a']
    >(),
    t.equal<
        FindPaths<
            Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>,
            needle
        >,
        [free.Map, 1, "foo", 0, a, Output]
    >(),
]);