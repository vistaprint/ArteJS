$(document).ready(function ()
{
    var suiteName = "Arte.TextArea";
    module(suiteName + ".getValue");
    unitTestHelper.executeTestCollectionSimple(ArteTextAreaTestData.getValue, function (testData)
    {
        $.Arte.configuration.handleUnsanctionedTagsOnGetValue = false;
        var value = $(TEST_ELEMENT_SELECTOR).Arte(testData.options).Arte("value")[0];
        return unitTestHelper.isEqual({
            name: suiteName + ".getValue" + testData.name,
            expectedContent: $("<div>").html(testData.value),
            actualContent: $("<div>").html(value),
            doNotApplyAttributes: true
        });
    });

    module(suiteName + ".settValue");
    unitTestHelper.executeTestCollectionSimple(ArteTextAreaTestData.setValue, function (testData)
    {
        $.Arte.configuration.handleUnsanctionedTagsOnGetValue = false;
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options).Arte("value", testData.value);
        var value = $(TEST_ELEMENT_SELECTOR).Arte("value")[0];
        return unitTestHelper.isEqual({
            name: suiteName + ".setValue" + testData.name,
            expectedContent: $("<div>").html(testData.value),
            actualContent: $("<div>").html(value),
            doNotApplyAttributes: true
        });
    });


    module(suiteName + ".getOuterValue");
    unitTestHelper.executeTestCollectionSimple(ArteTextAreaTestData.getOuterValue, function (testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options).Arte("value", testData.value);
        var value = $(TEST_ELEMENT_SELECTOR).Arte("outerValue")[0];
        return unitTestHelper.isEqual({
            name: suiteName + ".getOuterValue" + testData.name,
            expectedContent: $("<div>").html(testData.value).css($.Arte.configuration.initialValues.styles),
            actualContent: $(value),
            doNotApplyAttributes: true
        });
    });

    module(suiteName + ".setOuterValue");
    unitTestHelper.executeTestCollectionSimple(ArteTextAreaTestData.setOuterValue, function (testData) {
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options).Arte("outerValue", testData.value);
        var value = $(TEST_ELEMENT_SELECTOR).Arte("outerValue")[0];
        return unitTestHelper.isEqual({
            name: suiteName + ".setOuterValue" + testData.name,
            expectedContent: $(testData.value),
            actualContent: $(value),
            doNotApplyAttributes: true
        });
    });
    
    module(suiteName + ".events");
    unitTestHelper.executeAsyncTestCollectionSimple(ArteTextAreaTestData.events, function (testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte({});
        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
        return testData.op(arte);
    });

});

var ArteTextAreaTestData = {
    getValue: [
        {
            name: "simple",
            options: {
                value: "This is rich text area"
            },
            value: "This is rich text area"
        },
        {
            name: "getValueWithComplexHtml",
            options: {
                value: "This is rich <b>text</b> <span>area</span>"
            },
            value: "This is rich <b>text</b> <span>area</span>"
        }
    ],
    setValue: [
        {
            name: "simple",
            options: {
                value: ""
            },
            value: "This is rich text area",
            expectedContent: "This is rich text area"
        },
        {
            name: "htmlValue",
            options: {
                value: "test"
            },
            value: "<div>This is rich <b>text</b> <span>area</span><div>"
        },
        {
            name: "htmlValueWithDiv",
            options: {
                value: "test"
            },
            value: "<div style='font-weight: bold'>This is rich <b>text</b> <span>area</span></div>"
        }
    ],
    getOuterValue: [
        {
            name: "simple",
            options: {
                value: ""
            },
            value: "This is rich text area",
            expectedContent: "This is rich text area"
        },
        {
            name: "htmlValue",
            options: {
                value: "test"
            },
            value: "<div>This is rich <b>text</b> <span>area</span><div>"
        },
        {
            name: "htmlValueWithDiv",
            options: {
                value: "test"
            },
            value: "<div style='font-weight: bold'>This is rich <b>text</b> <span>area</span></div>"
        }
    ],
    setOuterValue: [
        {
            name: "simple",
            options: {
                value: "test"
            },
            value: "<div>test</div>",
            expectedContent: "test"
        },
        {
            name: "htmlValue",
            options: {
                value: "test"
            },
            value: "<div style='font-weight:bold; font-size: 10px;' class='arte-font-weight-bold'>This is rich <b>text</b> <span>area</span></div>",
            expectedContent: "<div style='font-weight:bold; font-size: 10px;' class='arte-font-weight-bold'>This is rich <b>text</b> <span>area</span></div>"
        }
    ],
    events: [
        {
            name: "focus",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onfocus", function(e, data) {
                    ok(true, "onfocus called");
                });
                arte.focus();
                arte.focus(); // This should not trigger the onfocus event
                return true;
            }
        },
        {
            name: "blur",
            assertionCount: 3,
            op: function(arte) {
                arte.on({
                    "onblur": function(e, data) {
                        ok(true, "onblur called");
                    },
                    "onselectionchange": function(e, data) {
                        ok(true, "selection changed called");
                    }
                });
                arte.$el.trigger("focus");
                arte.$el.trigger("blur");

                return true;
            }
        },
        {
            name: "keydown",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onkeydown", function(e, data) {
                    ok(true, "keydown called");
                });
                arte.$el.trigger("keydown");

                return true;
            }
        },
        {
            name: "keyup",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onkeyup", function(e, data) {
                    ok(true, "keyup called");
                });
                arte.$el.trigger("keyup");

                return true;
            }
        },
        {
            name: "keypress",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onkeypress", function(e, data) {
                    ok(true, "keypress called");
                });
                arte.$el.trigger("keypress");

                return true;
            }
        },
        {
            name: "mousedown",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onmousedown", function(e, data) {
                    ok(true, "mousedown called");
                });
                arte.$el.trigger("mousedown");

                return true;
            }
        },
        {
            name: "mouseup",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onmouseup", function(e, data) {
                    ok(true, "mouseup called");
                });
                arte.$el.trigger("mouseup");

                return true;
            }
        },
        {
            name: "click",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onclick", function(e, data) {
                    ok(true, "click called");
                });
                arte.$el.trigger("click");

                return true;
            }
        },
        {
            name: "paste",
            assertionCount: 2,
            op: function(arte) {
                arte.on("onpaste", function(e, data) {
                    ok(true, "paste called");
                });
                arte.$el.trigger("paste");

                return true;
            }
        },
        {
            name: "clickOff",
            assertionCount: 2,
            op: function(arte) {
                var handler = function(e, data) {
                    ok(true, "click called");
                };

                arte.on("onclick", handler);
                arte.$el.trigger("click");

                // remove the event handler
                arte.off("onclick", handler);
                arte.$el.trigger("click");
                return true;
            }
        },
        {
            name: "valueChanged",
            assertionCount: 2,
            op: function(arte) {
                var handler = function(e, data) {
                    ok(true, "onvaluechange called");
                };
                arte.on("onvaluechange", handler);
                arte.value("xyz");

                return true;
            }
        },
        {
            name: "valueChangedNotCalledWithSameContent",
            assertionCount: 1,
            op: function(arte) {
                arte.value("xyz");
                var handler = function(e, data) {
                    ok(true, "click called");
                };
                arte.on("onvaluechange", handler);
                arte.value("xyz");
                return true;
            }
        },
        {
            name: "valueChangedNotCalledWithSameContent",
            assertionCount: 1,
            op: function(arte) {
                arte.value("<b>ABCD</b>");
                var handler = function(e, data) {
                    ok(true, "click called");
                };
                arte.on("onvaluechange", handler);
                arte.value("<b>ABCD</b>");
                return true;
            }
        },
        {
            name: "valueChanged_outerValue",
            assertionCount: 2,
            op: function (arte) {
                var handler = function (e, data) {
                    ok(true, "onvaluechange called");
                };
                arte.on("onvaluechange", handler);
                arte.outerValue("<div>xyz</div>");

                return true;
            }
        },
        {
            name: "valueChanged_outerValueChanged",
            assertionCount: 2,
            op: function (arte) {
                arte.outerValue("<div style='font-weight:bold;, font-size:10px'>xyz</div>");
                var handler = function (e, data) {
                    ok(true, "click called");
                };
                arte.on("onvaluechange", handler);
                arte.value("<div style='font-weight:bold;'>xyz</div>");
                return true;
            }
        },
        {
            name: "valueChanged_outerValueNotChanged",
            assertionCount: 1,
            op: function (arte) {
                arte.outerValue("<div style='font-weight:bold;, font-size:10px'>xyz</div>");
                var handler = function (e, data) {
                    ok(true, "click called");
                };
                arte.on("onvaluechange", handler);
                arte.outerValue("<div style='font-weight:bold;, font-size:10px'>xyz</div>");
                return true;
            }
        }
    ]
};


