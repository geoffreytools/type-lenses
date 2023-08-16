import { unwrap, Unwrapped, Type, A } from "free-types-core"
import { $Accessor, $Iterator } from "./types"

export { $Free }

interface $Free<T, U extends Unwrapped = unwrap<T>> extends $Iterator {
    value: $GetValue<U['args']>
    path: $GetPath<U['type']>
    done: $Done<U['args']>
}

interface $GetValue<Args extends unknown[]> extends $Accessor {
    type: Args[A<this>]
}

interface $GetPath<$T extends Type> extends $Accessor {
    type: [$T, A<this>]
}

interface $Done<Args extends unknown[]> extends $Accessor {
    type: A<this> extends Args['length'] ? true : false
}