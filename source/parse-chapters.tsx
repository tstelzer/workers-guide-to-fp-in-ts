import React from 'react';
import frontmatter from 'remark-frontmatter';
import parseFrontmatter from 'remark-parse-yaml';
import codeImport from 'remark-code-import';
import remark2rehype from 'remark-rehype';
import parseMarkdown from 'remark-parse';
import refractor from 'refractor';
import typescript from 'refractor/lang/typescript';
import unified from 'unified';
import {VFileCompatible, VFile} from 'vfile';
import visit from 'unist-util-visit';
import slug from 'rehype-slug';
import highlight from '@mapbox/rehype-prism';
import toReact from 'rehype-react';
import remarkCustomBlocks from 'remark-custom-blocks';

refractor.register(typescript);

const copyFrontmatter: unified.Plugin = () => (tree, file) =>
    visit(tree, 'yaml', node => {
        (file as {data: any}).data.frontmatter = node.data?.parsedValue;
    });

export const process = (file: VFileCompatible): Promise<VFile> =>
    unified()
        .use(parseMarkdown)
        .use(codeImport)
        .use(frontmatter, ['yaml'])
        .use(parseFrontmatter)
        .use(copyFrontmatter)
        .use(remarkCustomBlocks, {
            expand: {
                classes: 'expand',
                title: 'optional',
                details: true,
            },
        })
        .use(remark2rehype)
        .use(highlight)
        .use(slug)
        .use(toReact, {createElement: React.createElement})
        .process(file);

export default process;
