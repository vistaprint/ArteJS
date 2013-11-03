$(document).ready(function () {
    var suiteName = "Arte.TextArea";
    module(suiteName + ".commands");
    unitTestHelper.executeAsyncTestCollectionSimple(simpleEventsTest, function (testData) {
        $(TEST_ELEMENT_SELECTOR).Arte({
            styles: {}
        }); // use default options

        // Listen for events
        $(TEST_ELEMENT_SELECTOR).on(testData.events);

        // Perform some operation
        return testData.op();
    });
});

var simpleEventsTest = [
    {
        name: "commandEvents",
        assertionCount: 3,
        events: {
            "onbeforecommand": function (event, data)
            {
                ok(true, "beforeCommand");
            },
            "oncommand": function (event, data)
            {
                ok(true, "command");
            }
        },
        op: function ()
        {
            $(TEST_ELEMENT_SELECTOR).Arte("bold");
            return true;
        }
    },
    {
        name: "valueChangeEvent",
        assertionCount: 2,
        events: {
            "onvaluechange": function (event, data)
            {
                ok(true, "valueChange");
            }
        },
        op: function ()
        {
            $(TEST_ELEMENT_SELECTOR).Arte("value", "<div>XYZ</div>");
            return true;
        }
    }
];
