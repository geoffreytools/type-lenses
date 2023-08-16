import { Type, apply, Checked, Lossy } from "free-types-core";
import { $SearchMode, $TotalSearch, $ShallowSearch, ShallowSearchResult, ShouldStop, NonEmpty, IsNeedle, $DeepSearch } from "./types";
import { Next, Prev } from "../utils";
import { $Iterator } from "./Iterators";

export { SearchMode }

type SearchMode<Needle, $Deep extends $DeepSearch> = {
    total: $Total<Needle, $Deep>,
    shallow: $Shallow<Needle>
    deep: $Deep
}

interface $Total<Needle, $D extends $DeepSearch> extends $TotalSearch {
    type: unknown extends this[0] ? never : TotalSeach<
        Needle,
        Checked<0, this>,
        Checked<1, this>,
        Checked<2, this>,
        SearchMode<Needle, $D>
    >
}

interface $Shallow<Needle> extends $ShallowSearch {
    type: unknown extends this[0] ? ShallowSearchResult
        : ShallowSearch<Needle, Lossy<0, this>, Checked<1, this>>
}

type TotalSeach<
    Needle,
    Acc extends unknown[][],
    $I extends $Iterator,
    Shallow extends ShallowSearchResult,
    $Search extends $SearchMode,
    I extends number = 0,
    Deep extends unknown[][] = []
> = ShouldStop<Shallow['limit'], $I, I> extends true
    ? NonEmpty<PrependType<[...Acc, ...Shallow['total'], ...Deep]>>
    : TotalSeach<
        Needle, Acc, $I, Shallow, $Search, Next<I>,
        apply<$I['path'], [I]> extends infer Path
        ? Path extends unknown[]
            ? Path extends Shallow['total'][number] ? Deep : [
                ...MergeDeduplicate<Shallow['partial'], Deep>, 
                ...apply<$Search['deep'], [Shallow['limit'], Acc, apply<$I['value'], [I]>, Path, $Search]>
            ]
            : never
        : never
    >;

type MergeDeduplicate<
    A extends unknown[],
    B extends unknown[],
    I extends number = 0,
    R extends unknown[] = []
> = I extends A['length'] ? [...R, ...B]
    : MergeDeduplicate<A, B, Next<I>, A[I] extends B[number] ? R : [...R, A[I]]>

type PrependType<T extends unknown[][], I extends number = 0, R extends unknown[] = []> =
    I extends T['length'] ? R
    : PrependType<T, Next<I>,
        T[I][0] extends Type
        ? [T[I][0]] extends R[number]
        ? [...R, T[I]]
        : [...R, [T[I][0]], T[I]]
        : [...R, T[I]]
    >;

type ShallowSearch<
    Needle,
    Limit extends number,
    $I extends $Iterator,
    I extends number = 0,
    TotalMatch extends unknown[] = [],
    PartialMatch extends unknown[] = [],
> = ShouldStop<Limit, $I, I> extends true ? { partial: PartialMatch, total: TotalMatch, limit: Limit }
    : true extends IsNeedle<apply<$I['value'], [I]>, Needle>
    ? apply<$I['path'], [I]> extends infer P extends unknown[]
        ? IsNeedle<apply<$I['value'], [I]>, Needle> extends true
            ? ShallowSearch<Needle, Prev<Limit>, $I, Next<I>,[...TotalMatch, P], PartialMatch>
            : ShallowSearch<Needle, Prev<Limit>, $I, Next<I>, TotalMatch, [...PartialMatch, P]>
        : never
    : ShallowSearch<Needle, Limit, $I, Next<I>, TotalMatch>;