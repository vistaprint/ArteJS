$(document).ready(function ()
{
    var suiteName = "Arte.Plugins.InsertCommand";
    module(suiteName);

    unitTestHelper.executeTestCollectionSimple(ArteInsertCommandeTestData   , function (testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte({
            value: testData.rawContent
        });
        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
        if (testData.beforeCommand)
        {
            testData.beforeCommand(arte);
        }

        arte.insert({ commandValue: testData.contentToInsert });

        var value = arte.value();

        return unitTestHelper.isEqual({
            name: suiteName + ".setValue" + testData.name,
            expectedContent: $("<div>").html(testData.expectedContent),
            actualContent: $("<div>").html(value),
            doNotApplyAttributes: true
        });

    });
});

var ArteInsertCommandeTestData = [
    {
        name: "insertAtEndNoSelection",
        rawContent: "Test",
        contentToInsert: "Content",
        expectedContent: "Test<span>Content</span>"
    },
    {
        name: "insertAtEnd",
        rawContent: "Test",
        contentToInsert: "Content",
        beforeCommand: function (textArea)
        {
            $.Arte.util.moveCursorToEndOfElement(textArea.$el.get(0));
        },
        expectedContent: "Test<span>Content</span>"
    },
    {
        name: "insertInTheMiddle",
        rawContent: "<span id='span'>span</span>Test",
        contentToInsert: "Content",
        beforeCommand: function (textArea)
        {
            $.Arte.util.moveCursorToEndOfElement($("#span").get(0));
        },
        expectedContent: "<span id='span'>span<span>Content</span></span>Test"
    },
    {
        name: "replaceNodeContent",
        rawContent: "<span id='span'>span</span>Test",
        contentToInsert: "Content",
        beforeCommand: function (textArea)
        {
            unitTestHelper.createSelection({ rangeContentId: "span" });
        },
        expectedContent: "<span id='span'><span>Content</span></span>Test"
    },
    {
        name: "cancelReplace",
        rawContent: "<span id='span'>span</span>Test",
        contentToInsert: "Content",
        beforeCommand: function (textArea)
        {
            textArea.on("onbeforeinsert", function (e, data)
            {
                data.execute = false;
            });
        },
        expectedContent: "<span id='span'>span</span>Test"
    },
    {
        name: "noOp",
        rawContent: "<span id='span'>span</span>Test",
        contentToInsert: "Content",
        beforeCommand: function (textArea) {
            debugger;
            var currentValue = $.Arte.configuration.requireFocus;
            textArea.on("onbeforeinsert", function (e, data)
            {
                $.Arte.configuration.requireFocus = true;
            });
            
            // Restore the value
            textArea.on("onafterinsert", function (e, data)
            {
                $.Arte.configuration.requireFocus = currentValue;
            });
        },
        expectedContent: "<span id='span'>span</span>Test"
    }
];