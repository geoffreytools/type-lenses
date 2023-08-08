import { Next, Union2Tuple } from "./utils";
import { NOT_FOUND, PathItem, self } from "./types";
import { Get } from "./Get";

export { FindPath }

type FindPath<T, Needle = self, From extends PathItem[] = []> =
     From extends [] ? GetPath<T, Needle>
     : [...From, ...GetPath<Get<From, T>, Needle>]

type GetPath<T, Needle> = 
    any[] extends T ? [number]
    : T extends readonly unknown[] ? GetTuplePath<T, Needle>
    : GetObjectPath<T, Needle>

type GetTuplePath<
    T extends readonly unknown[],
    Needle,
    R = IndexOfVal<T, Needle>
> = R extends NOT_FOUND
    ? Extract<TryTupleDeep<T, Needle>, unknown[]>
    : [R];

type TryTupleDeep<
    T extends readonly unknown[],
    Needle,
    I extends number = 0,
> = I extends T['length'] ? NOT_FOUND
    : GetPath<T[I], Needle> extends infer P
        ? P extends unknown[]
        ? [I, ...P]
        : TryTupleDeep<T, Needle, Next<I>>
    : never

type IndexOfVal<
    T extends readonly unknown[],
    Needle,
    I extends number = 0,
> = I extends T['length'] ? NOT_FOUND
    : [T[I]] extends [Needle] ? I
    : IndexOfVal<T, Needle, Next<I>>

type GetObjectPath<
    T,
    Needle,
    Keys extends (keyof T)[] = Extract<Union2Tuple<keyof T>, (keyof T)[]>,
    R = KeyOfVal<T, Needle, Keys>
> = R extends NOT_FOUND
    ? Extract<TryObjectDeep<T, Needle, Keys>, unknown[]>
    : [R];

type TryObjectDeep<
    T,
    Needle,
    Keys extends (keyof T)[],
    I extends number = 0,
> = I extends Keys['length'] ? NOT_FOUND
    : GetPath<T[Keys[I]], Needle> extends infer P
        ? P extends unknown[]
        ? [Keys[I], ...P]
        : TryObjectDeep<T, Needle, Keys, Next<I>>
    : never

type KeyOfVal<
    T,
    Needle,
    Keys extends (keyof T)[],
    I extends number = 0,
> = I extends Keys['length'] ? NOT_FOUND
    : [T[Keys[I]]] extends [Needle] ? Keys[I]
    : KeyOfVal<T, Needle, Keys, Next<I>>