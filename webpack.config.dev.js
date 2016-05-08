import path from 'path';
import webpack from 'webpack';

export default {
	devtool: 'cheap-module-eval-source-map',
	entry: [
		'./src/zoomer',
	],
	output: {
		path: path.join(__dirname, 'static'),
		library: 'Zoomer',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		filename: 'zoomer.js',
		publicPath: '/',
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
	],
	eslint: {
		configFile: '.eslintrc',
	},
	module: {
		preLoaders: [{
			test: /\.js$/,
			loaders: ['eslint-loader'],
			exclude: ['node_modules'],
		}],
		loaders: [
			{
				test: /\.js$/,
				loaders: ['babel'],
				include: path.join(__dirname, 'src'),
			},
		],
	},
};
