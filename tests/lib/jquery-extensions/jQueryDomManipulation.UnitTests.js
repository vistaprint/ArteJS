$(document).ready(function() {
    var suiteName = "jQuery-dom-manipulation";
    module(suiteName + ".wrapWithBlock");
    unitTestHelper.executeTestCollectionSimple(wrapWithBlockTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);
        var result = $.Arte.dom.wrapWithBlock(element, testData.options);
        return $.Arte.dom.closestWithAtMostOneBlockChild(result);
    });

    module(suiteName + ".unwrapWithBlock");
    unitTestHelper.executeTestCollectionSimple(unwrapBlockTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);
        var result = $.Arte.dom.unwrapBlock(element, testData.options);
        return testData.evaluateResult(result);
    });

    module(suiteName + ".wrapWithOptions");
    unitTestHelper.executeTestCollectionSimple(wrapWithOptionsTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);
        var result = $.Arte.dom.wrapWithOptions(element, testData.options);
        return testData.evaluateResult(result);
    });

    module(suiteName + ".unWraprWithOptions");
    unitTestHelper.executeTestCollectionSimple(unWrapWithOptionsTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);
        var result = $.Arte.dom.unwrapWithOptions(element, testData.options);
        return testData.evaluateResult(result);
    });

    module(suiteName + ".createContainer");
    unitTestHelper.executeTestWithOp(createContainerTestData);
});

var sampleContent = [
    'Text Node',
    '<span id="span">Content in Span</span>',
    '<div id="div">Content in Div</div>',
    '<ol id="ol"><li id="li1">Li 1</li><li id="li2">Li 2</li><li id="li3"><div id="div" style="text-align: left;">Li 3</div></li></ol>',
    '<ol id="ol2"><li id="li4">Li 4</li></ol>',
    '<div id="divWithStyle" style="text-align: left;">Text Node</div>',
    '<div id="divWithSpan" style="text-align: left;"><span id="span">Content in Span</span></div>',
    '<div id="divWithDiv" style="text-align: left;"><div id="div2">Content in Div</div></div>'
];

var wrapWithBlockTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(''),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            tagName: $.Arte.constants.tagName.DIV,
            styleName: "text-align",
            styleValue: "left"
        },
        evaluateResult: function(result) {
            var style = $("<div/>").css("text-align", "left").attr("style");
            return (result.is("div") && result.attr("style") === style);
        }
    },
    {
        name: "spanWithInnerText",
        rawContent: sampleContent.join(''),
        elementId: "span",
        options: {
            tagName: $.Arte.constants.tagName.DIV,
            styleName: "text-align",
            styleValue: "left"
        },
        evaluateResult: function(result) {
            var style = $("<div/>").css("text-align", "left").attr("style");
            return (result.is("div") && result.attr("style") === style);
        }
    },
    {
        name: "divWithInnerText",
        rawContent: sampleContent.join(''),
        elementId: "div",
        options: {
            tagName: $.Arte.constants.tagName.DIV,
            styleName: "text-align",
            styleValue: "left"
        },
        evaluateResult: function(result) {
            var style = $("<div/>").css("text-align", "left").attr("style");
            return result.attr("style") === style;
        }
    },
    {
        name: "liInnerText",
        rawContent: sampleContent.join(''),
        targetElement: function() {
            return $("#li1").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            applierTagName: $.Arte.constants.tagName.DIV,
            styleName: "text-align",
            styleValue: "left"
        },
        evaluateResult: function(result) {
            var style = $("<div/>").css("text-align", "left").attr("style");
            return (result.is("li") && result.attr("style") === style);
        }
    },
    {
        name: "applyStyleToOlWithOneLi",
        rawContent: sampleContent.join(''),
        options: {
            applierTagName: $.Arte.constants.tagName.DIV,
            styleName: "text-align",
            styleValue: "left"
        },
        targetElement: function() {
            return $("#li4").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            var style = $("<div/>").css("text-align", "left").attr("style");
            return (result.is("ol") && result.attr("style") === style);
        }
    },
    {
        name: "wrapWithLi",
        rawContent: sampleContent.join(''),
        options: {
            applierTagName: $.Arte.constants.tagName.LI,
            styleName: "text-align",
            styleValue: "left"
        },
        targetElement: function() {
            return $("#div").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            var style = $("<div/>").css("text-align", "left").attr("style");
            return result.is("li") && result.children().has('div') && result.attr("style") === style;
        }
    }
];

var unwrapBlockTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(''),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            styleName: "text-align",
            styleValue: "left"
        },
        evaluateResult: function(result) {
            // Return the node itself
            return result.length && result.get(0).nodeType === 3;
        }
    },
    {
        name: "divWithInnerTextUnwrap",
        rawContent: sampleContent.join(''),
        elementId: "divWithStyle",
        options: {
            commandName: "textAlign",
            styleName: "text-align"
        },
        evaluateResult: function(result) {
            return (result.length && $.isEmptyObject($.Arte.dom.getStyles(result)));
        }
    },
    {
        name: "divWithInnerSpan",
        rawContent: sampleContent.join(''),
        elementId: "divWithSpan",
        options: {
            commandName: "textAlign",
            styleName: "text-align"
        },
        evaluateResult: function(result) {
            return (result.length && $.isEmptyObject($.Arte.dom.getStyles(result)));
        }
    },
    {
        name: "divWithInnerDivOuterSelected",
        rawContent: sampleContent.join(''),
        elementId: "divWithDiv",
        options: {
            commandName: "textAlign",
            styleName: "text-align"
        },
        evaluateResult: function(result) {
            return (result.length && $.isEmptyObject($.Arte.dom.getStyles(result)));
        }
    },
    {
        name: "divWithInnerDivInnerSelected",
        rawContent: sampleContent.join(''),
        elementId: "div2",
        options: {
            commandName: "textAlign",
            styleName: "text-align"
        },
        evaluateResult: function(result) {
            // The unwrap operation should removed the div with text-align style applied
            return (result.get(0) && result.parent().attr("contenteditable"));
        }
    },
    {
        name: "divWithInnerDivInnerSelected2",
        rawContent: sampleContent.join(''),
        elementId: "divWithStyle",
        options: {
            commandName: "textAlign",
            styleName: "text-align"
        },
        evaluateResult: function(result) {
            return (result.length && $.isEmptyObject($.Arte.dom.getStyles(result)));
        }
    }
];

var wrapWithOptionsTestData = [
    {
        name: "wrapWithSpan",
        rawContent: sampleContent.join(''),
        elementId: "span",
        options: {
            applierTagName: "span",
            styleName: "font-weight",
            styleValue: "bold"
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.is("span") && styles["font-weight"] === 'bold';
        }
    },
    {
        name: "wrapWithDiv",
        rawContent: sampleContent.join(''),
        elementId: "span",
        options: {
            applierTagName: "div",
            styleName: "font-weight",
            styleValue: "bold"
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.is("div") && styles["font-weight"] === 'bold';
        }
    },
    {
        name: "wrapWithB",
        rawContent: sampleContent.join(''),
        elementId: "span",
        options: {
            applierTagName: "b"
        },
        evaluateResult: function(result) {
            return result.is("b");
        }
    },
    {
        name: "wrapWithDivAndRangyTags",
        rawContent: sampleContent.join(''),
        options: {
            applierTagName: "span"
        },
        targetElement: function() {
            var element = $("#span");
            var rangyClassName = $.Arte.configuration.rangySelectionBoundaryClassName;
            element.before($("<span>").addClass(rangyClassName))
                .after($("<span>").addClass(rangyClassName));
            return element;
        },
        evaluateResult: function(result) {
            return result.is("span") && result.contents().length === 3;
        }
    }

];
var unWrapWithOptionsTestData = [
    {
        name: "unwrapDiv",
        rawContent: sampleContent.join(''),
        elementId: "divWithStyle",
        evaluateResult: function(result) {
            return result.get(0).nodeType === $.Arte.constants.nodeType.TEXT;
        }
    },
    {
        name: "unwrapDivMaintainStyles",
        rawContent: sampleContent.join(''),
        elementId: "divWithStyle",
        options: {
            maintainStyles: 1
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.is("span") && styles['text-align'] === 'left';
        }
    },
    {
        name: "unwrapDivInsertBr",
        rawContent: sampleContent.join(''),
        elementId: "div",
        options: {
            insertBr: 1
        },
        evaluateResult: function(result) {
            return result.get(0).nodeType === $.Arte.constants.nodeType.TEXT && $(result.get(0).previousSibling).is("br");
        }
    },
    {
        name: "unwrapDivInsertBrNeg",
        rawContent: sampleContent.join(''),
        elementId: "divWithStyle",
        options: {
            insertBr: 1
        },
        evaluateResult: function(result) {
            return result.get(0).nodeType === $.Arte.constants.nodeType.TEXT
                && !result.prev().is("br")
                && !result.next().is("br");
        }
    }
];
var createContainerTestData = [
    {
        name: "span",
        rawContent: sampleContent.join(''),
        elementId: "span",
        operation: function() {
            return $.Arte.dom.createContainer({
                applierTagName: "span"
            });
        },
        evaluateResult: function(result) {
            return result.is("span");
        }
    },
    {
        name: "spanWithStyle",
        rawContent: sampleContent.join(''),
        elementId: "span",
        operation: function() {
            return $.Arte.dom.createContainer({
                applierTagName: "span",
                styleName: "font-weight",
                styleValue: "bold"
            });
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.is("span") && styles["font-weight"] === "bold";
        }
    },
    {
        name: "divWithClass",
        rawContent: sampleContent.join(''),
        elementId: "span",
        operation: function() {
            return $.Arte.dom.createContainer({
                applierTagName: "div",
                className: "arte-font-weight-bold"
            });
        },
        evaluateResult: function(result) {
            return result.is("div") && result.hasClass("arte-font-weight-bold");
        }
    },
    {
        name: "divWithClassAndStyles",
        rawContent: sampleContent.join(''),
        elementId: "span",
        operation: function() {
            return $.Arte.dom.createContainer({
                applierTagName: "div",
                className: "arte-font-weight-bold",
                styleName: "font-weight",
                styleValue: "bold"
            });
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.is("div") && result.hasClass("arte-font-weight-bold") && styles["font-weight"] === "bold";
        }
    },
    {
        name: "divWithAttr",
        rawContent: sampleContent.join(''),
        elementId: "span",
        operation: function() {
            return $.Arte.dom.createContainer({
                applierTagName: "div",
                attr: {
                    "class": "arte-font-weight-bold"
                }
            });
        },
        evaluateResult: function(result) {
            return result.is("div") && result.hasClass("arte-font-weight-bold");
        }
    }
];
