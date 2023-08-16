import { A, Const } from "free-types-core"
import { $Accessor, $Iterator } from "./types"

export { $Array }

interface $Array<T extends readonly unknown[]> extends $Iterator {
    value: Const<T[number]>
    path: Const<[number]>
    done: $Done
}

interface $Done extends $Accessor {
    type: A<this> extends 1 ? true : false
}