---
title: Pure functions
---

## Summary

TODO

## Pure functions are like maps

Let me tell you about my favorite data structure: the map. There are plenty
variations of this data structure, Python has its dictionaries, Clojure maps,
and in JavaScript we actually have two built-in: plain objects and
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
They all have subtle differences, but what they all have in common is that you
can visualize them like a table:

| key | value |
|-----|-------|
|   a | 1     |
|   b | 2     |
|   c | 3     |
|   d | 4     |

```typescript
const map = { a: 1, b: 2, c: 3, d: 4 }
```

It is so useful, yet so simple. If you want to find a value in the second
column, look it up by its key in the first column. Looking up a value by its
key will always give you the same value.

Pure functions are like Maps. A pure function will map input values to output
values in exactly the same way.

```typescript
const f = (arg: 'a' | 'b' | 'c' | 'd') =>
  arg === 'a' ? 1
  : arg === 'b' ? 2
  : arg === 'c' ? 3
  : arg === 'd' ? 4;
```

| arg | f(arg) |
|-----|--------|
| a   | 1      |
| b   | 2      |
| c   | 3      |
| d   | 4      |

In fact, you could replace any pure function with a map.

```typescript
f('a') === map['a']
```

And, the same way you can replace any _pure function_ with a map, you can
replace any _invocation_ of that pure function with the value it returns.
We call this property "referential transparency".

```typescript
f('a') === 1;
```

The only way we can guarantee referential transparency is by making sure that
we avoid changing our function inputs in place ("mutating"), and avoid doing
anything other than returning a value, commonly known as "avoiding side
effects". Side effects include:
* doing any IO, like reading or writing to the file system or sending data via
  the network
* reading or writing variables from and to any other scope than the function scope
* mutating function arguments

## A practical example

Let's have a look at example code. We're building an app where we have a bunch
of users that we want to display in a view. Exciting stuff, I know!

```typescript
type User = {
    firstName: string;
    lastName: string;
    registered: string;
};

const users: User[] = [
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
];
```

At some point someone decided to save the registration date in US format, i.e.
`MM.DD.YYYY`. Our task is to prepare the data to be displayed in the side bar
view in a sane format. We're not allowed to touch the original data. It is
sacred!

```typescript
/**
 * Prepares users for the side bar. Changes the registered date of users to
 * UTC, e.g. 'Sat, 18 Jan 2020 10:00:00 GMT'
 */
const usersToSidebarView = () => {
    for (const user of users) {
      user.registered = new Date(user.registered).toLocaleDateString('en-gb', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
};

usersToSidebarView();
console.log(users);
```

I guess this works. We added documentation and everything.

But as it so happens, we're not working alone on this project. Our colleague
has a task of their own, preparing the same data for a different view: a user
profile card in the admin section. Or something. We didn't listen in the stand
up.

```typescript
/**
  * Changes the registered date of users to YYYY format, e.g. '2001'.
  */
const usersToAdminCard = (users: User[]) => {
    for (const user of users) {
        user.registered = user.registered.slice(6);
    }
    return users;
};

console.log(usersToAdminCard(users));
```

Oops. Guess we broke each others code. Depending on whos function runs
_first_, the _others_ view is broken. When `usersToSidebarView` runs first,
`usersToAdminCard` will return garbage. When `usersToAdminCard` runs first,
`usersToSidebarView` will always be set to January 1st of that year.

What we're seeing here is the **cost of shared, global state**. In our function
we are arrogantly reaching into the global scope and mutating shared state.
Even though our colleague thought of defining the users as explicit parameters
and returning them, they fell into the same trap.

The fundamental problem here is that we're not preserving the integrity of the
data. Like a spoiled toddler, we're rampaging through the sweets section of the
supermarket, laser-focused on that unerned treat, leaving a trail of
destruction in our wake.

We can actually, easily, verify that we have a problem by running both
functions _twice_ over the same data. As you may recall, our definition of a
_pure function_ said that it will always return the same output for the same
input.

```typescript
console.log(usersToAdminCard(users));
console.log(usersToAdminCard(users));
```

Nope. Breaks. The second invocation returns an empty string for the
`registered` [field](field).

Fortunately, the solution to fixing our code is quite simple:

* Define any values the function is working with as parameters.
* Treat the inputs as immutable data. That is, instead of changing inputs in
   place, making a copy and returning it.

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

Now we can run the functions in _any order_ and _repeatedly_ without corrupting
our global list of users, but the views that require the data will get exactly
the data they need. Wonderful.

```typescript
const viewA = usersToSidebarView(users);
const viewB = usersToAdminCard(users);

// Unlike before, it's fine to run these again, because our functions are pure.
console.log(usersToSidebarView(users));
console.log(usersToAdminCard(users));

// The global users did not change.
console.log(users);
```

There is still opportunity for refactoring here. In general, the smaller the
responsibilities of a function, the more reusable and comprehensible it is. You
may of heard of the saying that "a function should do only one thing", or
something along those lines.

We can apply this proverb by asking ourselves, "Are we doing unnecessary work
here that need not be a responsibility of this function?".

>>> Note: As with any proverb you should not follow the single responsibility
principle blindly, there are good reasons for functions to "do more than one
thing".

The answer is yes, we are doing unnecessary work:

* We are needlessly low level by explicitly looping over the list even though
  we have much higher level language semantics available for working with
  lists.
* In fact, we are needlessly defining both functions for a _list of users_,
  instead of a _single user_. With the tools we will learn in the next
  chapters, defining functions for the _simplest_ or _most general_ case
  affords us the highest amount of reusability and comprehensibility.

## Next Up

TODO

In the next chapter we will see how defining a function for the _simplest_ case
(i.e. a single user) simplifies our code and aids in reusability. We will also
start using the first functions `fp-ts` is offering!
