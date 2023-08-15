import { apply } from 'free-types-core';
import { test, Context } from 'ts-spec';
import { Lens, a, b, r, Get, $Get, GetMulti, $GetMulti, free, self } from '../src/';

declare const needle: unique symbol;
type needle = typeof needle;

const found = <T extends string>(t: Context<T>) => t.equal<needle>();

type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

test('Get: return `never` when needle is not found', t => [
    t.never<Get<[free.Function], Haystack>>(),
    t.never<Get<[free.ReadonlySet], Haystack>>(),
    t.never<Get<[free.Map, 5], Haystack>>(),
    t.never<Get<[free.Map, 1, 'bar'], Haystack>>(),
    t.never<Get<[free.Map, 1, 'foo', 2], Haystack>>(),
    t.never<Get<[b], (a: any) => unknown>>(),
    t.equal<[never], GetMulti<[[free.Function]], Haystack>>()
])

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

test('GetMulti', t => {
    type Model = { a: {foo: 1}, b: [false, [2]], c: Set<3> }
    type Paths = [['a', 'foo'], ['b', 1, 0], ['c', free.Set, 0]]
    type Test = GetMulti<Paths, Model>;
    return t.equal<Test, [1,2,3]>()
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