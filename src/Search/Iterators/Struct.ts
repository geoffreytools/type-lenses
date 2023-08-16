import { A } from "free-types-core";
import { Union2Tuple } from "../../utils";
import { $Accessor, $Iterator } from "./types"

export { $Struct }

interface $Struct<T, Keys extends (keyof T)[] = GetKeys<T>> extends $Iterator {
    value: $GetValue<T, Keys>
    path: $GetPath<Keys>
    done: $Done<Keys>
}

type GetKeys<T> = Extract<Union2Tuple<keyof T>, (keyof T)[]>

interface $GetValue<T, Keys extends (keyof T)[]> extends $Accessor {
    type: T[Keys[A<this>]]
}

interface $GetPath<Keys extends unknown[]> extends $Accessor {
    type: [Keys[A<this>]]
}

interface $Done<Keys extends unknown[]> extends $Accessor {
    type: A<this> extends Keys['length'] ? true : false
}