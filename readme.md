Health Check
=======

Health-check middleware for Express.

Returns either HTTP 200 or 500.

Features
- Fetches fields asynchronously (in parallel)
- Supports Promises
- Reports errors individually
- Custom and optional (non-failing) fields

## Usage

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck());
```

exposes `/health-check` with the following information:

```json
{
}
```

### Environment variables

Environment variables can be reported if they're useful.

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  env: [
    'REDIS_HOST',
    'ELASTIC_HOST'
  ]
}));
```

### Custom fields

Can add custom fields to be reported.  Thrown errors in custom fields will return a 500.

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  stats: {
    searchExists: function () {
      var searchService = require('./search');

      return searchService && searchService.ping();
    }
  }
}));
```

### Required fields

Missing fields will return a 500.

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  required: [
    'host',
    'someName',
    'REDIS_HOST'
  ],
  stats: {
    someName: someFunction
  },
  env: [
    'REDIS_HOST'
  ]
}));
```

## Install

```bash
npm install --save @nymdev/health-check
```
