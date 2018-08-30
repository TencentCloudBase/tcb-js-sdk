const path = require('path');
const KarmaServer = require('karma').Server;
const isKarma = process.env.KARMA_ENV === 'karma';

if (isKarma) {
    let server = new KarmaServer({
        configFile: path.resolve('./tools/karma.conf.js'),
        singleRun: true
    }, (exitCode) => {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
        // opn(path.join(configWebpack.path.test, 'unit/coverage/lcov-report/index.html'));
    });
    server.start();
}
