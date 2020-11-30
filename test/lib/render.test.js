'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  lib = require('../../lib/render'),
  sinon = require('sinon');

describe('renderHealth', function () {
  const fn = lib;

  it('returns default case', function () {
    const stats = {},
      resultFn = fn(stats),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.send, {});
    });
  });

  it('returns default case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); }
      },
      errors = {},
      resultFn = fn(stats, errors),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd' });
    });
  });

  it('fails error case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); },
        e: function () { return bluebird.reject(new Error('f')); }
      },
      errors = {},
      resultFn = fn(stats, errors),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd', errors: { e: 'f' } });
    });
  });

  it('fails required error case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); },
        e: _.assign(function () { return bluebird.reject(new Error('f')); }, {isRequired: true})
      },
      errors = {},
      resultFn = fn(stats, errors),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd', errors: { e: 'f' } });
    });
  });

  it('fails required missing case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); }
      },
      errors = {
        e: 'f'
      },
      resultFn = fn(stats, errors),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd', errors: { e: 'f' } });
    });
  });

  it('fails required missing and error case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); },
        e: _.assign(function () { return bluebird.reject(new Error('f')); }, {isRequired: true})
      },
      errors = {
        g: 'h'
      },
      resultFn = fn(stats, errors),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd', errors: { e: 'f', g: 'h' } });
    });
  });
});
