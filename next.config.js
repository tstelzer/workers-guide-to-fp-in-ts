module.exports = {
    exportTrailingSlash: true,
    exportPathMap: () => ({'/': {page: '/'}}),
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader'
        });
        return config
    }
}
