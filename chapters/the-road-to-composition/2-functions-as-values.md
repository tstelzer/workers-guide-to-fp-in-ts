---
slug: functions-as-values
parent: the-road-to-composition
order: 2
title: Functions as values
state: draft
---

Here is the code from the previous chapter. It includes a solution for the exercises.

[Store.ts](../../exercises/chapters/1/Store.ts)

[Ingredient.ts](../../exercises/chapters/1/Ingredient.ts)

[run.ts](../../exercises/chapters/1/run.ts)

Wiping away the sweat off your brow from a hard days work, you wave goodbye to
farmer Frank, who just delivered a cart full of wheat. Good old Frank has
always been both customer and supplier to your granny, and decided to bootstrap
your business venture with some free wheat. You didn't really have the time to
weigh it, but now you're curious, and would like to see all of the wheat in
your inventory.

[inventory.json]()

For convinience and encapsulation, let's create a new `Inventory` type:

```git
// file: Store.ts
@@ -16,8 +16,10 @@ export class IngredientNotFound extends Error {
 
 const PROFIT_MARGIN = 0.25;
 
+export type Inventory = I.Ingredient[];
+
 export type Store = {
-    inventory: I.Ingredient[];
+    inventory: Inventory;
     balance: number;
 };
 
@@ -30,7 +32,7 @@ export const from = ({
     inventory,
     balance,
 }: {
-    inventory: I.Ingredient[];
+    inventory: Inventory;
     balance: number;
 }): Store => ({
     inventory,
```

You quickly write a simple function to _filter_ the inventory for wheat. Taking
an inventory as input, it quite simply iterates over it and puts all the `Wheat`
it can find into a new list, and then returning the list:

```typescript
// file: Store.ts
export const filterWheat = (inventory: Inventory): Inventory => {
    const result = [];
    for (const ingredient of inventory) {
        if (ingredient.name === 'Wheat') result.push(ingredient);
    }
    return result;
};
```

You also decide that, for accounting, you want to incorporate
the profit margin per ingredient and calculate a total selling price.
For that, you, again, take an inventory as input, iterate over it
and add a property `sellingPrice`, returning it as part of a new list.

```typescript
export const withSellingPrice = (
    inventory: Inventory,
): (I.Ingredient & {sellingPrice: number})[] => {
    const result = [];
    for (const ingredient of inventory) {
        const sellingPrice = ingredient.cost * (1 + PROFIT_MARGIN);
        result.push({...ingredient, sellingPrice});
    }
    return result;
};
```

We're not creating a separate type yet for the added property to avoid needless
type proliferation. Now you are specifically interested in seeing that for all
of the wheat in the inventory, printing the raw JSON you find unsatisfying,
though:

```typescript
// file: run.ts
console.log(S.withSellingPrice(S.filterWheat(store.inventory)));
```

[output.json]()

You would love to show a less mechanical, human-readable list.
A simple task, you just iterate over the inventory again,
transforming each ingredient to a human-readable string,
push that into another list, and return the joined list.

```typescript
export const show = (
    inventory: (I.Ingredient & {sellingPrice: number})[],
): string => {
    const result = [];
    for (const ingredient of inventory) {
        const name = ingredient.name.trim().padEnd(40, ' ');
        const sellingPrice = `$${ingredient.sellingPrice.toFixed(2)}`.padStart(
            10,
            ' ',
        );
        result.push(`${name} ${sellingPrice}`);
    }
    return result.join('\n');
};
```

We can now chain the functions and display a neat and tidy
human-readable string.

```typescript
// file: run.ts
console.log(S.show(S.withSellingPrice(S.filterWheat(store.inventory))));
```

[output.txt]()

Have another look at the code. What patterns can you spot to find opportunities
for refactoring? Which parts are similar or different? Let's invoke the spell
of DRY to clean it up.

> Note: "Don't Repeat Yourself", or "DRY" is a useful principle when applied
sensibly. Always try to discern between essential and accidental duplication
before mindlessly attempting to DRY out code.

`withSellingPrice` and `show` seem to follow a similar structure:

1. Define an empty array that serves as the output container.
2. Iterate over the inputs
3. Transform the item in some way before adding it to the result array.
4. Return the result array.

Remarkably similar, no? `filterWheat` closely resembles that as well:

1. Define an empty array that serves as the output container.
2. Iterate over the inputs
3. Optionally add items to the result array based on a condition.
4. Return the result array.

Let's call these similarities the _operational_ logic because they follow
structural patterns that have nothing to do with our business domain. What is
meaningfully different between functions and actually defines our business
cases we'll call the _business logic_.

Before we try to factor out the operational logic, let's try to first extract
the business logic, so that we can later parametrize it. Let's start with
`filterWheat`, because its business logic is dead-simple.

```typescript
// file: Ingredient.ts

export const isWheat = (ingredient: Ingredient): boolean => ingredient.name === 'Wheat';
```

`isWheat` is defined in the `Ingredient` name space, because it is concerned
only with a single `Ingredient` and is unaware of a `Store`. To introduce some
nomenclature, `isWheat` is a _predicate function_. When we say _predicate
function_, we mean _any_ function taking a value that returns a `boolean`
value.

Testing `isWheat` is super straight forward:

```git
diff --git a/exercises/chapters/2/Ingredient.test.ts b/exercises/chapters/2/Ingredient.test.ts
index a4f3785..437bb8c 100644
--- a/exercises/chapters/2/Ingredient.test.ts
+++ b/exercises/chapters/2/Ingredient.test.ts
@@ -1,6 +1,8 @@
 import * as I from './Ingredient';
 
 const flower = I.from('Flower', 0.1, 0.95);
+const wheat = I.from('Wheat', 0.2, 0.99);
+const corn = I.from('Corn', 0.3, 0.93);
 
 describe('Ingredient::from', () => {
     it('creates a single ingredient', () => {
@@ -13,3 +15,15 @@ describe('Ingredient::name', () => {
         expect(I.name(flower)).toStrictEqual('Flower');
     });
 });
+
+describe('Ingredient::isWheat', () => {
+    it('positively identifies wheat', () => {
+        expect(I.isWheat(wheat)).toStrictEqual(true);
+    });
+
+    it('negatively identifies other ingredients', () => {
+        for (const ingredient of [flower, corn]) {
+            expect(I.isWheat(ingredient)).toStrictEqual(false);
+        }
+    });
+});
```

In order to define our `filterWheat` in terms of `isWheat`, we need a function
that parametrizes the predicate function. Let's call it `filterInventory`.

```typescript
// file: Store.ts

const filterInventory = (inventory: Inventory, predicate: (ingredient: I.Ingredient) => boolean) => {
    const result = [];
    for (const ingredient of inventory) {
        if (predicate(ingredient)) result.push(ingredient);
    }
    return result;
};
```

`filterInventory` defines all the operational logic for filtering ingredients
from an inventory, but is unaware of the _concrete_ predicate that is applied.
All we have to do is describe the _signature_ of the predicate function that we expect
as an argument, which looks like this:

```
(ingredient: I.Ingredient) => boolean
```

Which matches the signature of `isWheat`. The function body then contains
the same steps as before:

1. Define an empty array that serves as the output container.
2. Iterate over the inputs
3. Optionally add items to the result array based on our predicate function.
4. Return the result array.

We can now use it like this:

```typescript
// file: run.ts

import * as S from './Store';
import * as I from './Ingredient';

import * as inventory from './inventory.json';

const store = S.from({inventory, balance: 100.0});

const onlyWheat = S.filterInventory(store.inventory, I.isWheat);

console.log(onlyWheat);
```

[output-2.json]()

Let's do the same for `withSellingPrice` and `show` and first extract their
business logic. Like `isWheat` we will define them in the `Ingredient` name
space, though that means we have to parametrize the profit margin (as it is not
part of the `Ingredient` name space).

```typescript
// file: Ingredient.ts

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
```

And now for defining the operational logic:

```typescript
// file: Store.ts

export const mapInventory = <A extends I.Ingredient, B>(
    inventory: A[],
    transformIngredient: (ingredient: A) => B,
) => {
    const result = [];
    for (const ingredient of inventory) {
        result.push(transformIngredient(ingredient));
    }
    return result;
};
```

As with `filterInventory`, we've generalized the concrete transformation
function by defining it as a parameter, describing its signature as generic as
possible:

```
(ingredient: A) => B
```

If you have never seen generics, don't let the `A` and `B` confuse you, we will
go into that in the next chapter. For now, understand `A` as "Something that
looks like an I.Ingredient" and `B` as "Whatever `transformIngredient`
returns". In the case of `Ingredient.withSellingPrice`, `B` is `Ingredient &
{sellingPrice: number}` and in the case of `show`, `B` is `string`.

And heres how we can use it:

```typescript
// file: run.ts

import * as S from './Store';
import * as I from './Ingredient';

import * as inventory from './inventory.json';

const store = S.from({inventory, balance: 100.0});

const onlyWheat = S.filterInventory(store.inventory, I.isWheat);

const inventoryWithSellingPrice = S.mapInventory(onlyWheat, (ingredient) =>
    I.withSellingPrice(ingredient, S.PROFIT_MARGIN),
);

const inventoryAsString = S.mapInventory(inventoryWithSellingPrice, I.show);

console.log(inventoryAsString.join('\n'));
```

Note that using `I.withSellingPrice` is a bit awkward, as we need to supply the
profit margin as well. We will discuss in later chapters how we can clean that up.

[output-2.txt]()

### Recap

Let's recap:

* Separating operational logic and business logic affords highly reusable functions.
* `filterInventory` takes an inventory and a predicate function, and returns a
  list that filters an inventory using the predicate function.
* `mapInventory` takes an inventory and a function that transforms individual
  ingredients to something else, and then returns a new list, applying that
  function to every ingredient.

### Next Up And Exercises

Following the example of the wheat, you want to expand your insight into your
own inventory:

1. Define three more predicate functions:
    * `isDeathbell`, identifying ingredients with the name "Deathbell"
    * `isRare`, identifying very rare ingredients with a rarity rating at or below 0.1
    * `isCheap`, identifying very cheap ingredients with a cost rating at or below 0.5
2. Define two more functions that work with `mapInventory`:
    * `withInitials`, which transforms ingredients, adding a new field
      `initials` which is either the first characters of the first two words in
      the `name`, or first and last characters if there is only one word. So,
      "Wheat" becomes "WT" and "Boar Tusk" becomes "BT".
    * `withRarityAsPercentage` modifes the `rarity` field so that it displays
      as rounded up percentage values, including the `%` symbol. So, 0.25
      becomes `25%` and `99.51` becomes `100%`.

As with the previous chapter, navigate to the `exercises` directory and run

```sh
npm run test:2
```

to run the test suite.
