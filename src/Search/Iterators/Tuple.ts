import { A } from "free-types-core"
import { HeadLength, Next, RestElement } from "../../utils"
import { $Accessor, $Iterator } from "./types"

export { $Tuple, $GetValue, $Done }

interface $Tuple<T extends readonly unknown[]> extends $Iterator {
    value: $GetValue<T>
    path: $GetPath<T>
    done: $Done<T>
}

interface $GetValue<T extends readonly unknown[]> extends $Accessor {
    type: A<this> extends HeadLength<T> ? RestElement<T> : T[A<this>]
}

interface $GetPath<T extends readonly unknown[]> extends $Accessor {
    type: A<this> extends HeadLength<T> ? [number] : [A<this>]
}

interface $Done<T extends readonly unknown[]> extends $Accessor {
    type: A<this> extends Length<T> ? true : false
}

type Length<T extends readonly unknown[]> =
    number extends T['length'] ? Next<HeadLength<T>> : T['length'];
