'use strict';
const _get = require('lodash/get'),
  _isFunction = require('lodash/isFunction'),
  _isObject = require('lodash/isObject'),
  express = require('express'),
  render = require('./lib/render');

/**
 *
 * @param {object} [options]
 * @param {object} [options.info]  Hash of extra info to include with their functions or objects
 * @param {[string]} [options.env]  Environment Variables to include
 * @param {[string]} [options.required]  Info that will cause a 500 if missing
 * @param {[string]} [options.path]  Custom route for the health-check
 * @returns {*}
 */
function routes(options) {
  options = options || {};
  const errors = {},
    router = express.Router(),
    info = _get(options, 'info', {}),
    path = options.path || '';

  // shortcut to list environment variables
  _get(options, 'env', []).forEach(function (value) {
    info[value] = function () { return process.env[value]; };
  });

  // fail when these functions fail
  _get(options, 'required', []).forEach(function (value) {
    if (_isObject(info[value]) || _isFunction(info[value])) {
      info[value].isRequired = true;
    } else {
      errors[value] = 'Required stat ' + value + ' is not defined.';
    }
  });

  if (path) {
    // e.g. /microservice-name/health-check
    router.get('/' + path + '/health-check', render(info, errors));
  } else {
    router.get('/health-check', render(info, errors));
  }

  return router;
}

module.exports = routes;
