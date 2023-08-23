import { Path } from "./types";
import { FindPaths } from "./FindPaths";

export type FindPath<T, Needle, From extends Path = []> =
    Extract<FindPaths<T, Needle, From, 1>[0], [any, ...any[]]>;