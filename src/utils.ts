import { TypesMap, Generic } from 'free-types-core';
import { IsAny, Next } from 'free-types-core/dist/utils';
import { Fn } from './types'

export { Next, Prev, Subtract, Last, Init, IsAny, IsUnknown } from 'free-types-core/dist/utils';
export { MapOver } from 'free-types/essential/mappables/MapOver';
export { _ } from 'free-types/essential/_partial';
export { _$Optional} from 'free-types/essential/adapters/$Optional';

export type GetOrElse<T, U, E> = T extends U ? T : E;

export type GenericFree = Exclude<
    Generic<TypesMap[keyof TypesMap]>,
    Fn | readonly unknown[] | Record<PropertyKey, unknown>
>;

export type SequenceTo<N extends number, I extends number = 0, R = never> =
    I extends N ? R | I
    : SequenceTo<N, Next<I>, R | I>;

export type ToNumber<T> = T extends `${infer I extends number}` ? I : never;

export type Parameters<F, P = 
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

export type PickUnionMember<
    T,
    HOFs = T extends any ? (a: () => T) => void : never,
    Overloads = [HOFs] extends [(a: infer I) => any] ? I : never,
> = Overloads extends () => (infer R) ? R : never;

export type Union2Tuple<U, T = PickUnionMember<U>> =
    [U] extends [never] ? []
    : [...Union2Tuple<Exclude<U, T>>, T];