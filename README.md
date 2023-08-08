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
### Replace
We can replace `needle` by what we want with `Replace`:
```typescript
import { Replace } from 'type-lenses';

type YihaStack = Replace<FocusNeedle, Haystack, 'Yiha!'>;
```
It results in:
```typescript
Map<string, {foo: [(f: (arg: string) => 'Yiha!') => void, 'bar'] }>
```
### Map over
Similarily to `Replace`, `Over` lets us map over our type to replace `needle` with the result of applying it to a free type:

```typescript
import { Over } from 'type-lenses';

type PromiseStack = Over<FocusNeedle, Haystack, free.Promise>;
```
It results in:
```typescript
Map<string, {foo: [(f: (arg: string) => Promise<needle>) => void, 'bar'] }>
```
You can define arbitrary free types including procedural ones (see the documentation).

### Find paths
Finally, you can find a path if you know the `needle` you are looking for with `FindPaths`:

```typescript
import { FindPaths } from 'type-lenses';

type NeedlePaths = FindPaths<Haystack, needle>;
```
It results in:
```typescript
[free.Map, 1, "foo", 0, Param<0>, Output]
```
- `Param<0>` and `Output` are aliases for `a` and `r`;
- `free.Map` is obviously a member of the `free` namespace but it could also be a custom free type you registered (see documentation).

`FindPaths` actually returns a union of all paths leading to `needle`. If you have no idea what to look for, you can omit the `needle` to get an enumeration of every possible path:
```typescript
type NeedlePaths = FindPaths<Haystack>;
```
It results in
```typescript
// the union is actually going to be shuffled though
| [free.Map]
| [free.Map, 0]
| [free.Map, 1]
| [free.Map, 1, "foo"]
| [free.Map, 1, "foo", 0]
| [free.Map, 1, "foo", 0, Output]
| [free.Map, 1, "foo", 0, Param<0>]
| [free.Map, 1, "foo", 0, Param<0>, Output]
| [free.Map, 1, "foo", 0, Param<0>, Param<0>]
| [free.Map, 1, "foo", 1]
```

`FindPaths` also takes an optional path as third parameter which it uses as a starting point for the search:
```typescript
// `self` accepts any value
type NeedlePaths = FindPaths<Haystack, self, [free.Map, 1, "foo", 0]>;
```
It results in
```typescript
| [free.Map, 1, "foo", 0, Output]
| [free.Map, 1, "foo", 0, Param<0>]
| [free.Map, 1, "foo", 0, Param<0>, Output]
| [free.Map, 1, "foo", 0, Param<0>, Param<0>]
```

# Documentation

[Lens](#lens) | [Query](#Query) | [Type](#type) | [Get](#get) | [GetMulti](#getmulti) | [Replace](#replace) | [Over](#over) | [FindPaths](#findpaths) | [Free utils](#get-getmulti-replace-over)

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
`Replace<Query, Haystack, Value>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to modify
|Value | Any type you want to replace the needle with

### `Over`

Map over the parent type, replacing the queried piece of type with the result of applying it to the provided free type. Return the parent type unchanged if the query failed.

#### Syntax
`Over<Query, Haystack, $Type>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to modify
|$Type | A free type constructor

### `FindPaths`

Return the union of every possible path leading to the `needle` (or every possible path if it is omitted).

#### Syntax
`FindPaths<T, Needle?, From?>`

|parameter| description|
|-|-|
|T| The type you want to probe
|Needle| The piece of type you want selected paths to point to. It defaults to `self`, which selects every possible path.
|Needle| A path from which to start the search. It improves performance and helps exclude false positives.


### `$Get`, `$GetMulti`, `$Replace`, `$Over`
Free versions of `Get`, `GetMulti`, `Replace` and `Over`.

Can be used like so:
```typescript
import { apply } from 'free-types';

type $NeedleSelector = $Get<Query>
type Needle = apply<$NeedleSelector, [Haystack]>;
```