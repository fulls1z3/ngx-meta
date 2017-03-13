/**
 * Dependencies
 */
const $ = {};

$.path = require('path');

/**
 * Helper methods
 */
const root = function(args) {
  const ROOT = $.path.resolve(__dirname, '..');
  args = Array.prototype.slice.call(arguments, 0);

  return $.path.join.apply($.path, [ROOT].concat(args));
};

/**
 * Exports
 */
exports.root = root;
