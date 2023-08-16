import { A } from "free-types-core"
import { $Accessor, $Iterator } from "./types"

export { $Tuple, $GetValue, $Done }

interface $Tuple<T extends readonly unknown[]> extends $Iterator {
    value: $GetValue<T>
    path: $GetPath
    done: $Done<T>
}

interface $GetValue<T extends readonly unknown[]> extends $Accessor {
    type: T[A<this>]
}

interface $GetPath extends $Accessor {
    type: [A<this>]
}

interface $Done<T extends readonly unknown[]> extends $Accessor {
    type: A<this> extends T['length'] ? true : false
}