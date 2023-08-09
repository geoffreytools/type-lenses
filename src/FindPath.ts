import { GetOrElse } from "./utils";
import { PathItem } from "./types";
import { FindPathMulti } from "./FindPathMulti";

export type FindPath<T, Needle, From extends PathItem[] = []> = GetOrElse<
    FindPathMulti<T, Needle, From, 1>[0],
    [any, ...any],
    never
>