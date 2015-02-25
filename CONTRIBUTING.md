# Contributing

## Project Scope
ArteJS is a powerful, extensible, configurable, flexible and cross-browser rich text editor with a simple API that produces consistent, valid and concise html.

## Code License

ArteJS is an open source project falling under the [Apache license](blob/master/LICENSE). By using, distributing, or contributing to this project, you accept and agree that all code within the ArteJS project are licensed under the Apache license.

## Working on ArteJS

### Issue Discussion

General ArteJS discussion takes place via [Gitter](https://gitter.im/vistaprint/ArteJS), but issue threads are preferred for specific issues, so as to retain the history.

### Modifying the code
First, ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

Test that Grunt's CLI is installed by running `grunt --version`.  If the command isn't found, run `npm install -g grunt-cli`.  For more information about installing Grunt, see the [getting started guide](http://gruntjs.com/getting-started).

1. Fork and clone the repo.
1. Run `npm install` to install all dependencies (including Grunt).
1. Run `grunt` to grunt this project.

### Development Workflow

1. If no issue already exists for the work you’ll be doing, create one to document the problem(s) being solved and self-assign.
1. Create a new branch—please don't work in your `master` branch directly. We reccomend naming the branch to match the issue being addressed (`issue-777`).
1. Add failing tests for the change you want to make. Run `grunt` to see the tests fail.
1. Fix stuff.
1. Run `grunt` to see if the tests pass. Repeat steps 2-4 until done.
1. Open `test/*.html` unit test file(s) in actual browsers to ensure tests pass everywhere.
1. Update the documentation to reflect any changes.
1. Push to your fork or push your issue-specific branch to the main repo, then submit a pull request against `master`.
1. Once tested and +1’d by another team member (with no outstanding objections), self-merge into `master`.

### Versioning

This project uses [semantic versioning](http://semver.org/).

1. MAJOR version for incompatible API changes,
1. MINOR version for adding functionality in a backwards-compatible manner, and
1. PATCH version for backwards-compatible bug fixes.
Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

### Important notes

#### Code style
Regarding code style like indentation and whitespace, please follow the conventions you see used in the source already. These are actively enforced by a [JSCS](https://www.npmjs.com/package/jscs) Grunt task.

#### PhantomJS
While Grunt can and does run the included unit tests via [PhantomJS](http://phantomjs.org/), this shouldn't be considered a substitute for the real thing. Be sure to test the `tests/all.html` unit test file(s) in actual browsers.
