export const isRare = ({rarity}: {rarity: number}): boolean => rarity <= 0.2;

export const filter = <A>(as: A[], predicate: (a: A) => boolean): A[] => {
    const result = [];
    for (const a of as) {
        if (predicate(a)) result.push(a);
    }
    return result;
};
