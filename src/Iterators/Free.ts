import { Type, Checked, A, B } from "free-types-core"
import { $Accessor, $Iterator } from "./types"

export { $Free }

interface $Free<$T extends Type> extends $Iterator {
    value: $GetValue
    key: $GetKey
    path: $GetPath<$T>
    done: $Done
}

interface $GetValue extends $Accessor {
    type: Checked<A, this>[B<this>]
}

interface $GetKey extends $Accessor {
    type: B<this>
}

interface $GetPath<$T extends Type> extends $Accessor {
    type: [$T, B<this>]
}

interface $Done extends $Accessor {
    type: this[1] extends A<this>['length'] ? true : false
}