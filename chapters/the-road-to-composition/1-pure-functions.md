---
slug: pure-functions
parent: the-road-to-composition
order: 1
title: Pure Functions
state: draft
---

TODO: explain use of namespaces

### Capitalism, ho!

As you step onto the creaking floor boards of the old shop, you breathe in a
whiff of mouldy air. You firmly grip the key in your hand, melancholy washing
over you, as you recall the many times you spent helping your granny running the shop
in your childhood. Brushing off a layer of thick dust on the counter, you begin
to inspect the inventory.

[inventory.json]()

Grandmother supplied ingredients to adventurous alchemists, and you are picking
up the trade. She used to do her accounting with pen and paper, but you will
bring the shop into the 21th century, modeling the shop as a TypeScript
program. So far, the list of ingredients look simple enough, let's describe it
in a `type`. Ingredients have a unique `name`, a `cost`, which denotes how much
we payed for them, and a `rarity`, which describes a range of how likely it is
to find, from `0` to `1`, with `1` being abundant.

```typescript
// file: Ingredient.ts
export type Ingredient = {
    name: string;
    cost: number;
    rarity: number;
};
```

This `type` describes the shape, or structure of the data in our program (think
`struct`, if you're familiar with that term). We can then define functions that
take data of this type and transform it. For example, we could define a
constructor function that creates data that fits the `Ingredient` type:

```typescript
// file: Ingredient.ts
export const from = (name: string, cost: number, rarity: number): Ingredient => ({
    name,
    cost,
    rarity,
});
```

Note that, unlike in object-oriented programming, our data is not an instance
of a class. It is just that, data. Simple, serializable, context-free data.
Our `Ingredient` does not have any behaviour (methods) attached to it. Any
transformations we need, we will define as functions that take data of the type
`Ingredient` as input. Note that our constructor function is just a helper,
we don't actually need it to create an `Ingredient`:

```typescript
// file: Ingredient.test.ts
import * as I from './Ingredient';

const flower = I.from('Flower', 0.1, 0.95);

describe('Ingredient::from', () => {
    it('creates a single ingredient', () => {
        expect(flower).toStrictEqual({name: 'Flower', cost: 0.1, rarity: 0.95});
    });
});
```

Both pieces of data can be considered an `Ingredient`. In fact, any data that
shares properties with our type can be, for all intents and purposes,
considered an `Ingredient`. Here is a function `name`, that takes an
`Ingredient` and returns its `name`:

```typescript
// file: Ingredient.ts
export const name = (ingredient: Ingredient) => ingredient.name;
```

We can use it on both pieces of data, the one we created manually and the
one by using `from`:

```git
// file: Ingredient.test.ts
@@ -7,3 +7,9 @@ describe('Ingredient::from', () => {
         expect(flower).toStrictEqual({name: 'Flower', cost: 0.1, rarity: 0.95});
     });
 });
+
+describe('Ingredient::name', () => {
+    it('returns the name of an ingredient', () => {
+        expect(I.name(flower)).toStrictEqual('Flower');
+    });
+});
```

TypeScript requires us to be exact about the properties when passing in an
object literal into `name`, the following will not compile, warning us that
`color` does not exist on our `Ingredient` type:

```typescript
const name = I.name({
    name: 'Tyme',
    cost: 0.2,
    rarity: 0.5,
    // Does not compile.
    color: 'green',
});
```

TypeScript will also complain when we explicitly hint the type and we
define our data ad-hoc:

```typescript
const tyme: I.Ingredient = {
    name: 'Tyme',
    cost: 0.2,
    rarity: 0.5,
    // Does not compile.
    color: 'green',
};
```

Interestingly, when we drop the type hint, we can define the data prior and
pass it into `name` without TypeScript complaining:

```typescript
const tyme = {
    name: 'Tyme',
    cost: 0.2,
    rarity: 0.5,
    color: 'green',
};

const name = I.name(tyme);
```

This is expected behaviour, as TypeScript is using [structural sub typing](https://www.typescriptlang.org/docs/handbook/type-compatibility.html),
meaning that a piece of data is considered of type some `A`, when its
properties match those of `A`. Excess properties are ignored. Only when we
_explicitly_ use a type hint, or constructor function, will TypeScript complain
about excess properties. One interesting property that follows from this is
that one piece of data can match many types:

```typescript
type A = { foo: string; };
type B = { bar: number; };

const f = (a: A) => a.foo;
const g = (b: B) => b.bar;

const data = {foo: 'Jeff', bar: 24};
console.log(f(data)); // 'Jeff'
console.log(g(data)); // 24
```

In our case, when a JavaScript object has the properties `name`, `cost`, and `rarity` that
are of the primitive types `string`, `number` and `number` respectively, we can
use it in any function that requires an `Ingredient`, even when we didn't explicitly
define it as such.

### A store from boards and nails

Alright, now that we've defined our data type, let's think about what else we need
for our little item store to work. Rummaging around in grannies cupboards, you can't
find the program she was using to buy and sell ingredients, so we have to write our
own. To make it easier for ourselfes, and as is the premise of this tutorial, we will
write the store using stateless, pure functions. Immutable transformations or
"pure functions", by definition, produce the same output for the same input.
Every time. Not only does this have benefits for the reasonability of our
program, it is essentially the prerequisite for writing it in a composable,
functional style. In later chapters, we can explore deeper the reasons,
benefits and problems for that, for now, let's just start writing.

For now, our `Store` will simply hold the inventory, a list of all
`Ingredient`s we have available. This is somewhat of a naíve way to represent
the inventory, but we will have plenty of opportunity to change and refactor
this code.

```typescript
// file: Store.ts
import * as I from './Ingredient';

export type Store = {
    inventory: I.Ingredient[];
}

export const create = (): Store => ({
    inventory: [],
});
```

Here, `create` acts as a constructor function for our `Store`, which is a plain
object. Unlike in classical object-oriented programming, we're not
instantiating an object, we're simply creating plain data. It does not have any
behaviour ("methods") attached, and thus is stateless. If we want to change
it, we have to define pure functions that transform it, creating new data,
without changing the original. Though we're co-locating them, we're clearly separating
between the data type (`Store`) and our transformations (so far only `create`).

Note that we can still combine object-oriented programming and functional
programming in an elegant way, by using type classes, if we want to. Defining
that is beyond this chapter though.

A pure function has a couple of properties:

1. Following the principle of least astonishment, for any function input `a`, it always returns the output `b`, regardless of how often we call it, or in which context. For example, the function
    ```typescript
    const add = (a, b) => a + b;
    ```
    always returns `4` for the inputs `1` and `3`. A formal way of describing this property saying that the function is "referentially transparent", that is, you could replace the function invocation with its result, without breaking the program.
2. It does not mutate its inputs, otherwise calling it multiple times with the same inputs would result in different outputs, and thus break (1).
3. It does not cause any side effects in your program, it simply returns values. This is more of a theoretical problem, some side effects are harmless, others change the environment in a way where calling the function multiple times would result in different results, which would, again, break (1). Examples include making api calls, updating a database, interacting with the file system.

Callign `create`, unremarkably, creates a plain object that fits the `Store` type:

```typescript
// file: run.ts
import * as S from './Store.ts'

const store = S.create();
```

Granny left us a little bit of cash, `$95.4`, not enough to live decadently. Let's
extend the `Store`, so that it holds a balance, and an alternative constructor that
allows us to define an initial stock and balance.

```git
// file: Store.ts
@@ -2,8 +2,21 @@ import * as I from './Ingredient';
 
 export type Store = {
     inventory: I.Ingredient[];
+    balance: number;
 };
 
 export const create = (): Store => ({
     inventory: [],
+    balance: 0,
+});
+
+export const from = ({
+    inventory,
+    balance,
+}: {
+    inventory: I.Ingredient[];
+    balance: number;
+}): Store => ({
+    inventory,
+    balance,
 });
```

Now we use `from` to generate a store with our humble balance and inventory.

```typescript
// file: run.ts
import * as S from './Store';

import * as inventory from './inventory.json';

const store = S.from({inventory, balance: 95.4});
```

And we can see that our store is still a plain object:

```typescript
console.log(store);
```

[store-output.json]()

But we still can't do anything with our store. Let's change that by extending it
with a function to stock up on ingredients:

```typescript
@@ -1,5 +1,12 @@
 import * as I from './Ingredient';
 
+export class BalanceExhausted extends Error {
+    constructor() {
+        super("The balance can't go below 0.");
+        this.name = this.constructor.name;
+    }
+}
+
 export type Store = {
     inventory: I.Ingredient[];
     balance: number;
@@ -20,3 +27,21 @@ export const from = ({
     inventory,
     balance,
 });
+
+/**
+ * Adds `ingredient` to the `store`, given that the balance can
+ * cover the cost.
+ *
+ * @throws BalanceExhausted
+ */
+export const stockOne = (store: Store, ingredient: I.Ingredient): Store => {
+    const balance = store.balance - ingredient.cost;
+
+    // There are no money lenders around in this back-water town. We can only
+    // work with the money we've got in the balance.
+    if (balance < 0) {
+        throw new BalanceExhausted();
+    }
+
+    return {inventory: store.inventory.concat(ingredient), balance};
+};
```

Note that `stockOne` does not mutate the passed in `store`, but instead creates
a new object. We're being naive here in forcing immutability by aggressively
copying data. While individually, the cost is small, in a large application the
memory overhead _will_ add up. We _can_ alleviate some of the cost by using
libraries that provide data structures made specifically for enabling
immutability (such as [immer.js](https://www.npmjs.com/package/immer)). Other
languages, such as Haskell, Rust or Clojure afford us immutable data by design,
and offer built-in efficient, immutable data structures. For the purposes of
this tutorial though, the memory overhead is a trade-off we are willing to
make.

Our function is not quite pure, though, as we don't have an elegant way yet to
handle failure cases in our program (later we will use the `Either` type to do
that), so we we will resort to the crude way of throwing exceptions.

For now that is good enough, we'll refactor it later. Let's verify our new
functionality:

```typescript
// file: Store.test.ts
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
```

### Recap

Let's recap.

* We describe the shape of our simple data with `type`s.
* To transform data, we use pure functions, which
    * are referentially transparent. That is, for any input A they always return output B.
    * do not mutate their inputs.
    * does not cause side effects such as printing read and write to a database
      or the file system
* We use name spaces to separate concerns and structure our code. Every name
  space should only include code that is relevant to its concept, following the
  principle of "I don't know, I don't want to know".

### Next Up And Exercises

Before we can attract any customers, we need a function
to sell ingredients. And that's where you come in. As an exercise,
implement the function `sellOne` in the `Store` namespace.

* `sellOne` takes a `Store` and a string `name`, and removes an ingredient with
  that name from the inventory, increasing the `balance` by its cost.
* Because we want to turn a profit, we need to sell at some `PROFIT_MARGIN`.
  For now, you can define it as a global, immutable constant of `0.25`.
* When the ingredient cannot be found, throw a `IngredientNotFound` exception.

To test your skills, clone, and prepare this repository:

```bash
git clone https://github.com/tstelzer/workers-guide-to-fp-in-ts
cd workers-guide-to-fp-in-ts/exercises
npm ci
```

The code of this chapter should be under `chapters/1/`.
To run the test suite in watch mode, run:

```bash
npm run test:1 -- --watch
```

Or to simply run the code and play around with it, run:

```bash
npm run dev:1
```

That should also start the node debugger under `0.0.0.0:9229`.

Good luck, and see you in the next chapter.
