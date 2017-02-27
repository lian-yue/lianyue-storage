"strict mode"
const path              = require('path')
const fs                = require('fs');
const webpack           = require('webpack')
const packageInfo       = require('./package.json')

var version = packageInfo.version.split('.');
version[version.length -1] = parseInt(version[version.length -1]) + 1;
packageInfo.version = version.join('.');


var nodeModules = fs.readdirSync('node_modules').filter(function (i) {
  return ['.bin', '.npminstall'].indexOf(i) === -1
})


module.exports = {
  entry: ['./app/index.js'],
  devtool: 'cheap-source-map',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.js',
    publicPath: '/build/',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  node: {
    fs: 'empty',
    __dirname: true,
    __filename: true
  },

  resolve: {
    root: path.join(__dirname, 'node_modules'),
    alias: {
    },
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', '.json'],
  },

  resolveLoader: {

  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.json$/, loader: 'json'},
    ]
  },

  externals: [
    function (context, request, callback) {
      var pathStart = request.split('/')[0]
      if (!pathStart || pathStart[0] === '!') {
        return callback();
      }
      if (nodeModules.indexOf(pathStart) >= 0) {
        return callback(null, 'commonjs ' + request);
      }
      if (request.indexOf('./options') >= 0) {
        return callback(null, 'commonjs ' + '../options');
      }
      if (request.indexOf('./package') >= 0) {
        return callback(null, 'commonjs ' + '../package');
      }
      return callback();
    }
  ],


  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: [
      'transform-runtime',
      'add-module-exports',
    ],
    compact : true,
  },

  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.BannerPlugin("Name: "+packageInfo.name+"\nVersion: "+ packageInfo.version +"\nAuthor: "+ packageInfo.author +"\nDescription: "+ packageInfo.description +""),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      },
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__ENV__': JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
  ],
};


process.on('exit', function(code) {
  if (code) {
    return;
  }
  fs.writeFileSync('./package.json', JSON.stringify(packageInfo, null, '  '));
});
