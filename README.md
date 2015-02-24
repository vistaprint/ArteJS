ArteJS [![Build Status](https://secure.travis-ci.org/vistaprint/ArteJS.png?branch=master)](http://travis-ci.org/vistaprint/ArteJS)
======

ArteJS is a powerful, extensible, configurable, flexible and cross-browser rich text editor with a simple API that produces consistent, valid and concise html.

[ArteJS Examples / Documentation](http://vistaprint.github.io/ArteJS/ "ArteJS Examples / Documentation")

### Options

You can initialize your Arte editor with some custom options, passing a literal object in the first argument.

```js
$("#editor").Arte(options);
```

The available options are listed below with their default values:

```js
$("#editor").Arte({

    // Set of initial styles applied to rich text editor
    styles: {
        "min-height": "200px",
        "height": "inherit"
    },

    // Collection of classes applied to rich text editor
    classes: [],

    // Initial value of the text editor
    value: "Please enter text ...",

    // Editor Type: plain text or rich text
    editorType: "plainText",

    // attach event handlers
    on: null
});
```

### Commands

After you initialize your Arte editor, you can call commands:

```js
var arte = $("#editor").Arte(options);

// make the selection bold
arte.Arte("bold");

// set the fontsize of the selection to 12px
arte.Arte("fontSize", "12px");

// Alternative:

arte.each(function() {
    this.bold();
    this.fontSize("12px");
});

```
