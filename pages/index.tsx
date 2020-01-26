import * as React from 'react';
import frontmatter from 'remark-frontmatter';
import parseFrontmatter from 'remark-parse-yaml';
import remark2rehype from 'remark-rehype';
import parseMarkdown from 'remark-parse';
import refractor from 'refractor';
import typescript from 'refractor/lang/typescript';

import toc from 'rehype-toc';
import slug from 'rehype-slug';
import highlight from '@mapbox/rehype-prism';
import toReact from 'rehype-react';

import unified from 'unified';
import visit from 'unist-util-visit';

import rawPost from '../posts/pure-functions.md';

refractor.register(typescript);

const copyFrontmatter: unified.Plugin = () => (ast, file) =>
    visit(ast, 'yaml', item => {
        (file as {data: any}).data.frontmatter = item.data?.parsedValue;
    });

const Link: React.FC = props => {
    console.log(props);
    return <a {...props} />;
};

const processor = unified()
    .use(parseMarkdown)
    .use(frontmatter)
    .use(parseFrontmatter)
    .use(copyFrontmatter)
    .use(remark2rehype)
    .use(highlight)
    .use(slug)
    .use(toc)
    .use(toReact, {
        createElement: React.createElement,
        components: {
            a: Link,
        },
    });

const Home = () => {
    const {contents, data} = processor.processSync(rawPost);
    console.log(data);

    return (
        <>
            <h1>A workers guide to static functional programming</h1>
            <main>{contents}</main>
        </>
    );
};

export default Home;
