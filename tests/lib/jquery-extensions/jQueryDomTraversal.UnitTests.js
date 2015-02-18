$(document).ready(function() {
    var suiteName = "jQuery-dom-traversal";
    QUnit.module(suiteName + ".isBlock");
    unitTestHelper.executeTestCollectionSimple(isBlockTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = element.is(":block");
        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".isElement");
    unitTestHelper.executeTestCollectionSimple(isElementTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = element.is(":element");
        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".isBlockChildren");
    unitTestHelper.executeTestCollectionSimple(isBlockChildrenTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = element.is(":blockChildren");
        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".closestWithAtMostOneBlockChild");
    unitTestHelper.executeTestCollectionSimple(closestWithAtMostOneBlockChildTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.closestWithAtMostOneBlockChild(element);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".prevIncludingTextNodes");
    unitTestHelper.executeTestCollectionSimple(prevSiblingIncludingTextNodesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.prevSiblingIncludingTextNodes(element);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".nextIncludingTextNodes");
    unitTestHelper.executeTestCollectionSimple(nextSiblingIncludingTextNodesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.nextSiblingIncludingTextNodes(element, testData.options);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".closestWithCommand");
    unitTestHelper.executeTestCollectionSimple(closestWithCommandTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.closestWithCommand(element, testData.options);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".closestWithCommandValue");
    unitTestHelper.executeTestCollectionSimple(closestWithCommandValueTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.closestWithCommandValue(element, testData.options);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".hasSameListParent");
    unitTestHelper.executeTestCollectionSimple(hasSameListParentTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.hasSameListParent(element, testData.options);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".getClasses");
    unitTestHelper.executeTestCollectionSimple(getClassesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.getClasses(element, testData.options);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".getStyles");
    unitTestHelper.executeTestCollectionSimple(getStylesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.getStyles(element, testData.options);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".hasClassWithPattern");
    unitTestHelper.executeTestCollectionSimple(hasClassWithPatternTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.hasClassWithPattern(element, testData.options.command.classNameRegex);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".getClassWithPattern");
    unitTestHelper.executeTestCollectionSimple(getClassWithPatternTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.getClassWithPattern(element, testData.options.command.classNameRegex);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".removeClassWithPattern");
    unitTestHelper.executeTestCollectionSimple(removeClassWithPatternTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.removeClassWithPattern(element, testData.options.command.classNameRegex);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".allHaveClass");
    unitTestHelper.executeTestCollectionSimple(allHaveClassTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.allHaveClass(element, testData.options.className);

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".hasSameStyles");
    unitTestHelper.executeTestCollectionSimple(hasSameStylesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.hasSameStyle(element, $(testData.options.otherElement));

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".hasSameClasses");
    unitTestHelper.executeTestCollectionSimple(hasSameClassesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.hasSameClass(element, $(testData.options.otherElement));

        return testData.evaluateResult(result);
    });

    QUnit.module(suiteName + ".hasSameStylesAndClasses");
    unitTestHelper.executeTestCollectionSimple(hasSameStylesAndClassesTestData, function(testData) {
        unitTestHelper.setup(testData);
        var element = unitTestHelper.getElement(testData);

        var result = testData.op ?
                testData.op(element) :
                $.Arte.dom.hasSameStyleAndClass(element, $(testData.options.otherElement));

        return testData.evaluateResult(result);
    });
});

var sampleContent = [
    "Text Node",
    "<br id=\"br\"/>",
    "  ",
    "<span id=\"span\">Content in Span</span>",
    "Another Text Node",
    "<span id=\"blockSpan\" style=\"display:block\">Content in Span</span>",
    "<div id=\"div\">Content in Div</div>",
    "<ol id=\"ol\">",
    "<li id=\"li1\">Li 1</li>",
    "<li id=\"li2\">Li 2</li>",
    "<li id=\"li3\">Li 3<span id=\"spanInLi3\">data</span></li>",
    "</ol>",
    "<ol id=\"ol2\">",
    "<li id=\"li21\">Li 1</li>",
    "<li id=\"li22\">Li 2<span id=\"spanInLi22\">data</span></li>",
    "<li id=\"li23\">Li 3</li>",
    "</ol>",
    "<p id=\"pWithBr\">Content in P<br /></p>",
    "<div id=\"divWithPAndSpan\"><p>Content in Div then P</p><span>text</span></div>",
    "<div id=\"divWithPMultiLevel\"><p>Content in Div then P<p>XY<p>AB</p></p></p></div>",
    "<div id=\"divWithPMultiLevelSpanEnd\"><p>Content in Div then P<p>XY<p>AB<span>XYZ</span></p></p></p></div>",
    "<div id=\"divWithPMultiLevelSpanMid\"><p>Content in Div then P<p>XY<span>XYZ</span><p>AB</p></p></p></div>",
    "<p id=\"pWithBrRelativeToParent\">Content in P<br id=\"brWithParentP\" /></p>",
    "<div id=\"divWithP\" style=\"color: red\" class=\"arte-font-style-italic\"><p >Content in Div then P</p></div>",
    "<div id=\"divWithSpan\" style=\"color:black;\" class=\"arte-font-style-italic arte-font-size-10\">" +
        "<span id=\"spanWithParentDiv\">Content in Span</span></div>",
    "<div id=\"divWithSpans\" style=\"color:black;\" class=\"arte-font-style-italic arte-font-size-10\">" +
        "<span id=\"firstSpan\" style=\"color: black; font-family: Arial\">test</span>" +
        "<span id=\"spanWithParentDivAndSibling\" class=\"arte-font-color-red\">Content in Span</span></div>",
    "<div id=\"divWithSpanAndDiv\"><div>test</div><span id=\"spanWithParentDivAndDivSibling\">Content in Span</span></div>",
    "<div id=\"divWithSpanAndDivAndBr\"><div>test</div><span id=\"spanWithBrAndParentDivAndDivSibling\">Content in Span" +
        "<br /></span></div>",
    "<div id=\"divWithSpanAndInnerSpan\"><span id=\"innerSpan\"><span id=\"innerInnerSpan\">Content in inner inner span" +
        "</span></span></div>",
    "<div id=\"divMultiLevelOuttermost\"><div id=\"divMultiLevelInnermost\"><p id=\"pMultiLevel\">" +
        "<span id=\"spanMultiLevel\">Some Content</span></p></div></div>"
];
var isBlockTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            return result === false;
        }
    },
    {
        name: "br",
        rawContent: sampleContent.join(""),
        elementId: "br",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "span",
        rawContent: sampleContent.join(""),
        elementId: "span",
        evaluateResult: function(result) {
            return result === false;
        }
    },
    {
        name: "blockSpan",
        rawContent: sampleContent.join(""),
        elementId: "blockSpan",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "div",
        rawContent: sampleContent.join(""),
        elementId: "div",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "ol",
        rawContent: sampleContent.join(""),
        elementId: "ol",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "li",
        rawContent: sampleContent.join(""),
        elementId: "li1",
        evaluateResult: function(result) {
            return result === true;
        }
    }
];

var isElementTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            return result === false;
        }
    },
    {
        name: "br",
        rawContent: sampleContent.join(""),
        elementId: "br",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "span",
        rawContent: sampleContent.join(""),
        elementId: "span",
        evaluateResult: function(result) {
            return result === true;
        }
    }
];

var isBlockChildrenTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            return result === false;
        }
    },
    {
        name: "br",
        rawContent: sampleContent.join(""),
        elementId: "br",
        evaluateResult: function(result) {
            return result === false;
        }
    },
    {
        name: "div",
        rawContent: sampleContent.join(""),
        elementId: "div",
        evaluateResult: function(result) {
            return result === false;
        }
    },
    {
        name: "ol",
        rawContent: sampleContent.join(""),
        elementId: "ol",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "pWithBr",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        evaluateResult: function(result) {
            return result === true;
        }
    },
    {
        name: "divWithP",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        evaluateResult: function(result) {
            return result === true;
        }
    }
];

var closestWithAtMostOneBlockChildTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first().compareNodes(result);
        }
    },
    {
        name: "br",
        rawContent: sampleContent.join(""),
        elementId: "br",
        evaluateResult: function(result) {
            return $("#br").compareNodes(result);
        }
    },
    {
        name: "brWithParentP",
        rawContent: sampleContent.join(""),
        elementId: "brWithParentP",
        evaluateResult: function(result) {
            return $("#brWithParentP").compareNodes(result);
        }
    },
    {
        name: "div",
        rawContent: sampleContent.join(""),
        elementId: "div",
        evaluateResult: function(result) {
            return $("#div").compareNodes(result);
        }
    },
    {
        name: "ol",
        rawContent: sampleContent.join(""),
        elementId: "ol",
        evaluateResult: function(result) {
            return $("#ol").compareNodes(result);
        }
    },
    {
        name: "li",
        rawContent: sampleContent.join(""),
        elementId: "li2",
        evaluateResult: function(result) {
            return $("#li2").compareNodes(result);
        }
    },
    {
        name: "pWithBr",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        evaluateResult: function(result) {
            return $("#pWithBr").compareNodes(result);
        }
    },
    {
        name: "brWithParentP",
        rawContent: sampleContent.join(""),
        elementId: "brWithParentP",
        evaluateResult: function(result) {
            return $("#brWithParentP").compareNodes(result);
        }
    },
    {
        name: "divWithP",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        evaluateResult: function(result) {
            return $("#divWithP").compareNodes(result);
        }
    },
    {
        name: "spanWithParentDiv",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDiv",
        evaluateResult: function(result) {
            return $("#divWithSpan").compareNodes(result);
        }
    },
    {
        name: "spanWithParentDivAndSibling",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        evaluateResult: function(result) {
            return $("#divWithSpans").compareNodes(result);
        }
    },
    {
        name: "spanWithParentDivAndDivSibling",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndDivSibling",
        evaluateResult: function(result) {
            return $("#spanWithParentDivAndDivSibling").compareNodes(result);
        }
    },
    {
        name: "spanWithBrAndParentDivAndDivSibling",
        rawContent: sampleContent.join(""),
        elementId: "spanWithBrAndParentDivAndDivSibling",
        evaluateResult: function(result) {
            return $("#spanWithBrAndParentDivAndDivSibling").compareNodes(result);
        }
    },
    {
        name: "innerInnerSpan",
        rawContent: sampleContent.join(""),
        elementId: "innerInnerSpan",
        evaluateResult: function(result) {
            return $("#divWithSpanAndInnerSpan").compareNodes(result);
        }
    },
    {
        name: "absoluteTopLevelCeilingMultiLevel",
        rawContent: sampleContent.join(""),
        elementId: "spanMultiLevel",
        op: function(jElement) {
            return $.Arte.dom.closestWithAtMostOneBlockChild(jElement, $("#editableDiv"), null);
        },
        evaluateResult: function(result) {
            return $("#divMultiLevelOuttermost").compareNodes(result);
        }
    }
];

var prevSiblingIncludingTextNodesTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "textNodeWithBrAfterSelected",
        rawContent: sampleContent.join(""),
        elementId: "br",
        evaluateResult: function(result) {
            return result.get(0).nodeValue === "Text Node";
        }
    },
    {
        name: "OlBeforeP",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        evaluateResult: function(result) {
            return result.compareNodes($("#ol2"));
        }
    },
    {
        name: "liSibling",
        rawContent: sampleContent.join(""),
        elementId: "li3",
        evaluateResult: function(result) {
            return $("#li2").compareNodes(result);
        }
    },
    {
        name: "firstLi",
        rawContent: sampleContent.join(""),
        elementId: "li1",
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "divOutterWithFilteredWhiteSpaceSibling",
        rawContent: sampleContent.join(""),
        elementId: "span",
        op: function(jElement) {
            var noEmptyTextNodesFilter = function(index, element) {
                return !(element.nodeType === 3 && element.nodeValue.match(/^\s*$/ig));
            };
            return $.Arte.dom.prevSiblingIncludingTextNodes(jElement, noEmptyTextNodesFilter);
        },
        evaluateResult: function(result) {
            return $("#br").compareNodes(result);
        }
    }
];

var nextSiblingIncludingTextNodesTestData = [
    {
        name: "textNode",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            return result.compareNodes($("#br"));
        }
    },
    {
        name: "textNodeAfterSpan",
        rawContent: sampleContent.join(""),
        elementId: "span",
        evaluateResult: function(result) {
            // TODO: Did you mean to return a conditional instead of an assignment?
            return result.get(0).nodeValue = "Another Text Node";
        }
    },
    {
        name: "textNodeSelectedWithBrAfter",
        rawContent: sampleContent.join(""),
        elementId: "div",
        evaluateResult: function(result) {
            return $("#ol").compareNodes(result);
        }
    },
    {
        name: "liSibling",
        rawContent: sampleContent.join(""),
        elementId: "li2",
        evaluateResult: function(result) {
            return $("#li3").compareNodes(result);
        }
    },
    {
        name: "noNextToLastLi",
        rawContent: sampleContent.join(""),
        elementId: "li3",
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "lastDiv",
        rawContent: sampleContent.join(""),
        elementId: "divMultiLevelOuttermost",
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "filteringOfEmptyNode",
        rawContent: sampleContent.join(""),
        elementId: "br",
        op: function(jElement) {
            var noEmptyTextNodesFilter = function(index, element) {
                return !(element.nodeType === 3 && element.nodeValue.match(/^\s*$/ig));
            };
            return $.Arte.dom.nextSiblingIncludingTextNodes(jElement, noEmptyTextNodesFilter);
        },
        evaluateResult: function(result) {
            return $("#span").compareNodes(result);
        }
    }
];

var closestWithCommandTestData = [
    {
        name: "textNodeNoStyle",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            styleName: "color"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithNoFontWeight",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "font-weight"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithFontFamily",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "font-family"
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.length === 1 && styles["font-family"];
        }
    },
    {
        name: "spanWithColor",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "color"
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.length === 1 && styles.color;
        }
    },
    {
        name: "spanWithNoClassName",
        rawContent: sampleContent.join(""),
        elementId: "innerSpanWithStyle",
        options: {
            className: "arte-font-color-red"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithClassName",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-color-red"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-color-red");
        }
    },
    {
        name: "spanWithDifferentClassName",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-color-black"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-color-red");
        }
    },
    {
        name: "spanWithStyleAtParent",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            styleName: "font-style"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-style-italic");
        }
    },
    {
        name: "spanWithClassAtParent",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-style-italic"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-style-italic");
        }

    },
    {
        name: "spanWithCommandClassAtParent",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-size-15"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-size-10");
        }
    },
    {
        name: "spanWithCommand",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            commandName: "fontSize"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-size-10");
        }
    }
];
var closestWithCommandValueTestData = [
    {
        name: "textNodeNoStyle",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            styleName: "color"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithNoFontWeight",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "font-weight"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithFontFamily",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "font-family",
            styleValue: "arial"
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.length === 1 && styles["font-family"] === "arial";
        }
    },
    {
        name: "spanWithColor",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "color",
            styleValue: "black"
        },
        evaluateResult: function(result) {
            var styles = $.Arte.dom.getStyles(result);
            return result.length === 1 && styles.color === "black";
        }
    },
    {
        name: "spanWithWrongColor",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            styleName: "color",
            styleValue: "red"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithNoClassName",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",
        options: {
            className: "arte-font-color-red"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithClassName",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-color-red"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-color-red");
        }
    },
    {
        name: "spanWithDifferentClassName",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-color-black"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithStyleAtParent",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            styleName: "font-style",
            styleValue: "italic"
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "spanWithClassAtParent",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-style-italic"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-style-italic");
        }

    },
    {
        name: "spanWithCommandClassAtParent",
        rawContent: sampleContent.join(""),
        elementId: "spanWithParentDivAndSibling",
        options: {
            className: "arte-font-size-10"
        },
        evaluateResult: function(result) {
            return result.length === 1 && result.hasClass("arte-font-size-10");
        }
    }
];

var hasSameListParentTestData = [
    {
        name: "sameList",
        rawContent: sampleContent.join(""),
        elementId: "editableDiv",
        op: function() {
            var selectedArray = $();
            selectedArray = selectedArray.add($("#spanInLi3"));
            selectedArray = selectedArray.add($("#li1"));

            return $.Arte.dom.hasSameListParent(selectedArray);
        },
        evaluateResult: function(result) {
            return result;
        }
    },
    {
        name: "spansInTwoDifferentLists",
        rawContent: sampleContent.join(""),
        elementId: "editableDiv",
        op: function() {
            var selectedArray = $();
            selectedArray = selectedArray.add($("#spanInLi3"));
            selectedArray = selectedArray.add($("#spanInLi22"));

            return $.Arte.dom.hasSameListParent(selectedArray);
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "twoDifferentLists",
        rawContent: sampleContent.join(""),
        elementId: "editableDiv",
        op: function() {
            var selectedArray = $();
            selectedArray = selectedArray.add($("#li2"));
            selectedArray = selectedArray.add($("#spanInLi22"));

            return $.Arte.dom.hasSameListParent(selectedArray);
        },
        evaluateResult: function(result) {
            return !result;
        }
    }
];

var getClassesTestData = [
    {
        name: "textNodeNoClasses",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        operation: function(jElement) {
            return jElement.getClasses();
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "elementNoClasses",
        rawContent: sampleContent.join(""),
        elementId: "span",
        operation: function(jElement) {
            return jElement.getClasses();
        },
        evaluateResult: function(result) {
            return result.length === 0;
        }
    },
    {
        name: "elementOneClass",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        operation: function(jElement) {
            return jElement.getClasses();
        },
        evaluateResult: function(result) {
            return result.length === 1 && result[0] === "arte-font-style-italic";
        }
    },
    {
        name: "elementMultipleClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        operation: function(jElement) {
            return jElement.getClasses();
        },
        evaluateResult: function(result) {
            return result.length === 2 && result[0] === "arte-font-style-italic" &&
                result[1] === "arte-font-size-10";
        }
    }
];
var getStylesTestData = [
    {
        name: "textNodeNoStyle",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        evaluateResult: function(result) {
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    return false;
                }
            }

            return true;
        }
    },

    {
        name: "elementNoStyles",
        rawContent: sampleContent.join(""),
        elementId: "span",

        evaluateResult: function(result) {
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    return false;
                }
            }

            return true;
        }
    },

    {
        name: "elementOneStyle",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",

        evaluateResult: function(result) {
            return result.color === "red";
        }
    },
    {
        name: "elementMutiStyles",
        rawContent: sampleContent.join(""),
        elementId: "firstSpan",

        evaluateResult: function(result) {
            return result.color === "black" && result["font-family"] === "arial";
        }
    }
];

var hasClassWithPatternTestData = [
    {
        name: "textNodeNoClass",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            command: $.Arte.configuration.commands.bold
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementNoClass",
        rawContent: sampleContent.join(""),
        elementId: "span",
        options: {
            command: $.Arte.configuration.commands.bold
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementOneClass",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            command: $.Arte.configuration.commands.italic
        },
        evaluateResult: function(result) {
            return result;
        }
    },
    {
        name: "elementMultipleClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        options: {
            command: $.Arte.configuration.commands.fontSize
        },
        evaluateResult: function(result) {
            return result;
        }
    }
];
var getClassWithPatternTestData = [
    {
        name: "textNodeNoClass",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#editableDiv").contents().filter(function() {
                return this.nodeType === 3 && $.trim(this.nodeType) !== "";
            }).first();
        },
        options: {
            command: $.Arte.configuration.commands.bold
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementNoClass",
        rawContent: sampleContent.join(""),
        elementId: "span",
        options: {
            command: $.Arte.configuration.commands.bold
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementOneClass",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            command: $.Arte.configuration.commands.italic
        },
        evaluateResult: function(result) {
            return result[0] === "arte-font-style-italic";
        }
    },
    {
        name: "elementMultipleClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        options: {
            command: $.Arte.configuration.commands.fontSize
        },
        evaluateResult: function(result) {
            return result[0] === "arte-font-size-10";
        }
    }
];
var removeClassWithPatternTestData = [
    {
        name: "elementNoClass",
        rawContent: sampleContent.join(""),
        elementId: "span",
        options: {
            command: $.Arte.configuration.commands.bold
        },
        evaluateResult: function() {
            var command = $.Arte.configuration.commands.bold;
            return !$.Arte.dom.hasClassWithPattern($("#" + removeClassWithPatternTestData[0].elementId), command.classNameRegex);
        }
    },
    {
        name: "elementOneClass",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            command: $.Arte.configuration.commands.italic
        },
        evaluateResult: function() {
            var command = $.Arte.configuration.commands.italic;
            return !$.Arte.dom.hasClassWithPattern($("#" + removeClassWithPatternTestData[1].elementId), command.classNameRegex);
        }
    },
    {
        name: "elementMultipleClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        options: {
            command: $.Arte.configuration.commands.fontSize
        },
        evaluateResult: function() {
            var command = $.Arte.configuration.commands.fontSize;
            return !$.Arte.dom.hasClassWithPattern($("#" + removeClassWithPatternTestData[2].elementId), command.classNameRegex);
        }
    }
];
var allHaveClassTestData = [
    {
        name: "elementNoClasses",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        options: {
            className: "arte-font-style-italic"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementOneClass",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            className: "arte-font-style-italic"
        },
        evaluateResult: function(result) {
            return result;
        }
    },
    {
        name: "elementOneClassNeg",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            className: "arte-font-style-x"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "multiElementWithClasses",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#divWithP").add($("#divWithSpan"));
        },
        options: {
            className: "arte-font-style-italic"
        },
        evaluateResult: function(result) {
            return result;
        }
    },
    {
        name: "multiElementWithClassesNeg",
        rawContent: sampleContent.join(""),
        targetElement: function() {
            return $("#divWithP").add($("#divWithSpan"));
        },
        options: {
            className: "arte-font-size-10"
        },
        evaluateResult: function(result) {
            return !result;
        }
    }
];
var hasSameStylesTestData = [
    {
        name: "elementNoStyle",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        options: {
            otherElement: "#span"
        },
        evaluateResult: function(result) {
            return result;
        }
    },
    {
        name: "elementDifferentStyles",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        options: {
            otherElement: "#divWithP"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementDifferentStyles2",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            otherElement: "#pWithBr"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementDifferentStyles3",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            otherElement: "#divWithSpans"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementSameStyles",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        options: {
            otherElement: "#divWithSpans"
        },
        evaluateResult: function(result) {
            return result;
        }
    }
];
var hasSameClassesTestData = [
    {
        name: "elementNoClasses",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        options: {
            otherElement: "#span"
        },
        evaluateResult: function(result) {
            return result;
        }
    },
    {
        name: "elementDifferentClasses",
        rawContent: sampleContent.join(""),
        elementId: "pWithBr",
        options: {
            otherElement: "#divWithP"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementDifferentClasses2",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            otherElement: "#pWithBr"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementDifferentClasses3",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            otherElement: "#divWithSpans"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementSameClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        options: {
            otherElement: "#divWithSpans"
        },
        evaluateResult: function(result) {
            return result;
        }
    }
];
var hasSameStylesAndClassesTestData = [
    {
        name: "elementDiffStyleAndClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithP",
        options: {
            otherElement: "#divWithSpans"
        },
        evaluateResult: function(result) {
            return !result;
        }
    },
    {
        name: "elementSameStyleAndClasses",
        rawContent: sampleContent.join(""),
        elementId: "divWithSpan",
        options: {
            otherElement: "#divWithSpans"
        },
        evaluateResult: function(result) {
            return result;
        }
    }
];
