---
slug: the-road-to-composition
order: 2
title: The road to composition
state: draft
---

And so our journey begins. On the road to composition, we're building an
understanding for the basic building blocks of functional programming.

* In chapter one, we will learn to appreciate the simplicitly of pure
functions and data immutability and use this knowledge to start building an item store.
* In chapter two, we discover that functions are themselfes values and use
this to further simplify our code. Specifically, we're having a look at the higher-order functions `filter` and `map`.
* Chapter three offers an in-depth look at concept of function signatures and some advanced TypeScript features. 
* In chapter four, we name a concept that we've been using in previous chapters
without knowing that we did: partial application.
* Chapter five builds on this knowledgeand examines the idea of function currying.
* Finally, chapter six combines all of the skills we have learned up to this point in exploring function composition.

Feel free to skip chapters when you feel already comfortable with the concepts,
though it would be advisable to at least skim them to understand the context of
the example code and exercises.

### Exercises And Code

In order to run the exercises for each chapter, first clone the repository and
install all dependencies.

```bash
git clone https://github.com/tstelzer/workers-guide-to-fp-in-ts
cd workers-guide-to-fp-in-ts/exercises
npm ci
```

Each chapters code is under `exercises/chapters/<CHAPTER>`, for example the
code for chapter one would be under `exercises/chapters/1`. To run each chapters test suite, run:

```bash
npm run test:<CHAPTER> -- --watch
```

And to run each chapters repl, run:

```bash
npm run dev:<CHAPTER>
```

That should also start the node debugger under `0.0.0.0:9229`.
