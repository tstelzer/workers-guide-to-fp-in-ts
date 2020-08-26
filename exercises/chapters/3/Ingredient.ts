export type Ingredient = {
    name: string;
    cost: number;
    rarity: number;
};

export const from = (
    name: string,
    cost: number,
    rarity: number,
): Ingredient => ({
    name,
    cost,
    rarity,
});

export const isWheat = (ingredient: Ingredient): boolean =>
    ingredient.name === 'Wheat';

export const withSellingPrice = (
    ingredient: Ingredient,
    margin: number,
): Ingredient & {sellingPrice: number} => ({
    ...ingredient,
    sellingPrice: ingredient.cost * (1 + margin),
});

export const show = (ingredient: Ingredient & {sellingPrice: number}) => {
    const name = ingredient.name.trim().padEnd(40, ' ');
    const sellingPrice = `$${ingredient.sellingPrice.toFixed(2)}`.padStart(
        10,
        ' ',
    );
    return `${name} ${sellingPrice}`;
};

export const name = (ingredient: Ingredient): string => ingredient.name;
