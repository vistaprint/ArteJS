$(document).ready(function()
{
    var suiteName = "Arte.TextArea";

    module(suiteName + ".commands");
    unitTestHelper.executeTestCollectionSimple(commandsWithNoSelectionTestData, function(testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte({
            styles: {}
        }); // use default options

        $.Arte.configuration.requireFocus = false;

        // Execute the command
        var options = testData.commandOptions;
        $(TEST_ELEMENT_SELECTOR).Arte(testData.commandName, options);

        // Verify that command is properly applied
        var commandConfig = $.Arte.configuration.commands[testData.commandName];

        var arte = $(TEST_ELEMENT_SELECTOR).data("Arte");
        var commandAttrType = commandConfig.commandAttrType || function()
        {
            var attrType = $.Arte.configuration.commandAttrType;
            if (!options)
            {
                return attrType;
            }

            if (options.commandAttrType)
            {
                attrType = options.commandAttrType;
            }
            else
            {
                if (options.styleName)
                {
                    attrType = commandAttr.styleName;
                }
                else if (options.className)
                {
                    attrType = commandAttr.className;
                }
                else if (options.tagName)
                {
                    attrType = commandAttr.tagName;
                }
            }
            return attrType;
        } ();
        var isApplied = false;
        // Based on the command attribute, check if a command is applied.
        switch (commandAttrType)
        {
            case $.Arte.constants.commandAttrType.styleName:
                var styleName = commandConfig.styleName;
                isApplied = $.Arte.dom.getStyles(arte.$el)[styleName];
                break;
            case $.Arte.constants.commandAttrType.className:
                isApplied = $.Arte.dom.hasClassWithPattern(arte.$el, commandConfig.classNameRegex);
                break;
            case $.Arte.constants.commandAttrType.tagName:
                var tagName = $.isPlainObject(commandConfig.tagName) ? commandConfig.tagName[commandAttrType] : commandConfig.tagName;
                isApplied = arte.$el.find(tagName).length !== 0;
                break;
        }

        return isApplied;
    });

    module(suiteName + ".commandsOnPlainTextField");
    unitTestHelper.executeTestCollectionSimple(commandOnPlainTextTestData, function(testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte({
            editorType: $.Arte.constants.editorTypes.plainText
        }); // use default options

        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
        arte[testData.commandName](testData.commandOptions);
        return testData.evaluateResult(arte);
    });

    module(suiteName + ".toggleStyleOnElement");
    unitTestHelper.executeTestCollectionSimple(toggleStyleOnElementTestData, function(testData)
    {
        $(TEST_ELEMENT_SELECTOR).Arte(testData.options); // use default options

        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);
        arte.toggleStyleOnElement(testData.commandOptions);

        return testData.evaluateResult(arte);
    });
});

var commandsWithNoSelectionTestData = [
    {
        name: "fontWeight",
        commandName: "bold",
        /* For some commands, the actual command is decided at the runtime.  AltCommandName property is set to 
        define the actual command that is expected to run. */
        altCommandName: "fontWeight"
    },
    {
        name: "bold",
        commandName: "bold",
        commandOptions: { tagName: "B" }
    },
    {
        name: "fontStyle",
        commandName: "italic",
        altCommandName: "fontStyle"
    },
    {
        name: "italic",
        commandName: "italic",
        commandOptions: { tagName: "I" }
    },
    {
        name: "textDecoration",
        commandName: "underline",
        altCommandName: "textDecoration"
    },
    {
        name: "underline",
        commandName: "underline",
        commandOptions: { tagName: "U" }
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
        commandOptions: { commandValue: "10px" }
    },
    {
        name: "fontFamily",
        commandName: "fontFamily",
        commandOptions: { commandValue: "arial" }
    },
    {
        name: "color",
        commandName: "color",
        commandOptions: { commandValue: "red" }
    },
    {
        name: "textAlignLeft",
        commandName: "textAlign",
        commandOptions: { commandValue: "left" }
    },
    {
        name: "textAlignRight",
        commandName: "textAlign",
        commandOptions: { commandValue: "right" }
    },
    {
        name: "textAlignRightClass",
        commandName: "textAlign",
        commandOptions: { commandAttrType: $.Arte.constants.commandAttrType.className, commandValue: "arte-text-align-right" }
    }
];

var commandOnPlainTextTestData = [
    {
        name: "bold",
        commandName: "bold",
        commandOptions: { styleName: "font-weight", styleValue: "bold" },
        evaluateResult: function(arte)
        {
            return $.Arte.dom.getStyles(arte.$el)["font-weight"];
        }
    }
];

var toggleStyleOnElementTestData = [
    {
        name: "toggleStyleOnElement",
        options: {
            styles: {}
        },
        commandOptions: { styleName: "font-weight", styleValue: "bold" },
        evaluateResult: function(arte)
        {
            return $.Arte.dom.getStyles(arte.$el)["font-weight"];
        }
    },
    {
        name: "toggleStyleOnElementRemove",
        options: {
            styles: { "font-weight": "bold" }
        },
        commandOptions: { styleName: "font-weight", styleValue: "bold" },
        evaluateResult: function(arte)
        {
            return $.Arte.dom.getStyles(arte.$el)["font-weight"] === undefined;
        }
    },
    {
        name: "toggleStyleOnElementClass",
        options: {
        },
        commandOptions: { className: "arte-font-weight-bold" },
        evaluateResult: function(arte)
        {
            return arte.$el.hasClass("arte-font-weight-bold");
        }
    },
    {
        name: "toggleStyleOnElementClassRemove",
        options: {
            classes: ["arte-font-weight-bold"]
        },
        commandOptions: { className: "arte-font-weight-bold" },
        evaluateResult: function(arte)
        {
            return !arte.$el.hasClass("arte-font-weight-bold");
        }
    }
];
