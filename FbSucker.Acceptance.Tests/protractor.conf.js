exports.config = {
    specs: ['spec/*.js'],
    jasmineNodeOpts: {
        showColors: true,
        silent: true
    },
    baseUrl: 'http://localhost:8080',
    onPrepare: function() {
        var specReporter = require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new specReporter({ displayStackTrace: false }));
        require('jasmine-reporters');
        jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter('results/', true, true));

        var htmlReporter = require('protractor-html-screenshot-reporter');
        jasmine.getEnv().addReporter(new htmlReporter({ baseDirectory: 'screenshots' }));
    }
}