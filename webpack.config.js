const path = require('path');
const webpack = require('webpack');

// const PATHS = {
//   build: path.join(__dirname, 'build'),
//   src: path.join(__dirname, 'app')
// };

module.exports = {
  entry: {
    src: './app/app.js'
  },
  output: {
    path: './build/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, 
    {
      test: /\.css$/,
      loader: "style!css"
    }
    ]
  },
  devServer: {
    contentBase: './app',
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
