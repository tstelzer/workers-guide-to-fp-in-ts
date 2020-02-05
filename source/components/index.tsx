import * as React from 'react';

export type ViewChapter = {
    id: string;
    slug: string;
    href: string;
    parent?: string;
    title: string;
    contents: string;
};

export type ChildNode = {id: string; order: number};

export type ParentNode = {
    id: string;
    order: number;
    children: ChildNode[];
};

export type Nav = ParentNode[];

export type ViewModel = {
    /** Ordered navigation hierarchy */
    nav: Nav;
    /** Chapter by its slug */
    byId: {[id: string]: ViewChapter};
    /** Unsorted list of slugs */
    ids: string[];
};

type ViewProps = ViewChapter & ViewModel;

const Link: React.FC<{href: string; title: string}> = ({href, title}) => (
    <a href={href}>{title}</a>
);

const Nav: React.FC<ViewProps> = ({nav, byId}) => (
    <nav className="nav">
        <h3 className="nav-title">Jump To Chapter</h3>
        <ol>
            {nav.map(({id, children}, i) => {
                const chapter = byId[id];
                if (!children) {
                    return (
                        <li key={i}>
                            <Link {...chapter} />
                        </li>
                    );
                }
                return (
                    <li key={i}>
                        <Link {...chapter} />
                        <ol>
                            {children.map(({id}, i) => {
                                const child = byId[id];
                                return (
                                    <li key={i}>
                                        <Link {...child} />
                                    </li>
                                );
                            })}
                        </ol>
                    </li>
                );
            })}
        </ol>
    </nav>
);

export const Layout: React.FC = ({children}) => (
    <html lang="en">
        <head>
            {process.env['NODE_ENV'] !== 'development' && (
                <base href="/workers-guide-to-fp-in-ts/" />
            )}
            <meta charSet="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
            <title>A Workers Guide To Typed Functional Programming</title>
            <link rel="stylesheet" href="styles.css" />
        </head>
        <body>
            <h1 className="page-title">
                A Workers Guide To Typed Functional Programming
            </h1>
            <div className="layout">{children}</div>
        </body>
    </html>
);

export const Home: React.FC<ViewProps> = props => (
    <Layout>
        <Nav {...props} />
        <main className="main">
            <h2 className="chapter-title">{props.title}</h2>
            {props.contents}
        </main>
    </Layout>
);
