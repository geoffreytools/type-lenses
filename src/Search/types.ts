import { Type, apply } from "free-types-core"
import { $Iterator } from "./Iterators";
import { NOT_FOUND, BaseType, self } from "../types";
import { GetOrElse, IsAny } from "../utils";

export type $SearchMode = {
    total: $TotalSearch
    shallow: $ShallowSearch
    deep: $DeepSearch
};

export type $DeepSearch = Type<
    [
        Limit: number,
        Acc: unknown[][],
        Value: unknown,
        Path: unknown[],
        Search: $SearchMode
    ],
    unknown[][]
>;

export type $TotalSearch = Type<[
    Acc: unknown[][],
    $I: $Iterator,
    S: ShallowSearchResult
]>;

export type $ShallowSearch = Type<
    [Limit: number, $I: $Iterator],
    ShallowSearchResult
>;

export type ShallowSearchResult = {
    partial: unknown[][],
    total: unknown[][],
    limit: number
};

export type ShouldStop<Limit, $I extends $Iterator, I extends number> =
    Limit extends 0 | never ? true : apply<$I['done'], [I]>;

export type NonEmpty<T> = GetOrElse<T, [unknown, ...unknown[]], NOT_FOUND>;

export type IsNeedle<T, Needle> =
    IsAny<T> extends true ? IsAny<Needle> extends true ? true : false
    : IsAny<Needle> extends true ? false
    : [T] extends [never] ? [Needle] extends [never] ? true : MatchAll<Needle> extends true ? true : false
    : [Needle] extends [never] ? [T] extends [never] ? true : false
    : unknown extends Needle ? unknown extends T ? true : false
    : T extends Needle ? true
    : MatchAll<Needle> extends true ? T extends BaseType ? true : boolean
    : false;

export type MatchAll<Needle> = Needle extends self ? true : false;