export { Next, Prev, Last, IsAny } from 'free-types-core/dist/utils';

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