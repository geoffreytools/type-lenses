import { TypesMap, Generic, unwrap } from 'free-types-core';
import { Fn, Param, Output } from './types'
import { Prev, Next } from './utils';
import { Lens } from './Lens'
import { FollowPath, NOT_FOUND } from './Follow';

export type Audit<
    L extends Lens,
    Model,
    I extends number = 0,
    F = FollowPath<L['path'][I], Model, Model>
> = F extends NOT_FOUND ? [...LastPathItem<L, I>, NextPathItem<Model>]
    : Next<I> extends L['path']['length'] ? F
    : Audit<L, F, Next<I>>;

type LastPathItem<L extends Lens, I extends number> =
    I extends 0 ? [] :  [L['path'][Prev<I>]];

type NextPathItem<Model> =
    readonly any[] extends Model ? number
    : Model extends readonly unknown[] ? NumericArgs<Model>
    : Model extends Fn ? Output | Param<SequenceTo<Prev<Parameters<Model>['length']>>>
    : Model extends GenericFree ? TypesMap[unwrap<Model>['URI']]
    : Model extends Record<PropertyKey, unknown> ? { [K in keyof Model]: K }[keyof Model]
    : never

type NumericArgs<T> = ToNumber<keyof T & `${number}`>

type ToNumber<T> = T extends `${infer I extends number}` ? I : never

type GenericFree = Exclude<
    Generic<TypesMap[keyof TypesMap]>,
    Fn  |  readonly unknown[] | Record<PropertyKey, unknown>
>;

type SequenceTo<N extends number, I extends number = 0, R = never> =
    I extends N ? R | I
    : SequenceTo<N, Next<I>, R | I>

type Parameters<F, P = 
    F extends {
        (...args: infer A): any
        (...args: infer B): any
        (...args: infer C): any 
        (...args: infer D): any
        (...args: infer E): any
        (...args: infer F): any
    } ? A | B | C | D | E | F

    : F extends {
        (...args: infer A): any
        (...args: infer B): any
        (...args: infer C): any 
        (...args: infer D): any
        (...args: infer E): any
    } ? A | B | C | D | E 

    : F extends {
        (...args: infer A): any
        (...args: infer B): any
        (...args: infer C): any 
        (...args: infer D): any
    } ? A | B | C | D 

    : F extends {
        (...args: infer A): any
        (...args: infer B): any
        (...args: infer C): any
    } ? A | B | C

    : F extends {
        (...args: infer A): any
        (...args: infer B): any
    } ? A | B

    : F extends {
        (...args: infer A): any
    } ? A

    : never
> = P extends any ? unknown[] extends P ? never : P : never;