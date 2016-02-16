var path = require('path');
var ROOT_PATH = path.resolve(__dirname);

module.exports = {
    entry: path.resolve(ROOT_PATH,
        'brp/static/embark/index'),
    output: {
        path: path.resolve(ROOT_PATH, 'brp/static/embark/build'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                exclude: /node_modules/,
            }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
