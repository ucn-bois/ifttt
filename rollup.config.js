import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const config = {
  input: path.join(__dirname, 'public/javascripts/index.js'),
  output: {
    file: path.join(__dirname, 'public/javascripts/index.min.js'),
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    babel(),
    terser({
      compress: true,
    }),
  ],
};

export default config;
