const _isEmpty = require('lodash/isEmpty'),
  bluebird = require('bluebird');

/**
 * Render all info and errors
 * @param allInfo
 * @param allErrors
 * @returns {function(*, *): Promise<unknown>}
 */
function render(allInfo, allErrors) {
  return function (req, res) {
    let info = {};
    let errors = allErrors || {};

    return bluebird.all(Object.keys(allInfo).map(function(key) {
      const value = allInfo[key];
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

module.exports = render;
