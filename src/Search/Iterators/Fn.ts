import { A } from "free-types-core";
import { Fn, Output, Param } from "../../types";
import { $Accessor, $Iterator } from "./types"
import { $Done, $GetValue } from "./Tuple";
import { Parameters, Prev } from "../../utils";

export { $Fn };

interface $Fn<T extends Fn, P extends unknown[] = [...Parameters<T>, ReturnType<T>]> extends $Iterator {
    value: $GetValue<P>
    path: $GetPath<Prev<P['length']>>
    done: $Done<P>
}

interface $GetPath<Last extends number> extends $Accessor {
    type: A<this> extends Last ? [Output] : [Param<A<this>>]
}
