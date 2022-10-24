# type-lenses 

Extract or modify pieces of arbitrarily nested types with type lenses.

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
Finally, `Over` lets us map over our `needle` with a free type:

```typescript
type PromiseStack = Over<FocusNeedle, Haystack, free.Promise>;
```
It results in:
```typescript
Map<string, {foo: [(f: (arg: string) => Promise<needle>) => void, 'bar'] }>
```
You can define arbitrary free types including procedural ones. See the documentation.

# Documentation

[Lens](#lens) | [Query](#Query) | [Type](#type) | [Get](#get) | [GetMulti](#getmulti) | [Replace](#replace) | [Over](#over)

### `Lens`
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
<td><code>Type</code></td>
<td>Focuses on the arguments list of a type for which <code>Type</code> is a free type constructor.</td>
</tr>
</table>

### `Type`

In a nutshell:

```typescript
// A class we want to reference in a path
class Foo<T extends number> {
    constructor(private value: T) {}
}

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

`type-lenses` re-exports a [dozen](https://github.com/geoffreytools/free-types/blob/public/Documentation.md#free) built-in free type constructors under the namespace `free`.


## Querying and modifying types

### `Get`
Return the queried piece of type.

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

Replace the queried piece of type with a new value in the parent type.

#### Syntax
`Replace<Query, Haystack, Value>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to modify
|Value | Any type you want to replace the needle with

### `Over`

Map over the queried piece of type with a free type

#### Syntax
`Over<Query, Haystack, $Type>`

|parameter| description|
|-|-|
|Query| a `Query`
|Haystack| The type you want to modify
|$Type | A free type constructor

Look up the [free-types](https://github.com/geoffreytools/free-types) documentation for more information.
