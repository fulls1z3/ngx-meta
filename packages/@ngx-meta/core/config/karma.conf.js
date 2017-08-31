module.exports = function(config) {
  const configuration = {
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    client: {captureConsole: false},
    files: [
      {
        pattern: './spec-bundle.js',
        watched: false
      }
    ],
    preprocessors: {
      './spec-bundle.js': [
        'coverage',
        'webpack',
        'sourcemap'
      ]
    },
    webpackMiddleware: {
      noInfo: true,
      stats: {chunks: false}
    },
    reporters: [
      'mocha',
      'coverage',
      'coverage-istanbul'
    ],
    coverageReporter: {type: 'in-memory'},
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    autoWatch: false,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeTravisCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true
  };

  if (process.env.TRAVIS) {
    configuration.browsers = [
      'ChromeTravisCi'
    ];
  }

  config.set(configuration);
};
