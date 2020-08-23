export type Weapon = {
    name: string;
    cost: number;
    rarity: number;
    quality: number;
};

export const isCheap = ({cost}: {cost: number}): boolean => cost <= 0.5;
