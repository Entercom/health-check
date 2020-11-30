'use strict';

const lib = require('../.');

describe('lib', function () {
  const fn = lib;

  it('returns default case', function () {
    fn({});
  });
});
