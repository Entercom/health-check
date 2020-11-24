'use strict';

const _assign = require('lodash/assign'),
  _each = require('lodash/each'),
  _get = require('lodash/get'),
  _isEmpty = require('lodash/isEmpty'),
  _isFunction = require('lodash/isFunction'),
  _isObject = require('lodash/isObject'),
  _map = require('lodash/map'),
  bluebird = require('bluebird'),
  express = require('express'),
  os = require('os');

let infoList = {
  nodeVersionActual: function () { return process.versions.node; },
  host: function () { return os.hostname(); }
};

/**
 * Render all info and errors
 * @param allInfo
 * @param allErrors
 * @returns {function(*, *): Promise<unknown>}
 */
function renderHealth(allInfo, allErrors) {
  return function (req, res) {
    let info = {};
    let errors = allErrors || {};

    return bluebird.all(_map(allInfo, function (value, key) {
      let promise = bluebird.try(value)
        .then(function (result) {
          info[key] = result;
        }).catch(function(ex) {
          // Track all errors instead of catching on the .all
          errors[key] = ex.message;
        });

      return promise;
    })).then(function () {
      let statusCode = 200;
      if (!_isEmpty(errors)) {
        info.errors = errors;
        statusCode = 500;
      }

      res.status(statusCode).send(info);
    });
  };
}

/**
 *
 * @param {express.Router} router
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
    info = _assign(options.info || {}, infoList),
    path = options.path || '';

  // shortcut to list environment variables
  _each(options.env, function (value) {
    info[value] = function () { return process.env[value]; };
  });

  // fail when these functions fail
  _each(options.required, function (value) {
    if (_isObject(info[value]) || _isFunction(info[value])) {
      info[value].isRequired = true;
    } else {
      errors[value] = 'Required stat ' + value + ' is not defined.';
    }
  });

  if (path) {
    // e.g. /microservice-name/health-check
    router.get('/' + path + '/health-check', renderHealth(info, errors));
  } else {
    router.get('/health-check', renderHealth(info, errors));
  }

  return router;
}

module.exports = routes;
module.exports.renderHealth = renderHealth;
