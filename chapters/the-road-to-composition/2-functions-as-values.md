---
slug: functions-as-values
parent: the-road-to-composition
order: 2
title: Functions as values
state: draft
---

Here is the code from the previous chapter. It includes a solution for the exercises.

[Store.ts]()
[Ingredient.ts]()
[run.ts]()

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

You also decide that, for your own accounting, you want to incorporate
the profit margin per ingredient and calculate a total selling price.
For that, you, again, take an inventory as input, iterate over it
and add a property `sellingPrice`, returning it as part of a cloned list.

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

Which matches the sginature of `isWheat`. The function body then contains
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
profit margin as well. We will discover in later chapters how we can clean that up.

[output-2.json]()
---

```typescript
const isTusk = (ingredient: Ingredient) => ingredient.name === 'Tusk';
const filterTusks = filterInventory(isTusk);
```

> Note: A higher-order function takes advantage of the fact that _functions are values_.
Higher-order functions, or HOC, are functions that take other functions as
parameters so that they behave differently depending on inputs. They are
more powerful than regular functions in the way that they don't just abstract
over _values_, but over _transformations and actions_.

* define operational logic (map)
* filter
    * simplest case
    * parametrize so that it works for `Ingredient -> boolean`
    * parametrize so that it works for _any_ `A -> boolean`
    * refactor code with `filter`
* parametrize functions, as functions are values
    * simplest case
    * parametrize so that it works for `Ingredient -> Ingredient`
    * parametrize so that it works for _any_ `A -> A`
    * refactor code with `map`

---

> Note: *Refactoring* is defined as changing the structure and organization of
code -- without breaking expected behaviour of the program -- with the goal of
improving readability, maintainability and reducing overall complexity.

Here is a rather silly function that takes a function `f` and a string `s` as
arguments, uppercases the string and applies `f` to it.

```typescript
const uppercaseWithF = (f: (s: string) => string, s: string) =>
    f(s.toUpperCase());
```

TypeScript knows that it can apply `f`, because uppercasing a string also
returns a string, and it defines `f` so that it takes a string. Let's define a
couple of functions that we can pass as arguments to `uppercaseWithF`:

```typescript
const emphasize = (s: string): string => `_${s}_`;

const scream = (s: string): string => `${s}!`;

const duplicate = (s: string): string => s + s;
```

All of those can be passed, because they share the signature `(s: string) =>
string`, which is what `uppercaseWithF` is expecting:

```typescript
console.log(uppercaseWithF(emphasize, 'this is important'));
console.log(uppercaseWithF(scream, 'this is important'));
console.log(uppercaseWithF(duplicate, 'this is important'));
```

```json5
_THIS IS IMPORTANT_
THIS IS IMPORTANT!
THIS IS IMPORTANTTHIS IS IMPORTANT
```

But we're not done yet. We've only generalized `transformUsers` for any function
that *takes a user and returns a user*, but why stop there? As it so happens, a
lot of programs iterate over arrays, applying functions to each element.
Can we generalize the function even more?

We don't have to, as this function already exists: `map`. Unlike our
`transformUsers`, which only works for functions `f: (user: User) => User`,
`map` works for _any_ function that takes a value of some type and returns a
value of the same type.

JavaScript has `map` [built-in](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) as a method on arrays: it applies the passed
function `f` to every element in a copy of the array and returns the copy.
In fact, we can use that to replace `transformUsers` entirely:

> Note: We're only temporarily switching to using built-in methods. In the next
couple of chapters we will use `fp-ts`, which comes with its own version of
`map`. Using that, however, requires us to understand a couple more concepts.

To build an intuition for `map`, let's look at more examples:

```typescript
const words = ['Hey', 'Ho', "Let's Go"];

const emphazise = (x: string) => `${x}!`;

console.log(words.map(emphazise));
```

```json5
['Hey!', 'Ho!', "Let's Go!"]
```

```typescript
const numbers = [1, 2, 3, 4, 5];

const timesTen = (x: number) => x * 10;

console.log(numbers.map(timesTen));
```

```json5
[10, 20, 30, 40, 50]
```

> Note: `map` happens to be quite a generic function, in later chapters we'll
discover that almost every type in `fp-ts` support `map`.

### Introducing filter

* separate the "iterate over the users" concern from our business logic

```typescript
const startsWithC = (s: string): boolean => s.toLowerCase().startsWith('c');

const moreThanThreeDigits = (n: number): boolean => n.toString().length > 3;

const afterMoonLanding = (d: Date): boolean => d > new Date(1969, 6, 20);
```

And again, as with `map`, we don't have to reinvent the wheel: `filter` abstracts
the concern of "iterate over an array and filter values based on a predicate".
It too is a built-in method on `Array`, let's have a look at a couple of examples:

```typescript
const startsWithC = (s: string): boolean => s.toLowerCase().startsWith('c');
const strings = ['horse', 'cow', 'cat', 'dog'];

console.log(strings.filter(startsWithC));
```

```json5
[ 'cow', 'cat' ]
```

```typescript
const moreThanThreeDigits = (n: number): boolean =>
    n.toString().length > 3;
const numbers = [1, 50, 999, 12345];

console.log(numbers.filter(moreThanThreeDigits));
```

```json
[ 12345 ]
```
