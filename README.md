# heroku-deploy-tarball [![npm version](https://badge.fury.io/js/heroku-deploy-tarball.svg)](http://badge.fury.io/js/heroku-deploy-tarball)

A tiny script for automating the deployment of a tarball to heroku.

## Installation

``` shell
npm install heroku-deploy-tarball
```

## Usage

### Example: Single Target

*deploy.js*
``` javascript
var deploy = require('heroku-deploy-tarball');

var config = {
  app: 'my-heroku-app',
  tarball: 'path/to/build.tar.gz'
}

deploy(config);
```

*shell*

``` shell
node deploy
```


### Example: Multiple Targets

*deploy.js*
```javascript
var deploy = require('heroku-deploy-tarball');

var requestedTarget = process.argv[2];

if (!requestedTarget) {
  console.log('You must specify a deploy target');
  return;
}

var targets = {
  staging: {
    app: 'my-heroku-staging-app',
    tarball: 'build.tar.gz'
  },
  production: {
    app: 'my-heroku-production-app',
    tarball: 'build.tar.gz'
  }
};

deploy(targets[requestedTarget]);
```

*shell*
``` shell
node deploy staging
```
