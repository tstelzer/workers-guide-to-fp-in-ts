import * as I from './Ingredient';
import * as S from './Store';

describe('Store::stockOne', () => {
    const from = () => S.from({balance: 10, inventory: []});
    const initialStore = from();

    it('stocks a single ingredient', () => {
        const flower = I.from('Flower', 0.1, 0.95);

        expect(S.stockOne(initialStore, flower)).toStrictEqual({
            balance: 9.9,
            inventory: [flower],
        });
    });

    it('throws when cost exceeds the balance', () => {
        const gold = I.from('Gold', 900, 0.01);

        expect(() => S.stockOne(initialStore, gold)).toThrow();
    });

    it('does not mutate the store', () => {
        expect(initialStore).toStrictEqual(from());
    });
});

describe('Store::sellOne', () => {
    const platinum = I.from('Platinum', 1200, 0.01);
    const silver = I.from('Silver', 500, 0.05);

    const from = () =>
        S.from({
            balance: 0,
            inventory: [platinum, silver],
        });

    const initialStore = from();

    it('throws when the ingredient is not part of the inventory', () => {
        expect(() => S.sellOne(initialStore, 'Gold')).toThrow(
            S.IngredientNotFound,
        );
    });

    it('sells an ingredient with profit', () => {
        const result = S.sellOne(initialStore, 'Platinum');

        expect(result.balance).toStrictEqual(1500);
        expect(result.inventory).not.toContain(platinum);
        expect(result.inventory).toContain(silver);
    });

    it('does not mutate the store', () => {
        expect(initialStore).toStrictEqual(from());
    });
});
