import { test } from 'ts-spec';
import { Lens, a, r, Get, Replace, Over, FindPaths, free, self, FindReplace } from '../src/';

declare const needle: unique symbol;
type needle = typeof needle;

type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;

type YihaStack = Map<string, { foo: [(f: (arg: string) => 'Yiha!') => void, 'bar'] }>;

type TweenStack = Map<string, {foo: [(f: (arg: string) => Promise<needle>) => void, 'bar'] }>;

type FocusNeedle = Lens<[free.Map, 1, 'foo', 0, a, r]>;

test('readme example', t => [
    t.equal<Get<FocusNeedle, Haystack>, needle>(),
    t.equal<Replace<FocusNeedle, Haystack, 'Yiha!'>, YihaStack>(),
    t.equal<Over<FocusNeedle, Haystack, free.Promise>, TweenStack>(),
    t.equal<FindReplace<Haystack, needle, ['Yiha!']>, YihaStack>(),
    t.equal<
        FindPaths<Haystack>, [
        [free.Map],
        [free.Map, 0],
        [free.Map, 1],
        [free.Map, 1, "foo"],
        [free.Map, 1, "foo", 1],
        [free.Map, 1, "foo", 0],
        [free.Map, 1, "foo", 0, r],
        [free.Map, 1, "foo", 0, a],
        [free.Map, 1, "foo", 0, a, a],
        [free.Map, 1, "foo", 0, a, r]
    ]>(),
    t.equal<
        FindPaths<Haystack, self, [free.Map, 1, "foo", 0]>, [
        [free.Map, 1, "foo", 0, r],
        [free.Map, 1, "foo", 0, a],
        [free.Map, 1, "foo", 0, a, a],
        [free.Map, 1, "foo", 0, a, r]
    ]>()
])