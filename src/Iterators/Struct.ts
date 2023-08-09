import { B } from "free-types-core";
import { $Accessor, $Iterator } from "./types"

export { $Struct }

interface $Struct<Keys extends unknown[]> extends $Iterator {
    value: $GetValue<Keys>
    key: $GetKey<Keys>
    path: $GetPath<Keys>
    done: $Done<Keys>
}

interface $GetValue<Keys extends unknown[]> extends $Accessor {
    type: this[0][Keys[B<this>] & keyof this[0]]
}

interface $GetKey<Keys extends unknown[]> extends $Accessor {
    type: Keys[B<this>]
}

interface $GetPath<Keys extends unknown[]> extends $Accessor {
    type: [Keys[B<this>]]
}

interface $Done<Keys extends unknown[]> extends $Accessor {
    type: this[1] extends Keys['length'] ? true : false
}