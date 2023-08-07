import { unwrap, Unwrapped } from "free-types-core";
import { GenericFree, SequenceTo, ToNumber, Prev, Last, Init, IsUnknown, IsAny } from "./utils";
import { Fn, Output, Param, self } from "./types";

export { FindPaths }

type FindPaths<T, Needle = self> = FilterPath<GetPaths<T>, Needle>

type GetPaths<T> =
    IsAny<T> extends true ? [any]
    : T extends readonly unknown[]
        ? { [I in keyof T]: [ToNumber<I>, ...GetPaths<T[I]>] }[keyof T]
    : T extends GenericFree
        ? GetFreePath<T>
    : T extends Fn ? [Output, ...GetPaths<ReturnType<T>>] | GetFnArgsPaths<T>
    : T extends object
        ? { [K in keyof T]: [K, ...GetPaths<T[K]>] }[keyof T]
    : [T]

type GetFreePath<
    T,
    U extends Unwrapped = unwrap<T>,
    $Args extends Record<string, unknown[]> =
        { [I in keyof U['args'] as I extends `${number}` ? I : never]
            : [ToNumber<I>, ...GetPaths<U['args'][I]>] }
> = [U['type'], ...$Args[keyof $Args]]

type GetFnArgsPaths<
    T extends Fn,
    S extends number = SequenceTo<Prev<Parameters<T>['length']>>
> =  S extends any ? [Param<S>, ...GetPaths<Parameters<T>[S]>] : never;

type FilterPath<T, Needle> =
    T extends [unknown, ...unknown[]]
        ? IsUnknown<Needle> extends true
            ? IsUnknown<Last<T>> extends true ? Init<T> : never
        : IsAny<Needle> extends true
            ? IsAny<Last<T>> extends true ? Init<T> : never
        : Needle extends self ? Init<T>
        : [Last<T>] extends [Needle] ? IsAny<Last<T>> extends false ? Init<T> : never : never
    : never;