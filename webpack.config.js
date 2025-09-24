const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/'
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@bots': path.resolve(__dirname, 'bots'),
        '@components': path.resolve(__dirname, 'components'),
        '@lib': path.resolve(__dirname, 'lib'),
        '@services': path.resolve(__dirname, 'services')
      }
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.json',
              compilerOptions: {
                jsx: 'react-jsx'
              }
            }
          },
          exclude: [
            /node_modules/,
            /bun-elysia-server\.ts$/,
            /backup/,
            /lib\/agents/,
            /hooks\/useLivePatch\.ts$/,
            /pages\/api\/admin\.ts$/
          ]
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        title: 'Valifi - AI-Powered Financial Platform'
      }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        'process.env.DATABASE_URL': JSON.stringify(process.env.DATABASE_URL || ''),
        'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET || ''),
        'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3000/api')
      }),

      new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom'
      })
    ],

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all'
          }
        }
      },
      runtimeChunk: 'single',
      minimize: isProduction
    },

    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 4000,
      hot: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};