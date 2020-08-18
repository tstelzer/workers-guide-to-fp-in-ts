import * as I from './Ingredient';

const flower = I.from('Flower', 0.1, 0.95);
const wheat = I.from('Wheat', 0.2, 0.99);
const corn = I.from('Corn', 0.3, 0.93);

describe('Ingredient::from', () => {
    it('creates a single ingredient', () => {
        expect(flower).toStrictEqual({name: 'Flower', cost: 0.1, rarity: 0.95});
    });
});

describe('Ingredient::name', () => {
    it('returns the name of an ingredient', () => {
        expect(I.name(flower)).toStrictEqual('Flower');
    });
});

describe('Ingredient::isWheat', () => {
    it('positively identifies wheat', () => {
        expect(I.isWheat(wheat)).toStrictEqual(true);
    });

    it('negatively identifies other ingredients', () => {
        for (const ingredient of [flower, corn]) {
            expect(I.isWheat(ingredient)).toStrictEqual(false);
        }
    });
});
