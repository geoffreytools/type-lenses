import { unwrap, Type, B, Slice } from 'free-types-core';
import { Fn, Param, Output, Query, ILens, Path, QueryItem } from './types';
import { Prev, Next, Parameters, ToNumber, GenericFree, SequenceTo, MapOver, IsAny } from './utils';
import { Lens } from './Lens';
import { FollowPath, NOT_FOUND } from './Follow';

export type Audit<
    Q extends Query,
    Model,
    I extends number = 0,
    L extends ILens = Lens<Q>,
    F = FollowPath<L['path'][I], Model, Model>
> = F extends NOT_FOUND ? HandleError<Model, Q, L, I>
    : Next<I> extends L['path']['length']
    ? Q extends readonly unknown[] ? readonly QueryItem[] : QueryItem
    : Audit<Q, F, Next<I>, L>;

type Success<Q> = Q extends readonly unknown[]
    ? Q extends unknown[] ? QueryItem[] : readonly QueryItem[]
    : QueryItem

type HandleError<
    Model,
    Q extends Query,
    L extends ILens,
    I extends number,
    R extends readonly QueryItem[] = SaveReadonly<Q, ProperPath<Model, L, I>>
> = Q extends ILens ? Lens<R>
    : Q extends [ILens] ? [Lens<R>]
    : Q extends readonly QueryItem[] ? MapOver<R, $WrapIfLens<Q>>
    : Q extends QueryItem ? R[0]
    : R

type SaveReadonly<Q, P extends readonly unknown[]> =
    Q extends unknown[] ? P : readonly [...P];

interface $WrapIfLens<Q extends readonly QueryItem[]> extends Type<2> {
    type: Q[B<this>] extends ILens ? Lens<this[0]> : this[0]
    constraints: [QueryItem, number]
}

type ProperPath<Model, L extends ILens, I extends number, N extends QueryItem = NextPathItem<Model>> =
    [N] extends [never]
    ? LastPathItem<L['path'], I>
    : [...LastPathItem<L['path'], I>, ...Rest<L, I, N>]

type Rest<L extends ILens, I extends number, N extends QueryItem> =
    Next<I> extends L['path']['length'] ? [N] : [N, ...QueryItem[]];

type LastPathItem<P extends Path, I extends number> =
    I extends 0 ? [] :  Slice<P, 0, I>;

type NextPathItem<Model> =
    readonly any[] extends Model ? number
    : Model extends readonly unknown[] ? NumericArgs<Model>
    : Model extends Fn ? Output | Param<SequenceTo<Prev<Parameters<Model>['length']>>>
    : Model extends GenericFree ? unwrap<Model>['type']
    : Model extends Record<PropertyKey, unknown> ? { [K in keyof Model]: K }[keyof Model]
    : never

type NumericArgs<T> = ToNumber<keyof T & `${number}`>