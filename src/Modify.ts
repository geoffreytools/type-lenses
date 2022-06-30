import { self, Param, Output, Key, PathItem, Fn, Indexable } from './types'
import { Type, apply, $apply, A, B, Checked } from 'free-types/core';
import { Match, otherwise } from 'free-types/utility-types/Match';
import { $SetIndex, $SetProp } from 'free-types/utility-types/mappables';

export { ModifyPath };

type ModifyPath<I extends PathItem, Data, V> =
    Match<[I, Data], [
        [[Output, Fn], $SetReturnType<V>, [B]],
        [[Param, Fn], $SetParameter<V>],
        [[number, unknown[]], $SetIndex<V>],
        [[Key, Indexable], $SetProp<V>],
        [[self, any], V],
        [[Type, any], $apply<V & unknown[]>, [A]],
        [otherwise, never]
    ]>

interface $SetReturnType<V> extends Type<[Fn]> {
    type: (...args: Parameters<Checked<A, this>>) => V
}

interface $SetParameter<V> extends Type<[Param, Fn]> {
    type: (...args: this['params']) => ReturnType<Checked<B, this>>
    params: apply<$SetIndex, [V, A<this>['key'], Parameters<Checked<B, this>>]>
}     
