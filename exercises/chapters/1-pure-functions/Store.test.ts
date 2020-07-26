import * as I from './Ingredient';
import * as S from './Store';

describe('Store::stockOne', () => {
    const createInitialStore = () => S.from({inventory: [], balance: 10});

    const initialStore = createInitialStore();

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
        expect(initialStore).toStrictEqual(createInitialStore());
    });
});
