import { PathItem, self } from "./types";
import { FindPathMulti } from "./FindPathMulti";

export { FindPaths }

type FindPaths<T, Needle = self, From extends PathItem[] = []> =
    FindPathMulti<T, Needle, From>[number]