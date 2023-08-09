import { Checked, A, B } from "free-types-core"
import { $Accessor, $Iterator } from "./types"

export { $Tuple, $GetValue, $Done }

interface $Tuple extends $Iterator {
    value: $GetValue
    key: $GetKey
    path: $GetPath
    done: $Done
}

interface $GetValue extends $Accessor {
    type: Checked<A, this>[B<this>]
}

interface $GetKey extends $Accessor {
    type: B<this>
}

interface $GetPath extends $Accessor {
    type: [B<this>]
}

interface $Done extends $Accessor {
    type: this[1] extends A<this>['length'] ? true : false
}