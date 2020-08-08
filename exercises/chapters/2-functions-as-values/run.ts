import * as S from './Store';
import * as I from './Ingredient';

import * as inventory from './inventory.json';

const store = S.from({inventory, balance: 100.0});

const onlyWheat = S.filterInventory(store.inventory, I.isWheat);

const inventoryWithSellingPrice = S.mapInventory(onlyWheat, (ingredient) =>
    I.withSellingPrice(ingredient, S.PROFIT_MARGIN),
);

const inventoryAsString = S.mapInventory(inventoryWithSellingPrice, I.show);

console.log(inventoryAsString.join('\n'));
