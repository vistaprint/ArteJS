$(document).ready(function() {
    module("rangy.rangy.inlineElementApplier.simpleInlineCommands");
    unitTestHelper.executeTestCollection(simpleInlineCommandsUnitTestData, function(testData) {
        $.extend(testData.options, {
            topEditableParent: $(TEST_ELEMENT_SELECTOR).find("[contenteditable=true]").get(0)
        });
        var range = unitTestHelper.createRange(testData);

        rangy.toggleStyleOnRange(range, testData.options);

        $.Arte.dom.cleanup($('[contenteditable="true"]'));
    });

    module("rangy.rangy.inlineElementApplier.complexInlineCommands");
    complexInlineCommandUnitTests();
});

var inlineOptions = {
    applierTagName: "span",
    commandAttrType: $.Arte.constants.commandAttrType.styleName
};
var inlineOptionsWithFontWeight = $.extend({}, inlineOptions, {
    styleName: "font-weight",
    styleValue: "bold"
});
var inlineOptionsWithBTag = $.extend({}, inlineOptions, {
    applierTagName: $.Arte.constants.tagName.B,
    tagName: $.Arte.constants.tagName.B,
    commandAttrType: $.Arte.constants.commandAttrType.tagName
});
var inlineOptionsWithClassName = $.extend({}, inlineOptions, {
    className: "arte-font-weight-bold",
    commandAttrType: $.Arte.constants.commandAttrType.className
});

var inlineOptionsWithFontStyle = $.extend({}, inlineOptions, {
    styleName: "font-style",
    styleValue: "italic"
});
var inlineOptionsWithColor = $.extend({}, inlineOptions, {
    styleName: "color",
    styleValue: "red"
});

var inlineOptionsWithFontSize = $.extend({}, inlineOptions, {
    styleName: "font-size",
    styleValue: "12px"
});

var inlineOptionsWithFontFamily = $.extend({}, inlineOptions, {
    styleName: "font-family",
    styleValue: "georgia"
});


var simpleInlineCommandsUnitTestData = [
    {
        // Bold With Style name
        name: 'boldText',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div style="font-weight: bold; ">Some Text</div>',
        options: inlineOptionsWithFontWeight
    },
    {
        name: 'multiNodeBold',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<span> with another span inside of it</span> and more text at the end</span>',
        expectedContent: '<div style="font-weight: bold; ">Some text with another span inside of it and more text at the end</div>',
        options: inlineOptionsWithFontWeight
    },
    {
        name: 'multiNodeBoldNoMerge',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<u> with another span inside of it</u> and more text at the end</span>',
        expectedContent: '<span style="font-weight: bold; ">Some text</span><u><span style="font-weight: bold; " > with another span inside of it</span></u><span style="font-weight: bold; "> and more text at the end</span>',
        options: inlineOptionsWithFontWeight
    },
    {
        name: 'multiNodeBoldWithBlocks',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text with another span inside of it<br/> and more text at the end</span>',
        expectedContent: '<span style="font-weight: bold; ">Some text with another span inside of it</span><br/><span style="font-weight: bold; "> and more text at the end</span>',
        options: inlineOptionsWithFontWeight
    },
    {
        name: 'undoBoldNode',
        rangeContentId: 'r',
        rawContent: '<span id="r" style="font-weight: bold;">A Long text line for test</span>',
        expectedContent: 'A Long text line for test',
        options: inlineOptionsWithFontWeight
    },
    {
        name: 'undoBoldItalicNode',
        rangeContentId: 'r',
        rawContent: '<span id="r" style="font-weight: bold; font-style: italic;">A Long text line for test</span>',
        expectedContent: '<div style="font-style: italic;">A Long text line for test</div>',
        options: inlineOptionsWithFontWeight
    },
    {
        // Bold With B Tag name
        name: 'boldTextWithTag',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div><b>Some Text</b></div>',
        options: inlineOptionsWithBTag
    },
    {
        name: 'undoBoldNodeWithTag',
        rangeContentId: 'r',
        rawContent: '<b id="r">A Long text line for test</b>',
        expectedContent: 'A Long text line for test',
        options: inlineOptionsWithBTag
    },
    {
        name: 'undoBoldItalicNodeWithTag',
        rangeContentId: 'r',
        rawContent: '<span id="r" style="font-style: italic;"> <b>A Long text line for test</b></span>',
        expectedContent: '<div style="font-style: italic;">A Long text line for test</div>',
        options: inlineOptionsWithBTag
    },
    {
        name: 'undoOuterBoldItalicNodeWithTag',
        rangeContentId: 'r',
        rawContent: '<b><span id="r" style="font-style: italic;">A Long text line for test</span></b>',
        expectedContent: '<div style="font-style: italic;">A Long text line for test</div>',
        options: inlineOptionsWithBTag
    },
    {
        name: 'undoOuterBoldItalicNodeWithTag2',
        rangeContentId: 'r',
        rawContent: '<b><i id="r">A Long text line for test</i></b>',
        expectedContent: '<div><i id="r">A Long text line for test</i></div>',
        options: inlineOptionsWithBTag
    },
    {
        name: 'undoInnerBoldItalicNodeWithTag',
        rangeContentId: 'r',
        rawContent: '<i id="r"><b>A Long text line for test</b></i>',
        expectedContent: '<div><i id="r">A Long text line for test</i></div>',
        options: inlineOptionsWithBTag
    },
    {
        // Bold With class name
        name: 'boldTextWithClass',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div class="arte-font-weight-bold">Some Text</div>',
        options: inlineOptionsWithClassName
    },
    {
        name: 'undoBoldNodeWithClass',
        rangeContentId: 'r',
        rawContent: '<span id="r" class="arte-font-weight-bold">A Long text line for test</span>',
        expectedContent: 'A Long text line for test',
        options: inlineOptionsWithClassName
    },
    {
        name: 'undoBoldItalicNodeWithClassAndStyle',
        rangeContentId: 'r',
        rawContent: '<span id="r" style="font-style: italic;" class="arte-font-weight-bold"> A Long text line for test</span>',
        expectedContent: '<div style="font-style: italic;">A Long text line for test</div>',
        options: inlineOptionsWithClassName
    },
    {
        name: 'undoOuterBoldItalicNodeWithClass1',
        rangeContentId: 'r',
        rawContent: '<span class="arte-font-weight-bold"><span id="r" style="font-style: italic;">A Long text line for test</span></span>',
        expectedContent: '<div style="font-style: italic;">A Long text line for test</div>',
        options: inlineOptionsWithClassName
    },
    {
        name: 'undoOuterBoldItalicNodeWithClass2',
        rangeContentId: 'r',
        rawContent: '<span class="arte-font-weight-bold"><i id="r">A Long text line for test</i></b>',
        expectedContent: '<div><i id="r">A Long text line for test</i></div>',
        options: inlineOptionsWithClassName
    },
    {
        name: 'undoInnerBoldItalicNodeWithClass',
        rangeContentId: 'r',
        rawContent: '<i id="r"><span class="arte-font-weight-bold">A Long text line for test</span></i>',
        expectedContent: '<div><i id="r"><span class="">A Long text line for test</span></i></div>',
        options: inlineOptionsWithClassName
    },
    {
        name: 'undoInnerBoldItalicNodeWithMultipleClasses',
        rangeContentId: 'r',
        rawContent: '<span id="r" class="arte-font-weight-bold arte-font-style-italic">A Long text line for test</span>',
        expectedContent: '<div class="arte-font-style-italic">A Long text line for test</div>',
        options: inlineOptionsWithClassName
    },

    {
        // Italic
        name: 'italicText',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div id="r" style="font-style: italic; ">Some Text</div>',
        options: inlineOptionsWithFontStyle
    },
    {
        name: 'multiNodeItalic',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<span> with another span inside of it</span> and more text at the end</span>',
        expectedContent: '<div style="font-style: italic; " >Some text with another span inside of it and more text at the end</div>',
        options: inlineOptionsWithFontStyle
    },
    {
        name: 'multiNodeItalicNoMerge',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<u> with another span inside of it</u> and more text at the end</span>',
        expectedContent: '<span style="font-style: italic; ">Some text</span><u><span style="font-style: italic; "> with another span inside of it</span></u><span style="font-style: italic ; " > and more text at the end</span>',
        options: inlineOptionsWithFontStyle
    },
    {
        name: 'multiNodeItalicWithBlocks',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text with another span inside of it<br/> and more text at the end</span>',
        expectedContent: '<span style="font-style: italic; ">Some text with another span inside of it</span><br/><span style="font-style: italic; " > and more text at the end</span>',
        options: inlineOptionsWithFontStyle
    },
    {
        // Color
        name: 'colorText',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div id="r" style="color: Red; ">Some Text</div>',
        options: inlineOptionsWithColor
    },
    {
        name: 'multiNodeColor',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<span> with another span inside of it</span> and more text at the end</span>',
        expectedContent: '<div style="color: Red; ">Some text with another span inside of it and more text at the end</div>',
        elementTagName: 'span',
        options: inlineOptionsWithColor
    },
    {
        name: 'multiNodeColorNoMerge',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<u> with another span inside of it</u> and more text at the end</span>',
        expectedContent: '<span style="color: Red; ">Some text</span><u><span style="color: Red; "> with another span inside of it</span></u><span style="color: Red; "> and more text at the end</span>',
        options: inlineOptionsWithColor
    },
    {
        name: 'multiNodeColorWithBlocks',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text with another span inside of it<br/> and more text at the end</span>',
        expectedContent: '<span style="color: Red; ">Some text with another span inside of it</span><br/><span style="color: Red; "> and more text at the end</span>',
        options: inlineOptionsWithColor
    },
    {
        name: 'changeFont',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div style="font-size: 12px; ">Some Text</div>',
        options: inlineOptionsWithFontSize
    },
    {
        name: 'multiNodeFont',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<span> with another span inside of it</span> and more text at the end</span>',
        expectedContent: '<div style="font-size: 12px;">Some text with another span inside of it and more text at the end</div>',
        options: inlineOptionsWithFontSize
    },
    {
        name: 'multiNodeFontNoMerge',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<u> with another span inside of it</u> and more text at the end</span>',
        expectedContent: '<span style="font-size: 12px; ">Some text</span><u><span style="font-size: 12px; "> with another span inside of it</span></u><span style="font-size: 12px; "> and more text at the end</span>',
        options: inlineOptionsWithFontSize
    },
    {
        name: 'multiNodeFontWithBlocks',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text with another span inside of it<br/> and more text at the end</span>',
        expectedContent: '<span style="font-size: 12px; ">Some text with another span inside of it</span><br/><span style="font-size: 12px;"> and more text at the end</span>',
        options: inlineOptionsWithFontSize
    },
    {
        name: 'fontFamily',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some Text</span>',
        expectedContent: '<div style="font-family: Georgia;">Some Text</div>',
        options: inlineOptionsWithFontFamily
    },
    {
        name: 'multiNodefontFamily',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<span> with another span inside of it</span> and more text at the end</span>',
        expectedContent: '<div style="font-family: Georgia;">Some text with another span inside of it and more text at the end</div>',
        options: inlineOptionsWithFontFamily
    },
    {
        name: 'multiNodefontFamilyNoMerge',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text<u> with another span inside of it</u> and more text at the end</span>',
        expectedContent: '<span style="font-family: Georgia; ">Some text</span><u><span style="font-family: Georgia; "> with another span inside of it</span></u><span style="font-family: Georgia; "> and more text at the end</span>',
        options: inlineOptionsWithFontFamily
    },
    {
        name: 'multiNodefontFamilyWithBlocks',
        rangeContentId: 'r',
        rawContent: '<span id="r">Some text with another span inside of it<br/> and more text at the end</span>',
        expectedContent: '<span style="font-family: Georgia; ">Some text with another span inside of it</span><br/><span style="font-family: Georgia;"> and more text at the end</span>',
        options: inlineOptionsWithFontFamily
    },
    {
        name: 'removeStyleFromBlockElement',
        rangeContentId: 'r',
        rawContent: '<div id="r" style="color: red">Some text</div>',
        expectedContent: '<div>Some text</div>',
        options: inlineOptionsWithColor
    },
    {
        name: 'removeStyleFromLIElement',
        rangeContentId: 'r',
        rawContent: '<ol><li id="r" style="color: red">Some text</li></ol',
        expectedContent: '<ol><li id="r">Some text</li></ol>',
        options: inlineOptionsWithColor
    }
];

function complexInlineCommandUnitTests() {
    var complexInlineCommandsUnitTestData = {
        splitBoldNode: {
            name: 'splitBoldNode',
            rangeContentId: 'r',
            rawContent: '<span id="r">A Long text line for test</span>',
            expectedContent: '<span style="font-weight: bold; ">A</span>Long<span style="font-weight: bold; "> text line for test</span>',
            options: inlineOptionsWithFontWeight
        },
        splitBoldItalicNode: {
            name: 'splitBoldItalicNode',
            rangeContentId: 'r',
            rawContent: '<span id="r">A Long text line for test</span>',
            expectedContent: '<span style="font-weight: bold; ">A </span><span style="font-style: italic; "><span style="font-weight: bold; ">Long </span>text <span style="font-weight: bold; ">line for</span></span><span style="font-weight: bold; "> test</span>',
            options: inlineOptionsWithFontWeight
        },
        changeFontFamilyOfSelection: {
            name: 'changeFontFamilyOfSelection',
            rangeContentId: 'r',
            rawContent: '<span id="r">Test line</span>',
            expectedContent: '<div style="font-family: arial; ">Test line</div>',
            elementTagName: 'span'
        },
        toggleFontFamilyOfSelection: {
            name: 'toggleFontFamilyOfSelection',
            rangeContentId: 'r',
            rawContent: '<span id="r">Test line</span>',
            expectedContent: 'Test line',
            options: inlineOptionsWithFontFamily
        }
    };
    module("rangy.rangy.inlineElementApplier.complexInlineCommands");
    test(complexInlineCommandsUnitTestData.splitBoldNode.name, function() {
        var testData = complexInlineCommandsUnitTestData.splitBoldNode;
        unitTestHelper.executeTest(testData, function() {
            var options = $.extend({}, testData.options, {
                topEditableParent: $("#editableDiv").get(0)
            });

            var range = unitTestHelper.createRange(testData);
            rangy.toggleStyleOnRange(range, options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
            // Select some text within the span and make it bold again
            var textElement = $("#editableDiv").contents()[0];
            unitTestHelper.createSelectionFromTextNodes(textElement, textElement, 2, 6);

            rangy.toggleStyleOnSelection(options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });
    test(complexInlineCommandsUnitTestData.splitBoldItalicNode.name, function() {
        var testData = complexInlineCommandsUnitTestData.splitBoldItalicNode;
        unitTestHelper.executeTest(testData, function() {
            var options = $.extend({}, testData.options, {
                topEditableParent: $("#editableDiv").get(0)
            });

            var range = unitTestHelper.createRange(testData);
            rangy.toggleStyleOnRange(range, options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));

            // Select some text within the span and make it bold again
            var textElement = $("#editableDiv").contents()[0];
            unitTestHelper.createSelectionFromTextNodes(textElement, textElement, 2, 20);

            rangy.toggleStyleOnSelection($.extend({}, inlineOptionsWithFontStyle, {
                topEditableParent: $("#editableDiv").get(0)
            }));
            $.Arte.dom.cleanup($('[contenteditable="true"]'));

            textElement = $("#editableDiv").find("span").contents()[0];
            unitTestHelper.createSelectionFromTextNodes(textElement, textElement, 5, 10);

            rangy.toggleStyleOnSelection(options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });
    test(complexInlineCommandsUnitTestData.changeFontFamilyOfSelection.name, function() {
        var testData = complexInlineCommandsUnitTestData.changeFontFamilyOfSelection;
        unitTestHelper.executeTest(testData, function() {
            var options = $.extend({}, inlineOptionsWithFontFamily, {
                topEditableParent: $("#editableDiv").get(0)
            });

            unitTestHelper.createSelection(testData);
            rangy.toggleStyleOnSelection(options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));

            testData.rangeContentId = '';
            unitTestHelper.createSelection(testData);
            rangy.toggleStyleOnSelection($.extend({}, options, {
                styleValue: "arial"
            }));
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });

    test(complexInlineCommandsUnitTestData.toggleFontFamilyOfSelection.name, function() {
        var testData = complexInlineCommandsUnitTestData.toggleFontFamilyOfSelection;
        unitTestHelper.executeTest(testData, function() {
            var options = $.extend({}, testData.options, {
                topEditableParent: $("#editableDiv").get(0)
            });

            unitTestHelper.createSelection(testData);
            rangy.toggleStyleOnSelection(options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));

            testData.rangeContentId = '';
            unitTestHelper.createSelection(testData);
            rangy.toggleStyleOnSelection(options);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });
}
