import { apply, Checked, Lossy } from "free-types-core";
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
    type: unknown extends this[0] ? never : TotalSearch<
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

type TotalSearch<
    Needle,
    Acc extends unknown[][],
    $I extends $Iterator,
    Shallow extends ShallowSearchResult,
    $Search extends $SearchMode,
    I extends number = 0,
    Deep extends unknown[][] = [],
    Path extends unknown[] = apply<$I['path'], [I]>,
> = ShouldStop<Shallow['limit'], $I, I> extends true
    ? NonEmpty<[...Acc, ...Shallow['total'], ...Deep]>
    : TotalSearch<
        Needle, Acc, $I, Shallow, $Search, Next<I>,
        Path extends Shallow['total'][number] ? Deep
        : [...Deep, ...apply<$Search['deep'], [Shallow['limit'], Acc, apply<$I['value'], [I]>, Path, $Search]>]
    >;

type ShallowSearch<
    Needle,
    Limit extends number,
    $I extends $Iterator,
    I extends number = 0,
    R extends unknown[] = [],
> = ShouldStop<Limit, $I, I> extends true ? { partial: never, total: R, limit: Limit }
    : IsNeedle<apply<$I['value'], [I]>, Needle> extends true
    ? ShallowSearch<Needle, Prev<Limit>, $I, Next<I>,[...R, apply<$I['path'], [I]>]>
    : ShallowSearch<Needle, Limit, $I, Next<I>, R>;