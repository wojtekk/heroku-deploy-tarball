# Heroku Tarball Deploy [![npm version](https://badge.fury.io/js/heroku-traball-deploy.svg)](http://badge.fury.io/js/heroku-traball-deploy) [![Build Status](https://travis-ci.org/wojtekk/heroku-tarball-deploy.svg?branch=master)](https://travis-ci.org/wojtekk/heroku-tarball-deploy)

A library and CLI script for automating a deployment of a tarball (_tgz_ or _tar_ file) to Heroku.

## CLI tool

Instalation:

```bash
npm install heroku-tarball-deploy --global
```

### How to use

Usage:

```bash
htd --app APP [--file FILE] [--username USERNAME] [--password PASSWORD]
```

Required arguments:

* `-a APP`, `--app APP` - Heroku application name.

Optional arguments:

* `-a APP`, `--app APP` - Heroku application name.
* `-f FILE`, `--file FILE` - Path to tarball file
* `-u USERNAME`, `--username USERNAME` - Heroku username, default: `git`
* `-p PASSWORD`, `-k PASSWORD`, `--password PASSWORD` - Heroku user spassword or API key

### Library

Instalation:

```bash
npm install heroku-tarball-deploy --save
```

#### Usage

Example usage:

```javascript
const htd = require('heroku-tarball-deploy');

htd(opts)
  .then(() => console.log('Done'));
```

Available options:

* `app*` - _required_, Heroku application name
* `file` - path to file (_tgz_ or _tar_), default: `build.tgz`
* `credentials` - Heroku credentials
  * `username` - user name, use `git` if you pass Heroku API key as password, default: `git`
  * `password` - _required_, user password or Heroku API Key
* `logger` - logger object (compatible with `Console` - required methods: `error` and `info`)

## Authors

This tool based on a project [Rounded/heroku-deploy-tarball](https://github.com/Rounded/heroku-deploy-tarball) developed by [John Shanley](https://github.com/jshanley).
