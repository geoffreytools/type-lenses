import { B } from "free-types-core";
import { Param } from "../types";
import { $Accessor, $Iterator } from "./types"
import { $Done, $GetValue } from "./Tuple";

export { $FnParams };

interface $FnParams extends $Iterator {
    value: $GetValue
    key: $GetKey
    path: $GetPath
    done: $Done
}

interface $GetKey extends $Accessor {
    type: Param<B<this>>
}

interface $GetPath extends $Accessor {
    type: [Param<B<this>>]
}
