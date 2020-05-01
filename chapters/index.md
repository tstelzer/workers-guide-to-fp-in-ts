---
slug: index
order: 1
title: Introduction
state: draft
---

In functional programming we structure programs by piping data through
functions. That's it, really. Regardless which part of the program you are
looking at -- from the tiniest, single-responsibility helper, to complex
services, to the full application -- it is all functions; bottom to top.
Modules and services are built by composing small functions into yet another
function with commonly-known, proven abstractions that often originate in
mathematics (lambda calculus, category theory). In fact, the entire application
is expressed as a function.

In this practical and introductory book on typed functional programming
we're having a look at the basic tool kit of the paradigm. We're using
TypeScript and the extensive ecosystem of the [fp-ts](https://gcanti.github.io/fp-ts/) library, though these skills are transferrable between languages and libraries.
Once you have learned these concepts, you can use them in almost any other
language that supports functional programming.

This book is for you if:

- You want to learn functional programming.
- You want a practical introduction to [fp-ts](https://gcanti.github.io/fp-ts/).
- You are being forced into functional programming by your coworkers.
- You are forcing your coworkers into functional programming (one could argue, the reason this book exists in the first place).

As this is **not** a fundamental introduction to programming in general,
JavaScript or TypeScript, you should:

- Have a solid understanding of ES6+ JavaScript. For example, arrow function syntax will not be explained.
- Have a basic understanding of TypeScript. For example, primitive types and basic TypeScript syntax will not be explained.
- Be familiar with general software development language and basic programming concepts.
- Know your way around your own development environment. For example, this book will not guide you through setting up the TypeScript runtime.

Chapters are accompanied by exercises.

### Work In Progress

This tutorial is written in good faith, to the best of the authors knowledge,
and is a work-in-progress. Some chapters may be missing, some exercises lacking
in depth. It will grow and evolve over time. If you find any factual errors,
please offer your corrections by opening issues on the repository or by voicing
your suggestions in the [functional programming slack](https://fpchat-invite.herokuapp.com/).
