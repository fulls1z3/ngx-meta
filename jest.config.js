module.exports = {
  displayName: 'ngx-meta',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/tools/test/jest.setup.ts'],
  testResultsProcessor: './node_modules/jest-junit-reporter',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
        before: ['jest-preset-angular/build/InlineFilesTransformer', 'jest-preset-angular/build/StripStylesTransformer']
      }
    }
  },
  moduleNameMapper: {
    '^@ngx-meta/core': '<rootDir>/packages/@ngx-meta/core/src/index.ts'
  },
  cache: false,
  silent: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/@ngx-meta/core/src/**.ts"
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
