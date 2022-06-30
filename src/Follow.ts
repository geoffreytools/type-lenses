import { self, Param, Output, Key, PathItem, Indexable, Fn } from './types'
import { A, B, Type, $unwrap } from 'free-types/core';
import { $Before, Flow } from 'free-types/utility-types/composition';
import { Match, otherwise } from 'free-types/utility-types/Match';
import { $ReturnType, $Parameter } from 'free-types/utility-types/functions';
import { $Prop } from 'free-types/utility-types/mappables';

export { FollowPath }

type FollowPath<I extends PathItem, Data, Self> =
   Match<[I, Data], [
       [[Output, Fn], $ReturnType, [B]],
       [[Param, Fn], $Before<$Parameter, $Prop<'key'>, A>],
       [[Key, Indexable], $Prop],
       [[self, any], Self],
       [[Type, any], Flow<[$unwrap, $Prop<'args'>]>, [B, A]],
       [otherwise, never]
   ]>