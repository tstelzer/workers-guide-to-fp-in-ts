---
title: Lovely little function
---

## Summary

In this chapter we will begin our journey by exploring functions. We will look
at a piece of code that violates the principle of immutability and explore the
implications, and refactor it using pure functions. If you're here to learn
about `fp-ts` and are already familiar with the idea of pure functions, you can
safely skip this chapter.

## Prelude: Mondays

It's 10AM. The window in the developer room is fogged-up from dozens of steamy cups
of coffee. Barely awake, you wonder if you could have called in sick today.
There is still time, of course, the others wouldn't snitch, you could still make it. You
could creep back under those comforting sheets. The week should really start on
Tuesday, you think. But, regrettably, it is too late. Bright-eyed Bob blows
into the room. All confident and motivated he proclaims:

"Stand-up!"

Twelve developers sighs sound in harmony. You distrust Mondays.

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
cubicles. A war cry of misunderstood craftspeople. Where are those blessed days?
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

When we see a type, we don't mean an "an instance of a class", we mean "a piece
of data that matches a certain structure". In our specific case, any data that
matches its structure can be considered a `User`. Think one of those toys that
seem to be sold exclusively to doctors waiting rooms, where children are
supposed to match wooden blocks in various shapes (stars, circles, rectangles)
to their corresponding holes. If the block matches the "star" hole, for all
intents and purposes, its a star.

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
care about the `firstName` property, so we can
[destructure](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#function-declarations)
it from the input. Now we've signaled to the caller that we care _even less_
about the label of the input, as long as it contains a `firstName` of type
`string`.

```typescript
const firstName = (input: {firstName: string}): string => input.firstName;
console.log(firstName(anna));
```

```json5
Anna
```

How concrete or general we are in defining our input types is entirely up to us. Each
comes with benefits and trade offs we will explore in chapters to come.

## Intermission: Motivational coffee

By now the opaque window of the developer room has cleared up. You get up, lacking
the coffee to motivate yourself to continue. In passing, you hear
Jim muttering "fuck fuck fuuuck" under his breath. Barbara seems to hold her
temples for dear life, staring in disbelief at some code the junior wrote the
past week. "Well, you approved it", you think to yourself, while said junior
furiously researches ways to center divs.

On your way to the coffee machine you cross ways with Bob, who fixes you with
a gaze that could pierce stone.

"Making progress?", he asks, all too casually.

"Sure. Seems simple enough. Just grabbing a cup before I write some tests, then
I'm going to write the model."

"Oh, don't worry about tests! We _really_ need this feature. You can test
afterwards."

As you mentally prepare yourself to attack Bob with a plethora of arguments
about professional ethics and maintainability, he grabs your shoulders with
both hands, pulls you in, uncomfortably close.

"Please, man! My boss is breathing down my neck.", Bob whispers, while
literally breathing down your neck. "You'll get all the time in the world to
test this, _after_ we've released. I promise!", he lies.

Something in the moment instills a feeling of protectiveness in you. You just
want to wrap Bob in a warm blanket and tell him everything is going to be
alright. Nothing else matters, not sales, not his boss, not these features,
only this intimate moment between the two of you.

"OK.", you resign. "But I'll take you up on that promise!"

"Thank you!", a wave of relief washes over Bob, as the familiar cockiness
visibly returns, and he [richtet sich auf]. "So, I can expect your feature by
tomorrow?"

You feel violated, somehow.

As you wait for the coffee machine to aggressively squirt coffee into your cup,
your eyes wander over the floor in irritation. You feel like you have lost
something, on your way from your machine. Your keys? No, you can feel them in
your pocket. Your phone? Nah, you left that on your desk. Your integrity? Ah,
yes, that's it.

You lost your integrity.

As you sit down again, ready to directly inject the caffeine into your blood stream, Jim
erupts:

"Done. Pushed. Merged."

"Okay, who reviewed?", you voice your concern.

"No need, it's working, I checked it!", he proudly proclaims. "And Bob said
it's critical anyways, don't worry about it."

"Bob just told me not to write tests, I just worry about the stability of these
features."

"He told you not to write what?", Jim asks absentmindedly.

Sounds about right. You attempt to take a sip of coffee while simultaneously
sighing, that could make things more efficient, you presume, as you pull in
Jims changes.

## Procedural impurity and shared complexity

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

> Note: We're intentionally calling above blocks a _procedure_. There is a
critical difference between a _function_ and a _procedure_. A _function_
merely takes values as inputs and returns values as outputs -- all without
affecting its environment, e.g. by changing inputs in-place. A _procedure_ may
run a series of statements, changing its environment, its inputs, having side
effects other than returning values.

Let's go deeper into this issue. We'll define our own model-deriving
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
_our_ procedure parses `registered` _after_ it was cut down to just the year
by `usersToSidebar`. Let's flip the order of invocation.

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

Oof. Completely broken. What we're seeing here is the cost of **shared, mutable
state**. In our procedures we are reaching into the global scope and changing
data in place that is used in other places. We're not preserving the integrity
of the data. Like a spoiled toddler, we're rampaging through the sweets section
of the supermarket, trained on that unearned treat, leaving a trail of
destruction in our wake.

We _could_ "fix" the problem by introducing more fields, e.g. `registeredShort`
or `registeredLong` and promise that we only mutate _those_ fields.
This "solution" doesn't scale.

We've introduced another problem on the type level: because we keep changing
our original data _in place_, we have to stuff all our new fields into the
original type. You can maybe imagine how the `User` would grow in size if we
keep adding new fields for totally unrelated views. We should really have
_three_ types:

1. the original `User`
3. a `SidebarUser` that incldues the `shortName` field
2. an `AdminUser` that includes the `initials` field

Before we tackle the type problem, let's take a step back and consider a
_fundamental_ solution to the problem of shared, mutable state.

## Out of the tar pit

## Next Up
