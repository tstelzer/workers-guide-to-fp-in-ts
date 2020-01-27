import * as React from 'react';

import processor from './process-posts';

import rawPost from '../posts/pure-functions.md';

const Home = () => {
    const {contents, data} = processor.processSync(rawPost);

    console.log(data)
    return (
        <>
            <h1>A Workers guide to static functional programming in TypeScript</h1>
            <main>{contents}</main>
        </>
    );
};

export default Home;
