import * as I from './Ingredient';

const flower = I.from('Flower', 0.1, 0.95);

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
