---
slug: pure-functions
parent: the-road-to-composition
order: 1
title: Pure Functions
state: draft
---

"You wonder if Velod is still making that mead with juniper berries mixed in..."

### Summary

We are starting small. Before we explore any advanced patterns of functional
programming, we're looking at the fundamental and essential building block that
defines the paradigm: the pure function. Exploring a simple problem, we'll
refactor an initially imperative solution to be more functional.

If you are already familiar with the idea of pure functions and immutability,
you can safely skip this chapter.

### Something something user

Alright. Let's have a look at the data.

```json5
[
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
    {firstName: 'Damian', lastName: 'Sipes', registered: '12.12.2001'},
    {firstName: 'Mara', lastName: 'Homenick', registered: '08.14.2007'},
];
```

Ah, glancing at the `registered` field we can see that it was stored
as a US-formatted string, `MONTH.DAY.YEAR`, or `MM.DD.YYYY`, if you are
familiar with [date field notation](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
The view needs it in a different format though, something like `Wednesday, 9 July 2003`,
or `EEEE, d MMMM YYYY`. Before we go about and create our view
model, we'll capture the _structure_ of our data in a type.

```typescript
type User {
    firstName: string;
    lastName: string;
    registered: string;
}
```

Unlike in classical object-oriented programming (OOP), where designs tend to
combine data, behaviour, state and identity, in the style of functional
programming that we will learn as part of this series of tutorials, we clearly
distinguish and separate these.

When we see a type, we don't mean an "an instance of a class", we mean "a piece
of data that matches a certain structure" (think "struct", if you are familiar
with that term). In our specific case, any data that matches its structure can
be considered a `User`.

Think one of those toys that
seem to be sold exclusively to doctors waiting rooms, where children are
supposed to match wooden blocks in various shapes (stars, circles, rectangles)
to their corresponding holes. If the block matches the "star" hole, for all
intents and purposes, its a star.

This kind of type system is called [structural sub typing](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).
It means that the type of a thing is not defined by its place of declaration or
internal name (as is the case in nominal typed languages like Java or C#), but
by its properties. This means that the same piece of data can match many types.

> Note that as of writing this, there is an open discussion [whether to introduce nominal typing to TypeScript](https://github.com/Microsoft/TypeScript/issues/202).

Let's have a look at an example: We can explicitly tell TypeScript which shape
we're expecting this object, `damian`, to have. If the structure wouldn't match
the type, TypeScript would yell at us.

```typescript
const damian: User = {
    firstName: 'Damian',
    lastName: 'Sipes',
    registered: '12.12.2001',
};
```

Just to re-iterate, we're not _instantiating_ a `User` here, we're just giving
a type hint. `damian` is just labeled data. Poor Damian. To show the use,
let's define a function that explicitly takes a user and returns its
`firstName`.

```typescript
const firstName = (user: User): string => user.firstName;

console.log(firstName(damian));
```

```json5
Damian
```

Damians friend Mara doesn't want to be labeled:

```typescript
const mara = {
    firstName: 'Mara',
    lastName: 'Homenick',
    registered: '08.14.2007',
};
```

TypeScript doesn't care, `mara` matches the shape of a `User`, so the following
code is perfectly valid and reasonable:

```typescript
console.log(firstName(mara));
```

```json5
Mara
```

Yet another friend of theirs, Anna, does not feel like a `User` _at all_,
they're off, creating their own type, with black jack and hookers:

```typescript
type Person = {
    firstName: string;
    lastName: string;
    registered: string;
};

const anna: Person = {
    firstName: 'Anna',
    lastName: 'Freeman',
    registered: '07.09.2003',
};
```

But, if it has a `firstName`, a `lastName` and `registered`, it can be used
like a `User`.

```typescript
console.log(firstName(anna));
```

```json5
Anna
```

Noteworthy: Our function doesn't even need to take a `User`, we only really
care about the `firstName` property, so we can
[destructure](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#function-declarations)
it from the input. Now we've signaled to the caller that we care _even less_
about the label of the input, as long as it contains a `firstName` of type
`string`.

```typescript
const firstName = ({firstName}: {firstName: string}): string => input.firstName;
console.log(firstName(anna));
```

```json5
Anna
```

How concrete or general we are in defining our input types is entirely up to us. Each
comes with benefits and trade offs we will explore in chapters to come.

### Procedural impurity and shared complexity

Before we write our own model, let's have a look at Jims code.

```git
 type User = {
     firstName: string;
     lastName: string;
     registered: string;
+    shortName?: string;
 };
+
+const usersToSidebar = () => {
+    for (const user of users) {
+        // get the year, e.g. '2003'
+        user.registered = user.registered.slice(6);
+        // e.g. 'a.smith'
+        user.shortName = `${user.firstName[0].toLowerCase()}.${user.lastName.toLowerCase()}`;
+    }
+};
+
+usersToSidebar();
```

We didn't really listen in the stand-up, so we don't know precisely what Jims
feature is supposed to do, but we can assume from the comments. Let's have a
look at the result.

```typescript
console.log(users);
```

```json5
[
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
]
```

This may work for Jim, but we have a problem. Jims _procedure_ freely mutates
the data (i.e. changes it in place). If we want to derive our own view model
from `users`, we would have to do it _before Jims procedure runs_, otherwise
his mutation of specifically the `registered` field makes it impossible to
derive our own transformation of the field.

> Note: We're intentionally calling `usersToSidebar` a _procedure_. There is a
critical difference between a _function_ and a _procedure_. A _function_
merely takes values as inputs and returns values as outputs -- all without
affecting its environment, e.g. by changing inputs in-place. A _procedure_ may
run a series of statements, changing its environment, its inputs, having side
effects other than returning values.

Let's explore this issue a bit more. We'll define our own model-deriving
_procedure_ and see what happens.

First, we extend `User` with an optional `initials` field.

```git
 type User = {
     firstName: string;
     lastName: string;
     registered: string;
     shortName?: string;
+    initials?: string;
 };
```

Then we're adding our own _procedure_ and execute it _after_ Jims.

```typescript
const usersToAdmin = () => {
    for (const user of users) {
        // resolves to format: EEEE, d MMMM YYYY
        // e.g. "Wednesday, 20 June 2019"
        user.registered = new Date(user.registered).toLocaleDateString(
            'en-gb',
            {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            },
        );
        // e.g. 'AF'
        user.initials = `${user.firstName[0]}${user.lastName[0]}`;
    }
};

usersToSidebar();
usersToAdminView();

console.log(users);
```

```json5
[
  {
    firstName: 'Barbara',
    lastName: 'Selling',
    registered: 'Sunday, 1 January 2017',
    shortName: 'b.selling',
    initials: 'BS'
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    registered: 'Tuesday, 1 January 2019',
    shortName: 'j.smith',
    initials: 'JS'
  },
  {
    firstName: 'Frank',
    lastName: 'Helmsworth',
    registered: 'Saturday, 1 January 2011',
    shortName: 'f.helmsworth',
    initials: 'FH'
  },
  {
    firstName: 'Anna',
    lastName: 'Freeman',
    registered: 'Wednesday, 1 January 2003',
    shortName: 'a.freeman',
    initials: 'AF'
  },
  {
    firstName: 'Damian',
    lastName: 'Sipes',
    registered: 'Monday, 1 January 2001',
    shortName: 'd.sipes',
    initials: 'DS'
  },
  {
    firstName: 'Mara',
    lastName: 'Homenick',
    registered: 'Monday, 1 January 2007',
    shortName: 'm.homenick',
    initials: 'MH'
  }
]
```

Yikes, look at `registered`. Seems they are all fixed on `1 January` because
_our_ procedure transforms `registered` _after_ it was cut down to just the
year by `usersToSidebar`. Let's flip the order of invocation, just to see if
that would fix it.

```git
-usersToSidebar();
 usersToAdminView();
+usersToSidebar();

 console.log(users);
```

```json5
[
  {
    firstName: 'Barbara',
    lastName: 'Selling',
    registered: 'y, 3 January 2017',
    initials: 'BS',
    shortName: 'b.selling'
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    registered: 'y, 24 December 2019',
    initials: 'JS',
    shortName: 'j.smith'
  },
  {
    firstName: 'Frank',
    lastName: 'Helmsworth',
    registered: 'day, 11 May 2011',
    initials: 'FH',
    shortName: 'f.helmsworth'
  },
  {
    firstName: 'Anna',
    lastName: 'Freeman',
    registered: 'day, 9 July 2003',
    initials: 'AF',
    shortName: 'a.freeman'
  },
  {
    firstName: 'Damian',
    lastName: 'Sipes',
    registered: 'day, 12 December 2001',
    initials: 'DS',
    shortName: 'd.sipes'
  },
  {
    firstName: 'Mara',
    lastName: 'Homenick',
    registered: 'y, 14 August 2007',
    initials: 'MH',
    shortName: 'm.homenick'
  }
]
```

Oof. Broken. What we're seeing here is the cost of **shared, mutable
state**. In our procedures we are reaching into the global scope and changing
data in place that is used in other places. We're not preserving the integrity
of the data. Like a spoiled toddler, we're rampaging through the sweets section
of the supermarket, trained on that unearned treat, leaving a trail of
destruction in our wake.

And we've introduced another problem on the type level: because we keep changing
our original data _in place_, we have to stuff all our new fields into the
original type. `User` would grow in size if we kept adding new fields for
totally unrelated views.

We can imagine that writing an entire application in this style of unmanaged
state mutation is an explosion of complexity.

Fortunately, we have a simple solution at hand: the function. Specifically, the
**pure** function.

### Out of the tar pit

Know what is fundamentally simple? A table:

| key | value |
|-----|-------|
| a   | 1     |
| b   | 99    |
| c   | 1000  |
| d   | 99999 |

So simple and so utterly boring. It's so dull, I hesitate to talk about it. But
we need to, in order to make a point. So here we go:

* This table has two columns, a key and a value column.
* We can look up values via its key.
* Though the rows may _grow_, at the time of accessing it, all values and their
  types are known.

Know what behaves like a table? A pure function!

```typescript
const f = (key: 'a' | 'b' | 'c' | 'd') =>
    key === 'a' ? 1
    : key === 'b' ? 99
    : key === 'c' ? 1000
    : 99999;
```

* The pure function has two sets of values, input (`'a' | 'b' | 'c' | 'd'`)
  and output (`1 | 99 | 1000 | 99999`).
* We can look up output values by passing input values
* Though we may add values to input and output sets, at the time of accessing
  it, all values and their types are known.

Noteworthy, a function like this does not share any of the problems of
procedures:

* It does not reach into its parent scope, all dependencies of it are declared
  right there in the parameters.
* It does not mutate the values it is working with, it effectively only _maps_
  outputs to inputs.
* If you run it, you don't need to fear side effects. It just returns values.

If we can somehow rewrite our problematic procedures so that we get these
benefits we have improved the comprehensibility of our program immensely.
It is quite simple, actually:

1. Instead of reaching into the parent scope, explicitly define inputs as parameters.
2. Instead of mutating inputs, treat them as immutable data and create copies.
3. Instead of storing the outputs in shared state, return them.

Let's do that for `usersToAdmin` and `usersToSidebar`:

```typescript
const usersToAdmin = (users: User[]) => {
    const result = [];
    for (const user of users) {
        result.push({
            ...user,
            // resolves to format: EEEE, d MMMM YYYY
            // e.g. "Wednesday, 20 June 2019"
            registered: new Date(user.registered).toLocaleDateString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            // e.g. 'AF'
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
            // get the year, e.g. '2003'
            registered: user.registered.slice(6),
            // e.g. 'a.smith'
            shortName: `${user.firstName[0].toLowerCase()}.${user.lastName.toLowerCase()}`,
        });
    }
    return result;
};

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

Gorgeous. And the original data is untouched:

```typescript
console.log(users);
```

```json5
[
  {
    firstName: 'Barbara',
    lastName: 'Selling',
    registered: '01.03.2017'
  },
  { firstName: 'John', lastName: 'Smith', registered: '12.24.2019' },
  {
    firstName: 'Frank',
    lastName: 'Helmsworth',
    registered: '05.11.2011'
  },
  { firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003' },
  { firstName: 'Damian', lastName: 'Sipes', registered: '12.12.2001' },
  { firstName: 'Mara', lastName: 'Homenick', registered: '08.14.2007' }
]
```

Our functions are now practically pure (not _technically_ pure, but pure for
all we care about right now). We can run them in any order, repeatedly. They
will return the same values every time.

We can also fix the type issue we talked about: Instead of stuffing fields into
the `User` type, we can make our new models _explicit_ by defining separate
types for them:

```typescript
type AdminUser = User & {
    initials: string;
};

type SidebarUser = User & {
    shortName: string;
};
```

And adding them to our function signatures:

```git
-const usersToAdmin = (users: User[]) => {
+const usersToAdmin = (users: User[]): AdminUser[] => {

-const usersToSidebar = (users: User[]) => {
+const usersToSidebar = (users: User[]): SidebarUser[] => {
```

> Note: We're being somewhat naive here, forcing immutability by aggressively
> copying data. While individually, the cost is small, in a large application
> the memory overhead _will_ add up. We _can_ alleviate some of the cost by
> using libraries that provide data structures made specifically for enabling
> immutability (such as [immer.js](https://www.npmjs.com/package/immer)).
> Other languages, such as Haskell, Rust or Clojure enable immutable data by
> design, and offer built-in solutions for effecient, immutable programs. For
> the purposes of this tutorial though, the memory overhead is a trade-off we
> are willing to make.

There is lots of opportunity for refactoring here which we will
explore in the very next chapter, but we can be happy with the progress we've
made so far!

### Next Up

In the next chapter we will refactor our code, removing redundancies by
exploring the idea of using functions as values.
