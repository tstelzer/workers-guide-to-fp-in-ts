---
slug: functions-as-values
parent: the-road-to-composition
order: 2
title: Functions as values
state: outline
---

### Summary

In this chapter we're discovering that we can use functions as values and
having a look at two higher-order functions: `map` and `filter`. If you
already know about higher order functions and have built an intuition for `map`
and `filter` you can skip this chapter.

### Refactoring with map

At the end of the last chapter I promised an opportunity for refactoring.

> Note: *Refactoring* is defined as changing the structure and organization of
code -- without breaking expected behaviour of the program -- with the goal of
improving readability, maintainability and reducing overall complexity.

First, let's have a quick look at the status quo:

```typescript
const users = [
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
    {firstName: 'Damian', lastName: 'Sipes', registered: '12.12.2001'},
    {firstName: 'Mara', lastName: 'Homenick', registered: '08.14.2007'},
];

type User = {
    firstName: string;
    lastName: string;
    registered: string;
    shortName?: string;
    initials?: string;
};

const usersToAdmin = (users: User[]) => {
    const result = [];
    for (const user of users) {
        result.push({
            ...user,
            registered: new Date(user.registered).toLocaleDateString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            initials: `${user.firstName[0]}${user.lastName[0]}`,
        });
    }
    return result;
};

const usersToSidebar = (users: User[]) => {
    const result = [];
    for (const user of users) {
        result.push({
            ...user,
            registered: user.registered.slice(6),
            shortName: `${user.firstName[0].toLowerCase()}.${user.lastName.toLowerCase()}`,
        });
    }
    return result;
};
```

To identify opportunities for refactoring, you can ask ourself a couple of
questions. The first question -- the one that seems to be hammered into
programmers from day one -- is: Am I repeating myself needlessly?

> Note: "Dont't Repeat Yourself", or "DRY" is a useful principle when applied
sensibly. Always try to discern between essential and accidental duplication
before mindlessly attempting to DRY out code.

Comparing our two functions, we can see a pattern:

1. Create an empty array that will be populated and serve as the output value.
2. For each value in the input ...
3. Transform the value ...
    1. For `usersToAdmin`, localize `registered` and derive `initials`.
    2. For `usersToSidebar`, derive the year in `registered` and derive `shortName`.
5. Add the transformed value to the output array.
6. Return the output array.

Note how all steps are identical, **except for the third step**: the
transformation of individual user values is different. If we could _extract_
those steps (3-1 and 3-2), we could formalize the "iterate over the
array" aspect.

First, let's extract the "business logic" into functions:

```typescript
const userToAdmin = (user: User): User => ({
    ...user,
    registered: new Date(user.registered).toLocaleDateString('en-gb', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }),
    initials: `${user.firstName[0]}${user.lastName[0]}`,
});

const userToSidebar = (user: User): User => ({
    ...user,
    registered: user.registered.slice(6),
    shortName: `${user.firstName[0].toLowerCase()}.${user.lastName.toLowerCase()}`,
});
```

Here we've simplified the business logic so that it is defined for a _single
user_, instead of a _list of users_. Now, let's use them in the original functions:

```git
 const usersToAdmin = (users: User[]) => {
     const result = [];
     for (const user of users) {
-        result.push({
-           ...user,
-           registered: new Date(user.registered).toLocaleDateString('en-gb', {
-               weekday: 'long',
-               year: 'numeric',
-               month: 'long',
-               day: 'numeric',
-           }),
-           initials: `${user.firstName[0]}${user.lastName[0]}`,
-        });
+        result.push(userToAdmin(user));
     }
     return result;
 };
 
 const usersToSidebar = (users: User[]) => {
     const result = [];
     for (const user of users) {
-        result.push({
-            ...user,
-            registered: user.registered.slice(6),
-            shortName: `${user.firstName[0].toLowerCase()}.${user.lastName.toLowerCase()}`,
-        });
+        result.push(userToSidebar(user));
     }
     return result;
 };
```

Now it should be obvious which part of the code can be generalized: everything
but the specific function call. So, how can we generalize this code? By
defining the function as a parameter of course. In TypeScript (i.e. JavaScript)
functions are values and call be passed as arguments to other functions. Let's
first build an intuition for that with simple functions.


```typescript
function emphasise(s: string): string;
function emphasise(s) {
    return `_${s}_`;
}

function timesTen(n: number): number;
function timesTen(n) {
    return n * 10;
}
```

> Note: We're using the `function` syntax here to separate the type declaration
from the implementation to make a point later.

* pass as general f

```typescript
const transformUsers = (f: (user: User) => User, users: User[]) => {
    const result = [];
    for (const user of users) {
        result.push(f(user));
    }
    return result;
};
```

Instead of hardcoding the transformation, we're asking the caller of
`transformUsers` to supply the transformation as an argument. This works as
long as the caller passes a function that has the signature `f: (user: User) => User`.
Now we have to simplify `userToAdmin` and `userToSidebar`, so that they
fit the signature of `f` and work for a _single_ `User` ...

... so we can use them like ...

```typescript
const sidebarUsers = transformUsers(userToSidebar, users);
const adminUsers = transformUsers(userToAdmin, users);

console.log({sidebarUsers, adminUsers});
```

```json5
{
  sidebarUsers: [
    {
      firstName: 'Barbara',
      lastName: 'Selling',
      registered: '2017',
      shortName: 'b.selling'
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      registered: '2019',
      shortName: 'j.smith'
    },
    {
      firstName: 'Frank',
      lastName: 'Helmsworth',
      registered: '2011',
      shortName: 'f.helmsworth'
    },
    {
      firstName: 'Anna',
      lastName: 'Freeman',
      registered: '2003',
      shortName: 'a.freeman'
    },
    {
      firstName: 'Damian',
      lastName: 'Sipes',
      registered: '2001',
      shortName: 'd.sipes'
    },
    {
      firstName: 'Mara',
      lastName: 'Homenick',
      registered: '2007',
      shortName: 'm.homenick'
    }
  ],
  adminUsers: [
    {
      firstName: 'Barbara',
      lastName: 'Selling',
      registered: 'Tuesday, 3 January 2017',
      initials: 'BS'
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      registered: 'Tuesday, 24 December 2019',
      initials: 'JS'
    },
    {
      firstName: 'Frank',
      lastName: 'Helmsworth',
      registered: 'Wednesday, 11 May 2011',
      initials: 'FH'
    },
    {
      firstName: 'Anna',
      lastName: 'Freeman',
      registered: 'Wednesday, 9 July 2003',
      initials: 'AF'
    },
    {
      firstName: 'Damian',
      lastName: 'Sipes',
      registered: 'Wednesday, 12 December 2001',
      initials: 'DS'
    },
    {
      firstName: 'Mara',
      lastName: 'Homenick',
      registered: 'Tuesday, 14 August 2007',
      initials: 'MH'
    }
  ]
}
```

We have somewhat generalized the "iterate over users" concern, and extracted
and simplified the business logic without breaking the code. Great!

But we're not done yet. We've only generalized `transformUsers` for any function
that *takes a user and returns a user*, but why stop there? As it so happens, a
lot of programs iterate over arrays, applying functions to each element.
Can we generalize the function even more?

We don't have to, as this function already exists: `map`. Unlike our
`transformUsers`, which only works for functions `f: (user: User) => User`,
`map` works for _any_ function `f: <A, B>(a: A) => B`, where `A` and `B` are [generics](http://www.typescriptlang.org/docs/handbook/generics.html).

> Note: In a nutshell, generics are place holder types, or type variables that
stand in for a concrete type that TypeScript derives once it is used. For
example, if you define a function with a signature `f: <A>(a: A) => A` and use
it like `f('Hello, World!')`, TypeScript infers `A` to be a `string`, so the
concrete signature would be derived as `f: (a: string) => string`. If you used
it like `f(42)` it would be derived as `f: (a: number) => number`, and so on.

JavaScript has `map` [built-in](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) as a method on arrays: it applies the passed
function `f` to every element in a copy of the array and returns the copy. We
can use that to replace `transformUsers` entirely:

```typescript
const usersToSidebar = (users: User[]) => users.map(userToSidebar);
const usersToAdmin = (users: User[]) => users.map(usersToAdmin);

const sidebarUsers = usersToSidebar(users);
const adminUsers = usersToAdmin(users);
console.log({sidebarUsers, adminUsers});
```

```json5
{
  sidebarUsers: [
    {
      firstName: 'Barbara',
      lastName: 'Selling',
      registered: '2017',
      shortName: 'b.selling'
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      registered: '2019',
      shortName: 'j.smith'
    },
    {
      firstName: 'Frank',
      lastName: 'Helmsworth',
      registered: '2011',
      shortName: 'f.helmsworth'
    },
    {
      firstName: 'Anna',
      lastName: 'Freeman',
      registered: '2003',
      shortName: 'a.freeman'
    },
    {
      firstName: 'Damian',
      lastName: 'Sipes',
      registered: '2001',
      shortName: 'd.sipes'
    },
    {
      firstName: 'Mara',
      lastName: 'Homenick',
      registered: '2007',
      shortName: 'm.homenick'
    }
  ],
  adminUsers: [
    {
      firstName: 'Barbara',
      lastName: 'Selling',
      registered: 'Tuesday, 3 January 2017',
      initials: 'BS'
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      registered: 'Tuesday, 24 December 2019',
      initials: 'JS'
    },
    {
      firstName: 'Frank',
      lastName: 'Helmsworth',
      registered: 'Wednesday, 11 May 2011',
      initials: 'FH'
    },
    {
      firstName: 'Anna',
      lastName: 'Freeman',
      registered: 'Wednesday, 9 July 2003',
      initials: 'AF'
    },
    {
      firstName: 'Damian',
      lastName: 'Sipes',
      registered: 'Wednesday, 12 December 2001',
      initials: 'DS'
    },
    {
      firstName: 'Mara',
      lastName: 'Homenick',
      registered: 'Tuesday, 14 August 2007',
      initials: 'MH'
    }
  ]
}
```

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

When passing a function to `map`, we say that `map` is "lifting" the function
into the array context. The passed function knows nothing of the context it is
used in. By using `map`, we can greatly simplify our business logic and
separate it from concerns of iterating over our data structures.

> Note: `map` happens to be quite a generic function, in later chapters we'll
discover that a most data types in `fp-ts` support `map`.

### Intermission

In the cold glare of the overhead office lights, a street urchin approaches you
with another slip of paper. Strange, how management decides to distribute
tickets these days. You assume Jira is broken again. You can barely discern the
contents under all the dirt:

```
We need a list of all users
* that registered after January 2015
* with surnames from a to g, but excluding c
```

Straight to the point. You too distrust those with family names starting with
c. Strange folk.

As you are checking out the latest data, you discover that the user count as
increased: 

```json5
[
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
    {firstName: 'Damian', lastName: 'Sipes', registered: '12.12.2001'},
    {firstName: 'Mara', lastName: 'Homenick', registered: '08.14.2007'},
    {firstName: 'Preston', lastName: 'Brekke', registered: '2020.02.12'},
    {firstName: 'Matilda', lastName: 'Gorczany', registered: '2019.12.16'},
    {firstName: 'Matteo', lastName: 'Hauck', registered: '2020.03.09'},
    {firstName: 'Marielle', lastName: 'Treutel', registered: '2020.02.28'},
    {firstName: 'Elaina', lastName: 'Braun', registered: '2019.12.16'},
    {firstName: 'Alessandro', lastName: 'Hammes', registered: '2019.12.13'},
    {firstName: 'Rozella', lastName: 'Beier', registered: '2019.12.26'},
    {firstName: 'Molly', lastName: 'Koelpin', registered: '2019.12.01'},
    {firstName: 'Cleveland', lastName: 'Calvarro', registered: '2020.03.04'},
]
```

### Introducing filter

Before we do any advanced shananigans, let's write the straight forward code
(though we'll treat the data as immutable, as we learned in the previous
chapter):

```typescript
const users: User[] = [
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
    {firstName: 'Damian', lastName: 'Sipes', registered: '12.12.2001'},
    {firstName: 'Mara', lastName: 'Homenick', registered: '08.14.2007'},
    {firstName: 'Preston', lastName: 'Brekke', registered: '2020.02.12'},
    {firstName: 'Matilda', lastName: 'Gorczany', registered: '2019.12.16'},
    {firstName: 'Matteo', lastName: 'Hauck', registered: '2020.03.09'},
    {firstName: 'Marielle', lastName: 'Treutel', registered: '2020.02.28'},
    {firstName: 'Elaina', lastName: 'Braun', registered: '2019.12.16'},
    {firstName: 'Alessandro', lastName: 'Hammes', registered: '2019.12.13'},
    {firstName: 'Rozella', lastName: 'Beier', registered: '2019.12.26'},
    {firstName: 'Molly', lastName: 'Koelpin', registered: '2019.12.01'},
    {firstName: 'Cleveland', lastName: 'Calvarro', registered: '2020.03.04'},
];

const usersToSalesView = (users: User[]) => {
    const characters = ['a', 'b', 'd', 'e', 'f', 'g'];
    const result = [];
    for (const user of users) {
        if (
            new Date(user.registered) >= new Date(2015, 0, 1) &&
            characters.includes(user.lastName[0].toLowerCase())
        ) {
            result.push(user);
        }
    }
    return result;
};

console.log(usersToSalesView(users));
```

```json5
[
  { firstName: 'Preston', lastName: 'Brekke', registered: '2020.02.12' },
  { firstName: 'Matilda', lastName: 'Gorczany', registered: '2019.12.16' },
  { firstName: 'Elaina', lastName: 'Braun', registered: '2019.12.16' },
  { firstName: 'Rozella', lastName: 'Beier', registered: '2019.12.26' }
]
```

> Note: The thoughtful reader might notice that the condition is somewhat
unsafe, as we're expecting the `lastName` _always_ to have a 0th index. We will
address that problem in a later chapter.

Seems to work. But again, we're conflating the business logic ("filter
registered after January 2015" and "filter last name starting with a to g,
excluding c") with iterating over the user array. To fix that -- like we did
with our previous refactoring -- we extract the core logic into a function:

```typescript
const isRelevantForSales = (user: User): boolean =>
    new Date(user.registered) >= new Date(2015, 0, 1) &&
    ['a', 'b', 'd', 'e', 'f', 'g'].includes(user.lastName[0].toLowerCase());

const usersToSales = (users: User[]) => {
    const result = [];
    for (const user of users) {
        if (isRelevantForSales(user)) {
            result.push(user);
        }
    }
    return result;
};
```

Ignore for now that the name of the function is a bit obscure and notice again
the pattern: We're iterating over our users again, though this time we're not
_transforming_ the user, we're _filtering_ them based on a predicate function
`isRelevantForSales`. By the way, when we say _predicate function_, we mean
_any_ function taking a value that resolves to a `boolean` value. For example,
all of the following functions are considered preciate functions as they all
have the generalized function signature of `<A>(a: A) => boolean`.

```typescript
const startsWithC = (s: string): boolean => s.startsWith('c');

const moreThanThreeDigits = (n: number): boolean => n.toString().length > 3;

const afterMoonLanding = (d: Date): boolean => d > new Date(1969, 6, 20);
```

And again, as with `map`, we don't have to re-invent the wheel: `filter` abstracts
away the concern of "iterate over an array and filter values based on a predicate".
It too is a built-in method on `Array`, so we can use it to replace `usersToSales`:

```typescript
const salesToUsers = (users: User[]) => users.filter(isRelevantForSales);

const salesUsers = salesToUsers(users);
console.log(salesUsers);
```

```json5
[
  { firstName: 'Preston', lastName: 'Brekke', registered: '2020.02.12' },
  { firstName: 'Matilda', lastName: 'Gorczany', registered: '2019.12.16' },
  { firstName: 'Elaina', lastName: 'Braun', registered: '2019.12.16' },
  { firstName: 'Rozella', lastName: 'Beier', registered: '2019.12.26' }
]
```

## Next Up
