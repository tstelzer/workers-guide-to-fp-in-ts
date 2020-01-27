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

refractor.register(typescript);

const copyFrontmatter: unified.Plugin = () => (ast, file) =>
    visit(ast, 'yaml', item => {
        (file as {data: any}).data.frontmatter = item.data?.parsedValue;
    });

const Pre: React.FC<{className: string}> = ({className, ...rest}) => {
    switch (className) {
        case 'language-json5':
            return <details>
                <summary>data</summary>
                <pre {...rest} className={className} />
            </details>;
        default:
            return <pre {...rest} className={className} />;
    };

};

export default unified()
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
            pre: Pre,
        },
    });
