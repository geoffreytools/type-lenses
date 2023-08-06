import { TypesMap, Generic, unwrap, Type, B, Slice } from 'free-types-core';
import { Fn, Param, Output, Query, ILens, PathItem, QueryItem } from './types'
import { Prev, Next } from './utils';
import { Lens } from './Lens'
import { FollowPath, NOT_FOUND } from './Follow';
import { MapOver } from 'free-types/essential/mappables/MapOver';

export type Audit<
    Q extends Query,
    Model,
    I extends number = 0,
    L extends ILens = Lens<Q>,
    F = FollowPath<L['path'][I], Model, Model>
> = F extends NOT_FOUND ? HandleError<Model, Q, L, I>
    : Next<I> extends L['path']['length'] ? Query
    : Audit<Q, F, Next<I>, L>;

type HandleError<
    Model,
    Q extends Query,
    L extends ILens,
    I extends number,
    R extends QueryItem[] = ProperPath<Model, L, I>
> = Q extends ILens ? Lens<R>
    : Q extends [ILens] ? [Lens<R>]
    : Q extends QueryItem[] ? MapOver<R, $WrapIfLens<Q>>
    : Q extends QueryItem ? R[0]
    : R

interface $WrapIfLens<Q extends QueryItem[]> extends Type<2> {
    type: Q[B<this>] extends ILens ? Lens<this[0]> : this[0]
    constraints: [QueryItem, number]
}

type ProperPath<Model, L extends ILens, I extends number> =
    [...LastPathItem<L['path'], I>, NextPathItem<Model>]

type LastPathItem<P extends PathItem[], I extends number> =
    I extends 0 ? [] :  Slice<P, 0, I>;

type NextPathItem<Model> =
    readonly any[] extends Model ? number
    : Model extends readonly unknown[] ? NumericArgs<Model>
    : Model extends Fn ? Output | Param<SequenceTo<Prev<Parameters<Model>['length']>>>
    : Model extends GenericFree ? unwrap<Model>['type']
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