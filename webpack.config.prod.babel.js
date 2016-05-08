import path from 'path';
import webpack from 'webpack';

export default {
	entry: [
		'./src/zoomer',
	],
	output: {
		path: path.join(__dirname, 'dist'),
		library: 'Zoomer',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		filename: 'zoomer.js',
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compressor: { warnings: false },
		}),
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
