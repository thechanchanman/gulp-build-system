module.exports = {
  entry: {
    main: './src/js/main.js'
  },
  output: {
    filename: './public/js/main.js'
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/
  },
  devtool: 'source-map',
  module: {
    rules: [
      { // js files
        test: /\.js$/, // include .js files
        exclude: /node_modules/, // exclude all files in the node_modules folder
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015']
            }
          }
        ]
      }
    ]
  }
};
