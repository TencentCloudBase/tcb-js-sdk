/**
 * @see https://github.com/pvdlg/karma-rollup-preprocessor
 */

const path = require('path');
// const pkg = require('../package.json');
const babel = require('rollup-plugin-babel');
const istanbul = require('rollup-plugin-istanbul');

let browsers = ['Chrome'];
if (process.env.TRAVIS) {
    browsers = ['Chrome_travis_ci'];
}

module.exports = function(config) {
    config.set({
        files: [
            '../test/test.spec.js',
            '../src/main.js'
            // {
            //     pattern: path.resolve('./test/*.spec.js'),
            //     watched: false
            // }
        ],


        plugins: [
            'karma-rollup-preprocessor',
            'karma-coverage-istanbul-reporter',
            'karma-mocha',
            'karma-sinon-chai',
            'karma-sourcemap-loader',
            'karma-spec-reporter',
            // 'karma-phantomjs-launcher',
            'karma-chrome-launcher'
        ],

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // 设定要使用的 frameworks
        frameworks: ['mocha', 'sinon-chai'],

        browsers: browsers,

        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },

        // 设定报告输出插件： spec 和 coverage-istanbul
        reporters: ['spec', 'coverage-istanbul'],

        preprocessors: {
            '../src/**/*.js': ['rollup_1'], '../test/**/*.js': ['rollup_2']
            // './test/*.spec.js': ['rollup'],
            // './test/*.spec.js': ['rollupBabel']
        },

        customPreprocessors: {
            rollup_1: {
                base: 'rollup',
                options: {
                    output: {
                        name: 'index.iife.js',
                        sourcemap: false,
                        format: 'iife'
                    },
                    plugins: [babel({ presets: [['es2015', { modules: false }]] })]
                },
            },
            rollup_2: {
                base: 'rollup',
                options: {
                    output: {
                        name: 'index.test.js',
                        sourcemap: true,
                        format: 'iife'
                    },
                    plugins: [
                        istanbul({
                            exclude: ['test/*.js', 'src/libs/gb.js']
                        }),
                        babel({ presets: [['es2015', { modules: false }]] }),
                    ]
                },
            }
        },

        // coverage-istanbul 输出配置，报告文件输出于根目录下的 coverage 文件夹内
        coverageIstanbulReporter: {
            // reports can be any that are listed here: https://github.com/istanbuljs/istanbul-reports/tree/590e6b0089f67b723a1fdf57bc7ccc080ff189d7/lib
            reports: ['html', 'lcovonly', 'text-summary'],
            // base output directory
            dir: path.join(__dirname, './coverage'),
            // Most reporters accept additional config options. You can pass these through the `report-config` option
            'report-config': {
                // all options available at: https://github.com/istanbuljs/istanbul-reports/blob/590e6b0089f67b723a1fdf57bc7ccc080ff189d7/lib/html/index.js#L135-L137
                html: {
                    // outputs the report in ./coverage/html
                    subdir: 'html'
                }
            }
        },

        urlRoot: '/path/',

        singleRun: true,

    });
};
