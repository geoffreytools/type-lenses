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
    FindPath,
    FindPaths,
    FindPathMulti,
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
            | [free.Map]
            | [free.Map, 0]
            | [free.Map, 1]
            | [free.Map, 1, "foo"]
            | [free.Map, 1, "foo", 0]
            | [free.Map, 1, "foo", 0, r]
            | [free.Map, 1, "foo", 0, a]
            | [free.Map, 1, "foo", 0, a, r]
            | [free.Map, 1, "foo", 0, a, a]
            | [free.Map, 1, "foo", 1]
        >(),
        t.equal<
            FindPaths<Haystack, self, [free.Map, 1, "foo", 0]>, 
            | [free.Map, 1, "foo", 0, r]
            | [free.Map, 1, "foo", 0, a]
            | [free.Map, 1, "foo", 0, a, r]
            | [free.Map, 1, "foo", 0, a, a]
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
        FindPaths<[[needle]], needle>,
        [0, 0]
    >(),
    t.equal<
        FindPaths<[[needle], any], needle>,
        [0, 0]
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
        [free.Map, 1, "foo", 0, a, r]
    >()
]);

test('FindPaths takes a From argument as starting point', t =>  [
    t.equal<
        FindPaths<{ a: needle, b: [needle] }, needle, ['b']>, 
        ['b', 0]
    >(),
    t.equal<
        FindPathMulti<{ a: needle, b: [needle] }, needle, ['b']>,
        [['b', 0]]
    >()
])

test('FindPaths can find paths which are not leaves', t => [
    t.equal<
        FindPaths<{ a: { b: 'foo' } }>,
        ['a'] | ['a', 'b']
    >(),
    t.equal<
        FindPaths<[1, 2, [3, 4]]>,
        [0] | [1] | [2] | [2, 0] | [2, 1]
    >(),
    t.equal<
        FindPaths<Map<string, Set<number>>>,
        | [free.Map]
        | [free.Map, 0]
        | [free.Map, 1]
        | [free.Map, 1, free.Set]
        | [free.Map, 1, free.Set, 0]
    >(),
    t.equal<
        FindPaths<(f: (arg: string) => void) => [number]>,
        | [a]
        | [r]
        | [r, 0]
        | [a, a]
        | [a, r]
    >(),
])

test('FindPath', t => [
    t.equal<FindPath<unknown, unknown>, [self]>(),
    t.equal<FindPath<[unknown], unknown>, [0]>(),
    t.equal<FindPath<needle, unknown>, never>(),
    t.equal<FindPath<needle, needle>, [self]>(),
    t.equal<FindPath<needle[], needle>, [number]>(),
    t.equal<FindPath<1[], needle>, never>(),
    t.equal<FindPath<[a: needle, b: 42], needle>, [0]>(),
    t.equal<FindPath<[a: [b: needle, c: 42]], needle>, [0, 0]>(),
    t.equal<FindPath<[a: 1, b: [c: needle]], needle>, [1, 0]>(),
    
    t.equal<FindPath<{ a: needle, b: 42 }, needle>, ['a']>(),
    t.equal<FindPath<{ a: 42, b: { c: needle } }, needle>, ['b', 'c']>(),
    t.equal<FindPath<{ a: { b: needle, c: 42 } }, needle>, ['a', 'b']>(),

    t.equal<FindPath<{ a: [b: needle, c: 42 ] }, needle>, ['a', 0]>(),
    t.equal<FindPath<[{ a: needle, b: 42 }], needle>, [0, 'a']>(),
    
    t.equal<FindPath<Map<string, needle>, needle>, [free.Map, 1]>(),
    t.equal<FindPath<Map<string, Set<needle>>, needle>, [free.Map, 1, free.Set, 0]>(),

    t.equal<FindPath<() => needle, needle>, [r]>(),
    t.equal<FindPath<() => () => needle, needle>, [r, r]>(),
    t.equal<FindPath<() => [needle], needle>, [r, 0]>(),
    
    t.equal<FindPath<(a: needle) => void, needle>, [a]>(),
    t.equal<FindPath<(f: (a: needle) => void) => void, needle>, [a, a]>(),
    t.equal<FindPath<(f: (a: [needle]) => void) => void, needle>, [a, a, 0]>(),
])

test('FindPath: stops at the first instance of Needle', t => [
    t.equal<FindPath<[ a: [ c: [ d: 42 ] ], b: 2001 ], number>, [1]>(),
    t.equal<FindPath<[ a: [ b: 2001, c: [ d: 42 ] ] ], number>, [0, 0]>(),

    t.equal<FindPath<{ a: { c: { d: 42 } }, b: 2001 }, number>, ['b']>(),
    t.equal<FindPath<{ a: { b: 2001, c: { d: 42 } } }, number>, ['a', 'b']>(),

    t.equal<FindPath<Triple<string, needle, Map<string, needle>>, needle>, [$Triple, 1]>(),

    t.equal<FindPath<(a: needle, b: needle) => needle, needle>, [a]>(),
    t.equal<FindPath<(f: (a: needle) => needle, b: needle) => needle, needle>, [b]>(),
    t.equal<FindPath<(a: needle) => needle, needle>, [a]>(),
    t.equal<FindPath<(a: string) => needle, needle>, [r]>(),

])

test('FindPath: deal with `any`', t => [
    t.equal<FindPath<any, any>, [self]>(),
    t.equal<FindPath<any[], any>, [number]>(),
    t.equal<FindPath<needle, any>, never>(),
    t.equal<FindPath<any, needle>, never>(),
    t.equal<FindPath<[1, any, 3], any>, [1]>(),
    t.equal<FindPath<[1, any, 3], needle>, never>(),
    t.equal<FindPath<any[], any>, [number]>(),
])

test('FindPath: deal with `never`', t => [
    t.equal<FindPath<never, never>, [self]>(),
    t.equal<FindPath<needle, never>, never>(),
    t.equal<FindPath<never, needle>, never>(),
    t.equal<FindPath<[1, never, 3], never>, [1]>(),
    t.equal<FindPath<[1, never, 3], needle>, never>(),
    t.equal<FindPath<never[], never>, [number]>(),
    t.equal<FindPath<{ a: never }, number>, never>(),
    t.equal<FindPath<{ a: never }, never>, ['a']>(),
])

test('FindPath: deal with unknown', t => [
    t.equal<FindPath<unknown, unknown>, [self]>(),
    t.equal<FindPath<[unknown], unknown>, [0]>(),
    t.equal<FindPath<needle, unknown>, never>(),
])

class Triple<A, B, C> {
    constructor(private a: A, private b: B, private c: C) {}
}

interface $Triple extends Type<3> {
    type: Triple<this[0], this[1], this[2]>
}

declare module 'free-types-core' {
    export interface TypesMap {
        Triple: $Triple
    }
}

test('FindPathMulti', t => [
    t.equal<FindPathMulti<[1, 2, 3], number>, [[0], [1], [2]]>(),
    t.equal<
        FindPathMulti<[1, [10, 20], 300], number>,
        [[0], [2], [1, 0], [1, 1]]
    >(),
    t.equal<FindPathMulti<[1, 'foo', 3], number>, [[0], [2]]>(),
    t.equal<FindPathMulti<{ a: 1, b: 2 }, number>, [['a'], ['b']]>(),
    t.equal<FindPathMulti<{ a: 1, b: 2, c: '!' }, number>, [['a'], ['b']]>(),
    t.equal<FindPathMulti<(a: 1, b: 2) => void, number>, [[a], [b]]>(),
    t.equal<FindPathMulti<() => [needle, needle], needle>, [[r, 0], [r, 1]]>(),
    t.equal<
        FindPathMulti<(f: (a: 1) => void, b: 2) => void, number>,
        [[b], [a, a]]
    >(),
    t.equal<
        FindPathMulti<(f: (a: [1]) => void, b: 2) => void, number>,
        [[b], [a, a, 0]]
    >(),
    t.equal<FindPathMulti<Map<1, 2>, number>, [[free.Map, 0], [free.Map, 1]]>(),
    t.equal<
        FindPathMulti<Map<0, Map<1, 2>>, number>,
        [[free.Map, 0], [free.Map, 1, free.Map, 0], [free.Map, 1, free.Map, 1]]
    >()
])


test('FindPathMulti Limit', t => [
    t.equal<FindPathMulti<[1, 2, 3], number, [], 2>, [[0], [1]]>(),
    t.equal<
        FindPathMulti<[1, [10, 20], 300], number, [], 3>,
        [[0], [2], [1, 0]]
    >(),
    t.equal<
        FindPathMulti<Map<0, Map<1, 2>>, number, [], 2>,
        [[free.Map, 0], [free.Map, 1, free.Map, 0]]
    >()
])
