import * as I from './Ingredient';
import * as W from './Weapon';
import {filter} from './common';

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

export const PROFIT_MARGIN = 0.25;

export type Item = I.Ingredient | W.Weapon;
export type Inventory = Item[];

export type Store = {
    inventory: Inventory;
    balance: number;
};

export const filterWheat = (inventory: Inventory): Inventory =>
    filter(inventory, I.isWheat);

export const mapInventory = <A extends I.Ingredient, B>(
    inventory: A[],
    transformIngredient: (ingredient: A) => B,
) => {
    const result = [];
    for (const ingredient of inventory) {
        result.push(transformIngredient(ingredient));
    }
    return result;
};

export const show = (
    inventory: (I.Ingredient & {sellingPrice: number})[],
): string => {
    const result = [];
    for (const ingredient of inventory) {
        const name = ingredient.name.trim().padEnd(40, ' ');
        const sellingPrice = `$${ingredient.sellingPrice.toFixed(2)}`.padStart(
            10,
            ' ',
        );
        result.push(`${name} ${sellingPrice}`);
    }
    return result.join('\n');
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
