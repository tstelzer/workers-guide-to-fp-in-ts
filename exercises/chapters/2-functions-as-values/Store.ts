import * as I from './Ingredient';

export class BalanceExhausted extends Error {
    constructor() {
        super("The balance can't go below 0.");
        this.name = this.constructor.name;
    }
}

export class IngredientNotFound extends Error {
    constructor() {
        super('The ingredient is not in the inventory.');
        this.name = this.constructor.name;
    }
}

const PROFIT_MARGIN = 0.25;

export type Inventory = I.Ingredient[];

export type Store = {
    inventory: Inventory;
    balance: number;
};

export const create = (): Store => ({
    inventory: [],
    balance: 0,
});

export const from = ({
    inventory,
    balance,
}: {
    inventory: Inventory;
    balance: number;
}): Store => ({
    inventory,
    balance,
});

/**
 * Adds `ingredient` to the `store`, given that the balance can
 * cover the cost.
 *
 * @throws BalanceExhausted
 */
export const stockOne = (store: Store, ingredient: I.Ingredient): Store => {
    const balance = store.balance - ingredient.cost;

    // There are no money lenders around in this back-water town. We can only
    // work with the money we've got in the balance.
    if (balance < 0) {
        throw new BalanceExhausted();
    }

    return {inventory: store.inventory.concat(ingredient), balance};
};

export const sellOne = (store: Store, name: string): Store => {
    const i = store.inventory.findIndex(
        (ingredient) => ingredient.name === name,
    );

    if (i === -1) {
        throw new IngredientNotFound();
    } else {
        const item = store.inventory[i];
        const inventory = store.inventory.slice();
        inventory.splice(i, 1);
        const balance = store.balance + item.cost * (1 + PROFIT_MARGIN);

        return {...store, balance, inventory};
    }
};
