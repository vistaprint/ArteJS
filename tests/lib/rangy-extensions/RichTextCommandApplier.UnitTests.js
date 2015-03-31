$(document).ready(function() {
    var suiteName = "Arte.RichTextCommandApplier";
    var executeRichTextCommandTest = function(testData) {
        $(TEST_ELEMENT_SELECTOR).Arte({
            styles: {},
            value: testData.rawContent
        }); // use default options

        var arte = $(TEST_ELEMENT_SELECTOR).data("Arte");

        if (testData.selection) {
            testData.selection(arte);
        } else {
            // create a selection
            unitTestHelper.createSelection(testData);
        }

        if (testData.op) {
            testData.op(arte);
        } else {
            // Execute the rich text command

            $.Arte.RichTextCommandApplier.createAndExecute($.extend(testData.options, {
                commandName: testData.commandName,
                textArea: arte
            }));
        }
        // Verify the results
        var result = unitTestHelper.isEqual({
            name: suiteName + " " + testData.name,
            expectedContent: $("<div>").html(testData.expectedContent),
            actualContent: $("<div>").html($(TEST_ELEMENT_SELECTOR).html())
        });

        $(TEST_ELEMENT_SELECTOR).html("");
        return result;
    };

    QUnit.module(suiteName + ".simpleSelection");
    unitTestHelper.executeTestCollectionSimple(simpleSelectionUnitTestData, function(testData) {
        return executeRichTextCommandTest(testData);
    });

    QUnit.module(suiteName + ".textSelection");
    unitTestHelper.executeTestCollectionSimple(textSelectionUnitTestData, function(testData) {
        return executeRichTextCommandTest(testData);
    });

    QUnit.module(suiteName + ".simpleSelectionMultiCommandTestData");
    unitTestHelper.executeTestCollectionSimple(simpleSelectionMultiCommandTestData, function(testData) {
        return executeRichTextCommandTest(testData);
    });

    QUnit.module(suiteName + ".richTextComplexSelectionMultiCommands");
    unitTestHelper.executeTestCollectionSimple(richTextComplexSelectionMultiCommandsTestData, function(testData) {
        return executeRichTextCommandTest(testData);
    });

    QUnit.module(suiteName + ".otherCommands");
    unitTestHelper.executeTestWithOpSimple(otherTestScenariosTestData);
});

// Unit tests with simple selection
var simpleSelectionUnitTestData = [{
    name: "makeBold",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rawContent: "SomeText",
    expectedContent: "<div style=\"font-weight: bold;\" >SomeText</div>"
}, {
    // Selects all of the content within the element with contentId = r
    name: "makeBoldContentInsideDiv",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rangeContentId: "s",
    rawContent: "<div id=\"s\">SomeText</div>",
    expectedContent: "<div style=\"font-weight: bold;\" >SomeText</div>"
}, {
    // Selects all of the content within the element with contentId = r
    name: "makeBoldContentBetweenDivs",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    startAfterId: "s",
    endBeforeId: "e",
    rawContent: "<div id=\"s\">Line 1</div> SomeText <div id=\"e\">Line 2 </div>",
    expectedContent: "<div id=\"s\">Line 1</div><span style=\"font-weight: bold;\" >SomeText</span><div id=\"e\">Line 2 </div>"
}, {
    // Selects all of the content within the element with contentId = r
    name: "makeBoldContentWithDivs",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    startBeforeId: "s",
    endAfterId: "e",
    rawContent: "<div id=\"s\">Line 1</div> SomeText <div id=\"e\">Line 2 </div>",
    expectedContent: "<div style=\"font-weight: bold;\"><div id=\"s\">Line 1</div>SomeText<div id=\"e\">Line 2</div></div>"
}, {
    name: "makeItalic",
    commandName: "italic",
    options: {
        styleName: "font-style",
        styleValue: "italic",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rawContent: "SomeText",
    expectedContent: "<div style=\"font-style: italic;\" >SomeText</div>"
}, {
    // Selects all of the content within the element with contentId = r
    name: "makeItalicContentInsideDiv",
    commandName: "italic",
    options: {
        styleName: "font-style",
        styleValue: "italic",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rangeContentId: "s",
    rawContent: "<div id=\"s\">SomeText</div>",
    expectedContent: "<div style=\"font-style: italic;\" >SomeText</div>"
}, {
    // Selects all of the content within the element with contentId = r
    name: "makeItalicContentBetweenDivs",
    commandName: "italic",
    options: {
        styleName: "font-style",
        styleValue: "italic",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    startAfterId: "s",
    endBeforeId: "e",
    rawContent: "<div id=\"s\">Line 1</div> SomeText <div id=\"e\">Line 2 </div>",
    expectedContent: "<div id=\"s\">Line 1</div><span style=\"font-style: italic;\" >SomeText</span><div id=\"e\">Line 2 </div>"
}, {
    // Selects all of the content within the element with contentId = r
    name: "makeItalicContentWithDivs",
    commandName: "italic",
    options: {
        styleName: "font-style",
        styleValue: "italic",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    startBeforeId: "s",
    endAfterId: "e",
    rawContent: "<div id=\"s\">Line 1</div> SomeText <div id=\"e\">Line 2 </div>",
    expectedContent: "<div style=\"font-style: italic;\"><div id=\"s\">Line 1</div>SomeText<div id=\"e\">Line 2</div></div>"
}, {
    name: "createUnorderedListWithLineBreaks",
    options: {
        applierTagName: "UL"
    },
    commandName: "unorderedList",
    rawContent: "Line 1<br/>Line 2<br/>Line3",
    expectedContent: "<ul><li>Line 1</li><li>Line 2</li><li>Line3</li></ul>"
}, {
    name: "createUnorderedListWithDivs",
    commandName: "unorderedList",
    options: {
        applierTagName: "UL"
    },
    rawContent: "<div>Line 1</div> <div>Line 2</div> <div>Line 3</div>",
    expectedContent: "<ul><li>Line 1</li><li>Line 2</li><li>Line 3</li></ul>"
}, {
    name: "createOrderedListWithLineBreaks",
    commandName: "orderedList",
    options: {
        applierTagName: "OL"
    },
    rawContent: "Line 1<br/>Line 2<br/>Line3",
    expectedContent: "<ol><li>Line 1</li><li>Line 2</li><li>Line3</li></ol>"
}, {
    name: "createOrderedListWithDivs2",
    commandName: "orderedList",
    options: {
        applierTagName: "OL"
    },
    rawContent: "<div>Line 1</div> SomeText",
    expectedContent: "<ol><li>Line 1</li><li>SomeText</li></ol>"
}, {
    name: "createOrderedListWithSpans",
    commandName: "orderedList",
    options: {
        applierTagName: "OL"
    },
    rawContent: "<span>Text 1</span><span>Text 2</span>",
    expectedContent: "<ol><li>Text 1Text 2</li></ol>"
}];

var textSelectionUnitTestData = [{
    name: "makePartOfTextBold",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rawContent: "SomeText",
    selection: function(arte) {
        var node = arte.$el.get(0).firstChild;
        unitTestHelper.createSelectionFromTextNodes(node, node, 2, 6); // range includes "meTe" from SomeText
    },
    expectedContent: "So<span style=\"font-weight: bold;\" >meTe</span>xt"
}, {
    name: "makePartOfTextAcrossSpansBold",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rawContent: "<span id=\"s1\">SomeText</span><span id=\"s2\">Other Test</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 2, 2); // range includes "meText" from span1 and "Ot" from span2
    },
    expectedContent: "So<span style=\"font-weight: bold; \">meText</span><span style=\"font-weight:bold\">Ot</span>her Test"
}, {
    name: "toggleBoldOnPartOfText",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\" >Line One</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node, 2, 7); // range includes "ne On"
    },
    expectedContent: "<span style=\"font-weight: bold;\" >Li</span>ne On<span style=\"font-weight: bold;\" >e</span>"
}, {
    name: "toggleBoldOnPartOfTextAcrossSpans",
    commandName: "bold",
    options: {
        styleName: "font-weight",
        styleValue: "bold",
        commandAttrType: $.Arte.constants.commandAttrType.styleName,
        applierTagName: "span"
    },
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\" >Line One</span><span id=\"s2\">Line Two</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 2, 3); // range includes "ne On" from s1 and "Lin" from s2
    },
    expectedContent: "<span id=\"s1\" style=\"font-weight: bold;\" >Line One</span><span style=\"font-weight: bold;\">Lin</span>e Two"
}];

var simpleSelectionMultiCommandTestData = [{
    name: "rightAlignCenterAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
    },
    expectedContent: "<div style=\"text-align: center;\">SomeText</div>"
}, {
    name: "centerAlignRightAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
    },
    expectedContent: "<div style=\"text-align: right;\">SomeText</div>"
}, {
    name: "rightAlignLeftAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
    },
    expectedContent: "<div style=\"text-align: left;\">SomeText</div>"
}, {
    name: "leftAlignRightAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
    },
    expectedContent: "<div style=\"text-align: right;\">SomeText</div>"
}, {
    name: "centerAlignLeftAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
    },
    expectedContent: "<div style=\"text-align: left;\">SomeText</div>"
}, {
    name: "leftAlignCenterAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
    },
    expectedContent: "<div style=\"text-align: center;\">SomeText</div>"
}, {
    name: "leftAlignRightAlignCenterAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
    },
    expectedContent: "<div style=\"text-align: center;\">SomeText</div>"
}, {
    name: "rightAlignLeftAlignCenterAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
    },
    expectedContent: "<div style=\"text-align: center;\">SomeText</div>"
}, {
    name: "centerAlignRightAlignLeftAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
    },
    expectedContent: "<div style=\"text-align: left;\">SomeText</div>"
}, {
    name: "toggleRightAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
    },
    expectedContent: "SomeText"
}, {
    name: "toggleLeftAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
    },
    expectedContent: "SomeText"
}, {
    name: "leftAlignRightAlignRightAlign",
    rawContent: "SomeText",
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            commandAttrType: $.Arte.constants.commandAttrType.styleName,
            applierTagName: "div",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "left"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "right"
        }));
    },
    expectedContent: "SomeText"
}, {
    name: "toggleOrderedListOnNestedOrderedList",
    rawContent: "<ol><li><ol><li>Line 2</li></ol></li><ol>",
    op: function(arte) {
        var options = {
            commandName: "orderedList",
            applierTagName: "OL",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "Line 2"
}, {
    /**
     * Note: the following test presents a scenarios that is not possible to create using the UI
     * So, block element applier looks at each block that includes the text node and wraps the it into a li
     * the lis are created around a number if it is doesn't have a suitable block parent <li>2</li> or around
     * the suitable parent like <li><div>1</div></li>
     */
    name: "createUnorderedListOnDivaster",
    rawContent: "<div>1</div><div>2<div>3</div>4<div><div>5</div>6</div><div>7</div></div>",
    op: function(arte) {
        var options = {
            commandName: "unorderedList",
            applierTagName: "UL",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li></ul>"
}, {
    name: "toggleUnorderedListOnListItemWithOrderedList",
    rawContent: "<li><div><ol><li>Line 1</li></ol></div></li>",
    op: function(arte) {
        var options = {
            commandName: "unorderedList",
            applierTagName: "UL",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);

    },
    expectedContent: "<li><ul><li>Line 1</li></ul></li>"
}, {
    name: "toggleListSeveralTimes",
    rawContent: "<div>Line 1</div><div>Line 2</div><span>Line 3</span>",
    op: function(arte) {
        var options = {
            commandName: "unorderedList",
            applierTagName: "UL",
            textArea: arte
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute($.extend({}, options, {
            commandName: "orderedList",
            applierTagName: "OL"
        }));
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "Line 1<br/>Line 2<br/>Line 3"
}];

var richTextComplexSelectionMultiCommandsTestData = [{
    name: "rightAlignCenterAlignPartOfText",
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span><br/>Line Two",
    selection: function() {
        var node = $("#s1").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node, 2, 6); // range includes "ne On"
    },
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            textArea: arte,
            applierTagName: "P"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute($.extend(options, {
            styleValue: "center"
        }));
    },
    expectedContent: "<p style=\"text-align: center; font-weight: bold;\">Line One</p>Line Two"
}, {
    name: "leftAlignPartOfTextAcrossSpans",
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span><span id=\"s2\">Line Two</span>",
    selection: function() {
        // Give a text node, select a subset of the text
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 2, 3); // range includes "ne On" from s1 and "Lin" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "left",
            textArea: arte,
            applierTagName: "P"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "<div style=\"text-align: left;\"><span id=\"s1\" style=\"font-weight: bold;\">Line One</span>Line Two</div>"
}, {
    name: "toggleLeftAlignOnPartOfTextAcrossSpans",
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\" >Line One</span><span>" +
        "<span id=\"s2\"style=\"font-weight: bold;\" >Lin</span>e Two</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 2, 3); // range includes "ne On" from s1 and "Lin" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "left",
            textArea: arte,
            applierTagName: "P"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },

    expectedContent: "<div style=\"text-align: left;\"><span id=\"s1\" style=\"font-weight: bold;\" >Line One</span>" +
        "<span id=\"s2\" style=\"font-weight: bold;\" >Lin</span>e Two</div>"
}, {
    name: "toggleLeftAlignOnPartOfTextAcrossSpans2",
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span><span id=\"s2\">Line Two</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node, 2, 6); // range includes "ne On"
    },
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "left",
            textArea: arte,
            applierTagName: "P"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },

    expectedContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span>Line Two"
}, {
    name: "toggleRightAlignOnPartOfTextAcrossSpans",
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span><span id=\"s2\">Line Two</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 2, 3); // range includes "ne On" from s1 and "Lin" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "right",
            textArea: arte,
            applierTagName: "P"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },

    expectedContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span>Line Two"
}, {
    name: "toggleCenterAlignOnPartOfTextAcrossSpans",
    rawContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span><span id=\"s2\">Line Two</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 2, 3); // range includes "ne On" from s1 and "Lin" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "textAlign",
            styleName: "text-align",
            styleValue: "center",
            textArea: arte,
            applierTagName: "P"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },

    expectedContent: "<span id=\"s1\" style=\"font-weight: bold;\">Line One</span>Line Two"
}, {
    name: "toggleOrderedListOnPartOfOrderedList",
    rawContent: "<ol><li><span id=\"s1\">Line 1</span></li><li><span id=\"s2\">Line 2</span></li></ol> " +
        "<span id=\"s3\">ABC</span> <br/> <span id=\"s4\">DEF</span><br/><ul><li><span id=\"s5\">Line A</span>" +
        "</li><li><span id=\"s6\">Line B</span></li></ul> <span id=\"s7\">XYZ</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 0, 4); // Range includes "Line 1" from s1, and "Line" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "orderedList",
            textArea: arte,
            applierTagName: "OL"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "Line 1<br/>Line 2<br/> ABC <br/> DEF<br/><ul><li>Line A</li><li>Line B</li></ul>XYZ"
}, {
    name: "createUnorderedListFromPartOfOrderedList",
    rawContent: "<ol><li><span id=\"s1\">Line 1</span></li><li><span id=\"s2\">Line 2</span></li></ol> " +
        "<span id=\"s3\">ABC</span> <br/> <span id=\"s4\">DEF</span><br/><ul><li><span id=\"s5\">Line A</span>" +
        "</li><li><span id=\"s6\">Line B</span></li></ul> <span id=\"s7\">XYZ</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s2").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 0, 4); // Range includes "Line 1" from s1, and "Line" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "unorderedList",
            textArea: arte,
            applierTagName: "UL"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);

    },
    expectedContent: "<ul><li>Line 1</li><li>Line 2</li></ul> ABC <br/> DEF<br/><ul><li>Line A</li><li>Line B</li></ul>XYZ"
}, {
    name: "createUnorderedListFromOrderedListAndText",
    rawContent: "<ol><li><span id=\"s1\">Line 1</span></li><li><span id=\"s2\">Line 2</span></li></ol>" +
        "<span id=\"s3\">ABC</span><br/><span id=\"s4\">DEF</span><br/><ul><li><span id=\"s5\">Line A</span></li><li>" +
        "<span id=\"s6\">Line B</span></li></ul> <span id=\"s7\">XYZ</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s3").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 0, 3); // Range includes "Line 1" from s1, and "Line" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "unorderedList",
            textArea: arte,
            applierTagName: "UL"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "<ul><li>Line 1</li><li>Line 2</li><li>ABC</li></ul>DEF<br/><ul><li>Line A</li><li>Line B</li></ul>XYZ"
}, {
    name: "toggleUnorderedListFromOrderedListAndText",
    rawContent: "<ol><li><span id=\"s1\">Line 1</span></li><li><span id=\"s2\">Line 2</span></li></ol>" +
        "<span id=\"s4\">DEF</span><ul><li><span id=\"s5\">Line A</span></li><li><span id=\"s6\">Line B</span></li></ul> " +
        "<span id=\"s7\">XYZ</span>",
    selection: function() {
        var node = $("#s1").contents()[0];
        var node2 = $("#s3").contents()[0];
        unitTestHelper.createSelectionFromTextNodes(node, node2, 0, 3); // Range includes "Line 1" from s1, and "Line" from s2
    },
    op: function(arte) {
        var options = {
            commandName: "unorderedList",
            textArea: arte,
            applierTagName: "UL"
        };
        $.Arte.RichTextCommandApplier.createAndExecute(options);
        $.Arte.RichTextCommandApplier.createAndExecute(options);
    },
    expectedContent: "Line 1<ol><li>Line 2</li></ol>DEF<ul><li>Line A</li><li>Line B</li></ul> XYZ"
}];

var otherTestScenariosTestData = [{
    name: "invalidCommand",
    operation: function() {
        $(TEST_ELEMENT_SELECTOR).Arte({}); // use default options
        try {
            $.Arte.RichTextCommandApplier.createAndExecute({
                commandName: "InvalidCommandName",
                textArea: $(TEST_ELEMENT_SELECTOR).Arte().get(0)
            });
        } catch (e) {
            return true;
        }
        return false;
    },
    evaluateResult: function(result) {
        return result;
    }
}, {
    name: "noCommandName",
    operation: function() {
        $(TEST_ELEMENT_SELECTOR).Arte({}); // use default options
        try {
            $.Arte.RichTextCommandApplier.createAndExecute({
                textArea: $(TEST_ELEMENT_SELECTOR).Arte().get(0)
            });
        } catch (e) {
            return true;
        }
        return false;
    },
    evaluateResult: function(result) {
        return result;
    }
}];
