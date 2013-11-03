// Karma configuration
// Generated on Wed Jun 12 2013 11:53:24 GMT-0400 (Eastern Daylight Time)


// base path, that will be used to resolve files and exclude
basePath = './';

files = [
    QUNIT,
    QUNIT_ADAPTER,
    { pattern: 'editor/unittests/jquery-current.js', included: true, watched: false, served: true },
    { pattern: 'editor/lib/rangy-1.2.3/*.js', included: true, watched: false, served: true },
    { pattern: 'editor/core/Arte.js', included: true, watched: false, served: true },
    { pattern: 'editor/core/TextArea.js', included: true, watched: false, served: true },
    { pattern: 'editor/core/Configuration.js', included: true, watched: false, served: true },
    { pattern: 'editor/core/**/*.js', included: true, watched: false, served: true },
    { pattern: 'editor/lib/jquery-extensions/*.js', included: true, watched: false, served: true },
    { pattern: 'editor/lib/rangy-extensions/*.js', included: true, watched: false, served: true },
    { pattern: 'editor/plugins/*.js', included: true, watched: false, served: true },
    { pattern: 'editor/unittests/**/*.js', included: true, watched: false, served: true }
],

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['coverage', 'junit'];

coverageReporter = {
    type: 'html',
    dir: 'reports/coverage/'
};

junitReporter = {
    dir: 'reports/coverage/',
    outputFile: 'reports/test-results.xml'
};

// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];

preprocessors = {
    'editor/core/**/*.js': 'coverage',
    'editor/lib/rangy-extensions/*.js': 'coverage',
    'editor/lib/jquery-extensions/*.js': 'coverage',
    'editor/plugins/*.js': 'coverage'
};


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
