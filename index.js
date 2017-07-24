const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const netrc = require('node-netrc');
const chalk = require('chalk');
const Chance = require('chance');

const chance = new Chance();

module.exports = (config) => {
  function handleError(e) {
    console.log(chalk.red('Uh oh, something went wrong...'), e);
  }

  if (!config.app) {
    console.log(chalk.red('You must specify an app name.'));
    return;
  }

  if (!config.tarball) {
    console.log(chalk.red('You must specify a tarball.'));
    return;
  }

  const APP_URL = `https://api.heroku.com/apps/${config.app}`;

  let credentials = config.credentials;
  if (!credentials || !credentials.username || !credentials.password) {
    const nrc = netrc('api.heroku.com');
    credentials = {
      username: nrc.login,
      password: nrc.password,
    };
  }

  const sourceConfig = {
    method: 'POST',
    url: `${APP_URL}/sources`,
    headers: {
      Accept: 'application/vnd.heroku+json; version=3',
    },
    auth: credentials,
    json: true,
  };

  console.log(chalk.blue('Getting source urls...'));
  request(sourceConfig)
    .then((source) => {
      console.log(chalk.green('SUCCESS!'));
      const tarball = fs.readFileSync(path.resolve(config.tarball));
      console.log(chalk.blue('Uploading tarball...'));
      return request({
        method: 'PUT',
        url: source.source_blob.put_url,
        body: tarball,
      })
        .then(() => {
          console.log(chalk.green('SUCCESS!'));
          console.log(chalk.blue('Creating build...'));
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
                url: source.source_blob.get_url,
                version: chance.hash(),
              },
            },
          })
            .then(() => console.log(chalk.green('SUCCESS!')))
            .catch(err => handleError(err));
        })
        .catch(err => handleError(err));
    })
    .catch(err => handleError(err));
};
