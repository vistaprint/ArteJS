ArteJS [![Build Status](https://secure.travis-ci.org/vistaprint/ArteJS.png?branch=master)](http://travis-ci.org/vistaprint/ArteJS)
======

ArteJS is a powerful, extensible, flexible and cross-browser rich text editor that is designed to product  consistent, valid and concise html.  

# Overview #
ArteJS is an integral part of VistaPrint’s DIY product design experience that allows adding rich text to a document that eventually gets printed.  This imposes a stringent requirement on the output of the rich text editor.  Most of the rich text editors we evaluated either did not allow any control on the resultant markup or were simply buggy/incomplete.  

In addition, ArteJS provide many other features that are expected of a modern rich text editor library.

- A simple and intuitive jQuery like API.
    $(".editor").Arte(); // Turns .editor into rich text editor
    $(“.editor”).bold();
    $(“.editor”).fontSize(10);
 
- A minimum number of external dependencies. Requires jQuery and Rangy 1.2.3+.
- Full control over the resultant HTML : TODO: Links to examples with Classes/Styles/Tags for a command
- A loosely coupled architecture based on a plugins that can be used overwrite any existing or add new functionality.  In fact, a large part of the functionality is built using plugins.
- ArteJS supports a clean interface for toolbar integration. TODO: Link to reference toolbar implementations that can support multiple editors with a single toolbar or one toolbar for each editor.
- Semantically concise and valid markup: e.g. no redundant styles, classes or tags.
- A rich event model provide a rich integration point. TODO: Link to supported events
- Keyboard shortcut integration
- State detection so that it's easy to figure out the state of selected html.
- Highly granular [configuration](https://github.com/vistaprint/ArteJS/blob/master/Editor/core/Configuration.js).
- Copy/paste functionality from Microsoft Word.
- Open sourced so it's free--ArteJS is available on an Apache2 license.
- Most importantly, ArteJS is used in [production](http://www.vistaprint.com/vp/ns/studio3.aspx?pf_id=B73&combo_id=1032234) millions of times a day

# Dependencies #
Arte depends on jQuery (1.9+) and Rangy (1.2.3+).

# Compatibility #
Arte has been tested on the following browsers:

-  Chrome
-  Firefox (3.6+)
-  IE(7+)
-  Safari
-  Opera(11+)
-  Mobile Safari
-  Android Webkit
-  Mobile IE 7

# Getting Started #
## Include scripts and markup
    <script src=".../jquery-1.9.1.js"></script>
    <!-- Selection and range api (Included with ArteJS)-->
    <script src=".../Rangy.min.js"></script>
    <!-- Rich text editor -->
    <script src=".../Arte.min.js"></script>

## Add Markup to host the editor
    <!-- Create a div to host the rich text editor -->
    <div id="editor"></div>

## Initialize the ArteJS editor
    $("#editor").RTE({ value: "Enter your text .." });

# Examples #

[ArteJS Examples / Documentation:](http://vistaprint.github.io/ArteJS/ "ArteJS Examples / Documentation")

# Compiling the Javascript #

ArteJS uses [Grunt](http://gruntjs.com/ "Grunt") to minify, combine, analyze code and run unit tests.  

- [Install Node](http://nodejs.org/download/ "Install node")
- Clone the git repository
- Install Dependencies: Navigate to the ArteJS directory, and execute "npm install"
- Build ArteJS: Execute "Grunt all"

[Other Grunt tasks:](https://github.com/vistaprint/ArteJS/blob/master/Gruntfile.js "Other grunt tasks")
