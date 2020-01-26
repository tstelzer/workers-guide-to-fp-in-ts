---
title: Functions as values
parent: The road to composition
grand_parent: Tutorials
nav_order: 2
---

# Functions as values

## Summary

TODO

## Simplicity is king

Let's start by implementing what we've promised ourselves at the end of the
last chapter: defining our two functions for the single user case. As a
reminder, here they are again:

```typescript
const usersToSidebarView = (users: User[]) => {
    const _users: User[] = [];
    for (const user of users) {
        _users.push({
            ...user,
            registered: new Date(user.registered).toLocaleDateString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        });
    }
    return _users;
};

const usersToAdminCard = (users: User[]) => {
    const _users: User[] = [];
    for (const user of users) {
        _users.push({
            ...user,
            registered: user.registered.slice(6),
        });
    }
    return _users;
};
```

Let's start simple by separating the "transforming the user" concern from
"looping over the list" concern, by splitting the functions into two.
`userToSidebarView` and `userToAdminCard` are no longer aware of lists of users,
we've simplified them to work for a single user.

```typescript
const userToSidebarView = (user: User) => ({
    ...user,
    registered: new Date(user.registered).toLocaleDateString('en-gb', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }),
});

const usersToSidebarView = (users: User[]) => {
    const _users: User[] = [];
    for (const user of users) {
        _users.push(userToSidebarView(user));
    }
    return _users;
};

const userToAdminCard = (user: User) => ({
    ...user,
    registered: user.registered.slice(6),
});

const usersToAdminCard = (users: User[]) => {
    const _users: User[] = [];
    for (const user of users) {
        _users.push(userToAdminCard(user));
    }
    return _users;
};
```

We simplified the code without breaking it, great. But. As a fellow acolyte of
the church of "clean code" your DRY ("don't repeat yourself") senses should be
tingling. `usersToSidebarView` and `usersToAdminCard` look eerily similar.
In both cases, we're applying a function to elements of our data structure
(users in an array) and returning a new array with the transformed elements.

>>> Note: DRY is a useful principle when applied sensibly. Always try to
discern between essential and accidental duplication before mindlessly
attempting to DRY out code. We could keep going refactoring this, and extract
the Date transformation function so that it works for any formatted Date
string. If it is worth doing, and its implementation is left as an exercise to
the reader.

There is an abstraction hiding in plain sight, meet your new favorite toy,
`map`:

```typescript
import * as A from 'fp-ts/lib/Array';
import * as assert from 'assert';

const mapUserToSidebarView = A.map(userToSidebarView);
const mapUserToAdminCard = A.map(userToAdminCard);
```

`map` is a higher order function, which means that it takes a function as
argument and returns a new function that was modifed in a certain way.  Before
we try to understand how it works, we can show that the new, mapped functions
are equivalent to the old functions:

```typescript
assert.deepStrictEqual(mapUserToSidebarView(users), usersToSidebarView(users));
assert.deepStrictEqual(mapUserToAdminCard(users), usersToAdminCard(users));
```

>>> Note: `map` exists for many data structures (which we will have a look at
in future chapters), but here we're using the `Array` variety.

`map` is very generic, in that it does not really care which function you pass
in, as long as it takes some argument and returns a new value. Here is a much
simpler example of a function you can `map`:

```typescript
const words = ['Hey', 'Ho', "Let's Go"];

const f = (x: string) => `${x}!`;
const mapF = A.map(f);

assert.deepStrictEqual(
  mapF(words),
  ['Hey!', 'Ho!', "Let's Go!"],
);
```

Here, the signatures of the functions are:

```typescript
type f = (x: string) => string;
type mapF = (xs: string[]) => string[];
```

Another example:

```typescript
const g = (x: number) => `${x * 10}`;
const numbers = [1, 2, 3, 4, 5];

const mapG = A.map(g);
assert.deepStrictEqual(mapG(numbers), ['10', '20', '30', '40', '50']);
```

The signatures are:

```typescript
type g = (x: number) => string;
type mapG = (xs: number[]) => string[];
```

`map` itself has a curious signature:

```typescript
type map = (fab: (a: A) => B) => A[] => B[];
```

Don't worry if you don't understand the signature yet, we'll explain this in
detail in the next chapter. For now, simply recognize the pattern when
comparing the signatures of the original and the mapped functions:

| function               | input type | output type |
|------------------------|------------|-------------|
| f                      | string     | string      |
| map(f)                 | string[]   | string[]    |
| g                      | number     | string      |
| map(g)                 | number[]   | string[]    |
| userToSidebarView      | User       | User        |
| map(userToSidebarView) | User[]     | User[]      |
| userToAdminCard        | User       | User        |
| map(userToAdminCard)   | User[]     | User[]      |

We say that `map` is "lifting" a function into a different context, here
specifically the `Array` context, _without having to rewrite the original
function_.

>>> Note: Try to build an intuition by replacing any loops in your programs
meant to iterate over an array with `map`.

Apparently, our apps user base grows. We're up to ten users in total now:

```typescript
const users: User[] = [
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
    {firstName: 'Seline', lastName: 'Xanathu', registered: '12.01.2019'},
    {firstName: 'Friedrich', lastName: 'Tischler', registered: '12.14.2019'},
    {firstName: 'Kyōko', lastName: 'Zbygněv', registered: '12.14.2019'},
    {firstName: 'Miguelito', lastName: 'Aada', registered: '12.17.2019'},
    {firstName: 'Mehveş', lastName: 'Badem', registered: '12.31.2019'},
    {firstName: 'Goeffrey', lastName: 'Dorr', registered: '01.01.2020'},
];
```

Sales wants us to generate a list of all users that registered in December 2019.
We've just learned that defining our function for the _simple_ case is ­ well ­ simpler.
So let's start there. Let's define a function that asserts that a user registered in December 2019:

```typescript
const didRegisterInDecember2019 = (user: User) =>
    new Date(user.registered) >= new Date('2019.12.01') &&
    new Date(user.registered) <= new Date('2019.12.31');
```

Ugh, lots of red flags here; hard coded dates, function still relies on the
badly formatted user data, etc. pp. But my coffee cup claims we're agile, so
let's verify that we solved the problem at hand and keep moving:

```typescript
assert.strictEqual(didRegisterInDecember2019(users[3]), false);
assert.strictEqual(didRegisterInDecember2019(users[4]), true);
assert.strictEqual(didRegisterInDecember2019(users[8]), true);
assert.strictEqual(didRegisterInDecember2019(users[9]), false);
```

>>> Note: We have defined what is commonly called a "predicate" function.  A
predicate takes any value and returns a boolean. You have undoutedly used and
written many already.  Conventionally predicates are prefixed with `is`, `has`,
`did`, `was` to signal an assertion about the input value.

Nice, onto applying our function to the list! Meet `filter`. Like `map`,
`filter` is another higher order function. It takes a predicate function and
returns a function that filters a list using that predicate. In our case, we're
getting a function that goes through `users` and only leaves those registered
in December 2019. 

```typescript
import * as A from 'fp-ts/lib/Array';

const toSalesView = A.filter(registeredInDec2019);
```

If we were to write above function by hand, it would look something like:

```typescript
const toSalesView = (users: User[]) => {
    const _users = [];
    for (const user of users) {
        if (registeredInDec2019(user)) {
            _users.push(user);
        }
    }
    return _users;
};
```

Again, we can verify that it works:

```typescript
assert.deepStrictEqual(toSalesView(users), [
    users[1],
    users[4],
    users[5],
    users[6],
    users[7],
    users[8],
]);
```

>>> Note: The prolific reader may recognize that `map` and `filter` are
built-in methods on the `Array` data structure and may wonder why we aren't
using those. A great question, which will be answered in the composition
chapter! Have patience!

## Next Up

TODO
