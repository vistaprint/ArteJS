ArteJS [![Build Status](https://secure.travis-ci.org/vistaprint/ArteJS.png?branch=master)](http://travis-ci.org/vistaprint/ArteJS)
======

ArteJS is a powerful, extensible, configurable, flexible and cross-browser rich text editor with a simple API that produces consistent, valid and concise html.

Authors: See [Authors.txt](https://github.com/vistaprint/ArteJSblob/master/AUTHORS.txt)
License: Apache

## Usage, Demos, Docs

ArteJS [Examples](http://vistaprint.github.io/ArteJS/#Examples) / [Detailed Documentation](http://vistaprint.github.io/ArteJS/)

### Basic Usage

To use ArteJS in your project, you’ll need to load the following files:

jQuery 1.7.3 up to 1.9.1 (1.10+ support is currently in-progress),
`dist/rangy.js`, and either `dist/arte.js` or the minified version `dist/arte.min.js`:

```
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="dist/rangy.js"></script>
<script src="dist/arte.min.js"></script>
```

Then, invoke the script as follows:

```
jQuery(function($) {
    var arte = $('#my-editor').Arte();
});
```

## Issues

If you find a bug in ArteJS, please add it to the [issue tracker](https://github.com/vistaprint/ArteJS/issues).

## Browser Support

TK

## Contributing

For detailed information on contributing to ArteJS, check out our [CONTRIBUTING.md](https://github.com/vistaprint/ArteJS/blob/master/CONTRIBUTING.md)

### Quickstart Guide

First, ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

Test that Grunt's CLI is installed by running `grunt --version`.  If the command isn't found, run `npm install -g grunt-cli`.  For more information about installing Grunt, see the [getting started guide](http://gruntjs.com/getting-started).

1. Fork and clone the repo.
1. Run `npm install` to install all dependencies (including Grunt).
1. Run `grunt all` to build the project.
