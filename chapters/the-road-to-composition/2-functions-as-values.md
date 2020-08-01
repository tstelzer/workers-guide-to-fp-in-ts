---
slug: functions-as-values
parent: the-road-to-composition
order: 2
title: Functions as values
state: draft
---

### Summary

In this chapter we're discovering that we can use functions as values by
having a look at two higher-order functions: `map` and `filter`. If you
already know about higher order functions and have built an intuition for `map`
and `filter` you can skip this chapter.

* new features
    * `show` (to be refactored via `map`)
    * `findAllWheat`
* identify opportunities for refactoring
    * what is operational logic?
    * what is business logic?
* parametrize functions, as functions are values
    * simplest case
    * parametrize so that it works for `Ingredient -> Ingredient`
    * parametrize so that it works for _any_ `A -> A`
    * refactor code with `map`
* filter
    * simplest case
    * parametrize so that it works for `Ingredient -> boolean`
    * parametrize so that it works for _any_ `A -> boolean`
    * refactor code with `filter`

---

> Note: *Refactoring* is defined as changing the structure and organization of
code -- without breaking expected behaviour of the program -- with the goal of
improving readability, maintainability and reducing overall complexity.

> Note: "Don't Repeat Yourself", or "DRY" is a useful principle when applied
sensibly. Always try to discern between essential and accidental duplication
before mindlessly attempting to DRY out code.

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

When we say _predicate function_, we mean _any_ function taking a value that
resolves to a `boolean` value. For example, all of the following functions are
considered predicate functions:

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
