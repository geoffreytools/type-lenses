import { self, Param, Output, Key, PathItem, Fn, Indexable } from './types'
import { Type, apply } from 'free-types-core';
import { $SetIndex, $SetProp } from 'free-types/essential/mappables/accessors';

export { ModifyPath };

type ModifyPath<I extends PathItem, Data, V> =
    I extends Output ? Data extends Fn ? (...args: Parameters<Data>) => V : never
    : I extends Param ? Data extends Fn ? SetParameter<I, Data, V> : never
    : I extends number ? Data extends unknown[] ? apply<$SetIndex<V>, [I, Data]> : never
    : I extends Key ? Data extends Indexable ? apply<$SetProp<V>, [I, Data]> : never
    : I extends self ? V
    : I extends Type ? V extends unknown[] ? apply<I, V> : never
    : never

type SetParameter<A extends Param, B extends Fn, V> =
    (...args: apply<$SetIndex, [V, A['key'], Parameters<B>]>) =>
        ReturnType<B>

