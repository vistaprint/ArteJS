$(document).ready(function() {
    var suiteName = "Arte.TextArea";

    QUnit.module(suiteName + ".commands", {
        beforeEach: function() {
            $(TEST_ELEMENT_SELECTOR).Arte({
                styles: {}
            }); // use default options

            $.Arte.configuration.requireFocus = false;
        }
    });

    unitTestHelper.executeTestCollectionSimple(commandsWithNoSelectionTestData, function(testData) {
        var options = testData.commandOptions;
        var element = $(TEST_ELEMENT_SELECTOR);

        // Execute the command
        element.Arte(testData.commandName, options);

        // Verify that command is properly applied
        var commandConfig = $.Arte.configuration.commands[testData.commandName];

        var arte = element.data("Arte");

        var commandAttrTypes = {
            styleName: function() {
                var styleName = commandConfig.styleName;
                return $.Arte.dom.getStyles(arte.$el)[styleName];
            },
            className: function() {
                return $.Arte.dom.hasClassWithPattern(arte.$el, commandConfig.classNameRegex);
            },
            tagName: function() {
                var tagName = $.isPlainObject(commandConfig.tagName) ?
                        commandConfig.tagName[commandAttrType] :
                        commandConfig.tagName;
                return arte.$el.find(tagName).length !== 0;
            }
        };

        var commandAttrType = commandConfig.commandAttrType;

        if (!commandAttrType) {
            commandAttrType = options ? options.commandAttrType : $.Arte.configuration.commandAttrType;
        }

        return commandAttrTypes[commandAttrType]();
    });

    QUnit.module(suiteName + ".commandsOnPlainTextField");
    QUnit.test("bold", function(assert) {
        $(TEST_ELEMENT_SELECTOR).Arte({
            editorType: $.Arte.constants.editorTypes.plainText
        });

        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

        arte.bold({
            styleName: "font-weight",
            styleValue: "bold"
        });

        assert.ok($.Arte.dom.getStyles(arte.$el)["font-weight"]);
    });

    QUnit.module(suiteName + ".toggleStyleOnElement");
    unitTestHelper.executeTestCollectionSimple(toggleStyleOnElementTestData, function(testData) {
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options);

        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
        arte.toggleStyleOnElement(testData.commandOptions);

        return testData.evaluateResult(arte);
    });
});

var commandsWithNoSelectionTestData = [
    {
        name: "fontWeight",
        commandName: "bold"
    },
    {
        name: "bold",
        commandName: "bold",
        commandOptions: {
            tagName: "B"
        }
    },
    {
        name: "fontStyle",
        commandName: "italic"
    },
    {
        name: "italic",
        commandName: "italic",
        commandOptions: {
            tagName: "I"
        }
    },
    {
        name: "textDecoration",
        commandName: "underline"
    },
    {
        name: "underline",
        commandName: "underline",
        commandOptions: {
            tagName: "U"
        }
    },
    {
        name: "blockquote",
        commandName: "blockquote"
    },
    {
        name: "h1",
        commandName: "h1"
    },
    {
        name: "h2",
        commandName: "h2"
    },
    {
        name: "h3",
        commandName: "h3"
    },
    {
        name: "h4",
        commandName: "h4"
    },
    {
        name: "h5",
        commandName: "h5"
    },
    {
        name: "h6",
        commandName: "h6"
    },
    {
        name: "subscript",
        commandName: "subscript"
    },
    {
        name: "superscript",
        commandName: "superscript"
    },
    {
        name: "orderedList",
        commandName: "orderedList"
    },
    {
        name: "unorderedList",
        commandName: "unorderedList"
    },
    {
        name: "fontSize",
        commandName: "fontSize",
        commandOptions: {
            commandValue: "10px"
        }
    },
    {
        name: "fontFamily",
        commandName: "fontFamily",
        commandOptions: {
            commandValue: "arial"
        }
    },
    {
        name: "color",
        commandName: "color",
        commandOptions: {
            commandValue: "red"
        }
    },
    {
        name: "textAlignLeft",
        commandName: "textAlign",
        commandOptions: {
            commandValue: "left"
        }
    },
    {
        name: "textAlignRight",
        commandName: "textAlign",
        commandOptions: {
            commandValue: "right"
        }
    },
    {
        name: "textAlignRightClass",
        commandName: "textAlign",
        commandOptions: {
            commandAttrType: $.Arte.constants.commandAttrType.className,
            commandValue: "arte-text-align-right"
        }
    }
];

var toggleStyleOnElementTestData = [
    {
        name: "toggleStyleOnElement",
        options: {
            styles: {}
        },
        commandOptions: {
            styleName: "font-weight",
            styleValue: "bold"
        },
        evaluateResult: function(arte) {
            return $.Arte.dom.getStyles(arte.$el)["font-weight"];
        }
    },
    {
        name: "toggleStyleOnElementRemove",
        options: {
            styles: {
                "font-weight": "bold"
            }
        },
        commandOptions: {
            styleName: "font-weight",
            styleValue: "bold"
        },
        evaluateResult: function(arte) {
            return $.Arte.dom.getStyles(arte.$el)["font-weight"] === undefined;
        }
    },
    {
        name: "toggleStyleOnElementClass",
        options: {
        },
        commandOptions: {
            className: "arte-font-weight-bold"
        },
        evaluateResult: function(arte) {
            return arte.$el.hasClass("arte-font-weight-bold");
        }
    },
    {
        name: "toggleStyleOnElementClassRemove",
        options: {
            classes: ["arte-font-weight-bold"]
        },
        commandOptions: {
            className: "arte-font-weight-bold"
        },
        evaluateResult: function(arte) {
            return !arte.$el.hasClass("arte-font-weight-bold");
        }
    }
];
