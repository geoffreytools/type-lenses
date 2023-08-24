# type-lenses 

Extract or modify pieces of arbitrarily nested types with type lenses.

## How to install

```
npm install type-lenses
```

## Overview
We are interested in `needle` in the type bellow
```typescript
type Haystack = Map<string, {foo: [(f: (arg: string) => needle) => void, 'bar'] }>;
```

### Define a lens
We write a path pointing to our needle:
```typescript
import { Lens, free, a, r } from 'type-lenses';

type FocusNeedle = Lens<[free.Map, 1, 'foo', 0, a, r]>;
```
In plain English, the steps are as follows: 
1) Focus on the type `Map`
1) Focus on the argument at index `1` in the arguments list
1) Focus on the field `"foo"` in the object
1) Focus on the element at index `0` in the tuple
1) Focus on the first parameter of the function
1) Focus on the return type of the function

### Extract a piece of type
We can extract our `needle` with `Get`:
```typescript
import { Get } from 'type-lenses';

type Needle = Get<FocusNeedle, Haystack>;
```
It results in:
```
needle
```
### Replace a piece of type
We can replace `needle` by any compatible type with `Replace`:
```typescript
import { Replace } from 'type-lenses';

type YihaStack = Replace<FocusNeedle, Haystack, 'Yiha!'>;
```
```typescript
// result:
Map<string, {foo: [(f: (arg: string) => 'Yiha!') => void, 'bar'] }>
```
### Map over a type
Similarily to `Replace`, `Over` lets us replace `needle` with the result of applying it to a compatible ready-made or custom free type:

```typescript
import { Over } from 'type-lenses';

type PromiseStack = Over<FocusNeedle, Haystack, free.Promise>;
```
```typescript
// result:
Map<string, {foo: [(f: (arg: string) => Promise<needle>) => void, 'bar'] }>
```

### Find and replace

`FindReplace` removes the need to construct a path, as long as we know what `needle` to target:

```typescript
import { FindReplace } from 'type-lenses';

type YihaStack = FindReplace<Haystack, needle, ['Yiha!']>;
```
```typescript
// result:
Map<string, {foo: [(f: (arg: string) => 'Yiha!') => void, 'bar'] }>
```

It also accepts a replace callback of type `Type<[Needle, Path?]>` if you need to run arbitrary logic:

```typescript
// any unary free type can work
type Foo = FindReplace<{ a: 1, b: 2 }, number, free.Promise>;

import { $ReplaceCallback } from 'type-lenses';
import { Optional, Last, A, B } from 'free-types';

// or one of your design (don't freak out, see the doc)
interface $Callback extends $ReplaceCallback<number> {
    type: this['prop'] extends 'a' ? Add<10, A<this>>
        : this['prop'] extends 'b' ? Promise<A<this>>
        : never
    prop: Last<Optional<B, this>>
}

type Bar = FindReplace<{ a: 1, b: 2 }, number, $Callback>;
```
```typescript
// result:
type Foo = { a: Promise<1>, b: Promise<2> }
type Bar = { a: 11, b: Promise<2> }
```

`FindReplace` gives control over the search, the number of matches and the way they are replaced, with some limitations to keep in mind. Make sure to read the documentation.

### Find paths
We can find paths with `FindPath` and `FindPaths`.

The former is guaranteed to return a single path pointing to `needle`, or `never`:

```typescript
import { FindPath } from 'type-lenses';

type PathToNeedle = FindPath<Haystack, needle>;
```
```typescript
// result:
[free.Map, 1, "foo", 0, Param<0>, Output]
```
- `Param<0>` and `Output` are aliases for `a` and `r`;
- `free.Map` is a built-in free type, but you can also register your own so they can be inferred (see [doc/$Type](#type));
- The behaviour for singling out a match is documented in [doc/FindPath(s)](#findpaths).

The latter returns a tuple of every path leading to `needle`. If it is `self` (the default), it returns every possible path, which can be useful for exploring a type.
```typescript
import { FindPaths } from 'type-lenses';

type EveryPath = FindPaths<Haystack>;
```
```typescript
// result:
[[free.Map],
[free.Map, 0],
[free.Map, 1],
[free.Map, 1, "foo"],
[free.Map, 1, "foo", 1],
[free.Map, 1, "foo", 0],
[free.Map, 1, "foo", 0, r],
[free.Map, 1, "foo", 0, a],
[free.Map, 1, "foo", 0, a, a],
[free.Map, 1, "foo", 0, a, r]]
```

`FindPath(s)` give control over the search and the number of matches, with some limitations to keep in mind. Make sure to read the documentation.

### Audit queries

Finally, we can type check a query, typically in a function:

```typescript
declare const foo: <
    const Path extends readonly string[] & Check,
    Obj extends object,
    Check = Audit<Path, Obj>
>(path: Path, obj: Obj) => void;

foo(['q', 'b'], { a: { b: 42 }})
//   ~~~ Type "q" is not assignable to type "a"
```

# Documentation

[Type Checking](#type-checking) | [Lens](#lens) | [Query](#Query) | [Type](#type) | [Get](#get) | [GetMulti](#getmulti) | [Replace](#replace) | [Over](#over) | [FindReplace](#findreplace) | [FindPath(s)](#findpaths) | [Audit](#audit) | [Free utils](#get-getmulti-replace-over)

### Type checking

The library type checks your inputs in various ways, but these checks never involve the `Haystack`.

This is because the type checker fails to check generics, even with adequate type constraints. Since working with a generic `Haystack` is a very common use case for lenses, I chose to ignore this check for ease of use.

If you need to check your query, you can do so with a `Lens`.


### `Lens`

`Lens<Query, Model?>`

You can create a lens by passing a `Query` to `Lens`.

```typescript
type A = Lens<1>;
type B = Lens<['a', 2, r]>;
```

Utils such as `Get` or `Replace` promote every `Query` to a `Lens`, but it is advised to work with lenses when you want to reuse or compose paths.

Composing lenses is as simple as wrapping them in a new `Lens`:

```typescript
type C = Lens<[A, B]> // Lens<[1, 'a', 2, r]>
```

`Lens` optionally takes a `Model` against which to perform type checking.

```typescript
type Haystack = Map<string, {foo: [(f: (arg: string) => needle) => void, 'bar'] }>;
type FocusNeedle = Lens<[free.Map, 1, 'bar', 0, a, r], Haystack>;
//                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type '[$Map, 1, "bar", 0, a, Output]' does not satisfy the constraint '[$Map, 1, "foo", ...QueryItem[]]'.
//  Type at position 2 in source is not compatible with type at position 2 in target.
//    Type '"bar"' is not assignable to type '"foo"'
```

### Query

A `Query` is a `Lens`, a `Path` or a `PathItem`

A `Path` is a tuple of `PathItem`.

Path items can be one of the following types: 

<table>
<tr><th>type</th><th>description</th></tr>
<tr>
<td><code>Lens</code></td>
<td>As we have already seen, nested lenses are flattened.</td>
</tr>
<tr>
<td><code>Param<&#8288;index></code><br>or&nbsp;<code>a</code>,&nbsp;<code>b</code>,&nbsp;...<code>f</code></td>
<td>Focuses on a parameter of a function.</td>
</tr>
<tr>
<td><code>Output</code> or <code>r</code></td>
<td><p>Focuses on the return type of a function.

`r` can be an alias of `Output` but can also optionally take an argument: `r<a>` is equivalent to `Lens<[a, r]>`.</td>
</tr>
<tr>
<td><code>string</code></td>
<td>Focuses on the field of a given name in an object.</td>
</tr>
<tr>
<td><code>number</code></td>
<td>Focuses on the item at a given index in a tuple.</td>
</tr>
<tr>
<td><code>self</code></td>
<td>By default it refers to the haystack, but some utils enable providing a value for it.</td>
</tr>
<tr>
<td><code>$Type</code></td>
<td>Focuses on the arguments list of a type for which <code>$Type</code> is a free type constructor.</td>
</tr>
</table>

### `$Type`

In a nutshell:

```typescript
// A class we want to reference in a path
class Foo<T extends number> {
    constructor(private value: T) {}
}
```
```bash
npm install free-types
```
```typescript
import { Type, A } from 'free-types'

// A free type constructor for that class
interface $Foo extends Type<[A: number]> {
    type: Foo<A<this>>
}

// Imagining a haystack where the needle is the first argument of Foo
type Haystack = Foo<needle>

// Our path would look like this
type FocusNeedle = Lens<[$Foo, 0]>;

type Needle = Get<FocusNeedle, Haystack>; // needle
```
```typescript
// We can also define a free utility type
interface $Exclaim extends Type<[string]> { type `${A<this>}!` }

type Exclamation = Over<['a'], { a: 'Hello' }, $Exclaim> // { a: "Hello!" }
```

`type-lenses` re-exports a [dozen](https://github.com/geoffreytools/free-types/blob/public/doc/Documentation.md#free) built-in free type constructors under the namespace `free`.

If you want `FindPaths` to be able to find your own free types, you must register them:

```typescript
declare module 'free-types' {
    interface TypesMap { Foo: $Foo }
}
```

See [free-types](https://github.com/geoffreytools/free-types) for more information.


## Querying and modifying types

### `Get`
Return the queried piece of type or `never` if it is not found.

#### Syntax
`Get<Query, Haystack, Self>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to extract a piece of type from
|Self| A type which you want `self` to point to. It is `Haystack` by default

### `GetMulti`
The same as `Get`, but takes a tuple of `Query` and returns a tuple of results.

#### Syntax
`GetMulti<Query[], Haystack, Self>`

### `Replace`

Replace the queried piece of type with a new value in the parent type, or return the parent type unchanged if the query is `never` or doesn't match anything.

#### Syntax
`Replace<Query, Haystack, Value, Constraint?>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to modify
|Value | Any type you want to replace the needle with
|Constraint | A mean of turning off type checking in higher order scenarios

#### Type checking
`Value` is type checked against the `Query`:
```typescript
type Failing = Replace<[free.WeakSet, 0], WeakSet<{ foo: number }>, number>
//                      ---------------                             ~~~~~~
type Failing = Replace<[free.WeakSet], WeakSet<{ foo: number }>, [number]>
//                      ------------                             ~~~~~~~~
// Type 'number' does not satisfy the constraint 'object'
```

If `Query` is generic, you will have to opt-out from type checking by setting `Constraint` to `any`:

```typescript
type Generic<Q> = Replace<Q, WeakSet<{ foo: number }>, object, any>
//                                                             ---
```


### `Over`

Map over the parent type, replacing the queried piece of type with the result of applying it to the provided free type. Return the parent type unchanged if the query failed.

#### Syntax
`Over<Query, Haystack, $Type, Constraint?>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to modify
|$Type | A free type constructor
|Constraint | A mean of turning off type checking in higher order scenarios

#### Type checking
The return type of `$Type` is fully type checked against the `Query`, however its parameters are only checked loosely for relatedness, because they also depend on the `Haystack` which is purposely excluded from type checking:
```typescript
type Failing = Over<[free.WeakSet, 0], WeakSet<{foo: number}>, $Next>
//                                                             ~~~~~
// Type '$Next' does not satisfy the constraint 'Type<[Unrelated<number, object>]>'

type NotFailing = Over<[free.Set, 0], Set<'hello'>, $Next>
//           will blow up with no error   -------   -----
```

If `Query` is generic, you will have to opt-out from type checking by setting `Constraint` to `any`:

```typescript
type Generic<Q> = Over<Q, Set<1>, $Next, any>
//                                       ---
```
### `FindReplace`

Find a `Needle` in the parent type and replace matches with new values, or return the parent type unchanged if there is no match.

The search behaves like [`FindPaths`](#findpaths).

If there are more matches than you specified replace values, the last replace value is used to replace the supernumerary matches:

```typescript
type WithValues = FindReplace<[1, 2, 3], number, [42, 2001]>;
// type WithValues = [42, 2001, 2001]
```

> **Warning**
> Do not expect object properties to be found and replaced in a specific order. If you need to find/replace multiple values in the same object, use a replace callback instead of a tuple of values.

#### Syntax
`FindReplace<Haystack, Needle, Values | $Type, From?, Limit?>`

|parameter| description|
|-|-|
|Haystack| The type you want to modify
|Needle| The piece of type you want to search
|Values \| $Type| A tuple of values to replace the matches with, or a replace callback
|From| A path from which to start the search.
|Limit| The maximum number of matches to find and replace

#### Type checking

If you use a replace callback, its first parameter must extend your `Needle`.

#### Replace callback

If you want to define a custom replace callback, you can extend `$ReplaceCallback<T>` which is really `Type<[T, Path?]>` where `T` is your `Needle`: 

```typescript
import { $ReplaceCallback } from 'type-lenses';
import { Optional, Last, A, B } from 'free-types';

interface $Callback extends $ReplaceCallback<number> {
    type: this['prop'] extends 'a' ? Add<10, A<this>>
        : this['prop'] extends 'b' ? Promise<A<this>>
        : never
    prop: Last<Optional<B, this>>
}

type WithCallback = FindReplace<{ a: 1, b: 2 }, number, $Callback>;
// type WithCallback = { a: 11, b: Promise<2> }
```

The types `Optional`, `A` and `B` let you safely index `this` to extract the arguments passed to `$Callback`, while defusing type constraints.

- `Add` expects a `number`, which is satisfied by `A<this>`;
- `Last` expects a tuple, which is satisfied by `Optional<B, this>`.

More information about these helpers in free-types' [guide](https://github.com/geoffreytools/free-types/blob/public/doc/Guide.md#helpers).

Here I also created a `prop` field for clarity, using `Last` to select the last `PathItem` in the `Path`.

### `FindPath(s)`

`FindPath` is literally defined like so:

```typescript
type FindPath<T, Needle, From extends Path = []> =
    Extract<FindPaths<T, Needle, From, 1>[0], [any, ...any[]]>;
```


`FindPaths` returns a tuple of every path leading to the `Needle`, or every possible path when `Needle` is `self` (the default).

The search results are ordered according to the following rules, ranked by precedence:

1) Matches closer to the root are listed first (breadth-first search);
1) Matches honour the ordering of tuples and function arguments lists;
1) Matches **do not** honour the ordering of object properties;
1) In function signatures, matched parameters are listed before any matched return type;
1) the needles `any`, `never` and `unknown` match `any`, `never` and `unknown` respectively (use `self` to  match every path);
1) When the needle is `self`, the ordering of paths which do not lead to a `BaseType` (a leaf) is unspecified.

```typescript
type BaseType = string | number | boolean | symbol | undefined | void;
```

#### Syntax
`FindPaths<T, Needle?, From?, Limit?>`

|parameter| description|
|-|-|
|T| The type you want to probe
|Needle| The piece of type you want selected paths to point to. It defaults to `self`, which selects every possible path.
|From| A path from which to start the search.
|Limit| The maximum number of matches to return

#### From

`From` enables you to specify which path should be searched for potential matches. It can be used for disambiguation or to improve performance:

```typescript
type PathsSubset = FindPaths<{ a: [1], b: [2] }, number, ['b']>
// type PathsSubset = [['b', 0]]
```

#### Limit

`Limit` enables you to ignore matches which are of no interest to you. It also improves performance:

```typescript
//     provide an empty `From` to access this parameter  vv
type PathsSubset = FindPaths<{ a: [1], b: [2] }, number, [], 1>
// type PathsSubset = [['a', 0]]
```

### `Audit`

`Audit` is the type being used internally to type check `Lens`, but it can be used with functions as well.

Success is represented either by `QueryItem`, `QueryItem[]` or `readonly QueryItem[]` depending on your input. You should not need to check for success, but if you do, consider using the companion type `Successful` which returns a boolean:

```typescript
type OK = Successful<Audit<['a', 'b'], { a: { b: number, c: number }}>>;
// type OK: true
```

#### Syntax
`Audit<Query, Model>`

|parameter| description|
|-|-|
|Query| The `Query` you want to type check
|Model| The type that should to be traversable by the `Query`

#### Generic Query

Be mindful that type-checking the query will make your function unusable in higher order scenarios.

```typescript
declare const foo: <
    const Path extends readonly string[] & Check,
    Obj extends object,
    Check = Audit<Path, Obj>
>(path: Path, obj: Obj) => void;

const bar = <
    const Path extends readonly string[],
    Obj extends object
>(path: Path, obj: Obj) => foo(path, obj)
//              cryptic error  ~~~~
```
An obvious workaround is to check the input in `bar` and pass the check to `foo` as a type parameter:
```typescript
const bar = <
    const Path extends readonly string[] & Check,
    Obj extends object,
    Check = Audit<Path, Obj>
>(path: Path, obj: Obj) =>
    foo<Path, Obj, Check>(path, obj)
```

Alternatively, you could make type checking optional:
```typescript
/** pass `any` to `_` in order to disable type-checking*/
declare const foo: <
    const Path extends readonly string[] & Check,
    Obj extends object,
    Check = Audit<Path, Obj>
>(path: Path, obj: Obj, _?: Check) => void;
//                      ---------

const bar = (path: readonly string[], obj: object) =>
    foo(path, { a: { b: null }}, null as any)
//                               -----------
```
### `$Get`, `$GetMulti`, `$Replace`, `$Over`
Free versions of `Get`, `GetMulti`, `Replace` and `Over`.

Can be used like so:
```typescript
import { apply } from 'free-types';

type $NeedleSelector = $Get<Query>
type Needle = apply<$NeedleSelector, [Haystack]>;
```
