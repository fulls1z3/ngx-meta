module.exports = [
  {
    type: 'build',
    release: 'patch'
  },
  {
    type: 'chore',
    release: 'patch'
  },
  {
    type: 'ci',
    release: 'patch'
  },
  {
    type: 'docs',
    release: 'patch'
  },
  {
    type: 'feat',
    release: 'minor'
  },
  {
    type: 'fix',
    release: 'patch'
  },
  {
    type: 'refactor',
    release: 'patch'
  },
  {
    type: 'style',
    release: 'patch'
  },
  {
    scope: 'no-release',
    release: false
  }
];
