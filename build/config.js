const path = require('path')

const buble = require('rollup-plugin-buble') // es6 转 es5
const eslint = require('rollup-plugin-eslint').eslint;
const flow = require('rollup-plugin-flow-no-whitespace') //忽略报错使用flow
const cjs = require('rollup-plugin-commonjs')  // 将非ES6语法的包转为ES6可用
const node = require('rollup-plugin-node-resolve') // 帮助寻找node_modules里的包
const replace = require('rollup-plugin-replace') //replace插件的用途是在打包时动态替换代码中的内容
const version = process.env.VERSION || require('../package.json').version
const banner =
  `/*!
  * vue-dataAc v${version}
  * (c) ${new Date().getFullYear()} adminV
  * @license MIT
  */`

const resolve = _path => path.resolve(__dirname, '../', _path)


module.exports = [
  // browser dev
  {
    file: resolve('dist/vue-dataAc.js'),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve('dist/vue-dataAc.min.js'),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve('dist/vue-dataAc.common.js'),
    format: 'cjs'
  },
  {
    file: resolve('dist/vue-dataAc.esm.js'),
    format: 'es'
  },
  {
    file: resolve('dist/vue-dataAc.esm.browser.js'),
    format: 'es',
    env: 'development',
    transpile: false
  },
  {
    file: resolve('dist/vue-dataAc.esm.browser.min.js'),
    format: 'es',
    env: 'production',
    transpile: false
  }
].map(genConfig)

function genConfig(opts) {
  const config = {
    input: {
      input: resolve('src/index.js'),
      plugins: [
        eslint(),
        flow(),
        node(),
        cjs(),
        replace({
          __VERSION__: version
        })
      ]
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: 'VueDataAc'
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  if (opts.transpile !== false) {
    config.input.plugins.push(buble())
  }

  return config
}