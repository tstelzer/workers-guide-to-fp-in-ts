---
slug: understanding-type-signatures
parent: the-road-to-composition
order: 3
title: Understanding type signatures
state: outline
---

Business is booming. While your town is quite small, Alchemists from a larger
city, close by, have heard of your shop and spread the word. In moments of
respite, you search for suppliers and traders offering exotic goods, and the
diversity of your catalogue grows and grows. An opportunity presents itself
to you, when the local blacksmith, who has heard of, and is keen to profit
from your success, offers to sell you her wares. You decide to take her up on
the offer, but as your shop is already bursting at the seams with
ingredients, you want to pick a small subset of weapons, the most precious
_or_ rarest. Unfortunately you aren't rich (yet), so they can't be exceedingly
expensive either. The blacksmith showcases her inventory:

[[expand | blacksmith-inventory.json]]
| ```json5 file=../../exercises/chapters/3/blacksmith-inventory.json
| ```

In order to fit the new kind of items into your model, you first define a new
type for `Weapon`:

```typescript
// file: Weapon.ts
export type Weapon = {
    name: string;
    cost: number;
    rarity: number;
    quality: number;
};
```

As for the three predicates, two of those we have already defined as part of
the exercizes from the last chapter: `isCheap` and `isRare`, though we defined
them for `Ingredient`. Can we re-use them for `Weapon`? What would accomplish
that? Speaking strictly syntactically, there are three ways for us to re-use
the predicates:

1. We define a base type that `Weapon` and `Ingredient` extend.
2. We ease the requirements of the predicate inputs, requesting only the subset
   of properties that are relevant for it.
3. We define the inputs as a union of `Weapon` and `Ingredient`.

Solution #1 unfortunately yields an unnecessary proliferation of types in our
application. That path leads us down a road with many `Base` and `Abstract`
types, which in and of themselves aren't used anywhere, and are only extended
from. This solution likely seems natural to many developers coming from an OOP
background, and may be the only solution if your language of choice forces you
to use nominal types everywhere. We don't use such a language.

When our types naturally grow from our problem domain, our code stays
comprehensible and simple.

Solution #2 works well when the logic is simple and and does not differ
between the actual types:

```typescript
export const isCheap = ({cost}: {cost: number}): boolean => cost <= 0.5;
export const isRare = ({rarity}: {rarity: number}): boolean => rarity <= 0.2;
```

Here, we're not using _any_ named type in the parameters, and instead
destructure, only defining the property we need. We trade type context for
generality.

Solution #3 unites both `Weapon` and `Ingredient`:

```typescript
export const isCheap = (item: Weapon | Ingredient): boolean => item.cost <= 0.5;
export const isRare = (item: Weapon | Ingredient): boolean => item.rarity <= 0.2;
```

If we're inclined to do so, we could name the union (but we don't have to):

```typescript
type Item = Weapon | Ingredient;

export const isCheap = (item: Item): boolean => item.cost <= 0.5;
export const isRare = (item: Item): boolean => item.rarity <= 0.2;
```

Though before we get too enamoured with our ability to generalize, we should
stop and think if we _should_ do so; can `isCheap` and `isRare` both be
generalized in this way?

As rarity is expressed relatively as a percentage, it should apply to both
`Weapon` and `Ingredient`. Not so cost. What may be cheap for a weapon is
likely incredibly expensive for an ingredient and so `isCheap` shouldn't be
re-used. One could argue, we shouldn't even be generalizing `isCheap` for
`Weapon` _or_ `Ingredient`, as cost varies greatly between weapon or ingredient
types, but we don't care about that for now.

We'll pick solution #2 for `isRare` and re-define `isCheap` so that it works
with `Weapon`, chosing `300` as the threshold value. As we don't have a
predicate for quality yet, we're defining it as `isPrecious`, with a `quality`
value of `0.75` or higher.

```typescript
// file: common.ts
export const isRare = ({rarity}: {rarity: number}): boolean => rarity <= 0.2;
```

```typescript
// file: Weapon.ts
export const isCheap = (weapon: Weapon): boolean => weapon.cost <= 300;

export const isPrecious = (weapon: Weapon): boolean => weapon.quality >= 0.75;
```

Now that we have our three predicates, we can use them to filter the
blacksmith's inventory. Our `filterInventory` function from chapter 2 doesn't
include `Weapon` yet, as it is defined for `Ingredient`. We could apply the
approach we found in solution #2 from above, and define the Inventory as a
union of `Weapon` and `Ingredient`, like this:

```git
diff --git a/exercises/chapters/3/Store.ts b/exercises/chapters/3/Store.ts
index bd6fef8..44d6ed0 100644
--- a/exercises/chapters/3/Store.ts
+++ b/exercises/chapters/3/Store.ts
@@ -1,4 +1,5 @@
 import * as I from './Ingredient';
+import * as W from './Weapon';
 
 export class BalanceExhausted extends Error {
     constructor() {
@@ -16,7 +17,8 @@ export class IngredientNotFound extends Error {
 
 export const PROFIT_MARGIN = 0.25;
 
-export type Inventory = I.Ingredient[];
+export type Item = I.Ingredient | W.Weapon;
+export type Inventory = Item[];
 
 export type Store = {
     inventory: Inventory;
@@ -25,11 +27,11 @@ export type Store = {
 
 export const filterInventory = (
     inventory: Inventory,
-    predicate: (ingredient: I.Ingredient) => boolean,
-) => {
+    predicate: (item: Item) => boolean,
+): Inventory => {
     const result = [];
-    for (const ingredient of inventory) {
-        if (predicate(ingredient)) result.push(ingredient);
+    for (const item of inventory) {
+        if (predicate(item)) result.push(item);
     }
     return result;
 };
```

TODO: actually filter the things

It is sensible to include `Weapon` in our `Inventory` type, but as for
`filterInventory`, surely we can do better in terms of generality.
Is there any reason `filterInventory` must be specifically about `Inventory`
types? The function body looks generic enough already, if it weren't for those
pesky, concrete types of `Inventory` and `Ingredient`.

To solve this issue, we need something else from the TypeScript toolset:
[generics](http://www.typescriptlang.org/docs/handbook/generics.html). In a
nutshell, generics are place holder types, or type variables that stand in for
a concrete type.

```typescript
const identity = <T>(a: T) => a;
```

In this function, `T` is a generic, and as with any variable, we pick the to be
what we want. Conventionally, generics are named with single characters,
sometimes abbreviating the thing they are standing in for. Generics let us
define generalized functions without concrete types, allowing the _caller_ of
the functions to define them instead. We can let TypeScript infer types
implicitly:

```typescript
identity(42); // type of T: 42
identity('hello'); // type of T: 'hello'
identity({}); // type of T: {}
```

Or explicitly pass them in:

```typescript
identity<string>('hello');
identity<string>(42); // does not compile
```

Using generics, we can generalize the concrete types `Ingredient` and
`Inventory` from our `filterInventory` function, and define `filter`:

```typescript
// file: common.ts
export const filter = <A>(as: A[], predicate: (a: A) => boolean): A[] => {
    const result = [];
    for (const a of as) {
        if (predicate(a)) result.push(a);
    }
    return result;
};
```

Here, `A` stands in for the concrete type of items in the list `as`. Note where it is used:

1. `as` is a list of `A`.
2. The `predicate` requires a _single_ `A` as input.
3. The function output is again a list of `A`.

When we use it with our store, `A` is replaced with the concrete type. And yet,
`filter` knows nothing of our domain types, now _that_ is truly reusable code.

TODO: filter the things

---

With an ever increasing range of ingredients, you tire of defining predicates
for each and every one, and you ponder the nature of the predicate function.

In the last chapter, we've defined predicate functions like this:

> When we say _predicate function_, we mean _any_ function taking a value
> that returns a `boolean` value.

Including the three exercize functions, we now have four:

```typescript
// file: Ingredient.ts
export const isWheat = (ingredient: Ingredient): boolean =>
    ingredient.name === 'Wheat';

export const isDeathbell = (ingredient: Ingredient): boolean =>
    ingredient.name === 'Deathbell';

export const isRare = (ingredient: Ingredient): boolean =>
    ingredient.rarity <= 0.1;

export const isCheap = (ingredient: Ingredient): boolean =>
    ingredient.cost <= 0.5;
```

And we're using them via `filterInventory`, which defines the `predicate`
signature as `predicate: (ingredient: I.Ingredient) => boolean`:

```typescript
// file: Store.ts

export const filterInventory = (
    inventory: Inventory,
    predicate: (ingredient: I.Ingredient) => boolean,
) => {
    const result = [];
    for (const ingredient of inventory) {
        if (predicate(ingredient)) result.push(ingredient);
    }
    return result;
};
```

* generalizing predicates
* introduce generics
* generalize map

In the last two chapters we have been looking at type signatures without really
explaining them. In this chapter, we will build an understanding for their
purpose and usage and see how they give us a sense for how a function
works, without looking at its implementation.

## Simple Function Signatures

This tutorial assumes that you have an understanding of basic TypeScript,
so code like this should not surprise you:

```typescript
const startsWithC = (s: string): boolean => s.toLowerCase().startsWith('c');
```

You've seen this function at the end of the last chapter. Nothing fancy, it's
just a simple function that asserts that a `string` starts with the character
`c`. Let's look at the type signature in isolation:

```typescript
type startsWithC = (s: string) => boolean;
```

We've removed pesky implementation details and are left with the types for the
input value, `string`, and the output value, `boolean`. The function signature
defines a contract that other code can rely on. This function only takes
strings and only returns booleans.

Let's look at the other two predicates we've introduced:

```typescript
const moreThanThreeDigits = (n: number): boolean => n.toString().length > 3;

const afterMoonLanding = (d: Date): boolean => d > new Date(1969, 6, 20);
```

And again, let's extract the types:

```typescript
type moreThanThreeDigits = (n: number) => boolean;

type afterMoonLanding = (d: Date) => boolean;
```

In the previous chapter, we've categorized these functions as "predicates",
which we have defined as "any function that takes a value of any type and
return a `boolean`. Can we capture the idea of a "predicate function" somehow
as a type? Well, with our set of three functions, we could try and use a
[union](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types)
to "merge" the input types:

```typescript
type Predicate = (a: string | number | Date) => boolean;
```

And we could go back and declare that our three functions are predicates:

```typescript
const moreThanThreeDigits: Predicate = (n): boolean => n.toString().length > 3;
const afterMoonLanding: Predicate = (d): boolean => d > new Date(1969, 6, 20);
const startsWithC: Predicate = (s): boolean => s.toLowerCase().startsWith('c');
```

Unfortunately, this code does not compile, we get the following error:

```
Property 'toLowerCase' does not exist on type 'string | | number | Date'.
    Property 'toLowerCase' does not exist on type 'number'.
```

The issue here is that we've spread the three potential input types across all
three functions. All three functions now expect a `string` _or_ a `number`
_or_ a `Date`. That is not actually how our functions work. Coincidentally, for
`moreThanThreeDigits` and `afterMoonLanding`, this is not a problem, because
`.toString` works for all three input types, and so does comparison via `>`.
Unfortunately, `.toLowerCase` exists on neither `Date`, nor `number`.

We need a mechanism where we can some how express the idea of "take any value"
without losing the type information of that value. This will allow us to write
these kind of abstract type signatures that we need for `Predicate`.


Using generics, we can define our `Predicate` like this:

```typescript
type Predicate<A> = (a: A) => boolean;
```

Here, `A` is the placeholder for the concrete type that we will define
explicitly for our three functions:

```typescript
const moreThanThreeDigits: Predicate<number> = n => n.toString().length > 3;
const afterMoonLanding: Predicate<Date> = d => d > new Date(1969, 6, 20);
const startsWithC: Predicate<string> = s => s.toLowerCase().startsWith('c');
```

Generics can also be defined directly on functions, and the concrete types
inferred from usage. Consider a function that only returns its input value,
conventionally called `identity`:

```typescript
const identity = <A>(a: A) => a;
```

Here, `A` stands in for whatever type is passed into `identity`. We don't have
to explicitly say what it is, because typescript will know, once we use the
function:

```typescript
identity('some string'); // `A` is inferred as `string`
identity(99); // `A` is inferred as `number`
```

For example, if you define a
function with a signature `f: <A>(a: A) => A` and use it like `f('Hello,
World!')`, TypeScript infers `A` to be a `string`, so the concrete signature
would be derived as `f: (a: string) => string`. If you used it like `f(42)` it
would be derived as `f: (a: number) => number`, and so on.

### Predicate functions

as they all have the generalized function signature of `<A>(a: A) => boolean`.

### mapping functions

> Note: A higher-order function takes advantage of the fact that _functions are values_.
Higher-order functions, or HOC, are functions that take other functions as
parameters so that they behave differently depending on inputs. They are
more powerful than regular functions in the way that they don't just abstract
over _values_, but over _transformations and actions_.
