$(document).ready(function()
{
    var suiteName = "Arte.StateDetector";
    module(suiteName + ".valueStateDetector");
    unitTestHelper.executeTestCollectionSimple(valueStateDetectorTestData, function(testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte({ value: testData.rawContent });
        var result = testData.operation($(TEST_ELEMENT_SELECTOR).Arte()[0]);
        return testData.evaluateResult(result);
    });
});

var valueStateDetectorTestData = [
    {
        name: "detectNodesEmpty",
        rawContent: "",
        elementId: 'span',
        operation: function(arte)
        {
            return arte.getState("fontSize") || arte.getState("fontFamily") || arte.getState("bold") || arte.getState("italic");
        },
        evaluateResult: function(result)
        {
            return !result;
        }
    },
    {
        name: "detectNegative",
        rawContent: "<span id='span'>data</span>",
        elementId: 'span',
        operation: function(arte)
        {
            return arte.getState("fontSize") || arte.getState("fontFamily") || arte.getState("bold") || arte.getState("italic");
        },
        evaluateResult: function(result)
        {
            return !result;
        }
    },
    {
        name: "detectSimpleStyle",
        rawContent: "<span id='span' style='font-family: arial'>data</span>",
        elementId: 'span',
        operation: function(arte)
        {
            // push the styles up to the parent
            $.Arte.dom.cleanup(arte.$el);

            return arte.getState("fontFamily");
        },
        evaluateResult: function(result)
        {
            return result === 'arial';
        }
    },
// TODO: ValueStateDetector doesn't support the classes yet.
    {
    name: "detectSimpleClassNegative",
    rawContent: "<span id='span' class='arte-font-size-10'>data</span>",
    elementId: 'span',
    operation: function(arte)
    {
        // push the styles up to the parent
        $.Arte.dom.cleanup(arte.$el);

        return arte.getState("fontSize");
    },
    evaluateResult: function(result)
    {
        return result === "arte-font-size-10";
    }
},
    {
        name: "detectSimpleClass",
        rawContent: "<span id='span' class='arte-font-family-XXX arte-font-weight-bold'>data</span>",
        elementId: 'span',
        operation: function(arte)
        {
            // push the styles up to the parent
            $.Arte.dom.cleanup(arte.$el);

            return (arte.getState("fontFamily") === "arte-font-family-XXX") && arte.getState("bold");
        },
        evaluateResult: function(result)
        {
            return result;
        }
    },
        {
            name: "detectTag",
            rawContent: "<b><span id='span'>data</span></b>",
            elementId: 'span',
            operation: function(arte)
            {
                unitTestHelper.createSelection({rangeContentId: "span"});
                return arte.getState("bold");
            },
            evaluateResult: function(result)
            {
                return result;
            }
        },
    {
        name: "detectUl",
        rawContent: "<ol><li><span id='span'>data</span></li></ol>",
        elementId: 'span',
        operation: function(arte)
        {
            unitTestHelper.createSelection({rangeContentId: "span"});
            return arte.getState("orderedList");
        },
        evaluateResult: function(result)
        {
            return result;
        }

    }
];
