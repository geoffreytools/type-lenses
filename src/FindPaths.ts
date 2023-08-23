import { GenericFree, IsAny, GetOrElse, IsArray } from "./utils";
import { Fn, NOT_FOUND, Path, self } from "./types";
import { Get } from "./Get";
import { apply, Checked, Lossy, At } from "free-types-core";
import { $Iterator, $Struct, $Tuple, $Array, $Fn, $Free } from "./Search/Iterators";
import { $DeepSearch, $SearchMode, IsNeedle, MatchAll } from "./Search/types";
import * as Standard from "./Search/StandardSearch";
import * as Exhaustive from "./Search/ExhaustiveSearch";

export { FindPaths}

type FindPaths<
    T,
    Needle = self,
    From extends Path = [],
    Limit extends number = number,
    $Search extends $SearchMode = SelectSearchMode<Needle>
> = [T] extends [T]
        ? From extends []
        ? GetPaths<T, Needle, Limit, $Search> extends infer P
            extends unknown[][] ? FormatSelf<P> : []
        : GetPaths<Get<From, T>, Needle, Limit, $Search> extends infer P
            extends unknown[][] 
            ? P extends [] ? From : FormatSelf<{
                [K in keyof P]: [...From, ...P[K]]
            }> : []
    : never

type SelectSearchMode<Needle> =
    MatchAll<Needle> extends true
    ? Exhaustive.SearchMode<Needle, $DeepSearchImpl<Needle>>
    : Standard.SearchMode<Needle, $DeepSearchImpl<Needle>>

type GetPaths<
    T,
    Needle,
    Limit extends number,
    $Search extends $SearchMode,
    Acc extends unknown[][] = []
> = Limit extends 0 | never ? Acc

    : IsAny<T> extends true
    ? IsAny<Needle> extends true ? [] : NOT_FOUND

    : IsNeedle<T, Needle> extends true
    ? []

    : IsArray<T> extends true
    ? Search<Limit, Acc, $Array<T & unknown[]>, $Search>

    : T extends readonly unknown[]
    ? Search<Limit, Acc, $Tuple<T>, $Search>

    : T extends GenericFree
    ? Search<Limit, Acc, $Free<T>, $Search>

    : T extends Fn
    ? Search<Limit, Acc, $Fn<T>, $Search>

    : T extends { [k: PropertyKey]: unknown }
    ? Search<Limit, Acc, $Struct<T>, $Search>

    : NOT_FOUND;

type Search<
    Limit extends number,
    Acc extends unknown[][],
    $I extends $Iterator,
    $Seach extends $SearchMode
> = apply<$Seach['total'], [Acc, $I, apply<$Seach['shallow'], [Limit, $I]>]>


type LIMIT = 0;
type VALUE = 2;
type PATH = 3;
type $SEARCH = 4;

interface $DeepSearchImpl<Needle> extends $DeepSearch {
    type: unknown extends this[LIMIT] ?  unknown[][]
        : GetPaths<At<VALUE, this>, Needle, Lossy<LIMIT, this>, Checked<$SEARCH, this>, []> extends infer Paths
        ? Paths extends NOT_FOUND ? this['Acc']
        : [
            ...this['Acc'],
            ...Spread<{[K in keyof Paths]: [...Checked<PATH, this>, ...Spread<Paths[K]>]}>
        ]
    : never;

    Acc: Checked<1, this>,
}

type FormatSelf<T> = GetOrElse<T, [unknown, ...unknown[]], [[self]]>;
type Spread<T> = GetOrElse<T, unknown[], []>;
