import * as W from './Weapon';
import {filter} from './common';

import * as blackSmithInventory from './blacksmith-inventory.json';

const result = filter(blackSmithInventory, W.isCheap);
