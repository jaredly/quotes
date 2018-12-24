const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  context: path.join(__dirname, './'),
  entry: {bundle: './src/index.js', admin: './src/admin.js' },
  
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: /src/,
        use: {
          loader: "babel-loader"
        }
      }
    ],
  },
};