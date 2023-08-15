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

// or one of your design taking the Path as second parameter
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
Finally, we can find paths with `FindPath` and `FindPaths`.

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

# Documentation

[Type Checking](#type-checking) | [Lens](#lens) | [Query](#Query) | [Type](#type) | [Get](#get) | [GetMulti](#getmulti) | [Replace](#replace) | [Over](#over) | [FindReplace](#findreplace) | [FindPath(s)](#findpaths) | [Free utils](#get-getmulti-replace-over)

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
// [$Map, 1, "bar", 0, a, Output]' does not satisfy the constraint [$Map, 1, "foo"]
```
The Error message is a work in progress, but it is serviceable.

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

Replace the queried piece of type with a new value in the parent type, or return the parent type unchanged if the query failed.

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

If you want to define a custom replace callback, you are advised to import the `$ReplaceCallback` contract. It takes a parameter which lets you specify the type of the `Needle`. 

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

The types `Optional`, `A` and `B` let you safely index `this` while defusing type constraints. Here `Add` expects a `number`, which is satisfied by `A<this>` because `$Callback` extends `$ReplaceCallback<number>`.

Don't hesitate to use fields in the interface for clarity. Here I create a `prop` field using `Last` to select the last `PathItem` in the `Path`, which is passed as a second argument to the replace callback.

### `FindPath(s)`

`FindPath` is literally defined like so:

```typescript
type FindPath<T, Needle, From extends PathItem[] = []> =
    Extract<FindPaths<T, Needle, From, 1>[0], [any, ...any[]]>;
```


`FindPaths` returns a tuple of every path leading to the `Needle`, or every possible path when `Needle` is `self` (the default).

The search behaves like so:

- Values closer to the root take precedence (breadth-first search);
- Tuples and arguments lists are searched in the same order as they list their elements;
- Object properties are searched **at random**;
- In function signatures, parameters are searched before the return type.

The ordering when using `self` as needle is not specified. Paths leading to base types come in the order you would expect, but intermediary nodes come in the order that was most convenient for me.

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

### `$Get`, `$GetMulti`, `$Replace`, `$Over`
Free versions of `Get`, `GetMulti`, `Replace` and `Over`.

Can be used like so:
```typescript
import { apply } from 'free-types';

type $NeedleSelector = $Get<Query>
type Needle = apply<$NeedleSelector, [Haystack]>;
```
