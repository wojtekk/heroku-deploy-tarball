var fs = require('fs');
var path = require('path');
var request = require('request');
var netrc = require('node-netrc');
var chalk = require('chalk');
var Chance = require('chance');
var chance = new Chance();

module.exports = function(config) {

  if (!config.app) {
    console.log(chalk.red('You must specify an app name.'));
    return;
  }

  if (!config.tarball) {
    console.log(chalk.red('You must specify a tarball.'));
    return;
  }

  var APP_URL = 'https://api.heroku.com/apps/' + config.app;

  var credentials = config.credentials;
  if(!credentials || !credentials.username || !credentials.password) {
    var nrc = netrc('api.heroku.com');
    credentials = {
      username: nrc.login,
      password: nrc.password
    };
  }

  var sourceConfig = {
    method: 'POST',
    url: APP_URL + '/sources',
    headers: {
      'Accept': 'application/vnd.heroku+json; version=3'
    },
    auth: credentials
  };

  console.log(chalk.blue('Getting source urls...'));
  request(sourceConfig, function(e, res, body) {
    if (!e) {
      if(res.statusCode >= 400) {
        return handleError(source, res);
      }
      console.log(chalk.green('SUCCESS!'));
      var source = JSON.parse(body);
      var tarball = fs.readFileSync(path.resolve(config.tarball));
      console.log(chalk.blue('Uploading tarball...'));
      request({
        method: 'PUT',
        url: source.source_blob.put_url,
        body: tarball
      }, function(e, res, body) {
        if (!e) {
          console.log(chalk.green('SUCCESS!'));
          console.log(chalk.blue('Creating build...'));
          request({
            method: 'POST',
            url: APP_URL + '/builds',
            headers: {
              'Accept': 'application/vnd.heroku+json; version=3'
            },
            auth: credentials,
            json: true,
            body: {
              source_blob: {
                url: source.source_blob.get_url,
                version: chance.hash()
              }
            }
          }, function(e, res, body) {
            if (!e) {
              console.log(chalk.green('SUCCESS!'));
            } else {
              handleError(e, res);
            }
          });
        } else {
          handleError(e, res);
        }
      });
    } else {
      handleError(e, res);
    }
  });

  function handleError(e, res) {
    console.log(chalk.red('Uh oh, something went wrong...'), e, res.statusCode);
  }

};
