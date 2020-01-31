import * as React from 'react';
import * as E from 'fp-ts/lib/Either';
import {pipe} from 'fp-ts/lib/pipeable';
import * as io from 'io-ts';

import processor, {FrontmatterC, Frontmatter} from './process-posts';

import rawPost from '../posts/pure-functions.md';

const Home = () => {
    const {contents, data} = processor.processSync(rawPost);
    const {frontmatter} = pipe(
        data,
        FrontmatterC.decode,
        E.getOrElse<io.Errors, Frontmatter>(() => ({frontmatter: {}})),
    );

    return (
        <>
            <header className="post-header">
                <h1 className="page-title">A Workers guide to static functional programming in TypeScript</h1>
                <h2 className="post-title">{frontmatter?.title}</h2>
            </header>
            <main className="post">{contents}</main>
        </>
    );
};

export default Home;
