import * as S from './Store';

import * as inventory from './inventory.json';

const store = S.from({inventory, balance: 95.4});

console.log(store);
