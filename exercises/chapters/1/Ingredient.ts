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

export const name = (ingredient: Ingredient): string => ingredient.name;
