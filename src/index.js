const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');
const Chance = require('chance');
const spy = require('through2-spy');

const chance = new Chance();

function deploy(opts) {
  if (!opts.app) {
    return Promise.reject(new Error('You must specify an app name.'));
  }

  if (!opts.file) {
    return Promise.reject(new Error('You must specify a file.'));
  }

  const APP_URL = `https://api.heroku.com/apps/${opts.app}`;

  const credentials = opts.credentials;

  const INFO = 'info';
  const ERROR = 'error';

  function log(type, message, ...rest) {
    if (opts.logger && typeof opts.logger[type] === 'function') {
      opts.logger[type](message, ...rest);
    }
  }

  function getConfig() {
    log(INFO, 'Getting configuration ...');

    const sourceConfig = {
      method: 'POST',
      url: `${APP_URL}/sources`,
      headers: {
        'Content-Type': '',
        Accept: 'application/vnd.heroku+json; version=3',
      },
      auth: credentials,
      json: true,
    };

    return request(sourceConfig)
      .then(source => Object.assign({}, {
        putUrl: source.source_blob.put_url,
        getUrl: source.source_blob.get_url,
      }))
      .catch((err) => {
        log(ERROR, 'Error ocured', err);
        throw err;
      });
  }

  function uploadFile(config) {
    log(INFO, 'Uploading a file ..');

    const tarball = fs.readFileSync(path.resolve(opts.file));

    return request({
      method: 'PUT',
      url: config.putUrl,
      body: tarball,
    })
      .then(() => config)
      .catch((err) => {
        log(ERROR, 'Error ocured', err);
        throw err;
      });
  }

  function createBuild(config) {
    log(INFO, 'Creating a build ...');

    return request({
      method: 'POST',
      url: `${APP_URL}/builds`,
      headers: {
        Accept: 'application/vnd.heroku+json; version=3',
      },
      auth: credentials,
      json: true,
      body: {
        source_blob: {
          url: config.getUrl,
          version: chance.hash(),
        },
      },
    })
      .then(res => Object.assign({}, {
        id: res.id,
        outputStreamUrl: `${res.output_stream_url}`,
        status: res.status,
      }))
      .catch((err) => {
        log(ERROR, 'Error ocured', err);
        throw err;
      });
  }

  function waitUntilBuildFinished(build) {
    log(INFO, 'Building an image ...');

    const req = request({
      method: 'GET',
      url: build.outputStreamUrl,
      auth: credentials,
    });

    return req.pipe(spy(chunk => log(INFO, chunk.toString('utf8'))));
  }

  return getConfig()
    .then(uploadFile)
    .then(createBuild)
    .then(waitUntilBuildFinished);
}

module.exports = deploy;
