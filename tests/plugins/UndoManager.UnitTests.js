$(document).ready(function() {
    var suiteName = "Arte.Plugins.UndoManager";
    QUnit.module(suiteName + "");

    unitTestHelper.executeTestCollectionSimple(ArteUndoManagerTestData.HasUndoRedo, function(testData) {
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options);
        return testData.op();
    });

    unitTestHelper.executeTestCollectionSimple(ArteUndoManagerTestData.UndoRedo, function(testData) {
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options);
        return testData.op();
    });
});

var ArteUndoManagerTestData = {
    HasUndoRedo: [
        {
            name: "noUndoInfo",
            options: {
                value: "This is rich text area"
            },
            op: function() {
                return !$(TEST_ELEMENT_SELECTOR).Arte().get(0).hasUndo();
            }
        },
        {
            name: "hasUndoInfo",
            options: {
                value: "This is rich area"
            },
            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

                // Change content
                arte.value("new value");
                return arte.hasUndo();
            }
        },
        {
            name: "hasUndoAndRedo",
            options: {
                value: "This is rich area"
            },
            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

                // Change content
                arte.value("new value");
                arte.value("another value");
                arte.undo();
                return arte.hasUndo() && arte.hasRedo();
            }
        },
        {
            name: "hasNoRedo",
            options: {
                value: "This is rich area"
            },
            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

                // Change content
                arte.value("new value");
                arte.value("another value");
                arte.undo();
                var result = arte.hasRedo();
                if (!result) {
                    return result;
                }
                arte.redo();
                return !arte.hasRedo();
            }
        }
    ],
    UndoRedo: [
        {
            name: "undoNegative",
            options: {
                value: "This is rich text area"
            },
            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
                var value = arte.value();
                arte.undo();
                return value === arte.value();
            }
        },
        {
            name: "undo",
            options: {
                value: "This is rich area"
            },
            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
                var originalValue = arte.value();
                // change value;
                arte.value("new value");

                arte.undo();
                return arte.value() === originalValue;
            }
        },
        {
            name: "redoNegative",
            options: {
                value: "This is rich area"
            },
            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

                var value1 = "value1";
                var value2 = "value2";

                // Change content
                arte.value(value1);
                arte.redo();

                var result = arte.value() === value1;
                if (!result) {
                    return result;
                }

                arte.value(value2);
                arte.redo();
                return arte.value() === value2;
            }
        },
        {
            name: "UndoAndRedo",
            options: {
                value: "This is rich area"
            },

            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

                var value1 = "value1";
                var value2 = "value2";
                // Change content
                arte.value(value1);
                arte.value(value2);
                arte.undo();

                // Perform Undo
                var result = arte.value() === value1;
                if (!result) {
                    return result;
                }

                arte.redo();
                return arte.value() === value2;
            }
        },
        {
            name: "cancelUndo",
            options: {
                value: "This is rich area"
            },

            op: function() {
                var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

                var value1 = "value1";
                // Change content
                arte.value(value1);

                arte.on("onbeforeundo", function(e, data) {
                    data.execute = false;
                });

                arte.undo();

                return arte.value() === value1;
            }
        }
    ]
};
