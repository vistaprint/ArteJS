/*globals console*/
var unitTestHelper = {
    /* Test Setup: Create a content editable div and set the initial content for the test*/
    setup: function(data) {
        var div = $("<div>").attr({
            contenteditable: true,
            id: "editableDiv"
        }).html(data.rawContent);
        $(TEST_ELEMENT_SELECTOR).html(div);

        if (data.blockOptions) {
            data.blockOptions.topEditableParent = $(TEST_ELEMENT_SELECTOR).find("[contenteditable=true]").get(0);
        }
    },
    /* Teardown, remove the content from the test element */
    teardown: function() {},
    /* Compare the result of the rich text operation. */
    isEqual: function(options) {
        var isEqual = false;
        var expectedValue = "";
        var actualValue = "";
        var expected = options.expectedContent;
        var actual = options.actualContent;

        if (typeof (expected) === "string") {
            isEqual = expected === actual;
        } else if (typeof (expected) === "object" && expected.prop && expected.prop("nodeType")) {
            /**
            * During setup, we wrap the initial content with a content editable element.  If the top level expected element is a div,
            * add the content editable attribute or wrap the expected content into a contenteditable div for comparison.
            */
            if (!options.doNotApplyAttributes) {
                var contents = expected.contents();
                if (contents.get(0).nodeType === $.Arte.constants.nodeType.TEXT ||
                        contents.get(0).tagName !== "DIV" || contents.length > 1) {
                    expected = $("<div></div>").html(expected);
                }
                expected.children().first().attr({
                    contenteditable: true
                });

                if (options.elementId) {
                    expected.children().first().attr("id", options.elementId);
                }
            }

            isEqual = expected.compareNodes(actual);
            if (!isEqual) {
                expectedValue = expected.html();
                actualValue = actual.html();
            }
        } else {

        }

        if (!isEqual) {
            if (typeof console !== "undefined" && console && console.debug) {
                console.debug("----- Expected and actual values are not same ------");
                console.debug(options.name);
                console.debug("expected : " + expectedValue);
                console.debug("actual   : " + actualValue);
                console.debug("--------------------------------------------------------------------------");
            }
        }

        if (options.doAssert) {
            ok(isEqual);
        }

        return isEqual;
    },
    /**
    * Following are few way to create ranges
    * 1) specify rangeContentId : selects the content of the element with that id
    * 2) specify startAfterId and endBeforeId: selects the content between these two elements
    * 3) specify startBeforeId and endAfterId: selects the content of the elements and the content between the elements
    * 4) selects all content within the editableDiv
    */
    createRange: function(data) {
        var range = rangy.createRangyRange();
        if (data.rangeContentId) {
            range.selectNodeContents($("#" + data.rangeContentId)[0]);
        } else if (data.startAfterId && data.endBeforeId) {
            range.setStartAfter($("#" + data.startAfterId)[0]);
            range.setEndBefore($("#" + data.endBeforeId)[0]);
        } else if (data.startBeforeId && data.endAfterId) {
            range.setStartBefore($("#" + data.startBeforeId)[0]);
            range.setEndAfter($("#" + data.endAfterId)[0]);
        } else {
            // Select everything in the editable div
            range.selectNodeContents($(TEST_ELEMENT_SELECTOR + " [contenteditable='true']")[0]);
        }
        return range;
    },
    /**
    * Allows creating a range for text nodes using the start offset and end offset.
    */
    createRangeFromTextNodes: function(startNode, endNode, startOffset, endOffset) {
        var range = rangy.createRangyRange();
        endNode = endNode || startNode;
        if (startNode === endNode) {
            range.selectNodeContents(startNode);
        } else {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
        }

        range.startOffset = startOffset || range.startOffset;
        range.endOffset = endOffset || range.endOffset;

        return range;
    },
    /* Create a user selection */
    createSelection: function(data) {
        var range = unitTestHelper.createRange(data);
        var selection = rangy.getSelection();
        selection.setSingleRange(range);
    },
    /* Create a user selection on a text node */
    createSelectionFromTextNodes: function(startNode, endNode, startOffset, endOffset) {
        var range = unitTestHelper.createRangeFromTextNodes(startNode, endNode, startOffset, endOffset);
        var selection = rangy.getSelection();
        selection.setSingleRange(range);
    },
    /* Find the element to perform the rich text operation on either using the elementId or by executing the callback function */
    getElement: function(testData) {
        if (testData.targetElement) {
            return testData.targetElement();
        } else if (testData.elementId) {
            return $("#" + testData.elementId);
        }
        throw "Test data didn't specify how to find the target element";
    },
    /* Execute a test specified by testData.  Performs the setup, test operation, verification and teardown */
    executeTest: function(testData, callback) {
        unitTestHelper.setup(testData);

        callback(testData);

        var expectedElement = $("<div></div>").html(testData.expectedContent);
        var resultElement = $("<div></div>").html($(TEST_ELEMENT_SELECTOR).html());

        var result = unitTestHelper.isEqual({
            name: testData.name,
            expectedContent: expectedElement,
            actualContent: resultElement,
            elementId: "editableDiv"
        });

        ok(result);

        unitTestHelper.teardown();
    },

    /**
    * Performs executeTest for each test specified by testDataCollection.
    */
    executeTestCollection: function(testDataCollection, callback) {
        function test(testData) {
            QUnit.test(testData.name, function() {
                unitTestHelper.executeTest(testData, function(testData) {
                    if (callback) {
                        callback(testData);
                    }
                });
            });
        }
        for (var i = 0; i < testDataCollection.length; i++) {
            test(testDataCollection[i]);
        }
    },
    /* Simple wrapper around qunit test that calls the callback for each test specified by testDataCollection */
    executeTestCollectionSimple: function(testDataCollection, callback) {
        function createTest(testData) {
            QUnit.test(testData.name, function(assert) {
                assert.ok(callback(testData));
            });
        }
        for (var i = 0; i < testDataCollection.length; i++) {
            createTest(testDataCollection[i]);
        }
    },
    /* Simple wrapper around qunit async test that calls the callback for each test specified by testDataCollection */
    executeAsyncTestCollectionSimple: function(testDataCollection, callback) {
        function test(testData) {
            QUnit.test(testData.name, testData.assertionCount, function(assert) {
                var result = false;
                var done = assert.async();
                if (callback) {
                    result = callback(testData);
                }
                assert.ok(result, "Test returned true");

                setTimeout(function() {
                    done();
                    unitTestHelper.teardown();
                }, 50);

            });
        }
        for (var i = 0; i < testDataCollection.length; i++) {
            test(testDataCollection[i]);
        }
    },
    executeTestWithOp: function(testDataCollection) {
        unitTestHelper.executeTestCollectionSimple(testDataCollection, function(testData) {
            unitTestHelper.setup(testData);
            var element = unitTestHelper.getElement(testData);
            var result = testData.operation(element);
            return testData.evaluateResult(result);
        });
    },
    executeTestWithOpSimple: function(testDataCollection) {
        unitTestHelper.executeTestCollectionSimple(testDataCollection, function(testData) {
            var result = testData.operation();
            return testData.evaluateResult(result);
        });
    }

};

(function($) {
    /**
    * Compare two nodes. Note that this function is only used by the qUnit Tests.This is used for qUnit test.
    */
    $.fn.compareNodes = function($node) {
        if (!this[0] || !$node[0]) {
            return false;
        }
        var isEqual = true;

        var attributes = ["style", "id", "class"];

        //compare node
        if (this.prop("tagName") === $node.prop("tagName")) {
            //compare attributes
            var $currentNode = this;
            $.each(attributes, function(i, attrib) {

                if (attrib === "style") {
                    isEqual = $.Arte.dom.hasSameStyle($node, $currentNode);
                } else if (attrib === "class") {
                    isEqual = $.Arte.dom.hasSameClass($node, $currentNode);
                } else {
                    var thisAttr = $currentNode.attr(attrib) && $.trim($currentNode.attr(attrib));
                    var thatAttr = $node.attr(attrib) && $.trim($node.attr(attrib));

                    isEqual = thisAttr === thatAttr;
                }
                return isEqual;
            });

            if (isEqual) {
                //check children nodes
                var noEmptyTextNodesFilter = function(index, node) {
                    //cwkTODO move this logic in one place to replace is()?

                    if (node.nodeType === 1) { //cwkTODO this check isn't really necessary
                        return !$(node).is(":emptyText");
                    } else {
                        // Starting in jQuery 1.10,
                        // filter() only works on nodeType 1 (ELEMENT_NODE)
                        // (callStack: is() -> winnow() -> filter() ),
                        // For other nodeTypes, e.g. 3 (TEXT_NODE),
                        // we must manually do the !emptyTextOrRangySpan check

                        // These methods are added in jquery-dom-traversal
                        var jQueryExpr = $.expr[":"];
                        var isEmptyText = (typeof jQueryExpr.emptyText === "function") ?
                            jQueryExpr.emptyText(node) : false;

                        return !isEmptyText;
                    }
                };
                var thisContent = this.contents().filter(noEmptyTextNodesFilter);
                var thatContent = $node.contents().filter(noEmptyTextNodesFilter);

                // has same child count
                isEqual = thisContent.length === thatContent.length;

                for (var i = 0, l = thisContent.length; i < l && isEqual; i++) {
                    isEqual = thisContent[i].nodeType === 3 ?
                        $.trim(thisContent[i].nodeValue) === $.trim(thatContent[i].nodeValue) :
                        $(thisContent[i]).compareNodes($(thatContent[i]));
                }
            }
        } else {
            isEqual = false;
        }

        return isEqual;
    };
})(jQuery);
