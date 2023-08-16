import { Type } from "free-types-core"

export { $Iterator, $Accessor }

type $Iterator = {
    value: $Accessor,
    path: $Accessor<unknown[]>,
    done: $Accessor
};

type $Accessor<R = unknown> = Type<[number], R>;