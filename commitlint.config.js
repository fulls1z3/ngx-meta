module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['project-wide', 'core', 'package', 'npm', 'webpack', 'circle', 'lint', 'packaging', 'changelog']]
  }
};
