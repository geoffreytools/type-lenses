import { Type } from 'free-types-core';
import { test } from 'ts-spec';
import { a, b, r, FindPath, FindPaths, free, self } from '../src/';

declare const needle: unique symbol;
type needle = typeof needle;

type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

test('FindPath', t =>  [
    t.equal<FindPath<needle, needle>, [self]>(),
    t.equal<FindPath<unknown, unknown>, [self]>(),
    t.equal<FindPath<1, needle>, never>(),
    t.equal<FindPath<any, needle>, never>(),
    t.equal<FindPath<never, never>, [self]>(),
    t.equal<FindPath<never, needle>, never>(),
    t.equal<FindPath<{ a: needle }, needle>, ['a']>(),
    t.equal<FindPath<{ a: unknown }, unknown>, ['a']>(),
    t.equal<FindPath<{ a: any }, any>, ['a']>(),
    t.equal<FindPath<{ a: 1, b: needle }, needle>, ['b']>(),
    t.equal<FindPath<{ a: any, b: needle }, needle>, ['b']>(),
    t.equal<FindPath<{ a: any, b: { c: needle } }, needle>, ['b', 'c']>(),
    t.equal<FindPath<needle[], needle>, [number]>(),
    t.equal<FindPath<{ a: needle }[], needle>, [number, 'a']>(),
    t.equal<FindPath<[[needle]], needle>, [0, 0]>(),
    t.equal<FindPath<[[needle], any], needle>, [0, 0]>(),
    t.equal<FindPath<[any, [needle]], needle>, [1, 0]>(),
    t.equal<FindPath<Map<string, needle>, needle>, [free.Map, 1]>(),
    t.equal<FindPath<Map<string, {a: needle}>, needle>, [free.Map, 1, 'a']>(),
    t.equal<FindPath<(a: needle, b: number) => void, needle>, [a]>(),
    t.equal<FindPath<() => needle, needle>, [r]>(),
    t.equal<FindPath<(f: (a: needle, b: number) => void) => void, needle>, [a, a]>(),
    t.equal<FindPath<() => { a: needle }, needle>, [r, 'a']>(),
    t.equal<FindPath<Haystack, needle>, [free.Map, 1, "foo", 0, a, r]>()
]);

test('FindPath takes a From argument as starting point', t =>  [
    t.equal<
        FindPath<{ a: needle, b: [needle] }, needle, ['b']>, 
        ['b', 0]
    >()
])

test('FindPath', t => [
    t.equal<FindPath<needle, needle>, [self]>(),
    t.equal<FindPath<needle[], needle>, [number]>(),
    t.equal<FindPath<1[], needle>, never>(),
    t.equal<FindPath<[a: needle, b: 42], needle>, [0]>(),
    t.equal<FindPath<[a: [b: needle, c: 42]], needle>, [0, 0]>(),
    t.equal<FindPath<[a: 1, b: [c: needle]], needle>, [1, 0]>(),
    t.equal<FindPath<[undefined], undefined>, [0]>(),
    t.equal<FindPath<[undefined], self>, [0]>(),
    
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

test('FindPaths can find paths which are not leaves', t => [
    t.equal<
        FindPaths<[[1, 2], 3]>,
        [[1], [0], [0, 0], [0, 1]]
    >(),
    t.equal<
        FindPaths<[[1, 2], [3, 4]]>,
        [[0], [1], [0, 0], [0, 1], [1, 0], [1, 1]]
    >(),
    t.equal<
        FindPaths<{a: [1, 2], b: 3}>,
        [['b'], ['a'], ['a', 0], ['a', 1]]
    >(),
    t.equal<
        FindPaths<{ a: { b: 'foo' } }>,
        [['a'], ['a', 'b']]
    >(),
    t.equal<
        FindPaths<[1, 2, [3, 4]]>,
        [[0], [1], [2], [2, 0], [2, 1]]
    >(),
    t.equal<
        FindPaths<Map<string, Set<number>>>, [
        [free.Map],
        [free.Map, 0],
        [free.Map, 1],
        [free.Map, 1, free.Set],
        [free.Map, 1, free.Set, 0]
    ]>(),
    t.equal<
        FindPaths<(f: (arg: string) => void) => [number]>, [
        [a],
        [r],
        [a, a],
        [a, r],
        [r, 0],
    ]>(),
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

test('FindPaths', t => [
    t.equal<FindPaths<{ a: 1 }, needle, ['a']>, []>(),
    t.equal<FindPaths<{ a: 1 }, needle>, []>(),
    t.equal<FindPaths<{ a: needle }, needle, ['a']>, ['a']>(),
    t.equal<FindPaths<[1, 2, 3], number>, [[0], [1], [2]]>(),
    t.equal<
        FindPaths<[1, [10, 20], 300], number>,
        [[0], [2], [1, 0], [1, 1]]
    >(),
    t.equal<FindPaths<[1, 'foo', 3], number>, [[0], [2]]>(),
    t.equal<FindPaths<{ a: 1, b: 2 }, number>, [['a'], ['b']]>(),
    t.equal<FindPaths<{ a: 1, b: 2, c: '!' }, number>, [['a'], ['b']]>(),
    t.equal<FindPaths<(a: 1, b: 2) => void, number>, [[a], [b]]>(),
    t.equal<FindPaths<() => [needle, needle], needle>, [[r, 0], [r, 1]]>(),
    t.equal<
        FindPaths<(f: (a: 1) => void, b: 2) => void, number>,
        [[b], [a, a]]
    >(),
    t.equal<
        FindPaths<(f: (a: [1]) => void, b: 2) => void, number>,
        [[b], [a, a, 0]]
    >(),
    t.equal<FindPaths<Map<1, 2>, number>, [[free.Map, 0], [free.Map, 1]]>(),
    t.equal<
        FindPaths<Map<0, Map<1, 2>>, number>,
        [[free.Map, 0], [free.Map, 1, free.Map, 0], [free.Map, 1, free.Map, 1]]
    >()
])


test('FindPaths Limit', t => [
    t.equal<FindPaths<[1, 2, 3], number, [], 2>, [[0], [1]]>(),
    t.equal<
        FindPaths<[1, [10, 20], 300], number, [], 3>,
        [[0], [2], [1, 0]]
    >(),
    t.equal<
        FindPaths<Map<0, Map<1, 2>>, number, [], 2>,
        [[free.Map, 0], [free.Map, 1, free.Map, 0]]
    >()
])