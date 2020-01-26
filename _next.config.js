module.exports = {
    exportTrailingSlash: true,
    exportPathMap: () => ({'/': {page: '/home/ts/dev/project/workers-guide-to-fp-in-ts/out/'}}),
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader'
        });
        return config
    }
}
