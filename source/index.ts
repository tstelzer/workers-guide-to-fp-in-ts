import React from 'react';
import * as io from 'io-ts';
import * as Rx from 'rxjs';
import * as Ro from 'rxjs/operators';
import * as fs from 'fs';
import * as A from 'fp-ts/lib/Array';
import {ord, ordNumber} from 'fp-ts/lib/Ord';
import glob from 'glob';
import readVFile from 'to-vfile';
import {VFile} from 'vfile';
import {pipe} from 'fp-ts/lib/pipeable';
import * as E from 'fp-ts/lib/Either';
import {renderToStaticMarkup} from 'react-dom/server';
import * as path from 'path';
import {PathReporter} from 'io-ts/lib/PathReporter';

import {
    Home,
    ViewChapter,
    Nav,
    ChildNode,
    ParentNode,
    ViewModel,
} from './components';
import parseChapter from './parse-chapters';

const readDir = Rx.bindNodeCallback(
    (
        pattern: string,
        callback: (e: Error | null, result: fs.PathLike[]) => void,
    ) =>
        glob(
            pattern,
            {
                matchBase: true,
                nosort: true,
            },
            callback,
        ),
);

const writeFile = Rx.bindNodeCallback(
    (
        path: fs.PathLike | number,
        data: any,
        options: fs.WriteFileOptions,
        callback: fs.NoParamCallback,
    ) => fs.writeFile(path, data, options, callback),
);

const makeDir = Rx.bindNodeCallback(
    (
        path: fs.PathLike,
        options: number | string | fs.MakeDirectoryOptions | undefined | null,
        callback: fs.NoParamCallback,
    ) => fs.mkdir(path, options, callback),
);

// =============================================================================
// Parsing
// =============================================================================

/**
 * Takes a validation error and returns a human readable string.
 */
export const reportError = ({history}: VFile, error: io.ValidationError) => {
    const path = error.context.map(({key}) => key).join('.');
    const {
        actual,
        type: {name},
    } = error.context[error.context.length - 1];

    return `Expected value of type ${name} at ${path}, for chapter ${
        history[0]
    }, but got ${JSON.stringify(actual, null, 2)}.\n`;
};

/**
 * Convenience wrapper around `reportError` for a list of errors.
 */
export const reportErrors = (vfile: VFile) => (errors: io.Errors) =>
    errors.map(e => reportError(vfile, e)).reduce(s => `${s}\n`);

const ParsedChapterCodec = io.type({
    result: io.any,
    contents: io.any,
    data: io.type({
        frontmatter: io.intersection([
            io.type({
                title: io.string,
                slug: io.string,
                order: io.number,
                state: io.keyof({draft: null, outline: null, release: null}),
            }),
            io.partial({
                parent: io.string,
            }),
        ]),
    }),
});

type ParsedChapter = io.TypeOf<typeof ParsedChapterCodec>;

const toId = (m: {slug: string; parent?: string}) => (m.parent || '') + m.slug;

type ParsedChapterWithId = ParsedChapter & {id: string};

const defaultParsedChapter = (): ParsedChapter => ({
    contents: '',
    result: undefined,
    data: {
        frontmatter: {
            title: '',
            slug: '',
            order: 99,
            state: 'outline',
        },
    },
});

// =============================================================================
// View
// =============================================================================

const render = <P>(component: React.ComponentType<P>) => (props: P) =>
    renderToStaticMarkup(React.createElement(component, props));

const sortParentNodes = A.sortBy([
    ord.contramap(ordNumber, (n: ParentNode) => n.order),
]);

const sortChildNodes = A.sortBy([
    ord.contramap(ordNumber, (n: ChildNode) => n.order),
]);

const defaultViewModel = (): ViewModel => ({nav: [], byId: {}, ids: []});

const reduceBySlug = (
    byId: {[id: string]: ViewChapter},
    chapter: ParsedChapterWithId,
): {[id: string]: ViewChapter} => {
    const {slug, title, parent} = chapter.data.frontmatter;
    const {id, contents, result} = chapter;
    const href = !!parent ? `${parent}/${slug}.html` : `${slug}.html`;

    return {
        ...byId,
        [id]: {
            result,
            id,
            slug,
            title,
            parent,
            href,
            contents,
        },
    };
};

/*
 * NOTE: Mutation here is fine for now. If the reducer grows in complexity
 * (e.g. more than two levels of nodes in hierarchy), refactor by modeling it
 * as a tree.
 */
const reduceNav = (nav: ParentNode[], chapter: ParsedChapterWithId) => {
    const {parent, slug, order} = chapter.data.frontmatter;
    // found a top-level node
    if (!parent) {
        if (nav.find(({id}) => id === chapter.id)) {
            // is already in hierarchy
            const node = nav.find(({id}) => id === chapter.id) as ParentNode;
            node.order = order;
        } else {
            // is yet not in hierarchy
            nav = [...nav, {id: chapter.id, order, children: []}];
        }
        nav = sortParentNodes(nav);
        return nav;
    }
    // found a chapter node
    else {
        if (!nav.find(({id}) => id === toId({slug: parent}))) {
            // parent is not yet in state
            nav = [...nav, {id: toId({slug: parent}), order, children: []}];
        }

        const parentNode = nav.find(
            ({id}) => id === toId({slug: parent}),
        ) as ParentNode;

        parentNode.children.push({id: toId({slug, parent}), order});
        parentNode.children = sortChildNodes(parentNode.children);
        return nav;
    }
};

// const renderViewChapter = ([slug: string, state: ViewModel]) => {
// };

// =============================================================================
// Main
// =============================================================================

readDir('./chapters/**/*.md')
    .pipe(
        Ro.flatMap(xs => xs),
        Ro.flatMap(p => readVFile.read(p, 'utf-8')),
        Ro.flatMap(f => parseChapter(f as VFile)),
        // validation, kinda
        Ro.map(chapter =>
            pipe(
                chapter,
                ParsedChapterCodec.decode,
                // FIXME: This is lazy.
                E.mapLeft(l => {
                    const e = PathReporter.report(E.left(l));
                    console.error(e);
                    return l;
                }),
                E.getOrElse(defaultParsedChapter),
                chapter => ({...chapter, id: toId(chapter.data.frontmatter)}),
            ),
        ),
        Ro.filter(
            chapter =>
                // in development mode, all chapters need to be seen
                process.env['NODE_ENV'] === 'development' ||
                // in production mode, reject outlines
                ['draft', 'release'].includes(chapter.data.frontmatter.state),
        ),
        // view model
        Ro.reduce(
            (state, file) => ({
                nav: reduceNav(state.nav, file),
                byId: reduceBySlug(state.byId, file),
                ids: A.cons(file.id, state.ids),
            }),
            defaultViewModel(),
        ),
        // render files
        Ro.flatMap(state =>
            state.ids.map(slug => {
                const chapter = state.byId[slug];
                const filedir = path.resolve('docs', chapter.parent || '');
                const filename = `${chapter.slug}.html`;
                const filecontent = render(Home)({...state, ...chapter});
                const filepath = path.join(filedir, filename);

                return makeDir(filedir, {recursive: true}).pipe(
                    Ro.flatMap(() =>
                        writeFile(filepath, filecontent, {encoding: 'utf-8'}),
                    ),
                    Ro.mapTo(filepath),
                );
            }),
        ),
        Ro.flatMap(s => s),
    )
    .subscribe(console.log);
