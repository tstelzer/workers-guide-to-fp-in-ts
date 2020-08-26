import * as W from './Weapon';
import {isRare} from './common';

import * as blackSmithInventory from './blacksmith-inventory.json';

export const filterBlackSmithInventory = (
    inventory: W.Weapon[],
    predicate: (weapon: W.Weapon) => boolean,
): W.Weapon[] => {
    const result = [];
    for (const item of inventory) {
        if (predicate(item)) result.push(item);
    }
    return result;
};

const isBuyable = (weapon: W.Weapon) =>
    (isRare(weapon) || W.isPrecious(weapon)) && W.isCheap(weapon);

const result = filterBlackSmithInventory(blackSmithInventory, isBuyable);

console.log(result);
