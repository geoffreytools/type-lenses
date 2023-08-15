import { Type } from "free-types-core"

export { Iterable, $Iterator, $Accessor }

type Iterable = 
    | readonly unknown[]
    | { [k: PropertyKey]: unknown };

type $Iterator = {
    value: $Accessor,
    key: $Accessor,
    path: $Accessor<unknown[]>,
    done: $Accessor
};

type $Accessor<R = unknown> = Type<[number], R>;