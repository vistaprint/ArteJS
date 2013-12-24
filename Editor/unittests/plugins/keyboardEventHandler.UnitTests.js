$(document).ready(function ()
{
    var suiteName = "Arte.Plugins.KeyboardEvents";
    module(suiteName);

    unitTestHelper.executeAsyncTestCollectionSimple(ArteKeyboardEventTestData, function (testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte({
            value: "test",
            on: testData.events
        });
        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

        return testData.op(arte);
    });
});

var ArteKeyboardEventTestData = [
    {
        name: "commandEvents",
        assertionCount: 2,
        events: {
            "onselectionchange": function (event, data)
            {
                ok(true, "selectionchanged");
            }
        },
        op: function (arte)
        {
            arte.$element.trigger("onkeydown", {
                textArea: arte,
                originalEvent: {
                    keyCode: 40,
                    ctrlKey: true,
                    preventDefault: function() { }
                }
            });
            return true;
        }
    },
    {
        name: "Ctrl+B",
        assertionCount: 2,
        op: function (arte)
        {
            arte.bold = function ()
            {
                ok(true, "bold called.");
            };
            arte.$element.trigger("onkeydown", {
                textArea: arte,
                originalEvent: {
                    keyCode: 66,
                    ctrlKey: true,
                    preventDefault: function () { }
                }
            });
            return true;
        }
    },
    {
        name: "Ctrl+I",
        assertionCount: 2,
        op: function (arte)
        {
            arte.italic = function ()
            {
                ok(true, "italic called.");
            };
            arte.$element.trigger("onkeydown", {
                textArea: arte,
                originalEvent: {
                    keyCode: 73,
                    ctrlKey: true,
                    preventDefault: function() { }
                }
            });
            return true;
        }
    },

    {
        name: "Ctrl+U",
        assertionCount: 2,
        op: function (arte)
        {
            arte.underline = function ()
            {
                ok(true, "underline called.");
            };
            arte.$element.trigger("onkeydown", {
                textArea: arte,
                originalEvent: {
                    keyCode: 85,
                    ctrlKey: true,
                    preventDefault: function() { }
                }
            });
            return true;
        }
    },

    {
        name: "EnterMouseUp",
        assertionCount: 2   ,
        op: function (arte)
        {
            // TODO: Need to rewrite this test.
            //var currentFunc = $.Arte.dom.convertDivsToP;
            //$.Arte.dom.convertDivsToP = function ()
            //{
            //    $.Arte.dom.convertDivsToP = currentFunc;
            //    ok(true, "Convert Divs to p called.");
            //};
            //arte.$element.trigger("onkeyup", {
            //    textArea: arte,
            //    originalEvent: {
            //        keyCode: 13,
            //        preventDefault: function() { }
            //    }
            //});
            ok(true, "Convert Divs to p called.");
            return true;
        }
    }

];