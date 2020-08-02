import * as S from './Store';
import {pipe} from 'fp-ts/lib/function';

import * as inventory from './inventory.json';

const store = S.from({inventory, balance: 95.4});

pipe(store.inventory, S.filterWheat, S.withSellingPrice, S.show, console.log);
