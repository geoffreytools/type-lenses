import { Query, Param, Output, PathItem, ILens } from './types';
import { Lens } from './Lens';

export { r, a, b, c, d, e, f, g, h, i, j };

type a = Param<0>;
type b = Param<1>;
type c = Param<2>;
type d = Param<3>;
type e = Param<4>;
type f = Param<5>;
type g = Param<6>;
type h = Param<7>;
type i = Param<8>;
type j = Param<9>;

type r<P extends Query | never = never> =
    [P] extends [never] ? Output
    : P extends PathItem ? Lens<[P, Output]>
    : P extends PathItem[] ? Lens<[...P, Output]>
    : P extends ILens ? Lens<[...P['path'], Output]>
    : never;