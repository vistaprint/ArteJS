/*global Arte:false*/
/// @dependencies: Arte.js, TextArea.js 

/**
* @fileoverview extends Arte prototype to add rich text commands
*/
(function()
{
    var constants = $.Arte.constants;
    var configuration = $.Arte.configuration;
    /**
    * Reference to commandAttrType enumeration
    */
    var commandAttr = constants.commandAttrType;
    /**
    * Determine the command attribute using the options
    */
    var commandAttrType = function(commandName, options)
    {
        // commandAttrType is selected based on the following precedence
        // 1) As defined in the options
        // 2) Infer from the options
        // 3) Use default 
        var commandConfig = configuration.commands[commandName];
        if (commandConfig.commandAttrType)
        {
            return commandConfig.commandAttrType;
        }

        var attrType = configuration.commandAttrType;
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
    };

    /*
    * Executes a rich text command
    */
    var exec = function(commandName, options)
    {
        var commandOptions = constructCommandOptions.call(this, commandName, options);

        commandOptions.execute = true;
        this.triggerEvent(constants.eventNames.onbeforecommand, commandOptions);

        if (!commandOptions.execute)
        { // The client requested the cancelation of this command 
            return;
        }

        delete commandOptions.execute;
        $.Arte.RichTextCommandApplier.createAndExecute(commandOptions);
        this.triggerEvent(constants.eventNames.oncommand, commandOptions);
    };

    var getCommandValueOrDefault = function(commandName, attrType, options)
    {
        if (options && attrType === commandAttr.styleName && options.styleValue)
        {
            return options.styleValue;
        } else if (options && (attrType === commandAttr.className) && options.className)
        {
            return options.className;
        } else if (options && options.commandValue)
        {
            return options.commandValue;
        }

        if (typeof (options) === "string")
        {   // Command value is passed as string.
            return options;
        }

        // If commandValue is not defined, try getting the default value for the command
        var defaultValue = configuration.commands[commandName].defaultValue;
        if (defaultValue)
        {
            return defaultValue[attrType];
        }
    };

    var getTagNameOrDefault = function(commandName, attrType, options)
    {
        if (options && options.tagName)
        {
            return options.tagName;
        }

        var commandConfig = configuration.commands[commandName];
        if (commandConfig.applierTagName)
        {
            // ApplierTagNames can be configured based on the commandAttrType
            return $.isPlainObject(commandConfig.applierTagName) ? commandConfig.applierTagName[attrType] : commandConfig.applierTagName;
        }

        if (commandConfig.tagName)
        {
            return commandConfig.tagName;
        }

        // Use the default block/inline tags
        return commandConfig.commandType === constants.commandType.inline ?
            configuration.defaultInlineTag : configuration.defaultBlockTag;
    };

    var constructCommandOptions = function(commandName, options)
    {
        var attr = commandAttrType(commandName, options);
        var commandConfig = configuration.commands[commandName];

        var commandOptions = {
            textArea: this,
            commandAttrType: attr,
            commandName: commandName,
            tagName: commandConfig.tagName,
            applierTagName: getTagNameOrDefault(commandName, attr, options)
        };

        var commandValue = getCommandValueOrDefault(commandName, attr, options);
        switch (attr)
        {
            case constants.commandAttrType.className:
                commandOptions.classNameRegex = commandConfig.classNameRegex;
                commandOptions.className = commandValue;
                break;
            case constants.commandAttrType.styleName:
                commandOptions.styleName = commandConfig.styleName;
                commandOptions.styleValue = commandValue;
                break;
        }

        return $.extend(options, commandOptions);
    };

    $.extend($.Arte.TextArea.prototype, {
        "bold": function(options)
        {
            exec.apply(this, ["bold", options]);
        },
        "italic": function(options)
        {
            exec.apply(this, ["italic", options]);
        },
        "underLine": function(options)
        {
            exec.apply(this, ["underLine", options]);
        },
        "blockquote": function()
        {
            exec.apply(this, ["blockquote"]);
        },
        "h1": function()
        {
            exec.apply(this, ["h1"]);
        },
        "h2": function()
        {
            exec.apply(this, ["h2"]);
        },
        "h3": function()
        {
            exec.apply(this, ["h3"]);
        },
        "h4": function()
        {
            exec.apply(this, ["h4"]);
        },
        "h5": function()
        {
            exec.apply(this, ["h5"]);
        },
        "h6": function()
        {
            exec.apply(this, ["h6"]);
        },
        "subscript": function()
        {
            exec.apply(this, ["subscript"]);
        },
        "superscript": function()
        {
            exec.apply(this, ["superscript"]);
        },
        "fontSize": function(options)
        {
            exec.apply(this, ["fontSize", options]);
        },
        "fontFamily": function(options)
        {
            exec.apply(this, ["fontFamily", options]);
        },
        "color": function(options)
        {
            exec.apply(this, ["color", options]);
        },
        "backgroundColor": function(options)
        {
            exec.apply(this, ["backgroundColor", options]);
        },
        "unorderedList": function(options)
        {
            exec.apply(this, ["unorderedList", options]);
        },
        "orderedList": function(options)
        {
            exec.apply(this, ["orderedList", options]);
        },
        "textAlign": function(options)
        {
            exec.apply(this, ["textAlign", options]);
        },
        // Apply the styles/classes to the content editable element
        "toggleStyleOnElement": function(options)
        {
            var element = options.element || this.$el;
            if (options && options.styleName)
            {
                var styles = $.Arte.dom.getStyles(element);
                if (options.styleValue === styles[options.styleName])
                {
                    options.styleValue = "";
                }
                element.css(options.styleName, options.styleValue);
            }

            if (options && options.className)
            {
                var op = (element.hasClass(options.className)) ? "removeClass" : "addClass";
                element[op](options.className);
            }
        }
    });
})();