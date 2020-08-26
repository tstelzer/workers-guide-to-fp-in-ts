import * as W from './Weapon';
import {isRare, filter} from './common';

import * as blackSmithInventory from './blacksmith-inventory.json';

const isBuyable = (weapon: W.Weapon) =>
    (isRare(weapon) || W.isPrecious(weapon)) && W.isCheap(weapon);

const result = filter(blackSmithInventory, isBuyable);

console.log(result);
