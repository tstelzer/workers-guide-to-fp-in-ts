export type Weapon = {
    name: string;
    cost: number;
    rarity: number;
    quality: number;
};

export const isCheap = (weapon: Weapon): boolean => weapon.cost <= 300;

export const isPrecious = (weapon: Weapon): boolean => weapon.quality >= 0.75;
