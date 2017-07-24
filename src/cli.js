const parseArgs = require('minimist');
const chalk = require('chalk');
const fs = require('fs');
const netrc = require('node-netrc');
const htd = require('./index');

function help() {
  console.info('Usage: htd --app APP [--file FILE] [--username USERNAME] [--password PASSWORD]');
  console.info('');
  console.info('Required arguments:');
  console.info('  -a APP, --app APP                 Heroku application name.');
  console.info('');
  console.info('Optional arguments:');
  console.info('  -f FILE, --file FILE              Path to tarball file');
  console.info('  -u USERNAME, --username USERNAME  Heroku username, default: git');
  console.info('  -p PASSWORD, -k PASSWORD,');
  console.info('    --password PASSWORD             Heroku user password or API key (if not set, readed from file .netrc');
}

function error(message, exitCode = 1) {
  console.error(chalk.red(`ERROR: ${message}`));
  console.info('');
  help();
  process.exit(exitCode);
}

const argsOpts = {
  boolean: ['verbose'],
  string: [
    'app',
    'file',
    'key',
  ],
  alias: {
    app: 'a',
    file: 'f',
    username: 'u',
    password: ['p', 'k'],
    verbose: 'v',
  },
  default: {
    file: 'build.tgz',
    username: 'git',
    verbose: false,
  },
};
const argv = parseArgs(process.argv.slice(2), argsOpts);

if (!argv.app) {
  error('An app name is required.', 2);
}

if (!fs.existsSync(argv.file)) {
  error(`File "${argv.file}" does not exists or is not readable.`, 3);
}

const credentials = {};
if (argv.password) {
  credentials.username = argv.username;
  credentials.password = argv.password;
} else {
  const nrc = netrc('api.heroku.com');
  credentials.username = nrc.login;
  credentials.password = nrc.password;
}

htd({
  app: argv.app,
  file: argv.file,
  credentials,
  logger: argv.verbose ? console : null,
})
  .catch((err) => {
    console.error(chalk.red('Unknown error:', err));
    process.exit(1);
  });
