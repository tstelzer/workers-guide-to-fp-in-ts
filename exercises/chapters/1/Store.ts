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

export type Store = {
    inventory: I.Ingredient[];
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
    inventory: I.Ingredient[];
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

export const sellOne = (store: Store, name: string): Store => undefined;
