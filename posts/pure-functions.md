---
title: Lovely little function
---

## Summary
## Prelude: Mondays

It's 10AM. The window in the dev room is fogged-up from dozens of steamy cups
of coffee. Barely awake, you wonder if you could have called in sick today.
There is still time, of course, the others wouldn't snitch, you could still make it. You
could creep back under those comforting sheets. The week should really start on
Tuesday, you think. But, regrettably, it is too late. Bright-eyed Bob blows
into the room. All confident and motivated he proclaims:

"Standup!"

Twelve devs sighs sound in harmony. You distrust Mondays.

"So, we're building two new features today."

Bob takes a sip from his mug, which boldly lies "getting shit done".

"We are?", Barbara inquires. "I didn't see any new tickets."

"Well, apparently sales sold it in December. And the client needs it by Friday."

"Ah, well, that's doable I guess." Barbara takes an ironic sip.

"Yeah, no, last Friday. They needed it by last Friday."

"But that is in the past." Jim helpfully interjects.

"Shit happens." Bob raises his hands in defense. You are pretty sure he owns
another coffee cup with the words "shit happens" imprinted. "Sorry guys, you
need to get on this right now. Jim. You need to get onto the side bar ..."

You voice another sigh. Why does this always happen on Monday? You lean on the
window frame and lose yourself in painting little lambdas on the misty glass.
You recall the meeting where your kin swore a blood oath over the _surprisingly_
thin agile manifesto. "Never again", you voices echoed through halls of empty
cubicles. A warcry of misunderstood craftspeople. Where are those blessed days?
When was this? It must have been in the fading days of a past summer.

Or was it last Friday? Actually, yes, you think it was last Friday.

"Tom." Ah. That's you. Better listen. "You need to do the admin section. The
junior wants to build the view, but could you create the model? It should
display ...  um ..." Bob glances on a stained napkin in his hand.
"Registration date in ... long date format. I can't read this. Frank said
something like 'the data is weird'. I don't know what that means. And we need
to display the user initials. Anyways, I'm sure you'll figure it out! I'm
confident you guys can do this, you're all rock stars, after all!".

And with that, Bob marches away. You attempt to take another sip before sitting
down, lamenting the crushed dream of a slow Monday. Alas, the cup is empty. You
wonder if you could configure the corporate calendar so that weeks start on
Tuesdays.

## Something something user

Alright. Let's have a look at the data. It's supposed to be "weird", after all.

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

Ah, glancing at the `registered` field, we can see whats "weird": it was stored
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

When we see a `User` in this context, we don't mean an "an instance of a
class", we mean "a piece of data that fits the shape of a `User` type". Any
data, really, that matches its structure can be considered a `User`. Think one
of those toys that seem to be sold exclusively to doctors waiting rooms, where
children are supposed to match wooden blocks in various shapes (stars, circles,
rectangles) to their corresponding holes. If the block matches the "star" hole,
for all intents and purposes, its a star.

This kind of type system is called [structural sub typing](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).
It means that the type of a thing is not defined by its place of declaration or
internal name (as is the case in nominal typed languages like Java or C#), but
by its properties. This means that the same piece of data can match many types.

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

Damians friend Mara doesn't like to be labeled:

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
care about the `firstName` property, so we can [destructure](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#function-declarations) it from the input.

```typescript
const firstName = (input: {firstName: string}): string => input.firstName;
console.log(firstName(anna));
```

```json5
Anna
```

How concrete or general we are in defining our types is entirely up to us. Each
comes with benefits and trade offs we will explore in chapters to come.

## Procedural impurity

Let's get our junior the data they need. We somehow need to get from our list
of users to a useable view model, we can recall:

1. `registered` needs a different format
2. we need to derive `initials`

Alright, should be simple enough. First, let's extend our `User` type with the
`initials` field. We don't have it _yet_, so we make it optional.

```typescript
type User = {
    firstName: string;
    lastName: string;
    registered: string;
    initials?: string;
};
```

Oh, and let's grab the `users` data for testing purposes:

```typescript
const users: User[] = [
    {firstName: 'Barbara', lastName: 'Selling', registered: '01.03.2017'},
    {firstName: 'John', lastName: 'Smith', registered: '12.24.2019'},
    {firstName: 'Frank', lastName: 'Helmsworth', registered: '05.11.2011'},
    {firstName: 'Anna', lastName: 'Freeman', registered: '07.09.2003'},
    {firstName: 'Damian', lastName: 'Sipes', registered: '12.12.2001'},
    {firstName: 'Mara', lastName: 'Homenick', registered: '08.14.2007'},
];
```

The procedure is simple enough. We simply loop over the data, overwrite
`registered` and derive `initials` from `firstName` and `lastName`.

```typescript
const usersToAdminView = () => {
    for (const user of users) {
        // resolves to format: EEEE, d MMMM YYYY e.g. "Wednesday, 20 June 2019"
        user.registered = new Date(user.registered).toLocaleDateString(
            'en-gb',
            {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            },
        );
        // e.g. "AF"
        user.initials = `${user.firstName[0]}${user.lastName[0]}`;
    }
};
```

> Note: We intentionally called this piece of code a "procedure" and not a
"function" for good reason. Where a "procedure" executes a series of statements
and changes its environment with side effects, a "function" merely takes input
values and returns output values, without mutating its inputs or affecting its
environent. This distiction is critical, we will explore it in detail further
ahead.

Let's execute it and check our `users`.

```typescript
usersToAdminView();
console.log(users);
```

```json5
[
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
```

## Intermission

By now the opaque window of the dev room has cleared up. You get up, lacking
the coffee to motivate yourself to write some unit tests. In passing, you hear
Jim muttering "fuck fuck fuuuck" under his breath. Barbara seems to hold her
temples for dear life, staring in disbelief at some code the junior wrote the
past week. "Well, you approved it", you think to yourself, while said junior
furiously researches ways to center divs.

On your way to the coffee machine you cross ways with Bob, who fixes you with
a gaze that could pierce stone.

"Making progress?", he asks, all too casually.

"Sure. Just finished writing the model. Just grabbing a cup before I write some
unit tests."

"Oh, don't worry about that! We _really_ need this feature. We can test
afterwards."

## Shared complexity

What we're seeing here is the cost of **shared state**. In our function
we are arrogantly reaching into the global scope and mutating shared state.
Even though our colleague thought of defining the users as explicit parameters
and returning them, they fell into the same trap.

The fundamental problem here is that we're not preserving the integrity of the
data. Like a spoiled toddler, we're rampaging through the sweets section of the
supermarket, laser-focused on that unerned treat, leaving a trail of
destruction in our wake.

## Tables are simple
## (Pure) functions
## A way out of the tarpit
## Next Up
