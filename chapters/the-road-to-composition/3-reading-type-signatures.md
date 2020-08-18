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
and rarest. Unfortunately you aren't rich (yet), so they can't be exceedingly
expensive either. The blacksmith showcases her inventory:

[[expand | blacksmith-inventory.json]]
| ```json5 file=../../exercises/chapters/3/blacksmith-inventory.json
| ```

In order to fit the new kind of items into your model, you first define a new
type for `Weapon`, along with three predicates that, in combination, select the
subset of her inventory you are interested in:

```typescript
```

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

Fortunately, there is such a thing in TypeScript: meet [generics](http://www.typescriptlang.org/docs/handbook/generics.html)

In a nutshell, generics are place holder types, or type variables that stand in
for a concrete type. Generics let us define generalized functions without
concrete types, allowing the _caller_ of the functions to define them
instead, either explicitly, or implicitly inferred by TypeScript.

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
