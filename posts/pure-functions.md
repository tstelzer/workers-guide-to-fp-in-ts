---
title: Something something pure
---

## Summary
## Prelude: Mondays

It's 10AM. The window in the dev room is fogged-up from dozens of steamy cups
of coffee. Barely awake, you wonder if you could have called in sick today.
There is still time, the others wouldn't snitch, you could still make it.  You
could creep back under the sheets. It is inhuman to work on Mondays.  The week
should start on Tuesday. But, alas, it is too late. Bright-eyed Bob blows into
the room. All confident and motivated he proclaims:

"Standup!"

Twelve devs sighs sound in harmony. You distrust Mondays.

"So, we're building two new features today."

He takes a sip from his mug, which boldly lies "getting shit done".

"We are?"

Good, Barbara is taking the lead today, you can't be the bearer of bad news
_every day_.

"I didn't see any new tickets."

"Well, apparently sales sold it in December. And the client needs it by Friday."

"Ah, well, that's doable I guess." Barbara takes an ironic sip.

"Yeah, no, last Friday. They needed it by last Friday."

"But that is in the past." Jim helpfully interjects.

"Shit happens." You just know that he has another coffee cup with those words
imprinted. "Sorry guys, you need to get on this right now. Jim. You need to
..."

You sound another deep sigh. Why does this always happen on Monday? You lean on
the window frame and lose yourself in painting little lambdas on the misty
glass. You recall the meeting where your kin swore a blood oath over the
surprisingly thin agile manifesto. "Never again", you voices echoed through
halls of empty cubicles. Must have been in the fading days of a past summer. Or
last Friday. Actually, yes, you think it was last Friday.

"Tom." Ah, here it comes. "You need to build the admin section. The junior wants
to build the view, but could you build the model? It should display ... um ..."
Bob glances on a napkin in his hand. "Registration date. Something locale date
string. I can't read this. Frank said 'the data is weird', or something like
that. I don't know what that means. I'm sure you'll figure it out! I'm
confident you guys can do this, you're all rock stars!".

And with that, Bob flies away. You attempt to take another sip before sitting
down. The cup is empty. You wonder if you could hack the corporate calendar to
make weeks start on Tuesday.

Every application has users. So you've been told, at least. You haven't
personally met them. Maybe *they* like Mondays.
You have a look at the data first. It's supposed to be "weird".

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

Someone already created a class for you.

```typescript
class User {
    firstName: string;
    lastName: string;
    registered: string;

    constructor(firstName: string, lastName: string, registered: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.registered = registered;
    }
}
```

Ah, glancing at the `registered` field, you see whats "weird": it was stored as
a US-formatted string, i.e. `MM.DD.YYYY`. The view needs it in a different
format though, something like `Wednesday, 9 July 2003.` Should be easy enough
to clean up, just add a method that prepares the `User` for the admin view:

```typescript
class User {
    firstName: string;
    lastName: string;
    registered: string;

    constructor(firstName: string, lastName: string, registered: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.registered = registered;
    }

    /** Prepares users for the admin view. */
    toAdminView() {
        this.registered = new Date(this.registered).toLocaleDateString('en-gb', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
}
```

Now loop over the data to create our model, instanciating the users and
running the `toAdminView` method.

```typescript
let users: User[] = [];

// `data` comes stright from the data base.
for (const {firstName, lastName, registered} of data) {
  const user = new User(firstName, lastName, registered);
  user.toAdminView();
  users.push(user);
}
```

Easy enough. Another look at the model:

```typescript
console.log(users);
```

```json5
[
  User {
    firstName: 'Barbara',
    lastName: 'Selling',
    registered: 'Tuesday, 3 January 2017'
  },
  User {
    firstName: 'John',
    lastName: 'Smith',
    registered: 'Tuesday, 24 December 2019'
  },
  User {
    firstName: 'Frank',
    lastName: 'Helmsworth',
    registered: 'Wednesday, 11 May 2011'
  },
  User {
    firstName: 'Anna',
    lastName: 'Freeman',
    registered: 'Wednesday, 9 July 2003'
  },
  User {
    firstName: 'Damian',
    lastName: 'Sipes',
    registered: 'Wednesday, 12 December 2001'
  },
  User {
    firstName: 'Mara',
    lastName: 'Homenick',
    registered: 'Tuesday, 14 August 2007'
  }
]
```

Works. Bob said we don't need to write tests for this, so you guess you can merge
the branch.

Ah, it seems that Jim already merged his changes as well. What did he work on
again?  You didn't listen in the stand up. Looks like he added a method to `User` as well:

```typescript
class User {
    firstName: string;
    lastName: string;
    registered: string;

    constructor(firstName: string, lastName: string, registered: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.registered = registered;
    }

    /** Prepares user for the admin view. */
    toAdminView() {
        this.registered = new Date(this.registered).toLocaleDateString('en-gb', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // user to side bar. changes registration date to year.
    toSidebarView() {
        this.registered = this.registered.slice(6);
    }
};

let users: User[] = [];

for (const {firstName, lastName, registered} of data) {
  const user = new User(firstName, lastName, registered);
  user.toSidebarView();
  user.toAdminView();
  users.push(user);
}
```

Uh oh.

```typescript
console.log(users);
```

```json5
[
  User {
    firstName: 'Barbara',
    lastName: 'Selling',
    registered: 'Sunday, 1 January 2017'
  },
  User {
    firstName: 'John',
    lastName: 'Smith',
    registered: 'Tuesday, 1 January 2019'
  },
  User {
    firstName: 'Frank',
    lastName: 'Helmsworth',
    registered: 'Saturday, 1 January 2011'
  },
  User {
    firstName: 'Anna',
    lastName: 'Freeman',
    registered: 'Wednesday, 1 January 2003'
  },
  User {
    firstName: 'Damian',
    lastName: 'Sipes',
    registered: 'Monday, 1 January 2001'
  },
  User {
    firstName: 'Mara',
    lastName: 'Homenick',
    registered: 'Monday, 1 January 2007'
  }
]
```

Yikes. Looks like the `registered` is now set to 1st of January for every User.
Maybe if you run the methods in opposite order?

```typescript
for (const {firstName, lastName, registered} of data) {
  const user = new User(firstName, lastName, registered);
  user.toAdminView();
  user.toSidebarView();
  users.push(user);
}

console.log(users);
```

```json5
[
  User {
    firstName: 'Barbara',
    lastName: 'Selling',
    registered: 'y, 3 January 2017'
  },
  User {
    firstName: 'John',
    lastName: 'Smith',
    registered: 'y, 24 December 2019'
  },
  User {
    firstName: 'Frank',
    lastName: 'Helmsworth',
    registered: 'day, 11 May 2011'
  },
  User {
    firstName: 'Anna',
    lastName: 'Freeman',
    registered: 'day, 9 July 2003'
  },
  User {
    firstName: 'Damian',
    lastName: 'Sipes',
    registered: 'day, 12 December 2001'
  },
  User {
    firstName: 'Mara',
    lastName: 'Homenick',
    registered: 'y, 14 August 2007'
  }
]
```

Oops. Guess we broke each others code. Depending on whos function runs _first_,
the model is broken in different ways.

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
