ArteJS [![Build Status](https://secure.travis-ci.org/vistaprint/ArteJS.png?branch=master)](http://travis-ci.org/vistaprint/ArteJs)
======

Arte is a powerful, extensible, flexible and cross-browser rich text editor that is designed to product  consistent, valid and concise html.  

Arte is an integral part of VistaPrint’s DIY product design experience that allows adding rich text to a document that eventually gets printed on a physical products.  This imposes a stringent requirement on the output of the editor.  Most of the rich text editors we evaluated either did not allow any control on the resultant markup or were simply buggy.  

In addition, Arte provides is built to provide many other features that are expected of a modern rich text editor library.

- A simple and intuitive jQuery like API.
For example $(“.editor”).bold() or $(“.editor”).fontSize(10);
- A minimum number of external dependencies. Requires jQuery and Rangy 1.2.3+.
- A loosely coupled architecture based on a plugins that can be used overwrite any existing or add new functionality.  In fact, a large part of the functionality is built using plugins.
- Arte supports a clean interface for toolbar integration. TODO: Link to reference toolbar implementations that can support multiple editors with a single toolbar or one toolbar for each editor.
- Semantically concise and valid markup: e.g. no redundant styles, classes or tags.
- A rich event model.
Events provide a rich integration point. TODO: Link to supported events
- Keyboard shortcut integration
- State detection so that it's easy to figure out the state of selected html.
- Highly granular configuration.
- Copy/paste functionality from Microsoft Word.
- Open sourced so it's free--RTE.js is available on an Apache2 license.
- Most importantly, Arte is used in production millions of times a day


