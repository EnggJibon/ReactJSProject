const path = require('path');

module.exports = {
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    output: {chunkFilename: '[name].[id].js'}
    //alias: {
    //  '@': path.join(path.resolve(),'src')
    //}
  }
};

