import { apply, Type, A, B } from 'free-types-core';
import { test, Context } from 'ts-spec';
import { Over, $Over, free, Query } from '../src/';
import { ValidTransform } from '../src/Over';
import { Next } from '../src/utils';

interface $Next extends Type<[number], number> { type: Next<A<this>> }

declare const needle: unique symbol;
type needle = typeof needle;

type Haystack = Map<string, { foo: [(f: (arg: string) => needle) => void, 'bar'] }>;


// Over: `any` silences false positive when Query is generic
{type Generic<Q extends Query> = Over<Q, Set<1>, $Next, any>}


test('Over: return the input unchanged when needle is not found', t => [
    t.equal<Haystack, Over<[free.Map, 1, 'bar'], Haystack, free.Promise>>(),
    t.equal<Haystack, Over<[free.Map, 1, 'foo', 2], Haystack, free.Promise>>(),
])

const IsStandardCheck = <T extends string>(t: Context<T>) =>
    t.equal<Type<2, [object, unknown]>>();

test('Over: type checking paths ending with a Type', t => [
    // this passes even though it is not garanteed to run
    IsStandardCheck(t)<
        ValidTransform<[free.WeakMap], Type<[object, number], [object, unknown]>>
    >(),
    // check arity
    IsStandardCheck(t)<
        ValidTransform<[free.WeakMap], Type<[unknown], [object, unknown]>>
    >(),
    // check return type
    IsStandardCheck(t)<
        ValidTransform<[free.WeakMap], Type<[object, unknown], number>>
    >(),
    // check return type
    IsStandardCheck(t)<
        ValidTransform<[free.WeakMap], Type<[object, unknown], [number]>>
    >(),
    // check relatedness of arguments
    t.equal<
        ValidTransform<[free.WeakMap], Type<[string, unknown], [object, unknown]>>,
        Type<[[string, 'and', object, 'are unrelated' ], unknown]>
    >(),
])

{
    type Generic<Haystack> = Over<
        [free.WeakMap],
        Haystack,
        // This transform may succeed or fail depending on the Haystack
        // but we can't check it without making Over impractical to use
        Type<[object, number], [object, unknown]>
        //            ------
    >;
}

test('Over: type checking paths ending with Type arguments', t => [
    
    // check arity
    t.equal<
    ValidTransform<[free.WeakMap, 1], Type<[object, number], number>>,
        Type<1, unknown>
    >(),
    // check Query
    t.equal<
    ValidTransform<[free.WeakMap, 5], Type<[object, number], number>>,
        // because WeakMap only has 2 arguments, the return type can only be `undefined`
        Type<1, undefined>
    >(),
    // check return type
    t.equal<
    ValidTransform<[free.WeakMap, 0], Type<[unknown], number>>,
        Type<1, object>
    >(),
    // check relatedness of arguments
    t.equal<
        ValidTransform<[free.WeakMap, 0], Type<[string], object>>,
        Type<[[string, 'and', object, 'are unrelated' ]]>
    >()
])

test('$Over produces a free type expecting Data', t => {
    type $Action = $Over<'foo', $Next>;
    type Data = { foo: 1 };
    type Result = apply<$Action, [Data]>

    return t.equal<Result, { foo: 2 }>()
})