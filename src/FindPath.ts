import { PathItem } from "./types";
import { FindPaths } from "./FindPaths";

export type FindPath<T, Needle, From extends PathItem[] = []> =
    Extract<FindPaths<T, Needle, From, 1>[0], [any, ...any[]]>;